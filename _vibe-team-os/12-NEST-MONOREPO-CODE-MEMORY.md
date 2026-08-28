# Nest / monorepo CODE-MEMORY (XeVN & tương tự)

**Cập nhật:** 2026-07-19  
**Bổ sung:** `04-CODE-MEMORY-JOURNAL.md` (template tổng) — không thay thế.

---

## Khi nào

| Touch | Bắt buộc |
|-------|----------|
| `apps/api/*/src/**` business | Có |
| `apps/web-portal/**` / mobile business | Có |
| Bridge / S2S / workflow spawn | Có + ghi Callees cross-service |
| Migration Prisma | Có (SQL/`@CODE-MEMORY` trên migration note) |
| Pure jest / probe | Không |

---

## Mẫu Nest service (UPGRADE bridge)

```ts
/**
 * @CODE-MEMORY
 * Screen: HRM Recruitment / XBOS Workflow Inbox
 * UC: UC-HRM-REC-WF-01 (delta) · BR: BR-REC-WF-01
 * SRS: docs/hrm/SRS.md §… · docs/program/deltas/… 
 * TechSpec: docs/hrm/TECHSPEC.md §… · OpenAPI hrm-api recruitment + xbos workflows/start
 * Purpose: Spawn XBOS workflow instance when requisition/candidate hits configured stage;
 *          does NOT replace local recruitment CRUD or catalog publish/pull.
 * WorkItem: XHRM-REC-WF-BE-01
 * Coded: 2026-07-19
 * Callers: RecruitmentService.updateStage → this.spawnIfConfigured
 * Callees: XbosWorkflowClient.start(workflow_code) → xbos-api WorkflowEngine
 * FEActions: PATCH stage → list/detail refetch → inbox task (XBOS)
 * BEChain: recruitment.stage → bridge → workflows/start → inbox → terminal callback → HRM stage
 * Impact: Wrong SoT breaks leave/catalog bridges if shared client misconfigured
 * must_keep: LeaveWorkflowBridge; CatalogWorkflowBridge; UF-HRM-12 local CRUD; catalog sync J-XBOS-02/08
 * SOLID: SRP — bridge only; domain rules stay in RecruitmentService
 * LastVerified: docs/qa/evidence/…
 *
 * @CODE-MEMORY-CHANGE 2026-07-19
 * work_item: XHRM-REC-WF-BE-01
 * change_mode: UPGRADE
 * why: Customer B-Minutes — XBOS process must drive recruitment roadmap (extend, not overwrite CRUD)
 */
```

---

## Gate QA

- Evidence phải cite `spec_read_ack` + grep `@CODE-MEMORY` trên `allowed_paths`.
- Thiếu TechSpec § trên block mới → FAIL process (không claim product PASS).
