# R-XHRM-REC-WF-DEEPLINK-TASKID — FE deep-link task id (2026-07-20)

| Field | Value |
|-------|--------|
| **work_item_id** | `R-XHRM-REC-WF-DEEPLINK-TASKID` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-07-20 |
| **lane** | execution |
| **change_mode** | FIX |
| **parent** | QC GWC `C-XHRM-REC-WF-CANVAS-05-01` · `docs/qa/evidence/xhrm-rec-wf-qc-canvas-05-20260719.md` |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` · J-REC-WF-02/03/06 · BR-INBOX-01 · J-XBOS-01 |
| **seed** | **None** (U65) |

## Problem (QC residual)

Synthetic Inbox drawer from `?wfInstanceId=` set `cardId = instanceId`. Brief **Từ chối / Hoàn thành** POSTed `/workflow-engine/tasks/{instanceId}/*` → **404**. Card / drawer path with real task `cardId` already OK (J-06).

## Fix (spec says / code does)

| Spec | Code |
|------|------|
| Xử lý / reject / complete use **step task id** | `applyWorkflowInboxTaskDecision` still uses `task.cardId`; FE now refuses instance-only synthetic |
| Deep-link may open by instance for detail (J-XBOS-01) | `wfInstanceId` kept; optional **`wfTaskId`** added |
| Resolve task before mutate | Match inbox by `wfTaskId` then `sourceId`; upgrade stub from instance-detail pending row (assignee / single pending) |

### Files

- `apps/web/web-portal/src/modules/hrm/inboxDeepLink.ts` (+ vitest) — pure resolve/guard helpers + `@CODE-MEMORY`
- `apps/web/web-portal/src/modules/hrm/commandCenterUrl.ts` — `wfTaskId` build/parse + `@CODE-MEMORY-CHANGE`
- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` — deep-link open/upgrade/URL sync; action guards
- `apps/web/web-portal/src/pages/command-center/WorkflowTaskDetailDrawer.tsx` — block buttons until actionable task id

### must_keep

- **J-REC-WF-02 / 03 / 06** GWC — not reopened without FAIL evidence
- Card «Xử lý nhanh» with real `cardId` unchanged
- Instance detail still fetches by `sourceId` (instance id)

## command_table

| Command | Exit | Result |
|---------|------|--------|
| `pnpm exec vitest run src/modules/hrm/inboxDeepLink.test.ts src/modules/hrm/commandCenterUrl.test.ts src/pages/command-center/WorkflowTaskDetailDrawer.test.tsx` (cwd `apps/web/web-portal`) | **0** | 3 files / **19** tests PASS |

## QA retest focus (browser U65 — no seed)

1. Login `ceo@xe.vn` → create/submit YCTD (or use live pending) → Inbox card **Mở chi tiết** → URL has **`wfTaskId`** + `wfInstanceId` → Từ chối/Hoàn thành → Network `…/tasks/{taskId}/…` **2xx** (not instance id).
2. Paste legacy `?wfInstanceId=<inst>` only → drawer opens; actions **blocked** until task id resolved (inbox match or detail pending) → then POST uses **task id**.
3. Regress **J-02 / J-03 / J-06** smoke — do **not** claim reopen green without FAIL.

## Forbidden honored

- No `pnpm seed:*` / inbox seed / DB fake
- No Phase1 / PROD claim
- No overwrite of J-03 green without FAIL

## completion_report

**Closed:** P2 deep-link used instance id as `cardId` for Inbox Xử lý → 404 race; FE now carries/resolves **task id**, blocks mutate on instance-only stub, upgrades from inbox/detail.

**Open:** Browser L2.5 retest by QA (this evidence is unit + code path only).

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: R-XHRM-REC-WF-DEEPLINK-TASKID-QA
from_role: pm
to_role: qa
lane: execution
change_mode: RETEST
residual_auto_fix: true

## entry
dev-fe READY_FOR_QA — docs/qa/evidence/xhrm-rec-wf-deeplink-fe-20260720.md
U65 zero-seed · browser-only · ceo@xe.vn
parent QC condition C-XHRM-REC-WF-CANVAS-05-01

## deliver
1. Deep-link / Mở chi tiết: Network complete|reject uses task id (not instance id); no brief 404 on instance id
2. Legacy ?wfInstanceId= only: actions wait for resolved task id then 2xx
3. Regress J-REC-WF-02/03/06 smoke — must_keep GWC; cấm reopen J-03 green without FAIL
4. Evidence: docs/qa/evidence/xhrm-rec-wf-deeplink-qa-20260720.md

## exit
PASS_TO_PM or FAIL_TO_PM · no seed · no Phase1/PROD
```

## ack_status

**READY_FOR_QA**
