import { test, expect } from '@playwright/test'
import {
  assertNoHorizontalOverflow,
  assertNoClippedText,
} from '../helpers/assertions'

test.describe('CMS page responsive layout', () => {
  test.beforeEach(async ({ page }) => {
    // Try /about (most likely CMS page to exist based on NAV-03)
    const response = await page.goto('/about')
    if (response && response.status() === 404) {
      test.skip(true, 'No CMS pages available')
      return
    }
    await page.waitForLoadState('networkidle')
  })

  test('no horizontal overflow', async ({ page }) => {
    await assertNoHorizontalOverflow(page)
  })

  test('no clipped text', async ({ page }) => {
    await assertNoClippedText(page)
  })

  test('main content visible', async ({ page }) => {
    const main = page.locator('main')
    const box = await main.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.height).toBeGreaterThan(100)
  })

  test('capture screenshot', async ({ page }, testInfo) => {
    await page.screenshot({
      path: `e2e/screenshots/${testInfo.project.name}-cms-page.png`,
      fullPage: true,
    })
  })
})
