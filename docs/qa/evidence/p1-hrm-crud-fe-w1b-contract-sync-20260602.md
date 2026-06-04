# P1-HRM-CRUD-FE-W1B-CONTRACT-SYNC Evidence

- Work item: `P1-HRM-CRUD-FE-W1B-CONTRACT-SYNC`
- Role: `dev-fe`
- Date: `2026-06-02`

## Scope completed

1. Recruitment candidate flow aligned to backend contract wave:
   - Candidate create now calls `POST /api/hrm/recruitment/candidates` via `createCandidatePool` (pool path works without mandatory `requisition_id`).
   - Candidate edit now calls `PATCH /api/hrm/recruitment/candidates-pool/:candidateId` via `updateCandidatePool`.
   - Candidate delete now calls `DELETE /api/hrm/recruitment/candidates-pool/:candidateId` via `deleteCandidatePool`.
   - Stage change keeps existing UX path but now routes through contract-compatible PATCH (`updateCandidatePool`).
2. Payment batch actions replaced FE stubs in `usePaymentBatches`:
   - Add payment record uses `POST /api/hrm/payroll/payment-batches/:batchId/records`.
   - Process single payment record uses `POST /api/hrm/payroll/payment-batches/:batchId/records/:recordId/process`.
   - Process all records in batch uses `POST /api/hrm/payroll/payment-batches/:batchId/process`.
3. Deterministic UX state handling preserved:
   - Existing loading states remain in list/detail UI.
   - Success/error feedback is explicit via toast paths.
   - Batch/candidate state refresh remains consistent after mutations (query invalidation + record re-fetch in detail view).

## Files changed (focused)

- `apps/web/hrm/src/integrations/hrmApi.ts`
- `apps/web/hrm/src/hooks/usePaymentBatches.ts`
- `apps/web/hrm/src/components/recruitment/CandidateFormDialog.tsx`
- `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx`
- `apps/web/hrm/src/components/payroll/PaymentBatchesTab.tsx`

## Validation commands and outcomes

1. `pnpm --filter hrm test`
   - Result: No project matched filter (workspace package is `vite_react_shadcn_ts`).
2. `pnpm --filter hrm build`
   - Result: No project matched filter (same reason).
3. `pnpm --filter vite_react_shadcn_ts test`
   - Result: PASS (`40` test files, `116` tests passed).
4. `pnpm --filter vite_react_shadcn_ts build`
   - Result: PASS (Vite production build completed, exit code `0`).
5. IDE lint diagnostics on touched files
   - Result: PASS (no new lint errors reported).

## Residuals

- No blocking FE residual identified for this contract-sync scope.
- Existing large-chunk build warnings remain non-blocking and pre-existing to this patch.
