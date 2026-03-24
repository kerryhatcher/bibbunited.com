---
phase: quick-260324-koh
plan: 01
title: "Fix postbuild script to use next-sitemap --config next-sitemap.config.cjs"
status: complete
completed: "2026-03-24"
duration: "<1min"
tasks_completed: 1
tasks_total: 1
key-files:
  modified:
    - package.json
decisions: []
requirements-completed: []
---

# Quick Task 260324-koh: Fix postbuild script Summary

**One-liner:** Add explicit --config flag to next-sitemap postbuild script so it finds the .cjs config in an ESM project.

## What Changed

The project uses `"type": "module"` in package.json, which means next-sitemap cannot auto-discover `next-sitemap.config.cjs` without being told explicitly. Updated the postbuild script from `next-sitemap` to `next-sitemap --config next-sitemap.config.cjs`.

## Tasks Completed

| Task | Description | Commit | Files |
|------|------------|--------|-------|
| 1 | Update postbuild script in package.json | 78cce44 | package.json |

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED
