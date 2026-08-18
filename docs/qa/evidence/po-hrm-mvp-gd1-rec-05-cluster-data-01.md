# Evidence — PO-HRM-MVP-GD1-REC-05-CLUSTER-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-05-CLUSTER-DATA-01` |
| **lane** | governance · ba-data |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-7) |
| **uc_ids** | `UC-BP-REC-05` |
| **Date** | 2026-08-09 |
| **depends_on** | BA-01 O1–O9 CONFIRMED · SA-01 Option A LOCKED · peer `REC04QC1-MSL1LU4H` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-DATA-01.md` |
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED** |
| **change_mode** | DOC-DELTA physical · **NO** `apps/**` · **no migrate run** · **no seed** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| ADD **ONE** append-only history table | **PASS** — `public.rec_candidate_stage_history` §4 |
| FK primary `recruitment_candidate_id` (+ optional `application_id`) | **PASS** §4.1–4.2 · NO CASCADE wipe |
| Open-CHK migrate when EFF>0 (drop closed-six) | **PASS** §5 — DROP `chk_recruitment_candidates_status` → open non-empty |
| DENY dual history / dual catalog | **PASS** §1/§10 |
| DENY Nest `/rec` · REC-03 · seed · honesty flip · apps/** | **PASS** §1/§10 |
| RETAIN `rec_pipeline_stage` · UV-YCTD · REC-04 | **PASS** |
| Cite BA O2/O3/O4 · BR-BP-CV-02 · paper §2.6 | **PASS** §7–§8 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| BA-01 | O2 ADD history · O3 Lane A `candidate_id` · O4 open CHK · VAL-REC-STG-01..24 · AC-REC-05-* |
| SA-01 | Option A LOCKED · ADD one history · paper `/rec` alias · F-REC-APP-02 residual |
| AS-IS Nest (read-only) | `recruitment.service.ts` ensureSchema — Lane A + **closed-six CHK** · history **ABSENT** |
| Catalog LIVE | `rec-pipeline-stage.service.ts` · open `stage_key` RETAIN |
| Posting apps | `candidate_applications.job_posting_id` — **OUT** FR-05 SoT |
| Paper DB | §2.6 `rec_candidate_stage_history` · EXPAND nullability + Lane A FK |
| Style peer | `PO-HRM-MVP-GD1-REC-00-CLUSTER-DATA-01.md` · REC-02 DATA-01 |

---

## 3. Physical decisions summary

| Topic | Decision |
|-------|----------|
| SoT history | **ADD** `public.rec_candidate_stage_history` only |
| Alias | `candidate_stage_history` = logical only — **DENY** second CREATE |
| Primary FK | `recruitment_candidate_id` → Lane A · **NO ON DELETE CASCADE** |
| Optional FK | `application_id` NULL soft neo — **DENY** hard FK to posting-apps |
| Columns | from/to/note/changed_by/changed_at + company_id + desired_salary? |
| Mutate | **APPEND only** |
| Lane A CHK | DROP closed six → open non-empty (O4) |
| Catalog | ONE `rec_pipeline_stage` RETAIN |
| Paper §2.6 application_id NOT NULL | Logical alias of YCTD-bound link via Lane A id |

---

## 4. Deliverables inventory

| Artifact | Path |
|----------|------|
| DATA DOC-DELTA | `docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-DATA-01.md` |
| This evidence | `docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-data-01.md` |
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
| Second history / second catalog | **DENIED** |
| REC-03 / posting-apps SoT | **DENIED** |
| Reopen REC-04 J-CV-04 / W1–W6 | **DENIED** |
| C-SLICE | **YES** |

---

## completion_report

- **Closed:** Physical DOC-DELTA CONFIRMED for UC-BP-REC-05 O2/O4 — ONE append-only `rec_candidate_stage_history` + Lane A open-CHK migrate; FK Lane A primary + optional soft `application_id`; DENY dual SoT / Nest dual / REC-03 / seed / honesty / apps/**.
- **Residual:** **sa** API F.1 F-REC-APP-02 UPGRADE + GET stage-history + mint `HRM-REC-STAGE-*`.
- **next_owner:** **sa**
- **ack_status:** **PASS_TO_PM**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-05-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-05
depends_on: DATA-01 CONFIRMED — docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-DATA-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-data-01.md · BA-01 O1–O9 · SA-01 Option A LOCKED · peer REC04QC1-MSL1LU4H

MISSION: API_DESIGN F.1 residual on physical Nest /api/hrm/recruitment/* ONLY — UPGRADE F-REC-APP-02 POST /candidates/:id/transitions (atomic UPDATE Lane A status + APPEND rec_candidate_stage_history); ADD GET /candidates/:id/stage-history; display-ready DTO from/to/note/changed_*; assert to_stage ∈ EFF when EFF>0 (HRM-REC-STAGE-UNKNOWN RETAIN); mint HRM-REC-STAGE-REJECT-REASON · REVERSE-FORBIDDEN (+ optional HISTORY-FAIL / EMPTY-CATALOG); U19 list=get=transition=timeline; paper POST /rec/applications/{id}/transitions + /rec/…/stage-history = alias only.
Cite: DATA-01 §4–§8 · BA AC-REC-05-* · VAL-REC-STG-* · BR-BP-CV-02 · O1–O6 · F-REC-CAT-EFF RETAIN · REC-04/06a/UV-YCTD must_keep.
DENY: Nest /rec dual SoT · second history/catalog · REC-03 posting-apps SoT · pool stage as FR-05 SoT · overwrite-only DONE · seed · honesty flip · reopen REC-04 J-* · apps/**.
exit: docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-API-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-api-01.md · PASS_TO_PM · next_dispatch_prompt Dev-BE/FE after API CONFIRMED · append bus
```
