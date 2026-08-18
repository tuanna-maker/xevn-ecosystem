# XHRM-REC-WF-BE-COMPLETE-INSTANCE-01 — Complete terminal instance id remap (Dev-BE)

| Field | Value |
|-------|--------|
| **work_item_id** | `XHRM-REC-WF-BE-COMPLETE-INSTANCE-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **date** | 2026-07-19 |
| **lane** | execution |
| **change_mode** | FIX |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | AC-REC-WF-03 · J-REC-WF-03 · CANVAS-04 FAIL `instance_mismatch` |
| **parent** | `docs/qa/evidence/xhrm-rec-wf-qa-canvas-04-20260719.md` |

## Problem

CANVAS-04: CEO complete → XBOS `instanceCompleted: true` but HRM stayed `pending_approval`. Log: `HRM-REC-WF-CALLBACK-SKIP reason=instance_mismatch`.

Root cause: `completeStepTask` called `notifyHrmRecruitmentCallback(task, 'terminal', …)` with JOIN row where `id` = **step-task UUID**. Notify uses `instance.id` → sent task id as `workflowInstanceId`. Stored HRM `workflow_instance_id` = real instance UUID → mismatch skip.

Reject path already remapped `{ ...before, id: before.instance_id }` → J-06 PASS.

## Fix

| File | Change |
|------|--------|
| `workflow-engine.service.ts` `completeStepTask` | Build `notifyInstance = { ...task, id: instanceId }` for step + leave + recruitment terminal notify (mirror `rejectStepTask`). `taskId` extras still step-task UUID. |
| `@CODE-MEMORY-CHANGE` | `XHRM-REC-WF-BE-COMPLETE-INSTANCE-01` |

**must_keep:** reject remap unchanged; leave URL/body contract unchanged (same id remap as reject); parallel any / same-hat first-wins untouched; F6 / J-02 / J-06.

## spec_read_ack

- srs/delta: `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` AC-REC-WF-03 · J-REC-WF-03
- tech_spec / bridge: `recruitment-workflow.bridge.ts` `handleRequisitionTerminal` instance_mismatch guard
- parent FAIL: `docs/qa/evidence/xhrm-rec-wf-qa-canvas-04-20260719.md`
- sponsor_confirm: PM residual `D-XHRM-REC-WF-COMPLETE-INSTANCE-ID`

## Jest evidence

| Suite | Result |
|-------|--------|
| xbos-api `workflow-engine.service.spec` + `resolver-registry.spec` | **2 suites / 17 tests PASS** (+2 complete/reject instance-id notify) |
| hrm-api `recruitment-workflow.bridge.spec` + `leave-workflow.bridge.spec` | **2 suites / 22 tests PASS** (must_keep leave + rec bridge) |

New coverage:

- complete → step+terminal fetch body `workflowInstanceId === instance_id` (≠ task id); `taskId` remains task UUID
- reject terminal still remaps instance id (J-06 must_keep)

## Forbidden honored

- No seed · no Phase1/PROD claim · no leave/F6 overwrite

## completion_report

**Closed:** P0 complete terminal `instance_mismatch` — remap notify `id` → `instance_id` on complete (step + terminal + leave), mirror reject; jest assert instance UUID in callback body.

**Residual for QA:** Live FE `XHRM-REC-WF-QA-CANVAS-05` — J-03 create → Gửi duyệt → CEO Xử lý nhanh → HRM `open`\|`approved` + F5; regress J-02 / J-06 / UF-HRM-12 / F6 / leave. Restart xbos-api so dist picks up remap.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: XHRM-REC-WF-QA-CANVAS-05
from_role: pm
to_role: qa
lane: execution
change_mode: RETEST
residual_auto_fix: true

## entry
XHRM-REC-WF-BE-COMPLETE-INSTANCE-01 READY — evidence docs/qa/evidence/xhrm-rec-wf-be-complete-instance-01-20260719.md
Restart/ensure xbos-api picks up completeStepTask notifyInstance remap (id → instance_id).
U65 zero-seed; persona ceo@xe.vn; defs already active

## deliver
1. J-REC-WF-03: create req → Gửi duyệt → Inbox CEO Xử lý nhanh → complete 201 instanceCompleted:true → HRM status open|approved → F5 còn «đã duyệt» (no instance_mismatch in hrm-api log)
2. Regress J-02 / J-06 / UF-HRM-12 / F6 / leave smoke — no admin@xe.vn required
3. Evidence docs/qa/evidence/xhrm-rec-wf-qa-canvas-05-20260719.md

## exit
PASS_TO_PM or FAIL_TO_PM; cấm seed · Phase1/PROD
```

## ack_status

**READY_FOR_QA**
