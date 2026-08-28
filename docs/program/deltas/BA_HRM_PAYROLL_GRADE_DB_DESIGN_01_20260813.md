# DB Design — Database Schema & Data Model for Wave 1: Danh mục Ngạch bậc lương

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-PAYROLL-GRADE-DB-DESIGN-01 |
| ref_techspec | [BA_HRM_PAYROLL_GRADE_TECHSPEC_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_PAYROLL_GRADE_TECHSPEC_01_20260813.md) |
| ref_srs | [BA_HRM_PAYROLL_GRADE_SRS_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_PAYROLL_GRADE_SRS_01_20260813.md) |
| Prisma Schema Location | `apps/api/hrm-api/prisma/schema.prisma` |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Sẵn sàng cho API_DESIGN |

---

## 1. Thiết kế Bảng CSDL (Tenant Side: `hrm-api`)

### 1.1. Bảng `pay_job_grade` (Danh mục Ngạch bậc lương)

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `VARCHAR(36)` | PRIMARY KEY, DEFAULT uuid() | ID định danh nội bộ |
| `tenant_id` | `VARCHAR(64)` | NOT NULL | Định danh tenant |
| `company_id` | `VARCHAR(64)` | NOT NULL | Định danh công ty thành viên |
| `code` | `VARCHAR(32)` | NOT NULL | Mã ngạch (VD: `D1`, `D2`, `E1`, `E2`) |
| `name` | `VARCHAR(255)` | NOT NULL | Tên ngạch (VD: "Ngạch D1 - Quản lý cao cấp") |
| `is_read_only` | `BOOLEAN` | NOT NULL, DEFAULT true | Đánh dấu dữ liệu đồng bộ từ XBOS master |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'active' | ENUM: `active`, `archived` |
| `effective_date` | `DATE` | NOT NULL | Ngày hiệu lực của ngạch |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời gian cập nhật |

**Indexes & Constraints:**
- `UNIQUE INDEX idx_pay_job_grade_tenant_code`: `(tenant_id, company_id, code)`
- `INDEX idx_pay_job_grade_status`: `(tenant_id, company_id, status)`

---

### 1.2. Bảng `pay_job_grade_step` (Chi tiết mức lương theo Bậc)

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `VARCHAR(36)` | PRIMARY KEY, DEFAULT uuid() | ID định danh nội bộ |
| `job_grade_id` | `VARCHAR(36)` | NOT NULL, FK `pay_job_grade(id) ON DELETE CASCADE` | Link tới Ngạch bậc cha |
| `step_number` | `INTEGER` | NOT NULL | Số bậc (1 = Bậc I, 2 = Bậc II, ...) |
| `base_salary` | `DECIMAL(15, 2)` | NOT NULL | Mức lương cứng của bậc (VNĐ) |
| `job_titles` | `JSONB` | NULLABLE | Mảng các chức danh áp dụng (multi-select, quan hệ 1-N từ Ngạch) |
| `note` | `TEXT` | NULLABLE | Ghi chú (VD: "Chưa có căn cứ văn bản") |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời gian tạo |

**Indexes & Constraints:**
- `UNIQUE INDEX idx_pay_job_grade_step_num`: `(job_grade_id, step_number)`
- `CHECK chk_base_salary_positive`: `base_salary > 0`

---

## 2. Snippet Prisma Schema Reference

```prisma
model PayJobGrade {
  id            String             @id @default(uuid()) @db.VarChar(36)
  tenantId      String             @map("tenant_id") @db.VarChar(64)
  companyId     String             @map("company_id") @db.VarChar(64)
  code          String             @db.VarChar(32)
  name          String             @db.VarChar(255)
  isReadOnly    Boolean            @default(true) @map("is_read_only")
  status        String             @default("active") @db.VarChar(20)
  effectiveDate DateTime           @map("effective_date") @db.Date
  createdAt     DateTime           @default(now()) @map("created_at") @db.Timestamptz
  updatedAt     DateTime           @updatedAt @map("updated_at") @db.Timestamptz
  steps         PayJobGradeStep[]

  @@unique([tenantId, companyId, code], name: "uq_pay_job_grade_tenant_code")
  @@index([tenantId, companyId, status], name: "idx_pay_job_grade_status")
  @@map("pay_job_grade")
}

model PayJobGradeStep {
  id         String      @id @default(uuid()) @db.VarChar(36)
  jobGradeId String      @map("job_grade_id") @db.VarChar(36)
  stepNumber Int         @map("step_number")
  baseSalary Decimal     @map("base_salary") @db.Decimal(15, 2)
  note       String?     @db.Text
  createdAt  DateTime    @default(now()) @map("created_at") @db.Timestamptz
  jobGrade   PayJobGrade @relation(fields: [jobGradeId], references: [id], onDelete: Cascade)

  @@unique([jobGradeId, stepNumber], name: "uq_pay_job_grade_step_num")
  @@map("pay_job_grade_step")
}
```

---

## 3. Seed Cardinality & Sample Data (11 Ngạch bậc QĐ 2A)

Seed data gồm 11 mã ngạch từ `D1` tới `E2` ban hành chính thức:

```sql
-- Sample Seed inserting Grade D1 & E1
INSERT INTO pay_job_grade (id, tenant_id, company_id, code, name, is_read_only, status, effective_date)
VALUES 
('g-d1-001', 'xevn', 'c1', 'D1', 'Ngạch D1 - Lãnh đạo cấp cao', true, 'active', '2026-01-01'),
('g-e1-001', 'xevn', 'c1', 'E1', 'Ngạch E1 - Nhân viên chuyên môn', true, 'active', '2026-01-01');

INSERT INTO pay_job_grade_step (id, job_grade_id, step_number, base_salary, note)
VALUES
('s-d1-1', 'g-d1-001', 1, 15000000.00, 'Bậc I'),
('s-d1-2', 'g-d1-001', 2, 17500000.00, 'Bậc II'),
('s-e1-1', 'g-e1-001', 1, 6500000.00, 'Bậc I'),
('s-e1-2', 'g-e1-001', 2, 7200000.00, 'Bậc II');
```
