import os

OUT = "docs/brand-new-documents-20270801"

# ============= BRD =============
BRD = """
# BRD-XEVN-NEW v1
Yêu cầu Nghiệp vụ — Hệ Sinh Thái Phần mềm XeVN Ecosystem OS
Ngày: 2026-08-01

## 1. Mục tiêu
- Thay thế ngăn cục nhân sự phân mảnh bằng nền tảng đa tenant thống nhất
- Single source of truth: tenant, org, people, payroll data
- RBAC-first, event-driven extensibility, enterprise auditability

## 2. Non-goals
- Legacy migration tooling
- Full ERP replacement
- Real-time timesheet

## 3. Architecture principles
- Multi-tenant row-level isolation
- Stateless API, JWT RS256
- Event-first cross-module coupling
- No hard delete

## 4. Actors
Super Admin, Tenant Admin, HR Manager, Dept Manager, Employee, Finance Staff, Recruiter, Fleet Manager, Dispatcher

## 5. Modules
- XBOS: tenant lifecycle, RBAC, workflow engine, catalog governance, audit log
- HRM: employee profile, attendance, leave, payroll, recruitment, reporting
- HRM Mobile: login, check-in, leave, payslip, push, offline
- Portal/CC: dashboards, catalog management, tenant admin panel
- Logistics: vehicle, driver, trip, tracking

## 6. Acceptance summary
Tenant onboarding under 30 minutes, cross-tenant access denied with 403, workflow enforces two-level approval, immutable audit log, payroll lock prevents post-approval edits.
"""