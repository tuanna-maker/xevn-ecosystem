# Báo cáo nghiệm thu (Evidence) — PO-HRM-SETTINGS-PORTAL-TABS-FE-02

## 1. Thông tin chung
- **Work Item:** `PO-HRM-SETTINGS-PORTAL-TABS-FE-02`
- **Tên:** Settings — portal tabs mock
- **Scope:** dev-fe (shallow mock no API)
- **Status:** **PASS_TO_PM**

## 2. Tiêu chí nghiệm thu (AC)
| ID | Yêu cầu | Trạng thái | Ghi chú |
|----|--------|------------|---------|
| AC-1 | Tab Tài khoản | PASS | Hiển thị form read-only mock thông tin user theo thiết kế |
| AC-2 | Tab Thương hiệu | PASS | Render component `BrandingSettings` |
| AC-3 | Tab Thông báo | PASS | Switch mock bật/tắt nhận email, duyệt nghỉ phép, tuyển dụng |
| AC-4 | Tab Bảo mật | PASS | Form đổi mật khẩu + Switch 2FA SMS |
| AC-5 | Tab Vai trò & Quyền | PASS | Render component `RolesPermissionsTab` |
| AC-6 | Tab Hệ thống | PASS | Dropdown mock ngôn ngữ, múi giờ, định dạng ngày, tiền tệ |
| AC-7 | Tab Gói dịch vụ | PASS | Render component `SubscriptionManagement` |

## 3. Xác nhận
- **Zero-seed / C-SPEC-SHALLOW:** Màn hình chỉ sử dụng local state/mock UI theo yêu cầu `fidelity_P0` (không gọi API backend).
- **No side-effects:** Các tab này không làm hỏng chức năng của các tab master-data hoặc contract-legal đã được QC trước đó.

## 4. Bàn giao
- Mã nguồn nằm tại `apps/web/hrm/src/pages/Settings.tsx` và các component tương ứng.
- Đã được implement từ trước nhưng chưa seal evidence. Cập nhật evidence seal để đóng task.
