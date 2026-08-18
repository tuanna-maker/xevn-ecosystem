# Evidence — PO-HRM-MVP-GD1-REC-06-CLUSTER-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06-CLUSTER-BE-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-8 seat #10) |
| **lane** | execution · **dev-be** |
| **Date** | 2026-08-09 |
| **uc_ids** | `UC-BP-REC-06` |
| **depends_on** | API-01 **CONFIRMED** · DATA-01 · BA O1–O12 · SA Option A |
| **change_mode** | **ADD/UPGRADE** · `preserve_default: true` · `code_memory_mode: APPEND` |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 zero-seed |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **api** | `docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-API-01.md` F-REC-MAIL-01 · F-REC-APP-03 · §4 CFG · §7 mint · §8 U19 |
| **data** | `docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-DATA-01.md` §4 outbox+log · §5 eval YCTD · §6 legacy |
| **ba** | `docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-BA-01.md` O1–O12 · AC-REC-06-* · VAL-REC-ME-* |
| **sa** | `docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-SA-01.md` Option **A** |
| **srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-06** Diễn biến **#1–#2** · **BR-BP-MAIL-01** |
| **db_design** | ADD `public.rec_mail_outbox` + `rec_mail_log` · UPGRADE `candidate_evaluations` neo + `archived_at` |
| **as-is** | LIVE eval JOIN pool + hard DELETE · mail ABSENT |

**spec says / code does (closed this seat):**

| Spec | Before | After |
|------|--------|-------|
| F-REC-MAIL-01 POST/GET mail | **ABSENT** | **ADD** outbox+log · CC · template CFG · MAIL-LOG |
| Mail tables DATA-01 | **ABSENT** | **ADD** `rec_mail_outbox` + append `rec_mail_log` |
| F-REC-APP-03 eval | pool JOIN · pending default · hard DELETE | **UPGRADE** YCTD neo · Pass\|Fail · ROUND-GATE · soft `archived_at` |
| Templates | hard wipe replace | soft-retire + upsert |
| Mint | EVAL-200/201/404 only | + `HRM-REC-MAIL-*` · `HRM-REC-EVAL-PASSFAIL/NEO/ROUND-GATE/LEGACY` |
| Stage after result | — | **RETAIN APP-02** only — mail/eval never UPDATE status |
| Path | — | physical `/recruitment/*` only · **DENY** Nest `/rec` |

---

## Implementation

| Surface | Change |
|---------|--------|
| `RecruitmentService.ensureSchema` | CREATE `rec_mail_outbox` + `rec_mail_log` + indexes/CHK |
| `enqueueCandidateMail` / `listCandidateMail` / `getMailOutboxById` | CC VAL · template CFG · log APPEND · provider-fail ≠ stage |
| `RecruitmentCatalogService.ensureWave2Schema` | ADD neo cols · nullable `candidate_id` · `archived_at` · template `archived_at` |
| `create/list/deleteCandidateEvaluation` | neo required · Pass\|Fail · ROUND-GATE · soft archive · exclude legacy default |
| `replaceEvaluationCriteriaTemplates` | soft-retire then insert (DENY wipe SoT) |
| Controller | POST/GET `candidates/:id/mail` · GET `mail-outbox/:id` · eval query neo filters |
| Constants / DTO | `rec-mail-eval.constants.ts` · `candidate-mail.dto.ts` |
| CODE-MEMORY | APPEND on service/controller/DTO/constants |

**must_keep RETAIN:** UV-YCTD · REC-05 APP-02 transitions/history · 06a IV TERMINAL · REC-04 scan/posted · CAT STG/EFF · W1–W3 · honesty false · U65

**DENY respected:** Nest `/rec` dual · second mail/eval SoT · Campaign · pool eval DONE · seed · flip `recruitment_uat_ready` · reopen sealed J-* · claim hire/06b = FR-06 DONE

---

## Files touched

| Path | Mode |
|------|------|
| `apps/api/hrm-api/src/recruitment/recruitment.service.ts` | ADD mail + DDL |
| `apps/api/hrm-api/src/recruitment/recruitment-catalog.service.ts` | UPGRADE eval |
| `apps/api/hrm-api/src/recruitment/recruitment.controller.ts` | ADD/UPGRADE routes |
| `apps/api/hrm-api/src/recruitment/rec-mail-eval.constants.ts` | ADD |
| `apps/api/hrm-api/src/recruitment/dto/candidate-mail.dto.ts` | ADD |
| `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-06-cluster-be-01.spec.ts` | ADD |
| `apps/api/hrm-api/src/recruitment/recruitment-catalog.service.spec.ts` | FIX call signature |

---

## Jest

```text
pnpm --filter hrm-api exec jest --testPathPatterns="po-hrm-mvp-gd1-rec-06-cluster-be-01|recruitment-catalog.service.spec|po-hrm-mvp-gd1-rec-05-cluster-be-01|po-hrm-mvp-gd1-rec-06a-cluster-be-01" --no-coverage
→ Test Suites: 4 passed · Tests: 42 passed
```

Suite coverage: ensureSchema mail · eval neo DDL · mail happy+log · CC-REQUIRED · TEMPLATE-INACTIVE · PROVIDER-FAIL no stage · GET empty · Pass neo · NEO-REQUIRED · PASSFAIL · ROUND-GATE · soft-delete · U19 scope filter · DENY dual SoT.

---

## Residual / next

| Item | Owner |
|------|--------|
| QA U65 J-HRM-REC-06-01..04 browser — Network `/recruitment/` · mail+eval F5 · no seed | **qa** |
| Dev-FE `PO-HRM-MVP-GD1-REC-06-CLUSTER-FE-01` bind Gửi thư + Pass/Fail (parallel) | **dev-fe** / PM |
| QC GWC C-SLICE after QA | **qc** |
| Honesty flags | **remain false** |

---

## completion_report

- **Closed:** Nest `/api/hrm/recruitment/*` — ADD POST/GET `candidates/:id/mail` (+ mail-outbox) on `rec_mail_outbox`+`rec_mail_log`; UPGRADE `candidate-evaluations*` YCTD neo + Pass/Fail + ROUND-GATE + soft `archived_at`; mint `HRM-REC-MAIL-*` / `HRM-REC-EVAL-*`; RETAIN APP-02 sole stage; U19; jest 14 + peers 42 PASS; DENY Nest `/rec` · second SoT · pool DONE · Campaign · seed · honesty · reopen sealed J-* · hire/06b claim.
- **Residual:** QA U65 J-HRM-REC-06-* · FE-01 parallel · QC GWC C-SLICE · honesty false.
