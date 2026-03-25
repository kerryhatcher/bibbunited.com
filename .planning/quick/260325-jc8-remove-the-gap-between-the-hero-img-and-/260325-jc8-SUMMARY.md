---
quick_id: 260325-jc8
description: Remove the gap between the hero image and the top menu
status: complete
---

# Quick Task Summary: Remove gap between hero image and top menu

## What was done

Removed the `pt-16` class from the `<main>` element in `src/app/(frontend)/layout.tsx`.

## Why

The header uses `position: sticky` (not `position: fixed`). Sticky elements remain in the normal document flow and reserve their own space. The `pt-16` padding was creating a redundant 4rem gap between the header and the page content (visible as a white band between the menu and hero image).

This also corrects the Phase 11 blocker note that stated "pt-16 is NOT unnecessary" — that note conflated `sticky` with `fixed` behavior.

## Files changed

- `src/app/(frontend)/layout.tsx` — removed `pt-16` from `<main>` className
