import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import { desc } from 'drizzle-orm'
import { techlist } from '../db/migrations/schema.js'
import { db } from './db.js'
import { renderer } from './layout.js'
import { List } from './components/list.js'
import { Add } from './components/add.js'

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

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
