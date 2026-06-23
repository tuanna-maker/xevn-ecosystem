# PCOMP-W4-PROFILE-AVATAR-01-BE — Employee avatar persistence

**work_item_id:** `PCOMP-W4-PROFILE-AVATAR-01-BE`  
**Date:** 2026-06-07  
**Owner:** Dev-BE  
**ack_status:** `READY_FOR_QA`

## Scope closed

| Requirement | Implementation |
|-------------|----------------|
| `avatar_url` column on `public.employees` | `ensureSchema()` — `ALTER TABLE … ADD COLUMN IF NOT EXISTS avatar_url TEXT NULL` |
| `CreateEmployeeDto` / `UpdateEmployeeDto` | Optional `avatar_url` (`string \| null`, max 2048) |
| GET list / getById | `avatar_url` in SELECT + `mapEmployee()` |
| PATCH policy | `employee-update-policy.ts` — self JWT `employee_id` → `avatar_url` only; HR/manager/group CEO → full PATCH; no JWT (internal key) → full PATCH |
| Jest | Self PATCH avatar, list/get return URL, policy 403 cases |

## Files changed

- `apps/api/hrm-api/src/employees/employees.service.ts`
- `apps/api/hrm-api/src/employees/dto/create-employee.dto.ts`
- `apps/api/hrm-api/src/employees/dto/update-employee.dto.ts`
- `apps/api/hrm-api/src/employees/employee-update-policy.ts` (new)
- `apps/api/hrm-api/src/employees/employee-update-policy.spec.ts` (new)
- `apps/api/hrm-api/src/employees/employees.service.spec.ts`

## API contract (FE/Mobile handoff)

```http
POST /api/hrm/employees
{ "avatar_url": "/api/hrm/files/holding/abc.jpg", ... }

PATCH /api/hrm/employees/{id}?company_id={scope}
{ "avatar_url": "/api/hrm/files/holding/abc.jpg" }   # self or HR
{ "avatar_url": null }                                # clear avatar

GET /api/hrm/employees?company_id=…
GET /api/hrm/employees/{id}?company_id=…
→ data.avatar_url: string | null
```

**Self-service flow (U50):** `POST /api/hrm/files/upload?feature=employee-avatar` → `PATCH` self with returned URL.

**Errors:** `HRM-EMP-403` when non-HR employee patches fields other than own `avatar_url`.

## Verification

```bash
pnpm --filter hrm-api exec jest \
  --testPathPatterns="employees/employees.service.spec" \
  --testPathPatterns="employees/employee-update-policy.spec" \
  --no-coverage
```

**Result:** exit **0** — **22/22** tests PASS (2026-06-07).

## QA dispatch (L0–L2)

1. Upload file via existing `POST /api/hrm/files/upload?feature=employee-avatar&company_id=…`
2. Mobile UAT account `uat.nv####@xe.vn` — PATCH own `avatar_url`, GET profile shows URL
3. HR `ceo@xe.vn` — PATCH any employee `avatar_url` + `full_name` on web form
4. Non-HR employee PATCH `full_name` on another id → expect **403**

## Residual

- `p1-phase1-be-emp-create-parity.spec.ts` member CEO GET 404 — pre-existing integration/DB scope flake; not introduced by avatar column (unit suite green).
- FE `useEmployees.updateEmployee` wire + Mobile `ProfileScreen` upload — **PCOMP-W4-PROFILE-AVATAR-01-FE/MOB** (not promoted).

## not promoted

- Web/mobile UI avatar upload wiring
- Celebration/home avatar display (04b)
