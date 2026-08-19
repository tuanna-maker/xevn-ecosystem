# API Design — OpenAPI & DTO Contracts for Wave 7: Danh mục Ca làm việc

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-ATTENDANCE-SHIFT-API-DESIGN-01 |
| ref_techspec | [BA_HRM_ATTENDANCE_SHIFT_TECHSPEC_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_ATTENDANCE_SHIFT_TECHSPEC_01_20260813.md) |
| ref_db_design | [BA_HRM_ATTENDANCE_SHIFT_DB_DESIGN_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_ATTENDANCE_SHIFT_DB_DESIGN_01_20260813.md) |
| ref_srs | [BA_HRM_ATTENDANCE_SHIFT_SRS_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_ATTENDANCE_SHIFT_SRS_01_20260813.md) |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Đủ điều kiện Handoff cho Dev FE/BE |

---

## 1. Ma trận Truy xuất SRS -> API -> CSDL (Traceability Matrix)

| SRS UC / FR ID | Tham chiếu Diễn biến SRS | Endpoints API | Controller / Service | Bảng CSDL ảnh hưởng |
|---|---|---|---|---|
| `UC-HRM-SHIFT-01` / `FR-SHIFT-01` | Bước 1, 3, 5 (Mở danh sách Ca làm việc) | `GET /api/v1/hrm/attendance-shifts` | `AttShiftController.findAll` -> `ShiftService` | `att_shift` |
| `UC-HRM-SHIFT-01` / `FR-SHIFT-02` | Bước 2, 3, 4, 5 (Tạo Ca làm việc mới) | `POST /api/v1/hrm/attendance-shifts` | `AttShiftController.create` -> `ShiftService` | `att_shift` |
| `UC-HRM-SHIFT-02` / `FR-SHIFT-03` | Bước 1, 2, 3 (Chỉnh sửa / Ngừng ca) | `PUT /api/v1/hrm/attendance-shifts/:id` | `AttShiftController.update` -> `ShiftService` | `att_shift` |

---

## 2. Chi tiết Endpoints Specs

### 2.1. `POST /api/v1/hrm/attendance-shifts` (Tạo Ca làm việc)

- **Request Body (`CreateShiftDto`):**
```json
{
  "code": "SHIFT_MORNING",
  "name": "Ca Sáng (06:00 - 14:00)",
  "startTime": "06:00",
  "endTime": "14:00",
  "breakStart": "11:30",
  "breakEnd": "12:00",
  "workHours": 7.5,
  "isNightShift": false
}
```

- **Response `201 Created`:**
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "id": "shift-m-001",
    "code": "SHIFT_MORNING",
    "name": "Ca Sáng (06:00 - 14:00)",
    "startTime": "06:00",
    "endTime": "14:00",
    "workHours": 7.5,
    "isNightShift": false,
    "status": "active"
  }
}
```
