# API Contract XeVN Ecosystem OS v1
Base URL: /api/v1
Auth: Bearer JWT. Header X-Tenant-ID validated against JWT.

## 1. Base rules
- JSON request and response
- Error envelope: {code, message, details?, requestId}
- Pagination: page and limit
- Schema validation on every request

## 2. XBOS

### Tenants
POST /xbos/tenants SUPER_ADMIN
GET /xbos/tenants SUPER_ADMIN
PATCH /xbos/tenants/:id SUPER_ADMIN
POST /xbos/tenants/:id/activate SUPER_ADMIN

### Memberships
GET /xbos/memberships TENANT_ADMIN
POST /xbos/memberships TENANT_ADMIN
PATCH /xbos/memberships/:id/role TENANT_ADMIN
DELETE /xbos/memberships/:id TENANT_ADMIN
GET /xbos/memberships/me Any

### Workflows
POST /xbos/workflows Employee
GET /xbos/workflows Any filtered
POST /xbos/workflows/:id/approve Manager
POST /xbos/workflows/:id/reject Manager 10 chars min
GET /xbos/workflows/:id/history Involved party

## 3. HRM

### Employees
POST /hrm/employees HR Manager
GET /hrm/employees HR Manager
PATCH /hrm/employees/:id HR Manager
GET /hrm/employees/:id/profile Any

### Attendance
POST /hrm/attendance/check-in Employee
POST /hrm/attendance/check-out Employee
GET /hrm/attendance HR Manager

### Leave
POST /hrm/leave-requests Employee
GET /hrm/leave-requests Any
POST /hrm/leave-requests/:id/approve Manager

### Payroll
POST /hrm/payroll/batch HR Manager
GET /hrm/payroll/:period Finance
POST /hrm/payroll/:id/approve Finance
POST /hrm/payroll/:id/lock Tenant Admin

### Recruitment
POST /hrm/recruitment/requisitions Recruiter
POST /hrm/recruitment/candidates Recruiter
GET /hrm/recruitment/requisitions/:id Recruiter

## 4. Error catalog
TENANT_SLUG_EXISTS 409
TENANT_EMAIL_INVALID 422
ATTENDANCE_LOCATION_OUT_OF_RANGE 422
PAYROLL_ALREADY_LOCKED 409
