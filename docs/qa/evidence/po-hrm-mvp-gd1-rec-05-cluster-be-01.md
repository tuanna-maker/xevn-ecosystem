# Evidence — PO-HRM-MVP-GD1-REC-05-CLUSTER-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-05-CLUSTER-BE-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-7 seat #9) |
| **lane** | execution · **dev-be** |
| **Date** | 2026-08-09 |
| **uc_ids** | `UC-BP-REC-05` |
| **depends_on** | API-01 **CONFIRMED** · DATA-01 · BA O1–O9 · SA Option A |
| **change_mode** | **ADD/UPGRADE** · `preserve_default: true` · `code_memory_mode: APPEND` |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 zero-seed |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **api** | `docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-API-01.md` F-REC-APP-02 · F-REC-APP-02-TL · §4 CFG/reject · §5 mint · §8 U19 |
| **data** | `docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-DATA-01.md` §4 history · §5 open-CHK |
| **ba** | `docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-BA-01.md` O1–O9 · AC-REC-05-* · VAL-REC-STG-* |
| **sa** | `docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-SA-01.md` Option **A** · Lane A SoT |
| **srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-05** Diễn biến **#0a–#2** · **BR-BP-CV-02** |
| **db_design** | ADD `public.rec_candidate_stage_history` · DROP closed-six → open non-empty |
| **as-is** | `recruitment.service.ts` ensureSchema · Lane A candidates · CAT EFF RETAIN |

**spec says / code does (closed this seat):**

| Spec | Before | After |
|------|--------|-------|
| History table DATA-01 | **ABSENT** | **ADD** `rec_candidate_stage_history` + indexes |
| Lane A status CHK | closed-six `IN (six)` | **DROP** → `chk_recruitment_candidates_status_open` |
| F-REC-APP-02 POST transitions | **ABSENT** | **ADD** atomic UPDATE+INSERT · EFF/reject/reverse |
| F-REC-APP-02-TL GET stage-history | **ABSENT** | **ADD** display-ready · empty `[]` 200 |
| Mint codes | UNKNOWN only | + REJECT-REASON · REVERSE-FORBIDDEN · EMPTY-CATALOG · HISTORY-FAIL |
| U19 | list=get | list=get=**transition=timeline** |
| Path | — | physical `/recruitment/candidates*` only · **DENY** Nest `/rec` |

---

## Implementation

| Surface | Change |
|---------|--------|
| `ensureSchema` | CREATE `rec_candidate_stage_history` · migrate open-CHK · CREATE open on new table |
| `transitionCandidateStage` | EFF assert · reject note · reverse CFG `recruitment.allow_reverse_stage` (default true) · `withTransaction` |
| `listCandidateStageHistory` | ORDER BY changed_at DESC · same scope as get-by-id |
| DTO | `CandidateStageTransitionDto` · `ListCandidateStageHistoryQueryDto` |
| Controller | `POST candidates/:id/transitions` · `GET candidates/:id/stage-history` |
| Constants | mint `HRM-REC-STAGE-*` + CFG key + reject fallback keys |
| CODE-MEMORY | APPEND on service/controller/DTO/constants |

**must_keep RETAIN:** UV-YCTD · REC-04 scan/posted · 06a IV soft-gate DISALLOW · CAT STG/EFF · UNKNOWN invent-ban · W1–W3 · honesty false · U65

**DENY respected:** Nest `/rec` dual · second history table · REC-03 · pool/posting as FR-05 SoT · seed · flip `recruitment_uat_ready` · reopen REC-04 J-*

---

## Files touched

| Path | Mode |
|------|------|
| `apps/api/hrm-api/src/recruitment/recruitment.service.ts` | UPGRADE + ADD |
| `apps/api/hrm-api/src/recruitment/recruitment.controller.ts` | ADD routes |
| `apps/api/hrm-api/src/recruitment/dto/candidate-stage-transition.dto.ts` | ADD |
| `apps/api/hrm-api/src/recruitment/rec-pipeline-stage.constants.ts` | UPGRADE mint |
| `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-05-cluster-be-01.spec.ts` | ADD |

---

## Jest

```text
pnpm --filter hrm-api exec jest --testPathPatterns="po-hrm-mvp-gd1-rec-05-cluster-be-01" --no-coverage
→ Test Suites: 1 passed · Tests: 13 passed

pnpm --filter hrm-api exec jest --testPathPatterns="po-hrm-mvp-gd1-rec-05-cluster-be-01|rec-pipeline-stage.cns-be-01|rec-pipeline-stage.app02-wire|bm-be-rec-cand-get-by-id-01|recruitment.controller.spec" --no-coverage
→ Test Suites: 5 passed · Tests: 45 passed
```

Coverage in suite: ensureSchema history+open-CHK · happy atomic · UNKNOWN · EMPTY-CATALOG · REJECT-REASON · reject+note · REVERSE-FORBIDDEN · reverse allow · same-key no-op · HISTORY-FAIL · timeline empty/rows · U19 scope_parity · DENY dual history invent.

---

## Residual / next

| Item | Owner |
|------|--------|
| QA U65 J-HRM-REC-STG-05-01..04 browser — Network `/recruitment/` · FE after 2xx + F5 | **qa** |
| Dev-FE `PO-HRM-MVP-GD1-REC-05-CLUSTER-FE-01` picker + POST + timeline (parallel OK) | **dev-fe** / PM |
| QC GWC C-SLICE after QA | **qc** |
| Honesty flags | **remain false** |

---

## completion_report

- **Closed:** Nest `/api/hrm/recruitment/*` — ensureSchema ADD `rec_candidate_stage_history` + Lane A open-CHK; POST `…/candidates/:id/transitions` atomic stage+history with EFF/reject/reverse VAL + mint `HRM-REC-STAGE-*`; GET `…/stage-history` display-ready; U19 jest 13 PASS + peer 45; DENY Nest `/rec` · second SoT · REC-03 · seed · honesty · reopen REC-04.
- **Residual:** QA browser J-HRM-REC-STG-05-* · FE wire if not parallel · honesty false.
