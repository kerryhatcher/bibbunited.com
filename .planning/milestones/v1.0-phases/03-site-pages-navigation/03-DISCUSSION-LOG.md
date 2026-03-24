# Phase 3: Site Pages & Navigation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 03-site-pages-navigation
**Areas discussed:** Homepage layout, Navigation structure, Civic action pages, Content templates

---

## Homepage Layout

### Hero Section Design

| Option | Description | Selected |
|--------|-------------|----------|
| Full-width banner | Bold, full-bleed dark section with large headline, subtext, and CTA buttons. CMS-editable headline and subtext. | |
| Rotating spotlight | Hero cycles through 2-3 featured stories picked by editors. Each slide has headline, excerpt, and link. | ✓ |
| Urgent-first hero | When urgent banner is active, hero amplifies it. When inactive, standard banner. | |

**User's choice:** Rotating spotlight
**Notes:** None

### News Section Below Hero

| Option | Description | Selected |
|--------|-------------|----------|
| 3-column card grid | 3 cards on desktop, 2 on tablet, 1 on mobile. Uses existing Card component. | |
| Featured + list | 1 large featured card on left, 3-4 smaller list items on right. | ✓ |
| Timeline list | Vertical list with dates on left, headlines and excerpts on right. | |

**User's choice:** Featured + list
**Notes:** None

### Topic Callouts

| Option | Description | Selected |
|--------|-------------|----------|
| CMS-managed topic cards | Editors pick 3-4 key topic pages to feature. Icon/image, title, blurb, link. | ✓ |
| Hardcoded quick links | Fixed set of 3 links. No CMS management. | |
| You decide | Claude picks. | |

**User's choice:** CMS-managed topic cards
**Notes:** None

### Spotlight Count and Rotation

| Option | Description | Selected |
|--------|-------------|----------|
| Up to 3, manual advance only | No auto-rotation. Arrows/dots for navigation. | |
| Up to 5, auto-rotate with pause | Auto-rotates every 6-8 seconds, pauses on hover/focus. | ✓ |
| Up to 3, auto-rotate | Same as first but with auto-rotation. | |

**User's choice:** Up to 5, auto-rotate with pause
**Notes:** None

---

## Navigation Structure

### Header Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Sticky header with inline nav | Logo left, nav right, fixed at top. Urgent banner above. | ✓ |
| Static header, scrolls away | Same layout but scrolls off-screen. | |
| Condensed on scroll | Full-height header shrinks to compact bar on scroll. | |

**User's choice:** Sticky header with inline nav
**Notes:** None

### Mobile Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Hamburger with slide-out panel | Hamburger icon, full-height panel from right, overlay dims page. | ✓ |
| Full-screen overlay | Full-screen menu over entire page. Bold, dramatic. | |

**User's choice:** Hamburger with slide-out panel
**Notes:** None

### Footer Design

| Option | Description | Selected |
|--------|-------------|----------|
| Compact info footer | Logo, mission statement, quick links, social links, copyright. | |
| CTA-heavy footer | Leads with bold "Get Involved" CTA section, then links and info below. | ✓ |
| You decide | Claude picks. | |

**User's choice:** CTA-heavy footer
**Notes:** None

### Dropdown Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Hover-open with click fallback | Opens on hover, click for keyboard/touch. Arrow key navigation. | ✓ |
| Click-only | Opens only on click, stays open until clicking elsewhere. | |
| Mega menu | Wide dropdown spanning full width with columns. | |

**User's choice:** Hover-open with click fallback
**Notes:** None

---

## Civic Action Pages

### Officials Data Management

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated Officials collection | Each official is a CMS record with name, role, email, phone, photo. | ✓ |
| Rich text page with manual formatting | Editors maintain info as structured rich text. | |
| Array field on a dedicated page | Repeating array of fields on a special page type. | |

**User's choice:** Dedicated Officials collection
**Notes:** None

### Meeting Schedule Management

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated Meetings collection | Each meeting is a CMS record with date, time, location, agenda link. | ✓ |
| Array field on a page | Repeating array of date/time/location on a page. | |
| Rich text page | Editors maintain schedule as formatted text. | |

**User's choice:** Dedicated Meetings collection
**Notes:** None

### Past Meeting Visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Collapsed section below | Upcoming shown prominently, past in collapsible section. | ✓ |
| Hidden entirely | Only upcoming meetings visible. | |
| All visible, past grayed out | All chronological, past dimmed. | |

**User's choice:** Collapsed section below
**Notes:** None

### Organizational Body Field

| Option | Description | Selected |
|--------|-------------|----------|
| Defer to future phase | Flat Officials collection for v1. | |
| Add a simple body field now | Select field for body/org on Officials. Groups on contact page. | ✓ |

**User's choice:** Add a simple body field now
**Notes:** User suggested an org/body/board content type. Scoped down to a simple select field rather than a full collection — lightweight grouping that supports multiple civic bodies without over-engineering for v1.

---

## Content Templates

### News Post Article Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Full-width featured image + prose | Image at top, title/author/date below, prose body, CTA at bottom. | ✓ |
| Side-by-side with metadata sidebar | Content left, metadata sidebar right. | |

**User's choice:** Full-width featured image + prose
**Notes:** None

### Content Freshness Signals

| Option | Description | Selected |
|--------|-------------|----------|
| Published + Updated dates | Show both dates on articles, relative time on cards for recent posts. | ✓ |
| Relative time everywhere | Always show "X ago" format. | |
| Freshness badge | Colored NEW/UPDATED badges on recent posts. | |

**User's choice:** Published + Updated dates
**Notes:** None

### Print-Friendly Styling

| Option | Description | Selected |
|--------|-------------|----------|
| CSS @media print stylesheet | Print media query, no extra button. | |
| Print button + styled output | Visible "Print this article" button with clean print view. | ✓ |
| You decide | Claude picks. | |

**User's choice:** Print button + styled output
**Notes:** None

### Static Page Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Same prose layout, no image/date | Centered prose column like news posts but without metadata. | ✓ |
| Pages get hero banner | Colored header banner per page, then prose below. | |
| You decide | Claude picks. | |

**User's choice:** Same prose layout, no image/date
**Notes:** None

---

## Claude's Discretion

- Hero spotlight animation/transition implementation
- Navigation Global schema design
- Homepage callouts data structure
- Responsive breakpoint details for featured + list layout
- Date formatting logic details
- Print view implementation approach
- Officials sort order mechanism
- Meetings collection additional field choices

## Deferred Ideas

- Full organizational body/board collection — promote select field to collection when site expands beyond school board focus
