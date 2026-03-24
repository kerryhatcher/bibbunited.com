# Phase 2: Brand & Design System - Research

**Researched:** 2026-03-24
**Domain:** Tailwind CSS v4 design tokens, next/font, Payload CMS Globals, WCAG 2.1 AA accessibility
**Confidence:** HIGH

## Summary

Phase 2 creates the BIBB United brand identity (logo wordmark, color palette, typography) and implements it as a Tailwind CSS v4 design token system with a CMS-controlled editorial mood switch. The UI-SPEC already defines exact colors, fonts, spacing, and component contracts -- this research focuses on **how to implement** those decisions correctly with Tailwind v4's CSS-first configuration, next/font integration, and Payload Global data fetching.

The key technical challenge is the dual-mode theme (community/urgent) driven by a Payload Global. Tailwind v4 does **not** support nesting `@theme` inside data-attribute selectors. The proven pattern is: define `@theme` tokens that reference CSS custom properties, then override those properties under `[data-mode="urgent"]` selectors. This is well-documented in Tailwind community discussions and works reliably.

**Primary recommendation:** Install Tailwind v4 with `@tailwindcss/postcss`, define all design tokens in a single `styles.css` using `@theme` with CSS variable indirection for mode switching, load fonts via `next/font/google` with CSS variable output, and create a `SiteTheme` Payload Global following the established UrgentBanner pattern.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Two visual modes -- "urgent" (dark & bold) and "community" (light/white). Editorial team controls via CMS, not visitor toggle.
- **D-02:** Mood switch as Payload Global ("SiteTheme") with select field. CSS class on `<body>` swaps Tailwind v4 `@theme` color tokens.
- **D-03:** Primary accent: red/crimson for CTAs, links, highlights in both modes.
- **D-04:** Secondary: navy for structural elements (headers, footers).
- **D-05:** Neutral palette: dark mode near-black/dark grays, light mode white/light grays.
- **D-06:** Heading font: bold condensed sans-serif (protest-poster impact).
- **D-07:** Body font: clean sans-serif (maximum readability).
- **D-08:** ALL CAPS for h1/h2 only; h3/h4 mixed case.
- **D-09:** Font loading via `next/font` (Google Fonts self-hosted at build time).
- **D-10:** Logo is bold wordmark using condensed heading font, no icon.
- **D-11:** "BIBB" in base color, "UNITED" in red/crimson accent.
- **D-12:** Favicon: "BU" letters in condensed font, 32x32px.
- **D-13:** Sharp edges (0px border-radius) on all components.
- **D-14:** Two-tier buttons: primary solid red/white uppercase; secondary red outline with hover fill.
- **D-15:** Cards: full-bleed image top, content below.
- **D-16:** Generous spacing between sections.

### Claude's Discretion
- Exact hex/HSL values (already defined in UI-SPEC and pass WCAG AA)
- Specific font choice (UI-SPEC selected Barlow Condensed + Inter)
- Tailwind spacing scale and breakpoints
- Focus ring and hover state styling
- Shadow usage (none per sharp-edge direction)
- Icon library integration (lucide-react per CLAUDE.md)
- @tailwindcss/typography prose configuration

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DSGN-01 | Bold activist visual design with strong colors, large headlines, and urgency | Color palette (UI-SPEC), Barlow Condensed headings with ALL CAPS, sharp edges, crimson accent -- all implemented via Tailwind v4 @theme tokens |
| DSGN-02 | BIBB United brand identity (logo, color palette, typography) | SVG wordmark component, favicon generation, @theme color tokens, next/font integration for Barlow Condensed + Inter |
| DSGN-04 | Fully responsive, mobile-first layout tested on real device sizes | Tailwind v4 default breakpoints (sm:640, md:768, lg:1024, xl:1280), responsive type scaling in UI-SPEC, 320px minimum |
| DSGN-05 | WCAG 2.1 AA accessible design (color contrast, keyboard nav, semantic HTML, alt text) | All color combinations verified in UI-SPEC (4.5:1+ ratios), focus ring styling, semantic HTML patterns, 44px touch targets |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Tech stack:** Next.js + React + Tailwind CSS + Payload CMS 3.x (non-negotiable)
- **Tailwind v4:** CSS-first configuration, no `tailwind.config.js`
- **Package manager:** pnpm (established in Phase 1)
- **Node.js:** v22 LTS (established in Phase 1)
- **Payload Globals pattern:** Follow UrgentBanner pattern in `src/globals/`
- **Icons:** lucide-react
- **No CSS-in-JS:** Conflicts with RSC
- **Conventional Commits** for all commits

## Standard Stack

### Core (to install)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| tailwindcss | ^4.2.2 | Utility-first CSS framework | User-specified. v4 CSS-first config with @theme tokens. |
| @tailwindcss/postcss | ^4.2.2 | PostCSS plugin for Tailwind v4 | Required integration method for Next.js (replaces old postcss plugin) |
| postcss | ^8.x | CSS processor | Peer dependency of @tailwindcss/postcss |
| @tailwindcss/typography | ^0.5.19 | Prose styling for CMS content | Styles rich text output from Lexical editor |
| lucide-react | ^1.0.1 | Icon library | User-specified in CLAUDE.md. Tree-shakeable, MIT. |

### Already Installed
| Library | Version | Purpose |
|---------|---------|---------|
| next | ^16.2.1 | Framework (includes next/font) |
| react | ^19.2.4 | UI rendering |
| payload | ^3.80.0 | CMS (Global configs for SiteTheme) |
| sharp | ^0.34.2 | Image processing (favicon generation) |

**Installation:**
```bash
pnpm add tailwindcss @tailwindcss/postcss postcss @tailwindcss/typography lucide-react
```

## Architecture Patterns

### Recommended File Structure
```
src/
  app/
    (frontend)/
      layout.tsx          # Font loading, SiteTheme data fetch, data-mode on <body>
      styles.css          # @import "tailwindcss", @theme tokens, mode overrides, prose config
      page.tsx            # Existing
  components/
    ui/
      Button.tsx          # Primary + Secondary button variants
      Card.tsx            # Full-bleed image card
      Logo.tsx            # SVG wordmark component
      Section.tsx         # Wrapper with generous spacing
  globals/
    UrgentBanner.ts       # Existing
    SiteTheme.ts          # NEW: mode select field
  lib/
    getTheme.ts           # Helper to fetch SiteTheme global
public/
  favicon.ico             # Generated from BU wordmark
  favicon.svg             # SVG favicon for modern browsers
postcss.config.mjs        # @tailwindcss/postcss plugin
```

### Pattern 1: Tailwind v4 CSS-First Theme with Mode Switching

**What:** Define design tokens in `@theme` using CSS variable indirection so that `[data-mode="urgent"]` can override colors without rebuilding.

**Why this pattern:** Tailwind v4's `@theme` directive does NOT support nesting inside selectors. You cannot put `@theme` inside `[data-mode="urgent"] { ... }`. Instead, `@theme` references CSS custom properties defined in `:root`, and those properties are overridden under the data-attribute selector.

**Example:**
```css
/* src/app/(frontend)/styles.css */
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* Base mode: community (light) */
:root {
  --brand-bg-dominant: #FFFFFF;
  --brand-bg-secondary: #1B2A4A;
  --brand-accent: #DC2626;
  --brand-text-primary: #111827;
  --brand-text-secondary: #4B5563;
  --brand-text-on-dark: #FFFFFF;
  --brand-text-on-accent: #FFFFFF;
  --brand-border: #D1D5DB;
}

/* Urgent mode (dark) overrides */
[data-mode="urgent"] {
  --brand-bg-dominant: #0F172A;
  --brand-bg-secondary: #1E293B;
  --brand-accent: #EF4444;
  --brand-text-primary: #F8FAFC;
  --brand-text-secondary: #94A3B8;
  --brand-text-on-dark: #FFFFFF;
  --brand-text-on-accent: #FFFFFF;
  --brand-border: #334155;
}

@theme {
  /* Colors - reference CSS vars for mode switching */
  --color-bg-dominant: var(--brand-bg-dominant);
  --color-bg-secondary: var(--brand-bg-secondary);
  --color-accent: var(--brand-accent);
  --color-text-primary: var(--brand-text-primary);
  --color-text-secondary: var(--brand-text-secondary);
  --color-text-on-dark: var(--brand-text-on-dark);
  --color-text-on-accent: var(--brand-text-on-accent);
  --color-border: var(--brand-border);

  /* Static colors (same in both modes) */
  --color-navy: #1B2A4A;
  --color-crimson: #DC2626;

  /* Fonts - reference next/font CSS vars */
  --font-heading: var(--font-barlow-condensed), sans-serif;
  --font-body: var(--font-inter), sans-serif;

  /* Spacing (keep Tailwind defaults, add custom) */
  --spacing-section: 64px;
  --spacing-section-mobile: 32px;
}
```
**Source:** [Tailwind CSS v4 @theme docs](https://tailwindcss.com/docs/theme), [GitHub Discussion #16292](https://github.com/tailwindlabs/tailwindcss/discussions/16292), [Flagrant blog](https://www.beflagrant.com/blog/tailwindcss-v4-custom-theme-styling-2025-08-21)

### Pattern 2: next/font with CSS Variable Output for Tailwind v4

**What:** Load Google Fonts at build time with `next/font/google`, output as CSS variables, reference in `@theme`.

**Why:** Ensures zero external font requests at runtime (D-09). CSS variable output integrates cleanly with Tailwind v4's `@theme` `--font-*` namespace.

**Example:**
```tsx
// src/app/(frontend)/layout.tsx
import { Barlow_Condensed, Inter } from 'next/font/google'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import './styles.css'

const barlowCondensed = Barlow_Condensed({
  weight: '700',
  subsets: ['latin'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: configPromise })
  const siteTheme = await payload.findGlobal({ slug: 'site-theme' })
  const mode = siteTheme?.mode || 'community'

  return (
    <html lang="en" className={`${barlowCondensed.variable} ${inter.variable}`}>
      <body data-mode={mode}>
        <main>{children}</main>
      </body>
    </html>
  )
}
```
**Source:** [Next.js Font Optimization docs](https://nextjs.org/docs/app/getting-started/fonts), [Tailwind v4 + next/font discussion](https://github.com/tailwindlabs/tailwindcss/discussions/15267)

**Important:** Barlow Condensed is NOT a variable font -- it requires explicit `weight: '700'` (and `'400'` if needed). Inter IS a variable font and does not need weight specified.

### Pattern 3: Payload Global for SiteTheme

**What:** A Payload Global with a select field for mode, following the established UrgentBanner pattern.

**Example:**
```typescript
// src/globals/SiteTheme.ts
import type { GlobalConfig } from 'payload'

export const SiteTheme: GlobalConfig = {
  slug: 'site-theme',
  label: 'Site Theme',
  admin: {
    description: 'Control the site-wide visual mode. "Community" is light and welcoming. "Urgent" is dark and bold for high-priority periods.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'mode',
      type: 'select',
      defaultValue: 'community',
      label: 'Visual Mode',
      options: [
        { label: 'Community (Light)', value: 'community' },
        { label: 'Urgent (Dark)', value: 'urgent' },
      ],
      admin: {
        description: 'Switch between community (light, welcoming) and urgent (dark, bold) visual modes',
      },
    },
  ],
}
```
**Source:** Established pattern from `src/globals/UrgentBanner.ts` in this codebase.

### Pattern 4: SVG Logo Wordmark Component

**What:** React component rendering the BIBB UNITED wordmark as inline SVG text, adapting colors per mode.

**Example:**
```tsx
// src/components/ui/Logo.tsx
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 40"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="BIBB United"
    >
      <text
        fontFamily="var(--font-heading)"
        fontWeight="700"
        fontSize="36"
        y="32"
      >
        <tspan className="fill-current">BIBB</tspan>
        <tspan className="fill-accent" dx="8">UNITED</tspan>
      </text>
    </svg>
  )
}
```
**Note:** SVG text with `fontFamily` referencing the CSS variable may need the font pre-loaded. Alternative approach: two `<span>` elements styled with Tailwind classes inside a flex container. The span approach is simpler and more reliable for web rendering. SVG is better for favicon/og-image generation.

### Anti-Patterns to Avoid
- **Nesting `@theme` inside selectors:** Does not work in Tailwind v4. Use CSS variable indirection instead.
- **Using `tailwind.config.js`:** Tailwind v4 uses CSS-first configuration. No JS config file.
- **Loading fonts from CDN at runtime:** Violates D-09. Always use next/font for build-time download + self-hosting.
- **Using `className` toggling for mode switch:** Use `data-mode` attribute on `<body>` so CSS selectors can target it cleanly.
- **Building a dark mode toggle for visitors:** D-01 explicitly states editorial control only, not a visitor toggle.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font loading + optimization | Custom `<link>` tags or @font-face | `next/font/google` | Handles subsetting, self-hosting, preloading, no CLS |
| Prose/rich-text styling | Manual CSS for every HTML element | `@tailwindcss/typography` | Lexical outputs diverse HTML; prose class covers all elements |
| Color contrast checking | Manual ratio calculations | Pre-verified values from UI-SPEC | All 8 combinations already verified at 4.5:1+ |
| Icon system | Custom SVG sprite or icon font | `lucide-react` | Tree-shakeable, consistent, MIT licensed |
| PostCSS processing | Manual CSS build pipeline | `@tailwindcss/postcss` | Official Tailwind v4 integration for Next.js |

## Common Pitfalls

### Pitfall 1: Tailwind v4 @theme Cannot Be Scoped to Selectors
**What goes wrong:** Putting `@theme { ... }` inside `[data-mode="urgent"] { ... }` -- Tailwind ignores the selector scope and treats all tokens as global.
**Why it happens:** `@theme` is a build-time directive, not a runtime CSS rule.
**How to avoid:** Use the CSS variable indirection pattern (Pattern 1 above). Define `@theme` tokens referencing `var(--brand-*)`, override `--brand-*` values in selector-scoped `:root` / `[data-mode]` blocks.
**Warning signs:** Both modes render identical colors.

### Pitfall 2: Barlow Condensed Is Not a Variable Font
**What goes wrong:** Omitting `weight` parameter in `Barlow_Condensed()` call.
**Why it happens:** Inter IS a variable font (no weight needed), but Barlow Condensed is not.
**How to avoid:** Always specify `weight: '700'` for Barlow Condensed. If you need weight 400 too, use `weight: ['400', '700']`.
**Warning signs:** Build error or fallback font rendering.

### Pitfall 3: next/font CSS Variables Not Picked Up by Tailwind v4
**What goes wrong:** Font utility classes (`font-heading`) exist but render fallback fonts.
**Why it happens:** The CSS variables from next/font (e.g., `--font-barlow-condensed`) are injected into the DOM at runtime via className on `<html>`. Tailwind v4's `@theme` references these variables at build time, where they don't exist yet.
**How to avoid:** This is expected and works correctly because `@theme` generates `--font-heading: var(--font-barlow-condensed)` as a CSS custom property chain. The resolution happens at runtime when both variables are present. Ensure the font's `.variable` class is on the `<html>` element.
**Warning signs:** Fonts work in browser but Tailwind IntelliSense shows `var(--font-barlow-condensed)` as unresolved.

### Pitfall 4: PostCSS Config File Format
**What goes wrong:** Using `postcss.config.js` with CommonJS syntax or incorrect plugin name.
**Why it happens:** Tailwind v4 uses `@tailwindcss/postcss` (not `tailwindcss` directly as a PostCSS plugin like v3).
**How to avoid:** Create `postcss.config.mjs` with `{ plugins: { "@tailwindcss/postcss": {} } }`.
**Warning signs:** Error: "It looks like you're trying to use tailwindcss directly as a PostCSS plugin."

### Pitfall 5: Typography Plugin Not Applying Brand Styles
**What goes wrong:** Prose content uses default Tailwind typography colors/fonts instead of brand tokens.
**Why it happens:** `@tailwindcss/typography` has its own default color scheme.
**How to avoid:** Override typography CSS custom properties (`--tw-prose-body`, `--tw-prose-headings`, `--tw-prose-links`) to reference brand tokens. Use `@plugin "@tailwindcss/typography"` in the CSS file (v4 syntax).
**Warning signs:** CMS content areas look different from the rest of the site.

### Pitfall 6: Favicon Generation Complexity
**What goes wrong:** Trying to generate a perfect multi-format favicon programmatically at build time.
**Why it happens:** Favicons need ICO (32x32), SVG, and apple-touch-icon (180x180) formats.
**How to avoid:** Create the favicon as a static SVG file manually (simple "BU" text). For ICO format, use a one-time conversion tool or create it manually. Place in `public/` or use Next.js metadata API.
**Warning signs:** Over-engineering a build-time favicon pipeline.

## Code Examples

### PostCSS Configuration
```javascript
// postcss.config.mjs (project root)
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}
```
**Source:** [Tailwind CSS PostCSS installation](https://tailwindcss.com/docs/installation/using-postcss)

### Typography Plugin with Brand Overrides
```css
/* In styles.css after @theme block */
@plugin "@tailwindcss/typography";

/* Override prose defaults to use brand tokens */
.prose {
  --tw-prose-body: var(--brand-text-primary);
  --tw-prose-headings: var(--brand-text-primary);
  --tw-prose-links: var(--brand-accent);
  --tw-prose-bold: var(--brand-text-primary);
  --tw-prose-quotes: var(--brand-text-primary);
  --tw-prose-quote-borders: var(--brand-accent);
  max-width: 65ch;
}

.prose h2,
.prose h3 {
  font-family: var(--font-heading);
  text-transform: uppercase;
}

.prose blockquote {
  border-left-width: 4px;
  font-style: italic;
  font-size: 1.125rem; /* 18px */
}
```
**Source:** [Tailwind Typography plugin](https://github.com/tailwindlabs/tailwindcss-typography), UI-SPEC prose contract

### Button Components
```tsx
// src/components/ui/Button.tsx
import React from 'react'

type ButtonVariant = 'primary' | 'secondary'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  href?: string
}

export function Button({ variant = 'primary', children, className = '', href, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-heading font-bold uppercase tracking-wide px-6 min-h-[44px] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-accent text-text-on-accent hover:brightness-90',
    secondary: 'border-2 border-accent text-accent bg-transparent hover:bg-accent hover:text-text-on-accent',
  }

  const classes = `${base} ${variants[variant]} ${className}`

  if (href) {
    return <a href={href} className={classes}>{children}</a>
  }

  return <button className={classes} {...props}>{children}</button>
}
```
**Source:** UI-SPEC Component Shape Contract (D-14)

### Fetching SiteTheme Global in Layout
```tsx
// src/lib/getTheme.ts
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function getThemeMode(): Promise<'community' | 'urgent'> {
  const payload = await getPayload({ config: configPromise })
  const siteTheme = await payload.findGlobal({ slug: 'site-theme' })
  return (siteTheme?.mode as 'community' | 'urgent') || 'community'
}
```
**Source:** Established pattern from `src/app/my-route/route.ts` + [Payload Local API docs](https://payloadcms.com/docs/local-api/overview)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` (JS config) | `@theme` in CSS file | Tailwind v4 (Jan 2025) | No JS config file. All tokens in CSS. |
| `tailwindcss` as PostCSS plugin | `@tailwindcss/postcss` as PostCSS plugin | Tailwind v4 (Jan 2025) | Different package name. Using old name errors. |
| `darkMode: 'class'` in config | Custom data attributes + CSS var override | Tailwind v4 (Jan 2025) | No built-in dark mode config. Use custom selectors. |
| `@apply` everywhere | Direct utility classes | Ongoing | `@apply` still works but utilities preferred. |
| `@next/font` package | `next/font` (built-in) | Next.js 13.2+ | No separate package install needed. |
| Tailwind Typography JS config | `@plugin` directive in CSS | Tailwind v4 (Jan 2025) | Plugin registration in CSS, not JS. |

## Open Questions

1. **SVG Wordmark vs. Styled Spans for Logo**
   - What we know: SVG gives precise control and works for favicon source; styled spans are simpler for web rendering.
   - What's unclear: Whether SVG `<text>` with CSS variable `fontFamily` renders reliably across browsers when font loads async via next/font.
   - Recommendation: Use styled `<span>` elements for the web logo component, create a separate static SVG for favicon/og-image. This avoids font-loading race conditions.

2. **Revalidation for SiteTheme Global**
   - What we know: `payload.findGlobal()` runs per-request in server components. Mode changes take effect on next page load.
   - What's unclear: Whether Next.js caching (full route cache) might serve stale mode data.
   - Recommendation: Use `export const revalidate = 60` or `export const dynamic = 'force-dynamic'` on the layout to ensure mode changes propagate within a reasonable time. Or use `unstable_cache` with a short TTL and revalidation tag.

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4 @theme docs](https://tailwindcss.com/docs/theme) - CSS variable syntax, @theme directive, font/color namespaces
- [Tailwind CSS PostCSS installation](https://tailwindcss.com/docs/installation/using-postcss) - Installation steps for Next.js
- [Next.js Font Optimization docs](https://nextjs.org/docs/app/getting-started/fonts) - next/font/google API, CSS variable output
- [Payload CMS Local API](https://payloadcms.com/docs/local-api/overview) - findGlobal usage pattern
- npm registry - verified current versions (tailwindcss 4.2.2, @tailwindcss/typography 0.5.19, lucide-react 1.0.1)

### Secondary (MEDIUM confidence)
- [GitHub Discussion #16292](https://github.com/tailwindlabs/tailwindcss/discussions/16292) - @theme scoping with data attributes (community solution, verified pattern)
- [Flagrant blog: Tailwind v4 Custom Theme](https://www.beflagrant.com/blog/tailwindcss-v4-custom-theme-styling-2025-08-21) - CSS variable indirection pattern
- [GitHub Discussion #15267](https://github.com/tailwindlabs/tailwindcss/discussions/15267) - next/font variables in Tailwind v4 @theme

### Tertiary (LOW confidence)
- None -- all findings verified with primary or secondary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions verified against npm registry, installation pattern from official docs
- Architecture: HIGH - @theme CSS variable indirection pattern verified in multiple sources, Payload Global pattern established in codebase
- Pitfalls: HIGH - each pitfall sourced from official docs or GitHub issues with confirmed workarounds

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable technologies, 30-day validity)
