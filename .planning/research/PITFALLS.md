# Domain Pitfalls

**Domain:** Civic advocacy website (Payload CMS 3.x + Next.js + PostgreSQL, self-hosted K8s)
**Researched:** 2026-03-23
**Confidence:** MEDIUM (based on training data through May 2025; web verification tools unavailable)

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or major architecture issues.

### Pitfall 1: Treating Payload CMS 3.x Like a Standalone Backend

**What goes wrong:** Payload CMS 3.x is fundamentally different from Payload 2.x and most other headless CMSs. In 3.x, Payload runs *inside* your Next.js application -- it is a Next.js plugin, not a separate server. Developers who treat it as a decoupled backend (separate API server, separate deployment) will fight the architecture at every turn, create unnecessary complexity, and miss the entire point of the integration.

**Why it happens:** Developers familiar with headless CMS patterns (Strapi, Contentful, Sanity) assume Payload 3.x works the same way: API on one side, frontend on the other. Payload 2.x also ran as a separate Express server, so even Payload veterans carry the wrong mental model.

**Consequences:**
- Unnecessary API fetch layers when you could use Payload's Local API directly in Server Components
- Double deployment complexity (two containers instead of one)
- Missed performance wins from server-side data access without HTTP round-trips
- Confusing routing conflicts if you try to run Payload separately

**Prevention:**
- Start from `create-payload-app` with the Next.js template -- never try to bolt Payload onto an existing Next.js app initially
- Use Payload's Local API (`payload.find()`, `payload.findByID()`) directly in React Server Components and Route Handlers -- no REST/GraphQL needed for your own frontend
- Deploy as a single Next.js application, not separate frontend and CMS containers
- Reserve REST/GraphQL endpoints for external integrations only (if ever needed)

**Detection:** If you see `fetch('http://localhost:3000/api/...')` in your own Server Components, you are doing it wrong.

**Phase:** Must be understood in Phase 1 (project scaffolding). Getting this wrong poisons every subsequent phase.

---

### Pitfall 2: Payload + PostgreSQL Migration Chaos

**What goes wrong:** Payload 3.x with the `@payloadcms/db-postgres` adapter uses Drizzle ORM under the hood. Schema changes in your Payload collections generate database migrations. Developers who do not understand this migration pipeline will end up with broken databases, lost data in production, or migration conflicts between environments.

**Why it happens:** Payload abstracts the database layer so well that developers forget there *is* a database migration layer. They modify collection schemas, restart the dev server (which auto-pushes schema changes in development mode), and never learn to generate or manage proper migration files. Then they deploy to production and the database is out of sync.

**Consequences:**
- Production database out of sync with code
- Data loss from destructive schema changes applied without migration review
- Migration conflicts when multiple developers change collections simultaneously
- Inability to roll back bad schema changes

**Prevention:**
- Learn the Payload migration commands early: `payload migrate:create`, `payload migrate`, `payload migrate:status`
- Never rely on `push` mode (auto-sync) outside of local development
- Always generate explicit migration files for any collection schema change before merging to main
- Review generated SQL in migration files before applying -- Payload/Drizzle may generate destructive operations (DROP COLUMN) for what seems like a minor change
- Back up the production database before running migrations
- Store migration files in version control alongside code

**Detection:** If your `migrations/` directory is empty but you have been changing collections for weeks, you have a ticking time bomb.

**Phase:** Must be established in Phase 1 (database setup). Migration discipline is a habit, not a feature you bolt on later.

---

### Pitfall 3: Ignoring Content Modeling Up Front

**What goes wrong:** Teams rush to build pages and components without carefully designing their Payload collections, fields, and relationships first. They end up with collections that are too flat (everything in one giant "Page" collection), too granular (dozens of tiny collections with complex relationships), or structurally unable to support the content strategy.

**Why it happens:** Developers want to see UI fast. Content modeling feels like "planning" rather than "building." For a civic advocacy site specifically, the content is deceptively simple ("just articles and pages") so teams skip the modeling step.

**Consequences:**
- Editors fight the admin UI because the content structure does not match their mental model
- Rewriting collections means rewriting all frontend queries and components
- Loss of content when restructuring collections in production
- Feature requests like "I want to tag this article with the related board meeting" become impossible without a collection rewrite

**Prevention:**
- Map out all content types *before* writing any Payload collection config:
  - **Pages** (evergreen reference content): What fields? Flexible layout blocks or fixed structure?
  - **News Posts** (timely updates): Categories? Tags? Related pages? Author attribution?
  - **Navigation**: Payload Global or collection? How do dropdowns work?
  - **Shared elements**: CTAs, contact cards, meeting schedules -- are these blocks, globals, or standalone collections?
- Interview the editorial team (even informally): "Walk me through publishing a budget explainer. What information do you need to enter?"
- Use Payload's block-based fields for flexible page layouts rather than trying to predict every page structure
- Design for the *editorial workflow*, not just the data model

**Detection:** If an editor says "Where do I put this?" or "I had to copy-paste the same info into three places," your content model is wrong.

**Phase:** Phase 1 (content modeling) -- this must be done before building any frontend components or pages.

---

### Pitfall 4: Docker Image Bloat and Cold Start Catastrophe

**What goes wrong:** The combined Payload CMS + Next.js application produces a large Docker image (often 1GB+) with slow cold starts. On a self-hosted K8s cluster with limited resources, this means slow deployments, pod restart failures due to health check timeouts, and OOM kills.

**Why it happens:** Payload 3.x bundles a full Next.js app plus an admin panel (React app) plus database adapters plus rich text editors (Lexical/Slate) plus file upload handling. Without careful optimization, the node_modules directory and build output are massive. Next.js itself has known cold-start overhead in server mode.

**Consequences:**
- Pod restarts take 30-60 seconds (or more), causing visible downtime on a small cluster
- K8s health checks fail during slow starts, triggering restart loops (CrashLoopBackOff)
- Memory usage spikes during builds, potentially killing the build pod
- Large images slow down CI/CD pipelines and image pulls

**Prevention:**
- Use multi-stage Docker builds: build stage with all dev dependencies, production stage with only runtime dependencies
- Use `next build` with `output: 'standalone'` in `next.config.js` -- this produces a minimal self-contained output
- Set generous `initialDelaySeconds` on K8s liveness/readiness probes (60-90 seconds)
- Set appropriate memory limits (512MB minimum, 1GB recommended for Payload + Next.js)
- Use `.dockerignore` aggressively: exclude `.git`, `node_modules`, `.next/cache`, test files
- Consider enabling Next.js ISR (Incremental Static Regeneration) for public-facing pages to reduce runtime compute

**Detection:** If your Docker image exceeds 500MB or pod startup takes more than 45 seconds, optimize immediately.

**Phase:** Phase 3 or whenever Docker/deployment is set up. But the `output: 'standalone'` config should be set in Phase 1.

---

### Pitfall 5: Rich Text Editor Configuration Debt

**What goes wrong:** Payload 3.x defaults to the Lexical rich text editor. Teams accept the defaults, build out all their content, then realize the editor does not support what their editors need (or supports too much, producing inconsistent content). Changing the rich text configuration after content exists is painful because the stored data format changes.

**Why it happens:** Lexical is powerful but its configuration in Payload is different from typical WYSIWYG setups. The default features may include things you don't want (arbitrary HTML, deeply nested structures) or lack things you do want (callout blocks, embedded CTAs, specific heading levels). Teams discover this after editors have already created content.

**Consequences:**
- Editors produce inconsistent or broken-looking content because the editor allows too much formatting freedom
- Content migration required if switching editor configuration after content is written
- Frontend rendering becomes unpredictable when the rich text structure varies wildly
- Civic advocacy content (budget tables, action items, official quotes) needs specific formatting that generic rich text may not handle well

**Prevention:**
- Configure the Lexical editor *explicitly* in Phase 1 -- do not accept defaults
- Restrict features to only what editors need: headings (H2-H4 only), bold, italic, links, lists, block quotes, and a few custom blocks (callout, CTA, embedded contact card)
- Remove features editors should NOT use: arbitrary font sizes, colors, alignment, tables (unless specifically needed)
- Create custom Lexical blocks for recurring civic content patterns: "Action Item" block, "Official Contact" block, "Meeting Date" block
- Test the editor experience with a real editorial workflow before building frontend rendering
- Document the allowed formatting in an editorial style guide

**Detection:** If your rich text rendering component has more than 20 node-type cases, or if editors are asking "how do I make this look right?", your editor config needs tightening.

**Phase:** Must be configured in Phase 1 (collection setup) and validated with editors in Phase 2 (content entry testing).

---

## Moderate Pitfalls

### Pitfall 6: Server Component vs. Client Component Boundary Confusion

**What goes wrong:** Next.js App Router (which Payload 3.x uses) requires developers to understand the server/client component boundary. Interactive elements (dropdowns, mobile menus, forms) need `"use client"` directives, but data fetching should stay on the server. Teams either make everything a Client Component (losing SSR benefits and leaking Payload's Local API to the client bundle) or try to keep everything server-side and cannot add interactivity.

**Why it happens:** The App Router's mental model is genuinely confusing, especially for developers coming from Pages Router or Create React App backgrounds. Payload's Local API only works server-side, adding another constraint.

**Prevention:**
- Establish a clear pattern early: data-fetching wrapper (Server Component) passes data as props to interactive leaf (Client Component)
- Never import `payload` or call `getPayload()` in a `"use client"` file
- Create a `components/` directory split: `components/server/` and `components/client/` (or use a naming convention like `*.client.tsx`)
- For the navigation menu (dropdown + mobile hamburger), fetch nav data in a Server Component layout and pass it to a Client Component `<NavMenu items={items} />`

**Detection:** If you see `getPayload()` or `payload.find()` in a file with `"use client"`, you have a boundary violation. If your client bundle is unexpectedly large, check for server-only code leaking in.

**Phase:** Establish the pattern in Phase 1 (scaffolding). Enforce consistently through all phases.

---

### Pitfall 7: Neglecting Payload Admin Panel Customization for Non-Technical Editors

**What goes wrong:** Developers leave the Payload admin panel in its default state -- raw field names, no descriptions, no field-level help text, no custom labels. Non-technical editors open the admin panel and see "slug," "publishedAt," "meta.description" and have no idea what to do.

**Why it happens:** Developers understand the data model intuitively. They test CMS entry themselves and it "works fine." They forget that the 2-3 editors who will actually use this daily have no context about field names or content architecture.

**Prevention:**
- Add `label` and `admin.description` to every field in every collection
- Use `admin.placeholder` to show example content ("e.g., Budget Analysis: Where Your Tax Dollars Go")
- Group related fields with `admin.group` or use tabs for complex collections
- Set sensible `defaultValue` for fields where appropriate (e.g., `publishedAt` defaults to now)
- Use `admin.condition` to hide fields that are not relevant based on other field values
- Create a "Dashboard" or custom admin view with a quick-start guide for editors
- Add field validation with helpful error messages ("Title must be under 80 characters for social sharing")

**Detection:** Watch a non-technical person try to create a news post. If they hesitate on any field for more than 5 seconds, that field needs better labeling.

**Phase:** Phase 2 (content type buildout). Should be part of the definition of done for every collection.

---

### Pitfall 8: SEO and Social Sharing as an Afterthought

**What goes wrong:** Civic advocacy sites live and die by shareability. When someone shares a budget breakdown or meeting recap on Facebook, Twitter/X, or a community group, the link preview (Open Graph image, title, description) determines whether anyone clicks. Teams build the whole site, then bolt on meta tags at the end, resulting in broken previews, missing images, or generic descriptions.

**Why it happens:** SEO/OG feels like a polish task, not a core feature. Developers focus on the page content rendering and forget that most people will encounter the content as a link preview in a social media feed or messaging app.

**Consequences:**
- Shared links show generic "BIBB United" title with no preview image -- low click-through
- Google indexes pages with missing or duplicate meta descriptions
- Pages lack canonical URLs, causing duplicate content issues
- No structured data for local organization/civic content

**Prevention:**
- Add SEO fields (meta title, meta description, OG image) to every content collection from day one -- use a reusable Payload field group
- Generate `<head>` metadata in Next.js `generateMetadata()` functions for every route
- Create a default OG image template (branded BIBB United card) used when no specific image is set
- Test social sharing with Facebook's Sharing Debugger and Twitter Card Validator before launch
- Add `robots.txt` and `sitemap.xml` generation (Next.js has built-in support via `app/sitemap.ts`)

**Detection:** Paste any page URL into the Facebook Sharing Debugger. If the preview looks wrong or generic, SEO metadata is broken.

**Phase:** SEO field structure in Phase 1 (content modeling). Metadata rendering in Phase 2 (frontend). Testing in Phase 3 (pre-launch).

---

### Pitfall 9: Traefik + Cloudflare Tunnel Routing Conflicts

**What goes wrong:** Running Next.js/Payload behind Traefik with Cloudflare tunnels introduces routing complexity. Payload's admin panel, API routes, and Next.js pages all share the same application but may need different caching, authentication, or routing rules. Misconfigured Traefik IngressRoutes can cause the admin panel to be cached by Cloudflare (serving stale or wrong content), API responses to be cached when they should not be, or WebSocket connections for Payload's live preview to fail.

**Why it happens:** Each layer (Cloudflare, Traefik, Next.js) has its own routing and caching logic. Developers test locally (no proxy layers) and everything works. In production, the proxy chain introduces behaviors not seen in development.

**Consequences:**
- Admin panel serves cached pages from Cloudflare -- editors see stale data or get logged out
- API POST/PATCH requests fail or return cached GET responses
- File uploads fail due to request body size limits in Traefik or Cloudflare
- HTTPS/WSS issues with Payload Live Preview
- CORS errors when the admin panel tries to reach API routes through the proxy chain

**Prevention:**
- Set Cloudflare cache rules to bypass cache for `/admin/*` and `/api/*` paths
- Configure Traefik to pass correct headers: `X-Forwarded-For`, `X-Forwarded-Proto`, `X-Forwarded-Host`
- Set `serverURL` in Payload config to the full public URL (e.g., `https://bibbunited.com`)
- Increase Traefik's request body size limit for file uploads (default is often too small): set `maxRequestBodyBytes` in middleware
- Set Cloudflare's upload limit appropriately (free tier is 100MB, which should be fine)
- Test the full proxy chain (Cloudflare -> Traefik -> Pod) for both admin and public paths before launch

**Detection:** If the admin panel works on `localhost:3000` but breaks behind the proxy, your routing/caching/header config is wrong.

**Phase:** Phase 3 (deployment). Must be tested end-to-end before any content is entered in production.

---

### Pitfall 10: No Media/Upload Strategy

**What goes wrong:** Payload CMS handles file uploads (images for articles, documents like PDFs of public records). Without a deliberate storage strategy, files end up stored on the local filesystem inside the Docker container. When the pod restarts, all uploaded files are gone.

**Why it happens:** Payload defaults to local filesystem storage. In development this works perfectly. Developers do not realize the problem until the first production pod restart wipes all uploaded images.

**Consequences:**
- All uploaded images and documents lost on pod restart
- Broken images across the entire site after any deployment
- Editors re-upload content repeatedly

**Prevention:**
- Use a persistent volume (PV) in K8s mounted to Payload's upload directory, OR
- Use an S3-compatible object storage adapter (`@payloadcms/storage-s3` or compatible) with MinIO or a similar self-hosted solution on the K8s cluster, OR
- Use Cloudflare R2 (S3-compatible, generous free tier) as the storage backend
- Decide this in Phase 1 and configure it before any content is entered
- Whichever option is chosen, ensure backups are configured

**Detection:** If your Dockerfile does not mount a volume for `/app/media` (or wherever uploads go), uploads will be lost on restart.

**Phase:** Must be decided in Phase 1 (architecture) and implemented in Phase 2 (before editors start uploading content).

---

## Minor Pitfalls

### Pitfall 11: Overengineering for Future Civic Topics

**What goes wrong:** The PROJECT.md notes the site should "support expanding to other civic topics later." Teams interpret this as a requirement to build a multi-topic taxonomy, topic-scoped navigation, and abstract content architecture now. This adds weeks of complexity to v1 for a feature that may never ship.

**Prevention:**
- Build v1 exclusively for the school system topic. No topic taxonomy, no topic routing.
- Structure content so that *adding* a topic later is straightforward (e.g., adding a "category" field to collections) but do not build the abstraction until it is needed.
- Document the future expansion path in architecture docs so the team knows the plan without building it now.

**Phase:** Phase 1 decision. Resist scope creep in every subsequent phase.

---

### Pitfall 12: Skipping Accessible Design for Activist Aesthetic

**What goes wrong:** Bold, urgent, activist-style design (strong colors, large type, attention-grabbing elements) can easily violate WCAG accessibility guidelines. Low contrast text on colored backgrounds, missing alt text on advocacy graphics, non-focusable interactive elements -- all common in "bold design" implementations.

**Prevention:**
- Check all color combinations against WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Ensure the bold typography scale remains readable (minimum 16px body text)
- All interactive elements must be keyboard navigable
- All images need meaningful alt text (especially important for civic content -- screen reader users are also constituents)
- Use Lighthouse accessibility audit on every page before launch

**Phase:** Phase 2 (design implementation). Accessibility must be validated as part of every component's definition of done.

---

### Pitfall 13: Not Testing Payload's Draft/Publish Workflow

**What goes wrong:** Payload has built-in draft/publish functionality (`versions.drafts: true` on collections). Teams either do not enable it (editors accidentally publish unfinished content) or enable it without testing the editorial workflow (drafts do not show up correctly on the frontend, published content requires a page refresh, etc.).

**Prevention:**
- Enable drafts on News Posts from the start -- editors need to save work-in-progress
- Consider whether Pages need drafts (probably yes for longer explainers)
- Ensure frontend queries filter by `_status: 'published'` so draft content does not appear on the live site
- Test the full workflow: create draft -> preview -> edit -> publish -> verify on frontend

**Detection:** If an editor saves a half-written post and it appears on the live site, your draft filtering is broken.

**Phase:** Phase 2 (collection configuration). Test in Phase 2 before editors start using the system.

---

### Pitfall 14: Neglecting Payload Seed Data and Dev Environment Reproducibility

**What goes wrong:** Without seed data, every developer (and every fresh environment) starts with an empty CMS. Testing frontend components requires manually creating content through the admin panel every time. This slows down development and makes CI/CD testing impossible.

**Prevention:**
- Create a seed script early that populates: at least one page of each type, several news posts with varying content lengths, navigation structure, sample uploaded images
- Use Payload's Local API in the seed script for reliable data creation
- Run the seed script in CI and in Docker development environments
- Keep seed data in version control

**Phase:** Phase 1 or early Phase 2. The earlier you have seed data, the faster every subsequent phase moves.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Project scaffolding | Treating Payload as separate backend (#1) | Use `create-payload-app`, single Next.js deployment |
| Database setup | Migration ignorance (#2) | Learn migration commands on day one, never use push mode in prod |
| Content modeling | Poor collection design (#3) | Design content model before writing code; interview editors |
| Rich text config | Editor misconfiguration (#5) | Explicitly configure Lexical features; restrict, don't expand |
| Frontend development | Server/Client boundary confusion (#6) | Establish pattern in scaffolding; enforce in code review |
| Admin panel UX | Unusable for editors (#7) | Add labels/descriptions to every field; user-test with editors |
| Design implementation | Accessibility violations (#12) | WCAG AA contrast checks on all color combinations |
| Deployment (Docker/K8s) | Image bloat + cold starts (#4) | Multi-stage builds, standalone output, generous health check delays |
| Deployment (Networking) | Proxy routing conflicts (#9) | Bypass cache for /admin/* and /api/*; test full proxy chain |
| Media handling | Upload loss on restart (#10) | Persistent volume or S3-compatible storage from day one |
| Pre-launch | SEO/social sharing broken (#8) | Test OG previews with platform debuggers; add sitemap |
| Content entry | Draft/publish confusion (#13) | Enable drafts, filter by status on frontend, test full workflow |

## Sources

- Payload CMS 3.x documentation and architecture (training data, May 2025 cutoff) -- MEDIUM confidence
- Next.js App Router patterns and known issues (training data) -- MEDIUM confidence
- Drizzle ORM / Payload migration system (training data) -- MEDIUM confidence
- Docker + K8s deployment patterns for Node.js apps (training data) -- HIGH confidence (well-established patterns)
- Cloudflare / Traefik proxy chain behavior (training data) -- MEDIUM confidence
- Civic advocacy and community website UX patterns (training data) -- MEDIUM confidence

**Note:** Web verification tools were unavailable during this research session. All findings are based on training data through May 2025. Payload CMS 3.x was generally available by that date, so core architectural claims should be accurate, but specific API details or new features added after May 2025 should be verified against current Payload documentation before implementation.
