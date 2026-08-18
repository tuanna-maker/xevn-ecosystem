# D-HDSD-MUTATE-FE-14 — YCTD shared JD source + direct API hydrate (R11)

**work_item_id:** `D-HDSD-MUTATE-FE-14`  
**Program:** `P-HDSD-ECOSYSTEM-03` · BF-03  
**Date:** 2026-08-01  
**Owner:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**Prior QA:** `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r11-20260801.md` (FAIL_TO_PM — FE-13 no delta)

## spec_read_ack

- **srs:** UF-HRM-07 (YCTD create `hdsd-requisition-form-ready` ≤22s → POST 2xx + F5)
- **tech_spec:** `Recruitment.tsx` shared `useJobTemplates` · `JobRequisitionsTab.handleOpenCreate` · `resolveEffectiveJobTemplates`
- **change_mode:** FIX · **preserve:** FE-11 storm guard · TC-HDSD-06/08 🟢 · regression 04/05/10

## Root cause → fix map

| Symptom (QA R11) | Root cause | Fix |
|------------------|------------|-----|
| jd-library tbody count=1 · create dialog «Chưa có JD» · formReady=false 22s | `JobTemplatesTab` + `JobRequisitionsTab` used **separate** `useJobTemplates` instances; page-level refetch did not hydrate requisitions picker when sibling tab had rows | **FE-14:** single page-level hook shared via `sharedTemplates` / props; refetch on jd-library **and** requisitions tab enter |
| refetch returned [] while GET 200 | Hook stale closure + no bypass when shared refetch empty | `handleOpenCreate` direct `listJobDescriptionTemplates` fallback; `templatesRef` sync on fetch; union merge in `resolveEffectiveJobTemplates` |
| FE-13 no runtime delta | Dual internal/parent path still split source | Removed internal hook from `JobRequisitionsTab` — page props only |

## Files touched

| File | Change |
|------|--------|
| `apps/web/hrm/src/pages/Recruitment.tsx` | `recruitmentJobTemplatesState` shared; refetch on jd-library + requisitions; pass to both tabs |
| `apps/web/hrm/src/components/recruitment/JobTemplatesTab.tsx` | Optional `sharedTemplates` prop (disable internal fetch when shared) |
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | Page-level templates only; direct API fallback on open; CODE-MEMORY FE-14 |
| `apps/web/hrm/src/hooks/useJobTemplates.ts` | `companyIdRef` + `templatesRef` sync on fetch |
| `apps/web/hrm/src/lib/jobRequisitionUi.ts` | `resolveEffectiveJobTemplates` union-by-id merge |
| `apps/web/hrm/src/lib/jobRequisitionUi.test.ts` | +FE-14 contract tests (55 total suite) |

**Not modified:** Contracts · LeaveTab · BE · FE-11 one-shot guard semantics

## Regression

```text
apps/web/hrm:
  pnpm exec vitest run src/lib/contractCreatePayload.test.ts src/lib/contractEndDatePolicy.test.ts src/lib/hdsdMutateTestIds.test.ts src/lib/jobRequisitionUi.test.ts src/lib/leaveRequestDateWindow.test.ts → 55/55 PASS
  pnpm exec tsc -p tsconfig.json --noEmit → exit 0
```

## QA retest (U65 browser · portal :5173)

**Prerequisite:** Restart HRM embed `:8080` before retest.

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main`

1. **TC-HDSD-07-02-01:** JD library row exists → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → `hdsd-requisition-form-ready` ≤22s → POST requisition **2xx** → F5 · job-templates storm ≤1 during dialog
2. **TC-HDSD-06-02-01:** preserve 🟢 POST 201 `position_key=CEO`
3. **TC-HDSD-08-02-01:** preserve 🟢 leave POST 201 + F5 marker
4. **Regression:** TC-HDSD-04-02-01 · TC-HDSD-05-03-01 · TC-HDSD-10-04-01

## completion_report

**Closed:** R-QA-YCTD-TEMPLATES-EMPTY-R11 — jd-library and requisitions used separate hook instances; create dialog `effectiveTemplates=[]` despite jdEnsure count=1; added shared page source + direct API hydrate fallback.

**Residual:** If form-ready 🟢 but POST fails → BE triage (`D-HDSD-MUTATE-BE-03`). If direct API + refetch both return [] while jd-library row visible → capture GET body for BE scope parity.

## next_owner

qa

## next_dispatch_prompt

```
work_item_id: QA-HDSD-MUTATE-RET-03-HRM-R12
from_role: dev-fe | to_role: qa
program: P-HDSD-ECOSYSTEM-03 · BF-03
entry_criteria: docs/qa/evidence/d-hdsd-mutate-fe-14-20260801.md READY_FOR_QA; restart HRM embed :8080; portal :5173; L0 exit 0; U65 zero-seed
exit_criteria: TC-HDSD-07-02-01 hdsd-requisition-form-ready ≤22s → POST requisition 2xx + F5; preserve TC-HDSD-06-02-01 🟢 + TC-HDSD-08-02-01 🟢 + regression 04/05/10; evidence docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r12-20260801.md
UF/J-*: UF-HRM-07, UF-HRM-05, UF-HRM-09
cấm: seed; probe-only PASS
ack_status: PASS_TO_PM or FAIL_TO_PM
pm_dispatch_hint: QC-HDSD-BF-03-GATE-01 only when TC-06+07 both 🟢; if GET job-templates body [] while library row → D-HDSD-MUTATE-BE-03
```

## evidence_path

`docs/qa/evidence/d-hdsd-mutate-fe-14-20260801.md`

## ack_status

**READY_FOR_QA**
