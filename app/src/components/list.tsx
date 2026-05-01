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
                <a href={`/edit/${list.projectId}`}>編集</a>
                {' '}
                <a href={`/delete/${list.projectId}`} onClick={(e) => {
                  // Client-side JS would be needed for confirm in a real app, 
                  // but for now we'll keep the logic consistent with index.tsx
                  if (!confirm('本当に削除しますか？')) {
                    e.preventDefault();
                  }
                }}>削除</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
