import { Children } from "hono/jsx"
import { jsxRenderer } from "hono/jsx-renderer"
export const renderer = jsxRenderer(({children}) => {
  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Tech List Manager</title>
        <link rel="stylesheet" href="/static/style.css" />
      </head>
      <body>
        <header>
          <div class="container">
            <nav>
              <a href="/" class="logo">Tech List Manager</a>
              <div class="actions">
                <a href="/" class="btn btn-outline">ホーム</a>
              </div>
            </nav>
          </div>
        </header>
        <main class="container">
          {children}
        </main>
      </body>
    </html>
  )}
);
