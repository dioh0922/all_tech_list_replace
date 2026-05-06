import { type TechListItem } from '../../db/migrations/schema.js'
import { BASE_PATH } from '../config.js'

export const Edit = ({item}: {item: TechListItem}) => {
  return (
    <div class="form-card">
      <h1 class="card-title">プロジェクト編集</h1>
      <form method="post" action={`${BASE_PATH}/edit/${item.projectId}`}>
        <div class="form-group">
          <label>プロジェクト名:</label>
          <input type="text" name="projectName" value={item.projectName || ''} required />
        </div>
        <div class="form-group">
          <label>主な技術:</label>
          <input type="text" name="techName" value={item.techName || ''} required />
        </div>
        <div class="form-group">
          <label>URL:</label>
          <input type="text" name="url" value={item.url || ''} />
        </div>
        <div class="form-group">
          <label>リポジトリURL:</label>
          <input type="text" name="repository" value={item.repository || ''} />
        </div>
        <div class="form-group">
          <label>開始日:</label>
          <input type="date" name="createDate" value={item.createDate} />
        </div>
        <div class="actions" style="justify-content: flex-end; margin-top: 2rem;">
          <a href={`${BASE_PATH}/`} class="btn btn-outline">キャンセル</a>
          <button type="submit" class="btn btn-primary">保存する</button>
        </div>
      </form>
    </div>
  )
}