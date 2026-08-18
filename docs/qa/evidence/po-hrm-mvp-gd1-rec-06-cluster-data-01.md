# Evidence — PO-HRM-MVP-GD1-REC-06-CLUSTER-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06-CLUSTER-DATA-01` |
| **lane** | governance · ba-data |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-8) |
| **uc_ids** | `UC-BP-REC-06` |
| **Date** | 2026-08-09 |
| **depends_on** | BA-01 O1–O12 CONFIRMED · SA-01 Option A LOCKED · peer `REC05QC1-MSL35D49` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-DATA-01.md` |
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED** |
| **change_mode** | DOC-DELTA physical · **NO** `apps/**` · **no migrate run** · **no seed** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| ADD **ONE** mail outbox + **ONE** append log | **PASS** — `public.rec_mail_outbox` + `public.rec_mail_log` §4 |
| UPGRADE `candidate_evaluations` (+ templates) YCTD-bound FK | **PASS** §5 — neo `recruitment_candidate_id` and/or `application_id` + optional `interview_id` |
| Soft-delete / archive prefer | **PASS** — `archived_at` outbox+eval · templates soft-retire · **DENY** hard DELETE SoT |
| Migrate rule legacy pool-only | **PASS** §6 — `FR06_LEGACY_POOL` read-only / exclude 06b |
| DENY second SoT · Nest `/rec` dual · Campaign tables | **PASS** §1/§11 |
| Cite BA O2/O3/O11 · paper §2.7/§2.9 · SA Option A | **PASS** §8–§10 |
| Unlock SA API F.1 next (not Dev) | **PASS** §12 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| BA-01 | O2 UPGRADE YCTD eval · O3 ADD outbox+log · O5 Pass/Fail · O11 soft-delete · VAL-REC-ME-* · AC-REC-06-* |
| SA-01 | Option A LOCKED · ADD mail · UPGRADE LIVE eval · paper `/rec` alias · F-REC-MAIL-01 / F-REC-APP-03 residual |
| AS-IS Nest (read-only) | `recruitment-catalog.service.ts` — `candidate_evaluations` JOIN Lane B `candidates` · hard DELETE · mail **ABSENT** |
| Interviews | `recruitment_interviews` SEALED — optional FK target RETAIN |
| Lane A | `recruitment_candidates` preferred neo |
| Paper DB | §2.7 eval alias · §2.9 mail CREATE · §2.8 Campaign **OUT** |
| Style peer | `PO-HRM-MVP-GD1-REC-05-CLUSTER-DATA-01.md` |

---

## 3. Physical decisions summary

| Topic | Decision |
|-------|----------|
| Mail SoT | **ADD** `rec_mail_outbox` + `rec_mail_log` only |
| Eval SoT | **UPGRADE** `candidate_evaluations` — paper name = alias |
| Templates | **UPGRADE** `evaluation_criteria_templates` — soft-retire; criteria_json = DTO aggregate |
| Preferred neo | `recruitment_candidate_id` → Lane A · soft `application_id` / `requisition_id` |
| Pass/Fail | Chốt `result` ∈ {pass,fail} · pending ≠ DONE |
| Legacy | Pool-only rows `FR06_LEGACY_POOL` — read-only / exclude 06b |
| Soft-delete | `archived_at` prefer |
| Stage | **No** stage columns on mail/eval — APP-02 RETAIN |
| Campaign | **DENY CREATE** |

---

## 4. Deliverables inventory

| Artifact | Path |
|----------|------|
| DATA DOC-DELTA | `docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-DATA-01.md` |
| This evidence | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-data-01.md` |
| Bus | `docs/program/AGENT_MESSAGE_BUS.md` append |

---

## 5. Honesty / DENY footer

| Flag / claim | Status |
|--------------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD |
| Module REC UAT / Phase1 DONE | **DENIED** |
| Seed / migrate run / apps/** | **NONE this seat** |
| Nest `/rec` dual SoT | **DENIED** |
| Second mail / second eval SoT | **DENIED** |
| Pool eval as FR-06 DONE | **DENIED** |
| Campaign / REC-03 tables | **DENIED** |
| Reopen REC-05 J-STG-05 / REC-06a J-IV / REC-04 J-CV-04 | **DENIED** |
| C-SLICE | **YES** |

---

## completion_report

- **Closed:** Physical DOC-DELTA CONFIRMED for UC-BP-REC-06 O2/O3/O11 — ADD ONE `rec_mail_outbox` + ONE append-only `rec_mail_log`; UPGRADE `candidate_evaluations` (+ templates) YCTD-bound neo + soft-delete; legacy pool-only migrate class; DENY dual SoT / Nest dual / Campaign / seed / honesty / apps/**.
- **Residual:** **sa** API F.1 F-REC-MAIL-01 ADD + F-REC-APP-03 UPGRADE + mint `HRM-REC-MAIL-*` / `HRM-REC-EVAL-*`; APP-02 sole stage RETAIN.
- **next_owner:** **sa**
- **ack_status:** **PASS_TO_PM**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-06-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-06
depends_on: DATA-01 CONFIRMED — docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-DATA-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-data-01.md · BA-01 O1–O12 · SA-01 Option A LOCKED · peer REC05QC1-MSL35D49

MISSION: API_DESIGN F.1 residual on physical Nest /api/hrm/recruitment/* ONLY — ADD F-REC-MAIL-01 POST /candidates/:id/mail (+ GET outbox/log); UPGRADE F-REC-APP-03 candidate-evaluations* YCTD-bound (neo recruitment_candidate_id and/or application_id; Pass/Fail on chốt; soft-delete archived_at; exclude FR06_LEGACY_POOL from 06b); display-ready DTO status/sent_at/log + result/scores; VAL interview_invite CC; mail fail ≠ stage; round gate after 06a TERMINAL; mint HRM-REC-MAIL-* · HRM-REC-EVAL-* (+ optional ROUND-GATE); U19 list=get=mail=eval; RETAIN F-REC-APP-02 sole stage writer; paper /rec/…/mail + /interview-evals = alias only.
Cite: DATA-01 §4–§9 · BA AC-REC-06-* · VAL-REC-ME-* · BR-BP-MAIL-01 · O1–O12 · REC-05/06a/04 must_keep.
DENY: Nest /rec dual SoT · second mail/eval SoT · pool eval as FR-06 DONE · Campaign · seed · honesty flip · reopen sealed J-* · apps/** · claim hire/06b = FR-06 DONE.
exit: docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-API-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-api-01.md · PASS_TO_PM · next_dispatch_prompt Dev-BE/FE after API CONFIRMED · append bus
```
