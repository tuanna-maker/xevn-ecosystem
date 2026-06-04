# P1-HRM-CRUD-QA-MINIGATE-W1-RERUN-FINAL

- work_item_id: `P1-HRM-CRUD-QA-MINIGATE-W1-RERUN-FINAL`
- date: `2026-06-02`
- tester: `qa`
- environment: local (`hrm-api=:28001`, `xbos-api=:28002`, portal test target from script: `http://127.0.0.1:5175`)
- run_artifacts:
  - `docs/qa/evidence/p1-hrm-crud-qa-minigate-w1-rerun-20260602-run.json`
  - `docs/qa/evidence/p1-hrm-crud-qa-minigate-w1-rerun-20260602-run.log`

## Mandatory command outcomes (strict fail-closed)

| # | Command | Start | End | Exit | Key runtime log | Verdict |
|---|---|---|---|---:|---|---|
| 1 | `pnpm --filter hrm-api test` | `2026-06-02T21:31:27` | `2026-06-02T21:31:38` | 0 | `Test Suites: 46 passed, 46 total` ; `Tests: 301 passed, 301 total` | PASS |
| 2 | `pnpm --filter web-portal test` | `2026-06-02T21:31:38` | `2026-06-02T21:31:55` | 0 | `Test Files 28 passed (28)` ; `Tests 126 passed (126)` | PASS |
| 3 | `pnpm --filter web-portal build` | `2026-06-02T21:31:55` | `2026-06-02T21:32:15` | 0 | `vite build` completed; `built in 7.55s` | PASS |
| 4 | `pnpm run qc:dev-stack` | `2026-06-02T21:32:15` | `2026-06-02T21:32:16` | 0 | `hrm-api 200`, `xbos-api 200`, `web-portal 200` | PASS |
| 5 | `pnpm run verify:capabilities -- --group A1` | `2026-06-02T21:32:16` | `2026-06-02T21:32:18` | 0 | `Summary: pass=2 skip=0 fail=0` | PASS |
| 6 | `pnpm run test:pilot:flows` | `2026-06-02T21:32:18` | `2026-06-02T21:32:20` | 1 | `PASS P-CC-01 portal login expiresInSec=86400` then `TypeError: fetch failed` / `ECONNREFUSED 127.0.0.1:5175` / `ELIFECYCLE exit code 1` | FAIL |

## Residual matrix update (attendance / leave / full CRUD depth)

Legend: `TESTED` = directly executed in this rerun chain or linked strict script evidence in same wave; `UNTESTED` = not executed in this rerun command chain.

| Scope | Tested in this rerun | Untested in this rerun | Current status |
|---|---|---|---|
| Attendance | Gate-level stack health (`qc:dev-stack`) and hrm-api regression suite (`301` tests inside `hrm-api test`) executed | No direct `test:pilot:flows` attendance route assertion completed because flow run aborted on portal `:5175` connection refusal | PARTIAL (environment-blocked for pilot route pass/fail completion) |
| Leave | `hrm-api test` executed (leave-related backend tests included in package suite) | No strict pilot journey completion for leave list/detail/action because `test:pilot:flows` aborted early | PARTIAL (environment-blocked for journey-level confirmation) |
| Full CRUD depth | Unit/integration gate commands passed for BE+FE test/build and capability A1 checks | End-to-end pilot matrix (`P-CC` set) not fully executed due `test:pilot:flows` exit 1; therefore final CRUD journey depth cannot be promoted | FAIL-CLOSED (not promotable) |

## Fail-closed decision

- Since one mandatory command failed (`pnpm run test:pilot:flows`, exit `1`), this rerun verdict is **FAIL_TO_PM** under strict policy.
- QC final gate cannot be promoted to GO on this artifact set.

## Reproduce

```bash
pnpm --filter hrm-api test
pnpm --filter web-portal test
pnpm --filter web-portal build
pnpm run qc:dev-stack
pnpm run verify:capabilities -- --group A1
pnpm run test:pilot:flows
```

## Completion contract

- ack_status: `PASS_TO_PM`
- completion_report: Published the previously missing strict rerun artifact with exact start/end/exit for all six mandatory commands and updated fail-closed residual matrix. One mandatory command failed (`test:pilot:flows` -> `ECONNREFUSED 127.0.0.1:5175`), so overall verdict is fail-closed and not promotable.
- next_owner: `pm`
- next_dispatch_prompt: `Dispatch qc for work_item_id P1-HRM-CRUD-QC-W2-FINAL-GATE-RERUN. Entry: review docs/qa/evidence/p1-hrm-crud-qa-minigate-w1-rerun-20260602.md and run artifact docs/qa/evidence/p1-hrm-crud-qa-minigate-w1-rerun-20260602-run.json. Apply fail-closed policy on mandatory chain (6 commands). Exit: publish NO-GO or GO_WITH_CONDITIONS with explicit reference to failing command pnpm run test:pilot:flows (ECONNREFUSED 127.0.0.1:5175) and required redispatch owner.`
