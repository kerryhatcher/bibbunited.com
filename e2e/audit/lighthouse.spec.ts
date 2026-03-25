import { chromium } from 'playwright'
import { test as base } from '@playwright/test'
import { playAudit } from 'playwright-lighthouse'
import {
  AUDIT_ROUTES,
  LIGHTHOUSE_THRESHOLDS,
  writeJsonResult,
} from '../helpers/audit-helpers'

const test = base.extend<
  {},
  { port: number; auditBrowser: import('playwright').Browser }
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

    await playAudit({
      page,
      port,
      thresholds: LIGHTHOUSE_THRESHOLDS,
      config: lighthouseConfig,
    })

    // playAudit throws if thresholds not met, so reaching here means pass.
    // Write a result marker for the audit report.
    writeJsonResult(`lighthouse-${routeName}-${viewport}.json`, {
      route,
      viewport,
      thresholds: LIGHTHOUSE_THRESHOLDS,
      status: 'pass',
      timestamp: new Date().toISOString(),
    })

    await page.close()
  })
}
