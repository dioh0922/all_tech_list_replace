import { techlist } from '../../db/migrations/schema.js'

type TechListProps = {
  allLists: (typeof techlist.$inferSelect)[]
}

export const List = ({ allLists }: TechListProps) => {
  return (
    <div>
      <div class="flex-between mb-4">
        <h2 class="card-title" style="margin-bottom: 0;">プロジェクト一覧</h2>
        <div class="actions">
          <a href="/add" class="btn btn-primary">新規プロジェクト追加</a>
          <a href="/logout" class="btn btn-outline">ログアウト</a>
        </div>
      </div>

      <div class="table-container">
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
                <td style="font-weight: 500;">{list.projectName}</td>
                <td><span style="background: #e0f2fe; color: #0369a1; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem;">{list.techName}</span></td>
                <td>
                  {list.url && (list.url.includes('/') ? (
                    <a href={list.url} style="color: var(--primary); text-decoration: none;">{list.url}</a>
                  ) : (
                    list.url
                  ))}
                </td>
                <td>{new Date(list.createDate).toLocaleDateString('ja-JP')}</td>
                <td>
                  <div class="actions">
                    <a href={`/edit/${list.projectId}`} class="btn btn-outline" style="padding: 0.25rem 0.75rem;">編集</a>
                    <form action={`/delete/${list.projectId}`} method="post" style="display: inline;" onsubmit="return confirm('本当に削除しますか？')">
                      <button type="submit" class="btn btn-danger" style="padding: 0.25rem 0.75rem;">削除</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style="text-align: center; margin-top: 2rem;">
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="font-size: 0.75rem;">GitHub</a>
      </div>
    </div>
  )
}
