export const Add = () => {
  return (
    <div class="form-card">
      <h1 class="card-title">新規プロジェクト追加</h1>
      <form method="post" action="/add">
        <div class="form-group">
          <label>プロジェクト名:</label>
          <input type="text" name="projectName" required />
        </div>
        <div class="form-group">
          <label>主な技術:</label>
          <input type="text" name="techName" required />
        </div>
        <div class="form-group">
          <label>URL:</label>
          <input type="text" name="url" />
        </div>
        <div class="form-group">
          <label>リポジトリURL:</label>
          <input type="text" name="repository" />
        </div>
        <div class="form-group">
          <label>開始日:</label>
          <input type="date" name="createDate" />
        </div>
        <div class="actions" style="justify-content: flex-end; margin-top: 2rem;">
          <a href="/" class="btn btn-outline">キャンセル</a>
          <button type="submit" class="btn btn-primary">追加する</button>
        </div>
      </form>
    </div>
  )
}