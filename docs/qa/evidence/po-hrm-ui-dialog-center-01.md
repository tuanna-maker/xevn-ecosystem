# Evidence — PO-HRM-UI-DIALOG-CENTER-01

**work_item_id:** PO-HRM-UI-DIALOG-CENTER-01  
**role:** dev-fe  
**date:** 2026-08-06  
**change_mode:** FIX  
**ack_status:** **FAIL_TO_PM** (QA retest 2026-08-06 — see § QA retest)  
**U65:** no seed · browser FE only for UF verify

## spec_read_ack

| Artifact | Ack |
|----------|-----|
| `apps/web/hrm/src/components/ui/dialog.tsx` @CODE-MEMORY | FE-DIALOG-01 glass/wordmark · portal a11y mirror |
| `apps/web/hrm/src/components/ui/alert-dialog.tsx` | parity confirm chrome |
| `JobPostingsTab.tsx` create dialog | `max-h-[90vh] overflow-y-auto` consumer — still viewport-centered via primitive |
| Portal `ConfirmDialog.tsx` | already `fixed inset-0 flex items-center justify-center` — no change required |

## Root cause

`DialogContent` / `AlertDialogContent` used `fixed left-[50%] top-[50%] translate-*-[-50%]` plus slide-in transforms. Tall create forms (recruitment job post) in Command Center embed (`?portal=1` → parent portal) appeared with **top at mid-viewport** and **bottom cut off** — translate/animation conflict + no default max-height on the panel.

## Fix (shared primitive)

Both Dialog + AlertDialog Content:

- `fixed inset-0 m-auto h-fit max-h-[90vh] overflow-y-auto` — CSS margin auto centering (no translate)
- Drop `top/left 50%` + `translate` + slide-in-from-* keyframes (fade + zoom only)
- Default max-h scroll **inside** panel so long content does not push dialog off-screen
- **must_keep:** DialogHeader glass/wordmark · Escape/close · focus trap · portal a11y mirror

## Files

- `apps/web/hrm/src/components/ui/dialog.tsx`
- `apps/web/hrm/src/components/ui/alert-dialog.tsx`
- `apps/web/hrm/src/components/ui/dialogCenter.source.test.ts` (new)

## Verify (dev)

```bash
cd apps/web/hrm && pnpm exec vitest run src/components/ui/dialogCenter.source.test.ts
```

**Result 2026-08-06:** exit **0** — 3/3 passed (`dialogCenter.source.test.ts`).

## QA manual (U65 browser)

1. Login `ceo@xe.vn` → `/command-center/hrm/recruitment` (Jobs tab).
2. Click **Tạo tin tuyển dụng mới** (`rec-job-create-edit-dialog-precision`).
3. Assert dialog **vertically centered** in viewport (not top mid / bottom clipped).
4. Assert long form scrolls **inside** dialog; Save/Cancel reachable (scroll or sticky footer).
5. Spot-check one AlertDialog (delete confirm) still centered + Escape closes.
6. Portal ConfirmDialog (any CC confirm) still centered (parity — unchanged flex center).

## Residual

- Consumers with `overflow-hidden flex flex-col` keep their own scroll regions (twMerge). No per-screen JobPostingsTab layout rewrite.

---

## QA retest — 2026-08-06 (with PO-HRM-UI-PORTAL-LOGIN-LOGO-02)

**role:** qa  
**ack_status:** **FAIL_TO_PM**  
**U65:** browser-only · zero-seed · mutates=0 · portal `:5173` · `ceo@xe.vn`  
**harness:** `node scripts/qa/_tmp-po-hrm-ui-login-logo-dialog-center-qa.mjs`  
**JSON:** `docs/qa/evidence/_tmp-po-hrm-ui-login-logo-dialog-center-qa.json`

### Matrix

| Step | Result |
|------|--------|
| Login → `/command-center/hrm/recruitment` | PASS (shell loads) |
| Jobs tab → **Tạo tin tuyển dụng mới** | PASS (open click; Escape closes) |
| Dialog **vertically centered** in viewport | **FAIL** |
| Long form scrolls inside; Save/Cancel reachable | OBS — buttons reachable in DOM, but panel **off-screen** (`boundingBox.y=900` on vh=900) |

### Screenshot

- `docs/qa/evidence/screens/po-hrm-ui-login-logo-dialog-center-01/04-job-create-dialog.png` — dim overlay present; **dialog panel not visible** in viewport (Jobs empty state still showing through).

### Geometry (Playwright)

| Field | Observed |
|-------|----------|
| class flags | `fixed inset-0 m-auto max-h-[90vh] overflow-y-auto` **present on className** |
| computed `position` | **`relative`** (not `fixed`) |
| computed `overflowY` | **`hidden`** (not `auto`) |
| box | `x=260, y=900, w=920, h=810` on viewport 1440×900 → **entirely below fold** |
| vCenterDelta | 1710 |
| Escape | PASS (closes) |

### Root cause (QA → Dev-FE)

`apps/web/hrm/src/index.css` (inside `@layer` utilities / components):

```css
.xevn-dialog-surface {
  position: relative;
  overflow: hidden;
  /* … chrome … */
}
```

This **wins over** Tailwind utilities on the same node (`DialogContent` adds `xevn-dialog-surface fixed inset-0 m-auto … overflow-y-auto`). Centering via `fixed`+`inset-0`+`m-auto` never applies → panel documents-flow to bottom → sponsor symptom «top mid / bottom cut off» becomes **fully off-screen** under overlay.

**Fix hint (not implemented by QA):** drop or scope `position: relative` / `overflow: hidden` on `.xevn-dialog-surface` so Content can stay `position: fixed` + `overflow-y-auto` (keep `::before` brand bar via another containing block strategy if needed).

### Defect

| ID | Severity | Owner |
|----|----------|-------|
| DEF-DIALOG-CENTER-CSS-OVERRIDE | **P0** | dev-fe |

### Locks

face_live=false · remaster_program_done=false · no seed · no invent visual PASS for dialog.

---

## QA verdict — 2026-08-06 (U65 browser-only)

**role:** qa  
**ack_status:** **FAIL_TO_PM**  
**env:** portal `http://127.0.0.1:5173` · hrm-api `:28001` · `ceo@xe.vn`  
**click path:** login FE → `/command-center/hrm/recruitment` → tab **Tin Tuyển dụng** → **+ Tạo tin tuyển dụng**  
**harness:** `scripts/qa/_tmp-po-hrm-ui-login-logo-dialog-center-qa.mjs`  
**machine JSON:** `docs/qa/evidence/_tmp-po-hrm-ui-login-logo-dialog-center-qa.json`  
**seed:** false · **mutates:** 0 · face_live=false · remaster_program_done=false

### Matrix

| # | AC | Result | Evidence |
|---|----|--------|----------|
| 2 | Dialog vertically centered in viewport | **FAIL** | Playwright `boundingBox.y = **900**` on vh=900 → panel entirely below fold; overlay visible, form not in viewport |
| 2b | Long form scrolls inside; bottom not permanently clipped | **FAIL** | `offscreenEntirely=true` · `permanentlyClipped=true` · computed `overflowY: **hidden**` (class has `overflow-y-auto`) · `scrollHeight 1011` / `clientHeight 808` but not usable in-view |
| 2c | Save/Cancel reachable | **COND** | DOM buttons «Hủy» / «Tạo tin» present (locator) but **not visually in viewport** until center fixed |
| 2d | Escape closes | **PASS** | Escape → dialog dismissed |
| 3 | AlertDialog center spot | **OBS / skipped** | No easy delete path without mutate; source parity classes present on AlertDialogContent |

### Runtime geom (blocker)

| Metric | Observed | Expect |
|--------|----------|--------|
| class tokens | `fixed inset-0 m-auto h-fit max-h-[90vh] overflow-y-auto` present | yes |
| **computed `position`** | **`relative`** | `fixed` |
| computed `overflowY` | `hidden` | `auto`/`scroll` |
| `boundingBox` | `{ x:260, y:**900**, w:920, h:810 }` | y ≈ (vh−h)/2 (~45) |
| owner document | iframe `/hr/recruitment?tab=jobs&portal=1…` | parent portal or correctly fixed in embed viewport |

### Screenshots

- `docs/qa/evidence/screens/po-hrm-ui-login-logo-dialog-center-01/03-recruitment-shell.png`
- `docs/qa/evidence/screens/po-hrm-ui-login-logo-dialog-center-01/04-job-create-dialog.png` — **overlay on Jobs tab; dialog panel not visible in frame**

### Root-cause hypothesis (for Dev-FE)

1. Tailwind class `fixed` is on the node but **computed position stays `relative`** in CC embed runtime → `inset-0` + `m-auto` vertical centering does not engage (horizontal margin `0 260px` still centers width).
2. Possible causes: CSS override on `[role=dialog]` / Radix content; parent portal stylesheet sync incomplete; containing-block / iframe fixed semantics; twMerge/`overflow-hidden` consumer conflict.
3. Vitest source test **3/3** is insufficient — does not catch runtime computed-style / embed viewport.

### Residual

- **P0:** Dialog create job off-screen in Command Center embed — re-dispatch **dev-fe** then QA retest same click path.
- Dashboard header «+ Tạo tin tuyển dụng» has **no onClick** (dead CTA) — separate UX debt; QA used Jobs tab button (wired).
