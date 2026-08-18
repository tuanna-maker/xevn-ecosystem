# Evidence — PO-HRM-UI-DIALOG-CENTER-01-R2

**work_item_id:** PO-HRM-UI-DIALOG-CENTER-01-R2  
**role:** dev-fe  
**date:** 2026-08-06  
**change_mode:** FIX  
**ack_status:** **PASS_TO_PM** (QA U65 retest 2026-08-06 — see § QA retest R2)  
**U65:** no seed · browser FE probe for geometry (mutates=0)  
**supersedes:** DEF-DIALOG-CENTER-CSS-OVERRIDE on `PO-HRM-UI-DIALOG-CENTER-01` FAIL_TO_PM

## spec_read_ack

| Artifact | Ack |
|----------|-----|
| QA FAIL `docs/qa/evidence/po-hrm-ui-dialog-center-01.md` § QA retest | DEF-DIALOG-CENTER-CSS-OVERRIDE — `.xevn-dialog-surface { position:relative; overflow:hidden }` overrode Tailwind `fixed` / `overflow-y-auto` |
| `apps/web/hrm/src/components/ui/dialog.tsx` | Content keeps `fixed inset-0 m-auto h-fit max-h-[90vh] overflow-y-auto` |
| `apps/web/hrm/src/index.css` + `apps/web/web-portal/src/index.css` | Surface chrome lockstep (parent portal CSS) |
| must_keep | DialogHeader glass/wordmark · Escape/close · portal a11y · JobPostings mutate · LOGO-02 white pad untouched |

## Root cause (confirmed)

`.xevn-dialog-surface` lived in `@layer utilities` **after** Tailwind utilities and set unconditional `position: relative` + `overflow: hidden`. In CC embed, Dialog portals to **parent** document → portal CSS won → `getComputedStyle(position) === 'relative'` despite class `fixed` → panel flowed below fold (`y≈900` on `vh=900`).

## Fix (minimal)

Chrome-only base surface; scope geometry to non-fixed consumers:

```css
.xevn-dialog-surface { /* border / radius / shadow / color only */ }
.xevn-dialog-surface:not(.fixed) {
  position: relative;
  overflow: hidden;
}
/* ::before 4px brand bar unchanged — absolute vs fixed DialogContent containing block */
```

Applied in **both** HRM and web-portal `index.css` (parent CSS is what CC embed sees).

**do_not_touch:** portal login LOGO-02.

## Files

- `apps/web/hrm/src/index.css`
- `apps/web/web-portal/src/index.css`
- `apps/web/hrm/src/components/ui/dialog.tsx` (@CODE-MEMORY-CHANGE)
- `apps/web/hrm/src/components/ui/alert-dialog.tsx` (@CODE-MEMORY-CHANGE)
- `apps/web/hrm/src/lib/hrmDialogPortal.ts` (@CODE-MEMORY + CHANGE)
- `apps/web/hrm/src/components/ui/dialogCenter.source.test.ts` (R2 CSS locks)

## Verify (dev)

```bash
cd apps/web/hrm && pnpm exec vitest run src/components/ui/dialogCenter.source.test.ts src/lib/hrmDialogPortal.test.ts
# 13/13 PASS

node scripts/qa/_tmp-po-hrm-ui-dialog-center-01-r2.mjs
# exit 0 · verdict PASS
```

### Browser probe (CC embed `:5173`)

| Check | Result |
|-------|--------|
| Jobs tab → **Tạo tin tuyển dụng mới** | PASS |
| computed `position` | **`fixed`** (was `relative`) |
| computed `overflowY` | **`auto`** (was `hidden`) |
| bbox | `x=260, y=45, w=920, h=810` on 1440×900 |
| vCenterDelta | **0** (topGap=bottomGap=45) |
| scroll inside | scrollHeight 1011 > clientHeight 808 |
| Escape | PASS (closes) |

Screenshot: `docs/qa/evidence/screens/po-hrm-ui-dialog-center-01-r2/01-job-create-dialog.png`  
JSON: `docs/qa/evidence/_tmp-po-hrm-ui-dialog-center-01-r2.json`

## Residual

- None for DEF-DIALOG-CENTER-CSS-OVERRIDE. QA formal U65 retest still owns matrix promote.
- Login/ConfirmDialog cards keep `position:relative` via `:not(.fixed)`.

## next_owner

**qa** — retest create job dialog in `/command-center/hrm/recruitment` — centered + scroll inside + Escape.

---

## QA retest R2 — 2026-08-06

**role:** qa  
**work_item_id:** PO-HRM-UI-DIALOG-CENTER-01-R2  
**ack_status:** **PASS_TO_PM**  
**U65:** browser-only · zero-seed · mutates=0 · portal `:5173` · `ceo@xe.vn` / `Xevn@2026`  
**supersedes FAIL:** `docs/qa/evidence/po-hrm-ui-dialog-center-01.md` (DEF-DIALOG-CENTER-CSS-OVERRIDE)  
**harness:** `node scripts/qa/_tmp-po-hrm-ui-dialog-center-01-r2-qa.mjs` (exit **0**)  
**JSON:** `docs/qa/evidence/_tmp-po-hrm-ui-dialog-center-01-r2-qa.json`  
**out of scope:** LOGO-02 (not retested)

### Matrix (dialog only)

| # | Step | Result |
|---|------|--------|
| 1 | Login → `/command-center/hrm/recruitment` → tab **Tin tuyển dụng** → **Tạo tin tuyển dụng mới** | **PASS** |
| 2 | Dialog **vertically centered** (not y≈vh off-screen) | **PASS** — `vCenterDelta=0`, topGap=bottomGap=45 on vh=900 |
| 3 | Computed `position` is `fixed` (not relative) | **PASS** — `position=fixed` · `overflowY=auto` |
| 4 | Long form scrolls **inside** panel; Save/Cancel reachable | **PASS** — scrollHeight 1011 > clientHeight 808; **Hủy** + **Tạo tin** in viewport after scroll |
| 5 | Escape closes | **PASS** |

### Geometry (Playwright · 1440×900)

| Field | Prior FAIL (R1) | R2 QA observed |
|-------|-----------------|----------------|
| computed `position` | `relative` | **`fixed`** |
| computed `overflowY` | `hidden` | **`auto`** |
| bbox | `y=900` (below fold) | **`y=45`, h=810** in viewport |
| vCenterDelta | 1710 | **0** |

### Screenshots

- `docs/qa/evidence/screens/po-hrm-ui-dialog-center-01-r2/02-qa-job-create-dialog.png` — panel centered under overlay
- `docs/qa/evidence/screens/po-hrm-ui-dialog-center-01-r2/03-qa-dialog-scrolled-actions.png` — Hủy + Tạo tin reachable
- Canonical: `docs/qa/evidence/screens/po-hrm-ui-dialog-center-01-r2/01-job-create-dialog.png`

### Defect closure

| ID | Prior | R2 |
|----|-------|-----|
| DEF-DIALOG-CENTER-CSS-OVERRIDE | P0 OPEN | **CLOSED** |

### Locks

face_live=false · remaster_program_done=false · no seed · creative_extra none · mutates=0

### Residual

- None for dialog-center wave. Not claiming remaster DONE / Face LIVE / LOGO-02.

### next_owner

**pm** — promote R2 PASS; close DEF-DIALOG-CENTER-CSS-OVERRIDE; optional QC only if gate wave needs dialog chrome.
