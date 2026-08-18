# QA-XBOS-OA-SELECT-MEMBERSHIP-01 — OpenAPI G-OA-02 spot verify

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-XBOS-OA-SELECT-MEMBERSHIP-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **date** | 2026-07-22 (ICT) |
| **priority** | P1 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** |
| **entry** | `docs/qa/evidence/be-xbos-oa-select-membership-01-20260722.md` |
| **scope** | yaml + verify gate + read-only controller parity — **no** FE mutate, seed, OA-03/04, apps rewrite |

## 1. Micro-checklist

| # | Item | Result |
|---|------|--------|
| 1 | yaml has `xbosAuthSelectMembership` + `SelectMembership*` | **PASS** |
| 2 | `pnpm verify:openapi-m01` exit 0 | **PASS** |
| 3 | Read-only parity: controller `POST select-membership` | **PASS** (parity OK; no FE mutate) |
| 4 | Evidence this path | **PASS** |
| 5 | `PASS_TO_PM` | **PASS** |

## 2. OpenAPI yaml confirmation

**SoT:** `docs/api/openapi/xbos-api.yaml`

| Marker | Present |
|--------|---------|
| `operationId: xbosAuthSelectMembership` | yes (`/auth/select-membership` POST) |
| `SelectMembershipRequest` | yes (`tenantId` required, minLength 1) |
| `SelectMembershipData` | yes (JWT re-issue payload; envelope `XBOS-AUTH-201`) |
| `AccessibleTenantMembership` | yes (membership item schema) |
| responses `201` / `400` / `401` / `403` | yes (`XBOS-AUTH-201`, `XBOS-AUTH-403` documented) |
| tag `M01-Tenant` + `bearerAuth` | yes |
| description note G-OA-02 / G-DTO-01 | yes (`info.description`) |

## 3. Verify gate

```text
pnpm run verify:openapi-m01
→ PASS verify-openapi-m01 …/docs/api/openapi/xbos-api.yaml
exit 0
```

## 4. Runtime parity (read-only — no mutate)

| Runtime | OpenAPI | Match |
|---------|---------|-------|
| `AuthController` `@Post('select-membership')` under `@Controller('auth')` → `/api/xbos/auth/select-membership` | path `/auth/select-membership` (server `/api/xbos`) | **OK** |
| Body `SelectMembershipDto.tenantId` (`@IsString` `@MinLength(1)`) | `SelectMembershipRequest.tenantId` | **OK** |
| Success `ok(..., 'XBOS-AUTH-201', ...)` | response `201` code `XBOS-AUTH-201` | **OK** |
| Missing bearer → `XBOS-AUTH-401` | response `401` | **OK** |
| Tenant not in memberships → `XBOS-AUTH-403` (`auth.service.ts`) | response `403` `XBOS-AUTH-403` | **OK** |

**FE:** portal already binds `authSession` select-membership — **no FE mutate required** this wave (documentation-only contract close).

**must_keep:** UF-XBOS 🟢 — not exercised (yaml-only scope); no portal regression expected.

## 5. Residual / out of scope

| Item | Status | Next |
|------|--------|------|
| **G-OA-03** shareholders OpenAPI | OPEN | `BE-XBOS-OA-SHAREHOLDERS-01` |
| **G-OA-04** documents OpenAPI | OPEN | `BE-XBOS-OA-DOCUMENTS-01` |
| FE mutate / browser UF | N/A | not required |
| Seed / Phase1 / PROD claim | **cấm** — not touched | — |

## 6. Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm` → dispatch **dev-be** OA-03
- **evidence_path:** `docs/qa/evidence/qa-xbos-oa-select-membership-01-20260722.md`
- **closed:** G-OA-02 path + G-DTO-01 SelectMembership* schemas verified

### next_dispatch_prompt

```text
work_item_id: BE-XBOS-OA-SHAREHOLDERS-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1

entry_criteria:
- QA-XBOS-OA-SELECT-MEMBERSHIP-01 PASS (G-OA-02 closed)
- evidence: docs/qa/evidence/qa-xbos-oa-select-membership-01-20260722.md
- TM gap: docs/qa/evidence/tm-xbos-code-spec-convention-01-20260722.md G-OA-03
- TechSpec: docs/xbos/TECHSPEC.md §14.13 G-OA-03

exit_criteria:
1. ADD OpenAPI path(s) for XBOS shareholders (CC P0) into docs/api/openapi/xbos-api.yaml
2. Components schemas for request/response DTOs (fold related G-DTO if tiny)
3. pnpm verify:openapi-m01 exit 0
4. Evidence docs/qa/evidence/be-xbos-oa-shareholders-01-20260722.md → READY_FOR_QA
5. must_keep UF-XBOS 🟢 — yaml ONLY; no apps rewrite; no seed
cấm: OA-04 documents in same Task · FE mutate · Phase1/PROD claim
```
