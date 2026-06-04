# PM Sprint orchestration — zero user-facing defects

**Owner:** PM · **Applies to:** Phase 1 Scrum S0→S5

## Nguyên tắc (user không thấy lỗi thô)

1. **PM hấp thụ lỗi:** Mọi FAIL từ QA/DevOps/incident hook → PM dispatch fix **trước** khi cập nhật trạng thái user-facing.
2. **Không báo FAIL trong chat user** trừ khi blocker cần quyết định sản phẩm (scope/waiver).
3. **Tổng kết sprint bắt buộc** cuối mỗi sprint: `docs/program/sprints/S{n}_SPRINT_SUMMARY.md` — ngôn ngữ **trạng thái + bước kế**, không stack trace.
4. **Chu kỳ tự sửa:** `FAIL` → Dev (cùng sprint) → QA retest → QC → mới đóng sprint.
5. **User check UI:** Chỉ khi `PILOT_BUSINESS_FLOW_MATRIX` route = PASS và QC ≠ NO-GO.

## Ceremony

| Ceremony | Output | Ai |
|----------|--------|-----|
| Sprint planning | Bus DISPATCHED + master todo | PM |
| Daily (auto) | `TEAM_LIVE_STATUS.md` 1 dòng | PM |
| Dev done | `READY_FOR_QA` | Dev-* |
| QA | evidence `scrum-s{N}-*.md` | QA |
| Auto-fix loop | PM → Dev nếu QA FAIL | PM |
| Sprint review | `sprints/S{n}_SPRINT_SUMMARY.md` | PM |
| QC gate | `qc-scrum-s{N}-*.md` GO | QC |

## User-facing status (duy nhất)

| File | Mục đích |
|------|----------|
| `docs/program/USER_PILOT_STATUS.md` | 1 trang: portal OK / đang harden / tài khoản pilot |
| `docs/program/sprints/S*_SPRINT_SUMMARY.md` | Tóm tắt sprint (không log lỗi) |

## PM auto-fix queue (nội bộ)

- `.cursor/team/PM_INCIDENT_QUEUE.json` — agent xử lý, không copy vào user chat.
- `pnpm phase1:sprint:status` — bước kế trong sprint.
