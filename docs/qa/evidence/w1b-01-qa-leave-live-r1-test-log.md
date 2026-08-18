# Test execution log — W1-B-01-QA-LEAVE-LIVE-R1

| Field | Value |
|-------|--------|
| **log_id** | `TEL-W1B-01-QA-LEAVE-LIVE-R1-20260803` |
| **work_item_id** | `W1-B-01-QA-LEAVE-LIVE-R1` |
| **tester** | qa · agent leave-live-r1 browser harness |
| **started_at** | `2026-08-03T14:30:05.347Z` |
| **ended_at** | `2026-08-03T14:30:36.813Z` |
| **environment** | portal `http://127.0.0.1:5173` · HRM Vite `:8080` · hrm-api `:28001` · persona `ceo@xe.vn` · `company_id=main` |
| **hdsd_sot** | HDSD Chấm công → Nghỉ phép · tạo / danh sách / F5 |
| **spec_ref** | FR-UC-H03 · FR-UC-M03 · API_CONTRACT §4 · J-HRM-06 · FE mount restore |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **machine_log** | `docs/qa/evidence/w1b-01-qa-leave-live-r1-test-log.json` |
| **evidence_narrative** | `docs/qa/evidence/w1b-01-qa-leave-live-r1.md` |

## Chronological steps

| seq | time | action (HDSD) | expected | actual | network | result | attachment |
|-----|------|---------------|----------|--------|---------|--------|------------|
| 1 | 2026-08-03T14:29:5x | L0 qc:dev-stack | HRM+XBOS+portal 200 | hrm/xbos/portal **200** | GET `/api/hrm` 200 | pass | — |
| 2 | pre-browser | Vite LeaveOverview resolve | 200 no Failed to resolve | LeaveOverview **200** · Attendance proxy **200** resolve_fail=false | GET module sources | pass | — |
| 3 | 2026-08-03T14:30:05.348Z | API login Group CEO | 2xx + token | HTTP **201** | POST `/api/xbos/auth/login` 201 | pass | — |
| 4 | 2026-08-03T14:30:05.907Z | Open portal shell | shell loads | navigated `:5173/` | GET `/api/xbos/auth/me` 200 | pass | `screens/…/00-shell.png` |
| 5 | 2026-08-03T14:30:08.687Z | Nav Chấm công (fallback URL) | `/hr/attendance` mounts | URL OK · **#root=4** · no Vite resolve fail | GET leave-requests **200** | pass | `…/01-attendance.png` |
| 6 | 2026-08-03T14:30:13.065Z | Click tab Nghỉ phép | LeaveTab visible | text **Nghỉ phép** · leave title true | GET employees/settings 200 | pass | `…/02-leave-tab.png` |
| 7 | 2026-08-03T14:30:16.778Z | Case A — open create leave | dialog | **Tạo yêu cầu nghỉ** dialog open | — | pass | `…/03-create-dialog.png` |
| 8 | 2026-08-03T14:30:20.859Z–23.836Z | Case A — sick≥3 no attach submit | FE validation or API toast; no silent 2xx | sick picked; Gửi clicked; **no** POST leave-requests; validationUi | no POST 2xx | pass | `…/04-case-a-fail.png` |
| 9 | 2026-08-03T14:30:27.851Z | Case B — Danh sách yêu cầu | list + labels bind | 28 rows · status_label Chờ duyệt · employee_display_name | GET leave-requests 200 `HRM-LEAVE-200` | pass | `…/05-case-b-list.png` |
| 10 | 2026-08-03T14:30:29.978Z | Case B / J-HRM-06 row click | list→row | row clicked (CEO Tập đoàn · Chờ duyệt) | — | pass | `…/06-case-b-detail.png` |
| 11 | 2026-08-03T14:30:32.253Z | Case C — F5 | data still bound | `#root=4` · hasLeave · GET leave **200** | GET leave-requests 200 | pass | `…/07-case-c-f5.png` |
| 12 | 2026-08-03T14:30:36.813Z | idle_guard | ≥6 real clicks | **28** click_log entries | — | pass | — |

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | `A_fail` | **pass** | FE client validation; no silent create; sick/ốm selected |
| B success HDSD | `B_happy` | **pass** | List 200 · labels bind · UI Chờ duyệt |
| C logic / F5 | `C_f5` | **pass** | Persist after F5 · no whitescreen |
| Mount | `mount` | **pass** | Closes `R-LEAVE-FE-ATTENDANCE-MOUNT` |
| J-HRM-06 | journey | **pass** | Attendance leave list surface |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| R-LEAVE-TYPE-LABEL-DEPTH | P2 | catalog VI name on `leave_type_label` | Often `LVT_01` echo (field present; UI may show Phép năm) | defer |
| ~~R-LEAVE-FE-ATTENDANCE-MOUNT~~ | — | mount | **CLOSED** | — |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 12 | 0 | 0 | 0 |

**verdict:** pass  
**ack_status:** PASS_TO_PM  
**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`
