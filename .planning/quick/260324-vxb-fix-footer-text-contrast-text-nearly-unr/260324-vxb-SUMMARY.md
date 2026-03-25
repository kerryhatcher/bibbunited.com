# Quick Task 260324-vxb: Fix footer text contrast

## Result
**Status:** Complete
**Commit:** b31e6b0

## What Changed
- `Footer.tsx`: Replaced `text-text-on-dark` with `text-white` on footer element, `text-white/80` on copyright and nav links
- `FooterCTA.tsx`: Replaced `text-text-on-dark` with `text-white/80` on subtitle paragraph

## Why
The `text-text-on-dark` Tailwind utility maps to `--color-text-on-dark` CSS variable, which was resolving incorrectly (near-invisible text on navy background). Using static `text-white` and `text-white/80` classes guarantees readable contrast without depending on CSS variable resolution.
