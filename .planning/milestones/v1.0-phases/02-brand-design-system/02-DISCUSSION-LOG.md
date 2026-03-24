# Phase 2: Brand & Design System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 02-brand-design-system
**Areas discussed:** Color palette & mood, Typography & fonts, Logo direction, Component aesthetic

---

## Color Palette & Mood

### Visual Mood

| Option | Description | Selected |
|--------|-------------|----------|
| Dark & bold | Deep backgrounds, vivid accents. Protest poster energy. | |
| Bright & energetic | White/light backgrounds, bold primaries. Campaign rally energy. | |
| High-contrast editorial | Mostly black and white with accent colors. Investigative news outlet. | |

**User's choice:** "I want a way to easily switch between 1 and 2."
**Notes:** User wants both dark & bold and bright & energetic with the ability to switch between them. This led to the editorial mood switch decision.

### Theme Switching Mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Visitor toggle | Users pick preference, respects system preference. | |
| Editorial mood switch | CMS setting team controls. Crisis mode goes dark, normal is bright. | ✓ |
| Both | Default follows editorial setting, visitors can override. | |

**User's choice:** Editorial mood switch
**Notes:** Team controls site-wide mood from CMS. No visitor toggle.

### Primary Accent Color

| Option | Description | Selected |
|--------|-------------|----------|
| Red / crimson | Classic activism color. Urgency, passion, action. | ✓ |
| Electric blue | Trust, civic duty, authority. | |
| Gold / amber | Community, warmth, importance. | |

**User's choice:** Red / crimson

### Secondary Color

| Option | Description | Selected |
|--------|-------------|----------|
| Red + gold secondary | Gold for secondary highlights. Classic protest palette. | |
| Red + navy secondary | Navy for structural elements. Civic and authoritative. | ✓ |
| Red only, neutrals handle the rest | Minimal palette. Red stands out more alone. | |

**User's choice:** Red + navy secondary

---

## Typography & Fonts

### Heading Font Style

| Option | Description | Selected |
|--------|-------------|----------|
| Bold condensed sans-serif | Tight, impactful, protest-poster feel. Oswald, Barlow Condensed, Anton. | ✓ |
| Strong geometric sans-serif | Modern, authoritative. Inter, Space Grotesk, Outfit. | |
| Slab serif | Newsy, editorial feel. Roboto Slab, Bitter. | |

**User's choice:** Bold condensed sans-serif

### Body Text

| Option | Description | Selected |
|--------|-------------|----------|
| Clean sans-serif | Inter, Source Sans, Nunito Sans. Maximum readability. | ✓ |
| Humanist sans-serif | Open Sans, Lato, Noto Sans. Warmer, community feel. | |
| Serif for body | Merriweather, Source Serif, Lora. Traditional editorial. | |

**User's choice:** Clean sans-serif

### Heading Case Treatment

| Option | Description | Selected |
|--------|-------------|----------|
| ALL CAPS for h1/h2 only | Top-level headings scream urgency. Lower headings mixed case. | ✓ |
| Mixed case everywhere | Sentence case for all. More approachable. | |
| ALL CAPS everywhere | Maximum protest-poster energy on every heading. | |

**User's choice:** ALL CAPS for h1/h2 only

### Font Loading

| Option | Description | Selected |
|--------|-------------|----------|
| next/font (self-hosted) | Downloaded at build time. Zero external requests. Best privacy/performance. | ✓ |
| Google Fonts CDN | Simpler setup but external dependency. | |

**User's choice:** next/font (self-hosted)

---

## Logo Direction

### Logo Type

| Option | Description | Selected |
|--------|-------------|----------|
| Bold wordmark | Typography IS the brand. Simple, scalable. | ✓ |
| Monogram + wordmark | "BU" icon paired with full name. | |
| Symbol + wordmark | Custom icon next to name. More memorable but higher effort. | |

**User's choice:** Bold wordmark

### Typographic Treatment

| Option | Description | Selected |
|--------|-------------|----------|
| Color accent on 'UNITED' | 'BIBB' in base color, 'UNITED' in red/crimson. | ✓ |
| Underline or bar accent | Full name with red underline stripe beneath. | |
| Plain, single color | Condensed bold font, maximum simplicity. | |

**User's choice:** Color accent on 'UNITED'

### Favicon

| Option | Description | Selected |
|--------|-------------|----------|
| "BU" letters | First letters in condensed font with red accent. | ✓ |
| "B" monogram | Single bold "B". Simpler at tiny sizes. | |
| Red square/circle mark | Abstract shape. Stands out but doesn't reference name. | |

**User's choice:** "BU" letters

---

## Component Aesthetic

### Shape Language

| Option | Description | Selected |
|--------|-------------|----------|
| Sharp edges | Square corners, hard lines. Urgent, no-nonsense. | ✓ |
| Slightly rounded | Small border-radius (4-8px). Approachable but still bold. | |
| Mixed | Sharp structure, rounded interactive elements. | |

**User's choice:** Sharp edges

### CTA Buttons

| Option | Description | Selected |
|--------|-------------|----------|
| Solid red, bold text | Full red background, white uppercase text. Maximum visibility. | |
| Red outline with hover fill | Red border, transparent. Fills on hover. More subtle. | |
| Two tiers | Solid primary, outline secondary. Visual hierarchy. | ✓ |

**User's choice:** Two tiers — solid primary, outline secondary

### Card Style

| Option | Description | Selected |
|--------|-------------|----------|
| Bold border-left accent | Thick red left border stripe. Highlighted dossier feel. | |
| Full-bleed image top | Featured image spans full width at top, content below. | ✓ |
| Minimal dividers | No borders. Horizontal rules and whitespace. Editorial. | |

**User's choice:** Full-bleed image top

### Layout Density

| Option | Description | Selected |
|--------|-------------|----------|
| Generous spacing | Breathing room. Big headlines with space. Confident, readable. | ✓ |
| Compact & information-dense | Tighter spacing. News dashboard feel. | |
| Alternating sections | Hero sections generous, data sections compact. | |

**User's choice:** Generous spacing

---

## Claude's Discretion

- Exact color hex/HSL values (must pass WCAG AA)
- Specific font selection within described categories
- Tailwind spacing scale and breakpoints
- Focus ring and hover state styling
- Shadow usage
- Icon library integration
- @tailwindcss/typography prose configuration

## Deferred Ideas

None — discussion stayed within phase scope.
