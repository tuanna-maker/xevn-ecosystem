# PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BE-01 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BE-01` |
| **lane** | dev-be |
| **date** | 2026-08-10 |
| **ack_status** | **READY_FOR_QA** |

## spec_read_ack

- **srs:** `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` · **FR-UC-BP-ATT-04b** · Diễn biến #1/#2 · **BR-BP-LV-07**
- **tech_spec:** `docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-API-01.md` §4.3–4.7 · §10.1
- **db_design:** `docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-DATA-01.md` §4.1–4.2
- **api_design:** F-ATT-LEAVE-BAL-01 `advanced_days` · F-ATT-LVRULE cap CRUD · F-ATT-LEAVE-02 `HRM_LEAVE_VAL_BALANCE`
- **sponsor_confirm:** Wave-33 ATT-04b cluster · DATA/API CONFIRMED 2026-08-10

## must_keep (verified)

| Stamp | Status |
|-------|--------|
| `ATT04QC1-MSM22G4W` | No wipe LVT/LVRULE/grant paths |
| `ATT09QC1-MSLUTL9D` | `pending_days` hold unchanged |
| `ATT03DQC1-MSM1CR19` | No GPS/ATT-03d regression in touched files |
| `HRM_LEAVE_VAL_BALANCE` | Still **400** on over-available (ứng OFF path) |
| DENY `att_leave_hold` | No new table |
| DENY F-ATT-LEAVE-04 offset job | Not implemented |
| DENY PAY bridge | Not touched |

## Migration

**File:** `apps/api/hrm-api/migrations/20260810_att_leave_balance_advanced_and_cap.sql`

| Object | Change |
|--------|--------|
| `employee_leave_balances.advanced_days` | `NUMERIC(5,1) NOT NULL DEFAULT 0` + backfill |
| `att_leave_accrual_policy.advance_max_days` | `NUMERIC(6,2) NULL` |
| `att_leave_accrual_policy.advance_cap_percent` | `NUMERIC(5,2) NULL` |

Runtime `ensureSchema` mirrors ADD COLUMN IF NOT EXISTS in:

- `leave-balance.service.ts`
- `leave-requests.service.ts` (`ensureLeaveBalanceSchema`)
- `att-leave-accrual-policy.service.ts`

## Wire summary

| Surface | Change |
|---------|--------|
| `GET …/leave-balance` | Response `advanced_days`; `available_days = max(0, entitled − used − pending − advanced)` |
| `GET …/leave-balance/panel` | Same formula per MVP row |
| `POST …/leave-requests` | `assertSufficientLeaveBalance` uses shared `computeLeaveAvailableDays` |
| `POST/PATCH …/leave-accrual-policies` | DTO `advanceMaxDays` · `advanceCapPercent` → DB cols |

**Residual (not this WI):** over-balance branch `balance_resolution` · cap enforcement on submit · `advanced_days` increment on approve — **GAP** for FE-01 / follow-up BE.

## Tests

```bash
cd apps/api/hrm-api
npx jest leave-balance.service.spec.ts leave-requests.service.spec.ts att-leave-accrual-policy.service.spec.ts --no-cache
```

**Result:** 3 suites · **62 passed** · exit 0

New cases:

- `ATT-04b: advanced_days reduces available_days` (leave-balance)
- `ATT-04b: createLeaveRequest rejects when advanced_days reduces available` (leave-requests)
- `ATT-04b: createPolicy persists advance cap fields` (accrual policy)

## FE handoff (FE-01)

- Bind `advanced_days` on balance/panel payloads (new field, default 0).
- Admin LVRULE form: `advanceMaxDays` · `advanceCapPercent` (0–100) on create/patch.
- Over-balance UX branch still **not** in API — reject path only until FE+submit branch wave.
- **≠ FR-04b DONE** · **≠ ATT UAT** · honesty flags unchanged.

## completion_report

**Closed:** DATA §4.1–4.2 migration stamp + ensureSchema parity + available formula on balance/panel/assert + policy cap CRUD DTO/display + regression jest.

**Open:** Diễn biến #1 over-balance propose branch · cap validation on submit · offset ENGINE (HOLD).

## next_owner

`dev-fe` (PO-HRM-MVP-GD1-ATT-04B-CLUSTER-FE-01) then `qa`.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-ATT-04B-CLUSTER-FE-01
read_first: docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-API-01.md §4.2–4.5 · docs/qa/evidence/po-hrm-mvp-gd1-att-04b-cluster-be-01.md
entry_criteria: hrm-api READY_FOR_QA · GET leave-balance returns advanced_days + updated available_days formula
exit_criteria: Panel/form bind advanced_days · LVRULE admin cap fields · over-balance branch UX (ứng ON) per BA — browser evidence J-HRM-ATT-04B-*
must_keep: ATT04QC1 · ATT09 pending_days · no seed U65 · ≠ FR-04b DONE claim
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-att-04b-cluster-fe-01.md
```
