# PO-MFD-M2-ATT-RECORDS-01 — QA browser fidelity

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-RECORDS-01` |
| **role** | qa |
| **date** | 2026-08-04 |
| **Persona** | `uat.nv0007@xe.vn` / mobile login · `company_id=trsport` |
| **URL** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport` |
| **hdsd_align** | Attendance → ▼ → Bản ghi / FE **Dữ liệu chấm công** (matrix #13 · HRM-AT-02/03) |
| **U65** | zero-seed · browser FE only · no `pnpm seed:*` |
| **U76** | HDSD inventory in evidence · label_drift noted |
| **U87** | menu fidelity surface #13 stamped |
| **L0 entry** | `pnpm run qc:fe-be-health` **PASS** · `qc:dev-stack` HRM+XBOS+portal 200 |
| **L0 exit** | `pnpm run qc:fe-be-health` **PASS** |
| **Probe** | `scripts/qa/_tmp-po-mfd-m2-att-records-01.mjs` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-mfd-m2-att-records-01-browser.json` |
| **Screens** | `docs/qa/evidence/screens/po-mfd-m2-att-records-01/` |
| **commit** | `dc930c5` |
| **ack_status** | **PASS_TO_PM** |
| **uat_done** | `false` — **NOT** Attendance CLOSED |
| **do_not_reopen** | CLOCK-01 R2 GWC · SHEETS-01 GWC · REQUESTS seat separate |

## HDSD inventory (U76)

| hdsd_ref | FE label / control | Result |
|----------|-------------------|--------|
| Matrix #13 «Bản ghi chấm công» | Menuitem **Dữ liệu chấm công** (`attendance.attendanceMenu.records`) | 🟡 `label_drift` — click path OK |
| List title | Heading **Dữ liệu chấm công** | 🟢 visible |
| Filters | Search · date (dd/MM/yyyy) · status · refresh · export | 🟢 toolbar LIVE |
| Row → Sửa (modal) | Dropdown **Sửa** (Pencil) | 🟡 **STUB** — menuitem present, **no** `onClick` / no dialog |
| Row → Xóa | Dropdown **Xóa** → AlertDialog | Present; maps to `PATCH …/status` absent — **not** used as AT-03 PASS (U65 honesty) |
| PATCH status CTA (AT-03) | Edit modal / status control | **STUB** / `EXPECTED_NO_CTA` for mutate seat |

## Click path (U65)

1. Mobile login `uat.nv0007@xe.vn` → inject portal auth (`companyId=trsport`)
2. Goto `/hr/attendance?portal=1&…&companyId=trsport` → **hard reload**
3. Chevron **Chấm công** → menuitem **Dữ liệu chấm công** (`activeAttendanceType=records`)
4. Observe list + Network GET · idle 10s storm check
5. Open first row kebab → **Sửa** → assert modal/dialog
6. PATCH status mutate **only if** edit modal LIVE — else document STUB (no Delete→absent cheat)

## Exit criteria results

| # | Criterion | Result |
|---|-----------|--------|
| 1 | HDSD inventory records list + detail/modal | **PASS** (inventory above; modal = STUB honesty) |
| 2 | List GET 2xx + empty honesty OR rows; no storm | **PASS** — GET **200** `HRM-ATT-200` · **3** rows · storm GET **0**/10s |
| 3 | Open row → modal/detail LIVE | **STUB** — Sửa no dialog (`dialogAfterEdit=false`) |
| 4 | PATCH status CTA LIVE → mutate + FE + F5; else STUB | **STUB** — `patchesFired=0` · no invent mutate |
| 5 | Stamp matrix runtime #13 | **PASS** (LIVE list · STUB edit) |
| 6 | Evidence path | **PASS** (this file) |
| 7 | ack_status + residual ids | **PASS_TO_PM** · see Residuals |
| 8 | uat_done false · NOT Attendance CLOSED | **PASS** |

## Surfaces (LIVE / STUB / BROKEN)

| # | Surface | runtime | Evidence |
|---|---------|---------|----------|
| 13 | Bản ghi / Dữ liệu chấm công list | **LIVE** | Title visible; GET `/api/hrm/attendance/records` **200** `HRM-ATT-200`; `dataRowCount=3`; no Sync ERROR; storm **0**/10s |
| 13b | Empty honesty | **N/A** (rows present) | Rows from prior Clock TXN on `trsport` — not seed this seat |
| 13c | Row → Sửa modal | **STUB** | Menuitem visible; 0 dialogs after click; `AttendanceRecordsTable` Edit `DropdownMenuItem` has no handler |
| 13d | PATCH `/records/:id/status` from UI | **STUB** | Hook `updateRecord` / API `updateAttendanceStatus` exist; **not** wired to Edit CTA; `Attendance.tsx` `openEditAttendanceModal` dead (never called) |

## Network / console (SoT)

| Check | Detail |
|-------|--------|
| GET `/api/hrm/attendance/records?…` | **200** `HRM-ATT-200` · `rowCount=3` |
| PATCH `/attendance/records/:id/status` | **0** calls (no CTA LIVE) |
| Storm 10s after list settle | records GET **0** |
| pageErrors / HTTP ≥500 HRM | none on records path |

## Screenshots

- `01-records-list.png` — list LIVE (3 rows)
- `02-row-menu.png` — kebab · Sửa / Xóa
- `03-after-edit-click.png` — after Sửa (no modal)
- `04-no-patch-cta.png` — STUB honesty

## Residuals

| id | Severity | Owner | Note |
|----|----------|-------|------|
| `R-MFD-M2-ATT-RECORDS-EDIT-STUB` | **P1** | **dev-fe** | Wire «Sửa» → modal → status select → `updateRecord` / `PATCH …/status` 2xx + FE + F5 (AT-03); do not claim Delete→absent as status UX |
| `R-MFD-M2-ATT-RECORDS-LABEL-DRIFT` | P3 OBS | ba/dev-fe | Matrix «Bản ghi chấm công» vs FE «Dữ liệu chấm công» |
| CLOCK GEO-001 CFG OBS | optional OOS | — | Do not reopen CLOCK GWC |
| Face LIVE / uat_done / Attendance CLOSED | Forbidden | — | **not** claimed |

## TC map (executed)

| TC | Verdict |
|----|---------|
| TC-HRM-AT-02-LIST-HP-001 (list 2xx) | **PASS** (NV trsport) |
| TC-HRM-AT-02-LIST-UX-001 (no storm) | **PASS** |
| TC-HRM-AT-02-DETAIL (row → modal) | **FAIL/STUB** — residual EDIT-STUB |
| TC-HRM-AT-03-ACT (PATCH status) | **STUB** — EXPECTED_NO_CTA mutate · residual P1 |

## Handoff

- **completion_report:** Closed **PO-MFD-M2-ATT-RECORDS-01** U65 browser fidelity. L0 PASS entry+exit. #13 list **LIVE** (GET 200 HRM-ATT-200 · 3 rows · storm0). Edit modal / PATCH status **STUB** (honest; residual `R-MFD-M2-ATT-RECORDS-EDIT-STUB` → dev-fe). Label drift P3 OBS. Did **not** reopen CLOCK/SHEETS; did **not** invent Face LIVE / UAT DONE / Attendance CLOSED. `uat_done=false`.
- **ack_status:** `PASS_TO_PM`
- **next_owner:** `qc`
- **evidence_path:** `docs/qa/evidence/po-mfd-m2-att-records-01-qa.md`
- **next_dispatch_prompt:** see below

```text
work_item_id: PO-MFD-M2-ATT-RECORDS-01-QC
from_role: pm
to_role: qc
lane: governance
priority: P1
u65_zero_seed: true

## Entry
QA PASS_TO_PM: docs/qa/evidence/po-mfd-m2-att-records-01-qa.md
Machine JSON: docs/qa/evidence/_tmp-po-mfd-m2-att-records-01-browser.json
Screens: docs/qa/evidence/screens/po-mfd-m2-att-records-01/
Matrix #13 stamped LIVE list · STUB edit in HRM-ATTENDANCE_FIDELITY_MATRIX.md

## Exit
1. Audit Network SoT: GET records 200 HRM-ATT-200 · storm0 · patchesFired=0
2. Accept STUB edit/PATCH as CONDITION (R-MFD-M2-ATT-RECORDS-EDIT-STUB → dev-fe) — not invent AT-03 PASS
3. GO / GWC / NO-GO for records list seat only
4. Do NOT reopen CLOCK/SHEETS; do NOT invent Face LIVE / Attendance CLOSED / uat_done
5. Evidence: docs/qa/evidence/po-mfd-m2-att-records-01-qc.md
6. ack_status PASS_TO_PM

## Forbidden
seed · invent edit modal LIVE · invent PATCH mutate PASS via Delete→absent · Attendance CLOSED
```
