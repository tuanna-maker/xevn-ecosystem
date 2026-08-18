# Evidence — PO-HRM-MVP-GD1-REC-04-CLUSTER-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-04-CLUSTER-SA-01` |
| **lane** | governance · sa |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **uc_ids** | `UC-BP-REC-04` |
| **Date** | 2026-08-09 |
| **depends_on** | Wave-5 QC-01 GWC stamp `REC00QC1-MSL0JMUT` · `po-hrm-mvp-gd1-rec-00-cluster-qc-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-SA-01.md` |
| **ack_status** | **PASS_TO_PM** · Option **A** **CONFIRMED** |
| **change_mode** | ADD Option/F.1 · **NO** `apps/**` · **no seed** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| Option A/B/C for internal CV scan-before-external vs AS-IS pool / applications / YCTD | **PASS** — Option **A** LOCKED |
| F.1 disposition physical prefer + F-REC-CV-SCAN-* residual | **PASS** — §8; UV-YCTD/CMP/YCTD flags RETAIN |
| must_keep REC-00/01/02/08/06a seals · UV-YCTD | **PASS** — §6.3 |
| DENY Nest `/rec` dual · second CV SoT · REC-03 reopen · honesty flip · seed | **PASS** — §5/§6.2 |
| Unlock BA AC after CONFIRMED · cấm code until CONFIRMED | **PASS** — next ba-process; no Dev unlock |
| Template ADR_OPTION §§1–7 + F.1 | **PASS** |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| Board | `PO_HRM_MVP_GD1_CONTINUOUS.md` #8 WAVE-6 |
| SRS | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-REC-04 · BR-BP-CV-01 · Diễn biến #1–#2 |
| WBS / BR depth | WBS-REC-03 · REQ_REC_002 · `UC_BR_MATRIX_DEPTH.md` UC-BP-REC-04 |
| UV-YCTD | `PO-HRM-REC-UV-YCTD-API-01` · DB-01 ONE soft FK `requisition_id` |
| Paper DB | §2.4 `rec_candidate` · §2.5 application = logical alias |
| AS-IS code (read-only) | `recruitment.controller.ts` candidates-pool* · candidates* · candidate-applications* · applications · compare · pipeline-flags; `yctd-requisition-gates.ts` PipelineFlags; `recruitment-catalog.service.ts` createCandidatePool |
| Peers SA | REC-00/01/02/08/06A Option A pattern |
| depends_on stamp | `REC00QC1-MSL0JMUT` |

---

## 3. Decision summary

| | |
|--|--|
| **Selected** | **Option A** — ACCEPT_AS_IS_UPGRADE on candidates-pool + Lane A/applications + YCTD `pipeline_flags` |
| **Rejected B** | Greenfield `rec_candidate` + Nest `/rec` dual + scan-only SoT |
| **Rejected C** | HOLD / claim UV-YCTD = FR-04 DONE / flip honesty |
| **Kho SoT** | Lane B `public.candidates` via `/recruitment/candidates-pool*` |
| **Attach SoT** | UV-YCTD / applications N–N (`requisition_id` only) |
| **Scan audit** | Prefer ADD `internal_scan_*` on `pipeline_flags_json` (O2) |
| **External gate** | DENY `posted=true` until scan done \| skip valid; REC-03 OUT |
| **Paper** | `rec_candidate` · `/rec/*` = **alias only** |
| **Honesty** | `jd_dynamic_done=false` · `recruitment_uat_ready=false` · C-SLICE |

---

## 4. Residual unlocked for BA (not Dev yet)

| ID | Residual |
|----|----------|
| O2 | Flags `internal_scan_*` vs columns vs optional append-event |
| O3–O4 | Kho surface + match criteria depth (skill family) |
| O5/O7 | Posted gate + skip permission/reason VAL |
| O1/O6/O8 | Path cite · UV-YCTD/CMP must_keep · honesty footer |

---

## 5. Honesty / DENY footer

| Flag / claim | Status |
|--------------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD |
| Module REC UAT / Phase1 DONE | **DENIED** |
| Seed in evidence | **DENIED** |
| Nest `/rec` dual SoT | **DENIED** |
| Second CV person SoT | **DENIED** |
| REC-03 Campaign reopen | **DENIED** |
| Reopen sealed REC-00 / W1–W4 without regression | **DENIED** |
| `apps/**` this seat | **NONE** |

---

## 6. Files touched (docs-only)

| Path | Action |
|------|--------|
| `docs/program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-SA-01.md` | ADD |
| `docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-sa-01.md` | ADD (this file) |
| `docs/program/AGENT_MESSAGE_BUS.md` | APPEND PASS_TO_PM |
| `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` | seat #8 status → SA Option A CONFIRMED |

---

## completion_report

- **Closed:** Option A CONFIRMED for UC-BP-REC-04; F.1 F-REC-CV-SCAN-01..03 disposition on LIVE pool + YCTD flags; must_keep W1–W5 + UV-YCTD; DENY Nest dual / second CV SoT / REC-03 / honesty / seed; unlock BA.
- **Residual:** BA AC O1–O8; optional ba-data if O2 needs columns; Dev after contracts — **no code this seat**.

## next_owner

**ba-process**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-04-CLUSTER-BA-01
lane: governance · ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-04
depends_on: SA-01 Option A CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-SA-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-sa-01.md · stamp REC00QC1-MSL0JMUT peer sealed
spec_ref: SRS FR-UC-BP-REC-04 · BR-BP-CV-01 · SA O1–O8
MISSION — BA AC pack (narrow):
1) CONFIRMED AC for Diễn biến #1–#2 + special 0-hits + skip+reason; map O1–O8
2) VAL + FE U65 click path on YCTD «Quét kho» · Network physical /recruitment/* only
3) J-HRM-REC-CV-04-* DRAFT; cite must_keep UV-YCTD/CMP/open_for_hire/pipeline_flags; DENY Nest /rec dual · second CV SoT · REC-03 · seed · honesty flip · reopen REC-00 without regression
4) Unlock next: ba-data ONLY if O2 needs columns/event table · else sa API F.1 residual F-REC-CV-SCAN-*
cấm: invent beyond SRS · claim recruitment_uat_ready / jd_dynamic_done · module REC UAT · apps/**
exit: docs/program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-BA-01.md · docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-ba-01.md · PASS_TO_PM
```

## ack_status

**PASS_TO_PM**
