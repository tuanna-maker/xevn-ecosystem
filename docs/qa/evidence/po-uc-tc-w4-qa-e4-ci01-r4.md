# PO-UC-TC-W4-QA-E4-CI01-R4 — HRM-CI-01 CC iframe create (U65)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-E4-CI01-R4` |
| **uc_id** | `HRM-CI-01` |
| **date** | 2026-08-04 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · company `main` |
| **u65_zero_seed** | **true** — no `pnpm seed:*`, no API-create to fake UF |
| **hdsd_align** | **true** — login UI → menu **Hợp đồng** → iframe **Thêm** → **Lưu** → F5 |
| **surface** | **CC iframe only** — `command-center/hrm/contracts` · **no** navigate to top-level `/hr` |
| **ports** | portal `http://127.0.0.1:5173` · xbos `:28002` · hrm `:28001` |
| **seat_verdict** | **PASS** |
| **ack_status** | **PASS_TO_PM** |
| **uat_done** | **false** (Phase1 / UAT DONE **not claimed**) |
| **harness** | `scripts/qa/_tmp-po-uc-tc-w4-qa-e4-ci01-r4.mjs` |
| **raw_json** | `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-e4-ci01-r4.json` |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e4-ci01-r4/` |
| **fe_fix_ref** | `docs/qa/evidence/po-uc-tc-w4-dev-fe-ci01-iframe-01.md` |

---

## L0

| Service | Result |
|---------|--------|
| hrm-api `:28001` | **200** |
| xbos-api `:28002` | **200** |
| portal `:5173` | **200** |

Login UI: **201** `XBOS-AUTH-200` → `/command-center`.

---

## HDSD inventory (used)

| # | Surface / control | Notes |
|---|-------------------|--------|
| 1 | Portal login `ceo@xe.vn` | Clear storage → fill → Đăng nhập |
| 2 | Sidebar **Hợp đồng** | Lands `command-center/hrm/contracts` (iframe `/hr/contracts?portal=1…`) |
| 3 | `hdsd-contracts-create-btn` | Click **inside iframe** |
| 4 | Dialog | `page.getByTestId('hdsd-contracts-form-dialog')` on **parent** + iframe latch `hdsd-contracts-form-dialog-open` |
| 5 | `hdsd-contracts-form-submit` | Lưu → POST 201 |
| 6 | F5 + search | By API `contract_code` |

---

## Click path (executed)

1. UI login `ceo@xe.vn` → Command Center  
2. Menu **Hợp đồng** → `command-center/hrm/contracts` · iframe GET **200** `HRM-CON-200`  
3. Click `hdsd-contracts-create-btn` **in iframe**  
4. Dialog assert (TECHSPEC §4.1 parent portal):
   - `parentDlg=true` (`hdsd-contracts-form-dialog` on **page**)
   - `latch=true` / `latchCount=1` (`hdsd-contracts-form-dialog-open` in iframe)
   - `iframeDlgCount=0` — **not** treated as FAIL (R3 false-negative class closed)
5. Form ready · code `HD-388XZ` · **Lưu** on CC shell  
6. Network **POST** `/api/hrm/contracts-insurance/contracts` → **201** `HRM-CON-201` · id `04191837-2624-46bf-aa52-ced64e1671df` · `contract_code=HD-388XZ`  
7. FE sau 2xx: toast **Thêm hợp đồng thành công** (screen `05-after-save.png`) · tab **Tất cả (12)** · row `HD-388XZ`  
8. **F5** → search/list by API code `HD-388XZ` → **present** (screen `06-f5.png`)  
9. Page URL remained `command-center/hrm/contracts` throughout (`no_hr_fallback: true`)

---

## Case matrix (P0 this seat)

| TC-ID | Result | Evidence |
|-------|--------|----------|
| TC-HRM-CI-01-OPEN-HP-001 | 🟢 | menu → list `HRM-CON-200` |
| TC-HRM-CI-01-OPEN (Thêm on CC iframe) | 🟢 | parent dialog + latch · `iframeDlgCount=0` OK |
| TC-HRM-CI-01-MAIN-HP-002 | 🟢 | POST **201** `HRM-CON-201` from iframe surface |
| TC-HRM-CI-01-FE-HP-004 | 🟢 | toast + count/list · F5 by API `HD-388XZ` |
| TC-HRM-CI-01-VAL-FD-001 | ⚪ not re-run | Prior E4 🟢 |

---

## Residuals

| id | Sev | Status |
|----|-----|--------|
| ~~R-W4E4-CI01-IFRAME-DIALOG~~ | P0 | **CLOSED** — parent portal dialog + latch PASS on CC iframe |
| ~~R-W4E4-CI01-CODE-DISPLAY~~ | P1 | **CLOSED** — F5 search by Nest `contract_code` finds row |
| Leave L2 / DEPT VAL | — | **untouched** (out of scope) |

**Open for PM:** none from this seat. `uat_done` remains **false**.

---

## Promoted / not promoted

| Item | Status |
|------|--------|
| HDSD CC iframe Thêm → parent dialog → Lưu → POST 201 | **promoted** |
| F5 by API `contract_code` | **promoted** |
| Phase1 / UAT DONE | **not claimed** |
| Leave L2 · DEPT VAL | **untouched** |

---

## Screens (key)

| File | Meaning |
|------|---------|
| `01-after-login.png` | CC after UI login |
| `02-contracts-list.png` | Contracts list in CC iframe |
| `03-iframe-after-create-click.png` | «Thêm hợp đồng mới» over CC · code `HD-388XZ` |
| `04-form-filled.png` | Form ready before Lưu |
| `05-after-save.png` | Toast success · row `HD-388XZ` · Tất cả (12) |
| `06-f5.png` | F5 · `HD-388XZ` still on list |

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QA-E4-CI01-R4
uc_id: HRM-CI-01
seat_verdict: PASS
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e4-ci01-r4.md
uat_done: false
seed_used: false
phase1_done_claimed: false
no_hr_fallback: true
next_owner: pm
```

### next_dispatch_prompt (copy-ready)

```
work_item_id: PO-UC-TC-W4-QA-E4-CI01-R4-INTAKE
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
u65_zero_seed: true

INTAKE CI01-R4 PASS (CC iframe only):
- OPEN dialog: parent hdsd-contracts-form-dialog + iframe latch; iframeDlgCount=0 OK (TECHSPEC §4.1)
- MAIN: POST 201 HRM-CON-201 contract_code=HD-388XZ from command-center/hrm/contracts
- FE+F5: toast + row; search HD-388XZ PASS
- residuals R-W4E4-CI01-IFRAME-DIALOG + CODE-DISPLAY CLOSED
- uat_done false · Leave L2 / DEPT VAL untouched
evidence: docs/qa/evidence/po-uc-tc-w4-qa-e4-ci01-r4.md
by-uc: docs/qa/professional/by-uc/HRM-CI-01.md
next: PM update E4 rollup / matrix; optional QC if gate wave; do not claim UAT DONE
```
