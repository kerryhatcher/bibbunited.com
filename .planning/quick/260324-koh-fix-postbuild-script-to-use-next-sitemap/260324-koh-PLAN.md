---
phase: quick-260324-koh
title: "Fix postbuild script to use next-sitemap --config next-sitemap.config.cjs"
status: ready
plans: 1
---

# Quick Task 260324-koh: Fix postbuild script

## Plan 01: Fix postbuild config path

### Tasks

#### Task 1: Update postbuild script in package.json
- **files:** `package.json`
- **action:** Change `"postbuild": "next-sitemap"` to `"postbuild": "next-sitemap --config next-sitemap.config.cjs"`
- **verify:** `grep postbuild package.json` shows updated command
- **done:** postbuild script references the correct .cjs config file
