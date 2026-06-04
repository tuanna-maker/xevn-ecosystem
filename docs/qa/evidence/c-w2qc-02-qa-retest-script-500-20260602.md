# C-W2QC-02-QA-RETEST-SCRIPT-500

- work_item_id: `C-W2QC-02-QA-RETEST-SCRIPT-500`
- date: `2026-06-02`
- role: `qa`
- objective: Independently validate closure of runtime 500 regressions for `scripts/hrm-embed-fe-audit.mjs` and `scripts/verify-phase1-view-completeness.mjs`.
- input_evidence: `docs/qa/evidence/c-w2qc-02-be-fix-script-500-20260602.md`
- environment: local (`hrm-api=:28001`, `xbos-api=:28002`, `web-portal=:5173`)

## Command execution table

| step | command | expected | actual | verdict |
|---|---|---|---|---|
| 1 | `node scripts/qc-dev-stack.mjs` | stack healthy | hrm-api 200, xbos-api 200, web-portal 200 | PASS |
| 2 | `node scripts/qc-fe-be-api-health.mjs` | FE/BE API health all pass | summary `ALL PASS` (8/8 checks) | PASS |
| 3 | `node scripts/hrm-embed-fe-audit.mjs` (no `PORTAL_DEV_URL`) | no 500 / no `HRM-SYS-001` | P-CC-03..08 and FE-hrm-health all `PASS` with HTTP 200; artifact generated | PASS |
| 4 | `node scripts/verify-phase1-view-completeness.mjs` (no `PORTAL_DEV_URL`) | no 500 / no `HRM-SYS-001` | all modules `PASS` with HTTP 200; artifact generated | PASS |

## Key runtime evidence excerpts

### 1) Prechecks

```text
qc:dev-stack
✓ hrm-api: HTTP 200
✓ xbos-api: HTTP 200
✓ web-portal: HTTP 200
```

```text
qc-fe-be-api-health
INFO portal-base http://127.0.0.1:5173
=== Summary: ALL PASS ===
```

### 2) Script retest without custom PORTAL_DEV_URL

```text
PASS P-CC-03 200 HRM-EMP-200
PASS P-CC-04a 200 HRM-SET-200
PASS P-CC-04b 200 HRM-CON-200
PASS P-CC-04c 200 HRM-DEC-200
PASS P-CC-05 200 HRM-CON-200
PASS P-CC-06 200 HRM-REC-200
PASS P-CC-07 200 HRM-ATT-200
PASS P-CC-08 200 HRM-PAY-200
PASS FE-hrm-health 200 HRM-HEALTH-200
Wrote docs/qa/evidence/hrm-embed-fe-audit-20260602.md
```

```text
PASS employees http=200 total=1100 linked=50
PASS contracts http=200 total=777 linked=20
PASS insurance-expiring http=200 total=10 linked=10
PASS requisitions http=200 total=24 linked=24
PASS attendance http=200 total=304 linked=50
PASS payslips http=200 total=78 linked=78
PASS leave http=200 total=34 linked=34
PASS catalogs http=200 total=76 linked=76
PASS kpi-rollup http=200 total=0 linked=1
PASS dept-templates http=200 total=0 linked=0
Wrote docs/qa/evidence/phase1-view-completeness-20260602.md
```

## Fail-closed check

- Unexpected HTTP 500 observed: **No**
- `HRM-SYS-001` observed: **No**
- Forced custom `PORTAL_DEV_URL` used for target scripts: **No**

## QA verdict

- verdict: **PASS**
- rationale: Both target scripts execute successfully under default environment resolution and return only HTTP 200 outcomes for validated probes; no runtime 500 class regression or `HRM-SYS-001` was reproduced.

## Handoff contract

- ack_status: `PASS_TO_PM`
- completion_report: Independently revalidated script-500 closure with mandatory prechecks and direct script runs (no forced `PORTAL_DEV_URL`). Both scripts are green, no 500/`HRM-SYS-001`, and generated reproducible artifacts.
- next_owner: `pm`
- next_dispatch_prompt: `Dispatch qc for work_item_id C-W2QC-02-QC-REGATE-SCRIPT-500. Entry: audit docs/qa/evidence/c-w2qc-02-qa-retest-script-500-20260602.md together with docs/qa/evidence/c-w2qc-02-be-fix-script-500-20260602.md and generated script artifacts docs/qa/evidence/hrm-embed-fe-audit-20260602.md + docs/qa/evidence/phase1-view-completeness-20260602.md. Verify fail-closed criteria: no HTTP 500 and no HRM-SYS-001 in independent QA rerun without forced PORTAL_DEV_URL. Exit: publish GO or GO_WITH_CONDITIONS to close/re-gate C-W2QC-02 with explicit residual statement.`
