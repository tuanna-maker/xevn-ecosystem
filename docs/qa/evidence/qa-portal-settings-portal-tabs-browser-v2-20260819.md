# QA Evidence — Portal Settings 7 Tabs Browser Verify (v2)

- **work_item_id:** PO-HRM-SETTINGS-PORTAL-TABS-FE-02
- **Date:** 2026-08-19
- **Tester:** antigravity
- **Auth bypass method:** localStorage DevTools (không sửa source)

## LocalStorage keys tìm được
[
  "hrm_access_token",
  "hrm_user"
]

## Tab Results

| # | Tab | Render | JS Errors | API Calls | Result |
|---|-----|--------|-----------|-----------|--------|
| 1 | account | PASS | None | None | PASS |
| 2 | branding | PASS | None | None | PASS |
| 3 | notifications | PASS | None | None | PASS |
| 4 | security | PASS | None | None | PASS |
| 5 | roles | PASS (Empty content) | None | None | PASS_WITH_HOLD |
| 6 | system | PASS | None | None | PASS |
| 7 | subscription | PASS | None | None | PASS |

## Bugs found
- Tab **Vai trò & quyền** (roles) render được UI vỏ bọc, không có JS error, nhưng phần nội dung bên trong trống trơn (không hiển thị bảng phân quyền).

## ack_status
PASS_WITH_HOLD: 6/7 tab hoàn thiện, tab 'roles' render UI trống rỗng.
