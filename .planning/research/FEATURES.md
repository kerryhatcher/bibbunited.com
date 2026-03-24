# Feature Landscape: v1.1 Production Polish

**Domain:** Civic advocacy website -- production quality fixes for accessibility, image optimization, SEO, and navigation UX
**Researched:** 2026-03-24
**Confidence:** HIGH (patterns verified via Next.js and WCAG official documentation)

## Table Stakes

Features users and search engines expect. Missing = site feels unfinished, loses SEO ranking, or fails accessibility audits.

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| Skip-to-content link | WCAG 2.4.1 Level A requirement. Keyboard users trapped in nav menus cannot reach content. Every government/civic site is expected to have this. | Low | `layout.tsx`, `<main>` needs `id="main-content"` | First focusable element in DOM. Visually hidden until focused. Standard pattern: `sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50` with high-contrast styling. |
| Keyboard trap prevention | WCAG 2.1.2 Level A requirement. Users must never be stuck on an invisible element. The mobile menu close button is focusable when off-screen. | Low | `Header.tsx` mobile panel | Use `inert` attribute on the closed panel (preferred -- prevents all interaction) or `tabIndex={-1}` on the close button when panel is hidden. `inert` is supported in all modern browsers and is the WCAG-recommended approach. |
| Visible focus indicators | WCAG 2.4.7 Level AA (and 2.4.11 in WCAG 2.2). Footer links on dark backgrounds need explicit focus rings with 3:1 contrast ratio against the background. | Low | `Footer.tsx`, global CSS | Use `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white` on dark backgrounds. Prefer `focus-visible` over `focus` to avoid showing rings on mouse clicks. |
| Heading hierarchy (H1) | WCAG 1.3.1 and 2.4.6. Missing H1 is the single most impactful on-page SEO gap and breaks screen reader document navigation. Every page needs exactly one H1. | Low | `page.tsx` (homepage) | Visually hidden H1 (`sr-only`) is acceptable for design-driven pages. Visible H1 is preferred. All other pages likely already have H1 via their content. |
| Descriptive alt text | WCAG 1.1.1 Level A. Generic alt text ("test image") provides zero value to screen reader users and signals low quality to search engines. | Low | `seed.ts`, all image components | Each image needs context-specific alt text. For CMS images, Payload's media collection already has an `alt` field -- the seed script just needs to populate it meaningfully. |
| `next/image` for all images | Next.js core feature since v10. Using raw `<img>` tags means no WebP/AVIF, no responsive srcset, no lazy loading, no blur placeholders. Performance and SEO penalty. | Medium | `Card.tsx`, `HeroSpotlight.tsx`, `LatestNews.tsx`, news `[slug]/page.tsx`, `contact-officials/page.tsx` | Use `fill` with `sizes` for responsive containers. Set `priority` on above-the-fold LCP images (hero spotlight, first news card). Use `placeholder="blur"` with `blurDataURL` for visible images. CMS images need a small base64 blur hash generated at upload or build time. |
| `next/link` for internal navigation | Next.js core feature. Raw `<a>` tags cause full page reloads. Client-side navigation with `<Link>` provides instant transitions, prefetching, and preserves client state. | Medium | `Header.tsx`, `Footer.tsx`, `Button.tsx`, all card components | Drop-in replacement -- `<Link href="...">` replaces `<a href="...">` for internal routes. Keep `<a>` for external URLs. `next/link` handles prefetching automatically on viewport intersection. |
| Canonical URLs | SEO fundamental. Without canonical tags, search engines may index duplicate content (trailing slashes, query params, www vs non-www). | Low | `layout.tsx` or per-page `generateMetadata` | Set `metadataBase` in root layout, then add `alternates: { canonical: '/path' }` in each page's metadata. Next.js generates `<link rel="canonical">` automatically. |
| Complete Open Graph tags | Social shares without og:image, og:url, og:type show broken previews. Civic content spreads via Facebook groups and text messages -- bad previews kill engagement. | Medium | Root layout metadata, per-page `generateMetadata` | Required OG tags: `og:title`, `og:description`, `og:url`, `og:image` (1200x630), `og:type`, `og:site_name`. Set defaults in root layout, override per page. Create a branded `og-default.png` for pages without a specific image. |
| Dynamic sitemap with all routes | News articles missing from sitemap means Google may never discover them. A civic news site depends on search discoverability. | Low | `next-sitemap` config or Next.js `sitemap.ts` | Query Payload for all published news posts and pages at build time. Set homepage priority to 1.0, news articles to 0.8, static pages to 0.6. Include `lastmod` dates from Payload's `updatedAt`. |
| Title template without duplication | "Title | BIBB United | BIBB United" looks unprofessional in browser tabs and search results. Signals a broken or amateur site. | Low | Root layout `metadata.title.template`, per-page `generateMetadata` | Root layout sets `title: { template: '%s | BIBB United', default: 'BIBB United' }`. Pages return only their title string -- the layout template handles the suffix. |
| Active navigation indicator | Users need to know where they are. Without a visual marker on the current page's nav link, the site feels static and disorienting. | Low | `Header.tsx` (must become client component or extract nav links as client component) | Use `usePathname()` to compare against link href. Apply `aria-current="page"` for accessibility and a visual style (underline, color accent, or border-bottom) for sighted users. Use `pathname.startsWith(href)` for nested routes. |

## Differentiators

Features that elevate beyond minimum viable. Not expected, but valued -- especially for a civic advocacy site.

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| Actionable empty states | "No officials listed" is a dead end. "No officials listed yet -- visit the Bibb County School Board website for current contacts" turns a gap into a civic action. Aligns with the site's mission to activate, not just inform. | Low | Contact Officials page, Meetings page, any CMS-driven list | Structure: headline explaining the state, brief explanation, CTA linking to an external authoritative source (school board website, county clerk). Use the site's urgent design language -- this is an opportunity, not an apology. |
| News card excerpts/summaries | Cards with only headline + date force users to click blind. A 2-line excerpt helps readers assess relevance, increasing engagement with relevant articles and reducing bounce from irrelevant ones. | Low-Medium | `NewsPosts` collection in Payload, `Card.tsx`, `LatestNews.tsx` | Two approaches: (1) Add an explicit `excerpt` field to the Payload collection (preferred -- editorial control), or (2) auto-derive from first paragraph of rich text body. Display with `line-clamp-2` in Tailwind. For CMS approach, make excerpt optional with auto-generation fallback. |
| Blur-up image placeholders | Smooth loading experience instead of content jumps. The site's bold dark backgrounds actually make this more noticeable -- a blur placeholder provides visual continuity. | Medium | All `next/image` instances, potentially a Payload hook to generate blur hashes on upload | For CMS images: generate a tiny (10x10px) base64-encoded blur hash at upload time via a Payload `afterChange` hook using `sharp`, store it in the media document. Pass as `blurDataURL` to `next/image`. For static images, Next.js handles this automatically with `import`. |
| Suppressed self-referencing CTAs | Footer "Contact Officials" button linking to the page you're already on is wasteful at best, confusing at worst. Suppressing it shows attention to detail. | Low | `Footer.tsx`, needs current pathname | Conditionally render CTA buttons only when they don't match the current route. Small touch that signals polish. |
| Media cache headers | Images currently have 0-second cache TTL. Setting immutable cache headers eliminates redundant downloads and speeds up return visits. | Low | Middleware or Payload configuration | Set `Cache-Control: public, max-age=31536000, immutable` for `/api/media/file/*`. Media files are content-addressed (filename includes hash from Payload), so immutable caching is safe. |
| X-Powered-By header removal | Minor security hardening. Information disclosure helps attackers fingerprint the stack. Every production deployment guide recommends removing it. | Low | `next.config.ts` | One line: `poweredByHeader: false`. Trivial but signals production-readiness. |

## Anti-Features

Features to explicitly NOT build during this polish milestone.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Full WCAG 2.2 AAA compliance | AAA is aspirational, not legally required. Pursuing it would expand scope far beyond the 25 identified issues. AA is the standard for civic sites. | Target WCAG 2.1 AA fully. Revisit AAA criteria in a future accessibility-focused milestone. |
| Custom image CDN or transformation pipeline | Over-engineering for a small self-hosted site. next/image with sharp handles optimization. | Use `next/image` with the default Next.js image optimizer. Payload serves originals; Next.js transforms on demand. |
| Client-side search for news | Only 3 articles exist. Site is small enough to navigate via menu. Search was explicitly deferred to v2. | Keep menu-based navigation. Revisit when content volume exceeds ~50 articles. |
| Rich social share previews (Twitter Cards with large images) | Requires Twitter developer account verification and testing. OG tags cover the majority of social platforms. | Implement standard OG tags. Twitter falls back to OG tags automatically. Add Twitter-specific cards in v2 if social sharing data shows need. |
| Automated accessibility testing in CI | Good long-term goal, but not part of this fix-the-25-issues milestone. Setting up axe-core/Pa11y in CI is a separate initiative. | Fix the known 25 issues now. Add automated a11y testing as a future milestone to prevent regressions. |
| Per-article OG image generation | Dynamic OG image generation (e.g., `@vercel/og` or Satori) is complex and the site has a perfectly fine branded default image approach. | Create one branded `og-default.png` (1200x630). Articles with featured images use those. Articles without use the default. |

## Feature Dependencies

```
Skip-to-content link ─── requires `id="main-content"` on <main> in layout.tsx
                    └── independent of all other fixes

Keyboard trap fix ────── independent (Header.tsx only)

next/link migration ──── must happen before active nav indicator
                    └── (active indicator uses usePathname which requires client component;
                         links must already be <Link> components)

next/image migration ─── must happen before blur placeholders
                    └── blur placeholders require blurDataURL prop on <Image>

Active nav indicator ──── depends on next/link migration
                    └── requires Header nav to use client component with usePathname

News card excerpts ───── requires adding excerpt field to NewsPosts collection
                    └── then updating Card.tsx and LatestNews.tsx

Canonical URLs ────────── requires metadataBase set in root layout
                    └── independent per-page additions after that

Complete OG tags ──────── requires metadataBase (same as canonical)
                    └── requires og-default.png asset created
                    └── per-page og:image needs next/image migration done first
                         (for proper image URL generation)

Dynamic sitemap ───────── independent (queries Payload at build/request time)

Title template fix ────── independent (root layout + page metadata)

Empty state redesign ──── independent per page

Footer contrast fix ───── independent (CSS only)

Seed data improvements ── independent (seed.ts only, affects dev/test environments)
```

## MVP Recommendation (Fix Priority)

This is a polish milestone, not new feature development. Prioritize by user impact:

### Must fix first (site appears broken without these):
1. **Footer contrast** (C1) -- 30 min, CSS swap, affects every page
2. **Navigation population + seed** (C2) -- 15 min, CMS data + seed script
3. **Hero spotlight population + empty fallback** (C3) -- 30 min, CMS data + component fix
4. **Seed image replacement** (C4) -- 30 min, new test images

### Must fix second (core quality):
5. **next/link migration** (H3) -- 1-2 hours, touches many files but mechanical replacement
6. **next/image migration** (H4) -- 2-3 hours, requires sizing decisions per usage
7. **Skip-to-content link** (H2) -- 15 min, one component addition
8. **Homepage H1** (H1) -- 10 min, one element addition
9. **Keyboard trap fix** (H6) -- 15 min, add `inert` attribute
10. **Admin email fix** (H5) -- 30 min, add displayName field + fallback

### Must fix third (SEO/polish):
11. **Title template dedup** (M1) -- 15 min
12. **Canonical URLs** (M2) -- 30 min
13. **Complete OG tags + og-default.png** (M3 + L2) -- 1-2 hours
14. **Dynamic sitemap** (M4) -- 1 hour
15. **Active nav indicator** (M8) -- 30 min
16. **Empty state messaging** (M6) -- 30 min
17. **News card excerpts** (M7) -- 1 hour (includes Payload schema change)

### Should fix (diminishing returns but still valuable):
18. **Media cache headers** (M9) -- 30 min
19. **Focus indicators on footer** (L4) -- 15 min
20. **Seed alt text** (M10) -- 15 min
21. **Footer self-link suppression** (L1) -- 15 min
22. **X-Powered-By removal** (L3) -- 5 min
23. **Sitemap priorities** (L5) -- 10 min
24. **Layout pt-16 spacing** (M5) -- 15 min, test carefully for regressions

Defer: **Blur-up placeholders** -- nice-to-have differentiator that requires a Payload hook. Save for after all 25 issues are resolved.

## Complexity Assessment

| Category | Total Items | Estimated Effort | Risk Level |
|----------|-------------|-----------------|------------|
| Accessibility fixes | 6 (skip link, keyboard trap, focus indicators, H1, alt text, heading hierarchy) | 2 hours | Low -- well-documented WCAG patterns |
| Image optimization | 2 (next/image migration, seed images) | 3 hours | Medium -- sizing decisions and CMS image URL patterns need care |
| SEO completeness | 6 (canonical, OG tags, sitemap, title template, og-default.png, sitemap priorities) | 3 hours | Low -- Next.js metadata API is well-documented |
| Navigation UX | 3 (next/link migration, active indicator, nav population) | 2 hours | Low -- mechanical replacements |
| Empty state / content UX | 3 (empty states, news excerpts, admin email) | 2 hours | Low -- copy and component changes |
| Infrastructure | 3 (cache headers, X-Powered-By, layout spacing) | 1 hour | Low -- config changes |
| Seed data | 3 (nav seed, images, alt text) | 1 hour | Low -- dev/test environment only |
| **Total** | **25 issues + 1 asset** | **~14 hours** | **Low-Medium overall** |

## Sources

- [Next.js Image Component API](https://nextjs.org/docs/app/api-reference/components/image) -- HIGH confidence
- [Next.js Image Optimization Guide](https://nextjs.org/docs/app/getting-started/images) -- HIGH confidence
- [Next.js generateMetadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) -- HIGH confidence
- [Next.js Metadata and OG Images Guide](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) -- HIGH confidence
- [Next.js Linking and Navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating) -- HIGH confidence
- [Next.js usePathname](https://nextjs.org/docs/app/api-reference/functions/use-pathname) -- HIGH confidence
- [WCAG 2.1.2 No Keyboard Trap Guide](https://testparty.ai/blog/wcag-2-1-2-no-keyboard-trap-2025-guide) -- MEDIUM confidence
- [WCAG Focus Visible Guide](https://testparty.ai/blog/wcag-focus-visible-guide) -- MEDIUM confidence
- [Using aria-current for Active Nav Links](https://amanexplains.com/using-aria-current-for-nav-links/) -- MEDIUM confidence
- [Empty State UX Best Practices](https://www.toptal.com/designers/ux/empty-state-ux-design) -- MEDIUM confidence
- [CSS line-clamp Truncation Patterns](https://thelinuxcode.com/css-webkit-line-clamp-practical-multiline-truncation-patterns-for-2026/) -- MEDIUM confidence
- [Carbon Design System Empty States](https://carbondesignsystem.com/patterns/empty-states-pattern/) -- MEDIUM confidence
