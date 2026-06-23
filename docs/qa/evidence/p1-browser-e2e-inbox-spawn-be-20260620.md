# P1-BROWSER-E2E-INBOX-08-09 — BE inbox spawn (U64/U65 no seed)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-INBOX-08-09` |
| **role** | dev-be |
| **executed_at** | 2026-06-20 |
| **ack_status** | **READY_FOR_QA** |

---

## Root cause (R4 §UF-08, 09, 15)

| UF | Symptom | Cause |
|----|---------|-------|
| **UF-XBOS-08** | POST `workflow-engine/definitions` **201** but CC inbox empty | `upsertDefinition` persisted graph only — no `xbos_workflow_instance` / `xbos_workflow_step_task` |
| **UF-XBOS-09/15** | FE extension save OK; `catalog-governance/inbox` **(0)** | Portal sent `x-catalog-write-mode: immediate` → skipped `submitExtensionItemsForApproval`; bridge only fired for `xe-du-lich`, not `xevn/main` from Command Center |

**U64/U65:** No `pnpm seed:workflow:inbox`. Inbox must spawn from product mutations.

---

## Fixes

### 1. UF-XBOS-08 — Workflow definition save → inbox task

**File:** `apps/api/xbos-api/src/workflow-engine/workflow-engine.service.ts`

- After **CREATE** (`POST /workflow-engine/definitions`) with `status: active`, call `maybeSpawnDefinitionInboxTask`.
- Parses canvas `graph.steps`, maps `handlerRoleId` → `hat_key` + `assignee_user_id` (`ceo@xe.vn` for BOD/group CEO).
- Creates instance `business_type = workflow_definition_review`, `business_id = definition.id`.
- Inserts pending step tasks for each graph step (idempotent: skip if pending task exists for definition).
- Company partition: JWT `main` → instance `holding` (ADR C2 parity).

**Constant:** `WF_BUSINESS_TYPE_DEFINITION_REVIEW` in `workflow-catalog.constants.ts`.

### 2. UF-XBOS-09/15 — Catalog extension → governance inbox

**Files:**

- `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.controller.ts` — `immediate` write only when **both** `x-catalog-write-mode: immediate` **and** `body.bulkSync: true` (U64 browser path uses approval).
- `apps/api/hrm-api/src/settings-catalogs/xbos-catalog-workflow.bridge.ts` — `shouldStartCatalogWorkflow` for `xevn` + `holding|main` (group CEO Command Center) in addition to `xe-du-lich`.

Flow after fix (browser):

```text
FE Thêm field → Lưu (Đồng bộ HRM)
 → POST …/extension-items (no bulkSync) → HRM-SET-209
 → submitExtensionItemsForApproval → batch + draft items
 → POST xbos catalog-governance/workflows/start
 → pending task assignee ceo@xe.vn
 → GET catalog-governance/inbox > 0
 → POST …/tasks/{id}/approve → consumer HRM review
```

---

## Verification (local jest)

| Package | Spec | Result |
|---------|------|--------|
| xbos-api | `p1-browser-e2e-inbox-spawn-wf.spec.ts` | **3/3 PASS** |
| xbos-api | `workflow-engine.service.spec.ts` | **4/4 PASS** |
| hrm-api | `p1-browser-e2e-inbox-spawn-cat.spec.ts` | **3/3 PASS** |
| hrm-api | `settings-catalogs.controller.spec.ts` | **33/33 PASS** |

Build:

- `apps/api/xbos-api` `pnpm run build` → exit **0**
- `apps/api/hrm-api` `pnpm run build` → exit **0**

---

## QA retest (:8088) — browser U64

**Account:** `ceo@xe.vn` / `Xevn@2026` · http://14.225.217.232:8088/

### UF-XBOS-08

1. `?settings=workflow` → **Thêm quy trình mới** → fill code/name → **Lưu quy trình**
2. Network: POST `/workflow-engine/definitions` **201**
3. `/command-center` → Hộp thư / Xử lý nhanh — **pending count +1** (new task for saved definition)
4. **Duyệt** → POST `/workflow-engine/tasks/{id}/complete` **201**; counter decreases; F5

### UF-XBOS-09 / UF-XBOS-15

1. `?settings=company_group_hr` → member → **Cấu hình chi tiết** → **Thêm field** → **Lưu** (Đồng bộ HRM)
2. Network: POST `…/extension-items` **201** `HRM-SET-209` (not `HRM-SET-202`)
3. `?settings=hrm_catalog_governance` → **Hộp thư (≥1)**
4. **Duyệt** → POST `catalog-governance/tasks/{id}/approve` **201** `XBOS-CAT-201`
5. Consumer stats / extension list updated; F5

**Cấm:** `pnpm seed:workflow:inbox`

---

## Deploy hint (devops)

VPS `:8088` requires **both** APIs rebuilt:

```powershell
# xbos-api — workflow spawn
pscp apps/api/xbos-api/dist/** root@14.225.217.232:/opt/xevn-ecosystem/apps/api/xbos-api/dist/

# hrm-api — catalog approval path + bridge
pscp apps/api/hrm-api/dist/** root@14.225.217.232:/opt/xevn-ecosystem/apps/api/hrm-api/dist/

# restart containers (compose service names per deploy guide)
docker compose restart xbos-be hrm-be
```

Then QA R5 retest UF-08, 09, 15 per `p1-browser-e2e-xbos-hrm-20260620.md` §R5.

---

## Residual

| Item | Owner | Note |
|------|-------|------|
| UF-14 scope 409 on :8088 | devops | Separate work item `P1-BROWSER-E2E-UF14-DEPLOY-8088-R4` — not in this BE scope |
| Bulk HRM sync scripts | dev-fe/devops | Must pass `bulkSync: true` in body if direct write needed |
| CC inbox UI empty banner text | dev-fe | Remove seed hint message after QA PASS |

---

## Handoff

- **ack_status:** `READY_FOR_QA`
- **evidence_path:** `docs/qa/evidence/p1-browser-e2e-inbox-spawn-be-20260620.md`
- **pm_dispatch_hint:** devops sync xbos-be + hrm-be on :8088 → qa `P1-BROWSER-E2E-XBOS-WAVE-8088-R5` UF-08/09/15
