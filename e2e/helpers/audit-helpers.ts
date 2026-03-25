import * as fs from 'fs'
import * as path from 'path'

export interface AuditScore {
  route: string
  viewport: string
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  axeViolations: number
  axeIncomplete: number
  pass: boolean
}

export interface AxeViolationSummary {
  id: string
  impact: string
  description: string
  nodes: number
}

export const AUDIT_ROUTES = [
  '/',
  '/news',
  '/news/school-board-approves-2026-2027-budget', // seeded news article slug
  '/contact-officials',
  '/meetings',
  '/about', // CMS page /[slug]
]

export const RESULTS_DIR = path.join(process.cwd(), 'e2e', 'audit', 'results')

export const LIGHTHOUSE_THRESHOLDS = {
  performance: 95,
  accessibility: 95,
  'best-practices': 95,
  seo: 95,
}

export function ensureResultsDir(): void {
  fs.mkdirSync(RESULTS_DIR, { recursive: true })
}

export function writeJsonResult(filename: string, data: unknown): void {
  ensureResultsDir()
  fs.writeFileSync(
    path.join(RESULTS_DIR, filename),
    JSON.stringify(data, null, 2),
  )
}

export function summarizeAxeResults(results: {
  violations: any[]
  passes: any[]
  incomplete: any[]
}) {
  return {
    violations: results.violations.length,
    passes: results.passes.length,
    incomplete: results.incomplete.length,
    details: results.violations.map((v: any) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.length,
    })),
  }
}

export function generateAuditMarkdown(scores: AuditScore[]): string {
  const date = new Date().toISOString().split('T')[0]
  let md = '# Audit Results\n\n'
  md += `**Date:** ${date}\n`
  md += `**Threshold:** 95+ Lighthouse (all categories), 0 axe-core violations\n`
  md += `**Routes audited:** ${AUDIT_ROUTES.length}\n`
  md += `**Viewports:** 5 (320x568, 375x667, 768x1024, 1024x768, 1440x900)\n\n`

  md += '## Summary\n\n'
  const passing = scores.filter((s) => s.pass).length
  const total = scores.length
  md += `**Overall:** ${passing}/${total} audits passing\n\n`

  md += '## Scores by Route\n\n'
  md += '| Route | Viewport | Perf | A11y | BP | SEO | Axe Violations | Status |\n'
  md += '|-------|----------|------|------|----|-----|----------------|--------|\n'
  for (const s of scores) {
    const status = s.pass ? 'PASS' : 'FAIL'
    md += `| ${s.route} | ${s.viewport} | ${s.performance} | ${s.accessibility} | ${s.bestPractices} | ${s.seo} | ${s.axeViolations} | ${status} |\n`
  }

  md += '\n## Future Polish\n\n'
  md += '_Items identified during audit that could be improved beyond the pass/fail threshold:_\n\n'
  md += '- (To be populated after audit execution)\n'

  return md
}
