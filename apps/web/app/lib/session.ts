import { cookies } from 'next/headers'

const TOKEN_COOKIE = 'access_token'
const TOKEN_MAX_AGE = 60 * 60 // 1 hour — matches backend ACCESS_TOKEN_EXPIRE_MINUTES

export async function getToken(): Promise<string | undefined> {
  const store = await cookies()
  return store.get(TOKEN_COOKIE)?.value
}

export async function setToken(token: string): Promise<void> {
  const store = await cookies()
  store.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: TOKEN_MAX_AGE,
    path: '/',
  })
}

export async function clearToken(): Promise<void> {
  const store = await cookies()
  store.delete(TOKEN_COOKIE)
}
