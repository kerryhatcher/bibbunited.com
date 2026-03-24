# Phase 1: CMS Foundation - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Payload CMS collections, PostgreSQL database, and editorial workflow for managing all site content types. Editors can create, edit, and manage pages, news posts, CTAs, and a site-wide urgent banner through the Payload admin panel. No public-facing frontend rendering — that's Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Content Model Structure
- **D-01:** Draft/publish workflow enabled — editors save drafts, preview, then explicitly publish. Use Payload's built-in draft/versions support.
- **D-02:** URL slugs auto-generated from title with manual override capability.
- **D-03:** News posts track author (selected from CMS users) for credibility on civic content.
- **D-04:** Pages use a flat hierarchy — no parent/child nesting. Navigation (Phase 3) provides the organizational structure.

### Rich Text Editor Features
- **D-05:** Lexical editor configured with pull quotes / callout boxes for emphasizing key statements.
- **D-06:** Inline images with captions and alt text within article body.
- **D-07:** Embedded content support (YouTube videos, iframes) for board meeting recordings and external media.
- **D-08:** Table support for structured data (budget line items, vote tallies, comparisons).
- **D-09:** Horizontal rule / section dividers for breaking long-form explainers into visual sections.
- **D-10:** Standard formatting: bold, italic, headings, links, ordered/unordered lists.

### CTA Block Approach
- **D-11:** Call-to-action implemented as dedicated fields on the Page and News Post collections (not as a Lexical inline block). CTA text + link fields at the collection level ensure consistent placement and editors never forget to add one.

### Urgent Banner
- **D-12:** Site-wide urgent banner implemented as a Payload Global with simple on/off toggle, message text field, and optional link. No severity levels — one style, just active or inactive.

### Project Scaffolding
- **D-13:** Project initialized via `create-payload-app` (official Payload scaffolding). Clean up any Tailwind v3 config or unnecessary boilerplate after generation.
- **D-14:** Package manager: pnpm.
- **D-15:** Node.js target: 22 LTS (pin in `.nvmrc` and Dockerfile).

### Claude's Discretion
- Media collection configuration (image sizes, formats, upload constraints)
- Database migration strategy and seed data approach
- ESLint/Prettier configuration details
- File/directory organization within the scaffolded project

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specs
- `.planning/PROJECT.md` — Project vision, constraints, and key decisions
- `.planning/REQUIREMENTS.md` — v1 requirements with traceability to phases (CONT-01 through CONT-05, DEPLOY-04 for this phase)
- `.planning/ROADMAP.md` — Phase goals and success criteria
- `CLAUDE.md` — Technology stack details, version constraints, and what NOT to use

### Technology
- Payload CMS 3.x official documentation (payloadcms.com/docs) — collections, globals, Lexical editor, draft/versions, db-postgres adapter
- Next.js 15.x App Router documentation (nextjs.org/docs)
- Tailwind CSS v4 documentation — CSS-first configuration (no tailwind.config.js)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing code — greenfield project. Phase 1 establishes all foundational patterns.

### Established Patterns
- None yet. This phase sets the conventions for all subsequent phases.

### Integration Points
- PostgreSQL database (DEPLOY-04) — connection configured via environment variables
- Payload admin panel at `/admin` — built into the Next.js app, no separate server

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches within the decisions captured above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-cms-foundation*
*Context gathered: 2026-03-24*
