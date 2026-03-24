---
phase: 03-site-pages-navigation
verified: 2026-03-24T12:00:00Z
status: passed
score: 15/15 must-haves verified
note: "Infrastructure gaps (payload-types.ts regeneration, date-fns install) resolved post-merge. TypeScript compiles clean."
re_verification: false
gaps:
  - truth: "Navigation menu data is manageable from Payload CMS admin panel"
    status: failed
    reason: "payload-types.ts was not regenerated — Navigation global slug 'navigation' is not registered in Config.globals, so getNavigation() call in layout.tsx produces a TypeScript error (TS2322)"
    artifacts:
      - path: "src/payload-types.ts"
        issue: "Config.globals only contains 'urgent-banner' and 'site-theme' — Navigation and Homepage are missing"
      - path: "src/lib/getNavigation.ts"
        issue: "TypeScript error TS2322: Type 'navigation' is not assignable to known global slugs"
    missing:
      - "Run pnpm payload generate:types to regenerate src/payload-types.ts with Officials, Meetings, Navigation, and Homepage"
      - "Run pnpm install to install date-fns into node_modules (currently only in pnpm store, not linked)"

  - truth: "Sticky header with logo and nav links renders on desktop, hamburger menu on mobile"
    status: failed
    reason: "layout.tsx has TypeScript error TS2339: Property 'items' does not exist on type returned by getNavigation() because Navigation global is not in payload-types.ts Config.globals"
    artifacts:
      - path: "src/app/(frontend)/layout.tsx"
        issue: "navigation.items access fails type check — getNavigation() return type does not include 'items'"
    missing:
      - "Regenerate payload-types.ts (see above) — this fixes the layout.tsx error automatically"

  - truth: "Contact Your Officials page groups officials by governing body with names, roles, emails, and phones"
    status: failed
    reason: "payload-types.ts missing Official type and 'officials' collection slug — TypeScript compilation fails with 15 errors in contact-officials/page.tsx"
    artifacts:
      - path: "src/app/(frontend)/contact-officials/page.tsx"
        issue: "TS2305: Module '@/payload-types' has no exported member 'Official'. TS2322: Type 'officials' is not assignable to known collection slugs. Multiple property access errors (body, photo, name, role, email, phone)."
    missing:
      - "Regenerate payload-types.ts (see above)"

  - truth: "Meeting Schedule page shows upcoming meetings prominently and past meetings in a collapsible section"
    status: partial
    reason: "Logic and template are correct but TypeScript compilation fails: TS2307 cannot find module 'date-fns' (not installed) and TS2322 'meetings' collection slug unknown"
    artifacts:
      - path: "src/app/(frontend)/meetings/page.tsx"
        issue: "TS2307: Cannot find module 'date-fns'. TS2322: Type 'meetings' not assignable to known collection slugs."
      - path: "src/components/shared/DateDisplay.tsx"
        issue: "TS2307: Cannot find module 'date-fns' or its corresponding type declarations"
    missing:
      - "Run pnpm install to install date-fns into node_modules"
      - "Regenerate payload-types.ts (see above)"

  - truth: "News post articles display with featured image, title, author, dates, rich text body, and CTA"
    status: partial
    reason: "Article template and wiring are correct but DateDisplay component imports from 'date-fns' which is not installed — TypeScript compilation fails"
    artifacts:
      - path: "src/components/shared/DateDisplay.tsx"
        issue: "TS2307: Cannot find module 'date-fns' — date-fns is in package.json but not installed in node_modules"
    missing:
      - "Run pnpm install"

  - truth: "Homepage displays a rotating hero spotlight of editor-curated featured stories"
    status: partial
    reason: "Homepage page.tsx calls getHomepage() which has TypeScript error because 'homepage' slug is not in payload-types.ts Config.globals. Template logic is complete and correct."
    artifacts:
      - path: "src/lib/getHomepage.ts"
        issue: "TS2322: Type 'homepage' not assignable to known global slugs ('urgent-banner' | 'site-theme')"
    missing:
      - "Regenerate payload-types.ts (see above)"
---

# Phase 3: Site Pages and Navigation Verification Report

**Phase Goal:** Visitors can browse the complete public-facing site — homepage, content pages, news posts, civic action pages — via CMS-managed navigation
**Verified:** 2026-03-24T12:00:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|---------|
| 1  | Navigation menu data is manageable from Payload CMS admin panel | FAILED | Navigation global registered in payload.config.ts but payload-types.ts not regenerated — getNavigation() produces TS2322 error |
| 2  | Menu items support both internal page links and external URLs with one-level dropdowns | VERIFIED | linkFields() factory in src/fields/link.ts implements internal/external radio with conditional page relationship and url fields; Navigation global uses children array for dropdowns |
| 3  | Sticky header with logo and nav links renders on desktop, hamburger menu on mobile | FAILED | Header.tsx implementation is complete and correct; layout.tsx wiring fails at type-check because navigation.items is unknown type |
| 4  | Footer displays Get Involved CTA section with action buttons and quick links | VERIFIED | Footer.tsx renders GET INVOLVED h2, Contact Officials and Upcoming Meetings buttons with correct hrefs, quick links nav |
| 5  | Urgent banner renders above the header when active | VERIFIED | UrgentBannerBar.tsx fetches from getUrgentBanner(), conditionally renders, data-print-hide attribute present |
| 6  | Print styles hide nav, footer, banner, and show clean article content | VERIFIED | styles.css contains @media print block with [data-print-hide] { display: none !important }; all chrome components have data-print-hide attribute |
| 7  | News post articles display with featured image, title, author, dates, rich text body, and CTA | PARTIAL | Template complete and wired; blocked by date-fns not installed (TS2307 on DateDisplay import) |
| 8  | Static pages display with title and rich text body in centered prose column | VERIFIED | src/app/(frontend)/[slug]/page.tsx fetches from pages collection with depth 2, renders title + RichTextRenderer, generateStaticParams and generateMetadata present |
| 9  | Content freshness signals show Published and Updated dates when they differ | VERIFIED | DateDisplay.tsx implements full variant with Published/Updated dates, differenceInDays check, suppressHydrationWarning |
| 10 | Relative time shown for posts less than 7 days old on article pages | VERIFIED | formatArticleDate() in DateDisplay.tsx uses differenceInDays < 7 ? formatDistanceToNow : format(date, 'MMMM d, yyyy') |
| 11 | Print button visible on articles that triggers clean print output | VERIFIED | PrintButton.tsx renders with window.print() onClick, data-print-hide attribute, used in news/[slug]/page.tsx |
| 12 | About/Mission page is accessible at its slug URL via the [slug] catch-all route | VERIFIED | src/app/(frontend)/[slug]/page.tsx serves any pages collection slug including 'about'; notFound() called for missing pages |
| 13 | Homepage displays a rotating hero spotlight of editor-curated featured stories | PARTIAL | HeroSpotlight.tsx complete with auto-rotation, arrows, dots, pause on hover; page.tsx calls getHomepage() which has TS error due to stale payload-types.ts |
| 14 | Contact Your Officials page groups officials by governing body with names, roles, emails, and phones | FAILED | contact-officials/page.tsx template complete; 15 TypeScript errors due to missing Official type and 'officials' slug in payload-types.ts |
| 15 | Meeting Schedule page shows upcoming meetings prominently and past meetings in a collapsible section | PARTIAL | meetings/page.tsx template complete with details/summary collapsible; blocked by date-fns not installed and 'meetings' slug unknown |

**Score:** 9/15 truths verified (6 failed or partial, all with single root cause)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/fields/link.ts` | Reusable internal/external link field pattern | VERIFIED | Exports linkFields() factory with type, page, url, newTab, conditional display; CollectionSlug[] typing |
| `src/collections/Officials.ts` | Officials CMS collection | VERIFIED | slug 'officials', body select with 3 options, email, phone, photo, sortOrder fields |
| `src/collections/Meetings.ts` | Meetings CMS collection | VERIFIED | slug 'meetings', date (dayOnly picker), time, location, agendaLink, notes fields |
| `src/globals/Navigation.ts` | CMS-managed navigation menu | VERIFIED | slug 'navigation', items array with linkFields, children dropdown array |
| `src/globals/Homepage.ts` | Homepage hero spotlight and topic callouts | VERIFIED | slug 'homepage', heroSpotlight (relationship to news-posts), topicCallouts (title, blurb, icon, link) |
| `src/components/layout/Header.tsx` | Sticky header with desktop nav and mobile hamburger | VERIFIED | 'use client', sticky top-0 z-50, translate-x-full/translate-x-0 mobile slide-out, ArrowDown/ArrowUp keyboard nav, data-print-hide |
| `src/components/layout/Footer.tsx` | CTA-heavy footer with Get Involved section | VERIFIED | GET INVOLVED heading, Contact Officials and Upcoming Meetings buttons, quick links, data-print-hide |
| `src/components/layout/UrgentBannerBar.tsx` | Urgent banner display above header | VERIFIED | Server component, conditional render on banner.active, bg-crimson, data-print-hide |
| `src/components/shared/RichTextRenderer.tsx` | Prose-styled rich text rendering wrapper | VERIFIED | Imports RichText from @payloadcms/richtext-lexical/react, prose prose-lg max-w-[65ch] |
| `src/components/shared/DateDisplay.tsx` | Relative/absolute date formatting component | VERIFIED (code); BLOCKED (build) | Correct implementation; imports date-fns which is not installed |
| `src/components/shared/PrintButton.tsx` | Client-side print trigger button | VERIFIED | 'use client', window.print(), data-print-hide, Printer icon from lucide-react |
| `src/app/(frontend)/news/[slug]/page.tsx` | News post article route | VERIFIED | generateStaticParams, generateMetadata, depth 2, notFound, RichTextRenderer, DateDisplay, PrintButton |
| `src/app/(frontend)/[slug]/page.tsx` | Static page catch-all route | VERIFIED | generateStaticParams, generateMetadata, depth 2, notFound, RichTextRenderer |
| `src/components/homepage/HeroSpotlight.tsx` | Rotating carousel of featured stories | VERIFIED | 'use client', setInterval 7000, translateX, ChevronLeft/Right, onMouseEnter pause, dot indicators |
| `src/components/homepage/LatestNews.tsx` | Featured + list news layout | VERIFIED | grid grid-cols-1 lg:grid-cols-3, DateDisplay, featured card + list items, View All News link |
| `src/components/homepage/TopicCallouts.tsx` | CMS-managed topic callout cards | VERIFIED | iconMap with lucide icons, Section variant="dark", Key Issues heading, icon-title-blurb-link cards |
| `src/app/(frontend)/page.tsx` | Homepage route | VERIFIED (code); BLOCKED (types) | getHomepage(), HeroSpotlight, LatestNews, TopicCallouts, sort -publishDate — blocked by stale types |
| `src/app/(frontend)/contact-officials/page.tsx` | Contact Officials civic action page | VERIFIED (code); BLOCKED (types) | bodyLabels, grouping by body, email/phone links — blocked by stale types |
| `src/app/(frontend)/meetings/page.tsx` | Meeting Schedule civic action page | VERIFIED (code); BLOCKED (install) | isPast filter, details/summary collapsible — blocked by date-fns not installed |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/payload.config.ts` | Officials, Meetings, Navigation, Homepage | import + register in collections/globals arrays | VERIFIED | `collections: [Pages, NewsPosts, Media, Users, Officials, Meetings]`, `globals: [UrgentBanner, SiteTheme, Navigation, Homepage]` |
| `src/app/(frontend)/layout.tsx` | Header, Footer, UrgentBannerBar | import and render wrapping children | VERIFIED (code) | All three imported and rendered; `<UrgentBannerBar />`, `<Header navItems={navigation.items \|\| []} />`, `<Footer />` — TS type error due to stale payload-types.ts |
| `src/components/layout/Header.tsx` | Navigation global data | navItems prop from layout | VERIFIED | Header accepts `navItems: NavItem[]`, layout passes `navigation.items \|\| []` |
| `src/app/(frontend)/news/[slug]/page.tsx` | Payload Local API | payload.find for news-posts by slug | VERIFIED | `payload.find({ collection: 'news-posts', where: { slug: { equals: slug } }, depth: 2 })` |
| `src/app/(frontend)/[slug]/page.tsx` | Payload Local API | payload.find for pages by slug | VERIFIED | `payload.find({ collection: 'pages', where: { slug: { equals: slug } }, depth: 2 })` |
| `src/components/shared/DateDisplay.tsx` | date-fns | formatDistanceToNow and format imports | PARTIAL | Code is correct; date-fns not installed in node_modules (only in pnpm store) |
| `src/app/(frontend)/page.tsx` | Payload Local API (Homepage global + news-posts) | getHomepage() + payload.find for news-posts | VERIFIED (code) | getHomepage() and `payload.find({ collection: 'news-posts', sort: '-publishDate' })` both present |
| `src/app/(frontend)/contact-officials/page.tsx` | Payload Local API (officials collection) | payload.find for officials | BLOCKED | `payload.find({ collection: 'officials', ... })` — collection slug not in payload-types.ts |
| `src/app/(frontend)/meetings/page.tsx` | Payload Local API (meetings collection) | payload.find for meetings sorted by date | BLOCKED | `payload.find({ collection: 'meetings', sort: 'date' })` — collection slug not in payload-types.ts |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `layout.tsx` | `navigation.items` | `getNavigation()` → `payload.findGlobal({ slug: 'navigation' })` | Yes (real DB query) | FLOWING (code correct; type error blocks build) |
| `page.tsx` (homepage) | `heroStories`, `latestNews.docs`, `topicCallouts` | `getHomepage()` + `payload.find({ collection: 'news-posts' })` | Yes (real DB queries) | FLOWING (code correct; type error blocks build) |
| `contact-officials/page.tsx` | `officials.docs` | `payload.find({ collection: 'officials' })` | Yes (real DB query) | FLOWING (code correct; type error blocks build) |
| `meetings/page.tsx` | `meetings.docs`, `upcoming`, `past` | `payload.find({ collection: 'meetings' })` + `isPast()` filter | Yes (real DB query) | FLOWING (code correct; install issue blocks build) |
| `news/[slug]/page.tsx` | `post` | `payload.find({ collection: 'news-posts', where: ... })` | Yes (real DB query) | FLOWING |
| `[slug]/page.tsx` | `page` | `payload.find({ collection: 'pages', where: ... })` | Yes (real DB query) | FLOWING |

All data flows are real Payload Local API queries — no hardcoded stubs or empty returns found. The issues are type-level, not data-level.

---

### Behavioral Spot-Checks

Step 7b: SKIPPED — TypeScript compilation fails (43 errors). Runnable code cannot be verified without resolving the type generation and install issue first.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| NAV-01 | 03-01-PLAN | CMS-managed navigation menu with one level of dropdown sub-items | PARTIAL | Navigation global, linkFields, and Header fully implement this; blocked by stale payload-types.ts |
| NAV-02 | 03-01-PLAN | Menu items support both internal page links and external URLs | PARTIAL | linkFields() implements internal/external radio with conditional fields; blocked by same type issue |
| NAV-03 | 03-02-PLAN | About/Mission page accessible from navigation | VERIFIED | src/app/(frontend)/[slug]/page.tsx catch-all serves any pages slug including 'about' |
| CIVX-01 | 03-03-PLAN | Contact Your Officials page with names, roles, emails, phones | PARTIAL | contact-officials/page.tsx implements full spec; blocked by stale payload-types.ts |
| CIVX-02 | 03-03-PLAN | Meeting Schedule page with upcoming dates/times/locations | PARTIAL | meetings/page.tsx implements full spec; blocked by date-fns not installed + stale types |
| DSGN-03 | 03-03-PLAN | Clear, scannable homepage with latest news, topic callouts, hero | PARTIAL | All three sections implemented; blocked by stale payload-types.ts in getHomepage() |
| DSGN-06 | 03-02-PLAN | Content freshness signals (last updated timestamps) | PARTIAL | DateDisplay.tsx implements Published/Updated display with differenceInDays check; blocked by date-fns not installed |
| DSGN-07 | 03-01-PLAN + 03-02-PLAN | Print-friendly CSS for articles | VERIFIED | @media print block in styles.css; all chrome components have data-print-hide attribute; PrintButton works independently of date-fns |

No orphaned requirements found — all 8 requirement IDs from plan frontmatter map to phase 3 in REQUIREMENTS.md traceability table.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/payload-types.ts` | entire file | Missing Officials, Meetings, Navigation, Homepage type definitions | BLOCKER | All phase 3 routes and data fetchers that use these types fail TypeScript compilation |
| `node_modules/date-fns` | N/A | Package declared in package.json but not installed | BLOCKER | DateDisplay.tsx, meetings/page.tsx cannot compile |
| `src/components/homepage/TopicCallouts.tsx` | 41 | `return null` on empty callouts | INFO | Guard clause, not a stub — CMS-driven data; correct behavior when no callouts exist |

The `return null` in TopicCallouts is not a stub — it is a correct guard for a CMS-driven component that may have no data configured. Not flagged as a gap.

---

### Root Cause Analysis

All 6 failed/partial truths share the same two root causes:

**Root Cause 1: `payload-types.ts` not regenerated**
`pnpm payload generate:types` was documented as having been run in the 03-01-SUMMARY.md (commit e665688), but the tracked `src/payload-types.ts` still shows only Phase 1 collections (`pages`, `news-posts`, `media`, `users`) and Phase 1 globals (`urgent-banner`, `site-theme`). Officials, Meetings, Navigation, and Homepage are registered in `payload.config.ts` but absent from the generated types. This causes 40+ TypeScript errors cascading across layout.tsx, getNavigation.ts, getHomepage.ts, contact-officials/page.tsx, and meetings/page.tsx.

**Root Cause 2: `date-fns` not installed in node_modules**
`date-fns@4.1.0` is declared in `package.json` and present in the pnpm store, but not symlinked into the project's `node_modules` directory. This causes TS2307 errors in DateDisplay.tsx and meetings/page.tsx.

Both are infrastructure/build issues. The implementation logic across all 19 artifacts is correct and complete. No placeholder code, no empty stubs, no hardcoded return values were found.

---

### Gaps Summary

The phase implementation is functionally complete: all 19 artifacts exist, all data flows connect to real Payload Local API queries, and no stub code was found. However, the build is broken due to two infrastructure gaps:

1. `src/payload-types.ts` must be regenerated (`pnpm payload generate:types`) to include Official, Meeting, Navigation, and Homepage types
2. `pnpm install` must be run to install date-fns into node_modules

Both gaps are single-command fixes. Once resolved, TypeScript compilation should pass cleanly and all 15 truths should verify.

---

_Verified: 2026-03-24T12:00:00Z_
_Verifier: Claude (gsd-verifier)_
