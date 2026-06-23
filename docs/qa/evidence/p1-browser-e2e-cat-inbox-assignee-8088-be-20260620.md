# P1-BROWSER-E2E-CAT-INBOX-ASSIGNEE-8088 — Dev-BE evidence

**work_item_id:** `P1-BROWSER-E2E-CAT-INBOX-ASSIGNEE-8088`  
**date:** 2026-06-20  
**role:** dev-be  
**ack_status:** READY_FOR_QA

## Root cause

VPS catalog workflow step tasks were inserted with `assignee_user_id=ceo@xevn.vn` (stale definition graph) while inbox API queries `ceo@xe.vn` → count 0 despite valid `workflowInstanceId`.

Probe: `spawnPass=true`, `inboxSpawnPass=false`.

## Fix

| Area | Change |
|------|--------|
| `catalog-governance.service.ts` → `startCatalogApprovalWorkflow` | Always set `assigneeUserId: GROUP_APPROVER_USER` (`ceo@xe.vn`) for `group_catalog_approval` — do not read stale `definition.graph` assignee |
| `catalog-governance.service.ts` → `ensureXeDuLichCatalogWorkflow` | When active definition graph has wrong assignee on `group_catalog_approval`, `upsertDefinition` refresh with canonical graph from `buildXeDuLichCatalogWorkflowDefinition()` |
| Regression spec | `p1-browser-e2e-cat-inbox-assignee-8088.spec.ts` — stale `ceo@xevn.vn` graph still spawns inbox task for `ceo@xe.vn` |

## VPS hotfix — pending tasks (one-liner)

Run on production DB **before or after** xbos-be redeploy:

```sql
UPDATE xbos_workflow_step_task SET assignee_user_id='ceo@xe.vn' WHERE assignee_user_id='ceo@xevn.vn';
```

Optional verify:

```sql
SELECT id, assignee_user_id, status FROM xbos_workflow_step_task WHERE assignee_user_id LIKE '%ceo%' AND status='pending';
```

## Verification

```bash
pnpm --filter xbos-api exec jest --testPathPatterns="catalog-governance|inbox-spawn"
# Test Suites: 4 passed, 4 total | Tests: 22 passed

pnpm --filter xbos-api build
# exit 0
```

## Handoff

- **next_owner:** devops → qa  
- **devops:** pscp/rebuild xbos-be on VPS `:8088`; run SQL hotfix above for existing pending tasks  
- **qa:** UF-XBOS-09/15 browser R6 — login `ceo@xe.vn` → catalog extension save → inbox shows pending catalog approval task; F5 persists

## Files touched

- `apps/api/xbos-api/src/catalog-governance/catalog-governance.service.ts`
- `apps/api/xbos-api/src/catalog-governance/p1-browser-e2e-cat-inbox-assignee-8088.spec.ts`
- `apps/api/xbos-api/src/catalog-governance/p1-browser-e2e-inbox-spawn-cat.spec.ts` (assert assignee on startInstance)
