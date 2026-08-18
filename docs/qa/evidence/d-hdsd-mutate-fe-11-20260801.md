# D-HDSD-MUTATE-FE-11 — YCTD job-templates refetch storm guard

**work_item_id:** `D-HDSD-MUTATE-FE-11`  
**Program:** `P-HDSD-QA-SRS-01` · BF-03  
**Date:** 2026-08-01  
**Owner:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**Prior QA:** `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r8-20260801.md` (FAIL_TO_PM — storm=374)

## spec_read_ack

- **srs:** UF-HRM-07 (YCTD create form-ready + POST) · UF-HRM-09 (leave — preserve 🟢)
- **tech_spec:** `JobRequisitionsTab` · `useJobTemplates` · `isRequisitionCreateFormReady`
- **change_mode:** FIX · **preserve:** FE-10 internal fetch when parent `[]` · FE-09 leave dates · FE-07 in-flight guard

## Root cause → fix map

| Symptom (QA R8) | Root cause | Fix |
|-----------------|------------|-----|
| job-templates **374 GET** during YCTD create dialog (R7 storm=0) | FE-10 enabled internal `useJobTemplates` when parent `jobTemplates=[]`, but `refetchTemplates` still called **parent** `refetchJobTemplatesProp` → parent state updated while `templates` reads **internal** state (stays `[]`) → `useEffect` on `createOpen` refetched on every `templatesLoading` flip | Route `refetchTemplates` to `internalTemplates.refetch` when `useInternalTemplates`; remove createOpen `useEffect` refetch loop; one-shot `createDialogRefetchAttemptedRef` in `handleOpenCreate` |
| `hdsd-requisition-form-ready` absent 22s | Storm blocked main thread / never hydrated templates for `applyTemplate` | Same fix — templates hydrate after single internal fetch |

## Files touched

| File | Change |
|------|--------|
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | refetch source alignment; one-shot create-dialog refetch guard; remove looping createOpen effect; CODE-MEMORY FE-11 |
| `apps/web/hrm/src/lib/jobRequisitionUi.test.ts` | +2 contract tests (refetch routing + no effect loop) |

## Regression

```text
apps/web/hrm:
  pnpm exec vitest run src/lib/contractCreatePayload.test.ts src/lib/contractEndDatePolicy.test.ts src/lib/hdsdMutateTestIds.test.ts src/lib/jobRequisitionUi.test.ts src/lib/leaveRequestDateWindow.test.ts → 44/44 PASS
  pnpm exec tsc -p tsconfig.json --noEmit → exit 0
```

## QA retest (U65 browser · portal :5173)

**Prerequisite:** Restart HRM embed `:8080` before retest.

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main`

1. **TC-HDSD-07-02-01:** JD exists → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → `hdsd-requisition-form-ready` ≤22s → POST requisition **2xx** → F5 · **job-templates storm=0** during create dialog
2. **TC-HDSD-08-02-01:** leave POST **201** + F5 overview marker (preserve 🟢)
3. **Regression:** TC-HDSD-05-03-01 · TC-HDSD-04-02-01 · TC-HDSD-10-04-01
4. **TC-HDSD-06-02-01:** out of FE-11 scope — BE-01 handles POST 400

## completion_report

**Closed:** R-QA-YCTD-STORM-R8 — refetch source mismatch + createOpen effect loop causing 374 GET storm; one-shot guard on open create.

**Residual:** TC-HDSD-06-02-01 POST **400** remains `D-HDSD-MUTATE-BE-01` (not FE-11).

## next_owner

qa

## next_dispatch_prompt

```
work_item_id: QA-HDSD-MUTATE-RET-03-HRM-R9
from_role: dev-fe | to_role: qa
program: P-HDSD-QA-SRS-01 · BF-03
entry_criteria: docs/qa/evidence/d-hdsd-mutate-fe-11-20260801.md READY_FOR_QA; parallel D-HDSD-MUTATE-BE-01 if READY; restart HRM embed :8080; portal :5173; L0 exit 0; U65 zero-seed
exit_criteria: TC-HDSD-07-02-01 form-ready ≤22s → POST requisition 2xx + F5; job-templates storm=0 during create dialog; TC-HDSD-06-02-01 POST 2xx if BE-01 merged; TC-HDSD-08-02-01 🟢 POST 201 + F5 marker; regression 05+04+10 🟢; evidence docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r9-20260801.md
UF/J-*: UF-HRM-07, UF-HRM-05, UF-HRM-09
cấm: seed; probe-only PASS
ack_status: PASS_TO_PM or FAIL_TO_PM
pm_dispatch_hint: QC-HDSD-BF-03-GATE-01 only when R9 PASS all primary mutate TCs
```

## evidence_path

`docs/qa/evidence/d-hdsd-mutate-fe-11-20260801.md`

## ack_status

**READY_FOR_QA**
