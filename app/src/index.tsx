import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'
import { desc, eq } from 'drizzle-orm'
import { techlist, login } from '../db/migrations/schema.js'
import { 
  db,
  selectTechById, 
  selectUserById, 
  selectAllTech,
  insertTech,
  updateTechById,
  deleteTechById
} from './db.js'
import { renderer } from './layout.js'
import { authMiddleware, isLoggedIn } from './auth.js'
import { sign, type JwtVariables  } from 'hono/jwt'
import * as bcrypt from 'bcryptjs'
import { writeFile, mkdir, readdir, readFile } from 'fs/promises'

import { List } from './components/list.js'
import { Add } from './components/add.js'
import { Edit } from './components/edit.js'
import { Vector } from './components/vector.js'
import { Ask } from './components/ask.js'
import { VectorResult } from './components/vector_result.js'
import { LoginFailure } from './components/login_failure.js'
import { BASE_PATH } from './config.js'
import { 
  saveToVector, 
  getVectors, 
  getMeta,
  searchNearVector, 
  isEmpty, 
  addVector, 
  deleteVectorById, 
  selectVectorByItem 
} from './vector.js'
import { generateIdea, generateEmbedding } from './genai.js'
import { cors } from 'hono/cors'

type Variables = JwtVariables

const app = new Hono<{ Variables: Variables }>()
const dataDir = './data/json'

app.use(renderer)
app.use('/static/*', serveStatic({ root: './' }))
app.get('/static/style.css', async (c) => {
  const css = await readFile('./src/style.css', 'utf-8')
  return c.text(css, 200, {
    'Content-Type': 'text/css',
  })
})

app.use(
  '/api/dump/*', // CORSを適用するパスを指定
  cors({
    origin: '*', // 許可するフロントエンドのURL
    allowMethods: ['GET', 'OPTIONS'], // 許可するメソッド
  })
)

app.use(
  '/api/ext/*', // CORSを適用するパスを指定
  cors({
    origin: '*', // 許可するフロントエンドのURL
    allowMethods: ['GET', 'OPTIONS'], // 許可するメソッド
  })
)

app.get('/', async (c) => {
  const isLogIn = isLoggedIn(c)
  const allLists = await selectAllTech()
  
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
  const user = await selectUserById(userId as string)

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
  const requestCreateDate = formData.get('createDate') as string
  const description = formData.get('description') as string || `projectName: ${projectName}\ntechName: ${techName}`
  let createDate = requestCreateDate
  if(requestCreateDate.length === 0) {
    createDate = new Date().toISOString().split('T')[0]
  }

  await insertTech(projectName, techName, url, repository, createDate)
  await addVector({projectName, techName, createDate, description})

  return c.redirect(`${BASE_PATH}/`)
})

app.get('/edit/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const listItem = await selectTechById(Number(id))

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

  await updateTechById(Number(id), projectName, techName, url, repository, createDate)
  return c.redirect(`${BASE_PATH}/edit/${id}`)
})

app.post('/delete/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const targetItem = await selectTechById(Number(id))

  const vectorId = await selectVectorByItem(targetItem[0])

  if(vectorId){
    await deleteVectorById(vectorId)
  }
  await deleteTechById(Number(id))

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
    const list = (await selectAllTech()).map(item => {
      return {
        projectName: item.projectName,
        techName: item.techName,
        createDate: item.createDate,
      }
    })
    return c.json(list)
  } catch (error) {
    return c.json({ error: 'Failed to fetch URL' }, 500)
  }
})

app.get('/api/dump/vector', async (c) => {
  try {
    const { vectors } = await getVectors();
    const response = vectors.map((e: any) => {
      const buffer = e.embedding;
      const embeddingArray = Array.from(
        new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4)
      );
      return {
        ...e,
        embedding: embeddingArray
      }
    })
    return c.json(response)
  } catch (error) {
    return c.json({ error: 'Failed to fetch URL' }, 500)
  }
})

app.get('/api/dump/meta', async (c) => {
  const { meta } = await getMeta();
  return c.json(meta);
});

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

app.get('/ask', (c) => {
  return c.render(<Ask />)
})
app.post('/ask', async (c) => {
  const formData = await c.req.formData()
  const question = formData.get('question') as string

  if(await isEmpty()){
    return c.render(<VectorResult question={question} result={"No data available. Please upload data first."} />)
  }

  // 入力をベクトル化
  // sqlite-vecでベクトル検索
  const searchResults = await searchNearVector(question);
  if(searchResults.length === 0){
    return c.render(<VectorResult question={question} result={"No vector available. Please upload data first."} />)
  }

  // 近いベクトルのメタデータをもとに回答生成
  const answer = await generateIdea(question, searchResults);

  return c.render(
    <VectorResult question={question} result={answer} />
  )
})

app.post('/api/ext/conv', async(c) => {
  const formData = await c.req.formData()
  const question = formData.get('question') as string

  const convertResult = await generateEmbedding(question)
  return c.json(convertResult)
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
