# Evidence — PO-HRM-E2E-LINK-PAY-HIRE-QA-04

| Field | Value |
|-------|-------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-HIRE-QA-04` |
| from_role | qa |
| to_role | pm |
| ack_status | **`FAIL_TO_PM`** |
| verdict | **FAIL** (FE-04 closed · BE scope 404 open) |
| date | 2026-08-06 |
| persona / URL | `ceo@xe.vn` / `Xevn@2026` · http://127.0.0.1:5175/hr/payroll |
| u65 | zero-seed · browser-only |
| honesty | `payroll_e2e_ready=false` |
| supersedes | `po-hrm-e2e-link-pay-hire-qa-03.md` |
| parent | `PO-HRM-E2E-LINK-PAY-HIRE-FE-04` READY_FOR_QA |
| env | portal=http://127.0.0.1:5175 · hrm=http://127.0.0.1:28001 · commit=dc930c5 |
| machine evidence | `docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-hire-qa-04-browser.json` |
| screenshots | `docs/qa/evidence/screens/po-hrm-e2e-link-pay-hire-qa-04/` |

## L0 stack — PASS

| Service | Status |
|---------|--------|
| hrm-api | 200 |
| xbos-api | 200 |
| portal | 200 |

## UF / Journey

| ID | Click path | Result |
|----|------------|--------|
| **UF-HRM-06** / **J-HRM-07** | Login → Tiền lương → Tính lương → Lập bảng lương → Thêm NV | FE-04 partial · enroll blocked 404 |

## Acceptance criteria

| AC / Check | Verdict | Notes |
|------------|---------|-------|
| Month Select «Tháng 6» (testid, no timeout) | **PASS** | 1137ms · `pay-batch-create-month-option-6` visible (iframe portal) |
| Create draft → `pay-batch-add-emp-btn` visible (auto detail) | **PASS** | POST 201 HRM-PAY-201 · Tháng 7/2026 create · detail auto-open |
| Enroll POST body NO `company_id` | **PASS** | Body `{ mode: "explicit", employee_ids: [...] }` only — **not** HRM-VAL-001 |
| **AC-PAY-HIRE-04** enroll 2xx → list updates | **FAIL** | POST enroll → **404** HRM-PAY-404 (period not found) |
| **AC-PAY-HIRE-05** F5 persistence | **NOT RUN** | Enroll did not 2xx |
| GET eligibility `reasons[]` (BE) on **new** draft | **FAIL** | GET eligibility → **404** HRM-PAY-404 on period `9a5ec612…` |
| GET eligibility (BE) on **existing** draft (API probe) | **PASS** | 200 · 0 eligible / 53 ineligible · `NO_CLOSED_SHEET` |
| Eligibility UI (NO_CLOSED_SHEET badges) | **FAIL** | Eligibility 404 → no badges; add dialog showed 61 enabled checkboxes (unsafe without BE reasons) |
| **HRM-PAY-ATT-412** process without closed sheet | **NOT RUN** | Khóa bảng lương not visible on empty draft detail |
| Network eligibility/enroll not 404 | **FAIL** | 4× GET eligibility 404 + 1× POST enroll 404 on new period |

## QA-03 / FE-04 regressions closed

| QA-03 FAIL | QA-04 |
|------------|-------|
| Month combobox 30s timeout | **CLOSED** — testid Select 1137ms |
| `addEmpBtn` false after create | **CLOSED** — `pay-batch-add-emp-btn` visible after POST 201 |
| HRM-VAL-001 `company_id` in enroll body | **CLOSED** — whitelist body captured; API probe `{ mode: auto_eligible }` → 409 HRM-PAY-003 (not VAL-001) |

## New defect (P0 — scope parity)

After browser **POST /payroll/periods → 201**, subsequent **GET …/eligibility** and **POST …/enroll** for the returned period id `9a5ec612-a4cb-4408-bdd8-f92306bf64f7` return **HRM-PAY-404 Payroll period not found** under `company_id=main` / `ceo@xe.vn`.

Direct HRM probe: list shows only legacy `05/2026 (UAT-MOB-PILOT)` processed — new draft not resolvable by id. Tag: **`scope_parity`** → **dev-be**.

## Browser flow (summary)

1. Login `ceo@xe.vn` → `/hr/payroll` → batches tab visible.
2. **Lập bảng lương** → dialog → select **Tháng 6** via testid (PASS) → submit **Tháng 7/2026** (June overlap HRM-PAY-002 from prior QA runs).
3. POST 201 → detail auto-opens → **`pay-batch-add-emp-btn`** visible (PASS).
4. **Thêm nhân viên** → eligibility GET **404** ×4 → enroll POST **404** (body correct, no `company_id`).
5. API probe on older draft period: eligibility **200**, all NV `NO_CLOSED_SHEET` (U65 data constraint documented).

## Enroll request body (captured)

```json
{
  "mode": "explicit",
  "employee_ids": ["0500220b-f289-40df-b07e-86316285439b"]
}
```

`hasCompanyId: false` · keys: `employee_ids`, `mode` only.

## Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-PAY-HIRE-PERIOD-404-SCOPE** | P0 | dev-be | POST 201 period not found on eligibility/enroll GET-by-id under main scope |
| **R-PAY-HIRE-NO-ELIGIBLE-U65** | P1 | pm | Existing drafts: 53/53 `NO_CLOSED_SHEET` — AC-04 full chain needs attendance close path |
| **R-PAY-HIRE-ELIG-UI-404-FALLBACK** | P1 | dev-fe | Add dialog shows 61 enabled checkboxes when eligibility 404 — should fail-closed |

## completion_report

- **Closed:** All three FE-04 targets from QA-03 — month Select testid (Tháng 6, no timeout), auto detail + `pay-batch-add-emp-btn` after create, enroll POST body whitelist (no `company_id`, not HRM-VAL-001).
- **Open:** Eligibility/enroll **404** on newly created period (scope parity P0); AC-PAY-HIRE-04/05 not promoted; ATT-412 not exercised on new draft.
- **Honesty:** `payroll_e2e_ready=false` unchanged.

## next_owner

`dev-be` (P0 scope 404) → then `qa` retest QA-05

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-BE-03
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-E2E-LINK-PAY-HIRE-QA-04 FAIL_TO_PM

read_first:
- docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-04.md
- docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-hire-qa-04-browser.json

entry_criteria:
- QA-04 browser: POST /payroll/periods 201 under ceo@xe.vn main
- GET /periods/{id}/eligibility and POST /periods/{id}/enroll return HRM-PAY-404

task:
- Fix scope parity: period created via list POST must resolve on get-by-id eligibility/enroll (same scope resolver as list)
- Regression: scope-context.spec / payroll period enroll spec
- must_keep: enroll DTO rejects company_id in body (HRM-VAL-001)

exit_criteria: READY_FOR_QA → PO-HRM-E2E-LINK-PAY-HIRE-QA-05
forbidden: seed; payroll_e2e_ready=true
```

## ack_status

**`FAIL_TO_PM`**
