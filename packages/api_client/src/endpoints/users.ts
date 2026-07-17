import type { ApiClient } from "../types";

export interface UserOut {
  id: string;
  email: string;
  name: string;
  role: string;
  authProvider: string;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface RoleInfo {
  name: string;
  rank: number;
  isSuperuser: boolean;
}

export interface Capabilities {
  permissions: string[];
  assignableRoles: string[];
  manageableRoles: string[];
}

export interface MeResponse extends UserOut {
  roleInfo: RoleInfo;
  capabilities: Capabilities;
}

export interface UsersListResponse {
  users: UserOut[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminUserCreateRequest {
  email: string;
  name: string;
  password: string;
  role?: string;
}

export interface UserUpdateRequest {
  name?: string;
  role?: string;
  isActive?: boolean;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export interface ListUsersParams {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: "active" | "inactive" | "deleted";
  sort?: string[];
}

export interface UsersEndpoints {
  me(signal?: AbortSignal): Promise<MeResponse>;
  list(params?: ListUsersParams, signal?: AbortSignal): Promise<UsersListResponse>;
  get(userId: string, signal?: AbortSignal): Promise<UserOut>;
  create(body: AdminUserCreateRequest, signal?: AbortSignal): Promise<UserOut>;
  update(userId: string, body: UserUpdateRequest, signal?: AbortSignal): Promise<UserOut>;
  resetPassword(userId: string, body: ResetPasswordRequest, signal?: AbortSignal): Promise<void>;
  restore(userId: string, signal?: AbortSignal): Promise<UserOut>;
  remove(userId: string, signal?: AbortSignal): Promise<void>;
}

// Matches apps/backend/app/routers/users.py. `page`/`page_size`/`q`/`sort` are
// plain FastAPI Query() params (not a CamelBase model), so they stay
// snake_case on the wire — only `status` carries an explicit alias.
export function createUsersEndpoints(client: ApiClient): UsersEndpoints {
  return {
    me: (signal) => client.request<MeResponse>("/users/me", { signal }),
    list: (params = {}, signal) =>
      client.request<UsersListResponse>("/users", {
        query: {
          page: params.page,
          page_size: params.pageSize,
          q: params.q,
          status: params.status,
          sort: params.sort,
        },
        signal,
      }),
    get: (userId, signal) => client.request<UserOut>(`/users/${userId}`, { signal }),
    create: (body, signal) => client.request<UserOut>("/users", { method: "POST", body, signal }),
    update: (userId, body, signal) =>
      client.request<UserOut>(`/users/${userId}`, { method: "PATCH", body, signal }),
    resetPassword: (userId, body, signal) =>
      client.request<void>(`/users/${userId}/reset-password`, { method: "POST", body, signal }),
    restore: (userId, signal) =>
      client.request<UserOut>(`/users/${userId}/restore`, { method: "POST", signal }),
    remove: (userId, signal) =>
      client.request<void>(`/users/${userId}`, { method: "DELETE", signal }),
  };
}
