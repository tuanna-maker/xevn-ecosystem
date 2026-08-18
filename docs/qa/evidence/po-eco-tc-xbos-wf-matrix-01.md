# PO-ECO-TC-XBOS-WF-MATRIX-01 — QA evidence (TC pack authoring)

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-ECO-TC-XBOS-WF-MATRIX-01` |
| **from_role** | qa |
| **to_role** | qa-synth / pm |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **u65_zero_seed** | true — every inbox XREF row assumes FE spawn; TC-XIC-WF-BD-001 when empty |
| **hdsd_align** | true — CH04 §4.2 · UF-XBOS-08 step 1 paths |
| **uat_done** | **false** — TC pack only; no browser execution this task |
| **pack_path** | `docs/qa/testcases/xbos/XBOS-WF-PROCESS-MATRIX.md` |
| **cross_ref** | `XBOS-WF-DESIGNER.md` (chrome) · `XBOS-INBOX-CAT.md` (XREF INBOX-CAT) |

---

## completion_report

**Closed**

- Read program **`PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md` §3** — mapped **6 P0** `process_id` families to AS-IS `workflowCode` from `workflow-catalog.constants.ts` (read-only).
- Published process-family pack **`XBOS-WF-PROCESS-MATRIX.md`**: **12** P0 TCs (6 HP create+save @ **CO-HOLD** + 6 FD) + **8** CANDIDATE **SPEC_GAP** inventory rows (UI only).
- Each P0 family links **XREF INBOX-CAT** (`TC-XIC-WF-*` · `TC-XIC-CG-*` · `TC-XIC-EXT-*`) — **no** duplicate approve matrix.
- **Không** duplicate SCR-WF chrome — pointer to **`XBOS-WF-DESIGNER.md` §1–3**.
- Documented **SPEC_GAP:** `P-ATT-ADJ` (no catalog builder code) · `P-LEAVE` L2 ladder · CANDIDATE P1/P2 codes absent from constants.
- **depth_gate** all ☑ on pack meta · **no** `apps/**` edits.

**Residual**

- **Synth:** merge `TC-WFM-*` vs `TC-WFD-*` / `TC-XIC-*` in `PO-ECO-TC-SYNTH-WF-CAT-01` wave; update roster + `PO_SPEC_TEST_REPORT.md` ecosystem depth.
- **BA `PO-WF-CAT-TAXONOMY-01`:** close `P-ATT-ADJ` `workflowCode` before TC-WFM-ATT-HP-001 execution.
- **R-REC-C-BRIDGE-01:** preset card may be ABSENT — HP rows allow manual **Mã** path.
- Browser execution deferred (U78 test-log pair when PM dispatches execution WI).

---

## P0 coverage summary

| process_id | workflowCode | HP | FD | INBOX XREF |
|------------|--------------|----|----|------------|
| P-REC-PLAN | `hrm_recruitment_plan_approval` | TC-WFM-REC-PLAN-HP-001 | TC-WFM-REC-PLAN-FD-001 | TC-XIC-WF-HP-002/003 |
| P-REC-REQ | `hrm_requisition_approval` | TC-WFM-REC-REQ-HP-001 | TC-WFM-REC-REQ-FD-001 | TC-XIC-WF-HP-002/003 |
| P-REC-PIPE | `hrm_candidate_pipeline` | TC-WFM-REC-PIPE-HP-001 | TC-WFM-REC-PIPE-FD-001 | TC-XIC-WF-HP-002/003 |
| P-LEAVE | `hrm_leave_approval` | TC-WFM-LEAVE-HP-001 | TC-WFM-LEAVE-FD-001 | TC-XIC-WF-HP-004/003 |
| P-ATT-ADJ | **SPEC_GAP** | TC-WFM-ATT-HP-001 (blocked) | TC-WFM-ATT-FD-001 | TC-XIC-WF-HP-003 (when wired) |
| P-CAT-EXT | `wf_hrm_catalog_extension_xe_du_lich` | TC-WFM-CAT-HP-001 | TC-WFM-CAT-FD-001 | TC-XIC-EXT-HP-001 → TC-XIC-CG-HP-001 |

---

## spec_ref

- `docs/program/PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md` §3 · §6 WI `PO-ECO-TC-XBOS-WF-MATRIX-01`
- UF-XBOS-08 · `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §3
- `docs/qa/testcases/xbos/XBOS-WF-DESIGNER.md` · `XBOS-INBOX-CAT.md`
- `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` DoD §2
- `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md` (execution deferred)

---

## next_owner

**qa-synth** (or **pm** to dispatch synth Task)

---

## next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-SYNTH-WF-CAT-01
from_role: pm
to_role: qa

Mission: SYNTH dedupe Wave B/C WF+catalog depth: docs/qa/testcases/xbos/XBOS-WF-PROCESS-MATRIX.md (TC-WFM-*) with XBOS-WF-DESIGNER.md (TC-WFD-*), XBOS-INBOX-CAT.md (TC-XIC-*), and PO_SPEC_TEST_CASE_CATALOG.md — FK process_id→inbox chain; update docs/qa/reports/PO_SPEC_TEST_REPORT.md Ecosystem depth § + docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md row for XBOS-WF-PROCESS-MATRIX.

read_first: XBOS-WF-PROCESS-MATRIX.md · evidence po-eco-tc-xbos-wf-matrix-01.md · PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md §3

exit_criteria: synth evidence md in docs/qa/evidence/; zero orphan TC-ID collisions for TC-WFM-*; UF-XBOS-08 step1=WFM/WFD step2=XIC documented; ack PASS_TO_PM. No browser run; no UAT DONE.
```

---

## Handoff contract

| Field | Value |
|-------|-------|
| completion_report | See § completion_report above |
| next_owner | qa-synth |
| next_dispatch_prompt | See block above |
| evidence_path | `docs/qa/evidence/po-eco-tc-xbos-wf-matrix-01.md` |
| ack_status | **READY_FOR_SYNTH** |

---

*Authoring only · IEEE 829 test execution logs required when TCs move to EVIDENCED*
