# Architecture Patterns

**Domain:** Production polish fixes for existing civic advocacy website (v1.1)
**Researched:** 2026-03-24
**Confidence:** HIGH (based on direct codebase analysis + established patterns)

## Current Architecture Summary

The site is a **shipped v1.0** running Next.js 15 + React 19 + Payload CMS 3.x + Tailwind v4 in a single-process architecture. All 25 UI/UX fixes integrate with existing code -- no new services, no architectural changes, no new dependencies.

### Component Map (Files Needing Changes)

```
src/
  app/(frontend)/
    layout.tsx .............. Metadata template, skip-link, pt-16 removal
    page.tsx ................ Homepage H1 addition
    styles.css .............. Footer color token investigation
    news/
      page.tsx .............. next/link + next/image migration, excerpt display
      [slug]/page.tsx ....... Metadata dedup, next/image, displayName byline
    [slug]/page.tsx ......... Metadata dedup
    contact-officials/
      page.tsx .............. next/image for official photos, empty state text
    meetings/page.tsx ....... Empty state text
  collections/
    Users.ts ................ Add displayName field
    NewsPosts.ts ............ (optional) Add excerpt field
  components/
    layout/
      Header.tsx ............ next/link migration, active indicator, focus trap fix
      Footer.tsx ............ Color fix, next/link migration, self-link suppression, focus rings
    ui/
      Card.tsx .............. next/link + next/image migration
      Button.tsx ............ next/link migration (when href is internal)
    homepage/
      HeroSpotlight.tsx ..... next/image migration, empty state fallback
      LatestNews.tsx ........ next/link + next/image migration
  seed.ts ................... Nav data, hero data, better images, alt text
  next.config.ts ............ poweredByHeader: false, images config
  next-sitemap.config.cjs ... Dynamic routes, priority config
public/
  og-default.png ............ New asset (1200x630 branded image)
```

## Integration Points Analysis

### 1. next/image with Payload CMS Media (H4)

**Current state:** All images use `<img src={media.url}>` where `media.url` is a relative path like `/api/media/file/seed-test-image.jpg`.

**Integration concern:** `next/image` requires either known remote domains or local paths. Payload CMS 3.x serves media through its own API route handler at `/api/media/file/*`. These are local URLs (same origin), so `next/image` handles them without `remotePatterns` config.

**Required changes:**

1. **next.config.ts** -- No `remotePatterns` needed since media is same-origin. However, add `images` config to be explicit:
   ```typescript
   const nextConfig: NextConfig = {
     output: 'standalone',
     poweredByHeader: false,  // L3 fix
     // images config is optional for same-origin but good for clarity
   }
   ```

2. **Payload media sizes already exist** -- The Media collection defines `thumbnail` (400x300), `card` (768xauto), and `hero` (1920xauto). These map directly to `next/image` `sizes` prop values. Use `media.sizes.card.url` for card images and `media.sizes.hero.url` for hero images rather than the full-size original.

3. **Component changes** -- Each component using `<img>` needs migration:
   - `Card.tsx`: Change `imageSrc: string` prop to accept width/height or use `fill` with a sized container
   - `HeroSpotlight.tsx`: Use `fill` with `priority` (above the fold)
   - `LatestNews.tsx`: Use explicit `width`/`height` for thumbnails
   - `news/[slug]/page.tsx`: Use `fill` for hero image
   - `contact-officials/page.tsx`: Use explicit 80x80 for official photos

4. **Server vs Client component concern:** `HeroSpotlight.tsx` is `'use client'` (for carousel state). `next/image` works in both server and client components -- no issue here. The `Image` component is a regular React component, not a server-only API.

5. **The `sizes` prop matters for performance.** Without it, `next/image` generates srcset but the browser does not know which to pick until layout completes. Key `sizes` values:
   - Hero: `100vw` (full width)
   - Featured card: `(min-width: 1024px) 66vw, 100vw` (2/3 on desktop, full on mobile)
   - Small card: `(min-width: 640px) 50vw, (min-width: 1024px) 33vw, 100vw`
   - Thumbnail: `64px` (fixed small)
   - Official photo: `80px` (fixed small)

### 2. next/link in Server vs Client Components (H3)

**Current state:** All navigation uses `<a href>`. The Header is `'use client'` (for mobile menu state management). Footer, Card, Button, LatestNews, and all page-level components are server components.

**Integration concern:** `next/link` works identically in both server and client components. The `Link` component handles client-side navigation via the Next.js router.

**Key detail for Header.tsx:** The Header is a client component that receives `navItems` as props from the server layout. It currently builds `<a>` tags via a `renderLink()` helper and inline JSX. The migration must:
- Import `Link` from `next/link`
- Replace `<a href={href}>` with `<Link href={href}>` for internal links
- Keep `<a>` for external links (when `item.type === 'external'` or `item.newTab === true`)
- The `renderLink()` function needs a conditional: external links stay as `<a>`, internal links become `<Link>`

**Key detail for Button.tsx:** The `Button` component renders `<a href={href}>` when `href` is provided. This should become `<Link>` for internal hrefs. Since `Button` is used in both server and client components (Footer uses it, page-level CTAs use it), the component itself does NOT need `'use client'` -- `Link` works in server components.

**Key detail for Footer.tsx:** The Footer is a server component. Hardcoded hrefs (`/about`, `/news`, `/contact-officials`, `/meetings`) are straightforward `<Link>` replacements. The `Button` component hrefs are also internal.

**Active page indicator (M8):** Requires knowing the current pathname in the Header. Since Header is a client component, use `usePathname()` from `next/navigation`. Compare `pathname` against each nav item's resolved href to apply `aria-current="page"` and accent styling. The Footer self-link suppression (L1) also needs pathname -- but Footer is a server component. Options:
- Pass pathname from layout (layout does not have pathname in server context easily)
- Convert Footer's CTA section to a client component wrapper
- Use `headers()` from `next/headers` to read the request URL in the server component

**Recommendation:** Use `usePathname()` in Header (already client). For Footer self-link (L1), wrap only the CTA buttons in a small client component (`FooterCTA`) that uses `usePathname()` -- keep the rest of Footer as a server component.

### 3. Tailwind v4 @theme Token Cascade (C1)

**Current state:** The footer uses `text-text-on-dark` but child elements inherit `color: var(--color-text-primary)` from `body` instead. The `@theme { --color-text-on-dark: initial; }` registers the token with Tailwind but does not set a CSS value -- that happens in `:root { --color-text-on-dark: #FFFFFF; }`.

**Root cause analysis:** Tailwind v4's `@theme initial` declarations register utility classes but set the CSS custom property to `initial` (the CSS keyword). The `:root` block then sets the actual value. The `text-text-on-dark` utility generates `color: var(--color-text-on-dark)`. This resolves correctly when applied directly to an element. BUT -- child elements that do NOT have `text-text-on-dark` applied inherit `color` from `body`, which is `var(--color-text-primary)` (dark gray).

**The fix is simple:** The footer's parent `<footer>` has `text-text-on-dark`, which correctly sets `color: white` on that element. But child elements like `<h2>`, `<p>`, `<a>` inherit the `color` from `body` via CSS cascade because they do not have their own `text-*` class. The body sets `color: var(--color-text-primary)` in `styles.css` line 69.

**Solution:** Replace `text-text-on-dark` with `text-white` on the footer element AND ensure all child elements either inherit (which they will if the parent is `text-white` and nothing overrides it) or have explicit `text-white` classes. The current issue is that Tailwind v4's utility `text-text-on-dark` might not cascade the same way due to specificity layers. Using `text-white` (a standard Tailwind utility, not a custom token) bypasses the @theme cascade issue entirely.

**No CSS file changes needed** -- this is a component-level fix in `Footer.tsx`.

### 4. Next.js Metadata API -- Layout vs Page Level (M1, M2, M3)

**Current state:**
- Layout (`layout.tsx`) defines a template: `title: { default: 'BIBB United', template: '%s | BIBB United' }`
- Individual pages (e.g., `news/[slug]/page.tsx`) return `title: 'Article Title | BIBB United'`
- Result: `Article Title | BIBB United | BIBB United` (double suffix)

**The fix pattern:**
- Page-level `generateMetadata` should return just the page-specific title: `title: 'Article Title'`
- The layout template handles the suffix: `%s | BIBB United` produces `Article Title | BIBB United`
- Pages that want to override the template entirely can use `title: { absolute: 'Full Custom Title' }`

**Canonical URLs (M2):** Add `alternates.canonical` in each page's `generateMetadata`:
```typescript
return {
  alternates: {
    canonical: `https://www.bibbunited.com/news/${slug}`,
  },
}
```
Or set a base canonical in the layout and let pages override with their specific path.

**Open Graph completeness (M3):** The layout already sets `og:site_name` and default `og:image`. Pages need to add:
- `og:url` via `metadataBase` + page path (or explicit `openGraph.url`)
- `og:type` (layout sets `website`, article pages should set `article`)
- Individual pages should NOT duplicate `og:site_name` -- it inherits from layout

**Key insight:** Next.js metadata merges layout-level and page-level metadata. Layout provides defaults; pages override specific fields. Do NOT re-specify layout-level fields in pages unless overriding them.

### 5. next-sitemap with Payload Local API (M4)

**Current state:** `next-sitemap.config.cjs` is a static config with no dynamic route generation. It only catches filesystem routes, missing all CMS-driven pages.

**Integration approach:** next-sitemap supports `additionalPaths` for dynamic routes. Since the config runs at build time (via `postbuild` script), it can call Payload's Local API:

```javascript
module.exports = {
  siteUrl: 'https://www.bibbunited.com',
  additionalPaths: async (config) => {
    // Import payload and fetch all published content
    const { getPayload } = require('payload')
    const payloadConfig = require('./src/payload.config')
    const payload = await getPayload({ config: payloadConfig })

    const newsPosts = await payload.find({
      collection: 'news-posts',
      where: { _status: { equals: 'published' } },
      limit: 1000,
      select: { slug: true, updatedAt: true },
    })

    const pages = await payload.find({
      collection: 'pages',
      where: { _status: { equals: 'published' } },
      limit: 1000,
      select: { slug: true, updatedAt: true },
    })

    const paths = []
    for (const post of newsPosts.docs) {
      paths.push({
        loc: `/news/${post.slug}`,
        lastmod: post.updatedAt,
        changefreq: 'weekly',
        priority: 0.7,
      })
    }
    for (const page of pages.docs) {
      paths.push({
        loc: `/${page.slug}`,
        lastmod: page.updatedAt,
        changefreq: 'monthly',
        priority: 0.6,
      })
    }
    return paths
  },
}
```

**Alternative (simpler):** Since the site already has `generateStaticParams` in `news/[slug]/page.tsx` and `[slug]/page.tsx`, next-sitemap's default crawling should pick up these paths IF the build generates them. The issue might be that the build is not running `generateStaticParams` in the current configuration. Check if `dynamicParams` is configured correctly. The simpler fix might be ensuring the existing static params work with next-sitemap's crawler.

**Recommendation:** Use `additionalPaths` because it gives explicit control over priority and lastmod per route type, which addresses L5 (homepage priority should be 1.0).

### 6. Media Cache Headers (M9)

**Current state:** Payload serves media at `/api/media/file/*` with no cache headers (TTL 0).

**Integration options:**

1. **Next.js middleware** -- Add a `middleware.ts` that matches `/api/media/file/*` and sets `Cache-Control` headers. This is the cleanest approach since it does not require modifying Payload internals.

2. **Next.js config `headers()`** -- Add a custom headers config in `next.config.ts`:
   ```typescript
   async headers() {
     return [{
       source: '/api/media/file/:path*',
       headers: [{
         key: 'Cache-Control',
         value: 'public, max-age=31536000, immutable',
       }],
     }]
   }
   ```

**Recommendation:** Use `next.config.ts` `headers()` because it is declarative, does not add runtime middleware overhead, and is the standard Next.js pattern for static cache headers. Media files with the same name always have the same content (Payload does not do content-addressable naming, but media files rarely change -- and when they do, editors re-upload creating a new filename).

### 7. Payload Users Collection -- displayName Field (H5)

**Current state:** `Users.ts` has zero custom fields (only default `email`). Article bylines show `admin@bibbunited.com`.

**Integration:** Adding a field to a Payload collection requires:
1. Add the field to `Users.ts`
2. Run `payload migrate:create` to generate a migration
3. Run `payload migrate` to apply it
4. Update `news/[slug]/page.tsx` to read `displayName` instead of `email`
5. Update `seed.ts` to set `displayName` on the seed user
6. Update `newsArticleJsonLd` in `jsonLd.ts` to use `displayName`

**Schema change:**
```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email' },
  auth: true,
  fields: [
    {
      name: 'displayName',
      type: 'text',
      label: 'Display Name',
      admin: {
        description: 'Public name shown on article bylines (e.g., "Jane Smith" or "BIBB United Staff")',
      },
    },
  ],
}
```

**Byline logic in news/[slug]/page.tsx:**
```typescript
const author = typeof post.author === 'object' ? post.author as User : null
const authorName = author?.displayName || 'BIBB United Staff'
// Never fall back to email
```

**Migration consideration:** This is a non-breaking, additive schema change. Existing users will have `displayName: null`, and the code falls back to "BIBB United Staff". No data loss, no breaking change.

## Component Boundaries

### New Components

| Component | Type | Purpose |
|-----------|------|---------|
| `FooterCTA` (client) | New small wrapper | Uses `usePathname()` to conditionally hide self-links in footer CTA section |

### Modified Components (No New Components Needed for Most Fixes)

| Component | Server/Client | Changes |
|-----------|--------------|---------|
| `Header.tsx` | Client | `next/link`, `usePathname()` for active indicator, `tabIndex`/`inert` for focus trap |
| `Footer.tsx` | Server | `text-white` fix, `next/link`, focus ring styles, extract CTA to client wrapper |
| `Card.tsx` | Server | `next/link` + `next/image`, accept `width`/`height` or use `fill` |
| `Button.tsx` | Server | `next/link` for internal hrefs |
| `HeroSpotlight.tsx` | Client | `next/image` with `fill` + `priority` |
| `LatestNews.tsx` | Server | `next/link` + `next/image` |
| `layout.tsx` | Server | Skip-link, remove `pt-16`, canonical base |
| `page.tsx` (homepage) | Server | Add `sr-only` H1 |
| `news/[slug]/page.tsx` | Server | Fix metadata, `next/image`, displayName byline |
| `[slug]/page.tsx` | Server | Fix metadata |
| `contact-officials/page.tsx` | Server | `next/image`, empty state text |
| `meetings/page.tsx` | Server | Empty state text |
| `seed.ts` | Script | Nav data, hero data, images, alt text, displayName |
| `Users.ts` | Config | Add `displayName` field |
| `next.config.ts` | Config | `poweredByHeader`, `headers()` |
| `next-sitemap.config.cjs` | Config | Dynamic routes, priority |

### Data Flow Changes

**Before:** `<img src={media.url}>` -- browser fetches full-size image from Payload API, no optimization.

**After:** `<Image src={media.url} sizes="..." fill>` -- Next.js image optimizer intercepts, converts to WebP/AVIF, serves responsive srcset. The image optimizer caches results in `.next/cache/images/`.

**Before:** `<a href="/news">` -- full page reload, re-fetches all JS/CSS.

**After:** `<Link href="/news">` -- client-side navigation, prefetches on hover, instant page transition.

**Before:** Author byline reads `user.email` directly.

**After:** Author byline reads `user.displayName`, falls back to "BIBB United Staff". Never exposes email.

## Suggested Build Order

The 25 fixes have clear dependency chains. Build order optimizes for: unblocking dependent fixes, highest-impact-first, and avoiding rework.

### Phase 1: Foundation Fixes (unblock everything else)

**Rationale:** These config/data changes are prerequisites for later phases and have no dependencies on each other.

1. **next.config.ts updates** (L3 poweredByHeader, media cache headers M9)
   - Zero risk, immediate effect
   - Unblocks: nothing, but trivial to do first

2. **Users.ts displayName field + migration** (H5 prerequisite)
   - Must happen before byline fix
   - Requires `payload migrate:create` + `payload migrate`
   - Unblocks: H5 byline fix in Phase 2

3. **Seed script overhaul** (C2 nav, C3 hero, C4 images, M10 alt text)
   - Populate Navigation global with menu items
   - Populate Homepage global heroSpotlight with news posts
   - Replace dark seed images with high-contrast alternatives
   - Set descriptive alt text per image
   - Set displayName on seed user
   - Unblocks: C2, C3 visually; M8 active indicator testing

4. **Create og-default.png** (L2)
   - Design a 1200x630 branded image
   - Place in `public/og-default.png`
   - Unblocks: M3 OG completeness

### Phase 2: Core Component Migration (highest user-impact)

**Rationale:** These are the most impactful UX fixes (broken appearance, full page reloads, missing optimization). Group them because `next/link` and `next/image` migration touches overlapping files.

5. **Footer contrast fix** (C1)
   - Replace `text-text-on-dark` with `text-white` in Footer.tsx
   - Add explicit focus ring styles for footer links (L4)
   - 30-minute fix, immediate visual improvement

6. **HeroSpotlight empty state** (C3 code side)
   - Return `null` or a branded placeholder when no stories
   - Prevents the 540px dark void

7. **next/link migration** (H3) -- across all files simultaneously
   - Header.tsx: conditional Link vs `<a>` in `renderLink()` and all inline anchors
   - Footer.tsx: all hardcoded nav links
   - Button.tsx: when `href` starts with `/`
   - Card.tsx: wrap in `Link` instead of `<a>`
   - LatestNews.tsx: all article links
   - HeroSpotlight.tsx: story links
   - news/page.tsx, contact-officials/page.tsx, meetings/page.tsx: any remaining `<a>` for internal links
   - **Do this as one batch** to avoid inconsistent navigation behavior

8. **next/image migration** (H4) -- across all files simultaneously
   - Card.tsx: `Image` with `fill` in aspect-ratio container
   - HeroSpotlight.tsx: `Image` with `fill` + `priority`
   - LatestNews.tsx: `Image` with explicit sizes for thumbnails
   - news/[slug]/page.tsx: `Image` with `fill` for hero
   - contact-officials/page.tsx: `Image` with explicit 80x80 for photos
   - **Do this as one batch** for consistent image handling

9. **Header focus trap fix** (H6)
   - Add `inert` attribute to mobile panel when closed, or `tabIndex={mobileOpen ? 0 : -1}` on close button
   - Small, isolated change

### Phase 3: Accessibility and Layout

**Rationale:** These fixes improve structure and accessibility. They are independent of the component migrations above.

10. **Skip-to-content link** (H2)
    - Add as first child of `<body>` in layout.tsx
    - Add `id="main-content"` to `<main>`
    - Standard pattern: visually hidden, visible on focus

11. **Homepage H1** (H1)
    - Add `<h1 className="sr-only">BIBB United - Civic Advocacy for the BIBB Community</h1>` as first child in homepage

12. **Remove pt-16 from main** (M5)
    - Delete `pt-16` from `<main>` in layout.tsx
    - The sticky header uses `sticky top-0` which does not need content offset -- the header sits in normal flow then sticks
    - **Verify:** that removing pt-16 does not cause content to hide behind the sticky header. If it does, the correct fix is `scroll-margin-top` on anchor targets, not padding on main.

13. **Empty state messaging** (M6)
    - Contact Officials: replace with actionable text + link to school board website
    - Meetings: replace with actionable text + link to official meeting calendar

14. **Active nav indicator** (M8)
    - In Header.tsx, use `usePathname()` to compare against nav item hrefs
    - Apply `text-accent` + `border-b-2 border-accent` + `aria-current="page"` to matching item

15. **Footer self-link suppression** (L1)
    - Create small `FooterCTA` client component using `usePathname()`
    - Conditionally render CTA buttons that do not match current path

### Phase 4: SEO and Metadata

**Rationale:** Metadata fixes are independent and can be batched. They do not affect visual rendering.

16. **Fix duplicate title template** (M1)
    - In `news/[slug]/page.tsx`: change `title: \`${title} | BIBB United\`` to `title: title`
    - In `[slug]/page.tsx`: same change
    - In `contact-officials/page.tsx`, `meetings/page.tsx`, `news/page.tsx`: check for same issue in their `openGraph.title` and `twitter.title` fields -- these manually append `| BIBB United` which duplicates the layout template

17. **Canonical URLs** (M2)
    - Add `alternates: { canonical: url }` to each page's `generateMetadata`
    - Use `metadataBase` (already set in layout) so relative paths work

18. **Complete OG tags** (M3)
    - Add `og:url` (via `openGraph.url` or rely on `metadataBase` + canonical)
    - Article pages: set `openGraph.type: 'article'`
    - Ensure `og:description` on all pages
    - Remove redundant `og:site_name` from page-level metadata (layout handles it)

19. **Sitemap expansion** (M4, L5)
    - Update `next-sitemap.config.cjs` with `additionalPaths` to query Payload
    - Set homepage priority to 1.0
    - Set news articles to 0.8, static pages to 0.6

20. **News article byline fix** (H5)
    - Update `news/[slug]/page.tsx` to use `displayName` with "BIBB United Staff" fallback
    - Update JSON-LD author name similarly

### Phase 5: Content Polish

**Rationale:** These are content/seed improvements that can be done last.

21. **News card excerpts** (M7)
    - Option A: Add `excerpt` text field to `NewsPosts.ts` (requires migration)
    - Option B: Derive excerpt from first paragraph of rich text body at render time
    - **Recommendation:** Option A (explicit excerpt field) because editors should control what appears on listing cards. Derive from body is fragile with rich text.
    - Display with `line-clamp-2` in Card children

22. **Seed alt text improvement** (M10)
    - Already handled in Phase 1 seed overhaul if done thoroughly

### Build Order Dependency Graph

```
Phase 1 (Foundation)
  next.config.ts ----+
  Users.ts migration -+---> Phase 2 (Components)
  Seed overhaul ------+       next/link batch
  og-default.png -----+       next/image batch
                              Footer contrast
                              Hero empty state
                              Focus trap
                                |
                                v
                          Phase 3 (A11y/Layout)
                              Skip link
                              Homepage H1
                              pt-16 removal
                              Empty states
                              Active nav
                              Footer self-link
                                |
                                v
                          Phase 4 (SEO/Meta)
                              Title dedup
                              Canonical URLs
                              OG completeness
                              Sitemap
                              Byline fix
                                |
                                v
                          Phase 5 (Content)
                              News excerpts
                              Seed polish
```

Phases 2-4 are mostly independent of each other and could run in parallel if multiple developers were available. The ordering above is for a single developer working sequentially, prioritizing user-visible impact.

## Anti-Patterns to Avoid During Fixes

### Anti-Pattern: Converting Server Components to Client for pathname

**What:** Making Footer.tsx `'use client'` just to use `usePathname()` for self-link suppression.

**Why bad:** Footer becomes a client component, increasing JS bundle size. All children become client components too.

**Instead:** Extract only the interactive part (CTA buttons) into a tiny client component. Keep Footer's nav, copyright, and layout as server-rendered.

### Anti-Pattern: Using `next/image` with `width={0} height={0} style={{width: '100%', height: 'auto'}}`

**What:** Hack to make `next/image` behave like a responsive `<img>`.

**Why bad:** Confusing, defeats the purpose of explicit sizing, and `fill` already exists for this use case.

**Instead:** Use `fill` with a parent that has `position: relative` and defined dimensions (via aspect-ratio or explicit height). This is the standard pattern for images in responsive containers.

### Anti-Pattern: Mixing `<a>` and `<Link>` inconsistently

**What:** Some links are `<Link>`, others are still `<a>`, creating inconsistent navigation behavior.

**Why bad:** Users experience jarring full-page reloads on some clicks but smooth transitions on others.

**Instead:** Migrate ALL internal links in one batch. Keep `<a>` ONLY for external links and `mailto:`/`tel:` links.

### Anti-Pattern: Hardcoding metadataBase URL in every page

**What:** Repeating `https://www.bibbunited.com` in every page's canonical/OG URL.

**Why bad:** Duplicated, error-prone, breaks in dev/staging environments.

**Instead:** The layout already sets `metadataBase: new URL('https://www.bibbunited.com')`. Page-level metadata can use relative paths and Next.js resolves them against metadataBase.

## Sources

- Direct codebase analysis of all 55 source files in the project -- HIGH confidence
- UI-UX-REVIEW-2026-03-24.md (25 issues with root cause analysis) -- HIGH confidence
- Next.js App Router metadata API (training data, well-established pattern) -- HIGH confidence
- next/image component behavior (training data, stable API since Next.js 13) -- HIGH confidence
- Tailwind v4 @theme behavior (training data, verified against styles.css in codebase) -- MEDIUM confidence (Tailwind v4 is newer, cascade behavior inferred from observed bug)
- next-sitemap additionalPaths API (training data) -- MEDIUM confidence (verify exact API signature)
