# Evidence — W1-B-04-AUTH-FE

| Field | Value |
| --- | --- |
| **work_item_id** | W1-B-04-AUTH-FE |
| **role** | dev-fe |
| **date** | 2026-08-03 |
| **slice** | `docs/program/slices/DOC-ENT-P0-AUTH-M01.md` |
| **ack_status** | **READY_FOR_QA** |

## spec_read_ack

```markdown
## spec_read_ack
- srs: docs/brand-new-documents-20270801/SRS_NEW.md v1.1 §3.2 · FR-UC-M01 · Diễn biến #1–5 (sequence: xác thực → danh sách thành viên → chọn → phiên scope)
- tech_spec: docs/brand-new-documents-20270801/TECH_SPEC_NEW.md · TS-MOB-AUTH · ref_srs FR-UC-M01
- db_design: docs/brand-new-documents-20270801/DB_DESIGN_NEW.md v1.1 §3.1–3.3 — xbos_tenant_registry · xbos_portal_user · xbos_user_tenant_membership (READ)
- api_design: docs/brand-new-documents-20270801/API_CONTRACT_NEW.md v1.1 §8.1–8.3 — POST /api/xbos/auth/login · select-membership · GET /me
- os: 28-FE-BE-SEPARATION-DISPLAY-READY — FE bind *_label; no invent slug→label
- be_prereq: docs/qa/evidence/w1b-03-auth-be.md (membershipId + tenant_label/company_label/role_label)
- slice: docs/program/slices/DOC-ENT-P0-AUTH-M01.md
- change_mode: UPGRADE
- sponsor_confirm: DOC-ENT pack · W1-B P0-1
```

## Closed

| Area | Change |
| --- | --- |
| `authSession.ts` | `normalizePortalMembership(s)` binds BE `tenant_label` / `company_label` / `role_label` / `tenant_kind_label` / `membershipId`; missing → `—` only |
| JWT membershipId | `parseJwtMembershipId` + persist `xevn.portal.membershipId` (session + local mirror) on login/select |
| `AuthContext.tsx` | Expose `membershipId`; refresh after login / `/me` / `selectMembership` |
| Membership picker | `TopHeader` + `GlobalFilter` map/bind BE labels; removed broken `formatRoleCodeVi` invent import |
| Types | `AccessibleTenant` + `TenantOption` ADD optional display fields |
| Tests | `authSession.test.ts` — 11 passed (normalize + JWT membershipId + select labels) |

## Verify

```text
pnpm --filter web-portal exec vitest run src/integrations/authSession.test.ts --reporter=dot
→ Test Files: 1 passed · Tests: 11 passed
```

## solid_convention_ack / fe_be_soc

- FE binds display-ready labels from auth BE only
- No FE roleCode/companyId/slug → Vietnamese map
- Raw keys (`tenantId`, `roleCode`, `companyId`) kept for JWT/scope
- U65: no seed in this wave

## Paths touched

**Allowed / core**

- `apps/web/web-portal/src/integrations/authSession.ts`
- `apps/web/web-portal/src/integrations/authSession.test.ts`
- `apps/web/web-portal/src/contexts/AuthContext.tsx`

**Related (minimal — membership picker bind + type)**

- `apps/web/web-portal/src/integrations/tenantScopeApi.ts` (`AccessibleTenant` fields)
- `apps/web/web-portal/src/contexts/GlobalFilterContext.tsx` (pass-through labels)
- `apps/web/web-portal/src/components/layout/TopHeader.tsx` (picker UI bind; was importing missing `scopeRoleLabels`)

**Evidence**

- `docs/qa/evidence/w1b-04-auth-fe.md`

## Residual

| id | Note | Owner |
| --- | --- | --- |
| R-M01-LOCKOUT-COL | Lockout DB column still OPEN (BE residual) | BA/SA |
| W1-B-04-AUTH-MOB | Mobile ScopeScreen wire — out of this FE packet | **dev-mobile** |
| QA-U65-BROWSER | Browser login → picker shows BE labels → select → JWT membershipId | **qa** |

## completion_report

Closed W1-B-04-AUTH-FE: portal auth session normalizes BE display-ready membership labels; AuthContext persists/exposes `membershipId` from select-membership JWT path; TopHeader membership picker binds `*_label` with `—` fallback only (no invent). Vitest 11/11 green. Mobile lane deferred to W1-B-04-AUTH-MOB.

## next_owner

qa

## next_dispatch_prompt

```text
work_item_id: W1-B-04-AUTH-FE-QA
role: qa
mission: Browser U65 retest portal FR-UC-M01 — login → membership picker shows BE tenant_label/company_label/role_label (not raw roleCode) → select-membership → JWT/session has membershipId; F5 session still labeled. No seed.
read_first: docs/program/slices/DOC-ENT-P0-AUTH-M01.md · docs/qa/evidence/w1b-04-auth-fe.md · docs/qa/evidence/w1b-03-auth-be.md · API_CONTRACT §8
entry: L0 stack; portal :8088/:5175; persona ceo@xe.vn / Xevn@2026
exit: evidence docs/qa/evidence/w1b-04-auth-fe-qa.md with click path + Network login/select 2xx + FE label assert; PASS_TO_PM or FAIL with residual
cấm: pnpm seed:* · invent PASS from probe-only
```

## ack_status

**READY_FOR_QA**
