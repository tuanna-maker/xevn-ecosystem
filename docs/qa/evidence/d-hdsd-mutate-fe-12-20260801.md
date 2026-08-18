# D-HDSD-MUTATE-FE-12 — YCTD dept hydrate + template source fix

**work_item_id:** `D-HDSD-MUTATE-FE-12`  
**Program:** `P-HDSD-QA-SRS-01` · BF-03  
**Date:** 2026-08-01  
**Owner:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**Prior QA:** `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r9-20260801.md` (FAIL_TO_PM — formReady=false)

## spec_read_ack

- **srs:** UF-HRM-07 (YCTD create form-ready ≤22s → POST 2xx + F5) · UF-HRM-05/09 preserve 🟢
- **tech_spec:** `JobRequisitionsTab` · `isRequisitionCreateFormReady` · `resolveRequisitionDepartmentDefault` · `useJobTemplates`
- **change_mode:** FIX · **preserve:** FE-11 storm guard · FE-10 contract submit · BE-02 contract path · TC-HDSD-06/08 🟢

## Root cause → fix map

| Symptom (QA R9) | Root cause | Fix |
|-----------------|------------|-----|
| `hdsd-requisition-form-ready` absent 22s · jdEnsure count=1 · storm=1 | `parentTemplatesReady` treated `loading+[]` as parent-ready → **disabled internal fetch**; dialog opened before templates[] hydrated | `parentHasTemplates` only when `length>0`; internal hook always active when parent empty; **await refetch** in `handleOpenCreate` before reset/open |
| dept/template backfill gap | Sparse pilot JD + empty departments catalog; `ouLabels` resolved last; RHF dept empty blocked sentinel | `ouLabels` earlier in dept resolver; title→dept mirror in form-ready + defaults; re-sync defaults effect when templates hydrate while dialog open |

## Files touched

| File | Change |
|------|--------|
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | Template source gate; async open+refetch; dept backfill mirror; re-sync effect; CODE-MEMORY FE-12 |
| `apps/web/hrm/src/lib/jobRequisitionUi.ts` | OU-first dept fallback; title→dept mirror in form-ready/defaults |
| `apps/web/hrm/src/lib/jobRequisitionUi.test.ts` | +4 FE-12 contract/unit tests (48 total) |
| `apps/web/hrm/src/hooks/useJobTemplates.ts` | `refetch()` returns rows for await-open hydrate |

**Not modified:** Contracts.tsx · LeaveTab · BE contract path · FE-11 one-shot guard semantics

## Regression

```text
apps/web/hrm:
  pnpm exec vitest run src/lib/contractCreatePayload.test.ts src/lib/contractEndDatePolicy.test.ts src/lib/hdsdMutateTestIds.test.ts src/lib/jobRequisitionUi.test.ts src/lib/leaveRequestDateWindow.test.ts → 48/48 PASS
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

**Closed:** R-QA-YCTD-DEPT-HYDRATE-R9 — parent `loading+[]` blocked internal templates; create dialog opened with empty `templates[]`; dept resolver/applyTemplate backfill gap for pilot JD rows.

**Residual:** None on FE layer for TC-07; if POST still fails after form-ready 🟢 → capture Network body for BE triage (not expected).

## next_owner

qa

## next_dispatch_prompt

```
work_item_id: QA-HDSD-MUTATE-RET-03-HRM-R10
from_role: dev-fe | to_role: qa
program: P-HDSD-QA-SRS-01 · BF-03
entry_criteria: docs/qa/evidence/d-hdsd-mutate-fe-12-20260801.md READY_FOR_QA; restart HRM embed :8080; portal :5173; L0 exit 0; U65 zero-seed
exit_criteria: TC-HDSD-07-02-01 hdsd-requisition-form-ready ≤22s → POST requisition 2xx + F5; preserve TC-HDSD-06-02-01 🟢 + TC-HDSD-08-02-01 🟢 + regression 04/05/10; evidence docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r10-20260801.md
UF/J-*: UF-HRM-07, UF-HRM-05, UF-HRM-09
cấm: seed; probe-only PASS
ack_status: PASS_TO_PM or FAIL_TO_PM
pm_dispatch_hint: QC-HDSD-BF-03-GATE-01 only when TC-06+07 both 🟢
```

## evidence_path

`docs/qa/evidence/d-hdsd-mutate-fe-12-20260801.md`

## ack_status

**READY_FOR_QA**
