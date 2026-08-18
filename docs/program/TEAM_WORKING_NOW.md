# TEAM_WORKING_NOW
_Last updated: 2026-08-18 (PM turn — S7-FE retest dispatched after BUG-1+BUG-2 fix)_

## Status: QA RETEST IN FLIGHT — BA-CTR-TPL-8-CLAUSE-MAP-01-S7-FE-RETEST-01

### Active agent
- **qa lane** (ada119a082da1323b) — retest ContractClauseOverrideEditor browser QA
  - Lý do retest: lần QA đầu FAIL_TO_PM vì BUG-1 (UUID clause_id bị 400) + BUG-2 (PK collision 500)
  - Bugs đã fix: assertClauseIdFormat chấp nhận UUID v4, PK = crypto.randomUUID()
  - Server đã hot-reload nhận code mới

### Fix timeline (2026-08-18)
1. QA #1 → FAIL_TO_PM: BUG-1 + BUG-2 phát hiện
2. PM decision: A) relax validation, B) UUID PK
3. dev-be (ab03bc2e96b3305a8) → READY_FOR_QA: cả 2 bugs fixed, curl live pass
4. QA retest (ada119a082da1323b) → IN_PROGRESS

### TC expected
| TC | Expected |
|----|----------|
| TC-S7-FE-01 | PASS (confirmed trước) |
| TC-S7-FE-02 | PASS now (UUID → 200/404 not 400) |
| TC-S7-FE-03 | PASS (PUT upsert + F5 persist) |
| TC-S7-FE-04 | PASS or NOTE (warnings badge ft_*) |
| TC-S7-FE-05 | PASS (3 source options) |

### Known hold
- TV tab hide: DEFERRED — ContractCreateWizardDialog.tsx Cursor-held (D-FE-CTR-CB-BOOT-01)

### After QA
- If PASS_WITH_HOLD: update queue #19/#21 to DONE, promote S7 cluster
- Then: read rolling queue for next WI (#22+)

## Environment
- HRM BE: :28001 (hot-reload, bug fix live)
- HRM FE: :8080

## Queue snapshot
- #19 BA-CTR-TPL-8-CLAUSE-MAP-01-S7-IMPL-01: IN_PROGRESS
- #20 QA-S7-FE-01: FAIL_TO_PM (BUG-1+BUG-2)
- #20b BA-CTR-TPL-8-S7-BE-FIX-01: DONE (READY_FOR_QA)
- #21 QA-S7-FE-RETEST-01: IN_PROGRESS (current)

## Forbidden zones (Cursor-held)
- apps/web/hrm/src/components/payroll/policy-pack/**
- ContractCreateStep1GeneralGrid.tsx + ContractCbReadOnlyCard.tsx + ContractCreateWizardDialog.tsx
- apps/api/hrm-api/src/contracts-insurance/**
- apps/api/hrm-api/src/payroll/**
