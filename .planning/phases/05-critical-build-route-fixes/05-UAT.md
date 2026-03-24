---
status: complete
phase: 05-critical-build-route-fixes
source: [05-01-SUMMARY.md, 05-02-SUMMARY.md]
started: 2026-03-24T18:48:00.000Z
updated: 2026-03-24T18:55:00.000Z
---

## Current Test

[testing complete]

## Tests

### 1. next build Completes Without Errors
expected: `pnpm build` (next build) completes successfully with all routes generated including /news/[slug]
result: issue
reported: "next build itself succeeds and generates all routes. But postbuild script (next-sitemap) fails because it looks for next-sitemap.config.js while project has next-sitemap.config.cjs. Running `pnpm next-sitemap --config next-sitemap.config.cjs` works. The postbuild script needs updating to: next-sitemap --config next-sitemap.config.cjs"
severity: minor

### 2. /news Listing Route Exists
expected: /news route renders with NEWS heading, card grid layout, and empty state when no posts
result: pass
verified: Page title "News | BIBB United", h1 "NEWS", h2 "No News Published Yet", empty state message

### 3. /news Route — OG and Twitter Metadata
expected: /news page has OpenGraph and Twitter Card meta tags
result: pass
verified: og:title="News | BIBB United", twitter:card="summary", BreadcrumbList JSON-LD

### 4. Twitter Card on Contact Officials
expected: /contact-officials has twitter:card and twitter:title meta tags
result: pass
verified: twitter:card="summary", twitter:title="Contact Your Officials | BIBB United"

### 5. Twitter Card on Meetings
expected: /meetings has twitter:card and twitter:title meta tags
result: pass
verified: twitter:card="summary", twitter:title="Meeting Schedule | BIBB United"

### 6. Orphaned /my-route Removed
expected: src/app/my-route/ directory no longer exists
result: pass
verified: ls returns "No such file or directory"

### 7. generateStaticParams — Null Slug Guard
expected: /news/[slug] and /[slug] routes have published filter and null slug type guard in generateStaticParams
result: pass
verified: Build completes without crashes, SSG route markers shown in build output

### 8. Sitemap Generation (with explicit config)
expected: next-sitemap generates sitemap.xml with site routes
result: pass
verified: `pnpm next-sitemap --config next-sitemap.config.cjs` generates sitemap-0.xml at https://www.bibbunited.com/

## Summary

total: 8
passed: 7
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "pnpm build completes end-to-end including postbuild sitemap generation"
  status: failed
  reason: "User reported: next-sitemap postbuild fails because it looks for next-sitemap.config.js but project has next-sitemap.config.cjs. Fix: update postbuild script to next-sitemap --config next-sitemap.config.cjs"
  severity: minor
  test: 1
  root_cause: "postbuild script in package.json runs bare `next-sitemap` which defaults to looking for next-sitemap.config.js, but the config file uses .cjs extension"
  artifacts:
    - path: "package.json"
      issue: "postbuild script missing --config flag"
    - path: "next-sitemap.config.cjs"
      issue: "Uses .cjs extension not auto-detected by next-sitemap CLI"
  missing:
    - "Change postbuild to: next-sitemap --config next-sitemap.config.cjs"
  debug_session: ""
