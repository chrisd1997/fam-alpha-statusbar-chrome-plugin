# Build Info Bar - Chrome Extension

A lightweight Chrome extension that detects build information embedded in web pages and displays it in a compact, always-visible bar. Built for internal use with sites that include a `<script id="build-info">` tag in their HTML.

## What it does

When you visit a page that contains a `<script id="build-info" type="application/json">` tag, the extension parses the JSON and displays the following in a fixed bar:

- **Core** — build number, branch, and commit hash
- **Stramien** — build number, branch, commit hash, and path
- **Site** — build number, branch, commit hash, and path

The bar only appears on pages that contain the build info script. On all other pages, nothing happens.

## Expected JSON format

```html
<script id="build-info" type="application/json">
{
  "CORE_BUILD": "1802",
  "CORE_COMMIT": "13f7f9e383234eeb56d1e89b2ec263aa22c6137a",
  "CORE_BRANCH": "master",
  "STRAMIEN_BUILD": "2556",
  "STRAMIEN_COMMIT": "2076ff2fa5dd0ac98d242aff047bdb043769f26b",
  "STRAMIEN_BRANCH": "master",
  "STRAMIEN_PATH": "amsg-stramien-alpha",
  "SITE_BUILD": "103",
  "SITE_COMMIT": "2cd67a0fd29ec7422c3ee4e6ac3430c6bf2fcabc",
  "SITE_BRANCH": "master",
  "SITE_PATH": "amsg-alpha-groeneheerlijkheid"
}
</script>
```

## Installation

1. Clone or download this repository
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked**
5. Select the folder containing this extension

## Usage

- The bar appears automatically on any page with build info
- Click **↓/↑** to move the bar between the top and bottom of the page (your preference is saved)
- Click **×** to dismiss the bar for the current page

## Permissions

- **storage** — used to persist your top/bottom position preference
