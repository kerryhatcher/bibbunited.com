# Domain Pitfalls: v1.1 Production Polish

**Domain:** Production polish fixes for Next.js 15 + Tailwind v4 + Payload CMS 3.x civic advocacy site
**Researched:** 2026-03-24
**Scope:** Pitfalls specific to adding 25 UI/UX fixes to an existing shipped v1.0 codebase

---

## Critical Pitfalls

Mistakes that cause regressions, broken pages, or require reverting multiple fixes.

### Pitfall 1: next/image Migration Causes CLS Spikes When Fill Mode Parent Lacks Position Relative

**What goes wrong:** Replacing `<img>` with `<Image fill>` in components like `Card.tsx`, `HeroSpotlight.tsx`, and `news/[slug]/page.tsx` without ensuring the parent container has `position: relative` (or `absolute`/`fixed`). The image either overflows its container or collapses to 0 height, creating a massive CLS regression -- the exact opposite of what the migration intends.

**Why it happens:** The current code uses `<img className="w-full h-full object-cover">` inside containers with `aspect-video` or `aspect-[16/7]`. These containers implicitly size the `<img>` because it flows normally. `<Image fill>` uses `position: absolute` internally, so it no longer contributes to container height. If the parent only relies on child content for sizing, the container collapses.

**Consequences:** CLS score jumps from 0.00 to 0.3+ (failing Core Web Vitals). Hero spotlight becomes invisible. News cards lose their image area. This is the single highest-risk regression in the entire milestone because the current CLS score is perfect.

**Prevention:**
- Every `<Image fill>` parent MUST have `className="relative"` AND explicit dimensions (via `aspect-video`, `aspect-[16/7]`, or fixed height).
- Audit each replacement site individually. The pattern differs per component:
  - `Card.tsx` line 23: Parent `<div className="w-full aspect-video overflow-hidden">` -- add `relative`.
  - `HeroSpotlight.tsx` line 59: Parent `<div className="min-w-full relative h-full">` -- already has `relative`, safe.
  - `news/[slug]/page.tsx` line 122: Parent `<div className="w-full aspect-video relative">` -- already has `relative`, safe.
  - `contact-officials/page.tsx` line 123-125: Needs audit for parent positioning.
- Test CLS with Lighthouse after EVERY image migration, not just at the end.

**Detection:** Lighthouse CLS > 0.01 on any page. Visual: images either invisible or overflowing viewport.

**Confidence:** HIGH -- this is the #1 documented cause of CLS regressions in next/image migrations.

---

### Pitfall 2: next/image With Payload CMS Media URLs Requires Correct `sizes` Prop AND May Need `remotePatterns`

**What goes wrong:** Using `<Image>` with Payload media URLs like `/api/media/file/seed-test-image.jpg` without the `sizes` prop causes the browser to download the largest image variant (potentially 3840px wide) on all devices. Alternatively, if the Payload server URL changes or images are served from a different domain in production (e.g., via CDN), `<Image>` throws an "Un-configured Host" error and the page crashes.

**Why it happens:** Payload CMS 3.x serves media through its API at `/api/media/file/[filename]`. These are same-origin relative URLs in development but could become absolute URLs if `NEXT_PUBLIC_SERVER_URL` is set or if a CDN fronts the media. The current codebase constructs image URLs as `img?.url` which returns relative paths like `/api/media/file/seed-test-image.jpg`. Next.js Image optimization works with these relative paths by default, but:
1. Without `sizes`, the `srcset` defaults to `100vw` -- every device downloads the largest variant.
2. Payload's `url` field sometimes returns absolute URLs (depending on `serverURL` config), which need `remotePatterns`.

**Consequences:** Without `sizes`: 5-10x bandwidth waste on mobile (1200px image for a 363px card). Without `remotePatterns`: hard crash in production if URL format changes.

**Prevention:**
- Add `sizes` prop to every `<Image>` based on its actual rendered size:
  - Hero spotlight: `sizes="100vw"` (full-width)
  - News cards (grid): `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`
  - Article hero: `sizes="100vw"`
  - Official photos: `sizes="96px"` (small thumbnails)
- Add `remotePatterns` to `next.config.ts` as a defensive measure:
  ```typescript
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.bibbunited.com', pathname: '/api/media/**' },
      { protocol: 'http', hostname: 'localhost', pathname: '/api/media/**' },
    ],
  },
  ```
- Verify that `sharp` is available in the Docker build (it is -- `package.json` lists `sharp: ^0.34.2`).

**Detection:** Network tab shows 1200px images loaded on mobile viewport. Build error mentioning "Un-configured Host."

**Confidence:** HIGH -- directly observed in the codebase.

---

### Pitfall 3: Tailwind v4 `@theme initial` Tokens Do Not Cascade -- The Footer Contrast Bug Pattern Will Repeat

**What goes wrong:** The footer contrast bug (C1) is caused by `text-text-on-dark` not working because `@theme { --color-text-on-dark: initial; }` registers the token for Tailwind utility generation but does NOT set a value in the cascade. Child elements that do not explicitly receive the class inherit `color` from `body` (which is `--color-text-primary: #111827` -- dark gray), not from the parent's `text-text-on-dark` class. The fix for C1 (swapping to `text-white`) is correct, but the same pattern will bite ANY component that tries to use `text-text-on-dark`, `text-text-on-accent`, or `bg-bg-secondary` via inheritance rather than direct application.

**Why it happens:** Tailwind v4's `@theme { --variable: initial; }` syntax tells Tailwind "this is a valid token, generate utilities for it" but sets the CSS custom property to `initial` (which means "use the inherited value" per CSS spec). The actual values are set in `:root {}`. When `text-text-on-dark` is applied to a parent element, it sets `color: var(--color-text-on-dark)` which resolves to `#FFFFFF`. But child elements that do NOT have this class applied inherit `color` from their computed value chain -- which may come from `body { color: var(--color-text-primary); }` rather than the parent, depending on specificity and cascade order.

**Consequences:** Invisible or low-contrast text in any dark-background section (footer, hero overlay, urgent banner, accent-background CTAs). This will recur whenever a new component is added to a dark section.

**Prevention:**
- Apply text color classes DIRECTLY to every text element in dark sections. Do not rely on inheritance from a parent `text-text-on-dark`.
- For the footer fix, apply `text-white` to the footer container AND every child text element (`h2`, `p`, `span`, `a` tags).
- Document this as a project convention: "In Tailwind v4 with `@theme initial`, color utilities must be applied directly to elements, not relied upon via CSS inheritance."
- Consider adding a utility class in `styles.css` that forces color inheritance:
  ```css
  .force-text-white, .force-text-white * { color: #fff; }
  ```

**Detection:** Visual inspection of any dark-background section. Lighthouse accessibility audit (contrast ratios below 4.5:1).

**Confidence:** HIGH -- root cause confirmed in the codebase at `styles.css` lines 6-13 and `Footer.tsx` line 7.

---

### Pitfall 4: Next.js Metadata Template Produces Double Site Name When Page Metadata Includes Suffix

**What goes wrong:** The layout defines `title: { template: '%s | BIBB United' }` (layout.tsx line 29). When page-level `generateMetadata` returns `title: "Article Title | BIBB United"`, the result is "Article Title | BIBB United | BIBB United". This is issue M1.

**Why it happens:** Next.js metadata merging is shallow. The page title string replaces `%s` in the template literally. If the page title already includes the suffix, it gets doubled. The current code in `news/[slug]/page.tsx` line 60 explicitly appends ` | BIBB United` to the title.

**Consequences:** Ugly titles in browser tabs, search results, and social shares. Google may truncate or penalize duplicate-looking titles.

**Prevention:**
- Page-level `generateMetadata` must return the title WITHOUT the suffix. The layout template handles it.
- For the homepage, use `title: { absolute: 'BIBB United -- Civic Advocacy for the BIBB Community' }` to opt out of the template for that one page (since the homepage title should not follow the "%s | BIBB United" pattern).
- Audit ALL `generateMetadata` exports across:
  - `src/app/(frontend)/page.tsx` (homepage -- needs `absolute`)
  - `src/app/(frontend)/news/[slug]/page.tsx` (remove ` | BIBB United` suffix)
  - `src/app/(frontend)/[slug]/page.tsx` (check for suffix)
  - `src/app/(frontend)/news/page.tsx` (check for suffix)
  - `src/app/(frontend)/contact-officials/page.tsx` (check for suffix)
  - `src/app/(frontend)/meetings/page.tsx` (check for suffix)

**Detection:** View page source or browser tab title on any article page.

**Confidence:** HIGH -- directly observed in the codebase.

---

## Moderate Pitfalls

Mistakes that cause visible bugs or wasted effort but are fixable without major rework.

### Pitfall 5: next/link in a `use client` Component Requires Branching on Link Type

**What goes wrong:** `Header.tsx` has `'use client'` at line 1. Replacing `<a href>` with `<Link href>` works fine in client components -- `next/link` is designed for both. However, the `renderLink` function (line 111) constructs an `<a>` element with spread props (`linkProps`). Replacing this with `<Link>` requires changing the prop types: `Link` uses `href` as a required prop (not spread from `HTMLAnchorElement`), and does not accept `target="_blank"` the same way.

**Why it happens:** The current `renderLink` function creates a generic `<a>` with dynamically computed props. `Link` has a different API -- it does not extend `AnchorHTMLAttributes` in the same way. Additionally, `next/link` should NOT be used for external URLs.

**Consequences:** TypeScript compilation errors. If ignored with `@ts-ignore`, the `target="_blank"` behavior for external links may not work correctly with `Link`.

**Prevention:**
- For internal links (`type === 'internal'`): use `<Link href={href}>`.
- For external links (`type === 'external'` or `newTab === true`): keep as `<a>` tag. `next/link` should NOT be used for external URLs.
- Refactor `renderLink` to branch on link type:
  ```tsx
  function renderLink(item: NavLink, className: string) {
    const href = resolveHref(item)
    if (item.type === 'external' || item.newTab) {
      return <a href={href} className={className} target="_blank" rel="noopener noreferrer">{item.label}</a>
    }
    return <Link href={href} className={className}>{item.label}</Link>
  }
  ```
- Apply the same pattern in `Footer.tsx`, `Button.tsx`, and `Card.tsx`.
- `Footer.tsx` is a Server Component (no `'use client'`) -- `Link` works there too.
- `Button.tsx` has no `'use client'` directive but is used inside client components. It should still use `Link` for internal hrefs.

**Detection:** TypeScript errors during build. External links not opening in new tabs.

**Confidence:** HIGH -- directly observed in codebase analysis.

---

### Pitfall 6: Skip-to-Content Link Hidden Behind Sticky Header (z-index: 50)

**What goes wrong:** Adding a skip-to-content link as the first child of `<body>` but styling it with `z-index` lower than the sticky header's `z-50` (z-index: 50). When the user presses Tab and the skip link appears, it renders BEHIND the sticky header and is invisible despite being focused.

**Why it happens:** The header has `className="sticky top-0 z-50"`. A skip link using typical CSS like `top: 0; z-index: 40` will be covered by the header.

**Consequences:** Skip link is technically present (passes automated audits) but visually invisible (fails manual testing and real keyboard users).

**Prevention:**
- Skip link must have `z-index` HIGHER than 50. Use `z-[9999]` or at minimum `z-[60]`.
- Position it with `fixed top-0 left-0` or `absolute` -- NOT relative.
- Style it to be visually hidden by default, visible on focus:
  ```tsx
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:bg-accent focus:text-white focus:px-4 focus:py-2 focus:font-bold"
  >
    Skip to main content
  </a>
  ```
- Add `id="main-content"` and `tabIndex={-1}` to `<main>` so focus actually lands there (not just scroll).
- The `tabIndex={-1}` is critical in React SPAs -- without it, pressing Tab after activating the skip link sends focus back to the top of the page.

**Detection:** Keyboard test: Tab once on page load. If skip link is not visible above the header, it fails.

**Confidence:** HIGH -- well-documented accessibility pattern.

---

### Pitfall 7: Mobile Menu `inert` Attribute Must Be Applied Bidirectionally

**What goes wrong:** Using `inert` only on the off-screen mobile panel (to prevent focus when closed) misses the other half: when the panel IS open, main page content behind the overlay should be `inert` to prevent focus from escaping the menu.

**Why it happens:** The H6 fix specifies adding `inert` to the panel when closed. But the reverse is equally important: when the panel is open, users should not be able to Tab into the header, main content, or footer behind the overlay.

**Consequences:** Keyboard users can Tab out of the open mobile menu into invisible content behind the overlay. Screen readers announce content that is visually hidden.

**Prevention:**
- When mobile menu is closed: `inert` on the slide-out panel div.
- When mobile menu is open: `inert` on main page content (or use the overlay's `aria-hidden` pattern plus focus trapping).
- The `inert` attribute has 93%+ browser support as of 2025 -- safe to use without polyfill.
- Implementation challenge: the current `Header.tsx` is a client component that renders the mobile panel as a sibling of the main header content, all within the `<header>` element. To make main page content `inert`, you need to restructure so the mobile panel and the rest of the page are siblings, or lift the mobile state to the layout level.
- Note: React 19 handles boolean `inert` correctly. Pass `inert={true}` when active, `inert={undefined}` (not `false`) to remove the attribute entirely -- passing `false` may render `inert="false"` which still makes the element inert in some browsers.

**Detection:** Open mobile menu, press Tab repeatedly. Focus should cycle within the menu only.

**Confidence:** MEDIUM -- `inert` attribute handling in React 19 may need runtime verification.

---

### Pitfall 8: Open Graph Metadata Shallow Merge Erases Parent Layout OG Tags

**What goes wrong:** When a page defines its own `openGraph` in `generateMetadata`, it completely replaces (not merges) the layout-level `openGraph`. This means page-level OG tags lose `og:site_name` and `og:type` defined in the layout, because Next.js metadata merging is shallow -- child `openGraph` objects replace parent `openGraph` objects entirely.

**Why it happens:** The layout (lines 33-37) defines `openGraph: { type: 'website', siteName: 'BIBB United', images: [...] }`. The homepage page.tsx (lines 35-40) defines its own `openGraph: { title: ..., description: ..., images: [...] }` WITHOUT `type` or `siteName`. The page-level object replaces the layout-level one, so `type` and `siteName` are lost.

**Consequences:** Missing `og:type` and `og:site_name` on pages that define their own OG metadata. Social media previews may render incorrectly.

**Prevention:**
- Every page-level `generateMetadata` that includes `openGraph` must also include `type` and `siteName`:
  ```typescript
  openGraph: {
    type: 'article',  // or 'website' for non-article pages
    siteName: 'BIBB United',
    title: '...',
    description: '...',
    images: [...],
  },
  ```
- Alternatively, create a shared `baseOpenGraph` object imported into every `generateMetadata`:
  ```typescript
  export const baseOpenGraph = { siteName: 'BIBB United' }
  // In page: openGraph: { ...baseOpenGraph, type: 'article', title: '...', ... }
  ```
- This applies to ALL pages: homepage, news listing, news articles, slug pages, contact, meetings.

**Detection:** View page source; search for `og:type` and `og:site_name` meta tags.

**Confidence:** HIGH -- confirmed by Next.js docs: "Merging is shallow. Duplicate keys are replaced based on ordering."

---

### Pitfall 9: next-sitemap Build-Time Generation Misses CMS Dynamic Routes

**What goes wrong:** `next-sitemap` runs as `postbuild` (package.json line 9) and generates the sitemap from the `.next` build output. It only includes routes that Next.js statically generated at build time. CMS-managed pages (via `[slug]` route) and news articles (via `news/[slug]`) are only included if `generateStaticParams` was called during build AND the database was accessible during build.

**Why it happens:** The current `next-sitemap.config.cjs` has no `additionalPaths` or server-side sitemap configuration. It relies entirely on static file output. If the build runs without database access (common in CI/CD), `generateStaticParams` returns empty arrays, and dynamic pages are omitted.

**Consequences:** News articles and CMS pages are invisible to search engines. This is issue M4. For a civic advocacy site that depends on discoverability, this is a significant SEO gap.

**Prevention:**
- Option A (recommended): Use `additionalPaths` in `next-sitemap.config.cjs` to query Payload at build time:
  ```javascript
  additionalPaths: async (config) => {
    // Requires DATABASE_URI available at build time
    const result = []
    // Fetch published news posts
    // Fetch published pages
    // Return as { loc: '/news/slug', changefreq: 'weekly', priority: 0.7 }
    return result
  },
  ```
- Option B: Switch to Next.js built-in `sitemap.ts` (App Router) which runs at request time and can query the database dynamically. This avoids the build-time dependency entirely.
- Option C: Ensure the build environment (Docker, CI) has database access so `generateStaticParams` populates correctly.
- For homepage priority (L5): Add `transform` function to set priority per route:
  ```javascript
  transform: async (config, path) => ({
    loc: path,
    changefreq: config.changefreq,
    priority: path === '/' ? 1.0 : config.priority,
    lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
  }),
  ```

**Detection:** Check `public/sitemap-0.xml` after build. Count URLs -- should match total published pages + posts + static routes.

**Confidence:** HIGH -- confirmed by examining `next-sitemap.config.cjs` and `package.json` postbuild script.

---

### Pitfall 10: Removing `pt-16` From Main Hides Content Behind Sticky Header

**What goes wrong:** Issue M5 says `pt-16` on `<main>` creates unnecessary whitespace. But the sticky header is `h-16` (64px). Removing `pt-16` means the first content on every page renders BEHIND the sticky header, hidden from view.

**Why it happens:** The reviewer noted the padding seems unnecessary. But it IS necessary for a `sticky top-0` header -- the main content needs to be offset by the header height so the first element is visible. The issue is that `pt-16` is the correct approach but may need refinement for pages with full-bleed hero images.

**Consequences:** Removing `pt-16` hides the top 64px of every page behind the header. H1 headings, hero images, and breadcrumbs become invisible.

**Prevention:**
- Do NOT blindly remove `pt-16`. Instead, evaluate per-page:
  - Pages with full-bleed hero (homepage with HeroSpotlight): the hero could extend behind the header with internal top padding, so main `pt-16` can be kept or the hero can handle it.
  - Pages without hero (Contact Officials, Meetings, News listing): `pt-16` is correct and necessary.
- Consider moving padding to individual page layouts or using `scroll-padding-top: 4rem` on `html` for anchor link behavior.
- If removing `pt-16` from `<main>`, each page component must add its own top padding. This is more flexible but more error-prone (one missed page = content hidden behind header).

**Detection:** After removing padding, check every page visually. Content hidden behind header = regression.

**Confidence:** HIGH -- the sticky header REQUIRES content offset. The review recommendation to simply remove it is misleading.

---

## Minor Pitfalls

### Pitfall 11: Seed Script Navigation Population Must Use Correct Payload Relationship Format

**What goes wrong:** Adding navigation items to the seed script requires knowing the exact data shape Payload expects for the `Navigation` global's `items` field, including relationship references to pages. Using the wrong format (e.g., passing a page ID as a number instead of `{ relationTo: 'pages', value: pageId }`) silently fails or creates broken links.

**Prevention:**
- Check the `Navigation` global's field schema before writing seed data.
- Create pages FIRST, capture their IDs, then populate navigation with correct relationship format.
- Use `overrideAccess: true` for global updates in seed scripts.
- Test navigation rendering after seeding, not just successful API calls.

**Confidence:** MEDIUM -- depends on exact Payload schema definitions not fully audited.

---

### Pitfall 12: Canonical URL Must Match Actual Page URL Including Trailing Slash Behavior

**What goes wrong:** Adding `alternates: { canonical: 'https://www.bibbunited.com/news' }` when Next.js serves the page at `https://www.bibbunited.com/news/` (or vice versa) creates a canonical mismatch. Search engines may treat these as different URLs.

**Prevention:**
- Use `metadataBase` (already set in layout.tsx line 26) and relative canonical paths.
- Set `trailingSlash` consistently in `next.config.ts` if needed.
- For dynamic pages, construct canonical from the actual route parameters:
  ```typescript
  alternates: { canonical: `/news/${slug}` }
  ```
- `metadataBase` handles prepending the domain automatically.

**Confidence:** HIGH -- well-documented SEO pattern.

---

### Pitfall 13: Users Collection Schema Change (displayName) Requires Database Migration

**What goes wrong:** Adding a `displayName` field to the `Users` collection (fix for H5 -- admin email exposure) requires a Payload database migration. If the migration is not created and run, the field exists in the admin UI but queries crash or return undefined.

**Prevention:**
- After adding the field to the collection schema, run `pnpm payload migrate:create` to generate the migration.
- Run `pnpm payload migrate` before deploying.
- Set a default value or make the field optional to avoid breaking existing users.
- Update the seed script to include `displayName` for the seed user.
- Update `news/[slug]/page.tsx` to read `displayName` first, fall back to "BIBB United Staff" (never email).

**Confidence:** HIGH -- Payload 3.x uses Drizzle migrations for schema changes.

---

### Pitfall 14: Replacing Seed Images Breaks Idempotency Check

**What goes wrong:** The seed script checks for existing media by alt text: `where: { alt: { equals: 'BIBB United test image for seed data' } }`. If you change the alt text (fix M10 -- descriptive alt text) or replace the image, the idempotency check fails and creates duplicate media on re-run.

**Prevention:**
- Use a stable identifier for seed media (e.g., filename) rather than alt text for idempotency checks.
- Update the idempotency check to match on filename: `where: { filename: { equals: 'seed-hero-image.jpg' } }`.
- Create multiple distinct seed images with different filenames and descriptive alt texts.
- Consider a cleanup step at the start of the seed script that removes previous seed data before re-creating.

**Confidence:** HIGH -- directly observed in `src/seed.ts` lines 33-36.

---

### Pitfall 15: Active Nav Indicator Using `usePathname()` May Cause Hydration Mismatch

**What goes wrong:** Adding an active page indicator (M8) in the Header requires knowing the current pathname. `usePathname()` from `next/navigation` works in client components, but during SSR the pathname may differ from the client if there is any URL normalization (trailing slashes, encoded characters). This can cause a hydration mismatch warning.

**Prevention:**
- Use `usePathname()` in the Header (already a client component) and compare against nav item hrefs.
- Ensure comparison logic handles edge cases: trailing slashes, case sensitivity, and partial matches (e.g., `/news` should highlight for `/news/article-slug`).
- Use `startsWith()` for section-level highlighting rather than exact match.
- This is low risk in practice but worth testing across all nav items after implementation.

**Confidence:** MEDIUM -- hydration mismatches are environment-specific.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Footer contrast fix (C1) | Tailwind v4 `@theme initial` cascade issue repeats in other dark sections | Apply `text-white` directly to ALL child elements, not just container |
| Navigation seed (C2) | Relationship format mismatch silently fails | Verify Payload global schema before writing seed data |
| Hero empty state (C3) | Returning `null` breaks layout if parent expects a block-level element | Return a minimal placeholder or empty fragment, test layout flow |
| Seed image replacement (C4) | New images with different alt text break idempotency | Update idempotency check to use filename, not alt text |
| Homepage H1 (H1) | `sr-only` H1 may not satisfy all SEO auditors | Consider a visible H1 in the hero or above Latest News section |
| Skip-to-content (H2) | Hidden behind z-50 sticky header | Use z-[9999] and `fixed` positioning on focus |
| next/link migration (H3) | External links should NOT use `<Link>` | Branch on link type: internal uses Link, external uses anchor tag |
| next/image migration (H4) | CLS regression from missing `relative` on parent | Audit every replacement site for parent positioning and add `sizes` |
| Admin email fix (H5) | Requires database migration for new field | Run `payload migrate:create` and `payload migrate` |
| Focus trap fix (H6) | Fixing panel focus but not trapping focus when open | Apply `inert` to BOTH panel (when closed) AND main content (when open) |
| Duplicate titles (M1) | Homepage title gets template applied incorrectly | Use `title: { absolute: '...' }` for homepage |
| Canonical URLs (M2) | Trailing slash mismatch with actual served URL | Use `metadataBase` with relative paths |
| OG tags (M3) | Shallow merge erases parent layout OG properties | Include `siteName` and `type` in every page-level openGraph |
| Sitemap (M4) | Build-time generation misses CMS pages | Use `additionalPaths` or switch to App Router `sitemap.ts` |
| Main padding (M5) | Removing pt-16 hides content behind sticky header | Keep pt-16 or add per-page top padding; do not simply remove |
| Active nav (M8) | `usePathname()` edge cases with trailing slashes | Use `startsWith()` for section-level matching |
| OG default image (L2) | 1200x630 image not optimized or compressed | Generate a compressed branded OG image asset |
| X-Powered-By (L3) | Payload may add its own header separately from Next.js | Check both Next.js config AND Payload config |
| Sitemap priority (L5) | next-sitemap transform function must return ALL required fields | Copy all default fields in transform, not just priority |

## Sources

- [Next.js Image Component docs](https://nextjs.org/docs/app/api-reference/components/image)
- [Next.js generateMetadata docs](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js metadata merging behavior](https://medium.com/@davegray_86804/next-js-ordering-and-merging-metadata-df22c19d93f4)
- [Tailwind CSS v4.0 announcement](https://tailwindcss.com/blog/tailwindcss-v4)
- [Tailwind v4 data-theme inheritance discussion](https://github.com/tailwindlabs/tailwindcss/discussions/17115)
- [WebAIM: Skip Navigation Links](https://webaim.org/techniques/skipnav/)
- [Sticky header skip link conflicts](https://dubbot.com/dubblog/2025/gettin-out-of-a-sticky-situation.html)
- [MDN: HTML inert global attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert)
- [Can I Use: inert attribute (93%+ support)](https://caniuse.com/mdn-html_global_attributes_inert)
- [next-sitemap npm documentation](https://www.npmjs.com/package/next-sitemap)
- [Payload CMS dynamic sitemap guide](https://payloadcms.com/posts/guides/how-to-build-an-seo-friendly-sitemap-in-payload--nextjs)
- [Next.js Image CLS best practices](https://pagepro.co/blog/nextjs-image-component-performance-cwv/)
- [CLS-safe CMS images in Next.js](https://medium.com/@nicholasrussellconsulting/industry-standard-practices-for-rendering-cls-safe-cms-images-in-next-js-bf99fcc8d7e3)
- [Next.js Image optimization guide](https://eastondev.com/blog/en/posts/dev/20251219-nextjs-image-optimization/)
- Direct codebase analysis of `src/` directory (2026-03-24)
