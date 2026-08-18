# Evidence — PO-HRM-AMIS-PARITY-PAY-ESS-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-ESS-BE-01` |
| **parent** | `PO-HRM-AMIS-PARITY-RESEARCH-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **date** | 2026-08-07 |
| **priority** | P2 |
| **change_mode** | ADD |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · **cấm** claim AMIS parity DONE / module UAT / J-HRM-07 LIVE |

---

## 1. spec_read_ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/qa/evidence/po-hrm-amis-parity-ba-01.md` §2.1 step6 | ESS confirm · partial → GĐ1 minimal |
| 2 | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-payslip-lines-get-01.md` | F-PAY-PAYSLIP-01 GET by id + lines baseline |
| 3 | `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md` **F-PAY-PAYSLIP-01** | ESS `GET …/me/payslips/{id}` · 403 cross-employee · FR-UC-BP-PAY-08 |
| 4 | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` FR-UC-BP-PAY-08 | NV chỉ xem phiếu mình · xác nhận sau phát hành |

**Contract decision:** F-PAY-PAYSLIP-01 paper ESS path implemented on Nest physical prefix `/api/hrm/payroll/me/payslips*` (alias paper `/api/hrm/pay/me/payslips*`). Confirm workflow ADD minimal GĐ1 — no HR “release” gate in this seat.

---

## 2. Deliverables (apps)

| Path | Role |
|------|------|
| `apps/api/hrm-api/src/payroll/payroll.service.ts` | **ADD** ESS resolve/list/get/confirm · schema `employee_confirmed_*` · mapPayslip `ess_confirmed` |
| `apps/api/hrm-api/src/payroll/payroll.controller.ts` | **ADD** `GET me/payslips` · `GET me/payslips/:id` · `POST me/payslips/:id/confirm` |
| `apps/api/hrm-api/src/payroll/dto/list-my-payslips.query.dto.ts` | **ADD** optional `company_id` · `period_id` |
| `apps/api/hrm-api/src/payroll/payroll.service.spec.ts` | **ADD** ESS ownership · confirm · idempotent · draft 409 |
| `apps/api/hrm-api/src/payroll/payroll.controller.spec.ts` | **ADD** route wire HRM-PAY-200 / HRM-PAY-204-ESS |

**Cấm held:** no seed · no flip `payroll_e2e_ready` · no payment batch wire (parallel seat) · no HR release/send broadcast.

---

## 3. Behavior matrix

| METHOD / path | Condition | Result |
|---------------|-----------|--------|
| `GET /payroll/me/payslips` | JWT `employee_id` | **200** `HRM-PAY-200` · list forced `employee_id=token` |
| `GET /payroll/me/payslips/:id` | Owner + in scope | **200** header + `components[]`/`lines[]` + `ess_confirmed` |
| `GET /payroll/me/payslips/:id` | Exists but other NV | **403** `HRM-PAY-403-ESS` |
| `GET /payroll/me/payslips/:id` | Missing / scope | **404** `HRM-PAY-404` |
| `GET /payroll/me/payslips*` | Token without `employee_id` (e.g. group CEO) | **403** `HRM-PAY-403-ESS` |
| `POST /payroll/me/payslips/:id/confirm` | `status=processed\|paid` · owner | **200** `HRM-PAY-204-ESS` · sets `employee_confirmed_at/by` |
| `POST …/confirm` | Already confirmed | **200** idempotent (same stamp) |
| `POST …/confirm` | `status=draft` | **409** `HRM-PAY-409-ESS` |
| Auth | no JWT | **401** (existing payroll gate) |

**Schema ADD (ensureSchema):** `payroll_payslips.employee_confirmed_at` · `employee_confirmed_by` — no change to `chk_payslip_status` enum.

---

## 4. Jest evidence

```text
pnpm --filter hrm-api exec jest --testPathPatterns="payroll.service.spec|payroll.controller.spec" --no-coverage
→ Test Suites: 2 passed · Tests: 45 passed
```

| Case | Result |
|------|--------|
| resolveEssEmployeeId rejects CEO token | PASS |
| listMyPayslips forces employee_id filter | PASS |
| getMyPayslipById owner + lines | PASS |
| getMyPayslipById cross-employee 403 | PASS |
| confirmMyPayslip stamps + idempotent | PASS |
| confirmMyPayslip draft 409 | PASS |
| Controller ESS list/get/confirm wire | PASS |

**Build note:** `pnpm --filter hrm-api run build` **FAIL** at time of handoff — pre-existing parallel WIP (`employee-compensation.service.ts` broken `@CODE-MEMORY` block · `pay-src-resolver.ts` TS). **Not introduced by this seat.** QA L1 may use running `:28001` after stack restart once monorepo build green.

---

## 5. Residual

| ID | Sev | Status | Note |
|----|-----|--------|------|
| **`payroll_e2e_ready`** | honesty | **LOCKED false** | ESS slice ≠ module UAT |
| HR “phát hành phiếu” gate | P2 | **OUT** GĐ1 | Confirm allowed when `processed` — no separate `released_for_ess` |
| FE/mobile ESS bind | P2 | **OUT** | dev-fe / dev-mobile after QA L1 |
| Paper alias `/pay/payslips` | P3 | **OUT** | Nest `/payroll` is physical SoT |
| Monorepo `nest build` | P1 blocker | **OPEN parallel** | Fix EMP-SRC / compensation comment block before dist ship |

---

## completion_report

### Closed
1. F-PAY-PAYSLIP-01 ESS read: `GET /payroll/me/payslips` + `GET /payroll/me/payslips/:id` (token `employee_id` only).
2. AMIS step6 GĐ1 confirm: `POST /payroll/me/payslips/:id/confirm` with audit columns + idempotent semantics.
3. Cross-employee **403** · scope miss **404** · draft confirm **409**.
4. Jest **45/45 PASS** on payroll controller/service specs.
5. Honesty: **`payroll_e2e_ready=false`**.

### Residual
- QA L1 with mobile/ESS persona (`uat.nv####@xe.vn` or employee-bound JWT).
- Monorepo build green (parallel lane).
- FE ESS UI bind (not this seat).

---

## Handoff

| Field | Value |
|-------|--------|
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-ess-be-01.md` |
| **ack_status** | **READY_FOR_QA** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-ESS-QA-01
from_role: pm
to_role: qa
lane: execution
prior: PO-HRM-AMIS-PARITY-PAY-ESS-BE-01 READY_FOR_QA
parent: PO-HRM-AMIS-PARITY-RESEARCH-01
priority: P2

## Mission
L1 smoke AMIS step6 ESS payslip (U65 zero-seed):
1) Auth mobile ESS uat.nv0001@xe.vn / xevn-uat-2026 (or employee JWT with employee_id)
2) GET /api/hrm/payroll/me/payslips?company_id=holding → 200 · only own rows
3) Pick processed payslip id → GET /api/hrm/payroll/me/payslips/:id → 200 · components/lines · ess_confirmed false/true
4) POST /api/hrm/payroll/me/payslips/:id/confirm → 200 HRM-PAY-204-ESS · F5 GET shows ess_confirmed true + employee_confirmed_at set
5) ceo@xe.vn (no employee_id) → GET me/payslips → 403 HRM-PAY-403-ESS
6) NV token + another employee payslip id → 403
cấm: seed · flip payroll_e2e_ready · claim AMIS parity DONE

entry_criteria: BE evidence READY_FOR_QA; hrm-api :28001 up; U65
exit_criteria: evidence MD + machine JSON; ack PASS_TO_PM or FAIL_TO_PM; payroll_e2e_ready=false
evidence: docs/qa/evidence/po-hrm-amis-parity-pay-ess-qa-01.md
```
