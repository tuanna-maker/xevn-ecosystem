# DB Design — Database Schema & Data Model for Wave 3: Chức danh & Phòng ban/Chi nhánh

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-POSITION-DEPARTMENT-DB-DESIGN-01 |
| ref_techspec | [BA_HRM_POSITION_DEPARTMENT_TECHSPEC_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_POSITION_DEPARTMENT_TECHSPEC_01_20260813.md) |
| ref_srs | [BA_HRM_POSITION_DEPARTMENT_SRS_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_POSITION_DEPARTMENT_SRS_01_20260813.md) |
| Prisma Schema Location | `apps/api/hrm-api/prisma/schema.prisma` |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Sẵn sàng cho API_DESIGN |

---

## 1. Thiết kế Bảng CSDL (Tenant Side: `hrm-api`)

### 1.1. Bảng `pay_department` (Phòng ban / Chi nhánh)

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `VARCHAR(36)` | PRIMARY KEY, DEFAULT uuid() | ID định danh nội bộ |
| `tenant_id` | `VARCHAR(64)` | NOT NULL | Định danh tenant |
| `company_id` | `VARCHAR(64)` | NOT NULL | Định danh công ty thành viên |
| `code` | `VARCHAR(32)` | NOT NULL | Mã phòng ban/chi nhánh (VD: `pb_vthk`, `cn_viet_tri`) |
| `name` | `VARCHAR(255)` | NOT NULL | Tên phòng ban/chi nhánh |
| `department_type` | `VARCHAR(20)` | NOT NULL | ENUM: `functional` (Tập đoàn), `branch` (Chi nhánh địa lý) |
| `parent_department_id` | `VARCHAR(36)` | NULLABLE, FK `pay_department(id) ON DELETE RESTRICT` | Self-reference FK phòng ban/chi nhánh cha |
| `region_code` | `VARCHAR(20)` | NULLABLE | Vùng lương tối thiểu: `REGION_I`, `REGION_II`, `REGION_III`, `REGION_IV` |
| `is_read_only` | `BOOLEAN` | NOT NULL, DEFAULT false | `true` nếu là phòng ban `functional` đồng bộ từ XBOS |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'active' | ENUM: `active`, `inactive` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời gian cập nhật |

**Indexes & Constraints:**
- `UNIQUE INDEX idx_pay_department_tenant_code`: `(tenant_id, company_id, code)`
- `INDEX idx_pay_department_parent`: `(parent_department_id)`

---

### 1.2. Bảng `pay_position` (Danh mục Chức danh)

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `VARCHAR(36)` | PRIMARY KEY, DEFAULT uuid() | ID định danh nội bộ |
| `tenant_id` | `VARCHAR(64)` | NOT NULL | Định danh tenant |
| `company_id` | `VARCHAR(64)` | NOT NULL | Định danh công ty thành viên |
| `code` | `VARCHAR(32)` | NOT NULL | Mã chức danh (VD: `cd_lai_xe_tuyen`, `cd_nv_tong_dai`) |
| `name` | `VARCHAR(255)` | NOT NULL | Tên chức danh chuẩn hoá |
| `grade_code` | `VARCHAR(32)` | **NOT NULL** | Foreign Key tới `pay_job_grade.code` (Wave 1) |
| `default_department_id` | `VARCHAR(36)` | NULLABLE, FK `pay_department(id) ON DELETE SET NULL` | ID phòng ban mặc định |
| `historical_note` | `TEXT` | NULLABLE | Ghi chú tham chiếu (VD: "Hệ số 20 QC 2020") |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'active' | ENUM: `active`, `inactive` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời gian cập nhật |

**Indexes & Constraints:**
- `UNIQUE INDEX idx_pay_position_tenant_code`: `(tenant_id, company_id, code)`
- `INDEX idx_pay_position_grade`: `(tenant_id, company_id, grade_code)`
- `FOREIGN KEY (tenant_id, company_id, grade_code) REFERENCES pay_job_grade(tenant_id, company_id, code)`

---

## 2. Snippet Prisma Schema Reference

```prisma
model PayDepartment {
  id                 String          @id @default(uuid()) @db.VarChar(36)
  tenantId           String          @map("tenant_id") @db.VarChar(64)
  companyId          String          @map("company_id") @db.VarChar(64)
  code               String          @db.VarChar(32)
  name               String          @db.VarChar(255)
  departmentType     String          @map("department_type") @db.VarChar(20)
  parentDepartmentId String?         @map("parent_department_id") @db.VarChar(36)
  regionCode         String?         @map("region_code") @db.VarChar(20)
  isReadOnly         Boolean         @default(false) @map("is_read_only")
  status             String          @default("active") @db.VarChar(20)
  createdAt          DateTime        @default(now()) @map("created_at") @db.Timestamptz
  updatedAt          DateTime        @updatedAt @map("updated_at") @db.Timestamptz

  parentDepartment   PayDepartment?  @relation("DepartmentHierarchy", fields: [parentDepartmentId], references: [id], onDelete: Restrict)
  childDepartments   PayDepartment[] @relation("DepartmentHierarchy")
  positions          PayPosition[]

  @@unique([tenantId, companyId, code], name: "uq_pay_department_tenant_code")
  @@index([parentDepartmentId], name: "idx_pay_department_parent")
  @@map("pay_department")
}

model PayPosition {
  id                  String         @id @default(uuid()) @db.VarChar(36)
  tenantId            String         @map("tenant_id") @db.VarChar(64)
  companyId           String         @map("company_id") @db.VarChar(64)
  code                String         @db.VarChar(32)
  name                String         @db.VarChar(255)
  gradeCode           String         @map("grade_code") @db.VarChar(32)
  defaultDepartmentId String?        @map("default_department_id") @db.VarChar(36)
  historicalNote      String?        @map("historical_note") @db.Text
  status              String         @default("active") @db.VarChar(20)
  createdAt           DateTime       @default(now()) @map("created_at") @db.Timestamptz
  updatedAt           DateTime       @updatedAt @map("updated_at") @db.Timestamptz

  defaultDepartment   PayDepartment? @relation(fields: [defaultDepartmentId], references: [id], onDelete: SetNull)

  @@unique([tenantId, companyId, code], name: "uq_pay_position_tenant_code")
  @@index([tenantId, companyId, gradeCode], name: "idx_pay_position_grade")
  @@map("pay_position")
}
```

---

## 3. Seed Cardinality & Sample Data (Phú Thọ -> Phù Ninh & Chức danh Lái xe tuyến)

```sql
-- Seed Phú Thọ Parent Branch & Phù Ninh Child Branch
INSERT INTO pay_department (id, tenant_id, company_id, code, name, department_type, parent_department_id, region_code, is_read_only, status)
VALUES
('dept-pt-001', 'xevn', 'c1', 'cn_phu_tho', 'Chi nhánh Phú Thọ', 'branch', NULL, 'REGION_II', false, 'active'),
('dept-pn-002', 'xevn', 'c1', 'cn_phu_ninh', 'Chi nhánh Phù Ninh', 'branch', 'dept-pt-001', 'REGION_III', false, 'active');

-- Seed Chức danh "Lái xe tuyến" gắn Ngạch E1 (Wave 1)
INSERT INTO pay_position (id, tenant_id, company_id, code, name, grade_code, default_department_id, historical_note, status)
VALUES
('pos-lxt-001', 'xevn', 'c1', 'cd_lai_xe_tuyen', 'Lái xe tuyến (LXT)', 'E1', 'dept-pt-001', 'Gắn Ngạch E1 Wave 1', 'active');
```
