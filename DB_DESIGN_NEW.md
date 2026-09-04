# DB_DESIGN_NEW v1
Database Design — XeVN Ecosystem OS
Engine: PostgreSQL 16+
ORM: Prisma
Multi-tenancy: Row-level via tenant_id
Date: 2026-08-07
Status: Draft
Classification: Internal Use Only

---

## 1. Tenants

Represents a legal entity within the platform.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | |
| name | TEXT | NOT NULL | Legal display name |
| slug | TEXT | UNIQUE, NOT NULL | Globally unique for subdomain routing |
| industry | TEXT | NULLABLE | Catalog reference |
| status | TEXT | NOT NULL | PROVISIONING / ACTIVE / SUSPENDED / ARCHIVED |
| timezone | TEXT | NOT NULL | IANA format |
| locale | TEXT | NOT NULL | Locale for catalog fallback |
| admin_email | TEXT | NOT NULL | Tenant administrator contact |
| admin_full_name | TEXT | NOT NULL | Tenant administrator display name |
| deleted_at | TIMESTAMPTZ | NULLABLE | Soft-delete marker |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| activated_at | TIMESTAMPTZ | NULLABLE | Set on activation |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

Indexes: slug (unique), status, created_at.

---

## 2. Users

Platform identity. One user can hold memberships across tenants.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | |
| email | TEXT | UNIQUE, NOT NULL | Canonical lowercase |
| full_name | TEXT | NOT NULL | |
| password_hash | TEXT | NOT NULL | bcrypt factor twelve |
| locked_until | TIMESTAMPTZ | NULLABLE | Lockout after failed logins |
| last_login_at | TIMESTAMPTZ | NULLABLE | |
| deleted_at | TIMESTAMPTZ | NULLABLE | Soft-delete marker |

Indexes: email, locked_until.

---

## 3. Memberships

Joins a user to a tenant with role and optional scoping.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | |
| tenant_id | UUID | NOT NULL, FK to tenants(id) | |
| user_id | UUID | NOT NULL, FK to users(id) | |
| role | TEXT | NOT NULL | Platform role |
| status | TEXT | NOT NULL | PENDING / ACTIVE / SUSPENDED |
| scope_type | TEXT | NULLABLE | department / payroll_period |
| scope_value | UUID | NULLABLE | FK to related entity |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| deleted_at | TIMESTAMPTZ | NULLABLE | Soft-delete marker |

Indexes: composite unique (tenant_id, user_id), tenant_id, role.

| start_date | DATE | NULLABLE | |
| end_date | DATE | NULLABLE | Contract end; null for indefinite |
| base_salary | NUMERIC(14,2) | NULLABLE | Regional floor validated |
| status | TEXT | NOT NULL | ACTIVE / INACTIVE / TERMINATED |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| deleted_at | TIMESTAMPTZ | NULLABLE | Soft-delete marker |

Indexes: composite unique (tenant_id, employee_code), composite unique (tenant_id, national_id), tenant_id, department_id, status.

Constraints: age between 15 and 70 enforced via check constraint.

---

## 6. Attendance Records

GPS-backed check-in/out log per employee per day.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | |
| tenant_id | UUID | NOT NULL | |
| employee_id | UUID | NOT NULL | |
| workplace_id | UUID | NOT NULL | FK catalog_items |
| checked_in_at | TIMESTAMPTZ | NULLABLE | |
| checked_out_at | TIMESTAMPTZ | NULLABLE | Auto-set after 10 hours |
| check_in_lat | NUMERIC(9,6) | NULLABLE | |
| check_in_lng | NUMERIC(9,6) | NULLABLE | |
| check_out_lat | NUMERIC(9,6) | NULLABLE | |
| check_out_lng | NUMERIC(9,6) | NULLABLE | |
| notes | TEXT | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

Indexes: composite (tenant_id, employee_id, checked_in_at), workplace_id.

---

## 7. Leave Requests

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | |
| tenant_id | UUID | NOT NULL | |
| employee_id | UUID | NOT NULL | |
| leave_type_id | UUID | NOT NULL | FK catalog_items |
| start_date | DATE | NOT NULL | |
| end_date | DATE | NOT NULL | |
| reason | TEXT | NULLABLE | |
| attachment_url | TEXT | NULLABLE | Doctor certificate path |
| status | TEXT | NOT NULL | PENDING / APPROVED / REJECTED / CANCELLED |
| approved_by | UUID | NULLABLE | FK users |
| approved_at | TIMESTAMPTZ | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

Indexes: composite (tenant_id, employee_id, status), leave_type_id, approved_by.

Constraints: end_date >= start_date.

---

## 8. Payroll Records

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | |
| tenant_id | UUID | NOT NULL | |
| period_month | DATE | NOT NULL | First day of period |
| employee_id | UUID | NOT NULL | |
| gross | NUMERIC(14,2) | NOT NULL | Non-negative |
| deductions | JSONB | NULLABLE | BHXH, BHYT, BHTN, PIT |
| net | NUMERIC(14,2) | NOT NULL | |
| status | TEXT | NOT NULL | DRAFT / HR_REVIEWED / FINANCE_APPROVED / TA_CONFIRMED / ISSUED / LOCKED |
| locked_at | TIMESTAMPTZ | NULLABLE | Immutable once set |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

Indexes: composite (tenant_id, period_month, employee_id), status.

---

## 9. Workflow Instances

Generic approval tracker reused by leave, recruitment, and other business flows.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | |
| tenant_id | UUID | NOT NULL | |
| type | TEXT | NOT NULL | leave / recruitment / generic |
| entity_id | UUID | NOT NULL | FK to business entity |
| submitter_id | UUID | NOT NULL | Cannot also be approver |
| current_level | INTEGER | NOT NULL, DEFAULT 1 | 1 = L1, 2 = L2 |
| status | TEXT | NOT NULL, DEFAULT SUBMITTED | SUBMITTED / L1_PENDING / L1_APPROVED / L2_PENDING / L2_APPROVED / L2_REJECTED / CANCELLED |
| approver_l1_id | UUID | NULLABLE | |
| approver_l2_id | UUID | NULLABLE | |
| reject_reason | TEXT | NULLABLE | Min 10 chars when rejected |
| submitted_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| l1_approved_at | TIMESTAMPTZ | NULLABLE | |
| l2_approved_at | TIMESTAMPTZ | NULLABLE | |
| completed_at | TIMESTAMPTZ | NULLABLE | |
| escalated_at | TIMESTAMPTZ | NULLABLE | |
| escalate_to_id | UUID | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

Indexes: composite (tenant_id, entity_id, type), submitter_id, status, approver_l1_id, approver_l2_id.

Constraints: current_level between 1 and 2.

---

## 10. Catalog Items

Platform and tenant reference data. Platform rows immutable by tenant.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | |
| tenant_id | UUID | NULLABLE | Null means platform-owned |
| type | TEXT | NOT NULL | leave_type / org_type / employment_type / position / workplace / gender / payment_status |
| code | TEXT | NOT NULL | Machine-readable key |
| display_name | TEXT | NOT NULL | Vietnamese display label |
| is_platform | BOOLEAN | NOT NULL, DEFAULT FALSE | Platform rows cannot be hard-deleted by tenant |
| status | TEXT | NOT NULL, DEFAULT ACTIVE | ACTIVE / INACTIVE |
| sort_order | INTEGER | NULLABLE | UI ordering |
| metadata | JSONB | NULLABLE | Extensible attributes |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| deleted_at | TIMESTAMPTZ | NULLABLE | Soft-delete marker |

Indexes: composite unique (tenant_id, type, code), type, is_platform, status.

---

## 11. Entity Relations

- tenants 1:N users via memberships (indirect)
- tenants 1:N organizations, employees, attendance_records, leave_requests, payroll_records, workflow_instances
- users 1:N memberships
- users 1:N workflow_instances (as submitter, approver_l1, approver_l2, escalate_to)
- employees 1:N attendance_records, leave_requests, payroll_records
- employees self-reference via manager_id (hierarchy)
- organizations self-reference via parent_id (tree)
- catalog_items referenced by employees (position, contract_type, employment_type), attendance (workplace), leave (leave_type)

---

## 12. Multi-Tenant Isolation Strategy

All queries filter by tenant_id through the data-access layer. Application code must not construct raw SQL bypassing tenant filter. Foreign keys from tenant-scoped tables do not reference cross-tenant parents without tenant_id match verification.
