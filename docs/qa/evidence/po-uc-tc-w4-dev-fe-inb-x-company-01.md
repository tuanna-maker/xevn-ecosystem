# PO-UC-TC-W4-DEV-FE-INB-X-COMPANY-01 — Inbox complete `x-company-id` parity

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-DEV-FE-INB-X-COMPANY-01` |
| **role** | dev-fe |
| **executed_at** | 2026-08-04 |
| **prior** | `docs/qa/evidence/po-uc-tc-w4-qa-e1-p1-inb-cv.md` residual `R-W4E1-INB-X-COMPANY` |
| **change_mode** | FIX |
| **u65_zero_seed** | true |
| **ack_status** | **READY_FOR_QA** |

---

## Root cause

| Layer | Behavior before | After |
|-------|-----------------|-------|
| `completeWorkflowTask` / `rejectWorkflowTask` | `scopeInit(tenant, **null**)` → `xbosHttp` skipped `x-company-id` | Always `resolveXbosStrictCompanyId` → `companyId` on init |
| `listWorkflowTasks` | No `companyId` on GET | Same `scopeInit` (parity with definitions list/PUT) |
| Canvas `saveWorkflowDefinition` | Already passed `companyId` → header `main` | Unchanged (must_keep) |

`xbosHttp.buildHeaders` only emits `x-company-id` when `init.companyId` is non-empty — inbox complete omitted it → Playwright captured **null**.

---

## Changes (preserve leave approve path)

| File | Delta |
|------|--------|
| `apps/web/web-portal/src/integrations/workflowEngineApi.ts` | `scopeInit` always resolves strict company; complete/reject/list accept `companyIdHint`; CODE-MEMORY |
| `workflowEngineApi.inbox.test.ts` | Assert `companyId: 'main'` on complete/reject + hint override |
| `workflowEngineApi.coalesce.test.ts` | Assert list passes `companyId: 'main'` |
| `commandCenterInboxApi.ts` + test | Optional `companyId` → `listWorkflowTasks` |
| `CommandCenterInboxPage.tsx` | Duyệt + fetch pass `MEMBER_DEFAULT_COMPANY_ID` |
| `CommandCenterPage.tsx` | Drawer/quick complete + reload pass `companyId` from `useTenantScope` |

**must_keep intact:** leave approve → POST complete (path/payload unchanged); DEPT VAL-014 untouched; Leave L2 not invented; U65 no seed.

---

## Regression

```text
pnpm --filter web-portal exec vitest run \
  src/integrations/workflowEngineApi.inbox.test.ts \
  src/integrations/workflowEngineApi.coalesce.test.ts \
  src/integrations/commandCenterInboxApi.test.ts \
  src/integrations/xbosHttp.test.ts
```

| Suite | Result |
|-------|--------|
| workflowEngineApi.inbox | **6/6 PASS** |
| workflowEngineApi.coalesce | **3/3 PASS** |
| commandCenterInboxApi | **7/7 PASS** |
| xbosHttp | **6/6 PASS** |
| **Total** | **22/22 PASS** |

---

## QA smoke (copy-ready — header only)

Persona: `ceo@xe.vn` · portal local · **U65 zero-seed** · cấm invent Leave L2.

1. Login → Hộp thư `/command-center/inbox` (or CC inbox drawer).
2. Open FE-origin leave task → **Duyệt**.
3. DevTools Network: `POST /api/xbos/workflow-engine/tasks/{id}/complete`
   - Expect: request header **`x-company-id: main`** (parity with PUT definitions).
   - Expect: response **2xx** + `XBOS-WF-200` (must_keep approve path).
4. Optional: GET `.../tasks?status=pending` also has `x-company-id: main`.

Do **not** reopen DEPT FD · do **not** seed inbox · do **not** claim Leave L2.

---

## completion_report

| Closed | Residual / open |
|--------|-----------------|
| FE always sets `companyId` on complete/reject/list; vitest 22/22; CODE-MEMORY | Browser smoke header capture (QA); L2/self still out of scope |

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QA-INB-X-COMPANY-01
from_role: pm
to_role: qa
lane: execution
priority: P2
u65_zero_seed: true
ack_status_target: PASS_TO_PM

CONTEXT: Dev-FE closed R-W4E1-INB-X-COMPANY — complete/reject/list now pass companyId (strict → main for group CEO).
evidence_dev: docs/qa/evidence/po-uc-tc-w4-dev-fe-inb-x-company-01.md
prior: docs/qa/evidence/po-uc-tc-w4-qa-e1-p1-inb-cv.md

MISSION (header smoke only):
1) L0 portal + xbos up
2) ceo@xe.vn → inbox → Duyệt leave FE-origin (no seed)
3) Capture POST …/tasks/:id/complete — assert request header x-company-id=main (parity definitions PUT)
4) Response still 2xx XBOS-WF-200 (must_keep approve)
5) Write evidence docs/qa/evidence/po-uc-tc-w4-qa-inb-x-company-01.md
CẤM: seed · invent Leave L2 · reopen DEPT
```

## ack_status

**READY_FOR_QA**
