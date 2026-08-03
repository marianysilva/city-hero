// @vitest-environment node
import { HttpResponse, http } from "msw";
import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { server } from "../../__test-utils__/server";

import { POST } from "./route";

const BACKEND_URL = "http://localhost:8000";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function loginRequest(body: unknown, headers?: Record<string, string>) {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  it("sets the access_token cookie and returns the user on success", async () => {
    server.use(
      http.post(`${BACKEND_URL}/auth/login`, () =>
        HttpResponse.json({
          accessToken: "fresh-token",
          tokenType: "bearer",
          user: { id: "u1", email: "admin@cityhero.app", name: "Admin", role: "admin" },
        }),
      ),
    );

    const response = await POST(loginRequest({ email: "admin@cityhero.app", password: "correct" }));

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.user.email).toBe("admin@cityhero.app");
    const cookie = response.cookies.get("access_token");
    expect(cookie?.value).toBe("fresh-token");
    expect(cookie?.httpOnly).toBe(true);
  });

  it("syncs the locale cookie to the logged-in user's stored language", async () => {
    server.use(
      http.post(`${BACKEND_URL}/auth/login`, () =>
        HttpResponse.json({
          accessToken: "fresh-token",
          tokenType: "bearer",
          user: {
            id: "u2",
            email: "mayor@cityhero.app",
            name: "Mayor",
            role: "mayor",
            language: "pt-BR",
          },
        }),
      ),
    );

    const response = await POST(loginRequest({ email: "mayor@cityhero.app", password: "correct" }));

    expect(response.status).toBe(200);
    const localeCookie = response.cookies.get("cityhero_language");
    expect(localeCookie?.value).toBe("pt-BR");
    expect(localeCookie?.httpOnly).toBeFalsy();
  });

  it("does not set a locale cookie when the backend response has no (or an unsupported) language", async () => {
    server.use(
      http.post(`${BACKEND_URL}/auth/login`, () =>
        HttpResponse.json({
          accessToken: "fresh-token",
          tokenType: "bearer",
          user: { id: "u1", email: "admin@cityhero.app", name: "Admin", role: "admin" },
        }),
      ),
    );

    const response = await POST(loginRequest({ email: "admin@cityhero.app", password: "correct" }));

    expect(response.cookies.get("cityhero_language")).toBeUndefined();
  });

  it("returns a 401 with the backend's error message under the `error` key on wrong credentials", async () => {
    server.use(
      http.post(`${BACKEND_URL}/auth/login`, () =>
        HttpResponse.json({ detail: "Incorrect email or password" }, { status: 401 }),
      ),
    );

    const response = await POST(loginRequest({ email: "admin@cityhero.app", password: "wrong" }));

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("Incorrect email or password");
  });

  it("returns the validation array's msg as a plain string on a 422, not the raw array", async () => {
    server.use(
      http.post(`${BACKEND_URL}/auth/login`, () =>
        HttpResponse.json(
          {
            detail: [
              {
                type: "value_error",
                loc: ["body", "email"],
                msg: "value is not a valid email address: The part after the @-sign is not valid. It should have a period.",
                ctx: { reason: "The part after the @-sign is not valid. It should have a period." },
              },
            ],
          },
          { status: 422 },
        ),
      ),
    );

    const response = await POST(loginRequest({ email: "dadwad@dawdda", password: "x" }));

    expect(response.status).toBe(422);
    const data = await response.json();
    expect(typeof data.error).toBe("string");
    expect(data.error).toBe(
      "value is not a valid email address: The part after the @-sign is not valid. It should have a period.",
    );
  });

  it("translates a known validation type code to en-US by default (no locale cookie, no Accept-Language)", async () => {
    server.use(
      http.post(`${BACKEND_URL}/auth/login`, () =>
        HttpResponse.json(
          {
            detail: [
              {
                type: "password_missing_uppercase",
                loc: ["body", "password"],
                msg: "Password must contain at least one uppercase letter",
              },
            ],
          },
          { status: 422 },
        ),
      ),
    );

    const response = await POST(
      loginRequest({ email: "admin@cityhero.app", password: "alllower1!" }),
    );

    const data = await response.json();
    expect(data.error).toBe("Password must contain at least one uppercase letter");
  });

  it("translates the same validation type code to pt-BR when the request carries that locale cookie", async () => {
    server.use(
      http.post(`${BACKEND_URL}/auth/login`, () =>
        HttpResponse.json(
          {
            detail: [
              {
                type: "password_missing_uppercase",
                loc: ["body", "password"],
                msg: "Password must contain at least one uppercase letter",
              },
            ],
          },
          { status: 422 },
        ),
      ),
    );

    const response = await POST(
      loginRequest(
        { email: "admin@cityhero.app", password: "alllower1!" },
        { Cookie: "cityhero_language=pt-BR" },
      ),
    );

    const data = await response.json();
    expect(data.error).toBe("A senha deve conter pelo menos uma letra maiúscula");
  });

  it("resolves each concurrent request's own locale independently — no cross-request leakage", async () => {
    // Route Handlers serve every request in one shared Node process; locale
    // must be threaded per-request (see resolveLocaleFromRequest), never
    // read off a shared module-level ref. Firing both requests concurrently
    // (rather than sequentially) is the only way to catch a regression to
    // that shared-ref pattern — a sequential test can't distinguish the two.
    server.use(
      http.post(`${BACKEND_URL}/auth/login`, () =>
        HttpResponse.json(
          {
            detail: [
              {
                type: "password_missing_uppercase",
                loc: ["body", "password"],
                msg: "Password must contain at least one uppercase letter",
              },
            ],
          },
          { status: 422 },
        ),
      ),
    );

    const [enResponse, ptResponse] = await Promise.all([
      POST(loginRequest({ email: "en@cityhero.app", password: "alllower1!" })),
      POST(
        loginRequest(
          { email: "pt@cityhero.app", password: "alllower1!" },
          { Cookie: "cityhero_language=pt-BR" },
        ),
      ),
    ]);

    const [enData, ptData] = await Promise.all([enResponse.json(), ptResponse.json()]);

    expect(enData.error).toBe("Password must contain at least one uppercase letter");
    expect(ptData.error).toBe("A senha deve conter pelo menos uma letra maiúscula");
  });

  it("does not leak the internal fallback code on an unmapped 500 from the backend", async () => {
    server.use(
      http.post(
        `${BACKEND_URL}/auth/login`,
        () => new Response("Internal Server Error", { status: 500 }),
      ),
    );

    const response = await POST(loginRequest({ email: "admin@cityhero.app", password: "x" }));

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).not.toContain("unknown_error");
  });

  it("returns 503 when the backend is unreachable", async () => {
    server.use(http.post(`${BACKEND_URL}/auth/login`, () => HttpResponse.error()));

    const response = await POST(loginRequest({ email: "admin@cityhero.app", password: "x" }));

    expect(response.status).toBe(503);
    const data = await response.json();
    expect(data.error).toBe("Backend unavailable");
  });

  it("returns 400 on invalid JSON body", async () => {
    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
