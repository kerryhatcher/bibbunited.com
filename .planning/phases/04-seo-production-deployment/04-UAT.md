---
status: complete
phase: 04-seo-production-deployment
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md]
started: 2026-03-24T18:42:00.000Z
updated: 2026-03-24T18:48:00.000Z
---

## Current Test

[testing complete]

## Tests

### 1. Homepage — OG Meta Tags
expected: Homepage has OpenGraph title, description, and Twitter card meta tags
result: pass
verified: og:title="BIBB United -- Civic Advocacy for the BIBB Community", og:description present, twitter:card="summary_large_image"

### 2. Homepage — JSON-LD Structured Data
expected: Homepage has Organization and WebSite JSON-LD scripts
result: pass
verified: script[type="application/ld+json"] with @type=Organization and @type=WebSite

### 3. News Page — OG and JSON-LD
expected: /news page has OG meta tags and BreadcrumbList JSON-LD
result: pass
verified: og:title="News | BIBB United", twitter:card="summary", jsonLd @type=BreadcrumbList

### 4. Contact Officials — Twitter Card Meta
expected: /contact-officials has Twitter Card metadata (title and card type)
result: pass
verified: twitter:card="summary", twitter:title="Contact Your Officials | BIBB United"

### 5. Contact Officials — JSON-LD
expected: /contact-officials has BreadcrumbList JSON-LD
result: pass
verified: script[type="application/ld+json"] with @type=BreadcrumbList

### 6. Meetings — Twitter Card Meta
expected: /meetings has Twitter Card metadata
result: pass
verified: twitter:card="summary", twitter:title="Meeting Schedule | BIBB United"

### 7. Meetings — JSON-LD
expected: /meetings has BreadcrumbList JSON-LD
result: pass
verified: script[type="application/ld+json"] with @type=BreadcrumbList

### 8. Health Check Endpoint
expected: GET /api/health returns JSON with status "ok" and timestamp
result: pass
verified: {status: "ok", timestamp: "2026-03-24T18:17:03.581Z"}

### 9. OG Fallback Image
expected: Branded OG fallback image exists at public/og-default.png
result: pass
verified: File exists at public/og-default.png

### 10. JSON-LD Helper Library
expected: src/lib/jsonLd.ts exists with schema.org type helpers
result: pass
verified: File exists

### 11. next-sitemap Configuration
expected: next-sitemap.config.cjs exists for build-time sitemap generation
result: pass
verified: File exists at next-sitemap.config.cjs

### 12. Next.js Standalone Output
expected: next.config.ts has output: 'standalone' for Docker builds
result: pass
verified: Line 10: output: 'standalone'

### 13. Dockerfile — Multi-Stage Build
expected: Dockerfile uses Node.js 22 Alpine with 3 FROM stages (deps, builder, runner)
result: pass
verified: FROM node:22-alpine, 3 FROM stages

### 14. K8s Manifests — Dev and Prod
expected: ArgoCD deployment, service, ingress, and PVC manifests exist for both dev and prod
result: pass
verified: 10 YAML files in argocd/ (4 dev + 4 prod + 2 ArgoCD apps)

### 15. GitHub Actions CI/CD
expected: .github/workflows/build-deploy.yml exists for automated build and deployment
result: pass
verified: File exists

### 16. SEO Plugin — Payload Config
expected: SEO plugin wired with tabbedUI for pages and news-posts collections
result: pass
verified: Admin dashboard shows SEO tab on content types (confirmed via Payload admin panel)

## Summary

total: 16
passed: 16
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]
