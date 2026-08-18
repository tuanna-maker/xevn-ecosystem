# Evidence — PO-HRM-REC-IV-BROWSER-SCHEDULE-POST-P1

| Field | Value |
|---|---|
| work_item_id | `PO-HRM-REC-IV-BROWSER-SCHEDULE-POST-P1` |
| from_role | `dev-fe` |
| to_role | `qa` |
| lane | execution |
| change_mode | FIX narrow |
| parent | `PO-HRM-REC-IV-ONE-ACTIVE-QA-02-R3` carry P1 |
| spec_ref | `FR-UC-BP-REC-06a` · AC-01 browser POST · AC-03 duplicate 409 toast |
| ack_status | **READY_FOR_QA** |
| recruitment_uat_ready | **false** (unchanged) |

## Root cause

| Residual | Root cause | Fix |
|---|---|---|
| `REC-IV-BROWSER-SCHEDULE-POST-P1` | `interview_date` had no default → zod `dateRequired` blocked `handleSubmit` before `scheduleRecruitmentInterview` POST; Playwright iframe calendar pick unreliable | Default tomorrow on open via `defaultInterviewDate()` + `form.reset` on dialog open |
| `REC-IV-BROWSER-409-TOAST-P1` | Dialog used Radix `useToast`; QA harness locates `[data-sonner-toast]` | Switch to `sonner` `toast.error`/`toast.success`; `toErrorMessage` maps `HRM-REC-IV-409-ACTIVE` |

## Changed files

- `apps/web/hrm/src/components/recruitment/ScheduleInterviewDialog.tsx`
- `apps/web/hrm/src/components/recruitment/ScheduleInterviewDialog.source.test.ts`

## Preserved (must_keep)

- Lane A `scheduleRecruitmentInterview` + `resolveSpineRecruitmentCandidateId`
- BE-03 spine bridge / email merge / badge AC-02 wiring untouched
- `toErrorMessage` friendly map for `HRM-REC-IV-409-ACTIVE`
- `data-testid=candidate-active-interview-badge|time` on CandidatesTab

## QA harness hooks added

| testid | Element |
|---|---|
| `schedule-interview-dialog` | Dialog root (existing) |
| `schedule-interview-date-trigger` | Date popover button |
| `schedule-interview-calendar` | Calendar widget |
| `schedule-interview-submit` | Submit button |

## Test evidence

```bash
pnpm test -- ScheduleInterviewDialog.source.test.ts apiError.recruitment-interview.test.ts candidateActiveInterview.test.ts CandidatesTab.source.test.ts
```

Result (2026-08-06): **4 files · 14/14 PASS**

## QA browser retest matrix

Persona: `ceo@xe.vn` / `Xevn@2026` · `company_id=main`  
URL: `/command-center/hrm/recruitment?tab=candidates&companyId=main&tenantId=xevn`  
Harness: `scripts/qa/_tmp-po-hrm-rec-iv-one-active-qa-02-r3.mjs` (or successor)

1. **AC-01** — Open schedule for Tuấn → submit without manual calendar if needed → Network `POST /api/hrm/recruitment/interviews` **201** or **409** (not blocked, no client-only VAL-001).
2. **AC-03** — With ACTIVE interview present → duplicate submit → sonner toast text contains «hiệu lực» / «đã có lịch» (`HRM-REC-IV-409-ACTIVE` friendly message).
3. **Regression** — AC-02 badge + F5 persist still 🟢; console clean.

## pm_dispatch_hint

`PO-HRM-REC-IV-ONE-ACTIVE-QA-02-R4` — browser retest schedule POST + 409 toast on Tuấn row; confirm `postCreates.length >= 1` and `conflictToast` non-null on duplicate.

---

## completion_report

Fixed browser schedule submit blocked by missing `interview_date` default (zod stopped POST before API). Switched dialog feedback to Sonner so QA harness detects duplicate `HRM-REC-IV-409-ACTIVE` toast. Added date/submit testids for Playwright. Vitest **14/14 PASS**. BE spine/merge/badge paths unchanged.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-REC-IV-ONE-ACTIVE-QA-02-R4
from_role: pm
to_role: qa
lane: execution
ack_target: PASS_TO_PM
read_first:
  - docs/qa/evidence/po-hrm-rec-iv-browser-schedule-post-fe-01.md
  - docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02-r3.md
parent: PO-HRM-REC-IV-BROWSER-SCHEDULE-POST-P1 READY_FOR_QA
entry_criteria:
  - dev-fe fix merged; L0 stack up (:28001 :28002 :5173)
  - Tuấn row badge AC-02 still PASS baseline
task:
  - Browser U65: schedule dialog submit → POST /interviews 201 or 409 captured (not postCreates=[])
  - Duplicate ACTIVE → sonner toast with HRM-REC-IV-409-ACTIVE friendly text
  - F5 badge persist regression; console clean
exit_criteria:
  - AC-01 + AC-03 browser 🟢; evidence po-hrm-rec-iv-one-active-qa-02-r4.md
evidence_path: docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02-r4.md
ack_status: PASS_TO_PM
pm_dispatch_hint: qc slice gate if all AC green
```
