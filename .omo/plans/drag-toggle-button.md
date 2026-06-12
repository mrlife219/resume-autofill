# Plan: Add Drag Functionality to Floating Toggle Button

## TL;DR

> **Quick Summary**: Add drag-to-move capability to the floating sidebar toggle button (`.racn-toggle`) so users can reposition it anywhere on screen. Position is persisted in `chrome.storage.local`.
>
> **Deliverables**:
> - Draggable toggle button with mouse + touch support
> - Position persistence across page loads
> - Visual cursor feedback on hover/drag
> - Click vs drag detection (small movement = click)
>
> **Estimated Effort**: Quick
> **Parallel Execution**: NO - sequential (small single-concern change)
> **Critical Path**: JS drag logic → CSS adjustments → manual QA

---

## Context

### Original Request
Add drag functionality to the floating toggle button so users can reposition it anywhere on the page. The image shows the current teal button with a file icon.

### Current State
- `#racn-root` is `position: fixed; inset: auto 18px 18px auto` (bottom-right corner)
- `.racn-toggle` is a 48x48px button inside `#racn-root`
- `.racn-panel` is a separate fixed sidebar (`top: 24px; right: 18px; bottom: 24px`)
- No drag logic exists in the codebase
- Position could be stored via a new chrome.storage key

---

## Work Objectives

### Core Objective
Make the floating toggle button draggable with position persistence, without breaking existing click-to-open-sidebar behavior.

### Concrete Deliverables
- Modified `content.js` with drag event handling
- Modified `styles.css` with cursor and transition adjustments
- New storage key `resumeAutofillCn.togglePosition` for persisting `{top, left}` or `{bottom, right}`

### Definition of Done
- [ ] Button can be dragged via mouse on desktop
- [ ] Button can be dragged via touch on mobile
- [ ] Small movements (< 5px threshold) still register as clicks
- [ ] Button position persists after page reload
- [ ] Button position persists after extension reload
- [ ] Panel sidebar still opens correctly after dragging
- [ ] Button stays within viewport bounds

### Must Have
- Mouse drag support (mousedown → mousemove → mouseup)
- Touch drag support (touchstart → touchmove → touchend)
- Click vs drag discrimination (threshold-based)
- Position persistence in chrome.storage.local
- Viewport boundary clamping

### Must NOT Have (Guardrails)
- No changes to panel positioning logic (sidebar stays fixed on right)
- No changes to field matching, autofill, or options page
- No new dependencies or libraries
- No changes to manifest.json
- No changes to background.js

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: NO (no test framework)
- **Automated tests**: None (vanilla JS extension, manual QA only)

### QA Policy
Agent-executed QA via Playwright: open extension in browser, drag button, verify position persists.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Sequential - single file concern):
├── Task 1: Add drag logic to content.js [quick]
├── Task 2: Update styles.css for drag UX [quick]

Wave FINAL (After ALL tasks):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Manual QA (unspecified-high + playwright)
├── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1    | None      | 2      |
| 2    | 1         | F1-F4  |
| F1-F4| 2         | —      |

### Agent Dispatch Summary

- **Wave 1**: 2 tasks — T1 → `quick`, T2 → `quick`
- **FINAL**: 4 tasks — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high` + `playwright`, F4 → `deep`

---

## TODOs

- [ ] 1. Add drag logic to content.js

  **What to do**:
  - Add a new storage key constant: `TOGGLE_POSITION_KEY = "resumeAutofillCn.togglePosition"`
  - After `mount()`, load saved position from chrome.storage.local and apply to `#racn-root` style
  - Add drag event handlers to `.racn-toggle`:
    - `mousedown` / `touchstart`: record start position, set dragging flag
    - `mousemove` / `touchmove`: if dragging, calculate delta, update `#racn-root` style (`top`/`left` instead of `inset`), clamp to viewport
    - `mouseup` / `touchend`: if moved > 5px from start, it was a drag (prevent click); save position to storage; clear dragging flag
  - On drag end, save `{top, left}` to chrome.storage.local
  - The drag threshold of 5px distinguishes click from drag

  **Must NOT do**:
  - Do not change panel positioning logic
  - Do not modify `bindEvents()` structure — add drag handlers in `mount()` after existing setup
  - Do not add drag to the panel itself

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (sequential with Task 2)
  - **Blocks**: Task 2, F1-F4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `content.js:1-3` — IIFE wrapper, all new code goes inside
  - `content.js:400-419` — `chromeStorageGet/Set` pattern to follow for new storage key
  - `content.js:653-698` — `mount()` function where drag handlers should be attached
  - `content.js:700-793` — `bindEvents()` to understand existing event patterns

  **API/Type References**:
  - `chrome.storage.local.get/set` — same pattern used throughout

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Drag button with mouse moves it to a new position
    Tool: Playwright
    Preconditions: Extension loaded, page open with sidebar button visible
    Steps:
      1. Navigate to a test page
      2. Locate the `.racn-toggle` button (teal 48x48 button in bottom-right)
      3. Perform mousedown at button center, then mousemove 100px left and 50px up, then mouseup
      4. Assert button has moved (check computed style: top/left changed from default)
      5. Reload the page
      6. Assert button is at the saved position (not back at bottom-right)
    Expected Result: Button moves during drag, position persists after reload
    Failure Indicators: Button doesn't move, position resets on reload, click still fires after drag
    Evidence: .omo/evidence/task-1-drag-mouse.png

  Scenario: Click still works after adding drag support
    Tool: Playwright
    Preconditions: Extension loaded, button visible
    Steps:
      1. Locate the `.racn-toggle` button
      2. Click the button (no movement)
      3. Assert `.racn-panel[data-open="true"]` appears
    Expected Result: Click opens sidebar panel as before
    Failure Indicators: Click doesn't open panel, drag threshold too high
    Evidence: .omo/evidence/task-1-click-still-works.png

  Scenario: Small movement (< 5px) still registers as click
    Tool: Playwright
    Preconditions: Extension loaded, button visible
    Steps:
      1. Locate the `.racn-toggle` button
      2. Perform mousedown, then mousemove 2px right, then mouseup
      3. Assert `.racn-panel[data-open="true"]` appears
    Expected Result: Tiny movement treated as click, not drag
    Failure Indicators: Tiny movement triggers drag mode
    Evidence: .omo/evidence/task-1-tiny-movement-click.png
  ```

  **Commit**: YES
  - Message: `feat(content): add drag-to-move for floating toggle button`
  - Files: `content.js`
  - Pre-commit: None (no test framework)

---

- [ ] 2. Update styles.css for drag UX

  **What to do**:
  - Add `cursor: grab` to `.racn-toggle` (default state)
  - Add `cursor: grabbing` to `.racn-toggle` when dragging (via a `.racn-dragging` class on `#racn-root`)
  - Add `user-select: none` to `#racn-root` during drag to prevent text selection
  - Ensure no `transition` on `#racn-root` position (would make drag feel laggy)

  **Must NOT do**:
  - Do not change `.racn-panel` styles
  - Do not change `.racn-toggle` size, color, or shadow

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (sequential after Task 1)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `styles.css:30-42` — current `.racn-toggle` styles to modify
  - `styles.css:23-28` — current `#racn-root` styles

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Cursor changes on hover and during drag
    Tool: Playwright
    Preconditions: Extension loaded, button visible
    Steps:
      1. Hover over `.racn-toggle` button
      2. Assert cursor is `grab` (via computed style or screenshot)
      3. Click and hold (mousedown) on button
      4. Assert cursor changes to `grabbing`
    Expected Result: Visual cursor feedback during drag
    Failure Indicators: No cursor change, cursor stays as pointer
    Evidence: .omo/evidence/task-2-cursor-grab.png
  ```

  **Commit**: YES (groups with Task 1)
  - Message: `feat(content): add drag-to-move for floating toggle button`
  - Files: `styles.css`
  - Pre-commit: None

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Review all changed files for: unused variables, console.log in prod, commented-out code, event listener memory leaks, proper cleanup. Check that drag handlers are properly scoped inside the IIFE.
  Output: `Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration. Save to `.omo/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1. Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | VERDICT`

---

## Commit Strategy

- **Tasks 1+2**: `feat(content): add drag-to-move for floating toggle button` — `content.js`, `styles.css`

---

## Success Criteria

### Verification Commands
```bash
# No build step — verify by loading extension in Chrome
# Check files exist and are syntactically valid
node -c content.js  # Expected: no syntax errors
node -c options.js  # Expected: no syntax errors (unchanged)
```

### Final Checklist
- [ ] Button is draggable via mouse
- [ ] Button is draggable via touch
- [ ] Click still works (no regression)
- [ ] Position persists after reload
- [ ] No changes to panel, options, background, or manifest
