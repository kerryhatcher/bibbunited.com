# Phase 14: Navigation URL Fix & Documentation Drift - Research

**Researched:** 2026-03-25
**Domain:** Seed data correction, documentation maintenance
**Confidence:** HIGH

## Summary

Phase 14 is a focused gap-closure phase with two concerns: (1) a single URL mismatch in the seed data that causes the Contact Officials navigation link to 404, and (2) documentation drift where requirement checkboxes and traceability status were not updated after phases 11-13 completed.

The root cause of both VIS-02 and UX-02 being partial is identical: `src/seed.ts` line 469 seeds the Contact Officials navigation link with `url: '/officials'` but the actual Next.js route is `/contact-officials`. Fixing this one string and re-seeding the database resolves both requirements. The `isActiveLink()` function in Header.tsx is correct -- it compares `pathname === href`, which will work once the href matches the actual route.

**Primary recommendation:** Change `url: '/officials'` to `url: '/contact-officials'` in seed.ts, re-seed the database, then batch-update REQUIREMENTS.md and ROADMAP.md checkboxes/traceability.

## Project Constraints (from CLAUDE.md)

- Tech stack: Next.js + React + Tailwind CSS + Payload CMS 3.x (non-negotiable)
- Database: PostgreSQL
- Hosting: Self-hosted K8s with Traefik + Cloudflare tunnels
- Local dev server runs via docker compose (not pnpm/npm dev directly)
- Always use Conventional Commits
- Never present UI/browser testing as manual tasks; always automate via Playwright or Chrome DevTools MCP
- nyquist_validation is explicitly false in config.json -- skip validation architecture section

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VIS-02 | Navigation menu is populated with all site sections in both desktop and mobile views | Fix seed.ts URL from '/officials' to '/contact-officials', re-seed database. Navigation global already has all 4 items; only the URL is wrong. |
| UX-02 | Current page is visually indicated in navigation with active styling and aria-current | Same seed fix resolves this. `isActiveLink()` in Header.tsx correctly compares `pathname === href`. Once href is '/contact-officials', the match succeeds on that page. No code change needed in Header.tsx. |
</phase_requirements>

## Standard Stack

No new libraries needed. This phase modifies existing files only.

### Files to Modify

| File | Change | Purpose |
|------|--------|---------|
| `src/seed.ts` line 469 | `url: '/officials'` -> `url: '/contact-officials'` | Fix navigation URL mismatch |
| `.planning/REQUIREMENTS.md` | Check boxes for A11Y-01, A11Y-02, A11Y-04, UX-01, UX-03, UX-04 | Documentation drift |
| `.planning/REQUIREMENTS.md` traceability | Change 6 items from "Pending" to "Complete" | Documentation drift |
| `.planning/ROADMAP.md` | Mark Phase 9 and Phase 12 plan checkboxes as [x] | Documentation drift |

## Architecture Patterns

### Seed Re-run Pattern

The seed script uses an upsert pattern -- it checks for existing records before creating. For the Navigation global, it uses `payload.updateGlobal()` which overwrites the entire global value. Re-running seed after fixing the URL will update the Navigation global in the database.

**Key detail:** The seed must be run against the live database to take effect. Since the dev environment runs via docker compose, the seed command needs to execute inside the container or against the containerized database.

### Active Nav Logic (No Change Needed)

```typescript
// src/components/layout/Header.tsx line 78-82
function isActiveLink(item: NavLink): boolean {
  const href = resolveHref(item)
  if (href === '#') return false
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}
```

This logic is correct. When `href` is `/contact-officials` and `pathname` is `/contact-officials`, the exact match `pathname === href` succeeds. The current failure is purely because `href` is `/officials` (wrong value from seed data).

### Anti-Patterns to Avoid

- **Do not modify Header.tsx:** The active nav code is correct. The fix is data-only (seed.ts).
- **Do not add route aliases or redirects:** The route `/contact-officials` already exists and works. Adding a redirect from `/officials` would mask the root cause.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Database re-seed | Manual SQL update | `pnpm seed` (or equivalent) | Seed script is the source of truth for initial data; manual DB edits create drift |

## Common Pitfalls

### Pitfall 1: Forgetting to Re-seed After Code Change
**What goes wrong:** Developer fixes seed.ts but doesn't re-run seed. The database still has the old URL.
**Why it happens:** Seed.ts is source code, not runtime config. Changing it doesn't automatically update the database.
**How to avoid:** Re-seed is a required step in the plan, not optional.
**Warning signs:** Navigation still shows `/officials` in the browser after deployment.

### Pitfall 2: Incomplete Documentation Update
**What goes wrong:** Some checkboxes updated but not all, leaving partial drift.
**Why it happens:** Six separate checkbox items plus six traceability rows plus ROADMAP checkboxes -- easy to miss one.
**How to avoid:** Use the milestone audit report as a checklist. Each item in the `documentation_drift` section must be addressed.

### Pitfall 3: Seed Script Overwrites Admin Edits
**What goes wrong:** If an editor has manually changed navigation items in the Payload admin UI, re-running seed overwrites those changes.
**Why it happens:** `payload.updateGlobal()` replaces the entire Navigation global.
**How to avoid:** This is a dev/staging concern, not production. The seed is for initial setup. If navigation has been edited in production, the fix should be applied via the admin UI instead (or seed should only run in dev).

## Documentation Drift Inventory

From v1.1-MILESTONE-AUDIT.md `documentation_drift` section:

### REQUIREMENTS.md Checkboxes (6 items)
| Requirement | Current | Should Be |
|-------------|---------|-----------|
| A11Y-01 | `[ ]` | `[x]` |
| A11Y-02 | `[ ]` | `[x]` |
| A11Y-04 | `[ ]` | `[x]` |
| UX-01 | `[ ]` | `[x]` |
| UX-03 | `[ ]` | `[x]` |
| UX-04 | `[ ]` | `[x]` |

### REQUIREMENTS.md Traceability (6 items)
Same 6 requirements: change "Pending" to "Complete" in the traceability table.

### REQUIREMENTS.md Additional Updates for Phase 14
| Requirement | Current | Should Be |
|-------------|---------|-----------|
| VIS-02 | `[ ]` | `[x]` (after seed fix) |
| UX-02 | `[ ]` | `[x]` (after seed fix) |

### ROADMAP.md Plan Checkboxes
The audit reports Phase 9 and Phase 12 plan checkboxes show `[ ]` instead of `[x]`. However, reading the current ROADMAP.md, these are already marked `[x]`. This drift item may have been corrected by a subsequent commit. Verify at execution time.

### SUMMARY Frontmatter (noted but lower priority)
09-02, 10-01, 11-03 SUMMARY files missing `requirements_completed` entries. These are internal tracking metadata.

## Code Examples

### Seed Fix (exact change)
```typescript
// src/seed.ts line 469
// BEFORE:
{ label: 'Contact Officials', type: 'external', url: '/officials' },

// AFTER:
{ label: 'Contact Officials', type: 'external', url: '/contact-officials' },
```

### Verification After Seed
After re-seeding, verify the Navigation global has the correct URL:
```typescript
// Check via Payload Local API or admin UI
const nav = await payload.findGlobal({ slug: 'navigation' })
// nav.items should contain { label: 'Contact Officials', url: '/contact-officials' }
```

## State of the Art

No technology changes relevant to this phase. This is a data fix and documentation update.

## Open Questions

1. **Seed re-run method in docker compose environment**
   - What we know: Dev environment runs via docker compose per project memory
   - What's unclear: Exact command to re-seed (likely `docker compose exec app pnpm seed` or similar)
   - Recommendation: Check package.json for seed script name at execution time

## Sources

### Primary (HIGH confidence)
- `src/seed.ts` line 469 -- confirmed URL mismatch `/officials` vs `/contact-officials`
- `src/components/layout/Header.tsx` lines 78-82 -- confirmed `isActiveLink()` logic is correct
- `src/app/(frontend)/contact-officials/page.tsx` -- confirmed route exists
- `.planning/v1.1-MILESTONE-AUDIT.md` -- complete gap inventory

## Metadata

**Confidence breakdown:**
- Seed fix: HIGH - direct code inspection confirms single-line change
- Active nav: HIGH - code logic verified correct, data is the issue
- Documentation drift: HIGH - audit report provides exact list of items
- Re-seed process: MEDIUM - exact docker compose command needs verification at execution time

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable -- no external dependencies)
