# Phase 4: SEO & Production Deployment - Research

**Researched:** 2026-03-24
**Domain:** SEO metadata, JSON-LD structured data, Docker containerization, Kubernetes deployment, CI/CD
**Confidence:** HIGH

## Summary

Phase 4 covers two distinct domains: (1) SEO metadata and structured data for discoverability, and (2) Docker/K8s production deployment infrastructure. Both are well-understood problems with established patterns in the Next.js and Payload CMS ecosystems.

For SEO, the `@payloadcms/plugin-seo` (already in package.json at ^3.80.0) adds editor-configurable meta fields to collections. Next.js App Router has built-in support for `generateMetadata()` (already partially used in existing pages), dynamic `sitemap.ts`, and `robots.ts` file conventions -- no need for the `next-sitemap` package. JSON-LD structured data is rendered as `<script type="application/ld+json">` tags in page components per official Next.js guidance.

For deployment, the project targets a k3s cluster (`thor`) with Traefik CRD-based ingress, ArgoCD GitOps, and Cloudflare tunnels. The K8s deployment guide provides exact patterns for manifests, CI/CD, and security hardening. The Dockerfile uses Next.js `output: 'standalone'` with multi-stage build. The directory convention from the guide uses `k8s/apps/<app>-<env>/` but CONTEXT.md specifies `argocd/dev/` and `argocd/prod/` -- user decision takes precedence.

**Primary recommendation:** Use Next.js built-in `sitemap.ts` and `robots.ts` file conventions instead of `next-sitemap` package. Wire `@payloadcms/plugin-seo` into Payload config with auto-generation functions. Follow the K8s deployment guide patterns exactly for Dockerfile, manifests, and CI/CD pipeline.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Full editor override via `@payloadcms/plugin-seo` -- adds title, description, and OG image fields to Pages and NewsPosts collections. Auto-generates sensible defaults from content.
- **D-02:** Branded fallback OG image -- BIBB United wordmark on navy background when no featured/OG image set.
- **D-03:** Sitemap generated via `next-sitemap` package at build time. Auto-includes all published pages and posts.
- **D-04:** robots.txt with `/admin` disallowed.
- **D-05:** Full suite of JSON-LD: NewsArticle, Organization, BreadcrumbList, WebSite, GovernmentOrganization.
- **D-06:** Each official gets Person schema nested under GovernmentOrganization.
- **D-07:** Multi-stage Dockerfile with `output: 'standalone'`, Node.js 22 LTS runtime.
- **D-08:** Security hardening: non-root (UID 65534), read-only root filesystem, dropped capabilities, seccomp RuntimeDefault.
- **D-09:** `sharp` available in final Docker stage.
- **D-10:** Manifests for `civpulse-dev` and `civpulse-prod` namespaces in `argocd/dev/` and `argocd/prod/`.
- **D-11:** Traefik IngressRoute CRD with `allowCrossNamespace: true` and `web` entrypoint (port 80, no in-cluster TLS).
- **D-12:** 10Gi PVC using `local-path` storage class for media uploads.
- **D-13:** Database via cross-namespace PostgreSQL: `postgresql.civpulse-infra.svc.cluster.local:5432`.
- **D-14:** Secrets via `envFrom: secretRef` -- never committed to git.
- **D-15:** GitHub Actions CI/CD: build on push to main, tag with commit SHA, push to GHCR, update argocd/ manifests.
- **D-16:** Primary hostname: `www.bibbunited.com`. Apex redirects to www. Cloudflare CNAME to tunnel.
- **D-17:** Admin route cache bypass: Traefik middleware `Cache-Control: no-store` for `/admin/*`, Cloudflare Page Rule documented as manual step.
- **D-18:** Public page caching: `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`.

### Claude's Discretion
- Exact Dockerfile layer ordering and optimization strategy
- next-sitemap configuration details (changefreq, priority values)
- JSON-LD helper function architecture (shared component vs per-page)
- ArgoCD Application manifest structure
- Health check and readiness probe configuration
- Resource limits (CPU/memory) for dev vs prod
- Next.js middleware for www redirect vs Cloudflare redirect rule

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEO-01 | OpenGraph and Twitter Card meta tags on all pages and posts | Payload SEO plugin + Next.js `generateMetadata()` with `openGraph` and `twitter` properties |
| SEO-02 | JSON-LD structured data for articles and organization | `<script type="application/ld+json">` in page components per Next.js official guide |
| SEO-03 | Auto-generated sitemap.xml | Next.js built-in `sitemap.ts` file convention (or `next-sitemap` per D-03) querying Payload Local API |
| SEO-04 | Meta descriptions configurable per page/post in CMS | `@payloadcms/plugin-seo` `meta.description` field with `generateDescription` auto-fill |
| DEPLOY-01 | Dockerized Next.js + Payload app as single container | Multi-stage Dockerfile with `output: 'standalone'`, Node 22 LTS |
| DEPLOY-02 | K8s manifests for deployment with Traefik ingress | Deployment, Service, IngressRoute CRD in `argocd/dev/` and `argocd/prod/` |
| DEPLOY-03 | Cloudflare tunnel configuration with admin route cache bypass | Traefik Middleware for `/admin/*` cache headers + documented Cloudflare Page Rule |
| DEPLOY-05 | Persistent storage for media uploads | 10Gi PVC with `local-path` storage class mounted at media directory |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @payloadcms/plugin-seo | ^3.80.0 | SEO meta fields in CMS | Already in package.json. Official Payload plugin that adds meta title/description/image to collections with editor UI. |
| next (App Router) | ^16.2.1 | Metadata API, sitemap.ts, robots.ts | Built-in `generateMetadata()`, `sitemap.ts`, `robots.ts` file conventions eliminate need for external packages. |

### Supporting (new)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| schema-dts | ^1.1.5 | TypeScript types for JSON-LD | Optional but recommended -- provides `WithContext<NewsArticle>`, `WithContext<Organization>` etc. for type-safe structured data. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Next.js built-in sitemap.ts | next-sitemap (4.2.3) | D-03 specifies next-sitemap. However, Next.js 15+ has native `sitemap.ts` that queries Payload at request time (always fresh) vs next-sitemap's post-build approach. **Recommendation: Use Next.js built-in `sitemap.ts` -- it is simpler (no extra package, no postbuild script) and dynamically includes new content without rebuilds.** The planner should note this deviation from D-03 and use the built-in approach. |

**Installation:**
```bash
# schema-dts is optional -- only if type-safe JSON-LD is desired
pnpm add schema-dts
# next-sitemap only if sticking with D-03 literally
pnpm add next-sitemap
```

**Note on next-sitemap vs built-in:** D-03 specifies `next-sitemap`, but the Next.js App Router now has a native `app/sitemap.ts` convention that generates sitemaps dynamically by querying Payload's Local API. This is simpler (no postbuild script, no config file, always up-to-date) and is the current recommended approach. The planner should decide which to use -- both work, but the built-in approach has fewer moving parts.

## Architecture Patterns

### Recommended Project Structure (new files only)
```
src/
  app/
    sitemap.ts                    # Dynamic sitemap from Payload data
    robots.ts                     # robots.txt with /admin disallowed
    (frontend)/
      layout.tsx                  # MODIFY: upgrade metadata to generateMetadata
      page.tsx                    # MODIFY: add Organization + WebSite JSON-LD
      [slug]/
        page.tsx                  # MODIFY: add OG metadata + BreadcrumbList JSON-LD
      news/
        [slug]/
          page.tsx                # MODIFY: add OG + NewsArticle + BreadcrumbList JSON-LD
      contact-officials/
        page.tsx                  # MODIFY: add GovernmentOrganization + Person JSON-LD
      meetings/
        page.tsx                  # MODIFY: add BreadcrumbList JSON-LD
  lib/
    jsonLd.ts                     # JSON-LD helper functions (shared)
  payload.config.ts               # MODIFY: add seoPlugin to plugins array
  collections/
    Pages.ts                      # MODIFY: (plugin auto-adds meta fields)
    NewsPosts.ts                  # MODIFY: (plugin auto-adds meta fields)
Dockerfile                        # NEW: multi-stage production build
.dockerignore                     # NEW: exclude dev files from build context
.github/
  workflows/
    build-deploy.yml              # NEW: CI/CD pipeline
argocd/
  dev/
    deployment.yaml
    service.yaml
    ingress.yaml
    pvc.yaml
  prod/
    deployment.yaml
    service.yaml
    ingress.yaml
    pvc.yaml
  bibbunited-dev-app.yaml         # ArgoCD Application
  bibbunited-prod-app.yaml        # ArgoCD Application
next.config.ts                    # MODIFY: add output: 'standalone'
public/
  og-default.png                  # NEW: branded fallback OG image (1200x630)
```

### Pattern 1: Payload SEO Plugin Configuration
**What:** Wire `@payloadcms/plugin-seo` into `payload.config.ts` with auto-generation functions
**When to use:** Once, in payload.config.ts
**Example:**
```typescript
// Source: https://payloadcms.com/docs/plugins/seo
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { GenerateTitle, GenerateDescription, GenerateURL } from '@payloadcms/plugin-seo/types'
import type { Page, NewsPost } from './payload-types'

const generateTitle: GenerateTitle<Page | NewsPost> = ({ doc }) =>
  doc?.title ? `${doc.title} | BIBB United` : 'BIBB United'

const generateDescription: GenerateDescription<Page | NewsPost> = ({ doc }) => {
  // For news posts, could extract first ~160 chars from body
  // For pages, extract from content
  return doc?.title ? `${doc.title} - BIBB United civic advocacy` : ''
}

const generateURL: GenerateURL<Page | NewsPost> = ({ doc, collectionSlug }) => {
  const slug = doc?.slug || ''
  if (collectionSlug === 'news-posts') return `https://www.bibbunited.com/news/${slug}`
  return `https://www.bibbunited.com/${slug}`
}

export default buildConfig({
  // ... existing config
  plugins: [
    seoPlugin({
      collections: ['pages', 'news-posts'],
      uploadsCollection: 'media',
      generateTitle,
      generateDescription,
      generateURL,
      tabbedUI: true, // Adds SEO tab in admin, cleaner editor UX
    }),
  ],
})
```

### Pattern 2: generateMetadata with Payload SEO Data
**What:** Use Payload SEO meta fields in Next.js `generateMetadata()`
**When to use:** Every dynamic page route
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/getting-started/metadata-and-og-images
import type { Metadata } from 'next'
import type { Media } from '@/payload-types'

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  const page = result.docs[0]
  if (!page) return { title: 'Not Found' }

  const ogImage = typeof page.meta?.image === 'object'
    ? (page.meta.image as Media)?.url
    : null

  return {
    title: page.meta?.title || `${page.title} | BIBB United`,
    description: page.meta?.description || undefined,
    openGraph: {
      title: page.meta?.title || page.title,
      description: page.meta?.description || undefined,
      url: `https://www.bibbunited.com/${page.slug}`,
      siteName: 'BIBB United',
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630 }]
        : [{ url: 'https://www.bibbunited.com/og-default.png', width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.meta?.title || page.title,
      description: page.meta?.description || undefined,
      images: ogImage ? [ogImage] : ['https://www.bibbunited.com/og-default.png'],
    },
  }
}
```

### Pattern 3: JSON-LD Structured Data
**What:** Render JSON-LD as script tags in page components
**When to use:** Every page, with type-specific schemas
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/guides/json-ld
// src/lib/jsonLd.ts -- shared helper

export function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  // Uses the XSS-safe pattern from Next.js official docs:
  // replacing < with unicode escape to prevent script injection
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

// NewsArticle schema for news posts
export function newsArticleJsonLd(post: {
  title: string
  slug: string
  publishDate: string
  updatedAt: string
  authorName: string
  imageUrl?: string
  description?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    datePublished: post.publishDate,
    dateModified: post.updatedAt,
    author: { '@type': 'Person', name: post.authorName },
    publisher: {
      '@type': 'Organization',
      name: 'BIBB United',
      url: 'https://www.bibbunited.com',
    },
    mainEntityOfPage: `https://www.bibbunited.com/news/${post.slug}`,
    ...(post.imageUrl && { image: post.imageUrl }),
    ...(post.description && { description: post.description }),
  }
}

// Organization schema for site-wide use
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BIBB United',
    url: 'https://www.bibbunited.com',
  }
}

// BreadcrumbList for navigation context in search results
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
```

### Pattern 4: Next.js Built-in Sitemap
**What:** Dynamic sitemap from Payload data using App Router file convention
**When to use:** `app/sitemap.ts` at the root of the app directory
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
import type { MetadataRoute } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const BASE_URL = 'https://www.bibbunited.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config: configPromise })

  const pages = await payload.find({
    collection: 'pages',
    limit: 1000,
    select: { slug: true, updatedAt: true },
  })

  const posts = await payload.find({
    collection: 'news-posts',
    limit: 1000,
    select: { slug: true, updatedAt: true },
  })

  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${BASE_URL}/contact-officials`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${BASE_URL}/meetings`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
  ]

  const pageEntries = pages.docs.map((page) => ({
    url: `${BASE_URL}/${page.slug}`,
    lastModified: new Date(page.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const postEntries = posts.docs.map((post) => ({
    url: `${BASE_URL}/news/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...pageEntries, ...postEntries]
}
```

### Pattern 5: Dockerfile Multi-Stage Build
**What:** Production Docker image for Next.js + Payload standalone
**When to use:** Root `Dockerfile`
**Example:**
```dockerfile
# Stage 1: Install dependencies
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build application
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Build args for build-time env vars
ARG DATABASE_URI
ARG PAYLOAD_SECRET
RUN pnpm build

# Stage 3: Production runtime
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Security: non-root user
RUN addgroup --system --gid 65534 appgroup && \
    adduser --system --uid 65534 appuser

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create writable dirs for media uploads and Next.js cache
RUN mkdir -p /app/media /app/.next/cache && \
    chown -R appuser:appgroup /app/media /app/.next/cache

USER appuser
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Pattern 6: Traefik IngressRoute CRD
**What:** CRD-based routing for the K8s cluster
**When to use:** Per-environment ingress configuration
**Example:**
```yaml
# Source: K8s deployment guide
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: bibbunited
  namespace: civpulse-prod
spec:
  entryPoints:
    - web
  routes:
    - match: Host(`www.bibbunited.com`)
      kind: Rule
      services:
        - name: bibbunited
          port: 3000
      middlewares:
        - name: admin-no-cache
          namespace: civpulse-prod
```

### Anti-Patterns to Avoid
- **Using next/script for JSON-LD:** JSON-LD is not executable code; use native `<script>` tag, not `next/script` which is for JavaScript optimization.
- **Hardcoding meta descriptions in page components:** Use Payload SEO plugin fields so editors can override without code changes.
- **Running Payload migrations in the Dockerfile:** Migrations should run as an init container or pre-deploy step, not baked into the image.
- **Committing secrets to argocd/ manifests:** Use `kubectl create secret generic --from-env-file` and reference via `secretRef`.
- **Using `websecure` Traefik entrypoint:** This cluster terminates TLS at Cloudflare edge; use `web` (port 80) only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SEO meta fields in CMS | Custom Payload fields for title/description/image | `@payloadcms/plugin-seo` | Plugin adds admin UI with character counters, previews, auto-generation -- significant UX work to replicate |
| Sitemap generation | Manual XML construction | `app/sitemap.ts` (Next.js built-in) | Framework convention handles XML formatting, caching, content-type headers automatically |
| robots.txt | Static file in public/ | `app/robots.ts` (Next.js built-in) | Programmatic control, can reference sitemap URL dynamically |
| OG image generation | Static image creation tool | `opengraph-image.tsx` (Next.js ImageResponse) | If dynamic OG images are needed later; for now, static fallback is sufficient |
| Docker layer caching | Manual cache management | Multi-stage build with `--frozen-lockfile` | Docker layer cache handles dependency caching automatically when package files don't change |
| K8s manifest templating | Helm charts or Kustomize | Plain YAML manifests | Site is simple enough that raw manifests are clearer; the deployment guide uses plain YAML |

**Key insight:** Both SEO and deployment are mature, well-trodden paths. The value is in correct configuration, not custom code.

## Common Pitfalls

### Pitfall 1: Payload SEO Plugin Field Conflicts
**What goes wrong:** Adding the SEO plugin to a collection that already has a `meta` field causes field name collision.
**Why it happens:** The plugin creates a `meta` group field with `title`, `description`, `image` subfields.
**How to avoid:** Verify neither Pages nor NewsPosts has an existing field named `meta`. (Checked: they do not.)
**Warning signs:** TypeScript errors about duplicate field names, missing SEO fields in admin UI.

### Pitfall 2: Missing `output: 'standalone'` in next.config.ts
**What goes wrong:** Docker image is massive (2GB+) because it includes full `node_modules`.
**Why it happens:** Without `standalone` output, `next start` requires the entire `node_modules` directory.
**How to avoid:** Add `output: 'standalone'` to `nextConfig` object before the `withPayload()` wrapper.
**Warning signs:** Docker image > 500MB, `node_modules` in final layer.

### Pitfall 3: sharp Not Available in Production Container
**What goes wrong:** Image optimization fails with "sharp not found" errors in production.
**Why it happens:** `sharp` has native binaries that must match the container's architecture. The standalone output may not include it.
**How to avoid:** Ensure `sharp` is installed during the build stage with the same architecture as the runtime stage. Both stages should use `node:22-alpine`.
**Warning signs:** 500 errors on `next/image` optimized images in production.

### Pitfall 4: Read-Only Root Filesystem with Next.js
**What goes wrong:** App crashes on startup because Next.js needs to write to `.next/cache/` and Payload needs media upload directory.
**Why it happens:** Security hardening sets `readOnlyRootFilesystem: true`.
**How to avoid:** Mount `emptyDir` volumes for `.next/cache` and the media upload directory in the K8s deployment manifest.
**Warning signs:** `EACCES` or `EROFS` errors in pod logs.

### Pitfall 5: Build-Time Environment Variables for Payload
**What goes wrong:** Build fails because `DATABASE_URI` and `PAYLOAD_SECRET` are not available during `pnpm build`.
**Why it happens:** Payload generates types and runs config validation at build time, requiring database connection info.
**How to avoid:** Pass build-time env vars as Docker `ARG` + `ENV` during the build stage. Use a dummy/build database or ensure the real database is accessible from CI.
**Warning signs:** Build errors about missing `DATABASE_URI` or connection failures.

### Pitfall 6: Sitemap Not Including Dynamic CMS Content
**What goes wrong:** Sitemap only includes static routes, missing CMS pages and news posts.
**Why it happens:** Static `sitemap.xml` doesn't query Payload; or `next-sitemap` postbuild doesn't have database access.
**How to avoid:** Use `app/sitemap.ts` with Payload Local API queries (runs at request time, always fresh).
**Warning signs:** sitemap.xml only shows hardcoded routes.

### Pitfall 7: ArgoCD Infinite Loop from CI Manifest Updates
**What goes wrong:** CI pushes manifest changes, ArgoCD syncs, triggers another CI run, creating an infinite loop.
**Why it happens:** CI workflow updates image tags in argocd/ manifests and commits to main.
**How to avoid:** Use `[skip ci]` in the commit message from the CI workflow. The K8s deployment guide already specifies this pattern.
**Warning signs:** Rapid succession of GitHub Actions runs.

### Pitfall 8: Admin Routes Served from Cache
**What goes wrong:** Editors see stale admin pages, login doesn't work, or CSRF issues.
**Why it happens:** Cloudflare and/or Traefik cache `/admin` responses.
**How to avoid:** Two-layer bypass: Traefik Middleware sets `Cache-Control: no-store` on `/admin/*` routes, and Cloudflare Page Rule bypasses cache for `www.bibbunited.com/admin/*`.
**Warning signs:** Admin panel shows "loading" forever, or editors see each other's sessions.

## Code Examples

### robots.ts (Next.js Built-in)
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/admin/',
      },
    ],
    sitemap: 'https://www.bibbunited.com/sitemap.xml',
  }
}
```

### GovernmentOrganization + Person JSON-LD
```typescript
// For the Contact Officials page
// Group officials by body, create GovernmentOrganization with nested Person members
export function governmentOrgJsonLd(
  bodyName: string,
  officials: { name: string; role: string; email?: string; phone?: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: bodyName,
    member: officials.map((o) => ({
      '@type': 'Person',
      name: o.name,
      jobTitle: o.role,
      ...(o.email && { email: `mailto:${o.email}` }),
      ...(o.phone && { telephone: o.phone }),
    })),
  }
}
```

### K8s Deployment Manifest (prod)
```yaml
# argocd/prod/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bibbunited
  namespace: civpulse-prod
  labels:
    app: bibbunited
spec:
  replicas: 1
  selector:
    matchLabels:
      app: bibbunited
  template:
    metadata:
      labels:
        app: bibbunited
    spec:
      automountServiceAccountToken: false
      containers:
        - name: bibbunited
          image: ghcr.io/kerryhatcher/bibbunited.com:latest
          ports:
            - containerPort: 3000
          envFrom:
            - secretRef:
                name: bibbunited-secrets
          env:
            - name: NODE_ENV
              value: production
            - name: NEXT_TELEMETRY_DISABLED
              value: "1"
          volumeMounts:
            - name: media
              mountPath: /app/media
            - name: nextjs-cache
              mountPath: /app/.next/cache
            - name: tmp
              mountPath: /tmp
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
          securityContext:
            runAsUser: 65534
            runAsNonRoot: true
            readOnlyRootFilesystem: true
            allowPrivilegeEscalation: false
            capabilities:
              drop:
                - ALL
            seccompProfile:
              type: RuntimeDefault
      volumes:
        - name: media
          persistentVolumeClaim:
            claimName: bibbunited-media
        - name: nextjs-cache
          emptyDir: {}
        - name: tmp
          emptyDir: {}
```

### GitHub Actions CI/CD Workflow
```yaml
# .github/workflows/build-deploy.yml
name: Build and Deploy
on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      packages: write
    steps:
      - uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:sha-${{ github.sha }}
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
          build-args: |
            DATABASE_URI=${{ secrets.BUILD_DATABASE_URI }}
            PAYLOAD_SECRET=${{ secrets.BUILD_PAYLOAD_SECRET }}

      - name: Update image tag in manifests
        run: |
          NEW_TAG="sha-${{ github.sha }}"
          sed -i "s|image: .*bibbunited.*|image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${NEW_TAG}|" argocd/dev/deployment.yaml
          sed -i "s|image: .*bibbunited.*|image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${NEW_TAG}|" argocd/prod/deployment.yaml

      - name: Commit manifest changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add argocd/
          git diff --staged --quiet || git commit -m "deploy: update image to sha-${{ github.sha }} [skip ci]"
          git push
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `next-sitemap` postbuild | `app/sitemap.ts` built-in | Next.js 13.3+ (2023) | No extra package, dynamic content always included |
| Manual `robots.txt` in `public/` | `app/robots.ts` built-in | Next.js 13.3+ (2023) | Programmatic control, references sitemap automatically |
| Payload 2.x separate Express server | Payload 3.x inside Next.js | Late 2024 | Single container, shared process |
| `next/head` for meta tags | `generateMetadata()` / `metadata` export | Next.js 13+ (App Router) | Server-side, streaming support, type-safe |

**Deprecated/outdated:**
- `next-seo` package: Replaced by Next.js built-in Metadata API
- `next/head` component: App Router uses `generateMetadata()` instead
- Payload 2.x Express patterns: Do not follow 2.x deployment guides

## Open Questions

1. **Build-time database access for Docker**
   - What we know: Payload needs DATABASE_URI at build time to generate types and validate config
   - What's unclear: Whether CI/CD can reach the cluster PostgreSQL, or if a dummy URI works for build
   - Recommendation: Test if `pnpm build` succeeds with a dummy `DATABASE_URI`. If not, the CI workflow needs network access to the database or a separate build database.

2. **Payload migrations in production**
   - What we know: Payload uses Drizzle migrations. `payload migrate` runs pending migrations.
   - What's unclear: Whether to run migrations as a K8s init container or a manual pre-deploy step
   - Recommendation: Use an init container that runs `pnpm payload migrate` before the main container starts. This ensures the database schema is current on every deployment.

3. **www redirect mechanism**
   - What we know: D-16 says apex `bibbunited.com` redirects to `www.bibbunited.com`
   - What's unclear: Whether to handle via Cloudflare Page Rule (simplest) or Next.js middleware
   - Recommendation: Use Cloudflare Page Rule for apex-to-www redirect. It is simpler, faster (edge-level), and does not require Next.js to handle the redirect.

4. **Health check endpoint**
   - What we know: K8s needs liveness/readiness probes
   - What's unclear: Whether Next.js/Payload exposes a built-in health endpoint
   - Recommendation: Create a simple `app/api/health/route.ts` that returns 200 OK. Optionally check database connectivity for readiness.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | Yes | 22.16.0 | -- |
| pnpm | Package management | Yes | 10.32.1 | -- |
| Docker | Container build | Yes | 29.3.0 | -- |
| kubectl | K8s manifest apply | No | -- | Apply manifests via ArgoCD GitOps (no direct kubectl needed) |
| gh CLI | CI/CD setup | Yes | 2.87.3 | -- |
| ArgoCD CLI | App manifest apply | No | -- | Apply via ArgoCD UI or admin with cluster access (manual step) |

**Missing dependencies with no fallback:**
- None -- kubectl and ArgoCD CLI are not needed for development. K8s manifests are committed to git and ArgoCD syncs them automatically.

**Missing dependencies with fallback:**
- kubectl: Not installed locally, but not needed. Manifests are applied via ArgoCD GitOps.
- ArgoCD CLI: Not installed locally. ArgoCD Application manifests can be applied via the ArgoCD web UI or by an admin with cluster access.

## Sources

### Primary (HIGH confidence)
- [Next.js JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld) - Official pattern for structured data in App Router (v16.2.1)
- [Next.js Metadata and OG Images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) - generateMetadata, OpenGraph, Twitter Card patterns (v16.2.1)
- [Next.js sitemap.xml File Convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) - Built-in sitemap generation (v16.2.1)
- [Payload CMS SEO Plugin](https://payloadcms.com/docs/plugins/seo) - Plugin configuration, field components, generation functions
- [Payload SEO Plugin Source](https://github.com/payloadcms/payload/blob/main/docs/plugins/seo.mdx) - Detailed plugin options and TypeScript types
- [K8s Deployment Guide](https://gist.githubusercontent.com/kerryhatcher/92d43656ace78d29366365c2a06557c4/raw/3995ed5b53b4f056ed9a286840c5f67e01696265/k8s-deployment-guide.md) - Cluster-specific conventions, Traefik CRD, ArgoCD patterns, security hardening

### Secondary (MEDIUM confidence)
- [schema.org NewsArticle](https://schema.org/NewsArticle) - Structured data types for news content
- [schema.org GovernmentOrganization](https://schema.org/GovernmentOrganization) - Structured data for government bodies
- Multiple WebSearch results on Next.js Docker standalone patterns - Confirm multi-stage build approach

### Tertiary (LOW confidence)
- next-sitemap npm package (v4.2.3) - Referenced in D-03 but may be unnecessary given built-in support

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages already in package.json or are built-in Next.js features
- Architecture: HIGH - Patterns verified against official docs (Next.js 16.2.1, Payload 3.80.0)
- Deployment: HIGH - K8s deployment guide provides cluster-specific conventions
- Pitfalls: HIGH - Well-documented issues from official docs and community
- JSON-LD schemas: MEDIUM - Schema.org types are stable but validation should be tested

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (30 days -- stable ecosystem, no fast-moving components)
