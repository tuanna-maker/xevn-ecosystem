# Slice — DOC-ENT-P0-XBOS-CAT

| Field | Value |
| --- | --- |
| **Story** | DOC-ENT-P0-XBOS-CAT |
| **Epic / lane** | DOC-ENT P0 · XBOS catalog → HRM pull |
| **Owner** | W1-B: Team Claude → Cursor review |
| **UC / FR** | **FR-UC-B04** · UC-B04 |
| **AC** | Diễn biến #3–6 · platform no hard-delete |
| **Flow test** | Publish → apply-to-members → HRM pull → picker đọc synced |
| **change_mode** | UPGRADE |
| **work_item_id** | W1-B-03-TC-CAT |
| **status** | ACTIVE · BE READY_FOR_QA (2026-08-03) |
| **W1-B priority** | **P0-2** (trước picker HRM phụ thuộc catalog) |

## spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_NEW.md v1.1 §3.2 · FR-UC-B04
- tech_spec: TECH_SPEC_NEW.md v1.1 · catalog ownership XBOS→HRM
- db_design: DB_DESIGN_NEW.md §3.7 + synced_catalogs — config_catalogs, config_catalog_items, synced_catalogs
- api_design: API_CONTRACT_NEW.md v1.1 §2
- slice: docs/program/slices/DOC-ENT-P0-XBOS-CAT.md
- change_mode: UPGRADE
```

## A. Spec / docs

| Path | Delta | Neo |
| --- | --- | --- |
| API_CONTRACT §2 · DB_DESIGN §3.7 | READ | physical SoT |
| This slice | ADD | DOC-DELTA 2026-08-03 |

## B. Code paths (proposed)

| Layer | Path | Neo tag | must_keep | Owner |
| --- | --- | --- | --- | --- |
| BE XBOS publish | `apps/api/xbos-api/src/config-sync/**` | @CODE-MEMORY | version/checksum; cấm hard-delete platform | dev-be |
| BE XBOS catalog gov (touch only if) | `apps/api/xbos-api/src/catalog-governance/**` | @CODE-MEMORY | bus Touch-only-if | shared |
| BE HRM pull | `apps/api/hrm-api/src/catalog-sync/**` | @CODE-MEMORY | upsert synced_catalogs; empty trung thực | dev-be |
| FE settings catalogs | `apps/web/web-portal/src/pages/settings/**` (Positions/Departments/…) · `…/integrations/catalogGovernanceApi.ts` | @CODE-MEMORY | publish/apply UI; không mock platform | dev-fe |
| FE HRM consumer | `apps/web/hrm/src/pages/SettingsCatalogsPage.tsx` · related hooks | @CODE-MEMORY | pull/read picker | dev-fe |

### API endpoints

| Method | Path |
| --- | --- |
| POST | `/api/xbos/config-sync/catalog/:catalogKey/publish` |
| POST | `/api/xbos/config-sync/catalog/:catalogKey/apply-to-members` |
| POST | `/api/hrm/catalog-sync/pull/:catalogKey` |
| GET | `/api/hrm/catalog-sync/:catalogKey` · `/api/hrm/catalog-sync` |

### Tables

`config_catalogs` · `config_catalog_items` · `synced_catalogs`

## C. Ops

| Path | Neo | Note |
| --- | --- | --- |
| — | — | No new deploy for W1-A |

## D. Forbidden

- Hard-delete platform catalog rows
- HRM invent platform SoT (XBOS remains publisher)
- Expand apply-to-members family ngoài allow-list mà không BA/SA delta
- apps/** ngoài B · rewrite NEW docs

## E. Residual

| id | Mô tả | ack |
| --- | --- | --- |
| R-CAT-PULL-ENVELOPE | Pull success = `HRM-SYNC-200` (not HRM-SET-201) — confirmed BE | **CLOSED** w1b-03-tc-cat |
| R-CAT-ALLOWLIST | apply-to-members family allow-list parity vs control gap | OPEN (SA prior) |
| R-CAT-PICKER-LABEL | settings-catalogs picker thiếu status_label (ngoài slice B) | OPEN P2 |

## F. Verify (W1-B)

- [x] BE display-ready pull/list/get + XBOS item status_label (jest 21+30)
- [ ] Publish tăng version · pull HRM thấy payload — **QA U65 browser**
- [x] Miss key → empty/404 trung thực — không mock (must_keep)
- [x] diff ⊆ slice (config-sync + catalog-sync + evidence)

## Team Claude note

```text
Cross-service: xbos-api publish + hrm-api pull. Prefer BE-first wave then FE wire.
read_first: 28-FE-BE-SEPARATION-DISPLAY-READY.md (name override until C-OS-29-NAME-01).
Display-ready: catalog item label/code/status from BE payload — FE không join raw XBOS+HRM.
```
