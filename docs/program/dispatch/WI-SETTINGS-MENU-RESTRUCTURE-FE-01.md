# WI-SETTINGS-MENU-RESTRUCTURE-FE-01

**Role:** dev-fe  
**Lane:** FE Web only (`apps/web/hrm/`)  
**Priority:** P0  
**Date issued:** 2026-08-19  
**Sponsor:** tuanna@unicomhub.com  

---

## Tóm tắt công việc

Hai việc độc lập, cùng 1 WI:

1. **Quy hoạch lại menu Settings** từ 9 nhóm → 7 nhóm đúng nghiệp vụ trong `settingsNavigation.ts`
2. **Chuẩn hóa UX add/edit**: tìm mọi panel Settings có form thêm mới **inline dưới danh sách** → chuyển thành Dialog popup (theo pattern `AttAttendanceCodeSettingsPanel.tsx`)

Hầu hết panel FE + BE đã có. Không cần implement catalog mới từ đầu.

---

## Đọc trước

- `apps/web/hrm/src/lib/settingsNavigation.ts` — file chính cần sửa cấu trúc nav
- `apps/web/hrm/src/components/settings/AttAttendanceCodeSettingsPanel.tsx` — **PATTERN MẪU** cho Dialog popup (SettingsCatalogScreenShell + Dialog + list + retire)
- `apps/web/hrm/src/pages/Settings.tsx` — cách dispatch tabId → component
- Scan tất cả file trong `apps/web/hrm/src/components/settings/` để tìm các panel dùng inline form

---

## Allowed paths

```
apps/web/hrm/src/lib/settingsNavigation.ts
apps/web/hrm/src/pages/Settings.tsx
apps/web/hrm/src/components/settings/**
```

## Forbidden paths

```
apps/api/**
apps/mobile/**
packages/**
deploy/**
```

---

## Việc 1 — Restructure settingsNavigation.ts

### SettingsTabId union — thêm các ID mới

```typescript
// Thêm vào union type (giữ tất cả cũ):
| 'catalog-job-titles'
| 'rec-sources'
| 'rec-interview-types'
| 'rec-rejection-reasons'
| 'rec-positions'
| 'rec-health-requirements'
| 'contract-types'
| 'contract-termination-reasons'
| 'att-shifts'
| 'att-work-rules'
| 'att-schedule-groups'
| 'pay-salary-components'
| 'pay-salary-formulas'
| 'pay-salary-groups'
| 'pay-payslip-tpl'
| 'pay-tax-tables'
```

Cũng thêm vào `ALL_SETTINGS_TAB_IDS` Set.

### SETTINGS_NAV_GROUPS — 7 nhóm mới (thay toàn bộ mảng cũ)

```typescript
export const SETTINGS_NAV_GROUPS: SettingsNavGroup[] = [
  {
    groupId: 'system',
    title: 'Hệ thống & Tài khoản',
    items: [
      { id: 'account',       label: 'Tài khoản',      icon: User },
      { id: 'branding',      label: 'Thương hiệu',     icon: Image },
      { id: 'notifications', label: 'Thông báo',       icon: Bell },
      { id: 'security',      label: 'Bảo mật',         icon: Shield },
      { id: 'roles',         label: 'Vai trò & Quyền', icon: Users },
      { id: 'system',        label: 'Hệ thống',        icon: SettingsIcon },
      { id: 'subscription',  label: 'Gói dịch vụ',     icon: DollarSign },
    ],
  },
  {
    groupId: 'hr-catalog',
    title: 'Danh mục Nhân sự',
    items: [
      { id: 'master-data',             label: 'Đơn vị & Phòng ban',   icon: Layers,        testId: 'settings-tab-master-data' },
      { id: 'catalog-job-titles',      label: 'Chức danh công việc',  icon: Briefcase,     testId: 'settings-tab-catalog-job-titles' },
      { id: 'emp-document-types',      label: 'Loại giấy tờ',         icon: IdCard,        testId: 'settings-tab-emp-document-types' },
      { id: 'emp-employment-types',    label: 'Loại hình thuê',        icon: Briefcase,     testId: 'settings-tab-emp-employment-types' },
      { id: 'emp-employment-statuses', label: 'Trạng thái nhân viên', icon: UserCheck,     testId: 'settings-tab-emp-employment-statuses' },
      { id: 'dec-decision-types',      label: 'Loại quyết định',      icon: FileSignature, testId: 'settings-tab-dec-decision-types' },
    ],
  },
  {
    groupId: 'recruitment',
    title: 'Tuyển dụng',
    items: [
      { id: 'jd-master-library',      label: 'Thư viện JD',          icon: FileText,      testId: 'settings-tab-jd-master-library' },
      { id: 'jd-dynamic',             label: 'Trường JD linh hoạt',  icon: FileText,      testId: 'settings-tab-jd-dynamic' },
      { id: 'rec-pipeline-stages',    label: 'Giai đoạn tuyển dụng', icon: GitBranch,     testId: 'settings-tab-rec-pipeline-stages' },
      { id: 'rec-sources',            label: 'Nguồn tuyển dụng',     icon: Globe,         testId: 'settings-tab-rec-sources' },
      { id: 'rec-interview-types',    label: 'Loại phỏng vấn',       icon: ClipboardCheck,testId: 'settings-tab-rec-interview-types' },
      { id: 'rec-rejection-reasons',  label: 'Lý do từ chối',        icon: FileText,      testId: 'settings-tab-rec-rejection-reasons' },
      { id: 'rec-positions',          label: 'Catalog vị trí',       icon: Briefcase,     testId: 'settings-tab-rec-positions' },
      { id: 'rec-health-requirements',label: 'Yêu cầu sức khỏe',    icon: Shield,        testId: 'settings-tab-rec-health-requirements' },
    ],
  },
  {
    groupId: 'contract',
    title: 'Hợp đồng lao động',
    items: [
      { id: 'contract-types',               label: 'Loại hợp đồng',     icon: FileText,      testId: 'settings-tab-contract-types' },
      { id: 'contract-clauses',             label: 'Điều khoản HĐ',     icon: ScrollText,    testId: 'settings-tab-contract-clauses' },
      { id: 'contract-templates',           label: 'Mẫu hợp đồng',      icon: FileText,      testId: 'settings-tab-contract-templates' },
      { id: 'contract-number-config',       label: 'Đánh số HĐ',        icon: FileSignature, testId: 'settings-tab-contract-number-config' },
      { id: 'merge-tokens',                 label: 'Token merge',        icon: Key,           testId: 'settings-tab-merge-tokens' },
      { id: 'contract-library-publish',     label: 'Phát hành văn bản', icon: Globe,         testId: 'settings-tab-contract-library-publish' },
      { id: 'contract-termination-reasons', label: 'Lý do chấm dứt HĐ',icon: FileText,      testId: 'settings-tab-contract-termination-reasons' },
    ],
  },
  {
    groupId: 'attendance',
    title: 'Chấm công & Nghỉ phép',
    // ⚠️ Chú thích trong code: web chỉ khai báo danh mục. Dữ liệu chấm công nhập qua máy/mobile.
    items: [
      { id: 'att-leave-types',      label: 'Loại nghỉ phép',     icon: FileText,       testId: 'settings-tab-att-leave-types' },
      { id: 'att-attendance-codes', label: 'Mã chấm công',       icon: ClipboardCheck, testId: 'settings-tab-att-attendance-codes' },
      { id: 'att-ot-types',         label: 'Loại tăng ca',       icon: Clock,          testId: 'settings-tab-att-ot-types' },
      { id: 'att-ot-comp-types',    label: 'Chi trả tăng ca',    icon: Clock,          testId: 'settings-tab-att-ot-comp-types' },
      { id: 'att-shifts',           label: 'Ca làm việc',        icon: Clock,          testId: 'settings-tab-att-shifts' },
      { id: 'att-work-rules',       label: 'Quy tắc tính công',  icon: Calculator,     testId: 'settings-tab-att-work-rules' },
      { id: 'att-schedule-groups',  label: 'Nhóm lịch làm việc', icon: Layers,         testId: 'settings-tab-att-schedule-groups' },
    ],
  },
  {
    groupId: 'insurance',
    title: 'Bảo hiểm',
    items: [
      { id: 'si-insurance-types',     label: 'Loại bảo hiểm', icon: Shield, testId: 'settings-tab-si-insurance-types' },
      { id: 'si-insurers',            label: 'Nhà bảo hiểm',  icon: Layers, testId: 'settings-tab-si-insurers' },
      { id: 'payroll-insurance-rates',label: 'Mức đóng BH',   icon: Shield, testId: 'settings-tab-payroll-insurance-rates' },
    ],
  },
  {
    groupId: 'payroll',
    title: 'Lương & Thu nhập',
    items: [
      { id: 'pay-salary-components', label: 'Thành phần lương',    icon: DollarSign, testId: 'settings-tab-pay-salary-components' },
      { id: 'pay-salary-formulas',   label: 'Công thức tính lương', icon: Calculator, testId: 'settings-tab-pay-salary-formulas' },
      { id: 'pay-salary-groups',     label: 'Nhóm lương',           icon: Layers,     testId: 'settings-tab-pay-salary-groups' },
      { id: 'pay-sheet-tpl',         label: 'Mẫu bảng lương',       icon: DollarSign, testId: 'settings-tab-pay-sheet-tpl' },
      { id: 'pay-payslip-tpl',       label: 'Template phiếu lương', icon: FileText,   testId: 'settings-tab-pay-payslip-tpl' },
      { id: 'pay-tax-tables',        label: 'Bảng thuế TNCN',       icon: Calculator, testId: 'settings-tab-pay-tax-tables' },
      { id: 'settings-defaults',     label: 'Mặc định tính lương',  icon: Calculator, testId: 'settings-tab-settings-defaults' },
    ],
  },
];
```

**Giữ nguyên:**
- `SETTINGS_TAB_ALIASES` (đặc biệt `'contract-legal': 'contract-clauses'`)
- `resolveSettingsTab()` và `resolveEffectiveSettingsTab()` — không đổi logic
- Tab ID cũ không dùng (`catalogs`, `catalog-leave-types`) — giữ trong union + `ALL_SETTINGS_TAB_IDS` để không break QA/aliases

### Settings.tsx — wire + stub

Với các tab ID mới chưa có panel: render stub "Đang phát triển" (tiếng Việt, không jargon dev):

```tsx
<div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
  <p className="text-sm font-medium">Tính năng đang được phát triển</p>
  <p className="text-xs">Sẽ có trong bản cập nhật tiếp theo</p>
</div>
```

Nếu trong codebase đã có pattern stub riêng — dùng pattern đó thay thế.

---

## Việc 2 — Chuẩn hóa UX: inline-add → Dialog popup

### Scan

Đọc tất cả file `*.tsx` trong `apps/web/hrm/src/components/settings/`. Tìm các panel có pattern:
- Form (label + input + button "Thêm" / "Lưu") render trực tiếp bên dưới `<table>` hoặc bên dưới danh sách, **không** nằm trong `<Dialog>`
- Thường nhận ra qua: `<form>` hoặc cụm `<Input>` + `<Button>Thêm</Button>` ngoài Dialog

### Chuẩn hóa

Với mỗi panel tìm được:
1. Extract form inline → `<Dialog>` + `<DialogContent>` (theo pattern `AttAttendanceCodeSettingsPanel.tsx`)
2. Button trigger: `<Button>+ Thêm</Button>` ở header list → `onClick={() => setDialogOpen(true)}`
3. Dialog title: "Thêm [tên danh mục]" / "Sửa [tên danh mục]"
4. Sau submit thành công: đóng Dialog + toast + invalidate query (giống pattern mẫu)
5. Giữ nguyên tất cả `data-testid` cũ — không xóa, không đổi tên
6. Không thay đổi logic validate, API call, error handling

### KHÔNG làm

- Không đổi label/copy UI trừ khi rõ ràng là jargon dev-artifact (UX-PRODUCT-RULES §10)
- Không refactor thành phần không liên quan
- Không đổi API call hoặc DTO

---

## Constraints bất biến

- Không git push — chờ sponsor bảo
- `@CODE-MEMORY` comment ở đầu file nếu thêm file mới (xem mẫu trong `AttAttendanceCodeSettingsPanel.tsx`)
- Path Windows NFD: dùng Node.js read/write, không dùng Bash trực tiếp với path tiếng Việt
- 1 UC = 1 Agent = 1 lane (chỉ FE, không đụng BE)

---

## Exit criteria

1. `pnpm --filter hrm-fe tsc --noEmit` — 0 error
2. Menu Settings hiển thị đúng 7 nhóm
3. Tab cũ vẫn load đúng panel (không regression)
4. Tab mới: stub hoặc panel đúng — không throw, không blank
5. Tất cả panel inline-add đã chuyển thành Dialog (báo cáo danh sách file đã đổi)
6. `ls -la` các file đã sửa

**ack_status:** `READY_FOR_QA` khi xong
