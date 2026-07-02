# Collapsed Pill Position Setting — Design

**Date:** 2026-07-02
**Status:** Approved
**Extends:** `2026-07-02-collapsible-bar-design.md`

## Problem

The collapsed pill is fixed to the bottom-right corner. Pages may have their own
UI there (chat widgets, feedback buttons), so users want to choose the corner.

## Approach

Mirror the existing `buildInfoPosition` pattern: a stored setting, a select in
the settings popup, corner CSS classes on the pill, and an `applyPillPosition()`
helper that swaps them.

## Behavior

- **Setting:** `pillPosition` in `DEFAULTS`, default `"bottom-right"`, persisted
  to `chrome.storage.local` on change.
- **Options:** `bottom-right` (Bottom Right), `bottom-left` (Bottom Left),
  `top-right` (Top Right), `top-left` (Top Left).
- **UI:** A `Pill Position` labeled `<select id="bi-pill-position">` in the
  settings popup, directly after the Bar Position select, styled identically.
- **CSS:** Four classes — `pill-bottom-right`, `pill-bottom-left`,
  `pill-top-right`, `pill-top-left` — each setting the two relevant edge
  offsets to `8px` and the opposite edges to `auto`. The base `#build-info-pill`
  rule no longer hardcodes `bottom`/`right`.
- **Immediate effect:** Changing the select calls `applyPillPosition()` right
  away (the pill keeps its position class even while hidden).
- **No overlap concern:** the pill and the bar are never visible simultaneously.

## Testing

Manual, on `test/test-page.html`:

1. Each of the four options positions the pill 8px from the two matching edges.
2. The chosen corner persists across page reloads.
3. Default (no stored value) remains bottom-right.
