
export const LoginFailure = ({ msg }: { msg: string }) => {
  return (
    <div>
      <h2>{msg}</h2>
      <a href="/login">Login</a>
    </div>
  )
}