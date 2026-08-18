# Test execution log — W1-B-01-QA-LEAVE-LIVE

| Field | Value |
|-------|--------|
| **log_id** | `TEL-W1B-01-QA-LEAVE-LIVE-20260803` |
| **work_item_id** | `W1-B-01-QA-LEAVE-LIVE` |
| **tester** | qa · agent leave-live browser harness |
| **started_at** | `2026-08-03T14:21:17.605Z` |
| **ended_at** | `2026-08-03T14:21:43.703Z` |
| **environment** | portal `http://127.0.0.1:5173` · HRM Vite `:8080` · hrm-api `:28001` · persona `ceo@xe.vn` · `company_id=main` |
| **hdsd_sot** | HDSD Chấm công → Nghỉ phép · tạo / danh sách / F5 |
| **spec_ref** | FR-UC-H03 · FR-UC-M03 · API_CONTRACT §4 · J-HRM-06 |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **machine_log** | `docs/qa/evidence/w1b-01-qa-leave-live-test-log.json` |
| **evidence_narrative** | `docs/qa/evidence/w1b-01-qa-leave-live.md` |

## Chronological steps

| seq | time | action (HDSD) | expected | actual | network | result | attachment |
|-----|------|---------------|----------|--------|---------|--------|------------|
| 1 | 2026-08-03T14:21:17.605Z | L0 hrm-api root | 200 | **200** `/api/hrm` | GET `/api/hrm` 200 | pass | — |
| 2 | 2026-08-03T14:21:17.7Z | API login Group CEO | 2xx + token | HTTP **201** | POST `/api/xbos/auth/login` 201 `XBOS-AUTH-200` | pass | — |
| 3 | 2026-08-03T14:21:17.75Z | L1 GET leave-requests | 2xx + display labels or honest empty | **200** `HRM-LEAVE-200` · 28 rows · `status_label=Chờ duyệt` · `employee_display_name` set | GET `/api/hrm/attendance/leave-requests?company_id=main` 200 | pass | — |
| 4 | 2026-08-03T14:21:17.80Z | L1 GET leave-balance | 2xx or documented 4xx | **200** `HRM-LEAVE-BAL-200` · `leave_type_label` present | GET `/api/hrm/attendance/leave-balance?…` 200 | pass | — |
| 5 | 2026-08-03T14:21:29.922Z | Browser API login | 201 | **201** | POST login 201 | pass | — |
| 6 | 2026-08-03T14:21:30.615Z | Open portal shell | shell loads | navigated `:5173/` | GET `/api/xbos/auth/me` 200 | pass | `screens/w1b-01-qa-leave-live-20260803/00-shell.png` |
| 7 | 2026-08-03T14:21:33.472Z | Nav Chấm công (fallback URL) | `/hr/attendance` mounts | URL OK · **#root=0** whitescreen | Vite **500** `Attendance.tsx` | fail | `…/01-attendance.png` (blank) |
| 8 | 2026-08-03T14:21:38.139Z | Click tab Nghỉ phép | LeaveTab visible | tab locator **MISS** · no leave title | — | fail | `…/02-leave-tab.png` |
| 9 | 2026-08-03T14:21:38.220Z | Case A — open create leave | dialog + fail_deep | dialog **not opened** (mount block) | — | blocked | `…/04-case-a-fail.png` |
| 10 | ~L1 probe | Case A API — sick≥3 no attach | `HRM-LEAVE-VAL-ATT` / 4xx | POST **400** `HRM-LEAVE-VAL-ATT` | POST leave-requests 400 | pass | — (API-only; UI blocked) |
| 11 | 2026-08-03T14:21:38.836Z | Case B — leave list labels | UI + API labels not raw-only | no browser leave GET · root=0 | none leave from UI | fail | `…/05-case-b-list.png` |
| 12 | 2026-08-03T14:21:39.127Z | Case C — F5 | data still bound | F5 · still whitescreen · root=0 | no leave GET 2xx after F5 | fail | `…/07-case-c-f5.png` |
| 13 | 2026-08-03T14:21:43.703Z | idle_guard | ≥6 real clicks | **15** click_log entries | — | pass | — |

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | `A_fail` | **blocked** (UI) / API **pass** | UI dialog unreachable; L1 POST sick≥3 → `HRM-LEAVE-VAL-ATT` |
| B success HDSD | `B_happy` | **fail** | Attendance mount FAIL — no list/labels in browser |
| C logic / F5 | `C_f5` | **fail** | F5 still `#root=0` |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| R-LEAVE-FE-ATTENDANCE-MOUNT | P0 | `/hr/attendance` mounts LeaveTab | Vite 500 missing `@/components/attendance/LeaveOverviewRecentPanel` | `W1-B-01-FE-LEAVE-ATTENDANCE-MOUNT` |
| R-LEAVE-TYPE-LABEL-DEPTH | P2 | `leave_type_label` human VI | Often equals code `LVT_01` | defer |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 7 | 4 | 1 | 0 |

**verdict:** fail  
**ack_status:** FAIL_TO_PM  
**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`
