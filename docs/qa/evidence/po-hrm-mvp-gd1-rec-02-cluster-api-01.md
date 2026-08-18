# Evidence — PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01` |
| **role** | sa · governance |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** |
| **date** | 2026-08-09 |
| **spec** | `docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md` |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **change_mode** | Docs + client DOC-DELTA pointer · **NO** `apps/**` · **no seed** |

---

## 1. Read-first checklist

| # | Artifact | Result |
|---|----------|--------|
| 1 | DATA-01 CONFIRMED | Physical SoT `job_requisitions` UPGRADE · O2 409 · O4 LEGACY_UNCLASSIFIED · DENY dual `rec_*` |
| 2 | SA-01 §8 Y-S1..Y-S13 | Option A LOCKED · one XBOS WF · BOD block default · F-REC-YCTD-01..04 disposition |
| 3 | BA-01 O1–O5 · VAL-01..18 · Diễn biến | Physical prefer · O2 reject · O3 `open_for_hire` · O4 classify · O5 proposals HOLD |
| 4 | Evidence data-01 | Residual R-REC-02-API = this seat |
| 5 | Nest AS-IS | `POST/GET/PATCH requisitions` + `submit-workflow` LIVE · create→`open` gap · hire/out/matrix/pipeline **ABSENT** · no transitions/pipeline-flags routes |
| 6 | Paper F-REC-YCTD-* | Logical alias `/rec/recruitment-requests*` — stamped physical prefer |

---

## 2. F.1 physical lock summary

| F-id | Physical METHOD/path | Status |
|------|----------------------|--------|
| **F-REC-YCTD-01** | `POST /recruitment/requisitions` + `POST …/submit-workflow` (`in_plan`) | **UPGRADE** |
| **F-REC-YCTD-02** | Same paths (`out_of_plan` + reason + LONG/BOD) | **UPGRADE semantics** |
| **F-REC-YCTD-03** | WF callback RETAIN + **ADD** `POST …/transitions` | **ADD** |
| **F-REC-YCTD-04** | **ADD** `PATCH …/pipeline-flags` | **ADD** |
| List/get/patch | `GET/PATCH/PUT …/requisitions*` | **UPGRADE** + U19 |
| Paper `/rec/recruitment-requests*` | — | **alias only** · DENY Nest invent |

---

## 3. DTO ↔ column (cite DATA-01)

| API DTO | DB |
|---------|-----|
| `headcount_mode` | `job_requisitions.headcount_mode` |
| `headcount_cell_id` | `job_requisitions.headcount_cell_id` |
| `headcount` | `job_requisitions.headcount` |
| `hire_reason` (`replace` ← paper `replacement`) | `job_requisitions.hire_reason` |
| `replace_employee_id` | `job_requisitions.replace_employee_id` |
| `out_of_plan_reason` | `job_requisitions.out_of_plan_reason` |
| `approval_matrix_key` | `job_requisitions.approval_matrix_key` |
| `pipeline_flags` | `job_requisitions.pipeline_flags_json` |
| `job_template_id` / alias `job_description_id` | `job_requisitions.job_template_id` |
| `status` receivable | `open_for_hire` (CHK EXPAND) |

---

## 4. Errors + O2/O4 + XBOS + U19

| Lock | Stamp |
|------|-------|
| `HRM-YCTD-CELL-QTY` | **O2** 409 reject · no silent in_plan |
| `HRM-YCTD-BOD-REQUIRED` / `NOT-RECEIVABLE` | Y-S9 out_of_plan gate |
| `HRM-YCTD-MODE-UNCLASSIFIED` | **O4** CV/flags block |
| `HRM-YCTD-CELL-*` · `OUT-REASON` · `HIRE-REASON` · `SPAWN-DUP` · `MATRIX-MISMATCH` | Spec §8 |
| XBOS | One `hrm_requisition_approval` · conditions `headcount_mode` + `hire_reason` |
| U19 | list = get = mutate = submit = transitions = flags |
| BA O2/O3/O4/O5 | Reject / `open_for_hire` / classify / proposals HOLD |

---

## 5. DENY / must_keep audit

| Lock | Stamp |
|------|-------|
| Option A | **CONFIRMED** |
| REC-01 spawn/cell UQ / JD soft FK / XBOS requisition | **RETAIN** |
| UF-HRM-12🟢 · J-HRM-JD-YCTD-01 · J-REC-WF-* | **must_keep** |
| Dual `rec_*` · Nest `/rec` dual · REC-03 · seed · honesty flip · warn-cho-qua | **DENY** |
| `recruitment_uat_ready` | **false** |
| preserve_default | **true** |

---

## 6. Client API_DESIGN pointer

| Action | Path |
|--------|------|
| EXPAND F-REC-YCTD-01..04 physical stamp | `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md` |
| Registry DOC-DELTA | same · `PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01` |
| Team SoT primary | `docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md` |

---

## 7. Honesty footer

```text
recruitment_uat_ready=false
program honesty flags=false
C-SLICE ≠ module REC UAT
U65 zero-seed
no apps/** this seat
```

---

## 8. Completion

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **next_owner** | **pm** → unlock **dev-be** (`…-BE-01`) + **dev-fe** (`…-FE-01`) same session · rule 26 split |
| **completion_report** | F.1 PHYSICAL Option A locked: requisitions* + ADD transitions/pipeline-flags; DTO↔DATA-01; HRM-YCTD-*; O2/O4; one WF conditions; U19; DENY dual SoT/path/REC-03/seed/honesty. |

### next_dispatch_prompt

See spec § **next_dispatch_prompt** — both **BE-01** and **FE-01** copy-ready blocks.
