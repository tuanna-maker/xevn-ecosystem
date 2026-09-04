# 29 — UIUX Standards HRM (XeVN Ecosystem)
> **Áp dụng cho:** mọi màn hình HRM — Settings, Policy, Payroll, Attendance, Employee  
> **Đọc kèm:** `25-SOLID-AND-CODING-CONVENTION.md` · `26-DEV-LANES-WEB-MOBILE-BE.md` · `28-FE-BE-SEPARATION-DISPLAY-READY.md`  
> **Tham chiếu ngoài:** SAP Fiori Design Guidelines · Workday Canvas Design System · Oracle Redwood UX

---

## A. QUY TẮC CHUNG — ÁP DỤNG MỌI MÀN HÌNH

### A.1 Quy tắc Mandatory (vi phạm = reject QA)

| # | Quy tắc | Lý do |
|---|---------|-------|
| **A-01** | Mọi danh sách (list) phải có ô **Search/Filter** phía trên table | SAP Fiori: "Search must always be present in a list" |
| **A-02** | Mọi popup tạo mới / sửa phải là **Drawer hoặc Modal**, không navigate page mới | Giữ context |
| **A-03** | Mọi form phải có nút **Hủy** và **Lưu** (disabled khi chưa có thay đổi) | Prevent accidental saves |
| **A-04** | **Loading state** bắt buộc mọi async call (Skeleton, không spinner toàn trang) | Perceived performance |
| **A-05** | **Empty state** phải có icon + text mô tả + CTA nếu user có quyền tạo | UX completeness |
| **A-06** | **Toast notification** sau mỗi action: Success (xanh) / Error (đỏ) / Warning (vàng) | Feedback loop |
| **A-07** | Số tiền: format `1.000.000 đ` (nhóm nghìn, không decimal) | VND standard |
| **A-08** | Ngày tháng: hiển thị `dd/MM/yyyy`, input dùng DatePicker (không nhập tay) | vi-VN |
| **A-09** | Confirm dialog bắt buộc trước Xóa / Khóa / Hủy kỳ lương | Destructive action guard |
| **A-10** | Platform/system rows: disabled Edit+Delete, badge "Hệ thống", tooltip giải thích | Prevent confusion |

### A.2 Input Component Types — Bảng tra cứu BẮTBUỘC đọc trước khi spec

| Tình huống | Component | Cấu hình |
|-----------|-----------|---------|
| Chọn 1 giá trị, danh sách tĩnh ≤10 items | `<Select>` thường | Không cần search |
| Chọn 1 giá trị, danh sách động / nhiều | `<Select>` + **search** (combobox) | Debounce 300ms, placeholder "Tìm kiếm..." |
| Chọn **nhiều** giá trị | `<MultiSelect>` + **search + checkbox** | Hiển thị count "3 đã chọn", nút Xóa hết |
| Nhập số tiền VND | `<InputNumber>` | Format nhóm nghìn, suffix "đ", min=0 |
| Nhập ngày | `<DatePicker>` | Format dd/MM/yyyy, KHÔNG cho nhập tay |
| Nhập khoảng ngày | `<DateRangePicker>` | Validate from ≤ to |
| Nhập % tỷ lệ | `<InputNumber>` | suffix "%", min=0, max=100, step=0.1 |
| Bảng dữ liệu tier (bậc thang) | **Editable Grid** | Nút "+ Thêm dòng" cuối bảng, icon 🗑 xóa dòng |
| Upload Excel | `<FileUpload>` | Accept .xlsx/.xls, preview tên file + size |
| Chọn màu | Color picker | 12 preset + hex manual |
| Chọn icon | Icon picker | Grid 20-30 icon, search theo tên |

---

## B. QUY TẮC SETTINGS SCREEN

> **Mọi màn Settings đều có:** Danh sách + Tìm kiếm + Popup thêm/sửa. Không có ngoại lệ.

### B.1 Layout chuẩn (LUÔN ÁP DỤNG)

```
[Breadcrumb: Settings / Lương / Tên màn hình]

[Tiêu đề màn hình]                     [+ Thêm {entity}]

[🔍 Search: _______________] [Lọc ▼]

TABLE:
| COL1 | COL2 | COL3 | Trạng thái | ⚙️ |
|------|------|------|------------|-----|
| ...  | ...  | ...  | [badge]    | ⋮  | ← dropdown: Sửa | Xóa

                         Trang 1/5  [<] [>]
```

### B.2 Popup Thêm/Sửa — Right Drawer (width: 480px desktop / fullscreen mobile)

```
[← Quay lại]  Thêm {entity}    [✕]

* Mã:     [___________]      ← uppercase auto, unique real-time check
* Tên:    [___________]
  Icon:   [🎯 Chọn icon]     ← icon picker grid
  Màu:    [■ ■ ■ ■ ■ ■]     ← 12 color preset
  Thứ tự: [___]              ← number
  Ghi chú:[___________]

[Hủy]                [💾 Lưu]  ← disabled khi form chưa valid
```

### B.3 Rules riêng Settings

| # | Rule |
|---|------|
| **B-01** | Search placeholder: "Tìm theo mã hoặc tên..." |
| **B-02** | Action column: icon ⋮ dropdown (Sửa / Xóa), KHÔNG dùng button thô |
| **B-03** | Pagination: "X–Y trong Z kết quả", page size 20 mặc định |
| **B-04** | Status badge: Active=xanh, Inactive=xám, Hệ thống=tím |
| **B-05** | Sort: click header để sort, icon ↑↓ khi active |
| **B-06** | Unique field: real-time check khi blur, error inline bên dưới |
| **B-07** | Drawer width: 480px desktop, fullscreen mobile |

---

## C. QUY TẮC POLICY BUILDER SCREEN

### C.1 Luồng điều hướng 3 màn

```
Menu Lương → Chính sách
  └── [Màn 1] Group Hub: 6 cards nhóm (Lương/Thưởng/Phụ cấp/Phạt/BHXH/Thuế)
        └── [Màn 2] Policy List: danh sách + search + filter
              └── [Màn 3] Policy Builder: Header + Target + Components + Params
```

### C.2 Màn 1 — Group Hub
- Grid 3 cột card: icon + màu nền + tên + số CS active + badge "Hệ thống"
- Platform card: không có nút Sửa/Xóa, bấm vào → vào Policy List của nhóm đó
- Nút "+ Thêm nhóm" (HR_ADMIN only): mở drawer Settings nhóm

### C.3 Màn 2 — Policy List
- Search + Filter: [🔍 search] [Nhóm đối tượng <MultiSelect+search>] [Trạng thái <Select>]
- Filter tags hiển thị active filters, bấm × để xóa
- Table columns: Tên | Đối tượng | Hiệu lực từ | Trạng thái | ⚙️

### C.4 Màn 3 — Policy Builder

**Header Section:**
| Field | Component | Notes |
|-------|-----------|-------|
| Tên chính sách | Text input | Required |
| Nhóm chính sách | Select + search | Fetch từ pay_policy_groups |
| Nhóm đối tượng (pay_group) | Select + search | LX_TUYEN, DPHH, TONG_DAI... |
| Tỉnh/Khu vực | MultiSelect + search + checkbox | ND, NB, TB, PT, YB, HN... |
| Loại xe | MultiSelect + search + checkbox | QKR_2T, NPR_35T... (hiện khi pay_group=LX_TAI) |
| Hiệu lực từ | DatePicker | Required |
| Hiệu lực đến | DatePicker | Optional (trống = không có ngày kết thúc) |

**Component List (Danh sách thành phần tính lương):**
- Drag-drop sort (icon ≡ để kéo)
- Columns: # | Loại | Tên | Nguồn input | Giảm trừ? | ⚙️
- Giảm trừ = true: row highlight đỏ nhẹ
- Bấm row → Expand params viewer inline (accordion)
- Nút "+ Thêm thành phần" → Drawer chọn component_type

**Params Editor theo Pattern:**

FLAT: `Mức tiền: [___] đ`

TIERED (Editable Grid):
```
| Từ   | Đến  | Đơn giá | [🗑] |
|------|------|---------|------|
| 0    | 100  | 65,000  | [🗑] |
| 101  | ∞    | 70,000  | [🗑] |
[+ Thêm dòng]
```

POOL:
```
Pool key:  [Select: TD_1500/TD_1731 ▼]
Chia theo: [Select: Cuộc nghe/Giờ công/Ngày công ▼]
≥50%:      [Select: 100%/50% ▼]
```

CONDITIONAL:
```
Mức thưởng: [___] đ
Hiệu lực:   [📅 from] → [📅 to]
Điều kiện:  [+ Thêm]
  ☑ Ngày công ≥ [24] ngày
  ☑ Không nghỉ: [MultiSelect: T6, T7, CN]
```

---

## D. QUY TẮC ATTENDANCE SCREEN

### D.1 Layout Bảng Công Web
- Header: Tháng picker [< MM/YYYY >] + [Phòng ban MultiSelect] + [Import Excel]
- Search: tìm theo tên nhân viên
- Table: grid nhân viên × ngày trong tháng
- Cell click → popup nhỏ chọn loại công (Đi làm/Nghỉ phép/Nghỉ không phép/Nghỉ bù)
- Summary columns cuối: Tổng công | Ngày CN | Ngày T7 | Tổng

---

## E. QUY TẮC AGENT — KHÔNG BAO GIỜ VI PHẠM

| # | Quy tắc | Hậu quả |
|---|---------|---------|
| **E-01** | KHÔNG xóa code hiện có khi thêm tính năng. Chỉ ADD, không REPLACE logic đang chạy | Regression |
| **E-02** | Dùng `multi_replace_file_content` cho patch nhỏ; `write_to_file` Overwrite chỉ khi viết lại hoàn toàn | Mất code |
| **E-03** | Đọc file hiện tại trước khi sửa (view_file hoặc Get-Content) | Sửa mù |
| **E-04** | SRP: thêm tính năng → kiểm tra service còn đúng SRP không → nếu không, tách service mới | God-service |
| **E-05** | OCP: ADD class/function mới thay vì sửa core đang chạy | Regression |
| **E-06** | Test phải xanh trước khi gọi "xong" | Fake done |
| **E-07** | Không hardcode business rules trong UI (giá, tỷ lệ, ngưỡng). Mọi thứ từ API/params | Unconfigurable |
| **E-08** | Mọi UIUX Spec phải có: Layout + Component types + Empty state + Loading state + Toast | Thiếu spec |

---

*File này là SoT cho UIUX convention HRM. Mọi sub-agent viết UIUX Spec phải đọc và tuân thủ file này.*
