# HRM embed FE+API audit

**Generated:** 2026-05-24T15:41:48.176Z
**Portal:** http://127.0.0.1:5175
**HRM direct:** http://127.0.0.1:28001

## Portal proxy probes

| ID | HTTP | code | message |
|----|------|------|---------|
| P-CC-03 | 200 | HRM-EMP-200 | Employees listed |
| P-CC-04a | 200 | HRM-SET-200 | Settings catalogs overview |
| P-CC-04b | 200 | HRM-CON-200 | Contracts listed |
| P-CC-04c | 200 | HRM-DEC-200 | Decisions listed |
| P-CC-05 | 200 | HRM-CON-200 | Contracts listed |
| P-CC-06 | 200 | HRM-REC-200 | Job requisitions listed |
| P-CC-07 | 200 | HRM-ATT-200 | Attendance records listed |
| P-CC-08 | 200 | HRM-PAY-200 | Payroll payslips listed |
| FE-hrm-health | 200 | HRM-HEALTH-200 | HRM service is healthy |

## HRM direct (no portal)

- GET /api/hrm/ → **200**

## Summary

- Fail count: **0**
- Pass: **9** / 9