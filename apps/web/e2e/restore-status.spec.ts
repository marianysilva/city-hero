import { test, expect } from "@playwright/test";

import { AUTH_FILE } from "./global-setup";

// Reuse the admin session saved by global-setup — no /auth/login calls here.
test.use({ storageState: AUTH_FILE });

const PROBE_PASSWORD = "E2eTest123!";

test.describe("Restore should preserve the user's pre-delete status", () => {
  test("restoring a previously-deactivated user should keep it inactive", async ({ request }) => {
    // Regression test for a bug fixed 2026-07-22: apps/backend/app/services/
    // user_service.py's restore_user() used to unconditionally set
    // is_active=True on every restore, discarding whatever is_active was
    // before the user got deleted (delete_user() used to force is_active=False
    // on every delete too, destroying the pre-delete value before restore
    // could see it). Both now leave is_active untouched — deleted_at alone is
    // what excludes a user from login/listing.
    const email = `e2e-restore-bug-${Date.now()}@cityhero.com`;

    const created = await request.post("/api/users", {
      data: { email, name: "E2E Restore-Bug Probe", password: PROBE_PASSWORD, role: "citizen" },
    });
    expect(created.ok()).toBeTruthy();
    const user = await created.json();

    const deactivated = await request.patch(`/api/users/${user.id}`, { data: { isActive: false } });
    expect(deactivated.ok()).toBeTruthy();

    const deleted = await request.delete(`/api/users/${user.id}`);
    expect(deleted.status()).toBe(204);

    const restored = await request.post(`/api/users/${user.id}/restore`);
    expect(restored.ok()).toBeTruthy();
    const restoredBody = await restored.json();

    // This is the assertion that currently fails: restoredBody.isActive
    // comes back `true`, not the pre-delete `false`.
    expect(restoredBody.isActive).toBe(false);

    // Cleanup regardless of the assertion outcome above.
    await request.delete(`/api/users/${user.id}`);
  });
});
