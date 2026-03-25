# Phase 10: Component Migration & Visual Fixes - Research

**Researched:** 2026-03-24
**Domain:** Next.js component optimization (next/link, next/image), WCAG accessibility, CSS contrast
**Confidence:** HIGH

## Summary

Phase 10 migrates all internal `<a href>` tags to `next/link` for client-side SPA navigation, replaces all `<img>` tags with `next/image` for automatic format optimization (AVIF/WebP) and responsive srcset generation, fixes a footer contrast issue caused by an opacity modifier on the copyright text, and eliminates a keyboard trap in the mobile menu slide-out panel.

The codebase uses Next.js 16.2.1 with React 19.2.4. The `next/link` component renders a standard `<a>` tag with prefetching and client-side navigation built in -- it accepts all standard anchor attributes (`className`, `target`, `onClick`) as passthrough props. The `next/image` component with `fill` mode requires the parent element to have `position: relative` and defined dimensions. React 19 natively supports the boolean `inert` attribute on JSX elements, making it the cleanest solution for the keyboard trap fix.

**Primary recommendation:** Migrate links and images in two batches (Plan 1: component upgrades, Plan 2: visual/a11y fixes), running `pnpm build` after each batch. Use `inert={!mobileOpen}` for the keyboard trap -- no polyfill needed with React 19.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Replace all `<a href>` with `<Link>` from `next/link` for internal routes across all component files: Header.tsx, Footer.tsx, Button.tsx, UrgentBannerBar.tsx, HeroSpotlight.tsx, LatestNews.tsx, and page files.
- D-02: Button component becomes Link-aware -- when `href` is provided, render `<Link>` instead of `<a>`. Single source of truth for all button-links. May require making Button a client component or splitting into a LinkButton wrapper.
- D-03: Internal path heuristic -- if URL starts with `/`, use `next/link` regardless of whether the Navigation global marks it as `internal` or `external` type. Only truly external URLs (`https://`) get raw `<a>`. This covers collection listing routes like `/news`, `/meetings` that are stored as external-type with plain URL strings.
- D-04: Logo link (`href="/"`) also migrates to `next/link` -- no exceptions for internal links.
- D-05: External links (non-`/` URLs, `target="_blank"`) remain as `<a>` tags with `rel="noopener noreferrer"`.
- D-06: Use `<Image fill>` mode with sized parent containers for hero banners and card images. Parent elements must have `position: relative` and explicit dimensions (via aspect-ratio or height) to prevent CLS.
- D-07: Leverage Payload's pre-generated size variants (thumbnail 400x300, card 768w, hero 1920w) via the `sizes` prop rather than having Next.js re-process images. Reference the appropriate size URL from Payload's media sizes object.
- D-08: Hero image gets `priority={true}` for LCP optimization -- preloaded instead of lazy-loaded.
- D-09: All other images use default lazy loading behavior (next/image default).
- D-10: Configure `images.formats: ['image/avif', 'image/webp']` in next.config.ts for optimal compression. No `remotePatterns` needed since Payload images are same-origin.
- D-11: Investigate actual computed colors in the browser during implementation. The CSS variable `--color-text-on-dark` is already `#FFFFFF` (11.7:1 against navy) -- the UI review's 1.24:1 reading was likely a measurement error.
- D-12: Remove the `/80` opacity modifier from `text-text-on-dark/80` on the copyright text -- this reduces contrast unnecessarily.
- D-13: Fix at root cause, not with local overrides.
- D-14: Use the HTML `inert` attribute on the mobile slide-out panel: `inert={!mobileOpen}`. Makes the entire panel subtree non-focusable and non-interactive when closed. React 19 supports the boolean form natively.
- D-15: Implement focus trapping when the menu IS open -- Tab cycles only through menu items and close button, preventing tabbing to page content behind the overlay. Standard accessible modal pattern per WCAG 2.4.3.
- D-16: Preserve the existing CSS slide-out transition animation (translate-x-full/translate-x-0) since inert keeps the element in DOM.
- D-17: Add `images.formats: ['image/avif', 'image/webp']` to next config. No remotePatterns needed for same-origin Payload media.
- D-18: Existing `webpack` and `turbopack` config keys are not conflicting -- webpack runs during `next build`, turbopack during `next dev`. No changes needed to either.
- D-19: Run `pnpm build` before starting (baseline check). If baseline fails, fix that first before any component work.
- D-20: Run `pnpm build` after each migration batch (after Plan 1, after Plan 2) to catch regressions at each step.
- D-21: Verify client-side navigation works via automated browser test (Playwright/Chrome DevTools) -- click internal links and confirm no full page reload occurs.
- D-22: Two plans for this phase. Plan 1: next/link + next/image migration (component upgrades, shared next.config.ts changes, build verification). Plan 2: Footer contrast fix + keyboard trap fix (visual/a11y fixes in layout components, build verification).

### Claude's Discretion
- Exact `sizes` prop values for responsive breakpoints in each image context
- Focus trap implementation details (custom hook vs inline logic)
- Whether Button needs to become a client component or can use a wrapper pattern
- Exact audit of all parent containers needing `position: relative` for `<Image fill>`

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COMP-01 | All internal links use next/link for client-side SPA navigation without full page reloads | next/link API fully documented; migration pattern clear for each file; D-01 through D-05 define the heuristic |
| COMP-02 | All images use next/image with proper sizes, lazy loading, and format optimization | next/image fill mode, sizes prop, priority prop, and formats config all documented; D-06 through D-10 define approach |
| VIS-01 | Footer text is readable with proper contrast on dark background (WCAG 4.5:1 minimum) | Root cause identified: `text-text-on-dark/80` opacity modifier on copyright text; D-11 through D-13 define fix |
| A11Y-03 | Mobile menu close button is not focusable when slide-out panel is hidden | `inert` attribute confirmed supported in React 19; D-14 through D-16 define implementation |
</phase_requirements>

## Standard Stack

No new libraries needed. All functionality comes from Next.js built-ins already installed.

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next/link | 16.2.1 (bundled) | Client-side navigation | Built into Next.js; renders `<a>` with prefetch + SPA navigation |
| next/image | 16.2.1 (bundled) | Image optimization | Built into Next.js; automatic AVIF/WebP, srcset, lazy loading |
| React 19 | 19.2.4 | `inert` attribute support | Boolean `inert` prop supported natively in JSX since React 19 |

### No Additional Installs Required

All dependencies are already present in the project. No `npm install` or `pnpm add` needed.

## Architecture Patterns

### Pattern 1: next/link Migration (Internal Links)

**What:** Replace `<a href="/path">` with `<Link href="/path">` for all internal routes.
**When to use:** Any link where href starts with `/`.

```typescript
// Source: https://nextjs.org/docs/app/api-reference/components/link
import Link from 'next/link'

// BEFORE
<a href="/news" className="text-accent">News</a>

// AFTER -- className and all standard anchor props pass through
<Link href="/news" className="text-accent">News</Link>
```

**Key facts from official docs (Next.js 16.2.1):**
- `<Link>` renders a standard `<a>` element with prefetching + client-side navigation
- All `<a>` attributes (`className`, `target`, `onClick`, `rel`) pass through as props
- Works in both server components and client components (no `'use client'` required just for Link)
- `target="_blank"` disables client-side navigation automatically -- safe to use on external links via Link, but per D-05 we keep raw `<a>` for external URLs

### Pattern 2: Internal vs External Link Heuristic

**What:** Decision logic per D-03 for determining when to use Link vs raw `<a>`.

```typescript
// In Header.tsx renderLink function:
function renderLink(item: NavLink, className: string) {
  const href = resolveHref(item)
  const isExternal = item.newTab || !href.startsWith('/')

  if (isExternal) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {item.label}
      </a>
    )
  }

  return (
    <Link href={href} className={className} onClick={() => setMobileOpen(false)}>
      {item.label}
    </Link>
  )
}
```

### Pattern 3: next/image with fill Mode

**What:** Replace `<img>` with `<Image fill>` inside a sized parent container.
**When to use:** Hero banners, card images, any responsive image that should fill its container.

```typescript
// Source: https://nextjs.org/docs/app/api-reference/components/image
import Image from 'next/image'

// BEFORE
<div className="w-full aspect-video overflow-hidden">
  <img src={url} alt={alt} className="w-full h-full object-cover" />
</div>

// AFTER -- parent MUST have position:relative and defined dimensions
<div className="relative w-full aspect-video overflow-hidden">
  <Image
    src={url}
    alt={alt}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
</div>
```

**Critical requirements from official docs:**
- Parent element MUST have `position: relative`, `fixed`, or `absolute`
- Parent element MUST have defined dimensions (width/height or aspect-ratio)
- Image element defaults to `position: absolute` when fill is used
- `sizes` prop is essential -- without it, browser assumes 100vw and downloads oversized images
- `sizes` affects srcset generation: with sizes, Next.js generates full responsive srcset (640w, 750w, 828w, etc.)

### Pattern 4: next/image with Fixed Dimensions

**What:** Replace `<img>` with `<Image width={} height={}>` for known-size images.
**When to use:** Official photos, thumbnails, avatars -- fixed visual size.

```typescript
// BEFORE
<img src={photo.url} alt={name} className="w-20 h-20 rounded-full object-cover" />

// AFTER
<Image
  src={photo.url}
  alt={name}
  width={80}
  height={80}
  className="rounded-full object-cover"
/>
```

### Pattern 5: Button Component Link-Aware Refactor

**What:** Button renders `<Link>` instead of `<a>` when `href` starts with `/`.
**Recommendation (Claude's discretion):** Keep Button as a server component by not using hooks. Link works in server components.

```typescript
import Link from 'next/link'

export function Button({ variant = 'primary', children, className = '', href, ...props }: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`

  if (href) {
    const isInternal = href.startsWith('/')
    if (isInternal) {
      return <Link href={href} className={classes}>{children}</Link>
    }
    return <a href={href} className={classes}>{children}</a>
  }

  return <button className={classes} {...props}>{children}</button>
}
```

**Why this works:** `next/link` does NOT require `'use client'`. It works in server components. Button can stay a server component. No need for a separate LinkButton wrapper.

### Pattern 6: Focus Trap for Mobile Menu

**What:** When mobile menu opens, trap keyboard focus within the panel.
**Recommendation (Claude's discretion):** Use a custom `useFocusTrap` hook for clean separation.

```typescript
// Inline approach (simpler, recommended given small component scope)
function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const focusables = container.querySelectorAll<HTMLElement>(focusableSelector)
    const first = focusables[0]
    const last = focusables[focusables.length - 1]

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    // Focus first element when trap activates
    first?.focus()
    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [isActive, containerRef])
}
```

### Anti-Patterns to Avoid

- **Wrapping Link children in `<a>`:** Since Next.js 13, `<Link>` renders its own `<a>`. Nesting `<a>` inside `<Link>` produces invalid HTML and hydration errors.
- **Missing `sizes` on fill images:** Without `sizes`, the browser gets no responsive srcset and downloads the full-size image. Always provide `sizes` with `fill`.
- **Missing `position: relative` on fill parent:** The image will overflow its container or render at wrong coordinates. Every fill-image parent MUST have relative positioning.
- **Using `priority` on more than 1-2 images:** `priority` disables lazy loading and adds a preload link to `<head>`. Using it on many images defeats the purpose and slows initial page load. Only the hero/LCP image should have it.
- **Adding `loading="lazy"` manually:** next/image lazy-loads by default. Adding the prop explicitly is redundant and could conflict with `priority`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Client-side navigation | Custom router push on click handlers | `next/link` component | Handles prefetching, scroll management, history, RSC payload streaming, code splitting |
| Image optimization | Custom sharp pipeline, manual srcset | `next/image` component | Handles format negotiation (AVIF/WebP), responsive srcset, lazy loading, CLS prevention |
| Keyboard trap for modal | Manual aria-hidden + tabindex=-1 on all background elements | `inert` attribute + focus trap hook | `inert` makes entire subtree non-focusable in one attribute; no need to manage individual tabindex values |

## Common Pitfalls

### Pitfall 1: CLS from Image Migration
**What goes wrong:** Replacing `<img>` with `<Image fill>` without proper parent sizing causes layout shift (CLS).
**Why it happens:** `<img>` with CSS classes (`w-full h-full`) renders inline and sizes from CSS. `<Image fill>` uses `position: absolute` and depends entirely on parent dimensions.
**How to avoid:** Audit every parent container: it MUST have `position: relative` and explicit dimensions via `aspect-ratio`, `height`, or `width+height`. The existing code already uses `aspect-video` and `aspect-[16/7]` -- verify these are on the direct parent of each Image.
**Warning signs:** Images appear at 0x0, overflow their container, or cause visible layout jumps on load.

### Pitfall 2: Card Component Image Migration
**What goes wrong:** Card.tsx passes `imageSrc` as a string URL to an inner `<img>`. Migrating to `<Image fill>` requires the Card's image container to have `position: relative`.
**Why it happens:** The current Card image container (`<div className="w-full aspect-video overflow-hidden">`) lacks `relative`.
**How to avoid:** Add `relative` to the image container div in Card.tsx.

### Pitfall 3: Button Becoming a Client Component
**What goes wrong:** Adding `next/link` to Button.tsx causes it to become a client component unnecessarily.
**Why it happens:** Developers assume Link requires `'use client'`. It does not.
**How to avoid:** `next/link` works in server components. Button can stay a server component. Only add `'use client'` if you add event handlers or hooks -- which Button does not need.

### Pitfall 4: UrgentBannerBar External Links
**What goes wrong:** The UrgentBannerBar link might be internal (`/meetings`) or external (`https://...`). Blindly wrapping in Link breaks external URLs.
**Why it happens:** The banner `link` field is a freeform string from CMS.
**How to avoid:** Apply D-03 heuristic: if `banner.link.startsWith('/')`, use Link; otherwise use `<a>`.

### Pitfall 5: Header Desktop Dropdown Links
**What goes wrong:** Desktop dropdown `<a>` tags have `ref` callbacks for keyboard navigation. `next/link` renders `<a>` but ref forwarding works differently.
**Why it happens:** The dropdown uses `ref` to track focusable elements for arrow-key navigation.
**How to avoid:** `<Link>` in Next.js 16 forwards refs to the underlying `<a>` element. The ref callback should still work. But test arrow-key navigation in the desktop dropdown after migration.

### Pitfall 6: Inert Attribute with CSS Transitions
**What goes wrong:** `inert` might interfere with CSS transitions on the slide-out panel.
**Why it happens:** `inert` affects interactivity, not rendering. The panel stays in DOM with its CSS transitions intact.
**How to avoid:** This is actually a non-issue -- `inert` only affects focus/click/assistive technology, not visual rendering. The translate-x transition works fine alongside `inert`.

## Code Examples

### next.config.ts Image Formats Configuration

```typescript
// Source: https://nextjs.org/docs/app/api-reference/components/image#formats
// Add to existing nextConfig object:
const nextConfig: NextConfig = {
  // ... existing config ...
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}
```

**Per official docs:** AVIF is preferred for browsers that support it, WebP is fallback. AVIF takes ~50% longer to encode but compresses 20% smaller. First request is slower; cached requests are faster. Both formats cached separately. The `Accept` header determines which format is served.

### Recommended `sizes` Prop Values (Claude's Discretion)

Based on the project's Tailwind breakpoints and grid layouts:

| Image Context | sizes Value | Rationale |
|---------------|-------------|-----------|
| Hero (HeroSpotlight) | `100vw` | Full-width hero, always spans viewport |
| Featured news card (LatestNews, lg:col-span-2) | `(max-width: 1024px) 100vw, 66vw` | Full width on mobile, 2/3 on desktop |
| News listing card (grid cols-1/2/3) | `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw` | 1 col mobile, 2 cols tablet, 3 cols desktop |
| News article featured image | `100vw` | Full-width banner |
| News sidebar thumbnail (16x16 / 64px) | `64px` | Fixed small size, no responsive needed |
| Official photo (w-20/h-20 = 80px) | `80px` | Fixed small size, use width/height not fill |

### Parent Container Audit for `<Image fill>`

| Component | Current Container | Needs `relative`? | Has Dimensions? |
|-----------|-------------------|-------------------|-----------------|
| HeroSpotlight slide | `<div className="min-w-full relative h-full">` | Already has `relative` | Yes (h-full from parent aspect ratio) |
| Card.tsx image | `<div className="w-full aspect-video overflow-hidden">` | NEEDS `relative` added | Yes (aspect-video) |
| News article `[slug]` | `<div className="w-full aspect-video relative">` | Already has `relative` | Yes (aspect-video) |
| LatestNews sidebar | Inline `<img>` with `w-16 h-16` | Use width/height mode, not fill | N/A |
| Contact officials photo | Inline `<img>` with `w-20 h-20` | Use width/height mode, not fill | N/A |

### Complete File-by-File Migration Map

| File | Link Changes | Image Changes |
|------|-------------|---------------|
| `Header.tsx` | Logo `<a href="/">` to `<Link>`, `renderLink()` function, desktop dropdown `<a>`, mobile nav `<a>` -- all internal hrefs | None |
| `Footer.tsx` | 4 nav `<a>` tags to `<Link>`, Logo link | None |
| `Button.tsx` | Internal `href` renders `<Link>` instead of `<a>` | None |
| `UrgentBannerBar.tsx` | Banner link: conditional `<Link>` vs `<a>` based on `/` prefix | None |
| `HeroSpotlight.tsx` | Story title `<a>` to `<Link>` | `<img>` to `<Image fill priority>` (hero = LCP) |
| `LatestNews.tsx` | Sidebar `<a>` tags to `<Link>`, "View All News" `<a>` to `<Link>` | Sidebar thumbnails: `<img>` to `<Image width={64} height={64}>` |
| `Card.tsx` | Card wrapper `<a>` to `<Link>` | `<img>` to `<Image fill>`, add `relative` to parent |
| `news/[slug]/page.tsx` | None (uses Button which handles it) | Featured `<img>` to `<Image fill>` |
| `news/page.tsx` | None (uses Card which handles it) | None (uses Card which handles it) |
| `contact-officials/page.tsx` | None (email/phone links stay as `<a>`) | Official photos: `<img>` to `<Image width={80} height={80}>` |
| `next.config.ts` | None | Add `images.formats` config |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<Link><a>` nesting | `<Link>` renders `<a>` directly | Next.js 13.0.0 | No child `<a>` tag needed; adding one causes hydration error |
| `layout` prop on Image | `fill` prop (boolean) | Next.js 13.0.0 | `layout="fill"` removed; use `fill` boolean |
| `objectFit` prop on Image | CSS `className="object-cover"` | Next.js 13.0.0 | Style via CSS, not prop |
| `aria-hidden` + tabindex for modals | HTML `inert` attribute | React 19 / all modern browsers | One attribute replaces multiple aria/tabindex hacks |

## Open Questions

1. **Payload image URL format for next/image**
   - What we know: Images are served from `/media/` path (same-origin). No `remotePatterns` needed.
   - What's unclear: Whether Next.js image optimization will correctly process Payload-served images from the `/media/` path, or if `localPatterns` config is needed.
   - Recommendation: Test with a single image first. If optimization fails, add `localPatterns: [{ pathname: '/media/**' }]` to the images config. Per D-10, no remotePatterns are needed since images are same-origin.

2. **Header dropdown ref forwarding with Link**
   - What we know: Desktop dropdown uses `ref` callbacks on `<a>` tags for arrow-key navigation.
   - What's unclear: Whether Link's ref forwarding works identically to direct `<a>` refs in this pattern.
   - Recommendation: After migration, test desktop dropdown arrow-key navigation. If refs break, use `React.forwardRef` or switch to `useCallback` ref pattern.

## Project Constraints (from CLAUDE.md)

- **Tech stack:** Next.js + React + Tailwind CSS + Payload CMS 3.x (non-negotiable)
- **Testing:** All UI verification must be automated via Playwright MCP or Chrome DevTools MCP (never manual)
- **Build verification:** Use `pnpm build` (runs inside Docker via docker-compose)
- **Commits:** Conventional Commits format required
- **GSD workflow:** All changes through GSD commands
- **No Prisma:** Payload uses Drizzle internally; no additional ORM
- **No CSS-in-JS:** Tailwind only
- **No Pages Router:** App Router only

## Sources

### Primary (HIGH confidence)
- [Next.js Link Component docs](https://nextjs.org/docs/app/api-reference/components/link) - Full API reference, version 16.2.1, last updated 2026-03-20
- [Next.js Image Component docs](https://nextjs.org/docs/app/api-reference/components/image) - Full API reference including fill, sizes, formats, priority props
- [React 19 inert support](https://github.com/facebook/react/pull/24730) - Boolean inert prop merged for React 19
- Codebase audit (direct file reads) - All 11 files listed in CONTEXT.md canonical refs

### Secondary (MEDIUM confidence)
- [Next.js 16 blog post](https://nextjs.org/blog/next-16) - Confirmed no breaking changes to Link or Image APIs from 15 to 16

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All built-in Next.js components, verified against official docs
- Architecture: HIGH - Patterns directly from official documentation, verified with installed version 16.2.1
- Pitfalls: HIGH - Based on direct codebase audit of all 11 files to be modified
- Sizes values: MEDIUM - Calculated from Tailwind breakpoints, may need adjustment after visual testing

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable APIs, unlikely to change)
