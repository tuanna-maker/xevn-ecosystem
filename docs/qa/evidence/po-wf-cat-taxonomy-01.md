# PO-WF-CAT-TAXONOMY-01 — BA-Process evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-WF-CAT-TAXONOMY-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **lane** | governance |
| **uat_done** | **false** |
| **u65_zero_seed** | true (documented; no test execution) |
| **no_prompt_echo** | true |
| **deliverable** | `docs/program/matrices/PO_WF_PROCESS_TAXONOMY.md` |

---

## completion_report

**Closed**

- Đọc program `PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md` §3–§5 và map **14** `process_id` → `workflowCode` / `businessType` / trạng thái **AS-IS | AS-IS (HRM-only) | SPEC_GAP | CANDIDATE**.
- **AS-IS (5 WF codes):** `hrm_recruitment_plan_approval`, `hrm_requisition_approval`, `hrm_candidate_pipeline`, `hrm_leave_approval`, `wf_hrm_catalog_extension_xe_du_lich` (+ business types tương ứng trong `workflow-catalog.constants.ts`).
- **AS-IS (HRM-only):** P-ATT-ADJ — `attendance_update_requests` approve path; **SPEC_GAP** XBOS bridge.
- **CANDIDATE (8 families):** P-OT, P-CONTRACT, P-PROBATION, P-TRANSFER, P-DISCIPLINE, P-TRAIN, P-EXIT, P-PAY-EX — không có entry trong `workflow-catalog.constants.ts` (grep xbos-api + hrm bridges).
- **SPEC_GAP nội bộ P-LEAVE:** L1→L2 ladder / `T_L1` — AS-IS graph 1-step; align GAP-LEAVE-LADDER-01 · LV-02 BLOCKED.
- Bổ sung **12 BR logistics** §5 (`BR-PO-REC-LGX-*`, `BR-PO-TRAIN-LGX-*`, `BR-PO-OT-LGX-*`, `BR-PO-ATT-LGX-*`) cho P-REC / P-TRAIN / P-OT / P-ATT-ADJ.
- **Không** sửa `apps/**` · **không** seed · **không** claim UAT DONE.

**Residual**

- `PO-WF-CAT-COMPANY-MATRIX-01` (ba-data + ba-process AC cột).
- SA lock tên CANDIDATE + API_DESIGN bridge OT/ATT-ADJ.
- QA TC matrix packs §6 program (PLANNED only).

---

## Map summary (machine-readable)

```json
{
  "as_is_xbos": [
    {"process_id": "P-REC-PLAN", "workflowCode": "hrm_recruitment_plan_approval", "businessType": "hrm_recruitment_plan"},
    {"process_id": "P-REC-REQ", "workflowCode": "hrm_requisition_approval", "businessType": "hrm_requisition"},
    {"process_id": "P-REC-PIPE", "workflowCode": "hrm_candidate_pipeline", "businessType": "hrm_candidate"},
    {"process_id": "P-LEAVE", "workflowCode": "hrm_leave_approval", "businessType": "hrm_leave", "note": "L2 ladder SPEC_GAP"},
    {"process_id": "P-CAT-EXT", "workflowCode": "wf_hrm_catalog_extension_xe_du_lich", "businessType": "hrm_catalog_extension"}
  ],
  "as_is_hrm_only": [
    {"process_id": "P-ATT-ADJ", "entity": "attendance_update_requests", "wf_gap": true},
    {"process_id": "P-OT", "entity": "overtime_requests", "wf_gap": true}
  ],
  "candidate_count": 8
}
```

---

## Spec refs cited

| Ref | Use |
|-----|-----|
| `PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md` §3 | Taxonomy P0–P2 |
| `workflow-catalog.constants.ts` | WF code SoT |
| `leave-workflow.bridge.ts` · `recruitment-workflow.bridge.ts` | Bridge AS-IS |
| `docs/hrm/TECHSPEC.md` §16–18 | Leave AT-12 · Rec submit-workflow |
| `docs/qa/testcases/hrm-web/HRM-ATTENDANCE.md` LV-02 | Ladder BLOCKED |
| `docs/qa/evidence/po-e2e-leave-ladder-qc-docs-01.md` | T_L1 HOLD |

---

## next_owner

**pm** → dispatch **ba-data** `PO-WF-CAT-COMPANY-MATRIX-01`; parallel plan **qa** TC matrix packs after matrix file.

---

## next_dispatch_prompt

```text
work_item_id: PO-WF-CAT-COMPANY-MATRIX-01
from_role: pm
to_role: ba-data
lane: governance

Mission: Ma trận process×company×catalog key bám PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md §4–§5 và docs/program/matrices/PO_WF_PROCESS_TAXONOMY.md §3 (process_id, WF map, gap).

Tasks:
1. Tạo docs/program/matrices/PO_WF_COMPANY_PROCESS_MATRIX.md — cột co_key (CO-HOLD, CO-TMDV, CO-VISUN, CO-DL, CO-VN) × process_id Primary/Spot/— + catalog keys P0.
2. Mỗi ô Primary: ≥1 AC measurable (FE publish/apply/pull hoặc instance path) — U65, cấm seed.
3. Evidence docs/qa/evidence/po-wf-cat-company-matrix-01.md · ack PASS_TO_PM · handoff qa PO-ECO-TC-* packs.

read_first: PO_WF_PROCESS_TAXONOMY.md · PILOT_SCOPE_DATA_MATRIX.md · PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md §5
cấm: apps/** · invent workflowCode · UAT DONE
```

---

*PO-WF-CAT-TAXONOMY-01*
