# PO-ECO-TC-HRM-WF-INSTANCE-MATRIX-01 — QA evidence (TC pack authoring)

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-ECO-TC-HRM-WF-INSTANCE-MATRIX-01` |
| **from_role** | qa |
| **to_role** | qa-synth / pm |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **u65_zero_seed** | true (every INST/AP precond = FE Gửi/Gửi duyệt/Extension; empty inbox = BLOCKED) |
| **hdsd_align** | true (Tuyển dụng Gửi duyệt QT · ESS leave · Mgr Duyệt · UF-15→09 · CC Inbox) |
| **uat_done** | **false** — design pack only; no browser/device execution this task |
| **pack_path** | `docs/qa/testcases/hrm-web/HRM-WF-INSTANCE-MATRIX.md` |
| **apps_touched** | none |

---

## completion_report

**Closed**

- Read taxonomy (AS-IS vs CANDIDATE · leave L1→L2 SPEC_GAP) · company matrix §2 · program §5–§7 · def pack `XBOS-WF-PROCESS-MATRIX` · inbox `XBOS-INBOX-CAT` · `MOB-LEAVE-APPR` · REC/ATT depth packs.
- Published **HRM-WF-INSTANCE-MATRIX** with dual-surface index (web + mobile + CC approve) — **no** designer chrome duplication.
- Mapped **7 Primary cells** for AS-IS P0 (P-REC-PLAN×TMDV · P-REC-REQ×TMDV+VISUN · P-REC-PIPE×TMDV · P-LEAVE×DL · P-ATT-ADJ×TMDV · P-CAT-EXT×DL) — each ≥1 INST + approve XREF.
- Documented **Leave L2 / T_L1** as **SPEC_GAP** (`TC-HIM-LEAVE-DL-SG-L2-001`) — does **not** claim ladder PASS.
- Spot samples ≥1 per `co_key` (HOLD/TMDV/VISUN/DL/VN).
- CANDIDATE inventory (P-OT Primary TMDV + P-CONTRACT/PROBATION/TRANSFER/TRAIN/EXIT/DISCIPLINE/PAY-EX) — **no invented workflowCode**.
- Columns: `process_id` · `co_key` · persona · channel · `hdsd_align` · XREF to TC-WFM / TC-XIC / TC-MOB-LV / TC-REC / TC-ATT.
- **depth_gate** all ☑ · **43** documented TC rows (22 primary block · 11 spot · 10 SG).

**Residual**

- Synth: dedupe `TC-HIM-*` vs depth packs / WFM / INBOX / MOB-LEAVE; roster + `PO_SPEC_TEST_REPORT` depth § → **`PO-ECO-TC-SYNTH-WF-CAT-01`** (after CAT-MEMBER ready).
- Browser/device execution deferred — all **PLANNED**.
- Open product gaps (not this WI): leave ladder HOLD · P-ATT-ADJ XBOS bridge · CANDIDATE OT/office codes.

---

## Primary coverage summary (for synth)

| process_id | Primary co_key | INST TC | Approve XREF |
|------------|----------------|---------|--------------|
| P-REC-PLAN | CO-TMDV | TC-HIM-REC-PLAN-TMDV-HP-001 | TC-XIC-WF-HP-002/003 |
| P-REC-REQ | CO-TMDV · CO-VISUN | …-TMDV-HP-001 · …-VISUN-HP-001 | TC-XIC-WF-HP-003 |
| P-REC-PIPE | CO-TMDV | TC-HIM-REC-PIPE-TMDV-HP-001 | TC-XIC-WF-HP-002/003 |
| P-LEAVE | CO-DL | TC-HIM-LEAVE-DL-HP-001 | TC-MOB-LV-MGR-* · TC-XIC-WF-HP-004 |
| P-LEAVE L2 | CO-DL | — | **SPEC_GAP** SG-L2-001 |
| P-ATT-ADJ | CO-TMDV | TC-HIM-ATT-TMDV-HP-001 | HRM/Mobile Mgr (not XBOS until bridge) |
| P-CAT-EXT | CO-DL → HOLD | TC-HIM-CAT-DL-HP-001 | TC-XIC-EXT/CG |
| P-OT | CO-TMDV Primary | — | **SPEC_GAP** SG-OT (CANDIDATE) |

---

## spec_ref

- `docs/program/matrices/PO_WF_PROCESS_TAXONOMY.md`
- `docs/program/matrices/PO_WF_CATALOG_COMPANY_MATRIX.md` §2
- `docs/program/PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md` §5–§7 (U84 DoD §7.2)
- `docs/qa/testcases/xbos/XBOS-WF-PROCESS-MATRIX.md`
- `docs/qa/testcases/xbos/XBOS-INBOX-CAT.md`
- `docs/qa/testcases/hrm-mobile/MOB-LEAVE-APPR.md`
- `docs/qa/testcases/_TEMPLATE_MENU_TC_PACK.md`

---

## next_owner

**pm** → dispatch **`PO-ECO-TC-SYNTH-WF-CAT-01`** after **CAT-MEMBER** (`PO-ECO-TC-XBOS-CAT-MEMBER-01`) is READY_FOR_SYNTH / synched.

---

## next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-SYNTH-WF-CAT-01
from_role: pm
to_role: qa
lane: execution
ack_status_target: PASS_TO_PM

Mission: SYNTH dedupe enterprise WF×catalog matrix TC packs after CAT-MEMBER:
1) docs/qa/testcases/xbos/XBOS-WF-PROCESS-MATRIX.md (TC-WFM-*)
2) docs/qa/testcases/xbos/XBOS-CATALOG-MEMBER-MATRIX.md (TC-XCM-*)
3) docs/qa/testcases/hrm-web/HRM-WF-INSTANCE-MATRIX.md (TC-HIM-*)
against XBOS-WF-DESIGNER · XBOS-INBOX-CAT · MOB-LEAVE-APPR · HRM-RECRUITMENT · HRM-ATTENDANCE · HRM-SETTINGS · PO_SPEC_TEST_CASE_CATALOG.

read_first:
- docs/qa/evidence/po-eco-tc-hrm-wf-instance-matrix-01.md
- docs/qa/evidence/po-eco-tc-xbos-cat-member-01.md
- docs/qa/evidence/po-eco-tc-xbos-wf-matrix-01.md
- docs/program/PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md §6–§7

exit_criteria:
- evidence docs/qa/evidence/po-eco-tc-synth-wf-cat-01.md
- 0 duplicate TC-ID collisions across WFM/XCM/HIM vs INBOX/LEAVE depth
- roster rows SYNTHED; PO_SPEC_TEST_REPORT Ecosystem depth § updated
- Primary cell coverage table preserved; leave L2 remains SPEC_GAP
- ack_status PASS_TO_PM; uat_done false; no apps/**; no seed; no browser UAT claim
```

---

## Handoff contract

| Field | Value |
|-------|-------|
| **completion_report** | Pack authored; 7 Primary AS-IS cells covered; leave L2 SPEC_GAP; 43 TC rows PLANNED; no UAT |
| **next_owner** | pm → qa (`PO-ECO-TC-SYNTH-WF-CAT-01`) |
| **next_dispatch_prompt** | see § above |
| **ack_status** | **READY_FOR_SYNTH** |
| **evidence_path** | `docs/qa/evidence/po-eco-tc-hrm-wf-instance-matrix-01.md` |
| **uat_done** | **false** |

---

*PO-ECO-TC-HRM-WF-INSTANCE-MATRIX-01*
