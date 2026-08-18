# Test execution log — W1-B-03-TC-CAT-QA-R1

| Field | Value |
|-------|--------|
| **log_id** | `TEL-W1B-03-TC-CAT-QA-R1-20260803` |
| **work_item_id** | `W1-B-03-TC-CAT-QA-R1` |
| **tester** | qa · harness `scripts/qa/w1b-03-tc-cat-qa-browser.mjs` |
| **started_at** | `2026-08-03T14:48:59.027Z` |
| **ended_at** | `2026-08-03T14:49:41.673Z` |
| **environment** | Portal `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` · L0 all 200 |
| **hdsd_sot** | CC Cài đặt → Áp dụng danh mục HRM → HRM `/hr/settings-catalogs` Đồng bộ từ XBOS |
| **spec_ref** | FR-UC-B04 · API_CONTRACT_NEW §2 · slice `DOC-ENT-P0-XBOS-CAT` · J-XBOS-CTRL-01 |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **machine_log** | `docs/qa/evidence/w1b-03-tc-cat-qa-r1-test-log.json` |
| **evidence_narrative** | `docs/qa/evidence/w1b-03-tc-cat-qa-r1.md` |
| **runtime_source** | `docs/qa/evidence/_tmp-w1b-03-tc-cat-qa-r1-runtime.json` |
| **verdict** | **pass** |

**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md` · project `docs/qa/WORLD_STANDARD_TEST_LOG.md`

## Chronological steps

| seq | time (UTC) | action (HDSD) | expected | actual | network | result | attachment |
|-----|------------|---------------|----------|--------|---------|--------|------------|
| 1 | 2026-08-03T14:48:59Z | L0 health | HRM/XBOS/portal 200 | hrm=200 xbos=200 portal=200 | — | pass | — |
| 2 | 2026-08-03T14:49:03.500Z | Case A wrong password | 401 + VI fail | status=401 `XBOS-AUTH-401` stillLogin | POST `/api/xbos/auth/login` → **401** | pass | `screens/w1b-03-tc-cat-qa-r1/A-wrong-password.png` |
| 3 | 2026-08-03T14:49:05.715Z | Login ceo@xe.vn | 2xx → command-center + token | 201 `XBOS-AUTH-200` tokenPresent=true | POST login → **201** | pass | `screens/w1b-03-tc-cat-qa-r1/01-after-login.png` |
| 4 | 2026-08-03T14:49:11.699Z | Open Áp dụng danh mục HRM | Panel visible | panelOk=true token=true | — | pass | `screens/w1b-03-tc-cat-qa-r1/02-apply-panel.png` |
| 5 | 2026-08-03T14:49:15.452Z | Tải lại nguồn tập đoàn | GET catalog 2xx + status_label | 200 `XBOS-CFG-201` v7 items=4 · **status_label=Đang dùng** | GET `/api/xbos/config-sync/catalog/job_titles` → **200** | pass | `screens/w1b-03-tc-cat-qa-r1/03-source-loaded.png` |
| 6 | 2026-08-03T14:49:21.760Z | Áp dụng cho ĐVTV (confirm) | CFG-203 or CFG-204 | 201 `XBOS-CFG-204` appliedCount=1 | POST `…/apply-to-members` → **201** | pass | `screens/w1b-03-tc-cat-qa-r1/04-after-apply.png` |
| 7 | 2026-08-03T14:49:28.004Z | Open `/hr/settings-catalogs` | Pull button | hasPull=true | GET settings-catalogs **200** | pass | `screens/w1b-03-tc-cat-qa-r1/05-hrm-catalogs.png` |
| 8 | 2026-08-03T14:49:37.444Z | Click Đồng bộ + pull contract | HRM-SYNC-200 display-ready | FE click · POST pull **201** `HRM-SYNC-200` v7=pubVer7 · status_label=Đang dùng | POST sync request + pull → **201** | pass | `screens/w1b-03-tc-cat-qa-r1/06-after-pull.png` |
| 9 | 2026-08-03T14:49:37.445Z | GET catalog-sync/:key | HRM-SYNC-201 display-ready | 200 `HRM-SYNC-201` top-level items | GET `/api/hrm/catalog-sync/job_titles` → **200** | pass | — |
| 10 | 2026-08-03T14:49:37.453Z | Picker labels + miss | label visible · miss 404 | `Tổng Giám đốc` · miss **404** `HRM-SYNC-002` | GET miss → **404** | pass | — |
| 11 | 2026-08-03T14:49:41.671Z | F5 persist | catalogs remain | f5Ok=true | GET settings-catalogs **200** | pass | `screens/w1b-03-tc-cat-qa-r1/07-after-f5.png` |

**Click count:** 19 (anti-idle PASS).

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | CASE-A | pass | Wrong pwd → 401 + VI |
| B success HDSD | CASE-B | pass | AC1–4 including XBOS status_label |
| C logic BR | CASE-C-F5 | pass | F5 catalogs persist |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| R-CAT-XBOS-STATUS-LABEL | P0 | GET items include `status_label` | **CLOSED** — `Đang dùng` / `success` | — |
| R-CAT-PICKER-LABEL | P2 | picker status_label from BE | FE may still map status locally | defer |
| OBS-SYNC-RESP-CAPTURE | P3 | sync-from-xbos response envelope in Network | request-phase only sometimes; pull contract captured | qa note |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 11 | 0 | 0 | 0 |

**ack_status (source wave):** PASS_TO_PM
