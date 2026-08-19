# Thiết kế Cơ sở dữ liệu — Hệ sinh thái XeVN OS v1
Công cụ: Postgres 16+. Cô lập tenant theo hàng (row-level) được thực thi trong DAL.

## 1. tenants
id, name, slug unique global, industry, status, timezone, locale, admin_email, admin_full_name, created_at, activated_at

## 2. users
id, email unique, full_name, password_hash, locked_until, last_login_at, created_at

## 3. memberships
id, user_id, tenant_id unique pair, role, status, scope_type, scope_value, activated_at, created_at

## 4. organizations
id, tenant_id, parent_id self-ref, org_type_code, name, display_name, slug, status, metadata jsonb, created_at, updated_at

## 5. employees
id, tenant_id, employee_code unique per tenant, full_name, national_id unique per tenant, date_of_birth, gender, email unique per tenant, phone, department_id, position_id, manager_id, contract_type, employment_type, start_date, end_date, base_salary, status, created_at, updated_at

## 6. attendance_records
id, tenant_id, employee_id, workplace_id, checked_in_at, checked_out_at, check_in_lat/lng, check_out_lat/lng, notes, created_at

## 7. leave_requests
id, tenant_id, employee_id, leave_type_id, start_date, end_date, reason, attachment_url, status, approved_by, approved_at, created_at

## 8. payroll_records
id, tenant_id, period_month, employee_id, gross, deductions, net, status, locked_at, created_at

## 9. workflow_instances
id, tenant_id, type, status, submitter_id, current_level, approver_l1_id, approver_l2_id, reject_reason, entity_id, submitted_at, l1/l2 approved/at, completed_at, escalated_at, escalate_to_id

## 10. catalog_items
id, tenant_id, type, code, display_name, is_platform, status, created_at
