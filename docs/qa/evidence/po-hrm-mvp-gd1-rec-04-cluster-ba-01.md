# Evidence — PO-HRM-MVP-GD1-REC-04-CLUSTER-BA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-04-CLUSTER-BA-01` |
| **lane** | governance · ba-process |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **uc_ids** | `UC-BP-REC-04` |
| **Date** | 2026-08-09 |
| **depends_on** | SA-01 Option A CONFIRMED · `po-hrm-mvp-gd1-rec-04-cluster-sa-01.md` · peer seal `REC00QC1-MSL0JMUT` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-BA-01.md` |
| **ack_status** | **PASS_TO_PM** · O1–O8 **CONFIRMED** |
| **change_mode** | ADD AC pack · **NO** `apps/**` · **no seed** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| CONFIRMED AC Diễn biến #1–#2 + 0-hits + skip+reason | **PASS** — AC-REC-CV-04-01..06 · EX-01..03 · ALT |
| VAL + FE U65 YCTD Quét kho · Network `/recruitment/*` | **PASS** — VAL-REC-CV-01..21 · §3.4 Diễn biến |
| J-HRM-REC-CV-04-* DRAFT | **PASS** — J-01..04 + BA_TRACE §31 + journey map |
| must_keep UV-YCTD/CMP/flags · DENY Nest dual · second CV · REC-03 · seed · honesty · reopen REC-00 | **PASS** — §6 |
| Unlock ba-data if O2 columns **else** sa API F-REC-CV-SCAN-* | **PASS** — **O2 = JSON keys** → **ba-data NOT REQUIRED** → **next sa API** |
| No invent beyond SRS · no honesty flip · no apps/** | **PASS** |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| SA Option A | `PO-HRM-MVP-GD1-REC-04-CLUSTER-SA-01.md` · O1–O8 · F-REC-CV-SCAN-01..03 |
| SRS | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-REC-04 · BR-BP-CV-01 · Diễn biến #1–#2 · special 0-hits/skip |
| BR depth | `UC_BR_MATRIX_DEPTH.md` UC-BP-REC-04 — skill family ≠ exact title |
| UV-YCTD | API/DB CONFIRMED · ONE soft FK `requisition_id` |
| LIVE flags | `yctd-requisition-gates.ts` PipelineFlags — ADD residual `internal_scan_*` |
| Peers BA | REC-00/06A/08 style |
| depends_on stamp | `REC00QC1-MSL0JMUT` |

---

## 3. O1–O8 CONFIRM summary

| ID | Decision |
|----|----------|
| **O1** | Physical `/recruitment/*` only · `/rec` alias |
| **O2** | ADD `internal_scan_done\|skipped\|at\|skip_reason` on **`pipeline_flags_json`** · **no** new columns · **ba-data NOT REQUIRED** |
| **O3** | Kho = `candidates-pool` · Lane A alone ≠ kho |
| **O4** | Title family + skill/experience · exact-title-only FAIL |
| **O5** | DENY `posted` until done\|skip valid · REC-03 OUT |
| **O6** | RETAIN UV-YCTD/CMP · cite attach · không redefine 05a |
| **O7** | Skip = HR\|TP + reason · 400/403 |
| **O8** | Honesty false · C-SLICE |

---

## 4. Deliverables

| Path | Action |
|------|--------|
| `docs/program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-BA-01.md` | ADD |
| `docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-ba-01.md` | ADD (this file) |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | ADD J-HRM-REC-CV-04-01..04 DRAFT |
| `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` | ADD §31 |
| `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` | seat #8 → BA CONFIRMED · next sa API |
| `docs/program/AGENT_MESSAGE_BUS.md` | APPEND PASS_TO_PM |

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
| ba-data this seat | **NOT REQUIRED** (O2 flags) |

---

## completion_report

- **Closed:** O1–O8 CONFIRMED against SA Option A; AC-REC-CV-04-* · VAL-01..21 · Diễn biến FE U65 · J-HRM-REC-CV-04-01..04 DRAFT; posted gate BR-BP-CV-01; 0-hits + skip+reason; must_keep UV-YCTD/CMP/W1–W5; DENY Nest dual / second CV / REC-03 / seed / honesty; **O2 flags → unlock sa API** (not ba-data).
- **Residual:** sa API F.1 F-REC-CV-SCAN-01..03 + mint codes + DTO flags; Dev after API; QA U65.

## next_owner

**sa**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-04-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-04
depends_on: BA-01 O1–O8 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-BA-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-ba-01.md · SA Option A LOCKED
spec_ref: FR-UC-BP-REC-04 · BR-BP-CV-01 · AC-REC-CV-04-* · VAL-REC-CV-* · F-REC-CV-SCAN-01..03
MISSION — API F.1 residual (narrow):
1) DOC-DELTA physical prefer: GET candidates-pool (+ YCTD context) · POST …/requisitions/:id/internal-scan OR PATCH pipeline-flags with internal_scan_* · gate posted until done|skip
2) Map DTO display-ready internal_scan_done|skipped|at|skip_reason on job_requisitions; RETAIN posted/has_cv/interview_started/cv_intake_allowed; mint HRM-REC-CV-SCAN-*
3) F.1 mục đích + nghiệp vụ + bước SRS Diễn biến #1–#2; U19 scope_parity; paper /rec = alias only
4) ba-data NOT REQUIRED (O2 JSON keys) — DENY second CV table · Nest /rec dual · REC-03 · scan event sole SoT · seed · honesty flip · reopen REC-00 without regression
cấm: invent beyond BA/SRS · apps/** · flip recruitment_uat_ready / jd_dynamic_done · module REC UAT
exit: docs/program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-API-01.md · docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-api-01.md · PASS_TO_PM · unlock Dev-BE/FE after CONFIRMED
```

## ack_status

**PASS_TO_PM**
