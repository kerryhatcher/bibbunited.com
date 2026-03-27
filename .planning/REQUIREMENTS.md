# Requirements: BIBB United

**Defined:** 2026-03-27
**Core Value:** Community members can find clear, actionable information about their local school system and know exactly what to do about it.

## v2.0 Requirements

Requirements for CMS Data Model & Content milestone. Each maps to roadmap phases.

### Organizations

- [x] **ORG-01**: Editor can create an organization with name, website, phone, address, and email in the CMS admin
- [x] **ORG-02**: Editor can view all officials linked to an organization from the organization admin page (Join field)
- [x] **ORG-03**: Organization has a slug field for URL-ready identifier
- [x] **ORG-04**: Official is linked to an organization via relationship field (replaces hardcoded body select)
- [ ] **ORG-05**: Contact Officials page groups officials by organization and displays org contact info
- [ ] **ORG-06**: Seed script creates organizations and links existing officials to them
- [x] **ORG-07**: Data migration maps existing body select values to organization relationships without data loss

### Homepage Content

- [ ] **HOME-01**: Editor can add/edit rich text content on the homepage between hero and latest news via CMS admin
- [ ] **HOME-02**: Homepage content block only renders when content exists (empty field = hidden, no blank space)
- [ ] **HOME-03**: Seed script includes sample homepage content block

### Cache Busting

- [ ] **CACHE-01**: Cloudflare edge cache is purged automatically when content is published (not on draft saves)
- [ ] **CACHE-02**: Editor can manually trigger a full Cloudflare cache purge from the Payload admin panel
- [ ] **CACHE-03**: Cache purge is fire-and-forget (does not block CMS save operations)
- [ ] **CACHE-04**: Cache purge gracefully skips when Cloudflare credentials are not configured (local dev)

## Future Requirements

Deferred to future milestones. Tracked but not in current roadmap.

### v2.1 API & Data Exchange

- **API-01**: Swagger/OpenAPI spec endpoint with Redoc/Swagger UI, dynamically generated
- **API-02**: Bulk import of org + officials from a single file (one org per file, defined schema)
- **API-03**: Full site export/backup as downloadable zip (JSON/YAML/JSONL + optional media)

### v2.2 Civic Automation & Subscriptions

- **SCRAPE-01**: K8s CronJob scrapes BCSD Simbli page every 12 hours, creates/updates meetings
- **CAL-01**: Downloadable/subscribable .ics calendar feed (webcal) for meetings
- **VCARD-01**: Downloadable .vcf vCards for officials
- **SYNC-01**: CalDAV/CardDAV/JMAP full sync server (layered on after download-first approach)

### Deferred Enhancements

- **ORG-08**: Organization detail pages with dedicated public URLs (/organizations/[slug])
- **ORG-09**: Meetings linked to organizations for grouped display
- **HOME-04**: Blocks-based homepage with multiple block types and drag-and-drop
- **HOME-05**: Content block visibility toggle (enabled/disabled without deleting content)
- **CACHE-05**: Surgical URL-based purge instead of purge-everything for layout globals

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Organization hierarchy (parent/child) | Flat collection per user decision; revisit only if needed |
| Organization types/categories taxonomy | Over-engineering for current data set |
| Cloudflare Workers edge logic | Unnecessary complexity; standard purge API sufficient |
| Webhook-based purge retry queue | Fire-and-forget with logging is sufficient for site scale |
| Draft preview for homepage content | CMS preview not in v1.x; defer to future |
| Traefik cache invalidation | Traefik OSS does not cache; only sets headers |
| `cloudflare` npm SDK | 26 MB for one REST endpoint; native fetch() is sufficient |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ORG-01 | Phase 15 | Complete |
| ORG-02 | Phase 15 | Complete |
| ORG-03 | Phase 15 | Complete |
| ORG-04 | Phase 15 | Complete |
| ORG-05 | Phase 15 | Pending |
| ORG-06 | Phase 15 | Pending |
| ORG-07 | Phase 15 | Complete |
| HOME-01 | Phase 16 | Pending |
| HOME-02 | Phase 16 | Pending |
| HOME-03 | Phase 16 | Pending |
| CACHE-01 | Phase 17 | Pending |
| CACHE-02 | Phase 17 | Pending |
| CACHE-03 | Phase 17 | Pending |
| CACHE-04 | Phase 17 | Pending |

**Coverage:**

- v2.0 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0

---
*Requirements defined: 2026-03-27*
*Last updated: 2026-03-27 after roadmap creation*
