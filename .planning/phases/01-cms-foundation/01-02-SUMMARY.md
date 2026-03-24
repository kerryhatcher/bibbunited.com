---
phase: 01-cms-foundation
plan: 02
subsystem: cms
tags: [payload-cms, lexical, rich-text, collections, drafts]

# Dependency graph
requires:
  - phase: 01-01
    provides: Payload CMS project skeleton, slug field, CTA field, Media and Users collections
provides:
  - PullQuote, Callout, and Embed Lexical blocks for rich text editing
  - Shared richTextEditor configuration with all D-05 through D-10 features
  - Pages collection with drafts, slug, rich text, CTA
  - NewsPosts collection with drafts, slug, author, publishDate, featuredImage, rich text, CTA
affects: [01-03, 02-01, 03-01]

# Tech tracking
tech-stack:
  added: []
  patterns: [Lexical BlocksFeature for custom blocks, shared editor config module, draft/publish access control, collection-level CTA fields]

key-files:
  created:
    - src/blocks/PullQuote.ts
    - src/blocks/Callout.ts
    - src/blocks/Embed.ts
    - src/editors/richText.ts
    - src/collections/Pages.ts
    - src/collections/NewsPosts.ts
  modified:
    - src/payload.config.ts

key-decisions:
  - "Embed block implemented as BlocksFeature block with URL field (not a custom Lexical node) per research recommendation"
  - "HeadingFeature restricts to h2/h3/h4 -- h1 reserved for page title (D-10)"
  - "Access control filters unpublished content for non-authenticated users on both collections"

patterns-established:
  - "Lexical blocks defined in src/blocks/ as named Block exports"
  - "Shared editor configs in src/editors/ imported by collections"
  - "Draft/publish with autosave (1500ms) and schedulePublish on content collections"
  - "Access control pattern: authenticated users see all, public sees only published"

requirements-completed: [CONT-01, CONT-02, CONT-03, CONT-05]

# Metrics
duration: 2min
completed: 2026-03-24
---

# Phase 1 Plan 02: Content Collections Summary

**Lexical editor with PullQuote/Callout/Embed blocks, Pages and NewsPosts collections with draft/publish workflow, auto-slug, and CTA fields**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-24T06:00:00Z
- **Completed:** 2026-03-24T06:02:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Three Lexical editor blocks (PullQuote, Callout, Embed) for rich civic content editing
- Shared rich text editor config with headings, inline images, tables, horizontal rules, and fixed toolbar
- Pages collection with title, auto-slug, rich text content, CTA, and draft/publish workflow
- NewsPosts collection with title, auto-slug, author relationship, publish date, featured image, rich text body, CTA, and draft/publish workflow

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Lexical editor blocks and shared rich text editor config** - `f446952` (feat)
2. **Task 2: Create Pages and NewsPosts collections with drafts, slugs, CTAs, and rich text** - `dd55f45` (feat)

## Files Created/Modified
- `src/blocks/PullQuote.ts` - Pull quote block with quote (textarea) and attribution (text) fields
- `src/blocks/Callout.ts` - Callout box block with content (textarea) and type selector (info/warning/action)
- `src/blocks/Embed.ts` - Embedded content block with URL and caption fields
- `src/editors/richText.ts` - Shared Lexical editor config with all D-05 through D-10 features
- `src/collections/Pages.ts` - Pages collection with drafts, slug, rich text, CTA (flat hierarchy per D-04)
- `src/collections/NewsPosts.ts` - News posts collection with author, publishDate, featuredImage, rich text body, CTA
- `src/payload.config.ts` - Updated to register Pages and NewsPosts collections

## Decisions Made
- Embed block uses a simple URL text field with caption, implemented as a BlocksFeature block rather than a custom Lexical node (simpler, officially supported approach)
- HeadingFeature restricted to h2/h3/h4 since h1 is reserved for the page title set at the collection level
- Both collections use identical access control: authenticated users see all documents, public users only see published content

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Pages and NewsPosts collections ready for content creation via Payload admin panel
- Rich text editor configured with all required editorial features
- Plan 03 (UrgentBanner global) can proceed -- `src/globals/` directory exists from Plan 01
- Phase 2 frontend rendering can reference these collections for data fetching

---
*Phase: 01-cms-foundation*
*Completed: 2026-03-24*
