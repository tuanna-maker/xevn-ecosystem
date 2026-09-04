# SPEC_TASK_POLICY_ENGINE_TARGET_ACTION_v1.md

> **Task ID:** `TASK-PAYROLL-POLICY-ENGINE-TARGET-ACTION-01`  
> **Feature:** Phân Tách Quy Tắc Lọc Đối Tượng (Rules) ↔ Hành Động Tác Động Dữ Liệu (Target Action) & Tách Nhỏ Chính Sách Lương  
> **Quy trình áp dụng:** `/development-process` · `30-TASK-CREATION-STANDARDS.md` · `29-UIUX-STANDARDS.md`  
> **Lane:** Full-stack (`dev-fe` + `dev-be`)  
> **Trạng thái:** SPEC VERIFIED & COMPLETED  

---

## 1. SRS (System Requirements Specification)

### 1.1 Use Cases
- **UC-POL-01 (Khai báo Điều kiện áp dụng - Column 2 Rules):** Quản trị viên sử dụng `RuleConditionBuilder` để lọc đối tượng thụ hưởng chính sách theo các trường: Thâm niên (`seniority`), Điểm KPI bình quân năm (`kpi_score`), Bậc lương hiện tại (`current_step`), Phòng ban (`department`), Chức danh (`title`), Vùng miền (`location`).
- **UC-POL-02 (Cấu hình Tác động Dữ liệu - Column 3 Action & Impact):** Khi đối tượng thỏa mãn Rule ở Cột 2, Quản trị viên thiết lập Hành động tác động dữ liệu nhân sự ở Cột 3:
  - `step_progression_next`: Nâng lên Bậc tiếp theo trong CSDL Master Catalog.
  - `step_progression_target`: Chuyển sang Bậc đích cụ thể (`target_step_code`).
  - `kpi_bonus_rate`: Cộng thưởng KPI theo % Lương cơ bản.
  - `kpi_bonus_amount`: Cộng thưởng KPI số tiền cố định (VNĐ).
  - `formula_custom`: Tính theo công thức mở rộng.
- **UC-POL-03 (Quản lý Chính sách Tách nhỏ - Policy Granularity):** Mỗi chính sách quy định một nấc nghiệp vụ riêng biệt (VD: "Xét nâng Bậc I ➔ Bậc II", "Xét nâng Bậc II ➔ Bậc III", "Thưởng KPI Đạt 100%"). Không gộp cả 9 bậc vào 1 chính sách hỗn tạp.

### 1.2 Business Rules (BR)
- **BR-POL-01 (Rule #22 Separation):** Cột 2 quản lý 100% các biểu thức logic. CẤM lồng ghép biểu thức `IF(TENURE >= 12 AND KPI >= 80, ...)` vào ô công thức ở Cột 3.
- **BR-POL-02 (Master Catalog Binding - Rule #19):** Mọi lựa chọn Bậc lương (`dbPaySteps`) trong Cột 2 và Cột 3 phải lấy động từ Master Catalog (`usePaySteps`).
- **BR-POL-03 (Display-Ready API - Rule #28):** Backend API trả về thông tin chính sách đầy đủ thông số cho FE render ngay, không bắt FE gọi N+1 API ghép nối.
- **BR-POL-04 (UX Field Separation - Rule U-12):** Ô chọn Mã Bậc chỉ hiển thị Mã (`code`), không gộp Tên vào chung 1 ô (CẤM `Bậc I (BAC_1)`).

---

## 2. TechSpec (Technical Specification)

### 2.1 Data Schema & Parameters DTO
```json
{
  "policy_id": "string (uuid)",
  "name": "string",
  "pay_group_code": "string",
  "structure_type": "progression | formula_based | fixed_amount",
  "targeting_rules": [
    { "field": "seniority", "operator": ">=", "value": 12 },
    { "field": "kpi_score", "operator": ">=", "value": 80 },
    { "field": "current_step", "operator": "==", "value": "1" }
  ],
  "action_config": {
    "action_type": "step_progression_next | step_progression_target | kpi_bonus_rate | kpi_bonus_amount | formula_custom",
    "target_step_code": "string (optional)",
    "bonus_rate": "number (optional)",
    "bonus_amount": "number (optional)",
    "extra_data_columns": [
      { "code": "TENURE_MONTHS", "label": "Thâm niên công tác", "source_type": "extraData", "mapping_key": "hire_date" },
      { "code": "KPI_SCORE", "label": "Điểm KPI bình quân", "source_type": "extraData", "mapping_key": "kpi_score" }
    ],
    "formula_expression": "string (optional)"
  }
}
```

### 2.2 Traceability Matrix
| Use Case | API Endpoint | Service Method | DB Table |
| :--- | :--- | :--- | :--- |
| UC-POL-01 / 02 | `POST /api/hrm/payroll/policies` | `PayPolicyService.create` | `payroll_policies` |
| UC-POL-01 / 02 | `PUT /api/hrm/payroll/policies/:id` | `PayPolicyService.update` | `payroll_policies` |
| UC-BATCH-01 | `POST /api/hrm/payroll/evaluate-eligibility` | `StepProgressionService.evaluate` | `payroll_contracts` |

---

## 3. API Contract

### 3.1 Create Policy Endpoint
`POST /api/hrm/payroll/policies`
- **Request Body:**
  ```json
  {
    "name": "Chính sách Xét nâng Bậc I lên Bậc II",
    "pay_group_code": "DPHH",
    "structure_type": "progression",
    "effective_from": "2026-09-01",
    "conditions": [
      { "field": "seniority", "operator": ">=", "value": 12 },
      { "field": "kpi_score", "operator": ">=", "value": 80 }
    ],
    "params": {
      "action_type": "step_progression_next",
      "target_step_code": "2"
    }
  }
  ```
- **Response 201 Created:** Display-ready Policy DTO object.

---

## 4. UI/UX Spec (Universal UX Discipline)

### 4.1 Layout 3 Cột Màn hình Policy Builder
- **Cột 1 (Định nghĩa):** Tên chính sách, Ngày hiệu lực, Cấu trúc bảng lương, Phạm vi áp dụng.
- **Cột 2 (Quy tắc & Điều kiện - Rules):** Danh sách hàng điều kiện động (`RuleConditionBuilder`). Chọn trường (Thâm niên, KPI, Bậc hiện tại), chọn phép toán (`>=`, `<=`, `==`), nhập giá trị.
- **Cột 3 (Tác động Dữ liệu & Giá trị):** Form chọn Hành động tác động (`ComponentFormBuilder`).
  - Dropdown `Hành động tác động`: Chỉ hiển thị tên hành động minh bạch.
  - Các ô giá trị đi kèm: Mã Bậc đích (Dropdown chỉ hiển thị `code`), Số tiền cố định (`<ViMoneyInput>`), Tỷ lệ % (`<input type="number">`).
  - Phân tách rõ ràng không lặp thông tin rác.

---

## 5. Test Plan

### 5.1 Test Cases
1. **TC-POL-01 (Happy Path - Step Progression Policy):** Tạo chính sách Nâng Bậc I ➔ II với Rule Thâm niên ≥ 12 tháng & KPI ≥ 80% ➔ Action `step_progression_next` ➔ Lưu thành công, F5 giữ nguyên dữ liệu.
2. **TC-POL-02 (Happy Path - KPI Bonus Policy):** Tạo chính sách Thưởng KPI với Rule KPI ≥ 100% ➔ Action `kpi_bonus_rate` 20% ➔ Lưu thành công.
3. **TC-POL-03 (Validation Error Path):** Nhập ô Mã Bậc rỗng ➔ Hệ thống báo lỗi validation, disabled nút Lưu.

---

## 6. Code Architecture & Implementation Mapping

### 6.1 Frontend (`apps/web/hrm`)
- `PolicyBuilderScreen.tsx`: Bố cục 3 cột (Column 1 Meta, Column 2 Rules, Column 3 Value Impact).
- `RuleConditionBuilder.tsx`: Quản lý 100% biểu thức lọc điều kiện (Cột 2).
- `ComponentFormBuilder.tsx`: Quản lý Hành động Tác động & Giá trị (Cột 3).

### 6.2 Backend (`apps/api/hrm-api`)
- `PayPolicyModule` / `PayPolicyService`: Lưu trữ DTO và validate cấu hình chính sách.

---

## 7. Test Verification & Handoff Report

- **Dual Build Check (Rule #12):**
  - FE Build (`cd apps/web/hrm && npx vite build`): **Exit Code 0**
  - BE Build (`cd apps/api/hrm-api && npm run build`): **Exit Code 0**
