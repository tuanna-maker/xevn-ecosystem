# C-W2QC-02 Pilot Port Harden QA Retest

- work_item_id: `C-W2QC-02-PILOT-PORT-HARDEN-QA`
- executed_at: `2026-06-02`
- tester_role: `qa`
- source_evidence: `docs/qa/evidence/c-w2qc-02-pilot-port-harden-20260602.md`

## Scope

Verify FE/script hardening for pilot-flow port contract with fail-closed evidence:
1. Default `test:pilot:flows` (no `PORTAL_DEV_URL`).
2. Explicit override behavior (`5173`, `5175`).
3. Shared resolver contract in related scripts:
   - `scripts/hrm-embed-fe-audit.mjs`
   - `scripts/verify-phase1-view-completeness.mjs`

## Command results

| # | Command | Exit | Verdict | Key output |
|---|---|---:|---|---|
| 1 | `pnpm run test:pilot:flows` | `0` | PASS | Base resolved `http://127.0.0.1:5173`; summary `13/13 PASS`; no false `ECONNREFUSED 127.0.0.1:5175`. |
| 2 | `PORTAL_DEV_URL=http://127.0.0.1:5173 pnpm run test:pilot:flows` | `0` | PASS | Explicit override honored; summary `13/13 PASS`. |
| 3 | `PORTAL_DEV_URL=http://127.0.0.1:5175 pnpm run test:pilot:flows` | `1` | PASS (expected deterministic failure class) | Login step passed then request failed with `connect ECONNREFUSED 127.0.0.1:5175`. |
| 4 | `node scripts/hrm-embed-fe-audit.mjs` (with `PORTAL_DEV_URL` unset) | `1` | FAIL | No `ECONNREFUSED`; all audited HRM/FE checks returned `500`; wrote `docs/qa/evidence/hrm-embed-fe-audit-20260602.md`. |
| 5 | `node scripts/verify-phase1-view-completeness.mjs` (with `PORTAL_DEV_URL` unset) | `1` | FAIL | No `ECONNREFUSED`; most HRM views `500` while KPI/template rows passed; wrote `docs/qa/evidence/phase1-view-completeness-20260602.md`. |

## Assessment

- Port hardening behavior for `test:pilot:flows` is verified:
  - Default invocation resolved active portal (`5173`) correctly.
  - Explicit `5173` override works.
  - Explicit `5175` override produces deterministic expected failure class when 5175 is not active.
- Fail-closed quality verdict remains **FAIL** for this QA wave because related resolver consumers (`hrm-embed-fe-audit`, `verify-phase1-view-completeness`) currently fail with runtime `500` regressions.

## Final verdict

- `C-W2QC-02-PILOT-PORT-HARDEN-QA`: **FAIL_TO_CLOSE (fail-closed)**
- residual:
  - `R-C-W2QC-02-01`: `scripts/hrm-embed-fe-audit.mjs` returns multi-route `500`.
  - `R-C-W2QC-02-02`: `scripts/verify-phase1-view-completeness.mjs` returns broad HRM `500`.

## Handoff

- ack_status: **PASS_TO_PM**
- next_owner: `pm`
- next_dispatch_prompt: `Dispatch qc for work_item_id C-W2QC-02-PILOT-PORT-HARDEN-QA-RG1. Entry: audit docs/qa/evidence/c-w2qc-02-pilot-port-harden-qa-20260602.md with raw command outcomes. Confirm port-contract hardening success on test:pilot:flows (default + override behavior) and enforce fail-closed on related script regressions (hrm-embed-fe-audit + verify-phase1-view-completeness returning 500). Exit: issue GO_WITH_CONDITIONS or NO-GO with explicit owner dispatch for 500 regressions before closing C-W2QC-02.`
