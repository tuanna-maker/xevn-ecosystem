# P1-RESID-C-MOB-HEADER — Mobile x-company-id UUID header

**work_item_id:** `P1-RESID-C-MOB-HEADER`  
**role:** dev-mobile  
**date:** 2026-05-30  
**ack_status:** `READY_FOR_QA`

## Problem

`du-lich.ceo@xe.vn` membership carries scope slug `main` in `company_id` but legal-entity UUID in `company_uuid`. `getHrmAuth()` forwarded slug to `x-company-id`, causing 409 / empty lists on manager approve/pending and other HRM REST calls.

## Fix

| Area | Change |
|------|--------|
| `hrmApiClient.ts` | `resolveHrmCompanyHeaderId()` — prefer `company_uuid`, set `x-company-id` on every `hrmRequest` |
| `types.ts` | `HrmAuthConfig.companyUuid` optional field |
| `AuthContext.tsx` | `getHrmAuth()`, `selectMembership`, `refresh`, push bootstrap pass `companyUuid` |
| `hrmEmployees.ts` | List lookup uses resolved header id |
| `CheckInScreen.tsx` | Employee list query uses `getAttendanceCompanyId()` |
| `ContractsScreen.tsx` | Contract queries use UUID scope |
| `DashboardScreen.tsx` | Scope card + employees probe use UUID |

## Regression

```bash
cd apps/mobile/hrm-mobile && pnpm test
```

Vitest: `resolveHrmCompanyHeaderId` + `hrmRequest` header assertion (main slug + UUID → header UUID).

## QA handoff (J-MOB-05)

1. Pilot reseed; login `du-lich.ceo@xe.vn` / `Xevn@2026`.
2. Manager tab → pending leave/update: list loads, approve/reject return 200 (not 409 scope).
3. Proxy/log: `x-company-id` = du-lich legal entity UUID, not `main`.

**pm_dispatch_hint:** QA device J-MOB-05 after pilot reseed.
