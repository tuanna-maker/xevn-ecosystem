# PO-HRM-MVP-GD1-ATT-07-CLUSTER-BE-01 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-07-CLUSTER-BE-01` |
| **role** | dev-be |
| **date** | 2026-08-10 |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `attendance_uat_ready=false` · **C-SLICE** · ≠ ATT-07 / FR-07 DONE · ≠ ATT UAT |

## spec_read_ack

| Artifact | Path / sections |
|----------|-----------------|
| **srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` · FR-UC-BP-ATT-07 Diễn biến #1–#2 · BR-BP-LV-04 · DV-16 |
| **tech_spec** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-API-01.md` §4.7–§4.8 |
| **db_design** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-DATA-01.md` §6.1 · §6.2 |
| **api_design** | F-ATT-SICK-POLICY-ORDER GET/PUT `…/sick-leave-fund-order` · F-ATT-SICK-DAY-BRANCH submit hook |

## Closed (BE)

- `ensureSchema`: `att_sick_leave_fund_order` + `att_sick_leave_day_branch` (UQ active policy · UQ allocated day per request)
- `GET/PUT /api/hrm/attendance/sick-leave-fund-order` — scope U19 · dup token → `HRM-ATT-SICK-FUND-ORDER-INVALID`
- Sick `POST …/leave-requests`: after VAL-ATT + insert → allocator per calendar day · `dayBranches[]` on response when sick
- `branch_code=annual` → `pending_days` on **annual** row only (not sick panel bucket)
- Reject/cancel → void §6.2 rows + release annual branch pending
- **RETAIN**: `HRM-LEAVE-VAL-ATT` · `lockPendingLeaveBalance` on request leave_type · **DENY** `att_leave_hold`
- **DENY**: merge compensatory/sick/carry→annual (jest J-06-04 + `MVP_LEAVE_BALANCE_TYPES`)

## Files touched

- `apps/api/hrm-api/src/attendance/att-sick-leave-fund-order.service.ts`
- `apps/api/hrm-api/src/attendance/att-sick-leave-fund-order.constants.ts`
- `apps/api/hrm-api/src/attendance/dto/att-sick-leave-fund-order.dto.ts`
- `apps/api/hrm-api/src/attendance/leave-requests.service.ts` (sick hooks)
- `apps/api/hrm-api/src/attendance/attendance.controller.ts`
- `apps/api/hrm-api/src/app.module.ts`
- `apps/api/hrm-api/src/attendance/po-hrm-mvp-gd1-att-07-cluster-be-01.spec.ts`

## Verification

```text
pnpm exec jest src/attendance/po-hrm-mvp-gd1-att-07-cluster-be-01.spec.ts  → 7 PASS
pnpm exec jest src/attendance/po-hrm-mvp-gd1-att-06-cluster-be-01.spec.ts \
  src/attendance/po-hrm-mvp-gd1-att-06-cluster-be-03.spec.ts                → 9 PASS (J-06-04 regression)
pnpm run build (hrm-api)                                                    → exit 0
```

## Residual (not BE-01)

- **dev-fe FE-01**: sick picker flags + attach UX · bind `dayBranches` / fund-order admin
- **qa**: U65 J-HRM-ATT-07-01..07 + J-HRM-ATT-06-04 browser
- **R-ATT-07-SHEET-CODE** / **R-ATT-07-AGG** footers (HOLD until FE/ATT-10 funnel)

## next_owner

**dev-fe** — `PO-HRM-MVP-GD1-ATT-07-CLUSTER-FE-01`
