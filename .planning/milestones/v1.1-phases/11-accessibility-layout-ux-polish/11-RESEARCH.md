# Phase 11: Accessibility, Layout & UX Polish - Research

**Researched:** 2026-03-24
**Domain:** WCAG 2.1 AA accessibility, UX polish, Payload CMS schema changes
**Confidence:** HIGH

## Summary

Phase 11 addresses 9 requirements spanning accessibility (skip link, H1, focus indicators) and UX polish (active nav, bylines, excerpts, empty states, footer CTA, spacing). All changes are scoped to existing files with well-understood patterns. The codebase is clean and the decisions from CONTEXT.md are specific enough that implementation is straightforward.

The hardest piece is the Lexical-to-plain-text extraction for auto-generating news excerpts (D-10), which requires traversing Lexical's AST node tree. Everything else is standard Tailwind/React/Next.js work. The Footer CTA conditional rendering (D-19/D-20) requires a client component wrapper since Footer is currently a server component but needs pathname detection.

**Primary recommendation:** Group work into 3 logical plans: (1) accessibility fundamentals (skip link, H1, focus rings), (2) navigation active state + footer CTA, (3) content polish (bylines, excerpts, empty states, spacing verification).

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Skip-to-content link is hidden by default and slides into view at top of page when user presses Tab. Standard a11y pattern (sr-only positioning, visible on :focus).
- D-02: Skip link targets `<main id="main-content">` -- add `id="main-content"` to the existing `<main>` tag in `layout.tsx`. Link href is `#main-content`.
- D-03: Homepage gets a visually hidden (sr-only) H1 at the top of the page content. Screen readers get document structure; visual design unchanged.
- D-04: Desktop: active nav item gets bold text weight and a colored bottom border. `aria-current="page"` attribute set on the active link.
- D-05: Mobile slide-out menu: active nav item gets bold text and a left accent bar. Same `aria-current="page"` attribute.
- D-06: Active state detection uses `usePathname()` to match current route against nav item hrefs.
- D-07: Article bylines show "By [displayName]" next to publish date. Falls back to "By BIBB United Staff" when displayName is empty. No role field.
- D-08: Bylines use the `displayName` field added to Users collection in Phase 9.
- D-09: Add an optional `excerpt` textarea field to the NewsPost collection. Max length 160 characters.
- D-10: When excerpt field is empty, auto-extract ~150 characters of plain text from Lexical rich text body as fallback.
- D-11: Excerpts display on news listing page cards only (`/news` page).
- D-12: This requires a Payload DB migration to add the excerpt column.
- D-13: Empty civic pages show actionable messaging with a CTA link.
- D-14: Empty state messaging matches the site's activist tone.
- D-15: Keep `pt-16` on `<main>` -- the sticky header requires exactly this padding.
- D-16: The UI review's concern about "excessive spacing" was incorrect.
- D-17: Footer links get gold/accent color focus rings via `focus-visible:ring-2`.
- D-18: Apply to all interactive elements in the footer.
- D-19: Footer CTA button is hidden when user is already on the CTA's target page.
- D-20: Footer is a server component, so current-page detection needs pathname passed down or a client wrapper.

### Claude's Discretion
- Exact sr-only H1 text wording for the homepage
- Skip link visual transition animation (slide-in vs fade-in)
- Accent color shade for active nav bottom border and left bar
- Lexical-to-plain-text extraction implementation details
- Empty state exact copy and CTA link targets
- Whether Footer needs a client component wrapper or can use a different pattern for pathname detection
- Plan structure: how to split these 9 requirements into logical plan groupings

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| A11Y-01 | Homepage has a proper H1 heading for screen readers and SEO | D-03: sr-only H1 pattern; existing page.tsx structure supports insertion at top of JSX return |
| A11Y-02 | User can skip to main content via visible skip-to-content link on keyboard focus | D-01/D-02: standard skip link pattern in layout.tsx; `<main>` already exists, just needs id attribute |
| A11Y-04 | Footer links have visible high-contrast focus indicators on dark background | D-17/D-18: `focus-visible:ring-2` with accent color on all footer interactive elements |
| UX-01 | Article bylines show display name instead of admin email address | D-07/D-08: displayName field exists on Users, author populated at depth:2 in article query; change `.email` to `.displayName` with fallback |
| UX-02 | Current page is visually indicated in navigation with active styling and aria-current | D-04/D-05/D-06: usePathname() comparison in Header.tsx; desktop bottom border + mobile left bar |
| UX-03 | News cards show excerpt or summary text | D-09/D-10/D-11/D-12: new excerpt field on NewsPosts collection + Lexical plain text extraction utility + migration |
| UX-04 | Empty states on civic pages use actionable messaging with fallback links | D-13/D-14: contact-officials and meetings pages need enhanced empty states with CTAs |
| UX-05 | Footer CTA button does not link to current page | D-19/D-20: client wrapper component for pathname detection in Footer |
| UX-06 | Main content spacing correct relative to sticky header | D-15/D-16: verify pt-16 is correct (h-16 = 64px); no change needed, just verification |

</phase_requirements>

## Architecture Patterns

### Files to Modify (Complete Map)

```
src/
  app/(frontend)/
    layout.tsx              # Skip link + id="main-content" on <main>
    page.tsx                # sr-only H1
    news/
      page.tsx              # Excerpt display on news cards
      [slug]/page.tsx       # Byline: .email -> .displayName
    contact-officials/
      page.tsx              # Enhanced empty state
    meetings/
      page.tsx              # Enhanced empty state
  collections/
    NewsPosts.ts            # Add excerpt textarea field
  components/
    layout/
      Header.tsx            # Active nav indicator (usePathname)
      Footer.tsx            # Focus rings + conditional CTA (client wrapper)
  lib/
    lexicalToPlainText.ts   # NEW: Lexical AST -> plain text utility
```

### Pattern 1: Skip-to-Content Link

**What:** Visually hidden link that becomes visible on keyboard focus, placed as first focusable element in `<body>`.

**Implementation in layout.tsx:**
```tsx
<body data-mode={mode}>
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-accent focus:text-text-on-accent focus:px-4 focus:py-2 focus:font-bold focus:uppercase focus:tracking-wide"
  >
    Skip to main content
  </a>
  <UrgentBannerBar />
  <Header navItems={navigation.items || []} />
  <main id="main-content" className="pt-16">{children}</main>
  <Footer />
</body>
```

**Key detail:** The skip link must be BEFORE the `<UrgentBannerBar />` and `<Header />` so it is the first thing a keyboard user encounters. The `sr-only` + `focus:not-sr-only` pattern is the standard Tailwind approach. Layout is a server component, so this is just plain JSX -- no client component needed.

**Confidence:** HIGH -- standard a11y pattern, well-documented in Tailwind docs.

### Pattern 2: Active Navigation with usePathname

**What:** Highlight current page in nav using Next.js `usePathname()` hook.

**Implementation approach in Header.tsx:**
```tsx
import { usePathname } from 'next/navigation'

// Inside Header component:
const pathname = usePathname()

// For each nav item, check if its resolved href matches the current path:
function isActive(item: NavLink): boolean {
  const href = resolveHref(item)
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}
```

**Desktop styling:** Add `border-b-2 border-accent` and `font-bold` (already bold, so this is a noop for weight) when active. Set `aria-current="page"` on the active link element.

**Mobile styling:** Add `border-l-4 border-accent pl-2` for the left accent bar when active. Same `aria-current="page"`.

**Edge case -- nav items with type "external" and URL:** Navigation uses `type: 'external'` with URL strings like `/news`, `/contact-officials`, `/meetings` for collection listing routes (per Phase 9 decision). The `resolveHref()` function returns `item.url` for external type. So pathname comparison works directly: `pathname === href` or `pathname.startsWith(href + '/')`.

**Edge case -- dropdown parent items:** If a dropdown parent's children include the active page, the parent should also appear active. Check if any child's href matches.

**Confidence:** HIGH -- Header.tsx is already a client component with `'use client'`, so `usePathname()` is available without any architectural changes.

### Pattern 3: Lexical Rich Text to Plain Text Extraction

**What:** Traverse Lexical's JSON AST and extract text content for auto-generating excerpts.

**Lexical body structure (from payload-types.ts):**
```typescript
body: {
  root: {
    type: string
    children: { type: any; version: number; [k: string]: unknown }[]
    direction: ('ltr' | 'rtl') | null
    format: string
    indent: number
    version: number
  }
}
```

**Implementation (new file `src/lib/lexicalToPlainText.ts`):**
```typescript
interface LexicalNode {
  type: string
  text?: string
  children?: LexicalNode[]
  [key: string]: unknown
}

export function lexicalToPlainText(body: { root: LexicalNode }): string {
  const texts: string[] = []

  function walk(node: LexicalNode) {
    if (node.type === 'text' && node.text) {
      texts.push(node.text)
    }
    if (node.children) {
      for (const child of node.children) {
        walk(child)
      }
    }
  }

  walk(body.root)
  return texts.join(' ').replace(/\s+/g, ' ').trim()
}

export function getExcerpt(
  body: { root: LexicalNode },
  maxLength = 150,
): string {
  const text = lexicalToPlainText(body)
  if (text.length <= maxLength) return text
  // Truncate at last space before maxLength
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...'
}
```

**Key considerations:**
- Lexical nodes can be deeply nested (paragraphs > text, headings > text, lists > list-items > text)
- Block nodes (PullQuote, Callout, Embed from the rich text editor config) may have their own structure -- the recursive walker handles them as long as they have `children` or `text`
- The upload nodes (inline images) have no text content, so they are naturally skipped
- This runs server-side only (used in the news listing page which is a server component)

**Confidence:** HIGH -- Lexical's JSON structure is well-documented and the recursive text extraction is a standard approach.

### Pattern 4: Footer Client Wrapper for Pathname Detection

**What:** Footer is a server component. The CTA section needs to know the current pathname to conditionally hide buttons linking to the current page.

**Recommended approach:** Extract the CTA section into a small client component wrapper.

```tsx
// src/components/layout/FooterCTA.tsx
'use client'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface CTALink {
  href: string
  label: string
  variant?: 'primary' | 'secondary'
}

const CTA_LINKS: CTALink[] = [
  { href: '/contact-officials', label: 'Contact Officials', variant: 'primary' },
  { href: '/meetings', label: 'Upcoming Meetings', variant: 'secondary' },
]

export function FooterCTA() {
  const pathname = usePathname()
  const visible = CTA_LINKS.filter((link) => link.href !== pathname)

  if (visible.length === 0) return null

  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
      {visible.map((link) => (
        <Button key={link.href} href={link.href} variant={link.variant}>
          {link.label}
        </Button>
      ))}
    </div>
  )
}
```

**Why client wrapper over passing pathname as prop:** The layout.tsx is a server component and cannot use `usePathname()`. Passing pathname from a parent would require making the layout a client component, which defeats RSC benefits. A small client wrapper is the idiomatic Next.js App Router pattern for this use case.

**Confidence:** HIGH -- standard Next.js App Router pattern for mixing server and client components.

### Pattern 5: Payload Collection Field Addition + Migration

**What:** Add `excerpt` textarea field to NewsPosts collection, then run migration.

**In NewsPosts.ts, add after the `title` field:**
```typescript
{
  name: 'excerpt',
  type: 'textarea',
  label: 'Excerpt',
  maxLength: 160,
  admin: {
    description: 'Short summary for news listing cards. If empty, auto-generated from body content.',
  },
},
```

**Migration:** Run `pnpm payload migrate:create` to generate the migration file, then `pnpm payload migrate` to apply it. This adds a nullable `excerpt` column to the `news_posts` table.

**Confidence:** HIGH -- standard Payload 3.x field addition pattern, same as displayName in Phase 9.

### Anti-Patterns to Avoid
- **Making Footer fully client-side:** Do not add `'use client'` to Footer.tsx. Only the CTA section needs pathname awareness. Keep the rest server-rendered.
- **Using router events for active nav:** Do not use `router.events` or `useRouter()` for active detection. `usePathname()` is the correct hook in App Router.
- **Custom focus styles that override browser defaults globally:** Only add custom focus styles where specifically needed (footer on dark background). Do not remove default focus indicators from other elements.
- **Removing pt-16 from main:** The sticky header is h-16 (64px). The pt-16 padding is correct and necessary.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Skip link visibility | Custom JS show/hide | Tailwind `sr-only focus:not-sr-only` | Battle-tested CSS-only pattern, no JS needed |
| Active route detection | Manual URL parsing | `usePathname()` from `next/navigation` | Handles App Router's routing system correctly including parallel routes |
| Rich text to plain text | Regex on HTML string | Recursive AST walker on Lexical JSON | Lexical stores content as JSON AST, not HTML. Regex would fail. |
| Focus ring visibility | Custom JS focus tracking | `focus-visible:ring-2` Tailwind utility | CSS-only, handles mouse vs keyboard focus correctly |

## Common Pitfalls

### Pitfall 1: Navigation Items Using External Type with URL Paths
**What goes wrong:** Active nav detection may fail because nav items for collection routes (News, Meetings, Contact Officials) use `type: 'external'` with URL strings like `/news`, not `type: 'internal'` with page relationships.
**Why it happens:** Phase 9 decision used external type for collection listing routes since those pages are not Payload "Pages" collection items.
**How to avoid:** In the active state check, use `resolveHref()` which already handles both types. Compare the resolved href against `pathname`, not the nav item's type.
**Warning signs:** Active indicator never appears on News, Meetings, or Contact Officials pages.

### Pitfall 2: Byline Falls Back to Email Instead of "BIBB United Staff"
**What goes wrong:** If the author is fetched at insufficient depth, `post.author` is a number (ID) instead of a User object, and the byline shows nothing or crashes.
**Why it happens:** The article page currently uses `depth: 2`, which is sufficient. But if someone changes it, the relationship won't be populated.
**How to avoid:** Keep `depth: 2` on the article query. Add defensive type checking: `typeof post.author === 'object' ? (post.author as User).displayName || 'BIBB United Staff' : 'BIBB United Staff'`.
**Warning signs:** Byline shows "By" with no name, or shows the user ID number.

### Pitfall 3: Skip Link Z-Index Below Header
**What goes wrong:** The skip link appears behind the sticky header when focused.
**Why it happens:** Header is `z-50`. If skip link z-index is lower, it is visually hidden behind the header.
**How to avoid:** Use `z-[100]` on the skip link (higher than header's z-50 and mobile menu's z-[60]).
**Warning signs:** User presses Tab and nothing visible appears, but screen reader announces the skip link.

### Pitfall 4: Lexical Block Nodes Missing from Text Extraction
**What goes wrong:** PullQuote, Callout, and Embed blocks may have text content that doesn't get extracted because their node structure differs from paragraph nodes.
**Why it happens:** Custom Lexical blocks can store text in different properties.
**How to avoid:** The recursive walker handles this if blocks use `children` arrays (standard Lexical pattern). Test with a post containing all block types.
**Warning signs:** Excerpts for posts with pull quotes or callouts are shorter than expected or missing quoted text.

### Pitfall 5: Footer CTA Comparison Fails on Trailing Slashes
**What goes wrong:** `pathname` might be `/meetings/` while the CTA href is `/meetings`, so the string comparison fails.
**Why it happens:** Next.js App Router generally normalizes paths without trailing slashes, but edge cases exist.
**How to avoid:** Normalize both pathname and href by stripping trailing slashes before comparison, or use `pathname.startsWith(href)` with appropriate checks.
**Warning signs:** Footer CTA appears on the page it links to.

## Code Examples

### Existing Byline Code (Current -- Shows Email)
```typescript
// src/app/(frontend)/news/[slug]/page.tsx lines 89-92
const authorName =
  typeof post.author === 'object'
    ? (post.author as User).email
    : ''
```

### Fixed Byline Code
```typescript
const authorName =
  typeof post.author === 'object'
    ? (post.author as User).displayName || 'BIBB United Staff'
    : 'BIBB United Staff'
```

### Current Empty State (Contact Officials -- Minimal)
```tsx
// src/app/(frontend)/contact-officials/page.tsx lines 96-100
{officials.docs.length === 0 && (
  <p className="text-text-secondary">
    No officials have been added yet. Check back soon.
  </p>
)}
```

### Enhanced Empty State Pattern
```tsx
{officials.docs.length === 0 && (
  <div className="text-center py-12 border border-border bg-bg-dominant">
    <h2 className="text-2xl font-heading font-bold uppercase mb-4">
      No Officials Listed Yet
    </h2>
    <p className="text-text-secondary mb-6 max-w-md mx-auto">
      We are working on compiling contact information for your local officials.
      In the meantime, reach out to us directly.
    </p>
    <Button href="/about">Learn How to Get Involved</Button>
  </div>
)}
```

### News Card with Excerpt (News Listing Page)
```tsx
// In the Card children for each news post:
<h2 className="text-xl font-heading font-bold uppercase mb-2">
  {post.title}
</h2>
<p className="text-text-secondary text-sm mb-2 line-clamp-3">
  {post.excerpt || getExcerpt(post.body)}
</p>
<DateDisplay publishDate={post.publishDate} variant="compact" />
```

### Footer Focus Ring Classes
```tsx
// Add to all interactive elements in Footer:
className="... focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
```

The `ring-offset-navy` ensures the offset gap between the ring and element uses the footer's background color, not white.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tabindex="-1"` + JS for skip links | CSS `sr-only` + `focus:not-sr-only` | Tailwind v3+ | Pure CSS, no JS required |
| `:focus` for focus rings | `:focus-visible` | Browser standard 2022+ | Only shows on keyboard navigation, not mouse clicks |
| `useRouter().pathname` (Pages Router) | `usePathname()` (App Router) | Next.js 13+ | Works with React Server Components |
| Slate rich text (Payload v2) | Lexical rich text (Payload v3) | Payload 3.0 | Different AST structure, different text extraction approach |

## Sources

### Primary (HIGH confidence)
- Codebase analysis of all 9 files identified in CONTEXT.md canonical refs
- CONTEXT.md decisions D-01 through D-20 (locked implementation choices)
- UI-UX-REVIEW-2026-03-24.md (source issues H1, H2, H5, M5, M6, M7, M8, L1, L4)

### Secondary (MEDIUM confidence)
- Tailwind CSS `sr-only` / `focus-visible` patterns (standard, well-documented)
- Next.js `usePathname()` hook behavior (standard App Router API)
- Lexical JSON AST structure (observed from payload-types.ts generated types)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all changes use existing project dependencies, no new libraries needed
- Architecture: HIGH - all patterns are standard React/Next.js/Tailwind/Payload approaches
- Pitfalls: HIGH - identified from direct codebase analysis of current implementation

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable patterns, no fast-moving dependencies)
