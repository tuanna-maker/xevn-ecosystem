# D-HDSD-MUTATE-FE-16 — JD library API gate + U65 create prerequisite (R13)

**work_item_id:** `D-HDSD-MUTATE-FE-16`  
**Program:** `P-HDSD-ECOSYSTEM-03` · BF-03  
**Date:** 2026-08-01  
**Owner:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**Prior QA:** `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r13-20260801.md` (FAIL_TO_PM — jdEnsure tbody false positive; GET total=0)

## spec_read_ack

- **srs:** UF-HRM-07 · TC-HDSD-07-02-01 — U65 zero-seed: create JD from FE when library empty → YCTD form-ready ≤22s → POST 2xx + F5
- **tech_spec:** `JobTemplatesTab` · `useJobTemplates` shared hook · `ensureJdTemplateFromFe` harness · `Recruitment.tsx`
- **change_mode:** FIX · **preserve:** TC-HDSD-06/08 🟢 · regression 04/05/10 · FE-15 unwrap

## Root cause → fix map

| Symptom (QA R13) | Root cause | Fix |
|------------------|------------|-----|
| jdEnsure `{ ok: true, via: "existing", count: 1 }` while GET `{ total: 0, data: [] }` | Harness counted **empty-state** `tbody tr` text (>10 chars) as data row | **FE-16 harness:** `probeJobTemplatesApiCount` gates on API `total`; only skip create when `total > 0` |
| TC-07 formReady=false · «Chưa có JD trong thư viện» | No JD row in API — prerequisite never created | Harness forces «Thêm JD» → POST job-templates when API empty; uses new `hdsd-jd-*` testids |
| YCTD tab may not see new row immediately after create | Shared hook waited for refetch only | **FE-16:** `createTemplate` optimistically merges created row before `refetch()` |

## Files touched

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` | +9 JD library / form testids |
| `apps/web/hrm/src/components/recruitment/JobTemplatesTab.tsx` | Wire testids; empty row `hdsd-jd-library-empty` vs data `hdsd-jd-library-row` |
| `apps/web/hrm/src/hooks/useJobTemplates.ts` | Optimistic merge on `createTemplate` (FE-16) |
| `apps/web/hrm/src/lib/hdsdMutateTestIds.test.ts` | Assert JD testids |
| `scripts/qa/qa-hdsd-mutate-ret-03-hrm-r6-browser.mjs` | `probeJobTemplatesApiCount`; rewrite `ensureJdTemplateFromFe` API-first |

**Not modified:** `JobRequisitionsTab` FE-15 unwrap · Contracts · LeaveTab · BE · TC-06/08 paths

## Regression

```text
apps/web/hrm:
  pnpm exec vitest run src/lib/contractCreatePayload.test.ts src/lib/contractEndDatePolicy.test.ts src/lib/hdsdMutateTestIds.test.ts src/lib/jobRequisitionUi.test.ts src/lib/leaveRequestDateWindow.test.ts → 61/61 PASS
  pnpm exec tsc -p tsconfig.json --noEmit → exit 0
```

## QA retest (U65 browser · portal :5173)

**Prerequisite:** Restart HRM embed `:8080` before retest.

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main`

1. **TC-HDSD-07-02-01:** Harness `jdEnsure` must show `apiTotal >= 1` (via `created` or `existing`) → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → `hdsd-requisition-form-ready` ≤22s → POST requisition **2xx** → F5 · job-templates storm ≤5
2. **TC-HDSD-06-02-01:** preserve 🟢 POST 201 `position_key=CEO`
3. **TC-HDSD-08-02-01:** preserve 🟢 leave POST 201 + F5 marker
4. **Regression:** TC-HDSD-04-02-01 · TC-HDSD-05-03-01 · TC-HDSD-10-04-01

**Harness:** `node scripts/qa/qa-hdsd-mutate-ret-03-hrm-r6-browser.mjs` (SKIP_L0=1 after manual L0)

**DevTools check:** When GET job-templates `total=0`, jdEnsure must **not** return `via: existing` from tbody alone; must POST job-templates 2xx then `apiTotal >= 1`.

## completion_report

**Closed:** R-QA-YCTD-PREREQ-JD-EMPTY-R13 — harness DOM tbody false positive fixed (API count SoT); JD library testids for reliable U65 create; shared hook optimistic merge after POST.

**Residual:** If jdEnsure `ok: true` + formReady still false → capture GET job-templates body during create dialog (BE scope parity). If POST job-templates fails → BE triage.

## next_owner

qa

## next_dispatch_prompt

```
work_item_id: QA-HDSD-MUTATE-RET-03-HRM-R14
from_role: dev-fe | to_role: qa
program: P-HDSD-ECOSYSTEM-03 · BF-03
entry_criteria: docs/qa/evidence/d-hdsd-mutate-fe-16-20260801.md READY_FOR_QA; restart HRM embed :8080; portal :5173; L0 exit 0; U65 zero-seed; prior FAIL qa-hdsd-mutate-ret-03-hrm-r13-20260801.md
exit_criteria: TC-HDSD-07-02-01 jdEnsure apiTotal>=1 → hdsd-requisition-form-ready ≤22s → POST requisition 2xx + F5; preserve TC-HDSD-06-02-01 🟢 + TC-HDSD-08-02-01 🟢 + regression 04/05/10; evidence docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r14-20260801.md
UF/J-*: UF-HRM-07, UF-HRM-05, UF-HRM-09
cấm: seed; probe-only PASS
ack_status: PASS_TO_PM or FAIL_TO_PM
pm_dispatch_hint: QC-HDSD-BF-03-GATE-01 only when TC-06+07 both 🟢
```

## evidence_path

`docs/qa/evidence/d-hdsd-mutate-fe-16-20260801.md`

## ack_status

**READY_FOR_QA**
