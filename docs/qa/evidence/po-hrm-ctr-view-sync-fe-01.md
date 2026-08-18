# D-PO-HRM-CTR-VIEW-SYNC-01 — Contract view dialog GET-by-id

| Field | Value |
|-------|--------|
| **work_item_id** | `D-PO-HRM-CTR-VIEW-SYNC-01` |
| **role** | dev-fe |
| **ack_status** | `READY_FOR_QA` |
| **date** | 2026-08-10 |
| **U65** | zero-seed · browser evidence only for UF |

## Problem

View (Eye) dialog bound `viewingContract` from list row snapshot → stale `employee_name`, department `—`, narrow `max-w-lg` vs create parent-portal shell.

## Fix

1. `getEmployeeContractById(contractId, companyId)` — `GET /api/hrm/contracts-insurance/contracts/:id?company_id=…`
2. `Contracts.tsx` — `useQuery` `contract-view-detail` when view opens; `handleOpenView` sets `viewingContractId` only
3. `mapApiContract` / `resolveContractPartyDisplayName` — `candidate_label`, `department`, `signing_date`, `contract_abstract`, `notes` from GET
4. View `DialogContent` — `w-[min(90vw,96rem)]` parent portal (Q1-A parity with create)
5. HDSD testids: `hdsd-contracts-view-party`, `hdsd-contracts-view-department`, `hdsd-contracts-view-signing-date`, `hdsd-contracts-view-abstract`, loading/error

## Files

- `apps/web/hrm/src/integrations/hrmApi.ts`
- `apps/web/hrm/src/hooks/useContracts.ts`
- `apps/web/hrm/src/pages/Contracts.tsx`
- `apps/web/hrm/src/hooks/useContracts.test.ts`
- `apps/web/hrm/src/pages/Contracts.viewDialog.source.test.ts`

## Verify (agent)

```bash
cd apps/web/hrm
pnpm exec vitest run src/hooks/useContracts.test.ts src/pages/Contracts.viewDialog.source.test.ts
```

Exit **0** — 19 tests PASS (2026-08-10).

## QA matrix (browser · U65)

| Step | AC |
|------|-----|
| Login `ceo@xe.vn` → CC → HRM → Hợp đồng | L2 load |
| Row with UV/CORE07 (or candidate subject) — note list party + department | Baseline |
| Eye **Chi tiết** | Network: `GET …/contracts/{id}?company_id=main` **2xx** |
| Dialog bbox | ~90vw parent portal (not `max-w-lg`) |
| Party label | Matches list `candidate_label` / `employee_name` |
| Department | Not stale `—` when list shows dept |
| Ngày ký + Trích yếu | Shown when GET has `signing_date` / `contract_abstract` |
| F5 with dialog closed → reopen same row | Still GET fresh detail |

**J-***: J-HRM-03 list → view detail

## Residual

- `file_url` still null on API row (unchanged — attach flow out of scope)
- `salary_ratio_percent` not rendered in view (optional GĐ1 — create has field; add if BA asks)
