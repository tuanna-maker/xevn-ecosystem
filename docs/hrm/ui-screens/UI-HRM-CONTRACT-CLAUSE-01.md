# UI Screen Spec — UI-HRM-CONTRACT-CLAUSE-01: Quản lý Thư viện Điều khoản HĐLĐ (Wave 11)

| Meta | Value |
|---|---|
| work_item_id | BA-PO-HRM-FE-UI-SCREEN-SPEC-CLAUSE-01 |
| ref_srs | [BA_HRM_CONTRACT_CLAUSE_LIBRARY_SRS_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_CONTRACT_CLAUSE_LIBRARY_SRS_01_20260813.md) |
| ref_techspec | [BA_HRM_CONTRACT_CLAUSE_TECHSPEC_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_CONTRACT_CLAUSE_TECHSPEC_01_20260813.md) |
| ref_api_design | [BA_HRM_CONTRACT_CLAUSE_API_DESIGN_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_CONTRACT_CLAUSE_API_DESIGN_01_20260813.md) |
| Target Surface | Web Portal (`apps/web` - route `/hr/payroll/setup?tab=contract_clauses`) |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Sẵn sàng cho Dev FE implement |

---

## 1. Screen ID + Route & UI Components

- **Screen ID:** `UI-HRM-CONTRACT-CLAUSE-01`
- **Route / Tab:** `/hr/payroll/setup?tab=contract_clauses`
- **UI Shell:** Pattern `PAT-SETTINGS-CATALOG-01` compact. Tabs phụ: *Tất cả điều khoản*, *Điều khoản dùng chung*, *Điều khoản đặc thù Lái xe*.

---

## 2. Table Render & Dialog Binding

- **Cột Bảng:** Mã điều khoản | Tiêu đề | Phân loại | Nội dung vắn tắt | Trạng thái | Thao tác.
- **Dialog Controls:** Modal `PAT-DIALOG-FULL-VIEWPORT-CC-01` chỉnh sửa Rich Text nội dung điều khoản.
