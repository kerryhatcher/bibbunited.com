# Phase 9: Foundation & Config - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 09-foundation-config
**Areas discussed:** Seed data strategy, OG default image, Cache & security headers, displayName field

---

## Seed Data Strategy

### Seed Image Style

| Option | Description | Selected |
|--------|-------------|----------|
| Color-varied sharp images | Generate 5-6 images with different bright colors and topic text labels. Fast, no external deps. | ✓ |
| Gradient abstract images | Color gradients (sunset, ocean). More visual but less content-distinguishable. | |
| Minimal — just fix the colors | Single image but bright/high-contrast color. Simplest change. | |

**User's choice:** Color-varied sharp images
**Notes:** None

### Civic Seed Data

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — full civic seed | 3-4 officials, 2-3 meetings. Pages aren't empty in dev. | ✓ |
| No — keep pages empty | Only nav and hero. Officials/Meetings stay blank. | |
| Minimal placeholders | 1 official, 1 meeting — just enough to render. | |

**User's choice:** Yes — full civic seed
**Notes:** None

### Navigation Menu Items

| Option | Description | Selected |
|--------|-------------|----------|
| Match site structure | News, About, Get Involved, Contact Officials, Meetings. Possibly "Take Action" dropdown. | ✓ |
| Minimal top-level only | Just News, About, Contact Officials. No dropdowns. | |
| You decide | Claude picks a sensible nav structure. | |

**User's choice:** Match site structure
**Notes:** None

---

## OG Default Image

### Design Direction

| Option | Description | Selected |
|--------|-------------|----------|
| Brand-forward text card | Bold "BIBB UNITED" + tagline on navy background with gold accent. Generated via sharp/SVG. | ✓ |
| Logo-centered minimal | Logo on solid brand color. Cleaner but less informative. | |
| Photo collage style | Community imagery with semi-transparent brand overlay. Needs actual photos. | |

**User's choice:** Brand-forward text card
**Notes:** User selected the preview mockup showing navy bg, white text, gold accent bar layout.

### File Location

| Option | Description | Selected |
|--------|-------------|----------|
| public/og-default.jpg | Static file in Next.js public dir. Simple, fast. | |
| Generated via API route | Next.js OG image generation (next/og). Flexible but adds runtime cost. | |
| Uploaded to Payload media | Media item so editors can change via admin. More editorial control. | ✓ |

**User's choice:** Uploaded to Payload media
**Notes:** Gives editors ability to swap OG image without code deploy.

---

## Cache & Security Headers

### Configuration Location

| Option | Description | Selected |
|--------|-------------|----------|
| Next.js config | poweredByHeader: false + headers() in next.config.ts. Works in all environments. | ✓ |
| Traefik middleware | Configure in IngressRoute. Only applies in production K8s. | |
| Both layers | Next.js baseline + Traefik edge. Defense in depth but more maintenance. | |

**User's choice:** Next.js config
**Notes:** Single source of truth, works in dev and prod.

---

## displayName Field

### Required vs Optional

| Option | Description | Selected |
|--------|-------------|----------|
| Optional with fallback | Optional field. Frontend falls back to "BIBB United Staff" when empty. | ✓ |
| Required field | Force display name on all users. Could block user creation. | |
| Optional, no fallback | Optional, shows email if empty. Defers display logic to Phase 11. | |

**User's choice:** Optional with fallback
**Notes:** Low friction for editors.

### Seed User Display Name

| Option | Description | Selected |
|--------|-------------|----------|
| "BIBB United Staff" | Generic editorial name matching the fallback strategy. | ✓ |
| "Editor" | Simple, short placeholder. | |
| You decide | Claude picks appropriate name. | |

**User's choice:** "BIBB United Staff"
**Notes:** Matches the fallback value used when displayName is empty.

---

## Claude's Discretion

- Navigation menu structure details (dropdown groupings, ordering)
- Exact bright colors and text labels for seed images
- SVG layout details for OG image
- Cache header path patterns for media routes

## Deferred Ideas

None — discussion stayed within phase scope
