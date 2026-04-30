import { Children } from "hono/jsx"
import { jsxRenderer } from "hono/jsx-renderer"
export const renderer = jsxRenderer(({children}) => {
  return (
    <html>
      <head>
      </head>
      <body>
        {children}
      </body>
    </html>
  )}
);
