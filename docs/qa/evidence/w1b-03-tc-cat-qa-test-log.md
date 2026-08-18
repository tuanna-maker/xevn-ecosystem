# Test execution log — W1-B-03-TC-CAT-QA

| Field | Value |
|-------|--------|
| **log_id** | `TEL-W1B-03-TC-CAT-QA-20260803` |
| **work_item_id** | `W1-B-03-TC-CAT-QA` |
| **tester** | qa · harness `scripts/qa/w1b-03-tc-cat-qa-browser.mjs` |
| **started_at** | `2026-08-03T14:31:27.000Z` |
| **ended_at** | `2026-08-03T14:32:04.668Z` |
| **environment** | Portal `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` · L0 all 200 |
| **hdsd_sot** | CC Cài đặt → Áp dụng danh mục HRM → HRM `/hr/settings-catalogs` Đồng bộ từ XBOS |
| **spec_ref** | FR-UC-B04 · API_CONTRACT_NEW §2 · slice `DOC-ENT-P0-XBOS-CAT` · J-XBOS-CTRL-01 |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **machine_log** | `docs/qa/evidence/w1b-03-tc-cat-qa-test-log.json` |
| **evidence_narrative** | `docs/qa/evidence/w1b-03-tc-cat-qa.md` |
| **runtime_source** | `docs/qa/evidence/_tmp-w1b-03-tc-cat-qa-runtime.json` |
| **verdict** | **fail** |

**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md` · project `docs/qa/WORLD_STANDARD_TEST_LOG.md`

## Chronological steps

| seq | time (UTC) | action (HDSD) | expected | actual | network | result | attachment |
|-----|------------|---------------|----------|--------|---------|--------|------------|
| 1 | 2026-08-03T14:31:27Z | L0 health | HRM/XBOS/portal 200 | hrm=200 xbos=200 portal=200 | — | pass | — |
| 2 | 2026-08-03T14:31:27.920Z | Case A wrong password | 401 + VI fail | status=401 `XBOS-AUTH-401` stillLogin | POST `/api/xbos/auth/login` → **401** | pass | `screens/w1b-03-tc-cat-qa/A-wrong-password.png` |
| 3 | 2026-08-03T14:31:30.880Z | Login ceo@xe.vn | 2xx → command-center | 201 `XBOS-AUTH-200` on CC | POST login → **201** | pass | `screens/w1b-03-tc-cat-qa/01-after-login.png` |
| 4 | 2026-08-03T14:31:35.025Z | Open Áp dụng danh mục HRM | Panel visible | panelOk=true | — | pass | `screens/w1b-03-tc-cat-qa/02-apply-panel.png` |
| 5 | 2026-08-03T14:31:38.655Z | Tải lại nguồn tập đoàn | GET catalog 2xx + status_label | 200 `XBOS-CFG-201` v7 items=4 · **status_label missing** | GET `/api/xbos/config-sync/catalog/job_titles` → **200** | fail | `screens/w1b-03-tc-cat-qa/03-source-loaded.png` |
| 6 | 2026-08-03T14:31:43.052Z | Áp dụng cho ĐVTV (confirm) | CFG-203 or CFG-204 | 201 `XBOS-CFG-204` appliedCount=1 | POST `…/apply-to-members` → **201** | pass | `screens/w1b-03-tc-cat-qa/04-after-apply.png` |
| 7 | 2026-08-03T14:31:47.912Z | Open `/hr/settings-catalogs` | Pull button | hasPull=true | GET settings-catalogs **200** | pass | `screens/w1b-03-tc-cat-qa/05-hrm-catalogs.png` |
| 8 | 2026-08-03T14:31:52.051Z | Click Đồng bộ từ XBOS | POST sync-from-xbos | request observed | POST `/api/hrm/settings-catalogs/sync-from-xbos` (request) | pass | — |
| 9 | 2026-08-03T14:32:00.837Z | Pull contract HRM-SYNC-200 | top-level items + published_version | 201 `HRM-SYNC-200` v7=pubVer7 · status_label=Đang dùng | POST `/api/hrm/catalog-sync/pull/job_titles` → **201** | pass | — |
| 10 | 2026-08-03T14:32:00.9Z | GET catalog-sync/:key | HRM-SYNC-201 display-ready | 200 `HRM-SYNC-201` top-level items | GET `/api/hrm/catalog-sync/job_titles` → **200** | pass | — |
| 11 | 2026-08-03T14:32:00.9Z | Picker labels + miss | label visible · miss 404 | `Tổng Giám đốc` visible · miss **404** `HRM-SYNC-002` | GET miss → **404** | pass | `screens/w1b-03-tc-cat-qa/06-after-pull.png` |
| 12 | 2026-08-03T14:32:01.085Z | F5 persist | catalogs remain | f5Ok=true | GET settings-catalogs **200** | pass | `screens/w1b-03-tc-cat-qa/07-after-f5.png` |

**Click count:** 18 (anti-idle PASS).

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | CASE-A | pass | Wrong pwd → 401 + VI |
| B success HDSD | CASE-B | fail | AC1 XBOS status_label missing; AC2–4 otherwise pass |
| C logic BR | CASE-C-F5 | pass | F5 catalogs persist |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| R-CAT-XBOS-STATUS-LABEL | P0 | GET/publish items include `status_label` | Live GET items bare (`status` only) | `W1-B-03-TC-CAT-XBOS-LABEL-01` |
| R-CAT-PICKER-LABEL | P2 | picker status_label from BE | FE may still map status locally | defer |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 11 | 1 | 0 | 0 |

**ack_status (source wave):** FAIL_TO_PM
