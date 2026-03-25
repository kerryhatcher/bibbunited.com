# Quick Task 260324-wer: Fix header broken in dark theme

## Result
**Status:** Complete
**Commit:** 1b1bf3a

## What Changed
- `Header.tsx`: Replaced hard-coded `bg-white` with theme-aware `bg-bg-dominant` on all 3 background instances (main header, dropdown menu, mobile panel)

## Why
Quick task 260324-vt1 replaced `bg-bg-dominant` with `bg-white` to fix a perceived transparency issue. This broke dark/urgent mode — the header stayed white with invisible text on a dark-themed page. Restored `bg-bg-dominant` which resolves to `#FFFFFF` in community mode and `#0F172A` in urgent mode.
