# Technology Stack -- v1.1 Production Polish

**Project:** BIBB United
**Milestone:** v1.1 Production Polish (25 UI/UX fixes)
**Researched:** 2026-03-24
**Scope:** No new dependencies. Configuration changes and migration patterns for existing stack.

## Installed Stack (Verified)

| Technology | Installed Version | Purpose |
|------------|------------------|---------|
| Next.js | 16.2.1 | Full-stack framework |
| React | 19.2.4 | UI rendering |
| Tailwind CSS | 4.2.2 | Utility-first CSS |
| Payload CMS | 3.80.0 | Headless CMS |
| next-sitemap | 4.2.3 | Sitemap generation |
| sharp | 0.34.2 | Image optimization |
| lucide-react | 1.0.1 | Icons |
| date-fns | 4.1.0 | Date formatting |

**Important correction:** PROJECT.md and CLAUDE.md reference "Next.js 15" but the actual installed version is **Next.js 16.2.1**. All research below is based on the actual installed version.

## No New Dependencies Required

The v1.1 milestone requires zero new npm packages. All 25 fixes use existing dependencies with configuration or code-level changes only.

---

## Migration Pattern: next/image (Issues H4)

### What Changes

Replace all `<img>` tags with `<Image>` from `next/image` for automatic WebP/AVIF conversion, responsive srcSet, lazy loading, and blur-up placeholders.

**Confidence:** HIGH (verified against Next.js 16.2.1 official docs)

### Next.js 16 Breaking Changes for Images

These are version-specific gotchas that apply to this project:

| Change | Default in 16.x | Action Needed |
|--------|-----------------|---------------|
| `images.qualities` | `[75]` only | No action -- quality 75 is appropriate for a civic content site. Only add more if editors need higher quality uploads. |
| `images.minimumCacheTTL` | 14400 (4 hours) | No action -- the 4-hour default is better than the old 60-second default. Payload media rarely changes after upload. |
| `images.imageSizes` | Removed 16px | No action -- 16px images are not used on this site. |
| `priority` prop deprecated | Use `preload` instead | Use `preload` on above-the-fold images (hero spotlight, first news card). |
| `images.localPatterns.search` | Required for query strings | Not applicable -- Payload media URLs use path-based routing, not query strings. |
| Local IP restriction | Blocked by default | May need `dangerouslyAllowLocalIP: true` for local dev if testing with `localhost`. Not needed in production. |

### Payload CMS Media and next/image Integration

Payload serves media at `/api/media/file/{filename}`. Since this is a same-origin path (not an external URL), **no `remotePatterns` configuration is needed**. The Next.js image optimizer handles same-origin paths automatically.

However, Payload also generates `imageSizes` (thumbnail: 400x300, card: 768xauto, hero: 1920xauto) at paths like `/api/media/file/{filename}-{size}.webp`. Use these pre-generated sizes with the `sizes` prop to avoid double-optimization.

### Recommended next.config.ts Changes

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false, // Also fixes L3
  // images config: defaults are good for this project
  // qualities: [75] -- fine for content site
  // minimumCacheTTL: 14400 -- fine for CMS media
}
```

### Migration Pattern by Component

**HeroSpotlight.tsx (client component):**
```typescript
import Image from 'next/image'

// Use fill + sizes for responsive hero images
<Image
  src={story.featuredImage.url}
  alt={story.featuredImage.alt || story.title}
  fill
  sizes="100vw"
  className="object-cover"
  preload={index === 0}  // Only preload first slide
/>
```

**Card.tsx (server-compatible component):**
```typescript
import Image from 'next/image'

// Use width/height for fixed-aspect cards
<Image
  src={imageSrc}
  alt={imageAlt}
  width={768}
  height={432}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="w-full h-full object-cover"
/>
```

**News article page (server component):**
```typescript
import Image from 'next/image'

// Hero image with preload for LCP
<Image
  src={post.featuredImage.url}
  alt={post.featuredImage.alt}
  width={1200}
  height={630}
  sizes="(max-width: 768px) 100vw, 800px"
  preload
  className="w-full"
/>
```

### Key Rules

1. Use `fill` when the container determines size (hero spotlight). Parent must be `position: relative`.
2. Use `width`/`height` when aspect ratio is known (cards, article heroes).
3. Always provide `sizes` prop to prevent serving oversized images on mobile.
4. Use `preload` (not the deprecated `priority`) on the LCP image of each page.
5. The `alt` prop is required -- pull from Payload's `alt` field on the Media collection.

---

## Migration Pattern: next/link (Issue H3)

### What Changes

Replace all `<a href>` for internal routes with `<Link>` from `next/link` for client-side SPA navigation.

**Confidence:** HIGH (no breaking changes to Link in Next.js 16)

### Usage in Server Components vs Client Components

`<Link>` works identically in both Server Components and Client Components in Next.js 16. No special handling needed.

### Migration Pattern

```typescript
import Link from 'next/link'

// Before
<a href="/news/some-article">Read More</a>

// After
<Link href="/news/some-article">Read More</Link>
```

### Key Rules

1. Use `<Link>` for all internal routes (starting with `/`).
2. Keep `<a>` for external URLs (starting with `http`).
3. The Card component needs conditional rendering: `<Link>` for internal `href`, `<a>` for external.
4. `<Link>` renders an `<a>` tag in the DOM -- all existing className and aria attributes transfer directly.
5. No `passHref` or `legacyBehavior` needed in Next.js 16.

### Files to Update

| File | Internal Links | Notes |
|------|---------------|-------|
| `src/components/layout/Header.tsx` | Nav items, logo | Check if href starts with `/` vs `http` |
| `src/components/layout/Footer.tsx` | Footer nav, CTA buttons | Same internal/external check |
| `src/components/ui/Button.tsx` | Button-as-link variants | Conditional Link vs a |
| `src/components/ui/Card.tsx` | Card wrapper link | Always internal (news posts) |
| `src/components/homepage/HeroSpotlight.tsx` | Story title links | Always `/news/{slug}` |
| `src/components/homepage/LatestNews.tsx` | News card links | Always internal |
| `src/app/(frontend)/news/[slug]/page.tsx` | Back links, related | Internal routes |

---

## Fix Pattern: Tailwind v4 CSS Variable Cascade (Issue C1)

### Root Cause Analysis

**Confidence:** HIGH (verified by reading the actual styles.css and understanding CSS specificity)

The `text-text-on-dark` utility class generates `color: var(--color-text-on-dark)`. This works correctly when applied directly to an element. The problem is **CSS inheritance**, not Tailwind.

The Footer component has a `bg-bg-secondary` (navy) background. Child elements like `<h2>`, `<p>`, and `<a>` do not have `text-text-on-dark` applied individually. They inherit `color` from `body`, which sets `color: var(--color-text-primary)` (#111827 -- dark gray). The child elements never see the `text-text-on-dark` variable.

This is standard CSS behavior, not a Tailwind v4 bug. The `@theme { --color-text-on-dark: initial; }` registration with `initial` is correct -- it tells Tailwind to generate the utility class. The `:root` block correctly sets the actual value.

### Fix Options (Ranked)

**Option 1 (Recommended): Use `text-white` directly**
Since `--color-text-on-dark` is `#FFFFFF` in both modes (community and urgent), replace `text-text-on-dark` with `text-white` on the Footer wrapper and ensure all children inherit white text. This is the simplest and most reliable approach.

```html
<footer class="bg-bg-secondary text-white">
  <!-- All children inherit white text -->
</footer>
```

**Option 2: Apply text color to every child element individually**
More verbose, more fragile, no benefit over Option 1.

**Option 3: Add CSS rule to force inheritance**
```css
.bg-bg-secondary { color: var(--color-text-on-dark); }
```
This couples background and text color, which may cause unexpected effects elsewhere.

### Recommendation

Use Option 1. The `text-text-on-dark` token exists for cases where you want semantic naming, but in the Footer component, `text-white` is clearer, works in both modes, and avoids the inheritance trap entirely.

---

## Fix Pattern: next-sitemap Dynamic Routes (Issue M4)

### Current Problem

The `next-sitemap.config.cjs` generates only static routes. News articles and CMS pages are not included.

**Confidence:** HIGH (verified config file, next-sitemap docs)

### Recommended Approach: additionalPaths

Use `additionalPaths` to fetch all published content from Payload's REST API at build time:

```javascript
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.bibbunited.com',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/admin/',
      },
    ],
  },
  exclude: ['/admin/*', '/api/*'],
  changefreq: 'weekly',
  priority: 0.7,

  additionalPaths: async (config) => {
    const result = []

    // Fetch news posts
    try {
      const newsRes = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/api/news-posts?limit=1000&depth=0`,
      )
      const newsData = await newsRes.json()
      if (newsData.docs) {
        for (const post of newsData.docs) {
          result.push({
            loc: `/news/${post.slug}`,
            changefreq: 'monthly',
            priority: 0.8,
            lastmod: post.updatedAt || post.createdAt,
          })
        }
      }
    } catch (e) {
      console.warn('Failed to fetch news posts for sitemap:', e)
    }

    // Fetch CMS pages
    try {
      const pagesRes = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/api/pages?limit=1000&depth=0`,
      )
      const pagesData = await pagesRes.json()
      if (pagesData.docs) {
        for (const page of pagesData.docs) {
          result.push({
            loc: `/${page.slug}`,
            changefreq: 'monthly',
            priority: 0.6,
            lastmod: page.updatedAt || page.createdAt,
          })
        }
      }
    } catch (e) {
      console.warn('Failed to fetch pages for sitemap:', e)
    }

    return result
  },

  // Fix L5: Homepage priority
  transform: async (config, path) => {
    const defaults = {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }

    if (path === '/') {
      return { ...defaults, priority: 1.0, changefreq: 'daily' }
    }
    if (path.startsWith('/news')) {
      return { ...defaults, priority: 0.8 }
    }
    return defaults
  },
}
```

### Alternative: Next.js App Router sitemap.ts

Payload's official guide recommends using Next.js's built-in `app/sitemap.ts` instead of next-sitemap. This uses Payload's Local API (no network hop) and generates the sitemap at request time. However, since the project already uses next-sitemap and it works for static routes, extending it with `additionalPaths` is less disruptive.

**Decision:** Stay with next-sitemap + `additionalPaths`. It runs at build time (postbuild script), requires no architectural change, and handles the small content volume of this site.

---

## Fix Pattern: Canonical URLs via Metadata API (Issue M2)

### Implementation

**Confidence:** HIGH (verified with Next.js 16 metadata API docs)

Next.js metadata API supports `alternates.canonical` in `generateMetadata`. Since the root layout already sets `metadataBase`, canonical URLs can use relative paths.

### Root Layout (global default)

The root layout already has `metadataBase: new URL('https://www.bibbunited.com')`. Add `alternates.canonical` to the layout-level metadata:

```typescript
export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL('https://www.bibbunited.com'),
    alternates: {
      canonical: './',  // Auto-resolves to current route path
    },
    // ... existing metadata
  }
}
```

### Per-Page Override (dynamic routes)

For news articles and CMS pages, set canonical explicitly in `generateMetadata`:

```typescript
// src/app/(frontend)/news/[slug]/page.tsx
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  return {
    alternates: {
      canonical: `/news/${slug}`,
    },
    // ... other metadata
  }
}
```

### Important: metadataBase Resolution

With `metadataBase` set to `https://www.bibbunited.com`, a canonical of `/news/some-article` resolves to `https://www.bibbunited.com/news/some-article`. This is the correct behavior.

---

## Fix Pattern: Complete Open Graph Tags (Issue M3)

### Current State

The root layout sets `og:type`, `og:site_name`, and `og:image` globally. Missing: `og:url` on most pages, `og:description` on news articles.

**Confidence:** HIGH (metadata API is well-documented)

### Implementation

Open Graph metadata merges hierarchically in Next.js. The root layout provides defaults; pages override specific fields.

**Root layout additions:**
```typescript
openGraph: {
  type: 'website',
  siteName: 'BIBB United',
  locale: 'en_US',
  images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'BIBB United' }],
},
```

**Per-page additions (news articles):**
```typescript
openGraph: {
  type: 'article',
  title: post.title,
  description: post.meta?.description || excerpt,
  url: `/news/${slug}`,
  publishedTime: post.publishDate,
  images: post.featuredImage
    ? [{ url: post.featuredImage.url, width: 1200, height: 630, alt: post.featuredImage.alt }]
    : undefined,
},
```

**Per-page additions (static pages):**
```typescript
openGraph: {
  url: `/${slug}`,
  // title and description inherit from page metadata
},
```

### og:url and canonical

`og:url` should match the canonical URL. Since both use the same slug pattern, they stay in sync automatically.

---

## Fix Pattern: Payload Media Cache Headers (Issue M9)

### The Problem

Payload 3.x runs inside Next.js -- there is no Express middleware anymore. Media files served at `/api/media/file/*` have no cache-control headers.

**Confidence:** MEDIUM (Payload 3.x removed Express middleware; the Next.js proxy approach is the recommended alternative, but official Payload docs are sparse on this specific topic)

### Recommended Approach: Next.js Proxy (was Middleware)

In Next.js 16, `middleware.ts` has been renamed to `proxy.ts`. Create a proxy that adds cache headers to media responses:

```typescript
// src/proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Add cache headers to Payload media files
  if (pathname.startsWith('/api/media/file/')) {
    const response = NextResponse.next()
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    )
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/media/file/:path*'],
}
```

**Why `immutable`:** Payload media filenames include a hash or are unique per upload. The same URL always serves the same file. One year cache with `immutable` is safe.

**Caveat:** In Next.js 16, the proxy runs in the Node.js runtime (not Edge). This is fine for self-hosted K8s. The proxy only adds a header -- it does not read the response body, so overhead is minimal.

### Alternative: Traefik-Level Caching

Since the site runs behind Traefik, you could add cache headers at the ingress level:

```yaml
# IngressRoute middleware
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: media-cache-headers
spec:
  headers:
    customResponseHeaders:
      Cache-Control: "public, max-age=31536000, immutable"
```

This avoids any Node.js processing but requires K8s manifest changes. The proxy approach is simpler for this milestone.

**Decision:** Use `proxy.ts` for now. It keeps the fix in the application layer and is easier to test.

---

## Fix Pattern: Duplicate Title Template (Issue M1)

### Root Cause

The layout template is `%s | BIBB United`. Page-level `generateMetadata` in `news/[slug]/page.tsx` returns titles like `"Article Title | BIBB United"`, producing `"Article Title | BIBB United | BIBB United"`.

**Confidence:** HIGH

### Fix

Page-level metadata should return only the page title without the suffix. The layout template adds the suffix:

```typescript
// In generateMetadata for news/[slug]/page.tsx
return {
  title: post.title,  // Not `${post.title} | BIBB United`
  // ...
}
```

Also check `[slug]/page.tsx` for the same pattern and the `generateTitle` function in `payload.config.ts` which appends ` | BIBB United` -- this is only used for Payload admin SEO preview, not for the frontend metadata.

---

## Configuration: poweredByHeader (Issue L3)

Add to `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,  // Removes X-Powered-By: Next.js header
  // ...
}
```

**Confidence:** HIGH (stable Next.js config option)

---

## Turbopack Consideration

Next.js 16 uses Turbopack by default. The current `next.config.ts` has a `webpack` configuration block (for `resolve.extensionAlias`). This means **`next build` will fail by default** in Next.js 16 because it detects a webpack config and refuses to run Turbopack with it.

The current `package.json` build script does not include `--webpack` flag. This needs investigation:
- Either the build is already using `--webpack` implicitly
- Or the `withPayload` wrapper handles this
- Or the build has been tested and works

**Action needed:** Verify that `pnpm build` succeeds. If it fails, add `--webpack` to the build script or migrate the `extensionAlias` config to Turbopack format.

**Confidence:** MEDIUM (the upgrade guide clearly states this is a breaking change, but the project is already running on 16.2.1, so it may have been resolved during initial setup)

---

## Alternatives Considered

| Fix Area | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Sitemap | next-sitemap additionalPaths | Next.js app/sitemap.ts | Already using next-sitemap; less disruptive to extend |
| Media cache | Next.js proxy.ts | Traefik middleware | Keep fix in app layer; easier to test |
| CSS variable fix | `text-white` directly | Fix @theme inheritance | Not a Tailwind bug; `text-white` is clearer |
| Image component | next/image with fill/sizes | Keep `<img>` with lazy loading | next/image provides format conversion, srcset, and optimization for free |
| OG completeness | Metadata API per-page | react-helmet / next-seo | Metadata API is built into Next.js 16; no extra dependency |

---

## Build Configuration Changes Summary

```typescript
// next.config.ts -- required changes
const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,  // NEW: Remove X-Powered-By header (L3)
  // webpack config stays as-is (or migrate to turbopack)
}
```

```javascript
// next-sitemap.config.cjs -- required changes
// Add: additionalPaths function to fetch CMS content
// Add: transform function for per-route priority
```

```typescript
// src/proxy.ts -- NEW FILE
// Add cache headers to /api/media/file/* requests
```

No changes to `package.json` dependencies. No new packages to install.

---

## Sources

- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) -- HIGH confidence, official docs
- [Next.js Image Component API Reference](https://nextjs.org/docs/app/api-reference/components/image) -- HIGH confidence, official docs
- [Next.js generateMetadata API Reference](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) -- HIGH confidence, official docs
- [next-sitemap GitHub](https://github.com/iamvishnusankar/next-sitemap) -- HIGH confidence, official repo
- [Payload CMS Community Help: Cache Headers](https://payloadcms.com/community-help/discord/adding-modifying-api-cache-headers) -- MEDIUM confidence, community discussion
- [Payload CMS Sitemap Guide](https://payloadcms.com/posts/guides/how-to-build-an-seo-friendly-sitemap-in-payload--nextjs) -- MEDIUM confidence, official guide
- [Tailwind CSS v4 Theme Documentation](https://tailwindcss.com/docs/adding-custom-styles) -- HIGH confidence, official docs
