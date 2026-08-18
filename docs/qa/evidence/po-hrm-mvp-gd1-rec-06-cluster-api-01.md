# Evidence — PO-HRM-MVP-GD1-REC-06-CLUSTER-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06-CLUSTER-API-01` |
| **lane** | governance · sa |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-8) |
| **uc_ids** | `UC-BP-REC-06` |
| **Date** | 2026-08-09 |
| **depends_on** | DATA-01 CONFIRMED · BA-01 O1–O12 · SA Option A · peer `REC05QC1-MSL35D49` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-API-01.md` |
| **ack_status** | **PASS_TO_PM** · API **CONFIRMED** |
| **change_mode** | DOC-DELTA F.1 · **NO** `apps/**` · **no seed** · **no honesty flip** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| ADD F-REC-MAIL-01 `POST …/candidates/:id/mail` (+ GET outbox/log) | **PASS** §5.1–§5.2 |
| UPGRADE F-REC-APP-03 `candidate-evaluations*` YCTD-bound | **PASS** §5.3–§5.5 |
| Display-ready DTO status/sent_at/log + result/scores | **PASS** §6 |
| VAL interview_invite CC → `HRM-REC-MAIL-CC-REQUIRED` | **PASS** §4 · §7 |
| Mail fail ≠ stage | **PASS** §1 invariant · §5.1(7) |
| Round gate after 06a TERMINAL | **PASS** §5.3 · `HRM-REC-EVAL-ROUND-GATE` |
| Mint `HRM-REC-MAIL-*` · `HRM-REC-EVAL-*` | **PASS** §7 |
| U19 list=get=mail=eval | **PASS** §8 ME-S-SCOPE |
| RETAIN APP-02 sole stage writer | **PASS** §5.7 |
| Paper `/rec` = alias only | **PASS** §3 |
| F.1 Mục đích · Nghiệp vụ · bước SRS #1–#2 | **PASS** §5.1–§5.3 |
| DENY Nest `/rec` dual · second SoT · pool DONE · Campaign · seed · honesty · reopen sealed J-* · apps/** | **PASS** §1/§11 |
| Unlock Dev-BE/FE | **PASS** §12 · §14 |
| ba-data already CONFIRMED (no re-invent) | **PASS** §9 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| DATA-01 | ADD `rec_mail_outbox`+`rec_mail_log` · UPGRADE eval YCTD neo · `FR06_LEGACY_POOL` · soft `archived_at` |
| BA-01 | O1–O12 · AC-REC-06-* · VAL-REC-ME-01..24 · primary `POST …/candidates/:id/mail` · eval `candidate-evaluations*` |
| SA-01 | Option A LOCKED · F-REC-MAIL-01 ADD · F-REC-APP-03 UPGRADE · APP-02 RETAIN |
| SRS | FR-UC-BP-REC-06 Diễn biến #1–#2 · BR-BP-MAIL-01 · BR-BP-REC-IV-05 cite |
| Paper API | F-REC-MAIL-01 `/rec/…/mail` · F-REC-APP-03 `/interview-evals` = alias |
| AS-IS Nest (read-only) | LIVE `candidate-evaluations*` JOIN pool `candidates` · pending default · hard DELETE · **ABSENT** mail routes/tables · REC-05 transitions SEALED · 06a interviews SEALED |
| Peer style | REC-05/04/00/02/06A/08 CLUSTER-API-01 F.1 physical prefer |

---

## 3. Decisions summary

| Topic | Decision |
|-------|----------|
| Path | Physical `/recruitment/candidates/:id/mail` + `candidate-evaluations*` · paper `/rec/*` alias |
| Mail SoT | ONE outbox + ONE append log (DATA-01) |
| Eval SoT | UPGRADE LIVE table — DENY second eval table |
| Eval primary path | `candidate-evaluations*` (Q-REC-ME-EVAL-PATH LOCKED) |
| Pass/Fail | Required on chốt · CFG draft default false |
| Round | After 06a TERMINAL / linked TERMINAL interview_id |
| Stage | APP-02 only — mail/eval never write status |
| Legacy | FR06_LEGACY_POOL read-only / exclude 06b |
| Peers | UV-YCTD · REC-05 · 06a · REC-04 RETAIN |
| OUT | REC-03 · REC-07 hire · 06b matrix UI |

---

## 4. Deliverables inventory

| Artifact | Path |
|----------|------|
| API F.1 DOC | `docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-API-01.md` |
| This evidence | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-api-01.md` |
| Bus | `docs/program/AGENT_MESSAGE_BUS.md` append |

---

## 5. Honesty / DENY footer

| Flag / claim | Status |
|--------------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| C-SLICE | API CONFIRMED ≠ module REC UAT ≠ Phase1 DONE |
| Nest `/rec` dual | **DENY** |
| Second mail/eval SoT | **DENY** |
| Pool eval as FR-06 DONE | **DENY** |
| Campaign / hire / 06b UI | **OUT / DENY** |
| Seed / honesty flip | **DENY** |
| Reopen J-STG-05 / J-IV / J-CV-04 | **DENY** without regression |
| `apps/**` this seat | **untouched** |

---

## 6. Unlock

| Next | work_item_id |
|------|----------------|
| **dev-be** | `PO-HRM-MVP-GD1-REC-06-CLUSTER-BE-01` |
| **dev-fe** | `PO-HRM-MVP-GD1-REC-06-CLUSTER-FE-01` |
| Then | QA J-HRM-REC-06-01..04 · QC GWC C-SLICE |

---

## completion_report

- **Closed:** API F.1 residual CONFIRMED for UC-BP-REC-06 — mail ADD + eval UPGRADE physical `/recruitment/*` · mint MAIL/EVAL · U19 · APP-02 sole stage · paper alias · unlock Dev.
- **Residual:** BE-01 + FE-01 execution · QA U65 · QC GWC.
- **ack_status:** **PASS_TO_PM**
- **next_owner:** **pm** → dispatch BE-01 + FE-01
