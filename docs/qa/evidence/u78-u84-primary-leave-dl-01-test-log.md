# Test execution log — U78-U84-PRIMARY-LEAVE-DL-01

| Field | Value |
|-------|--------|
| **log_id** | `TEL-U78-U84-PRIMARY-LEAVE-DL-01-20260803` |
| **work_item_id** | `U78-U84-PRIMARY-LEAVE-DL-01` |
| **tester** | qa · device+browser |
| **started_at** | `2026-08-03T16:49:29.543Z` (Phase A) / Phase B `2026-08-03T16:50:29.659Z` |
| **ended_at** | `2026-08-03T16:53:00.943Z` |
| **environment** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` · emulator-5554 · pkg `vn.xevn.hrm.mobile` · commit `dc930c5` |
| **hdsd_sot** | HRM Chấm công → Nghỉ phép · Mobile FAB Tạo đơn nghỉ · Manager Phê duyệt |
| **spec_ref** | FR-UC-H03 · TC-HIM-LEAVE-DL-HP-001 / AP-001 · HIM §5.4 · matrix P-LEAVE @ CO-DL |
| **machine_log** | `docs/qa/evidence/u78-u84-primary-leave-dl-01-test-log.json` |
| **narrative** | `docs/qa/evidence/u78-u84-primary-leave-dl-01.md` |

## Chronological steps

| seq | time | action (HDSD) | expected | actual | network | result | attachment |
|-----|------|---------------|----------|--------|---------|--------|------------|
| 1 | 16:49:29Z | L0 / API probe CO-DL employees | finance / CO-DL UUID have staff | total=**0** both | GET employees **200** | blocked | raw json api_probes |
| 2 | 16:49:30Z | Web login inject du-lich.ceo → `/hr/attendance` finance | Leave mount · create path | `#root=4` · create CTA · list error/0 | leave-requests load fail banner | blocked | `01-co-dl-finance.png` |
| 3 | 16:49:37Z | Web xe-du-lich/main attendance leave | Same for member main | Mount · Chờ duyệt (0) | — | blocked | `01-co-dl-xe-du-lich-main.png` |
| 4 | 16:50:43Z | Mobile login `uat.nv0003` Trang chủ | Home HDSD | Home OK · company=holding | mobile login **200** | pass | `mobile/10-sub-home.png` |
| 5 | 16:50:56Z | FAB → Tạo đơn nghỉ | Wizard Bước 1 | Create screen | — | pass | `11-fab` · `12-create-step0` |
| 6 | 16:51:06Z | Fail-deep: Tiếp tục without date | next disabled | `leave-create-next` enabled=false | — | pass | `12-create-step0` |
| 7 | 16:51:06–16:51:40Z | Date → Phép năm → Gửi đơn → confirm | POST create · pending | leave `476c48bc-…` pending · UI Đã gửi | GET mgr pending **200** `HRM-LEAVE-200` · row present | pass | `13`–`19-after-submit` |
| 8 | 16:51:52Z | Login `uat.nv0001` → Phê duyệt | ManagerApprovals · Nghỉ phép ≥1 | Nghỉ phép **(2)** · Duyệt visible | — | pass | `20-mgr-home` · `21-approvals` |
| 9 | 16:52:12–16:52:20Z | Duyệt leave UAT-0003 → confirm | Approve 2xx · toast | «Đã duyệt đơn nghỉ phép» · count (1) | pending mgr total **2→1** · leave cleared | pass | `22`–`25-f5` |
| 10 | 16:52:30–16:53:00Z | Submitter F5 / Đã duyệt | status Đã duyệt | API `476c48bc` **approved** / `Đã duyệt` · UI tab | GET approved **200** `HRM-LEAVE-200` | pass | `30`–`32-sub-f5` |
| 11 | — | L2 / T_L1 ladder | FORBIDDEN | not executed | — | skipped | SPEC_GAP HOLD |

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | leave-create-next disabled | pass | optional |
| B success HDSD L1 | HP+AP | pass (holding) / blocked (CO-DL co_key) | Primary TC not EVIDENCED |
| C logic BR L2 | T_L1 / ladder | skipped | FORBIDDEN this WI |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| R-U84-LEAVE-DL-PERSONA-SCOPE-01 | P0 | CO-DL has staff + mapped submitter | finance/xe-du-lich employees **0**; nv0003/0001 on holding | R-U84-LEAVE-DL-PERSONA-SCOPE-01 |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 7 | 0 | 3 | 1 |

**verdict:** blocked (Primary CO-DL) · supporting L1 holding pass  
**ack_status:** PASS_TO_PM  
**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`
