export { createApiClient } from "./client";
export type { FullApiClient } from "./client";

export { ApiClientError } from "./errors";
export type { ApiErrorCode, NormalizedErrorShape } from "./errors";

export type { ApiClient, ApiClientConfig, HttpMethod, Platform, RequestOptions } from "./types";

export type { AuthEndpoints, AuthResponse, LoginRequest, RegisterRequest } from "./endpoints/auth";
export type {
  AdminUserCreateRequest,
  Capabilities,
  ListUsersParams,
  MeResponse,
  ResetPasswordRequest,
  RoleInfo,
  UserOut,
  UsersEndpoints,
  UsersListResponse,
  UserUpdateRequest,
} from "./endpoints/users";
