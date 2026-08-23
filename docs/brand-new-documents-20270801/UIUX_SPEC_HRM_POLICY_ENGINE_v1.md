# UI/UX SPEC — XEVN HRM PAYROLL POLICY ENGINE
## Version 1.0 | 2026-08-22
**Căn cứ:** SRS v1.1 · TechSpec v1.1 · API Contract v1.0

---

## MỤC LỤC MÀN HÌNH

| # | Màn hình | Route | Role |
|---|---------|-------|------|
| S1 | Grade-Step Settings | `/settings/pay-grades` | HR_ADMIN |
| S2 | Employee Profile — Tab Phân loại lương | `/employees/:id/payroll` | HR_MANAGER |
| S3 | Policy List | `/settings/pay-policies` | HR_ADMIN |
| S4 | Policy Builder | `/settings/pay-policies/:id/edit` | HR_ADMIN |
| S5 | Component Form (Dynamic per type) | Modal trong S4 | HR_ADMIN |
| S6 | Policy Preview — Tính thử | `/settings/pay-policies/:id/preview` | HR_ADMIN |
| S7 | Input Data Hub | `/payroll/inputs` | HR_STAFF |
| S8 | Payroll Batch Dashboard | `/payroll/batch` | HR_MANAGER |
| S9 | Payslip Detail (Web) | `/payroll/records/:id/payslip` | HR + EMPLOYEE |
| S10 | Mobile — Payslip | `/(tabs)/payslip` | EMPLOYEE |
| S11 | Mobile — Check-in với Ca | `/(tabs)/checkin` | EMPLOYEE |

---

## S1 — GRADE-STEP SETTINGS
**Route:** `/settings/pay-grades` | **Role:** HR_ADMIN

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚙ Cài đặt  /  Thang bảng lương                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Thang bảng lương                          [+ Tạo QĐ mới] [📜 Lịch sử] │
│  ─────────────────                                                    │
│  📋 Đang hiệu lực: QĐ 2A/2026 (từ 01/01/2026)   [Sửa] [Clone QĐ]   │
│                                                                       │
│  ┌──────────┬────────┬────────┬────────┬────────┬────────┬────────┐  │
│  │  Ngạch   │ Bậc 1  │ Bậc 2  │ Bậc 3  │ Bậc 4  │ Bậc 5  │  ...   │  │
│  ├──────────┼────────┼────────┼────────┼────────┼────────┼────────┤  │
│  │ D1 - CT  │ 22.5M  │ 25.0M  │ 27.5M  │   —    │   —    │   —    │  │
│  │ D2 - PCT │ 18.0M  │ 20.0M  │ 22.0M  │   —    │   —    │   —    │  │
│  │ M1 - TP  │ 8.3M   │ 9.4M   │ 10.5M  │ 11.6M  │   —    │   —    │  │
│  │ M2 - PP  │ 6.8M   │ 7.7M   │  8.6M  │  9.5M  │  10.4M │   —    │  │
│  │ E1 - CV  │ 5.2M   │ 5.9M   │  6.7M  │  7.5M  │   8.4M │  9.3M  │  │
│  │ E2 - NV  │ 4.1M   │ 4.7M   │  5.4M  │  6.1M  │   6.9M │  7.7M  │  │
│  │ LX1      │ 6.5M   │ 7.3M   │  8.1M  │  8.9M  │   9.7M │ 10.5M  │  │
│  │ LX2      │ 5.8M   │ 6.5M   │  7.2M  │  7.9M  │   8.6M │  9.3M  │  │
│  │ ...      │  ...   │  ...   │  ...   │  ...   │  ...   │  ...   │  │
│  └──────────┴────────┴────────┴────────┴────────┴────────┴────────┘  │
│                                                                       │
│  💡 Click vào ô để sửa số. Tab để sang ô tiếp theo.                   │
│  ⚠ Chỉnh sửa trực tiếp sẽ tạo "bản nháp" — cần Xác nhận để lưu.    │
│                                                                       │
│                              [Hủy] [💾 Xác nhận thay đổi]             │
└─────────────────────────────────────────────────────────────────────┘
```

### States
| State | UI |
|-------|----|
| **View mode** | Cells read-only, số hiển thị dạng `8.3M` (rút gọn) |
| **Edit mode** | Click ô → input text, format VND, Tab di chuyển |
| **Has unsaved changes** | Header badge đỏ "Có X thay đổi chưa lưu" |
| **Saving** | Button disabled, spinner |
| **Ô trống (bậc max)** | Hiển thị `—`, không nhập được |

### Interactions
- **Click `+ Tạo QĐ mới`** → Modal: Nhập số QĐ, ngày hiệu lực → Clone bảng hiện tại → Mở edit mode bảng mới
- **Click `[Lịch sử]`** → Side panel: timeline các QĐ (ngày hiệu lực, người tạo, số QĐ)
- **Click `[Clone QĐ]`** → Shortcut tạo QĐ mới từ bảng đang xem
- **Inline edit** → Enter để confirm ô, Escape để hủy ô
- **Ô bị thay đổi** → Highlight vàng nhạt + icon ✏

### Validation
- Giá trị âm → reject + shake animation
- Bậc N phải ≥ Bậc N-1 → warning (không block, vì có thể đang sửa dở)
- Confirm mà có ô warning → dialog xác nhận "Một số bậc giảm so với bậc trước, tiếp tục?"

---

## S2 — EMPLOYEE PROFILE: TAB PHÂN LOẠI LƯƠNG
**Route:** `/employees/:id` (Tab "Lương & Chính sách") | **Role:** HR_MANAGER

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  👤 Nguyễn Văn A — EMP-001                                          │
│  [Thông tin] [Hợp đồng] [Chấm công] [Lương & Chính sách] [Kỷ luật] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  PHÂN LOẠI LƯƠNG                              [✏ Chỉnh sửa]         │
│  ───────────────────────────────────                                  │
│  Nhóm lương        LX Tuyến (LX_TUYEN)                               │
│  Tỉnh định biên    Nam Định (ND)                                      │
│  Ngạch hiện tại    E2 — Nhân viên lái xe       [Lịch sử ngạch-bậc]  │
│  Bậc hiện tại      3 / 6  (tối đa 6 bậc)                            │
│  Lương ngạch-bậc   6,100,000 VND/tháng                               │
│  Thử việc          Không                                              │
│                                                                       │
│  CHÍNH SÁCH ĐANG ÁP DỤNG                                             │
│  ─────────────────────────────────────────────────────               │
│  📋 Lương LX Tuyến Nam Định v2                                        │
│     Hiệu lực từ 01/09/2025  ·  8 thành phần                         │
│     [Xem chi tiết chính sách]                                         │
│                                                                       │
│  ĐỀ XUẤT NÂNG BẬC                                                    │
│  ────────────────────────────                                          │
│  ✅ Đủ điều kiện nâng lên Bậc 4                                       │
│     • 2.3 năm liên tục ✓  • KPI TB 85.2% (4 kỳ) ✓  • Kỷ luật: 0 ✓ │
│                                            [📝 Tạo đề xuất nâng bậc] │
│                                                                       │
│  LỊCH SỬ PHÂN LOẠI                                                    │
│  ─────────────────────────────────────────────────────               │
│  01/09/2024  E2 Bậc 2  →  Bậc 3  (QĐ 416/2024 · HR Trần Thị B)     │
│  01/01/2024  Gán ngạch E2 Bậc 2  (Ký HĐ chính thức)                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Modal Chỉnh sửa phân loại

```
┌──────────────────────────────────────────────┐
│  Chỉnh sửa phân loại lương                   │
│  ──────────────────────────────────────────  │
│  Nhóm lương *   [LX Tuyến ▼]                 │
│  Tỉnh định biên [Nam Định ▼]  (hiện khi LX_TUYEN)│
│  Ngạch          [E2 - NV Lái xe ▼]           │
│  Bậc            [3 ▼]                         │
│  Ngày hiệu lực  [01/09/2026]  📅              │
│  Lý do          [________________________]   │
│  Thử việc       ○ Không  ○ Có → Đến ngày: [] │
│  ──────────────────────────────────────────  │
│                     [Hủy]  [Lưu thay đổi]   │
└──────────────────────────────────────────────┘
```

### Tự động tính
- Khi chọn Ngạch + Bậc → hiển thị preview "Lương ngạch-bậc: X,XXX,XXX đ/tháng"
- Khi chọn Nhóm lương → lọc danh sách Ngạch phù hợp

---

## S3 — POLICY LIST
**Route:** `/settings/pay-policies` | **Role:** HR_ADMIN

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚙ Cài đặt  /  Chính sách lương                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  [🔍 Tìm tên chính sách]  [Nhóm lương ▼]  [Trạng thái ▼]           │
│                                                      [+ Tạo mới]    │
│  ─────────────────────────────────────────────────────               │
│                                                                       │
│  ● ĐANG HIỆU LỰC (6)                                                  │
│  ─────────────────────────────────────────────────────               │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  LX Tuyến Nam Định v2          LX_TUYEN  ● Active  v2        │   │
│  │  Hiệu lực: 01/09/2025 → nay  ·  8 thành phần                │   │
│  │                   [Xem] [Clone] [Phân công]                  │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  LX Tải Hà Nội v3              LX_TAI    ● Active  v3        │   │
│  │  Hiệu lực: 01/01/2026 → nay  ·  11 thành phần               │   │
│  │                   [Xem] [Clone] [Phân công]                  │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  ĐPHH v1                        DPHH      ● Active  v1        │   │
│  │  Hiệu lực: 01/07/2024 → nay  ·  7 thành phần                │   │
│  │                   [Xem] [Clone] [Phân công]                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ○ NHÁP (2)      ▸  (click để mở rộng)                               │
│  ○ LƯU TRỮ (12)  ▸                                                    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## S4 — POLICY BUILDER
**Route:** `/settings/pay-policies/:id/edit` | **Role:** HR_ADMIN

### Layout tổng thể (2 cột)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚙ Chính sách  /  LX Tuyến Nam Định v2  [● Nháp]   [Lưu] [Kích hoạt]│
├───────────────────────────────┬─────────────────────────────────────┤
│  THÔNG TIN                    │  THÀNH PHẦN LƯƠNG                   │
│  ─────────────────────────    │  ─────────────────────────────────  │
│  Tên *  LX Tuyến Nam Định v2  │                    [+ Thêm thành phần]│
│  Nhóm * [LX Tuyến ▼]         │                                     │
│  Hiệu lực từ * [01/09/2025]  │  INCOME (7)                         │
│  Hiệu lực đến  [—]           │  ┌─────────────────────────────┐   │
│  Mô tả                        │  │ ⠿  1. Lương cơ bản ngạch-bậc│   │
│  [________________]           │  │    grade_base  ·  ATT       │   │
│                               │  │                   [✏] [🗑] │   │
│                               │  ├─────────────────────────────┤   │
│  PHÂN CÔNG (42 NV)            │  │ ⠿  2. Lương lượt            │   │
│  ─────────────────────────    │  │    trip_rate_tiered  ·  XLS │   │
│  [Xem danh sách]              │  │    Nam Định ·  2 tier       │   │
│  [+ Thêm nhân viên]           │  │                   [✏] [🗑] │   │
│                               │  ├─────────────────────────────┤   │
│  VERSION                      │  │ ⠿  3. DT × CLDV             │   │
│  ─────────────────────────    │  │    revenue_quality  ·  XLS  │   │
│  v1  01/04/2025 (Lưu trữ)    │  │                   [✏] [🗑] │   │
│  v2  01/09/2025 (Đang xem)   │  ├─────────────────────────────┤   │
│                               │  │ ⠿  4. Thưởng chuyên cần     │   │
│  QĐ LIÊN QUAN                 │  │    attendance_bonus_cond ·ATT│   │
│  QĐ 439/2025                  │  │    01/04–31/05/2026 · 1M/th │   │
│                               │  │                   [✏] [🗑] │   │
│                               │  ├─────────────────────────────┤   │
│                               │  │ ⠿  5. Ăn ca Chủ nhật        │   │
│                               │  │    meal_allowance_cond ·ATT │   │
│                               │  │                   [✏] [🗑] │   │
│                               │  ├─────────────────────────────┤   │
│                               │  ├─────────────────────────────┤   │
│                               │  DEDUCTION (3)                      │
│                               │  ├─────────────────────────────┤   │
│                               │  │ ⠿  6. Giảm trừ bảo dưỡng   │   │
│                               │  │    vehicle_repair_deduction  │   │
│                               │  │    10% chi phí nhóm         │   │
│                               │  │                   [✏] [🗑] │   │
│                               │  ├─────────────────────────────┤   │
│                               │  │ ⠿  7. BHXH + BHYT + BHTN   │   │
│                               │  │    insurance_deduction ·AUTO│   │
│                               │  │    Lương ngạch-bậc ·8%+1.5%│   │
│                               │  │                   [✏] [🗑] │   │
│                               │  ├─────────────────────────────┤   │
│                               │  │ ⠿  8. Thuế TNCN             │   │
│                               │  │    pit_deduction ·AUTO      │   │
│                               │  │                   [✏] [🗑] │   │
│                               │  └─────────────────────────────┘   │
│                               │                                     │
│                               │         [👁 Tính thử]               │
└───────────────────────────────┴─────────────────────────────────────┘
```

### Interaction — Component list
- **Drag handle `⠿`** → kéo thả để sắp xếp thứ tự (sort_order)
- **Badge `XLS`** → input từ Excel import
- **Badge `ATT`** → input từ hệ thống chấm công
- **Badge `AUTO`** → tự động tính từ các component khác
- **`[✏]`** → mở Component Form (S5)
- **`[🗑]`** → confirm xóa: "Xóa thành phần này không thể hoàn tác trong phiên làm việc này"

### Interaction — Kích hoạt policy
1. Click `[Kích hoạt]`
2. Dialog: "Kích hoạt chính sách này sẽ đóng version v1 (hiệu lực đến 31/08/2025). Tiếp tục?"
3. Confirm → status → Active, version cũ → Archived

---

## S5 — COMPONENT FORM (DYNAMIC PER TYPE)
**Type:** Modal | **Trigger:** `[+ Thêm thành phần]` hoặc `[✏]` từ S4

### Layout chung

```
┌──────────────────────────────────────────────────────┐
│  Thêm thành phần lương                               │
│  ─────────────────────────────────────────────────   │
│  Loại *   [── Chọn loại ──────────────────────────▼] │
│           ┌──────────────────────────────────────┐   │
│           │ 🔵 Thu nhập                          │   │
│           │   Lương cơ bản ngạch-bậc             │   │
│           │   Lương lượt (tiered)                │   │
│           │   DT × hệ số CLDV                    │   │
│           │   Hoa hồng CPN                       │   │
│           │   Thưởng chuyên cần                  │   │
│           │   ...                                │   │
│           │ 🔴 Khấu trừ                          │   │
│           │   Giảm trừ bảo dưỡng                 │   │
│           │   BHXH + BHYT + BHTN                 │   │
│           │   Thuế TNCN                          │   │
│           │   ...                                │   │
│           └──────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### Form mẫu — `trip_rate_tiered` (Lương lượt)

```
┌──────────────────────────────────────────────────────┐
│  Thành phần: Lương lượt (theo tỉnh)                  │
│  ─────────────────────────────────────────────────   │
│  Tên hiển thị *  [Lương lượt Nam Định         ]      │
│  Tỉnh *          [Nam Định (ND) ▼]                   │
│  Nguồn dữ liệu   ● Excel Import  ○ Nhập tay          │
│                                                       │
│  BẢNG ĐƠN GIÁ LƯỢT *                                 │
│  ┌─────────────────────────────────────────────┐     │
│  │ Tier │  Từ lượt  │  Đến lượt │  Đơn giá    │     │
│  ├──────┼───────────┼───────────┼─────────────┤     │
│  │   1  │     0     │    100    │   65,000 đ  │     │
│  │   2  │   101     │  9,999    │   70,000 đ  │     │
│  └──────┴───────────┴───────────┴─────────────┘     │
│                          [+ Thêm tier] [Xóa tier]   │
│                                                       │
│  Đơn giá lượt Hỗ trợ tỉnh      [70,000] đ/lượt      │
│  Đơn giá lượt Nội Bài          [50,000] đ/lượt      │
│  Thưởng ăn ca Chủ nhật         [25,000] đ/ngày CN   │
│                                                       │
│  Hiệu lực từ *  [01/09/2025]   Đến  [—]              │
│  ─────────────────────────────────────────────────   │
│                         [Hủy]  [Thêm vào chính sách] │
└──────────────────────────────────────────────────────┘
```

### Form mẫu — `zero_sum_pool` (Pool Tổng đài)

```
┌──────────────────────────────────────────────────────┐
│  Thành phần: Pool Tổng đài (Zero-sum)                │
│  ─────────────────────────────────────────────────   │
│  Tên hiển thị *  [Pool Tổng đài tháng             ]  │
│  Pool key *      [TD_{YYYY_MM}] ⓘ tự điền tháng     │
│  Tổng quỹ tháng *[5,000,000] đ                       │
│  Cơ sở phân chia ● Cuộc nghe  ○ Giờ công  ○ Hệ số   │
│  Công chuẩn tối thiểu  [50] %                        │
│  Mức hưởng khi <chuẩn  [50] % phần chia              │
│                                                       │
│  Phần còn lại (NV dưới chuẩn) đi đâu?               │
│  ● Chia lại cho NV đủ công                           │
│  ○ Hoàn về công ty                                   │
│  ○ Cộng vào quỹ tháng sau                            │
│                                                       │
│  ─────────────────────────────────────────────────   │
│                         [Hủy]  [Thêm vào chính sách] │
└──────────────────────────────────────────────────────┘
```

### Form mẫu — `insurance_deduction` (BHXH/BHYT/BHTN)

```
┌──────────────────────────────────────────────────────┐
│  Thành phần: BHXH + BHYT + BHTN                      │
│  ─────────────────────────────────────────────────   │
│  Cơ sở đóng *                                        │
│  ● Lương ngạch-bậc  ○ Lương hợp đồng  ○ Thu nhập TT │
│                                                       │
│  Tỷ lệ NLĐ đóng:                                     │
│    BHXH  [8  ] %       BHYT  [1.5] %    BHTN  [1] %  │
│                                                       │
│  ☑ Áp trần đóng BHXH                                 │
│     Trần = [20] × lương cơ sở [2,340,000] đ          │
│     (= 46,800,000 đ/tháng)                           │
│                                                       │
│  Lương cơ sở (tự động từ catalog)  2,340,000 đ       │
│  ─────────────────────────────────────────────────   │
│                         [Hủy]  [Thêm vào chính sách] │
└──────────────────────────────────────────────────────┘
```

### Form mẫu — `revenue_commission_tiered` (Thưởng DT LX Tải)

```
┌──────────────────────────────────────────────────────┐
│  Thành phần: Thưởng doanh thu (tiered %)             │
│  ─────────────────────────────────────────────────   │
│  Tên *    [Thưởng DT LX Tải              ]            │
│  Nguồn DT  ● Excel Import  ○ XBOS API                │
│                                                       │
│  BẢNG THƯỞNG *                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ Mức  │  DT từ (đ)      │  DT đến (đ)   │ %  │    │
│  ├──────┼─────────────────┼───────────────┼────┤    │
│  │  1   │  0              │  50,000,000   │ 6  │    │
│  │  2   │  50,000,001     │  100,000,000  │ 8  │    │
│  │  3   │  100,000,001    │  ∞            │ 10 │    │
│  └──────┴─────────────────┴───────────────┴────┘    │
│           [+ Thêm mức]    [Xóa mức cuối]             │
│                                                       │
│  ⓘ Mức cuối (∞) = áp cho toàn bộ DT vượt mức trước  │
│  ─────────────────────────────────────────────────   │
│                         [Hủy]  [Thêm vào chính sách] │
└──────────────────────────────────────────────────────┘
```

---

## S6 — POLICY PREVIEW (TÍNH THỬ)
**Route:** `/settings/pay-policies/:id/preview` | Hoặc panel trong S4

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  👁 Tính thử — LX Tuyến Nam Định v2                                  │
├────────────────────────────┬────────────────────────────────────────┤
│  DỮ LIỆU MẪU               │  KẾT QUẢ TÍNH                          │
│  ─────────────────────────  │  ──────────────────────────────────    │
│  Ngạch-Bậc                 │  ┌──────────────────────────────────┐  │
│  Ngạch  [E2 - NV Lái xe ▼] │  │  ✅ Lương cơ bản         6,100,000│  │
│  Bậc    [3 ▼]               │  │     E2 · Bậc 3 · QĐ 2A/2026     │  │
│                             │  ├──────────────────────────────────┤  │
│  TRIP_LOG (Nam Định)        │  │  ✅ Lương lượt           7,125,000│  │
│  Lượt Tier 1   [85]  lượt   │  │  • T1: 85 × 65k = 5,525,000     │  │
│  Lượt Tier 2   [20]  lượt   │  │  • T2: 20 × 70k = 1,400,000     │  │
│  Lượt Nội Bài  [5]   lượt   │  │  • NB: 5 × 50k  =   250,000     │  │
│  Lượt hỗ trợ   [3]   lượt   │  │  • CN: 4 × 25k  =   100,000     │  │
│                             │  ├──────────────────────────────────┤  │
│  REVENUE_CLDV               │  │  ✅ DT × CLDV             900,000│  │
│  Doanh thu   [150,000,000] đ│  │  • DT 150M > 100M → Mức 2       │  │
│  Điểm CLDV   [9.6]          │  │  • Hệ số 9.6: × 1.0             │  │
│                             │  ├──────────────────────────────────┤  │
│  ATTENDANCE                 │  │  ✅ Thưởng chuyên cần   1,000,000│  │
│  Ngày công   [26]  ngày     │  │  • ≥24 ngày, trong 01/04–31/05  │  │
│  Ngày CN     [4]   ngày     │  ├──────────────────────────────────┤  │
│  Ngày CK     [8]   ngày     │  │  ✅ Ăn ca Chủ nhật         100,000│  │
│                             │  │  • 4 ngày × 25,000               │  │
│         [▶ Tính]            │  ├══════════════════════════════════╡  │
│                             │  │  Tổng thu nhập          15,225,000│  │
│                             │  ├──────────────────────────────────┤  │
│                             │  │  🔴 Giảm trừ bảo dưỡng   -250,000│  │
│                             │  │  🔴 BHXH+BHYT+BHTN        -640,500│  │
│                             │  │     (6.1M × 10.5%)               │  │
│                             │  │  🔴 Thuế TNCN              -634,500│  │
│                             │  ├══════════════════════════════════╡  │
│                             │  │  💰 THỰC LÃNH            13,700,000│  │
│                             │  └──────────────────────────────────┘  │
│                             │  ⚠ Component "Pool TĐ" cần kỳ đủ NV  │
└────────────────────────────┴────────────────────────────────────────┘
```

### Behavior
- **`[▶ Tính]`** → gọi `POST /pay-policies/:id/preview` → render từng component
- **Component lỗi** → hiển thị ❌ + error message inline (không dừng tính component khác)
- **Component skip** → hiển thị ⏭ + lý do (VD: "TRIP_LOG chưa nhập")
- **Kết quả có thể export** → `[💾 Lưu kết quả mẫu]` để dùng làm test case

---

## S7 — INPUT DATA HUB
**Route:** `/payroll/inputs` | **Role:** HR_STAFF

### Layout Tab "Kỳ tháng 06/2026"

```
┌─────────────────────────────────────────────────────────────────────┐
│  💼 Nhập liệu Lương  /  Tháng [06/2026 ▼]                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  TRẠNG THÁI KỲ THÁNG 06/2026                                         │
│  ─────────────────────────────────────────────────────────────────  │
│  ┌──────────────────┬─────────────┬────────────┬────────────────┐  │
│  │  Loại dữ liệu    │  Trạng thái │  Hàng OK   │  Lỗi          │  │
│  ├──────────────────┼─────────────┼────────────┼────────────────┤  │
│  │  TRIP_LOG        │  ✅ Approved │  85 / 85   │  0            │  │
│  │  REVENUE_CLDV    │  ⚠ Lỗi      │  80 / 85   │  5 hàng lỗi   │  │
│  │  MAINTENANCE_COST│  ✅ Approved │  12 / 12   │  0            │  │
│  │  FREIGHT_REVENUE │  ⏳ Pending  │  45 / 45   │  0            │  │
│  │  DPHH_REVENUE    │  🔴 Chưa có  │  —         │  —            │  │
│  │  HOTLINE_STATS   │  ✅ Approved │  8 / 8     │  0            │  │
│  │  BRANCH_STATS    │  ✅ Approved │  5 / 5     │  0            │  │
│  └──────────────────┴─────────────┴────────────┴────────────────┘  │
│                                                                       │
│  ⚠ Còn 2 loại chưa hoàn tất. Batch lương sẽ cảnh báo khi chạy.     │
│                                                                       │
│  THAO TÁC                                                             │
│  ─────────────────────────────────────────────────────────────────  │
│  [📥 Tải template ▼]   [📤 Upload file ▼]   [🔄 Xem lịch sử]       │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Sub-screen: Preview import REVENUE_CLDV (có lỗi)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ← REVENUE_CLDV · Tháng 06/2026 · v1 · ⚠ 5 hàng lỗi              │
├─────────────────────────────────────────────────────────────────────┤
│  [🔍 Tìm]  [Lọc: Tất cả ▼]  [Chỉ lỗi ▼]                           │
│                                                      [✅ Phê duyệt]  │
│  ┌────┬──────────────┬────────────┬───────────┬──────┬───────────┐  │
│  │ #  │  Mã NV       │  DT (đ)    │  CLDV     │ Stat │  Ghi chú  │  │
│  ├────┼──────────────┼────────────┼───────────┼──────┼───────────┤  │
│  │  2 │ EMP-001 ✓    │ 150,000,000│  9.6      │  ✅  │           │  │
│  │  3 │ EMP-002 ✓    │  98,500,000│  8.9      │  ✅  │           │  │
│  │  4 │ Trần Thị B ⚠ │  72,000,000│  7.2      │  ⚠   │ Khớp 2 NV │  │
│  │    │ [EMP-015 ▼]   │            │           │      │ [Chọn NV] │  │
│  │  5 │ NV-9999 ✗    │ 110,000,000│  9.1      │  ❌  │ Không tồn │  │
│  │    │              │            │           │      │ [Nhập tay]│  │
│  │  6 │ EMP-004 ✓    │  -500,000  │  8.5      │  ⚠   │DT âm, KT? │  │
│  └────┴──────────────┴────────────┴───────────┴──────┴───────────┘  │
│                                                                       │
│  ❌ 5 hàng cần xử lý trước khi phê duyệt                            │
│  [📥 Tải lại file đã sửa]  hoặc  [✏ Sửa trực tiếp]                 │
└─────────────────────────────────────────────────────────────────────┘
```

### UX Rules
- Row lỗi → nền đỏ nhạt; row warning → nền vàng nhạt; row OK → trắng
- **Fuzzy match 2 kết quả** → hiển thị dropdown chọn + confirm
- **`[✅ Phê duyệt]`** chỉ active khi error_rows = 0

---

## S8 — PAYROLL BATCH DASHBOARD
**Route:** `/payroll/batch` | **Role:** HR_MANAGER

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  💰 Bảng lương  /  Batch Tháng 06/2026                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  KIỂM TRA TRƯỚC KHI CHẠY                                              │
│  ─────────────────────────────────────────────────────────────────  │
│  ✅ TRIP_LOG        85 NV  ✅ REVENUE_CLDV    80 NV                  │
│  ✅ MAINTENANCE     12 xe  ✅ HOTLINE_STATS    8 NV                  │
│  ⚠ DPHH_REVENUE   Chưa có → Sẽ bỏ qua các NV ĐPHH                  │
│  ⚠ FREIGHT_REV    Pending → Cần phê duyệt trước                     │
│                                                                       │
│  ⚠ Thiếu 2 loại dữ liệu. Batch vẫn chạy được nhưng sẽ cảnh báo.   │
│                                  [Hủy]  [▶ Chạy batch (87 NV)]      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ĐANG CHẠY ██████████████████░░░░░  73%  (63/87 NV)                 │
│  Phase 1: Tính cá nhân  ██████████████████░░░  90%                  │
│  Phase 2: Pool TĐ       ⏳ Đợi Phase 1 xong                          │
│  Phase 3: Net + BH + PIT ░░░░░░░░░░  0%                             │
│  Thời gian đã chạy: 00:01:23  ·  Ước còn: ~00:00:45                 │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Layout sau khi chạy xong

```
┌─────────────────────────────────────────────────────────────────────┐
│  KẾT QUẢ BATCH — Tháng 06/2026                                       │
│  ─────────────────────────────────────────────────────────────────  │
│  87 nhân viên  ·  Tổng thu nhập: 1,234,567,890 đ                    │
│  Tổng thực lãnh: 987,654,321 đ  ·  3 cảnh báo                      │
│                                                                       │
│  [🔍 Tìm NV]  [Nhóm lương ▼]  [Sắp xếp: Thực lãnh ▼]              │
│                                          [📊 Xuất Excel]  [✅ Duyệt] │
│  ┌─────┬─────────────────┬──────────┬───────────┬────────┬────────┐ │
│  │ #   │  Nhân viên      │ Nhóm     │ Tổng nhận │ Thực   │ Status │ │
│  ├─────┼─────────────────┼──────────┼───────────┼────────┼────────┤ │
│  │ 1   │ Nguyễn Văn A    │ LX_TUYEN │ 15,225,000│13,700k │ Nháp   │ │
│  │ 2   │ Trần Thị B ⚠   │ TONG_DAI │  8,200,000│ 7,200k │ Nháp ⚠ │ │
│  │ 3   │ Lê Văn C        │ LX_TAI   │ 22,100,000│19,800k │ Nháp   │ │
│  └─────┴─────────────────┴──────────┴───────────┴────────┴────────┘ │
│                                                                       │
│  ⚠ 3 cảnh báo: [Xem]  (không block phê duyệt)                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## S9 — PAYSLIP DETAIL (WEB)
**Route:** `/payroll/records/:id/payslip`  
**Role:** HR (xem tất cả) | EMPLOYEE (chỉ xem của mình)

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  PHIẾU LƯƠNG — THÁNG 06/2026                   [📄 In PDF] [💬 Hỏi] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  👤 Nguyễn Văn A  ·  EMP-001                                         │
│  E2 — NV Lái xe  ·  Bậc 3  ·  Nhóm: LX Tuyến  ·  Tỉnh: Nam Định  │
│  Chính sách: LX Tuyến Nam Định v2                                    │
│                                                                       │
│  THU NHẬP                                                             │
│  ─────────────────────────────────────────────────────────────────  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  ✅ Lương cơ bản ngạch-bậc                         6,100,000  │  │
│  │     ▸ [Chi tiết]                                              │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │  ✅ Lương lượt Nam Định                             7,125,000  │  │
│  │     ▾ [Ẩn chi tiết]                                           │  │
│  │     Tier 1: 85 lượt × 65,000đ             = 5,525,000        │  │
│  │     Tier 2: 20 lượt × 70,000đ             = 1,400,000        │  │
│  │     Nội Bài: 5 lượt × 50,000đ             =   250,000        │  │
│  │     Ăn ca CN: 4 ngày × 25,000đ            =   100,000        │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │  ✅ DT × hệ số CLDV                                  900,000  │  │
│  │     ▸ [Chi tiết]                                              │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │  ✅ Thưởng chuyên cần                               1,000,000  │  │
│  │     ▸ [Chi tiết]                                              │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │  ✅ Ăn ca Chủ nhật                                    100,000  │  │
│  │     ▸ [Chi tiết]                                              │  │
│  ├═══════════════════════════════════════════════════════════════╡  │
│  │  Tổng thu nhập                                     15,225,000  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  KHẤU TRỪ                                                             │
│  ─────────────────────────────────────────────────────────────────  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  🔴 Giảm trừ bảo dưỡng                               -250,000 │  │
│  │     ▸ [Chi tiết]                                              │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │  🔴 BHXH + BHYT + BHTN                               -640,500 │  │
│  │     ▾ [Ẩn chi tiết]                                           │  │
│  │     Cơ sở đóng: Lương ngạch-bậc = 6,100,000đ                 │  │
│  │     BHXH (8%):  488,000đ                                      │  │
│  │     BHYT (1.5%): 91,500đ                                      │  │
│  │     BHTN (1%):   61,000đ                                      │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │  🔴 Thuế TNCN                                         -634,500 │  │
│  │     ▸ [Chi tiết]                                              │  │
│  ├═══════════════════════════════════════════════════════════════╡  │
│  │  Tổng khấu trừ                                      -1,525,000 │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌═══════════════════════════════════════════════════════════════┐   │
│  │  💰 THỰC LÃNH THÁNG 06/2026                      13,700,000   │   │
│  │     Trạng thái: ✅ Đã duyệt                                   │   │
│  └═══════════════════════════════════════════════════════════════┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Interactions
- **`▸ [Chi tiết]`** → expand accordion (toggle)
- **`[💬 Hỏi]`** (EMPLOYEE only) → mở chat với HR về payslip
- **`[📄 In PDF]`** → download PDF

---

## S10 — MOBILE PAYSLIP
**Platform:** React Native | **Screen:** `/(tabs)/payslip`

```
┌───────────────────────────────┐
│  < Lương tháng     ≡          │
│  ┌─────────────────────────┐  │
│  │  Tháng [06 ◁ ▷ ] 2026  │  │
│  └─────────────────────────┘  │
│                               │
│  13,700,000 đ                 │
│  THỰC LÃNH                    │
│  ────────────────────────     │
│  E2 · Bậc 3 · LX Tuyến ND    │
│                               │
│  ──── THU NHẬP ────           │
│  ┌─────────────────────────┐  │
│  │ Lương ngạch-bậc  6.1M ▸ │  │
│  └─────────────────────────┘  │
│  ┌─────────────────────────┐  │
│  │ Lương lượt       7.1M ▾ │  │
│  │  T1: 85 × 65k  5,525k  │  │
│  │  T2: 20 × 70k  1,400k  │  │
│  │  NB:  5 × 50k    250k  │  │
│  │  CN:  4 × 25k    100k  │  │
│  └─────────────────────────┘  │
│  ┌─────────────────────────┐  │
│  │ DT × CLDV          900k ▸│  │
│  └─────────────────────────┘  │
│  ┌─────────────────────────┐  │
│  │ Thưởng chuyên cần   1M  ▸│  │
│  └─────────────────────────┘  │
│                               │
│  ──── KHẤU TRỪ ────          │
│  ┌─────────────────────────┐  │
│  │ 🔴 Bảo dưỡng     -250k ▸│  │
│  └─────────────────────────┘  │
│  ┌─────────────────────────┐  │
│  │ 🔴 BHXH+BHYT+BHTN -641k▸│  │
│  └─────────────────────────┘  │
│  ┌─────────────────────────┐  │
│  │ 🔴 Thuế TNCN       -635k▸│  │
│  └─────────────────────────┘  │
│                               │
│        [📄 Xem PDF]           │
└───────────────────────────────┘
```

### Mobile UX Rules
- **Auto-blur khi app vào background** (bảo mật)
- **Swipe ngang** để chuyển tháng
- **Income card** → viền xanh trái; **Deduction card** → viền đỏ trái
- **`▸`** → collapse; **`▾`** → expand (accordion)
- Số hiển thị dạng `6.1M` (rút gọn), expand → `6,100,000 đ` đầy đủ
- Pull-to-refresh để lấy dữ liệu mới nhất

---

## S11 — MOBILE CHECK-IN VỚI CA
**Platform:** React Native | **Screen:** `/(tabs)/checkin`

```
┌───────────────────────────────┐
│  📍 Chấm công                 │
│  ────────────────────────     │
│  Thứ Sáu, 22/08/2026          │
│  🕐 14:43                     │
│                               │
│  Chọn ca làm việc *           │
│  ┌─────────────────────────┐  │
│  │ ● Ca sáng  (6:00–14:30) │  │
│  │ ○ Ca chiều (14:30–23:00)│  │
│  │ ○ Hành chính (8:00–17:00│  │
│  └─────────────────────────┘  │
│                               │
│  📍 Vị trí: Bãi xe Ngọc Hồi  │
│  ✅ Trong phạm vi cho phép    │
│                               │
│  ┌─────────────────────────┐  │
│  │  CN  ──  Hôm nay chủ nhật│ │
│  │  🌟 Bạn sẽ nhận thưởng  │  │
│  │     ăn ca Chủ nhật      │  │
│  │     25,000 đ            │  │
│  └─────────────────────────┘  │
│                               │
│    [      CHECK IN 🟢      ]   │
│                               │
│  ──── Hôm nay ────            │
│  Check in:  06:02 Ca sáng ✅  │
└───────────────────────────────┘
```

### Mobile UX Rules
- **Ca không chọn** → `[CHECK IN]` disabled + tooltip "Vui lòng chọn ca"
- **Ngày Chủ nhật** → badge vàng "🌟 CN" + preview thưởng ăn ca 25k
- **Đã check in rồi** → button → `[CHECK OUT 🔴]`
- **Ngoài geofence** → cảnh báo đỏ "Ngoài phạm vi cho phép (245m)" + vẫn cho check in với note

---

## DESIGN SYSTEM NOTES

### Màu sắc
| Màu | Dùng cho |
|-----|---------|
| Xanh lá `#22C55E` | Income components, trạng thái OK |
| Đỏ `#EF4444` | Deduction components, lỗi |
| Vàng `#F59E0B` | Warning, thay đổi chưa lưu |
| Xanh dương `#3B82F6` | Primary actions, links |
| Xám `#6B7280` | Secondary text, disabled |

### Typography
- **Số tiền lớn** (Payslip tổng): `font-size: 32px, font-weight: 700`
- **Số tiền component**: `font-size: 16px, font-weight: 600, font-variant: tabular-nums`
- **Label**: `font-size: 14px, font-weight: 500, color: gray`
- **Font**: Inter (web) / System font (mobile)

### Bảng Grid (S1 — Thang bảng lương)
- Sticky header cột "Ngạch" + Sticky row header
- Hover row → highlight nhẹ
- Edited cell → outline vàng 2px
- Tab navigation giữa các ô

### Accordion (S9, S10 — Payslip)
- Transition: 200ms ease-in-out
- Arrow rotation: 0° (collapsed) → 90° (expanded)
- Nội dung breakdown: monospace font để align số

### Loading States
- Skeleton loader cho danh sách
- Spinner trong button khi đang submit
- Progress bar cho batch chạy lương (S8)
