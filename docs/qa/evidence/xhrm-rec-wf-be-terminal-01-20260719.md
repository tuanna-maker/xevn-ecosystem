# XHRM-REC-WF-BE-TERMINAL-01 — Multi-assignee first-wins terminal (Dev-BE)

| Field | Value |
|-------|--------|
| **work_item_id** | `XHRM-REC-WF-BE-TERMINAL-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **date** | 2026-07-19 |
| **lane** | execution |
| **change_mode** | FIX |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | AC-REC-WF-03 · J-REC-WF-03 · ADR-WORKFLOW-RESOLVER-DYNAMIC §6–§7 · CANVAS-03 FAIL |
| **parent** | `docs/qa/evidence/xhrm-rec-wf-qa-canvas-03-20260719.md` |

## Problem

J-REC-WF-03: `ceo@xe.vn` inbox **Xử lý nhanh** → `POST .../tasks/.../complete` **201** but `instanceCompleted: false` because spawn fan-out created parallel `group_ceo` tasks (2× `admin@xe.vn` + 1× `ceo@xe.vn`) without `parallelPolicy=any`. HRM stayed `pending_approval` (terminal callback only on instance complete). Reject (J-06) already skipped all siblings → PASS.

## Fix (Option: any-of-role + completion safety)

| Layer | Change |
|-------|--------|
| `resolver-data-source` | `queryRoleMembership` `SELECT DISTINCT lower(trim(user_id))` + in-memory Set dedupe |
| `resolver-registry` | `dedupeAssigneesByUserId` + `stampAnyOfSameHatPolicy` at end of `resolveStepTasks` — multi same-hat without existing `parallelGroupId` → shared group + `parallelPolicy: 'any'` |
| `workflow-engine.service` | `completeStepTask`: if not `parallel_group`/`all`, `applySameStepHatAnyPolicy` skips pending siblings same `step_key`+`hat_key` (legacy instances without parallel metadata) |

**must_keep:** `parallel_group` policy=`all` unchanged; leave `direct_manager` single assignee; reject path untouched; recruitment bridge callback contract unchanged.

## spec_read_ack

- srs/delta: `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` AC-REC-WF-03 · J-REC-WF-03
- tech_spec: `docs/decisions/ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620.md` §6 escalation · §7 parallel any
- sponsor_confirm: PM dispatch residual `D-XHRM-REC-WF-MULTI-ASSIGNEE-TERMINAL` from CANVAS-03

## Jest evidence

| Suite | Result |
|-------|--------|
| xbos-api `resolver-registry.spec` + `workflow-engine.service.spec` | **2 suites / 15 tests PASS** |
| hrm-api `recruitment-workflow.bridge.spec` + `leave-workflow.bridge.spec` | **2 suites / 22 tests PASS** (must_keep leave + rec bridge) |

New coverage:

- group_ceo escalation multi-member → dedupe casing + `parallelPolicy=any`
- `role_code` multi-member → any-of-role
- `parallel_group` policy=`all` regression
- `completeStepTask` same-step-hat skip → `instanceCompleted: true`
- `parallel_group`/`all` does **not** same-hat skip

## Forbidden honored

- No seed · no Phase1/PROD claim · no leave/F6 overwrite

## completion_report

**Closed:** P0 multi-assignee blocks CEO-only terminal — resolver stamps any-of-same-hat + completion safety for legacy fan-out; membership casing dedupe; jest + @CODE-MEMORY-CHANGE.

**Residual for QA:** Live FE retest J-03 (new spawn after API restart) — CEO approve → `instanceCompleted: true` → HRM `approved`/`open` + F5; confirm J-02/J-06/UF-HRM-12/F6/leave smoke.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: XHRM-REC-WF-QA-CANVAS-04
from_role: pm
to_role: qa
lane: execution
change_mode: RETEST
residual_auto_fix: true

## entry
XHRM-REC-WF-BE-TERMINAL-01 READY — evidence docs/qa/evidence/xhrm-rec-wf-be-terminal-01-20260719.md
Restart/ensure xbos-api picks up completeStepTask + resolver any-of-hat.
U65 zero-seed; persona ceo@xe.vn; defs already active

## deliver
1. J-REC-WF-03: create req → Gửi duyệt → Inbox CEO Xử lý nhanh → expect complete 201 instanceCompleted:true → HRM status approved|open → F5 còn
2. Regression: J-02 spawn prefer instance; J-06 reject → HRM rejected; UF-HRM-12 create; F6 6 cols; leave tab smoke
3. Confirm no requirement to open admin@xe.vn inbox for terminal

## exit
PASS_TO_PM or FAIL with evidence; cấm seed · Phase1/PROD
```

## ack_status

**READY_FOR_QA**
