# D-HDSD-MUTATE-FE-13 — YCTD templates hydration sync (R10)

**work_item_id:** `D-HDSD-MUTATE-FE-13`  
**Program:** `P-HDSD-ECOSYSTEM-03` · BF-03  
**Date:** 2026-08-01  
**Owner:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**Prior QA:** `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r10-20260801.md` (FAIL_TO_PM — FE-12 no delta)

## spec_read_ack

- **srs:** UF-HRM-07 (YCTD create `hdsd-requisition-form-ready` ≤22s → POST 2xx + F5)
- **tech_spec:** `JobRequisitionsTab` · `useJobTemplates` · `isRequisitionCreateFormReady` · `handleOpenCreate`
- **change_mode:** FIX · **preserve:** FE-11 storm guard · TC-HDSD-06/08 🟢 · regression 04/05/10

## Root cause → fix map

| Symptom (QA R10) | Root cause | Fix |
|------------------|------------|-----|
| jdEnsure count=1 · dialog «Chưa có JD» · formReady=false 22s | `useJobTemplates.refetch` returned stale `templatesRef []` when mount fetch in-flight; parent refetch returned stale `jobTemplatesProp` closure | **FE-13:** in-flight promise dedupe (await shared GET); parent refetch returns `await refetchJobTemplatesProp()` rows |
| jd-library row ≠ requisitions create picker | Page-level `recruitmentJobTemplates` stale after jd-library tab; dialog used hook `templates[]` only | `dialogHydratedTemplates` + `resolveEffectiveJobTemplates`; Recruitment refetch on `activeTab=requisitions` |

## Files touched

| File | Change |
|------|--------|
| `apps/web/hrm/src/hooks/useJobTemplates.ts` | In-flight promise dedupe — await pending GET instead of stale [] |
| `apps/web/hrm/src/lib/jobRequisitionUi.ts` | `resolveEffectiveJobTemplates` merge helper |
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | `effectiveTemplates` / `dialogHydratedTemplates`; parent refetch rows; form-ready/picker use effective list |
| `apps/web/hrm/src/pages/Recruitment.tsx` | Refetch page-level templates when entering requisitions tab |
| `apps/web/hrm/src/lib/jobRequisitionUi.test.ts` | +4 FE-13 hydration contract tests (52 total suite) |

**Not modified:** Contracts · LeaveTab · BE · FE-11 one-shot guard semantics

## Regression

```text
apps/web/hrm:
  pnpm exec vitest run src/lib/contractCreatePayload.test.ts src/lib/contractEndDatePolicy.test.ts src/lib/hdsdMutateTestIds.test.ts src/lib/jobRequisitionUi.test.ts src/lib/leaveRequestDateWindow.test.ts → 52/52 PASS
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

**Closed:** R-QA-YCTD-TEMPLATES-EMPTY-R10 — in-flight refetch returned stale []; parent refetch closure ignored fresh API rows; create dialog gated on empty hook state despite jd-library row.

**Residual:** None on FE layer; if POST fails after form-ready 🟢 → capture Network body for BE triage.

## next_owner

qa

## next_dispatch_prompt

```
work_item_id: QA-HDSD-MUTATE-RET-03-HRM-R11
from_role: dev-fe | to_role: qa
program: P-HDSD-ECOSYSTEM-03 · BF-03
entry_criteria: docs/qa/evidence/d-hdsd-mutate-fe-13-20260801.md READY_FOR_QA; restart HRM embed :8080; portal :5173; L0 exit 0; U65 zero-seed
exit_criteria: TC-HDSD-07-02-01 hdsd-requisition-form-ready ≤22s → POST requisition 2xx + F5; preserve TC-HDSD-06-02-01 🟢 + TC-HDSD-08-02-01 🟢 + regression 04/05/10; evidence docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r11-20260801.md
UF/J-*: UF-HRM-07, UF-HRM-05, UF-HRM-09
cấm: seed; probe-only PASS
ack_status: PASS_TO_PM or FAIL_TO_PM
pm_dispatch_hint: QC-HDSD-BF-03-GATE-01 only when TC-06+07 both 🟢
```

## evidence_path

`docs/qa/evidence/d-hdsd-mutate-fe-13-20260801.md`

## ack_status

**READY_FOR_QA**
