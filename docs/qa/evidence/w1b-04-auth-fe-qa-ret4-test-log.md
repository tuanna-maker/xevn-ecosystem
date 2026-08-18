# Test execution log — W1-B-04-AUTH-FE-QA-RET4

| Field | Value |
|-------|--------|
| **log_id** | `TEL-W1B-04-AUTH-FE-RET4-20260803` |
| **work_item_id** | `W1-B-04-AUTH-FE-QA-RET4` |
| **tester** | qa · harness `scripts/qa/w1b-04-auth-fe-qa-ret4-cases-browser.mjs` |
| **started_at** | `2026-08-03T13:56:44.926Z` |
| **ended_at** | `2026-08-03T13:57:05.513Z` |
| **environment** | Portal `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` · L0 all 200 · App/CC/TopHeader/ExecLayout 200 |
| **hdsd_sot** | Portal login → fail msg → CC membership labels → select → F5 |
| **spec_ref** | FR-UC-M01 · API_CONTRACT §8.1–8.3 · slice `DOC-ENT-P0-AUTH-M01` |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **machine_log** | `docs/qa/evidence/w1b-04-auth-fe-qa-ret4-test-log.json` |
| **evidence_narrative** | `docs/qa/evidence/w1b-04-auth-fe-qa-ret4.md` |
| **runtime_source** | `docs/qa/evidence/_tmp-w1b-04-auth-fe-qa-ret4-runtime.json` |
| **verdict** | **pass** |

**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md` · project `docs/qa/WORLD_STANDARD_TEST_LOG.md`

## Chronological steps

| seq | time (UTC) | action (HDSD) | expected | actual | network | result | attachment |
|-----|------------|---------------|----------|--------|---------|--------|------------|
| 1 | 2026-08-03T13:56:44.981Z | L0 health probe | HRM/XBOS/portal 200; App + CC + TopHeader + ExecLayout 200 | hrm=200 xbos=200 portal=200 App=200 CC=200 TopHeader=200 ExecLayout=200 | — | pass | — |
| 2 | 2026-08-03T13:56:45.448Z | assert-login-form-visible | Login form email+password visible | Form visible; body includes «Đăng nhập» | — | pass | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret4/00-login-form.png` |
| 3 | 2026-08-03T13:56:46.394Z | goto-login-clear (Case A) | Navigate /login clear | URL /login | — | pass | — |
| 4 | 2026-08-03T13:56:47.023Z | fill-email Case A | Email ceo@xe.vn filled | filled | — | pass | — |
| 5 | 2026-08-03T13:56:47.097Z | fill-password Case A | Wrong password entered | passwordLen=25 | — | pass | — |
| 6 | 2026-08-03T13:56:47.125Z | click-submit-login Case A | Submit wrong credentials; API 401 | click fired; login rejected | POST `/api/xbos/auth/login` → **401** `XBOS-AUTH-401` @ 2026-08-03T13:56:47.171Z | pass | — |
| 7 | 2026-08-03T13:56:50.033Z | Case A assert fail UX | Stay /login + VI fail message | «Email hoặc mật khẩu không đúng»; stillLogin=true | POST `/api/xbos/auth/login` → **401** | pass | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret4/A-wrong-password.png` |
| 8 | 2026-08-03T13:56:50.034Z | goto-login-clear (Case B ceo) | Fresh login for success path | /login | — | pass | — |
| 9 | 2026-08-03T13:56:50.673Z | fill-email Case B | ceo@xe.vn | filled | — | pass | — |
| 10 | 2026-08-03T13:56:50.716Z | fill-password Case B | Correct password | passwordLen=9 | — | pass | — |
| 11 | 2026-08-03T13:56:50.752Z | click-submit-login Case B | Login 2xx → /command-center; chip BE *_label; no Vite overlay | Login 201; onCC=true; mode=static; tenant+company+role match BE; overlay=false; raw=false | POST `/api/xbos/auth/login` → **201** `XBOS-AUTH-200` @ 2026-08-03T13:56:50.814Z | pass | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret4/B-ceo-after-login.png` |
| 12 | 2026-08-03T13:56:54.885Z | Case B AC1 labels assert | portal-membership-* shows BE tenant/company/role | UI «Tập đoàn XeVN · Công ty chính · CEO Tập đoàn» on `/command-center` | — | pass | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret4/B-ceo-after-login.png` |
| 13 | 2026-08-03T13:56:54.886Z | goto-login-clear (admin multi-mem) | Multi-membership user for select | /login | — | pass | — |
| 14 | 2026-08-03T13:56:55.540Z | fill-email admin | admin@xe.vn | filled | — | pass | — |
| 15 | 2026-08-03T13:56:55.601Z | fill-password admin | Correct password | filled | — | pass | — |
| 16 | 2026-08-03T13:56:55.636Z | click-submit-login admin | Login 2xx; switcher on CC | Login 201; 5 memberships; mode=switcher on /command-center | POST `/api/xbos/auth/login` → **201** `XBOS-AUTH-200` @ 2026-08-03T13:56:55.686Z | pass | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret4/B-admin-after-login.png` |
| 17 | 2026-08-03T13:56:59.757Z | open-membership-switcher | Picker shows BE labels | items=5; raw=false | — | pass | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret4/B-admin-picker.png` |
| 18 | 2026-08-03T13:57:00.401Z | click-other-membership | POST select-membership 2xx + mid | Selected xe-tmdv; mid=`0b7f492e-…` | POST `/api/xbos/auth/select-membership` → **201** `XBOS-AUTH-201` @ 2026-08-03T13:57:00.420Z | pass | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret4/B-admin-after-select.png` |
| 19 | 2026-08-03T13:57:03.010Z | Case B AC4 vite | Overlay closed; no failedSrc | viteOverlay=false failedSrc=0 | — | pass | — |
| 20 | 2026-08-03T13:57:03.011Z | reload-F5 Case C | Labels + mid persist | onCC; mode=switcher; selected tenant/role visible; mid=`0b7f492e-…` | GET `/api/xbos/auth/me` → **200** @ 2026-08-03T13:57:03.092Z | pass | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret4/C-after-f5.png` |

**Click count:** 16 (anti-idle PASS). **POST select-membership:** observed **201**. **failedSrc:** 0 · **viteOverlay:** false.

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| Form | FORM | pass | Login page email+password |
| A fail deep | CASE-A | pass | Wrong pwd → 401 + VI message · stay `/login` |
| B success HDSD | CASE-B-AC1-labels | pass | CC chip `portal-membership-static` binds BE `*_label` |
| B select | CASE-B-AC2-select-membership | pass | admin switcher → POST select-membership **201** + mid |
| B vite | CASE-B-AC4-vite | pass | overlay closed · failedSrc=0 |
| C logic BR | CASE-C-F5 | pass | F5 keeps mid + selected membership labels |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| R-AUTH-FE-CC-MEMBERSHIP-CHIP | closed | TopHeader chip BE `*_label` on `/command-center` | **CLOSED** — static chip shows tenant/company/role | — |
| R-AUTH-FE-SELECT-MEMBERSHIP-UI | closed | Multi-mem select + Network | **CLOSED** — POST 201 | — |
| OBS-CC-CATALOG-INBOX-409 | P2 | (out of AUTH AC) | Console 409 catalog-governance inbox vs token scope | optional follow-up |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 20 | 0 | 0 | 0 |

**ack_status (source wave):** PASS_TO_PM
