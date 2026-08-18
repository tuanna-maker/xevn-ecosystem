# PO-HRM-MVP-GD1-PAY-07-CLUSTER-BE-01 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-07-CLUSTER-BE-01` |
| **role** | dev-be |
| **spec_ref** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-API-01.md` §4.1–4.9 · `PO-HRM-MVP-GD1-PAY-07-CLUSTER-DATA-01.md` §6.1–6.2 |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · **≠ PAY-07 / FR-UC-BP-PAY-07 DONE** · **C-SLICE** |

## Closed (BE)

1. **Schema:** `ensurePayTerminationSettlementSchema` + `ensurePayrollPayslipsFinalPayColumns` (`pay_termination_settlement`, `is_final_pay`, `termination_settlement_id`).
2. **F-PAY-TERM-SETTLE-01:** `POST /api/hrm/payroll/periods/:periodId/termination-settle` — soft TERM O3 · checklist READ · lifecycle draft→ready→posted · **HRM-PAY-TERM-409** · **HRM-PAY-ATT-412** on posted path.
3. **GET** preview + **GET** `/termination-settlements/:id` — display-ready checklist / status.
4. **Process order:** step **(0)** `assertTerminationSettlementsPostedForProcess` · steps **(1)–(11)** PAY-06 RETAIN · step **(12)** `bindFinalPayslipToSettlement` (`is_final_pay` + links).
5. **Guards:** `assertNoPayTermPayoutOverrideInBody` (**HRM-PAY-TERM-403**) on settle/process/enroll · reject `include_terminations` (**HRM-PAY-TERM-400-USE-DEDICATED-SETTLE**).
6. **Payslip read:** `isFinalPay`, `terminationSettlementId`, `settlementStatus` on list/get (U19 join).

## Files touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/payroll/pay-term.constants.ts` | ADD codes |
| `apps/api/hrm-api/src/payroll/pay-term-guard.ts` | ADD 403/400 guards |
| `apps/api/hrm-api/src/payroll/pay-termination-settlement.schema.ts` | ADD ensureSchema |
| `apps/api/hrm-api/src/payroll/pay-termination.service.ts` | ADD F-PAY-TERM-SETTLE-01 |
| `apps/api/hrm-api/src/payroll/dto/termination-settle.dto.ts` | ADD DTO |
| `apps/api/hrm-api/src/payroll/payroll.service.ts` | process 0/12 · settle APIs · payslip fields |
| `apps/api/hrm-api/src/payroll/payroll.controller.ts` | HTTP routes |
| `apps/api/hrm-api/src/payroll/pay-term-guard.spec.ts` | ADD regression |
| `apps/api/hrm-api/src/payroll/pay-termination.service.spec.ts` | ADD O3 id |

## Verification

```bash
cd apps/api/hrm-api
pnpm exec jest --testPathPatterns="pay-term-guard|pay-termination.service|payroll.service.spec|pay-tncn-resolver" --no-cache
```

## Residual (not BE DONE)

- FE checklist UX (`PO-HRM-MVP-GD1-PAY-07-CLUSTER-FE-01`).
- QA U65 **J-HRM-PAY-07-*** + regression PAY-01..06 browser.
- Full CORE-06/10/08/ATT-05 peer surfaces (checklist flags via `employees.custom_fields` until CORE LIVE).
- QC GWC · **≠ payroll_e2e_ready** · **≠ PAY module UAT**.

## spec_read_ack

- **srs:** `SRS_HRM_ENTERPRISE.md` FR-UC-BP-PAY-07 Diễn biến #1–#3
- **api_design:** `PO-HRM-MVP-GD1-PAY-07-CLUSTER-API-01.md` §4.1 S0–S7 · §4.6 (0)–(12)
- **db_design:** `PO-HRM-MVP-GD1-PAY-07-CLUSTER-DATA-01.md` §6.1–6.2
- **sponsor_confirm:** API-01 CONFIRMED EXPAND + DATA-01 ADD stamp

---

## Follow-up — `PO-HRM-MVP-GD1-PAY-07-CLUSTER-BE-02-IMPORT-01` (2026-08-10)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-07-CLUSTER-BE-02-IMPORT-01` |
| **trigger** | QA `PAY07QA1-MSMEY7K3` — `nest start --watch` compile FAIL: missing module `./dto/salary-component.dto` while `payroll.controller.ts` / `payroll-catalog.service.ts` already imported DTO symbols |
| **fix** | ADD `apps/api/hrm-api/src/payroll/dto/salary-component.dto.ts` (`ListSalaryComponentsQueryDto`, `CreateSalaryComponentDto`, `UpdateSalaryComponentDto`); keep imports at `./dto/salary-component.dto` in controller + catalog service (no QA-local-only patch) |
| **scope** | payroll paths only · **must_keep** PAY-07 term settle / process guards unchanged |
| **ack_status** | **READY_FOR_QA** (L0 `nest build` + pay-term jest re-smoke) |

### Verification (`IMPORT-01`)

```bash
cd apps/api/hrm-api
pnpm exec nest build
pnpm exec jest --testPathPatterns="pay-term-guard|pay-termination.service|payroll.service.spec|pay-tncn-resolver" --no-cache
```

| Check | Result |
|-------|--------|
| `nest build` | **exit 0** |
| pay-term jest bundle | **4 suites · 54 tests · exit 0** |

---

## Follow-up — `PO-HRM-MVP-GD1-PAY-07-CLUSTER-BE-02-CONTROLLER-SPEC-P2` (2026-08-10)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-07-CLUSTER-BE-02-CONTROLLER-SPEC-P2` |
| **trigger** | QA import smoke `PAY07QAIMP-MSMEPAY7I` — `payroll.controller.spec` 2/12 FAIL mock arity |
| **fix** | Align `toHaveBeenCalledWith` only: `getPayslipById` +5th `includeSegments` default `true`; `processPayrollPeriod` +4th `body` `null` +5th `queryPayload` `undefined` — **no controller/service behavior change** |
| **ack_status** | **PASS_TO_PM** |

### Verification (P2)

```bash
cd apps/api/hrm-api
pnpm exec jest payroll.controller.spec --no-cache
pnpm exec nest build
pnpm exec jest --testPathPatterns="pay-term-guard|pay-termination.service|payroll.service.spec|pay-tncn-resolver" --no-cache
```

| Check | Result |
|-------|--------|
| `payroll.controller.spec` | **12/12 · exit 0** |
| `nest build` | **exit 0** |
| pay-term jest bundle | **54/54 · exit 0** |
