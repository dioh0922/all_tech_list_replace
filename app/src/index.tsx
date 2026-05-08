import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'
import { desc, eq } from 'drizzle-orm'
import { techlist, login } from '../db/migrations/schema.js'
import { db } from './db.js'
import { renderer } from './layout.js'
import { authMiddleware, isLoggedIn } from './auth.js'
import { sign, type JwtVariables  } from 'hono/jwt'
import * as bcrypt from 'bcryptjs'
import { writeFile, mkdir, readdir, readFile } from 'fs/promises'

import { styleText } from './style.js'

import { List } from './components/list.js'
import { Add } from './components/add.js'
import { Edit } from './components/edit.js'
import { Vector } from './components/vector.js'
import { LoginFailure } from './components/login_failure.js'
import { BASE_PATH } from './config.js'
import { saveToVector, getVectors } from './vector.js'


type Variables = JwtVariables

const app = new Hono<{ Variables: Variables }>()
const dataDir = './data/json'

app.use(renderer)
app.use('/static/*', serveStatic({ root: './' }))
app.get('/static/style.css', (c) => {
  return c.text(styleText, 200, {
    'Content-Type': 'text/css',
  })
})

app.get('/', async (c) => {
  const isLogIn = isLoggedIn(c)
  const allLists = await db.select()
    .from(techlist)
    .orderBy(desc(techlist.createDate))
  
  return c.render(
    <List allLists={allLists} isLogIn={isLogIn} />
  )
})

app.get('/login', (c) => {
  return c.render(
    <div class="form-card">
      <h1 class="card-title">Login</h1>
      <form action={`${BASE_PATH}/login`} method="post">
        <div class="form-group">
          <label>User ID</label>
          <input type="text" name="userId" placeholder="User ID" required />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" name="pass" placeholder="Password" required />
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%">Login</button>
      </form>
    </div>
  )
})

app.post('/login', async (c) => {
  const { userId, pass } = await c.req.parseBody()
  const user = await db.select()
    .from(login)
    .where(eq(login.userId, userId as string))
    .limit(1)

  if (user.length === 0) {
    return c.render(<LoginFailure msg="User not found" />)
  }
  if(await bcrypt.compare(pass as string, user[0].pass) === false) {
    return c.render(<LoginFailure msg="Invalid credentials" />)
  }
  const payload = {
    userId: user[0].userId,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 12) // 12時間有効,
  }
  const token = await sign(payload, process.env.JWT_SECRET || 'secret', 'HS256')
  setCookie(c, 'token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 12
  })
  return c.redirect(`${BASE_PATH}/`)
  
})

app.get('/logout', (c) => {
  deleteCookie(c, 'token')
  return c.redirect(`${BASE_PATH}/`)
})

app.get('/add', authMiddleware, (c) => {
  return c.render(<Add/>)
})
app.post('/add', async (c) => {
  const formData = await c.req.formData()
  const projectName = formData.get('projectName') as string
  const techName = formData.get('techName') as string
  const url = formData.get('url') as string
  const repository = formData.get('repository') as string
  const createDate = formData.get('createDate') as string

  await db.insert(techlist).values({
    projectName,
    techName,
    url,
    repository,
    createDate: new Date(createDate).toISOString().split('T')[0]
  })

  return c.redirect(`${BASE_PATH}/`)
})

app.get('/edit/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const listItem = await db.select()
    .from(techlist)
    .where(eq(techlist.projectId, Number(id)))
    .limit(1)

  if(listItem.length === 0) {
    return c.redirect(`${BASE_PATH}/`)
  }
  return c.render(<Edit item={listItem[0]} />)
})
app.post('/edit/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const formData = await c.req.formData()
  const projectName = formData.get('projectName') as string
  const techName = formData.get('techName') as string
  const url = formData.get('url') as string
  const repository = formData.get('repository') as string
  const createDate = formData.get('createDate') as string

  await db.update(techlist)
    .set({
      projectName,
      techName,
      url,
      repository,
      createDate: new Date(createDate).toISOString().split('T')[0]
    })
    .where(eq(techlist.projectId, Number(id)))

  return c.redirect(`${BASE_PATH}/edit/${id}`)
})

app.post('/delete/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  await db.delete(techlist)
    .where(eq(techlist.projectId, Number(id)))

  return c.redirect(`${BASE_PATH}/`)
})

app.get('/vector', async (c) => {
  const files = await readdir(dataDir)
  return c.render(<Vector files={files} />)
})

app.post('/api/convert', authMiddleware, async (c) => {
    const formData = await c.req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return c.json({ error: 'No file uploaded' }, 400)
    }

    const text = await file.text()
    const json = JSON.parse(text)
    const vectoredList = json.map((item: any) => {
      return {
        projectName: item.projectName,
        techName: item.techName,
        createDate: item.createDate,
        description: item.description,
      }
    })

    await saveToVector(vectoredList);

    const { vectors } = await getVectors();
    const tempData = {
      vectors,
      request: json
    }

    await mkdir(dataDir, { recursive: true })
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const ii = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    await writeFile(`${dataDir}/request-${yyyy}${mm}${dd}${HH}${ii}${ss}.json`, JSON.stringify(tempData), 'utf-8')

    return c.redirect(`${BASE_PATH}/vector`)
})

app.get('/api/dump', async (c) => {
  if(!isLoggedIn(c)) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  try {
    const list = await db.select({
        projectName: techlist.projectName,
        techName: techlist.techName, 
        createDate: techlist.createDate
      })
      .from(techlist)
      .orderBy(desc(techlist.createDate))
    return c.json(list)
  } catch (error) {
    return c.json({ error: 'Failed to fetch URL' }, 500)
  }
})

app.get('/data/json/:filename', async (c) => {
  if(!isLoggedIn(c)) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const filename = c.req.param('filename')
  try {
    const fileContent = await readFile(`${dataDir}/${filename}`, 'utf-8')
    return c.text(fileContent, 200, {
      'Content-Type': 'application/json',
    })
  } catch (error) {
    return c.json({ error: 'Failed to read file' }, 500)
  }
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
