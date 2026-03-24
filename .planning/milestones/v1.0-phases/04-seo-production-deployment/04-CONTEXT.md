# Phase 4: SEO & Production Deployment - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Search engine optimization (OpenGraph, Twitter Cards, JSON-LD structured data, sitemap, robots.txt), social sharing metadata with CMS-configurable overrides, Docker containerization of the Next.js + Payload app, Kubernetes deployment manifests for both dev and prod namespaces, GitHub Actions CI/CD pipeline, Cloudflare tunnel integration with admin route cache bypass, and persistent media storage. No new content types, pages, or UI components — those are complete from Phases 1-3.

</domain>

<decisions>
## Implementation Decisions

### SEO Metadata
- **D-01:** Full editor override via `@payloadcms/plugin-seo` — adds title, description, and OG image fields to Pages and NewsPosts collections. Auto-generates sensible defaults from content (title -> meta title, first paragraph -> description, featured image -> OG image), but editors can override any field.
- **D-02:** Branded fallback OG image — when no featured image or OG image override is set, use a default BIBB United branded image (logo on red/navy background). Every shared link looks intentional.
- **D-03:** Sitemap generated via `next-sitemap` package at build time. Auto-includes all published pages and posts from Next.js routes.
- **D-04:** robots.txt generated with `/admin` disallowed. Prevents search engines from indexing the CMS admin panel.

### Structured Data (JSON-LD)
- **D-05:** Full suite of JSON-LD structured data types:
  - `NewsArticle` on news posts (headline, datePublished, dateModified, author, image)
  - `Organization` site-wide (BIBB United name, url, logo)
  - `BreadcrumbList` on all pages (navigation path in search results)
  - `WebSite` on homepage (sitelinks search box potential)
  - `GovernmentOrganization` on Contact Officials page for each governing body
- **D-06:** Each official gets a `Person` schema with `name`, `jobTitle`, `email`, `telephone`, nested under their parent `GovernmentOrganization`. Richer data for local knowledge panels.

### Docker & Container Strategy
- **D-07:** Multi-stage Dockerfile — install deps, build with `output: 'standalone'`, copy to slim Node.js 22 LTS runtime image. Single container runs Next.js + Payload.
- **D-08:** Security hardening per cluster convention — non-root user (UID 65534), read-only root filesystem, dropped Linux capabilities, seccomp RuntimeDefault profile.
- **D-09:** `sharp` explicitly available in the final Docker stage for Next.js image optimization.

### Kubernetes Deployment
- **D-10:** Manifests for both `civpulse-dev` and `civpulse-prod` namespaces, organized in `argocd/dev/` and `argocd/prod/` directories at repo root.
- **D-11:** Traefik IngressRoute CRD (not standard Ingress) — cluster uses CRD-based routing with `allowCrossNamespace: true` and `web` entrypoint (port 80, no in-cluster TLS).
- **D-12:** 10Gi PersistentVolumeClaim using `local-path` storage class for media uploads directory. Survives pod restarts.
- **D-13:** Database connection via cross-namespace PostgreSQL service: `postgresql.civpulse-infra.svc.cluster.local:5432`.
- **D-14:** Secrets injected via `envFrom: secretRef` — never committed to git. Created separately with `kubectl create secret generic --from-env-file`.

### CI/CD Pipeline
- **D-15:** GitHub Actions workflow (`.github/workflows/build-deploy.yml`) — builds Docker image on push to `main`, tags with commit SHA, pushes to GHCR, updates image tag in `argocd/` manifests. ArgoCD auto-syncs the change.

### Cloudflare & Caching
- **D-16:** Primary hostname: `www.bibbunited.com`. Apex `bibbunited.com` redirects to www. Cloudflare CNAME record points www to existing tunnel UUID.
- **D-17:** Admin route cache bypass — both layers: Traefik middleware sets `Cache-Control: no-store` for `/admin/*` routes, AND Cloudflare Page Rule for `www.bibbunited.com/admin/*` to bypass cache (documented as manual step).
- **D-18:** Public page caching: `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`. Pages cached 1 minute at edge, served stale up to 5 minutes while revalidating. Static assets (JS, CSS, images) use long-lived immutable caching.

### Claude's Discretion
- Exact Dockerfile layer ordering and optimization strategy
- next-sitemap configuration details (changefreq, priority values)
- JSON-LD helper function architecture (shared component vs per-page)
- ArgoCD Application manifest structure
- Health check and readiness probe configuration
- Resource limits (CPU/memory) for dev vs prod
- Next.js middleware for www redirect vs Cloudflare redirect rule

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specs
- `.planning/PROJECT.md` — Project vision, constraints, and key decisions
- `.planning/REQUIREMENTS.md` — SEO-01 through SEO-04, DEPLOY-01 through DEPLOY-03, DEPLOY-05 requirements for this phase
- `.planning/ROADMAP.md` — Phase 4 goals and success criteria
- `CLAUDE.md` — Technology stack (Next.js 15, Payload 3.x, Tailwind v4, Docker standalone output, sharp)

### Prior Phase Context
- `.planning/phases/01-cms-foundation/01-CONTEXT.md` — Phase 1 decisions (pnpm D-14, Node 22 LTS D-15, Payload globals pattern, CTA as collection fields D-11)
- `.planning/phases/02-brand-design-system/02-CONTEXT.md` — Phase 2 decisions (dual mode urgent/community, logo wordmark for OG fallback image reference)
- `.planning/phases/03-site-pages-navigation/03-CONTEXT.md` — Phase 3 decisions (page templates, news post layout, officials collection structure for JSON-LD)

### Deployment Infrastructure
- K8s deployment guide (user-provided): `https://gist.githubusercontent.com/kerryhatcher/92d43656ace78d29366365c2a06557c4/raw/3995ed5b53b4f056ed9a286840c5f67e01696265/k8s-deployment-guide.md` — Namespace conventions, Traefik IngressRoute CRD patterns, security hardening requirements, ArgoCD GitOps conventions, CI/CD pipeline patterns, storage class, Cloudflare tunnel setup

### Technology
- Payload CMS 3.x SEO plugin documentation — `@payloadcms/plugin-seo` configuration and field generation
- Next.js 15 Metadata API — `generateMetadata()`, OpenGraph, Twitter Card, JSON-LD via `<script type="application/ld+json">`
- next-sitemap documentation — build-time sitemap and robots.txt generation
- Docker multi-stage build best practices for Next.js standalone output
- Traefik IngressRoute CRD documentation — middleware, routing, host matching
- schema.org — NewsArticle, Organization, GovernmentOrganization, Person, BreadcrumbList, WebSite types

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `@payloadcms/plugin-seo` already in package.json (^3.80.0) — needs to be wired into payload.config.ts and added to Pages/NewsPosts collections
- `src/app/(frontend)/layout.tsx` — has basic `export const metadata` object; needs to be upgraded to `generateMetadata()` for dynamic SEO
- `src/components/ui/Logo.tsx` — BIBB/UNITED wordmark; reference for generating the branded OG fallback image
- `docker-compose.dev.yml` — PostgreSQL 16 config already exists; production DATABASE_URL follows same pattern via cross-namespace service DNS
- `next.config.ts` — uses `withPayload()` wrapper; needs `output: 'standalone'` added for Docker builds

### Established Patterns
- Payload Globals pattern in `src/globals/` (UrgentBanner, SiteTheme, Navigation) — consistent config approach
- Payload Local API data fetching in `src/lib/` (getTheme, getNavigation, getHomepage, getUrgentBanner) — same pattern for SEO data fetching
- Tailwind v4 CSS-first configuration in `src/app/(frontend)/styles.css`
- Barlow Condensed (weight 700) + Inter fonts loaded via `next/font` in layout.tsx
- Dual-mode color tokens (`data-mode` attribute switching)

### Integration Points
- `src/payload.config.ts` — add `@payloadcms/plugin-seo` plugin configuration
- `src/collections/Pages.ts` and `src/collections/NewsPosts.ts` — SEO plugin adds fields to these
- `src/app/(frontend)/layout.tsx` — upgrade metadata export to dynamic `generateMetadata()`
- `src/app/(frontend)/[slug]/page.tsx` and `src/app/(frontend)/news/[slug]/page.tsx` — add per-page `generateMetadata()` and JSON-LD script tags
- `src/app/(frontend)/contact-officials/page.tsx` — add GovernmentOrganization + Person JSON-LD
- `next.config.ts` — add `output: 'standalone'`
- Root `argocd/` directory — new, for K8s manifests
- Root `Dockerfile` — new, for production container build
- Root `.github/workflows/` — new, for CI/CD pipeline

</code_context>

<specifics>
## Specific Ideas

- OG fallback image should use the BIBB United wordmark (BIBB in white, UNITED in red/crimson) on the navy background — consistent with brand identity from Phase 2
- GovernmentOrganization schema should mirror the officials grouping on the Contact page (Board of Education, County Commission, etc.) — each body is its own GovernmentOrganization with nested Person members
- The CI/CD pipeline should follow the exact pattern from the K8s deployment guide: build on push to main, tag with commit SHA, push to GHCR, update argocd/ manifests

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-seo-production-deployment*
*Context gathered: 2026-03-24*
