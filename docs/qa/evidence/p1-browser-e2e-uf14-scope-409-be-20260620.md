# P1-BROWSER-E2E-UF14-SCOPE-409-01 — BE fix (UF-XBOS-14)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-UF14-SCOPE-409-01` |
| **role** | dev-be |
| **executed_at** | 2026-06-20 |
| **spec_ref** | UC-CC-P0-05 · ADR-GROUP-CEO-MAIN-HOLDING-SCOPE §4 |
| **ack_status** | **READY_FOR_QA** |

---

## Root cause

`BusinessMasterController.listDomainItems` / `listDomains` called **`resolveScopeContext`** with query `companyId=holding` **before** `resolveXbosGroupLegalReadScopeContext`. Strict JWT∩query match threw **409** `companyId mismatches token scope` (`token=main`, `request=holding`) — alias never ran.

Portal FE (`commandCenterCatalogApi`) sends GET `?companyId=holding` by design; PUT headers use `main` (already mapped via mutation scope).

## Fix

Pass raw `{ tenantId, companyId }` directly into `resolveXbosGroupLegalReadScopeContext` (same pattern as `org-foundation`, `config-sync`, `catalog-governance`).

**File:** `apps/api/xbos-api/src/business-master/business-master.controller.ts`

## Regression

| Suite | Result |
|-------|--------|
| `business-master.controller.spec.ts` | **15/15** PASS (incl. `P1-BROWSER-E2E-UF14-SCOPE-409-01`) |
| `p1-web-acceptance-cc-catalog.spec.ts` | **1/1** PASS |
| `xbos-group-legal-scope.spec.ts` | **18/18** PASS |
| `pnpm run build` (xbos-api) | exit **0** |

## UF-XBOS-05 / UF-XBOS-13

No change to org-foundation shareholder or position-rbac paths — read scope helper unchanged; only business-master read entry fixed.

## QA retest (browser U63)

1. Login `ceo@xe.vn` / `Xevn@2026` on `:8088`
2. Navigate `?settings=document`
3. **Network:** GET `/api/xbos/business-master/command_center_catalogs/items?companyId=holding` → **200** `XBOS-MASTER-200`
4. Add/edit regulation row → debounce PUT → **200**; no 409 banner
5. F5 → row persists
