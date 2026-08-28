# UI/UX Specification: Payroll Data Source Mapping & Template Assignment

**Version:** 1.0
**Mục tiêu:** Thiết kế lại (Redesign) triệt để UX/UI của module cấu hình Bảng lương để chuyển từ mô hình "Developer-centric" (Auto-mapping ngầm) sang mô hình "User-centric" (Explicit Mapping).

---

## 1. Màn hình Danh mục Thành phần lương (Salary Components)

**Thay đổi mạnh tay:** Trả lại bản chất "Dictionary" cho Thành phần lương. Modal tạo/sửa thành phần lương chỉ đóng vai trò định nghĩa định danh.

### 1.1. Form Thêm/Sửa Thành phần lương (`SalaryComponentForm`)
Modal này được làm cực kỳ tinh gọn, chỉ chứa các thông tin định danh:
- **Mã thành phần (Code):** Viết liền không dấu, in hoa (VD: `LUONG_CB`). Bắt buộc, duy nhất.
- **Tên hiển thị (Name):** Tên sẽ hiển thị trên phiếu lương (VD: `Lương cơ bản`).
- **Loại thành phần (Category):** Dropdown chọn nhóm (Thu nhập, Khấu trừ, Chấm công, Thuế/BHXH, Khác).
*(Hoàn toàn KHÔNG có cấu hình Nguồn dữ liệu, Công thức hay các cờ Thuế/BHXH ở đây).*

---

## 2. Màn hình Thiết kế Mẫu Bảng Lương (Template Builder)

**Cốt lõi mới:** Đây mới là nơi thực hiện "Data Source Mapping". Một Mẫu bảng lương (Template) là tập hợp các Thành phần (Component). Khi người dùng kéo một Thành phần vào Mẫu, họ sẽ phải cấu hình Nguồn dữ liệu cho Thành phần đó **trong phạm vi của Mẫu này**.

### 2.1. Cấu hình Cột Thành Phần (Template Component Settings Panel)
Khi nhấp vào một cột thành phần trong Builder, mở ra một Right Panel (hoặc Dialog) để cấu hình:

- **Dropdown: Nguồn dữ liệu (data_source_type)**
  - Options:
    1. `Từ Hệ thống (Hồ sơ/Hợp đồng)`
    2. `Từ Máy chấm công (Timesheet)`
    3. `Từ File Nhập liệu ngoài (Input Hub)`
    4. `Công thức tự định nghĩa`
    5. `Hằng số / Tự nhập lúc tính lương`

- **Dynamic Select: Khóa ánh xạ (mapping_key)**
  - *Nếu Nguồn = Hồ sơ/Hợp đồng:* Hiển thị Dropdown các trường của Employee (VD: `Mức lương cơ bản`, `Phụ cấp chức vụ`).
  - *Nếu Nguồn = Chấm công:* Hiển thị Dropdown các tham số chấm công (VD: `Tổng ngày công`, `Số giờ tăng ca`).
  - *Nếu Nguồn = Input Hub:* Hiển thị Dropdown các loại Input (VD: `Doanh thu cá nhân`).
  - *Nếu Nguồn = Công thức:* Hiển thị Component `FormulaInput`.
  - *Nếu Nguồn = Hằng số:* Hiển thị một ô Input Number để gõ giá trị mặc định.

- **Checkboxes: Thuộc tính tính toán**
  - `[ ] Thành phần có tính Thuế TNCN (Taxable)`
  - `[ ] Thành phần dùng làm căn cứ đóng BHXH (Social Insurance Basis)`

### 2.2. UX/UI Interactions
- **Visual Feedback:** Khi chọn một Nguồn, hiển thị text mô tả màu xám. (VD: *"Hệ thống sẽ lấy [Mức lương cơ bản] của nhân viên trong Hợp đồng"*).
- **Validation:** Bắt buộc chọn `mapping_key` nếu Nguồn dữ liệu yêu cầu. Mẫu bảng lương sẽ bị đánh dấu "Lỗi cấu hình" (màu đỏ) nếu có cột chưa mapping xong.

---

## 2. Màn hình Gán Bảng Lương (Payroll Template Assignment)

**Thay đổi mạnh tay:** Chuyển từ việc "Lọc theo phòng ban" ẩn bên trong Template sang một Màn hình Quản lý gán trực quan, giải quyết triệt để case 1 nhân viên nhiều bảng lương.

### 2.1. Tab mới: Quản lý Áp dụng Bảng lương (`TemplateAssignmentTab.tsx`)
Nằm ngay cạnh tab Mẫu Bảng Lương, màn hình này được chia làm 2 Panel (Split Pane):

- **Panel Trái: Danh sách Nhân viên (Employee List)**
  - Có thanh Search (Tên, Mã NV).
  - Có Filter theo: Phòng ban, Vị trí, Loại hợp đồng, Trạng thái gán (Chưa gán / Đã gán).
  - Chức năng **Bulk Select (Tick chọn nhiều)**.

- **Panel Phải: Gán Mẫu Bảng Lương (Assignment Configuration)**
  - Trạng thái trống (Empty State): Khi chưa chọn NV nào, hiển thị icon "Chọn nhân viên để bắt đầu gán bảng lương".
  - Khi chọn 1 NV: Hiển thị Profile nhỏ của NV và Danh sách các Bảng lương đang được gán.
  - Khi chọn Nhiều NV (Bulk): Hiển thị "Đang chọn X nhân viên".
  - **Nút "Gán Mẫu Bảng Lương" (+ Add Template)**:
    - Mở một Drawer/Dialog nhỏ hiển thị danh sách các Mẫu bảng lương (Template).
    - Có thể tick chọn 1 hoặc nhiều Mẫu.
    - Cấu hình bổ sung: Ngày bắt đầu hiệu lực (Effective From), Ngày kết thúc hiệu lực (Effective To).
  - **Danh sách đã gán:** Hiển thị dạng Card hoặc Table nhỏ, có nút Xóa (Hủy gán) và Nút Chỉnh sửa (Đổi ngày hiệu lực).

### 2.2. UX giải quyết "Case 1 người 2 bảng lương"
- Khi HR gán Mẫu Bảng lương thứ 2 cho cùng 1 nhân viên, hệ thống KHÔNG báo lỗi. Thay vào đó, hiện một thẻ **Warning mỏng (Màu vàng)**: *"Nhân viên này đang áp dụng 2 bảng lương đồng thời. Hệ thống sẽ sinh ra 2 phiếu lương riêng biệt trong các kỳ tính lương tương ứng."*

---

## 3. Màn hình Tạo Kỳ Lương (Payroll Batch Creation)

### 3.1. Phản hồi UX khi tạo kỳ
- Trước đây: Bấm tạo kỳ, hệ thống chạy scan toàn bộ NV theo phòng ban.
- Hiện tại: Khi bấm "Chạy tính lương", hệ thống sẽ hiển thị một Preview Modal nhỏ báo cáo:
  - *"Đã tìm thấy 142 nhân viên có hiệu lực với Mẫu bảng lương này."*
  - *"Có 3 nhân viên thiếu Hợp đồng lao động, sẽ bị bỏ qua (Click để xem chi tiết)."*
- Màn hình **Timesheet Bind Panel** (Gắn bảng công) sẽ trở nên tường minh hơn: Cột nào đang đợi dữ liệu chấm công sẽ có icon "Đồng hồ" (Syncing) màu xanh lá để người dùng yên tâm.

---

## 4. Trải nghiệm Viết Công thức & Xuất Bảng lương (Formula & Export UX)

### 4.1. Soạn thảo Công thức (Excel-like Formula Input)
- **Tương tác:** Tại ô nhập công thức (cả ở màn Danh mục lẫn màn Template), người dùng gõ `=` sẽ kích hoạt bộ gõ thông minh.
- **Hỗ trợ đầy đủ toán tử & hàm:** Cho phép gõ phép tính cơ bản (`+`, `-`, `*`, `/`) và hỗ trợ gọi hàm từ thư viện HyperFormula (VD: `IF`, `ROUND`, `VLOOKUP`...).
- **Kéo thả / Autocomplete:** Khi gõ tên cột (VD: gõ `P`), hệ thống sẽ hiện popup gợi ý `[P1] Lương cơ bản`, `[P2] Lương trách nhiệm`. Khi chọn, biến số hiển thị dạng thẻ (Chip) thân thiện thay vì code mã vạch khó hiểu.
  - *Ví dụ UX hiển thị:* `=[P1] + [P2]` thay vì `=BASE_SAL + RESP_SAL`.

### 4.2. Chú thích Công thức khi Xuất Excel (Export Annotations)
- **Vấn đề:** Khi xuất bảng lương ra Excel, nhân viên/kế toán nhìn vào số tổng không biết số đó từ đâu ra.
- **Giải pháp UX:** File Excel xuất ra từ hệ thống phải giữ nguyên cấu trúc chú thích (Annotation) ở Header hoặc dạng Comment của Excel.
  - *Ví dụ:* Cột "Tổng thu nhập" sẽ có dòng chú thích ngay bên dưới Header là `(P1 + P2 + Phụ cấp)`.
  - Giữ lại format công thức native của Excel trên ô dữ liệu nếu có thể, để khi click vào ô tổng, user thấy `=C2+D2` thay vì chỉ là giá trị tĩnh `15,000,000`.

---
*End of Spec*
