import { test, expect } from '@playwright/test'
import {
  assertNoHorizontalOverflow,
  assertNoClippedText,
} from '../helpers/assertions'

test.describe('News article responsive layout', () => {
  test.beforeEach(async ({ page }) => {
    // Discover a valid article slug dynamically from the news listing
    await page.goto('/news')
    await page.waitForLoadState('networkidle')

    // Check if any article links exist (don't wait for them to appear)
    const linkCount = await page.locator('a[href^="/news/"]').count()
    if (linkCount === 0) {
      test.skip(true, 'No news articles in database')
      return
    }

    const href = await page.locator('a[href^="/news/"]').first().getAttribute('href')
    if (!href) {
      test.skip(true, 'No news articles in database')
      return
    }

    await page.goto(href)
    await page.waitForLoadState('networkidle')
  })

  test('no horizontal overflow', async ({ page }) => {
    await assertNoHorizontalOverflow(page)
  })

  test('no clipped text', async ({ page }) => {
    await assertNoClippedText(page)
  })

  test('article content visible', async ({ page }) => {
    const main = page.locator('main')
    const box = await main.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.height).toBeGreaterThan(100)
  })

  test('article heading exists', async ({ page }) => {
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
  })

  test('capture screenshot', async ({ page }, testInfo) => {
    await page.screenshot({
      path: `e2e/screenshots/${testInfo.project.name}-news-article.png`,
      fullPage: true,
    })
  })
})
