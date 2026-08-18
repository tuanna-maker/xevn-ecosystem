# Test execution log — W1-B-04-AUTH-FE-QA-RET3

| Field | Value |
|-------|--------|
| **log_id** | `TEL-W1B-04-AUTH-FE-RET3-20260803` |
| **work_item_id** | `W1-B-04-AUTH-FE-QA-RET3` |
| **tester** | qa · harness `scripts/qa/w1b-04-auth-fe-qa-ret3-cases-browser.mjs` |
| **started_at** | `2026-08-03T13:48:07.544Z` |
| **ended_at** | `2026-08-03T13:48:48.780Z` |
| **environment** | Portal `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` · L0 all 200 · App.tsx 200 · CommandCenterPage 200 |
| **hdsd_sot** | Portal login → fail msg → membership labels → select → F5 |
| **spec_ref** | FR-UC-M01 · API_CONTRACT §8.1–8.3 · slice `DOC-ENT-P0-AUTH-M01` |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **machine_log** | `docs/qa/evidence/w1b-04-auth-fe-qa-ret3-test-log.json` |
| **evidence_narrative** | `docs/qa/evidence/w1b-04-auth-fe-qa-ret3.md` |
| **runtime_source** | `docs/qa/evidence/_tmp-w1b-04-auth-fe-qa-ret3-runtime.json` |
| **verdict** | **fail** |

**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md` · project `docs/qa/WORLD_STANDARD_TEST_LOG.md`

## Chronological steps

| seq | time (UTC) | action (HDSD) | expected | actual | network | result | attachment |
|-----|------------|---------------|----------|--------|---------|--------|------------|
| 1 | 2026-08-03T13:48:07.544Z | L0 health probe | HRM/XBOS/portal 200; App.tsx + CommandCenterPage 200 | hrm=200 xbos=200 portal=200 App.tsx=200 CommandCenterPage=200 | — | pass | — |
| 2 | 2026-08-03T13:48:07.911Z | assert-login-form-visible | Login form email+password visible | Form visible; login form visible=true; body="XeVN Portal Đăng nhập tập đoàn / công ty thành viên Email Mật khẩu Đăng nhập Dev: du-lich | — | pass | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret3/00-login-form.png` |
| 3 | 2026-08-03T13:48:08.887Z | goto-login-clear (Case A) | Navigate /login clear | URL /login | — | pass | — |
| 4 | 2026-08-03T13:48:09.520Z | fill-email Case A | Email ceo@xe.vn filled | filled | — | pass | — |
| 5 | 2026-08-03T13:48:09.582Z | fill-password Case A | Wrong password entered | passwordLen=25 | — | pass | — |
| 6 | 2026-08-03T13:48:09.617Z | click-submit-login Case A | Submit wrong credentials; API 401 | click fired; login rejected | POST `/api/xbos/auth/login` → **401** `XBOS-AUTH-401` @ 2026-08-03T13:48:09.661Z | pass | — |
| 7 | 2026-08-03T13:48:12.517Z | Case A assert fail UX | Stay /login + VI fail message | «Email hoặc mật khẩu không đúng»; stillLogin=true | POST `/api/xbos/auth/login` → **401** `XBOS-AUTH-401` @ 2026-08-03T13:48:09.661Z | pass | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret3/A-wrong-password.png` |
| 8 | 2026-08-03T13:48:12.518Z | goto-login-clear (Case B ceo) | Fresh login for success path | /login | — | pass | — |
| 9 | 2026-08-03T13:48:13.147Z | fill-email Case B | ceo@xe.vn | filled | — | pass | — |
| 10 | 2026-08-03T13:48:13.192Z | fill-password Case B | Correct password | passwordLen=9 | — | pass | — |
| 11 | 2026-08-03T13:48:13.232Z | click-submit-login Case B | Login 2xx + TopHeader membership BE *_label; no Vite overlay | Login 201/XBOS-AUTH-200; BE labels OK in Network; viteOverlay=false; URL /command-center; UI mode=missing (no portal-membership-*); CC hero BOD/Quản lý/Nhân viên ≠ *_label | POST `/api/xbos/auth/login` → **201** `XBOS-AUTH-200` @ 2026-08-03T13:48:13.291Z | fail | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret3/B-ceo-after-login.png` |
| 12 | 2026-08-03T13:48:29.373Z | post-login Command Center + membership chip | /command-center without Vite overlay; chip shows tenant_label/company_label/role_label | CC mounted; overlay=false; failedSrc=0; portal-membership-switcher/static absent; ExecutiveDashboardLayout has no TopHeader | — | fail | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret3/B-ceo-after-login.png` |
| 13 | 2026-08-03T13:48:29.374Z | goto-login-clear (admin multi-mem) | Retry with multi-membership user | /login | — | pass | — |
| 14 | 2026-08-03T13:48:30.025Z | fill-email admin | admin@xe.vn | filled | — | pass | — |
| 15 | 2026-08-03T13:48:30.082Z | fill-password admin | Correct password | filled | — | pass | — |
| 16 | 2026-08-03T13:48:30.120Z | click-submit-login admin | Picker openable; select-membership Network | Login 201; 5 memberships with *_label; switcher not in DOM; no POST select-membership | POST `/api/xbos/auth/login` → **201** `XBOS-AUTH-200` @ 2026-08-03T13:48:30.171Z | fail | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret3/B-admin-after-login.png` |
| 17 | 2026-08-03T13:48:46.249Z | Case B select-membership AC | Click other membership → select-membership 2xx + mid update | path=blocked-no-switcher; session mid present; select UI unreachable | — | blocked | — |
| 18 | 2026-08-03T13:48:46.250Z | reload-F5 Case C | Labels persist after F5 | F5 mid=4382b3d5-3c4a-42fa-a056-fafce0799d07 mode=missing overlay=false raw=false ui="" | GET `/api/xbos/auth/me` → **200** `XBOS-AUTH-200` @ 2026-08-03T13:48:46.337Z | fail | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret3/C-after-f5.png` |

**Click count:** 14 (anti-idle PASS). **No** `POST /auth/select-membership` observed. **failedSrc:** 0 · **viteOverlay:** false.

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| Form | FORM | pass | Login page email+password · `00-login-form.png` |
| A fail deep | CASE-A | pass | Wrong pwd → 401 + VI message · stay `/login` |
| B success HDSD | CASE-B-AC1-labels | fail | BE `*_label` in Network; CC no overlay; TopHeader `portal-membership-*` **missing** (shell = ExecutiveDashboardLayout) |
| B select | CASE-B-AC2-membershipId | blocked | admin 5 mem; select UI unreachable; no select Network |
| C logic BR | CASE-C-F5 | fail | F5 keeps JWT mid; labels not on UI |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| R-AUTH-FE-VITE-CC-PAGE | closed | CC Vite 200 / no overlay | **CLOSED** this wave | — |
| R-AUTH-FE-CC-MEMBERSHIP-CHIP | P0 | TopHeader membership BE `*_label` on `/command-center` | Layout has no TopHeader; hero BOD/Quản lý/Nhân viên only | W1-B-04-AUTH-FE-CC-CHIP-01 |
| R-AUTH-FE-SELECT-MEMBERSHIP-UI | P0 | Multi-mem select click + Network | Switcher absent | W1-B-04-AUTH-FE-CC-CHIP-01 |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 13 | 4 | 1 | 0 |

**ack_status (source wave):** FAIL
