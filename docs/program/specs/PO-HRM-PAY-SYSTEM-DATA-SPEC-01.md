# PO-HRM-PAY-SYSTEM-DATA-SPEC-01 — Quản lý Dữ liệu Hệ thống (Extra Data) cho Bảng lương

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-SYSTEM-DATA-SPEC-01` |
| **parent** | `PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01` |
| **lane** | governance · ba-process · uiux |
| **change_mode** | **ADD** — Thêm khái niệm "Dữ liệu hệ thống" cho Cấu hình bảng lương |
| **date** | 2026-08-25 |
| **honesty** | Spec này được sinh ra từ yêu cầu mở rộng động trên UI, nhằm chuẩn hóa lại TechSpec và UIUX. |

---

## 1. Nghiệp vụ (Business Rules)

### 1.1 Khái niệm Dữ liệu hệ thống (Pay System Data / Extra Data)
Trong quá trình cấu hình bảng lương (Pay Sheet Template Lines), bên cạnh các cách nhập liệu thông thường như:
- **Nhập tay (MANUAL)**: C&B nhập thủ công.
- **Công thức (FORMULA)**: Tính toán tự động qua hệ thống Formula Engine.

Hệ thống cần cung cấp thêm một cách nhập là **Dữ liệu hệ thống (SYSTEM)**. Dữ liệu hệ thống là những trường dữ liệu trích xuất từ hệ thống nội bộ (hoặc tích hợp) mà người dùng cuối có thể tự định nghĩa, thay vì phải hardcode từ phía kỹ thuật.

### 1.2 Yêu cầu UI/UX

**Màn hình Quản lý Dữ liệu hệ thống:**
- Nằm trong tab "Settings" -> "Dữ liệu hệ thống" của HRM.
- Cho phép người dùng (Admin/C&B) xem danh sách, thêm, sửa, xóa các định nghĩa Dữ liệu hệ thống.
- Cấu trúc dữ liệu yêu cầu:
  - `Mã dữ liệu (Code)`: Chuỗi định danh, không dấu, viết liền.
  - `Tên dữ liệu (Name)`: Tên hiển thị thân thiện (Nhãn).
  - `Loại dữ liệu (Data Type)`: NUMBER, TEXT, BOOLEAN.
  - `Mô tả (Description)`: Tùy chọn.

**Màn hình Cấu hình Mẫu bảng lương (Pay Sheet Template Settings):**
- Khi cấu hình một cột (Line) trong bảng lương, người dùng sẽ:
  1. Chọn **Nhãn hiển thị** (Thành phần).
  2. Mã cột (Code) tự động hiển thị dưới dạng Read-only (Ánh xạ 1-1 từ Nhãn).
  3. Chọn **Cách nhập (Input Method)** gồm 3 loại: MANUAL, FORMULA, SYSTEM.
  4. Cột **Cấu hình (Configuration)** thay đổi động:
     - Nếu chọn MANUAL: Hiển thị text ghi chú "Nhập tay".
     - Nếu chọn FORMULA: Hiển thị Dropdown chọn "Override công thức".
     - Nếu chọn SYSTEM: Hiển thị Dropdown chọn "Dữ liệu hệ thống" (Dữ liệu lấy từ màn Quản lý Dữ liệu hệ thống).

## 2. API Contract & Kiến trúc Kỹ thuật

### 2.1 Backend (NestJS HRM API)
- Tạo module `pay-system-data` thuộc `apps/api/hrm-api/src/settings/`.
- Thực thể database: `pay_system_data` lưu trữ các định nghĩa hệ thống.
- Endpoints CRUD:
  - `GET /api/hrm/settings/pay-system-data`: Lấy danh sách System Data.
  - `POST /api/hrm/settings/pay-system-data`: Thêm mới.
  - `PUT /api/hrm/settings/pay-system-data/:id`: Cập nhật.
  - `DELETE /api/hrm/settings/pay-system-data/:id`: Xóa.
- **Project Structure Guard**: Phải inject đúng `HrmDbService` (từ `../db/hrm-db.service`), tuyệt đối không tự bịa `DatabaseService`.

### 2.2 Frontend (React HRM Web)
- API Client: Thêm vào `hrmApi.ts` các hàm gọi API cho `pay-system-data`. **Phải bao bọc URL bằng dấu nháy đơn** để tránh lỗi syntax Regex.
- Màn hình Settings: Đăng ký tab mới `PaySystemDataSettingsPanel` tại `settingsNavigation.ts` và `Settings.tsx`.
- Context & Import: Tuân thủ cấu trúc của dự án, ví dụ hook `useAuth` phải được import từ `@/contexts/AuthContext` (không phải `@/components/auth/AuthProvider`). Trích xuất `currentCompanyId` trực tiếp từ hook.
