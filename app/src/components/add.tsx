export const Add = () => {
  return (
    <div>
      <h1>新規プロジェクト追加</h1>
      <form method="post" action="/add">
        <div>
          <label>プロジェクト名:</label>
          <input type="text" name="projectName" required />
        </div>
        <div>
          <label>主な技術:</label>
          <input type="text" name="techName" required />
        </div>
        <div>
          <label>URL:</label>
          <input type="text" name="url" />
        </div>
        <div>
          <label>リポジトリURL:</label>
          <input type="text" name="repository" />
        </div>
        <div>
          <label>開始日:</label>
          <input type="date" name="createDate" />
        </div>
        <div>
          <button type="submit">追加</button>
        </div>
      </form>
    </div>
  )
}