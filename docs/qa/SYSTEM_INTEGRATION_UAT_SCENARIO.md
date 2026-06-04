# System Integration UAT — XeVN Ecosystem (HRM + XBOS)

End-to-end acceptance against **live APIs** and **real Postgres** (no in-memory mocks). Workforce scenario: XeVN group ~1000 employees, 25 `job_title_key` roles, 5 member companies.

## Objectives

| # | Objective | Evidence |
|---|-----------|----------|
| O1 | Portal auth + tenant memberships (RBAC entry) | `P2 xbos-portal-login-rbac` in JSON report |
| O2 | Mobile auth per role + batch sample | `P3 mobile-login-role-*`, `mobile-login-batch-sample` |
| O3 | Tenant/company scope enforcement | `P4 tenant-scope-header-mismatch` → HTTP 409/403 |
| O4 | Attendance / leave / payroll API + DB | `P5` phases + SQL row counts |
| O5 | Workforce seed integrity | `P1 db-workforce-count-roles-tenant` |

## Personas

| Persona | Seed index / code | Role | Use in suite |
|---------|-------------------|------|--------------|
| Group CEO | UAT0001 (`uat.nv0001@xe.vn`) | CEO | Manager approve, DB spot-check |
| Operations manager | UAT0016 | OPS_MANAGER | Attendance + leave CRUD |
| Payroll specialist | UAT0008 | PAYROLL_SPECIALIST | Payslips list |
| Driver | UAT0016 | DRIVER | Scope mismatch probe |
| Portal operator | `ceo@xe.vn` (XBOS seed) | Portal CEO | `POST /api/xbos/auth/login` |

Passwords (non-prod): `UAT_PASSWORD` default `xevn-uat-2026`; portal `PORTAL_DEV_PASSWORD` default `Xevn@2026`.

## Phases (mapped to runner)

### P0 — Environment

- Load `deploy/xevn-ecosystem/.env` via `scripts/seed-env-loader.mjs`
- Optional: `pnpm run seed:hrm:1000-uat` (`--seed` on runner)
- Health: `GET /api/hrm/`, `GET /api/xbos/`

### P1 — DB workforce

- 1000 rows `custom_fields.uat_seed = '1000-v1'`
- 25 distinct active `job_title_key`
- Each row: `tenant_id`, `mobile_password_hash`, `attendance_company_uuid`

### P2 — Portal login / RBAC

- `POST /api/xbos/auth/login` with `ceo@xe.vn`
- Assert `memberships.length > 0`, JWT issued

### P3 — Mobile login matrix

- One login per role (indices 0–24)
- Assert `roles[]` matches `MobileAuthService.deriveRoles` (employee / manager / hr_manager)
- Batch: 50 spread logins across workforce

### P4 — Tenant scope

- Bearer from driver session; wrong `x-tenant-id` or `x-company-id` on leave list → 400, 403, or 409 (deterministic rejection)

### P5 — Business CRUD (JWT + service scope, real DB)

- **Attendance (service):** POST via scoped internal key (company UUID in body) → GET list with mobile JWT → `attendance_records` count ≥ 1
- **Attendance (mobile JWT, UAT-MOB-ATT-SCOPE-01):** DRIVER login → `POST /attendance/records` with **Bearer only** (no `x-internal-api-key`), `company_id` = session `company_uuid` → must not return `SCOPE_CONTEXT_MISMATCH` → list + DB row on dedicated date
- **Leave:** POST request → GET list → `leave_requests` count increased
- **Payroll:** GET payslips (empty list acceptable)

### P6 — Governance

- CEO approves leave created in P5
- DB spot-check UAT0001 `tenant_id` + `attendance_company_uuid`

## Acceptance criteria

| AC-ID | Criterion | Pass when |
|-------|-----------|-----------|
| AC-SYS-01 | Workforce seeded | DB count = 1000, roles ≥ 25 |
| AC-SYS-02 | Portal login | XBOS JWT + memberships |
| AC-SYS-03 | Role matrix | 25/25 mobile logins PASS |
| AC-SYS-04 | Batch login | 0 failures in batch sample |
| AC-SYS-05 | Scope isolation | Mismatch headers rejected |
| AC-SYS-06 | Attendance persistence (service path) | API 201 + DB row |
| AC-SYS-06b | Mobile JWT attendance UUID scope | DRIVER Bearer POST with `company_uuid` in body, no internal key; not `SCOPE_CONTEXT_MISMATCH`; DB ≥ 1 |
| AC-SYS-07 | Leave persistence | API 201 + DB delta |
| AC-SYS-08 | Runner verdict | `verdict: PASS`, exit 0 |

## Execution

```bash
# From repo root (deploy .env required)
pnpm run seed:hrm:1000-uat
pnpm run test:system:uat

# Seed + run in one step
pnpm run test:system:uat:seed
```

Ensure APIs listen on `HRM_BE_PORT` (default 28001) and `XBOS_BE_PORT` (default 28002).

## Evidence artifacts

| Artifact | Path |
|----------|------|
| JSON report | `docs/qa/evidence/system-integration-uat-report.json` |
| Seed script | `scripts/seed-hrm-1000-uat-workforce.mjs` |
| Runner | `scripts/run-system-integration-uat.mjs` |
| Scenario (this doc) | `docs/qa/SYSTEM_INTEGRATION_UAT_SCENARIO.md` |

## Traceability

| Requirement area | Implementation | Test |
|------------------|----------------|------|
| Mobile auth / roles | `mobile-auth.service.ts` | P3 |
| Scope context | `scope-context.ts` | P4, P5 mobile JWT attendance |
| Attendance writes | `attendance.service.ts` | P5 attendance |
| Mobile JWT company_uuid | `mobile-auth.service.ts` | P5 `mobile-jwt-attendance-record-uuid-scope` |
| Leave workflow | `leave-requests.service.ts` | P5–P6 leave |
| Portal auth | `auth.service.ts` (xbos) | P2 |

## Out of scope (this suite)

- Web UI browser automation
- Full 1000-login load test (batch sample only)
- Production cutover / NFR metrics gate (see `pre-merge-quality-gate.mdc`)
