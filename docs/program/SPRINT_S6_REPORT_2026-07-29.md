# Sprint S6 Report — PM Pipeline Recovery
Generated: 2026-07-29

## Snapshot before S6
- PM_PENDING_PIPELINE.healthy = false
- dispatchRequired = 3 (2x P0 suppressed, 1x P1 pending DISPATCHED)
- followupSuppressedCount = 28
- dispatchRequired (open) = 6
- inFlight = 6
- defer = 2

## Actions taken this sprint
1. Created docs/program/PM_PIPELINE_RECOVERY_2026-07-29.md with pending item map, suppressed followup classification, root cause, and next actions.
2. Created docs/program/PM_LOOP_QUEUE_REDESIGN_2026-07-29.md with state machine + recovery rules.
3. Created docs/program/SPRINT_EXECUTION_PLAN_2026-07-29.md with S6/S7 scope.

## Item status

### dispatchRequired
- HOOK-qa-276034_5: escalate to qa rerun narrow probe on ERP fidelity multi-domain spot.
- HOOK-qa-309fd5_5: escalate to qa rerun narrow probe on HRM settings picker spot.
- HRM-MD-PICKER-SPOT-01: qc DISPATCH required from PM; PASS_TO_PM already in bus.

### dispatchRequired backlog
- MOB-XEVN-BRAND-TOKENS-L1-01: needs qc DISPATCHED.
- MOB-XEVN-BRAND-PRIMITIVES-L2-01: needs qc DISPATCHED.
- HRM-EMP-COMPANY-COL-01: needs qc DISPATCHED.
- MOB-SPEC-ORPHAN-CODE-SAMPLE-01: needs qa DISPATCHED.
- P1-EX-QA-HTTPS-RESIDUAL-03-R3: appears both dispatchRequired and inFlight; needs reconciliation.
- HRM-SETTINGS-MASTER-DATA-01: needs qa DISPATCHED.

### inFlight
- P1-EX-QA-HTTPS-RESIDUAL-03-R3
- HRM-REC-WF-OPTION-B-01
- HRM-EMP-COMPANY-COL-SYNC-01
- HRM-SETTINGS-MD-CRUD-FE-01
- HRM-SETTINGS-MD-CRUD-BE-01
- HRM-EMP-COMPANY-COL-FE-01
Action: if any item lacks evidence newer than 7 days, escalate to owning PM lane.

### defer
- C-HRMQC-01: keep deferred until explicit user deploy request; document as waiting on external trigger.
- C-MOB-H9-DEVICE-01: keep optional GWC; no adb available currently.

## Next steps
- Reconcile dispatchRequired vs inFlight overlap.
- Dispatch P1 brand/company-col/settings items to qc/qa this turn.
- Dry-run PM loop using redesigned state machine from PM_LOOP_QUEUE_REDESIGN_2026-07-29.md.