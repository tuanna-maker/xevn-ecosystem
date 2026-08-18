# PO-HRM-MVP-GD1-CORE-08-CLUSTER-BE-01 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-08-CLUSTER-BE-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · Wave-12 seat #14) |
| **lane** | execution · **dev-be** |
| **uc_ids** | `UC-BP-CORE-08` |
| **Date** | 2026-08-09 |
| **depends_on** | API-01 **CONFIRMED** · DATA-01 · BA-01 O1–O12 · SA Option A · peer `CORE02QC1-MSL80DU6` |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `recruitment_uat_ready=false` · personnel/CORE module UAT **false** · **C-SLICE** · U65 · **DENY** claim CORE-02=pillar DONE · **DENY** claim note-CRUD=FR-08 DONE |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-08** Diễn biến **#1–#5** · **BR-BP-RD-01** |
| **tech_spec / api** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md` §4–§5 F-CORE-RD-01 UPGRADE + enforce/cancel |
| **db_design** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md` §4 link cols both · §5 execution map |
| **api_design** | API-01 §5.1–§5.4 physical `/employees/:id/rewards*` + `/discipline*` · paper `/core/reward-discipline` alias only |
| **sponsor_confirm** | API-01 CONFIRMED 2026-08-09 · unlock BE+FE |
| **change_mode** | **UPGRADE** F-CORE-RD-01 residual · **ADD** enforce/cancel · **RETAIN** dual LIVE |

---

## 2. Implementation summary

| Item | Detail |
|------|--------|
| **Service** | `apps/api/hrm-api/src/employees/employee-reward-discipline.service.ts` |
| **ensureSchema** | ADD on **both** `employee_rewards` + `employee_discipline`: `payroll_link_status` · `payroll_period_id` · `payroll_period_ref` · `payslip_id` · `archived_at` · enforce/cancel audit · CHK enum · indexes |
| **Create** | Prefer `status=pending` · amount>0 → require soft period (open/draft/adjust) → `pending_period` · note-only → `none` · emp Hoạt động gate |
| **Enforce / cancel** | `POST …/rewards/:id/enforce` · `…/cancel-enforce` · same for discipline · PATCH `status=in_force\|executed\|cancelled` → same gates (ALT-04) |
| **Period soft** | Resolve LIVE `payroll_periods` · unlocked = `draft\|open\|adjust` · locked = `processed\|closed\|locked` |
| **Errors mint** | `HRM-CORE-RD-VAL-400` · `ENFORCE-409` · `DUAL-PERIOD-409` · `LOCKED-PERIOD-409` · `EMP-INACTIVE-409` · `PERIOD-404` · `RD-404` |
| **Display-ready** | `status_label` / `payroll_link_status_label` VI · `amount_display` vi-VN |
| **U19** | list = get = enforce = cancel via `resolveHrmListScope` + employee profile scope |
| **Soft delete** | Prefer `archived_at` · hard-delete residual removed from product path; locked+linked → 409 |
| **Controller** | `employees.controller.ts` wired to RD service · **no** Nest `@Controller('core')` RD |
| **Module** | `EmployeesModule` providers/exports `EmployeeRewardDisciplineService` |
| **OUT / DENY** | Nest `/core` dual · `hrm_reward_discipline` wipe · mandatory `pay_reward_link` · `payslip_line` CORE write · fold `/decisions` · seed · honesty flip · CORE-02/note DONE claims |

---

## 3. Verification

```text
pnpm --filter hrm-api exec jest --testPathPatterns=po-hrm-mvp-gd1-core-08-cluster-be-01 --no-coverage
→ Test Suites: 1 passed · Tests: 16 passed

pnpm --filter hrm-api exec tsc -p tsconfig.build.json --noEmit
→ exit 0
```

**Jest coverage (unit):** ensureSchema both tables · create VAL-400 / note-only / money+period · enforce linked · ENFORCE-409 · LOCKED · DUAL · cancel · EMP-INACTIVE · PERIOD-404 · PATCH ALT-04 · soft archive · DENY invent patterns.

---

## 4. must_keep / residual

| Class | Status |
|-------|--------|
| CORE-02 AuthZ/CB-403 · stamp `CORE02QC1-MSL80DU6` | **RETAIN** · ≠ pillar DONE |
| CORE-01 public strip · CB-403 · Nest `/core` DENY | **RETAIN** |
| Dual LIVE rewards+discipline | **RETAIN** |
| F-PAY-RD-APPLY-01 / payslip write | **OUT invent** |
| Profile service legacy RD methods | Residual unused by controller — SoT = RD service |
| Browser U65 J-HRM-CORE-08-01..04 | **QA next** |
| Honesty / C-SLICE | **false** — no flip |

---

## 5. Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-be-01.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-08-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-08
depends_on: BE-01 READY_FOR_QA — docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-be-01.md · FE-01 if READY
entry_criteria: L0 stack; U65 zero-seed; browser-only; honesty false; C-SLICE
MISSION: Retest F-CORE-RD-01 physical /api/hrm/employees/:id/rewards* + /discipline* — create Chờ+period if money; POST enforce → linked F5; cancel-enforce unlink; note-only none excluded PAY; dual/locked/emp 409; Nest /core RD path 0; RETAIN CORE-02 AuthZ/CB smoke · CORE-01 public no RD money; DENY claim CORE-02=pillar DONE · note-CRUD=FR-08 DONE · reopen J-CORE-02/01 · seed.
J-*: J-HRM-CORE-08-01..04 (DRAFT promote)
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-qa-01.md · PASS_TO_PM or FAIL
cấm: seed · API-only PASS · Nest /core SoT · honesty flip
```

---

## completion_report

- **Closed:** F-CORE-RD-01 Nest physical UPGRADE — ensureSchema link cols both dual tables; create pending+link gates; ADD enforce/cancel-enforce (+ PATCH same gates); soft `payroll_periods`; mint `HRM-CORE-RD-*`; display-ready VI; U19; jest **16 PASS**; tsc **exit 0**; DENY Nest `/core` dual · wipe dual · pay_reward_link mandatory · payslip_line CORE · fold decisions · DONE claims · seed · honesty.
- **Residual:** QA U65 J-HRM-CORE-08-01..04 · FE-01 bind · QC GWC C-SLICE · F-PAY-RD-APPLY-01 OUT.
