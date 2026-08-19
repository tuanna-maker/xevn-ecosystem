# DB Design — Database Schema & Data Model for Wave 11: Contract Clause Library

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-CONTRACT-CLAUSE-DB-DESIGN-01 |
| ref_techspec | [BA_HRM_CONTRACT_CLAUSE_TECHSPEC_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_CONTRACT_CLAUSE_TECHSPEC_01_20260813.md) |
| ref_srs | [BA_HRM_CONTRACT_CLAUSE_LIBRARY_SRS_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_CONTRACT_CLAUSE_LIBRARY_SRS_01_20260813.md) |
| Prisma Schema Location | `apps/api/hrm-api/prisma/schema.prisma` |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Sẵn sàng cho API_DESIGN |

---

## 1. Bảng `pay_contract_clause` & `pay_employee_contract_clause_snapshot`

### 1.1. Bảng `pay_contract_clause` (Thư viện Điều khoản)

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `VARCHAR(36)` | PRIMARY KEY, DEFAULT uuid() | ID định danh |
| `tenant_id` | `VARCHAR(64)` | NOT NULL | Định danh tenant |
| `company_id` | `VARCHAR(64)` | NOT NULL | Định danh công ty |
| `code` | `VARCHAR(64)` | NOT NULL | Mã điều khoản |
| `title` | `VARCHAR(255)` | NOT NULL | Tiêu đề điều khoản |
| `content` | `TEXT` | NOT NULL | Nội dung đầy đủ điều khoản |
| `clause_type` | `VARCHAR(32)` | NOT NULL | ENUM: `GENERAL`, `DRIVER_SPECIFIC` |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'active' | ENUM: `active`, `archived` |

---

### 1.2. Bảng `pay_employee_contract_clause_snapshot` (Snapshot Điều khoản HĐ đã ký)

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `VARCHAR(36)` | PRIMARY KEY, DEFAULT uuid() | ID định danh |
| `contract_id` | `VARCHAR(36)` | NOT NULL, FK `pay_employee_contract(id)` | Link Hợp đồng |
| `clause_code` | `VARCHAR(64)` | NOT NULL | Mã điều khoản |
| `snapshot_title` | `VARCHAR(255)` | NOT NULL | Title snapshot thời điểm ký |
| `snapshot_content` | `TEXT` | NOT NULL | Content snapshot thời điểm ký |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm snapshot |

```prisma
model PayContractClause {
  id         String   @id @default(uuid()) @db.VarChar(36)
  tenantId   String   @map("tenant_id") @db.VarChar(64)
  companyId  String   @map("company_id") @db.VarChar(64)
  code       String   @db.VarChar(64)
  title      String   @db.VarChar(255)
  content    String   @db.Text
  clauseType String   @map("clause_type") @db.VarChar(32)
  status     String   @default("active") @db.VarChar(20)
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz

  @@unique([tenantId, companyId, code], name: "uq_pay_clause_code")
  @@map("pay_contract_clause")
}
```
