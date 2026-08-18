# PO-HRM-REC-YCTD-BOD-OPEN-FOR-HIRE-01 — BE evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-REC-YCTD-BOD-OPEN-FOR-HIRE-01` |
| **role** | dev-be |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-11 |
| **U65** | zero-seed · no bypass |

## Problem (QA retest #3)

- Inbox leg 1 **201** → YCTD `status=approved`, `receivable=true` list synonym.
- `POST /api/hrm/recruitment/candidates-pool` **409** `HRM-YCTD-BOD-REQUIRED` — `cv_intake_allowed=false`.
- Root: XBOS catalog `hrm_requisition_approval` has **one** step; terminal callback ran once and left `out_of_plan` at `approved` instead of `open_for_hire`.

## spec_ref

- Y-S9 · `recruitment-workflow.bridge.ts` terminal mapping
- `yctd-requisition-gates.ts` `assertYctdReceivableForMutateOrThrow` — UV mutate requires `open_for_hire` for `out_of_plan`
- `apps/api/xbos-api/.../workflow-catalog.constants.ts` `buildHrmRequisitionApprovalDefinition` (single `requisition_approval` step)
- QA: `docs/qa/evidence/qa-po-hrm-rec-channels-consumer-01.md` retest #3 `RECCHQA-MSNJEXWE`

## Change (FIX)

`handleRequisitionTerminal`: for `headcount_mode=out_of_plan` and WF **completed**, set `nextStatus=open_for_hire` and `cv_intake_allowed=true` (same as `in_plan` terminal outcome for deployed single-leg WF).

**must_keep:** `POST …/requisitions/{id}/transitions` with `bod_complete` for manual unlock from `approved`; spawn submitter UUID (`PO-HRM-REC-YCTD-WF-INBOX-BRIDGE-01`).

## Verification

```bash
pnpm --filter hrm-api test -- po-hrm-rec-yctd-bod-open-for-hire-be-01
pnpm --filter hrm-api test -- po-hrm-rec-yctd-wf-inbox-bridge-be-01
pnpm --filter hrm-api test -- recruitment-workflow.bridge.spec
```

| Suite | Result |
|-------|--------|
| `po-hrm-rec-yctd-bod-open-for-hire-be-01.spec.ts` | 3/3 PASS |
| `po-hrm-rec-yctd-wf-inbox-bridge-be-01.spec.ts` | 3/3 PASS |
| `recruitment-workflow.bridge.spec.ts` | PASS (regression) |

## U65 expected after `hrm-api` restart

1. New `out_of_plan` YCTD → Gửi duyệt QT → inbox Duyệt **201**.
2. `GET …/requisitions?receivable=true` row `status=open_for_hire`, `cv_intake_allowed=true`.
3. `POST candidates-pool` **2xx** (AC-REC-01 prerequisite).

## completion_report

**Closed:** Terminal mapping for `out_of_plan` → `open_for_hire` + `cv_intake_allowed`; unit specs + gate regression.  
**Residual:** Existing DB rows stuck at `approved` need new YCTD WF or `transitions` + `bod_complete=true`; QA should use fresh stamp per U65.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-REC-CHANNELS-CONSUMER-01
role: qa
entry_criteria: PO-HRM-REC-YCTD-BOD-OPEN-FOR-HIRE-01 READY_FOR_QA; restart hrm-api; docs/qa/evidence/po-hrm-rec-yctd-bod-open-for-hire-be-01.md
exit_criteria: U65 ceo@ — fresh out_of_plan YCTD → inbox Duyệt 201 → receivable row open_for_hire + cv_intake_allowed=true → AC-REC-01 POST candidates-pool 2xx + F5; AC-REC-02/03 if unblocked; browser-only; stamp RECCHQA-*
evidence_path: docs/qa/evidence/qa-po-hrm-rec-channels-consumer-01.md (append retest #4)
ack_status: PASS_TO_PM or FAIL_TO_PM
```
