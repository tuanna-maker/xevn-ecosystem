# Evidence — PO-HRM-UI-PORTAL-LOGIN-LOGO-01

**work_item_id:** PO-HRM-UI-PORTAL-LOGIN-LOGO-01  
**role:** dev-fe  
**date:** 2026-08-06  
**change_mode:** FIX  
**ack_status:** READY_FOR_QA  
**U65:** no seed · face_live=false · remaster_program_done=false

## spec_read_ack

| Artifact | Ack |
|----------|-----|
| `apps/web/web-portal/src/pages/auth/LoginPage.tsx` @CODE-MEMORY | W4-PORT-LOGIN two-pane neo · AuthContext.login must_keep |
| `apps/web/web-portal/src/index.css` `.xevn-login-*` | brandShell hero left · ops panel right |
| ADR Precision Motion §9 / ui-neo login | brand-first left pane |

## Closed

- Hero mark `portal-login-mark`: **56px (`h-14`) → 112px (`h-28` / 7rem)** — width/height attrs 112; rounded-[14px].
- CSS `.xevn-login-mark` size floor 7rem (belt with Tailwind classes).
- Card wordmark `portal-login-card-wordmark`: 32 → 40px (`h-10 w-10`) — slight weight bump, still subordinate to hero.
- Kept: `src="/xevn-logo.png"`, testIDs `portal-login-mark` / `portal-login-wordmark`, AuthContext.login + redirect.

## Files

- `apps/web/web-portal/src/pages/auth/LoginPage.tsx` (+ @CODE-MEMORY-CHANGE APPEND)
- `apps/web/web-portal/src/index.css` (+ @CODE-MEMORY-CHANGE APPEND)

## QA manual (U65 browser)

1. Open `/login` (portal).
2. Assert left hero mark visibly large (~112px), brand-first without nav.
3. Assert wordmark `XeVN` + subcopy still sharp; login card CTA works (no auth break).

## Residual

- None for logo size. Full remaster program still `remaster_program_done=false`.

---

## QA verdict — 2026-08-06 (U65 browser-only)

**role:** qa  
**ack_status:** **PASS** (this work item)  
**combined_wave:** FAIL_TO_PM (sibling `PO-HRM-UI-DIALOG-CENTER-01` FAIL — see that evidence)  
**env:** portal `http://127.0.0.1:5173` · hrm-api `:28001` · xbos-api `:28002` · `ceo@xe.vn`  
**harness:** `scripts/qa/_tmp-po-hrm-ui-login-logo-dialog-center-qa.mjs`  
**machine JSON:** `docs/qa/evidence/_tmp-po-hrm-ui-login-logo-dialog-center-qa.json`  
**seed:** false · **mutates:** 0 · face_live=false · remaster_program_done=false

### Matrix

| # | AC | Result | Evidence |
|---|----|--------|----------|
| 1 | `/login` `portal-login-mark` large (~112 / h-28), not 56px | **PASS** | attr 112×112 · class `h-28 w-28` · computed **100.8×100.8** (≈7rem @ densified root; clearly ≠56) |
| 1b | Login still works (FE type credentials) | **PASS** | POST `/auth/login` **201** → `/command-center` |

### Screenshots

- `docs/qa/evidence/screens/po-hrm-ui-login-logo-dialog-center-01/01-login-mark-112.png`
- `docs/qa/evidence/screens/po-hrm-ui-login-logo-dialog-center-01/02-after-login.png`

### Notes

- Visual: left hero mark brand-first, clearly larger than card wordmark.
- Computed ~101px vs attr 112 is rem-root density (not regression to `h-14` / 56px).
- White pad on mark observed in runtime (`bg-white`) — consistent with sponsor pad note; not in scope of this size AC.

### Residual (logo)

- None for size AC.
