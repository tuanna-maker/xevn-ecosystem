# Manifest — W1-S1-XBOS-CORE

| Meta | Value |
|------|--------|
| **squad_id** | W1-S1-XBOS-CORE |
| **work_item_id** | `PO-UC-TC-W1-S1-XBOS-CORE` |
| **STT** | 1–40 |
| **author** | ba-process |
| **design_status** | DESIGNED |
| **ack_status** | READY_FOR_SYNTH |
| **execution** | not started · uat_done: false |
| **generated** | 2026-08-04 |

## Coverage

| stt | uc_id | cases_designed | code_readiness | notes |
|----:|-------|---------------:|----------------|-------|
| 1 | `UC-XBOS-01` | 5 | LIKELY_IMPL | BE: `apps/api/xbos-api/src/app.controller.ts` getHello trả ok + XBOS-HEALTH-200. |
| 2 | `UC-XBOS-02` | 10 | LIKELY_IMPL | BE config-sync publish/apply; FE CC Hạ tầng danh mục. |
| 3 | `UC-XBOS-03` | 6 | LIKELY_IMPL | `config-sync.controller.ts` GET catalog/:catalogKey. |
| 4 | `UC-XBOS-04` | 5 | LIKELY_IMPL | GET catalogs trong config-sync.controller.ts. |
| 5 | `UC-XBOS-05` | 9 | LIKELY_IMPL | POST publish trên config-sync + catalog-governance.controller.ts. |
| 6 | `UC-XBOS-06` | 6 | LIKELY_IMPL | `platform-audit.controller.ts` GET events. |
| 7 | `UC-XBOS-07` | 6 | LIKELY_IMPL | `alerts.controller.ts` violation-ingest. |
| 8 | `UC-XBOS-SYNC-01` | 8 | LIKELY_IMPL | `config-sync.controller.ts` bootstrap-xevn — **không** dùng làm evidence UAT U65 |
| 9 | `UC-XBOS-MET-01` | 5 | LIKELY_IMPL | `app.controller.ts` getMetrics + renderPrometheusMetrics. |
| 10 | `UC-XBOS-08` | 12 | LIKELY_IMPL | business-master.controller.ts GET domains + items CRUD. |
| 11 | `UC-XBOS-KPI-01` | 7 | LIKELY_IMPL | kpi-engine.controller.ts POST evaluate. |
| 12 | `UC-XBOS-KPI-02` | 7 | LIKELY_IMPL | POST evaluate-batch. |
| 13 | `UC-XBOS-KPI-03` | 6 | LIKELY_IMPL | GET rollup · TECHSPEC §14.17 OpenAPI kpiEngineRollup. |
| 14 | `UC-XBOS-KPI-04` | 7 | LIKELY_IMPL | portal-alerts GET/POST trên kpi-engine.controller.ts. |
| 15 | `UC-XBOS-MD-01` | 12 | LIKELY_IMPL | BE `business-master.controller.ts` domain `job_titles`; FE Settings/master theo  |
| 16 | `UC-XBOS-MD-02` | 12 | LIKELY_IMPL | BE `business-master.controller.ts` domain `suppliers`; FE Settings/master theo T |
| 17 | `UC-XBOS-MD-03` | 12 | LIKELY_IMPL | BE `business-master.controller.ts` domain `cost_types`; FE Settings/master theo  |
| 18 | `UC-XBOS-MD-04` | 12 | LIKELY_IMPL | BE `business-master.controller.ts` domain `kpi_metrics`; FE Settings/master theo |
| 19 | `UC-XBOS-MD-05` | 12 | LIKELY_IMPL | BE `business-master.controller.ts` domain `customers`; FE Settings/master theo T |
| 20 | `UC-XBOS-MD-06` | 12 | LIKELY_IMPL | BE `business-master.controller.ts` domain `partners`; FE Settings/master theo TE |
| 21 | `UC-XBOS-MD-07` | 12 | LIKELY_IMPL | BE `business-master.controller.ts` domain `asset_types`; FE Settings/master theo |
| 22 | `UC-XBOS-10` | 10 | LIKELY_IMPL | org-foundation.controller.ts promote endpoints. |
| 23 | `UC-XBOS-11` | 12 | LIKELY_IMPL | position-rbac.controller.ts templates + assignments. |
| 24 | `UC-XBOS-12` | 12 | LIKELY_IMPL | position-rbac grants + conflicts + matrix. |
| 25 | `UC-XBOS-ORG-01` | 10 | LIKELY_IMPL | org-foundation org-units/tree + legal-entities. |
| 26 | `UC-XBOS-ORG-02` | 10 | LIKELY_IMPL | org-units CRUD trên org-foundation.controller.ts. |
| 27 | `UC-XBOS-ORG-03` | 10 | LIKELY_IMPL | PUT legal-entities · vốn dùng vi-VN grouping trên FE. |
| 28 | `UC-XBOS-13` | 12 | LIKELY_IMPL | workflow-engine.controller.ts definitions CRUD. |
| 29 | `UC-XBOS-14` | 14 | LIKELY_IMPL | workflow-engine instances/tasks · inbox catalog-governance. |
| 30 | `UC-XBOS-15` | 10 | LIKELY_IMPL | workflow-engine reporting-routes GET/POST. |
| 31 | `UC-XBOS-WF-01` | 8 | LIKELY_PARTIAL | BE definitions có; FE canvas Bézier — depth UI cần spot thêm. |
| 32 | `UC-XBOS-WF-02` | 6 | LIKELY_IMPL | GET workflow-engine/definitions — versioning depth PARTIAL nếu UI mỏng. |
| 33 | `UC-XBOS-WF-03` | 8 | LIKELY_IMPL | POST instances + instances/start. |
| 34 | `UC-XBOS-WF-04` | 12 | LIKELY_IMPL | tasks/:taskId/complete + catalog-governance approve. |
| 35 | `UC-XBOS-WF-05` | 7 | LIKELY_IMPL | GET instances/:instanceId/detail. |
| 36 | `UC-XBOS-WF-06` | 12 | LIKELY_IMPL | tasks reject + catalog-governance reject · lý do ≥10 ký tự. |
| 37 | `UC-XBOS-16` | 12 | LIKELY_PARTIAL | AR API có list/create/transition; ladder 5 bước kế toán — độ sâu SM cần verify. |
| 38 | `UC-XBOS-AR-01` | 6 | LIKELY_IMPL | asset-request.controller.ts GET list. |
| 39 | `UC-XBOS-AR-02` | 10 | LIKELY_IMPL | POST asset-request.controller.ts. |
| 40 | `UC-XBOS-AR-03` | 10 | LIKELY_IMPL | POST :requestId/transition trên asset-request.controller.ts. |

| | **Σ cases_designed** | **374** | | |

## Handoff

```
ack_status: READY_FOR_SYNTH
work_item_id: PO-UC-TC-W1-S1-XBOS-CORE
uc_count: 40
cases_designed_total: 374
next_owner: pm
```
