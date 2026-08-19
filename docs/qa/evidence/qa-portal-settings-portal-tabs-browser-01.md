# QA: Settings Portal 7 Tabs + Master-Data Panel
## work_item_id: PO-HRM-PORTAL-SETTINGS-QA-01
## qa_date: 2026-08-19
## qa_by: PM/PO (Claude)
## server: localhost:8080 (HRM FE only — BE offline port 3001/3002)
## auth: localStorage bypass xevn.portal.accessToken mock token

---

## A. 7 Tab "Tài khoản & portal" (portal group)

| # | Tab | URL | Result | Notes |
|---|-----|-----|--------|-------|
| 1 | Tài khoản (account) | /hr/settings?tab=account | ✅ PASS | Form Họ/Tên/Email/Phone/Chức vụ + Lưu render OK, local state |
| 2 | Thương hiệu (branding) | /hr/settings?tab=branding | ✅ PASS | Logo upload, color picker (Blue active), system name + preview render OK |
| 3 | Thông báo (notifications) | /hr/settings?tab=notifications | ✅ PASS | 5 toggle items (email, nghỉ phép, tuyển dụng, lương, chấm công) render OK |
| 4 | Bảo mật (security) | /hr/settings?tab=security | ✅ PASS | Password form + 2FA SMS section render OK |
| 5 | Vai trò & quyền (roles) | /hr/settings?tab=roles | ⚠️ PASS_WITH_HOLD | Heading "Phân quyền" only — data empty (API-dependent, BE offline). No crash. |
| 6 | Hệ thống (system) | /hr/settings?tab=system | ✅ PASS | Lang/timezone/date/currency dropdowns render OK (UTC+7, VND defaults) |
| 7 | Gói dịch vụ (subscription) | /hr/settings?tab=subscription | ✅ PASS | "Starter / Đã hết hạn / 0/999 NV / Nâng cấp gói" render OK (local mock) |

**Nav sidebar:** 32 tabs hiển thị đúng nhóm. Deep link `?tab=<id>` hoạt động. Active highlight đúng.

**API errors (404/500):** Expected — BE offline. Không gây JS crash trên 7 tab portal.

### ack_status (7 portal tabs): PASS_WITH_HOLD
Hold: tab "roles" cần BE để hiển thị role list + permission matrix. Không blocking nếu chỉ verify cấu trúc UI.

---

## B. Tab master-data — 🚨 CRASH (Blocker)

| # | Bước | Result |
|---|------|--------|
| 1 | Navigate /hr/settings?tab=master-data | App crash — white screen |
| 2 | Console error | `React.Children.only expected to receive a single React element child` |
| 3 | Component | `MasterDataBucketPanel` at `MasterDataSettingsPanel.tsx:406-412` |

### Root cause (confirmed)

Antigravity thêm `<Button asChild>` với 5 children `&&` conditionals:

```jsx
<Button asChild variant="default" size="sm" ...>
  {bucket === 'leaveTypes' && <Link ...>...</Link>}
  {bucket === 'employmentTypes' && <Link ...>...</Link>}
  {bucket === 'decisionTypes' && <Link ...>...</Link>}
  {bucket === 'insuranceTypes' && <Link ...>...</Link>}
  {bucket === 'insurers' && <Link ...>...</Link>}
</Button>
```

Radix `<Slot>` (used by `Button asChild`) gọi `React.Children.only()` → fail vì React thấy 5 children (4 là `false`, 1 là element). Bất kể chỉ 1 truthy at runtime.

MasterDataSettingsPanel dùng `forceMount` → tất cả bucket panel mount cùng lúc → bất kỳ W3 bucket nào cũng trigger crash.

### Fix cần thiết

```jsx
// THAY THẾ lines 406-412 bằng ternary chain:
<Button asChild variant="default" size="sm" data-testid={`md-${bucket}-open-standalone-tab`}>
  {bucket === 'leaveTypes'
    ? <Link to={attLeaveTypesSettingsHref}>Mở tab Loại phép ATT</Link>
    : bucket === 'employmentTypes'
    ? <Link to={hrmPathWithEmbedSearch('/settings?tab=emp-employment-types')}>Mở tab Loại hình thuê</Link>
    : bucket === 'decisionTypes'
    ? <Link to={hrmPathWithEmbedSearch('/settings?tab=dec-decision-types')}>Mở tab Loại quyết định</Link>
    : bucket === 'insuranceTypes'
    ? <Link to={hrmPathWithEmbedSearch('/settings?tab=si-insurance-types')}>Mở tab Loại bảo hiểm</Link>
    : <Link to={hrmPathWithEmbedSearch('/settings?tab=si-insurers')}>Mở tab Nơi KCB / Đơn vị BH</Link>
  }
</Button>
```

Lý do: ternary chain đảm bảo đúng 1 React element child → Radix Slot không crash.

### ack_status (master-data tab): FAIL_TO_PM
Severity: P0 Blocker — toàn bộ app crash khi navigate vào master-data settings.
Introduced by: antigravity (W3 bucket restriction feature, 2026-08-18/19)

---

## C. Kết luận tổng

| Scope | Status |
|-------|--------|
| 7 portal tabs QA | PASS_WITH_HOLD (roles tab needs BE) |
| master-data tab | FAIL — crash bug, cần fix trước golive |
| contract-clauses tab | Chưa test (blocked by crash) |

**Cần dispatch:** dev-fe fix `MasterDataSettingsPanel.tsx` lines 406-412.
