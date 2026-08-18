# Evidence — PO-HRM-UI-PORTAL-LOGIN-LOGO-02

**work_item_id:** PO-HRM-UI-PORTAL-LOGIN-LOGO-02  
**role:** qa (retest after READY_FOR_QA)  
**date:** 2026-08-06  
**change_mode:** FIX  
**ack_status:** **FAIL_TO_PM** (wave = LOGO-02 + DIALOG-CENTER retest; logo AC PASS, dialog regression FAIL)  
**U65:** browser-only · zero-seed · mutates=0 · face_live=false · remaster_program_done=false  
**sponsor_literal:** «Logo nền trắng» (+ prior «logo to» size keep)  
**env:** portal `http://127.0.0.1:5173` · account `ceo@xe.vn` · L0 portal/hrm/xbos **200**

## FE READY (prior)

See Dev section below (retained). QA executed Playwright U65 harness:

`node scripts/qa/_tmp-po-hrm-ui-login-logo-dialog-center-qa.mjs`  
JSON: `docs/qa/evidence/_tmp-po-hrm-ui-login-logo-dialog-center-qa.json`

---

## QA matrix (U65 browser) — 2026-08-06

| # | AC | Result | Evidence |
|---|-----|--------|----------|
| 1 | `/login` `portal-login-mark` ≈112px AND pad/background **WHITE** (not black) | **PASS** | height **100.8px** (attrH=112, class `h-28`/`7rem` floor); `backgroundColor=rgb(255,255,255)`; class `bg-white` **no** `bg-black` |
| 2 | Card wordmark pad white if visible | **PASS** | `portal-login-card-wordmark` class `!bg-white`; computed `rgb(255,255,255)` |
| 3 | Login works | **PASS** | POST `/api/xbos/auth/login` **201** → `/command-center` |
| 4 | After login → recruitment create job modal **vertically centered** (DIALOG-CENTER-01 regression) | **FAIL** | Overlay visible; dialog panel **off-screen** (`boundingBox.y=900` on vh=900); see dialog evidence |

### Screenshots

| File | What |
|------|------|
| `docs/qa/evidence/screens/po-hrm-ui-login-logo-dialog-center-01/01-login-mark-white-pad-112.png` | Full `/login` — hero mark on **white** pad |
| `docs/qa/evidence/screens/po-hrm-ui-login-logo-dialog-center-01/01b-login-mark-crop.png` | Crop of mark — white pad confirmed |
| `docs/qa/evidence/screens/po-hrm-ui-login-logo-dialog-center-01/02-after-login.png` | Post-login Command Center |
| `docs/qa/evidence/screens/po-hrm-ui-login-logo-dialog-center-01/03-recruitment-shell.png` | CC HRM recruitment shell |
| `docs/qa/evidence/screens/po-hrm-ui-login-logo-dialog-center-01/04-job-create-dialog.png` | Jobs tab + dim overlay — **dialog panel not in viewport** |

### Click path (item 4)

1. Login `ceo@xe.vn` / `Xevn@2026` on `:5173/login`
2. Goto `/command-center/hrm/recruitment?companyId=main&tenantId=xevn`
3. Tab **Tin tuyển dụng** → **+ Tạo tin tuyển dụng**
4. Assert dialog vertically centered — **FAIL** (panel below viewport; Escape still closes)

### Root cause (dialog FAIL — for Dev-FE)

`apps/web/hrm/src/index.css` `.xevn-dialog-surface { position: relative; overflow: hidden; }` **overrides** DialogContent Tailwind `fixed` + `overflow-y-auto`. Computed: `position: relative`, `overflowY: hidden` despite classes `fixed inset-0 m-auto … overflow-y-auto`. Panel flows to document bottom → `top≈vh` → invisible under overlay.

### LOGO-02 scope honesty

| Claim | Status |
|-------|--------|
| Sponsor white pad CORRECTION | **CLOSED (PASS)** |
| Size ~112 kept | **PASS** |
| face_live | false (unchanged) |
| remaster_program_done | false (unchanged) |
| Wave exit (incl. DIALOG-CENTER retest) | **FAIL** — do not promote dialog |

---

## Dev READY_FOR_QA (retained)

**role:** dev-fe  
**ack_status:** READY_FOR_QA (superseded by QA FAIL_TO_PM for wave)

### Closed (FE)

- Hero `portal-login-mark`: `bg-black` → **`bg-white`**; size **kept** `h-28` / attrs 112 / CSS floor 7rem.
- CSS `.xevn-login-mark`: belt `background-color: var(--xevn-color-surface, #ffffff)`.
- Card `portal-login-card-wordmark`: **`!bg-white`**.

### Files

- `apps/web/web-portal/src/pages/auth/LoginPage.tsx`
- `apps/web/web-portal/src/index.css`

## Residual

- **P0:** PO-HRM-UI-DIALOG-CENTER-01 — CSS `position:relative` / `overflow:hidden` on `.xevn-dialog-surface` breaks viewport center (see `po-hrm-ui-dialog-center-01.md` retest).
- Logo pad color: none. `remaster_program_done=false`.

## completion_report

- **Closed:** LOGO-02 visual ACs 1–3 (white pad ~112, card wordmark white, login 201).
- **Open / FAIL:** DIALOG-CENTER retest AC4 — create job modal not visible/centered; CSS override confirmed.
- **Locks honored:** U65 zero-seed · no invent · face_live=false · remaster_program_done=false · mutates=0.

**next_owner:** `dev-fe`  
**ack_status:** **FAIL_TO_PM**
