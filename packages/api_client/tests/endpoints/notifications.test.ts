import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { createApiClient } from "../../src/client";
import { BASE_URL } from "../handlers";
import { server } from "../server";

// PROVISIONAL — see src/endpoints/notifications.ts; no real backend route yet.
function makeClient() {
  return createApiClient({
    baseUrl: BASE_URL,
    getToken: vi.fn().mockResolvedValue("token-abc"),
    onAuthFailure: vi.fn(),
  });
}

describe("notifications endpoints (provisional)", () => {
  it("lists notifications", async () => {
    server.use(
      http.get(`${BASE_URL}/notifications`, () =>
        HttpResponse.json([
          { id: "n1", title: "Ticket updated", body: "...", readAt: null, createdAt: "2026-01-01" },
        ]),
      ),
    );
    const notifications = await makeClient().notifications.list();
    expect(notifications).toHaveLength(1);
  });

  it("reads the unread count", async () => {
    server.use(
      http.get(`${BASE_URL}/notifications/unread-count`, () => HttpResponse.json({ count: 3 })),
    );
    const count = await makeClient().notifications.unreadCount();
    expect(count).toBe(3);
  });

  it("marks a notification as read", async () => {
    server.use(
      http.post(`${BASE_URL}/notifications/n1/read`, () => new HttpResponse(null, { status: 204 })),
    );
    const result = await makeClient().notifications.markAsRead("n1");
    expect(result).toBeUndefined();
  });
});
