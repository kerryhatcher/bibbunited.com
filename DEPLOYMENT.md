# BIBB United Deployment Guide

Operational procedures for deploying and maintaining the BIBB United site on self-hosted Kubernetes with ArgoCD, Cloudflare tunnels, and GHCR-hosted Docker images.

## Cloudflare DNS Configuration

The site uses Cloudflare Tunnels for public access with SSL termination.

1. **Create a Cloudflare Tunnel** in the Cloudflare Zero Trust dashboard. Note the tunnel ID.

2. **Configure DNS records:**
   - Create a `CNAME` record for `www.bibbunited.com` pointing to `<tunnel-id>.cfargotunnel.com`
   - Create a `CNAME` record for `bibbunited.com` (root domain) pointing to `www.bibbunited.com`. Cloudflare automatically applies CNAME flattening at the zone apex, so this works even though CNAME at root is technically non-standard.

3. **Configure cache bypass for admin panel:**
   - In Cloudflare Dashboard > Caching > Cache Rules, create a rule:
     - **When:** URI Path starts with `/admin`
     - **Then:** Bypass cache
   - This prevents the Payload CMS admin panel from being served from Cloudflare's cache, which would break session state and form submissions.

4. **SSL/TLS settings:**
   - Set SSL/TLS encryption mode to **Full (strict)**
   - The Cloudflare Tunnel provides end-to-end encryption between Cloudflare's edge and the origin server

## Docker Build Requirements

The Docker image is built using a multi-stage `Dockerfile` (Node 22 Alpine). The build stage requires a live PostgreSQL connection.

1. **Why PostgreSQL is needed at build time:**
   `next build` triggers Payload CMS initialization, which connects to PostgreSQL to validate and migrate the database schema. Without a valid `DATABASE_URI`, the build fails.

2. **Build arguments:**
   The `Dockerfile` accepts two build args:
   ```
   ARG DATABASE_URI
   ARG PAYLOAD_SECRET
   ```
   Both must be provided via `--build-arg` or in CI secrets.

3. **CI/CD setup (GitHub Actions):**
   The project uses `.github/workflows/build-deploy.yml` which builds and pushes to GHCR. It passes build secrets from GitHub repository secrets:
   ```yaml
   build-args: |
     DATABASE_URI=${{ secrets.BUILD_DATABASE_URI }}
     PAYLOAD_SECRET=${{ secrets.BUILD_PAYLOAD_SECRET }}
   ```

   The `BUILD_DATABASE_URI` should point to a build-only PostgreSQL instance. For self-hosted runners, use a dedicated build database. For GitHub-hosted runners, add a PostgreSQL service container:
   ```yaml
   services:
     postgres:
       image: postgres:16-alpine
       env:
         POSTGRES_USER: payload
         POSTGRES_PASSWORD: payload
         POSTGRES_DB: payload_build
       ports:
         - 5432:5432
       options: >-
         --health-cmd pg_isready
         --health-interval 10s
         --health-timeout 5s
         --health-retries 5
   ```
   Then set `BUILD_DATABASE_URI=postgresql://payload:payload@localhost:5432/payload_build`.

4. **Build-only database:**
   This database does not need to persist data. Payload creates/validates tables during build but the built artifact connects to the production `DATABASE_URI` at runtime. The build database can be ephemeral.

## JSON-LD Structured Data Validation

The site renders JSON-LD structured data on pages via `src/lib/jsonLd.ts`. The following schema types are implemented:

- **Organization** -- site-wide metadata
- **WebSite** -- site-wide search/discovery metadata
- **NewsArticle** -- individual news post pages
- **BreadcrumbList** -- navigation breadcrumbs
- **GovernmentOrganization** -- civic body contact pages

### Validation process

JSON-LD validation requires a publicly accessible URL. It cannot be tested against localhost.

1. After deploying to a public environment, validate using **Google's Rich Results Test**:
   https://search.google.com/test/rich-results

2. Enter the live site URL. Test multiple page types:
   - Homepage: `https://www.bibbunited.com/`
   - A news article: `https://www.bibbunited.com/news/<article-slug>`

3. Verify that Organization and Article schemas are detected without errors.

4. Also validate against the **Schema.org validator** for broader schema compliance:
   https://validator.schema.org/

5. Common issues to check:
   - Missing required fields (Google will flag these)
   - Invalid date formats in `datePublished` / `dateModified`
   - Missing `image` property on NewsArticle (recommended but not required)

## Media Upload Persistence

Media files uploaded through the Payload CMS admin panel are stored at `/app/media/` inside the container. This directory must survive pod restarts.

1. **PersistentVolumeClaim:**
   Both dev and prod namespaces define a PVC named `bibbunited-media`:
   ```yaml
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: bibbunited-media
   spec:
     accessModes:
       - ReadWriteOnce
     storageClassName: local-path
     resources:
       requests:
         storage: 10Gi
   ```

2. **Volume mount in deployment:**
   The deployment mounts the PVC at `/app/media`:
   ```yaml
   volumeMounts:
     - name: media
       mountPath: /app/media
   volumes:
     - name: media
       persistentVolumeClaim:
         claimName: bibbunited-media
   ```

3. **Access mode:**
   The PVC uses `ReadWriteOnce`, which allows a single node to mount it read-write. This is sufficient for single-replica deployments. If scaling to multiple replicas, switch to `ReadWriteMany` and use a storage class that supports it (e.g., NFS-based).

4. **Verification:**
   - Upload an image through the admin panel at `/admin`
   - Restart the pod: `kubectl rollout restart deployment/bibbunited -n <namespace>`
   - Confirm the uploaded image is still accessible on the site

5. **Backup:**
   The PVC uses `local-path` storage class. Back up the underlying host directory or use Velero for PVC snapshots.

## Environment Variables

All environment variables are injected via a Kubernetes Secret named `bibbunited-secrets` (referenced by `envFrom.secretRef` in the deployment manifests).

| Variable | Required | Build Time | Runtime | Description |
|----------|----------|------------|---------|-------------|
| `DATABASE_URI` | Yes | Yes | Yes | PostgreSQL connection string. Format: `postgresql://user:password@host:5432/dbname` |
| `PAYLOAD_SECRET` | Yes | Yes | Yes | Random string for Payload session encryption and CSRF tokens. Minimum 32 characters. Generate with: `openssl rand -base64 48` |
| `NEXT_PUBLIC_SERVER_URL` | Yes | No | Yes | Public URL of the site (e.g., `https://www.bibbunited.com`). Used for generating canonical URLs, sitemaps, and JSON-LD data. |

Additional environment variables set in the deployment manifests (not in the secret):

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Enables production optimizations in Next.js and Payload |
| `NEXT_TELEMETRY_DISABLED` | `1` | Disables Next.js telemetry |

### Creating the Kubernetes Secret

```bash
kubectl create secret generic bibbunited-secrets \
  --namespace=<namespace> \
  --from-literal=DATABASE_URI='postgresql://user:password@postgres-host:5432/bibbunited' \
  --from-literal=PAYLOAD_SECRET='$(openssl rand -base64 48)' \
  --from-literal=NEXT_PUBLIC_SERVER_URL='https://www.bibbunited.com'
```

Replace `<namespace>` with `civpulse-dev` or `civpulse-prod`.
