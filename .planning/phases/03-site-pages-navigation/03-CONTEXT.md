# Phase 3: Site Pages & Navigation - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Public-facing site assembly: homepage with rotating spotlight hero, content page and news post templates, CMS-managed navigation with one-level dropdowns, civic action pages (Contact Your Officials, Meeting Schedule), content freshness signals, and print-friendly article output. Two new Payload collections (Officials, Meetings) are created in this phase. No SEO metadata, no Docker/deployment — those are Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Homepage Layout
- **D-01:** Hero section is a rotating spotlight — editors pick up to 5 featured stories. Auto-rotates every 6-8 seconds, pauses on hover/focus. Arrows and dots for manual navigation.
- **D-02:** Below the hero, a featured + list layout: 1 large featured card on the left, 3-4 smaller list items on the right. Shows the most recent published news posts.
- **D-03:** Below the news, CMS-managed topic callout cards — editors pick 3-4 key pages to feature (e.g., Budget, Meetings, Contact Officials). Each shows an icon/image, title, short blurb, and link. Managed via a Payload Global or homepage-specific fields.

### Navigation Structure
- **D-04:** Sticky header — logo on left, horizontal nav links on right. Fixed at top on scroll. Urgent banner (from Phase 1 UrgentBanner global) renders ABOVE the sticky header when active.
- **D-05:** Mobile navigation: hamburger icon on right side of header. Opens a slide-out panel from the right with nav links and expandable dropdown sections. Overlay dims the page behind it.
- **D-06:** Desktop dropdowns: hover-open with click fallback for keyboard/touch users. Keyboard arrow navigation for accessibility.
- **D-07:** Footer is CTA-heavy — leads with a bold "Get Involved" section with action buttons (Contact Officials, Meetings), then quick links and copyright below. Navy background.
- **D-08:** Navigation menu data managed via Payload — CMS-managed menu items supporting both internal page links and external URLs with one level of sub-items (NAV-01, NAV-02).

### Civic Action Pages
- **D-09:** Officials managed via a dedicated Payload CMS collection with fields: name, role/title, body (select field: "Board of Education", "County Commission", "Water Board", etc.), email, phone, and optional photo. Contact page groups officials by body.
- **D-10:** Meetings managed via a dedicated Payload CMS collection with fields: date, time, location, optional agenda link, and optional notes. Frontend auto-sorts by date — upcoming meetings shown prominently, past meetings in a collapsible "Past Meetings" section below.
- **D-11:** About/Mission page is a standard CMS page accessible from navigation (NAV-03).

### Content Templates
- **D-12:** News post article layout: full-width featured image at top, title (uppercase h1), author + published date + updated date below, rich text body in prose style (65ch max-width), CTA block at bottom of article.
- **D-13:** Static page layout: same centered prose column as news posts, but without featured image, author, or date. Title + rich text body + optional CTA. Clean and consistent.
- **D-14:** Content freshness: show "Published: [date]" and "Updated: [date]" when dates differ on article pages. On homepage cards/lists, show relative time ("2 days ago") for posts < 7 days old, absolute date for older posts.
- **D-15:** Print-friendly: a visible "Print this article" button on news posts and pages that opens a clean print view — hides nav, footer, CTAs, urgent banner; black text on white; URLs shown next to links.

### Claude's Discretion
- Hero spotlight implementation details (CSS transitions vs JS animation library)
- Navigation Global schema design (array of menu items with nested sub-items)
- Homepage topic callouts Global vs homepage-specific field approach
- Responsive breakpoints for featured + list layout collapsing on mobile
- Date formatting with date-fns (relative vs absolute threshold logic)
- Print view implementation (CSS @media print vs separate route)
- Officials collection sort order field (drag-and-drop vs explicit order number)
- Meetings collection fields beyond the specified ones (type/category)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specs
- `.planning/PROJECT.md` — Project vision, constraints, and key decisions
- `.planning/REQUIREMENTS.md` — NAV-01, NAV-02, NAV-03, CIVX-01, CIVX-02, DSGN-03, DSGN-06, DSGN-07 requirements for this phase
- `.planning/ROADMAP.md` — Phase 3 goals and success criteria
- `CLAUDE.md` — Technology stack (Next.js 15, React 19, Tailwind v4, Payload 3.x, date-fns, lucide-react)

### Prior Phase Context
- `.planning/phases/01-cms-foundation/01-CONTEXT.md` — Phase 1 decisions (flat page hierarchy D-04, CTA as collection fields D-11, UrgentBanner global D-12, pnpm D-14, Node 22 LTS D-15)
- `.planning/phases/02-brand-design-system/02-CONTEXT.md` — Phase 2 decisions (dual mode urgent/community D-01/D-02, sharp edges D-13, full-bleed image cards D-15, ALL CAPS h1/h2 D-08, Barlow Condensed + Inter fonts D-06/D-07)

### Technology
- Payload CMS 3.x documentation — Collections, Globals, Local API for frontend data fetching
- Next.js 15 App Router — Server Components for data fetching, Client Components for interactive elements (hero spotlight)
- Tailwind CSS v4 — existing design tokens in `src/app/(frontend)/styles.css`
- `date-fns` — relative time formatting (formatDistanceToNow)
- `lucide-react` — icons for nav, contact info, meeting details

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/Button.tsx` — Primary/secondary button variants with href support. Use for CTAs, nav actions, print button.
- `src/components/ui/Card.tsx` — Border card with optional image and hover accent border. Use for news cards, topic callouts.
- `src/components/ui/Section.tsx` — Content section with default/dark variants and max-w-7xl container. Use for all page sections.
- `src/components/ui/Logo.tsx` — BIBB/UNITED wordmark with mode-aware coloring. Use in header and footer.
- `src/app/(frontend)/styles.css` — Tailwind v4 design tokens, prose styling, dual-mode CSS variables, heading typography rules.
- `src/lib/getTheme.ts` — Fetches SiteTheme mode from Payload. Use in layout for mode switching.

### Established Patterns
- Payload Globals pattern: UrgentBanner and SiteTheme globals in `src/globals/`. Navigation menu will follow same pattern.
- Tailwind v4 CSS-first configuration with `@theme` block and `data-mode` attribute switching.
- `prose` class configured for rich text rendering with accent-colored links and quote borders.
- Dual-mode color tokens: `bg-dominant`, `bg-secondary`, `accent`, `text-primary`, `text-secondary`, `text-on-dark`, `text-on-accent`, `border`.

### Integration Points
- `src/app/(frontend)/layout.tsx` — Add Header and Footer components wrapping `{children}`, render UrgentBanner above header
- `src/app/(frontend)/page.tsx` — Currently the design showcase; will become the homepage
- `src/payload.config.ts` — Register new Officials and Meetings collections, Navigation global
- `src/collections/` — Add Officials.ts and Meetings.ts
- `src/globals/` — Add Navigation.ts (or MainMenu.ts)
- Dynamic routes needed: `src/app/(frontend)/news/[slug]/page.tsx`, `src/app/(frontend)/[slug]/page.tsx`

</code_context>

<specifics>
## Specific Ideas

- Hero spotlight should feel editorial — like a curated front page, not an auto-generated feed
- Officials grouped by body (Board of Education, County Commission, etc.) on the contact page — a simple select field, not a full hierarchy
- Footer CTA section should reinforce the site's advocacy purpose on every page — "Get Involved" is the message
- Past meetings collapse keeps the page clean while preserving civic record

</specifics>

<deferred>
## Deferred Ideas

- **Organizational body/board content type as a full collection** — When the site expands beyond school system issues to other civic topics, consider promoting the "body" select field to a full Bodies/Organizations collection with its own pages, linked officials, and linked meetings. Not needed for v1 where school board is the primary focus.

</deferred>

---

*Phase: 03-site-pages-navigation*
*Context gathered: 2026-03-24*
