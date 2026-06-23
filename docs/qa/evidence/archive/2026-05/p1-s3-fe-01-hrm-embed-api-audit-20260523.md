# P1-S3-FE-01 — HRM embed API mode + hrmDataMode audit

**work_item_id:** P1-S3-FE-01  
**date:** 2026-05-23  
**role:** dev-fe  
**ack_status:** READY_FOR_QA  
**spec_ref:** `docs/decisions/ADR-HRM-EMBED-DATA-MODE.md` §5–7 · `docs/program/PHASE1_COMPLETION_PLAN.md` P1-S3-FE-01

## Scope

Command Center iframe (P-CC-03..08): ensure pilot load paths gate Supabase via `shouldSkipSupabaseDataFetches` / `isPortalEmbedApiMode`, prefer Nest `/api/hrm/*` in portal session, and add automated guard audit for regression.

## Changes

| Area | Action |
|------|--------|
| Dashboard | `useExpiringContractsCount`, `useAttendanceDashboard` skip Supabase in embed/API mode |
| `ExpiringContractsAlert` | Query disabled when `shouldSkipSupabaseDataFetches()` |
| `useLeaveRequestsData` | Nest `listLeaveRequests` when skip; Supabase only standalone |
| `useAttendanceReports` | Empty report stub when skip (no 54321 on reports tab) |
| Audit | `hrmEmbedPilotGuardAudit.test.ts` — 30 pilot modules static guard check |
| `hrmDataMode.test.ts` | `isHrmApiDataMode`, `isPortalEmbedApiMode` cases |
| web-portal | `paths.test.ts` — `hrmProxyPath` portal query for P-CC embed URLs |

## Build / test evidence

```text
pnpm -C apps/web/hrm test     → 18 files, 71 tests PASS (exit 0)
pnpm -C apps/web/hrm build    → PASS (exit 0)
pnpm -C apps/web/web-portal test  → 13 files, 55 tests PASS (exit 0)
pnpm -C apps/web/web-portal build → PASS (exit 0)
```

Key new tests: `src/lib/hrmEmbedPilotGuardAudit.test.ts`, `src/lib/hrmDataMode.test.ts` (7), `web-portal/src/modules/hrm/paths.test.ts` (3).

## QA L2 (P-CC-03..08)

- Login: `ceo@xe.vn` / `Xevn@2026` @ `http://127.0.0.1:5175`
- Routes: `/command-center/hrm/employees`, `contracts`, `insurance`, `recruitment`, `attendance`, `payroll`
- Network: no required `:54321` on initial load; Nest `/api/hrm/*` 200 or empty+200
- Optional: `pnpm run test:hrm-embed:audit` when stack up (API smoke)

## Residual risk (defer P1-S3-FE-02 / P3)

- Non-pilot views (`decisions`, `reports`, `tasks`, …) still Supabase when user navigates deep tabs — §7.2 ADR
- Employee profile tabs (degrees, certificates, …) except header/work still legacy
- `getEmployeeById` may probe multiple `company_id` until single-scope FE hardening (BE-02 done; FE loop residual)
- Dashboard/recruitment **write** paths toast-blocked in portal until Nest CRUD
- Contract file upload still Supabase storage branch in API mode

## Handoff

- **entry_criteria:** S0/S1 embed debt baseline + ADR accepted  
- **exit_criteria:** vitest guard audit PASS; pilot guards on load-path gaps; build PASS  
- **evidence_path:** this file  
- **next_reviewer:** QA (`P1-S3-QA-01`) — L2 matrix + `test:hrm-embed:audit` with live stack
