import { test, expect } from '@playwright/test'
import {
  assertNoHorizontalOverflow,
  assertNoClippedText,
} from '../helpers/assertions'

test.describe('Meetings responsive layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/meetings')
    await page.waitForLoadState('networkidle')
  })

  test('no horizontal overflow', async ({ page }) => {
    await assertNoHorizontalOverflow(page)
  })

  test('no clipped text', async ({ page }) => {
    await assertNoClippedText(page)
  })

  test('page heading exists', async ({ page }) => {
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    await expect(heading).toContainText('Meeting Schedule')
  })

  test('main content visible', async ({ page }) => {
    const main = page.locator('main')
    const box = await main.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.height).toBeGreaterThan(100)
  })

  test('capture screenshot', async ({ page }, testInfo) => {
    await page.screenshot({
      path: `e2e/screenshots/${testInfo.project.name}-meetings.png`,
      fullPage: true,
    })
  })
})
