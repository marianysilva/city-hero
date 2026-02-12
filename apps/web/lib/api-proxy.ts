import { cookies } from 'next/headers'

export const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8000'

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const store = await cookies()
  const token = store.get('access_token')?.value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function backendFetch(
  url: string,
  init?: RequestInit,
): Promise<Response | null> {
  try {
    return await fetch(url, init)
  } catch {
    return null
  }
}
