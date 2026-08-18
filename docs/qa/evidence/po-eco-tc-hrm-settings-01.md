# Evidence — PO-ECO-TC-HRM-SETTINGS-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-ECO-TC-HRM-SETTINGS-01` |
| **role** | qa |
| **date** | 2026-08-03 |
| **deliverable** | `docs/qa/testcases/hrm-web/HRM-SETTINGS.md` |
| **ack_status** | `READY_FOR_SYNTH` |
| **u65_zero_seed** | true (pack policy; no execution this wave) |
| **hdsd_align** | partial — delta Cài đặt + prior UF evidence cites |

## Summary counts (inventory)

| Artifact | Count | Notes |
|----------|------:|-------|
| Routes | 3 | `/settings` · `/settings-catalogs` · `/employee-metadata` |
| Settings tabs | 9 | account … master-data |
| MD bucket panels | 14 | `MD_BUCKET_ORDER` in `mdBucketRegistry.ts` |
| Dialogs | 1 | Subscription upgrade |
| **Fields (dictionary rows)** | **86** | incl. 14×2 MD code/label pattern |
| **Functions (inventory rows)** | **56** | incl. per-bucket MD load/add |
| **Test cases (matrix rows)** | **76** | PLANNED — chưa browser execution |

## Coverage gate (pack self-check)

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| UF-HRM-10 catalog mutate fns ≥1 HP+FD | 5 | 5 | 0 |
| UF-HRM-11 metadata fns ≥1 HP+FD | 5 | 5 | 0 |
| MD bucket HP add | 14 | 14 | 0 |
| Dialog open/submit/cancel | 1 | 1 | 0 |
| Required ext/metadata fields FD | 8 | 8 | 0 |

## Spec read ack

| Source | Path | Sections used |
|--------|------|----------------|
| Program | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` | §2 DoD |
| Template | `docs/qa/testcases/_TEMPLATE_MENU_TC_PACK.md` | full structure |
| Roster | `docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md` | MENU-17 · HRM-SETTINGS* |
| SRS | `docs/hrm/SRS.md` | §13 UC-HRM-26 · HRM-SC-* |
| TechSpec | `docs/hrm/TECHSPEC.md` | §14.8 FR-HRM-SC-01 |
| UF matrix | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` | UF-HRM-10/11 · MENU-17 |
| FE | `Settings.tsx` · `SettingsCatalogsTab.tsx` · `SettingsCatalogsPage.tsx` · `MetadataQueueTab.tsx` · `EmployeeMetadataPage.tsx` · `BrandingSettings.tsx` · `RolesPermissionsTab.tsx` · `SubscriptionManagement.tsx` |
| FE registry | `apps/web/hrm/src/lib/mdBucketRegistry.ts` | 14 buckets · writeKeys |
| API | `settings-catalogs.controller.ts` · `hrmApi.ts` settings-catalogs + employee-metadata |
| Prior UF evidence | `d-hrm-set-item-persist-01-qa-retest-20260717.md` · `w1b-03-tc-cat-qc-r1.md` · `p1-browser-e2e-hrm-wave-8088-r4-20260620.md` |

## Residual / BUILD_GAP

| ID | Item | Status |
|----|------|--------|
| **BUILD_GAP-MD-PANEL-01** | Restored + browser mount **CLOSED** 2026-08-03 — FE `build-gap-md-panel-01.md` · QA [`build-gap-md-panel-01-qa.md`](./build-gap-md-panel-01-qa.md) (tab Danh mục nghiệp vụ · catalogs GET 200) | Full **TC-SET-MD** mutate still PLANNED (not this mount gate) |
| STUB-SETTINGS-ACCOUNT | Account/Security/Notification Lưu chưa wire API | TC §4.7 STUB |
| UF-HRM-MENU-17 P3 | Metadata workflow label — covered TC-SET-N-FD-006 / TC-SET-M-UX-009 | QC GWC historical |

## Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-hrm-settings-01.md
next_owner: qa-synth
counts: screens=33 fields=86 functions=56 tcs=76
completion_report: WORLD-STANDARD menu pack HRM Settings + settings-catalogs + employee-metadata (UF-HRM-10/11 · MENU-17) — inventories + 76 TC matrix; UF core coverage GAP 0; BUILD_GAP MasterDataSettingsPanel file missing documented.
next_dispatch_prompt: qa-synth — Merge TC-SET-* into ecosystem rollup `docs/qa/reports/PO_SPEC_TEST_REPORT.md` §Ecosystem depth; dedupe vs TC-X-03 UF-HRM-10; flag BUILD_GAP-MD-PANEL-01 to dev-fe before MD browser wave; optional PO-ECO-TC-EXEC-SETTINGS-01 browser U65 after panel restore.
```
