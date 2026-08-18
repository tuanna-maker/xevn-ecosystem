# PO-HRM-MVP-GD1-PAY-09-CLUSTER-BE-01 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-09-CLUSTER-BE-01` |
| **role** | dev-be |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · **C-SLICE** · **≠ PAY-09 / FR-UC-BP-PAY-09 DONE** |

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `SRS_HRM_ENTERPRISE.md` · **FR-UC-BP-PAY-09** Diễn biến #1–#2 · Thành công |
| **api_design** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-API-01.md` §4.1–4.11 · §5 DTO |
| **db_design** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-DATA-01.md` §6.1–6.3 |
| **uc_ids** | `UC-BP-PAY-09` · **BR-BP-PAY-04** |
| **sponsor_confirm** | Wave-45 seat #50 · API-01 EXPAND+GAP 2026-08-10 |

## Closed (BE)

1. **ensureSchema** — `pay_payroll_group` · `payroll_periods.payroll_group_id` · `payroll_payslips.payroll_group_id` (`pay-payroll-group.schema.ts`).
2. **CRUD** — `GET/POST/PATCH /api/hrm/payroll/groups*` · retire + duplicate code **HRM-PAY-GROUP-409**.
3. **Resolve** — `GET …/groups/:id/members` · shared resolver (`pay-payroll-group-resolver.ts`).
4. **Period** — create/update/list/get `payroll_group_id` + display labels.
5. **Filters** — eligibility `payroll_group_id` · payslip/period list filters.
6. **Process snapshot** — `POST …/process` sets `payroll_payslips.payroll_group_id` (immutable via no PATCH route).
7. **Errors** — **HRM-PAY-GROUP-409** (dual/scope) · **HRM-PAY-GROUP-412** helper (optional policy).
8. **Display** — `payroll_group_*` on period/payslip GET/list mappers.
9. **DENY** — no payslip lifecycle PATCH · no hardcoded four-group enum · wire-batch O19 untouched.

## must_keep (regression)

- PAY-01..08 process order · PAY08 lifecycle boundary · PAY04 split internal.

## Verification

```bash
cd apps/api/hrm-api
pnpm exec jest src/payroll/pay-payroll-group-resolver.spec.ts \
  src/payroll/payroll.service.spec.ts \
  src/payroll/payroll.controller.spec.ts --no-cache
pnpm run build
```

## Residual

- dev-fe PAY-09 catalog UI · QA J-HRM-PAY-09-* + regression PAY-01..08 · `payroll_e2e_ready=false`.
