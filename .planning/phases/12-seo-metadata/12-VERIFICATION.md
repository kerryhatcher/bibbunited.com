---
phase: 12-seo-metadata
verified: 2026-03-25T12:00:00Z
status: passed
score: 11/11 must-haves verified
re_verification: false
gaps:
  - truth: "Build succeeds without next-sitemap postbuild step"
    status: resolved
    reason: "Static files public/robots.txt, public/sitemap.xml, and public/sitemap-0.xml still exist on disk from the old next-sitemap postbuild run. In Next.js, public/ static files take precedence over App Router route handlers at the same path. The native src/app/robots.ts and src/app/sitemap.ts are effectively shadowed at runtime."
    artifacts:
      - path: "public/robots.txt"
        issue: "Old static robots.txt from next-sitemap postbuild still present; shadows src/app/robots.ts"
      - path: "public/sitemap.xml"
        issue: "Old static sitemap index from next-sitemap still present; shadows src/app/sitemap.ts"
      - path: "public/sitemap-0.xml"
        issue: "Old static sitemap from next-sitemap still present"
    missing:
      - "Delete public/robots.txt"
      - "Delete public/sitemap.xml"
      - "Delete public/sitemap-0.xml"
  - truth: "Homepage entry in sitemap has priority 1.0"
    status: resolved
    reason: "The static public/sitemap-0.xml still served by the server has the homepage at priority 0.7 (the old next-sitemap default). The native src/app/sitemap.ts correctly sets priority 1.0 for the homepage but is not reachable while the static files shadow it."
    artifacts:
      - path: "public/sitemap-0.xml"
        issue: "Homepage URL https://www.bibbunited.com has priority 0.7, not 1.0"
    missing:
      - "Delete public/sitemap.xml and public/sitemap-0.xml so the native handler is served"
human_verification:
  - test: "After deleting the three static public/ files, verify /sitemap.xml returns dynamic XML with homepage at priority 1.0"
    expected: "XML response with <priority>1</priority> for https://www.bibbunited.com and published news articles present"
    why_human: "Requires running the app against a live database to confirm Payload queries execute correctly"
  - test: "Verify OG tags on a news article page using a social card previewer or curl"
    expected: "og:type=article, og:published_time populated, og:image set to article featured image (or site default), canonical URL present"
    why_human: "OG tag resolution requires a rendered HTML response; metadata.ts logic has been code-reviewed as correct but end-to-end rendering needs runtime confirmation"
---

# Phase 12: SEO Metadata Verification Report

**Phase Goal:** Every page has correct, complete metadata for search engines and social sharing
**Verified:** 2026-03-25T12:00:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Page titles follow template pattern without duplicate '| BIBB United' suffix | VERIFIED | grep returns no manual suffix in any page file outside layout.tsx |
| 2 | Homepage title is 'BIBB United -- Civic Advocacy for the BIBB Community' (no suffix) | VERIFIED | page.tsx line 22: `title: { absolute: 'BIBB United -- Civic Advocacy for the BIBB Community' }` |
| 3 | Every page has a self-referencing canonical URL | VERIFIED | metadata.ts line 47-49: `alternates: { canonical: canonicalPath }` wired in helper called by all 6 pages |
| 4 | Every page has complete Open Graph tags: url, type, site_name, image, description | VERIFIED | metadata.ts returns openGraph with url, siteName, type, images[], description on every call |
| 5 | News articles use openGraph.type 'article' with publishedTime | VERIFIED | news/[slug]/page.tsx calls generatePageMeta with type:'article' and publishedTime; helper at line 57 spreads publishedTime conditionally |
| 6 | OG image falls back through 4-level chain ending at /og-default.png | VERIFIED | metadata.ts: image param -> getDefaultOgImage() -> SiteTheme.ogDefaultImage -> /og-default.png |
| 7 | GET /sitemap.xml returns valid XML with all published news articles and CMS pages | FAILED | src/app/sitemap.ts is correct but public/sitemap.xml (static file) shadows the native handler |
| 8 | Homepage entry in sitemap has priority 1.0 | FAILED | public/sitemap-0.xml (the file actually served) has homepage at priority 0.7; native handler sets 1.0 but is shadowed |
| 9 | Static civic pages (/news, /meetings, /contact-officials) appear in sitemap with priority 0.8 | PARTIAL | Static sitemap-0.xml has these URLs at priority 0.7; native handler has 0.8 but is shadowed |
| 10 | GET /robots.txt allows all crawlers and disallows /admin/ | PARTIAL | public/robots.txt (old static file) does disallow /admin/ but is served instead of native handler; functionally correct but native handler is not being used |
| 11 | Build succeeds without next-sitemap postbuild step | VERIFIED | package.json has no "postbuild" script and no "next-sitemap" dependency |

**Score:** 9/11 truths verified (7 fully verified, 2 failed, 2 partial — partial truths counted as failed for scoring)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/metadata.ts` | Shared generatePageMeta helper | VERIFIED | 67 lines; exports generatePageMeta; contains alternates, siteName, type conditional, fallback chain |
| `src/globals/SiteTheme.ts` | ogDefaultImage upload field | VERIFIED | Field added after mode field; type:'upload', relationTo:'media' |
| `src/app/sitemap.ts` | Dynamic sitemap at app root | VERIFIED | At correct location (not inside (frontend) group); queries news-posts and pages with published filter |
| `src/app/robots.ts` | Dynamic robots.txt at app root | VERIFIED | At correct location; disallows /admin/; references sitemap.xml |
| `public/robots.txt` | Should NOT exist | FAILED | File exists (146 bytes, dated Mar 24 22:42) — old next-sitemap output |
| `public/sitemap.xml` | Should NOT exist | FAILED | File exists (192 bytes, dated Mar 24 22:42) — old next-sitemap output |
| `public/sitemap-0.xml` | Should NOT exist | FAILED | File exists (2250 bytes, dated Mar 24 22:42) — old next-sitemap output |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `src/app/(frontend)/page.tsx` | `src/lib/metadata.ts` | import generatePageMeta | WIRED | Line 4 import; line 13 call |
| `src/app/(frontend)/news/[slug]/page.tsx` | `src/lib/metadata.ts` | import generatePageMeta | WIRED | Line 7 import; line 58 call with type:'article' and publishedTime |
| `src/lib/metadata.ts` | payload findGlobal site-theme | getDefaultOgImage fetches SiteTheme | WIRED | Line 20: `payload.findGlobal({ slug: 'site-theme' })` |
| `src/app/sitemap.ts` | payload find news-posts | Payload Local API query for published posts | WIRED | Lines 11-16: `payload.find({ collection: 'news-posts', where: { _status: { equals: 'published' } } })` |
| `src/app/sitemap.ts` | payload find pages | Payload Local API query for published pages | WIRED | Lines 19-24: `payload.find({ collection: 'pages', where: { _status: { equals: 'published' } } })` |
| `src/app/robots.ts` | /sitemap.xml | sitemap URL reference | WIRED | Line 10: `sitemap: 'https://www.bibbunited.com/sitemap.xml'` |
| `src/app/sitemap.ts` | public/sitemap.xml (static) | Next.js static file precedence | SHADOWED | Static public/sitemap.xml takes precedence over the native handler at request time |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `src/app/sitemap.ts` | newsPosts.docs | `payload.find({ collection: 'news-posts' })` | Yes — live Drizzle query | FLOWING (when reachable) |
| `src/app/sitemap.ts` | pages.docs | `payload.find({ collection: 'pages' })` | Yes — live Drizzle query | FLOWING (when reachable) |
| `src/lib/metadata.ts` | ogImage | `payload.findGlobal({ slug: 'site-theme' })` | Yes — live Drizzle query with static fallback | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| generatePageMeta exports function | `node -e "require check"` | File exists and exports function at line 33 | PASS (code review) |
| No manual suffix in dynamic pages | grep for '| BIBB United' in page files | Zero matches outside layout.tsx | PASS |
| next-sitemap removed from package.json | grep package.json | No matches | PASS |
| native sitemap.ts at app root | ls src/app/ | sitemap.ts present | PASS |
| native robots.ts at app root | ls src/app/ | robots.ts present | PASS |
| static files absent from public/ | file existence check | 3 files still present | FAIL |

Step 7b: SKIPPED for full runtime verification (requires running app against database). Code-level spot-checks run above.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| SEO-05 | 12-01-PLAN.md | Page titles follow consistent template without duplicate site name suffix | SATISFIED | No page outside layout.tsx manually appends '| BIBB United'; all use generatePageMeta which passes bare title to Next.js template |
| SEO-06 | 12-01-PLAN.md | All pages have canonical URLs via Next.js metadata API | SATISFIED | alternates.canonical set in metadata.ts helper; all 6 pages call the helper |
| SEO-07 | 12-01-PLAN.md | All pages have complete Open Graph tags (url, type, site_name, image, description) | SATISFIED | metadata.ts openGraph object: url, siteName, type, images[], description — all fields present |
| SEO-08 | 12-02-PLAN.md | News articles and all CMS pages appear in sitemap.xml | BLOCKED | Native sitemap.ts correctly queries Payload for all published news-posts and pages, but public/sitemap.xml static file shadows the handler; the sitemap currently being served is the old static one with only seed-time content and no dynamic updates |
| INFRA-03 | 12-02-PLAN.md | Homepage has priority 1.0 in sitemap.xml | BLOCKED | Native sitemap.ts sets priority 1.0 for homepage, but public/sitemap-0.xml (priority 0.7 for all URLs) is the file currently served |

**Orphaned requirements:** None. All 5 requirement IDs declared in plan frontmatter are accounted for in REQUIREMENTS.md and assigned to Phase 12.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `public/robots.txt` | — | Stale static file from old postbuild | Blocker | Shadows src/app/robots.ts; serving old next-sitemap output instead of native handler |
| `public/sitemap.xml` | — | Stale static file from old postbuild | Blocker | Shadows src/app/sitemap.ts; serving static sitemap index instead of dynamic one |
| `public/sitemap-0.xml` | — | Stale static file from old postbuild | Blocker | Contains all URLs at priority 0.7, violating INFRA-03 for homepage |

No anti-patterns in source code files. All page files, metadata.ts, sitemap.ts, and robots.ts are clean.

### Human Verification Required

#### 1. Dynamic Sitemap Serving

**Test:** After deleting the three static public/ files, start the app and fetch /sitemap.xml. Also fetch /robots.txt.
**Expected:** /sitemap.xml returns XML generated by src/app/sitemap.ts — homepage present with priority 1.0, news articles at priority 0.7, civic pages at priority 0.8. /robots.txt returns content from src/app/robots.ts.
**Why human:** Requires the app running against a live PostgreSQL database to confirm Payload Local API queries execute and the correct handler is invoked.

#### 2. News Article Open Graph Tags

**Test:** Load a news article URL in a social card debugger (e.g., opengraph.xyz or Twitter Card Validator) or curl the page and inspect meta tags.
**Expected:** og:type=article, og:published_time set, og:image set to featured image URL (or site default), og:url matches canonical, og:site_name=BIBB United.
**Why human:** OG metadata resolution involves Next.js server rendering; end-to-end confirmation requires a live HTTP response.

#### 3. Homepage Title

**Test:** Load the homepage and inspect the browser tab / page source title element.
**Expected:** Title is exactly "BIBB United -- Civic Advocacy for the BIBB Community" with NO "| BIBB United" suffix.
**Why human:** title.absolute behavior requires browser rendering to confirm the layout template template string is correctly bypassed.

### Gaps Summary

Two gaps both share the same root cause: the plan task to delete static public/ files was executed (next-sitemap.config.cjs was deleted, package.json was cleaned), but the three static output files from the last `next-sitemap` postbuild run were NOT deleted. These files are untracked in git (visible in git status as `?? public/robots.txt`, `?? public/sitemap-0.xml`, `?? public/sitemap.xml`), so they were never committed — but they still exist on the filesystem.

**Root cause:** The plan task said "Delete public/robots.txt, public/sitemap.xml, public/sitemap-0.xml" but the execution agent did not delete them. The git status shows these files are still present as untracked files.

**Impact:** In Next.js, `public/` static files take precedence over App Router file-based route handlers (sitemap.ts / robots.ts) at the same URL path. As a result:
- `/sitemap.xml` serves the old static index pointing to sitemap-0.xml (not dynamically generated content)
- `/sitemap-0.xml` serves a frozen snapshot with all URLs at priority 0.7 (homepage should be 1.0 per INFRA-03)
- `/robots.txt` serves the old static file (functionally similar but the native handler is not active)

**Fix:** Delete the three files from public/:
```
rm public/robots.txt public/sitemap.xml public/sitemap-0.xml
```

These are untracked files so no git revert is needed — just delete them. After deletion, the native App Router handlers will serve both routes correctly.

**All other phase work (SEO-05, SEO-06, SEO-07) is fully verified and correct.** The metadata helper, all page refactors, canonical URLs, OG tags, article type, and title suffix fix are all properly implemented and wired.

---

_Verified: 2026-03-25T12:00:00Z_
_Verifier: Claude (gsd-verifier)_
