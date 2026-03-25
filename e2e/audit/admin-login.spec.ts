import { test, expect } from '@playwright/test'

test('Admin login page loads correctly', async ({ page }) => {
  const response = await page.goto('/admin')
  // Payload redirects /admin to /admin/login if not authenticated
  expect(response?.status()).toBeLessThan(400)

  // Verify login form renders
  await expect(
    page.locator('input[type="email"], input[name="email"]'),
  ).toBeVisible({ timeout: 10000 })
  await expect(
    page.locator('input[type="password"], input[name="password"]'),
  ).toBeVisible()
})
