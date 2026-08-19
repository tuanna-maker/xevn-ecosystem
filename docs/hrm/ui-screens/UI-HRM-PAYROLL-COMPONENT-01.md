# UI Screen Spec — UI-HRM-PAYROLL-COMPONENT-01: Quản lý Thành phần lương & Phụ cấp/Thưởng/Khấu trừ (Wave 8 + Wave 9)

| Meta | Value |
|---|---|
| work_item_id | BA-PO-HRM-FE-UI-SCREEN-SPEC-PAYCOMP-01 |
| ref_srs | [BA_HRM_PAYROLL_COMPONENT_SRS_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_PAYROLL_COMPONENT_SRS_01_20260813.md) |
| ref_techspec | [BA_HRM_PAYROLL_COMPONENT_TECHSPEC_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_PAYROLL_COMPONENT_TECHSPEC_01_20260813.md) |
| ref_api_design | [BA_HRM_PAYROLL_COMPONENT_API_DESIGN_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_PAYROLL_COMPONENT_API_DESIGN_01_20260813.md) |
| Target Surface | Web Portal (`apps/web` - route `/hr/payroll/setup?tab=payroll_components`) |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Sẵn sàng cho Dev FE implement |

---

## 1. Screen ID + Route & UI Components

- **Screen ID:** `UI-HRM-PAYROLL-COMPONENT-01`
- **Route / Tab:** `/hr/payroll/setup?tab=payroll_components`
- **UI Shell:** Pattern `PAT-SETTINGS-CATALOG-01` compact. Tabs phụ: *Tất cả*, *Thu nhập cố định*, *Thu nhập sản lượng*, *Phụ cấp*, *Thưởng*, *Khấu trừ*.

---

## 2. Table Render & Dialog Binding

- **Cột Bảng:** Mã khoản | Tên hiển thị | Nhóm thành phần | Dấu tính (`+`/`-`) | Phạm vi (`Global`/`Company`/`Branch`) | Đơn vị tính | Trạng thái (`Active`/`Stopped`) | Thao tác.
- **Dialog Controls:** 
  - Form chọn Scope (`Global` / `Company` / `Branch`). Nếu chọn `Branch`, bắt buộc chọn Chi nhánh từ dropdown.
  - Dropdown chọn nhóm (`FIXED_EARNING`, `VARIABLE_EARNING`, `ALLOWANCE`, `BONUS`, `DEDUCTION`). Dấu tính tự động hiển thị (`+` cho Thu nhập/Phụ cấp/Thưởng, `-` cho Khấu trừ).
- **Soft-Stop Action:** Nút "Ngừng sử dụng" có Dialog xác nhận cảnh báo nếu khoản lương đang được dùng trong công thức.
