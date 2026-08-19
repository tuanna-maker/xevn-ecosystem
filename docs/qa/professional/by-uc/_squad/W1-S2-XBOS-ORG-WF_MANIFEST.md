# Manifest — W1-S2-XBOS-ORG-WF

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W1-S2-XBOS-ORG-WF` |
| **squad** | W1-S2-XBOS-ORG-WF |
| **stt_range** | 41–80 |
| **uc_count** | 40 |
| **cases_designed_sum** | **267** |
| **design_status** | DESIGNED (not UAT) |
| **ack_status** | READY_FOR_SYNTH |
| **author** | ba-process |
| **generated** | 2026-08-04 |

## Inventory

| stt | uc_id | cases_designed | code_readiness | notes |
|----:|-------|---------------:|----------------|-------|
| 41 | `UC-XBOS-AST-01` | 11 | `LIKELY_IMPL` | AssetsController create/list tồn tại; FE portal surface có thể mỏng so với API — verify menu trước UAT. |
| 42 | `UC-XBOS-AST-02` | 8 | `LIKELY_IMPL` | PATCH updateAsset + status transition trong AssetsService; FE lifecycle UI cần xác nhận menu. |
| 43 | `UC-XBOS-AUTH-01` | 8 | `LIKELY_IMPL` | AuthController.login + portal login form; UF-XBOS-01 🟢 design reference — không claim re-UAT. |
| 44 | `UC-XBOS-AUTH-02` | 5 | `LIKELY_IMPL` | AuthController.me đọc JWT sub/email. |
| 45 | `UC-XBOS-TENANT-01` | 6 | `LIKELY_IMPL` | TenantScopeController.accessible. |
| 46 | `UC-XBOS-TENANT-02` | 4 | `LIKELY_IMPL` | groupOrgOverview; member expect thu hẹp / 403 tùy service. |
| 47 | `UC-XBOS-TENANT-03` | 5 | `LIKELY_IMPL` | groupMemberUnits + FE list member units UF-XBOS-02. |
| 48 | `UC-ECO-SCOPE-01` | 4 | `LIKELY_IMPL` | Portal route guard + API auth; pattern e2e_pass trên matrix. |
| 49 | `UC-ECO-SCOPE-02` | 6 | `LIKELY_IMPL` | Scope header must match JWT; membership switch. |
| 50 | `UC-CC-P0-01` | 12 | `LIKELY_IMPL` | legal-entity-profile.controller shareholders CRUD; UF-XBOS-05 holding 🟢 reference. |
| 51 | `UC-CC-P0-02` | 8 | `LIKELY_IMPL` | documents + upload + file GET; UF-XBOS-06 reference. |
| 52 | `UC-CC-P0-03` | 10 | `LIKELY_IMPL` | org-foundation org-units; UF-XBOS-12 🟢 reference. |
| 53 | `UC-CC-P0-04` | 7 | `LIKELY_IMPL` | position-rbac.controller; UF-XBOS-13 🟢. |
| 54 | `UC-CC-P0-05` | 6 | `LIKELY_IMPL` | business-master domain command_center_catalogs; UF-XBOS-14. |
| 55 | `UC-CC-P0-06` | 18 | `LIKELY_IMPL` | workflow-engine complete/reject + CC inbox FE; UF-XBOS-08; BR-WF-04 self-approve unit tests. |
| 56 | `UC-CC-P0-08` | 5 | `LIKELY_PARTIAL` | Command-center controller + FE widgets; một phần pattern API trên matrix. |
| 57 | `UC-CC-P0-09` | 5 | `LIKELY_PARTIAL` | Policy sản phẩm: empty/error vs mock; cần spot FE flags — design cases bắt buộc honest UI. |
| 58 | `UC-CC-01` | 6 | `LIKELY_IMPL` | org-foundation.controller.spec UC-CC-01; overlap P0-03 — cases tập trung per-LE switch. |
| 59 | `UC-CC-03` | 5 | `LIKELY_IMPL` | Detail LE + tabs cổ đông/RACI/docs; UF-XBOS-02/03. |
| 60 | `UC-CC-04` | 6 | `LIKELY_IMPL` | UF-XBOS-03 PUT 200 + F5. |
| 61 | `UC-XBOS-CC-05` | 6 | `LIKELY_PARTIAL` | Widgets CC; KPI series[] empty hợp lệ; member 409 holding. |
| 62 | `UC-XBOS-CC-06` | 15 | `LIKELY_IMPL` | Canvas save → definition; có thể spawn inbox (UF-XBOS-08 path). |
| 63 | `UC-XBOS-CC-07` | 5 | `LIKELY_PARTIAL` | infrastructure.controller + config-sync; FE Hạ tầng menu. |
| 64 | `UC-XBOS-CC-08` | 5 | `LIKELY_PARTIAL` | business-master dept_system_templates; org-foundation.spec UC-XBOS-CC-08. |
| 65 | `UC-RACI-01` | 4 | `LIKELY_IMPL` | raci-governance.controller catalog. |
| 66 | `UC-RACI-02` | 9 | `LIKELY_IMPL` | UF-XBOS-07 PUT cell sticky F5. |
| 67 | `UC-RACI-03` | 5 | `LIKELY_IMPL` | listCapabilities. |
| 68 | `UC-RACI-04` | 6 | `LIKELY_PARTIAL` | Gán cột qua org_column_id; FE picker chức danh có thể PARTIAL. |
| 69 | `UC-RACI-05` | 6 | `LIKELY_PARTIAL` | listCatalog có version; import/bump UI có thể GAP — cases ghi SPEC_GAP nếu thiếu endpoint. |
| 70 | `UC-RACI-06` | 5 | `LIKELY_IMPL` | getCoverage trên controller. |
| 71 | `UC-XBOS-DASH-01` | 5 | `LIKELY_PARTIAL` | kpi-engine controller; series[] empty OK; UF-XBOS-10. |
| 72 | `UC-XBOS-DASH-02` | 5 | `LIKELY_PARTIAL` | Per-company KPI table; scope parity list↔detail. |
| 73 | `UC-XBOS-DASH-03` | 6 | `LIKELY_PARTIAL` | Policy KPI có thể mỏng vs master MD-04 — design cases bắt buộc HP+FD. |
| 74 | `UC-XBOS-INF-01` | 6 | `LIKELY_IMPL` | infrastructure.controller tồn tại. |
| 75 | `UC-XBOS-INF-02` | 6 | `LIKELY_PARTIAL` | Metadata template per LE — verify FE surface. |
| 76 | `UC-XBOS-INF-03` | 4 | `LIKELY_PARTIAL` | Summary read — pattern API. |
| 77 | `XBOS-DM-01` | 5 | `LIKELY_IMPL` | config-sync list catalogs; FE DM overview. |
| 78 | `XBOS-DM-02` | 6 | `LIKELY_PARTIAL` | Tạo nhóm — một phần pattern; verify endpoint cụ thể trước UAT. |
| 79 | `XBOS-DM-03` | 6 | `LIKELY_IMPL` | Items create paths trên config-sync/business-master; UF catalog related. |
| 80 | `XBOS-DM-04` | 7 | `LIKELY_IMPL` | Update item; nhạy cảm có thể yêu cầu approve (DM-12) — FD ghi rõ. |

## Sum

| Metric | Value |
|--------|------:|
| UC files | 40 |
| **cases_designed Σ** | **267** |
| LIKELY_IMPL | 27 |
| LIKELY_PARTIAL | 13 |
| GAP / UNKNOWN | 0 |

## WF depth note

- `UC-CC-P0-06` · `UC-XBOS-CC-06` · liên quan approve: có **self-approve FD** + **scope AU** + cite `POST …/tasks/:id/complete|reject` · `API_CONTRACT_VN` approve/reject · `srs_new` map WF 2-level.
- U65: inbox empty = không seed.

## Handoff

```
ack_status: READY_FOR_SYNTH
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
next_owner: pm
evidence_path: docs/qa/professional/by-uc/_squad/W1-S2-XBOS-ORG-WF_MANIFEST.md
uat_done: false
```
