# Evidence — PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-03

| Field | Value |
|-------|-------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-03` |
| from_role | qa |
| to_role | pm |
| ack_status | **`PASS_TO_PM`** |
| verdict | **PASS** |
| date | 2026-08-06 |
| persona / URL | `ceo@xe.vn` / `Xevn@2026` · http://127.0.0.1:5173/hr · `company_id=main` |
| u65 | zero-seed · browser-only · cấm seed / `payroll_e2e_ready=true` trừ AC-04∧AC-05 |
| honesty | `payroll_e2e_ready=true` |
| parent | `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-FE-02` READY_FOR_QA |
| env | portal=http://127.0.0.1:5173 · hrm=http://127.0.0.1:28001 · xbos=http://127.0.0.1:28002 · commit=dc930c5 |
| machine | `docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-att-close-qa-03-browser.json` |
| screenshots | `docs/qa/evidence/screens/po-hrm-e2e-link-pay-att-close-qa-03/` |

## L0 stack

| Service | Status |
|---------|--------|
| hrm-api | 200 |
| xbos-api | 200 |
| portal | 200 |

## Executive summary

U65 browser QA-03 after **FE-02** closed **R-PAY-PERIOD-ROW-NAV**. Portal live = **`:5173`** (entry `:5175` down; L0 accepted 5173 candidate). **Path A** deep-link opened Jan 2026 draft `dffbb1fe…` with **`pay-batch-add-emp-btn`** visible (Path B not required). Eligibility API **53**. Enroll **POST 201** body `{mode, employee_ids}` only → FE shows **UAT-0100** / count=1 → **F5** persists. Honesty **`payroll_e2e_ready=true`**. Module UAT **DENIED**.

## UF / Journey

| ID | Click path | Result |
|----|------------|--------|
| **Path A** | `/hr/payroll?pay_period_month=1&pay_period_year=2026&pay_batch_id=dffbb1fe…` → detail + add-emp | **PASS** |
| **Path B** | filter option-1-2026 → row | **NOT RUN** (Path A sufficient) |
| **UF-HRM-06** | Tiền lương → Tháng 1/2026 → Thêm NV | **PASS** |
| **J-HRM-06c** (precondition) | Jan att close from QA-02 | **PASS** (prior; not re-run) |
| **AC-PAY-HIRE-04** | Enroll POST 2xx (body mode+employee_ids) | **PASS** |
| **AC-PAY-HIRE-05** | F5 emp persists | **PASS** |

## FE after 2xx + F5 (sponsor AC)

| Checkpoint | Evidence |
|------------|----------|
| Trước enroll | Empty table «Chưa có nhân viên…»; count=0 · `01-path-a-landing.png` |
| Action | Thêm nhân viên → tick eligible (53 enabled) → **Thêm 1 nhân viên** |
| Network | POST `…/periods/dffbb1fe…/enroll` → **201** · body `{"mode":"explicit","employee_ids":["0500220b-…"]}` · **no company_id** |
| FE sau 2xx | Toast «Đã thêm nhân viên vào bảng lương»; row **UAT-0100**; **Số nhân viên = 1** · `06-after-enroll-click.png` |
| F5 | Detail still draft 01/2026; **UAT-0100** still present; count=1 · `08-after-f5.png` |

## Acceptance criteria

| AC / Check | Verdict | Notes |
|------------|---------|-------|
| L0 stack | PASS | |
| Path A deep-link OR Path B filter+row → `pay-batch-add-emp-btn` | PASS | used=A |
| API eligibility `eligible_count≥1` (precondition) | PASS | 53 |
| **AC-PAY-HIRE-04** enroll 2xx + body whitelist | PASS | |
| **AC-PAY-HIRE-05** F5 persistence | PASS | |
| `payroll_e2e_ready` | **true** | true only if AC-04∧AC-05 |

## FE click path

1. **PathA** — deep-link month=1 year=2026 batch=dffbb1fe-05b7-4f6e-91f1-0a6c6e739ad8
2. **AC04** — Thêm nhân viên → select eligible → enroll POST
3. **AC05** — F5 persistence

## Path A / B detail

```json
{
  "used": "A",
  "A": {
    "url": {
      "href": "http://127.0.0.1:5173/hr/payroll?pay_period_month=1&pay_period_year=2026&pay_batch_id=dffbb1fe-05b7-4f6e-91f1-0a6c6e739ad8&portal=1&tenantId=xevn&companyId=main",
      "pay_period_month": "1",
      "pay_period_year": "2026",
      "pay_batch_id": "dffbb1fe-05b7-4f6e-91f1-0a6c6e739ad8"
    },
    "addEmpVisible": true,
    "filterText": "",
    "monthOk": true
  },
  "B": {}
}
```

## Payroll / enroll phase

```json
{
  "eligibilityApi": {
    "status": 200,
    "eligible_count": 53,
    "ineligible_count": 0,
    "code": "HRM-PAY-200"
  },
  "detailOpen": true,
  "enabledCheckboxCount": 53,
  "selectedRowSnippet": "",
  "enrollPosts": [
    {
      "method": "POST",
      "status": 201,
      "url": "http://127.0.0.1:5173/api/hrm/payroll/periods/dffbb1fe-05b7-4f6e-91f1-0a6c6e739ad8/enroll"
    }
  ],
  "enrollBody": {
    "url": "http://127.0.0.1:5173/api/hrm/payroll/periods/dffbb1fe-05b7-4f6e-91f1-0a6c6e739ad8/enroll",
    "keys": [
      "employee_ids",
      "mode"
    ],
    "hasCompanyId": false,
    "mode": "explicit",
    "employee_ids_len": 1,
    "bodySnippet": "{\"mode\":\"explicit\",\"employee_ids\":[\"0500220b-f289-40df-b07e-86316285439b\"]}",
    "parseErr": null
  },
  "bodyWhitelistOk": true,
  "feAfter2xx": {
    "emptyRowGone": true,
    "empCountSnippet": "Số nhân viên\n\n1"
  },
  "enroll": {
    "enrolled": true,
    "bodyOk": true,
    "enrollPosts": [
      {
        "method": "POST",
        "status": 201,
        "url": "http://127.0.0.1:5173/api/hrm/payroll/periods/dffbb1fe-05b7-4f6e-91f1-0a6c6e739ad8/enroll"
      }
    ],
    "enrollBody": {
      "url": "http://127.0.0.1:5173/api/hrm/payroll/periods/dffbb1fe-05b7-4f6e-91f1-0a6c6e739ad8/enroll",
      "keys": [
        "employee_ids",
        "mode"
      ],
      "hasCompanyId": false,
      "mode": "explicit",
      "employee_ids_len": 1,
      "bodySnippet": "{\"mode\":\"explicit\",\"employee_ids\":[\"0500220b-f289-40df-b07e-86316285439b\"]}",
      "parseErr": null
    },
    "f5Persist": true,
    "emptyF5": false,
    "rowCount": 1
  }
}
```

## Network — enroll

```json
{
  "enroll": [
    {
      "method": "POST",
      "status": 201,
      "url": "http://127.0.0.1:5173/api/hrm/payroll/periods/dffbb1fe-05b7-4f6e-91f1-0a6c6e739ad8/enroll"
    }
  ],
  "enrollBodies": [
    {
      "url": "http://127.0.0.1:5173/api/hrm/payroll/periods/dffbb1fe-05b7-4f6e-91f1-0a6c6e739ad8/enroll",
      "keys": [
        "employee_ids",
        "mode"
      ],
      "hasCompanyId": false,
      "mode": "explicit",
      "employee_ids_len": 1,
      "bodySnippet": "{\"mode\":\"explicit\",\"employee_ids\":[\"0500220b-f289-40df-b07e-86316285439b\"]}",
      "parseErr": null
    }
  ]
}
```

## Residuals

- none

## Promoted / not promoted

| Item | Status |
|------|--------|
| FE-02 Path A/B nav (R-PAY-PERIOD-ROW-NAV) | **Promoted** 🟢 |
| AC-PAY-HIRE-04 browser enroll | **Promoted** 🟢 |
| AC-PAY-HIRE-05 F5 | **Promoted** 🟢 |
| `payroll_e2e_ready` | **true** |
| Module UAT claim | **DENIED** (slice only) |

## completion_report

- **Closed:** L0 PASS; Path A nav PASS; eligibility API PASS (count=53).
- **AC-PAY-HIRE-04:** PASS; **AC-PAY-HIRE-05:** PASS.
- **Not closed / residual:** none.
- **Honesty:** payroll_e2e_ready=true (true only if AC-04∧AC-05).
- **Denied:** module UAT / production GO.

## next_owner

qc

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QC-01
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-03 PASS_TO_PM
read_first: docs/qa/evidence/po-hrm-e2e-link-pay-att-close-qa-03.md
entry: Path A + AC-PAY-HIRE-04/05 PASS · eligible_count=53 · U65 zero-seed
exit: GO/GWC — slice only; cấm claim module UAT; verify honesty payroll_e2e_ready=true with AC-04∧AC-05 evidence
evidence_path: docs/qa/evidence/po-hrm-e2e-link-pay-att-close-qc-01.md
```

## ack_status

**`PASS_TO_PM`**