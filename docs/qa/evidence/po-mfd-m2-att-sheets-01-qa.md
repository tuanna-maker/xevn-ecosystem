# PO-MFD-M2-ATT-SHEETS-01 — QA browser fidelity

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-SHEETS-01` |
| **role** | qa |
| **date** | 2026-08-04 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **URL** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **hdsd_align** | Attendance → Bảng công / sheets (matrix #11–12 · HRM-AT-14) |
| **U65** | zero-seed · browser FE mutate only · no `pnpm seed:*` |
| **L0 entry** | `pnpm run qc:fe-be-health` **PASS** |
| **L0 exit** | `pnpm run qc:fe-be-health` **PASS** |
| **Probe** | `scripts/qa/_tmp-po-mfd-m2-att-sheets-01.mjs` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-mfd-m2-att-sheets-01-browser.json` |
| **Screens** | `docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/` |
| **commit** | `dc930c5` |
| **ack_status** | **PASS_TO_PM** |
| **uat_done** | `false` — **NOT** Attendance CLOSED |

## Click path (U65 · HDSD)

1. Login API → inject portal auth (`companyId=main`)
2. Goto `/hr/attendance?portal=1&…&companyId=main` → **hard reload**
3. Chevron **Chấm công** → menuitem **Bảng chấm công** (`activeAttendanceType=sheets`)
4. Observe list empty honesty + Network GET · idle 10s storm check
5. **+ Thêm** → modal **Thêm bảng chấm công chi tiết** → kỳ `01/07/2026`–`31/07/2026` · Công chuẩn theo tháng → **Lưu**
6. Assert row before F5 → **F5** → reopen sheets → row còn
7. Click sheet name → weekly grid (empty/data honesty · no Sync ERROR)
8. Goto `/hr/payroll` → **Dữ liệu tính lương** → **Chấm công** → same sheet period SoT

## Exit criteria results

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Login ceo@ · Attendance embed main | **PASS** |
| 2 | Navigate Bảng công / sheets (#11–12) | **PASS** |
| 3 | Document LIVE vs STUB vs BROKEN | **PASS** — see surfaces below |
| 4 | Product gap → residual + FAIL/PARTIAL | **OBS only** — no P0 sheet gap; P2 payroll i18n CTA |
| 5 | Evidence path | **PASS** (this file) |
| 6 | Matrix runtime stamps #11–12 | **PASS** (updated) |
| 7 | ack_status | **PASS_TO_PM** |
| 8 | uat_done false · NOT Attendance CLOSED | **PASS** |

## Surfaces (LIVE / STUB / BROKEN)

| # | Surface | runtime | Evidence |
|---|---------|---------|----------|
| 11 | Bảng chấm công list | **LIVE** | Title «Bảng chấm công chi tiết»; GET `attendance-sheets` **200** `HRM-AS-200`; no Sync ERROR; storm GET sheets **0**/10s after settle |
| 11b | Empty honesty (pre-create) | **LIVE** | First probe: `total`/hint **0** · empty copy «Chưa có bảng chấm công nào. Nhấn "Thêm" để tạo mới.» · **not** fake rows (U65) |
| 12 | Thêm bảng modal + create | **LIVE** | Modal Lưu/Hủy + Công chuẩn tháng; POST **201** `HRM-AS-201` (ids `642a4713-…` first seat · `3934591a-…` confirm seat); toast «Đã tạo bảng chấm công mới»; row `QA-SHEET-MFD-M2 01/07/2026-31/07/2026` · period `01/07/2026 - 31/07/2026` |
| 12b | F5 persist | **LIVE** | Row còn sau reload + reopen sheets |
| grid | Open sheet → weekly | **LIVE** | Weekly shell; GET records **200**; no ERROR banner; spinner storm=0; empty grid OK (BR-ATT-SHEET-06) |
| payroll | Period SoT binding | **LIVE** | Payroll → Dữ liệu tính lương → Chấm công: same sheet name + period; GET sheets **200** `HRM-AS-200` |

## Network / console (SoT)

| Check | Detail |
|-------|--------|
| GET `/api/hrm/attendance/attendance-sheets?company_id=main` | **200** `HRM-AS-200` |
| POST `/api/hrm/attendance/attendance-sheets` | **201** `HRM-AS-201` (create seat) |
| GET records (grid) | **200** (period query) |
| Storm 10s after list settle | sheets GET **0** · records GET **0** |
| pageErrors / HTTP ≥500 HRM | none on sheets path |

## Screenshots

- `01-sheets-list.png` — list LIVE (+ row after create)
- `02-add-sheet-modal.png` — create modal
- `03-add-sheet-filled.png` — July 2026 + standard type
- `04-after-create.png` — toast success + row
- `05-after-f5.png` — persist
- `06-sheet-grid.png` — weekly open
- `07-payroll-period.png` — Payroll Dữ liệu→Chấm công same period SoT

## Residuals

| id | Severity | Owner | Note |
|----|----------|-------|------|
| `R-MFD-M2-ATT-SHEETS-PAYROLL-I18N` | P2 OBS | dev-fe | PayrollAttendanceTab CTA shows raw key `common.addNew` (not blocking AC-ATT-SHEET) |
| Columns HARDCODED / CFG columns | P1 backlog | ba/dev (P1-6) | Out of this seat — ADR residual; not invent PASS columns mutate |
| `uat_done` / Attendance CLOSED | Forbidden | — | **false** |

## TC map (executed)

| TC | Verdict |
|----|---------|
| TC-HRM-AT-14-SHEET-OPEN-HP-001 | PASS |
| TC-HRM-AT-14-SHEET-ACT-HP-001 | PASS (POST 201 + F5) |
| TC-HRM-AT-14-SHEET-GRID-HP-001 | PASS (empty OK) |
| TC-HRM-AT-14-SHEET-GRID-UX-001 | PASS (no storm) |
| Payroll period SoT (consumer) | PASS (shared `useAttendanceSheets`) |

## Handoff

- **completion_report:** Closed **PO-MFD-M2-ATT-SHEETS-01** browser fidelity. L0 PASS entry+exit. #11 list LIVE (empty honesty pre-create · GET 200 HRM-AS-200 · no storm). #12 create LIVE (POST 201 HRM-AS-201 · F5 persist · period 01–31/07/2026). Grid LIVE. Payroll Dữ liệu→Chấm công shows same sheet/period SoT LIVE. Residual P2 payroll `common.addNew` i18n only. **uat_done false**. OT R2 / NT-02 FCM not in seat.
- **ack_status:** `PASS_TO_PM`
- **next_owner:** `qc`
- **evidence_path:** `docs/qa/evidence/po-mfd-m2-att-sheets-01-qa.md`
- **next_dispatch_prompt:** see below

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-MFD-M2-ATT-SHEETS-01-QC
from_role: pm
to_role: qc
lane: governance
priority: P0
u65_zero_seed: true

entry_criteria:
- QA PASS_TO_PM: docs/qa/evidence/po-mfd-m2-att-sheets-01-qa.md
- Machine JSON: docs/qa/evidence/_tmp-po-mfd-m2-att-sheets-01-browser.json
- Screens: docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/01..07.png
- Create Network (create seat): POST 201 HRM-AS-201 · GET list 200 HRM-AS-200

exit_criteria:
1. Audit #11 LIVE list + empty honesty + no GET storm; #12 LIVE create/F5; payroll period SoT LIVE
2. GO / GO WITH CONDITIONS / NO-GO — do not invent Attendance CLOSED / uat_done
3. Columns HARDCODED + payroll common.addNew = OBS/CONDITION only if no sheet AC regression
4. evidence_path: docs/qa/evidence/po-mfd-m2-att-sheets-01-qc.md
ack_status: PASS_TO_PM
```
