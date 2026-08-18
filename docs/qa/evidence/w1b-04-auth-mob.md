# Evidence — W1-B-04-AUTH-MOB

| Field | Value |
| --- | --- |
| **work_item_id** | W1-B-04-AUTH-MOB |
| **role** | dev-mobile |
| **date** | 2026-08-03 |
| **slice** | `docs/program/slices/DOC-ENT-P0-AUTH-M01.md` |
| **ack_status** | **READY_FOR_QA** |

## spec_read_ack

```markdown
## spec_read_ack
- srs: docs/brand-new-documents-20270801/SRS_NEW.md v1.1 §3.2 · FR-UC-M01 · Diễn biến #1–5
- tech_spec: docs/brand-new-documents-20270801/TECH_SPEC_NEW.md · ref_srs FR-UC-M01 · TS-MOB-AUTH
- db_design: docs/brand-new-documents-20270801/DB_DESIGN_NEW.md v1.1 §3.1–3.3 — xbos_tenant_registry · xbos_portal_user · xbos_user_tenant_membership
- api_design: docs/brand-new-documents-20270801/API_CONTRACT_NEW.md v1.1 §8.4–8.5 — POST /api/hrm/auth/mobile/login · select-membership · refresh
- os: 28-FE-BE-SEPARATION-DISPLAY-READY (display-ready labels; FE bind only)
- be_evidence: docs/qa/evidence/w1b-03-auth-be.md
- slice: docs/program/slices/DOC-ENT-P0-AUTH-M01.md
- change_mode: UPGRADE
- sponsor_confirm: DOC-ENT pack · W1-B P0-1
```

## Closed

| Area | Change |
| --- | --- |
| `MobileMembership` (AuthContext) | ADD optional `company_label` / `tenant_label` / `role_label` / `job_title_label`; `normalizeMobileMembership(s)` on login / select / hydrate / signIn |
| `membershipDisplay.ts` | Bind helpers — prefer BE `*_label`; empty → `—`; **no** FE slug→label invent |
| LoginScreen | Multi-membership toast uses `resolveMembershipCompanyLabel` (not `resolveCompanyDisplayVi`) |
| ScopeScreen | «Đang dùng» shows company/tenant/role/job_title labels; list title/meta from BE; save alert uses labels (not raw `tenant_id`) |
| CODE-MEMORY | APPEND VI on AuthContext · LoginScreen · ScopeScreen · membershipDisplay |

## Verify

```text
pnpm exec vitest run src/features/auth/membershipDisplay.test.ts --reporter=dot
→ Test Files: 1 passed · Tests: 3 passed
```

## Allowed paths touched

- `apps/mobile/hrm-mobile/src/features/auth/**` (LoginScreen, ScopeScreen, membershipDisplay(+test))
- `apps/mobile/hrm-mobile/src/context/AuthContext.tsx`
- `docs/qa/evidence/w1b-04-auth-mob.md`

## must_keep confirmed

- login / select-membership / refresh flow unchanged (API paths + JWT wire)
- U65 no seed
- No web-portal paths
- No lockout DDL / leave / EMP rewrites

## solid_convention_ack / fe_be_soc

- FE binds `*_label` from BE only
- Raw keys (`company_id`, `tenant_id`) remain for JWT/headers; not shown as primary Scope UI labels
- When `company_label` present → `company_display` synced to label; never invent Plane A map on auth screens

## Residual

| id | Note | Owner |
| --- | --- | --- |
| R-M01-LOCKOUT-COL | unchanged OPEN | BA/SA |
| W1-B-04-AUTH-FE | portal membership picker wire (parallel) | **dev-fe** |
| Device smoke | Login → Scope shows VI labels; multi-membership toast | **qa-device** / qa |

## completion_report

Closed W1-B-04-AUTH-MOB: mobile LoginScreen + ScopeScreen + AuthContext consume HRM mobile auth display-ready labels from W1-B-03; no FE slug→label invent on auth path; vitest 3/3 green. Residual: device/browser QA + portal FE lane separate.

## next_owner

qa-device (or qa if no device lane)

## next_dispatch_prompt

```text
work_item_id: W1-B-04-AUTH-MOB-QA
role: qa-device (fallback: qa)
mission: Retest mobile FR-UC-M01 login → ScopeScreen after W1-B-04-AUTH-MOB. U65 zero-seed; browser/device FE only.
entry_criteria: evidence docs/qa/evidence/w1b-04-auth-mob.md READY_FOR_QA; stack hrm-api up; APK or Expo with latest auth sources.
exit_criteria:
  - Login toast (multi-membership) shows BE company_label VI — not raw slug (holding/trsport)
  - ScopeScreen «Đang dùng» shows company_label, tenant_label, role_label, job_title_label
  - Membership list titles = company_label; save alert uses labels not raw tenant_id
  - select-membership still switches JWT scope; leave/payroll not broken smoke
  - U65: no seed in evidence
read_first: docs/program/slices/DOC-ENT-P0-AUTH-M01.md · docs/qa/evidence/w1b-04-auth-mob.md · docs/qa/evidence/w1b-03-auth-be.md
evidence_path: docs/qa/evidence/w1b-04-auth-mob-qa.md
persona: uat.nv####@xe.vn or documented multi-membership account
J-*: J-MOB auth/scope related
```

## ack_status

**READY_FOR_QA**
