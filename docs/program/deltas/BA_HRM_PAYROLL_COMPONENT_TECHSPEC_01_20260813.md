# TechSpec — Technical Specification for Wave 8 + Wave 9: Thành phần lương & Phụ cấp / Thưởng / Khấu trừ

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-PAYROLL-COMPONENT-TECHSPEC-01 |
| ref_srs | [BA_HRM_PAYROLL_COMPONENT_SRS_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_PAYROLL_COMPONENT_SRS_01_20260813.md) |
| ref_program | [PO_HRM_CNTT_PAYROLL_CATALOG_PROGRAM.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/PO_HRM_CNTT_PAYROLL_CATALOG_PROGRAM.md) |
| Domain | `hrm_payroll_component`, `hrm_payroll_allowance`, `hrm_payroll_bonus`, `hrm_payroll_deduction` |
| Scope | Master (XBOS publish) + Local Extensions (Company/Branch specific) |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Sẵn sàng cho DB_DESIGN & API_DESIGN |

---

## 1. Kiến trúc Hybrid Scope (Master vs Local) & Classifications

1. **Category Scope:**
   - `GLOBAL` (Toàn Tập đoàn): Ban hành từ XBOS `xevn/holding`, tenant chỉ đọc.
   - `COMPANY`: Đơn vị thành viên tự mở rộng cục bộ cho cả công ty.
   - `BRANCH`: Đơn vị chi nhánh cụ thể tự mở rộng (VD đơn giá lượt Nam Định khác Ninh Bình).
2. **5 Nhóm Thành phần lương & Dấu tính toán:**
   - `FIXED_EARNING` (Thu nhập cố định): Dấu `+`
   - `VARIABLE_EARNING` (Thu nhập sản lượng/vận hành): Dấu `+`
   - `ALLOWANCE` (Phụ cấp): Dấu `+`
   - `BONUS` (Thưởng): Dấu `+`
   - `DEDUCTION` (Khấu trừ): Dấu `-`
3. **Soft-Stop Rule (Cấm Hard-Delete):** Khi ngừng sử dụng, chuyển `status = stopped`. Không được xóa DB nếu đã có kỳ lương tham chiếu.
