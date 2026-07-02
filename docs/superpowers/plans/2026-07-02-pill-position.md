# Pill Position Setting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users choose which screen corner the collapsed pill sits in, via a new select in the settings popup.

**Architecture:** Mirror the `buildInfoPosition` pattern: `pillPosition` setting in `chrome.storage.local`, a select in the popup, four corner CSS classes on `#build-info-pill`, and an `applyPillPosition()` helper that swaps them.

**Tech Stack:** Plain JavaScript content script, plain CSS. Manual verification via `test/test-page.html` and the chrome.storage harness (see Task 3 of `2026-07-02-collapsible-bar.md`).

**Spec:** `docs/superpowers/specs/2026-07-02-pill-position-design.md`

## Global Constraints

- Setting key `pillPosition`, default `"bottom-right"`; values `bottom-right`, `bottom-left`, `top-right`, `top-left`.
- All corners use 8px offsets from their two edges.
- Select label copy: "Pill Position"; option copy: "Bottom Right", "Bottom Left", "Top Right", "Top Left".
- The select sits directly after the Bar Position label in the popup.

---

### Task 1: Pill position setting (JS + CSS)

**Files:**
- Modify: `content.js` (DEFAULTS; popup.innerHTML; after `applyCollapsed`; storage callback)
- Modify: `content.css` (base pill rule + corner classes)

**Interfaces:**
- Consumes: `pill`, popup markup, and the storage callback from the collapsible-bar feature.
- Produces: `applyPillPosition(position)` helper; `#bi-pill-position` select; `pill-<corner>` CSS classes.

- [ ] **Step 1: Add the default**

In `DEFAULTS`, after `collapsed: false,` add:

```js
    pillPosition: "bottom-right",
```

- [ ] **Step 2: Add the select to the popup markup**

In `popup.innerHTML`, after the Bar Position `</label>` add:

```html
    <label>
      Pill Position
      <select id="bi-pill-position">
        <option value="bottom-right">Bottom Right</option>
        <option value="bottom-left">Bottom Left</option>
        <option value="top-right">Top Right</option>
        <option value="top-left">Top Left</option>
      </select>
    </label>
```

- [ ] **Step 3: Add the helper**

After the `applyCollapsed` function, add:

```js
  function applyPillPosition(position) {
    pill.classList.remove(
      "pill-bottom-right",
      "pill-bottom-left",
      "pill-top-right",
      "pill-top-left"
    );
    pill.classList.add(`pill-${position}`);
  }
```

- [ ] **Step 4: Wire the select in the storage callback**

Next to the other `popup.querySelector` lines add:

```js
    const pillPositionSelect = popup.querySelector("#bi-pill-position");
```

After `positionSelect.value = settings.buildInfoPosition;` add:

```js
    pillPositionSelect.value = settings.pillPosition;
```

After `applyCollapsed(settings.collapsed, settings);` add:

```js
    applyPillPosition(settings.pillPosition);
```

Next to the other change listeners add:

```js
    pillPositionSelect.addEventListener("change", () => {
      settings.pillPosition = pillPositionSelect.value;
      chrome.storage.local.set({ pillPosition: settings.pillPosition });
      applyPillPosition(settings.pillPosition);
    });
```

- [ ] **Step 5: CSS — corner classes**

In `content.css`, remove `bottom: 8px;` and `right: 8px;` from the base `#build-info-pill` rule, and add after it:

```css
#build-info-pill.pill-bottom-right { bottom: 8px; right: 8px; }
#build-info-pill.pill-bottom-left { bottom: 8px; left: 8px; }
#build-info-pill.pill-top-right { top: 8px; right: 8px; }
#build-info-pill.pill-top-left { top: 8px; left: 8px; }
```

- [ ] **Step 6: Verify**

`node --check content.js`, then via the harness on `test/test-page.html`: each of the four select values positions the pill 8px from its two edges; the corner persists across reload; default with no stored value is bottom-right.

- [ ] **Step 7: Commit**

```bash
git add content.js content.css
git commit -m "Add pill position setting"
```
