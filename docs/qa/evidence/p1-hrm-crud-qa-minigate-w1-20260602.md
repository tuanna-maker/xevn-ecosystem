# P1-HRM-CRUD-QA-MINIGATE-W1

- Date: 2026-06-02
- Owner: qa
- Scope: strict mini-gate for HRM CRUD with module-level verdicts (employees, contracts, insurance/decisions, recruitment, attendance, payroll, hrm settings, leave)
- Environment: local stack (`hrm-api:28001`, `xbos-api:28002`, portal reachable at `http://127.0.0.1:5173`)

## 1) Dispatch baseline used

Source dispatch (from `docs/program/AGENT_MESSAGE_BUS.md`):

- `work_item_id`: `P1-HRM-CRUD-QA-MINIGATE-W1`
- Required command set:
  - `pnpm --filter hrm-api test`
  - `pnpm --filter web-portal test`
  - `pnpm --filter web-portal build`
  - `pnpm run qc:dev-stack`
  - `pnpm run verify:capabilities -- --group A1`
  - `pnpm run test:pilot:flows`

## 2) Mini-gate command execution (strict)

| Command | Result | Key evidence |
|---|---|---|
| `pnpm --filter hrm-api test` | FAIL | `Test Suites: 1 failed, 45 passed`; `Tests: 19 failed, 275 passed`; failing suite `src/attendance/attendance.controller.spec.ts` due missing provider `AttendanceOverviewService` |
| `pnpm --filter web-portal test` | PASS | Vitest pass (`26` files, `132` tests) |
| `pnpm --filter web-portal build` | FAIL | TS6133 unused vars in `src/pages/command-center/CommandCenterPage.tsx` (`mockCommandCenterMeta`, `workspaceMeta`) |
| `pnpm run qc:dev-stack` | PASS | hrm-api 200, xbos-api 200, web-portal 200 |
| `pnpm run verify:capabilities -- --group A1` | PASS | `BTN-A1-INBOX-DETAIL` and `BTN-A1-INBOX-QUICK` pass (expected 401 contract) |
| `pnpm run test:pilot:flows` | PASS (after URL alignment) | initial run failed with `ECONNREFUSED 127.0.0.1:5175`; rerun with `PORTAL_DEV_URL=http://127.0.0.1:5173` passed `13/13` |

Gate status from required command set: **FAIL** (strict fail-closed).

## 3) Additional CRUD runtime probes for module coverage

Extra probes executed to capture C/R/U/D evidence depth:

- `node scripts/tmp-w1-hrm-clean-gate-probes.mjs` -> PASS (`J-HRM-01..07 = 7/7`, `decisions = 200 HRM-DEC-200`)
- `$env:PORTAL_DEV_URL='http://127.0.0.1:5173'; node scripts/tmp-p1-100-qa-fe-w1-smoke.mjs` -> PASS (`24/24` steps, no `54321/rest/v1` hit)
- `node scripts/verify-tenant-isolation.mjs` -> FAIL (`HRM-AUTH-401` on mobile login; negative scope checks not executed)

## 4) Module-level verdict matrix (evidence-backed)

| Module | Tested actions | Verdict | Reproducibility command / API path | Defect / note |
|---|---|---|---|---|
| employees | Read list + detail link parity | PARTIAL | `pnpm run test:pilot:flows` (`/api/hrm/employees?company_id=main&page_size=100`), `node scripts/tmp-w1-hrm-clean-gate-probes.mjs` (`/employees/:id`) | No direct create/update/delete evidence in this mini-gate wave |
| contracts | Read contracts list + employee detail parity | PARTIAL | `pnpm run test:pilot:flows` (`/api/hrm/contracts-insurance/contracts?company_id=main`), `node scripts/tmp-w1-hrm-clean-gate-probes.mjs` (`J-HRM-01`) | No direct create/update/delete evidence in this mini-gate wave |
| insurance / decisions | Insurance read + decisions read | PARTIAL | `node scripts/tmp-w1-hrm-clean-gate-probes.mjs` (`/contracts-insurance/insurance`, `/decisions`) | No direct create/update/delete evidence in this mini-gate wave |
| recruitment | Create/read/update/delete for job postings, plans, interviews; candidate stage update; requisition/candidate reads | PASS | `$env:PORTAL_DEV_URL='http://127.0.0.1:5173'; node scripts/tmp-p1-100-qa-fe-w1-smoke.mjs` (recruitment endpoints under `/api/hrm/recruitment/*`) and `tmp-w1` J-HRM-05 | Runtime CRUD and read-detail evidence green |
| attendance | Read attendance records + CRUD for work-shifts; attendance-sheets list | FAIL | `$env:PORTAL_DEV_URL='http://127.0.0.1:5173'; node scripts/tmp-p1-100-qa-fe-w1-smoke.mjs`; `pnpm --filter hrm-api test` | **DEF-HRM-CRUD-W1-001**: attendance controller test suite broken (DI missing `AttendanceOverviewService`, 19 failed tests) |
| payroll | CRUD salary-components + payment-batches; payslips list/detail parity | PASS | `$env:PORTAL_DEV_URL='http://127.0.0.1:5173'; node scripts/tmp-p1-100-qa-fe-w1-smoke.mjs`; `node scripts/tmp-w1-hrm-clean-gate-probes.mjs` J-HRM-07 | Runtime CRUD and list->detail evidence green |
| hrm settings | Read settings catalogs | PARTIAL | `pnpm run test:pilot:flows` (`/api/hrm/settings-catalogs`) | No direct create/update/delete evidence in this mini-gate wave |
| leave | Negative scope checks intended; execution blocked at auth | FAIL | `node scripts/verify-tenant-isolation.mjs` | **DEF-HRM-CRUD-W1-004**: verification account invalid (`HRM-AUTH-401`), leave negative checks not executable |

## 5) Negative checks captured

- Command-level negative:
  - `pnpm --filter hrm-api test` fail (`attendance` DI regression) -> **DEF-HRM-CRUD-W1-001**
  - `pnpm --filter web-portal build` fail (`TS6133`) -> **DEF-HRM-CRUD-W1-002**
  - `pnpm run test:pilot:flows` default port mismatch (`5175` refused) then pass with `5173` override -> operational mismatch (non-blocking once overridden)
- Scope negative (leave) intended by `verify-tenant-isolation` could not execute due auth failure -> **DEF-HRM-CRUD-W1-004**

## 6) Priority defect list

1. **DEF-HRM-CRUD-W1-001 (P1, dev-be)**  
   Attendance unit gate broken: `AttendanceController` tests fail because `AttendanceOverviewService` is not provided in test module; 19 tests fail.
2. **DEF-HRM-CRUD-W1-002 (P1, dev-fe)**  
   `web-portal` build blocked by TS6133 unused variables in `CommandCenterPage.tsx`.
3. **DEF-HRM-CRUD-W1-004 (P2, dev-be/qa-data)**  
   Leave negative check script cannot authenticate configured mobile account (`HRM-AUTH-401`), so negative scope assertions are not currently reproducible.

## 7) Final QA verdict

**Final verdict: FAIL (strict mini-gate not passed).**

Rationale:
- Required gate commands contain hard fails (`hrm-api test`, `web-portal build`).
- Module matrix still has FAIL/PARTIAL (attendance fail, leave fail, multiple modules partial on C/U/D depth).

Promotion status:
- `ack_status`: **PASS_TO_PM** (handoff with residuals and explicit next dispatch prompts)
- Not eligible for QC promotion as PASS in this wave.
