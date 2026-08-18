# Evidence — PO-HRM-MVP-GD1-REC-06-CLUSTER-BA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06-CLUSTER-BA-01` |
| **lane** | governance · ba-process |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-8) |
| **uc_ids** | `UC-BP-REC-06` |
| **depends_on** | SA-01 Option A **CONFIRMED** · Wave-7 REC-05 **SEALED** stamp **`REC05QC1-MSL35D49`** |
| **Date** | 2026-08-09 |
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-BA-01.md` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 zero-seed |
| **apps/**** | **NOT touched** |
| **ba-data** | **REQUIRED** (mail outbox+log ADD · eval YCTD FK/home migrate · soft-delete) |
| **SPEC_LEN** | **32254** NFD |
| **EVID_LEN** | **5279** NFD |

---

## 1. Mission closure

| Exit criteria | Result |
|---------------|--------|
| CONFIRM O1–O12 vs SA Option A | **PASS** — all CONFIRMED |
| AC pack FR-UC-BP-REC-06 Diễn biến FE mail + eval Pass/Fail | **PASS** — AC-REC-06-01..08 · ALT · EX · Diễn biến #1–#2 U65 |
| VAL CC · mail fail no fake stage · round after 06a TERMINAL · stage via APP-02 | **PASS** — VAL-REC-ME-01..24 · EX-01/02/04/07 |
| J-* DRAFT | **PASS** — J-HRM-REC-06-01..04 DRAFT · BA_TRACE + journey map |
| ba-data REQUIRED note | **PASS** — O2+O3 |
| Unlock SA API next · cấm invent beyond SRS | **PASS** — next ba-data then sa API; no apps/** |
| DENY Nest `/rec` dual · second SoT · pool eval DONE · Campaign · seed · honesty · reopen sealed J-* | **PASS** |

---

## 2. Evidence basis (read, not invented)

| Artifact | Use |
|----------|-----|
| `SRS_HRM_ENTERPRISE.md` FR-UC-BP-REC-06 · BR-BP-REC-MAIL-01 · Diễn biến #1–#2 · special fail/multi-round | AC / Diễn biến FE |
| `UC_BR_MATRIX_DEPTH.md` UC-BP-REC-06 · BR-BP-MAIL-01 · CC + Pass/Fail · CSVC P2 | VAL · OUT CSVC |
| `DB_DESIGN` §2.7 eval · §2.9 mail outbox+log | O2/O3 dictionary |
| `API_DESIGN` F-REC-MAIL-01 · F-REC-APP-03 · F-REC-APP-02 · F-REC-HIRE-01 OUT | Path + alias |
| `PO-HRM-MVP-GD1-REC-06-CLUSTER-SA-01` Option A LOCKED | O1–O12 targets |
| Peer BA REC-05 / REC-06a | Style + must_keep seals |

---

## 3. O1–O12 CONFIRM summary

| # | BA verdict |
|---|------------|
| O1 | Physical `/recruitment/*` · primary mail `POST …/candidates/:id/mail` · paper `/rec` alias |
| O2 | UPGRADE eval → YCTD-bound · DENY pool SoT · **ba-data REQUIRED** |
| O3 | ADD one outbox + one append log · **ba-data REQUIRED** |
| O4 | Template CFG + criteria UPGRADE · no hardcode body |
| O5 | Pass\|Fail required on chốt · no silent pending DONE |
| O6 | Round after 06a TERMINAL |
| O7 | Stage only APP-02 · mail ≠ stage |
| O8 | interview_invite CC required · fail retain · no fake stage |
| O9 | Peers RETAIN · OUT REC-03/07/06b · CSVC P2 |
| O10 | Honesty false · C-SLICE |
| O11 | Soft-delete prefer |
| O12 | Display-ready DTO · no FE invent |

---

## 4. Cấm verified

| Cấm | Status |
|-----|--------|
| Nest `/rec` dual | **DENY** |
| Second mail/eval SoT | **DENY** |
| Pool eval as FR-06 DONE | **DENY** |
| Campaign / REC-03 | **DENY** |
| Seed | **DENY** |
| Flip `recruitment_uat_ready` / `jd_dynamic_done` | **HOLD false** |
| Module REC UAT | **DENY** |
| Reopen sealed J-STG-05 / J-IV / J-CV-04 | **DENY** |
| REC-07 hire / 06b matrix | **OUT** |
| `apps/**` this seat | **NONE** |

---

## completion_report

- **Closed:** BA AC pack FR-UC-BP-REC-06 against Option A — O1–O12 CONFIRMED; AC/VAL/Diễn biến/J-* DRAFT; ba-data REQUIRED; unlock DATA → SA API next.
- **Residual:** ba-data physical mail+eval FK → sa API F.1 → Dev after contracts → QA U65 J-HRM-REC-06-01..04.
- **next_owner:** **ba-data** (then **sa** API)
- **ack_status:** **PASS_TO_PM**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-06-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-06
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-BA-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-ba-01.md · SA-01 Option A LOCKED · Wave-7 REC-05 SEALED REC05QC1-MSL35D49
entry_criteria: BA AC CONFIRMED; ba-data REQUIRED for O2+O3; honesty false; C-SLICE; U65; cấm Nest /rec dual · second mail/eval SoT · Campaign · seed · honesty flip · reopen sealed J-* · apps/**
MISSION: Physical DB DOC-DELTA — ADD one mail outbox + one append log (paper rec_mail_outbox/rec_mail_log); UPGRADE candidate_evaluations (+ templates) YCTD-bound FK (application_id and/or recruitment_candidate_id + company_id; optional interview_id); soft-delete/archive prefer; migrate rule for legacy pool-only rows (read-only / exclude 06b); DENY second SoT · DENY Nest /rec dual · DENY Campaign tables — unlock SA API F.1 next
exit: docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-DATA-01.md · docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-data-01.md · PASS_TO_PM
cấm: Nest /rec dual · second mail/eval SoT · pool eval as DONE · Campaign · seed · flip recruitment_uat_ready · module UAT · reopen sealed J-* · code apps/**
```
