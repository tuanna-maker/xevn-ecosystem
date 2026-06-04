# HRM embed D6 — KPI rollup scope (Command Center)

**work_item_id:** `HRM-EMBED-D6`  
**parent:** `HRM-EMBED-D1` (portal JWT `companyId=main`)  
**date:** 2026-05-22  
**owner:** dev-fe  
**ack_status:** `PASS_TO_QC` (QA retest-2 2026-05-22 — see `pilot-business-flow-20260522.md` retest section)

## Summary

Fixed `[kpi-engine.rollup] HTTP 409: companyId mismatches token scope` on `/command-center/hrm/contracts` (and all Command Center shells). KPI rollup and portal-alerts now use `resolveIdentityScope()` (JWT `companyId=main` for `ceo@xe.vn`), not hardcoded `companyId=xevn`. Optional KPI failures (409) no longer emit `console.error`.

## Root cause

| Issue | Cause |
|-------|--------|
| Console 409 on contracts load | `CommandCenterPage` called `useCommandCenterSparkline(MASTER_TENANT_ID, MASTER_TENANT_ID)` → query/header `companyId=xevn` while JWT has `main` |
| Same class for alerts | `fetchPortalAlerts(MASTER_TENANT_ID)` defaulted `companyId` to tenant id `xevn` |

## Fix

| File | Change |
|------|--------|
| `useCommandCenterSparkline.ts` | `resolveIdentityScope(hints)` for rollup + business-master fallback; `suppressLogStatuses: [409]` |
| `portalAlertsApi.ts` | `resolveIdentityScope` for kpi-engine portal-alerts |
| `CommandCenterPage.tsx` | `useCommandCenterSparkline()` / `fetchPortalAlerts()` without xevn/xevn override |
| `xbosHttp.ts` | `suppressLogStatuses` — optional widgets skip `console.error` on listed HTTP codes |

## Build evidence

```bash
cd apps/web/web-portal && pnpm run build
```

## QA re-test matrix

**Pre:** Login `ceo@xe.vn` / `Xevn@2026` → `http://localhost:5175/command-center/hrm/contracts`

| # | Check | Expected |
|---|--------|----------|
| D6-1 | Console on load | No red `[kpi-engine.rollup] HTTP 409` |
| D6-2 | Network (optional) | `GET /api/xbos/kpi-engine/rollup?...companyId=main` (not `xevn`) when JWT `companyId=main` |
| D6-3 | Contracts iframe | C1–C6 from `hrm-embed-contracts-fix-20260522.md` still PASS |
| D6-4 | KPI widget | Empty sparkline OK if rollup unavailable — page not blocked |
