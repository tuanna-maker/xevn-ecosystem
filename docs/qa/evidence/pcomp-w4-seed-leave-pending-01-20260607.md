# PCOMP-W4-SEED-LEAVE-PENDING-01 — pending manager leave seed (G-PERSONA-B2)

| Field | Value |
|-------|-------|
| work_item_id | `PCOMP-W4-SEED-LEAVE-PENDING-01` |
| date | 2026-06-07 |
| owner | devops |
| ack_status | **PASS_TO_PM** |
| entry | G-PERSONA-B2 — manager queue had att-update only; need pending leave for **HRM-LEAVE-203** device test |
| exit | ≥1 pending leave for `uat.nv0001@xe.vn` manager scope on nip.io pilot |

## Summary

Extended `scripts/seed-hrm-uat-mob-pilot-qual.mjs` to idempotently insert a **pending** `leave_requests` row from direct report **Huỳnh Văn An** (`HLD-0006`) to manager **uat.nv0001@xe.vn**. Ran seed against pilot HRM DB (`DB_HOST` from `deploy/xevn-ecosystem/.env`) and verified via nip.io API probe.

## Commands

| Step | Command | Exit |
|------|---------|------|
| Seed | `pnpm run seed:hrm:uat-mob-pilot-qual` | **0** |
| Pilot probe | `HRM_API_BASE_URL=https://14-225-217-232.nip.io` `HRM_MOBILE_EMAIL=uat.nv0001@xe.vn` `HRM_MOBILE_PILOT_PASSWORD=xevn-uat-2026` `node scripts/tmp-p1-resid-c03-probe.mjs` | **0** |

## Seed IDs (stable — re-run safe)

| Entity | UUID / value |
|--------|----------------|
| seed_tag | `SEED-MOB-UAT` |
| manager email | `uat.nv0001@xe.vn` |
| manager employee_id | `3796d949-4513-45c0-88fa-33030a062b17` |
| company slug | `holding` |
| company_uuid | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| subordinate employee_id | `8ac84520-0d6b-4737-8341-2f9a929b5f81` |
| subordinate code / name | `HLD-0006` / **Huỳnh Văn An** |
| **leave_request (pending)** | **`27bdf216-644e-4fc8-88f0-5f9ed1533505`** |
| leave dates | 2026-06-16 → 2026-06-17 (annual, 2 days) |
| leave reason | `SEED-MOB-UAT-LVE — nghỉ phép chờ UAT0001 duyệt (HRM-LEAVE-203)` |
| update_request (pending) | `5073d94b-b8a2-4063-80a4-22497851b5f0` |
| payslip | `8ef206d6-32e2-462f-863b-546b3a09a7e5` |
| pay_period | `f8dc0cc0-1d5e-4cb7-8e92-ec44fd5ff5a4` |

## Pilot API verification (nip.io)

Account: `uat.nv0001@xe.vn` / `xevn-uat-2026`

| Probe | Status | total | PASS |
|-------|--------|-------|------|
| GET `/attendance/leave-requests` (own list) | 200 | 2 | yes |
| GET `/payroll/payslips` | 200 | 2 | yes |
| GET `/attendance/leave-requests?status=pending&manager_employee_id` | 200 | **1** | yes |
| GET `/attendance/update-requests?status=pending&manager_employee_id` | 200 | **1** | yes |

Manager pending leave row returned `id=27bdf216-644e-4fc8-88f0-5f9ed1533505`, `employee_name=Huỳnh Văn An`, `status=pending` — ready for **ManagerApprovalsScreen** chip **Nghỉ phép (1)** and approve → **HRM-LEAVE-203** device tap.

## Code changes

- `scripts/seed-hrm-uat-mob-pilot-qual.mjs` — insert/reset pending leave from subordinate; verify `pending_manager_leave_requests >= 1`
- `scripts/tmp-p1-resid-c03-probe.mjs` — added manager pending leave probe (paired with existing update probe)

## Residual

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| R-SEED-LEAVE-CONSUME-01 | P2 | Approve on device consumes pending row; re-run `pnpm run seed:hrm:uat-mob-pilot-qual` before retest | qa-device / devops |

## Handoff

- **completion_report:** Pending manager leave seeded and verified on nip.io pilot; manager queue now has att-update **and** leave pending for G-PERSONA-B2 / HRM-LEAVE-203.
- **next_owner:** `qa-device`
- **next_dispatch_prompt:** work_item_id PCOMP-W4-QA-PERSONA-R2 — Retest G-PERSONA-B2 on MUX-03b APK as `uat.nv0001@xe.vn`: ManagerApprovals **Nghỉ phép (1)** → sticky **Duyệt** → expect Vietnamese success (HRM-LEAVE-203, not raw code). If pending=0, run `pnpm run seed:hrm:uat-mob-pilot-qual` first. Evidence `docs/qa/evidence/pcomp-w4-qa-persona-r2-20260607.md` PASS_TO_PM.
- **evidence_path:** `docs/qa/evidence/pcomp-w4-seed-leave-pending-01-20260607.md`
