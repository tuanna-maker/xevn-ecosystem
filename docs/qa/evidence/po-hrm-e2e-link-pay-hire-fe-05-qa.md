# Evidence — PO-HRM-E2E-LINK-PAY-HIRE-FE-05-QA

| Field | Value |
|-------|-------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-HIRE-FE-05-QA` |
| from_role | qa |
| to_role | pm |
| ack_status | **`PASS_TO_PM`** |
| verdict | **PASS** |
| date | 2026-08-06 |
| persona / URL | `ceo@xe.vn` / `Xevn@2026` · http://127.0.0.1:5175/hr/payroll?companyId=main |
| u65 | zero-seed · browser-only |
| honesty | `payroll_e2e_ready=false` |
| parent | `PO-HRM-E2E-LINK-PAY-HIRE-FE-05` · closes `R-PAY-HIRE-ELIG-UI-ENABLED-MISMATCH` |
| env | portal=http://127.0.0.1:5175 · hrm=http://127.0.0.1:28001 · commit=dc930c5 |
| machine evidence | `docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-hire-fe-05-qa-browser.json` |
| screenshots | `docs/qa/evidence/screens/po-hrm-e2e-link-pay-hire-fe-05-qa/` |

## L0 stack

| Service | Status |
|---------|--------|
| hrm-api | 200 |
| xbos-api | 200 |
| portal | 200 |

## UF / Journey

| ID | Click path | Result |
|----|------------|--------|
| **UF-HRM-06** / **J-HRM-07** | Login → Tiền lương → Tính lương → draft → Thêm NV | see criteria |

## Acceptance criteria (FE-05-QA dispatch)

| # | Check | Verdict | Notes |
|---|-------|---------|-------|
| 1 | Create/open draft → Thêm NV dialog | PASS | |
| 2 | BE eligible_count=0 → **zero** enabled checkboxes | PASS (0 enabled / 61 disabled — BE eligible_count=0) | QA-05 had 8 enabled — FE-05 fix |
| 3 | Badges NO_CLOSED_SHEET / NOT_FOUND on disabled rows | PASS (NO_CLOSED=53, NOT_FOUND=8, disabled=61) | Vietnamese formatted labels |
| 4a | Month Select «Tháng 6» (FE-04 reg) | PASS (1137ms — Tháng 6) | iframe testid |
| 4b | Auto detail `pay-batch-add-emp-btn` (FE-04 reg) | PASS (auto detail after POST 2xx) | post-create navigation |
| 4c | Enroll POST body NO `company_id` (FE-04 reg) | PASS (API probe 400 HRM-PAY-ENROLL-EMPTY — body { mode } only) | whitelist keys only |
| 5 | GET eligibility not 404 | PASS | scope parity hold |

## Fail-closed audit (dialog)

```json
{
  "eligGets": [
    {
      "method": "GET",
      "status": 200,
      "url": "http://127.0.0.1:5175/api/hrm/payroll/periods/f3866096-b5db-4cc6-9070-e2a5ea6d25b7/eligibility",
      "code": "HRM-PAY-200",
      "message": "Payroll eligibility listed"
    }
  ],
  "lastEligStatus": 200,
  "totalCheckboxes": 61,
  "enabledCount": 0,
  "disabledCount": 61,
  "noClosedBadge": 53,
  "notFoundBadge": 8,
  "errorBanner": false,
  "loadingVisible": false
}
```

## BE eligibility probe

```json
{
  "status": 200,
  "code": "HRM-PAY-200",
  "eligible_count": 0,
  "ineligible_count": 53,
  "notFoundCount": 0,
  "noClosedSheetCount": 53,
  "sampleReasons": [
    {
      "code": "HLD-0001",
      "eligible": false,
      "reasons": [
        "NO_CLOSED_SHEET"
      ]
    },
    {
      "code": "NV002",
      "eligible": false,
      "reasons": [
        "NO_CLOSED_SHEET"
      ]
    },
    {
      "code": "NVN7L5J",
      "eligible": false,
      "reasons": [
        "NO_CLOSED_SHEET"
      ]
    }
  ]
}
```

## Enroll bodies captured

```json
[]
```

## Residuals

- **R-PAY-HIRE-NO-ELIGIBLE-U65** (P1) → pm: U65 zero-seed: AC-PAY-HIRE-04/05 full chain still needs attendance close

## completion_report

- **Closed:** R-PAY-HIRE-ELIG-UI-ENABLED-MISMATCH — fail-closed checkbox gate verified in browser.
- **FE-04 regressions:** month Select, auto detail, enroll body — see criteria 4a–4c.
- **Honesty:** `payroll_e2e_ready=false` unchanged.

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-QC-01
from_role: pm
to_role: qc
read_first: docs/qa/evidence/po-hrm-e2e-link-pay-hire-fe-05-qa.md
entry: FE-05-QA PASS · R-PAY-HIRE-ELIG-UI-ENABLED-MISMATCH closed
exit: GO/GWC · payroll_e2e_ready stays false
```

## ack_status

**`PASS_TO_PM`**