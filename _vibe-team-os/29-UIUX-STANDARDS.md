# 29 — UIUX Standards & Product Design System (XeVN OS / X-BOS / HRM)

> **Single Source of Truth cho UI/UX:** Áp dụng cho mọi hệ thống — Command Center, Portal, HRM, Settings, Policy, Payroll, Attendance, Employee, Mobile.
> **Đọc kèm:** `25-SOLID-AND-CODING-CONVENTION.md` · `28-FE-BE-SEPARATION-DISPLAY-READY.md` · `41-UIUX Spec & FE-BE Binding.md`
> **Tham chiếu chuẩn:** SAP Fiori Design Guidelines · Workday Canvas Design System · Apple Human Interface Guidelines (HIG) · Oracle Redwood UX

---

## 1. DESIGN TOKEN DISCIPLINE

### 1.1 Canonical Source
- `apps/web/hrm/tailwind.config.ts` (`xevn.*` + HSL `--xevn-color-*`) là **Single Source of Truth** cho màu sắc, khoảng cách (spacing), bo góc (radius), đổ bóng (shadow) và kiểu chữ (typography).
- Tất cả các giá trị hex tương ứng được đồng bộ trong `apps/web/web-portal` và `apps/web/x-bos-core`.

### 1.2 Forbidden Patterns (CẤM VI PHẠM)
- **CẤM** tự ý đưa màu inline vào từng màn hình mà không map về token `xevn.*` hoặc shadcn canonical HSL.
- **CẤM** hardcode các style tối màu (`#1a1f2e`, `#2a2f45`) trong các màn hình Command Center / HRM khi đang chạy Light Theme.
- **CẤM** thêm màu thương hiệu mới khi chưa có sign-off từ SA + khai báo CSS var trong `:root` (`apps/web/hrm/src/index.css`).
- **CẤM** dùng 2 giá trị primary khác nhau giữa các sub-app (`xevn-primary` phải đồng nhất 100%).

### 1.3 Module Tints Rule
- Màu tint của các phân hệ HRM chỉ dùng cho **accent** (trang trí icon, chips, empty-state glyphs). Tuyệt đối không thay thế `--xevn-color-primary`.

---

## 2. UNIVERSAL UX RULES — QUY TẮC BẮT BUỘC MỌI MÀN HÌNH

### 2.1 Mandatory Rules (Vi phạm = Reject QA)

| # | Quy tắc | Lý do |
|---|---------|-------|
| **U-01** | Mọi danh sách (list) >= 10 items **PHẢI** có ô **Search/Filter** phía trên table | SAP Fiori: "Search must always be present in a list" |
| **U-02** | Tạo mới / Chỉnh sửa: Dùng **Full-page Wizard, Right Drawer, hoặc Modal**, KHÔNG navigate trang mới làm mất context | Giữ bối cảnh làm việc |
| **U-03** | Mọi form **PHẢI** có nút **[Hủy]** và **[Lưu]** — nút [Lưu] disabled khi chưa có thay đổi hoặc form invalid | Tránh vô tình lưu dữ liệu rác |
| **U-04** | Mọi async call **PHẢI** có **Loading State** (Skeleton rows/cards, KHÔNG dùng spinner toàn trang) | Tăng trải nghiệm Perceived Performance |
| **U-05** | Mọi trang dữ liệu rỗng **PHẢI** có **Empty State**: Icon + Text mô tả + Nút CTA tạo mới nếu có quyền | Tránh cảm giác phần mềm bị lỗi |
| **U-06** | Sau mỗi action **PHẢI** có **Toast Notification**: Success (xanh) / Error (đỏ) / Warning (vàng) | Phản hồi ngay lập tức cho người dùng |
| **U-07** | Hành động Xóa / Khóa / Hủy **PHẢI** có **Confirm Dialog** xác nhận trước | Destructive action guard |
| **U-08** | Dữ liệu "Hệ thống" (Platform/System rows): **Disabled Edit + Delete**, gắn badge "Hệ thống" | Chống xóa nhầm dữ liệu gốc |
| **U-09** | Input Ngày tháng: **PHẢI** dùng `<DatePicker>`, KHÔNG cho nhập tay chuỗi tự do | Chống format sai / timezone bug |
| **U-10** | Ô tìm kiếm (Search Input) **PHẢI** hỗ trợ **debounce 300ms** trước khi gọi API | Tránh spam request lên Server |
| **U-11** | Tiền tệ VND: Format dạng số nguyên nhóm nghìn `1.000.000 đ` (không dùng float/decimal) | VND Standard |

### 2.2 Input Component Matrix — BẢNG TRA CỨU BẮT BUỘC

| Tình huống | Component | Cấu hình bắt buộc |
|-----------|-----------|-------------------|
| Chọn 1 giá trị, danh sách tĩnh <= 10 items | `<Select>` | Không cần search |
| Chọn 1 giá trị, danh sách động / nhiều items | `<Select>` + Search (combobox) | Debounce 300ms, placeholder "Tìm kiếm..." |
| Chọn nhiều giá trị | `<MultiSelect>` + Search + Checkbox | Nút "Xóa hết" + nhãn "N đã chọn" |
| Nhập số tiền VND | `<ViMoneyInput>` / `<InputNumber>` | Format nhóm nghìn, suffix "đ", min=0 |
| Nhập phần trăm % | `<InputNumber>` | Suffix "%", min=0, max=100, step=0.1 |
| Nhập ngày / khoảng ngày | `<DatePicker>` / `<DateRangePicker>` | Format `dd/MM/yyyy`, validate `from <= to` |
| Bảng dữ liệu ngạch bậc / bậc thang | **Editable Grid** | Nút "+ Thêm dòng", icon 🗑 xóa dòng |
| Upload file Excel / chứng từ | `<FileUpload>` | Accept types rõ ràng, preview tên file + dung lượng |

---

## 3. LAYOUT PATTERNS & QUALITY GATES

### 3.1 Settings & Policy Screen Standard Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Breadcrumb: Module / Sub-module / Tên màn hình                   │
│ [Tên màn hình]                                [+ Tạo chính sách] │
├──────────────────────────────────────────────────────────────────┤
│ [🔍 Tìm theo tên...] [Bộ lọc trạng thái ▼]       9 chính sách    │
├──────────────────────────────────────────────────────────────────┤
│ TABLE (Light Theme Command Center):                              │
│ | TÊN CHÍNH SÁCH | MÃ NHÓM | HIỆU LỰC | TRẠNG THÁI | THAO TÁC | │
│ | Lương giám đốc | GRADE   | 01/08/2026| [🟢 Đang áp dụng] | ⋮  │ │
├──────────────────────────────────────────────────────────────────┤
│ Hiển thị 1–20 trong 100 kết quả            [ < ]  1  2  3  [ > ] │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Policy Builder Workflow (3 Màn Nguyên Bản)

```
Menu Lương → Chính sách
  └── [Màn 1] Group Hub: 6 cards nhóm (Lương / Thưởng / Phụ cấp & Giá / Phạt / BHXH / Thuế)
        └── [Màn 2] Policy List Panel: Danh sách chính sách thuộc nhóm + Search + Status Filter
              └── [Màn 3] Policy Builder Screen: Full-page Apple-style Light Wizard (Định nghĩa → Cấu trúc/Tài chính → Điều kiện)
```

### 3.3 UX Quality Gates (Nielsen & WCAG 2.2 AA)
- **Contrast Ratio (1.4.3)**: Chữ đen mờ `#0f172a` trên nền trắng `#ffffff`. CẤM dùng chữ xám mờ trên nền xám.
- **Keyboard Access (2.1.1)**: Mọi dialog và action menu phải thao tác được bằng bàn phím (Esc, Enter, Tab).
- **Tab Explosion Prevention**: Không tạo thêm tab phụ chật chội; tối đa 2 click levels cho mọi tác vụ thường nhật.

---

## 4. MOBILE HIG COMPLIANCE (iOS & Android)

- **Touch Target**: Tối thiểu 44x44 pt (iOS) / 48x48 dp (Android).
- **Tab Bar**: Tối đa 5 items chính trên Bottom Navigation Bar.
- **Safe Area**: Bắt buộc hỗ trợ `env(safe-area-inset-bottom)`.

---

## 5. COMMAND CENTER PORTAL DIALOG STANDARDS (SOLID FE)

### 5.1 Portal Mount Rule (CẤM VI PHẠM)
- Mọi Popup Modal trong ứng dụng HRM khi chạy Embed trong Command Center **PHẢI** sử dụng primitive `@/components/ui/dialog` (`<Dialog>` và `<DialogContent>`).
- **TUYỆT ĐỐI CẤM** dùng thẻ `<div className="fixed inset-0">` tự tạo vì sẽ bị giới hạn bởi khung iframe/sub-container làm cho nội dung bị lọt thỏm.

### 5.2 Layout Màn hình Cấu hình Chính sách Lương (Policy Engine Screen)
- Màn hình Cấu hình Chính sách (`PolicyBuilderScreen`) là Popup Modal full-screen (`max-w-[96vw] w-[1450px] h-[93vh]`) hiển thị **3 Cột song song**:
  1. **Cột 1:** Định nghĩa chính sách (Tên, 4 thẻ cấu trúc bảng lương, Phạm vi áp dụng).
  2. **Cột 2:** Quy tắc & Điều kiện (Rules, Targeting rules theo Chức danh/Phòng ban/Loại HĐ).
  3. **Cột 3:** Cấu hình Bảng giá trị (Tariff Matrix - Ngạch/Bậc 2 chiều, Mức tiền VND).
- **Header:** Nút Quay lại `←`, Tên chính sách, Badge trạng thái `ACTIVE/DRAFT`, Nút `Đóng` và Nút `Hoàn tất & Lưu Chính sách` (Blue primary button).

## 6. MASTER SETTINGS & DYNAMIC POLICY ELIGIBILITY STANDARDS (Learned 2026-09-03)

### 6.1 Master Settings Integration & Sync Rule
- Tất cả Master Data (Khu vực / Vùng miền, Chi nhánh / Bưu cục, Ngạch / Bậc, Chức danh, Hợp đồng) được quản lý tại Master Settings (`/hr/settings`).
- Tất cả các phân hệ: Hợp đồng, Hồ sơ Nhân sự, Chính sách Lương, Bảng lương **PHẢI** nạp động từ Master Settings, CẤM hardcode dữ liệu trong UI/Logic.

### 6.2 Hierarchy Policy Eligibility Overriding Rules
- **Thứ tự Ghi đè Ưu tiên Phân cấp:**
  1. `Cá nhân (Individual Assignment)` (Ưu tiên 1 - Cao nhất)
  2. `Chi nhánh / Bưu cục (Branch / Office)` (Ưu tiên 2)
  3. `Khu vực / Vùng miền (Location / Zone)` (Ưu tiên 3)
  4. `Chức danh / Phòng ban (Position / Dept)` (Ưu tiên 4)
  5. `Toàn công ty (Global)` (Ưu tiên 5 - Mặc định)
- **Minh bạch Nguồn gốc (Traceability):** Bảng lương & Payslip hiển thị chi tiết tên chính sách và tầng ưu tiên được áp dụng cho từng nhân viên.

