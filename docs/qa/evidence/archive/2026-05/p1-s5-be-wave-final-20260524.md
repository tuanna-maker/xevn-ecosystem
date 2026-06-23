# P1-S5-BE-WAVE-FINAL — XBOS khối A closure wave (config / WF / CC)

| Field | Value |
|-------|--------|
| **work_item_id** | P1-S5-BE-WAVE-FINAL |
| **date** | 2026-05-24 |
| **owner** | Dev-BE |
| **ack_status** | **READY_FOR_QA** |
| **program** | U17 — G2 burn (khối A toward e2e-ready) |
| **deadline** | U17 ~30m window |

## Scope

Push remaining **khối A** BE clusters toward **e2e-ready**:

- Config publish **UC-XBOS-02 / 03 / 05** (publish + read/list)
- Workflow **UC-XBOS-WF-02..06** + inbox API for **UC-CC-P0-06**
- Command Center BE routes **UC-CC-P0-01..05, 08**
- `srs-api-map.mjs` aligned to **`workflow-engine/*`** (not legacy `/workflow/sessions`)
- `phase1-impl-status.json` overrides + matrix regenerate

## Deliverables

| Area | Change | UC |
|------|--------|-----|
| Workflow jest | `workflow-engine.controller.spec.ts` (7 cases) | WF-02..06, CC-P0-06 inbox |
| CC workspace | `command-center.controller.spec.ts` + ADR C2 read scope on `workspace-meta` | CC-P0-08 |
| Legal CC APIs | `legal-entity-profile.controller.spec.ts` | CC-P0-01, 02 |
| Org / RBAC / config tags | UC tags on existing specs | CC-P0-03, 04, 05 |
| API map | `scripts/lib/srs-api-map.mjs` — WF + UC-CC-P0-* concrete paths | traceability |
| Tracking | `phase1-impl-status.json` — **+14** `e2e_pass`, CC-P0-06 → `be` | G2 partial |

<a id="config-publish"></a>

### Config publish cluster

| UC | API | Evidence |
|----|-----|----------|
| UC-XBOS-02 | `POST .../config-sync/catalog/:key/publish` | `config-sync.controller.spec.ts` → `XBOS-CFG-203` |
| UC-XBOS-03 | `GET .../catalog/:key` (group CEO `main` → `holding`) | same + S2 live probes |
| UC-XBOS-05 | publish (update path) | same |
| UC-CC-P0-05 | `GET .../config-sync/catalogs` | list `XBOS-CFG-202` |

<a id="workflow"></a>

### Workflow cluster

| UC | API | Evidence |
|----|-----|----------|
| UC-XBOS-WF-02 | `GET /workflow-engine/definitions` | `workflow-engine.controller.spec.ts` |
| UC-XBOS-WF-03 | `POST /workflow-engine/instances` | `XBOS-WF-201` |
| UC-XBOS-WF-04 | `POST /workflow-engine/tasks/:id/complete` | `XBOS-WF-200` |
| UC-XBOS-WF-05 | `GET /workflow-engine/instances/:id/detail` | `XBOS-WF-204` |
| UC-XBOS-WF-06 | `POST /workflow-engine/tasks/:id/reject` | `XBOS-WF-205` |

<a id="workflow-inbox"></a>

| UC | API | Note |
|----|-----|------|
| UC-CC-P0-06 | `GET /workflow-engine/tasks?status=pending` | BE `be` — FE inbox drawer still owns L2 |

<a id="cc-routes"></a>

### Command Center BE routes

| UC | API | Evidence |
|----|-----|----------|
| UC-CC-P0-01 | shareholders + legal entities | `legal-entity-profile` + `org-foundation` specs |
| UC-CC-P0-02 | legal documents list | `XBOS-DOC-200` |
| UC-CC-P0-03 | org-units CRUD scope | `org-foundation.controller.spec.ts` |
| UC-CC-P0-04 | position-rbac | `position-rbac.controller.spec.ts` |
| UC-CC-P0-08 | `GET /command-center/workspace-meta` | `XBOS-CC-200` + group CEO `main`→`holding` |

<a id="alerts"></a>

| UC-XBOS-07 | `POST /alerts/violation-ingest` | `alerts.controller.spec.ts` (carry-forward) |

## UC status delta (`pnpm docs:phase1:matrix`)

| Metric | Before (P1-S5-QA-01) | After wave |
|--------|---------------------:|-----------:|
| **e2e_pass** | 30 | **44** (+14) |
| **be** | 88 | **85** |
| **planned** | 63 | **57** |
| **fe** | 13 | **8** |

### Khối A XBOS `e2e_pass` (override count)

~**28/104** XBOS-family overrides at `e2e_pass` (was ~14) — **G2 still open**; QA cluster retest required before program G2 sign-off.

## Re-verification (P1-TODAY-GOV-BE-LEAD, same day)

```text
pnpm --filter xbos-api test           → 30 suites, 125 tests PASS
pnpm --filter hrm-api test            → 27 suites, 118 tests PASS
pnpm run verify:capabilities          → pass=23 skip=35 fail=0 exit 0
```

## Verification (original wave)

```text
pnpm --filter xbos-api test           → 30 suites, 125 tests PASS (+13)
pnpm -C apps/api/xbos-api run build   → PASS
pnpm run verify:capabilities          → pass=23 skip=35 fail=0 exit 0
pnpm docs:phase1:matrix               → PHASE1_UC_SRS_TECHSPEC_MATRIX.md regenerated
```

### New test files

| File | Cases |
|------|------:|
| `workflow-engine/workflow-engine.controller.spec.ts` | 7 |
| `command-center/command-center.controller.spec.ts` | 3 |
| `legal-entity-profile/legal-entity-profile.controller.spec.ts` | 3 |

## QA smoke hints (live — optional if stack up)

| ID | Request | Pass when |
|----|---------|-----------|
| CFG-PUB | `POST /api/xbos/config-sync/catalog/job_titles/publish` + internal key + scoped body | 200 `XBOS-CFG-203` |
| WF-INBOX | `GET /api/xbos/workflow-engine/tasks?status=pending&tenantId=xevn` + key | 200 `XBOS-WF-203` |
| CC-META | `GET /api/xbos/command-center/workspace-meta?tenantId=xevn&companyId=holding` + key | 200 `XBOS-CC-200` |
| CAP | `pnpm run verify:capabilities` | exit 0 |

## Blockers / residual

| Item | Owner | Note |
|------|-------|------|
| G2 **104/104** e2e_pass | QA P1-S5-QA-02 | BE promotions need L2/capability cluster sign-off |
| UC-CC-P0-06 / WF-01 canvas | Dev-FE | Inbox UI + canvas still FE-owned |
| UC-CC-P0-09 mock policy | Dev-FE | KPI rail fallback |
| OpenAPI delta | Dev-BE follow-up | WF + CC paths in `xbos-api.yaml` |
| Legal-entity profile group CEO `main` | Dev-BE | Shareholders still strict scope — portal uses holding query |

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **to_role** | QA (`P1-S5-QA-02` cluster: config publish, WF inbox, CC workspace-meta) |
| **evidence_path** | `docs/qa/evidence/p1-s5-be-wave-final-20260524.md` |
| **impl_status** | `docs/ecosystem/phase1-impl-status.json` |
| **commit** | **None** (per dispatch) |
