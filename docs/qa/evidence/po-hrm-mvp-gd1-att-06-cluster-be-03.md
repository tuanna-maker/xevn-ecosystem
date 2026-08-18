# PO-HRM-MVP-GD1-ATT-06-CLUSTER-BE-03 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-06-CLUSTER-BE-03` |
| **uc_ids** | `UC-BP-ATT-06` · `FR-UC-BP-ATT-06` · **BR-BP-LV-03** |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `attendance_uat_ready=false` · **C-SLICE** · **≠ ATT-06 / FR-06 DONE** |
| **must_keep** | `ATT05BQC1` · `ATT05QC1` · `ATT09QC1` |

## spec_read_ack

- **srs:** `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` · FR-UC-BP-ATT-06 · Diễn biến #1–#2 · J-HRM-ATT-06-04
- **tech_spec / API:** `docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-API-01.md` §4.6–§4.9
- **db_design:** `docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-DATA-01.md` §5.2
- **change_mode:** FIX (accrual read/write + replay repair)
- **prior:** `docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-be-02.md` · QA FAIL `ATT06QA1-MSM7NPIM`

## Root cause (confirmed live)

| Layer | Finding |
|-------|---------|
| **Stale runtime** | `:28001` process predated BE-02; restarted `pnpm run dev:hrm-api` (PID kill + watch rebuild). |
| **Ledger without balance** | `att_ot_comp_accrual_ledger` row `f3282edd-…` · `credited_days=0.5` for OT `a7925db0-…` existed **without** compensatory `employee_leave_balances` until replay sync. |
| **Idempotent gap** | `accrueOnApprovedOvertime` returned early on existing ledger **without** balance upsert (BE-03 fixes). |
| **Schema gap** | Policy `ensureSchema` did not create `employee_leave_balances` before accrual txn. |
| **Read parity** | `getLeaveBalance` used case-sensitive `leave_type = $3` (panel already `lower()`). |
| **QA probe note** | Post-run probe cited employee `0f6e1369-…` but QA ledger/OT employee is `2b4cbc90-…` — retest J-04 must use **same NV as OT approve**. |

## Fix (code)

| File | Change |
|------|--------|
| `att-ot-comp-leave-policy.service.ts` | `ensureSchema` + `employee_leave_balances`; `syncLeaveBalanceEntitledFromLedgerSum` on idempotent replay / post-fresh accrual; `balanceKey` lowercase |
| `leave-balance.service.ts` | `lower(leave_type)` on single-type GET |

## Verification

### Jest

```text
cd apps/api/hrm-api
pnpm exec jest src/attendance/po-hrm-mvp-gd1-att-06-cluster-be-03.spec.ts --no-cache
pnpm exec jest src/attendance/po-hrm-mvp-gd1-att-06-cluster-be-02.spec.ts --no-cache
pnpm exec jest src/attendance/po-hrm-mvp-gd1-att-06-cluster-be-01.spec.ts --no-cache
pnpm exec jest src/attendance/leave-balance.service.spec.ts --no-cache
```

| Suite | Result |
|-------|--------|
| `po-hrm-mvp-gd1-att-06-cluster-be-03.spec.ts` | **1 passed** |
| `po-hrm-mvp-gd1-att-06-cluster-be-02.spec.ts` | **1 passed** |
| `po-hrm-mvp-gd1-att-06-cluster-be-01.spec.ts` | **8 passed** |
| `leave-balance.service.spec.ts` | **12 passed** |

### Runtime

- Killed stale listener on `:28001` (EADDRINUSE); `pnpm run dev:hrm-api` watch — Nest PID **26684** listening.
- Live smoke: `scripts/qa/_tmp-po-hrm-mvp-gd1-att-06-cluster-be-03-smoke.mjs` · exit **0**
  - Employee `2b4cbc90-fb74-4a2d-9fef-d188d4e48d61` (OT `a7925db0-…` / ledger `f3282edd-…`)
  - GET compensatory: `entitled_days=1` · `source=employee_leave_balances` (≥ 0.5 AC)
- DB probe (read-only): `scripts/qa/_tmp-po-hrm-mvp-gd1-att-06-cluster-be-03-dbprobe.mjs` — ledger + compensatory row on `company_id=holding`

## QA entry (U65 · J-04 retest)

- Persona: `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · OU **holding**
- **J-03:** note `employee_id` on approve response — use **that** id for J-04 GET (not hard-coded probe UUID unless same row)
- **J-04:** GET `leave_type=compensatory` · `entitled_days` ≥ `credited_days` from approve · `source=employee_leave_balances` · F5 persist
- If OT already approved: re-open approve (idempotent 201) triggers ledger→balance sync on BE-03 build
- Harness: `scripts/qa/_tmp-po-hrm-mvp-gd1-att-06-cluster-qa-01.mjs`

## Residual

| ID | Note |
|----|------|
| R-ATT-06-AGG | HOLD ATT-10 peer |
| **≠ ATT-06 / ATT UAT DONE** | honesty retained |
| QC-01 | blocked until QA J-04 PASS on correct employee |

## completion_report

**Closed:** BE-03 accrual replay balance repair; policy schema for balances; GET leave_type case parity; hrm-api restart on `:28001`; jest BE-01/02/03 + leave-balance green; live smoke + DB probe for ledger employee.

**Open:** Full cluster QA J-01..07 browser retest (especially J-04 employee alignment).

**next_owner:** **qa**

**evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-be-03.md`

**ack_status:** **READY_FOR_QA**
