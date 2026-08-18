# QA-HRM-EMBED-NETWORK-AUDIT-01 — Round 2 (complete)

**Parent:** docs/qa/evidence/qa-hrm-embed-network-audit-20260730.md

**work_item_id:** QA-HRM-EMBED-NETWORK-AUDIT-01-R2-CONT
**Generated:** 2026-07-30T15:32:09.333Z
**Portal:** http://localhost:5173
**Account:** ceo@xe.vn · companyId=main · U65 zero-seed
**Inter-menu delay:** 5000ms
**ack_status:** FAIL_TO_PM

## L0 gates

| Gate | Exit | Notes |
|------|------|-------|
| qc:dev-stack | 1 | HRM+XBOS+portal |
| qc:fe-be-health | 1 | proxy + direct HRM |

## Summary

- Full registry: **19** menus (HRM_ALL_VIEWS)
- Dashboard: **🟢 CLOSED** (QA-HRM-DASH-NET-01-VERIFY — skip R2 load)
- R2 menus audited: **0** / 18
- Menus PASS (no 4xx/5xx except perf eval documented, no banner): **1** / 19
- Total /api/hrm calls captured (R2): **0**
- Bad responses (4xx/5xx/failed): **0**
- Blocking hardFails: **1**

## Full 19-menu table

| # | Menu | Verdict | HRM calls | Bad | Banner | Notes |
|---|------|---------|-----------|-----|--------|-------|
| 1 | dashboard | 🟢 | — | 0 | — | CLOSED · D-HRM-DASH-NET-01 verify |

---

## R2 — Dashboard retest (QA-HRM-DASH-NET-01-VERIFY)

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
| GET | 200 | /

## Per-menu network audit (R2 — 18 menus)

## hardFails / residuals

- **L0-qc-fe-be-health** (blocking): exit=1

**pm_dispatch_hint:** dev-be/dev-fe — fix failing /api/hrm routes per menu above.

## Matrix promotion

- P-CC-HRM-DASHBOARD: 🟢 (dash verify)
- P-CC-HRM-EMPLOYEES: ⬜
- P-CC-HRM-CONTRACTS: ⬜
- P-CC-HRM-INSURANCE: ⬜
- P-CC-HRM-DECISIONS: ⬜
- P-CC-HRM-RECRUITMENT: ⬜
- P-CC-HRM-ATTENDANCE: ⬜
- P-CC-HRM-PAYROLL: ⬜
- P-CC-HRM-PERFORMANCE: ⬜
- P-CC-HRM-HRM-AI: ⬜
- P-CC-HRM-TASKS: ⬜
- P-CC-HRM-PROCESSES: ⬜
- P-CC-HRM-INTERNAL-SERVICES: ⬜
- P-CC-HRM-TOOLS-EQUIPMENT: ⬜
- P-CC-HRM-FLEET: ⬜
- P-CC-HRM-COMPANY: ⬜
- P-CC-HRM-REPORTS: ⬜
- P-CC-HRM-SETTINGS: ⬜
- P-CC-HRM-GUIDE: ⬜

## Post-mutate spot (U65)

- **U65_BLOCKED:** no FE mutate in audit — post-mutate scan deferred

## Runtime

- C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/_tmp-qa-hrm-embed-network-audit-01-r2-runtime.json

## Screenshots

- C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/qa-hrm-embed-network-audit-01-r2
