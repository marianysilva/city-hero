import { HttpResponse, http } from "msw";

export const BASE_URL = "http://localhost:8000";

const meUser = {
  id: "0f3b1c2e-1234-4a9b-8b1a-000000000001",
  email: "citizen@example.com",
  name: "Citizen One",
  role: "citizen",
  authProvider: "password",
  isActive: true,
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00Z",
  deletedAt: null,
  roleInfo: { name: "citizen", rank: 0, isSuperuser: false },
  capabilities: { permissions: [], assignableRoles: [], manageableRoles: [] },
};

// Happy-path handlers matching apps/backend/app/routers/auth.py + users.py
// exactly. Individual tests override these with server.use(...) for error/
// retry/cancellation scenarios.
export const handlers = [
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.password === "wrong-password") {
      return HttpResponse.json({ detail: "Incorrect email or password" }, { status: 401 });
    }
    return HttpResponse.json(
      { accessToken: "test-access-token", tokenType: "bearer", user: meUser },
      { status: 200 },
    );
  }),

  http.post(`${BASE_URL}/auth/register`, () =>
    HttpResponse.json(
      { accessToken: "test-access-token", tokenType: "bearer", user: meUser },
      { status: 201 },
    ),
  ),

  http.get(`${BASE_URL}/users/me`, ({ request }) => {
    const auth = request.headers.get("Authorization");
    if (!auth)
      return HttpResponse.json({ detail: "Could not validate credentials" }, { status: 401 });
    return HttpResponse.json(meUser, { status: 200 });
  }),

  http.get(`${BASE_URL}/users`, () =>
    HttpResponse.json({ users: [meUser], total: 1, page: 1, pageSize: 20 }, { status: 200 }),
  ),
];
