# Evidence — PO-HRM-MVP-GD1-REC-01-CLUSTER-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-BE-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **lane** | execution · dev-be |
| **Date** | 2026-08-09 |
| **change_mode** | ADD / UPGRADE · preserve_default |
| **uc_ids** | `UC-BP-REC-01` · `UC-BP-REC-01b` |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `recruitment_uat_ready=false` · no seed · C-SLICE |

---

## spec_read_ack

| Artifact | Path · sections | Stamp |
|----------|-----------------|-------|
| **srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-01** · **FR-UC-BP-REC-01b** Diễn biến (via BA-01 cite) | READ |
| **ba** | `docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01.md` O1–O5 · AC-REC-HC-* · VAL-REC-HC-* · BR-BP-HC-01/04 | CONFIRMED |
| **data** | `docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md` §4–§7 physical ADD cols · §6 months_data cell projection · O1 migrate · UQ spawn | CONFIRMED |
| **api** | `docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md` §5 F-REC-HC-01..03/05 · §7 HC-S1..S7 · §8 HRM-HC-* · §9 scope_parity U19 | CONFIRMED |
| **sa** | Option A LOCKED — physical `/api/hrm/recruitment/recruitment-plans*` · DENY `/rec/headcount-plans` Nest | LOCKED |
| **code AS-IS** | `apps/api/hrm-api/src/recruitment/**` plans + job_requisitions | READ |

**sponsor_confirm:** SA Option A + BA O1–O5 + DATA-01 + API-01 on disk (2026-08-09).

---

## What closed

| Item | Implementation |
|------|----------------|
| ensureSchema ADD | `recruitment_plans`: `submitted_by_dept_key`, `approved_at`, `approved_by`, `activation_mode` · dept/pos `*_key` + soft UQ · `job_requisitions`: `headcount_cell_id`, `headcount_mode`, `target_month`, `recruitment_plan_id`, keys · CHK mode · **partial UQ** `uq_job_requisitions_spawn_cell` |
| O1 normalize | `recruitment-plan-headcount.ts`: `dx→headcount_need_hire`, `ns→headcount_current`, mint `cell_id`, derive `cell_status`/`lifecycle_status`; **DENY** dual ns+dx writers → `HRM-HC-LEGACY-DUAL` |
| GET by id | `GET …/recruitment-plans/:planId` · same `resolveHrmListScope` + `assertResourceInHrmScope` as list |
| PUT upsert | `PUT …/recruitment-plans/:planId` · cell lock `HRM-HC-CELL-LOCKED` post-approve |
| Approve lock | `PATCH …/status` approved + WF bridge callback → `lifecycle_status=need_hire_approved` |
| Spawn | `POST …/recruitment-plans/:planId/spawn-requests` HC-S1..S7 · idempotent skip · drift warn · no Campaign |
| Scope parity U19 | list = get = spawn same resolver |
| must_keep | XBOS `submit-workflow` RETAIN · YCTD/JD · UF-HRM-12 · soft-delete · REC-03 OUT |
| DENY | invent `/rec/headcount-plans` · dual `rec_headcount_*` table · seed · honesty flip |

---

## Files changed

| Path | Role |
|------|------|
| `apps/api/hrm-api/src/recruitment/recruitment-plan-headcount.ts` | NEW — cell normalize / lock / HC error codes |
| `apps/api/hrm-api/src/recruitment/recruitment-plan-headcount.spec.ts` | NEW — O1 + dual-deny + lock unit |
| `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-01-cluster-be-01.spec.ts` | NEW — scope_parity + spawn idempotency + ensureSchema |
| `apps/api/hrm-api/src/recruitment/recruitment-catalog.service.ts` | UPGRADE ensureSchema · hydrate · get/upsert · lock · spawn |
| `apps/api/hrm-api/src/recruitment/recruitment.controller.ts` | ADD GET/PUT/spawn routes · fix CODE-MEMORY close (interrupt corruption) |
| `apps/api/hrm-api/src/recruitment/recruitment.service.ts` | ADD YCTD headcount link cols in ensureSchema (peer path) |
| `apps/api/hrm-api/src/recruitment/recruitment-workflow.bridge.ts` | Approve → lock need_hire cells |

---

## Jest output

```text
pnpm --filter hrm-api exec jest --testPathPatterns="po-hrm-mvp-gd1-rec-01-cluster-be-01|recruitment-plan-headcount|recruitment.controller.spec|recruitment-catalog.service.spec|recruitment-workflow.bridge.spec" --no-coverage

Test Suites: 5 passed, 5 total
Tests:       50 passed, 50 total
```

Covered explicitly:
- U19 list holding under `company_id=main` → getById 200; member scope reject
- HC-S1 non-approved → `HRM-HC-SPAWN-PLAN-NOT-APPROVED`
- HC-S3/S4 spawn create then skip duplicate (no 2nd YCTD)
- ensureSchema has UQ + cols; **no** `CREATE TABLE … rec_headcount_plan`
- O1 migrate + LEGACY-DUAL + VAL need_hire≥1 + cell lock helper

---

## Residual

| ID | Note | Owner |
|----|------|-------|
| R-FE-01 | FE single Cần tuyển column + wire PUT/spawn + F5 — **pending** `PO-HRM-MVP-GD1-REC-01-CLUSTER-FE-01` | dev-fe |
| R-QA-U65 | Full browser UF needs FE; API L1 / jest scope+spawn testable **now** | qa |
| Honesty | `recruitment_uat_ready` remains **false** | qc |

---

## Re-verify after interrupt (2026-08-09T02:27+07)

```text
pnpm --filter hrm-api exec jest --testPathPatterns="po-hrm-mvp-gd1-rec-01-cluster-be-01|recruitment-plan-headcount|recruitment.controller.spec|recruitment-catalog.service.spec|recruitment-workflow.bridge.spec" --no-coverage
Test Suites: 5 passed, 5 total
Tests:       50 passed, 50 total
```

No code delta required on re-dispatch — Option A physical already on disk; routes GET/PUT/spawn present; DENY `/rec/headcount-plans` and dual `rec_headcount_*` tables confirmed by grep + jest.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-be-01.md` |
| **completion_report** | BE-01 closed: Option A physical (schema ADD + O1 normalize + GET/PUT + approve lock + spawn HC-S1..S7 idempotent + U19). Residual: FE-01 wire; full U65 browser blocked until FE. |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-01-CLUSTER-QA-01
lane: execution · qa
depends_on: BE-01 READY_FOR_QA · FE-01 may still be in-flight
entry_criteria: L0 stack; U65 zero-seed; browser-only for UF
MISSION: L1 API — GET list/get-by-id same scope (U19); PUT upsert need_hire; PATCH approve lock; POST spawn-requests create then re-POST skipped_duplicate (BR-BP-HC-04); assert HRM-HC-SPAWN-PLAN-NOT-APPROVED on non-approved; no rec_headcount_* invent.
If FE-01 READY: add U65 J-HRM-REC-HC-01/01b browser; else mark UF ⬜ blocked on FE and PASS L1 only.
READ: docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-be-01.md · API-01 · BA-01 AC
exit: PASS_TO_PM or FAIL · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-qa-01.md
cấm: seed · flip recruitment_uat_ready
```
