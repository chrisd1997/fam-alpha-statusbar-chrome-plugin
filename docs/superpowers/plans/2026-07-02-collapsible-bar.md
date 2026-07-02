# Collapsible Build Info Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users collapse the Build Info Bar to a small pill in the bottom-right corner and expand it again by clicking the pill, with the state persisted across page loads.

**Architecture:** Two separate fixed-position elements whose visibility is toggled: the existing `#build-info-bar` and a new `#build-info-pill`. A new — (minimize) button in the bar's controls hides the bar and shows the pill; clicking the pill reverses it. A new `collapsed` setting in `chrome.storage.local` persists the state.

**Tech Stack:** Plain JavaScript content script (Manifest V3 Chrome extension), plain CSS. No build step, no test framework — testing is manual via a fixture HTML page (per spec).

**Spec:** `docs/superpowers/specs/2026-07-02-collapsible-bar-design.md`

## Global Constraints

- No frameworks, no build tooling — plain DOM APIs and CSS, matching existing code style.
- Pill position is always `bottom: 8px; right: 8px`, regardless of the bar's top/bottom setting.
- Pill theme matches the bar: background `#1a1a2e`, light text, monospace font, `z-index: 2147483647`.
- Pill content: `ⓘ #<CORE_BUILD>`; icon only when Core build is missing, or is "unknown" while "Show Unknown items" is off.
- New setting key is `collapsed`, default `false`, stored in `chrome.storage.local`.
- The × button keeps its current-page-load-only behavior and must not write to storage; it must also remove the pill.
- Button titles (exact copy): minimize = "Collapse to corner", pill = "Show build info bar", × stays "Hide build info bar".

---

### Task 1: Manual test fixture page

**Files:**
- Create: `test/test-page.html`

**Interfaces:**
- Produces: a page with a `script#build-info` JSON block that the content script picks up. Task 2's verification steps open this page.

- [ ] **Step 1: Create the fixture page**

Create `test/test-page.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Build Info Bar test page</title>
</head>
<body>
  <script type="application/json" id="build-info">
  {
    "CORE_BUILD": "4211",
    "CORE_COMMIT": "9f3ab21c7d4e5f6a8b9c0d1e2f3a4b5c6d7e8f90",
    "CORE_BRANCH": "main",
    "STRAMIEN_BUILD": "873",
    "STRAMIEN_COMMIT": "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    "STRAMIEN_BRANCH": "develop",
    "STRAMIEN_PATH": "/srv/stramien",
    "SITE_BUILD": "152",
    "SITE_COMMIT": "abcdef0123456789abcdef0123456789abcdef01",
    "SITE_BRANCH": "feature/checkout",
    "SITE_PATH": "/srv/site"
  }
  </script>
  <h1>Test page for Build Info Bar</h1>
  <p>The extension should render the build info bar on this page.</p>
</body>
</html>
```

- [ ] **Step 2: Verify the existing extension works against the fixture**

1. Serve the project: `python3 -m http.server 8000` (from the repo root, in the background).
2. In Chrome, open `chrome://extensions`, enable Developer mode, click "Load unpacked", and select the repo root (skip if already loaded; click the reload ↻ icon on the extension card instead).
3. Open `http://localhost:8000/test/test-page.html`.

Expected: the dark build info bar appears (top or bottom depending on stored setting) showing Core #4211, Stramien #873, and Site #152 sections, with the gear and × buttons on the right.

- [ ] **Step 3: Commit**

```bash
git add test/test-page.html
git commit -m "Add manual test fixture page for build info bar"
```

---

### Task 2: Collapse-to-pill feature (JS + CSS)

**Files:**
- Modify: `content.js` (DEFAULTS at line 12; controls section around lines 90–145; storage callback at lines 148–177)
- Modify: `content.css` (append pill styles at end of file)

**Interfaces:**
- Consumes: `test/test-page.html` from Task 1 for verification.
- Produces: `#build-info-pill` element, `collapsed` boolean in `chrome.storage.local`, functions `renderPill(settings)` and `applyCollapsed(collapsed, settings)` inside the content script IIFE.

- [ ] **Step 1: Add the `collapsed` default in `content.js`**

Change the `DEFAULTS` object (line 12) from:

```js
  const DEFAULTS = {
    showGitDetails: true,
    showUnknown: false,
    buildInfoPosition: "top",
  };
```

to:

```js
  const DEFAULTS = {
    showGitDetails: true,
    showUnknown: false,
    buildInfoPosition: "top",
    collapsed: false,
  };
```

- [ ] **Step 2: Create the pill element and collapse helpers in `content.js`**

Immediately after the `applyPosition` function (after line 88, before the `// Controls` comment), insert:

```js
  // Collapsed pill (bottom-right corner)
  const pill = document.createElement("button");
  pill.id = "build-info-pill";
  pill.title = "Show build info bar";
  pill.style.display = "none";

  function renderPill(settings) {
    const coreBuild = data.CORE_BUILD;
    const showBuild =
      coreBuild && (settings.showUnknown || coreBuild.toLowerCase() !== "unknown");
    pill.textContent = showBuild ? `ⓘ #${coreBuild}` : "ⓘ";
  }

  function applyCollapsed(collapsed, settings) {
    if (collapsed) {
      bar.style.display = "none";
      pill.style.display = "";
      document.body.style.marginTop = "";
      document.body.style.marginBottom = "";
    } else {
      bar.style.display = "";
      pill.style.display = "none";
      applyPosition(settings.buildInfoPosition);
    }
  }
```

Note: in `applyCollapsed`, the bar's `display` must be restored **before** calling `applyPosition`, because `applyPosition` reads `bar.offsetHeight` (which is 0 while hidden).

- [ ] **Step 3: Add the minimize button and make × remove the pill**

Replace the close-button block (lines 131–139):

```js
  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.title = "Hide build info bar";
  closeBtn.addEventListener("click", () => {
    bar.remove();
    document.body.style.marginTop = "";
    document.body.style.marginBottom = "";
  });
```

with:

```js
  // Minimize button
  const minBtn = document.createElement("button");
  minBtn.textContent = "—";
  minBtn.title = "Collapse to corner";

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.title = "Hide build info bar";
  closeBtn.addEventListener("click", () => {
    bar.remove();
    pill.remove();
    document.body.style.marginTop = "";
    document.body.style.marginBottom = "";
  });
```

Then change the controls/mount block (lines 141–145) from:

```js
  controls.appendChild(settingsWrapper);
  controls.appendChild(closeBtn);
  bar.appendChild(controls);

  document.body.prepend(bar);
```

to:

```js
  controls.appendChild(settingsWrapper);
  controls.appendChild(minBtn);
  controls.appendChild(closeBtn);
  bar.appendChild(controls);

  document.body.prepend(bar);
  document.body.appendChild(pill);
```

- [ ] **Step 4: Wire state, persistence, and re-rendering in the storage callback**

In the `chrome.storage.local.get(DEFAULTS, (settings) => { ... })` callback, replace:

```js
    renderSections(settings);
    applyPosition(settings.buildInfoPosition);
```

with:

```js
    renderSections(settings);
    renderPill(settings);
    applyCollapsed(settings.collapsed, settings);

    minBtn.addEventListener("click", () => {
      settings.collapsed = true;
      chrome.storage.local.set({ collapsed: true });
      applyCollapsed(true, settings);
    });

    pill.addEventListener("click", () => {
      settings.collapsed = false;
      chrome.storage.local.set({ collapsed: false });
      applyCollapsed(false, settings);
    });
```

And in the existing `showUnknownCheckbox` change listener, add a `renderPill(settings);` call so the pill's build number respects the unknown-items setting. The listener becomes:

```js
    showUnknownCheckbox.addEventListener("change", () => {
      settings.showUnknown = showUnknownCheckbox.checked;
      chrome.storage.local.set({ showUnknown: settings.showUnknown });
      renderSections(settings);
      renderPill(settings);
    });
```

- [ ] **Step 5: Add pill styles to `content.css`**

Append to the end of `content.css`:

```css
/* Collapsed pill */
#build-info-pill {
  position: fixed;
  bottom: 8px;
  right: 8px;
  z-index: 2147483647;
  background: #1a1a2e;
  color: #e0e0e0;
  font: 12px/1.4 "SF Mono", "Fira Code", Consolas, monospace;
  border: none;
  border-radius: 12px;
  padding: 4px 10px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

#build-info-pill:hover {
  color: #fff;
  background: #16213e;
}
```

- [ ] **Step 6: Reload the extension and smoke-test**

1. On `chrome://extensions`, click the reload ↻ icon on the Build Info Bar card.
2. Reload `http://localhost:8000/test/test-page.html`.

Expected: bar shows as before, now with a — button between the gear and the ×. Clicking — hides the bar and shows a small dark `ⓘ #4211` pill in the bottom-right. Clicking the pill restores the bar.

- [ ] **Step 7: Commit**

```bash
git add content.js content.css
git commit -m "Add collapse-to-corner pill for build info bar"
```

---

### Task 3: Full manual verification against the spec

**Files:**
- None (verification only; fix-up commits allowed if a check fails)

**Interfaces:**
- Consumes: the feature from Task 2 and the fixture from Task 1.

Run each check on `http://localhost:8000/test/test-page.html` (extension reloaded):

- [ ] **Step 1: Collapse** — click —. Expected: bar disappears, `ⓘ #4211` pill appears bottom-right, page body margin is cleared (inspect `document.body.style.marginTop/marginBottom` in DevTools: both empty).
- [ ] **Step 2: Expand** — click the pill. Expected: bar returns with correct body margin for its position; pill disappears.
- [ ] **Step 3: Persistence** — collapse, then reload the page. Expected: page loads with only the pill. Expand, reload. Expected: page loads with the bar.
- [ ] **Step 4: Both positions** — in the gear popup set Bar Position to Bottom; collapse and expand. Expected: pill is still bottom-right; expanding restores the bottom bar with `marginBottom` set. Repeat with Top.
- [ ] **Step 5: Unknown fallback** — in `test/test-page.html`, temporarily set `"CORE_BUILD": "unknown"`, reload with "Show Unknown items" off. Expected: pill shows only `ⓘ`. Turn "Show Unknown items" on. Expected: pill shows `ⓘ #unknown`. Revert the fixture change afterwards.
- [ ] **Step 6: × behavior** — while expanded, click ×. Expected: bar and pill are both gone for this page load; after a reload the bar is back (stored `collapsed` untouched).
- [ ] **Step 7: Commit any fix-ups** — if any check required a code fix, commit it:

```bash
git add -A
git commit -m "Fix collapse behavior found during manual verification"
```
