# Phase 10: Component Migration & Visual Fixes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 10-component-migration-visual-fixes
**Areas discussed:** Link migration strategy, Image optimization approach, Footer contrast fix, Keyboard trap fix, next.config.ts image config, Build verification strategy, Migration ordering

---

## Link Migration Strategy

### Button component link behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Button wraps next/link | When href provided, render Link instead of a. Single source of truth. | * |
| Separate LinkButton component | Keep Button as-is, create new LinkButton. Cleaner separation but more call sites to update. | |
| You decide | Claude picks cleanest approach. | |

**User's choice:** Button wraps next/link (Recommended)
**Notes:** Single source of truth preferred -- every button-link gets client-side nav automatically.

### External-type nav items handling

| Option | Description | Selected |
|--------|-------------|----------|
| Treat internal paths as Link | If URL starts with /, use next/link regardless of type. Only https:// gets raw a. | * |
| Only migrate 'internal' type items | Only convert type='internal' to next/link. Safer but leaves performance on table. | |
| You decide | Claude picks based on URL patterns. | |

**User's choice:** Treat internal paths as Link (Recommended)
**Notes:** Simple heuristic covers all cases including /news, /meetings collection listing routes.

### Logo link migration

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, migrate all internal links | Logo href="/" becomes Link. Consistent -- no exceptions. | * |
| No, keep logo as a | Some sites keep logo as hard navigation to reset state. | |

**User's choice:** Yes, migrate all internal links (Recommended)

---

## Image Optimization Approach

### Image sizing mode

| Option | Description | Selected |
|--------|-------------|----------|
| fill mode with sized parents | Hero and card images use Image fill inside parents with aspect-ratio/height. | * |
| Fixed width/height everywhere | Explicit dimensions. Zero CLS risk but less responsive. | |
| Mix: fill for hero, fixed for cards | Hero uses fill, cards use fixed. Pragmatic middle ground. | |

**User's choice:** fill mode with sized parents (Recommended)
**Notes:** Requires auditing parent containers for position:relative and dimensions.

### Payload size variants usage

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, use Payload sizes | Reference thumbnail/card/hero URLs from Payload's sizes object. | * |
| Let next/image handle it | Point at original upload, let Next.js generate variants. Duplicates work. | |
| You decide | Claude picks most efficient approach. | |

**User's choice:** Yes, use Payload sizes (Recommended)

### Hero image priority

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, hero gets priority | Mark above-the-fold hero with priority={true} for LCP preloading. | * |
| No priority hints | Let browser figure it out. Site already has good LCP (321ms). | |

**User's choice:** Yes, hero gets priority (Recommended)

---

## Footer Contrast Fix

### Fix approach

| Option | Description | Selected |
|--------|-------------|----------|
| Fix CSS variable globally | Update --color-text-on-dark variable. Every component benefits. | * |
| Override locally in Footer only | Replace with text-white in Footer.tsx only. | |
| You decide | Claude audits all usages and picks right scope. | |

**User's choice:** Fix the CSS variable globally (Recommended)
**Notes:** After investigation, the CSS variable is already #FFFFFF (correct). Real issue is /80 opacity modifier on copyright text.

### Root cause investigation

| Option | Description | Selected |
|--------|-------------|----------|
| Verify in browser, fix what's real | Check computed colors during implementation. Remove /80 opacity. Fix at root. | * |
| Remove all opacity modifiers preemptively | Strip /80 and any other opacity modifiers. Simple and safe. | |
| You decide | Claude verifies and applies minimal correct fix. | |

**User's choice:** Verify in browser, fix what's real (Recommended)
**Notes:** CSS variable --color-text-on-dark is already #FFFFFF (11.7:1 contrast). UI review's 1.24:1 was likely measurement error. Only real issue is text-text-on-dark/80 opacity modifier on copyright line.

---

## Keyboard Trap Fix

### Fix approach

| Option | Description | Selected |
|--------|-------------|----------|
| inert attribute | Add inert={!mobileOpen} to panel div. Native, declarative, preserves CSS transition. | * |
| Conditional render (mount/unmount) | Only render when open. Zero trap risk but loses slide animation. | |
| aria-hidden + tabIndex management | Manual management of every focusable element. More verbose. | |
| You decide | Claude picks based on component patterns. | |

**User's choice:** inert attribute (Recommended)
**Notes:** React 19 supports boolean inert natively. Preserves existing CSS slide-out transition.

### Focus lock when open

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, trap focus in open menu | Tab cycles only through menu items and close button. WCAG 2.4.3. | * |
| No, just prevent trap when closed | Only fix keyboard trap when closed via inert. | |
| You decide | Claude implements appropriate level per WCAG. | |

**User's choice:** Yes, trap focus in open menu (Recommended)

---

## next.config.ts Image Config

### Image output formats

| Option | Description | Selected |
|--------|-------------|----------|
| AVIF + WebP | images.formats: ['image/avif', 'image/webp']. Best compression. | * |
| WebP only | Simpler, universal support, slightly faster encoding. | |
| You decide | Claude picks based on audience and hosting. | |

**User's choice:** AVIF + WebP (Recommended)

---

## Build Verification Strategy

### Build verification timing

| Option | Description | Selected |
|--------|-------------|----------|
| Before AND after each migration batch | Baseline, after links, after images, after fixes. Catches regressions at each step. | * |
| Only at the end | Single build check after all changes. Faster but harder to isolate issues. | |
| You decide | Claude determines right cadence. | |

**User's choice:** Before AND after each migration batch (Recommended)

### Client-side navigation verification

| Option | Description | Selected |
|--------|-------------|----------|
| Automated browser test | Playwright/Chrome DevTools to verify no full page reload. Aligns with automated testing mandate. | * |
| Build success is sufficient | If TypeScript compiles, links are correct. No runtime verification. | |
| You decide | Claude picks right verification approach. | |

**User's choice:** Automated browser test (Recommended)

---

## Migration Ordering

### Plan structure

| Option | Description | Selected |
|--------|-------------|----------|
| Two plans: migrations then fixes | Plan 1: next/link + next/image. Plan 2: Footer contrast + keyboard trap. Build check between. | * |
| One plan per work item (4 plans) | Each migration/fix is its own plan. More granular but more overhead. | |
| Single plan (all 4 together) | One plan covers everything. Simplest but if one blocks, all stalls. | |
| You decide | Claude groups based on dependencies and risk. | |

**User's choice:** Two plans: migrations then fixes (Recommended)

---

## Claude's Discretion

- Exact sizes prop values for responsive breakpoints
- Focus trap implementation details (custom hook vs inline logic)
- Whether Button needs 'use client' or wrapper pattern
- Parent container audit for Image fill positioning

## Deferred Ideas

None -- discussion stayed within phase scope
