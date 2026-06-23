# P1-HRM-MEMBER-SESSION-403-8088-01 — Dev-FE evidence

**work_item_id:** `P1-HRM-MEMBER-SESSION-403-8088-01`  
**role:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**date:** 2026-06-20

## Symptom (QA R5)

- Personas: `du-lich.hr@xe.vn`, `du-lich.ceo@xe.vn` on `:8088`
- Login POST → **201**, then GET `/api/xbos/tenant-scope/group-member-units` → **403**
- `handleUnauthorizedResponse` in `xbosHttp.ts` cleared JWT → forced re-login loop
- `workspace-meta` called with `tenantId=xevn` + `companyId=main` → **409** for member JWT

## Root cause

1. **401/403 conflation** — business-scope 403 treated as auth failure → global logout.
2. **Unconditional group-member-units** — `useCompanyFilterOptions` fetched master-only endpoint for every persona.
3. **Hardcoded master scope** — `CommandCenterPage` workspace-meta effect used `MASTER_TENANT_ID`/`main` instead of `useTenantScope()`.
4. **GlobalFilter** — member tenant selection could fall back to env master default; `companyId` not propagated from membership/JWT.

## Fix summary

| # | Change | File(s) |
|---|--------|---------|
| 1 | Logout only on **401**; 403 does not clear token | `authSession.ts`, `xbosHttp.ts` (via handler) |
| 2 | Skip `group-member-units` when `!isGroupCeoOnMasterTenant()` | `useCompanyFilterOptions.ts` |
| 3 | JWT/membership-aligned tenant + company in GlobalFilter | `GlobalFilterContext.tsx` |
| 4 | workspace-meta uses active `tenantId`/`companyId` | `CommandCenterPage.tsx` |
| 5 | HRM redirect: `RequireAuth` + 401 handler preserve `?redirect=` | `RequireAuth.tsx`, `AuthContext.tsx` |

## Automated verification

```text
pnpm exec vitest run src/integrations/authSession.test.ts src/hooks/useCompanyFilterOptions.test.ts
→ 11/11 PASS

pnpm run build (apps/web/web-portal)
→ exit 0
```

### New tests

- `handleUnauthorizedResponse` — 401 clears session + stashes path; **403 keeps token**
- `useCompanyFilterOptions` — skips API when member persona (`isGroupCeoOnMasterTenant=false`)

## QA retest (browser — U65 zero-seed)

**Personas:** `du-lich.ceo@xe.vn` / `du-lich.hr@xe.vn` · `Xevn@2026`  
**URL:** `http://<host>:8088`

### UF / J-*

| Step | Expected |
|------|----------|
| Login from `/login?redirect=/command-center/hrm/employees` | 201; land on HRM employees embed |
| Network after login | **No** GET `group-member-units` for member (or 403 without logout) |
| Session | JWT remains; no bounce to `/login` |
| workspace-meta | Query `tenantId=xe-du-lich&companyId=main` (not `xevn`) |
| F5 on HRM route | Still authenticated; embed loads |

### Network assertions

- POST `/api/xbos/auth/login` → **201**
- GET `/api/xbos/auth/me` → **200**
- GET `/api/xbos/command-center/workspace-meta?tenantId=xe-du-lich&companyId=main` → **200** (not 409)
- GET `/api/xbos/tenant-scope/group-member-units` → **absent** or 403 **without** token clear

## Residual

- PM must **pscp + restart portal-fe** on `:8088` for bundle deploy.
- Group CEO (`ceo@xe.vn`) regression: group-member-units still loads; workspace-meta uses `xevn/main`.

## spec_ref

- ADR scope ladder · member JWT `xe-du-lich/main`
- QA R5 `p1-hrm-member-session-403-8088` (browser FAIL intake)
