# PO-HRM-MVP-GD1-REC-04-CLUSTER-BE-01 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-04-CLUSTER-BE-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** Wave-6 seat #8) |
| **lane** | execution · **dev-be** |
| **uc_ids** | `UC-BP-REC-04` |
| **depends_on** | API-01 **CONFIRMED** · BA-01 O1–O8 · SA Option A |
| **change_mode** | **UPGRADE** · preserve_default · code_memory APPEND |
| **Date** | 2026-08-09 |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 no seed |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-04** Diễn biến #1–#2 · **BR-BP-CV-01** |
| **tech_spec / API** | `PO-HRM-MVP-GD1-REC-04-CLUSTER-API-01.md` §4–§8 · F-REC-CV-SCAN-01..03 · F-REC-YCTD-04 UPGRADE |
| **ba** | BA-01 O1–O8 · AC-REC-CV-04-* · VAL-REC-CV-* |
| **sa** | SA-01 Option **A LOCKED** · physical `/recruitment/*` only · ba-data NOT REQUIRED |
| **db** | ADD keys on existing `job_requisitions.pipeline_flags_json` — **no** new column/table |

---

## 2. Closed scope

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | `PipelineFlags` ADD `internal_scan_done\|skipped\|at\|skip_reason` + parse defaults · merge exclusive · RETAIN posted/has_cv family | **DONE** |
| 2 | ADD `POST …/requisitions/:id/internal-scan` action=`complete`\|`skip` → same JSON keys only | **DONE** |
| 3 | UPGRADE `PATCH …/pipeline-flags` accept scan keys + **gate** `posted=true` → `HRM-REC-CV-SCAN-REQUIRED` | **DONE** |
| 4 | Mint `HRM-REC-CV-SCAN-REQUIRED` · `SKIP-REASON` · `FORBIDDEN` · `YCTD` (+ optional ALREADY unused MVP) | **DONE** |
| 5 | UPGRADE `GET candidates-pool` — `requisition_id` / `for=internal_scan` receivable · title+skill/exp on LIVE `position`/`notes` · exact-title-only → `HRM-REC-400` · empty 200 | **DONE** |
| 6 | YCTD list/get display-ready via `parsePipelineFlags` (scan keys always present) | **DONE** |
| 7 | U19 jest: list pool = get pool = scan/flags scope · regression REC-02 U19 posted+scan | **DONE** |
| 8 | CODE-MEMORY APPEND on service/controller/catalog/gates/DTOs | **DONE** |

**Paths touched (allowed):**

- `apps/api/hrm-api/src/recruitment/yctd-requisition-gates.ts`
- `apps/api/hrm-api/src/recruitment/recruitment.service.ts`
- `apps/api/hrm-api/src/recruitment/recruitment.controller.ts`
- `apps/api/hrm-api/src/recruitment/recruitment-catalog.service.ts`
- `apps/api/hrm-api/src/recruitment/dto/patch-requisition-pipeline-flags.dto.ts`
- `apps/api/hrm-api/src/recruitment/dto/internal-scan.dto.ts` (**ADD**)
- `apps/api/hrm-api/src/recruitment/dto/list-candidates-table.query.dto.ts`
- `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-04-cluster-be-01.spec.ts` (**ADD**)
- regression: `po-hrm-mvp-gd1-rec-02-cluster-be-01.spec.ts` (U19 posted+scan)

**DENY held:** Nest `/rec` dual · second CV table · scan-event sole SoT · REC-03 · seed · honesty flip · reopen REC-00 · `apps/web`

---

## 3. Verify

```text
pnpm exec jest --testPathPatterns="po-hrm-mvp-gd1-rec-04-cluster-be-01|po-hrm-mvp-gd1-rec-02-cluster-be-01" --no-coverage
→ Test Suites: 2 passed, 2 total
→ Tests:       32 passed, 32 total
→ exit 0

pnpm exec jest --testPathPatterns="po-hrm-rec-uv-yctd-be-01|po-hrm-mvp-gd1-rec-04-cluster-be-01" --no-coverage
→ Test Suites: 2 passed, 2 total
→ Tests:       29 passed, 29 total
→ exit 0
```

---

## 4. Residual / next

| Residual | Owner |
|----------|--------|
| Browser U65 J-HRM-REC-CV-04-01..04 (FE-01 already READY) | **qa** |
| Honesty flags stay **false** · C-SLICE | all |
| Optional thin `GET …/requisitions/:id/internal-scan/candidates` wrapper | defer P2 (pool SoT sufficient) |

---

## completion_report

- **Closed:** Option A UPGRADE Nest `/api/hrm/recruitment/*` — `internal_scan_*` on `pipeline_flags_json`, POST internal-scan complete|skip, posted gate BR-BP-CV-01, pool title+skill/exp, mint `HRM-REC-CV-SCAN-*`, U19; jest 32 PASS (+ UV-YCTD regression); honesty false.
- **Residual:** QA browser U65 after FE+BE READY.
- **next_owner:** **qa**
