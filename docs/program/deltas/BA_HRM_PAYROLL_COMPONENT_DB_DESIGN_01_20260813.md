# DB Design — Database Schema & Data Model for Wave 8 + Wave 9: Thành phần lương & Phụ cấp/Thưởng/Khấu trừ

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-PAYROLL-COMPONENT-DB-DESIGN-01 |
| ref_techspec | [BA_HRM_PAYROLL_COMPONENT_TECHSPEC_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_PAYROLL_COMPONENT_TECHSPEC_01_20260813.md) |
| ref_srs | [BA_HRM_PAYROLL_COMPONENT_SRS_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_PAYROLL_COMPONENT_SRS_01_20260813.md) |
| Prisma Schema Location | `apps/api/hrm-api/prisma/schema.prisma` |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Sẵn sàng cho API_DESIGN |

---

## 1. Bảng `pay_component` (Danh mục Thành phần lương & Phụ cấp/Thưởng/Khấu trừ)

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `VARCHAR(36)` | PRIMARY KEY, DEFAULT uuid() | ID định danh nội bộ |
| `tenant_id` | `VARCHAR(64)` | NOT NULL | Định danh tenant |
| `company_id` | `VARCHAR(64)` | NOT NULL | Định danh công ty thành viên |
| `code` | `VARCHAR(64)` | NOT NULL | Mã khoản (VD: `ALLOWANCE_PHONE`, `BONUS_ATTENDANCE`) |
| `name` | `VARCHAR(255)` | NOT NULL | Tên hiển thị |
| `category_type` | `VARCHAR(32)` | NOT NULL | ENUM: `FIXED_EARNING`, `VARIABLE_EARNING`, `ALLOWANCE`, `BONUS`, `DEDUCTION` |
| `calculation_sign` | `VARCHAR(4)` | NOT NULL | `+` hoặc `-` |
| `scope_level` | `VARCHAR(20)` | NOT NULL | ENUM: `GLOBAL`, `COMPANY`, `BRANCH` |
| `branch_id` | `VARCHAR(36)` | NULLABLE | FK `pay_department(id)` nếu scope=`BRANCH` |
| `unit_type` | `VARCHAR(32)` | NULLABLE | Đơn vị tính (VD: `PER_MONTH`, `PER_TRIP`, `PER_CALL`) |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'active' | ENUM: `active`, `stopped`, `unclassified` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời gian cập nhật |

**Indexes & Constraints:**
- `UNIQUE INDEX idx_pay_component_scope_code`: `(tenant_id, company_id, scope_level, code)`

---

## 2. Snippet Prisma Schema Reference

```prisma
model PayComponent {
  id              String   @id @default(uuid()) @db.VarChar(36)
  tenantId        String   @map("tenant_id") @db.VarChar(64)
  companyId       String   @map("company_id") @db.VarChar(64)
  code            String   @db.VarChar(64)
  name            String   @db.VarChar(255)
  categoryType    String   @map("category_type") @db.VarChar(32)
  calculationSign String   @map("calculation_sign") @db.VarChar(4)
  scopeLevel      String   @map("scope_level") @db.VarChar(20)
  branchId        String?  @map("branch_id") @db.VarChar(36)
  unitType        String?  @map("unit_type") @db.VarChar(32)
  status          String   @default("active") @db.VarChar(20)
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime @updatedAt @map("updated_at") @db.Timestamptz

  @@unique([tenantId, companyId, scopeLevel, code], name: "uq_pay_component_code")
  @@map("pay_component")
}
```
