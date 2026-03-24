import { Page, expect } from '@playwright/test'

/**
 * Assert that no element on the page has horizontal overflow,
 * excluding elements with intentional overflow styles (auto, scroll, hidden).
 */
export async function assertNoHorizontalOverflow(page: Page) {
  const overflowElements = await page.evaluate(() => {
    const results: string[] = []
    document.querySelectorAll('*').forEach((el) => {
      const htmlEl = el as HTMLElement
      if (htmlEl.scrollWidth > htmlEl.clientWidth + 1) {
        const style = window.getComputedStyle(htmlEl)
        const overflowX = style.overflowX
        const overflow = style.overflow
        // Skip elements with intentional scrollable overflow
        if (
          overflowX === 'auto' ||
          overflowX === 'scroll' ||
          overflowX === 'hidden' ||
          overflow === 'auto' ||
          overflow === 'scroll' ||
          overflow === 'hidden'
        ) {
          return
        }
        const tag = htmlEl.tagName.toLowerCase()
        const cls = htmlEl.className?.toString().slice(0, 50) || ''
        results.push(
          `${tag}.${cls} (scrollWidth=${htmlEl.scrollWidth}, clientWidth=${htmlEl.clientWidth})`,
        )
      }
    })
    return results
  })
  expect(overflowElements, 'Elements with horizontal overflow').toEqual([])
}

/**
 * Assert that no visible text elements have zero bounding rect height,
 * which would indicate clipped or invisible text.
 */
export async function assertNoClippedText(page: Page) {
  const clipped = await page.evaluate(() => {
    const results: string[] = []
    document
      .querySelectorAll('p, h1, h2, h3, h4, li, a, span, td')
      .forEach((el) => {
        const rect = el.getBoundingClientRect()
        const text = el.textContent?.trim()
        if (text && text.length > 0 && rect.height === 0) {
          results.push(`${el.tagName}: "${text.slice(0, 30)}"`)
        }
      })
    return results
  })
  expect(clipped, 'Text elements with zero height').toEqual([])
}
