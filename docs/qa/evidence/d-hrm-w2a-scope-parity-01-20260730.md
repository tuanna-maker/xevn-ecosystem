# D-HRM-W2A-SCOPE-PARITY-01 — Standalone HRM scope parity (Group CEO)

**work_item_id:** `D-HRM-W2A-SCOPE-PARITY-01`  
**program:** `HDSD-P2-FULL-01`  
**from_role:** dev-be  
**date:** 2026-07-30  
**spec_ref:** `docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` · QA residual `R-W2A-SCOPE-01`

## Root cause

| Surface | JWT after login | FE scope headers / query | Result |
|---------|-----------------|--------------------------|--------|
| W2b embed `:5173/...?portal=1` | Portal JWT `tenantId=xevn` · `companyId=main` · `roleCode=group_ceo` | `x-tenant-id=xevn` · `x-company-id=main` · `?company_id=main` | **200** |
| W2a standalone `:5175/hr/*` | Mobile login JWT `tenantId=xevn` · **`companyId=holding`** (employee row slug) | Same FE sends **`main`** (rollup bucket) | **409** `companyId mismatches token scope` |

Mobile standalone login (`POST /auth/mobile/login`) issues tokens from the employee row `company_id=holding` (PORTAL-GCEO) while operational APIs expect the **main** operating bucket per ADR §3.1. `resolveScopeContext` had no alias for **holding JWT + main request** for documented Group CEO.

Secondary FE bug: `AuthContext` persisted `hrm_current_tenant_id=main` (copied from `currentCompanyId`) after standalone login, polluting scope inference.

## Fix

### BE — `scope-context.ts` · `hrm-list-scope.ts`

1. **`isGroupCeoMasterOperatingBucket`** — detects Group CEO on master when JWT claim is `main` (portal) or `holding` (mobile) via `roleCode=group_*` or `sub=ceo@xe.vn`.
2. **`isGroupCeoHoldingJwtMainRequest`** — allows `holding` JWT + `main` header/query without 409; effective resolved scope returns **`main`**.
3. **`resolveHrmListScope`** — group rollup (`GROUP_MEMBER_SLUGS`) when mobile holding JWT + `?company_id=main` (parity with portal `main` JWT).

### FE — `portalAuthBridge.ts` · `AuthContext.tsx`

1. **`applyStandaloneSessionScope`** — after mobile login persist `hrm_current_tenant_id=xevn` and `hrm_current_company_id=main`.
2. **`signIn`** — coerce membership `holding` → `main`; set tenant from membership / `default_tenant_id`, not company slug.
3. **Tenant `useEffect`** — stop using `currentCompanyId` as tenant fallback (was writing `main` as tenant id).

## Verification

```bash
cd apps/api/hrm-api
pnpm exec jest src/common/scope-context.spec.ts src/common/hrm-list-scope.spec.ts --no-cache
# Test Suites: 2 passed · Tests: 41 passed
```

New cases:

- `scope-context.spec.ts` — mobile CEO holding JWT + request `main` → `{ tenantId: xevn, companyId: main }`
- `scope-context.spec.ts` — uat.nv0001 holding JWT + request `main` → still **409**
- `hrm-list-scope.spec.ts` — mobile holding JWT + list `main` → `masterTenantPartition: true` + five slugs

Live smoke `:28001` not run (ECONNREFUSED during dev-be turn); QA to re-run W2a harness after hrm-api restart.

## Changed files

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/common/scope-context.ts` | holding→main alias for Group CEO |
| `apps/api/hrm-api/src/common/hrm-list-scope.ts` | rollup helper + list scope |
| `apps/api/hrm-api/src/common/scope-context.spec.ts` | +2 tests |
| `apps/api/hrm-api/src/common/hrm-list-scope.spec.ts` | +1 test |
| `apps/web/hrm/src/lib/portalAuthBridge.ts` | `applyStandaloneSessionScope` |
| `apps/web/hrm/src/contexts/AuthContext.tsx` | standalone login scope persist |
| `apps/web/hrm/src/integrations/hrmMobileAuth.ts` | types: `is_primary`, `default_tenant_id` |

## Residual

- QA W2a browser re-run (`QA-HDSD-W2A-STANDALONE-01` retest) with hrm-api + `:5175` up.
- Mutate flows (🟡 BLOCKED in W2a evidence) unchanged — out of scope for this WI.

---

**ack_status:** `READY_FOR_QA`

**next_owner:** qa

**next_dispatch_prompt:**

```text
work_item_id: QA-HDSD-W2A-SCOPE-PARITY-01
from_role: dev-be | to_role: qa
entry_criteria: D-HRM-W2A-SCOPE-PARITY-01 READY_FOR_QA — docs/qa/evidence/d-hrm-w2a-scope-parity-01-20260730.md; jest scope-context + hrm-list-scope 41/41 PASS
exit_criteria: Re-run W2a standalone harness ceo@xe.vn on :5175/hr/* — catalog-sync, employees, employees/summary, settings-catalogs **2xx** (no scope 409 banner); compare vs W2b embed parity; evidence docs/qa/evidence/qa-hdsd-w2a-scope-parity-01-20260730.md; U65 zero-seed browser-only
persona: ceo@xe.vn / Xevn@2026
J-*: J-HRM-01 list→detail if rows present
ack_status: PASS_TO_PM or FAIL with residual
```
