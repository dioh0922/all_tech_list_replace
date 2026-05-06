import { BASE_PATH } from "../config.js"

export const LoginFailure = ({ msg }: { msg: string }) => {
  return (
    <div>
      <h2>{msg}</h2>
      <a href={`${BASE_PATH}/login`}>Login</a>
    </div>
  )
}