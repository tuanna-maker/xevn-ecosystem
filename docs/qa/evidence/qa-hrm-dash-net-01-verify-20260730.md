# QA-HRM-DASH-NET-01-VERIFY

**work_item_id:** QA-HRM-DASH-NET-01-VERIFY
**Generated:** 2026-07-30T15:14:02.064Z
**Portal:** http://127.0.0.1:5173
**Account:** ceo@xe.vn · companyId=main · U65 zero-seed
**Fix under test:** D-HRM-DASH-NET-01 · docs/qa/evidence/d-hrm-dash-net-01-20260730.md
**ack_status:** PASS_TO_PM

## Verdict

🟢 **PASS** — dashboard load includes all 4 required endpoints 2xx; no `attendance/records` on mount; F5 stable; no Sync ERROR banner.

## L0 gates

| Gate | Exit |
|------|------|
| qc:dev-stack | 3221226505 |
| qc:fe-be-health | 0 |

## Initial load — `/command-center/hrm/dashboard`

- URL: http://127.0.0.1:5173/command-center/hrm/dashboard?portal=1&tenantId=xevn&companyId=main
- Error banner: **false**
- HRM API calls captured: **20**

### Required endpoints

| Endpoint | Status | URL |
|----------|--------|-----|
| employees/summary | 200 | /api/hrm/employees/summary?company_id=main |
| attendance/overview | 200 | /api/hrm/attendance/overview?company_id=main&year=2026 |
| payroll/payslips | 200 | /api/hrm/payroll/payslips?company_id=main |
| attendance/leave-requests | 200 | /api/hrm/attendance/leave-requests?company_id=main |

### Forbidden on mount

🟢 `attendance/records` **not called** on initial dashboard mount

### All HRM requests (load 1)

| Method | Status | URL |
|--------|--------|-----|
| GET | 200 | /api/hrm/ |
| GET | 200 | /api/hrm/ |
| GET | 200 | /api/hrm/operating-units |
| GET | 200 | /api/hrm/company-subscription?company_id=main |
| GET | 200 | /api/hrm/employees/summary?company_id=main |
| GET | 200 | /api/hrm/operations/reports/summary?company_id=main |
| GET | 200 | /api/hrm/payroll/payslips?company_id=main |
| GET | 200 | /api/hrm/attendance/leave-requests?company_id=main |
| GET | 200 | /api/hrm/attendance/overview?company_id=main&year=2026 |
| GET | 200 | /api/hrm/contracts-insurance/contracts/expiring?company_id=main&days=30 |
| GET | 200 | /api/hrm/ |
| GET | 200 | /api/hrm/ |
| GET | 200 | /api/hrm/operating-units |
| GET | 200 | /api/hrm/company-subscription?company_id=main |
| GET | 200 | /api/hrm/employees/summary?company_id=main |
| GET | 200 | /api/hrm/operations/reports/summary?company_id=main |
| GET | 200 | /api/hrm/payroll/payslips?company_id=main |
| GET | 200 | /api/hrm/attendance/leave-requests?company_id=main |
| GET | 200 | /api/hrm/attendance/overview?company_id=main&year=2026 |
| GET | 200 | /api/hrm/contracts-insurance/contracts/expiring?company_id=main&days=30 |

## F5 reload (stability)

- Error banner after F5: **false**
- HRM API calls captured: **10**

### Required endpoints (F5)

| Endpoint | Status | URL |
|----------|--------|-----|
| employees/summary | 200 | /api/hrm/employees/summary?company_id=main |
| attendance/overview | 200 | /api/hrm/attendance/overview?company_id=main&year=2026 |
| payroll/payslips | 200 | /api/hrm/payroll/payslips?company_id=main |
| attendance/leave-requests | 200 | /api/hrm/attendance/leave-requests?company_id=main |

### Forbidden on mount (F5)

🟢 `attendance/records` **not called** after F5

## Matrix

| Row | Verdict |
|-----|---------|
| P-CC-HRM-DASH | 🟢 |

## Residual (out of scope)

- `performance/evaluations` 500 → D-HRM-PERF-EVAL-500-01 (dev-be)
- Full 19-menu embed re-audit → QA-HRM-EMBED-NETWORK-AUDIT-01-R2

## Screenshots

- C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/qa-hrm-dash-net-01-verify

## Runtime

- C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/_tmp-qa-hrm-dash-net-01-verify-runtime.json
