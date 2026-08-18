# Evidence — PO-HRM-MVP-GD1-REC-05-CLUSTER-BA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-05-CLUSTER-BA-01` |
| **lane** | governance · ba-process |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-7 seat #9) |
| **uc_ids** | `UC-BP-REC-05` |
| **depends_on** | SA-01 Option A LOCKED · stamp peer **`REC04QC1-MSL1LU4H`** |
| **Date** | 2026-08-09 |
| **ack_status** | **PASS_TO_PM** |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-BA-01.md` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 zero-seed |
| **apps/**** | **NOT touched** |
| **SPEC_LEN** | **31716** NFD |
| **EVID_LEN** | **5166** NFD (pre-stamp; this row may grow) |
| **next_owner** | **ba-data** |

---

## 1. Mission closure

| Exit criteria | Result |
|---------------|--------|
| AC pack Option A · O1–O9 CONFIRMED | **PASS** |
| Physical `/recruitment` transition + timeline | **PASS** — primary `POST …/candidates/:id/transitions` · `GET …/stage-history` |
| ADD append-only history · ba-data REQUIRED | **PASS** — O2 |
| Stage home YCTD-bound Lane A · DENY posting-apps / pool SoT | **PASS** — O3 |
| EFF picker · reject reason · reverse CFG | **PASS** — O4/O5/O6 |
| RETAIN REC-04 / UV-YCTD / 06a / CAT | **PASS** — O7 |
| DENY Nest `/rec` dual · REC-03 · second SoT · honesty flip · seed · reopen REC-04 J-* | **PASS** |
| J-HRM-REC-STG-05-01..04 DRAFT | **PASS** |
| Cấm code | **PASS** — docs only |

---

## 2. Evidence basis (read, not invented)

| Artifact | Use |
|----------|-----|
| `PO-HRM-MVP-GD1-REC-05-CLUSTER-SA-01.md` | Option A LOCKED · O1–O9 targets |
| `SRS_HRM_ENTERPRISE.md` FR-UC-BP-REC-05 · BR-BP-CV-02 | Diễn biến #0a–#2 · reject · reverse · empty EFF |
| `UC_BR_MATRIX_DEPTH` UC-BP-REC-05 · BR-BP-CV-02 | Timeline ≥ nguồn / từ chối / desired salary |
| `DB_DESIGN` §2.4a / §2.6 | Catalog · append-only history |
| `API_DESIGN` F-REC-APP-02 · F-REC-CAT-* | Paper + physical prefer |
| Peer REC-04 BA/QC `REC04QC1-MSL1LU4H` | must_keep · DENY reopen J-CV-04 |
| Peer BA style REC-04 / 06A | AC / VAL / Diễn biến / J-* DRAFT pattern |

---

## 3. O1–O9 lock summary

| # | BA CONFIRM |
|---|------------|
| O1 | `/recruitment/*` only · `/rec` alias |
| O2 | ADD one history table · ba-data REQUIRED · DENY overwrite-only DONE |
| O3 | Lane A `candidate_id` primary · sync N–N when present · DENY `job_posting_id` apps · DENY pool stage SoT |
| O4 | EFF>0 open catalog · EFF=0 empty+CTA · migrate closed-six |
| O5 | Reject ⇒ note required · 400 REJECT-REASON |
| O6 | Reverse CFG (default allow) · always append · else REVERSE-FORBIDDEN |
| O7 | RETAIN 05a / REC-04 / 06a / CAT / CMP / W1–W5 |
| O8 | Honesty false · C-SLICE |
| O9 | Kanban P2 OUT — list+detail+timeline MVP |

---

## 4. Deliverables inventory

| Artifact | Path |
|----------|------|
| BA AC pack | `docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-BA-01.md` |
| This evidence | `docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-ba-01.md` |
| AC IDs | AC-REC-05-01..08 · ALT · EX |
| VAL IDs | VAL-REC-STG-01..24 |
| J-* DRAFT | J-HRM-REC-STG-05-01..04 |
| UF DRAFT | UF-HRM-REC-STG-05 |

---

## 5. Cấm verified

| Cấm | Status |
|-----|--------|
| honesty flip / `recruitment_uat_ready` | **HOLD false** |
| `jd_dynamic_done` flip | **HOLD false** |
| Nest `/rec` dual SoT | **DENY** |
| REC-03 / Campaign / posting-apps SoT | **DENY** |
| second catalog / second history | **DENY** |
| seed for UAT evidence | **DENY** |
| reopen REC-04 J-HRM-REC-CV-04-* | **DENY** |
| claim 05a create = FR-05 DONE | **DENY** |
| apps/** code this seat | **NOT touched** |

---

## completion_report

- **Closed:** BA AC pack UC-BP-REC-05 Option A · O1–O9 CONFIRMED · Diễn biến FE U65 · J-* DRAFT · ba-data REQUIRED unlock.
- **Residual:** ba-data physical history + CHK · sa API F.1 · Dev HOLD · QA/QC later.
- **ack_status:** **PASS_TO_PM**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-05-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-05
depends_on: BA-01 O1–O9 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-BA-01.md · SA Option A · peer REC04QC1-MSL1LU4H
board: #9 UC-BP-REC-05
spec_ref: DB_DESIGN §2.6 rec_candidate_stage_history · BA O2/O3/O4 · Lane A recruitment_candidates.status
MISSION: ba-data physical ADD ONE append-only history table (logical candidate_stage_history / rec_candidate_stage_history); FK primary recruitment_candidate_id (Lane A YCTD-bound) + optional application_id; columns from_stage/to_stage/note/changed_by/changed_at (+ desired_salary optional); DENY dual history · DENY second catalog; migrate/drop Lane A closed-six CHK so EFF open keys persist when EFF>0; RETAIN rec_pipeline_stage · UV-YCTD · REC-04; cấm code apps/** · cấm seed · cấm honesty flip
exit: docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-DATA-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-data-01.md · PASS_TO_PM · next sa API F-REC-APP-02
```
