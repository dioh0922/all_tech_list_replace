import { BASE_PATH } from "../config.js"
import { html } from "hono/html"
import { marked } from "marked"
export const VectorResult = async ({result, question}: {result: string, question: string}) => {
  const parsedResult = await marked.parse(result)
  return (
    <div class="form-card">
      <h1 class="card-title">Vector Result</h1>
      <div class="vector-result">
        <h3>Question</h3>
        <pre>{question}</pre>
        <h3>Answer</h3>
        <div class="markdown-content">
          {html([parsedResult] as any)}
        </div>
      </div>
      <a href={`${BASE_PATH}/ask`} class="btn btn-outline" style="width: 100%; margin-top: 10px;">Back to Vector Convert</a>
    </div>
  )
}