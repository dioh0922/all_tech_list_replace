import { BASE_PATH } from "../config.js"
export const Ask = () => {
  return (
    <div class="form-card">
      <h1 class="card-title">Ask a Question</h1>
      <form action={`${BASE_PATH}/ask`} method="post" enctype="multipart/form-data">
        <div class="form-group">
          <textarea name="question" placeholder="Ask something..." required style="width: 100%; height: 150px;"></textarea>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%">Ask</button>
      </form>
    </div>
  )
}