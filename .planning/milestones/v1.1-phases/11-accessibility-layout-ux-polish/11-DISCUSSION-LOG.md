# Phase 11: Accessibility, Layout & UX Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 11-accessibility-layout-ux-polish
**Areas discussed:** Skip link & H1 structure, Active nav & bylines, News excerpts & empty states, Spacing/focus rings/footer CTA, Excerpt field details, Active nav in mobile menu, Skip link target & ID

---

## Skip Link Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Hidden until focused | Invisible by default, slides into view on Tab. Standard a11y pattern. | * |
| Always visible | Persistent link at top of page, always shown. | |
| You decide | Claude picks standard approach. | |

**User's choice:** Hidden until focused
**Notes:** Standard a11y pattern for civic/government sites.

---

## Homepage H1

| Option | Description | Selected |
|--------|-------------|----------|
| Visually hidden H1 | sr-only H1 at top of page. Screen readers get structure, visual unchanged. | * |
| Visible H1 above hero | Visible heading above hero spotlight. Changes layout. | |
| H1 on hero section | Hero headline becomes the H1. Ties to dynamic content. | |

**User's choice:** Visually hidden H1
**Notes:** None.

---

## Active Nav Indicator

| Option | Description | Selected |
|--------|-------------|----------|
| Bold text + bottom border | Active item gets bold weight and colored underline, plus aria-current. | * |
| Background highlight | Subtle background color change on active item. | |
| You decide | Claude picks style matching existing header design. | |

**User's choice:** Bold text + bottom border
**Notes:** None.

---

## Byline Display

| Option | Description | Selected |
|--------|-------------|----------|
| Display name only | "By [displayName]" next to date. Falls back to "By BIBB United Staff". | * |
| Display name + role | "By [name], [role]" -- would need schema addition. | |
| You decide | Claude picks cleanest approach with existing schema. | |

**User's choice:** Display name only
**Notes:** Uses existing displayName field from Phase 9.

---

## News Excerpt Source

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-extract from body | Strip ~150 chars from Lexical body. No CMS changes. | |
| Add excerpt CMS field | Optional excerpt field on NewsPost. Editors write custom summaries. | * |
| You decide | Claude picks based on editorial team size. | |

**User's choice:** Add excerpt CMS field
**Notes:** User prefers giving editors explicit control over excerpt text.

---

## Excerpt Fallback Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, auto-fallback | If field empty, strip ~150 chars from body. | * |
| No, show nothing if empty | Only show excerpt when editor writes one. | |

**User's choice:** Yes, auto-fallback
**Notes:** Reduces editorial burden -- every card gets text even without manual input.

---

## Empty State Treatment

| Option | Description | Selected |
|--------|-------------|----------|
| Actionable message + CTA | Friendly message with link to contact page or next action. | * |
| Simple 'no content' message | "No [items] available at this time." | |
| You decide | Claude picks approach matching activist tone. | |

**User's choice:** Actionable message + CTA
**Notes:** Guides users to next step rather than dead-ending.

---

## Main Content Spacing

| Option | Description | Selected |
|--------|-------------|----------|
| Keep pt-16, verify correctness | Header is h-16 (64px), pt-16 matches. Verify across page types. | * |
| Dynamic spacing via CSS calc | CSS variable for header height, calc() for padding. | |
| You decide | Claude evaluates actual header height. | |

**User's choice:** Keep pt-16, verify correctness
**Notes:** STATE.md explicitly warns "pt-16 is NOT unnecessary."

---

## Footer Focus Indicators

| Option | Description | Selected |
|--------|-------------|----------|
| Gold/accent outline | Site's gold accent for focus rings. High contrast on navy. | * |
| White outline | Maximum contrast (white on navy) but less branded. | |
| You decide | Claude picks a11y-compliant style. | |

**User's choice:** Gold/accent outline
**Notes:** Matches brand, high contrast against dark footer background.

---

## Footer CTA on Current Page

| Option | Description | Selected |
|--------|-------------|----------|
| Hide CTA on target page | Don't render CTA when user is on the linked page. | * |
| Show but disable/restyle | Keep visible but muted/unlinked. | |
| You decide | Claude picks cleanest approach. | |

**User's choice:** Hide CTA on target page
**Notes:** Clean, no dead links.

---

## Excerpt Field Details (follow-up)

| Option | Description | Selected |
|--------|-------------|----------|
| 160 chars max | Matches meta description length. Good for cards and SEO. | * |
| 280 chars max | Twitter-length. More room but needs multi-line truncation. | |
| You decide | Claude picks based on card layout. | |

**User's choice:** 160 chars max

| Option | Description | Selected |
|--------|-------------|----------|
| News listing cards only | Show on /news page cards. Detail pages show full body. | * |
| Cards + article detail | Show on cards and as lead paragraph on detail page. | |
| You decide | Claude picks based on existing layout. | |

**User's choice:** News listing cards only
**Notes:** None.

---

## Mobile Active Nav

| Option | Description | Selected |
|--------|-------------|----------|
| Bold + left accent bar | Vertical adaptation: left bar instead of bottom border. | * |
| Same as desktop | Bold + bottom border. Less natural in vertical list. | |
| You decide | Claude adapts to existing mobile menu design. | |

**User's choice:** Bold + left accent bar
**Notes:** Consistent brand feel, adapted for vertical layout.

---

## Skip Link Target

| Option | Description | Selected |
|--------|-------------|----------|
| Target main with id | Add id="main-content" to existing <main> tag. | * |
| Target first content section | Add id to first meaningful content element. | |
| You decide | Claude picks standard approach. | |

**User's choice:** Target main with id="main-content"
**Notes:** Standard pattern, skips header+banner+nav in one jump.

---

## Claude's Discretion

- Exact sr-only H1 text wording
- Skip link visual transition animation
- Accent color shade for active nav indicators
- Lexical-to-plain-text extraction implementation
- Empty state exact copy and CTA targets
- Footer client component wrapper pattern
- Plan structure/grouping

## Deferred Ideas

None.
