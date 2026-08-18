# Evidence — PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-02

| Field | Value |
|-------|-------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-02` |
| from_role | qa |
| to_role | pm |
| ack_status | **`FAIL_TO_PM`** |
| verdict | **FAIL** — att→pay link partial: J-HRM-06c + BE eligibility PASS; AC-PAY-HIRE-04/05 blocked by payroll list nav |
| date | 2026-08-06 |
| persona / URL | `ceo@xe.vn` / `Xevn@2026` · http://127.0.0.1:5175/hr · `company_id=main` |
| u65 | zero-seed · browser-only · cấm seed / `payroll_e2e_ready=true` |
| honesty | `payroll_e2e_ready=false` |
| parent | `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-FE-01` + `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-BE-01` |
| env | portal=http://127.0.0.1:5175 · hrm=http://127.0.0.1:28001 · xbos=http://127.0.0.1:28002 · commit=dc930c5 |
| machine | `docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-att-close-qa-02-browser.json` |
| screenshots | `docs/qa/evidence/screens/po-hrm-e2e-link-pay-att-close-qa-02/` |

## L0 stack — PASS

| Service | Status |
|---------|--------|
| hrm-api | 200 |
| xbos-api | 200 |
| portal | 200 |

## Executive summary

U65 browser retest after **FE-01** (auto-navigate + submit→sign panel) and **BE-01** (same-month + OU scope for `NO_CLOSED_SHEET`):

1. **Attendance (J-HRM-06c) — PASS:** Opened Jan 2026 draft sheet `a5c698e5…` via `att-sheet-row-*` testid → `data-active-sheet-id` matched → **POST submit 201** → **3× POST signatures 201** → **POST close 201** → API `status=closed` → F5 persists closed.
2. **Payroll eligibility (BE-01) — PASS (API):** For period `dffbb1fe…` (VN Tháng 1/2026, `start_date=2025-12-31T17:00:00.000Z` — same UTC month as closed sheet), **GET eligibility 200 · `eligible_count=53`**. Wrong period `f3866096…` (Feb VN / Jan UTC mismatch) correctly stays **`eligible_count=0`**.
3. **AC-PAY-HIRE-04/05 — FAIL:** FE could not open Jan payroll draft detail (`pay-batch-add-emp-btn` not visible). Default list filter = **Tháng 8/2026** hides Jan rows; month combobox + row click timeout in harness. Enroll + F5 **not executed** on UI.

**Honesty:** `payroll_e2e_ready=false` — att close unblocks eligibility at API layer but full hire chain not proven in browser.

## UF / Journey

| ID | Click path | Result |
|----|------------|--------|
| **J-HRM-06c** | Chấm công → Bảng chấm công → mở Jan sheet → Gửi chờ ký → ký NV/QL/HCNS → Chốt → F5 | **PASS** |
| **UF-HRM-06** | Tiền lương → Tháng 1/2026 draft → Thêm NV | **PARTIAL** — API eligible 53; FE detail not opened |
| **AC-PAY-HIRE-04** | Enroll POST 2xx from FE | **FAIL** — detail nav blocked |
| **AC-PAY-HIRE-05** | F5 after enroll | **NOT RUN** |

## Acceptance criteria

| AC / Check | Verdict | Notes |
|------------|---------|-------|
| Create/open Jan 2026 → `data-active-sheet-id` = sheet id | **PASS** | Run B: `a5c698e5…` match after `att-sheet-row-*` click |
| Submit → 3× sign → close 201 | **PASS** | Network: submit 201, signatures 201×3, close 201 |
| Payroll same-month eligibility `≥ 1` | **PASS** | API `dffbb1fe…` → 53 eligible after Jan sheet closed |
| **AC-PAY-HIRE-04** enroll 2xx | **FAIL** | `pay-batch-add-emp-btn` unreachable |
| **AC-PAY-HIRE-05** F5 persistence | **NOT RUN** | No enroll 2xx |
| `payroll_e2e_ready` | **false** | |

## FE click path — attendance (PASS run)

| # | Step | Detail |
|---|------|--------|
| 1 | S0 | Login inject → `/hr/attendance` |
| 2 | S1 | Menu **Bảng chấm công** |
| 3 | S4-open | Click `[data-testid="att-sheet-row-a5c698e5…"]` |
| 4 | S5-submit | **att-sheet-submit** → POST submit **201** |
| 5 | S-sign ×3 | **att-sign-confirm-employee** / **direct_manager** / **hr_admin** → POST signatures **201×3** |
| 6 | S6-close | **att-sign-close-sheet** → POST close **201** |
| 7 | S7-f5 | F5 → sheet still **closed** |

## Attendance phase (captured)

```json
{
  "activeSheetId": "a5c698e5-221a-4d29-a5ac-ab81f35a3996",
  "dataActiveSheetId": "a5c698e5-221a-4d29-a5ac-ab81f35a3996",
  "activeSheetIdMatch": true,
  "holdDraftVisible": true,
  "submitPost2xx": 1,
  "signPanelVisible": true,
  "signaturesPost2xx": 3,
  "closePost2xx": 1,
  "statusBefore": "draft",
  "statusAfter": "closed",
  "closedOk": true
}
```

## Payroll phase

```json
{
  "targetPeriodId": "dffbb1fe-05b7-4f6e-91f1-0a6c6e739ad8",
  "targetPeriodLabel": "QA-PAY-HIRE-05-1786012354925",
  "targetPeriodStart": "2025-12-31T17:00:00.000Z",
  "eligibilityApi": { "status": 200, "eligible_count": 53, "ineligible_count": 0 },
  "detailOpen": false,
  "addEmpMissing": true,
  "enrollSkipped": "R-PAY-PERIOD-ROW-NAV — list defaults Tháng 8/2026"
}
```

### BE-01 same-month gate (API corroboration)

| Period | `start_date` (UTC) | VN month | After Jan sheet closed | `eligible_count` |
|--------|---------------------|----------|------------------------|------------------|
| `dffbb1fe…` | 2025-12-31T17:00Z | **1/2026** | matches sheet month | **53** |
| `f3866096…` | 2026-01-31T17:00Z | 2/2026 | different month | **0** (NO_CLOSED_SHEET) |

Closed sheet: `a5c698e5…` · `company_id=holding` · `start_date=2025-12-31T17:00:00.000Z` · `status=closed`.

## Network — attendance close chain

| Method | URL pattern | Status |
|--------|-------------|--------|
| POST | `…/attendance-sheets/a5c698e5…/submit` | **201** |
| POST | `…/attendance-sheets/a5c698e5…/signatures` | **201 ×3** |
| POST | `…/attendance-sheets/a5c698e5…/close` | **201** |
| GET | `…/attendance-sheets/a5c698e5…` after F5 | **200** · `status=closed` |

## Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-PAY-PERIOD-ROW-NAV** | P1 | dev-fe | Payroll list defaults to current month (8/2026); Jan draft not visible without filter; row→detail timeout; blocks AC-04/05 |
| **R-PAY-PERIOD-PICKER-UX** | P2 | dev-fe | QA harness: month combobox selector fragile — consider `data-testid` on period filter |

## Promoted / not promoted

| Item | Status |
|------|--------|
| FE-01 submit→sign→close on Jan sheet | **Promoted** 🟢 J-HRM-06c |
| BE-01 same-month eligibility gate | **Promoted** 🟢 API |
| AC-PAY-HIRE-04/05 browser | **Not promoted** |
| `payroll_e2e_ready` | **false** |

## completion_report

- **Closed:** L0 PASS; U65 browser att chain Jan 2026 submit→3×sign→close 201; `data-active-sheet-id` assert PASS; BE-01 eligibility 53 on matching period after close.
- **Not closed:** FE payroll list→detail→enroll→F5 (AC-PAY-HIRE-04/05).
- **Honesty:** `payroll_e2e_ready=false`.

## next_owner

`dev-fe`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-FE-02
from_role: pm
to_role: dev-fe
lane: execution
parent: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-02 FAIL_TO_PM

read_first:
- docs/qa/evidence/po-hrm-e2e-link-pay-att-close-qa-02.md
- apps/web/hrm/src/components/payroll/PayrollBatchesTab.tsx

entry_criteria:
- J-HRM-06c + BE eligibility PASS (API eligible_count=53 on dffbb1fe period)
- AC-PAY-HIRE-04/05 FAIL: pay-batch-add-emp-btn not reachable — list filter hides Tháng 1/2026

task:
1) Add data-testid on payroll period month filter + batch row (pay-batch-row-{id})
2) Deep-link or persist month filter when navigating from att close context
3) Ensure list row click opens detail with pay-batch-add-emp-btn for Jan 2026 draft

allowed_paths: apps/web/hrm/src/components/payroll/PayrollBatchesTab.tsx
must_keep: U65 no seed; BE-01 eligibility logic unchanged
exit: READY_FOR_QA → retest PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-03 (enroll + F5)
```

## ack_status

**`FAIL_TO_PM`**
