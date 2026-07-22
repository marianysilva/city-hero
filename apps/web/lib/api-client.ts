import { createApiClient } from "@city-hero/api-client";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

// One instance per call, not a module-level singleton — next/headers'
// cookies() is only valid inside the request scope a route handler runs in.
export function createServerApiClient() {
  return createApiClient({
    baseUrl: BACKEND_URL,
    getToken: async () => {
      const store = await cookies();
      return store.get("access_token")?.value ?? null;
    },
    // The BFF proxy itself holds no session to tear down on a 401 — the
    // browser's useCurrentUser hook already redirects to /login when it
    // receives one.
    onAuthFailure: () => {},
    platform: "server",
  });
}
