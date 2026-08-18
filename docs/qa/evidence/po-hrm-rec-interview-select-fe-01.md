# PO-HRM-REC-INTERVIEW-SELECT-FE-01 — InterviewsTab Select empty value crash

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-REC-INTERVIEW-SELECT-FE-01` |
| from_role | dev-fe |
| to_role | qa |
| ack_status | **READY_FOR_QA** |
| change_mode | FIX |
| date | 2026-08-06 |
| U65 | zero-seed — browser open tab only |

## spec_read_ack

- **Seat scope:** C-CONSOLE-CRASH only (Radix `Select.Item` empty string).
- **BA HOLD:** one-active interview BR / list badge — **not** implemented this seat.
- **must_keep:** `createInterviewCatalog` / `updateInterviewCatalog` contracts · no remaster compare/candidate position.
- Sponsor log: `docs/qa/evidence/sponsor-console-20260806-interview.log` — Uncaught through `InterviewsTab.tsx`.

## Root cause

Update dialog rating field rendered:

```tsx
<SelectItem value="">{t('recruitment.it.noRating')}</SelectItem>
```

Radix Select forbids `SelectItem` with `value=""` (empty string clears selection / shows placeholder).

## Fix (narrow)

| File | Change |
|------|--------|
| `apps/web/hrm/src/components/recruitment/interviewRatingSelect.ts` | Sentinel `__none__` + `ratingFormValue` / `ratingApiValue` |
| `apps/web/hrm/src/components/recruitment/InterviewsTab.tsx` | Wire sentinel on SelectItem; form default/reset; submit → API `null` |
| `apps/web/hrm/src/components/recruitment/interviewRatingSelect.test.ts` | 4 unit tests |

Pattern aligns with recruitment `REQUISITION_NONE_TEMPLATE_SENTINEL = '__none__'`.

- Form/API: `__none__` | empty | non-numeric → `rating: null`
- Stars 1–5 unchanged string → `parseInt` number

## Before / after (console)

| | Evidence |
|---|----------|
| **Before** | Sponsor log: `Uncaught Error: A <Select.Item /> must have a value prop that is not an empty string` ×2 · stack `InterviewsTab` |
| **After (static)** | `rg 'SelectItem value=""' apps/web/hrm/src/components/recruitment` → **0** matches on SelectItem (only comments mention ban) |
| **After (unit)** | `pnpm test -- src/components/recruitment/interviewRatingSelect.test.ts` → **4/4 PASS** |

QA browser (U65): open Recruitment → Interviews → open Update on any row → open rating Select → no Uncaught; choosing «Không đánh giá» still submits `rating: null`.

## Out of scope (HOLD)

- One-active interview business rule
- List badge for active interview
- Compare / candidate position remaster

## completion_report

- **Closed:** C-CONSOLE-CRASH rating `SelectItem value=""` → `__none__` sentinel + API null map; CODE-MEMORY APPEND; vitest 4/4.
- **Residual:** Browser console after HMR/reload not captured in this seat (no live portal session) — QA smoke required.

## next_owner

qa

## next_dispatch_prompt

```text
work_item_id: PO-HRM-REC-INTERVIEW-SELECT-QA-01
from_role: pm
to_role: qa
lane: execution
ack_target: PASS_TO_PM
entry_criteria: FE READY_FOR_QA @ docs/qa/evidence/po-hrm-rec-interview-select-fe-01.md; L0 stack up; U65 zero-seed
scope: Recruitment → tab Phỏng vấn (Interviews)
click_path:
  1) Login ceo@xe.vn → HRM Recruitment → Interviews
  2) Confirm console: 0× «Select.Item must have a value prop that is not an empty string»
  3) Open Update on a row (or create path that opens update rating Select) → open rating dropdown → select «no rating» + a star value — no Uncaught
exit_criteria: evidence append before/after console; matrix note if any; PASS_TO_PM or FAIL with screenshot
cấm: seed · API fake mutate for UF green
evidence_path: docs/qa/evidence/po-hrm-rec-interview-select-qa-01.md
```

## pm_dispatch_hint

`PO-HRM-REC-INTERVIEW-SELECT-QA-01` — browser smoke Interviews tab open + Update rating Select.
