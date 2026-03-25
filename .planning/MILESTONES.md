# Milestones

## v1.1 Production Polish (Shipped: 2026-03-25)

**Phases completed:** 6 phases, 14 plans, 28 tasks

**Key accomplishments:**

- Optional displayName field on Users with DB migration, plus Next.js cache headers and X-Powered-By suppression
- Complete seed rewrite with 6 colorful labeled images, branded OG image, populated Navigation/Homepage globals, 4 Officials, 3 Meetings, and user displayName
- Migrated all internal <a> tags to next/link for SPA navigation and all <img> tags to next/image with AVIF/WebP format optimization across 10 files
- Full-contrast footer copyright text (VIS-01) and mobile menu inert/focus-trap for keyboard accessibility (A11Y-03)
- Skip-to-content link, sr-only homepage H1, and accent-colored focus rings on footer for WCAG 2.1 AA keyboard and screen reader support
- Active navigation indicators with aria-current and conditional Footer CTA that hides buttons linking to the current page
- Article bylines with displayName fallback, news card excerpts via Lexical text extraction, and actionable empty states for civic pages
- Shared generatePageMeta helper with canonical URLs, complete OG tags, and 4-level fallback image chain across all 7 page routes
- Native App Router sitemap.ts and robots.ts replace next-sitemap, querying Payload for all published news and pages with tiered priority (homepage 1.0, civic pages 0.8, news 0.7)
- Lighthouse, axe-core, and admin audit specs covering 6 public routes with 95+ thresholds and zero-violation accessibility assertions
- Full regression and audit suite execution across 6 routes x 5 viewports revealing footer color contrast as single accessibility blocker and news article null-safety bug as application error
- Fixed 3 audit verification gaps: footer WCAG AA contrast (white on navy 11.07:1), null author crash guard, and CMS page SEO description fallback
- All 61 automated quality checks pass with perfect scores: 30 Lighthouse tests at 100/100/100/100, 30 axe-core tests with zero WCAG violations, admin login verified
- Fixed Contact Officials seed URL from /officials to /contact-officials and corrected all documentation drift in REQUIREMENTS.md and ROADMAP.md

---

## v1.0 MVP (Shipped: 2026-03-24)

**Phases completed:** 8 phases, 18 plans, 35 tasks

**Key accomplishments:**

- Payload CMS 3.x project with PostgreSQL adapter, Media collection (3 image sizes), and reusable slug/CTA fields for content collections
- Lexical editor with PullQuote/Callout/Embed blocks, Pages and NewsPosts collections with draft/publish workflow, auto-slug, and CTA fields
- UrgentBanner global with on/off toggle, conditional message/link fields, and full CMS admin panel verified
- Tailwind v4 CSS-first design tokens with dual-mode color switching (community/urgent), Barlow Condensed + Inter font loading, and SiteTheme Payload Global for editorial mode control
- CMS-managed navigation with sticky header (desktop dropdowns + mobile hamburger), CTA footer, urgent banner, Officials/Meetings collections, and print CSS
- Shared content components (RichTextRenderer, DateDisplay, PrintButton) and page routes for news articles at /news/[slug] and static pages at /[slug] with Lexical rich text rendering, date freshness signals, and print support
- CMS-driven homepage with hero spotlight carousel, latest news layout, topic callouts, plus Contact Officials and Meeting Schedule civic action pages
- Payload SEO plugin with auto-generation for pages/news-posts, next-sitemap for build-time sitemap/robots.txt, branded OG fallback image, and standalone output for Docker
- OpenGraph/Twitter Card meta tags on all 6 page routes with JSON-LD structured data (NewsArticle, Organization, WebSite, BreadcrumbList, GovernmentOrganization) for search engine rich snippets
- Multi-stage Dockerfile with Node.js 22 Alpine, K8s manifests for dev/prod with Traefik IngressRoute routing, and GitHub Actions CI/CD pipeline pushing to GHCR
- Null-safe generateStaticParams with published filter and complete Twitter Card coverage on all pages
- Server-rendered /news listing page with responsive card grid, OG/Twitter metadata, and breadcrumb JSON-LD resolving dead "View All News" link
- Playwright e2e tests verifying responsive layout at 5 viewports (320-1440px) across all 6 public routes with DOM overflow/clipping assertions and screenshot evidence
- 3-source cross-reference of all 26 v1 requirements confirmed satisfied after fixing SUMMARY.md frontmatter gaps and Phase 3 VERIFICATION.md body/frontmatter mismatch
- WCAG AA Footer contrast fix, absolute-path Media staticDir, and dynamic homepage OG image with absolute URL
- Deployment runbook documenting Cloudflare DNS setup, Docker build PostgreSQL requirement, JSON-LD validation, media persistence, and environment variables
- Payload CMS seed script populating 3 pages + 3 news posts enabling all 160 Playwright tests to pass with zero skips; runtime browser verification of fonts, mode switching, and focus rings

---
