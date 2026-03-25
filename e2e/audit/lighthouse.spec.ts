import { chromium, type Browser, expect } from '@playwright/test'
import { test as base } from '@playwright/test'
import lighthouse from 'lighthouse'
import {
  AUDIT_ROUTES,
  LIGHTHOUSE_THRESHOLDS,
  writeJsonResult,
} from '../helpers/audit-helpers'

const test = base.extend<
  {},
  { port: number; auditBrowser: Browser }
>({
  port: [
    async ({}, use, workerInfo) => {
      const port = 9222 + workerInfo.workerIndex
      await use(port)
    },
    { scope: 'worker' },
  ],
  auditBrowser: [
    async ({ port }, use) => {
      const browser = await chromium.launch({
        args: [`--remote-debugging-port=${port}`],
      })
      await use(browser)
      await browser.close()
    },
    { scope: 'worker' },
  ],
})

const lighthouseConfig = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'desktop' as const,
    screenEmulation: { disabled: true },
    throttling: {
      rttMs: 0,
      throughputKbps: 0,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
      cpuSlowdownMultiplier: 1,
    },
    onlyCategories: [
      'performance',
      'accessibility',
      'best-practices',
      'seo',
    ],
  },
}

for (const route of AUDIT_ROUTES) {
  const routeName =
    route === '/' ? 'homepage' : route.replace(/\//g, '-').slice(1)

  test(`Lighthouse audit: ${route}`, async (
    { auditBrowser, port },
    testInfo,
  ) => {
    const page = await auditBrowser.newPage()
    await page.goto(`http://localhost:3000${route}`)
    await page.waitForLoadState('networkidle')

    const viewport = testInfo.project.name

    // Use lighthouse directly to capture actual scores
    const result = await lighthouse(
      `http://localhost:3000${route}`,
      { port, output: 'json' },
      lighthouseConfig,
    )

    const categories = result?.lhr?.categories ?? {}
    const scores = {
      performance: Math.round((categories.performance?.score ?? 0) * 100),
      accessibility: Math.round((categories.accessibility?.score ?? 0) * 100),
      'best-practices': Math.round((categories['best-practices']?.score ?? 0) * 100),
      seo: Math.round((categories.seo?.score ?? 0) * 100),
    }

    const failures: string[] = []
    for (const [category, threshold] of Object.entries(LIGHTHOUSE_THRESHOLDS)) {
      const actual = scores[category as keyof typeof scores]
      if (actual < threshold) {
        failures.push(`${category}: ${actual} (threshold: ${threshold})`)
      }
    }

    const status = failures.length === 0 ? 'pass' : 'fail'

    // Always write JSON result with actual scores
    writeJsonResult(`lighthouse-${routeName}-${viewport}.json`, {
      route,
      viewport,
      scores,
      thresholds: LIGHTHOUSE_THRESHOLDS,
      status,
      failures,
      timestamp: new Date().toISOString(),
    })

    // Assert thresholds
    expect(
      failures,
      `Lighthouse threshold failures on ${route} at ${viewport}: ${failures.join(', ')}`,
    ).toEqual([])

    await page.close()
  })
}
