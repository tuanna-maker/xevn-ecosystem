# PO-HRM-EMP-PROFILE-CATALOG-SRS-01.md — SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## QUẢN LÝ HỒ SƠ NHÂN VIÊN & TRA CỨU DANH MỤC NHÂN SỰ

---

## 1. MỤC ĐÍCH VÀ PHẠM VI (PURPOSE & SCOPE)

Tài liệu này quy định chi tiết Yêu cầu Phần mềm (**Software Requirements Specification - SRS**) áp dụng cho phân hệ **Quản lý Nhân sự & Hồ sơ Nhân viên (Employee Profile & Core Personnel Management)** thuộc hệ thống HRM XeVN.

### 1.1. Phạm vi áp dụng
- **Màn hình Danh sách Nhân viên (`/command-center/hrm/employees`)**: Hiển thị bảng danh sách, bộ lọc, menu thao tác 1-click.
- **Màn hình Chi tiết Profile Nhân viên (`/command-center/hrm/employees/:id`)**: Hiển thị ảnh đại diện, thông tin công việc, thông tin cá nhân, sơ yếu lý lịch.
- **Hộp thoại Popup Thêm / Sửa Nhân viên (`EmployeeFormDialog.tsx`)**: Bố cục 3 vùng mật độ cao, tự động lọc bỏ trường trùng lặp.
- **Bộ chuyển đổi Nhãn Danh mục (`labelMaps.ts`)**: Tra cứu chuyển đổi 100% mã thô catalog (`DEPT_02`, `POS_01`, `male`...) thành nhãn đọc được.

---

## 2. QUY TẮC NGHIỆP VỤ (BUSINESS RULES)

### BR-EMP-01: Quy Tắc Tra Cứu Nhãn Danh Mục Hiển Thị (Anti-Raw Catalog Key Leakage)
1. **Không hiển thị mã thô DB / Catalog Key ra UI:**
   - Mọi thuộc tính danh mục (*Phòng ban, Chức vụ, Loại hình nhân sự, Giới tính, Trạng thái*) **BẮT BUỘC** phải tra cứu và hiển thị nhãn tiếng Việt đọc được của con người (VD: "Vận hành", "Đội trưởng Lái xe", "Nam", "Toàn thời gian").
   - Nghiêm cấm in trực tiếp các mã thô DB như `DEPT_01`, `DEPT_02`, `POS_03`, `LEGAL_SPECIALIST` lên bất kỳ bảng danh sách, thẻ profile hay hộp thoại xem thông tin.

### BR-EMP-02: Quy Tắc Đóng Menu Thao Tác 1-Click (Dropdown Dismissal)
1. **Tự động đóng Menu Popover khi kích hoạt hành động:**
   - Khi người dùng nhấp chọn bất kỳ mục thao tác nào ("Xem", "Chỉnh sửa", "Xóa") tại Menu Dropdown ở bảng danh sách ➔ Menu Popover **BẮT BUỘC TỰ ĐỘNG ĐÓNG ẨN NGAY LẬP TỨC**.
   - Nghiêm cấm sử dụng `e.preventDefault()` trong sự kiện `onSelect` / `onClick` gây giữ nguyên trạng thái mở của popover đè lên backdrop của Dialog Modal.

### BR-EMP-03: Quy Tắc Dự Phòng Chuỗi Dịch i18n Safe Fallback
1. **Cung cấp `defaultValue` cho 100% hàm dịch `t('key')`:**
   - Mọi lệnh gọi hàm dịch `t('key')` trên giao diện **BẮT BUỘC** phải có phương án dự phòng tiếng Việt `{ defaultValue: 'Nhãn Tiếng Việt' }` HOẶC đối soát 100% key đã tồn tại trong file từ điển (`vi.json`, `en.json`).
   - Nghiêm cấm gọi key trơ trọi như `t('employeeForm.genderMale')` mà không có key trong JSON và không có fallback, khiến hệ thống rò rỉ mã thô `employeeForm.genderMale` ra giao diện.

### BR-EMP-04: Quy Tắc Chống Trùng Lặp Trường & Chuẩn Hóa SOLID FE
1. **Một thuộc tính định danh chỉ xuất hiện 1 lần:**
   - Đã có *Ngày sinh* (`birth_date`) ➔ Nghiêm cấm hiển thị thêm *Năm sinh* (`birth_year`).
   - Đã có *Số CMND/CCCD* (`id_number`) ➔ Nghiêm cấm hiển thị thêm *CCCD* (`cccd`).
   - Đã có *Họ và tên* (`full_name`) ➔ Nghiêm cấm hiển thị thêm *Tên nhân viên* (`name`).

### BR-EMP-05: Quy Tắc Font Chữ 14px, Nét Đen & Border Tương Phản Cao
1. **Font size tối thiểu 14px (`text-sm`) cho Form Controls:**
   - Tất cả ô nhập liệu (`<Input>`), Select (`<Select>`), Picker (`<CatalogSearchPicker>`), Chọn ngày (`<ViDatePickerField>`), Nhãn field (`<FormLabel>`) **BẮT BUỘC** có font size tối thiểu 14px.
2. **Border rõ nét:**
   - Tất cả Form Control phải có đường viền border rõ ràng (`border-slate-300` / `#cbd5e1`). Nghiêm cấm dùng màu xám quá nhạt gây mờ mắt.

---

## 3. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)

- **AC-SRS-EMP-01**: Truy cập Hồ sơ nhân viên (`/employees/:id`) ➔ Thẻ "Thông tin công việc" và nhãn dưới Avatar hiển thị "Vận hành" (không hiển thị `DEPT_02`).
- **AC-SRS-EMP-02**: Mở Dropdown "Giới tính" trong Form Thêm/Sửa ➔ Các tùy chọn hiển thị "Nam", "Nữ", "Khác" (không hiển thị `employeeForm.genderMale`).
- **AC-SRS-EMP-03**: Nhấp "Chỉnh sửa" tại menu hàng trong Bảng danh sách ➔ Popover menu tự đóng ẩn, Modal Popup "Chỉnh sửa nhân viên" mở ra sạch sẽ.
- **AC-SRS-EMP-04**: Tất cả các ô nhập liệu Form ➔ Font size ≥ 14px, nét chữ đen đậm (`#0f172a`), border rõ nét (`#cbd5e1`).
- **AC-SRS-EMP-05**: Chạy `npx vitest run` và `npx tsc --noEmit` ➔ Pass 100%, 0 lỗi TypeScript compile.
