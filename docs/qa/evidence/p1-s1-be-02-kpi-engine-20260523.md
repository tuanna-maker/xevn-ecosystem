# P1-S1-BE-02 — KPI engine UC-XBOS-KPI-01..04 (M01)

| Field | Value |
|-------|--------|
| **work_item_id** | P1-S1-BE-02 |
| **date** | 2026-05-23 |
| **owner** | Dev-BE |
| **ADR** | `docs/decisions/ADR-XBOS-M01-OPENAPI-BOUNDARIES.md` |
| **BA** | `docs/xbos/S1_BA_PROCESS_XBOS_UC03-07.md` (BR-SCOPE-03/04) |
| **OpenAPI** | `docs/api/openapi/xbos-api.yaml` (M01-KPI) |

## Scope delivered

| UC | operationId | Route | Code |
|----|-------------|-------|------|
| UC-XBOS-KPI-01 | `kpiEngineEvaluate` | `POST /kpi-engine/evaluate` | `XBOS-KPI-200` |
| UC-XBOS-KPI-02 | `kpiEngineEvaluateBatch` | `POST /kpi-engine/evaluate-batch` | `XBOS-KPI-201` |
| UC-XBOS-KPI-03 | `kpiEngineRollup` | `GET /kpi-engine/rollup` | `XBOS-KPI-202` |
| UC-XBOS-KPI-04 | `kpiEnginePortalAlerts` / `kpiEnginePublishPortalAlert` | `GET` / `POST /kpi-engine/portal-alerts` | `XBOS-KPI-203` / `XBOS-KPI-204` |

### Scope rules (holding vs main)

- **Rollup** (`UC-KPI-03`): `resolveScopeContext` — JWT `companyId=holding` requires query/header `holding`; JWT `main` requires `main`; drift → **409** `SCOPE_CONTEXT_MISMATCH`.
- **Holding rollup math**: `companyId` ∈ `{holding, all}` aggregates `xbos_kpi_actuals` across group company ids (`holding`, `main`, member slugs).
- **Portal alerts list**: `resolveTenantOnlyContext` + optional `companyId` filter (no false `SCOPE_COMPANY_REQUIRED`).
- **Publish alert**: `POST portal-alerts` uses full scope guard (same as rollup).

### Validation

- Evaluate missing/NaN `target`/`actual` → **400** `XBOS-VAL-003`.
- Optional `emitPortalAlert` / `emitPortalAlerts` on evaluate paths when band is `warning`/`critical`.

## Files touched

- `apps/api/xbos-api/src/kpi-engine/kpi-engine.controller.ts`
- `apps/api/xbos-api/src/kpi-engine/kpi-engine.service.ts`
- `apps/api/xbos-api/src/kpi-engine/kpi-scope.constants.ts` (new)
- `apps/api/xbos-api/src/kpi-engine/dto/kpi-evaluate.dto.ts` (new)
- `apps/api/xbos-api/src/kpi-engine/kpi-engine.controller.spec.ts` (new)
- `apps/api/xbos-api/src/kpi-engine/kpi-engine.service.spec.ts` (new)
- `docs/api/openapi/xbos-api.yaml` (POST `portal-alerts`, `CompanyIdQuery` on GET)
- `scripts/seed-kpi-actuals.mjs` (`main` + `holding` rows)

## Verification

```text
cd apps/api/xbos-api
pnpm test   → 18 suites, 77 tests PASS
pnpm build  → PASS

cd repo root
pnpm verify:openapi-m01 → PASS
```

### KPI-specific jest

| Suite | Focus |
|-------|--------|
| `kpi-engine.controller.spec` | auth 401; rollup holding≠main 409; aligned holding/main PASS; portal publish 409/204 |
| `kpi-engine.service.spec` | evaluate bands; batch index; group vs single rollup SQL; publish alert id |
| `scope-context.spec` | holding JWT vs query `main` → 409 (existing ADR org plane case) |

## QA matrix hooks

| Scenario | Steps | Pass |
|----------|-------|------|
| KPI-ROLLUP-01 | Login `ceo@xe.vn` → `GET /api/xbos/kpi-engine/rollup?tenantId=xevn&companyId=<JWT companyId>` | 200 `XBOS-KPI-202`, no 409 |
| KPI-ROLLUP-02 | Same token, deliberate `companyId=main` when JWT is `holding` | 409 `SCOPE_CONTEXT_MISMATCH` |
| KPI-EVAL-01 | `POST evaluate` internal key, `{target:100,actual:90}` | 200 `XBOS-KPI-200`, `band=excellent` |
| KPI-ALERT-01 | `POST portal-alerts` scoped warning title | 200 `XBOS-KPI-204`; `GET portal-alerts` lists row |

**Seed (optional DB):** `pnpm seed:kpi:actuals` — seeds `xevn` tenant for `main` and `holding`.

## Handoff

- **FE (P1-S1-FE-01):** rollup/sparkline must send JWT-aligned `companyId` (`resolveIdentityScope`); group CEO catalog paths use `holding`, embed/HRM density uses `main` per ADR ladder.
- **QA:** run jest hooks above before L2 P-CC-04 rollup probe.
