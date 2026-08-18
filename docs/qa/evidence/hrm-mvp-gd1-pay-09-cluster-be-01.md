# HRM-MVP-GD1-PAY-09-CLUSTER-01 — dev-be evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `HRM-MVP-GD1-PAY-09-CLUSTER-01` |
| **role** | dev-be |
| **ack_status** | **READY_FOR_QA** |
| **parent QA FAIL** | `QA-PO-HRM-MVP-GD1-PAY-09-CLUSTER-01` · stamp `PAY09QA1-MSMG50YQ` (period SQL ambiguous · members `effective_from`) |
| **prior BE** | `PO-HRM-MVP-GD1-PAY-09-CLUSTER-BE-01` · `PO-HRM-MVP-GD1-PAY-09-CLUSTER-BE-02` |
| **honesty** | `payroll_e2e_ready=false` · **C-SLICE** · **≠ PAY-09 / FR-UC-BP-PAY-09 module DONE** |

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `SRS_HRM_ENTERPRISE.md` · **FR-UC-BP-PAY-09** Diễn biến #1–#3 · Thành công (catalog · scope · snapshot · display) |
| **api_design** | `docs/hrm/API_DESIGN_HRM_PAYROLL.md` · `docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-API-01.md` §4.1–4.11 · §5 display-ready |
| **db_design** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-DATA-01.md` §6.1–6.3 |
| **uc_ids** | `UC-BP-PAY-09` · **BR-BP-PAY-04** |
| **sponsor_confirm** | Wave-45 seat #50 · Phase1 UC closure parallel 2026-08-10 |

## solid_convention_ack

```yaml
lane: dev-be
boundaries: F-PAY-GROUP-01 CRUD/resolve/snapshot/filter trong Nest Service; controller mỏng; không formula payroll trên FE
fe_be: FE chỉ bind payroll_group_* display-ready từ GET/list — không join/aggregate nhóm trên client
display_ready: period/payslip DTO payroll_group_id + payroll_group_code + payroll_group_name_vi từ BE JOIN pay_payroll_group
scope_parity: list/get periods · groups · payslips dùng resolveHrmListScope / pushPayrollPeriodCompanyIdFilter / assertResourceInHrmScope
tests: apps/api/hrm-api/src/payroll/** jest (205) · bundle PAY-09 targeted 59
```

## Closed (this wave)

| Item | Detail |
|------|--------|
| **P0 QA FAIL** | Qualified `payroll_periods.*` when `periodGroupJoinSql` joins `pay_payroll_group` — closes **HRM-SYS-001** on period list/eligibility/create path (**BE-02**, retained) |
| **P0 members 500** | `GET …/groups/:id/members` ORDER BY `employee_work_timeline.event_date` (**BE-02**, retained) |
| **Display-ready** | `payroll_group_*` on period/payslip list+GET mappers; process snapshot `payroll_payslips.payroll_group_id` |
| **Scope/filters** | `payroll_group_id` on period create/patch/list · eligibility · payslip list — U19 parity |
| **Formula regression** | PROCESS **HRM-PAY-GTCG-412** only when expression references `dependents_count` / `gtgc_amount*` — const-only formulas not blocked by missing GTCG CFG |
| **CODE-MEMORY** | APPEND on `payroll.service.ts` · `pay-payroll-group.service.ts` · `pay-formula.service.ts` |

## Files touched

- `apps/api/hrm-api/src/payroll/payroll.service.ts`
- `apps/api/hrm-api/src/payroll/pay-payroll-group.service.ts`
- `apps/api/hrm-api/src/payroll/pay-formula.service.ts`

## Verification

```bash
cd apps/api/hrm-api
pnpm exec jest src/payroll --no-cache
pnpm exec jest src/payroll/pay-payroll-group-resolver.spec.ts \
  src/payroll/payroll.service.spec.ts \
  src/payroll/payroll.controller.spec.ts --no-cache
pnpm run build
node ../../scripts/qa/_tmp-po-hrm-mvp-gd1-pay-09-cluster-be-02-probe.mjs   # repo root, stack up
```

| Check | Result |
|-------|--------|
| Payroll jest (full `src/payroll`) | **PASS (205)** |
| PAY-09 targeted bundle | **PASS (59)** |
| `pnpm run build` (hrm-api) | **PASS** |
| Live probe (`:28001` up) | **PASS** — group 201 · periods 200 · period create 201 · eligibility 200 · members 200 |

## must_keep

- `PAY01QC1-MSMBGWC1` … `PAY08QC1-MSMFFXGWC1` · PAY-01..08 process order · no payslip lifecycle PATCH from PAY-09
- `payroll_e2e_ready=false` · U65 zero-seed · **≠** claim PAY-09 / PAY module UAT DONE

## Residual

- **FE-01 HOLD** · J-HRM-PAY-09-03/04/06 browser/API UX — dev-fe lane
- Full cluster QA re-run: `scripts/qa/_tmp-po-hrm-mvp-gd1-pay-09-cluster-qa-01.mjs`
- Optional payslip list `include_group_breakdown` meta — not required for J-09-05 PASS

## completion_report

**Closed:** Consolidated PAY-09 cluster BE after original QA FAIL — scope SQL + members resolver (BE-02) verified; display-ready `payroll_group_*` per API-01; formula GTCG gate scoped to expressions that need gtgc vars; payroll jest **205** green; PAY-09 bundle **59** green; build PASS; `@CODE-MEMORY` + `solid_convention_ack` on touched Nest files.

**Open:** QA L0–L2.5 API matrix · FE HOLD journeys · `payroll_e2e_ready=false`.

## next_owner

`qa`

## next_dispatch_prompt

```
work_item_id: QA-HRM-MVP-GD1-PAY-09-CLUSTER-01
entry_criteria: BE READY — docs/qa/evidence/hrm-mvp-gd1-pay-09-cluster-be-01.md; L0 qc:fe-be-health PASS; U65 zero-seed; ceo@xe.vn / companyId=main
exit_criteria: Re-run scripts/qa/_tmp-po-hrm-mvp-gd1-pay-09-cluster-qa-01.mjs — J-HRM-PAY-09-01..08 API paths; members 200; period list/elig no HRM-SYS-001; payroll_group_* on payslip GET; jest PAY-09 59 PASS; cite PAY01..08 regression; payroll_e2e_ready=false; ack PASS_TO_PM or FAIL with evidence
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-pay-09-cluster-qa-01.md
cấm: seed · flip payroll_e2e_ready · claim PAY-09 module DONE
```
