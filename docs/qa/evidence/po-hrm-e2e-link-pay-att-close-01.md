# Evidence — PO-HRM-E2E-LINK-PAY-ATT-CLOSE-01

| Field | Value |
|-------|-------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-01` |
| from_role | qa |
| to_role | pm |
| ack_status | **`FAIL_TO_PM`** |
| verdict | **FAIL** — attendance close for payroll month incomplete · AC-PAY-HIRE-04/05 not achieved |
| date | 2026-08-06 |
| persona / URL | `ceo@xe.vn` / `Xevn@2026` · http://127.0.0.1:5175/hr · `company_id=main` |
| u65 | zero-seed · browser-only · cấm seed / API fake close / `payroll_e2e_ready=true` |
| honesty | `payroll_e2e_ready=false` |
| parent | `PO-HRM-E2E-LINK-PAY-HIRE-QA-05` · residual `R-PAY-HIRE-NO-ELIGIBLE-U65` |
| env | portal=http://127.0.0.1:5175 · hrm=http://127.0.0.1:28001 · commit=dc930c5 |
| machine | `docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-att-close-01-browser.json` |
| screenshots | `docs/qa/evidence/screens/po-hrm-e2e-link-pay-att-close-01/` |

## L0 stack — PASS

| Service | Status |
|---------|--------|
| hrm-api | 200 |
| xbos-api | 200 |
| portal | 200 |

## UF / Journey

| ID | Click path | Result |
|----|------------|--------|
| **J-HRM-06c** | Chấm công → Bảng chấm công → ký NV/QL/HCNS → **Chốt** → F5 | **PARTIAL** — close proven on *non-payroll-month* submitted sheet (run A); Jan 2026 sheet stuck `draft` (run B) |
| **UF-HRM-06** / hire link | Tiền lương → Tháng 1/2026 draft → Thêm NV | **FAIL** — `eligible_count=0` · all `NO_CLOSED_SHEET` |
| **AC-PAY-HIRE-04** | Enroll 2xx after eligibility | **FAIL** — no eligible NV |
| **AC-PAY-HIRE-05** | F5 after enroll | **NOT RUN** |

## Executive summary

U65 browser executed **two harness passes** (same script, improved between runs):

1. **Run A (partial J-HRM-06c):** Opened submitted sheet `ae71f0b0…` → FE clicks `att-sign-confirm-employee` / `direct_manager` / `hr_admin` → **POST close 201** → API `status=closed`. Sheet period = **Sept 2026**, **not** payroll target Tháng 1/2026.
2. **Run B (payroll-month attempt):** No Jan sheet existed → **FE create** `QA-ATT-CLOSE-PAY-*` (**POST 201**, id `a5c698e5…`, dates 01/01–28/01/2026) → opened wrong list row → sign panel visible but **close disabled** (`missing_mandatory_roles`: employee, direct_manager, hr_admin) → sheet remains **`draft`**.

Post-test API (Jan payroll period `dffbb1fe…` / QA-PAY-HIRE-05):

| Probe | Result |
|-------|--------|
| GET eligibility | **200** · `eligible_count=0` · `ineligible_count=53` · sample reason **`NO_CLOSED_SHEET`** |
| Jan attendance sheet `a5c698e5…` | **`draft`** — never submitted/signed/closed |

**Conclusion:** Product can close *a* sheet from FE when `submitted` + sign ladder (run A), but **payroll hire chain remains blocked** because no **Jan 2026 closed sheet** exists under U65. AC-PAY-HIRE-04/05 cannot pass without Dev fix on submit→sign→close for newly created payroll-month sheet.

## Acceptance criteria

| AC / Check | Verdict | Notes |
|------------|---------|-------|
| Attendance close for **payroll month** (Jan 2026) from FE | **FAIL** | Sheet created `draft`; close not reached |
| J-HRM-06c sign+close (any month) | **PARTIAL** | Run A: 3× POST signatures 201 + POST close 201 on Sept sheet |
| Payroll `eligible_count ≥ 1` | **FAIL** | API + FE: 0 eligible / 53 ineligible |
| **AC-PAY-HIRE-04** enroll 2xx | **FAIL** | Blocked — no eligible NV |
| **AC-PAY-HIRE-05** F5 persistence | **NOT RUN** | No enroll 2xx |
| `payroll_e2e_ready` | **false** | Unchanged |

## FE click path (run B — final)

| # | Step | Detail |
|---|------|--------|
| 1 | S0 | Login inject → `/hr/attendance` |
| 2 | S1 | Menu **Bảng chấm công** |
| 3 | S2-create | **att-sheets-add** — no Jan sheet in list |
| 4 | S3-create | Dialog fill name + dates 01/01–28/01/2026 → Lưu → **POST 201** |
| 5 | S4-open | Open list row (fallback first row — **wrong sheet**) |
| 6 | P0 | `/hr/payroll` |
| 7 | P1 | Tab **Tính lương** |
| 8 | P2–P3 | Attempt open Jan draft `QA-PAY-FE05-*` — row click timeout |
| 9 | P4 | **Thêm nhân viên** blocked — `pay-batch-add-emp-btn` not visible |

## Run A highlights (J-HRM-06c partial — captured in first JSON snapshot)

| Network | Status |
|---------|--------|
| POST …/signatures (×3) | **201** |
| POST …/close | **201** |
| GET sheet after | `status=closed` |

Sheet: `ae71f0b0…` · `QA-BP-ATT-SIGN-DRAFT-SUBMIT-01` · period Sept 2026.

## Attendance phase (run B JSON)

```json
{
  "pickReason": "no_payroll_month_sheet",
  "createPost2xx": true,
  "activeSheetId": "a5c698e5-221a-4d29-a5ac-ab81f35a3996",
  "statusBefore": "draft",
  "statusAfter": "draft",
  "signPanelVisible": true,
  "signaturesPost2xx": 0,
  "closeEnabled": false,
  "missingRoles": ["employee", "direct_manager", "hr_admin"]
}
```

## Payroll phase

```json
{
  "targetPeriodId": "f3866096-b5db-4cc6-9070-e2a5ea6d25b7",
  "targetPeriodLabel": "QA-PAY-FE05-1786012680812",
  "detailOpen": false,
  "eligibleCount": 0,
  "enrollSkipped": "eligible_count=0 after att close attempt"
}
```

API corroboration (Jan payroll `dffbb1fe…`): eligibility **200**, `eligible_count=0`, reasons **`NO_CLOSED_SHEET`**.

## Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-ATT-SHEET-SUBMIT-SIGN-GAP** | P0 | dev-fe | Jan sheet FE-created (`draft`) — **att-sheet-submit** + sign ladder not completed on correct row; close disabled |
| **R-PAY-ATT-MONTH-LINK** | P0 | dev-be | Payroll gate checks **matching closed timesheet month** — closing Sept sheet does not unblock Jan payroll |
| **R-PAY-HIRE-NO-ELIGIBLE-U65** | P1 | pm | Carried from QA-05 — still open after this wave |
| **R-PAY-PERIOD-ROW-NAV** | P1 | dev-fe | Payroll list row click timeout — could not open draft detail for Thêm NV |

## completion_report

- **Closed:** L0 PASS; U65 browser harness executed; J-HRM-06c **partially** demonstrated (close on submitted sheet, wrong month).
- **Closed:** FE create Jan 2026 attendance sheet without seed (**POST 201**).
- **Not closed:** Submit → sign → close for **payroll-matching month**; payroll `eligible_count ≥ 1`; AC-PAY-HIRE-04/05.
- **Honesty:** `payroll_e2e_ready=false`.

## next_owner

`dev-fe` (primary) + `dev-be` (month linkage)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-FE-01
from_role: pm
to_role: dev-fe
lane: execution
parent: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-01 FAIL_TO_PM

read_first:
- docs/qa/evidence/po-hrm-e2e-link-pay-att-close-01.md
- docs/qa/evidence/po-hrm-bp-att-sign-uf-ba-01.md (UF S0–S8)
- apps/web/hrm/src/components/attendance/AttendanceSheetSignPanel.tsx

entry_criteria:
- QA FAIL: Jan sheet a5c698e5 stuck draft; submit/sign/close not reachable from FE on created row
- Run A proved sign+close works on submitted sheet — gap is submit + row navigation for new sheet

task:
1) After att-sheets-add create for payroll month: auto-navigate to new sheet id (not first list row)
2) Ensure att-sheet-submit visible on draft → POST submit → submitted → sign panel confirm buttons enable
3) Regression: list row deep-link preserves company_id=main

allowed_paths: apps/web/hrm/src/pages/Attendance.tsx, apps/web/hrm/src/components/attendance/AttendanceSheetSignPanel.tsx
must_keep: U65 no seed; att-sign-close-sheet testid; scope main
exit: READY_FOR_QA → retest PO-HRM-E2E-LINK-PAY-ATT-CLOSE-01

parallel BE if month evaluator gap:
work_item_id: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-BE-01
to_role: dev-be
task: verify payroll eligibility NO_CLOSED_SHEET uses same month/company scope as closed attendance sheet (Jan 2026)
spec_ref: FR-UC-BP-ATT-11 · BR-BP-TS-02 · hire-employee-link pay gate
```

## ack_status

**`FAIL_TO_PM`**
