# PO-HRM-PAY-PAYSLIP-TEMPLATE-SPEC-01 — Mẫu phiếu lương (Payslip Templates)

## 1. Mở bài (Context & Mục tiêu)
- **Tình trạng hiện tại:** Màn hình cài đặt "Mẫu phiếu lương" (`PayPayslipTemplateSettingsPanel.tsx`) đang là UI cứng (mock), lưu dưới dạng global config ở Frontend.
- **Nghiệp vụ cốt lõi:** Theo yêu cầu chuẩn hóa UI/UX Cài đặt và logic nghiệp vụ, **Phiếu lương phải ăn theo Bảng lương**. Do đó, cần có màn hình Danh sách Mẫu phiếu lương, và chức năng CRUD (Thêm/Sửa/Xóa). Mỗi Mẫu phiếu lương sẽ được map với 1 Mẫu bảng lương cụ thể.

## 2. TechSpec (Giải pháp kỹ thuật)
- Chuyển đổi màn hình `PayPayslipTemplateSettingsPanel` từ dạng Single Form sang List + Dialog CRUD.
- **Mapping:** Chọn Mẫu bảng lương (Pay Sheet Template) thông qua Dropdown, lưu `pay_sheet_template_id`.

## 3. DB_DESIGN
- Bảng mới: `payroll_payslip_templates`
- Schema:
  - `id` UUID PRIMARY KEY
  - `tenant_id` TEXT, `company_id` TEXT
  - `code` TEXT UNIQUE (Mã mẫu)
  - `name` TEXT (Tên hiển thị)
  - `pay_sheet_template_id` UUID NULL (Tham chiếu đến `pay_sheet_templates`)
  - `settings` JSONB (Lưu config: `layoutType`, `showLogo`, `hideZeroValues`, vv.)
  - `is_active` BOOLEAN DEFAULT TRUE

## 4. API_DESIGN
- Owner: `hrm-api` (`PayslipTemplateService` & `PayslipTemplateController`)
- Endpoints:
  - `GET /api/hrm/settings/payslip-templates`
  - `POST /api/hrm/settings/payslip-templates`
  - `PATCH /api/hrm/settings/payslip-templates/:id`
  - `DELETE /api/hrm/settings/payslip-templates/:id`
