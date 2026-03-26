# Quick Task 260325-sg9: Deploy bibbunited.com to production — Summary

**Date:** 2026-03-26
**Status:** Complete (with known issues)

## What was done

1. **Created PostgreSQL databases** — `bibbunited_dev` and `bibbunited_prod` on thor with dedicated users
2. **Created k8s secrets** — `bibbunited-secrets` in both `civpulse-dev` and `civpulse-prod` namespaces
3. **Set GitHub Actions secrets** — `BUILD_DATABASE_URI` and `BUILD_PAYLOAD_SECRET` (may be removable now)
4. **Restructured build pipeline** — Dockerfile is now runtime-only; CI builds the app with pnpm then packages into a slim image
5. **Fixed Dockerfile issues** — Alpine user creation conflict (UID 65534), sharp native binaries for musl
6. **Fixed broken migration** — Replaced full-schema-dump migration with proper incremental ALTER
7. **Fixed lockfile desync** — pnpm-lock.yaml had stale next-sitemap reference
8. **Fixed uncommitted generated files** — payload-types.ts and importMap.js
9. **Built and pushed Docker image** locally to `ghcr.io/kerryhatcher/bibbunited.com`
10. **Made GHCR package public** for cluster pull access
11. **Applied ArgoCD Applications** — both dev and prod, both Synced/Healthy
12. **Cloudflare DNS** — www.bibbunited.com and dev.bibbunited.com tunnel routes configured

## Verification

| Check | Result |
|-------|--------|
| Dev pod 1/1 Running | PASS |
| Dev health via port-forward | PASS |
| Dev health via dev.bibbunited.com | FAIL — cloudflared routing 404 |
| Prod pod 1/1 Running | PASS |
| Prod health via www.bibbunited.com/api/health | PASS |
| Prod homepage (200, 21KB) | PASS |
| Prod /news, /meetings | PASS |
| Prod /admin | FAIL — sharp module load error (500) |
| ArgoCD both apps Synced/Healthy | PASS |

## Known issues

1. **dev.bibbunited.com returns 404** — Cloudflare tunnel route exists but cloudflared isn't routing to Traefik correctly. The dev pod works inside the cluster. Low priority.
2. **sharp module error in prod** — `Cannot find module 'sharp-03c9e6d01f648d5d'`. The admin panel SSR fails. Needs investigation — likely the sharp install in Dockerfile doesn't match Next.js's expected module ID.
3. **CI pipeline untested end-to-end** — The new CI workflow (build in runner, package in Docker) hasn't been triggered yet. Needs a test push.

## Files changed

- `Dockerfile` — Runtime-only image (no build tools)
- `.dockerignore` — Allow .next and node_modules
- `.github/workflows/build-deploy.yml` — pnpm build + Docker package
- `argocd/dev/deployment.yaml` — Updated image tag
- `argocd/prod/deployment.yaml` — Updated image tag
- `src/migrations/20260326_032803.ts` — Proper incremental migration (excerpt + ogDefaultImage)
- `src/migrations/index.ts` — Updated migration index
- `pnpm-lock.yaml` — Synced after next-sitemap removal
- `src/payload-types.ts` — Committed generated types
