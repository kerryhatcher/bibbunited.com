# Quick Task 260325-sg9: Deploy bibbunited.com to production on k8s cluster - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Task Boundary

Deploy bibbunited.com to production on the user's k8s cluster (thor.tailb56d83.ts.net). The app uses existing ArgoCD GitOps pipeline. Database is external PostgreSQL accessible via k8s service proxy at postgresql.civpulse-infra.svc.cluster.local:5432.

</domain>

<decisions>
## Implementation Decisions

### Namespace
- Use existing `civpulse-prod` and `civpulse-dev` namespaces (already exist on cluster, match deployment guide)
- Do NOT create a new "civicpulse" namespace — user confirmed keeping existing convention

### Database + Secrets
- Walk user through all secret values needed
- Prod k8s secret `bibbunited-secrets` needs: DATABASE_URI, PAYLOAD_SECRET, NEXT_PUBLIC_SERVER_URL
- GitHub Actions needs: BUILD_DATABASE_URI, BUILD_PAYLOAD_SECRET (for Docker build — Payload requires DB connection at build time)
- Database on shared PostgreSQL at thor — user needs to create a `bibbunited_prod` database
- Generate kubectl commands with clear instructions for each value

### Deploy Sequence
- Deploy dev first, validate pod health and connectivity
- Then deploy prod after dev is confirmed working
- This catches pipeline/manifest issues before they hit www.bibbunited.com

### Claude's Discretion
- None — all areas discussed

</decisions>

<specifics>
## Specific Ideas

- Existing manifests are already well-structured: Dockerfile, ArgoCD apps, CI/CD workflow, k8s resources all present
- Health endpoint at `/api/health` already exists
- `output: 'standalone'` already configured in next.config.ts
- Ingress already configured for `www.bibbunited.com` with cache middleware
- The main work is cluster-side: create DB, create secrets, apply ArgoCD apps, configure Cloudflare DNS

</specifics>

<canonical_refs>
## Canonical References

- K8s deployment guide: https://gist.githubusercontent.com/kerryhatcher/92d43656ace78d29366365c2a06557c4/raw/k8s-deployment-guide.md
- DB proxy: postgresql.civpulse-infra.svc.cluster.local:5432 (backed by Tailscale IP 100.67.17.69)
- GHCR registry: ghcr.io/kerryhatcher/bibbunited.com

</canonical_refs>
