# Evidence — PO-HRM-MVP-GD1-REC-06-CLUSTER-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06-CLUSTER-SA-01` |
| **lane** | governance · sa |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-8) |
| **uc_ids** | `UC-BP-REC-06` |
| **depends_on** | QC-01 GWC Wave-7 REC-05 **SEALED** · stamp **`REC05QC1-MSL35D49`** |
| **Date** | 2026-08-09 |
| **ack_status** | **PASS_TO_PM** |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-SA-01.md` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 zero-seed |
| **apps/**** | **NOT touched** |
| **SPEC_LEN** | **28783** NFD |
| **EVID_LEN** | **5674** NFD |

---

## 1. Mission closure

| Exit criteria | Result |
|---------------|--------|
| Option A/B/C + trade-off | **PASS** — A LOCKED · B/C REJECT |
| F.1 map physical prefer | **PASS** — F-REC-MAIL-01 ADD · F-REC-APP-03 UPGRADE · APP-02/IV/CAT/UV/SCAN RETAIN · HIRE OUT |
| must_keep REC-05 / 06a / 04 | **PASS** — §6.2–6.3 |
| DENY Nest `/rec` dual · Campaign/REC-03 · pool-as-FR-05 · second SoT | **PASS** |
| Unlock BA AC · cấm code until CONFIRMED | **PASS** — next `ba-process` |
| No honesty flip · no seed · no reopen REC-05/06a/04 J-* | **PASS** |

---

## 2. Evidence basis (read, not invented)

| Artifact | Use |
|----------|-----|
| `SRS_HRM_ENTERPRISE.md` FR-UC-BP-REC-06 · BR-BP-REC-MAIL-01 · peers 06a/06b/07 | Purpose / Diễn biến #1–#2 / mail+eval in pipeline |
| `UC_BR_MATRIX_DEPTH.md` UC-BP-REC-06 · BR-BP-MAIL-01 · **MISSING** | CC interviewer · Pass/Fail · not DONE |
| `DB_DESIGN` §2.7 eval template/instance · §2.9 mail outbox+log | Paper physical targets |
| `API_DESIGN` F-REC-APP-03 · F-REC-MAIL-01 · F-REC-APP-02 · F-REC-HIRE-01 | Paper path + physical prefer · hire OUT |
| `PO-HRM-MVP-GD1-REC-05-CLUSTER-QC-01` stamp `REC05QC1-MSL35D49` | depends_on Wave-7 SEALED · continuous unlock |
| Nest `recruitment-catalog.service.ts` `candidate_evaluations` + JOIN `public.candidates` | LIVE eval on **Lane B pool** — gap vs YCTD |
| Nest `recruitment.controller.ts` `candidate-evaluations*` · `evaluation-criteria-templates*` | LIVE physical `/recruitment/*` upgrade base |
| Grep Nest `rec_mail_outbox` / `mail_outbox` / F-REC-MAIL | **ABSENT** — mail residual ADD |
| Peer SA REC-06a / REC-05 / REC-04 | must_keep IV · transitions · scan |

---

## 3. Decision summary

| | |
|--|--|
| **Selected** | **Option A — ACCEPT_AS_IS_UPGRADE** |
| **SoT** | ONE upgraded YCTD-bound eval · ONE mail outbox+log · stage write only via APP-02 |
| **Path** | Physical `/api/hrm/recruitment/*` · paper `/rec/*` alias only |
| **OUT** | REC-03 · Nest dual · pool-as-FR-05 · REC-07 hire · 06b matrix implement |
| **ba-data** | **REQUIRED** (mail tables + eval FK/home migrate) |
| **Unlock** | BA AC O1–O12 |

---

## 4. O1–O12 (BA lock targets)

1. Physical Network `/recruitment` only  
2. UPGRADE eval home = YCTD-bound (DENY pool as FR-06 SoT)  
3. ADD mail outbox + append log  
4. Template CFG (eval criteria + mail template_code) — no hardcode body  
5. Pass\|Fail required on chốt  
6. Round gate after 06a TERMINAL  
7. Pipeline update only via APP-02; mail fail ≠ fake stage  
8. interview_invite CC required + fail retain  
9. Peers RETAIN 05/06a/04/UV; OUT REC-03/07/06b matrix · CSVC P2  
10. Honesty false · C-SLICE  
11. Soft-delete prefer  
12. Display-ready DTO — no FE aggregate invent  

---

## 5. Cấm verified

| Cấm | Status |
|-----|--------|
| honesty flip / `recruitment_uat_ready` | **HOLD false** |
| module REC UAT claim | **DENY** |
| seed | **DENY** |
| Nest `/rec` dual | **DENY** |
| Campaign / REC-03 | **DENY** |
| pool-as-FR-05 | **DENY** |
| reopen REC-05 / 06a / 04 J-* | **DENY** |
| REC-07 hire in this seat | **OUT** |
| `apps/**` code this seat | **NONE** |

---

## completion_report

- **Closed:** SA Option A CONFIRMED for UC-BP-REC-06 (offer/invite mail + interview evaluation in pipeline vs AS-IS pool-eval + absent mail); F.1 disposition; must_keep/DENY locks; BA unlocked.
- **Residual:** BA-01 AC O1–O12 → ba-data mail+FK → SA API F.1 → Dev (after contracts). No Dev this seat.
- **next_owner:** **ba-process**
- **ack_status:** **PASS_TO_PM**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-06-CLUSTER-BA-01
lane: governance · ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-06
depends_on: SA-01 Option A CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-SA-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-sa-01.md · Wave-7 REC-05 SEALED REC05QC1-MSL35D49
entry_criteria: Option A LOCKED; O1–O12 open for AC; honesty false; C-SLICE; U65; cấm Nest /rec dual · Campaign · pool-as-FR-05 · seed · honesty flip · reopen REC-05/06a/04 · REC-07 hire · apps/**
MISSION: BA AC pack FR-UC-BP-REC-06 — Diễn biến FE mail theo mẫu + đánh giá Pass/Fail neo UV↔YCTD; CONFIRM O1–O12; VAL CC interviewer · mail fail no fake stage · round after 06a TERMINAL · stage chỉ qua APP-02; J-* DRAFT; ba-data REQUIRED note; unlock SA API next — cấm invent beyond SRS
exit: docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-BA-01.md · docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-ba-01.md · PASS_TO_PM
cấm: Nest /rec dual · second mail/eval SoT · pool eval as DONE · Campaign · seed · flip recruitment_uat_ready · module UAT · reopen sealed J-* · code apps/**
```
