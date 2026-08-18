# D-HDSD-WF-LEAVE-BIND-01 — Leave create → XBOS WF instance bind

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HDSD-WF-LEAVE-BIND-01` |
| **program** | `HDSD-P2-FULL-01` |
| **parent QA** | `QA-HDSD-W4-INT-03-R2` (GWC — mutate 🟢, WF bind 🟡) |
| **Date** | 2026-07-30 |
| **Owner** | dev-be |
| **Constraints** | U65 zero-seed |

## Root cause

1. **Stale API response** — `createLeaveRequest` returned INSERT row before `LeaveWorkflowBridge` UPDATE `workflow_instance_id`, so POST 201 always showed `workflow_instance_id: null` even when spawn succeeded.
2. **Group CEO scope drift** — leave bridge sent `memberCompanyId: main` while recruitment bridge normalizes `main` → `holding` for XBOS partition/resolver context.
3. **Missing submitter** — controller did not pass JWT `sub` as `submitterUserId` to WF spawn (self-approve / resolver context).
4. **XBOS resolver hard-fail** — leave spawn had no soft fallback (recruitment had `GROUP_APPROVER_USER` fallback); resolver errors aborted instance start.

## Fix summary

| Layer | Change |
|-------|--------|
| **HRM** `leave-workflow.bridge.ts` | Group CEO portal scope parity (holding headers + context); forward `authorization`; explicit `x-tenant-id` / `x-company-id`; clearer spawn-miss logs |
| **HRM** `leave-requests.service.ts` | Merge/reload row after bridge — response includes `workflow_instance_id` when spawn OK |
| **HRM** `attendance.controller.ts` | `resolveScopeContext` + pass `submitterUserId` from JWT |
| **XBOS** `workflow-engine.service.ts` | Leave `hrm_leave_approval` soft fallback → `ceo@xe.vn` inbox task (parity recruitment) |
| **XBOS** `workflow-apply-scope.ts` | `isHrmLeaveWorkflowCode()` helper |

## Verification (jest)

```text
apps/api/hrm-api:
  pnpm exec jest --testPathPatterns="leave-workflow.bridge.spec|leave-requests.service.spec" --no-coverage
  → 31/31 PASS

apps/api/xbos-api:
  pnpm exec jest --testPathPatterns="workflow-engine.service.spec|workflow-apply-scope.spec" --no-coverage
  → 26/26 PASS
```

### New regression cases

- `LeaveWorkflowBridge.startLeaveWorkflowIfConfigured` — spawn UPDATE + holding scope when `companySlug=main`
- `LeaveRequestsService` — `D-HDSD-WF-LEAVE-BIND-01` returns `workflow_instance_id` in create response

## QA retest (browser U65 — required)

| Step | Expected |
|------|----------|
| Login `ceo@xe.vn` → HRM **Nghỉ phép** → **Gửi yêu cầu** | POST `/api/hrm/attendance/leave-requests` **201** |
| Response `data.workflow_instance_id` | **non-null UUID** |
| CC `/command-center/inbox` | New pending card for leave / marker visible |
| Network on inbox nav | `GET …/workflow-engine/tasks` **200** |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal `:5173` · stack L0 up (hrm `:28001`, xbos `:28002`).

## Residual

| ID | Item | Owner |
|----|------|-------|
| R-W4-INT-03-FE | CC inbox UI empty while tasks API 200 (prior QA) — verify FE load after BE bind | dev-fe + qa |
| R-W4-STACK-FLAP | Stack flap when not on dist-uat-w6 | devops |

## Handoff

**completion_report:** Closed BE bind path — scope normalization, submitter JWT, response refresh, XBOS leave spawn fallback. Jest 31+26 PASS. Live browser retest not run (HRM `:28001` down in agent session).

**next_owner:** qa

**next_dispatch_prompt:**
```
work_item_id: QA-HDSD-W4-INT-03-R3
from_role: dev-be | to_role: qa
entry_criteria: D-HDSD-WF-LEAVE-BIND-01 merged; L0 stack up
exit_criteria: U65 leave submit → POST 201 with workflow_instance_id non-null; CC inbox card for ceo@xe.vn; browser net workflow-engine/tasks 200; evidence qa-hdsd-w4-int-03-r3-20260730.md; ack PASS_TO_PM
read_first: docs/qa/evidence/d-hdsd-wf-leave-bind-01-20260730.md · docs/qa/evidence/qa-hdsd-w4-int-03-r2-20260730.md
U65: zero-seed
```

**evidence_path:** `docs/qa/evidence/d-hdsd-wf-leave-bind-01-20260730.md`

**ack_status:** READY_FOR_QA
