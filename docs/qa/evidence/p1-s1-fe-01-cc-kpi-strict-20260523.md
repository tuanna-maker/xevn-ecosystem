# P1-S1-FE-01 — Command Center KPI rail / dashboard strict mode

**work_item_id:** `P1-S1-FE-01`  
**date:** 2026-05-23  
**owner:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**audit:** `docs/ecosystem/FE_MOCK_TO_API_AUDIT.md` (G1, G2, G5)

## Summary

Command Center KPI sparkline and alerts use XBOS `kpi-engine` contracts first; mock/fallback only when `VITE_ALLOW_MOCK_FALLBACK=true` (dev). Executive dashboard hides demo financial cards in strict mode and surfaces rollup/KPI policy state.

## API contracts wired

| Widget | Endpoint | FE module |
|--------|----------|-----------|
| KPI sparkline | `GET /api/xbos/kpi-engine/rollup` | `kpiEngineApi.fetchKpiRollup`, `commandCenterKpi.rollupToSparkline` |
| Portal alerts (stored) | `GET /api/xbos/kpi-engine/portal-alerts` | `portalAlertsApi.fetchPortalAlerts` |
| KPI evaluate (exec cockpit) | `POST /api/xbos/kpi-engine/evaluate-batch` | existing `useKpiDashboardSnapshot` |
| Alerts (workflow/catalog) | workflow + catalog-governance | `portalAlertsApi` (unchanged sources) |

Scope: `resolveIdentityScope()` — JWT `companyId=main` for group CEO (HRM-EMBED-D6).

## Strict mode behavior

| Flag | KPI rail | Alerts | Inbox tasks | Executive dashboard demo cards |
|------|----------|--------|-------------|--------------------------------|
| `VITE_ALLOW_MOCK_FALLBACK=false` | Empty + `ApiLoadBanner` if no rollup | Empty + banner if no API rows | Empty + seed hint | Hidden; rollup/KPI count shown |
| `VITE_ALLOW_MOCK_FALLBACK=true` | Mock persona series after rollup/snapshot miss | `mockPortalAlerts` | `mockUnifiedTasks` | Demo layout visible |

## Files changed

- `apps/web/web-portal/src/integrations/commandCenterKpi.ts` (+ test)
- `apps/web/web-portal/src/integrations/kpiEngineApi.ts` — `fetchKpiRollup`
- `apps/web/web-portal/src/hooks/useCommandCenterKpiRail.ts`
- `apps/web/web-portal/src/integrations/portalAlertMappers.ts` (+ test)
- `apps/web/web-portal/src/integrations/portalAlertsApi.ts`
- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx`
- `apps/web/web-portal/src/pages/dashboard/ExecutiveDashboardPage.tsx`

## Build / test evidence

```bash
cd apps/web/web-portal
pnpm test    # 29 passed (7 files)
pnpm build   # PASS
```

## QA matrix (L2 Command Center home)

**Pre:** Login `ceo@xe.vn` / `Xevn@2026` → `http://localhost:5175/command-center` (xbos-api @ 28002, `VITE_ALLOW_MOCK_FALLBACK` unset or `false`).

| # | Check | Expected |
|---|--------|----------|
| FE01-1 | Console on load | No red `[kpi-engine.rollup] HTTP 409` (optional 409 debug only) |
| FE01-2 | Network | `GET /api/xbos/kpi-engine/rollup?...companyId=main` when JWT `companyId=main` |
| FE01-3 | KPI widget strict | No mock % series; banner or `—` if DB has no `xbos_kpi_actuals` |
| FE01-4 | Alert widget strict | No mock alert titles; empty state or API-driven rows |
| FE01-5 | Inbox strict | No mock action cards; empty + seed hint if workflow inbox empty |
| FE01-6 | Executive `/dashboard` strict | Demo revenue cards hidden; KPI policy/rollup summary visible |
| FE01-7 | Dev mock flag | With `VITE_ALLOW_MOCK_FALLBACK=true`, mock KPI/alerts/tasks return |

**Seed (optional):** insert rows into `xbos_kpi_actuals` for tenant/company scope to populate sparkline.
