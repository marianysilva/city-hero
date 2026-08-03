import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { createApiClient } from "../../src/client";
import { BASE_URL } from "../handlers";
import { server } from "../server";

function makeClient() {
  return createApiClient({
    baseUrl: BASE_URL,
    getToken: vi.fn().mockResolvedValue("token-abc"),
    onAuthFailure: vi.fn(),
  });
}

describe("users endpoints", () => {
  it("fetches the current user via GET /users/me", async () => {
    const me = await makeClient().users.me();
    expect(me.roleInfo.name).toBe("citizen");
    expect(me.capabilities.permissions).toEqual([]);
  });

  it("lists users with page/page_size/status as query params", async () => {
    server.use(
      http.get(`${BASE_URL}/users`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("page")).toBe("2");
        expect(url.searchParams.get("page_size")).toBe("10");
        expect(url.searchParams.get("status")).toBe("inactive");
        return HttpResponse.json({ users: [], total: 0, page: 2, pageSize: 10 });
      }),
    );

    const res = await makeClient().users.list({ page: 2, pageSize: 10, status: "inactive" });
    expect(res.page).toBe(2);
  });

  it("lists users with repeated sort query params", async () => {
    server.use(
      http.get(`${BASE_URL}/users`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.getAll("sort")).toEqual(["name:asc", "email:desc"]);
        return HttpResponse.json({ users: [], total: 0, page: 1, pageSize: 20 });
      }),
    );

    await makeClient().users.list({ sort: ["name:asc", "email:desc"] });
  });

  it("creates a user via POST /users", async () => {
    server.use(
      http.post(`${BASE_URL}/users`, async ({ request }) => {
        const body = (await request.json()) as { email: string; role: string };
        return HttpResponse.json(
          {
            id: "new-id",
            email: body.email,
            name: "Someone",
            role: body.role,
            authProvider: "password",
            isActive: true,
            avatarUrl: null,
            createdAt: "2026-01-01T00:00:00Z",
            deletedAt: null,
          },
          { status: 201 },
        );
      }),
    );

    const user = await makeClient().users.create({
      email: "someone@example.com",
      name: "Someone",
      password: "Sup3rSecret!",
      role: "field_team",
    });
    expect(user.role).toBe("field_team");
  });

  it("sends language to the backend via POST /users", async () => {
    server.use(
      http.post(`${BASE_URL}/users`, async ({ request }) => {
        const body = (await request.json()) as { email: string; role: string; language?: string };
        expect(body.language).toBe("pt-BR");
        return HttpResponse.json(
          {
            id: "new-id",
            email: body.email,
            name: "Someone",
            role: body.role,
            authProvider: "password",
            isActive: true,
            avatarUrl: null,
            language: body.language,
            createdAt: "2026-01-01T00:00:00Z",
            deletedAt: null,
          },
          { status: 201 },
        );
      }),
    );

    const user = await makeClient().users.create({
      email: "someone@example.com",
      name: "Someone",
      password: "Sup3rSecret!",
      role: "field_team",
      language: "pt-BR",
    });
    expect(user.language).toBe("pt-BR");
  });

  it("updates a user via PATCH /users/:id", async () => {
    server.use(
      http.patch(`${BASE_URL}/users/u1`, async ({ request }) => {
        const body = (await request.json()) as { isActive: boolean };
        return HttpResponse.json({
          id: "u1",
          email: "citizen@example.com",
          name: "Citizen One",
          role: "citizen",
          authProvider: "password",
          isActive: body.isActive,
          avatarUrl: null,
          createdAt: "2026-01-01T00:00:00Z",
          deletedAt: null,
        });
      }),
    );

    const user = await makeClient().users.update("u1", { isActive: false });
    expect(user.isActive).toBe(false);
  });

  it("sends language to the backend via PATCH /users/:id", async () => {
    server.use(
      http.patch(`${BASE_URL}/users/u1`, async ({ request }) => {
        const body = (await request.json()) as { language?: string };
        expect(body.language).toBe("pt-BR");
        return HttpResponse.json({
          id: "u1",
          email: "citizen@example.com",
          name: "Citizen One",
          role: "citizen",
          authProvider: "password",
          isActive: true,
          avatarUrl: null,
          language: body.language,
          createdAt: "2026-01-01T00:00:00Z",
          deletedAt: null,
        });
      }),
    );

    const user = await makeClient().users.update("u1", { language: "pt-BR" });
    expect(user.language).toBe("pt-BR");
  });

  it("restores a soft-deleted user via POST /users/:id/restore", async () => {
    server.use(
      http.post(`${BASE_URL}/users/u1/restore`, () =>
        HttpResponse.json({
          id: "u1",
          email: "citizen@example.com",
          name: "Citizen One",
          role: "citizen",
          authProvider: "password",
          isActive: true,
          avatarUrl: null,
          createdAt: "2026-01-01T00:00:00Z",
          deletedAt: null,
        }),
      ),
    );

    const user = await makeClient().users.restore("u1");
    expect(user.deletedAt).toBeNull();
  });

  it("removes a user via DELETE /users/:id, returning undefined on 204", async () => {
    server.use(http.delete(`${BASE_URL}/users/u1`, () => new HttpResponse(null, { status: 204 })));

    const result = await makeClient().users.remove("u1");
    expect(result).toBeUndefined();
  });

  it("maps a 404 on GET /users/:id to a not_found error", async () => {
    server.use(
      http.get(`${BASE_URL}/users/missing`, () =>
        HttpResponse.json({ detail: "User not found" }, { status: 404 }),
      ),
    );

    await expect(makeClient().users.get("missing")).rejects.toMatchObject({
      code: "not_found",
      message: "User not found",
    });
  });
});
