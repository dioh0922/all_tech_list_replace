import { jsxRenderer } from "hono/jsx-renderer"
import { BASE_PATH } from "../config.js"

export const Vector = ({ files }: { files: string[] }) => {
  return (
    <div class="form-card">
      <h1 class="card-title">Vector Convert</h1>
      <form action={`${BASE_PATH}/api/convert`} method="post" enctype="multipart/form-data">
        <div class="form-group">
          <input type="file" accept="application/json" name="file" required />
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%">Convert</button>
      </form>

      <div class="vector-files">
        <h3>request Files</h3>
        <ul>
          {files.map((file) => (
            <li key={file}>
              <a href={`${BASE_PATH}/data/json/${file}`} target="_blank" download rel="noopener noreferrer">{file}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}