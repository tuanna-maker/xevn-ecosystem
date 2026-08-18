# Evidence — PO-HRM-MVP-GD1-ATT-09-CLUSTER-BE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-09-CLUSTER-BE-02` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-27 · UC-BP-ATT-09) |
| **lane** | execution · **dev-be** |
| **Date** | 2026-08-09 |
| **parent QA** | `PO-HRM-MVP-GD1-ATT-09-CLUSTER-QA-01` · stamp `ATT09QA1-MSLTKERF` · FAIL_TO_PM |
| **change_mode** | ADD + FIX · `preserve_default` · CODE-MEMORY APPEND |
| **ack_status** | **READY_FOR_QA** |
| **uc_ids** | `UC-BP-ATT-09` · `FR-UC-BP-ATT-09` |

---

## spec_read_ack

| Layer | Path / cite |
|-------|-------------|
| srs | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` · **FR-UC-BP-ATT-09** · BR-BP-LV-06 · Diễn biến #2–#4 |
| tech_spec / api | `docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01.md` · F-ATT-LEAVE-02/03 RETAIN · held=`pending_days` |
| db_design | `docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-DATA-01.md` · HOLD `employee_leave_balances` · DENY `att_leave_hold` dual |
| qa_in | `docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-qa-01.md` · R-ATT-09-NO-TRACKED-BALANCE · R-ATT-09-APPROVE-SHEET-LOCKED |

---

## Changes (allowed_paths)

| File | Change |
|------|--------|
| `dto/upsert-tracked-leave-balance.dto.ts` | **ADD** F-ATT-LEAVE-BAL-UPSERT-01 body |
| `leave-balance.service.ts` | **ADD** `upsertTrackedEntitlement` · HR grant · U19 scope · 409 if entitled < used+pending |
| `attendance.controller.ts` | **ADD** `PUT /attendance/leave-balance/tracked-entitlement` → `HRM-LEAVE-BAL-201` |
| `leave-requests.service.ts` | **FIX** approve: catch `HRM-ATT-SHEET-LOCKED` on funnel · return 2xx + `leave_funnel_deferred` · settle unchanged |
| `leave-balance.service.spec.ts` | **ADD** 2 upsert tests |
| `po-hrm-mvp-gd1-att-09-cluster-be-02.spec.ts` | **ADD** approve defer funnel test |

**DENY:** Nest `@Controller('core')` · invent `att_leave_hold` · `pnpm seed:*` · honesty flip · claim soft/ATT-08=ATT-09 DONE · ATT UAT · CFG=ATT-02 DONE · PAY/printable DONE.

---

## Product path — tracked balance (U65)

| Item | Detail |
|------|--------|
| **API** | **`PUT /api/hrm/attendance/leave-balance/tracked-entitlement`** |
| **Auth** | HR/manager (`canFullEmployeeUpdate`) · U19 employee in scope |
| **Body** | `company_id` · `employee_id` · `leave_type?` · `balance_year?` · `entitled_days` (≥ used+pending) |
| **Effect** | UPSERT `public.employee_leave_balances` → `source=employee_leave_balances` on subsequent GET/panel/hold |
| **U65** | FE/QA cấp quỹ qua menu/API **trước** J-01 hold AC — **không** dùng `pnpm seed:*` |
| **≠ DONE** | Row alone ≠ ATT-09 DONE · `attendance_uat_ready=false` · C-SLICE |

---

## Approve / settle vs funnel (FIX)

| Before | After |
|--------|--------|
| `materializeApprovedLeave` throws **409** `HRM-ATT-SHEET-LOCKED` → client **409** after DB approve+settle | F-ATT-LEAVE-03 **settle** completes · funnel **deferred** with `leave_funnel_deferred: true` · **200/203** `HRM-LEAVE-203` |
| ATT-09 AC blocked on closed/submitted sheet overlap | ATT-10 funnel residual explicit · CONFLICT (present) still throws |

---

## Verification

| Check | Command | Result |
|-------|---------|--------|
| ATT-09 jest | `npx jest po-hrm-mvp-gd1-att-09-cluster-be-02.spec.ts leave-balance.service.spec.ts -t "ATT-09\|upsertTracked"` | **3 PASS** |
| Approve/settle regression | `npx jest leave-requests.service.spec.ts -t "approveLeaveRequest\|settle\|lockPending"` | **PASS** (filtered) |
| Build | `npx nest build` (hrm-api) | **exit 0** |
| Dist route | grep `tracked-entitlement` in dist | **present** |
| Nest `/core` leave SoT | grep `@Controller('core')` in hrm-api src | **0** |

---

## Honesty (RETAIN)

```text
attendance_uat_ready=false
recruitment_uat_ready=false
contracts_printable_ready=false
hrm_personnel_uat_ready=false
soft create alone ≠ ATT-09 DONE · ≠ FR-09 DONE
≠ ATT-08 preview = ATT-09 DONE · ATT08QC1-MSLSL36C RETAIN
≠ ATT module UAT · CFG≠ATT-02 DONE · ATT02QC1-MSLQZUK7
PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT
DENY invent att_leave_hold · held=pending_days · Nest /core leave-hold = 0
PAY OUT · C-SLICE · U65 zero-seed for UAT evidence
must_keep seals above · no seed in QA evidence
```

---

## Residual (QA-02)

| ID | Owner | Note |
|----|-------|------|
| **R-ATT-09-TYPE-BLOCK-UI** | dev-fe / qa | J-05 detail dialog — FE-02 parallel |
| **R-ATT-09-FE-GRANT-UI** | dev-fe (optional) | Wire PUT tracked-entitlement in HR UI; QA may call API before J-01 |
| **Funnel deferred** | qa | Assert `leave_funnel_deferred` when sheet locked · materialized_days may be `[]` |

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | ADD U65 product path `PUT …/leave-balance/tracked-entitlement` (HR upsert `employee_leave_balances`). FIX approve: settle pending→used returns **203** when funnel hits **HRM-ATT-SHEET-LOCKED** (deferred ATT-10). Nest `/core` 0 · no `att_leave_hold` · jest 3+ regression PASS · build PASS. **≠** ATT-09/UAT DONE · seals RETAIN. |
| **next_owner** | **qa** |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-be-02.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-09-CLUSTER-QA-02
role: qa
entry_criteria: BE-02 READY_FOR_QA · hrm-api rebuilt/restart :28001 · U65 zero-seed · persona ceo@xe.vn / main
exit_criteria:
  1) U65: PUT /api/hrm/attendance/leave-balance/tracked-entitlement (HR) entitled≥12 for test NV + leave_type annual/year 2026 → source=employee_leave_balances
  2) J-HRM-ATT-09-01: POST leave-requests → pending_days↑ · available↓ (tracked)
  3) J-HRM-ATT-09-02: POST approve → 203 HRM-LEAVE-203 · pending→used · if sheet locked accept leave_funnel_deferred (not 409 block)
  4) J-HRM-ATT-09-03: reject release 100% on tracked row
  5) J-04/06 honesty RETAIN · Nest /core 0 · must_keep ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT/CORE · printable false · PAY OUT · ≠ ATT UAT
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-qa-02.md
read_first: docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-be-02.md · po-hrm-mvp-gd1-att-09-cluster-qa-01.md
cấm: pnpm seed:* · invent att_leave_hold · claim soft=ATT-09 DONE
parallel_optional: PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-02 — list→detail att-09-type-block (J-05)
after PASS: QC-01 GWC C-SLICE only · ≠ ATT module UAT
```

---

*End BE-02 · READY_FOR_QA · 2026-08-09*
