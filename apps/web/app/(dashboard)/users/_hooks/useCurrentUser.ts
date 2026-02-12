import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CurrentUser, Role } from '../_types'
import { apiFetch, ApiError } from '../_api'

export function useCurrentUser() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<CurrentUser>('/api/users/me')
      .then((data) => setCurrentUser(data ?? null))
      .catch((e: unknown) => {
        if (e instanceof ApiError && e.status === 401) {
          router.push('/login')
        } else {
          setError(e instanceof Error ? e.message : 'Falha ao carregar usuário')
        }
      })
      .finally(() => setIsLoading(false))
  }, [router])

  const caps = currentUser?.capabilities ?? null

  function hasPermission(permission: string): boolean {
    if (!caps) return false
    return caps.permissions.includes('*') || caps.permissions.includes(permission)
  }

  function canManageUser(targetRole: Role): boolean {
    return caps?.manageableRoles?.includes(targetRole) ?? false
  }

  return {
    currentUser,
    isLoading,
    error,
    isAdmin: currentUser?.roleInfo?.isSuperuser ?? false,
    canCreate: hasPermission('user:create'),
    canEdit: hasPermission('user:edit'),
    assignableRoles: caps?.assignableRoles ?? [],
    canManageUser,
    hasPermission,
  }
}
