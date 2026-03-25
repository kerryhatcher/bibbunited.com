# Phase 10: Component Migration & Visual Fixes - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

All internal links use client-side navigation via next/link, all images are optimized via next/image, footer text has WCAG 4.5:1 contrast on dark background, and mobile menu close button is not reachable via keyboard when the slide-out panel is hidden. Delivers requirements COMP-01, COMP-02, VIS-01, A11Y-03.

</domain>

<decisions>
## Implementation Decisions

### Link Migration Strategy
- **D-01:** Replace all `<a href>` with `<Link>` from `next/link` for internal routes across all component files: Header.tsx, Footer.tsx, Button.tsx, UrgentBannerBar.tsx, HeroSpotlight.tsx, LatestNews.tsx, and page files.
- **D-02:** Button component becomes Link-aware -- when `href` is provided, render `<Link>` instead of `<a>`. Single source of truth for all button-links. May require making Button a client component or splitting into a LinkButton wrapper.
- **D-03:** Internal path heuristic -- if URL starts with `/`, use `next/link` regardless of whether the Navigation global marks it as `internal` or `external` type. Only truly external URLs (`https://`) get raw `<a>`. This covers collection listing routes like `/news`, `/meetings` that are stored as external-type with plain URL strings.
- **D-04:** Logo link (`href="/"`) also migrates to `next/link` -- no exceptions for internal links.
- **D-05:** External links (non-`/` URLs, `target="_blank"`) remain as `<a>` tags with `rel="noopener noreferrer"`.

### Image Optimization Approach
- **D-06:** Use `<Image fill>` mode with sized parent containers for hero banners and card images. Parent elements must have `position: relative` and explicit dimensions (via aspect-ratio or height) to prevent CLS.
- **D-07:** Leverage Payload's pre-generated size variants (thumbnail 400x300, card 768w, hero 1920w) via the `sizes` prop rather than having Next.js re-process images. Reference the appropriate size URL from Payload's media sizes object.
- **D-08:** Hero image gets `priority={true}` for LCP optimization -- preloaded instead of lazy-loaded.
- **D-09:** All other images use default lazy loading behavior (next/image default).
- **D-10:** Configure `images.formats: ['image/avif', 'image/webp']` in next.config.ts for optimal compression. No `remotePatterns` needed since Payload images are same-origin.

### Footer Contrast Fix
- **D-11:** Investigate actual computed colors in the browser during implementation. The CSS variable `--color-text-on-dark` is already `#FFFFFF` (11.7:1 against navy) -- the UI review's 1.24:1 reading was likely a measurement error.
- **D-12:** Remove the `/80` opacity modifier from `text-text-on-dark/80` on the copyright text -- this reduces contrast unnecessarily.
- **D-13:** Fix at root cause, not with local overrides. If the variable resolves correctly, no variable changes needed. If something unexpected surfaces during browser verification, fix at the source.

### Keyboard Trap Fix
- **D-14:** Use the HTML `inert` attribute on the mobile slide-out panel: `inert={!mobileOpen}`. Makes the entire panel subtree non-focusable and non-interactive when closed. React 19 supports the boolean form natively.
- **D-15:** Implement focus trapping when the menu IS open -- Tab cycles only through menu items and close button, preventing tabbing to page content behind the overlay. Standard accessible modal pattern per WCAG 2.4.3.
- **D-16:** Preserve the existing CSS slide-out transition animation (translate-x-full/translate-x-0) since inert keeps the element in DOM.

### next.config.ts Changes
- **D-17:** Add `images.formats: ['image/avif', 'image/webp']` to next config. No remotePatterns needed for same-origin Payload media.
- **D-18:** Existing `webpack` and `turbopack` config keys are not conflicting -- webpack runs during `next build`, turbopack during `next dev`. No changes needed to either.

### Build Verification Strategy
- **D-19:** Run `pnpm build` before starting (baseline check). If baseline fails, fix that first before any component work.
- **D-20:** Run `pnpm build` after each migration batch (after Plan 1, after Plan 2) to catch regressions at each step.
- **D-21:** Verify client-side navigation works via automated browser test (Playwright/Chrome DevTools) -- click internal links and confirm no full page reload occurs.

### Plan Structure
- **D-22:** Two plans for this phase. Plan 1: next/link + next/image migration (component upgrades, shared next.config.ts changes, build verification). Plan 2: Footer contrast fix + keyboard trap fix (visual/a11y fixes in layout components, build verification).

### Claude's Discretion
- Exact `sizes` prop values for responsive breakpoints in each image context
- Focus trap implementation details (custom hook vs inline logic)
- Whether Button needs to become a client component or can use a wrapper pattern
- Exact audit of all parent containers needing `position: relative` for `<Image fill>`

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### UI/UX Review (source of all v1.1 issues)
- `UI-UX-REVIEW-2026-03-24.md` -- Issues C1 (footer contrast), H3 (no next/link), H4 (no next/image), H6 (keyboard trap)

### Requirements
- `.planning/REQUIREMENTS.md` -- COMP-01, COMP-02, VIS-01, A11Y-03

### Prior Phase Context
- `.planning/phases/09-foundation-config/09-CONTEXT.md` -- D-09 (cache headers in next.config.ts), D-08 (OG image as Payload media item)

### Files to Modify
- `src/components/layout/Header.tsx` -- Link migration (~15 `<a>` tags), keyboard trap fix (mobile panel), focus lock
- `src/components/layout/Footer.tsx` -- Link migration (~4 `<a>` tags), contrast fix (text-on-dark/80 opacity)
- `src/components/ui/Button.tsx` -- Link-aware refactor (render `<Link>` when href provided)
- `src/components/layout/UrgentBannerBar.tsx` -- Link migration
- `src/components/homepage/HeroSpotlight.tsx` -- Image migration (hero image, priority)
- `src/components/homepage/LatestNews.tsx` -- Image migration (news card thumbnails)
- `src/app/(frontend)/news/[slug]/page.tsx` -- Image migration (featured image)
- `src/app/(frontend)/news/page.tsx` -- Image migration (news listing cards)
- `src/app/(frontend)/contact-officials/page.tsx` -- Image migration (official photos)
- `next.config.ts` -- images.formats config
- `src/app/(frontend)/styles.css` -- CSS variables reference (text-on-dark already #FFFFFF)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Button` component (`src/components/ui/Button.tsx`) -- already has href prop pattern, needs Link wrapping
- `resolveHref()` function in Header.tsx -- converts NavLink to URL string, can be reused to determine internal vs external
- Payload Media collection pre-generates sizes: thumbnail (400x300), card (768w), hero (1920w)

### Established Patterns
- Navigation uses `type: 'internal' | 'external'` with page relationship or URL string
- Images accessed via `post.featuredImage.url` and `post.featuredImage.sizes.thumbnail.url` patterns
- Mobile menu uses CSS transform for show/hide (`translate-x-full` / `translate-x-0`)
- `mobileOpen` state controls both overlay and panel visibility

### Integration Points
- `next.config.ts` already has `withPayload` wrapper -- image config goes inside `nextConfig` before wrapping
- Header.tsx is a client component (`'use client'`) -- next/link works in client components
- Footer.tsx and page files are server components -- next/link also works in server components
- Button.tsx is currently a server component -- may need `'use client'` if Link requires it, or use a wrapper pattern

</code_context>

<specifics>
## Specific Ideas

No specific requirements -- open to standard approaches for the migrations. Key principle: every internal link should use client-side navigation, every image should be optimized, and the footer/keyboard fixes should be verified in the actual browser.

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 10-component-migration-visual-fixes*
*Context gathered: 2026-03-24*
