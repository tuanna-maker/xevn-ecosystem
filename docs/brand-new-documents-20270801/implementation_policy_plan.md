# 🌍 PHÂN TÍCH NGHIỆP VỤ PAYROLL POLICY — Từ Thế giới → XeVN

---

## PHẦN 1: NGHIỆP VỤ PAYROLL POLICY TRÊN THẾ GIỚI

### 1.1 Các ERP lớn tiếp cận như thế nào?

#### SAP HCM — Wage Type Approach
SAP chia Payroll thành 2 loại Wage Type (Loại Thu nhập/Khấu trừ):

| Loại | Tên | Bản chất |
|-----|-----|---------|
| **Primary Wage Types** | Dialog Wage Types | HR nhập tay, áp cho infotype (IT0008 Basic Pay, IT0014 Recurring, IT0015 One-Time) |
| **Primary Wage Types** | Time Wage Types | Sinh từ hệ thống chấm công (overtime, shift differential) |
| **Secondary Wage Types** | Technical (`/101`, `/550`…) | Hệ thống tự tính gộp, lưu interim results — không nhập tay |

**Điều SAP dạy ta:** Phân biệt rõ **INPUT** (nhập vào) vs **CALCULATION RESULT** (kết quả tính). Mỗi Wage Type có 3 thuộc tính quan trọng:
- **Processing Class:** Cách tính (có tính vào gross không, có tính thuế không)
- **Cumulation Class:** Gộp vào nhóm nào (Total Gross, Taxable, Pensionable)
- **Permissibility:** Ai được nhận (theo Pay Scale / Employee Group)

#### Workday — Compensation Plan Approach
Workday dùng khái niệm **Compensation Plan** (Gói chính sách) thay vì Wage Type:

```
Compensation Package (Gói tổng thể)
  └── Compensation Plan (Chính sách cụ thể)
        ├── Base Pay Plan          → Lương cơ bản (salary/hourly/period)
        ├── Bonus / Incentive Plan → Thưởng biến đổi
        ├── Allowance Plan         → Phụ cấp định kỳ
        └── One-Time Payment       → Thưởng đặc biệt không định kỳ
```

**Điều Workday dạy ta:** Eligibility Rules (Điều kiện áp dụng) là **SEPARATE** khỏi định nghĩa chính sách:
> "Who gets this plan" ≠ "What the plan is"
> → Đây chính xác là tư duy `target_conditions` tách khỏi `pay_group`

#### Oracle HCM — Element Classification Approach
Oracle chia theo **Element Classification** (Phân loại thành phần):

| Classification | Bản chất | Recurring? |
|---------------|---------|-----------|
| **Earnings** | Lương & Thu nhập | Recurring |
| **Deductions** | Khấu trừ tự nguyện (bảo hiểm tư, vay nội bộ) | Recurring |
| **Tax Deductions** | Thuế TNCN bắt buộc | Recurring |
| **Employer Liabilities** | BHXH phần sử dụng lao động đóng | Recurring |
| **Benefits** | Phúc lợi phi tiền mặt | Recurring |
| **Information** | Dữ liệu không có giá trị tiền (số người phụ thuộc) | N/A |
| **Imputed Income** | Lợi ích phi tiền mặt chịu thuế (xe công ty) | Non-Recurring |

**Điều Oracle dạy ta:** Phân biệt rõ **Statutory** (bắt buộc pháp lý) vs **Voluntary** (tự nguyện/chính sách công ty)

### 1.2 Tổng hợp — Thế giới có bao nhiêu NHÓM CHÍNH SÁCH?

Sau khi chuẩn hoá 3 trường phái SAP / Workday / Oracle, thế giới Enterprise đồng thuận 7 nhóm tổng quát:

```
┌─────────────────────────────────────────────────────────────────┐
│           7 NHÓM CHÍNH SÁCH PAYROLL CHUẨN ENTERPRISE           │
├────┬──────────────────────┬────────────────────────────────────┤
│ 1  │ BASE COMPENSATION    │ Lương cơ bản, ngạch-bậc, khoán    │
│ 2  │ VARIABLE / INCENTIVE │ Thưởng hiệu suất, KPI, hoa hồng   │
│ 3  │ ALLOWANCE            │ Phụ cấp bù đắp chi phí/điều kiện  │
│ 4  │ SHIFT / TIME PREMIUM │ Thưởng ca, thưởng ngày đặc biệt   │
│ 5  │ DEDUCTION            │ Phạt, khấu trừ phát sinh, advances│
│ 6  │ STATUTORY DEDUCTION  │ BHXH/BHYT/BHTN (bắt buộc)         │
│ 7  │ TAX WITHHOLDING      │ Thuế TNCN khấu lưu tại nguồn      │
└────┴──────────────────────┴────────────────────────────────────┘
```

### 1.3 Nguyên tắc Enterprise quan trọng nhất

| # | Nguyên tắc | Diễn giải |
|---|-----------|----------|
| 1 | **Policy ≠ Target** | Chính sách là "cái gì". Đối tượng là "ai nhận". Tách rời hoàn toàn |
| 2 | **Recurring vs Non-Recurring** | Có chính sách tự động lặp mỗi tháng, có chính sách chỉ một lần (thưởng chuyên cần có thời hạn) |
| 3 | **Tariff = bảng tra cứu** | Không hardcode tier/bracket — lưu vào JSONB để thay đổi không cần deploy |
| 4 | **Versioning bắt buộc** | Mọi thay đổi policy → tạo version mới, không sửa version cũ. Audit trail không thể thiếu |
| 5 | **Statutory trước, Policy sau** | Thứ tự tính: Base → Variable → Allowance → Deduction → Statutory → Tax |
| 6 | **Pool = cơ chế đặc biệt** | Logistics/Call center dùng Pool Bonus = Zero-sum: chia quỹ cố định theo tỷ lệ KPI/giờ công |
| 7 | **Piece-rate = lương sản phẩm** | Đặc thù ngành vận tải: lái xe trả theo lượt chuyến (Piece-rate) thay vì giờ công |

---

## PHẦN 2: MAP VÀO XEVN — XeVN có gì khác so với thế giới?

### 2.1 XeVN là công ty vận tải, nên có THÊM 3 cơ chế đặc thù:

| Cơ chế | Tên Enterprise | Biến thể tại XeVN |
|--------|---------------|------------------|
| **Piece-Rate Pay** | Trả theo đơn vị sản phẩm | Đơn giá lượt/chuyến, phân theo tỉnh và tier số lượt |
| **Team Pool Bonus** | Quỹ thưởng nhóm | Tổng đài Pool cuộc nghe, VP Tỉnh Pool doanh thu, ĐPHH Pool KPI |
| **Revenue Commission** | Hoa hồng doanh thu | LX Tuyến (CPN 10%), LX Tải (% tier DT), ĐPHH (% gửi/nhận) |

### 2.2 Mapping đầy đủ 30 Component Types → 7 Nhóm Enterprise

| Nhóm Enterprise | pay_group XeVN | component_types (30 loại) |
|----------------|---------------|--------------------------|
| **BASE COMPENSATION** | `EARNINGS` | `grade_base`, `fixed_base_salary`, `probation_salary`, `branch_base_salary` |
| **PIECE-RATE / REVENUE** | `EARNINGS` | `trip_rate_tiered`, `revenue_quality`, `cpn_commission`, `contract_fee`, `revenue_commission_tiered` |
| **POOL / TEAM BONUS** | `EARNINGS` | `zero_sum_pool`, `zero_sum_pool_base`, `zero_sum_pool_bonus`, `zero_sum_pool_branch`, `kpi_pool_share` |
| **VARIABLE / INCENTIVE** | `BONUS` | `kpi_bonus_pct`, `attendance_bonus_conditional`, `team_milestone_bonus`, `delivery_commission`, `ranking_bonus`, `kpi_multiplier` |
| **ALLOWANCE** | `ALLOWANCE` | `grade_allowance`, `meal_allowance_conditional`, `vehicle_mgmt_allowance`, `special_allowance_app`, `remote_work_allowance`, `loading_support` |
| **DEDUCTION** | `DEDUCTION` | `vehicle_repair_deduction`, `clhd_point_deduction`, `fuel_quota_deduction` |
| **STATUTORY** | `INSURANCE` | `social_insurance` (BHXH 8% + BHYT 1.5% + BHTN 1%) |
| **TAX WITHHOLDING** | `TAX` | `tax_progressive`, `tax_flat` |

> [!NOTE]
> **Quyết định thiết kế quan trọng:** Ở XeVN, `EARNINGS` bao gồm cả **Base + Piece-rate + Pool** vì bản chất đều là thu nhập chính. `BONUS` chỉ chứa những khoản **vượt kỳ vọng** hoặc **có điều kiện thời hạn**.

### 2.3 Các Nhóm Chính sách đề xuất (pay_policy_groups — Dynamic Table)

```
Codekey       Tên hiển thị              Icon  Màu       Ghi chú
─────────────────────────────────────────────────────────────────
EARNINGS      Lương & Thu nhập          💰    #3b82f6   Base + Piece-rate + Pool
BONUS         Thưởng & Khuyến khích     🏆    #f59e0b   KPI, Incentive, Commission
ALLOWANCE     Phụ cấp & Hỗ trợ         🎁    #10b981   Chi phí, điều kiện làm việc
DEDUCTION     Giảm trừ & Chế tài       ⚠️    #ef4444   Phạt, khấu trừ hao hụt
INSURANCE     Bảo hiểm bắt buộc         🏥    #8b5cf6   BHXH/BHYT/BHTN
TAX           Thuế Thu nhập             📊    #6b7280   TNCN khấu lưu
```

> **Khi Cậu cần thêm nhóm mới** (ví dụ `EQUITY` — Cổ phần/Quyền mua cổ phần sau này):  
> → Chỉ cần INSERT 1 record vào `pay_policy_groups`, không deploy lại code.

---

## PHẦN 3: YÊU CẦU ĐÃ ĐƯA RA TỪ CÁC PROMPT TRƯỚC

Cậu đã yêu cầu (tổng hợp lại):

| # | Yêu cầu | Nhóm Module |
|---|---------|------------|
| ✅ 1 | Phân nhóm chính sách theo bản chất dòng tiền, không theo đối tượng | Taxonomy |
| ✅ 2 | Đối tượng (LX Tuyến, TĐ...) là điều kiện lọc (target_conditions), không phải nhóm | Taxonomy |
| ✅ 3 | Mỗi nhóm có nhiều loại chính sách cụ thể, liệt kê đầy đủ với khai báo params | Policy |
| ✅ 4 | Tìm ra logic và quy luật chung cho khai báo chính sách (Flat/Tiered/Pool/Conditional) | Policy Engine |
| ✅ 5 | Phải có nút "+ Thêm nhóm chính sách" (dynamic, không hardcode) | Settings |
| ✅ 6 | Menu Lương → Chính sách → hiện danh sách nhóm trước, không đi thẳng vào list | UX Navigation |
| ✅ 7 | Tách Settings Ngạch và Bậc thành 2 màn CRUD riêng | Settings |
| ✅ 8 | Settings Ngạch/Bậc nằm trong màn Settings HRM, không gộp vào Master Data | Settings |
| ✅ 9 | Bảng công: hiện trên cả Web lẫn Mobile | Attendance |
| ✅ 10 | Import ngày công (chưa có máy chấm công) | Attendance |

---

## PHẦN 4: KIẾN TRÚC ĐẦY ĐỦ PHÂN HỆ LƯƠNG

### 4.1 Cấu trúc 3 lớp Policy (bất biến)
```
NHÓM CHÍNH SÁCH (pay_policy_groups)   → Dynamic table, HR Admin tạo/sửa
  └── CHÍNH SÁCH CỤ THỂ (pay_policies)
        ├── target_conditions: {pay_group_code, province, vehicle_type...}
        └── THÀNH PHẦN (pay_income_components)
              ├── component_type: loại thuật toán (30 loại)
              ├── input_source: nguồn dữ liệu đầu vào
              ├── is_deduction: true/false
              └── params (JSONB): bảng giá Tariff / tỷ lệ / điều kiện
```

### 4.2 4 Pattern params phổ biến (áp dụng mọi component_type)

| Pattern | Dùng khi | Cấu trúc params |
|---------|---------|----------------|
| **FLAT** | Một mức cố định | `{amount_vnd: 1000000}` |
| **TIERED TARIFF** | Bảng bậc thang (Piece-rate, Commission, KPI cap) | `{tiers: [{min, max, rate_or_amount}], province_code?}` |
| **POOL** | Chia quỹ theo tỷ lệ (zero-sum) | `{pool_amount, split_by: call_ratio/hours/days, pool_key}` |
| **CONDITIONAL** | Có điều kiện thời hạn / điều kiện chấm công | `{amount_vnd, conditions: [], period_from, period_to}` |

### 4.3 Toàn bộ Module (Scope đầy đủ)

```
⚙️ Settings / Cài đặt Lương
  ├── Ngạch (Grade)          CRUD — tách riêng
  ├── Bậc lương (Step)       CRUD — tách riêng (versioned theo QĐ)  
  ├── Nhóm Chính sách        CRUD dynamic — nút "+ Thêm nhóm"
  ├── Nhóm Đối tượng         Catalog PAY_GROUP (LX_TUYEN, DPHH...)
  ├── Định mức Nhiên liệu    CRUD per vehicle_type
  └── Cấu hình Tỉnh/Mốc      CRUD per province (mốc DT, đơn giá...)

💰 Menu Lương
  ├── 📊 Bảng Công
  │     Web: Xem tháng | Nhập tay | Import Excel
  │     Mobile: Xem cá nhân | Nhập tay  
  ├── ⚙️ Chính sách
  │     → Màn 1: Danh sách NHÓM (6 cards)
  │     → Màn 2: Danh sách Policy của nhóm
  │     → Màn 3: Policy Builder (Header + Target + Components + Tariff)
  ├── 📥 Nhập liệu           Import 7 loại Excel
  ├── 🚀 Chạy lương          Batch engine
  └── 📄 Phiếu lương         Payslip web + mobile
```

---

## PHẦN 5: GOAL THỰC THI (Theo thứ tự)

> [!IMPORTANT]
> **Tớ chưa thực hiện bất kỳ thay đổi code nào.** Đây là bản Phân tích để Cậu duyệt.
> Sau khi Cậu bấm **Proceed**, tớ sẽ thực thi theo thứ tự Goal bên dưới.

| Goal | Phụ thuộc | Nội dung thực thi | Ưu tiên |
|------|---------|------------------|---------|
| **G0** | — | Foundation: Catalog Extensions (PAY_GROUP, COMPONENT_TYPE, PROVINCE, VEHICLE_TYPE) | P0 |
| **G1** | G0 | Settings: Màn CRUD Ngạch (tách riêng, versioned theo QĐ) | P0 |
| **G2** | G1 | Settings: Màn CRUD Bậc lương per ngạch (tách riêng) | P0 |
| **G3** | G0 | Settings: Màn CRUD Nhóm Chính sách (dynamic, nút + Thêm nhóm) | P0 |
| **G4** | G3 | UX: Refactor Menu Lương → Chính sách hiện danh sách nhóm trước | P0 |
| **G5** | G4 | Policy Builder: Wizard tạo chính sách theo 4 pattern params | P1 |
| **G6** | G0 | Bảng Công Web: Xem tháng + Nhập tay + Import Excel ngày công | P0 |
| **G7** | G6 | Bảng Công Mobile: Xem cá nhân + Nhập tay | P1 |
| **G8** | G1,G5,G6 | Payroll Batch Engine + Payslip | P1 |
