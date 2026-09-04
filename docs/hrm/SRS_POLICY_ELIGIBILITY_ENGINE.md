# SRS: SYSTEM REQUIREMENT SPECIFICATION FOR HRM POLICY ELIGIBILITY & MASTER SETTINGS INTEGRATION

**Document Code:** XEVN-SRS-HRM-POLICY-ELIGIBILITY-v1.0  
**Author:** Senior Business Analyst & Systems Architect  
**Effective Date:** 2026-09-03  
**Status:** APPROVED  

---

## 1. MỤC TIÊU & TỔNG QUAN NGHIỆP VỤ

Hệ thống HRM Core của X.E Việt Nam cần cung cấp cơ chế cấu hình tập trung (Master Settings Catalogs) và bộ quy tắc tính toán/quét chính sách tự động (Policy Eligibility & Hierarchy Overriding Engine) cho toàn bộ nhân sự.

### 1.1 Nguyên lý Cấu hình Tập trung (Master Settings Alignment)
- Tất cả danh mục Master Data (Khu vực / Vùng miền, Chi nhánh / Bưu cục, Ngạch / Bậc lương, Chức danh, Loại hợp đồng) **BẮT BUỘC** được quản lý tập trung tại phân hệ **Settings Catalogs** (`/hr/settings`).
- Các phân hệ: **Hồ sơ Nhân sự (Employees)**, **Hợp đồng Lao động (Contracts)**, **Thiết lập Chính sách (Policy Engine)**, **Tính Bảng lương (Payroll Sheet)** tự động thừa hưởng (Sync/Pull) dữ liệu từ Master Catalogs, đảm bảo tính nhất quán 100%.

### 1.2 Nguyên lý Phân cấp Ghi đè Ưu tiên (Hierarchical Overriding Engine)
Khi tính bảng lương cho một Nhân sự $E_i$, hệ thống tự động quét toàn bộ các Chính sách đang hiệu lực (`status = 'ACTIVE'`) và áp dụng thứ tự ghi đè ưu tiên 5 cấp từ cao xuống thấp:

$$\text{Tùy chỉnh Cá nhân (Level 1)} \succ \text{Chi nhánh / Bưu cục (Level 2)} \succ \text{Khu vực / Vùng (Level 3)} \succ \text{Chức danh / Phòng ban (Level 4)} \succ \text{Toàn công ty (Level 5)}$$

- **Chính sách cấp thấp hơn (chi tiết hơn):** Tự động ghi đè (override) chính sách ở cấp cao hơn (tổng quát hơn).
- **Tính minh bạch (Traceability):** Khi xuất Bảng lương hoặc xem Chi tiết Phiếu lương (Payslip), hệ thống hiển thị rõ ràng từng khoản lương/thưởng được tính từ Chính sách nào, ở Cấp độ ưu tiên nào.

---

## 2. CHUỖI USE CASE CHI TIẾT

### UC-POL-01: Quản lý Danh mục Master Settings Catalogs
- **Actor:** HRM Administrator / CBO.
- **Input:** Khai báo mã/tên Khu vực (HN, YB, TINH), Chi nhánh (Ngọc Hồi, Phố Vọng, Yên Bái...), Ngạch/Bậc, Chức danh.
- **Output:** Dữ liệu Master được lưu vào `settings_catalogs` & `settings_catalog_items`.

### UC-POL-02: Gán Thuộc tính Master cho Nhân sự & Hợp đồng
- **Actor:** HR Specialist.
- **Input:** Khi tạo Hợp đồng (`contracts`) hoặc Hồ sơ Nhân sự (`employees`), chọn Khu vực, Chi nhánh, Chức danh, Bậc lương từ Master Catalogs.
- **Output:** Bản ghi Nhân sự & Hợp đồng liên kết ngoại với ID của Master Catalogs.

### UC-POL-03: Cấu hình Chính sách theo Phân cấp (Policy Builder)
- **Actor:** CBO / Compensation Manager.
- **Input:** Tạo mới chính sách trong Popup Builder (`PolicyBuilderScreen`), chọn Scope (`global`, `location`, `branch`, `department`, `position`) và cấu hình bộ lọc `RuleConditionBuilder`.
- **Output:** Lưu chính sách vào DB (`payroll_policies` & `payroll_policy_components`).

### UC-POL-04: Tự động Quét & Áp dụng Chính sách cho Bảng lương (Payroll Calculation Engine)
- **Actor:** System Payroll Processor.
- **Trigger:** Khi tính Bảng lương tháng.
- **Process:**
  1. Đọc thuộc tính Nhân sự: `employee_id`, `branch_id`, `location_id`, `department_id`, `job_title_code`, `step_code`.
  2. Lọc tất cả Chính sách `ACTIVE`.
  3. Với mỗi Loại thành phần (Cơ bản, KPI, Hoa hồng, Thưởng), chọn Chính sách có **Level Ưu tiên cao nhất** thỏa mãn điều kiện.
  4. Tính toán số tiền và lưu thông tin Vết truy xuất (Trace Log) vào Phiếu lương.
- **Output:** Bảng lương chính xác + Payslip chi tiết nguồn gốc chính sách.
