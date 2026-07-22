import type { ApiClient } from "../types";

import type { UserOut } from "./users";

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: UserOut;
}

export interface AuthEndpoints {
  register(body: RegisterRequest, signal?: AbortSignal): Promise<AuthResponse>;
  login(body: LoginRequest, signal?: AbortSignal): Promise<AuthResponse>;
}

// Matches apps/backend/app/routers/auth.py + app/schemas/auth.py exactly —
// no /auth/refresh here, it doesn't exist on the backend yet.
export function createAuthEndpoints(client: ApiClient): AuthEndpoints {
  return {
    register: (body, signal) =>
      client.request<AuthResponse>("/auth/register", {
        method: "POST",
        body,
        skipAuth: true,
        signal,
      }),
    login: (body, signal) =>
      client.request<AuthResponse>("/auth/login", { method: "POST", body, skipAuth: true, signal }),
  };
}
