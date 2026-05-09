import { BASE_PATH } from "../config.js"
export const VectorResult = ({result, question}: {result: string, question: string}) => {
  return (
    <div class="form-card">
      <h1 class="card-title">Vector Result</h1>
      <div class="vector-result">
        <h3>Question</h3>
        <pre>{question}</pre>
        <h3>Answer</h3>
        <pre>{result}</pre>
      </div>
      <a href={`${BASE_PATH}/ask`} class="btn btn-secondary" style="width: 100%; margin-top: 10px;">Back to Vector Convert</a>
    </div>
  )
}