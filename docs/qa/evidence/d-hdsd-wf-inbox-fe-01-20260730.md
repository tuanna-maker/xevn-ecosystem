# D-HDSD-WF-INBOX-FE-01 — CC inbox workflow-engine wire

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HDSD-WF-INBOX-FE-01` |
| **program** | `HDSD-W4-INTEGRATION` |
| **Date** | 2026-07-30 |
| **Owner** | dev-fe |
| **U65** | zero-seed |

## Root cause

1. **`/command-center/inbox` had no route** — React Router did not mount a page that calls `GET /api/xbos/workflow-engine/tasks`; QA saw CC title shell with empty body and no inbox net capture.
2. **Assignee filter gap** — QA session inject stores `{ email: 'ceo@xe.vn' }` without `userId`; `resolveInboxAssigneeUserId()` omitted `assigneeUserId` query param unless `VITE_DEV_USER_ID` was set.

## Changes

| File | Change |
|------|--------|
| `App.tsx` | Route `command-center/inbox` → `CommandCenterInboxPage` (before `command-center` parent) |
| `CommandCenterInboxPage.tsx` | **New** — mount fetch `fetchCommandCenterInboxTasks` → `listWorkflowTasks` → `GET workflow-engine/tasks`; render pending cards (`data-testid=cc-inbox-panel`, `cc-inbox-task-card`) |
| `commandCenterInboxApi.ts` | Email fallback for assignee; `hrm_leave` card title/subtitle (`Nghỉ phép`) |
| `commandCenterUrl.ts` | `CC_INBOX_PATH`, `isCommandCenterInboxPath()` |
| `CommandCenterPage.tsx` | Same `data-testid` on home Action Cards rail |

## API contract (unchanged)

```
GET /api/xbos/workflow-engine/tasks?tenantId=xevn&status=pending&assigneeUserId=ceo@xe.vn
```

Mapped fields: `business_type=hrm_leave` → subtitle **Nghỉ phép**, `moduleCode=hrm`.

## Tests (vitest PASS)

```bash
pnpm exec vitest run \
  src/integrations/commandCenterInboxApi.test.ts \
  src/modules/hrm/commandCenterUrl.test.ts \
  src/pages/command-center/CommandCenterInboxPage.test.tsx
```

- Assignee: `userId` and `{ email }` fallback → `ceo@xe.vn`
- Inbox page: calls `fetchCommandCenterInboxTasks` on mount; renders leave card

## QA retest (browser — PM/QA)

**Persona:** `ceo@xe.vn` / `Xevn@2026`  
**Pre:** U65 leave POST 201 from `/hr/attendance` (no seed)

| Step | Expected |
|------|----------|
| Nav `/command-center/inbox` | Page body: **Việc cần xử lý** + assignee line |
| Network | `GET …/workflow-engine/tasks` **200** on nav |
| UI | ≥1 `cc-inbox-task-card` with **Nghỉ phép** for pending `hrm_leave` |

## Residual

| ID | Item | Owner |
|----|------|-------|
| R-W4-INT-03-WF-RESP | HRM-LEAVE-201 body may omit `workflow_instance_id` (async bind) | dev-be |

---

**completion_report:** Wired dedicated CC inbox route + page; fixed assignee email fallback; hrm_leave card labels; vitest PASS.  
**next_owner:** qa  
**next_dispatch_prompt:** Retest `QA-HDSD-W4-INT-03-R4` — U65 leave submit → `/command-center/inbox` → assert `workflow-engine/tasks` 200 + card `Nghỉ phép`; evidence update `qa-hdsd-w4-int-03-r3-20260730.md` successor.  
**evidence_path:** `docs/qa/evidence/d-hdsd-wf-inbox-fe-01-20260730.md`  
**ack_status:** READY_FOR_QA
