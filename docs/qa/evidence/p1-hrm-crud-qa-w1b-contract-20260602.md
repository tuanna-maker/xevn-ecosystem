# P1-HRM-CRUD-QA-W1B-CONTRACT — QA evidence

- work_item_id: `P1-HRM-CRUD-QA-W1B-CONTRACT`
- date: `2026-06-02`
- tester: `qa`
- environment: local portal proxy `http://127.0.0.1:5173` + `hrm-api:28001` + `xbos-api:28002`
- account: `ceo@xe.vn` (`company_id=main`)
- input evidence:
  - `docs/qa/evidence/p1-hrm-crud-fe-w1b-contract-sync-20260602.md`
  - `docs/qa/evidence/p1-hrm-crud-be-w1b-contract-20260602.md`
- executable run artifact: `docs/qa/evidence/p1-hrm-crud-qa-w1b-contract-20260602-run.json`

## Preconditions

1. `pnpm run qc:dev-stack` -> PASS (`hrm-api 200`, `xbos-api 200`, `web-portal 200` on `5173`).
2. Executed targeted matrix probe:
   - `$env:PORTAL_DEV_URL='http://127.0.0.1:5173'; node scripts/tmp-p1-hrm-crud-qa-w1b-contract.mjs`
   - Exit code: `0`

## Action-by-action verdict

| # | Action | Endpoint | Status/Code | Body snippet (trimmed) | Post-action refresh consistency | Verdict | Defect ID |
|---|---|---|---|---|---|---|---|
| 1 | candidate create from pool (without requisition_id) | `POST /api/hrm/recruitment/candidates` | `201 / HRM-REC-CP-201` | `Candidate pool row created ... id: a6e25f87-b4fb-4297-a4da-82963cb8476d` | list total `5 -> 6`, created row found by id | **PASS** | N/A |
| 2 | candidate update via candidates-pool PATCH | `PATCH /api/hrm/recruitment/candidates-pool/:id?company_id=main` | `200 / HRM-REC-CP-200` | `Candidate pool row updated ... stage: interview` | re-fetch row shows `stage=interview` and updated name | **PASS** | N/A |
| 3 | candidate delete via candidates-pool DELETE | `DELETE /api/hrm/recruitment/candidates-pool/:id?company_id=main` | `200 / HRM-REC-CP-200` | `Candidate pool row deleted ... id: a6e25f87-b4fb-4297-a4da-82963cb8476d` | re-fetch confirms deleted row absent | **PASS** | N/A |
| 4 | add payment record to batch | `POST /api/hrm/payroll/payment-batches/:batchId/records` | `201 / HRM-PB-201` | `Payment record added ... id: 208129ce-3fbb-4fd0-a01e-099bcc357881` | records list re-fetch includes newly added record | **PASS** | N/A |
| 5 | process one payment record | `POST /api/hrm/payroll/payment-batches/:batchId/records/:recordId/process?company_id=main` | `201 / HRM-PB-202` | `Payment record processed ... status: paid` | re-fetch confirms processed record `status=paid` | **PASS** | N/A |
| 6 | process all records in batch | `POST /api/hrm/payroll/payment-batches/:batchId/process?company_id=main` | `201 / HRM-PB-202` | `Payment batch processed ...` | re-fetch records: `2 total`, `unpaid_count=0`, second record `status=paid` | **PASS** | N/A |

## UI behavior checks (loading/success/error + refresh)

### Runtime-observed behavior (proxy execution)

- All six actions return deterministic success envelopes and keep list/detail states consistent after immediate re-fetch from the same FE proxy session.
- No transport/runtime error was observed in this scoped run; failure branch not triggered by the executed data set.

### FE contract checks (source-backed)

- Recruitment loading and error UX are present in `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx` (`setLoading(true/false)`, destructive toast on fetch error, explicit success/error toast on stage/delete, `fetchCandidates()` refresh after mutation).
- Candidate create/update dialog uses `isSubmitting` loading state and success/error toast in `apps/web/hrm/src/components/recruitment/CandidateFormDialog.tsx`, then calls `onSuccess()` for parent refresh.
- Payment actions in `apps/web/hrm/src/hooks/usePaymentBatches.ts` use deterministic success/error toast and `queryClient.invalidateQueries(['payment-batches', currentCompanyId])` after `addRecord`, `processPayment`, and `processAllPayments`.

## Gate decision

- Matrix result: **6/6 PASS**
- Residuals in this scoped contract-sync matrix: **none**
- ack_status recommendation: **PASS_TO_PM**

## Completion contract

- completion_report: Closed all requested QA matrix actions for candidate-pool CRUD + payroll payment process actions with executable FE-proxy evidence and source-backed UX checks. No scoped residual found.
- next_owner: pm
- next_dispatch_prompt: `Dispatch qc for work_item_id P1-HRM-CRUD-QC-W1B-CONTRACT. Entry: audit docs/qa/evidence/p1-hrm-crud-qa-w1b-contract-20260602.md and run artifact docs/qa/evidence/p1-hrm-crud-qa-w1b-contract-20260602-run.json to confirm 6/6 PASS and deterministic envelopes (HRM-REC-CP-201/200, HRM-PB-201/202). Exit: publish GO/GO_WITH_CONDITIONS verdict with residual statement.`
