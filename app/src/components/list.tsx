import { techlist } from '../../db/migrations/schema.js'

type TechListProps = {
  allLists: (typeof techlist.$inferSelect)[]
}

export const List = ({ allLists }: TechListProps) => {
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <a href="/add">新規プロジェクト追加</a> | 
        <a href="https://github.com" target="_blank" rel="noopener noreferrer"> GitHub</a>
        {/* ここに「別のURL」を自由に追加できます */}
      </div>
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
                <form action={`/edit/${list.projectId}`} method="get">
                  <input type="submit" value="編集" />
                </form>
                {' '}
                <form action={`/delete/${list.projectId}`} method="post" onsubmit="!confirm('本当に削除しますか？') && e.preventDefault()">
                  <input type="submit" value="削除" />
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
