# P1-HRM-CRUD-QA-W2-STRICT-RERUN (2026-06-02)

- work_item_id: `P1-HRM-CRUD-QA-W2-STRICT-RERUN`
- role: `qa`
- environment: local (`hrm-api:28001`, `xbos-api:28002`, portal active at `5173`; pilot flow script default expects `5175`)
- policy: fail-closed (`any required command/action fail => overall FAIL`)

## 1) Required command/gate set (strict)

| # | Command | Exit | Evidence (key) | Verdict |
|---|---|---:|---|---|
| 1 | `pnpm --filter hrm-api test` | 1 | `46 total`, `1 failed suite` (`attendance.controller.spec.ts`), `2 failed tests` | FAIL |
| 2 | `pnpm --filter web-portal test` | 0 | `28/28 files`, `126/126 tests` PASS | PASS |
| 3 | `pnpm --filter web-portal build` | 0 | `tsc && vite build` PASS | PASS |
| 4 | `pnpm run qc:dev-stack` | 0 | `hrm-api 200`, `xbos-api 200`, `web-portal 200` | PASS |
| 5 | `pnpm run qc:fe-be-health` | 0 | direct/proxy HRM endpoints all 200 | PASS |
| 6 | `pnpm run test:system:uat` | 0 | `37 PASS / 0 FAIL / 0 SKIP` | PASS |
| 7 | `pnpm run test:pilot:flows` | 1 | `ECONNREFUSED 127.0.0.1:5175` after `P-CC-01` | FAIL |

Strict gate result: **FAIL** (2/7 required commands failed).

## 2) Validation of new BE/FE closeout evidence

Reviewed artifacts:
- `docs/qa/evidence/p1-hrm-crud-be-w2-closeout-20260602.md`
- `docs/qa/evidence/p1-hrm-crud-fe-w2-closeout-20260602.md`
- `docs/qa/evidence/p1-hrm-crud-qa-minigate-w1-rerun-20260602.md`
- `docs/qa/evidence/p1-hrm-crud-qc-w2-final-gate-20260602.md`

Validation status:
- **BE closeout evidence:** partially contradicted by this rerun (`hrm-api test` is currently failing in this run), so BE closeout cannot be promoted as fully stable.
- **FE closeout evidence:** corroborated by this rerun (`web-portal test/build` PASS and W2 smoke script PASS).
- **Previous QA/QC fail-closed chain:** still consistent with fail-closed policy; this rerun remains non-promotable.

## 3) Targeted CRUD probes executed

Executed targeted scripts:
- `node scripts/tmp-w1-hrm-clean-gate-probes.mjs` -> PASS (`J-HRM-01..07 = 7/7`, decisions read 200)
- `$env:PORTAL_DEV_URL='http://127.0.0.1:5173'; node scripts/tmp-p1-100-qa-fe-w1-smoke.mjs` -> PASS (`24/24`)
- `$env:PORTAL_DEV_URL='http://127.0.0.1:5173'; node scripts/tmp-p1-bnd-qa-fe-smoke.mjs` -> PASS (advance request action flow)
- `$env:PORTAL_DEV_URL='http://127.0.0.1:5173'; node scripts/tmp-p1-qual-qa-fe-w2-smoke.mjs` -> PASS (`31/31`)
- `$env:PORTAL_DEV_URL='http://127.0.0.1:5173'; node scripts/tmp-p1-hrm-crud-qa-w1b-contract.mjs` -> PASS (`6/6`)

## 4) Module matrix (C/R/U/D + tested vs untested)

Legend:
- `Y` = explicitly validated in this rerun
- `N` = not explicitly validated in this rerun
- `PARTIAL` = mixed C/R/U/D coverage

| Module | C | R | U | D | Negative-path checked | Tested status | Module verdict |
|---|---|---|---|---|---|---|---|
| employees | Y | Y | Y | Y | N (no explicit 4xx mutation negative in this rerun) | TESTED | PASS |
| contracts | N | Y | N | N | N | PARTIAL-TESTED | PARTIAL |
| insurance | N | Y | N | N | N | PARTIAL-TESTED | PARTIAL |
| decisions | N | Y | N | N | N | PARTIAL-TESTED | PARTIAL |
| recruitment | Y | Y | Y | Y | N | TESTED | PASS |
| attendance | Y | Y | Y | Y | Y (`test:system:uat` includes scope-negative leave approve path) | TESTED | PARTIAL (blocked by failing required `hrm-api test`) |
| payroll | Y | Y | Y | Y | Y (`HRM-PAY-002`/precondition conflicts observed as deterministic in prior BE evidence; process flows validated) | TESTED | PASS |
| settings/admin | N | Y | Y (membership patch) | N | N | PARTIAL-TESTED | PARTIAL |
| leave | Y | Y | Y (approve in UAT) | N | Y (`tenant-scope-header-mismatch`, leave scope mismatch contract in prior closeout evidence) | TESTED | PARTIAL |

## 5) Negative-path checks (explicit)

Validated in this strict rerun chain:
- `test:system:uat` PASS includes negative/scope checks:
  - `tenant-scope-header-mismatch` PASS
  - manager leave approve sample PASS under correct scope
- Required command failure also captured as environment negative:
  - `test:pilot:flows` FAIL due `5175` not listening (`ECONNREFUSED`)

Not explicitly re-executed in this rerun:
- Per-module UI negative CRUD matrix for all modules (especially contracts/insurance/decisions/settings).

## 6) Final strict QA verdict

- Overall verdict: **FAIL**
- Phase-1 HRM CRUD scope 100% successful?: **NO**
- Why fail-closed:
  1. Required gate `pnpm --filter hrm-api test` failed.
  2. Required gate `pnpm run test:pilot:flows` failed.
  3. Several modules remain only PARTIAL on C/R/U/D coverage in this rerun evidence.

## 7) Residuals (explicit)

Blocking residuals:
1. `hrm-api` test suite instability (`attendance.controller.spec.ts` failures in this run).
2. Pilot flow command not executable on expected URL (`127.0.0.1:5175` refused).
3. Incomplete strict C/R/U/D evidence for contracts/insurance/decisions/settings/leave delete path.

Non-blocking residuals:
- None promoted.

## 8) Completion contract

- ack_status: `PASS_TO_PM`
- completion_report: Strict rerun executed with full required command set plus targeted CRUD probes; fail-closed verdict remains FAIL because two mandatory commands failed and coverage is still partial in several modules. CRUD scope cannot be claimed 100%.
- next_owner: `pm`
- next_dispatch_prompt: `Dispatch dev-be + qa for work_item_id P1-HRM-CRUD-QA-W2-STRICT-RERUN-RECOVERY. Entry: use docs/qa/evidence/p1-hrm-crud-qa-w2-strict-rerun-20260602.md. First close hrm-api unit failures in attendance.controller.spec.ts, then re-run full strict chain exactly: pnpm --filter hrm-api test; pnpm --filter web-portal test; pnpm --filter web-portal build; pnpm run qc:dev-stack; pnpm run qc:fe-be-health; pnpm run test:system:uat; pnpm run test:pilot:flows. Ensure pilot flow target URL is reachable (5175 or align script config) and publish updated C/R/U/D matrix with explicit TESTED vs UNTESTED per module. Exit only when all required commands pass and module matrix reaches 100% for in-scope CRUD.`
- evidence_path: `docs/qa/evidence/p1-hrm-crud-qa-w2-strict-rerun-20260602.md`
