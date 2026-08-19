# UI Screen Spec — UI-HRM-ATTENDANCE-SHIFT-01: Quản lý Danh mục Ca làm việc (Wave 7)

| Meta | Value |
|---|---|
| work_item_id | BA-PO-HRM-FE-UI-SCREEN-SPEC-SHIFT-01 |
| ref_srs | [BA_HRM_ATTENDANCE_SHIFT_SRS_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_ATTENDANCE_SHIFT_SRS_01_20260813.md) |
| ref_techspec | [BA_HRM_ATTENDANCE_SHIFT_TECHSPEC_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_ATTENDANCE_SHIFT_TECHSPEC_01_20260813.md) |
| ref_api_design | [BA_HRM_ATTENDANCE_SHIFT_API_DESIGN_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_ATTENDANCE_SHIFT_API_DESIGN_01_20260813.md) |
| Target Surface | Web Portal (`apps/web` - route `/hr/payroll/setup?tab=attendance_shifts`) |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Sẵn sàng cho Dev FE implement |

---

## 1. Screen ID + Route & UI Components

- **Screen ID:** `UI-HRM-ATTENDANCE-SHIFT-01`
- **Route / Tab:** `/hr/payroll/setup?tab=attendance_shifts`
- **UI Layout:** Pattern `PAT-SETTINGS-CATALOG-01` compact list table + Dialog Tạo/Sửa Ca.

---

## 2. Table Render & Dialog Binding

- **Cột Bảng:** Mã ca | Tên ca | Giờ bắt đầu - Giờ kết thúc | Giờ nghỉ | Số giờ công | Ca đêm (Badge) | Trạng thái | Hành động.
- **Dialog Fields:** Mã ca (`code`), Tên ca (`name`), TimePicker `startTime`, `endTime`, `breakStart`, `breakEnd`, Switch `isNightShift`.
- **Validation FE:** Chặn nếu `startTime == endTime`.
