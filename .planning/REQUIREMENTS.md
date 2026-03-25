# Requirements: BIBB United

**Defined:** 2026-03-24
**Core Value:** Community members can find clear, actionable information about their local school system and know exactly what to do about it.

## v1.1 Requirements

Requirements for production polish release. Addresses all 25 issues from UI-UX-REVIEW-2026-03-24.md plus final quality audit.

### Visual Appearance

- [x] **VIS-01**: Footer text is readable with proper contrast on dark background (WCAG 4.5:1 minimum)
- [x] **VIS-02**: Navigation menu is populated with all site sections in both desktop and mobile views
- [x] **VIS-03**: Hero spotlight displays featured news content on homepage instead of empty dark rectangle
- [x] **VIS-04**: Seed images are visually distinct and high-contrast against card backgrounds

### Accessibility

- [x] **A11Y-01**: Homepage has a proper H1 heading for screen readers and SEO
- [x] **A11Y-02**: User can skip to main content via visible skip-to-content link on keyboard focus
- [x] **A11Y-03**: Mobile menu close button is not focusable when slide-out panel is hidden
- [x] **A11Y-04**: Footer links have visible high-contrast focus indicators on dark background
- [x] **A11Y-05**: All seed images have descriptive, context-specific alt text

### Component Migration

- [x] **COMP-01**: All internal links use next/link for client-side SPA navigation without full page reloads
- [x] **COMP-02**: All images use next/image with proper sizes, lazy loading, and format optimization

### SEO & Metadata

- [x] **SEO-05**: Page titles follow consistent template without duplicate site name suffix
- [x] **SEO-06**: All pages have canonical URLs via Next.js metadata API
- [x] **SEO-07**: All pages have complete Open Graph tags (url, type, site_name, image, description)
- [x] **SEO-08**: News articles and all CMS pages appear in sitemap.xml
- [x] **SEO-09**: Default branded 1200x630 OG image exists for pages without custom images

### UX Polish

- [x] **UX-01**: Article bylines show display name instead of admin email address
- [x] **UX-02**: Current page is visually indicated in navigation with active styling and aria-current
- [x] **UX-03**: News cards show excerpt or summary text to help readers assess relevance
- [x] **UX-04**: Empty states on civic pages use actionable messaging with fallback links
- [x] **UX-05**: Footer CTA button does not link to the current page
- [x] **UX-06**: Main content spacing is correct relative to sticky header on all page types

### Infrastructure

- [x] **INFRA-01**: Media files served with long-lived cache headers (Cache-Control: public, max-age=31536000)
- [x] **INFRA-02**: X-Powered-By response header is not exposed in production
- [x] **INFRA-03**: Homepage has priority 1.0 in sitemap.xml

### Quality Assurance

- [x] **QA-01**: Full automated re-review (Lighthouse, visual, accessibility, responsive, SEO) verifies all fixes and identifies remaining polish opportunities

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Content Taxonomy

- **TAXO-01**: News posts can be tagged with topics
- **TAXO-02**: User can filter news by topic

### Community Engagement

- **ENGMT-01**: User can subscribe to email newsletter
- **ENGMT-02**: Editors can send newsletter to subscribers

### Resources

- **RSRC-01**: Resource links page with categorized external links

### Analytics

- **ANLYT-01**: Privacy-friendly analytics (Plausible/Umami) tracking page views

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / visitor login | Broadcast site, not a community platform |
| Comments or discussion forums | Moderation complexity with no clear value |
| Donation / payment processing | PCI compliance concerns; link to hosted solution |
| Full-text search | Site small enough (<50 pages) to navigate via menu |
| Event RSVP / ticketing | Over-engineering for public meetings |
| Multi-language support (i18n) | Significant complexity, defer if needed |
| Real-time notifications / push | Social media serves this function |
| AI-generated content | Undermines credibility for civic trust content |
| Blur-up image placeholders | Requires Payload upload hook; nice-to-have post-v1.1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| VIS-01 | Phase 10 | Complete |
| VIS-02 | Phase 14 | Complete |
| VIS-03 | Phase 9 | Complete |
| VIS-04 | Phase 9 | Complete |
| A11Y-01 | Phase 11 | Complete |
| A11Y-02 | Phase 11 | Complete |
| A11Y-03 | Phase 10 | Complete |
| A11Y-04 | Phase 11 | Complete |
| A11Y-05 | Phase 9 | Complete |
| COMP-01 | Phase 10 | Complete |
| COMP-02 | Phase 10 | Complete |
| SEO-05 | Phase 12 | Complete |
| SEO-06 | Phase 12 | Complete |
| SEO-07 | Phase 12 | Complete |
| SEO-08 | Phase 12 | Complete |
| SEO-09 | Phase 9 | Complete |
| UX-01 | Phase 11 | Complete |
| UX-02 | Phase 14 | Complete |
| UX-03 | Phase 11 | Complete |
| UX-04 | Phase 11 | Complete |
| UX-05 | Phase 11 | Complete |
| UX-06 | Phase 11 | Complete |
| INFRA-01 | Phase 9 | Complete |
| INFRA-02 | Phase 9 | Complete |
| INFRA-03 | Phase 12 | Complete |
| QA-01 | Phase 13 | Complete |

**Coverage:**
- v1.1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0

---
*Requirements defined: 2026-03-24*
*Last updated: 2026-03-25 after Phase 14 gap closure*
