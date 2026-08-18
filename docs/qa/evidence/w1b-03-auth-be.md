# Evidence — W1-B-03-AUTH-BE

| Field | Value |
| --- | --- |
| **work_item_id** | W1-B-03-AUTH-BE |
| **role** | dev-be |
| **date** | 2026-08-03 |
| **slice** | `docs/program/slices/DOC-ENT-P0-AUTH-M01.md` |
| **ack_status** | **READY_FOR_QA** |

## spec_read_ack

```markdown
## spec_read_ack
- srs: docs/brand-new-documents-20270801/SRS_NEW.md v1.1 §3.2 · FR-UC-M01 · Diễn biến #1–5
- tech_spec: docs/brand-new-documents-20270801/TECH_SPEC_NEW.md · TS-MOB-AUTH · ref_srs FR-UC-M01
- db_design: docs/brand-new-documents-20270801/DB_DESIGN_NEW.md v1.1 §3.1–3.3 — xbos_tenant_registry · xbos_portal_user · xbos_user_tenant_membership
- api_design: docs/brand-new-documents-20270801/API_CONTRACT_NEW.md v1.1 §8.1–8.5
- os: 28-FE-BE-SEPARATION-DISPLAY-READY (display-ready labels) · 25 SOLID
- change_mode: UPGRADE
- sponsor_confirm: DOC-ENT pack · W1-B P0-1
```

## Closed

| Area | Change |
| --- | --- |
| XBOS login / me / select-membership | Memberships ADD `membershipId`, `tenant_label`, `company_label`, `role_label`, `tenant_kind_label`; JWT claim `membershipId` + `default_company_id` |
| XBOS DTO | Restored missing `dto/select-membership.dto.ts` (controller import) |
| HRM mobile login / select / refresh | Membership ADD `company_label`, `tenant_label`, `role_label`, `job_title_label`; `company_display` no longer raw slug fallback |
| UAT ensure modules | Restored `uat-mobile-auth-ensure.ts` + `uat-mobile-pilot-data-ensure.ts` (HEAD imported but files were absent — blocked jest) |
| Lockout | **No** `locked_until` DDL — residual **R-M01-LOCKOUT-COL** remains OPEN (NFR app-level) |

## Verify

```text
pnpm --filter xbos-api exec jest --testPathPatterns="auth.service.spec|membership-display.spec|auth.controller.spec" --no-coverage
→ Test Suites: 3 passed · Tests: 15 passed

pnpm --filter hrm-api exec jest src/auth/mobile-auth.service.spec.ts src/auth/mobile-auth.controller.spec.ts --no-coverage
→ Test Suites: 2 passed · Tests: 33 passed
```

## Allowed paths touched

- `apps/api/xbos-api/src/auth/**` (service, membership-display, dto/select-membership, specs)
- `apps/api/hrm-api/src/auth/**` (mobile-auth.service, mobile-membership-display, uat-*-ensure restore, specs)
- `docs/qa/evidence/w1b-03-auth-be.md`

## Residual

| id | Note | Owner |
| --- | --- | --- |
| R-M01-LOCKOUT-COL | `locked_until` / failed-attempt columns not invented | BA/SA later or app-level NFR |
| W1-B-04 | FE portal + mobile ScopeScreen wire to new `*_label` fields | **dev-fe** / **dev-mobile** |

## solid_convention_ack

- FE bind labels only — no FE role/tenant invent
- BE owns display-ready membership list
- Raw keys kept for JWT (`tenantId`, `roleCode`, `company_id`)

## completion_report

Closed W1-B-03-AUTH-BE: XBOS + HRM mobile auth membership responses are OS 28 display-ready; select-membership DTO restored; JWT carries `membershipId`; UAT ensure files restored so auth suite compiles; jest 15+33 green. Residual lockout column intentionally open.

## next_owner

dev-fe (+ parallel dev-mobile)

## next_dispatch_prompt

```text
work_item_id: W1-B-04-AUTH-FE-MOB
mission: Wire portal AuthContext / membership picker and mobile LoginScreen+ScopeScreen to BE display-ready membership labels (tenant_label/company_label/role_label — no FE invent). Consume JWT membershipId after select-membership.
read_first: docs/program/slices/DOC-ENT-P0-AUTH-M01.md · API_CONTRACT §8 · evidence docs/qa/evidence/w1b-03-auth-be.md
allowed_paths: apps/web/web-portal/src/pages/auth/** · apps/web/web-portal/src/integrations/authSession.ts · apps/web/web-portal/src/contexts/AuthContext.tsx · apps/mobile/hrm-mobile/src/features/auth/** · apps/mobile/hrm-mobile/src/context/AuthContext.tsx
exit: bind *_label from BE; no FE slug→label map; READY_FOR_QA U65 browser/device
evidence_path: docs/qa/evidence/w1b-04-auth-fe-mob.md
```

## ack_status

**READY_FOR_QA**
