# C-W2QC-01-R01-MATCHER-CLOSE (2026-06-02)

- work_item_id: `C-W2QC-01-R01-MATCHER-CLOSE`
- role: `qa`
- goal: align `NEG-R-SCOPE` matcher semantics so runtime `409 SCOPE_CONTEXT_MISMATCH` is classified `PASS` for matrix rows `D05/D07/D12`
- scope: QA-owned probe matcher + re-execution proof

## 1) Audit result and matcher fix

Audited `scripts/tmp-c-w2qc-01-crud-matrix-close.mjs` and found `NEG-R-SCOPE` checks used:

- `status === 409 && code.includes("409")`

This mismatched runtime contract where canonical business code is `SCOPE_CONTEXT_MISMATCH`.

QA matcher fix applied:

- added helper `isExpectedScopeReject(result) => result.status === 409 && result.code === 'SCOPE_CONTEXT_MISMATCH'`
- updated `NEG-R-SCOPE` checks for:
  - contracts-insurance (`D05`)
  - insurance participants (`D07`)
  - decisions (`D12`)

## 2) Re-run proof

Executed:

```bash
$env:PORTAL_DEV_URL='http://127.0.0.1:5173'; node scripts/tmp-c-w2qc-01-crud-matrix-close.mjs
```

Re-run artifact:

- `docs/qa/evidence/c-w2qc-01-crud-matrix-close-20260602-run.json`
- `executed_at`: `2026-06-02T15:03:34.889Z`

## 3) D05 / D07 / D12 verdict after matcher alignment

| Defect | Probe row | Runtime evidence | Matcher verdict | Final verdict |
|---|---|---|---|---|
| D05 | contracts-insurance `NEG-R-SCOPE` | `GET ...contracts?company_id=holding` -> `409 SCOPE_CONTEXT_MISMATCH` | PASS | CLOSED |
| D07 | insurance participants `NEG-R-SCOPE` | `GET ...insurance-policy-participants?company_id=holding` -> `409 SCOPE_CONTEXT_MISMATCH` | PASS | CLOSED |
| D12 | decisions `NEG-R-SCOPE` | `GET ...decisions?company_id=holding&page_size=20` -> `409 SCOPE_CONTEXT_MISMATCH` | PASS | CLOSED |

Fail-closed interpretation used:

- expected negative path for scope mismatch is exact `HTTP 409` + `code=SCOPE_CONTEXT_MISMATCH`
- any other status/code remains FAIL

## 4) Residual note outside R01 scope

- This closure is scoped to matcher semantics for `D05/D07/D12`.
- Same rerun surfaced separate `settings/admin` `500` responses; these are outside residual `R01` matcher closure scope and require independent follow-up if promoted.

## 5) QC confirmation prompt

`Run QC confirmation for work_item_id C-W2QC-01-R01-MATCHER-CLOSE using docs/qa/evidence/c-w2qc-01-r01-matcher-close-20260602.md and docs/qa/evidence/c-w2qc-01-crud-matrix-close-20260602-run.json. Verify matcher policy now treats expected NEG-R-SCOPE runtime (409 + SCOPE_CONTEXT_MISMATCH) as PASS for D05/D07/D12 under fail-closed semantics, and issue GO/GO_WITH_CONDITIONS with residual ownership for any non-R01 findings.`

## Completion contract

- completion_report: Audited and fixed QA probe matcher policy for `NEG-R-SCOPE` handling, then re-ran probes and confirmed `D05/D07/D12` now pass by fail-closed expected semantics (`409 SCOPE_CONTEXT_MISMATCH`).
- next_owner: `pm`
- next_dispatch_prompt: `Dispatch qc for work_item_id C-W2QC-01-R01-MATCHER-CLOSE with docs/qa/evidence/c-w2qc-01-r01-matcher-close-20260602.md and docs/qa/evidence/c-w2qc-01-crud-matrix-close-20260602-run.json. Confirm D05/D07/D12 are closed by matcher-policy alignment (expected 409 scope mismatch now PASS) and publish QC confirmation verdict with residual ownership for non-R01 findings.`
- evidence_path: `docs/qa/evidence/c-w2qc-01-r01-matcher-close-20260602.md`
- ack_status: `PASS_TO_PM`
