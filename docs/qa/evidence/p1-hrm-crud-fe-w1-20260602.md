# P1-HRM-CRUD-FE-W1 — FE CRUD wiring evidence

- Work item: `P1-HRM-CRUD-FE-W1`
- Role: `dev-fe`
- Date: `2026-06-02`

## Prioritized unresolved CRUD interactions (audit)

1. Recruitment campaigns tab (`CampaignsTab` + `CampaignFormDialog`) used placeholder save/delete/load branches, so create/update/delete did not hit real APIs.
2. Recruitment candidates tab (`CandidatesTab`) used placeholder load/stage-update branches, so list and stage transitions were not persisted.
3. Payroll payment actions (`processPayment` / `processAllPayments` in `usePaymentBatches`) are still backend-stubbed and not backend-ready in current contracts.

## Implemented (backend-ready)

### 1) Recruitment campaigns CRUD wired to real APIs

- Screen: `Recruitment > Campaigns`
- FE changes:
  - `CampaignsTab` now loads campaigns from `listJobPostings`.
  - Delete action now calls `deleteJobPosting`.
  - Added deterministic mapping from `HrmJobPostingRow` to campaign view model.
  - `CampaignFormDialog` now:
    - loads departments via `listDepartments`,
    - creates campaigns via `createJobPosting`,
    - updates campaigns via `updateJobPosting`.
- UX states:
  - loading spinner while fetching list
  - success/error toast on save/delete
  - list refresh after write operations

### 2) Recruitment candidates list + stage update wired to real APIs

- Screen: `Recruitment > Candidates`
- FE changes:
  - candidates list now loads from `listCandidatesPool`.
  - stage selector now persists through `updateCandidatePoolStage`.
- UX states:
  - loading spinner while fetching list
  - success/error toast on stage update
  - list refresh after stage update

## Pending / blocked by backend contract mismatch

1. Candidate create/update/delete in `CandidateFormDialog` / `CandidatesTab`
   - Current FE form model expects richer fields than `candidates-pool` write contract.
   - Available create endpoint requires `requisition_id` (`createRecruitmentCandidate`) that current form does not capture.
   - No direct delete endpoint found for candidate pool rows.
2. Payment processing actions in `PaymentBatchesTab`
   - `processPayment`, `processAllPayments`, and `addRecord` still throw explicit backend-not-ready errors in `usePaymentBatches`.

## CRUD matrix (screen + action + API + result)

| Screen | Action | API | Result |
|---|---|---|---|
| Recruitment / Campaigns | Load list | `GET /api/hrm/recruitment/job-postings` | PASS — wired in `CampaignsTab` |
| Recruitment / Campaigns | Create | `POST /api/hrm/recruitment/job-postings` | PASS — wired in `CampaignFormDialog` |
| Recruitment / Campaigns | Update | `PATCH /api/hrm/recruitment/job-postings/:id` | PASS — wired in `CampaignFormDialog` |
| Recruitment / Campaigns | Delete | `DELETE /api/hrm/recruitment/job-postings/:id` | PASS — wired in `CampaignsTab` |
| Recruitment / Candidates | Load list | `GET /api/hrm/recruitment/candidates-pool` | PASS — wired in `CandidatesTab` |
| Recruitment / Candidates | Update stage | `PATCH /api/hrm/recruitment/candidates-pool/:id/stage` | PASS — wired in `CandidatesTab` |
| Recruitment / Candidates | Create candidate | N/A (`POST /recruitment/candidates` requires `requisition_id`) | BLOCKED contract |
| Recruitment / Candidates | Delete candidate | N/A (no candidate-pool delete endpoint found) | BLOCKED contract |
| Payroll / Payment batches | Process payment | N/A (hook throws backend not ready) | BLOCKED contract |

## Validation commands

- `pnpm -C apps/web/hrm exec eslint src/components/recruitment/CampaignsTab.tsx src/components/recruitment/CampaignFormDialog.tsx src/components/recruitment/CandidatesTab.tsx`
  - Exit `0` (warnings only, no errors)
- `pnpm -C apps/web/hrm run test`
  - Exit `0`
  - `Test Files 40 passed`, `Tests 116 passed`

## Changed files

- `apps/web/hrm/src/components/recruitment/CampaignsTab.tsx`
- `apps/web/hrm/src/components/recruitment/CampaignFormDialog.tsx`
- `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx`
