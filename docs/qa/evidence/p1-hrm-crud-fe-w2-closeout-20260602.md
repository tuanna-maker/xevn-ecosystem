# P1-HRM-CRUD-FE-W2-CLOSEOUT Evidence

- work_item_id: `P1-HRM-CRUD-FE-W2-CLOSEOUT`
- role: `dev-fe`
- date: `2026-06-02`
- scope: Close FE-owned remaining CRUD gaps for decisions/settings/contracts/insurance/recruitment/attendance/payroll UX consistency and strict API wiring.

## 1) Baseline audit (QA artifacts reviewed)

Reviewed:
- `docs/qa/evidence/p1-hrm-crud-qa-baseline-w1-20260602.md`
- `docs/qa/evidence/p1-hrm-crud-qa-minigate-w1-20260602.md`
- `docs/qa/evidence/p1-hrm-crud-qa-w1b-contract-20260602.md`

Findings relevant to FE closeout:
- Insurance module had FE CRUD wiring debt (query/mutation placeholders), creating partial/unstable behavior in QA matrix.
- Prior FE build blocker (`TS6133`) already closed in earlier wave (`p1-hrm-crud-fe-fix-w1-20260602.md`).
- Skill CRUD path previously failing in baseline now needs explicit runtime recheck in this closeout wave.

## 2) FE fixes implemented

### File changed
- `apps/web/hrm/src/pages/Insurance.tsx`

### Action matrix
| Module | Action | Before | After |
|---|---|---|---|
| insurance | Read list | Local Supabase query path and placeholder logic in page-level fetch | Uses `listInsurancePolicyParticipants(currentCompanyId)` from `hrmApi` (strict backend API path) |
| insurance | Delete single | Empty mutation body / non-deterministic | Calls `deleteInsurancePolicyParticipant(id, currentCompanyId)` with explicit error handling via `toErrorMessage` |
| insurance | Delete bulk | Empty mutation body / non-deterministic | Calls `Promise.all(deleteInsurancePolicyParticipant(...))` and keeps refresh consistency via query invalidation |
| insurance | Error feedback | Implicit/weak typed error path | Deterministic toast on failure with backend error message mapping |

## 3) Strict-mode API behavior check

- Insurance page no longer depends on local Supabase CRUD fallback in this flow.
- FE mutation paths now fail-closed on missing company scope and report explicit errors instead of silent no-op behavior.

## 4) Verification commands and outputs

1) `pnpm --filter vite_react_shadcn_ts test`  
- Result: **PASS**  
- Evidence: `40` files passed, `116` tests passed.

2) `pnpm --filter vite_react_shadcn_ts build`  
- Result: **PASS**  
- Evidence: Vite production build completed successfully (exit `0`).

3) `pnpm --filter vite_react_shadcn_ts exec eslint src/pages/Insurance.tsx`  
- Result: **PASS (no errors)**  
- Evidence: `0` errors, `3` warnings (pre-existing `no-explicit-any` style warnings).

4) `$env:PORTAL_DEV_URL='http://127.0.0.1:5173'; node scripts/tmp-p1-qual-qa-fe-w2-smoke.mjs`  
- Result: **PASS**  
- Evidence: `31/31` steps passed; includes `skills-create`, `skills-patch`, `skills-delete` all green (`HRM-EMP-PROFILE-201/202/200`).

5) `pnpm --filter vite_react_shadcn_ts lint`  
- Result: **FAIL (repository baseline)**  
- Evidence: package-wide lint reports many unrelated pre-existing errors/warnings in untouched files; touched closeout file remains error-free with targeted lint run above.

## 5) Bounded residuals

- `vite_react_shadcn_ts` full-package lint is not green due pre-existing unrelated issues outside this closeout scope.
- No new blocking FE residual introduced for `P1-HRM-CRUD-FE-W2-CLOSEOUT`.

## 6) Completion contract

- completion_report: Closed FE-owned insurance CRUD wiring blocker by replacing placeholder fetch/delete flows with backend API integrations and deterministic error/refresh handling. Re-ran FE tests/build plus targeted lint on touched file and reran W2 CRUD smoke (`31/31 PASS`) including skills patch path.
- next_owner: `qa`
- next_dispatch_prompt: `Run QA retest for work_item_id P1-HRM-CRUD-QA-W2-CLOSEOUT. Entry: audit docs/qa/evidence/p1-hrm-crud-fe-w2-closeout-20260602.md and rerun key flows on local portal proxy (company_id=main): (1) Insurance list loads from API and single/bulk delete mutate persisted rows, (2) decisions/contracts/settings/recruitment/attendance/payroll FE CRUD actions still return deterministic loading/success/error feedback, (3) strict no-silent-fallback behavior on API error paths, (4) execute $env:PORTAL_DEV_URL='http://127.0.0.1:5173'; node scripts/tmp-p1-qual-qa-fe-w2-smoke.mjs and capture result table. Exit: publish PASS/FAIL matrix with any bounded residual.`
- evidence_path: `docs/qa/evidence/p1-hrm-crud-fe-w2-closeout-20260602.md`
- ack_status: `READY_FOR_QA`
