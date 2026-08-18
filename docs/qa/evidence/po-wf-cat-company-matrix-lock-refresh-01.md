# PO-WF-CAT-COMPANY-MATRIX-LOCK-REFRESH-01 — ba-data evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-WF-CAT-COMPANY-MATRIX-LOCK-REFRESH-01` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **deliverable** | `docs/program/matrices/PO_WF_CATALOG_COMPANY_MATRIX.md` §2 |
| **cấm** | `apps/**` · seed · wipe §1/§3/§4 · invent co_key · claim GOVERNANCE_LOCK ∈ constants · UAT DONE |

---

## completion_report

### Closed

- Đọc SoT lock `PO_WF_CANDIDATE_CODE_LOCK.md` §3–§6 + evidence `po-wf-cat-candidate-lock-01.md`.
- Đọc taxonomy `PO_WF_PROCESS_TAXONOMY.md` (consistency — không sửa taxonomy wave này).
- **ADD-only** refresh §2 company matrix:
  - Legend `code_status`: **AS-IS** · **GOVERNANCE_LOCK** · **SPEC_GAP** (+ P-LEAVE AS-IS + SPEC_GAP_BEHAVIOR note).
  - Cột `code_status` + **WF identity (normative)** per `process_id`.
  - **Giữ nguyên** Primary / Spot / Template / `co_key` assignment.
  - Đếm: AS-IS **5** · GOVERNANCE_LOCK **5** · SPEC_GAP **4** — khớp lock §3.
- DOC-DELTA note + R-WFCAT-03 mitigation trỏ lock SoT; §7 link evidence + lock.
- **Không** đụng §1 / §3 / §4 body · **không** `apps/**` · **không** seed · **không** claim product codes ngoài AS-IS.

### Mapping applied (process_id → code_status)

| process_id | code_status | WF identity |
|------------|-------------|-------------|
| P-REC-PLAN | AS-IS | `hrm_recruitment_plan_approval` / `hrm_recruitment_plan` |
| P-REC-REQ | AS-IS | `hrm_requisition_approval` / `hrm_requisition` |
| P-REC-PIPE | AS-IS | `hrm_candidate_pipeline` / `hrm_candidate` |
| P-LEAVE | AS-IS (+ SPEC_GAP_BEHAVIOR) | `hrm_leave_approval` / `hrm_leave` (keep) |
| P-ATT-ADJ | GOVERNANCE_LOCK | `hrm_attendance_adjustment_approval` / `hrm_attendance_adjustment` |
| P-OT | SPEC_GAP | — |
| P-CONTRACT | GOVERNANCE_LOCK | `hrm_contract_approval` / `hrm_contract` |
| P-PROBATION | GOVERNANCE_LOCK | `hrm_probation_approval` / `hrm_probation` |
| P-TRANSFER | GOVERNANCE_LOCK | `hrm_transfer_approval` / `hrm_transfer` |
| P-TRAIN | SPEC_GAP | — (draft not locked) |
| P-EXIT | GOVERNANCE_LOCK | `hrm_exit_approval` / `hrm_exit` |
| P-PAY-EX | SPEC_GAP | — |
| P-DISCIPLINE | SPEC_GAP | — |
| P-CAT-EXT | AS-IS | `wf_hrm_catalog_extension_*` / `hrm_catalog_extension` |

### Residual

- **qa** synth / pack WF×catalog: create-def chỉ AS-IS + GOVERNANCE_LOCK; SPEC_GAP = PLANNED/BLOCKED; P-ATT-ADJ XBOS inbox BLOCKED until bridge; P-LEAVE ladder TC BLOCKED.
- Taxonomy §3 vẫn ghi CANDIDATE wording cho một số row — optional ba-process DOC-DELTA pointer tới lock (không block QA nếu dùng company matrix §2 + lock SoT).

---

## Spec / data refs

| Ref | Use |
|-----|-----|
| `PO_WF_CANDIDATE_CODE_LOCK.md` §3 · §6 | Normative decision + QA rules |
| `po-wf-cat-candidate-lock-01.md` | SA PASS evidence |
| `PO_WF_CATALOG_COMPANY_MATRIX.md` §2 | Updated deliverable |
| `PO_WF_PROCESS_TAXONOMY.md` | Consistency read |

---

## next_owner

**pm** → **qa** (`PO-ECO-TC-SYNTH-WF-CAT-01` hoặc pack `PO-ECO-TC-XBOS-WF-MATRIX`)

---

## next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-SYNTH-WF-CAT-01
from_role: pm
to_role: qa
lane: execution
ack_status_target: PASS_TO_PM

Mission: Synth / plan TC packs for enterprise WF×catalog matrix using locked codes from company matrix §2 + candidate lock.
read_first:
1. docs/program/matrices/PO_WF_CANDIDATE_CODE_LOCK.md §3–§6
2. docs/program/matrices/PO_WF_CATALOG_COMPANY_MATRIX.md §2 (code_status column — post LOCK-REFRESH)
3. docs/program/matrices/PO_WF_PROCESS_TAXONOMY.md
4. docs/program/PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md §6
5. docs/qa/evidence/po-wf-cat-company-matrix-lock-refresh-01.md
6. docs/qa/evidence/po-wf-cat-candidate-lock-01.md

Rules:
- Create-def TC: only AS-IS + GOVERNANCE_LOCK — mark GOVERNANCE_LOCK rows as not yet in workflow-catalog.constants.ts.
- SPEC_GAP (P-OT, P-TRAIN, P-DISCIPLINE, P-PAY-EX): TC PLANNED/BLOCKED — cấm assert spawn with draft names.
- P-ATT-ADJ: HRM approve path OK; XBOS inbox instance BLOCKED until bridge.
- P-LEAVE: keep hrm_leave_approval; LV-02 / T_L1 BLOCKED — cấm invent N.
- U65 zero-seed; no apps/**; no UAT DONE claim.
- Do not invent co_keys; use Primary/Spot from company matrix §2 as-is.

exit_criteria:
1. Pack or synth evidence lists process_id × co_key × code_status
2. Dedupe vs XBOS-WF-DESIGNER / INBOX-CAT
3. evidence_path under docs/qa/evidence/
4. ack_status PASS_TO_PM
```

---

## ack_status

**PASS_TO_PM**

## evidence_path

`docs/qa/evidence/po-wf-cat-company-matrix-lock-refresh-01.md`
