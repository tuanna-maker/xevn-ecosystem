# Evidence — PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **from_role** | ba-process |
| **to_role** | pm → **ba-data** rồi **sa** (API F.1) |
| **Date** | 2026-08-09T03:19:59+07:00 |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md` |
| **ref_sa** | `docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-SA-01.md` **Option A LOCKED** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-REC-02 · FR-UC-BP-REC-02b |
| **lane** | governance |
| **no_prompt_echo** | true |
| **uc_ids** | `UC-BP-REC-02` · `UC-BP-REC-02b` |

---

## 1. Scope closed

| Item | Result |
|------|--------|
| AC pack vs SRS FR-02/02b | **CONFIRMED** |
| Align SA **Option A** (UPGRADE `job_requisitions` + one XBOS WF + mode conditions) | **CONFIRMED** |
| **O1** physical path | **CONFIRMED** — `/recruitment/requisitions*` · paper alias only · DENY dual Nest/table |
| **O2** vượt ô in_plan | **CONFIRMED** — MVP default **409 reject** · no silent · CFG force_out_of_plan **HOLD** |
| **O3** receivable token | **CONFIRMED** — normative **`open_for_hire`** · submit→`pending_approval` · `open` synonym filter only |
| **O4** legacy open without mode | **CONFIRMED** — grandfather read · warn · **block CV** · classify-on-edit required |
| **O5** headcount_proposals | **CONFIRMED** — HOLD non-SoT · CTA OK · **DENY** dual-write |
| D-BOD / warn-cho-qua | **OUT** — DEFAULT **block** đến BOD · Q-REC-HEADCOUNT **RETAIN** |
| in_plan SHORT (TP+HR; BOD if CFG) · out_of_plan LONG + BOD gate | **CONFIRMED** |
| JD bind · REC-01 spawn/`headcount_cell_id` spine | **RETAIN** must_keep |
| FE after 2xx + F5 Diễn biến (02 + 02b) | **CONFIRMED** |
| VAL-REC-YCTD-01..18 · Y-S1..Y-S13 cite | **CONFIRMED** |
| J-HRM-REC-YCTD-02 / 02b DRAFT U19 | **ADDED** journey map + BA TRACE §27 |
| DENY REC-03 · dual SoT · seed · honesty false · C-SLICE · re-litigate Q-REC-HEADCOUNT | **Locked** |

---

## 2. Residual

| ID | Residual | Owner |
|----|----------|-------|
| Physical columns / CHK / receivable token / pipeline_flags | Option A EXPAND | **ba-data** |
| API F.1 depth YCTD-01..04 physical paths + error tokens | DOC-DELTA | **sa** |
| Dev wire create/submit/BOD gate/FE forks | After DATA+API | HOLD |
| Peer `R-REC-HC-OVERRIDE-CELLID` | Orthogonal | peer BE — **not** this SoT |

---

## 3. Honesty

```text
recruitment_uat_ready=false
C-SLICE ≠ module REC UAT
U65 zero-seed
UC-BP-REC-03 OUT
Q-REC-HEADCOUNT RETAIN (no re-litigate)
Q-REC-HC-2 RETAIN
no warn-cho-qua invent
no dual YCTD SoT
```

---

## 4. Spec size

| File | Note |
|------|------|
| BA spec | `docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md` |
| This evidence | rewritten Option A align |

---

## 5. completion_report

**Closed:** AC-REC-YCTD-02/02b pack CONFIRMED against SA Option A; O1–O5 sealed; VAL-01..18; FE mutate Diễn biến in/out; J-* DRAFT; sponsor locks RETAIN; DENY list locked.

**Open:** ba-data physical · sa API F.1 · Dev HOLD · UF matrix DRAFT until FE wire.

## 6. next_owner / next_dispatch_prompt

**next_owner:** `ba-data` **then** `sa` (API F.1) — PM may parallel.

### next_dispatch_prompt — ba-data (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-02 · UC-BP-REC-02b
depends_on: BA-01 O1–O5 CONFIRMED — docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md
ref_sa: docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-SA-01.md Option A · Y-S1..Y-S13
ref_evidence: docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-ba-01.md

MISSION: Physical DB DOC-DELTA for YCTD Option A UPGRADE job_requisitions (DENY second table / DENY Nest dual /rec path).
- ADD/EXPAND: hire_reason (new|replace) · replace_employee_id CHK · out_of_plan_reason · approval_matrix_key · pipeline_flags JSON · receivable status token open_for_hire (+ open synonym note)
- RETAIN: headcount_mode · headcount_cell_id · target_month · spawn UQ · JD soft FK job_template_id
- Legacy: headcount_mode NULL grandfather policy (BA O4) — document; no silent backfill invent
- O2 MVP: qty vượt ô → reject (no force_out_of_plan column required this wave unless CFG HOLD noted)
- Cite DB_DESIGN §2.3 logical alias only
- DENY: REC-03 · dual rec_recruitment_request physical · seed · honesty flip · re-litigate Q-REC-HEADCOUNT

DELIVER:
- docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md
- docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-data-01.md

EXIT: PASS_TO_PM CONFIRMED · next_owner sa (API F.1) or pm if API already parallel
```

### next_dispatch_prompt — sa API F.1 (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-02 · UC-BP-REC-02b
depends_on: BA-01 CONFIRMED · DATA-01 (prefer concurrent read of BA O1–O5 + SA-01)
ref_ba: docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md
ref_sa_option: docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-SA-01.md
ref_evidence_ba: docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-ba-01.md

MISSION: API F.1 DOC-DELTA depth on PHYSICAL paths only:
- F-REC-YCTD-01 UPGRADE in_plan create/submit
- F-REC-YCTD-02 ADD semantics out_of_plan
- F-REC-YCTD-03 approve/reject → open_for_hire / BOD gate tokens HRM-YCTD-BOD-REQUIRED · HRM-YCTD-NOT-RECEIVABLE · HRM-YCTD-CELL-*
- F-REC-YCTD-04 pipeline-flags ADD
Each function: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS (FR-02/02b Diễn biến #) · Request/Response→cột · lỗi nghiệp vụ
Physical: /api/hrm/recruitment/requisitions* (+ transitions / pipeline-flags) · paper /rec/recruitment-requests* = alias only
RETAIN: F-YCTD-JD-* · F-REC-HC-05 spawn · XBOS hrm_requisition_approval one business_type + conditions mode/hire_reason
Cite BA O2 reject default · O3 open_for_hire · O4 legacy · O5 proposals HOLD
DENY: REC-03 · dual Nest path · seed · honesty flip · invent warn-cho-qua · Campaign SoT

DELIVER:
- docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md
- docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-api-01.md

EXIT: PASS_TO_PM CONFIRMED · unlock Dev-BE/FE after DATA+API both CONFIRMED
```

## 7. ack_status

**PASS_TO_PM CONFIRMED**
