# Evidence — PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01` |
| **role** | ba-data · governance |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** |
| **date** | 2026-08-09 |
| **spec** | `docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md` |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **change_mode** | Docs + client DOC-DELTA pointer · **NO** `apps/**` · **no seed** · **no migrate run** |

---

## 1. Read-first checklist

| # | Artifact | Result |
|---|----------|--------|
| 1 | BA-01 O1–O5 · VAL-01..18 | **CONFIRMED** · physical prefer · O2 409 · O3 open_for_hire · O4 classify · O5 proposals HOLD |
| 2 | SA-01 Option A · Y-S1..Y-S13 | **LOCKED** · UPGRADE job_requisitions · one XBOS WF · BOD block default |
| 3 | REC-01 DATA-01 | Style match · cell_id / spawn UQ / mode columns **RETAIN** — no contradict |
| 4 | Nest AS-IS | `recruitment.service.ts` CREATE + REC-01 ADD cols · WF bridge status CHK **without** `open_for_hire` · create→`open` gap · hire/out/matrix/pipeline JSON **ABSENT** |
| 5 | Paper DB §2.3 | Logical columns already list hire/out/matrix/pipeline — stamped **alias** → physical UPGRADE |

---

## 2. AS-IS → TO-BE physical map

| Capability | AS-IS | DATA-01 stamp |
|------------|-------|---------------|
| YCTD SoT | `job_requisitions` | **UPGRADE** same table |
| Mode / cell / month / spawn UQ | LIVE post REC-01 | **RETAIN** |
| hire_reason / replace_employee_id | ABSENT | **ADD** |
| out_of_plan_reason | ABSENT | **ADD** |
| approval_matrix_key | ABSENT | **ADD** |
| pipeline_flags_json | ABSENT | **ADD** (`cv_intake_allowed` + posted/has_cv/…) |
| Status receivable | `open` immediate create | Submit→`pending_approval`; receivable **`open_for_hire`** in CHK |
| O2 vượt ô | No enforce | **409** · no silent in_plan |
| O4 NULL mode | Allowed + ungoverned | **LEGACY_UNCLASSIFIED** · block CV · no auto in_plan backfill |
| Dual `rec_recruitment_request` | Paper only | **DENY** physical CREATE |
| Nest `/rec/...` | Paper alias risk | **DENY** dual path |
| REC-03 | OUT | **DENY** Campaign SoT |

---

## 3. Column ↔ VAL seal (spot)

| VAL | Column / rule | HTTP class |
|-----|---------------|------------|
| 01 | headcount_mode | 400 |
| 02 | headcount_cell_id + need_hire_approved | 409 CELL-* |
| 03 | headcount vs cell (O2) | 409 CELL-QTY |
| 04 | out_of_plan_reason | 400 |
| 05–06 | hire_reason / replace_employee_id | 400 |
| 08/11 | status pending_approval → open_for_hire | FAIL if create→open |
| 10 | BOD + cv_intake_allowed/posted | 409 NOT-RECEIVABLE |
| 12 | uq_job_requisitions_spawn_cell RETAIN | 409 |
| 14 | NULL mode classify | 409 MODE-UNCLASSIFIED on CV |

---

## 4. DENY / must_keep audit

| Lock | Stamp |
|------|-------|
| Option A | **CONFIRMED** |
| REC-01 cell identity / spawn UQ / JD soft FK / XBOS requisition | **RETAIN** |
| UF-HRM-12🟢 · J-HRM-JD-YCTD-01 · J-REC-WF-* | **must_keep** |
| Dual rec_* table · Nest /rec dual · REC-03 · seed · honesty flip · hard delete | **DENY** |
| `recruitment_uat_ready` | **false** |
| preserve_default | **true** |

---

## 5. Client DB_DESIGN pointer

| Action | Path |
|--------|------|
| EXPAND §2.3 Wave-2 ADD note | `docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md` |
| Registry DOC-DELTA | same file · `PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01` |
| Team SoT primary | `docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md` |

---

## 6. Honesty footer

```text
recruitment_uat_ready=false
C-SLICE ≠ module REC UAT
U65 zero-seed
product_go=false (program)
UC-BP-REC-03 OUT
no apps/** this seat
O2=409 reject · O4=no silent in_plan backfill
```

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **next_owner** | **sa** |
| **next_work_item** | `PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01` |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **unlocks** | API F.1 physical DOC-DELTA → then Dev-BE/FE |
| **does_not_unlock** | Dev without API-01 · honesty flip · seed · REC-03 |

---

## 8. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-02 · UC-BP-REC-02b
depends_on: DATA-01 CONFIRMED — docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md · BA-01 O1–O5 · SA-01 Option A

MISSION: TechSpec/API F.1 DOC-DELTA on PHYSICAL Option A paths (not paper-only).
Lock DTO↔column for /api/hrm/recruitment/requisitions* (F-REC-YCTD-01..04):
create/submit in_plan + out_of_plan; transitions → open_for_hire; PATCH pipeline-flags;
error tokens HRM-YCTD-*; O2 409 CELL-QTY; O4 unclassified CV block; XBOS matrix conditions
(mode + hire_reason); scope_parity U19 list=get=mutate=flags=transitions.
Cite DATA-01 physical SoT. Paper /rec/recruitment-requests* = alias only.

READ FIRST:
1. docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md (CONFIRMED)
2. docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-SA-01.md §8 Y-S1..Y-S13
3. docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md AC/VAL
4. docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-data-01.md
5. API_DESIGN_HRM_ENTERPRISE.md F-REC-YCTD-* (logical alias only)

DELIVER:
- docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md
- docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-api-01.md
must_keep: Option A · REC-01 spawn/cell · JD soft FK · hrm_requisition_approval · REC-03 OUT · honesty false · U65 · DENY dual rec_* / Nest /rec dual
EXIT: PASS_TO_PM CONFIRMED · next_owner pm → unlock dev-be/fe after API CONFIRMED
```