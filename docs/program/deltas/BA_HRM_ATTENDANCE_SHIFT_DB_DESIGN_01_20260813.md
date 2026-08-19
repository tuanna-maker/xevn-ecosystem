# DB Design — Database Schema & Data Model for Wave 7: Danh mục Ca làm việc

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-ATTENDANCE-SHIFT-DB-DESIGN-01 |
| ref_techspec | [BA_HRM_ATTENDANCE_SHIFT_TECHSPEC_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_ATTENDANCE_SHIFT_TECHSPEC_01_20260813.md) |
| ref_srs | [BA_HRM_ATTENDANCE_SHIFT_SRS_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_ATTENDANCE_SHIFT_SRS_01_20260813.md) |
| Prisma Schema Location | `apps/api/hrm-api/prisma/schema.prisma` |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Sẵn sàng cho API_DESIGN |

---

## 1. Bảng `att_shift` (Danh mục Ca làm việc)

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `VARCHAR(36)` | PRIMARY KEY, DEFAULT uuid() | ID định danh nội bộ |
| `tenant_id` | `VARCHAR(64)` | NOT NULL | Định danh tenant |
| `company_id` | `VARCHAR(64)` | NOT NULL | Định danh công ty thành viên |
| `code` | `VARCHAR(32)` | NOT NULL | Mã ca (VD: `SHIFT_MORNING`, `SHIFT_NIGHT`) |
| `name` | `VARCHAR(255)` | NOT NULL | Tên ca (VD: "Ca Sáng", "Ca Đêm") |
| `start_time` | `TIME` | NOT NULL | Giờ bắt đầu (VD: `06:00:00`) |
| `end_time` | `TIME` | NOT NULL | Giờ kết thúc (VD: `14:00:00`) |
| `break_start` | `TIME` | NULLABLE | Giờ bắt đầu nghỉ giữa ca |
| `break_end` | `TIME` | NULLABLE | Giờ kết thúc nghỉ giữa ca |
| `work_hours` | `DECIMAL(4, 2)` | NOT NULL | Số giờ công chuẩn của ca (VD: `8.00`) |
| `is_night_shift` | `BOOLEAN` | NOT NULL, DEFAULT false | Đánh dấu ca đêm (tính phụ cấp ca đêm) |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'active' | ENUM: `active`, `inactive` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời gian cập nhật |

**Indexes & Constraints:**
- `UNIQUE INDEX idx_att_shift_tenant_code`: `(tenant_id, company_id, code)`

---

## 2. Snippet Prisma Schema Reference

```prisma
model AttShift {
  id           String   @id @default(uuid()) @db.VarChar(36)
  tenantId     String   @map("tenant_id") @db.VarChar(64)
  companyId    String   @map("company_id") @db.VarChar(64)
  code         String   @db.VarChar(32)
  name         String   @db.VarChar(255)
  startTime    String   @map("start_time") @db.VarChar(8)
  endTime      String   @map("end_time") @db.VarChar(8)
  breakStart   String?  @map("break_start") @db.VarChar(8)
  breakEnd     String?  @map("break_end") @db.VarChar(8)
  workHours    Decimal  @map("work_hours") @db.Decimal(4, 2)
  isNightShift Boolean  @default(false) @map("is_night_shift")
  status       String   @default("active") @db.VarChar(20)
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt    DateTime @updatedAt @map("updated_at") @db.Timestamptz

  @@unique([tenantId, companyId, code], name: "uq_att_shift_tenant_code")
  @@map("att_shift")
}
```
