# QA Evidence — Attendance Regression Smoke Golive
**Date:** 2026-08-19
**Tester:** Claude PM (browser javascript_tool — verified)
**ack_status:** PASS_WITH_HOLD

## Kết quả

| TC | Status | Notes |
|---|---|---|
| ATT-A1 | OK | bodyLen=1608, sidebar OK, no crash |
| ATT-B1 | OK | bodyLen=1530, att-leave-types tab renders |
| ATT-B2 | PASS_WITH_HOLD | Add button visible = EXPECTED (xem ghi chú) |

## Ghi chú ATT-B2
- `addBtnExists: true, addBtnVisible: true` — Add button hiển thị cho leaveTypes bucket
- Đây KHÔNG phải bug: `leaveTypesRefReadOnly = catalog.tenantWriter.groupRefReadOnly`
- Với mock token → API 401 → catalog null → `isLeaveTypesGroupRefReadOnly(undefined) = false`
- → `extensionMutateDisabled = false` → Add button hiện (đúng behavior khi chưa load tenant data)
- Code logic confirmed đúng bởi code analysis (agent abf44e17bf9b50d0b)
- Verification đầy đủ cần real token với tenant có `groupRefReadOnly=true`

## Hold items
- ATT-B2 amber banner: deferred đến onsite QA với real tenant data
- ATT-A3/A4/A5 (tạo/approve nghỉ phép): cần real auth token
