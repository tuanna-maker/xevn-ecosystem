# P1-HRM-CRUD-BE-FIX-W1

- work_item_id: `P1-HRM-CRUD-BE-FIX-W1`
- date: `2026-06-02`
- owner: `dev-be`
- scope: Hotfix employee skill PATCH after successful skill create
- endpoint: `PATCH /api/hrm/employees/:employeeId/skills/:skillId?company_id=main`

## Defect reproduction baseline

- Source evidence: `docs/qa/evidence/p1-hrm-crud-qa-baseline-w1-20260602.md`
- Repro script: `scripts/tmp-p1-qual-qa-fe-w2-smoke.mjs`
- Baseline behavior in QA artifact:
  - `skills-create` => `201` (`HRM-EMP-PROFILE-201`)
  - immediate `skills-patch` with `{ "proficiency": "advanced" }` => `400` (`HRM-EMP-PROFILE-400`)

## Root cause

`EmployeeProfileService.updateSkill()` only whitelisted persisted field `level`, while the active probe and FE send `proficiency` during PATCH.  
Because `proficiency` was not mapped into any allowed update field, `updateProfileRow()` produced an empty update set and threw:

- code: `HRM-EMP-PROFILE-400`
- message: `No fields to update`

## Backend fix implemented

File changed:

- `apps/api/hrm-api/src/employees/employee-profile.service.ts`
  - Added alias normalization for skills:
    - `proficiency` -> `level` for PATCH path
    - shared resolver reused for create path fallback logic
  - Kept mutation scope checks and existing error taxonomy unchanged.

## Tests updated

File changed:

- `apps/api/hrm-api/src/employees/employee-profile.service.spec.ts`
  - Added regression: create skill then patch with `proficiency` succeeds.
  - Added focused assertion that `updateSkill` maps `proficiency` to SQL update on `level`.

## Verification commands and results

1) Targeted regression tests:

```bash
pnpm --filter hrm-api test -- src/employees/employee-profile.service.spec.ts
```

- Result: **PASS** (`8/8`)

2) Existing QA repro script re-run (portal path):

```bash
$env:PORTAL_DEV_URL='http://127.0.0.1:5173'; node scripts/tmp-p1-qual-qa-fe-w2-smoke.mjs
```

- Result: still shows old runtime behavior (`skills-patch` 400) on currently running local stack.
- Runtime note: local `hrm-api` dev restart is currently blocked by unrelated pre-existing TypeScript compile errors in `src/recruitment/recruitment.service.ts` (`TS18048` on possibly undefined `payload.email` and `payload.source`), so live probe cannot yet load the updated binary in this session.

## Conclusion

- Code-level root cause for `HRM-EMP-PROFILE-400` has been fixed in backend service mapping.
- Regression test now proves create -> patch(with `proficiency`) path succeeds for the affected logic.
- QA should retest on a runtime where `hrm-api` starts from latest source (after clearing unrelated compile blocker).

## Handoff

- ack_status: `READY_FOR_QA`
- next_owner: `qa`
- next_dispatch_prompt: `Run QA retest for work_item_id P1-HRM-CRUD-BE-FIX-W1 using docs/qa/evidence/p1-hrm-crud-be-fix-w1-20260602.md. Validate employee skills sequence on latest backend runtime: (1) GET employees under company_id=main to pick employeeId, (2) POST /api/hrm/employees/:employeeId/skills?company_id=main with {name,category,level} returns 201, (3) immediate PATCH /api/hrm/employees/:employeeId/skills/:skillId?company_id=main with {"proficiency":"advanced"} returns 200/201 (no HRM-EMP-PROFILE-400), (4) DELETE created skill returns 200/204. Publish QA evidence table with request payloads, status codes, and response codes.`
