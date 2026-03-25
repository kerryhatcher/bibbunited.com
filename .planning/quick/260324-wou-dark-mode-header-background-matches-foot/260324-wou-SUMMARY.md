# Quick Task 260324-wou: Dark mode header matches footer navy

## Result
**Status:** Complete
**Commit:** 58e6e0d

## What Changed
- `styles.css`: Added CSS rule `[data-mode="urgent"] header { background-color: var(--color-navy); }` so the header uses #1B2A4A (navy) in dark mode instead of #0F172A (bg-dominant)

## Why
In dark mode, the header's bg-dominant (#0F172A) was darker than the footer's navy (#1B2A4A), creating a visual disconnect. User requested they match.
