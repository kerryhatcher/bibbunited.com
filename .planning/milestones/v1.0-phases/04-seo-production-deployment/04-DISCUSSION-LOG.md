# Phase 4: SEO & Production Deployment - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 04-seo-production-deployment
**Areas discussed:** SEO metadata strategy, Structured data (JSON-LD), Docker & K8s deployment, Cloudflare & caching

---

## SEO Metadata Strategy

### Editor SEO Control

| Option | Description | Selected |
|--------|-------------|----------|
| Full override (Recommended) | Payload SEO plugin adds title, description, OG image fields. Auto-generates defaults, editors can override. | ✓ |
| Defaults only | Auto-generate all meta tags from existing fields. No SEO fields in admin. | |
| Minimal + description | Only add meta description field. Title and OG image auto-derived. | |

**User's choice:** Full override
**Notes:** None

### OG Fallback Image

| Option | Description | Selected |
|--------|-------------|----------|
| Branded fallback (Recommended) | Default BIBB United branded image when no featured/OG image set. | ✓ |
| No fallback | No OG image tag rendered if none set. | |
| You decide | Claude picks. | |

**User's choice:** Branded fallback
**Notes:** None

### Sitemap Generation

| Option | Description | Selected |
|--------|-------------|----------|
| next-sitemap (Recommended) | Auto-generate sitemap.xml at build time from Next.js routes. | ✓ |
| Custom API route | Dynamic /sitemap.xml querying Payload at request time. | |
| You decide | Claude picks. | |

**User's choice:** next-sitemap
**Notes:** None

### robots.txt

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, block /admin (Recommended) | Generate robots.txt disallowing /admin. | ✓ |
| Yes, allow all | No restrictions. | |
| You decide | Claude picks. | |

**User's choice:** Yes, block /admin
**Notes:** None

---

## Structured Data (JSON-LD)

### Schema Types

| Option | Description | Selected |
|--------|-------------|----------|
| Article + Organization (Recommended) | NewsArticle on posts, Organization site-wide. | |
| Full suite | All above plus BreadcrumbList, WebSite, GovernmentOrganization. | ✓ |
| Minimal — Organization only | Just Organization schema. | |
| You decide | Claude picks. | |

**User's choice:** Full suite
**Notes:** None

### Officials Schema Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Person + contactPoint (Recommended) | Each official gets Person schema with contact details nested under GovernmentOrganization. | ✓ |
| Organization only | Just mark governing bodies as GovernmentOrganization. Officials as plain text. | |
| You decide | Claude picks. | |

**User's choice:** Person + contactPoint
**Notes:** None

---

## Docker & K8s Deployment

### K8s Ingress Type

| Option | Description | Selected |
|--------|-------------|----------|
| Standard Ingress | Standard Kubernetes Ingress with Traefik annotations. | |
| Traefik IngressRoute CRD | Traefik's custom IngressRoute CRD. | |
| Not sure / You decide | Claude generates standard Ingress. | |

**User's choice:** Other — provided K8s deployment guide gist URL
**Notes:** User shared a detailed deployment guide: https://gist.githubusercontent.com/kerryhatcher/92d43656ace78d29366365c2a06557c4/raw/3995ed5b53b4f056ed9a286840c5f67e01696265/k8s-deployment-guide.md. Guide specifies Traefik IngressRoute CRD, civpulse-* namespaces, ArgoCD GitOps, local-path storage, security hardening conventions.

### Namespace

| Option | Description | Selected |
|--------|-------------|----------|
| civpulse-prod (Recommended) | Deploy to civpulse-prod only. | |
| civpulse-dev first | Start with dev, promote later. | |
| Both | Generate manifests for both civpulse-dev and civpulse-prod. | ✓ |

**User's choice:** Both
**Notes:** None

### Manifest Directory

| Option | Description | Selected |
|--------|-------------|----------|
| argocd/ at repo root (Recommended) | Follow existing ArgoCD convention with dev/prod subdirectories. | ✓ |
| k8s/ at repo root | Alternative path, needs ArgoCD config change. | |
| You decide | Claude follows guide convention. | |

**User's choice:** argocd/ at repo root
**Notes:** None

### Media PVC Size

| Option | Description | Selected |
|--------|-------------|----------|
| 5Gi PVC (Recommended) | Sufficient for article images and official photos. | |
| 10Gi PVC | Larger claim for documents, high-res images, meeting recordings. | ✓ |
| You decide | Claude picks reasonable size. | |

**User's choice:** 10Gi PVC
**Notes:** None

### CI/CD Pipeline

| Option | Description | Selected |
|--------|-------------|----------|
| Create workflow (Recommended) | GitHub Actions: build, tag with SHA, push to GHCR, update argocd/ manifests. | ✓ |
| Dockerfile only | Just Dockerfile and K8s manifests. CI/CD handled separately. | |
| You decide | Claude determines scope. | |

**User's choice:** Create workflow
**Notes:** None

---

## Cloudflare & Caching

### Admin Cache Bypass

| Option | Description | Selected |
|--------|-------------|----------|
| Traefik middleware (Recommended) | Cache-Control: no-store via Traefik for /admin/*. | |
| Cloudflare Page Rules | CDN-level bypass. Manual dashboard config. | |
| Both layers | Traefik middleware AND Cloudflare Page Rule. Defense in depth. | ✓ |
| You decide | Claude picks. | |

**User's choice:** Both layers
**Notes:** None

### Public Page Caching

| Option | Description | Selected |
|--------|-------------|----------|
| Short TTL (Recommended) | s-maxage=60, stale-while-revalidate=300. | ✓ |
| No page caching | Only cache static assets. | |
| Aggressive caching | s-maxage=3600 (1 hour). | |
| You decide | Claude picks. | |

**User's choice:** Short TTL
**Notes:** None

### Hostname

| Option | Description | Selected |
|--------|-------------|----------|
| bibbunited.com | Apex domain primary, www redirects to apex. | |
| www.bibbunited.com | www primary, apex redirects to www. | ✓ |
| Both equally | No redirect. | |

**User's choice:** www.bibbunited.com
**Notes:** None

---

## Claude's Discretion

- Exact Dockerfile layer ordering and optimization
- next-sitemap configuration details
- JSON-LD helper function architecture
- ArgoCD Application manifest structure
- Health check and readiness probe configuration
- Resource limits for dev vs prod
- www redirect implementation approach

## Deferred Ideas

None — discussion stayed within phase scope.
