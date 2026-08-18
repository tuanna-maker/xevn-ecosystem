# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-BE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-BE-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01` **CONFIRMED** |
| **ref_sa** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01` Option **B** LOCKED |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-08 |
| **change_mode** | **ADD** consumer deepen only (BA §6.3 gaps) |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`C-SLICE-≠-MODULE`** · DENY module REC UAT · U65 no seed |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| BA-01 | §6.3 **VAL-REC-CNS-01** RETAIN · **VAL-REC-CNS-02** GAP BE · **VAL-REC-CNS-05** optional soft · §7 error taxonomy |
| SA-01 | L-REC-STAGE-01/02/07 · Option B Nest EFF SoT · APP-02 UNKNOWN |
| Prior seal | REC-BE-01 F-REC-CAT-EFF + APP-02 wire · REC-QC-01/02 · IV one-active |

---

## 2. Closed (BA gaps)

| VAL | Action | Stamp |
|-----|--------|-------|
| **VAL-REC-CNS-01** | **RETAIN** | `updateCandidateApplicationStage` / `updateCandidatePoolStage` assert + `rec-pipeline-stage.app02-wire.spec.ts` — **no wipe** |
| **VAL-REC-CNS-02** | **ADD** | `createCandidatePool` + `updateCandidatePool(stage)` → `assertStageInEffectiveCatalog` when EFF>0 → invent **`HRM-REC-STAGE-UNKNOWN`** |
| **VAL-REC-CNS-05** | **ADD** (shipped) | `assertInterviewScheduleAllowed` → **`HRM-REC-IV-400-STAGE-DISALLOW`** (≠ UNKNOWN · ≠ `HRM-REC-IV-409-ACTIVE`) on `scheduleInterview` + catalog `createInterview` |
| **VAL-REC-CNS-03** | **RETAIN** | scope_parity list↔get↔assert via same `resolveHrmListScope` / `listEffective` (no drift this seat) |
| Admin / APP-02 | **RETAIN** | F-REC-CAT-STG open N+1 · hire spine · JD DnD · YCTD untouched |

### Error codes (Q1 BA)

| Code | When | HTTP |
|------|------|------|
| `HRM-REC-STAGE-UNKNOWN` | Consumer invent `stage`/`to_stage` when EFF>0 | 400 |
| `HRM-REC-IV-400-STAGE-DISALLOW` | Schedule when current stage `allows_interview_schedule=false` | 400 |
| `HRM-REC-IV-409-ACTIVE` | One-active conflict | 409 **RETAIN** |

Empty EFF → soft-allow invent/schedule (U65). Stage missing from EFF on IV path → soft-allow (≠ UNKNOWN on IV).

---

## 3. Files touched

| Path | Change |
|------|--------|
| `rec-pipeline-stage.constants.ts` | `HRM_REC_IV_STAGE_DISALLOW` |
| `rec-pipeline-stage.service.ts` | `assertInterviewScheduleAllowed` |
| `recruitment-catalog.service.ts` | create/update pool assert · createInterview soft-gate |
| `recruitment.service.ts` | scheduleInterview soft-gate (Optional RecPipelineStageService) |
| `rec-pipeline-stage.cns-be-01.spec.ts` | **NEW** VAL-REC-CNS-02/05 + APP-02 retain spot |

**ba-data HOLD** — no migration / no second table / no seed.

---

## 4. Verification

```text
pnpm --filter hrm-api exec jest --testPathPatterns="rec-pipeline-stage.cns-be-01|rec-pipeline-stage.app02-wire|rec-pipeline-stage.service.spec|recruitment.service.spec|po-hrm-rec-iv-one-active-be-02" --no-coverage
→ Test Suites: 5 passed · Tests: 42 passed

pnpm --filter hrm-api exec jest --testPathPatterns="po-e2e-spine-01-be-cand-dto-01|hire-employee-link.spec" --no-coverage
→ Test Suites: 2 passed · Tests: 17 passed
```

---

## 5. Honesty / must_keep

| Flag / seal | Status |
|-------------|--------|
| `recruitment_uat_ready` | **false** — DENIED flip |
| `jd_dynamic_done` | **false** |
| REC UX QC process / JD DnD / IV one-active | **SEAL RETAIN** |
| REC-QC-01/02 · EMP·DEC·PAY·ATT·EXT·CTR·LIST-TOTALS | **SEAL RETAIN** |
| `C-SLICE-≠-MODULE` | Stage CNS ≠ module REC UAT |
| Seed | **DENIED** |

---

## 6. Residual / not this seat

| Item | Owner |
|------|-------|
| Kanban columns EFF rebind (**VAL-REC-CNS-04**) | **dev-fe** CNS-FE-01 (parallel) |
| FE IV schedule disable UX | **dev-fe** |
| Browser U65 AC-PLT-REC-STAGE-01* | **qa** |
| ba-data EXPAND | **HOLD** |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-be-01.md` |
