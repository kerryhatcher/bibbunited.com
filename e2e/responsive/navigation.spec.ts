import { test, expect } from '@playwright/test'
import { assertNoHorizontalOverflow } from '../helpers/assertions'

test.describe('Navigation responsive layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  // Run overflow check BEFORE any menu interaction (per Pitfall 5:
  // body scroll lock interferes with overflow detection)
  test('no horizontal overflow', async ({ page }) => {
    await assertNoHorizontalOverflow(page)
  })

  test('navigation structure matches viewport', async ({ page, viewport }) => {
    if (!viewport) return

    if (viewport.width < 1024) {
      // Mobile/tablet: desktop nav should be hidden (has class "hidden lg:flex")
      const desktopNav = page.locator('nav[aria-label="Main navigation"]')
      await expect(desktopNav).toBeHidden()

      // Hamburger button should be visible
      const menuBtn = page.getByLabel('Open menu')
      await expect(menuBtn).toBeVisible()

      // Click hamburger to open slide-out panel
      await menuBtn.click()

      // Wait for the slide-out panel to translate into view (300ms animation)
      // The panel uses translate-x-0 when open, translate-x-full when closed
      // Check that the close button becomes visible (it's inside the panel)
      const closeBtn = page.getByLabel('Close menu')
      await expect(closeBtn).toBeVisible({ timeout: 2000 })

      // Mobile nav element should be attached in the DOM
      const mobileNav = page.locator('nav[aria-label="Mobile navigation"]')
      await expect(mobileNav).toBeAttached()

      // Close the menu
      await closeBtn.click()

      // The slide-out panel stays in DOM but translates off-screen.
      // Verify close by checking the overlay backdrop is removed from DOM.
      const overlay = page.locator('div[aria-hidden="true"].fixed.inset-0')
      await expect(overlay).toHaveCount(0, { timeout: 2000 })
    } else {
      // Desktop: the nav element exists with the correct aria label
      const desktopNav = page.locator('nav[aria-label="Main navigation"]')
      await expect(desktopNav).toBeAttached()

      // Verify the nav element has the responsive class that shows it at lg+
      const navClass = await desktopNav.getAttribute('class')
      expect(navClass).toContain('lg:flex')

      // Hamburger button should be hidden at desktop (has class "lg:hidden")
      const menuBtn = page.getByLabel('Open menu')
      await expect(menuBtn).toBeHidden()
    }
  })

  test('capture screenshot', async ({ page }, testInfo) => {
    await page.screenshot({
      path: `e2e/screenshots/${testInfo.project.name}-navigation.png`,
      fullPage: true,
    })
  })
})
