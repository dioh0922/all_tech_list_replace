import { type TechListItem } from '../../db/migrations/schema.js'

export const Edit = ({item}: {item: TechListItem}) => {
  return (
    <div>
      <h1>プロジェクト編集</h1>
      <form method="post" action={`/edit/${item.projectId}`}>
        <div>
          <label>プロジェクト名:</label>
          <input type="text" name="projectName" value={item.projectName || ''} required />
        </div>
        <div>
          <label>主な技術:</label>
          <input type="text" name="techName" value={item.techName || ''} required />
        </div>
        <div>
          <label>URL:</label>
          <input type="text" name="url" value={item.url || ''} />
        </div>
        <div>
          <label>リポジトリURL:</label>
          <input type="text" name="repository" value={item.repository || ''} />
        </div>
        <div>
          <label>開始日:</label>
          <input type="date" name="createDate" value={item.createDate} />
        </div>
        <div>
          <button type="submit">保存</button>
        </div>
      </form>
    </div>
  )
}