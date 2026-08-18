# PO-HRM-REC-YCTD-WF-INBOX-BRIDGE-01 (dev-be)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-REC-YCTD-WF-INBOX-BRIDGE-01` |
| **role** | dev-be |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-11 |
| **change_mode** | FIX |

## Root cause

| Layer | Finding |
|-------|---------|
| **Symptom** | CC inbox «Duyệt» → `POST /api/xbos/workflow-engine/tasks/{id}/complete` **422** (stamp `RECCHQA-MSNJ2BYL`) |
| **XBOS** | `XBOS-WF-422` — **BR-WF-04** self-approve: `body.userId` (`ceo@xe.vn`) === `instance.context.submitter.userId` |
| **HRM spawn** | `recruitment-workflow.bridge.ts` sent `submitter.userId: ceo@xe.vn` on XBOS start while assignee inbox leg is also Group CEO (`GROUP_APPROVER_USER`) |
| **Downstream** | WF never completes → HRM `handleRequisitionTerminal` not called → YCTD stuck `pending_approval` → `GET …/requisitions?receivable=true` **0** |

## Fix (HRM bridge)

- On XBOS spawn: `submitter.userId` = resolved **`employeeId` (UUID)**; portal login email preserved as `submitter.submitterPortalEmail` for audit.
- Inbox complete still uses JWT email → no longer matches submitter.userId → BR-WF-04 passes → terminal callback applies **Y-S9** (`pending_approval` → `approved` for `out_of_plan`; second terminal → `open_for_hire` when applicable).

**Files:** `apps/api/hrm-api/src/recruitment/recruitment-workflow.bridge.ts`

## spec_ref

- Y-S9 · `recruitment-workflow.bridge.ts` `handleRequisitionTerminal`
- QA retest: `docs/qa/evidence/qa-po-hrm-rec-channels-consumer-01.md` § Retest 2026-08-11
- XBOS BR-WF-04: `apps/api/xbos-api/src/workflow-engine/workflow-engine.service.ts` `completeStepTask`

## Verification

```bash
cd apps/api/hrm-api
pnpm exec jest src/recruitment/po-hrm-rec-yctd-wf-inbox-bridge-be-01.spec.ts src/recruitment/recruitment-workflow.bridge.spec.ts
```

| Suite | Result |
|-------|--------|
| `po-hrm-rec-yctd-wf-inbox-bridge-be-01.spec.ts` | **3/3 PASS** |
| `recruitment-workflow.bridge.spec.ts` | **20/20 PASS** (spawn expectations updated) |

## QA retest notes (U65)

1. **New YCTD** + `submit-workflow` after deploy/restart `hrm-api` (existing instances keep old submitter.userId in XBOS context — must re-submit WF).
2. Inbox Duyệt → expect complete **200** + HRM callback → `status` `approved` or `open_for_hire`.
3. `GET /api/hrm/recruitment/requisitions?company_id=main&receivable=true` → **count ≥ 1**.
4. Re-run `QA-PO-HRM-REC-CHANNELS-CONSUMER-01` AC-REC-01..03.

## Residual

- Stuck rows from pre-fix WF instances need **new** submit-workflow (no seed / no DB fake approve).
- UV **mutate** for `out_of_plan` may still require `open_for_hire` per `assertYctdReceivableForMutateOrThrow`; list `receivable=true` includes `approved` synonym (O3).

## completion_report

**Closed:** Root-cause BR-WF-04 vs spawn identity; bridge spawn fix; unit specs + evidence.  
**Open:** QA browser retest on fresh YCTD; confirm second inbox leg if matrix defines BOD step.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-REC-CHANNELS-CONSUMER-01
role: qa
entry_criteria: PO-HRM-REC-YCTD-WF-INBOX-BRIDGE-01 READY_FOR_QA; hrm-api restarted; U65 zero-seed
exit_criteria: ceo@ — new out_of_plan YCTD → Gửi duyệt QT → inbox Duyệt 2xx → receivable≥1 → AC-REC-01 mutate POST candidates-pool + F5; stamp RECCHQA retest
evidence_path: docs/qa/evidence/qa-po-hrm-rec-channels-consumer-01.md (append)
ack_status: PASS_TO_PM or FAIL_TO_PM
```
