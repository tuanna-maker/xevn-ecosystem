# PAY-09-DATA-SPEC-01 — Data Spec cho Bảng Nhóm Bảng Lương (pay_payroll_group)

**Context:** Theo SRS_HRM_ENTERPRISE.md `FR-UC-BP-PAY-09`, hệ thống cần quản lý danh mục "Nhóm bảng lương" thay vì hardcode 4 nhóm (văn phòng, kinh doanh, tài xế, vận hành) nhằm phục vụ các báo cáo và cấu hình công thức động theo Tenant.

## 1. Metadata Bảng
- **Tên bảng**: `pay_payroll_group`
- **Mô tả**: Bảng lưu trữ cấu hình danh mục các nhóm bảng lương theo cấp độ Company/Tenant.

## 2. Lược đồ Dữ liệu (Schema)

| Cột | Kiểu dữ liệu | Bắt buộc | Ràng buộc / Khóa | Mô tả |
|---|---|---|---|---|
| `id` | UUID/CUID | Có | PK | Khóa chính tự sinh của record |
| `company_id` | String | Có | FK / Index | ID của công ty (nằm trong tenant) sở hữu nhóm này |
| `tenant_id` | String | Có | FK / Index | ID của tenant để isolate data ở cấp cao nhất |
| `code` | String | Có | Unique(company_id, code) | Mã nhóm lương (ví dụ: `VP`, `KD`, `TX`) dùng để lookup |
| `name` | String | Có | | Tên nhóm lương hiển thị (ví dụ: "Khối Văn Phòng") |
| `pay_formula_type` | String | Không | | Mapping với loại công thức tính lương đặc thù của nhóm |
| `is_active` | Boolean | Có | Default: `true` | Cờ kích hoạt nhóm, hỗ trợ vô hiệu hóa mềm |
| `deleted_at` | DateTime | Không | | Thời điểm xóa mềm (soft delete) |

## 3. Các ràng buộc nghiệp vụ (Constraints)
- **Unique Constraint**: Cặp `(company_id, code)` phải là duy nhất. Hai nhóm trong cùng một công ty không được phép trùng mã code.
- **Soft Delete**: Không được xóa vật lý. Dùng `deleted_at` để lọc dữ liệu hợp lệ.
- Bảng này sẽ được tham chiếu (FK) bởi hồ sơ nhân viên (`emp_employee` hoặc `emp_employment_record`) hoặc rule của bộ phận.
