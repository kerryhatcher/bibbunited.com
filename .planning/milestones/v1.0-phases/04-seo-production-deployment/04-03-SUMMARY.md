---
phase: 04-seo-production-deployment
plan: 03
subsystem: infra
tags: [docker, kubernetes, github-actions, ci-cd, traefik, argocd, ghcr]

# Dependency graph
requires:
  - phase: 01-cms-foundation
    provides: "Next.js + Payload CMS application to containerize"
  - phase: 03-site-pages-navigation
    provides: "Complete site pages and routes for production deployment"
provides:
  - "Multi-stage Dockerfile for Next.js + Payload standalone deployment"
  - "K8s manifests for dev and prod namespaces with security hardening"
  - "Traefik IngressRoute with admin cache bypass middleware"
  - "GitHub Actions CI/CD pipeline building to GHCR"
  - "Health check endpoint at /api/health"
  - "ArgoCD Application manifests for GitOps sync"
  - "10Gi PVC for media upload persistence"
affects: []

# Tech tracking
tech-stack:
  added: [docker, kubernetes, github-actions, argocd, traefik-ingressroute]
  patterns: [multi-stage-docker-build, gitops-deployment, non-root-container, read-only-rootfs]

key-files:
  created:
    - Dockerfile
    - .dockerignore
    - src/app/api/health/route.ts
    - argocd/dev/deployment.yaml
    - argocd/dev/service.yaml
    - argocd/dev/ingress.yaml
    - argocd/dev/pvc.yaml
    - argocd/prod/deployment.yaml
    - argocd/prod/service.yaml
    - argocd/prod/ingress.yaml
    - argocd/prod/pvc.yaml
    - argocd/bibbunited-dev-app.yaml
    - argocd/bibbunited-prod-app.yaml
    - .github/workflows/build-deploy.yml
  modified:
    - next.config.ts

key-decisions:
  - "Added output: 'standalone' to next.config.ts (was missing, required for Docker deployment)"
  - "Used env variables in GitHub Actions run steps instead of direct expression interpolation for security"
  - "Node.js 22 Alpine as base image per D-07"
  - "UID 65534 non-root user with read-only rootfs per D-08"

patterns-established:
  - "Docker multi-stage build: deps -> builder -> runner with standalone output"
  - "K8s security: non-root, readOnlyRootFilesystem, drop ALL capabilities, seccomp RuntimeDefault"
  - "Traefik IngressRoute with separate middleware for admin (no-cache) and public (cache) routes"
  - "GitOps: CI builds image, updates manifests with commit SHA, ArgoCD syncs to cluster"

requirements-completed: [DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-05]

# Metrics
duration: 3min
completed: 2026-03-24
---

# Phase 04 Plan 03: Docker + K8s + CI/CD Summary

**Multi-stage Dockerfile with Node.js 22 Alpine, K8s manifests for dev/prod with Traefik IngressRoute routing, and GitHub Actions CI/CD pipeline pushing to GHCR**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-24T13:50:06Z
- **Completed:** 2026-03-24T13:53:25Z
- **Tasks:** 3
- **Files modified:** 15

## Accomplishments
- Multi-stage Dockerfile with sharp native binaries in final stage, non-root user, and standalone output
- K8s manifests for both civpulse-dev and civpulse-prod with security hardening, Traefik IngressRoute, and 10Gi PVC
- GitHub Actions CI/CD that builds on push to main, pushes to GHCR with SHA tags, and updates manifests with [skip ci]
- Health check endpoint at /api/health for K8s liveness/readiness probes

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Dockerfile, .dockerignore, and health check endpoint** - `8c1b6b8` (feat)
2. **Task 2: Create K8s manifests for dev and prod namespaces** - `87d0501` (feat)
3. **Task 3: Create GitHub Actions CI/CD workflow** - `d53aca2` (feat)

## Files Created/Modified
- `Dockerfile` - Multi-stage build: deps (pnpm install), builder (next build), runner (standalone + sharp)
- `.dockerignore` - Excludes dev/planning files from Docker context
- `src/app/api/health/route.ts` - Health check endpoint returning JSON status for K8s probes
- `next.config.ts` - Added output: 'standalone' for Docker deployment
- `argocd/dev/deployment.yaml` - Dev deployment with 50m/250m CPU, 128Mi/256Mi memory limits
- `argocd/dev/service.yaml` - Dev service exposing port 3000
- `argocd/dev/ingress.yaml` - Dev Traefik IngressRoute with admin cache bypass at dev.bibbunited.com
- `argocd/dev/pvc.yaml` - Dev 10Gi PVC with local-path storage class
- `argocd/prod/deployment.yaml` - Prod deployment with 100m/500m CPU, 256Mi/512Mi memory limits
- `argocd/prod/service.yaml` - Prod service exposing port 3000
- `argocd/prod/ingress.yaml` - Prod Traefik IngressRoute with admin cache bypass at www.bibbunited.com
- `argocd/prod/pvc.yaml` - Prod 10Gi PVC with local-path storage class
- `argocd/bibbunited-dev-app.yaml` - ArgoCD Application for dev namespace (auto-sync)
- `argocd/bibbunited-prod-app.yaml` - ArgoCD Application for prod namespace (auto-sync)
- `.github/workflows/build-deploy.yml` - CI/CD pipeline: build, push GHCR, update manifests

## Decisions Made
- Added `output: 'standalone'` to next.config.ts -- was missing but required for Docker deployment (deviation Rule 3)
- Used environment variables in GitHub Actions run steps instead of direct expression interpolation for better security practices
- Node.js 22 Alpine as base image per D-07 decision
- UID 65534 non-root user with read-only rootfs per D-08 decision

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added output: 'standalone' to next.config.ts**
- **Found during:** Task 1 (Dockerfile creation)
- **Issue:** next.config.ts did not have `output: 'standalone'` which is required for the Dockerfile's standalone build to produce output
- **Fix:** Added `output: 'standalone'` to the nextConfig object
- **Files modified:** next.config.ts
- **Verification:** grep confirms 'standalone' present in next.config.ts
- **Committed in:** 8c1b6b8 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix for Docker build to function. No scope creep.

## Issues Encountered
None

## User Setup Required

External services require manual configuration before deployment will function. From plan frontmatter:

**GitHub:**
- Set repository secret `BUILD_DATABASE_URI` (PostgreSQL connection string for build-time)
- Set repository secret `BUILD_PAYLOAD_SECRET` (random string for build-time Payload config)
- Enable GHCR package publishing: Settings -> Actions -> General -> Workflow permissions -> Read and write

**Kubernetes:**
- Create namespaces: `kubectl create namespace civpulse-dev && kubectl create namespace civpulse-prod`
- Create secrets: `kubectl create secret generic bibbunited-secrets --from-env-file=.env -n civpulse-prod`

**Cloudflare:**
- Add CNAME record: www.bibbunited.com -> existing tunnel UUID
- Add Page Rule: www.bibbunited.com/admin/* -> Cache Level: Bypass

## Known Stubs
None -- all files are production-ready configurations.

## Next Phase Readiness
- Docker build configuration ready for CI/CD pipeline execution
- K8s manifests ready for ArgoCD deployment once namespaces and secrets are created
- CI/CD pipeline will trigger on first push to main after GitHub secrets are configured

## Self-Check: PASSED

All 14 created files verified present. All 3 task commits verified in git log.

---
*Phase: 04-seo-production-deployment*
*Completed: 2026-03-24*
