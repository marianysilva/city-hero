// @vitest-environment node
import { HttpResponse, http } from "msw";
import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "../../../__test-utils__/server";

import { POST } from "./route";

const mockCookies = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({ cookies: mockCookies }));

const BACKEND_URL = "http://localhost:8000";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => mockCookies.mockResolvedValue({ get: () => ({ value: "valid-token" }) }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function paramsFor(id: string) {
  return { params: Promise.resolve({ id }) };
}

function resetRequest(body: unknown) {
  return new NextRequest("http://localhost/api/users/u1/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/users/:id/reset-password", () => {
  it("sends newPassword as camelCase and returns 204 on success", async () => {
    server.use(
      http.post(`${BACKEND_URL}/users/u1/reset-password`, async ({ request }) => {
        const body = (await request.json()) as { newPassword?: string };
        expect(body).toEqual({ newPassword: "Sup3rSecret!" });
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const response = await POST(resetRequest({ newPassword: "Sup3rSecret!" }), paramsFor("u1"));

    expect(response.status).toBe(204);
  });

  it("returns 400 on invalid JSON body", async () => {
    const request = new NextRequest("http://localhost/api/users/u1/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    const response = await POST(request, paramsFor("u1"));

    expect(response.status).toBe(400);
  });

  it("returns 422 with the validation array as detail", async () => {
    server.use(
      http.post(`${BACKEND_URL}/users/u1/reset-password`, () =>
        HttpResponse.json(
          { detail: [{ loc: ["body", "newPassword"], msg: "too short", type: "value_error" }] },
          { status: 422 },
        ),
      ),
    );

    const response = await POST(resetRequest({ newPassword: "x" }), paramsFor("u1"));

    expect(response.status).toBe(422);
    const data = await response.json();
    expect(data.detail).toEqual([
      { loc: ["body", "newPassword"], msg: "too short", type: "value_error" },
    ]);
  });
});
