# Phase 1: CMS Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 01-cms-foundation
**Areas discussed:** Content model structure, Rich text editor features, CTA & banner approach, Project scaffolding

---

## Content Model Structure

### Draft/Publish Workflow

| Option | Description | Selected |
|--------|-------------|----------|
| Draft/Publish workflow | Editors save drafts, preview content, then explicitly publish. Payload has built-in draft support with versions. | ✓ |
| Publish immediately | Content goes live as soon as it's saved. Simpler, but no safety net. | |
| You decide | Claude picks the best approach. | |

**User's choice:** Draft/Publish workflow
**Notes:** Recommended for small team where mistakes could be public.

### URL Slugs

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-generate from title | Slug auto-fills from the title but editors can manually override. | ✓ |
| Manual entry only | Editors type the slug themselves every time. | |
| You decide | Claude picks. | |

**User's choice:** Auto-generate from title
**Notes:** Standard CMS pattern.

### Author Tracking

| Option | Description | Selected |
|--------|-------------|----------|
| Track author per post | Each news post shows who wrote it. Author selected from CMS users. | ✓ |
| No author tracking | Posts appear as 'BIBB United' with no individual attribution. | |
| You decide | Claude picks based on civic advocacy best practices. | |

**User's choice:** Track author per post
**Notes:** Builds credibility for civic content.

### Page Hierarchy

| Option | Description | Selected |
|--------|-------------|----------|
| Flat pages | All pages at top level. Navigation provides hierarchy. Good for <50 pages. | ✓ |
| Nested pages | Pages can have parent pages, creating URL paths. More organized but adds complexity. | |
| You decide | Claude picks based on site scale. | |

**User's choice:** Flat pages
**Notes:** Simpler content model; navigation (Phase 3) provides hierarchy.

---

## Rich Text Editor Features

### Editor Blocks

| Option | Description | Selected |
|--------|-------------|----------|
| Pull quotes / callout boxes | Highlighted text blocks for key statements. Essential for activist content. | ✓ |
| Inline images with captions | Images within article body with captions and alt text. | ✓ |
| Embedded content (YouTube, iframes) | Embed videos of board meetings, external maps, or other media. | ✓ |
| You decide | Claude selects the right set. | |

**User's choice:** All three — Pull quotes, Inline images, Embedded content
**Notes:** Full editorial toolkit selected.

### Tables

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, include tables | Tables for budget breakdowns, vote records, comparison data. | ✓ |
| No tables | Keep editor simpler; use lists instead. | |
| You decide | Claude decides. | |

**User's choice:** Yes, include tables
**Notes:** Important for civic content with structured data.

### Horizontal Dividers

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, include dividers | Editors can break long articles into visual sections. | ✓ |
| You decide | Claude decides. | |

**User's choice:** Yes, include dividers
**Notes:** Useful for long-form explainers.

---

## CTA & Banner Approach

### CTA Implementation

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated fields on collection | CTA text + link as separate fields. Always visible, consistent placement. | ✓ |
| Lexical inline block | CTA as a block editors insert anywhere in rich text. More flexible but could be forgotten. | |
| Both options | Default CTA field plus inline insertion ability. Maximum flexibility, more complex. | |
| You decide | Claude picks for non-technical editors. | |

**User's choice:** Dedicated fields on collection
**Notes:** Consistent placement, editors can't forget it.

### Urgent Banner Severity

| Option | Description | Selected |
|--------|-------------|----------|
| Simple on/off with message + link | One toggle: active or inactive. Single visual style. Dead simple. | ✓ |
| Severity levels (info, warning, urgent) | Multiple banner styles. Editors pick a level. More nuanced but adds decision overhead. | |
| You decide | Claude picks based on editorial simplicity. | |

**User's choice:** Simple on/off with message + link
**Notes:** Keep it dead simple for time-sensitive moments.

---

## Project Scaffolding

### Initialization Method

| Option | Description | Selected |
|--------|-------------|----------|
| create-payload-app | Official scaffolding tool. Fastest to working admin panel. Clean up boilerplate after. | ✓ |
| Manual Next.js + Payload setup | Start from create-next-app, add Payload manually. Full control, more setup work. | |
| You decide | Claude picks fastest path. | |

**User's choice:** create-payload-app
**Notes:** Clean up v3 Tailwind config or unnecessary boilerplate after generation.

### Package Manager

| Option | Description | Selected |
|--------|-------------|----------|
| pnpm | Faster installs, strict dependency resolution, saves disk space. | ✓ |
| npm | Ships with Node.js, no extra install. Simpler but slower. | |
| You decide | Claude picks. | |

**User's choice:** pnpm
**Notes:** Modern standard for new projects.

### Node.js Version

| Option | Description | Selected |
|--------|-------------|----------|
| Node 22 LTS | Latest LTS, supported through April 2027. Longest runway. | ✓ |
| Node 20 LTS | Previous LTS, supported through April 2026. More battle-tested. | |
| You decide | Claude picks. | |

**User's choice:** Node 22 LTS
**Notes:** Longest support window.

---

## Claude's Discretion

- Media collection configuration (image sizes, formats, upload constraints)
- Database migration strategy and seed data approach
- ESLint/Prettier configuration details
- File/directory organization within the scaffolded project

## Deferred Ideas

None — discussion stayed within phase scope.
