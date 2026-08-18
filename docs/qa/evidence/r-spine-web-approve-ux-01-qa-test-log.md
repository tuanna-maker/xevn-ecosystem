# Test execution log — `R-SPINE-WEB-APPROVE-UX-01-QA`

| Field | Value |
|-------|--------|
| **log_id** | `TEL-R-SPINE-WEB-APPROVE-UX-01-QA-20260803` |
| **work_item_id** | `R-SPINE-WEB-APPROVE-UX-01-QA` |
| **tester** | qa · R-SPINE-WEB-APPROVE-UX-01-QA-browser |
| **started_at** | `2026-08-03T15:45:29.601Z` |
| **ended_at** | `2026-08-03T15:46:14.395Z` |
| **environment** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` · persona `ceo@xe.vn` · `companyId=main` · HEAD `dc930c5` |
| **hdsd_sot** | HDSD Chấm công → Nghỉ phép (Danh sách · Duyệt) · CC Việc cần xử lý (Duyệt leave) |
| **spec_ref** | FR-UC-H03 · UF-XBOS-08 · J-HRM-06 |
| **machine_log** | `docs/qa/evidence/r-spine-web-approve-ux-01-qa-test-log.json` |

## Chronological steps

| seq | time | action (HDSD) | expected | actual | network | result | attachment |
|-----|------|---------------|----------|--------|---------|--------|------------|
| 1 | 15:45:29Z | API login | 2xx + token | HTTP 201 | POST `/api/xbos/auth/login` 201 | pass | |
| 2 | 15:45:31Z | Nav Chấm công / Nghỉ phép | Leave tab mounts | `#root=4` · title Nghỉ phép | — | pass | `01-attendance.png` · `02-leave-tab.png` |
| 3 | 15:45:40Z | Danh sách subtab | List shows pending Duyệt | 30× `hdsd-leave-list-approve*` | — | pass | `06-path-a-list.png` |
| 4 | 15:45:42Z | Path A click Duyệt | POST approve 2xx | 201 HRM-LEAVE-203 approved | POST `…/leave-requests/639e8033-…/approve` 201 | pass | `07-path-a-after-approve.png` |
| 5 | 15:45:48Z | Path A F5 | List mounts · status retained | GET leave-requests 200 · mount OK | GET leave-requests 200 | pass | `08-path-a-f5.png` |
| 6 | 15:46:03Z | Nav CC inbox | Leave cards + Duyệt CTA | 28 leave cards · 28 `hdsd-cc-leave-approve` · aria Duyệt | — | pass | `09-path-b-inbox.png` |
| 7 | 15:46:08Z | Path B click Duyệt | POST tasks/:id/complete 2xx | 201 XBOS-WF-200 | POST `…/tasks/669909c4-…/complete` 201 | pass | `10-path-b-after-approve.png` |
| 8 | 15:46:11Z | Path B F5 | Card gone / count down | leave approve CTAs 28→27 · mount OK | — | pass | `11-path-b-f5.png` |

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | LV-03 spot | skipped | must_keep CLOSED — prior R1 PASS |
| B success HDSD | Path A+B | pass | approve 201 + complete 201 + F5 |
| C logic BR | Duyệt HDSD labels | pass | list testid + CC aria Duyệt |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| — | — | — | none | — |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 8 | 0 | 0 | 1 (LV-03 spot) |

**ack_status:** PASS_TO_PM  
**idle_guard:** PASS (23 clicks)  
**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`
