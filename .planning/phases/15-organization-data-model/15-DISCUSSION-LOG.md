# Phase 15: Organization Data Model - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-03-27
**Phase:** 15-organization-data-model
**Areas discussed:** Address field format, Contact page org info, Seed data scope, Delete protection

---

## Address Field Format

| Option | Description | Selected |
|--------|-------------|----------|
| Single text field (Recommended) | One textarea for the full address. Simple for editors, sufficient for display. | |
| Structured fields | Separate fields for street, city, state, zip. Better for future geocoding. | ✓ |

**User's choice:** Structured fields
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| All optional (Recommended) | Editors can fill in what they have. | ✓ |
| City + State required | Minimum location context required. | |
| All required | Full address mandatory. | |

**User's choice:** All optional
**Notes:** None

---

## Contact Page Org Info

| Option | Description | Selected |
|--------|-------------|----------|
| Name + contact row (Recommended) | Org name as heading, compact row with website/phone/email below. | |
| Name + full contact block | Org name with full address and all contact info. | |
| Name only | Just the org name as heading, like today. | |

**User's choice:** Org name only, but with a link/button to an org detail page (ORG-08).
**Notes:** ORG-08 is in Deferred Enhancements. User agreed to defer org detail pages to a future phase. Contact page shows org name only for now.

| Option | Description | Selected |
|--------|-------------|----------|
| sortOrder field on org (Recommended) | Editors control which org appears first. | ✓ |
| Alphabetical by name | No extra field needed. | |
| Hardcoded order | Fixed display order in code. | |

**User's choice:** sortOrder field on organizations
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Group by level (Recommended) | Two-tier: level headings with orgs nested under each. | ✓ |
| Flat list by sortOrder | All orgs in sequence, no level grouping. | |

**User's choice:** Group by level
**Notes:** User specified the level field with options: County, State, National (required select). Display order explicitly: County, State, National.

---

## Seed Data Scope

| Option | Description | Selected |
|--------|-------------|----------|
| All three current bodies (Recommended) | BOE, County Commission, Water Board as orgs. | |
| BOE only | Only Board of Education. | |
| All three + state/national examples | County orgs plus state/national example orgs. | ✓ |

**User's choice:** All three + state/national examples
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| With placeholder officials (Recommended) | 1-2 generic officials per example org. | ✓ |
| Empty orgs only | Orgs with no officials. | |

**User's choice:** With placeholder officials
**Notes:** None

---

## Delete Protection

| Option | Description | Selected |
|--------|-------------|----------|
| Block delete (Recommended) | Prevent deleting org with linked officials. Clear error message. | ✓ |
| Cascade nullify | Allow delete, officials lose org link. | |
| No protection | Default FK behavior. | |

**User's choice:** Block delete
**Notes:** Reuse existing preventReferencedDelete pattern.

---

## Claude's Discretion

- Organization admin panel layout (field positioning, default columns)
- JSON-LD structured data updates
- Revalidation hook path configuration

## Deferred Ideas

- **ORG-08:** Organization detail pages at `/organizations/[slug]` -- user explicitly requested but agreed to defer
- **ORG-09:** Meetings linked to organizations and displayed on org detail pages -- user wants this paired with ORG-08 in a future phase
