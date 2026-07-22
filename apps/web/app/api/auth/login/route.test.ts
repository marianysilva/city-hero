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

function loginRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
