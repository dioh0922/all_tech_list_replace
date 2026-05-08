import { type Context, type Next } from 'hono'
import { verify } from 'hono/jwt'
import { getCookie } from 'hono/cookie'
import { BASE_PATH } from './config.js'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export const authMiddleware = async(c: Context, next: Next) => {
  const token = getCookie(c, 'token')
  if (!token) {
    return c.redirect(`${BASE_PATH}/login`)
  }
  try{
    const payload = await verify(token, JWT_SECRET, "HS256")
    c.set('jwtPayload', payload)
    await next()
  }catch(err){
    return c.redirect(`${BASE_PATH}/login`)
  }
}

export const isLoggedIn = (c: Context) => {
  const token = getCookie(c, 'token')
  if (!token) {
    return false
  }
  return true
}