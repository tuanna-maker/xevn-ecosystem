# Evidence — PO-HRM-MVP-GD1-REC-02-CLUSTER-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-02-CLUSTER-SA-01` |
| **role** | sa · governance |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** |
| **date** | 2026-08-09 |
| **spec** | `docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-SA-01.md` |
| **depends_on** | QC-02 GWC REC-01/01b — `docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-qc-02.md` |
| **uc_ids** | `UC-BP-REC-02` · `UC-BP-REC-02b` |
| **selected_option** | **A** — UPGRADE `job_requisitions` + one XBOS requisition WF · mode as matrix condition · default block open-tin until BOD (out_of_plan) |
| **ack_status** | **PASS_TO_PM** CONFIRMED |
| **change_mode** | Docs-only · **NO** `apps/**` · **no seed** |

---

## 1. Read-first checklist

| # | Artifact | Result |
|---|----------|--------|
| 1 | `PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01.md` | Option A spine — reuse; no fork `rec_headcount_*` / plan SoT |
| 2 | REC-01 API-01 + DATA-01 | `headcount_mode` / `headcount_cell_id` / spawn UQ already ADD |
| 3 | QC-02 GWC | REC-01/01b C-SLICE sealed; PM may open REC-02/02b; honesty false RETAIN |
| 4 | SRS FR-02 / 02b | 7-mục · matrix conditions · Q-REC-HEADCOUNT chốt · default chặn đến BOD |
| 5 | WBS-REC-02 / 02b | BR-BP-HC-05/06 · hire new/replace |
| 6 | Paper API F-REC-YCTD-01..04 | Physical prefer `/recruitment/requisitions*` |
| 7 | AS-IS apps | See §2 |
| 8 | ADR Option template §§1–7 + F.1 | Applied in spec |

---

## 2. AS-IS probes (facts)

| Probe | Evidence |
|-------|----------|
| YCTD table | `public.job_requisitions` LIVE · JD soft FK `job_template_id` |
| Mode columns | REC-01 ensureSchema ADD `headcount_cell_id` · `headcount_mode` · `target_month` + CHK + spawn UQ partial |
| Create path | `recruitment.service.ts` `createJobRequisition` INSERT `status='open'` — **no** mode/hire_reason/out_of_plan_reason |
| Requisition WF | `recruitment-workflow.bridge.ts` · `WF_HRM_REQUISITION_APPROVAL_CODE` · business_type `hrm_requisition` |
| Plan WF | `hrm_recruitment_plan_approval` RETAIN (peer) |
| Spawn | `POST …/spawn-requests` LIVE post REC-01 — sets `in_plan` + cell |
| Proposals | `headcount_proposals` leftover — ≠ YCTD SoT (REC-01 HOLD) |
| Receivable filter | `listJobRequisitions` accepts `open`\|`approved`\|`open_for_hire` |
| Q-REC-HEADCOUNT | Decision Log **Đã chốt** — ngoài ĐB + BOD + XBOS tenant |
| Q-REC-HC-2 | TP + HR RETAIN |
| Honesty | `recruitment_uat_ready=false` must_keep |

---

## 3. Disposition summary

| Item | Value |
|------|-------|
| Option A | UPGRADE YCTD spine · mode fork · hire_reason · BOD receivable gate · one WF + conditions |
| Option B | Greenfield `rec_recruitment_request` / dual Nest — **REJECTED** |
| Option C | HOLD — **REJECTED** (U89) |
| F.1 unlock | YCTD-01 UPGRADE · YCTD-02 ADD semantics · YCTD-03 semantics · YCTD-04 ADD · JD-* RETAIN · HC-05 RETAIN · Campaign OUT |
| Invariants | Y-S1..Y-S13 |
| DENY | REC-03 · dual SoT · dual Nest path · seed · honesty flip · re-litigate Q-REC-HEADCOUNT · warn-cho-qua default |

---

## 4. Honesty / C-SLICE footer

```text
recruitment_uat_ready=false
C-SLICE ≠ module REC UAT
U65 zero-seed
product_go=false (program)
UC-BP-REC-03 OUT
no dual rec_headcount_*
REC-01 Option A spine RETAIN
```

---

## 5. BA handoff notes

| Item | Note |
|------|------|
| Next | `PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01` AC pack |
| Confirm | O2 vượt ô (reject vs force out_of_plan) · O3 receivable token · O4 legacy open rows · O5 proposals CTA |
| Cite | BR-BP-HC-05/06 · FR Diễn biến · Q-REC-HEADCOUNT RETAIN · Q-REC-HC-2 |
| Peer | `R-REC-HC-OVERRIDE-CELLID` BA parallel — **orthogonal** to this SoT |

---

## 6. Spec size

| Artifact | Note |
|----------|------|
| Spec path | `docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-SA-01.md` |
| Evidence path | this file |
| Path lock | NFD `Tài liệu` workspace |

---

## completion_report

- **Closed:** Option A CONFIRMED for UC-BP-REC-02/02b; F.1 unlock list; preserve job_requisitions + XBOS + REC-01 spawn; BOD block default; honesty/C-SLICE.
- **Residual:** BA AC → DATA/API → Dev; no apps/** this seat.

| Field | Value |
|-------|--------|
| **next_owner** | **ba-process** |
| **ack_status** | **PASS_TO_PM** CONFIRMED |
| **next_dispatch_prompt** | see handoff block below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01
lane: governance · ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-02 · UC-BP-REC-02b
depends_on: SA-01 Option A CONFIRMED — docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-SA-01.md
ref_evidence: docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-sa-01.md
MISSION: AC pack (AC-REC-YCTD-02 / 02b · VAL · Diễn biến FE · J-HRM-REC-YCTD-02/02b DRAFT) against Option A:
- in_plan: cell approved + hire_reason new|replace + SHORT matrix (TP+HR; BOD only if tenant CFG)
- out_of_plan: out_of_plan_reason + LONG matrix + DEFAULT block open_for_hire/CV until BOD
- RETAIN Q-REC-HEADCOUNT · Q-REC-HC-2 · JD bind · REC-01 spawn spine
- CONFIRM SA O2–O5 (vượt ô · receivable token · legacy open · proposals HOLD)
- DENY REC-03 · dual SoT · seed · honesty flip · re-litigate Q-REC-HEADCOUNT · invent warn-cho-qua
exit: PASS_TO_PM CONFIRMED · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-ba-01.md
```
