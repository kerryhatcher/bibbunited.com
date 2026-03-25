# Phase 11: Accessibility, Layout & UX Polish - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

The site meets WCAG 2.1 AA for keyboard navigation and document structure, and content presentation gives users the context they need to act. Delivers: skip-to-content link, homepage H1, active nav indicators, author bylines with display names, news card excerpts, empty state messaging for civic pages, footer focus indicators, footer CTA conditional rendering, and main content spacing verification. Requirements: A11Y-01, A11Y-02, A11Y-04, UX-01, UX-02, UX-03, UX-04, UX-05, UX-06.

</domain>

<decisions>
## Implementation Decisions

### Skip Link & Document Structure
- **D-01:** Skip-to-content link is hidden by default and slides into view at top of page when user presses Tab. Standard a11y pattern (sr-only positioning, visible on :focus).
- **D-02:** Skip link targets `<main id="main-content">` -- add `id="main-content"` to the existing `<main>` tag in `layout.tsx`. Link href is `#main-content`.
- **D-03:** Homepage gets a visually hidden (sr-only) H1 at the top of the page content, e.g., "BIBB United -- Civic Advocacy for the BIBB Community". Screen readers get document structure; visual design unchanged.

### Active Navigation
- **D-04:** Desktop: active nav item gets bold text weight and a colored bottom border. `aria-current="page"` attribute set on the active link for screen readers.
- **D-05:** Mobile slide-out menu: active nav item gets bold text and a left accent bar (vertical layout adaptation of the desktop bottom border). Same `aria-current="page"` attribute.
- **D-06:** Active state detection uses `usePathname()` to match current route against nav item hrefs.

### Bylines
- **D-07:** Article bylines show "By [displayName]" next to publish date. Falls back to "By BIBB United Staff" when displayName is empty. No role field -- display name only.
- **D-08:** Bylines use the `displayName` field added to Users collection in Phase 9 (D-11). No schema changes needed.

### News Excerpts
- **D-09:** Add an optional `excerpt` textarea field to the NewsPost collection. Max length 160 characters. Editors can write custom summaries for any post.
- **D-10:** When excerpt field is empty, auto-extract ~150 characters of plain text from the Lexical rich text body as fallback. This requires a utility function to strip Lexical nodes to plain text and truncate.
- **D-11:** Excerpts display on news listing page cards only (`/news` page). Article detail pages show full body content -- no excerpt there.
- **D-12:** This requires a Payload DB migration to add the excerpt column to the news_posts table.

### Empty States
- **D-13:** Empty civic pages (Officials with no officials, Meetings with no meetings) show actionable messaging with a CTA link. E.g., "No upcoming meetings listed yet. Check back soon or contact us to learn more." with a link to the contact page.
- **D-14:** Empty state messaging matches the site's activist tone -- encouraging, not passive.

### Spacing & Layout
- **D-15:** Keep `pt-16` on `<main>` -- the sticky header (h-16 = 4rem = 64px) requires exactly this padding. Verify across all page types (homepage, news listing, news detail, generic pages, civic pages) that content sits cleanly below header with no overlap or excess gap.
- **D-16:** The UI review's concern about "excessive spacing" was incorrect -- pt-16 matches the header height exactly.

### Footer Focus Indicators
- **D-17:** Footer links get gold/accent color focus rings on the dark navy background. Implemented via `focus-visible:ring-2` with the site's accent color variable. High contrast against navy, matches brand.
- **D-18:** Apply to all interactive elements in the footer: links, CTA button, and any other focusable elements.

### Footer CTA
- **D-19:** Footer CTA button is hidden (not rendered) when the user is already on the page the CTA links to. Requires reading the current pathname and comparing against the CTA's href.
- **D-20:** Footer is a server component, so current-page detection needs the pathname passed down or the Footer converted to a client component (or a client wrapper for the CTA section).

### Claude's Discretion
- Exact sr-only H1 text wording for the homepage
- Skip link visual transition animation (slide-in vs fade-in)
- Accent color shade for active nav bottom border and left bar
- Lexical-to-plain-text extraction implementation details
- Empty state exact copy and CTA link targets
- Whether Footer needs a client component wrapper or can use a different pattern for pathname detection
- Plan structure: how to split these 9 requirements into logical plan groupings

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### UI/UX Review (source of all v1.1 issues)
- `UI-UX-REVIEW-2026-03-24.md` -- Issues H1 (missing H1), H2 (skip-to-content), H5 (admin email bylines), M1 (duplicate titles), M5 (layout spacing), M6 (empty states), M7 (news excerpts), M8 (active nav indicator), L1 (footer self-link), L4 (footer focus rings)

### Requirements
- `.planning/REQUIREMENTS.md` -- A11Y-01, A11Y-02, A11Y-04, UX-01, UX-02, UX-03, UX-04, UX-05, UX-06

### Prior Phase Context
- `.planning/phases/09-foundation-config/09-CONTEXT.md` -- D-11 (displayName field optional, fallback to "BIBB United Staff"), D-13 (seed user displayName set)
- `.planning/phases/10-component-migration-visual-fixes/10-CONTEXT.md` -- D-14 (inert attribute on mobile panel), D-15 (focus trap when menu open)

### Key Files to Modify
- `src/app/(frontend)/layout.tsx` -- Add skip link, add id="main-content" to `<main>`, verify pt-16 spacing
- `src/app/(frontend)/page.tsx` -- Add sr-only H1 to homepage
- `src/components/layout/Header.tsx` -- Active nav indicator (desktop + mobile), pathname detection
- `src/components/layout/Footer.tsx` -- Focus indicators on links, conditional CTA rendering
- `src/collections/NewsPosts.ts` -- Add excerpt field
- `src/app/(frontend)/news/page.tsx` -- Display excerpts on news cards
- `src/app/(frontend)/news/[slug]/page.tsx` -- Byline with displayName
- `src/app/(frontend)/contact-officials/page.tsx` -- Empty state handling
- `src/app/(frontend)/meetings/page.tsx` -- Empty state handling

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `displayName` field already exists on Users collection (Phase 9) -- just need to read it in news post queries with depth
- `useFocusTrap` hook co-located in Header.tsx (Phase 10) -- may inform focus management patterns
- Button component is Link-aware (Phase 10 D-02) -- reuse for CTA links in empty states
- `resolveHref()` function in Header.tsx -- converts NavLink to URL string, useful for active nav detection

### Established Patterns
- Navigation uses `type: 'internal' | 'external'` with page relationship or URL string
- News posts have `author` relationship to Users (already populated at depth: 1 in queries)
- Layout uses server components; Header is a client component (`'use client'`)
- Footer is currently a server component -- CTA path detection may need a client wrapper
- Tailwind v4 CSS-first config with CSS variables for colors (--color-accent, --color-text-on-dark)

### Integration Points
- `layout.tsx` is the entry point for skip link and main content ID changes
- `page.tsx` (homepage) renders components directly -- H1 goes at top of JSX return
- Header.tsx already receives `navItems` prop -- active state detection is a client-side concern using `usePathname()`
- News post queries already include `depth: 1` which populates the author relationship -- displayName accessible via `post.author.displayName`

</code_context>

<specifics>
## Specific Ideas

- Active nav: desktop gets bottom border (horizontal), mobile gets left accent bar (vertical) -- both use the site's gold accent color for brand consistency
- Footer focus rings use the same gold accent color as active nav indicators -- cohesive focus/active styling language across the site
- Empty state CTAs should link to the Contact Officials page or a general "Get Involved" call-to-action, matching the site's activist purpose
- Excerpt auto-fallback ensures every news card has preview text even if editors don't write custom excerpts -- reduces editorial burden for the 2-3 person team

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 11-accessibility-layout-ux-polish*
*Context gathered: 2026-03-24*
