# FE↔BE health — incident 500 HRM embed

**Date:** 2026-05-24  
**work_item_id:** FE-BE-HEALTH-01  
**Reporter:** user screenshot — `HRM API request failed (500)` on `/command-center/hrm/employees`

## Root cause

**`hrm-api` không chạy trên port 28001** (ECONNREFUSED).  
`web-portal` Vite proxy `/api/hrm/*` → upstream missing → browser **HTTP 500** (không phải lỗi `useEmployees.ts` logic).

`qc:dev-stack` trước đó **không** kiểm tra HRM — chỉ XBOS + portal → false green.

## Fix applied

1. PM started `apps/api/hrm-api` `pnpm run start:dev` → Nest listening.
2. `pnpm run test:pilot:flows` → **11/11 PASS**.
3. `qc:dev-stack` updated — **requires** `hrm-api` health.
4. New script `pnpm run qc:fe-be-health` + rule `.cursor/rules/pm-fe-be-live-health-gate.mdc`.

## Verification

| Check | Result |
|-------|--------|
| `test:pilot:flows` | 11/11 PASS (after HRM up) |
| Direct `GET /api/hrm/employees?company_id=main` | 200 (logs) |

## Prevention

- Dev UAT: always `pnpm run dev:hrm-api` **và** `dev:xbos-api` **và** portal.
- PM/subagent: `qc:fe-be-health:pilot` before PASS_TO_PM on HRM/portal tasks.

## User action

Hard refresh portal (`Ctrl+F5`) sau khi team xác nhận `qc:fe-be-health` PASS.
