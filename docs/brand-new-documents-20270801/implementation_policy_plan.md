# Implementation Policy Plan — Tri thức nghiên cứu Policy Engine

> Tài liệu này ghi nhận toàn bộ tri thức nghiên cứu phục vụ việc xây dựng Policy Hub v2.
> Cập nhật: 2026-08-27. **Không code khi chưa có confirm.**

---

## 1. Kiến trúc 4 trụ (Blueprint PPT Slide 3)

Toàn bộ HRM chia 4 pillar độc lập, giao tiếp qua API:

| Pillar | Mã | Phạm vi |
|--------|----|---------|
| M1 Tuyển dụng | WBS-HRM-REC | Định biên, chiến dịch, CV, phỏng vấn, offer |
| M2 Nhân sự Core | WBS-HRM-CORE | Hồ sơ, HĐLĐ, tài sản, giấy tờ, khen thưởng |
| M3 Chấm công & Nghỉ phép | WBS-HRM-ATT | Ca/rules, GPS, bảng công chốt (SoT) |
| M4 Tiền lương & Phúc lợi | WBS-HRM-PAY | Formula engine, phụ cấp, khấu trừ, BH, thuế |

**Ranh giới cứng:**
- Module Lương KHÔNG gọi trực tiếp OT/Leave API → chỉ đọc bảng công đã chốt (SoT)
- Formula engine: DEV KHÔNG hardcode công thức → xây dựng engine kéo-thả

---

## 2. Cấu trúc DB thực tế (kiểm tra 2026-08-27)

### pay_policy_groups (6 nhóm trong DB tenant xevn):
- id=7  LUONG    Lương            #10B981
- id=8  THUONG   Thưởng           #F59E0B
- id=9  GIA      Phụ cấp & Giá   #3B82F6
- id=10 PHAT     Phạt & Khấu trừ #EF4444
- id=11 BHXH     BHXH & BHYT     #8B5CF6
- id=12 THUE     Thuế TNCN       #6B7280

### pay_policies.group_id — ĐÃ CÓ trong DB, không cần migration thêm cột

### policy_assignments — CHƯA TỒN TẠI, cần migration

### employee_contracts fields quan trọng:
- compensation_package_id UUID — gói lương theo HĐ → OVERRIDE policy mặc định
- salary_ratio_percent NUMERIC — % lương so với chính thức
- position_key TEXT — chức danh trong HĐ
- department_key TEXT — phòng ban trong HĐ

---

## 3. 29 Component Types — Params chi tiết từ all-calculators.ts

### grade_base
params: {grade_job_map:[{job_title_key, grade_code, steps:[{step_number, monthly_salary_vnd}]}]}
Editor: Bảng chức danh × ngạch × bậc (multi-row)

### trip_rate_tiered
params: {tiers:[{from_trip, to_trip, rate},...], rate_ho_tro_vnd, rate_noi_bai_vnd, rate_meal_sunday_vnd}
Editor: Bảng bậc thang lượt + 3 input phụ

### revenue_quality
params: {coefficients:[{min_score, max_score, coefficient},...], revenue_pct}
Editor: Bảng điểm CLDV → hệ số + input %

### revenue_commission_tiered
params: {tiers:[{from_vnd, to_vnd, pct},...]}
Editor: Bảng bậc thang DT → %

### fixed_base_salary
params: {vehicle_type_rates: {"FRR_55T": 8000000, ...}}
Editor: Bảng loại xe → mức lương

### insurance_deduction
params: {base_ref:"grade_base"|"contract"|"actual_income", bhxh_pct:8, bhyt_pct:1.5, bhtn_pct:1, apply_ceiling:true, ceiling_multiplier:20}
Editor: Dropdown base + 3 input % + toggle trần

### attendance_bonus_conditional
params: {min_actual_days:24, amount_vnd:1000000, effective_from:"YYYY-MM-DD"}
Editor: Input ngưỡng ngày + tiền + hiệu lực

### (các type đơn giản dùng FixedAmountEditor)
fixed_trial_salary, vehicle_mgmt_allowance, loading_support, special_allowance, meal_allowance_conditional, remote_work_allowance

---

## 4. Logic Priority áp dụng chính sách

Priority (nhỏ = ưu tiên cao):
  10 = Hợp đồng cá nhân (compensation_package_id)
  20 = Override cá nhân (employee_id)
  30 = Chức danh (job_title_key)
  40 = Phòng ban (department_key)
  50 = Nhóm đối tượng (pay_group_code)
  99 = Toàn bộ (all)

---

## 5. Smart Target Picker theo nhóm

LUONG → Chức danh (multi) + optional Phòng ban
THUONG → Nhóm (pay_group) hoặc Cá nhân
GIA → Chức danh HOẶC Phòng ban HOẶC Cá nhân
PHAT → Chức danh
BHXH → Toàn bộ (auto "all")
THUE → Toàn bộ (auto "all")
