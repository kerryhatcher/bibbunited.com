/**
 * Runtime browser verification for 08-03 plan.
 * Verifies mode switching, font loading, and keyboard focus rings.
 */
import { test, expect } from '@playwright/test'

test.describe('Runtime browser verification', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('mode switching: homepage renders with data-mode attribute', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const body = page.locator('body')
    const mode = await body.getAttribute('data-mode')
    expect(mode).toBeTruthy()
    expect(['community', 'urgent']).toContain(mode)

    // Take screenshot showing current mode
    await page.screenshot({
      path: 'e2e/screenshots/runtime-verify-mode-current.png',
      fullPage: true,
    })

    console.log(`Current mode: ${mode}`)
  })

  test('font self-hosting: headings use Barlow Condensed, body uses Inter', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check heading font (h1 or h2)
    const headingFont = await page.evaluate(() => {
      const heading =
        document.querySelector('h1') || document.querySelector('h2')
      if (!heading) return 'NO_HEADING_FOUND'
      return window.getComputedStyle(heading).fontFamily
    })
    console.log('Heading font-family:', headingFont)
    // Barlow Condensed is loaded via CSS variable --font-barlow-condensed
    expect(
      headingFont.toLowerCase().includes('barlow') ||
        headingFont.includes('__Barlow'),
    ).toBeTruthy()

    // Check body/paragraph font
    const bodyFont = await page.evaluate(() => {
      const para = document.querySelector('p')
      if (!para) return 'NO_PARAGRAPH_FOUND'
      return window.getComputedStyle(para).fontFamily
    })
    console.log('Body font-family:', bodyFont)
    expect(
      bodyFont.toLowerCase().includes('inter') ||
        bodyFont.includes('__Inter'),
    ).toBeTruthy()

    // Verify no Google Fonts CDN requests
    const googleFontRequests: string[] = []
    page.on('request', (request) => {
      const url = request.url()
      if (
        url.includes('fonts.googleapis.com') ||
        url.includes('fonts.gstatic.com')
      ) {
        googleFontRequests.push(url)
      }
    })

    // Navigate again to capture font requests
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(googleFontRequests).toHaveLength(0)
    console.log('No Google Fonts CDN requests detected - fonts are self-hosted')
  })

  test('keyboard focus rings: visible on interactive elements', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    let focusedCount = 0
    const focusResults: { tag: string; hasIndicator: boolean; detail: string }[] = []

    // Tab through interactive elements
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(100)

      const result = await page.evaluate(() => {
        const el = document.activeElement
        if (!el || el === document.body) return null

        const style = window.getComputedStyle(el)
        const hasOutline =
          style.outlineStyle !== 'none' && style.outlineWidth !== '0px'
        const hasBoxShadow = style.boxShadow !== 'none'
        const hasRing = hasOutline || hasBoxShadow

        return {
          tag: `${el.tagName.toLowerCase()}${el.className ? '.' + el.className.split(' ')[0] : ''}`,
          hasIndicator: hasRing,
          detail: hasOutline
            ? `outline: ${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`
            : hasBoxShadow
              ? `box-shadow: ${style.boxShadow.substring(0, 60)}`
              : 'none',
        }
      })

      if (result) {
        focusResults.push(result)
        if (result.hasIndicator) focusedCount++
      }
    }

    console.log('Focus ring results:')
    focusResults.forEach((r) =>
      console.log(`  ${r.tag}: ${r.hasIndicator ? 'VISIBLE' : 'NONE'} (${r.detail})`),
    )

    // At least 3 interactive elements should show visible focus indicators
    expect(focusedCount).toBeGreaterThanOrEqual(3)
    console.log(
      `${focusedCount} of ${focusResults.length} elements have visible focus indicators`,
    )
  })
})
