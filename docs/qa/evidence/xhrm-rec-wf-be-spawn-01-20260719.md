# XHRM-REC-WF-BE-SPAWN-01 — Fix HRM→XBOS spawn submitter.employeeId

| Field | Value |
|-------|--------|
| **work_item_id** | `XHRM-REC-WF-BE-SPAWN-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **date** | 2026-07-19 |
| **lane** | execution |
| **change_mode** | FIX |
| **parent_fail** | `docs/qa/evidence/xhrm-rec-wf-qa-canvas-01-20260719.md` |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE §3 · data contract §4.3 · XBOS `startInstanceFromWorkflowCode` |

## Root cause

QA: defs active via FE; submit/start still `spawnMissing: true` because XBOS `POST .../instances/start` returned **400** `XBOS-WF-400` — `workflowCode, businessType, businessId, submitter.employeeId required`.

HRM bridge sent `submitter.employeeId: null` (controllers only passed `submitterUserId` from `x-user-id`; no employee UUID resolution).

## Fix

| Change | Detail |
|--------|--------|
| `RecruitmentWorkflowBridge.resolveSubmitterEmployeeId` | Explicit `submitterEmployeeId` → else UUID userId → else `employees` by `lower(email)` with company expand + email-only fallback |
| `startRecruitmentWorkflowIfConfigured` | Resolve before fetch; fail-closed SPAWN-MISSING if unresolved (no XBOS 400); payload always non-empty `employeeId` on call |
| must_keep | Leave bridge **untouched** (read-only import of `expandWorkflowResolverCompanyIds`); F6 `REC_WF_TASK_TYPE_TO_STAGE` unchanged |
| `@CODE-MEMORY-CHANGE` | `XHRM-REC-WF-BE-SPAWN-01` on bridge |

## Jest evidence

```text
pnpm --filter hrm-api exec jest \
  src/recruitment/recruitment-workflow.bridge.spec.ts \
  src/attendance/leave-workflow.bridge.spec.ts \
  --no-coverage
→ Test Suites: 2 passed · Tests: 20 passed
```

New / updated cases:

| Case | Assert |
|------|--------|
| VAL-REC-WF-01/02 + explicit employeeId | Start body `submitter.employeeId` present; instance persisted |
| **XHRM-REC-WF-BE-SPAWN-01** email resolve | `submitterUserId=ceo@xe.vn` → DB id → XBOS body has employeeId → `workflowInstanceId` not null |
| unresolved email | SPAWN-MISSING; **no** fetch call |

## Forbidden honored

- No `pnpm seed:*`
- No Phase1 / PROD claim
- Leave bridge + F6 map not modified (must_keep)

## Residual for QA

- Live retest J-REC-WF-02 prefer instance when def active; then J-03/06 (U65 browser-only)
- If `ceo@xe.vn` has no `employees` row → still SPAWN-MISSING (data, not payload) — report separately

## completion_report

**Closed:** XBOS-required `submitter.employeeId` resolved and included on HRM→XBOS start; jest spawn success path with active-def simulation (`workflow_instance_id` set / spawnMissing false path); leave + F6 must_keep.

**Open:** Browser QA retest canvas submit/start.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: XHRM-REC-WF-QA-CANVAS-02
from_role: pm
to_role: qa
lane: execution
change_mode: RETEST
residual_auto_fix: true

## entry
XHRM-REC-WF-BE-SPAWN-01 READY_FOR_QA — docs/qa/evidence/xhrm-rec-wf-be-spawn-01-20260719.md
U65 zero-seed · browser-only · ceo@xe.vn
Defs already active from J-REC-WF-01 (hrm_requisition_approval, hrm_candidate_pipeline, hrm_recruitment_plan_approval)

## deliver
1. J-REC-WF-02: Gửi duyệt QT on requisition with active def → prefer workflow_instance_id NOT null / spawnMissing false (or Network XBOS start 2xx + HRM persists id)
2. If spawn PASS: J-REC-WF-03 approve + J-REC-WF-06 reject (Inbox → HRM sync → F5)
3. Regression: UF-HRM-12 · AC-CD-F6 · leave tab smoke
4. Evidence: docs/qa/evidence/xhrm-rec-wf-qa-canvas-02-20260719.md

## cấm
seed · Phase1/PROD claim · PASS only on probe without FE click path
```

## ack_status

**READY_FOR_QA**
