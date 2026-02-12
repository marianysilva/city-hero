import type { SortEntry } from '@/components/organisms/DataTable'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T | undefined> {
  const res = await fetch(path, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.detail ?? `Erro ${res.status}`)
  }
  if (res.status === 204) return undefined
  return res.json()
}

export function buildSortParams(sort: SortEntry[]): string {
  return sort.map((s) => `sort=${s.field}:${s.dir}`).join('&')
}
