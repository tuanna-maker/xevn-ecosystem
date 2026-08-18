# Evidence — PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01` |
| **lane** | governance · ba-data |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-12 seat #14) |
| **uc_ids** | `UC-BP-CORE-08` |
| **Date** | 2026-08-09 |
| **depends_on** | BA-01 O1–O12 CONFIRMED · SA-01 Option A LOCKED · peer `CORE02QC1-MSL80DU6` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md` |
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED** |
| **change_mode** | DOC-DELTA physical · **NO** `apps/**` · **no migrate run** · **no seed** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| ADD `payroll_link_status` + soft `payroll_period_id` (+ optional audit) on LIVE dual rewards **and** discipline · RETAIN dual GĐ1 | **PASS** — DATA §4 both tables · §1 dual RETAIN |
| Map execution Chờ/Đang/Đã/Hủy ↔ LIVE status residual · DENY silent wipe for greenfield `hrm_reward_discipline` | **PASS** — DATA §5 bridge · DENY Option B wipe |
| Soft FK/pointer → LIVE `payroll_periods` · DENY mandatory `pay_reward_link` / payslip_line cols on CORE | **PASS** — §4.3/§4.2 invariants · §11 DENY |
| RETAIN CORE-02 packages/eins · AuthZ-403 · CB-403 · CORE-01 public · Nest `/core` DENY · decisions ≠ RD SoT | **PASS** — §1/§11 |
| DENY Nest `/core` dual · second RD SoT · claim CORE-02=pillar DONE · claim note-CRUD=FR-08 DONE · reopen J-CORE-02/01 · fold `/decisions` · seed · honesty · apps/** | **PASS** — §11 |
| Unlock sa API-01 F-CORE-RD-01 UPGRADE + enforce ADD — not Dev | **PASS** — §12 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| BA-01 | O1 path · O2 matrix · O3 enforce/cancel · O4 note · O5 physical REQUIRED · O6 period · O7 decisions · O8 PAY OUT · O9 must_keep · O10 honesty · AC-CORE-08-* · VAL-CORE-RD-* · BR-BP-RD-01 |
| SA-01 | Option A LOCKED · dual LIVE SoT · paper `/core` alias · REJECT B/C · unlock DATA then API |
| AS-IS Nest (read-only) | `employee-profile.service.ts` ensureSchema `employee_rewards` / `employee_discipline` — **no** link cols · hard DELETE · status default `active` · FE labels pending/approved/completed/active |
| Paper DB | §3.7 `hrm_reward_discipline` · §5.9 `pay_reward_link` optional PAY · soft period/payslip |
| CORE-02 DATA | packages/eins · CB-403 · Nest DENY · ≠ pillar DONE |
| CORE-01 DATA | public strip RETAIN |

---

## 3. Physical decisions (summary)

1. **Link cols:** ADD `payroll_link_status` (`none|pending_period|linked|executed`) + soft `payroll_period_id` on **both** LIVE dual tables (+ optional audit/`archived_at`/`payroll_period_ref`/`payslip_id`).
2. **Dual RETAIN GĐ1:** paper §3.7 = alias union · **DENY** silent wipe for greenfield sole `hrm_reward_discipline`.
3. **Status map:** Chờ←`pending` · Đang←`in_force`/`approved` · Đã←`executed`/`completed`/`active` residual · Hủy←`cancelled` ADD — **DENY** silent vocabulary wipe.
4. **Period:** soft → LIVE `payroll_periods` · **DENY** mandatory `pay_reward_link` · **DENY** payslip_line on CORE.
5. **Path:** physical rewards* + discipline* · `/core/reward-discipline` alias only · decisions ≠ RD SoT · CORE-02/01 must_keep.

---

## 4. Honesty

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| CORE / personnel UAT | **false** |
| Claim CORE-02 = pillar DONE | **DENIED** |
| Claim note-CRUD = FR-08 DONE | **DENIED** |
| C-SLICE | GWC later ≠ module UAT |

---

## 5. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **sa** |
| **next_work_item** | `PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01` |
| **Dev** | **HOLD** until API CONFIRMED |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-08
depends_on: DATA-01 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md · BA O1–O12 · peer CORE02QC1-MSL80DU6
spec_ref: F-CORE-RD-01 UPGRADE · enforce ADD · BR-BP-RD-01 · AC-CORE-08-* · DATA §4–§5 · paper /core/reward-discipline alias

MISSION — API F.1 lock (docs-only):
1) UPGRADE F-CORE-RD-01 physical on /api/hrm/employees/:id/rewards* + /discipline*: DTO/ensureSchema ADD payroll_link_status + soft payroll_period_id (+ audit); ADD enforce/cancel-enforce (or PATCH transition same SoT); execution map Chờ/Đang/Đã/Hủy ↔ LIVE residual; amount>0→period gate; note-only none not PAY-visible; dual-period 409; locked deny; emp Hoạt động; display-ready VI
2) Paper POST/GET /api/hrm/core/reward-discipline (+ /enforce) = alias only — DENY Nest /core dual RD SoT
3) Soft resolve payroll_periods; OUT invent F-PAY-RD-APPLY-01 / pay_reward_link mandatory / payslip_line CORE write; decisions ≠ RD SoT
4) RETAIN CORE-02 packages/eins · HRM-CORE-CB-AUTHZ-403 · HRM-CORE-CB-403 · CORE-01 public · Nest /core DENY · U19 list=get=enforce; DENY claim CORE-02=pillar DONE · claim note-CRUD=FR-08 DONE · reopen J-CORE-02/01 · seed · honesty · apps/** · Dev until API CONFIRMED
5) Unlock Dev-BE+FE after API CONFIRMED — not this seat

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md · PASS_TO_PM · next Dev HOLD until CONFIRMED
```
