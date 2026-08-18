# QA-HRM-EMBED-NETWORK-AUDIT-01

**work_item_id:** QA-HRM-EMBED-NETWORK-AUDIT-01
**Generated:** 2026-07-30T15:05:27.375Z
**Portal:** http://127.0.0.1:5173
**Account:** ceo@xe.vn · companyId=main · U65 zero-seed
**ack_status:** FAIL_TO_PM

## L0 gates

| Gate | Exit | Notes |
|------|------|-------|
| qc:dev-stack | 3221226505 | HRM+XBOS+portal |
| qc:fe-be-health | 1 | proxy + direct HRM |

## Summary

- Menus audited: **0** / 19 (registry HRM_ALL_VIEWS)
- Menus PASS (no 4xx/5xx, no banner): **0**
- Total /api/hrm calls captured: **0**
- Bad responses (4xx/5xx/failed): **0**
- hardFails: **1**

## Dashboard required endpoints

| Endpoint | Status | URL |
|----------|--------|-----|
| employees/summary | MISSING | — |
| attendance/overview | MISSING | — |
| payroll/payslips | MISSING | — |
| attendance/leave-requests | MISSING | — |

## Per-menu network audit

## hardFails

- **L0-qc-dev-stack:** exit=3221226505 hrm not healthy

**pm_dispatch_hint:** dev-be/dev-fe — fix failing /api/hrm routes per menu; re-run QA-HRM-EMBED-NETWORK-AUDIT-01 after fix.

## Post-mutate spot (U65)

- **U65_BLOCKED:** no FE mutate in audit — post-mutate scan deferred

## Runtime

- C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/_tmp-qa-hrm-embed-network-audit-01-runtime.json
