# P1-S5-BE-AR-INF-MAP — AR/AST/INF + XBOS-DM-10..18 srs-api-map closure

| Field | Value |
|-------|--------|
| **work_item_id** | P1-S5-BE-AR-INF-MAP |
| **date** | 2026-05-24 |
| **owner** | Dev-BE |
| **ack_status** | **READY_FOR_QA** |
| **program** | U18 EOD — Wave 2 per `p1-today-be-lead-backlog-20260524.md` §Missing B |

## Scope

Close **17** `planned` UC rows where XBOS controllers already exist but `srs-api-map.mjs` still resolved to wildcards (`/api/xbos/*` or `/api/xbos/catalog-governance/*`):

- **UC-XBOS-AR-01..03** — asset requests
- **UC-XBOS-AST-01..02** — asset registry / lifecycle
- **UC-XBOS-INF-01..03** — infrastructure settings / summary
- **XBOS-DM-10..18** — catalog export/import, governance workflow, audit history, publish notify

## Deliverables

| Area | Change | UC |
|------|--------|-----|
| `scripts/lib/srs-api-map.mjs` | +17 concrete PREFIX_API paths | AR/AST/INF/DM-10..18 |
| `scripts/uc-test-catalog.mjs` | Split AR→`asset-request/`, add INF + DM-10..18 module hints | coverage.json |
| `asset-request.controller.spec.ts` | **new** — 5 cases | AR-01..03 |
| `infrastructure.controller.spec.ts` | **new** — 4 cases | INF-01..03 |
| `assets.controller.spec.ts` | UC tags + AST-02 PATCH | AST-01..02 |
| `catalog-governance.controller.spec.ts` | UC tags + approve/reject success | DM-12,13,15,16 |
| `config-sync.controller.spec.ts` | DM-10 export read + DM-11/17/18 publish | DM-10,11,17,18 |
| `platform-audit.controller.spec.ts` | DM-14 history tag | DM-14 |
| `phase1-impl-status.json` | +17 `be` overrides | matrix promote |

<a id="asset-requests"></a>

### Asset requests (`/asset-requests`)

| UC | Method | Path | Code |
|----|--------|------|------|
| UC-XBOS-AR-01 | GET | `/api/xbos/asset-requests` | `XBOS-AST-200` |
| UC-XBOS-AR-02 | POST | `/api/xbos/asset-requests` | `XBOS-AST-201` |
| UC-XBOS-AR-03 | POST | `/api/xbos/asset-requests/:requestId/transition` | `XBOS-AST-200` |

<a id="assets"></a>

### Assets (`/assets`)

| UC | Method | Path | Code |
|----|--------|------|------|
| UC-XBOS-AST-01 | POST | `/api/xbos/assets` | `ASSET-REG-201` |
| UC-XBOS-AST-02 | PATCH | `/api/xbos/assets/:assetId` | `ASSET-REG-200` |

<a id="infrastructure"></a>

### Infrastructure (`/infrastructure`)

| UC | Method | Path | Code |
|----|--------|------|------|
| UC-XBOS-INF-01 | GET | `/api/xbos/infrastructure/settings` | `XBOS-INFRA-200` |
| UC-XBOS-INF-02 | PUT | `/api/xbos/infrastructure/settings` | `XBOS-INFRA-201` |
| UC-XBOS-INF-03 | GET | `/api/xbos/infrastructure/summary` | `XBOS-INFRA-210` |

<a id="catalog-governance"></a>

### Catalog governance

| UC | Method | Path | Code |
|----|--------|------|------|
| XBOS-DM-12 | POST | `/api/xbos/catalog-governance/workflows/start` | `XBOS-CAT-211` |
| XBOS-DM-13 | POST | `/api/xbos/catalog-governance/tasks/:taskId/approve` | `XBOS-CAT-201` |
| XBOS-DM-15 | GET | `/api/xbos/catalog-governance/extension-requests` | `XBOS-CAT-200` |
| XBOS-DM-16 | POST | `/api/xbos/catalog-governance/tasks/:taskId/reject` | `XBOS-CAT-202` |

<a id="dm-ops"></a>

### DM ops (config-sync + audit)

| UC | Method | Path | Code | Note |
|----|--------|------|------|------|
| XBOS-DM-10 | GET | `/api/xbos/config-sync/catalog/:catalogKey` | `XBOS-CFG-201` | export read path P1 |
| XBOS-DM-11 | POST | `/api/xbos/config-sync/catalog/:catalogKey/publish` | `XBOS-CFG-203` | import/commit |
| XBOS-DM-14 | GET | `/api/xbos/platform-audit/events` | `XBOS-AUDIT-200` | change history |
| XBOS-DM-17 | POST | publish | `XBOS-CFG-203` | version publish |
| XBOS-DM-18 | POST | publish | `XBOS-CFG-203` | notify on publish (audit emit) |

## Matrix delta (`pnpm docs:phase1:matrix`)

| Metric | Before | After |
|--------|--------|-------|
| `be` | 95 | **112** |
| `planned` | 36 | **19** |
| Promoted this wave | — | **17** |

Remaining **19 planned** (unchanged scope): WF canvas 13..16, CC-05..08, DASH, portal embed/binh FE-primary per backlog §Missing A.

## Verification

```text
pnpm --filter xbos-api test     → 32 suites, 145 tests PASS (+20 vs wave-final)
pnpm run verify:capabilities    → pass=23 skip=35 fail=0 exit 0
pnpm run docs:phase1:matrix     → 245 rows; be=112 planned=19
```

## QA entry criteria

| Check | Command / probe | Expect |
|-------|-----------------|--------|
| AR list/create | Live `GET/POST /api/xbos/asset-requests` with internal key + scoped JWT | 200/201, not wildcard map |
| INF settings | `GET/PUT /api/xbos/infrastructure/settings` | `XBOS-INFRA-200/201` |
| DM inbox | `GET /api/xbos/catalog-governance/inbox` (group CEO) | 200 `XBOS-CAT-212` |
| Regression | Full xbos jest + capabilities | exit 0 |

## Residual / defer

| Item | defer_reason | trigger_to_reopen |
|------|--------------|-------------------|
| Dedicated CSV export/import routes | P1 maps to GET catalog + publish | OpenAPI parity before PROD |
| UC-XBOS-INF-02 full metaTemplates schema | JSON via `customFieldDefsByEntity` minimal | SA gap INF-02 post-EOD |
| G14-ASSET-REQUEST capability smoke | Still `skip` — no HTTP row mapped | DevOps capability script extend |

## Handoff

| from | to | entry | exit | evidence |
|------|-----|-------|------|----------|
| dev-be | qa | xbos jest 145/145 | Live AR list/create smoke + L2 if routed | this file |
