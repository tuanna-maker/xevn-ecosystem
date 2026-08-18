# PO-UC-TC-W4-QA-E4-CI01-R3 — HRM-CI-01 MAIN/FE retest (U65)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-E4-CI01-R3` |
| **uc_id** | `HRM-CI-01` |
| **date** | 2026-08-04 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · company `main` |
| **u65_zero_seed** | **true** — no `pnpm seed:*`, no API-create to fake UF |
| **hdsd_align** | **true** — login UI → menu **Hợp đồng** → **Thêm hợp đồng** → **Lưu** |
| **ports** | portal `http://127.0.0.1:5173` · xbos `:28002` · hrm `:28001` |
| **seat_verdict** | **FAIL** (HDSD iframe CTA) · mutate API **proven** on `/hr/contracts` |
| **ack_status** | **FAIL_TO_PM** |
| **uat_done** | **false** |
| **phase1_done** | **not claimed** |
| **harness** | `scripts/qa/_tmp-po-uc-tc-w4-qa-e4-ci01-r3.mjs` |
| **raw_json** | `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-e4-ci01-r3.json` |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e4-ci01-r3/` |

---

## L0

| Service | Result |
|---------|--------|
| hrm-api `:28001` | **200** |
| xbos-api `:28002` | **200** (flaky mid-session: `dist/main` missing / process death — rebuilt webpack dist; retest under green L0) |
| portal `:5173` | **200** |

Login UI: **201** `XBOS-AUTH-200` → `/command-center`.

---

## HDSD inventory (used)

| # | Surface / control | Notes |
|---|-------------------|--------|
| 1 | Portal login `ceo@xe.vn` | Clear storage → fill → Đăng nhập |
| 2 | Sidebar / nav **Hợp đồng** | Lands `command-center/hrm/contracts` (iframe → `/hr/contracts?portal=1…`) |
| 3 | `data-testid=hdsd-contracts-create-btn` · **+ Thêm hợp đồng** | Visible in iframe |
| 4 | Dialog `hdsd-contracts-form-dialog` · submit `hdsd-contracts-form-submit` | Opens on **direct** `/hr/contracts` only |
| 5 | List after 2xx + F5 | Toast + count; row by employee name |

---

## Click path (executed)

1. UI login `ceo@xe.vn` → Command Center  
2. Open HRM → click **Hợp đồng** → iframe `/hr/contracts` · GET **200** `HRM-CON-200`  
3. Click **Thêm hợp đồng** **inside CC iframe** → **dialog does not open** (P0)  
4. Same session → top-level `/hr/contracts?portal=1&tenantId=xevn&companyId=main` → **Thêm** → dialog **Thêm hợp đồng mới** · `hdsd-contracts-form-ready`  
5. **Lưu** → Network **POST** `/api/hrm/contracts-insurance/contracts` → **201** `HRM-CON-201` · id `e919267c-3d81-4bfa-b1d5-0b86353b86d2` · `contract_code=HD-29LK5`  
6. FE sau 2xx: toast **Thêm hợp đồng thành công** · tab **Tất cả** count **9→11** (screenshot `05-after-save.png`)  
7. F5: search by API code `HD-29LK5` empty (FE `mapApiContract` overwrites display code with `{employee_code}-HD`); search/list by employee fragment **W4E3E1V7HA** → **present** (`_tmp-ci01-r3-verify-f5b.json`)

---

## Case matrix (P0 this seat)

| TC-ID | Result | Evidence |
|-------|--------|----------|
| TC-HRM-CI-01-OPEN-HP-001 | 🟢 list via menu | `HRM-CON-200` · OPEN_LIST PASS |
| TC-HRM-CI-01-OPEN (Thêm on CC iframe) | 🔴 | OPEN_DIALOG_IFRAME FAIL |
| TC-HRM-CI-01-MAIN-HP-002 | 🟢 on `/hr` surface | POST **201** `HRM-CON-201` |
| TC-HRM-CI-01-FE-HP-004 | 🟡/🟢 | Toast+count 🟢 · F5 by API code 🔴 · F5 by employee name 🟢 |
| TC-HRM-CI-01-VAL-FD-001 | ⚪ not re-run | Prior E4 🟢 |

---

## Residuals

| id | Sev | Owner | Note |
|----|-----|-------|------|
| **R-W4E4-CI01-IFRAME-DIALOG** | **P0** | **dev-fe** | `command-center/hrm/contracts` iframe: `hdsd-contracts-create-btn` click is no-op (0 dialog / 0 radix portal). Direct `/hr/contracts` opens dialog. Blocks true HDSD menu→Thêm path. |
| **R-W4E4-CI01-CODE-DISPLAY** | **P1** | **dev-fe** | `useContracts.mapApiContract` ignores API/`POST` `contract_code`; UI shows `{employee_code}-HD`. Search by created `HD-*` fails after F5 though row exists under employee name. |
| ~~R-W4E4-CI01-MUTATE-INCOMPLETE~~ | — | — | **Superseded** for API create: POST **201** evidenced this R3 (still not HDSD-complete while iframe P0 open). |

---

## Promoted / not promoted

| Item | Status |
|------|--------|
| Login + menu Hợp đồng + list GET | **promoted** |
| Create mutate POST 201 + toast/count (direct `/hr`) | **promoted** as API/FE mutate evidence — **not** full HDSD UF |
| HDSD CC iframe **Thêm hợp đồng** | **not promoted** |
| Phase1 / UAT DONE | **not claimed** |
| Leave L2 | **untouched** |

---

## Screens (key)

| File | Meaning |
|------|---------|
| `01-after-login.png` | CC after UI login |
| `02-contracts-list.png` | Contracts list loaded |
| `03a-iframe-after-create-click.png` | Iframe after Thêm — no dialog |
| `03-dialog-open.png` / `04-form-filled.png` | Direct `/hr` create dialog |
| `05-after-save.png` | Toast success · count 11 · **Đang lưu** cleared |
| `06-f5.png` | F5 + search `HD-29LK5` empty (code-display residual) |

---

## Handoff

```
ack_status: FAIL_TO_PM
work_item_id: PO-UC-TC-W4-QA-E4-CI01-R3
uc_id: HRM-CI-01
seat_verdict: FAIL
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e4-ci01-r3.md
uat_done: false
seed_used: false
phase1_done_claimed: false
next_owner: pm
pm_dispatch_hint: dev-fe R-W4E4-CI01-IFRAME-DIALOG (P0) then qa retest HDSD iframe Thêm→Lưu→F5; optional P1 mapApiContract contract_code display
```
