# Evidence — PO-MFD-M3-EMP-EXPORT-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M3-EMP-EXPORT-01` |
| **role** | qa |
| **date** | 2026-08-04 |
| **startedAt** | `2026-08-04T09:45:20Z` (approx harness) |
| **finishedAt** | `2026-08-04T09:45:42.245Z` |
| **commit** | `dc930c5` |
| **spec_ref** | HDSD CH06 §5.2 · matrix #9 · TC-EMP-X-HP-008+ |
| **hdsd_align** | **true** (U76) |
| **U65** | zero-seed · no `pnpm seed:*` · FE Xuất only · no invent Employees/Attendance CLOSED |
| **matrix** | `HRM-EMPLOYEES_FIDELITY_MATRIX.md` surface **#9** |
| **runtime_json** | `docs/qa/evidence/_tmp-po-mfd-m3-emp-export-01-browser.json` |
| **harness** | `scripts/qa/_tmp-po-mfd-m3-emp-export-01.mjs` |
| **screens** | `docs/qa/evidence/screens/po-mfd-m3-emp-export-01/` |
| **ack_status** | **PASS_TO_PM** |
| **Employees CLOSED** | **false** |
| **Attendance CLOSED** | **false** |
| **uat_done** | **false** |
| **verdict** | **PASS** (honesty seat — stamp remains PARTIAL) |
| **#9 stamp** | **PARTIAL** + **SPEC_GAP** |

## L0 `qc:fe-be-health`

| Checkpoint | Result |
|------------|--------|
| Entry (harness probe) | hrm/xbos/portal **200** |
| Exit (post-browser + full gate) | **ALL PASS** |

## Persona / URL

| Field | Value |
|-------|--------|
| Account | `ceo@xe.vn` / `Xevn@2026` |
| Scope | `tenantId=xevn` · `companyId=main` |
| URL | `http://127.0.0.1:5173/hr/employees?portal=1&tenantId=xevn&companyId=main` |
| Login | portal proxy login OK |

## Click path (HDSD CH06 §5.2)

1. List baseline → total **60** · GET employees **200** `HRM-EMP-200`
2. **Xuất** → dialog «Xuất danh sách nhân viên»
3. Assert filters (phòng ban / trạng thái) · **17** column checkboxes · Excel (.xlsx) + CSV (.csv)
4. Count UI: **Số nhân viên sẽ xuất: 60**
5. Click **Xuất** → browser download `danh_sach_nhan_vien_2026-08-04.xlsx` · **0** `POST /spreadsheet/export` from FE
6. must_keep **#19**: list → detail `0f6e1369-…` → Đào tạo → GET training **200** · pageErrors **0**

## Nest honesty probe (API-only · not UF LIVE claim)

| Field | Value |
|-------|--------|
| Request | `POST /api/hrm/spreadsheet/export` `{ kind: employee_export, format: csv, filter.company_id: main }` |
| HTTP | **201** · `text/csv` · disposition `employees_export.csv` |
| Header | `employee_code,email,full_name,job_title_key,status,hired_at` |
| Body | **header-only** · lineCount=1 · byteLength=60 · **0 data rows** |
| FE list | **60** NV visible / export count 60 |
| Conclusion | Nest endpoint exists but **empty payload on main**; FE does **not** call it |

## Honesty matrix (FE vs Nest)

| Dimension | FE `EmployeeExportDialog` | Nest `exportEmployeesCsv` | Verdict |
|-----------|---------------------------|---------------------------|---------|
| Wire | Client `XLSX.writeFile` from `listAllEmployees` | `POST …/spreadsheet/export` | **SPEC_GAP** — FE never calls Nest |
| Format | xlsx + csv radios | **csv-only** DTO | **SPEC_GAP** |
| Columns | 17 selectable (salary/bank/…) | Fixed 6 cols | **SPEC_GAP** |
| Depth | cursor walk full list | service `page_size: 100` hard | **SPEC_GAP** |
| Runtime data | download xlsx · count 60 | **0 rows** on main | **SPEC_GAP / depth defect** |

## hdsd_inventory (U76)

| HDSD surface | Attempted | Result |
|--------------|-----------|--------|
| CH06 §2 list baseline | yes | GET **200** total **60** |
| CH06 §5.2 Xuất dialog open | yes | Title + filters LIVE |
| CH06 §5.2 columns / format | yes | 17 checkboxes · xlsx+csv |
| CH06 §5.2 client export download | yes | xlsx download · Nest calls from browser **0** |
| Nest export depth (honesty) | yes (API probe) | **201** header-only · not wired from FE |
| must_keep #19 Training | yes | GET **200** · pageErrors **0** |

## AC matrix

| # | AC | Verdict |
|---|-----|---------|
| 1 | L0 fe-be health entry+exit | 🟢 PASS |
| 2 | Xuất dialog opens (HDSD) | 🟢 PASS |
| 3 | Columns + xlsx/csv visible | 🟢 PASS |
| 4 | Client export download | 🟢 PASS |
| 5 | Honesty: FE does not call Nest export | 🟢 PASS (documented) |
| 6 | Nest API exists (probe) | 🟢 PASS (201) |
| 7 | Nest depth / row parity vs FE | 🔴 SPEC_GAP (0 rows vs 60) |
| 8 | must_keep #19 Training LIVE | 🟢 PASS |
| 9 | 0 emp mutates · U65 no seed | 🟢 PASS |
| 10 | Employees CLOSED not claimed | 🟢 PASS |

## Matrix stamp (this seat)

| Surface # | Prior | After EXPORT-01 | Evidence |
|-----------|-------|-----------------|----------|
| **9** DLG-EXPORT | PARTIAL | **PARTIAL** + SPEC_GAP | Client dialog LIVE; Nest wire+depth+empty rows OPEN |
| **19** TRAINING | LIVE | **LIVE** must_keep | spot retest no crash |
| **1–8, 10–12, 28** | LIVE | **must_keep** | list/import/detail/scope not regressed this seat |

**SPEC_GAP owners**

| Gap | Owner | Next work_item hint |
|-----|-------|---------------------|
| Wire FE Xuất → Nest export (or BA confirm client SoT) | **dev-fe** (+ ba-process if SoT) | `PO-MFD-M3-EMP-EXPORT-WIRE-01` |
| Nest empty rows on `company_id=main` + page_size 100 + csv-only | **dev-be** | `PO-MFD-M3-EMP-EXPORT-NEST-01` |

## Network proof (excerpt)

| Step | Request | Status |
|------|---------|--------|
| List | `GET /api/hrm/employees?company_id=main…` | **200** total **60** |
| Nest probe | `POST /api/hrm/spreadsheet/export` | **201** csv header-only |
| FE Xuất click | `POST /spreadsheet/export` | **0 calls** |
| Emp mutate | POST/PATCH/DELETE employees | **0** |
| Training | `GET …/training` | **200** |

## Screens

| File | Content |
|------|---------|
| `01-list-baseline.png` | List employees |
| `02-export-dialog.png` | Xuất columns/format |
| `03-after-client-export.png` | After client download |
| `04-training-spot.png` | must_keep #19 |

## Defects / residuals

| ID | Severity | Status | Note |
|----|----------|--------|------|
| R-MFD-M3-EMP-EXPORT-NEST-WIRE | P1 | OPEN | FE client-only; Nest unused |
| R-MFD-M3-EMP-EXPORT-NEST-EMPTY | P1 | OPEN | Nest 201 but 0 data rows vs FE 60 |
| R-MFD-M3-EMP-EXPORT-NEST-DEPTH | P2 | OPEN | Nest hard `page_size:100`; csv-only; fixed cols |
| #18 Job | P2 | OPEN | out of this seat |
| Employees CLOSED | — | **false** | do not invent |

## completion_report

**Closed:** `PO-MFD-M3-EMP-EXPORT-01` honesty seat — browser Xuất dialog columns/format/download LIVE; Nest probe documented; **#9 kept PARTIAL + SPEC_GAP** (owners **dev-fe** wire / **dev-be** Nest empty+depth). must_keep **#19 LIVE**. L0 entry+exit PASS. **0** seed · **0** emp mutates · Attendance Face not touched.

**Residual / not claimed:** Employees menu **not** CLOSED; `#9` not LIVE; Nest wire + empty export rows OPEN; `#18` Job PARTIAL untouched.

## Handoff

- **next_owner:** pm
- **ack_status:** PASS_TO_PM
- **evidence_path:** `docs/qa/evidence/po-mfd-m3-emp-export-01.md`

### next_dispatch_prompt

```text
work_item_id: PO-MFD-M3-EMP-EXPORT-WIRE-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P1
u65_zero_seed: true

#9 Xuất remains PARTIAL (PO-MFD-M3-EMP-EXPORT-01).
FE EmployeeExportDialog = client XLSX only; Nest POST /api/hrm/spreadsheet/export unused.
Also Nest probe on company_id=main returned 201 header-only (0 rows) while FE list=60 — parallel dispatch dev-be PO-MFD-M3-EMP-EXPORT-NEST-01.

entry_criteria: evidence docs/qa/evidence/po-mfd-m3-emp-export-01.md · must_keep #19 LIVE · SPEC_GAP owners set
exit_criteria: either wire FE→Nest with parity (format/cols/depth) OR BA confirm client SoT + honesty label; Nest empty-rows fixed if Nest is SoT; READY_FOR_QA
cấm: invent Employees CLOSED · seed · Attendance Face
```
