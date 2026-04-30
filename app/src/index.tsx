import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import { desc } from 'drizzle-orm'
import { techlist } from '../db/migrations/schema.js'
import { db } from './db.js'

const app = new Hono()

app.get('/', async (c) => {
  const allLists = await db.select()
    .from(techlist)
    .orderBy(desc(techlist.createDate));
  return c.render(
    <div>
      <table>
        <thead>
          
          <tr>
            <th>プロジェクト名</th>
            <th>主な技術</th>
            <th>URL</th>
            <th>作成時期</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {allLists.map((list) => (
            <tr key={list.projectId}>
              <td>{list.projectName}</td>
              <td>{list.techName}</td>
              <td>
                {list.url && (list.url.includes('/') ? (
                  <a href={list.url}>{list.url}</a>
                ) : (
                  list.url
                ))}
              </td>
              <td>{new Date(list.createDate).toLocaleDateString('ja-JP')}</td>
              <td>
                <a href={`/edit/${list.projectId}`}>編集</a>
                <a href={`/delete/${list.projectId}`} onClick={(e) => {
                  e.preventDefault();
                  if (confirm('本当に削除しますか？')) {
                    // TODO: 削除処理をここに追加
                  }
                }}>削除</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
