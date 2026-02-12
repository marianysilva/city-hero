import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SortEntry } from '@/components/organisms/DataTable'
import type { UserRow, UsersListResponse, UserStatus } from '../_types'
import { PAGE_SIZE } from '../_types'
import { apiFetch, ApiError, buildSortParams } from '../_api'

export function useUsers() {
  const router = useRouter()
  const [users, setUsers] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [restoreError, setRestoreError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

  const fetchUsers = useCallback(async (page: number, sort: SortEntry[], q: string, userStatus: UserStatus = 'active') => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setLoading(true)
    setFetchError(null)
    try {
      const sortParams = buildSortParams(sort)
      const qParam = q ? `&q=${encodeURIComponent(q)}` : ''
      const data = await apiFetch<UsersListResponse>(
        `/api/users?page=${page}&page_size=${PAGE_SIZE}&${sortParams}${qParam}&status=${userStatus}`,
        { signal: ctrl.signal },
      )
      if (!data) return
      setUsers(data.users)
      setTotal(data.total)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      if (err instanceof ApiError && err.status === 401) {
        router.push('/login')
      } else {
        setFetchError(err instanceof Error ? err.message : 'Erro ao carregar usuários')
      }
    } finally {
      setLoading(false)
    }
  }, [router])

  async function deleteUser(userId: string): Promise<void> {
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      await apiFetch<void>(`/api/users/${userId}`, { method: 'DELETE' })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push('/login')
        return
      }
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setDeleteError(message)
      throw err
    } finally {
      setDeleteLoading(false)
    }
  }

  async function restoreUser(userId: string): Promise<void> {
    setRestoreLoading(true)
    setRestoreError(null)
    try {
      await apiFetch<void>(`/api/users/${userId}/restore`, { method: 'POST' })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push('/login')
        return
      }
      const message = err instanceof Error ? err.message : 'Erro ao restaurar usuário'
      setRestoreError(message)
      throw err
    } finally {
      setRestoreLoading(false)
    }
  }

  return {
    users, total, loading, fetchError,
    deleteLoading, deleteError, setDeleteError, deleteUser,
    restoreLoading, restoreError, setRestoreError, restoreUser,
    fetchUsers,
  }
}
