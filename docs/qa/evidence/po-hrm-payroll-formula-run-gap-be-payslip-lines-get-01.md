# Evidence — PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-PAYSLIP-LINES-GET-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-PAYSLIP-LINES-GET-01` |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **date** | 2026-08-07 |
| **priority** | P2 |
| **change_mode** | ADD |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-ATT-LINE-03` GO WITH CONDITIONS · **R-PAY-PAYSLIP-LINES-GET OBS P2 OPEN** |
| **closes** | **R-PAY-PAYSLIP-LINES-GET** (product path shipped — QA confirm) |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · **cấm** claim formula LIVE / Phase1 DONE / module UAT / J-HRM-07 |

---

## 1. spec_read_ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-att-line-03.md` | GWC · OBS R-PAY-PAYSLIP-LINES-GET OPEN |
| 2 | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-cb-bag-01.md` § Payslip lines OBS | PROCESS writes lines · public GET 404 |
| 3 | `docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md` | PROCESS writes `payroll_payslip_lines` · Nest `/payroll` |
| 4 | `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md` **F-PAY-PAYSLIP-01** | **CONFIRMED** GET by id + `components[]` from payslip + lines · 404 scope |
| 5 | Nest `payroll.controller.ts` / `payroll.service.ts` | Prior: list only · no get-by-id |

**Contract decision:** API_DESIGN **already lists** F-PAY-PAYSLIP-01 → **implement** (Nest physical `/api/hrm/payroll/payslips/:id` · paper `/pay/payslips/{id}`). **Not** PASS_TO_SA — F.1 present. Dedicated `/lines` is ADD convenience sharing same scope gate (OBS probe path).

---

## 2. Deliverables (apps)

| Path | Role |
|------|------|
| `apps/api/hrm-api/src/payroll/payroll.service.ts` | **ADD** `buildPayslipScopeFilters` (list↔get parity) · `getPayslipById` · `listPayslipLines` · CODE-MEMORY APPEND |
| `apps/api/hrm-api/src/payroll/payroll.controller.ts` | **ADD** `GET payslips/:payslipId/lines` · `GET payslips/:payslipId` · CODE-MEMORY APPEND |
| `apps/api/hrm-api/src/payroll/dto/get-payroll-payslip.query.dto.ts` | **ADD** `company_id` required (same as list) |
| `apps/api/hrm-api/src/payroll/payroll.service.spec.ts` | **ADD** get+lines happy · 404 scope miss · main workforce scope_parity |
| `apps/api/hrm-api/src/payroll/payroll.controller.spec.ts` | **ADD** F-PAY-PAYSLIP-01 route wire |
| Dist | `pnpm --filter hrm-api build` + `verify-dist` **PASS** |

**Cấm held:** no seed · no flip `payroll_e2e_ready` · no reopen ATT/CB/FE-EVAL · no LIVE / module UAT claim.

---

## 3. Behavior matrix

| METHOD / path | Condition | Result |
|---------------|-----------|--------|
| `GET /payroll/payslips/:id?company_id=` | In list scope | **200** `HRM-PAY-200` · header + `components[]` + `lines[]` (same array) from `payroll_payslip_lines` |
| `GET /payroll/payslips/:id/lines?company_id=` | In list scope | **200** `{ payslip_id, total, data[] }` |
| Either | Out of scope / missing | **404** `HRM-PAY-404` (no leak) |
| Scope | group CEO `company_id=main` | Same workforce `p.employee_id IN` predicate as `listPayslips` (U19) |
| Soft-delete | lines | No archive col — CASCADE with payslip; empty `data[]` = honest empty after process without lines |
| Auth | no JWT / internal key | **401** (existing payroll gate) |

**FE consumer path:** Prefer `GET …/payslips/:id` → bind `components` or `lines`. List tab remains `GET …/payslips` (header amounts only).

---

## 4. Jest evidence

```text
pnpm --filter hrm-api exec jest --testPathPatterns="payroll.service.spec|payroll.controller.spec" --no-coverage
→ Test Suites: 2 passed · Tests: 38 passed
pnpm --filter hrm-api run build (+ verify-dist postbuild)
→ PASS
```

| Case | Result |
|------|--------|
| getPayslipById in-scope → header + 2 lines / components | PASS |
| listPayslipLines → total=2 | PASS |
| getPayslipById out-of-scope member CEO → HRM-PAY-404 | PASS |
| getPayslipById main → workforce filter + 404 empty | PASS |
| Controller get + lines wire HRM-PAY-200 | PASS |

---

## 5. Residual

| ID | Sev | Status | Note |
|----|-----|--------|------|
| **R-PAY-PAYSLIP-LINES-GET** | P2 | **READY_FOR_QA** (shipped) | QA L1 smoke GET by id + lines after PROCESS |
| **`payroll_e2e_ready`** | honesty | **LOCKED false** | Slice ≠ module UAT |
| ATT / CB-BAG / FE-EVAL / EVAL | — | **RETAIN CLOSED** | Do not reopen |
| ESS `GET …/me/payslips/{id}` | P3 | **OUT** this seat | F-PAY-PAYSLIP-01 ESS path not implemented — backlog if browser ESS needs self-only |
| Period nested `GET …/periods/:id/payslips` | P3 | **OUT** | Covered by list `?period_id=` |

---

## completion_report

### Closed
1. Confirmed F-PAY-PAYSLIP-01 in client API_DESIGN → implemented Nest GET (no PASS_TO_SA).  
2. `GET /api/hrm/payroll/payslips/:id` returns header + `components`/`lines` from `payroll_payslip_lines`.  
3. `GET /api/hrm/payroll/payslips/:id/lines` public authenticated lines list.  
4. Scope parity with `listPayslips` (shared filter builder) · 404 scope miss.  
5. Jest 38 PASS · nest build + verify-dist PASS.  
6. Honesty: **`payroll_e2e_ready=false`**.

### Residual
- QA L1 confirm after live PROCESS (optional browser bind later).  
- ESS `/me/payslips/:id` not in this ADD.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-payslip-lines-get-01.md` |
| **ack_status** | **READY_FOR_QA** |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-PAYSLIP-LINES-GET-01
from_role: pm
to_role: qa
lane: execution
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-PAYSLIP-LINES-GET-01 READY_FOR_QA
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
priority: P2
residual_auto_fix: true

## Mission
L1 smoke close R-PAY-PAYSLIP-LINES-GET after BE ADD:
1) Auth as ceo@xe.vn (or same CB-BAG persona)
2) From a processed payslip id (list GET /payroll/payslips?company_id=&period_id=):
   - GET /payroll/payslips/:id?company_id= → 200 HRM-PAY-200 · components/lines present (or honest empty [])
   - GET /payroll/payslips/:id/lines?company_id= → 200 · total matches
3) Scope miss: member CEO / wrong company → 404 HRM-PAY-404
4) Retain ATT/CB/FE-EVAL baselines — do not reopen
cấm: seed · flip payroll_e2e_ready · claim LIVE / module UAT / J-HRM-07

entry_criteria: BE evidence READY_FOR_QA; U65 zero-seed; L0 stack up
exit_criteria: evidence MD + machine; ack PASS_TO_PM or FAIL_TO_PM; honesty payroll_e2e_ready=false
evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-payslip-lines-get-01.md
```
