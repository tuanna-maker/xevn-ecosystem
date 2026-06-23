# P1-PHASE1-FE-WF-INBOX-01 — Workflow inbox approve (P0-CRUD-06 / BR-INBOX-01)

| Field | Value |
|-------|--------|
| **work_item_id** | P1-PHASE1-FE-WF-INBOX-01 |
| **date** | 2026-06-04 |
| **owner** | Dev-FE |
| **scope** | Command Center inbox — real `workflow-engine` approve/reject (no mock-only actions) |
| **journey** | **J-XBOS-01** — list pending tasks → detail drawer → approve or reject → inbox refresh |

## Problem (QC C-CRUDQC-02)

- P0-CRUD-06 **UNTESTED**: inbox list probe **200** only; portal approve not proven on real pending step tasks.
- Reject path previously posted to `/complete` with `outcome: rejected` (BE completes task — wrong semantics).
- Multi-hat instances (seed: two steps, same assignee) need `hatKey` + `userId` on complete (**XBOS-WF-422** without).
- Rail «Xử lý nhanh» was not gated when `inboxTasksSource === 'mock'`.

## FE changes

| Area | Change |
|------|--------|
| `workflowEngineApi.ts` | `rejectWorkflowTask`, `buildWorkflowTaskActionPayload`, `applyWorkflowInboxTaskDecision` (complete vs reject) |
| `commandCenterInboxApi.ts` | `resolveInboxAssigneeUserId`, map `hat_key` → `workflowHatKey`, list filter by session user |
| `command-center-mock.ts` | `UnifiedTask.workflowHatKey` optional field |
| `CommandCenterPage.tsx` | Drawer + rail use `applyWorkflowInboxTaskDecision`; `CapabilityActionButton` blocks when not API source |
| `capabilityActionRegistry.ts` | Document reject route on `BTN-A1-INBOX-QUICK` |
| `scripts/seed-workflow-inbox-sample.mjs` | Default assignee **`ceo@xe.vn`** (pilot Group CEO) |

## API contract (wired)

| Action | Method | Path |
|--------|--------|------|
| List pending | GET | `/api/xbos/workflow-engine/tasks?tenantId=xevn&status=pending&assigneeUserId={session}` |
| Detail | GET | `/api/xbos/workflow-engine/instances/:id/detail` |
| Approve | POST | `/api/xbos/workflow-engine/tasks/:id/complete` body `{ userId, hatKey?, outcome: 'approved' }` |
| Reject | POST | `/api/xbos/workflow-engine/tasks/:id/reject` body `{ userId, reason }` |

## Seed / QA setup

```bash
pnpm dev:xbos-api   # :28002
pnpm seed:workflow:inbox
# Optional: SEED_USER_ID=ceo@xe.vn (default)
```

Login portal: **`ceo@xe.vn`** / **`Xevn@2026`** → Command Center inbox rail → open task → **Hoàn thành** or **Từ chối** → task leaves pending list (reload).

Strict: `VITE_ALLOW_MOCK_FALLBACK=false` — approve buttons disabled unless `inboxTasksSource === 'api'`.

## Test / build

| Command | Result |
|---------|--------|
| `pnpm --filter web-portal test` | **143/143 PASS** (+7 inbox tests) |
| `pnpm --filter web-portal build` | **exit 0** |

New tests: `workflowEngineApi.inbox.test.ts`, `commandCenterInboxApi.test.ts`; existing `WorkflowTaskDetailDrawer.test.tsx` unchanged.

## QA checklist (L2.5 J-XBOS-01)

1. L0: `pnpm run qc:dev-stack` exit 0 (xbos **28002**).
2. Seed inbox if rail empty (`pnpm seed:workflow:inbox`).
3. Login `ceo@xe.vn` → CC workspace → ≥1 pending card from API (not mock labels in strict).
4. **Mở chi tiết** → drawer shows instance id + steps.
5. **Hoàn thành** → network `POST …/tasks/{uuid}/complete` **200** `XBOS-WF-200`; card removed after refresh.
6. (Optional) **Từ chối** on second task → `POST …/reject` **200** `XBOS-WF-205`.
7. Console: no mock-only approve on strict; no `54321`.

## Residual

| Item | Owner | Note |
|------|-------|------|
| Live API smoke on nip.io / local stack | QA | FE unit-tested; needs authenticated browser or curl with portal JWT |
| Full `verify:capabilities --group A1` | QA | Registry updated; re-run with stack up |
| Dev empty inbox → mock rail | — | By design when `VITE_ALLOW_MOCK_FALLBACK=true`; approve still blocked on mock source |

## Handoff

| Field | Value |
|-------|--------|
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/p1-phase1-fe-wf-inbox-20260604.md` |
| **entry_criteria** | P0-CRUD-06 dispatched; xbos workflow-engine routes available |
| **exit_criteria** | J-XBOS-01 approve/reject on real pending task with network evidence; P0-CRUD-06 promoted PASS or documented FAIL |

## completion_report

- Wired inbox approve/reject to Nest `workflow-engine` (complete + reject), with `userId`, `hatKey`, session assignee filter.
- Gated rail + drawer actions when inbox not loaded from API (BR-INBOX-01).
- Seed default assignee aligned to pilot CEO; vitest **143/143**, build exit 0.

## next_owner

`qa`

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QA-WF-INBOX-01
from_role: qa
to_role: qa
lane: execution

P0-CRUD-06 / C-CRUDQC-02 / BR-INBOX-01 — retest after P1-PHASE1-FE-WF-INBOX-01.

1) pnpm run qc:dev-stack (exit 0); pnpm seed:workflow:inbox if pending count < 1.
2) Login ceo@xe.vn / Xevn@2026 — Command Center inbox (strict: VITE_ALLOW_MOCK_FALLBACK=false).
3) J-XBOS-01: list ≥1 API pending task → Mở chi tiết → Hoàn thành → POST /api/xbos/workflow-engine/tasks/:id/complete 200 XBOS-WF-200; task disappears on reload.
4) Optional: Từ chối second task → POST …/reject 200 XBOS-WF-205.
5) Evidence: append to docs/qa/evidence/p1-phase1-fe-wf-inbox-20260604.md or p1-phase1-qa-wf-inbox-20260604.md with URL + network screenshot; ack PASS_TO_PM or FAIL with work_item_id.

J-ids: J-XBOS-01. Do not claim Phase 1 DONE.
```
