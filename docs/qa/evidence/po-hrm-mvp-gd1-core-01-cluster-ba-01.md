# Evidence — PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-CORE-01 AC O1–O12 only** · **no** `apps/**` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-10 · board #12) |
| **depends_on** | SA-01 Option A **LOCKED** · `docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md` · REC-07 QC stamp **`REC07QC1-MSL5WXU5`** |
| **uc_ids** | `UC-BP-CORE-01` |
| **Verdict** | **O1–O12 CONFIRMED** |
| **ack_status** | **PASS_TO_PM** |
| **spec_path** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01.md) |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-CORE-01 · AC-CORE-PUB-01/02 · AC-CORE-CB-MAP-01 · BR-BP-SEC-01 |
| **ref_paper_api** | F-CORE-EMP-01 · F-CORE-DEP-01 |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §3.1 · §3.3 |
| **U65** | zero-seed · **cấm code** until DATA + API CONFIRMED |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · CORE UAT false |

---

## Locked (BA)

| Item | Value |
|------|-------|
| **Physical SoT** | `GET/PATCH/POST /api/hrm/employees*` (+ list) |
| **Paper alias** | `/api/hrm/core/employees/{id}` — **DENY** Nest dual SoT |
| **C&B** | Strip GET · reject PATCH → **`HRM-CORE-CB-403`** · F5 no leak |
| **FE** | AC-CORE-CB-MAP-01 hide/redirect — not same-form |
| **Dependents** | **ADD** `/employees/:id/dependents*` · quà 1/6 DOB · **ba-data REQUIRED** |
| **Hire** | REC-07 handoff **≠** CORE-01 DONE · J-07 **DENY reopen** |
| **J-* DRAFT** | `J-HRM-CORE-01-01..04` |
| **AC** | AC-CORE-01-01..10 · ALT · EX · VAL-CORE-PUB-01..24 |
| **OUT** | CORE-02 · CORE-01a · Nest `/rec` · second EMP |

---

## Honesty locks (mandatory)

| Flag / claim | Value | BA |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **`jd_dynamic_done`** | **`false`** | **DENIED** flip |
| **Module REC / CORE UAT** | **DENIED** | Slice ≠ module |
| **Claim REC-07 hire = CORE-01 DONE** | **DENIED** | Handoff ≠ public ring |
| **Nest `/core` dual EMP** | **DENIED** | LIVE `/employees` only |
| **Nest `/rec` dual** | **DENIED** | RETAIN QC seal |
| **Second EMP / deps SoT** | **DENIED** | ONE SoT |
| **Reopen J-HRM-REC-07-01..04** | **DENIED** | without regression |
| **Seed** | **DENIED** | U65 |
| **`apps/**` this seat** | **DENIED** | docs-only |

---

## next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-01
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01.md
spec_ref: DB §3.1 hrm_employee public · §3.3 hrm_dependent · F-CORE-EMP-01 · F-CORE-DEP-01 · BR-BP-SEC-01

MISSION — Physical DATA lock (docs-only):
1) ONE dependents SoT physical (employee_dependents ↔ paper hrm_dependent) — columns: full_name, relation_code, date_of_birth, is_tax_dependent (boundary), soft archived_at, company_id scope
2) Public allow-list + CB deny-list strip map on LIVE employees (no second EMP table)
3) DENY Nest /core dual EMP · Nest /rec dual · second deps SoT · hard FK hire reopen · CORE-02 cols on public · seed · honesty flip · apps/**
4) Unlock sa API-01 F-CORE-EMP-01 UPGRADE + F-CORE-DEP-01 ADD — not Dev

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API-01
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 CONFIRMED UC-BP-CORE-01: public ring on LIVE `/employees*` · CB-403 + F5 · dependents ADD ba-data REQUIRED · CB-MAP FE · hire ≠ DONE · J-HRM-CORE-01-01..04 DRAFT · DENY dual Nest `/core`/`/rec` · reopen J-07 · honesty · seed · apps/**. SPEC_LEN=32021 · EVID_LEN=4333 NFD. |
| **next_owner** | **ba-data** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-ba-01.md` |
