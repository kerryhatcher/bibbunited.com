import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {
  AUDIT_ROUTES,
  writeJsonResult,
  summarizeAxeResults,
} from '../helpers/audit-helpers'

for (const route of AUDIT_ROUTES) {
  const routeName =
    route === '/' ? 'homepage' : route.replace(/\//g, '-').slice(1)

  test(`Axe accessibility: ${route}`, async ({ page }, testInfo) => {
    await page.goto(route)
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    const viewport = testInfo.project.name
    const filename = `axe-${routeName}-${viewport}.json`
    writeJsonResult(filename, summarizeAxeResults(results))

    expect(
      results.violations,
      `Axe violations on ${route} at ${viewport}: ${JSON.stringify(
        results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.length,
        })),
      )}`,
    ).toEqual([])
  })
}
