const API_URL = process.env.BACKEND_URL ?? 'http://localhost:8000'

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail ?? 'Request failed')
  }

  return res.json()
}

export function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export function apiGet<T>(path: string, token: string): Promise<T> {
  return request<T>(path, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })
}
