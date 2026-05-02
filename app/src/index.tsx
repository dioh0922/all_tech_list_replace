import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import { desc, eq } from 'drizzle-orm'
import { techlist } from '../db/migrations/schema.js'
import { db } from './db.js'
import { renderer } from './layout.js'
import { List } from './components/list.js'
import { Add } from './components/add.js'
import { Edit } from './components/edit.js'

const app = new Hono()

app.use(renderer)

app.get('/', async (c) => {
  const allLists = await db.select()
    .from(techlist)
    .orderBy(desc(techlist.createDate))
  
  return c.render(
    <List allLists={allLists} />
  )
})

app.get('/add', (c) => {
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

  return c.redirect('/')
})

app.get('/edit/:id', async (c) => {
  const id = c.req.param('id');
  const listItem = await db.select()
    .from(techlist)
    .where(eq(techlist.projectId, Number(id)))
    .limit(1)

  if(listItem.length === 0) {
    return c.redirect('/')
  }
  return c.render(<Edit item={listItem[0]} />)
})
app.post('/edit/:id', async (c) => {
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

  return c.redirect(`/edit/${id}`)
})

app.post('/delete/:id', async (c) => {
  const id = c.req.param('id');
  await db.delete(techlist)
    .where(eq(techlist.projectId, Number(id)))

  return c.redirect('/')
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
