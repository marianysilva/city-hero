import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { createApiClient } from "../../src/client";
import { BASE_URL } from "../handlers";
import { server } from "../server";

// PROVISIONAL — see src/endpoints/comments.ts; no real backend route yet.
function makeClient() {
  return createApiClient({
    baseUrl: BASE_URL,
    getToken: vi.fn().mockResolvedValue("token-abc"),
    onAuthFailure: vi.fn(),
  });
}

describe("comments endpoints (provisional)", () => {
  it("lists comments for a report", async () => {
    server.use(
      http.get(`${BASE_URL}/reports/r1/comments`, () =>
        HttpResponse.json([
          { id: "c1", reportId: "r1", authorId: "u1", tag: "dangerous", createdAt: "2026-01-01" },
        ]),
      ),
    );
    const comments = await makeClient().comments.list("r1");
    expect(comments).toHaveLength(1);
  });

  it("creates a comment for a report", async () => {
    server.use(
      http.post(`${BASE_URL}/reports/r1/comments`, async ({ request }) => {
        const body = (await request.json()) as { tag: string };
        return HttpResponse.json(
          { id: "c2", reportId: "r1", authorId: "u1", tag: body.tag, createdAt: "2026-01-01" },
          { status: 201 },
        );
      }),
    );
    const comment = await makeClient().comments.create("r1", { tag: "blocks_traffic" });
    expect(comment.tag).toBe("blocks_traffic");
  });
});
