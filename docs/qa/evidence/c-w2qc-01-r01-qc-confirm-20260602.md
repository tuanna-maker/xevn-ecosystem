# C-W2QC-01-R01-QC-CONFIRM (2026-06-02)

- work_item_id: `C-W2QC-01-R01-QC-CONFIRM`
- role: `qc`
- scope: confirm QA matcher closure for `D05/D07/D12` under fail-closed `NEG-R-SCOPE`
- inputs:
  - `docs/qa/evidence/c-w2qc-01-r01-matcher-close-20260602.md`
  - `docs/qa/evidence/c-w2qc-01-crud-matrix-close-20260602-run.json`
  - `scripts/tmp-c-w2qc-01-crud-matrix-close.mjs`

## 1) Matcher logic audit outcome (D05/D07/D12)

QC verified the matcher implementation is strict fail-closed:

- helper in probe script: `isExpectedScopeReject(result) => result.status === 409 && result.code === 'SCOPE_CONTEXT_MISMATCH'`
- applied to all target negative rows:
  - `contracts-insurance` `NEG-R-SCOPE` (`D05`)
  - `insurance` `NEG-R-SCOPE` (`D07`)
  - `decisions` `NEG-R-SCOPE` (`D12`)

This confirms PASS is granted only for exact `409` + exact business code `SCOPE_CONTEXT_MISMATCH`.

## 2) Reproducibility check

QC re-ran the matrix probe command:

```bash
$env:PORTAL_DEV_URL='http://127.0.0.1:5173'; node scripts/tmp-c-w2qc-01-crud-matrix-close.mjs
```

Observed result:

- process exit: `0`
- refreshed run artifact timestamp: `executed_at = 2026-06-02T15:06:59.555Z`
- target rows still deterministic PASS:
  - `D05`: `409 SCOPE_CONTEXT_MISMATCH` -> PASS
  - `D07`: `409 SCOPE_CONTEXT_MISMATCH` -> PASS
  - `D12`: `409 SCOPE_CONTEXT_MISMATCH` -> PASS

## 3) Acceptance-widening control

No silent widening detected for `NEG-R-SCOPE`:

- matcher does not accept generic `4xx`
- matcher does not accept code contains/partial match
- matcher does not accept `409` with alternate code

Therefore R01 closure preserves fail-closed semantics.

## 4) Residuals (outside R01 closure)

- `D16` remains a separate policy path (`NEG-R-HOLDING-POLICY` expected `200 HRM-SET-200`) and is not part of `D05/D07/D12` matcher closure.
- QA note mentioning settings `500` is not reproduced in current run artifact; treat as historical/non-R01 signal unless reintroduced by a fresh failing run.

## 5) QC verdict

- verdict: **GO**
- decision basis: fail-closed matcher closure for `D05/D07/D12` is reproducible and bounded; no acceptance-criteria widening found.

## Completion contract

- completion_report: QC confirmed `D05/D07/D12` now pass only on exact fail-closed negative semantics (`409 + SCOPE_CONTEXT_MISMATCH`) with reproducible rerun evidence and no silent matcher widening.
- next_owner: `pm`
- next_dispatch_prompt: `Publish PM closeout for work_item_id C-W2QC-01-R01-QC-CONFIRM with verdict GO scoped strictly to matcher closure of D05/D07/D12 under fail-closed NEG-R-SCOPE. Keep residual note that D16 policy path remains separate and must not be merged into this closure claim.`
- evidence_path: `docs/qa/evidence/c-w2qc-01-r01-qc-confirm-20260602.md`
- ack_status: `PASS_TO_PM`
