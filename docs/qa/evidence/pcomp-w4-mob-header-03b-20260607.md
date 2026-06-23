# PCOMP-W4-MOB-HEADER-03b — Manager approve/reject write header UUID

**work_item_id:** PCOMP-W4-MOB-HEADER-03b  
**date:** 2026-06-07  
**owner:** dev-mobile  
**ack_status:** READY_FOR_QA

## Problem (MUX-03b GWC)

Manager approve/reject on `uat.nv0001@xe.vn` returned `HRM-ATT-REQ-409` because mobile sent `x-company-id: holding` (rollup slug) on POST mutate paths. BE write scope guards require legal-entity UUID `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013`.

## Root cause

`hrmRequest` used `resolveHrmCompanyHeaderId` for **all** HTTP methods. That resolver intentionally prefers membership scope slug (`holding`) on read paths for list rollup parity — but mutate endpoints reject slug headers.

## Fix

| Layer | Change |
|-------|--------|
| `hrmApiClient.ts` | Added `resolveHrmWriteHeaderId()` + `isHrmWriteMethod()`; `hrmRequest` uses write resolver on POST/PATCH/PUT/DELETE |
| GET (unchanged) | `resolveHrmCompanyHeaderId` still sends `holding` slug for pending list loads |
| WRITE (fixed) | `resolveHrmWriteHeaderId` sends legal UUID from `auth.companyUuid` (populated by `resolveWireCompanyId` in `buildHrmAuthConfig`) |
| Screens | No screen diff — `ManagerApprovalsScreen` approve/reject flows through `auth.requestHrm` → `hrmRequest` |

### Contract split (uat.nv#### workforce)

| Call | Method | `x-company-id` | `company_id` query/body |
|------|--------|----------------|-------------------------|
| Pending inbox load | GET | `holding` | legal UUID |
| Approve update/leave | POST | `6efaa5d6-…4013` | — |
| Reject update/leave | POST | `6efaa5d6-…4013` | — |

## Verification

```bash
cd apps/mobile/hrm-mobile
pnpm exec vitest run
# Test Files  19 passed (19)
# Tests       96 passed (96)
# exit 0
```

### Key regression cases

- `hrmApiClient.test.ts` — GET holding slug; POST approve/reject → UUID
- `companyWireScope.test.ts` — read/write split for holding
- `p1-phase1-mob-p5-jwt.test.ts` — UAT workforce scope parity updated

## QA retest (J-MOB-05)

1. Login `uat.nv0001@xe.vn` / `xevn-uat-2026` (manager with pending items).
2. **Duyệt** tab → select pending row → **Duyệt** sticky footer.
3. Expect HTTP 201 + success toast (not `HRM-ATT-REQ-409`).
4. Repeat **Từ chối** with reason.
5. Network probe: POST `/approve` and `/reject` must show `x-company-id: 6efaa5d6-a4a8-4bfd-805a-3c4f003e4013`; GET list may still show `holding`.

## Residual

- None in mobile scope. If BE still 409s with correct UUID header → dispatch `dev-be` scope audit.

## Files touched

- `apps/mobile/hrm-mobile/src/integrations/hrmApiClient.ts`
- `apps/mobile/hrm-mobile/src/integrations/__tests__/hrmApiClient.test.ts`
- `apps/mobile/hrm-mobile/src/integrations/__tests__/companyWireScope.test.ts`
- `apps/mobile/hrm-mobile/src/integrations/__tests__/p1-phase1-mob-p5-jwt.test.ts`
