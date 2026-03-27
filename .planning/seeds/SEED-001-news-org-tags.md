---
id: SEED-001
status: dormant
planted: 2026-03-27
planted_during: v2.0 Phase 15 (Organization Data Model)
trigger_when: When org detail pages (ORG-08) are being planned
scope: Medium
---

# SEED-001: News posts linked to organizations + general tag system

## Why This Matters

- **Connect news to orgs:** Readers can see all news relevant to a specific governing body -- helps residents track what's happening with their board/commission. A state legislature story that affects both the county commission and the board of education should appear on both org pages.
- **Better content discovery:** Tags + org links give readers multiple ways to find related articles instead of just chronological browsing. A reader interested in "budget" topics across all orgs can follow a tag; a reader tracking the Board of Education can see all org-linked stories.
- **Editorial flexibility:** Editors can curate content by org and by topic independently, enabling richer homepage and org page layouts. Org links and tags serve different purposes and shouldn't be conflated.

## When to Surface

**Trigger:** When org detail pages (ORG-08) ship or are being planned

This seed should be presented during `/gsd:new-milestone` when the milestone scope matches any of these conditions:
- Organization detail pages (ORG-08) are included in the milestone
- Content taxonomy, tagging, or categorization work is planned
- News/article browsing or filtering features are scoped

## Scope Estimate

**Medium** -- A phase or two. Needs:
1. Many-to-many relationship field on NewsPosts linking to Organizations (like a tag, multiple orgs per post)
2. New Tags collection (name, slug, description) with many-to-many relationship on NewsPosts
3. Frontend: org detail page section showing linked news posts
4. Frontend: tag archive page listing posts by tag
5. Possibly tag and org filtering on the /news listing page

## Breadcrumbs

Related code and decisions found in the current codebase:

- `src/collections/NewsPosts.ts` -- Current NewsPosts collection; will need new relationship fields for orgs and tags
- `src/seed.ts` -- Seed script; would need sample news-org links and sample tags
- `src/payload.config.ts` -- Collection registry; Tags collection would be registered here
- `.planning/REQUIREMENTS.md` -- ORG-08 (org detail pages) and ORG-09 (meetings linked to orgs) are deferred requirements
- `.planning/phases/15-organization-data-model/15-CONTEXT.md` -- Deferred section mentions ORG-08/ORG-09; org detail pages designed anticipating a "view details" link
- `.planning/research/FEATURES.md` -- May contain prior research on content features

## Notes

- News stories can impact multiple orgs (e.g., state legislature action affecting county commission and board of education) -- the org relationship must be many-to-many, not single-select
- Tags are independent of orgs: a "Budget" tag groups articles across all orgs, while the org link is structural
- Consider whether tags should be editor-created (freeform) or admin-controlled (fixed list) -- likely admin-controlled to prevent tag sprawl on a small civic site
- The org link on news posts pairs naturally with ORG-08 (org detail pages) since the detail page would show "Recent news about this organization"
