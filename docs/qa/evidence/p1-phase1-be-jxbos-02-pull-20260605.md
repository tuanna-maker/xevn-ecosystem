# P1-PHASE1-BE-JXBOS-02-PULL-01 — J-XBOS-02 catalog-sync scope fix (2026-06-05)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-BE-JXBOS-02-PULL-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **journey** | **J-XBOS-02** (`docs/program/PROGRAM_JOURNEY_MAP.md`) |
| **entry** | QC G5 GWC — `docs/qa/evidence/p1-s5-qc-g5-01-20260605.md` § J-XBOS-02-GWC |
| **environment_authoritative** | `https://14-225-217-232.nip.io` |
| **ack_status** | **READY_FOR_QA** |

---

## Root cause

Group CEO JWT carries `tenantId=xevn`, `companyId=main` while catalog publish SoT and HRM `synced_catalogs` partition use `company_id=holding` (ADR §4 / J-XBOS-02).

`catalog-sync` list/get/pull/status used strict `resolveScopeContext`, so requests with `x-company-id: holding` or `?companyId=holding` returned **409** `SCOPE_CONTEXT_MISMATCH` even though the same persona could read XBOS `config-sync/catalog/*` with **200**.

Secondary: `POST catalog-sync/pull` passed scope on nip.io (partial deploy) but upstream XBOS returned **401** because `hrm-be` called XBOS with only `x-internal-api-key` and production `INTERNAL_API_KEY` was unset — no caller JWT forwarded.

---

## Fix (hrm-api)

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/common/hrm-catalog-sync-scope.ts` | **New** — `normalizeHrmCatalogSyncRequestCompanyId` maps group CEO `holding` → `main` before strict scope; `resolveHrmCatalogSyncScope` persists `holding` catalog partition via `resolveHrmSettingsCatalogCompanyId` |
| `apps/api/hrm-api/src/catalog-sync/catalog-sync.controller.ts` | All routes (`pull`, `list`, `get`, `status`) use `resolveHrmCatalogSyncScope`; query `tenantId`/`companyId` supported |
| `apps/api/hrm-api/src/catalog-sync/catalog-sync.service.ts` | `buildXbosUpstreamHeaders(authorization)` forwards caller Bearer JWT to XBOS in addition to internal key |
| `apps/api/hrm-api/src/common/hrm-catalog-sync-scope.spec.ts` | Unit tests — group CEO holding alias, member CEO reject |
| `apps/api/hrm-api/src/catalog-sync/catalog-sync.controller.spec.ts` | Regression — group CEO `main`/`holding` header and query → service called with `holding` partition |

**Scope parity:** list and pull share the same `resolveHrmCatalogSyncScope` resolver (U19).

---

## Verification commands

### Jest (local — exit 0)

```powershell
Set-Location apps/api/hrm-api
npx jest "hrm-catalog-sync-scope.spec" "catalog-sync.controller.spec" --no-cache
```

| Result | Detail |
|--------|--------|
| Exit **0** | **15/15** PASS |

```powershell
pnpm run build
```

| Result | Detail |
|--------|--------|
| Exit **0** | nest build PASS |

### nip.io probe — pre-redeploy baseline (2026-06-05T02:40Z)

Account `ceo@xe.vn` / `Xevn@2026`; token field `data.accessToken`.

```javascript
// node inline — partial deploy on pilot at probe time
const BASE = 'https://14-225-217-232.nip.io';
// login → token (tenantId=xevn, companyId=main)
```

| Probe | Headers | Result | Notes |
|-------|---------|--------|-------|
| `GET /api/hrm/settings-catalogs` | `x-company-id: main` | **200** `HRM-SET-200` | baseline auth OK |
| `GET /api/hrm/catalog-sync?companyId=holding` | `x-company-id: main` | **200** `HRM-SYNC-202` | partial scope fix on pilot |
| `GET /api/hrm/catalog-sync` | `x-company-id: holding` | **409** `SCOPE_CONTEXT_MISMATCH` | holding header not normalized on pilot |
| `POST /api/hrm/catalog-sync/pull/contract_types?companyId=holding` | `x-company-id: main` | **502** `HRM-SYNC-001` (XBOS **401**) | scope passed; upstream auth gap |
| `POST /api/hrm/catalog-sync/pull/contract_types` | `x-company-id: holding` | **409** `SCOPE_CONTEXT_MISMATCH` | holding header not normalized on pilot |
| `GET /api/xbos/config-sync/catalog/contract_types?companyId=holding` | JWT | **200** `XBOS-CFG-201` | XBOS SoT OK |

**QA prior (2026-06-05T02:34Z):** both pull + sync-list **409** with query `companyId=holding` — confirms pilot was on older build at QA time.

### Expected post-`hrm-be` redeploy (QA retest)

| Probe | Expected |
|-------|----------|
| `POST …/catalog-sync/pull/contract_types?tenantId=xevn&companyId=holding` | **200/201** `HRM-SYNC-200` |
| `GET …/catalog-sync?tenantId=xevn&companyId=holding` | **200** `HRM-SYNC-202`, count ≥ 40 |
| `GET …/catalog-sync` with `x-company-id: holding` | **200** (holding header alias) |

**Deploy path:** `devops` — rebuild/restart `hrm-be` on VPS (`/opt/xevn-ecosystem`); files: `hrm-catalog-sync-scope.ts`, `catalog-sync.controller.ts`, `catalog-sync.service.ts`, specs.

---

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| Pilot redeploy | `devops` | Code-only until `hrm-be` image/process updated on nip.io |
| `settings-catalogs/sync-from-xbos` bulk pull | `dev-be` (backlog) | Does not pass JWT to `pullCatalogFromXbos` yet — out of this slice |
| G4 `XBOS-CFG-004` on `target=xbos` | `dev-be` | Unrelated known residual |

---

## completion_report

- **Closed:** Root-cause documented; `resolveHrmCatalogSyncScope` parity on all `catalog-sync` routes; JWT forwarded on XBOS upstream pull; jest **15/15** + build PASS.
- **Open:** nip.io pilot needs **hrm-be** redeploy for live **200/201**; bulk `sync-from-xbos` JWT pass-through deferred.

## next_owner

**qa**

## next_dispatch_prompt

```
work_item_id: P1-S5-QA-JXBOS-02-RETEST-01
from_role: qa
to_role: pm
entry_criteria: dev-be P1-PHASE1-BE-JXBOS-02-PULL-01 READY_FOR_QA — evidence docs/qa/evidence/p1-phase1-be-jxbos-02-pull-20260605.md; devops hrm-be redeploy on nip.io completed (or PM confirms deploy)
exit_criteria: L2.5 J-XBOS-02 on https://14-225-217-232.nip.io — ceo@xe.vn login → POST /api/hrm/catalog-sync/pull/contract_types?tenantId=xevn&companyId=holding → 200/201 HRM-SYNC-200; GET /api/hrm/catalog-sync?tenantId=xevn&companyId=holding → 200 count≥40; optional holding header variant 200; no 409 SCOPE_CONTEXT_MISMATCH; evidence docs/qa/evidence/p1-s5-qa-jxbos-02-retest-20260605.md; ack_status PASS_TO_PM
evidence_path: docs/qa/evidence/p1-s5-qa-jxbos-02-retest-20260605.md
ack_status: PASS_TO_PM
pm_dispatch_hint: After QA PASS promote J-XBOS-02 🟡→✅ on PROGRAM_JOURNEY_MAP.md
```

## evidence_path

`docs/qa/evidence/p1-phase1-be-jxbos-02-pull-20260605.md`

## ack_status

**READY_FOR_QA**
