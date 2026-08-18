# PO-HRM-REC-YCTD-CREATE-BLOCKER-01 — dev-fe

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-REC-YCTD-CREATE-BLOCKER-01` |
| **role** | dev-fe |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-11 |
| **U65** | zero-seed · FE-only |

## spec_ref

- `docs/qa/evidence/qa-po-hrm-rec-channels-consumer-01.md` — root cause: no POST `/requisitions` after form-ready
- `apps/api/hrm-api/.../create-job-requisition.dto.ts` — `out_of_plan_reason` optional on **draft** create
- `recruitment.service.ts` `createJobRequisition` — `requireComplete: false` (Y-S7)
- SRS Diễn biến #6 Lưu nháp draft vs submit-workflow `requireComplete: true`

## Root cause (FE)

`validateYctdCreateForm` (zod `superRefine` on create form) required `out_of_plan_reason` for default `headcount_mode=out_of_plan` **before** Lưu nháp. QA/bootstrap saw `hdsd-requisition-form-ready` but **no** `POST …/requisitions` (silent zod block).

## Fix

| Area | Change |
|------|--------|
| `jobRequisitionYctdWave2.ts` | `YctdCreateFormValidationPhase`: `draft_save` \| `complete`; empty `out_of_plan_reason` allowed on `draft_save` only |
| `JobRequisitionsTab.tsx` | Create schema uses `draft_save`; `applyTemplate` seeds default out-of-plan reason when JD selected; `onSubmitWorkflow` uses `complete` gate + toast/open edit |
| Tests | `jobRequisitionYctdWave2.test.ts` — draft_save case |

**must_keep:** `CatalogSearchPicker` dept (`hdsd-requisition-department`) — DEPTCONREG1 pattern unchanged.

## Expected U65 click path (QA re-run)

1. Login `ceo@xe.vn` → HRM → **Tuyển dụng** → tab **Yêu cầu tuyển dụng (YCTD)**
2. **Thêm** → chọn JD (library ≥1 bindable) → điền tiêu đề / số lượng (dept auto from template/catalog)
3. **Lưu yêu cầu** → Network **POST** `/api/hrm/recruitment/requisitions` → **2xx**
4. **GET** `/api/hrm/recruitment/requisitions?company_id=main` → `total` ≥ 1
5. **Gửi duyệt QT** → POST `…/submit-workflow` **2xx** (out-of-plan reason present after JD apply)
6. **Receivable:** `GET …/requisitions?receivable=true` may stay **0** until WF/BOD completes for `out_of_plan` (Y-S9) — AC-REC-01 consumer needs `open_for_hire` or documented WF step; not a channels FE regression.

## Automated

```text
pnpm exec vitest run src/lib/jobRequisitionYctdWave2.test.ts src/lib/jobRequisitionUi.test.ts src/lib/hdsdMutateTestIds.test.ts
→ 63/63 PASS
```

## Residual

- Full **receivable≥1** for UV mutate may require inbox approval / BOD on out_of_plan — QA documents path if still 0 after submit-workflow 2xx.
- Re-run `QA-PO-HRM-REC-CHANNELS-CONSUMER-01` for AC-REC-01..03.

## completion_report

**Closed:** YCTD create POST blocker (draft vs complete validation parity with BE).  
**Open:** QA browser proof + receivable/WF chain per SRS.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-REC-CHANNELS-CONSUMER-01
role: qa
entry_criteria: PO-HRM-REC-YCTD-CREATE-BLOCKER-01 READY_FOR_QA @ docs/qa/evidence/po-hrm-rec-yctd-create-blocker-fe-01.md
exit_criteria: U65 ceo@ — YCTD Thêm→JD→Lưu POST 2xx → GET total≥1; bootstrap receivable or document WF/BOD; AC-REC-01 mutate POST/PATCH candidates source=catalog + F5; AC-REC-02/03 if unblocked
evidence_path: docs/qa/evidence/qa-po-hrm-rec-channels-consumer-01.md (update)
ack_status: PASS_TO_PM or FAIL_TO_PM
```
