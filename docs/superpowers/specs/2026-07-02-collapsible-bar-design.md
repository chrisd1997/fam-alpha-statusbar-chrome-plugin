# Collapsible Build Info Bar — Design

**Date:** 2026-07-02
**Status:** Approved

## Problem

Users want to hide the Build Info Bar without losing it entirely: collapse it to a
small block in the bottom-right corner of the screen, and expand it again by
clicking that block.

## Approach

Two separate fixed-position elements whose visibility is toggled (rather than
morphing one element with CSS):

- The existing `#build-info-bar` stays as-is.
- A new `#build-info-pill` element sits fixed in the bottom-right corner.
- A new minimize button in the bar hides the bar and shows the pill; clicking
  the pill does the reverse.

This keeps each element's CSS simple and independent, matching the existing
plain-DOM + CSS-class style of the codebase.

## Behavior

### Controls

- A new **—** (minimize) button is added to `#build-info-controls`, placed
  before the existing **×** button. Title: "Collapse to corner".
- The existing **×** button is unchanged: it removes the bar (and pill) for the
  current page load only and does not touch stored state.

### Collapsed pill

- Fixed position `bottom: 8px; right: 8px`, always bottom-right regardless of
  the bar's top/bottom position setting.
- Same visual theme as the bar: `#1a1a2e` background, monospace font, light
  text, rounded corners, maximum z-index.
- Content: `ⓘ #<CORE_BUILD> / #<STRAMIEN_BUILD>` (icon + Core and Stramien
  build numbers, e.g. `ⓘ #2041 / #2888`). Each build is omitted when it is
  missing, or is "unknown" while the "Show Unknown items" setting is off;
  the pill falls back to the icon alone when neither build is shown.
- Tooltip: "Show build info bar".
- Clicking the pill hides it, shows the bar, and restores the bar's body
  margin offset.

### State & persistence

- New `collapsed: false` entry in `DEFAULTS`.
- Toggling collapse/expand writes `collapsed` to `chrome.storage.local`.
- On load, the stored value determines whether the bar or the pill is shown,
  so the collapsed state persists across page loads and navigation.
- While collapsed, the body margin offset (`marginTop`/`marginBottom`) is
  cleared so the page reflows naturally.

## Error handling

- No `script#build-info` or unparsable JSON: unchanged — extension does
  nothing (existing behavior).
- Missing/hidden Core build: pill renders icon-only (covered above).

## Testing

Manual, using a small test HTML page containing a `script#build-info` block:

1. Collapse via — → bar disappears, pill appears bottom-right, body margin cleared.
2. Click pill → bar returns (with correct margin), pill disappears.
3. Reload while collapsed → page starts collapsed; reload while expanded → starts expanded.
4. Both bar positions (top and bottom) with collapse/expand.
5. Core build "unknown" with unknowns hidden → pill shows icon only.
6. × button still removes bar for the page load without changing stored state.
