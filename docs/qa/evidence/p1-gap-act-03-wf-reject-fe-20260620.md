# P1-GAP-ACT-03-WF-REJECT-FE — Inbox Từ chối AlertDialog

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-GAP-ACT-03-WF-REJECT-FE` |
| **role** | dev-fe |
| **executed_at** | 2026-06-20T19:43+07 |
| **spec_ref** | `ACTION_BUTTON_INVENTORY.md` §2 · **AC-ACT-WF-REJ-01** · **AC-UX-CFM-01** · DEF-GAP-ACT-03-CFM |
| **ack_status** | **READY_FOR_QA** |

---

## Problem (QA FAIL)

`P1-GAP-ACT-03-WF-REJECT-QA` — drawer **Từ chối** fired immediate `POST …/reject` **201** with no `[role=alertdialog]` (GAP-ACT-03 partial).

---

## Fix

| File | Change |
|------|--------|
| `WorkflowTaskDetailDrawer.tsx` | Reject button uses `ACT-CC-WF-REJECT`; `onRejectRequest` callback (no direct POST) |
| `CommandCenterPage.tsx` | `promptRejectInboxFromDrawer()` via existing `useConfirmDialog` — mirrors `CatalogGovernancePanel.promptReject`; confirm → `completeInboxFromDrawer('rejected')` |
| `WorkflowTaskDetailDrawer.test.tsx` | +2 tests: reject → `onRejectRequest`; approve → `onApprove`; disabled labels split by capability |

### Confirm copy

- **Title:** Từ chối nhiệm vụ
- **Description:** Xác nhận từ chối "{task.title}"? Hành động không thể hoàn tác.
- **Confirm:** Từ chối (destructive)
- **Cancel:** Hủy (ConfirmDialog default)

---

## Verification (agent)

```text
pnpm --filter web-portal exec vitest run \
  src/pages/command-center/WorkflowTaskDetailDrawer.test.tsx \
  src/components/common/ConfirmDialog.test.tsx \
  src/integrations/capabilityActionRegistry.test.ts
→ 15/15 PASS

pnpm --filter web-portal build
→ exit 0
```

---

## QA retest checklist (:8088 · U65 · browser-only)

| Step | Expected |
|------|----------|
| Login `ceo@xe.vn` → CC home → inbox **Mở chi tiết** pending task | Drawer open |
| Click **Từ chối** | `[role=alertdialog]` visible — title «Từ chối nhiệm vụ» |
| Click **Hủy** | No POST reject; drawer stays open |
| Click **Từ chối** → confirm **Từ chối** | POST …/reject **201**; inbox count ↓; F5 status **Từ chối** |
| **Hoàn thành** (approve path) | Still immediate POST complete (no confirm required) |

**capability:** `ACT-CC-WF-REJECT` · **J-***: J-XBOS-01 inbox drawer

---

## Residual

- **portal-fe :8088** — requires Docker rebuild/redeploy for sponsor UAT (`portal-fe-docker-rebuild-required`).
- Approve (**Hoàn thành**) unchanged — no confirm by design (only reject per AC-UX-CFM-01 delta).

---

## Handoff

- **next_owner:** qa
- **pm_dispatch_hint:** `P1-GAP-ACT-03-WF-REJECT-QA-R2` — browser retest GAP-ACT-03 close on :8088 after portal-fe deploy
