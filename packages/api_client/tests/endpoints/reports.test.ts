import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { createApiClient } from "../../src/client";
import { BASE_URL } from "../handlers";
import { server } from "../server";

// PROVISIONAL — these paths don't exist on the real backend yet (see
// src/endpoints/reports.ts). These tests only verify this package builds
// the right request shape; they say nothing about the real API surface.
function makeClient() {
  return createApiClient({
    baseUrl: BASE_URL,
    getToken: vi.fn().mockResolvedValue("token-abc"),
    onAuthFailure: vi.fn(),
  });
}

describe("reports endpoints (provisional)", () => {
  it("lists reports with page/page_size/status as query params", async () => {
    server.use(
      http.get(`${BASE_URL}/reports`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("status")).toBe("open");
        return HttpResponse.json({ reports: [], total: 0, page: 1, pageSize: 20 });
      }),
    );
    const res = await makeClient().reports.list({ status: "open" });
    expect(res.total).toBe(0);
  });

  it("fetches a single report", async () => {
    server.use(
      http.get(`${BASE_URL}/reports/r1`, () =>
        HttpResponse.json({
          id: "r1",
          category: "pothole",
          status: "open",
          description: null,
          latitude: -23.5,
          longitude: -46.6,
          createdAt: "2026-01-01T00:00:00Z",
        }),
      ),
    );
    const report = await makeClient().reports.get("r1");
    expect(report.category).toBe("pothole");
  });

  it("creates a report", async () => {
    server.use(
      http.post(`${BASE_URL}/reports`, async ({ request }) => {
        const body = (await request.json()) as { category: string };
        return HttpResponse.json(
          {
            id: "r2",
            category: body.category,
            status: "open",
            description: null,
            latitude: -23.5,
            longitude: -46.6,
            createdAt: "2026-01-01T00:00:00Z",
          },
          { status: 201 },
        );
      }),
    );
    const report = await makeClient().reports.create({
      category: "trash",
      latitude: -23.5,
      longitude: -46.6,
    });
    expect(report.id).toBe("r2");
  });
});
