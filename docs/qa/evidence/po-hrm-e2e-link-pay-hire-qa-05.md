# Evidence — PO-HRM-E2E-LINK-PAY-HIRE-QA-05

| Field | Value |
|-------|-------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-HIRE-QA-05` |
| from_role | qa |
| to_role | pm |
| ack_status | **`PASS_TO_PM`** |
| verdict | **PASS** (BE-03 scope closed · AC-04/05 WAIVED-U65) |
| date | 2026-08-06 |
| persona / URL | `ceo@xe.vn` / `Xevn@2026` · http://127.0.0.1:5175/hr/payroll?companyId=main |
| u65 | zero-seed · browser-only |
| honesty | `payroll_e2e_ready=false` |
| parent | `PO-HRM-E2E-LINK-PAY-HIRE-BE-03` · supersedes `po-hrm-e2e-link-pay-hire-qa-04.md` |
| env | portal=http://127.0.0.1:5175 · hrm=http://127.0.0.1:28001 · commit=dc930c5 |
| machine evidence | `docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-hire-qa-05-browser.json` |
| screenshots | `docs/qa/evidence/screens/po-hrm-e2e-link-pay-hire-qa-05/` |

## L0 stack — PASS

| Service | Status |
|---------|--------|
| hrm-api | 200 (restarted BE-03 — killed stale :28001 EADDRINUSE) |
| xbos-api | 200 |
| portal | 200 |

## UF / Journey

| ID | Click path | Result |
|----|------------|--------|
| **UF-HRM-06** / **J-HRM-07** | Login → Tiền lương → Tính lương → Lập bảng lương → Thêm NV | **PASS** (scope parity + U65 business codes) |

## Acceptance criteria

| AC / Check | Verdict | Notes |
|------------|---------|-------|
| (1) Create draft → list includes new period | **PASS** | POST 201 HRM-PAY-201 · Tháng 1/2026 · list `company_id=main` includes period `dffbb1fe…` · persisted `company_id=holding` (BE-03) |
| (2) GET eligibility same period id → NOT 404 | **PASS** | GET eligibility **200** HRM-PAY-200 · 0 eligible / 53 ineligible · `reasons[]` includes `NO_CLOSED_SHEET` |
| (3) POST enroll → NOT 404 | **PASS** | POST enroll **400** HRM-PAY-ENROLL-EMPTY (business 4xx OK under U65 — not HRM-PAY-404) |
| **AC-PAY-HIRE-04** enroll 2xx → list updates | **WAIVED-U65** | 0 eligible NV — all `NO_CLOSED_SHEET`; enroll empty expected without attendance close |
| **AC-PAY-HIRE-05** F5 persistence | **NOT RUN** | No enroll 2xx under U65 — blocked by attendance prerequisite |
| Eligibility UI (NO_CLOSED_SHEET badges) | **PASS** | 53 disabled checkboxes + reason badges; no 404 banner |
| **HRM-PAY-ATT-412** process without closed sheet | **PASS** | API POST `/process` → **412** HRM-PAY-ATT-412 (browser Khóa btn skipped — empty draft detail) |
| Network eligibility/enroll not 404 | **PASS** | QA-04 P0 **R-PAY-HIRE-PERIOD-404-SCOPE closed** |
| Month Select «Tháng 6» (FE-04 reg) | **PASS** | 1151ms · testid iframe portal |
| Create → `pay-batch-add-emp-btn` auto detail (FE-04 reg) | **PASS** | Visible after POST 201 without manual row click |
| Enroll POST body NO `company_id` (FE-04 reg) | **PASS** | `{ mode, employee_ids }` only — not HRM-VAL-001 |

## QA-04 / BE-03 scope parity — CLOSED

| QA-04 FAIL | QA-05 |
|------------|-------|
| eligibility/enroll **404** on new period | **PASS** — 200 eligibility · 400 enroll-empty |
| Month combobox timeout | **PASS** (1151ms) |
| addEmpBtn false after create | **PASS** (auto detail) |
| HRM-VAL-001 company_id in enroll body | **PASS** |

## BE-03 verification highlights

- New period id: `dffbb1fe-05b7-4f6e-91f1-0a6c6e739ad8`
- Create under `company_id=main` → DB persist **`holding`** (scope parity create path)
- List filter `company_id=main` resolves holding row (expandPayrollPeriodCompanyIds)
- Process API: **412** `HRM-PAY-ATT-412` — attendance gate reachable (not 404)

## Browser flow (summary)

1. Restarted hrm-api (BE-03 loaded) — prior watch process EADDRINUSE on :28001.
2. Login `ceo@xe.vn` → `/hr/payroll?companyId=main` → batches tab.
3. **Lập bảng lương** → Tháng 6 demo select (PASS) → submit **Tháng 1/2026** → POST **201**.
4. Detail auto-opens → `pay-batch-add-emp-btn` visible.
5. **Thêm nhân viên** → eligibility GET **200** · 53 NV `NO_CLOSED_SHEET` disabled.
6. Selected enabled checkbox (8 shown enabled — see residual) → enroll POST **400** HRM-PAY-ENROLL-EMPTY · body without `company_id`.

## Enroll request body (captured)

```json
{
  "mode": "explicit",
  "employee_ids": ["b632347c-67ab-4a37-9c61-410e41d88e07"]
}
```

`hasCompanyId: false` · keys: `employee_ids`, `mode` only.

## API probe (post-browser)

```json
{
  "listIncludesNewPeriod": true,
  "newPeriodLabel": "QA-PAY-HIRE-05-1786012354925",
  "newPeriodCompanyId": "holding",
  "processStatus": 412,
  "processCode": "HRM-PAY-ATT-412",
  "processMessage": "Attendance sheet must be closed before processing payroll"
}
```

## Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-PAY-HIRE-NO-ELIGIBLE-U65** | P1 | pm | 53/53 NV `NO_CLOSED_SHEET` — AC-04/05 full chain needs attendance close from FE (cross-module, not scope) |
| **R-PAY-HIRE-ELIG-UI-ENABLED-MISMATCH** | P1 | dev-fe | Add dialog showed 8 enabled checkboxes while BE eligibility reports 0 eligible — UI should fail-closed disable all ineligible |
| **R-PAY-HIRE-ATT-412-BROWSER** | P2 | dev-fe | Khóa bảng lương not visible on empty draft detail — ATT-412 proven via API only |

## completion_report

- **Closed:** BE-03 scope parity P0 (`R-PAY-HIRE-PERIOD-404-SCOPE`) — create → list → eligibility → enroll → process all resolve under `company_id=main`; FE-04 regressions hold (month Select, auto detail, enroll body whitelist).
- **Closed:** Dispatch checks 1–3, 5 (API), 6 — all PASS or acceptable U65 business 4xx.
- **Waived:** AC-PAY-HIRE-04/05 — U65 zero-seed, no closed attendance sheet; documented `NO_CLOSED_SHEET` + HRM-PAY-ENROLL-EMPTY.
- **Open:** Full enroll→F5→lock browser chain deferred until attendance close path (P1 cross-module).
- **Honesty:** `payroll_e2e_ready=false` unchanged.

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-QC-01
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-E2E-LINK-PAY-HIRE-QA-05 PASS_TO_PM

read_first:
- docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-05.md
- docs/qa/evidence/po-hrm-e2e-link-pay-hire-be-03.md

entry_criteria:
- QA-05 PASS: BE-03 scope 404 closed; eligibility 200; enroll not 404; ATT-412 via API
- AC-04/05 WAIVED-U65 documented; payroll_e2e_ready=false

task:
- Audit L0–L2.5 for UF-HRM-06 / J-HRM-07 payroll hire slice
- GO or GWC with residuals R-PAY-HIRE-NO-ELIGIBLE-U65, R-PAY-HIRE-ELIG-UI-ENABLED-MISMATCH
- cấm: promote payroll_e2e_ready=true without attendance close evidence

exit: docs/qa/evidence/po-hrm-e2e-link-pay-hire-qc-01.md GO or GWC
```

## ack_status

**`PASS_TO_PM`**
