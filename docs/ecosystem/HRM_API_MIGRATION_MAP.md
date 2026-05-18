# HRM API migration map (Supabase → hrm-api)

Phase 1 (this sprint): critical action buttons on hrm-api or explicit disable/banner.  
Phase 2: read paths and remaining writes.

| Domain | Supabase table(s) | hrm-api target | Page | Phase | Notes |
|--------|-------------------|----------------|------|-------|-------|
| Employees | `employees` | `POST/GET/PATCH /api/hrm/employees` | `Employees.tsx` | **1 done** | Create unified via `createEmployee` |
| Attendance | mixed / local | `GET/POST/PATCH /api/hrm/attendance/records` | `Attendance.tsx` | **1 partial** | Modal save → API; weekly grid TBD |
| Payroll periods | — | `GET/POST /api/hrm/payroll/periods` | `PayrollBatchesTab` | **1** | Batches tab uses API |
| Payroll components | mock UI | TBD | `Payroll.tsx` | 2 | Banner on components tab |
| Contracts | `contracts`, `employee_contracts` | TBD dedicated endpoints | `Contracts.tsx` | **1 partial** | Update uses correct table by `source` |
| Recruitment plans | `recruitment_plans` + children | TBD | `Recruitment.tsx` | 1 | Status approve/reject on Supabase |
| Recruitment reqs | various | `hrmApi` requisitions when available | `Recruitment.tsx` | 2 | |
| Leave | Supabase leave tables | `/api/hrm/leave/*` (planned) | `LeaveTab` | 2 | Single entry B7 |
| Settings account | local only | auth service | `Settings` | 2 | Disable or wire auth API |
| Catalog fields | settings-catalogs | synced from portal | CC Group HR | 1 | `groupHrCatalogApi` immediate |

Seed / verify: `pnpm seed:stack:p0`, `pnpm dev:hrm-api`, `pnpm dev:xbos-api`, `node scripts/verify-capability-e2e.mjs --group B1`.
