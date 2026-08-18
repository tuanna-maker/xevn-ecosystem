# D-HDSD-MUTATE-FE-15 — YCTD job-templates row unwrap + sync hydrate (R12)

**work_item_id:** `D-HDSD-MUTATE-FE-15`  
**Program:** `P-HDSD-ECOSYSTEM-03` · BF-03  
**Date:** 2026-08-01  
**Owner:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**Prior QA:** `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r12-20260801.md` (FAIL_TO_PM — FE-14 no delta)

## spec_read_ack

- **srs:** UF-HRM-07 · TC-HDSD-07-02-01 (`hdsd-requisition-form-ready` ≤22s → POST 2xx + F5)
- **tech_spec:** `Recruitment.tsx` shared hook · `JobRequisitionsTab.handleOpenCreate` · `resolveEffectiveJobTemplates` · `listJobDescriptionTemplates`
- **change_mode:** FIX · **preserve:** TC-HDSD-06/08 🟢 · regression 04/05/10 · FE-11 storm guard

## Root cause → fix map

| Symptom (QA R12) | Root cause | Fix |
|------------------|------------|-----|
| jdEnsure tbody count=1 · dialog «Chưa có JD» · formReady=false 22s | `listJobDescriptionTemplates` payload parsed as `res.data ?? []` — fails when runtime payload is bare `rows[]` or nested `{ data: { data: rows[] } }`; rows never enter hook/dialog state | **FE-15:** `unwrapJobDescriptionTemplateRows` in hook + `handleOpenCreate` |
| GET job-templates 200 ×2 · effectiveTemplates still [] | Refetch returned [] to create dialog; direct fallback used same brittle `direct.data ?? []` | Unwrap on both refetch return + direct fallback |
| form-ready gate before state flush | `isRequisitionCreateFormReady` read `effectiveTemplates` before `setDialogHydratedTemplates` flushed | `openSyncTemplatesRef` set synchronously before `setCreateOpen(true)` |
| Page hook stale after full navigation | Direct prefetch did not sync shared `useJobTemplates` state | `hydrateTemplates` + `hydrateJobTemplates` prop from `Recruitment.tsx` |

## Network body vs FE state (expected)

```json
HTTP 200 GET /api/hrm/recruitment/job-templates?company_id=main
{
  "success": true,
  "code": "HRM-REC-JD-200",
  "data": {
    "total": 1,
    "data": [
      {
        "id": "<uuid>",
        "company_id": "holding",
        "code": "JD-…",
        "title": "QA JD …",
        "position_code": "CEO",
        "position_name": "Tổng Giám đốc"
      }
    ]
  }
}
```

**FE parse path (after fix):** `requestHrm` → `{ total, data: rows[] }` → `unwrapJobDescriptionTemplateRows` → `effectiveTemplates.length >= 1` → `buildRequisitionCreateFormDefaults` → `hdsd-requisition-form-ready`.

## Files touched

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/jobRequisitionUi.ts` | `unwrapJobDescriptionTemplateRows`; safe `templateRowId` in merge |
| `apps/web/hrm/src/hooks/useJobTemplates.ts` | Unwrap on refetch; export `hydrateTemplates` |
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | Sync ref + unwrap on open; `hydrateJobTemplates` prop; CODE-MEMORY FE-15 |
| `apps/web/hrm/src/pages/Recruitment.tsx` | Pass `hydrateJobTemplates` to requisitions tab |
| `apps/web/hrm/src/lib/jobRequisitionUi.test.ts` | +6 FE-15 contract tests (61 total suite) |

**Not modified:** Contracts · LeaveTab · BE · TC-06/08 paths

## Regression

```text
apps/web/hrm:
  pnpm exec vitest run src/lib/contractCreatePayload.test.ts src/lib/contractEndDatePolicy.test.ts src/lib/hdsdMutateTestIds.test.ts src/lib/jobRequisitionUi.test.ts src/lib/leaveRequestDateWindow.test.ts → 61/61 PASS
  pnpm exec tsc -p tsconfig.json --noEmit → exit 0
```

## QA retest (U65 browser · portal :5173)

**Prerequisite:** Restart HRM embed `:8080` before retest.

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main`

1. **TC-HDSD-07-02-01:** JD library row exists → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → `hdsd-requisition-form-ready` ≤22s → POST requisition **2xx** → F5 · job-templates storm ≤1 preferred (≤5 gate)
2. **TC-HDSD-06-02-01:** preserve 🟢 POST 201 `position_key=CEO`
3. **TC-HDSD-08-02-01:** preserve 🟢 leave POST 201 + F5 marker
4. **Regression:** TC-HDSD-04-02-01 · TC-HDSD-05-03-01 · TC-HDSD-10-04-01

**DevTools check:** On create click, GET response `data.data[]` must match picker options count; no «Chưa có JD trong thư viện» when jdEnsure count=1.

## completion_report

**Closed:** R-QA-YCTD-TEMPLATES-EMPTY-R12 — brittle `res.data ?? []` parse left `effectiveTemplates=[]` despite GET 200; added envelope unwrap, sync ref before dialog open, and parent `hydrateTemplates` sync.

**Residual:** If form-ready 🟢 but POST fails → BE triage. If unwrap + hydrate still empty with GET body rows → capture response JSON for PM.

## next_owner

qa

## next_dispatch_prompt

```
work_item_id: QA-HDSD-MUTATE-RET-03-HRM-R13
from_role: dev-fe | to_role: qa
program: P-HDSD-ECOSYSTEM-03 · BF-03
entry_criteria: docs/qa/evidence/d-hdsd-mutate-fe-15-20260801.md READY_FOR_QA; restart HRM embed :8080; portal :5173; L0 exit 0; U65 zero-seed; prior FAIL qa-hdsd-mutate-ret-03-hrm-r12-20260801.md
exit_criteria: TC-HDSD-07-02-01 hdsd-requisition-form-ready ≤22s → POST requisition 2xx + F5; preserve TC-HDSD-06-02-01 🟢 + TC-HDSD-08-02-01 🟢 + regression 04/05/10; capture GET job-templates response body during create; evidence docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r13-20260801.md
UF/J-*: UF-HRM-07, UF-HRM-05, UF-HRM-09
cấm: seed; probe-only PASS
ack_status: PASS_TO_PM or FAIL_TO_PM
pm_dispatch_hint: QC-HDSD-BF-03-GATE-01 only when TC-06+07 both 🟢
```

## evidence_path

`docs/qa/evidence/d-hdsd-mutate-fe-15-20260801.md`

## ack_status

**READY_FOR_QA**
