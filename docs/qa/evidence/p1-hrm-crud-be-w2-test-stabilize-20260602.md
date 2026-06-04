# P1-HRM-CRUD-BE-W2-TEST-STABILIZE Evidence (2026-06-02)

## Scope
- Work item: `P1-HRM-CRUD-BE-W2-TEST-STABILIZE`
- Package: `apps/api/hrm-api`
- Goal: Stabilize recurring failures reported in `attendance.controller.spec.ts` and confirm strict-gate-ready deterministic unit suite.

## Root Cause
- On current source state, the previously reported attendance controller failures are **not reproducible**.
- Full `hrm-api` suite and targeted attendance spec are stable green.
- One command-level issue was found during reproduction attempt: running targeted test via `pnpm --filter hrm-api test` with Jest flags (`--runInBand`) is rejected by pnpm option parsing (`Unknown option: 'runInBand'`). Direct Jest execution (`pnpm --filter hrm-api exec jest --runInBand ...`) is deterministic and works.
- No production contract drift was observed in this stabilization cycle, and no source patch was required.

## Commands Executed
1. `pnpm --filter hrm-api test`
2. `pnpm --filter hrm-api test -- attendance.controller.spec.ts --runInBand` (expected fail due pnpm arg parsing)
3. `pnpm --filter hrm-api test -- --runInBand attendance.controller.spec.ts` (expected fail due pnpm arg parsing)
4. `pnpm --filter hrm-api exec jest --runInBand attendance.controller.spec.ts`
5. `pnpm --filter hrm-api test` (stability confirmation rerun)

## Command Output Summary
- Command 1:
  - `Test Suites: 46 passed, 46 total`
  - `Tests: 301 passed, 301 total`
  - Exit: `0`
- Command 2:
  - `ERROR Unknown option: 'runInBand'`
  - Exit: `1`
- Command 3:
  - `ERROR Unknown option: 'runInBand'`
  - Exit: `1`
- Command 4:
  - `Test Suites: 1 passed, 1 total`
  - `Tests: 19 passed, 19 total`
  - Exit: `0`
- Command 5:
  - `Test Suites: 46 passed, 46 total`
  - `Tests: 301 passed, 301 total`
  - Exit: `0`

## Determinism Verdict
- `attendance.controller.spec.ts`: stable pass in targeted isolated run.
- `hrm-api` full test suite: stable pass across reruns in this cycle.
- No flaky assertion reproduced under current branch state.

## Changed Files
- No product source code changes were required.
- Added evidence artifact only:
  - `docs/qa/evidence/p1-hrm-crud-be-w2-test-stabilize-20260602.md`

## Residual
- No backend test-code residual detected for attendance controller in this run.
- Keep QA rerun command aligned with direct Jest invocation for targeted attendance checks:
  - `pnpm --filter hrm-api exec jest --runInBand attendance.controller.spec.ts`

## ack_status
- `READY_FOR_QA`
