# Test execution log — W1-B-04-AUTH-FE-QA-RET2

| Field | Value |
|-------|--------|
| **log_id** | `TEL-W1B-04-AUTH-FE-RET2-20260803` |
| **work_item_id** | `W1-B-04-AUTH-FE-QA-RET2` |
| **tester** | qa · harness `scripts/qa/w1b-04-auth-fe-qa-ret2-cases-browser.mjs` |
| **started_at** | `2026-08-03T13:22:19.942Z` |
| **ended_at** | `2026-08-03T13:23:05.936Z` |
| **environment** | Portal `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` · L0 all 200 · App.tsx 200 |
| **hdsd_sot** | Portal login → fail msg → membership labels → select → F5 |
| **spec_ref** | FR-UC-M01 · API_CONTRACT §8.1–8.3 · slice `DOC-ENT-P0-AUTH-M01` |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **machine_log** | `docs/qa/evidence/w1b-04-auth-fe-qa-ret2-test-log.json` |
| **evidence_narrative** | `docs/qa/evidence/w1b-04-auth-fe-qa-ret2.md` |
| **runtime_source** | `docs/qa/evidence/_tmp-w1b-04-auth-fe-qa-ret2-runtime.json` |
| **verdict** | **fail** |

**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md` · project `docs/qa/WORLD_STANDARD_TEST_LOG.md`

## Chronological steps

| seq | time (UTC) | action (HDSD) | expected | actual | network | result | attachment |
|-----|------------|---------------|----------|--------|---------|--------|------------|
| 1 | 2026-08-03T13:22:19.988Z | L0 health probe | HRM/XBOS/portal 200; App.tsx loads | hrm=200 xbos=200 portal=200 App.tsx=200 | GET health 200 | pass | — |
| 2 | 2026-08-03T13:22:20.541Z | assert-login-form-visible | Login form email+password visible | Form visible; body «Đăng nhập» | — | pass | `screens/w1b-04-auth-fe-qa-ret2/00-login-form.png` |
| 3 | 2026-08-03T13:22:22.171Z | goto-login-clear (Case A) | Navigate `/login` clear | URL `/login` | — | pass | — |
| 4 | 2026-08-03T13:22:24.955Z | fill-email Case A | Email `ceo@xe.vn` filled | filled | — | pass | — |
| 5 | 2026-08-03T13:22:25.047Z | fill-password Case A | Wrong password entered | passwordLen=25 | — | pass | — |
| 6 | 2026-08-03T13:22:25.103Z | click-submit-login Case A | Submit wrong credentials | click fired | POST `/api/xbos/auth/login` → **401** `XBOS-AUTH-401` @ 13:22:25.246Z | pass | — |
| 7 | 2026-08-03T13:22:28.134Z | Case A assert fail UX | Stay `/login` + VI fail message | «Email hoặc mật khẩu không đúng»; stillLogin=true | 401 as above | pass | `screens/w1b-04-auth-fe-qa-ret2/A-wrong-password.png` |
| 8 | 2026-08-03T13:22:28.136Z | goto-login-clear (Case B ceo) | Fresh login for success path | `/login` | — | pass | — |
| 9 | 2026-08-03T13:22:28.892Z | fill-email Case B | `ceo@xe.vn` | filled | — | pass | — |
| 10 | 2026-08-03T13:22:28.963Z | fill-password Case B | Correct password | passwordLen=9 | — | pass | — |
| 11 | 2026-08-03T13:22:29.013Z | click-submit-login Case B | Login 2xx + membership labels on UI | Login **201** `XBOS-AUTH-200`; BE labels OK; **UI mode=missing**; viteOverlay=true | POST login **201** @ 13:22:29.088Z | fail | `screens/w1b-04-auth-fe-qa-ret2/B-ceo-after-login.png` |
| 12 | 2026-08-03T13:22:30.426Z | post-login Command Center mount | `/command-center` without Vite 500 | GET `CommandCenterPage.tsx` **500** (missing `hrm-recruitment-workflow-presets`) | GET module **500** | fail | `screens/w1b-04-auth-fe-qa-ret2/01-ceo-after-login.png` |
| 13 | 2026-08-03T13:22:45.201Z | goto-login-clear (admin fallback) | Retry with multi-membership user | `/login` | — | pass | — |
| 14 | 2026-08-03T13:22:45.910Z | fill-email admin | `admin@xe.vn` | filled | — | pass | — |
| 15 | 2026-08-03T13:22:46.017Z | fill-password admin | Correct password | filled | — | pass | — |
| 16 | 2026-08-03T13:22:46.175Z | click-submit-login admin | Picker openable; select-membership | Login **201**; 5 memberships with `*_label`; switcher **not** openable; overlay | POST login **201** @ 13:22:46.231Z; GET CC **500** @ 13:22:46.968Z | fail | `screens/w1b-04-auth-fe-qa-ret2/B-admin-after-login.png` |
| 17 | 2026-08-03T13:23:02.365Z | reload-F5 Case C | Labels persist after F5 | mid/JWT persist; UI labels missing; overlay still up | GET `/api/xbos/auth/me` **200** ×2 @ 13:23:02.691Z / 13:23:03.315Z | fail | `screens/w1b-04-auth-fe-qa-ret2/C-after-f5.png` |

**Click count:** 14 (anti-idle PASS). **No** `POST /auth/select-membership` observed.

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| Form | FORM | pass | Login page email+password · `00-login-form.png` |
| A fail deep | CASE-A | pass | Wrong pwd → 401 + VI message · stay `/login` |
| B success HDSD | CASE-B-AC1-labels | fail | BE `*_label` in Network; UI chip missing (Vite overlay) |
| B select | CASE-B-AC2-membershipId | blocked | Session mid present; select UI unreachable |
| C logic BR | CASE-C-F5 | fail | F5 keeps JWT mid; labels not on UI |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| R-AUTH-FE-VITE-CC-PAGE | P0 | CommandCenterPage loads; membership chip with BE labels | Vite 500 missing `../../data/hrm-recruitment-workflow-presets` | W1-B-04-AUTH-FE-VITE-02 → AUTH-FE-QA-RET3 |
| R-AUTH-FE-BROWSER | P0 UF | Cases B/C browser AC | Blocked by post-login Vite graph | qa RET3 after fix |
| R-AUTH-FE-VITE-INBOX | — | App bootstrap | **CLOSED** this wave (App.tsx 200) | — |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 11 | 5 | 1 | 0 |

*(seq steps: pass=11, fail=5; case B2 counted blocked in cases — step 16 fail on UI AC)*

**ack_status (source wave):** FAIL  
**Backfill note:** Produced under `W1-B-QA-TEST-LOG-STD-01` from real RET2 runtime + narrative — not a re-run.
