import { test, expect } from '@playwright/test'

// Credentials are loaded from the root .env via playwright.config.ts (APP_ADMIN /
// APP_ADMIN_PASSWORD → TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD). The fallback
// email matches the seed migration default; password has no fallback so the
// suite fails loudly rather than silently when the env is not configured.
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? 'admin@cityhero.app'
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? ''

// Auth tests run without stored auth state
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Login flow', () => {
  test('should redirect unauthenticated users to /login', async ({ page }) => {
    await page.goto('/users')
    await page.waitForURL(/\/login/)
    expect(page.url()).toContain('/login')
  })

  test('should show validation error on empty form submit', async ({ page }) => {
    await page.goto('/login')
    await page.waitForSelector('#email')

    // HTML5 validation prevents submission with empty required fields.
    // Click submit and check the email field reports validity.
    await page.click('button[type="submit"]')

    // page.$eval is Playwright's typed DOM-query API — it serializes the
    // typed callback and runs it inside the browser against the matched
    // element. It is NOT the global eval(); no arbitrary string is executed.
    const emailValid = await page.$eval('#email', (el) =>
      (el as HTMLInputElement).validity.valid
    )
    expect(emailValid).toBe(false)
  })

  test('should show error on wrong credentials', async ({ page }) => {
    await page.goto('/login')
    await page.waitForSelector('#email')

    await page.fill('#email', 'wrong@example.com')
    await page.fill('#password', 'wrongpassword')

    // Use waitForResponse so we check the error message only after the API
    // responds — not before, which would race against elements in the DOM
    // that happen to share CSS classes with the error component.
    const [response] = await Promise.all([
      page.waitForResponse((r) =>
        r.url().includes('/api/auth/login') && r.request().method() === 'POST'
      ),
      page.click('button[type="submit"]'),
    ])

    expect(response.status()).not.toBe(200)

    // AlertMessage renders with role="alert" for the error variant
    const errorAlert = page.getByRole('alert')
    await expect(errorAlert).toBeVisible()
    const text = await errorAlert.textContent()
    expect(text?.trim()).toBeTruthy()
  })

  test('should login successfully with valid credentials and redirect to dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.waitForSelector('#email')

    await page.fill('#email', ADMIN_EMAIL)
    await page.fill('#password', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')

    // After login, middleware redirects to / (dashboard)
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15000 })
    expect(page.url()).not.toContain('/login')
  })

  test('should persist session across page reload', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.waitForSelector('#email')
    await page.fill('#email', ADMIN_EMAIL)
    await page.fill('#password', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15000 })

    // Reload and verify we're still on the dashboard (not redirected to /login)
    await page.reload()
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 10000 })
    expect(page.url()).not.toContain('/login')
  })
})
