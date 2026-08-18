# D-HDSD-WF-LEAVE-RESP-01 — POST 201 synchronous workflow_instance_id

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HDSD-WF-LEAVE-RESP-01` |
| **program** | `HDSD-W4-INTEGRATION` |
| **parent** | `QA-HDSD-W4-INT-03-R3` · `D-HDSD-WF-LEAVE-BIND-01` |
| **Date** | 2026-07-30 |
| **Owner** | dev-be |
| **Constraints** | U65 zero-seed |

## Root cause

`D-HDSD-WF-LEAVE-BIND-01` added merge/reload logic in **src**, but UAT stack ran **stale** `dist-uat-w6/attendance/leave-requests.service.js` which still `return row` after bridge (no merge). QA R3: POST 201 `workflow_instance_id: null` while GET ~10s later showed populated id — bridge UPDATE ran synchronously but HTTP body returned pre-bridge INSERT row.

## Fix summary

| Layer | Change |
|-------|--------|
| `leave-workflow.bridge.ts` | UPDATE … **RETURNING** `workflow_instance_id`; parse `data.instanceId` from XBOS envelope |
| `leave-requests.service.ts` | `loadLeaveRequestById()` after bridge; merge id from DB reload **or** bridge result into POST response |

## Verification (jest)

```text
cd apps/api/hrm-api
pnpm exec jest --testPathPatterns="leave-workflow.bridge.spec|leave-requests.service.spec" --no-coverage
→ 33/33 PASS
```

### New regression cases

- `D-HDSD-WF-LEAVE-RESP-01` bridge — accepts `data.instanceId` XBOS envelope + RETURNING UPDATE
- `D-HDSD-WF-LEAVE-RESP-01` service — reload SELECT after bridge returns non-null `workflow_instance_id`

## Live smoke (QA retest required)

| Step | Expected |
|------|----------|
| Restart HRM from **src** (not stale `dist-uat-w6`) | `pnpm run dev:hrm-api` or rebuild dist |
| Login `ceo@xe.vn` → HRM **Nghỉ phép** → **Gửi yêu cầu** | POST `/api/hrm/attendance/leave-requests` **201** |
| Response `data.workflow_instance_id` | **non-null UUID** (same request, no wait) |

**Note:** `:28001` was up during dev session but running pre-fix compiled bundle; browser smoke deferred to QA after stack rebuild.

## Residual

| ID | Item | Owner |
|----|------|-------|
| R-W4-INT-03-INBOX-UI | CC inbox UI empty — separate FE lane | dev-fe |
| R-W4-STACK-REBUILD | UAT dist-uat-w6 must rebuild/restart to pick up fix | devops |

## Handoff

**completion_report:** Closed BE response sync — bridge RETURNING + service reload/merge ensures POST 201 includes `workflow_instance_id` when WF spawn succeeds. Jest 33/33 PASS. Live POST smoke not run (stale dist on :28001).

**next_owner:** qa

**next_dispatch_prompt:**
```
work_item_id: QA-HDSD-W4-INT-03-R4
from_role: dev-be | to_role: qa
entry_criteria: D-HDSD-WF-LEAVE-RESP-01 merged; HRM restarted from src/rebuilt dist; L0 stack up
exit_criteria: U65 leave submit → POST 201 body workflow_instance_id non-null UUID (no ~10s wait); optional GET confirms same id; evidence qa-hdsd-w4-int-03-r4-20260730.md; ack PASS_TO_PM
read_first: docs/qa/evidence/d-hdsd-wf-leave-resp-01-20260730.md · docs/qa/evidence/qa-hdsd-w4-int-03-r3-20260730.md
U65: zero-seed
```

**evidence_path:** `docs/qa/evidence/d-hdsd-wf-leave-resp-01-20260730.md`

**ack_status:** READY_FOR_QA
