# PO-WF-CAT-CANDIDATE-LOCK-01 — SA evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-WF-CAT-CANDIDATE-LOCK-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **deliverable** | `docs/program/matrices/PO_WF_CANDIDATE_CODE_LOCK.md` |
| **cấm** | `apps/**` · seed · UAT DONE · invent codes as product · invent `T_L1` N |

---

## completion_report

### Closed

- Đọc taxonomy `PO_WF_PROCESS_TAXONOMY.md`, company matrix §2, program `PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md`.
- Đối chiếu SoT constants `workflow-catalog.constants.ts` — **5** AS-IS codes; **0** attendance/OT/contract/… codes.
- Khóa companion matrix: **5 LOCK_CODE** + **4 SPEC_GAP** + P-LEAVE **AS-IS_CODE + SPEC_GAP_BEHAVIOR** (L2/`T_L1`).
- ADR-delta naming R1–R5 (name only) nằm trong companion — không tạo ADR file riêng (tránh dual SoT).
- Align leave ladder NFR với `po-e2e-leave-ladder-sa-01` Option A: **không** mã WF mới; config `leave_l1_max_days`; Dev HOLD / sponsor `T_L1`.
- **Không** sửa `apps/**` · **không** seed · **không** claim UAT.

### Decision table (summary)

| process_id | decision | proposed code | owner |
|------------|----------|---------------|-------|
| P-ATT-ADJ | LOCK_CODE | `hrm_attendance_adjustment_approval` / `hrm_attendance_adjustment` | sa → bridge wave later |
| P-OT | SPEC_GAP | — | sponsor+PM · expiry 2026-09-03 / CR GĐ1 |
| P-CONTRACT | LOCK_CODE | `hrm_contract_approval` / `hrm_contract` | sa · ba-process |
| P-PROBATION | LOCK_CODE | `hrm_probation_approval` / `hrm_probation` | sa · ba-process |
| P-TRANSFER | LOCK_CODE | `hrm_transfer_approval` / `hrm_transfer` | sa · ba-process |
| P-EXIT | LOCK_CODE | `hrm_exit_approval` / `hrm_exit` | sa · ba-process |
| P-TRAIN | SPEC_GAP | — | sponsor+PM · L&D OUT GĐ1 |
| P-DISCIPLINE | SPEC_GAP | — | ba-process P2 · ~2026-10-01 |
| P-PAY-EX | SPEC_GAP | — | ba-process P2 · ~2026-10-01 |
| P-LEAVE | AS-IS + SPEC_GAP_BEHAVIOR | keep `hrm_leave_approval` | sponsor `T_L1` |

### Residual

- ba-data: refresh cột WF code trên `PO_WF_CATALOG_COMPANY_MATRIX.md` §2 theo LOCK/SPEC_GAP.
- qa synth: TC create-def chỉ AS-IS + LOCK_CODE (`GOVERNANCE_LOCK`); SPEC_GAP = BLOCKED.
- sponsor: OT/TRAIN CR hoặc expiry; leave `T_L1` confirm (không invent N).

---

## Spec / architecture refs

| Ref | Use |
|-----|-----|
| `PO_WF_PROCESS_TAXONOMY.md` §3 | CANDIDATE / HRM-only inventory |
| `workflow-catalog.constants.ts` | AS-IS SoT |
| `po-hrm-comp-sa-01.md` | G-P2-OT-FULL · G-P2-LND OUT |
| `po-e2e-leave-ladder-sa-01.md` | Option A · no new workflowCode |
| `GAP-LEAVE-LADDER-01` · R-PO-WF-01 | Ladder HOLD |

---

## next_owner

**pm** → **qa** (`PO-ECO-TC-SYNTH-WF-CAT-01` hoặc pack WF-MATRIX) + optional **ba-data** matrix §2 column refresh.

---

## next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-SYNTH-WF-CAT-01
from_role: pm
to_role: qa
lane: execution
ack_status_target: PASS_TO_PM

Mission: Synth / plan TC packs for enterprise WF×catalog matrix using locked codes.
read_first:
1. docs/program/matrices/PO_WF_CANDIDATE_CODE_LOCK.md §3–§6
2. docs/program/matrices/PO_WF_PROCESS_TAXONOMY.md
3. docs/program/matrices/PO_WF_CATALOG_COMPANY_MATRIX.md §2
4. docs/program/PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md §6
5. docs/qa/evidence/po-wf-cat-candidate-lock-01.md

Rules:
- Create-def TC (XBOS designer): only AS-IS constants + LOCK_CODE rows — mark GOVERNANCE_LOCK (not yet in workflow-catalog.constants.ts).
- SPEC_GAP (P-OT, P-TRAIN, P-DISCIPLINE, P-PAY-EX): TC PLANNED/BLOCKED — cấm assert spawn with draft names.
- P-ATT-ADJ: HRM approve path TC OK; XBOS inbox instance BLOCKED until bridge.
- P-LEAVE: keep hrm_leave_approval; LV-02 / T_L1 BLOCKED — cấm invent N.
- U65 zero-seed; no apps/**; no UAT DONE claim.

exit_criteria:
1. Pack or synth evidence lists process_id × co_key × code_status
2. Dedupe vs XBOS-WF-DESIGNER / INBOX-CAT
3. evidence_path under docs/qa/evidence/
4. ack_status PASS_TO_PM

Parallel optional:
work_item_id: PO-WF-CAT-COMPANY-MATRIX-REFRESH-01
to_role: ba-data
Mission: Update PO_WF_CATALOG_COMPANY_MATRIX.md §2 WF code column from PO_WF_CANDIDATE_CODE_LOCK.md (LOCK vs SPEC_GAP). No invent UUID. Evidence companion. PASS_TO_PM.
```

---

## ack_status

**PASS_TO_PM**

## evidence_path

`docs/qa/evidence/po-wf-cat-candidate-lock-01.md`
