# Bounded backlog — anti-loop (user 2026-05-29)

**Quy tắc:** [`pm-continuous-no-infinite-loop.mdc`](../.cursor/rules/pm-continuous-no-infinite-loop.mdc) · đóng item trong `PM_ORCHESTRATION_STATE.json` → **không** Task lại.

| ID | Owner | Trạng thái |
|----|-------|-----------|
| P1-BND-BE-01 | dev-be | **DONE** |
| P1-BND-FE-01 | dev-fe | **DONE** |
| P1-BND-QA-01 / QA-FE | qa | **DONE** (smoke only, no full gate) |
| P1-BND-DO-01 | devops | **DONE** |
| P1-BND-PM-01 | pm | **DONE** (PSR + policy docs) |

**Cấm re-dispatch:** mọi ID trong `closed_work_items` + `CONTINUOUS-RUN-CLOSED`.

**Wave mới** chỉ khi user báo lỗi route hoặc mục mới trong backlog (ID `P1-BND-*` hoặc `P1-HOT-*`).
