# Evidence — PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-CORE-08 Option/F.1 only** · **no** `apps/**` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-12 · board #14) |
| **depends_on** | QC-01 GWC CORE-02 **SEALED** stamp **`CORE02QC1-MSL80DU6`** · `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-qc-01.md` |
| **uc_ids** | `UC-BP-CORE-08` |
| **Verdict** | **Option A CONFIRMED** |
| **ack_status** | **PASS_TO_PM** |
| **spec_path** | [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01.md) |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-CORE-08 · BR-BP-RD-01 · Diễn biến #1–#5 |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` F-CORE-RD-01 · F-PAY-RD-APPLY-01 (OUT invent) |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §3.7 · §5.9 optional |
| **U65** | zero-seed · **cấm code** until BA (+ DATA) + API CONFIRMED |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **CORE-02 ≠ CORE pillar DONE** |

---

## Decision (locked)

| Item | Value |
|------|-------|
| **Selected** | **Option A** — ACCEPT_AS_IS_UPGRADE |
| **Physical SoT (RD)** | `/api/hrm/employees/:id/rewards*` + `/discipline*` on `employee_rewards` \| `employee_discipline` |
| **Paper alias** | `/api/hrm/core/reward-discipline` (+ `/enforce`) — **DENY** Nest dual SoT |
| **UPGRADE** | F-CORE-RD-01 execution lifecycle + `payroll_link_status` + soft `payroll_period_id` + enforce/cancel |
| **OUT invent** | F-PAY-PROCESS-01 / payslip_line / full PAY engine — PAY peer owns F-PAY-RD-APPLY-01 |
| **RETAIN must_keep** | CORE-02 packages/eins · AuthZ-403 · CB-403 · CORE-01 public strip · Nest `/core` DENY · U19 |
| **REJECT** | **B** Nest `/core` dual / second RD wipe · **C** HOLD / note=DONE / CORE-02=pillar DONE / PAY invent / honesty flip |
| **≠ SoT** | `/api/hrm/decisions*` personnel decisions (soft `decision_number` only) |

---

## Honesty locks (mandatory)

| Flag / claim | Value | SA |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **`jd_dynamic_done`** | **`false`** | **DENIED** flip |
| **Module CORE / personnel UAT** | **DENIED** | Slice ≠ module |
| **Claim CORE-02 packages = CORE pillar DONE** | **DENIED** | C&B ≠ pillar |
| **Claim note-CRUD = FR-UC-BP-CORE-08 DONE** | **DENIED** | Missing payroll_link |
| **Nest `/core` dual** | **DENIED** | RETAIN QC seal |
| **Invent PAY full engine this seat** | **DENIED** | Mission OUT |
| **Reopen J-HRM-CORE-02-01..04 / J-HRM-CORE-01-*** | **DENIED** | without regression |
| **Seed** | **DENIED** | U65 |
| **`apps/**` this seat** | **DENIED** | docs-only |

---

## next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-08-CLUSTER-BA-01
lane: governance · ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-08
depends_on: SA-01 Option A CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01.md · peer CORE-02 SEALED CORE02QC1-MSL80DU6
spec_ref: SRS FR-UC-BP-CORE-08 · BR-BP-RD-01 · F-CORE-RD-01 · F-PAY-RD-APPLY-01 OUT · must_keep CORE-02 packages/eins · AuthZ-403 · CB-403 · CORE-01 public · Nest /core DENY

MISSION — BA AC pack (O1–O12):
1) Lock AC for KT/KL create + enforce on physical /employees/:id/rewards* + /discipline*; paper /core/reward-discipline = alias only
2) amount>0 → require payroll_period_id; payroll_link_status lifecycle; note-only → not PAY-visible
3) enforce / cancel on unlocked period; dual-period 409; locked period deny; employee Hoạt động gate
4) DRAFT J-HRM-CORE-08-01..04 · ba-data LIKELY REQUIRED for link cols
5) DENY Nest /core dual · invent PAY process/payslip · claim CORE-02=pillar DONE · reopen sealed J-CORE-02 / J-CORE-01 · honesty flip · seed · apps/** · fold RD into /decisions

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-BA-01.md · PASS_TO_PM · next ba-data or sa API-01
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Option A LOCKED UC-BP-CORE-08 — LIVE rewards/discipline UPGRADE execute+payroll_link; paper /core alias; RETAIN CORE-02/01 must_keep; OUT PAY invent; unlock ba-process BA-01; no apps/**; honesty false · C-SLICE. |
| **next_owner** | **ba-process** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01.md` · this file |
