# Phase 2: Brand & Design System - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

BIBB United visual identity (logo, color palette, typography) and a reusable Tailwind v4 component system that enforces the brand across the site. Includes an editorial mood switch (dark "urgent" / light "community" mode) controlled from CMS. Covers WCAG 2.1 AA compliance and mobile-first responsive design. No page layouts or navigation — those are Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Color Palette & Mood
- **D-01:** Two visual modes — "urgent" (dark & bold backgrounds, vivid accents) and "community" (light/white backgrounds, bold saturated colors). Editorial team controls via CMS, not a visitor toggle.
- **D-02:** Implement mood switch as a Payload Global ("SiteTheme" or similar) with a select field. Drives a CSS class on `<body>` that swaps Tailwind v4 `@theme` color tokens.
- **D-03:** Primary accent color: red/crimson. Used on CTAs, links, key highlights in both modes.
- **D-04:** Secondary color: navy. Used for structural elements (headers, footers, secondary UI).
- **D-05:** Neutral palette derived from both modes — dark mode uses near-black/dark grays, light mode uses white/light grays.

### Typography & Fonts
- **D-06:** Heading font: bold condensed sans-serif (e.g., Oswald, Barlow Condensed, or Anton). Protest-poster impact.
- **D-07:** Body font: clean sans-serif (e.g., Inter, Source Sans, or Nunito Sans). Maximum readability for long-form civic content.
- **D-08:** Heading treatment: ALL CAPS for h1 and h2 only. h3/h4 use mixed case for readability.
- **D-09:** Font loading via `next/font` (Google Fonts downloaded at build time, self-hosted). Zero external requests at runtime.

### Logo
- **D-10:** Logo is a bold wordmark using the condensed heading font — no separate icon or symbol.
- **D-11:** Wordmark treatment: "BIBB" in base color (white on dark, dark on light), "UNITED" in red/crimson accent.
- **D-12:** Favicon: "BU" letters in the condensed font with red accent, sized for 32x32px.

### Component Aesthetic
- **D-13:** Shape language: sharp edges (square corners) on all components — buttons, cards, banners, inputs. No border-radius.
- **D-14:** Two-tier button system: primary CTAs are solid red/crimson background with white uppercase text; secondary actions use red outline with transparent background and hover fill.
- **D-15:** Card style: full-bleed featured image spanning top of card, content area below. For news posts and topic summaries.
- **D-16:** Layout density: generous spacing between sections. Big headlines with room to breathe. Confident, readable feel.

### Claude's Discretion
- Exact hex/HSL values for the color palette (as long as they match the described mood and pass WCAG AA contrast)
- Specific font choice within the described categories (condensed sans-serif heading, clean sans-serif body)
- Tailwind spacing scale and breakpoint definitions
- Focus ring and hover state styling
- Shadow usage (if any — the sharp edge direction suggests minimal or none)
- Icon library integration approach (lucide-react per CLAUDE.md)
- @tailwindcss/typography prose configuration for CMS content

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specs
- `.planning/PROJECT.md` — Project vision, constraints, and key decisions
- `.planning/REQUIREMENTS.md` — DSGN-01, DSGN-02, DSGN-04, DSGN-05 requirements for this phase
- `.planning/ROADMAP.md` — Phase 2 goals and success criteria
- `CLAUDE.md` — Technology stack (Tailwind v4 CSS-first config, Next.js 15, React 19)

### Prior Phase Context
- `.planning/phases/01-cms-foundation/01-CONTEXT.md` — Phase 1 decisions (Payload globals pattern for UrgentBanner, pnpm, Node 22 LTS)

### Technology
- Tailwind CSS v4 documentation — `@theme` blocks, CSS-first configuration, dark mode variants
- Next.js `next/font` documentation — Google Fonts self-hosting at build time
- WCAG 2.1 AA guidelines — color contrast ratios (4.5:1 normal text, 3:1 large text)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing UI components — Phase 2 creates the foundational component library.
- `src/globals/` contains UrgentBanner global — same pattern will be used for SiteTheme global.

### Established Patterns
- Payload Globals pattern established in Phase 1 (UrgentBanner with toggle + fields). SiteTheme global follows same pattern.
- Tailwind v4 CSS-first configuration — no `tailwind.config.js` exists; use `@theme` in CSS.
- Current `src/app/(frontend)/styles.css` has basic reset with `system-ui` body font and `Roboto Mono` mono — will be replaced by brand typography.

### Integration Points
- `src/app/(frontend)/` — frontend route group where themed layout will live
- `src/payload.config.ts` — register new SiteTheme global
- `src/app/(frontend)/styles.css` — replace with brand design tokens via Tailwind v4 `@theme`

</code_context>

<specifics>
## Specific Ideas

- Logo wordmark: "BIBB" in base color + "UNITED" in red/crimson — implemented as styled text (SVG or CSS), not a raster image, so it adapts to both modes
- Editorial mood switch should feel like the UrgentBanner toggle — simple, clear, no confusion for non-technical editors
- The condensed uppercase h1/h2 treatment should evoke protest signage energy

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-brand-design-system*
*Context gathered: 2026-03-24*
