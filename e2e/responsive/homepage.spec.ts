import { test, expect } from '@playwright/test'
import {
  assertNoHorizontalOverflow,
  assertNoClippedText,
} from '../helpers/assertions'

test.describe('Homepage responsive layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('no horizontal overflow', async ({ page }) => {
    await assertNoHorizontalOverflow(page)
  })

  test('no clipped text', async ({ page }) => {
    await assertNoClippedText(page)
  })

  test('hero section is visible', async ({ page }) => {
    const hero = page.locator('section').first()
    await expect(hero).toBeVisible()
  })

  test('main content visible', async ({ page }) => {
    const main = page.locator('main')
    const box = await main.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.height).toBeGreaterThan(100)
  })

  test('capture screenshot', async ({ page }, testInfo) => {
    await page.screenshot({
      path: `e2e/screenshots/${testInfo.project.name}-homepage.png`,
      fullPage: true,
    })
  })
})
