import { chromium, type FullConfig } from '@playwright/test'
import path from 'path'
import fs from 'fs'

// Credentials come from the root .env via playwright.config.ts env mapping.
// The fallback email matches the seed default; password has no fallback so
// the suite fails loudly rather than silently when the env is missing.
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? 'admin@cityhero.app'
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? ''
export const AUTH_FILE = path.join(__dirname, '.auth/user.json')

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL ?? 'http://localhost:3000'

  // Ensure .auth directory exists
  fs.mkdirSync(path.join(__dirname, '.auth'), { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  await page.goto(`${baseURL}/login`)
  await page.waitForSelector('#email')

  await page.fill('#email', ADMIN_EMAIL)
  await page.fill('#password', ADMIN_PASSWORD)
  await page.click('button[type="submit"]')

  // Wait for redirect away from /login
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 10000 })

  // Save storage state (cookies) so tests can reuse auth
  await page.context().storageState({ path: AUTH_FILE })

  await browser.close()
}

export default globalSetup
