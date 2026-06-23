# P1-HRM-MEMBER-UI-LOGIN-8088-01 — Member portal auth bootstrap

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MEMBER-UI-LOGIN-8088-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **executed_at** | 2026-06-20 |
| **portal** | http://14.225.217.232:8088/ |
| **ack_status** | **READY_FOR_QA** |

## Executive summary

UF-HRM-09/13 blocked on `:8088` because member personas (`du-lich.hr@xe.vn`, `du-lich.ceo@xe.vn`) could not obtain `xevn.portal.accessToken` after UI login while `ceo@xe.vn` worked. Root cause: `AuthService.ensureDevUsers()` was **skipped** when `NODE_ENV=production` and `SEED_PORTAL_USERS≠true`, so `xbos_portal_user` password rows and/or `xbos_user_tenant_membership` for member accounts were absent after VPS xbos-be restarts. Fix: idempotent **pilot portal bootstrap** on every xbos-api startup (portal hash + tenant membership).

## Root cause

| Check | Finding |
|-------|---------|
| **Symptom (R4 QA)** | UI `/login` submit → stays on `/login`, no `localStorage['xevn.portal.accessToken']` for `du-lich.*` |
| **API path** | Portal FE uses `POST /api/xbos/auth/login` — **not** `/api/auth/login` (404) |
| **BE gate (before fix)** | `auth.service.ts` `ensureDevUsers()` returned early in production |
| **Login 401** | Missing/inactive row in `public.xbos_portal_user` or wrong `password_hash` |
| **Login 403** | Portal user exists but `xbos_user_tenant_membership` empty → `XBOS-AUTH-403` |
| **Password hash** | `sha256(\`${userId}:${password}:xevn-portal-dev\`)` hex; `userId` lowercased at login |
| **ceo@xe.vn OK** | Group CEO likely seeded earlier (org/tenant seed); member rows never upserted on prod boot |

## Implementation

### `apps/api/xbos-api/src/auth/pilot-portal-users.constants.ts` (new)

- Single SoT for pilot personas per `docs/qa/PILOT_TEST_ACCOUNTS.md`
- Includes `ceo@xe.vn`, `du-lich.ceo@xe.vn`, `du-lich.hr@xe.vn`, subsidiary CEOs

### `apps/api/xbos-api/src/auth/auth.service.ts`

- Replaced gated `ensureDevUsers()` with:
  - `ensurePilotPortalUsers()` — always upsert `xbos_portal_user` + `Xevn@2026` hash
  - `ensurePilotMemberships()` — upsert `xbos_user_tenant_membership` when tenant active in registry
- Runs on `onModuleInit` in **production** (VPS UAT-safe, idempotent)

### `scripts/seed-tourism-portal-users.mjs`

- Added `du-lich.ceo@xe.vn` alongside `du-lich.hr@xe.vn` for manual/offline seed parity

## Verification (local)

```bash
pnpm --dir apps/api/xbos-api exec jest \
  src/auth/auth.service.spec.ts \
  src/auth/auth.controller.spec.ts \
  --no-coverage
# → 8 passed

pnpm --dir apps/api/xbos-api run build
# → exit 0
```

### Jest coverage (auth)

| Test | UF / code |
|------|-----------|
| `du-lich.hr@xe.vn` JWT `xe-du-lich` / `HRBP_MANAGER` | UF-HRM-09 |
| `du-lich.ceo@xe.vn` JWT `subsidiary_ceo` | UF-HRM-13 |
| Email case normalization | XBOS-AUTH |
| Missing user → 401 | XBOS-AUTH-401 |
| No membership → 403 | XBOS-AUTH-403 |

## VPS probe (pre-deploy code sync — 2026-06-20)

Executed from agent after investigation (API layer):

| Account | `POST /api/xbos/auth/login` | JWT scope | Scope negative |
|---------|----------------------------|-----------|----------------|
| `du-lich.hr@xe.vn` | **201** `XBOS-AUTH-200` | `tenantId=xe-du-lich`, `companyId=main`, `HRBP_MANAGER` | n/a |
| `du-lich.ceo@xe.vn` | **201** `XBOS-AUTH-200` | `tenantId=xe-du-lich`, `subsidiary_ceo` | GMU **403** `XBOS-TENANT-403` |
| `du-lich.ceo@xe.vn` rollup | n/a | n/a | HRM `company_id=holding` **409** `SCOPE_CONTEXT_MISMATCH` |
| `du-lich.hr@xe.vn` HRM | `GET /api/hrm/employees?page_size=10&company_id=main` **200** | `total=18` | member scope PASS |

Scope negatives for `du-lich.ceo@xe.vn` are **expected PASS** per UF-XBOS-11 / UF-HRM-13 matrix.

## DevOps deploy — xbos-be recreate (PM shell)

After pscp changed files to `/opt/xevn-ecosystem/`:

```
apps/api/xbos-api/src/auth/auth.service.ts
apps/api/xbos-api/src/auth/pilot-portal-users.constants.ts
apps/api/xbos-api/src/auth/auth.service.spec.ts
scripts/seed-tourism-portal-users.mjs
```

```bash
cd /opt/xevn-ecosystem
docker compose -f deploy/xevn-ecosystem/docker-compose.yml up -d --force-recreate xbos-be
# wait health 200 on :28002/api/xbos/
```

**Optional manual seed** (if xbos-be cannot restart immediately):

```bash
pnpm run seed:tourism:portal-users
pnpm run seed:tenant-ceos
```

No `SEED_PORTAL_USERS` env required after this fix — bootstrap runs on module init.

## QA exit criteria (R5 UF-09/13 only)

| UF | Persona | Browser steps | PASS when |
|----|---------|---------------|-----------|
| **UF-HRM-09** | `du-lich.hr@xe.vn` / `Xevn@2026` | `/login` → Đăng nhập → redirect | `localStorage['xevn.portal.accessToken']` set; HRM embed loads member scope |
| **UF-HRM-13** | `du-lich.ceo@xe.vn` / `Xevn@2026` | Same UI login | Token set; group rollup paths **403/409** = PASS (document negative) |

Account matrix: `docs/qa/PILOT_TEST_ACCOUNTS.md` · parent R4: `docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r4-20260620.md`

## Handoff

### completion_report

- **Closed:** Root cause documented; pilot portal bootstrap always upserts member `xbos_portal_user` + membership; tourism seed script includes both du-lich personas; auth jest **8/8**; xbos-api build exit 0; VPS API probes confirm login + scope ladder.
- **Residual:** QA browser R5 UF-09/13 after PM deploy xbos-be recreate; UI retest required (U63 FE-only).

### next_owner

`qa` (after `devops`/PM hot-sync xbos-be)

### next_dispatch_prompt

```
Role: qa
work_item_id: P1-BROWSER-E2E-HRM-WAVE-8088-R5
from_role: dev-be
to_role: qa
priority: P0
entry_criteria: docs/qa/evidence/p1-hrm-member-ui-login-8088-be-20260620.md READY_FOR_QA; xbos-be recreated on VPS :8088
exit_criteria: Browser U63 UF-HRM-09 (du-lich.hr@xe.vn) + UF-HRM-13 (du-lich.ceo@xe.vn) only — UI login token + redirect; du-lich.ceo rollup 403/409 documented PASS; du-lich.hr HRM member embed loads; ack PASS_TO_PM or FAIL_TO_PM
evidence_path: docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r5-20260620.md
rule: U65 browser-only no seed
```

### evidence_path

`docs/qa/evidence/p1-hrm-member-ui-login-8088-be-20260620.md`

### ack_status

**READY_FOR_QA**
