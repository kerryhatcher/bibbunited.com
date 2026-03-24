# Phase 3: Site Pages & Navigation - Research

**Researched:** 2026-03-24
**Domain:** Next.js App Router pages, Payload CMS Globals/Collections, frontend rendering, navigation
**Confidence:** HIGH

## Summary

Phase 3 assembles the public-facing site from the CMS foundation (Phase 1) and design system (Phase 2). The work divides into four domains: (1) CMS data layer -- two new collections (Officials, Meetings) and a Navigation Global with nested menu items supporting internal/external links; (2) frontend page templates -- homepage with hero spotlight, news listing, topic callouts, plus article and static page templates with rich text rendering; (3) site chrome -- sticky header with mobile hamburger menu, CTA-heavy footer, and UrgentBanner integration; (4) content features -- date formatting with date-fns, print-friendly CSS, and freshness signals.

The existing codebase provides strong foundations: Tailwind v4 CSS-first tokens with dual-mode switching, reusable UI components (Button, Card, Section, Logo), Payload collections for Pages and NewsPosts with slugs/drafts/CTAs, and the `getThemeMode()` pattern for server-side Global fetching. The main technical risk is rich text rendering on the frontend -- Payload 3.x uses the `RichText` component from `@payloadcms/richtext-lexical/react` with JSX converters, which requires careful depth configuration when fetching data to populate upload nodes and internal links.

**Primary recommendation:** Build the Navigation Global and site chrome (header/footer) first, then page templates, then civic action pages, then homepage -- this order ensures the layout shell exists before content pages fill it.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Hero section is a rotating spotlight -- editors pick up to 5 featured stories. Auto-rotates every 6-8 seconds, pauses on hover/focus. Arrows and dots for manual navigation.
- **D-02:** Below the hero, a featured + list layout: 1 large featured card on the left, 3-4 smaller list items on the right. Shows the most recent published news posts.
- **D-03:** Below the news, CMS-managed topic callout cards -- editors pick 3-4 key pages to feature. Each shows an icon/image, title, short blurb, and link. Managed via a Payload Global or homepage-specific fields.
- **D-04:** Sticky header -- logo on left, horizontal nav links on right. Fixed at top on scroll. Urgent banner renders ABOVE the sticky header when active.
- **D-05:** Mobile navigation: hamburger icon on right side of header. Opens a slide-out panel from the right with nav links and expandable dropdown sections. Overlay dims the page behind it.
- **D-06:** Desktop dropdowns: hover-open with click fallback for keyboard/touch users. Keyboard arrow navigation for accessibility.
- **D-07:** Footer is CTA-heavy -- leads with a bold "Get Involved" section with action buttons (Contact Officials, Meetings), then quick links and copyright below. Navy background.
- **D-08:** Navigation menu data managed via Payload -- CMS-managed menu items supporting both internal page links and external URLs with one level of sub-items (NAV-01, NAV-02).
- **D-09:** Officials managed via a dedicated Payload CMS collection with fields: name, role/title, body (select field), email, phone, and optional photo. Contact page groups officials by body.
- **D-10:** Meetings managed via a dedicated Payload CMS collection with fields: date, time, location, optional agenda link, and optional notes. Frontend auto-sorts by date.
- **D-11:** About/Mission page is a standard CMS page accessible from navigation (NAV-03).
- **D-12:** News post article layout: full-width featured image at top, title (uppercase h1), author + published date + updated date below, rich text body in prose style (65ch max-width), CTA block at bottom.
- **D-13:** Static page layout: same centered prose column as news posts, but without featured image, author, or date.
- **D-14:** Content freshness: show "Published: [date]" and "Updated: [date]" when dates differ. On homepage cards/lists, show relative time for posts < 7 days old.
- **D-15:** Print-friendly: visible "Print this article" button that opens clean print view -- hides nav, footer, CTAs, urgent banner.

### Claude's Discretion
- Hero spotlight implementation details (CSS transitions vs JS animation library)
- Navigation Global schema design (array of menu items with nested sub-items)
- Homepage topic callouts Global vs homepage-specific field approach
- Responsive breakpoints for featured + list layout collapsing on mobile
- Date formatting with date-fns (relative vs absolute threshold logic)
- Print view implementation (CSS @media print vs separate route)
- Officials collection sort order field (drag-and-drop vs explicit order number)
- Meetings collection fields beyond the specified ones (type/category)

### Deferred Ideas (OUT OF SCOPE)
- Organizational body/board content type as a full collection -- not needed for v1 where school board is the primary focus.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NAV-01 | CMS-managed navigation menu with one level of dropdown sub-items | Navigation Global with array of items, each with nested sub-items array. Use Payload's `type: 'array'` with conditional link fields for internal/external URLs. |
| NAV-02 | Menu items support both internal page links and external URLs | Reusable link field pattern with radio select (internal/custom URL), relationship field to pages/news-posts, and URL text field with conditional display. |
| NAV-03 | About/Mission page accessible from navigation | Standard Pages collection entry with slug 'about'. Rendered via `[slug]/page.tsx` catch-all route. |
| CIVX-01 | Contact Your Officials page with names, roles, emails, phone numbers | New Officials collection with grouped display by body (select field). Dedicated route `/contact-officials`. |
| CIVX-02 | Meeting Schedule page showing upcoming dates, times, locations | New Meetings collection with date-based sorting. Dedicated route `/meetings`. Upcoming vs past meetings split. |
| DSGN-03 | Clear, scannable homepage with latest news, key topic callouts, and hero section | Homepage route with hero spotlight carousel, featured+list news layout, and topic callout cards. All data from Payload Local API. |
| DSGN-06 | Content freshness signals (last updated timestamps, recent activity indicators) | date-fns `formatDistanceToNow` for relative time, `format` for absolute dates. Compare `publishDate` and `updatedAt` to show both when they differ. |
| DSGN-07 | Print-friendly CSS stylesheet for articles | CSS `@media print` rules hiding nav, footer, banner, CTAs. Visible "Print this article" button calling `window.print()`. |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | ^16.2.1 | App Router, SSR/SSG | Already installed. Server Components for data fetching, Client Components for interactive elements. |
| React | ^19.2.4 | UI rendering | Already installed. Server Components reduce client bundle. |
| Payload CMS | ^3.80.0 | CMS, Local API | Already installed. Collections + Globals for all content management. |
| @payloadcms/richtext-lexical | ^3.80.0 | Rich text editing + frontend rendering | Already installed. Provides `RichText` component from `/react` subpath for JSX conversion. |
| Tailwind CSS | ^4.2.2 | Utility-first styling | Already installed. CSS-first config with `@theme` block. |
| @tailwindcss/typography | ^0.5.19 | Prose styling | Already installed. `prose` class for rich text content rendering. |
| lucide-react | ^1.0.1 | Icons | Already installed. For nav hamburger, contact icons, meeting icons, arrows. |

### To Install
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | ^4.x | Date formatting | Relative time ("2 days ago") and absolute date formatting. Required by DSGN-06. |

**Installation:**
```bash
pnpm add date-fns
```

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS transitions for hero | Framer Motion or Swiper | CSS transitions are sufficient for a simple fade/slide carousel. No animation library needed -- reduces bundle size. Use CSS `transition` with `translateX` and `opacity`. |
| CSS @media print | Separate print route | @media print is simpler, requires no extra routing, and works with `window.print()`. A separate route would duplicate content and is harder to maintain. |
| Homepage Global for callouts | Homepage-specific fields on Pages | A dedicated `Homepage` Global is cleaner -- editors manage callouts in one place without finding the right page document. |

## Architecture Patterns

### Recommended Project Structure
```
src/
  collections/
    Officials.ts            # New - CIVX-01
    Meetings.ts             # New - CIVX-02
  globals/
    Navigation.ts           # New - NAV-01, NAV-02
    Homepage.ts             # New - DSGN-03 (hero spotlight + topic callouts)
  fields/
    link.ts                 # New - reusable internal/external link field
  components/
    layout/
      Header.tsx            # Client component - sticky header, mobile menu
      Footer.tsx            # Server component - CTA footer
      UrgentBannerBar.tsx   # Server component - renders UrgentBanner global
    homepage/
      HeroSpotlight.tsx     # Client component - rotating hero carousel
      LatestNews.tsx        # Server component - featured + list news layout
      TopicCallouts.tsx     # Server component - CMS-managed callout cards
    news/
      ArticleLayout.tsx     # Server component - news post template
    pages/
      PageLayout.tsx        # Server component - static page template
    shared/
      DateDisplay.tsx       # Client component - relative/absolute date formatting
      PrintButton.tsx       # Client component - window.print() trigger
      RichTextRenderer.tsx  # Server component - wraps Payload RichText with prose styling
  app/(frontend)/
    page.tsx                # Homepage (replaces design showcase)
    [slug]/
      page.tsx              # Static pages catch-all
    news/
      [slug]/
        page.tsx            # News post article pages
    contact-officials/
      page.tsx              # Officials listing page - CIVX-01
    meetings/
      page.tsx              # Meeting schedule page - CIVX-02
    styles.css              # Existing - add @media print rules
  lib/
    getTheme.ts             # Existing
    getNavigation.ts        # New - fetch Navigation global
    getHomepage.ts          # New - fetch Homepage global
```

### Pattern 1: Navigation Global Schema
**What:** A Payload Global with an array of menu items, each supporting optional nested sub-items.
**When to use:** CMS-managed site navigation (NAV-01, NAV-02, D-08).
**Example:**
```typescript
// src/globals/Navigation.ts
import type { GlobalConfig } from 'payload'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Site Navigation',
  access: { read: () => true },
  fields: [
    {
      name: 'items',
      type: 'array',
      maxRows: 8,
      fields: [
        { name: 'label', type: 'text', required: true },
        {
          name: 'type',
          type: 'radio',
          defaultValue: 'internal',
          options: [
            { label: 'Internal Page', value: 'internal' },
            { label: 'External URL', value: 'external' },
          ],
        },
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages',
          admin: { condition: (_, siblingData) => siblingData?.type === 'internal' },
        },
        {
          name: 'url',
          type: 'text',
          admin: { condition: (_, siblingData) => siblingData?.type === 'external' },
        },
        { name: 'newTab', type: 'checkbox', defaultValue: false },
        {
          name: 'children',
          type: 'array',
          maxRows: 6,
          label: 'Dropdown Items',
          admin: { initCollapsed: true },
          fields: [
            { name: 'label', type: 'text', required: true },
            {
              name: 'type',
              type: 'radio',
              defaultValue: 'internal',
              options: [
                { label: 'Internal Page', value: 'internal' },
                { label: 'External URL', value: 'external' },
              ],
            },
            {
              name: 'page',
              type: 'relationship',
              relationTo: 'pages',
              admin: { condition: (_, siblingData) => siblingData?.type === 'internal' },
            },
            {
              name: 'url',
              type: 'text',
              admin: { condition: (_, siblingData) => siblingData?.type === 'external' },
            },
            { name: 'newTab', type: 'checkbox', defaultValue: false },
          ],
        },
      ],
    },
  ],
}
```

### Pattern 2: Reusable Link Field
**What:** Extract the internal/external link pattern into a reusable field function.
**When to use:** Any field needing to link to internal pages or external URLs (nav items, CTAs, topic callouts).
**Rationale:** The Payload website template uses this exact pattern. It reduces duplication between navigation items, footer links, and callout links.
```typescript
// src/fields/link.ts
import type { Field } from 'payload'

type LinkOptions = {
  relationTo?: string[]
  disableLabel?: boolean
}

export const linkFields = (options?: LinkOptions): Field[] => {
  const { relationTo = ['pages'], disableLabel = false } = options || {}
  return [
    ...(disableLabel ? [] : [{
      name: 'label',
      type: 'text' as const,
      required: true,
    }]),
    {
      name: 'type',
      type: 'radio' as const,
      defaultValue: 'internal',
      options: [
        { label: 'Internal Page', value: 'internal' },
        { label: 'External URL', value: 'external' },
      ],
    },
    {
      name: 'page',
      type: 'relationship' as const,
      relationTo,
      admin: { condition: (_, siblingData) => siblingData?.type === 'internal' },
    },
    {
      name: 'url',
      type: 'text' as const,
      admin: { condition: (_, siblingData) => siblingData?.type === 'external' },
    },
    {
      name: 'newTab',
      type: 'checkbox' as const,
      defaultValue: false,
    },
  ]
}
```

### Pattern 3: Server Component Data Fetching
**What:** Fetch Payload data in Server Components using the Local API (no network hop).
**When to use:** All page routes and layout components.
**Example:**
```typescript
// src/lib/getNavigation.ts
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function getNavigation() {
  const payload = await getPayload({ config: configPromise })
  return payload.findGlobal({
    slug: 'navigation',
    depth: 1, // populate page relationships one level deep
  })
}
```

### Pattern 4: Rich Text Rendering
**What:** Render Payload Lexical rich text content as JSX on the frontend.
**When to use:** All pages and news posts that display rich text body content.
**Example:**
```typescript
// src/components/shared/RichTextRenderer.tsx
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

interface Props {
  data: SerializedEditorState
  className?: string
}

export function RichTextRenderer({ data, className = '' }: Props) {
  return (
    <div className={`prose max-w-[65ch] ${className}`}>
      <RichText data={data} />
    </div>
  )
}
```

### Pattern 5: Hero Spotlight (Client Component)
**What:** Rotating carousel of editor-curated featured stories.
**When to use:** Homepage hero section (D-01).
**Implementation approach:**
- Client Component with `'use client'` directive
- CSS transitions for slide animation (`translateX` with `transition-transform duration-500`)
- `useEffect` with `setInterval` for 7-second auto-rotation
- Pause on hover via `onMouseEnter`/`onMouseLeave`
- Pause on focus for keyboard accessibility
- Arrow buttons and dot indicators for manual navigation
- Data passed as props from Server Component parent

### Pattern 6: Date Formatting
**What:** Conditional relative/absolute date display per D-14.
**When to use:** Homepage news cards and article pages.
**Example:**
```typescript
import { formatDistanceToNow, format, differenceInDays } from 'date-fns'

export function formatArticleDate(dateString: string): string {
  const date = new Date(dateString)
  const daysAgo = differenceInDays(new Date(), date)
  if (daysAgo < 7) {
    return formatDistanceToNow(date, { addSuffix: true })
  }
  return format(date, 'MMMM d, yyyy')
}
```

### Anti-Patterns to Avoid
- **Fetching nav data in every page component:** Fetch once in the layout, pass to Header/Footer. Do not call `getNavigation()` in individual page routes.
- **Using REST/GraphQL API for server-side rendering:** Use Payload's Local API (`getPayload()` + `payload.find()` / `payload.findGlobal()`) -- zero network overhead since Payload runs in the same process.
- **Making the entire Header a Server Component:** The dropdown/hamburger menu requires client-side state. Make Header a Client Component that receives nav data as serializable props from the layout Server Component.
- **Hand-rolling rich text to HTML conversion:** Use `@payloadcms/richtext-lexical/react` RichText component. It handles all Lexical node types including custom blocks.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rich text rendering | Custom Lexical-to-HTML converter | `RichText` from `@payloadcms/richtext-lexical/react` | Handles all node types, custom blocks, uploads, internal links. Custom converters break on Payload updates. |
| Date relative formatting | Custom "X days ago" logic | `date-fns` `formatDistanceToNow` | Handles edge cases (minutes, hours, days, months), localization, and suffix ("ago"). |
| Internal/external link pattern | Separate link fields per collection | Reusable `linkFields()` function | Consistency across nav items, footer links, topic callouts. Payload website template uses this exact pattern. |
| Carousel/spotlight | Custom requestAnimationFrame loop | CSS transitions + setInterval | CSS hardware-accelerated transitions are smoother and simpler. No animation library needed for a basic spotlight. |

## Common Pitfalls

### Pitfall 1: Rich Text Depth Mismatch
**What goes wrong:** RichText component renders broken content or throws errors because upload/relationship nodes are not populated.
**Why it happens:** Payload's `find()` and `findGlobal()` default to `depth: 1`. Rich text with embedded uploads or internal links needs sufficient depth to populate nested relationships.
**How to avoid:** Always set `depth: 2` when fetching content that includes rich text with uploads or links. Test with actual content that has embedded images.
**Warning signs:** Images show as `[object Object]` or internal links render as empty.

### Pitfall 2: Sticky Header Covering Content
**What goes wrong:** Fixed/sticky header overlaps the first section of page content.
**Why it happens:** Fixed-position elements are removed from document flow.
**How to avoid:** Add `pt-[header-height]` to the `<main>` element or the body. Calculate header height including the UrgentBanner (when active) and the header itself.
**Warning signs:** Hero section text hidden behind the header on page load.

### Pitfall 3: Mobile Menu Z-Index Wars
**What goes wrong:** Mobile slide-out menu appears behind other elements or the overlay doesn't cover everything.
**Why it happens:** Multiple positioned elements (sticky header, urgent banner, mobile menu, overlay) competing for z-index stacking.
**How to avoid:** Define a clear z-index scale: urgent-banner (z-40), header (z-50), mobile-overlay (z-50), mobile-menu (z-60). Document in styles.css.
**Warning signs:** Menu flickers or elements show through the overlay.

### Pitfall 4: Hydration Mismatch on Date Components
**What goes wrong:** Server-rendered date ("2 days ago") doesn't match client-rendered date, causing React hydration error.
**Why it happens:** `formatDistanceToNow` produces different strings at different times. Server renders at build/request time, client re-renders later.
**How to avoid:** Make DateDisplay a Client Component. Render a stable fallback (absolute date) on the server, then update to relative time in a `useEffect`. Or use `suppressHydrationWarning` on the date element.
**Warning signs:** Console warnings about text content mismatch.

### Pitfall 5: Draft Content Leaking to Public
**What goes wrong:** Unpublished draft content appears on the public site.
**Why it happens:** Forgetting to pass `where: { _status: { equals: 'published' } }` in frontend queries, or relying solely on collection-level access control without query filtering.
**How to avoid:** The existing Pages and NewsPosts collections already have access control that filters by `_status: 'published'` for non-authenticated users. Verify this works for the new Officials and Meetings collections too. Also, the Local API in Server Components runs without a `req.user`, so the access control filter applies automatically.
**Warning signs:** Test by creating a draft post and checking if it appears on the homepage or listing pages.

### Pitfall 6: Print Styles Incomplete
**What goes wrong:** Print output still shows navigation, footers, or interactive elements.
**Why it happens:** `@media print` rules don't cover all non-content elements.
**How to avoid:** Use a wrapper class strategy: mark all non-content chrome with a `print:hidden` class. Tailwind supports `print:` variant out of the box in v4.
**Warning signs:** Test with browser print preview during development.

## Code Examples

### Officials Collection
```typescript
// src/collections/Officials.ts
import type { CollectionConfig } from 'payload'

export const Officials: CollectionConfig = {
  slug: 'officials',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'body', 'email'],
  },
  access: {
    read: () => true, // Public data - no draft system needed
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', required: true, label: 'Title / Role' },
    {
      name: 'body',
      type: 'select',
      required: true,
      label: 'Governing Body',
      options: [
        { label: 'Board of Education', value: 'board-of-education' },
        { label: 'County Commission', value: 'county-commission' },
        { label: 'Water Board', value: 'water-board' },
      ],
    },
    { name: 'email', type: 'email' },
    { name: 'phone', type: 'text' },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional headshot photo' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first within their group',
      },
    },
  ],
}
```

### Meetings Collection
```typescript
// src/collections/Meetings.ts
import type { CollectionConfig } from 'payload'

export const Meetings: CollectionConfig = {
  slug: 'meetings',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'time', 'location'],
  },
  access: {
    read: () => true, // Public data
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'e.g., "Regular Board Meeting", "Budget Work Session"' },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    { name: 'time', type: 'text', required: true, admin: { description: 'e.g., "6:00 PM"' } },
    { name: 'location', type: 'text', required: true },
    {
      name: 'agendaLink',
      type: 'text',
      label: 'Agenda Link',
      admin: { description: 'Optional URL to meeting agenda document' },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: { description: 'Optional notes (e.g., "Public comment period at 6:30 PM")' },
    },
  ],
}
```

### Print CSS Pattern
```css
/* Add to src/app/(frontend)/styles.css */
@media print {
  /* Hide all site chrome */
  header, footer, nav,
  [data-print-hide] {
    display: none !important;
  }

  /* Clean print layout */
  body {
    color: #000 !important;
    background: #fff !important;
    font-size: 12pt;
  }

  /* Show URLs next to links */
  .prose a[href]::after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
    color: #666;
  }

  /* Remove decorative borders/shadows */
  * {
    box-shadow: none !important;
  }
}
```

### Homepage Global for Callouts
```typescript
// src/globals/Homepage.ts
import type { GlobalConfig } from 'payload'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage Settings',
  access: { read: () => true },
  fields: [
    {
      name: 'heroSpotlight',
      type: 'array',
      label: 'Hero Spotlight Stories',
      maxRows: 5,
      minRows: 1,
      fields: [
        {
          name: 'story',
          type: 'relationship',
          relationTo: 'news-posts',
          required: true,
        },
      ],
      admin: {
        description: 'Select up to 5 featured stories for the rotating hero spotlight',
      },
    },
    {
      name: 'topicCallouts',
      type: 'array',
      label: 'Topic Callout Cards',
      maxRows: 4,
      minRows: 1,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'blurb', type: 'text', required: true },
        { name: 'icon', type: 'text', admin: { description: 'Lucide icon name (e.g., "calendar", "users", "dollar-sign")' } },
        {
          name: 'link',
          type: 'relationship',
          relationTo: 'pages',
          required: true,
        },
      ],
      admin: {
        description: 'Featured topic cards below the news section (e.g., Budget, Meetings, Contact Officials)',
      },
    },
  ],
}
```

### Layout Integration
```typescript
// src/app/(frontend)/layout.tsx - updated
import React from 'react'
import { Barlow_Condensed, Inter } from 'next/font/google'
import { getThemeMode } from '@/lib/getTheme'
import { getNavigation } from '@/lib/getNavigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { UrgentBannerBar } from '@/components/layout/UrgentBannerBar'
import './styles.css'

// ... font setup unchanged ...

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const mode = await getThemeMode()
  const navigation = await getNavigation()
  // Also fetch urgent banner data here

  return (
    <html lang="en" className={`${barlowCondensed.variable} ${inter.variable}`}>
      <body data-mode={mode}>
        <UrgentBannerBar />
        <Header navItems={navigation.items} />
        <main className="pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Payload 2.x separate Express server | Payload 3.x runs inside Next.js process | Late 2024 | Local API has zero network overhead. Single deployment artifact. |
| Slate rich text | Lexical rich text | Payload 3.x | `@payloadcms/richtext-lexical/react` RichText component for frontend rendering |
| tailwind.config.js | CSS-first `@theme` block (Tailwind v4) | Early 2025 | Config in styles.css, no JS config file |
| `next/router` (Pages Router) | App Router with Server Components | Next.js 13+ | Server Components for data fetching, Client Components only for interactivity |

## Open Questions

1. **Carousel accessibility on touch devices**
   - What we know: CSS transitions + swipe gestures work, but touch event handling adds complexity.
   - What's unclear: Whether `touch-action: pan-y` is sufficient or if explicit touch handlers are needed.
   - Recommendation: Start with CSS-only transitions and keyboard/click controls. Add touch swipe support as a polish step if time permits. The carousel has arrow buttons as a fallback.

2. **Topic callout icon rendering**
   - What we know: lucide-react icons are imported by name. Storing icon names as strings in the CMS requires dynamic import or a mapping object.
   - What's unclear: Whether dynamic import of lucide icons causes bundle issues.
   - Recommendation: Use a static map of allowed icon names to components (e.g., `{ calendar: Calendar, users: Users, 'dollar-sign': DollarSign }`). Limit to 10-15 relevant icons. This avoids dynamic imports and keeps the bundle small.

3. **News post `updatedAt` vs explicit `lastEditedDate`**
   - What we know: Payload auto-sets `updatedAt` on every save, including non-content admin changes. This could show misleading "Updated" dates.
   - What's unclear: Whether editors would be confused by auto-updating timestamps.
   - Recommendation: Use Payload's `updatedAt` field for now. If editors report false freshness signals, add an explicit `lastEditedDate` field later. The auto-update behavior matches most CMS systems.

## Project Constraints (from CLAUDE.md)

- **Tech stack locked:** Next.js + React + Tailwind CSS + Payload CMS 3.x -- non-negotiable
- **Database:** PostgreSQL via `@payloadcms/db-postgres`
- **Package manager:** pnpm (established in Phase 1)
- **Node.js:** 22 LTS (established in Phase 1)
- **Fonts:** Barlow Condensed (weight 700) + Inter (variable) -- loaded via `next/font/google`
- **Heading convention:** h1/h2 uppercase Barlow Condensed, h3/h4 mixed-case Barlow Condensed
- **Color tokens:** Dual-mode via CSS variables and `data-mode` attribute
- **Testing:** All UI verification automated via Playwright MCP or Chrome DevTools MCP -- never manual
- **Commit messages:** Conventional Commits format
- **Rich text editor:** Lexical (not Slate), restricted to h2/h3/h4
- **No Prisma, no Redux, no CSS-in-JS, no Pages Router**

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/payload.config.ts`, `src/collections/*.ts`, `src/globals/*.ts`, `src/components/ui/*.tsx`, `src/app/(frontend)/styles.css` -- current project patterns
- Payload CMS 3.x official docs -- Globals, Collections, Fields, Local API patterns
- Payload website template (GitHub `payloadcms/payload/templates/website`) -- Header/Footer Global patterns with reusable link fields

### Secondary (MEDIUM confidence)
- [Payload CMS Globals documentation](https://payloadcms.com/docs/configuration/globals)
- [Payload CMS Array Field documentation](https://payloadcms.com/docs/fields/array)
- [Payload rich text rendering guide](https://payloadcms.com/posts/guides/how-to-render-rich-text-from-payload-in-a-nextjs-frontend)
- [Payload Lexical Converters documentation](https://payloadcms.com/docs/rich-text/converters)
- [Next.js generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [date-fns formatDistanceToNow](https://date-fns.org/)

### Tertiary (LOW confidence)
- GitHub issue #14593 re: nested array RSC errors in admin UI -- may affect Navigation Global editing in latest versions. Monitor but unlikely to block since the project uses `@payloadcms/richtext-lexical ^3.80.0` which is a recent release.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed except date-fns, versions confirmed from package.json
- Architecture: HIGH - patterns derived from existing codebase and official Payload website template
- Pitfalls: HIGH - based on known React SSR patterns and Payload-specific documentation

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable stack, well-documented patterns)
