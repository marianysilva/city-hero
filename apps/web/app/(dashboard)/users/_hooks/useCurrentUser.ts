import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { apiFetch, ApiError } from "../_api";
import type { CurrentUser, Role } from "../_types";

export function useCurrentUser() {
  const router = useRouter();

  // retry: false — a 401 shouldn't be retried (it's handled below by
  // redirecting), and the default 3x backoff would otherwise delay that
  // redirect and the "Falha ao carregar usuário" message alike.
  const { data, isLoading, error } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => apiFetch<CurrentUser>("/api/users/me"),
    retry: false,
  });

  useEffect(() => {
    if (error instanceof ApiError && error.status === 401) {
      router.push("/login");
    }
  }, [error, router]);

  const currentUser = data ?? null;
  const isUnauthorized = error instanceof ApiError && error.status === 401;
  const errorMessage =
    error && !isUnauthorized ? (error.message ?? "Falha ao carregar usuário") : null;

  const caps = currentUser?.capabilities ?? null;

  function hasPermission(permission: string): boolean {
    if (!caps) return false;
    return caps.permissions.includes("*") || caps.permissions.includes(permission);
  }

  function canManageUser(targetRole: Role): boolean {
    return caps?.manageableRoles?.includes(targetRole) ?? false;
  }

  return {
    currentUser,
    isLoading,
    error: errorMessage,
    isAdmin: currentUser?.roleInfo?.isSuperuser ?? false,
    canCreate: hasPermission("user:create"),
    canEdit: hasPermission("user:edit"),
    assignableRoles: caps?.assignableRoles ?? [],
    canManageUser,
    hasPermission,
  };
}
