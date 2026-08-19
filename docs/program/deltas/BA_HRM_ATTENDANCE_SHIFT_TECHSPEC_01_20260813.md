# TechSpec — Technical Specification for Wave 7: Danh mục Ca làm việc (Attendance Shift)

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-ATTENDANCE-SHIFT-TECHSPEC-01 |
| ref_srs | [BA_HRM_ATTENDANCE_SHIFT_SRS_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_ATTENDANCE_SHIFT_SRS_01_20260813.md) |
| ref_program | [PO_HRM_CNTT_PAYROLL_CATALOG_PROGRAM.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/PO_HRM_CNTT_PAYROLL_CATALOG_PROGRAM.md) |
| Domain | `hrm_attendance_shift` |
| Scope | HRM-Local (Quản lý trực tiếp per company/tenant, KHÔNG publish qua XBOS master) |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Sẵn sàng cho DB_DESIGN & API_DESIGN |

---

## 1. Kiến trúc Local Domain & Logic Rules

1. **HRM Local Storage:** Danh mục Ca làm việc được quản lý trực tiếp tại bảng `att_shift` của `hrm-api`.
2. **Shift Time Range Calculation:** `work_hours = (end_time - start_time) - (break_end - break_start)`.
3. **Night Shift Flag:** Automatic detection `is_night_shift = true` nếu khung giờ giao thoa với khoảng 22:00 - 06:00.
4. **Validation Rules:**
   - `start_time != end_time`
   - `break_start` & `break_end` phải nằm trong khoảng `[start_time, end_time]`
   - `code` UNIQUE trong phạm vi `(tenant_id, company_id)`.
