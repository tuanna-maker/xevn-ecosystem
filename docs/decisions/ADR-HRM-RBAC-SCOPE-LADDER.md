# ADR: HRM RBAC — Scope ladder, multi-membership, and portal/HRM scope contract

| Field | Value |
|-------|--------|
| **ADR-ID** | ADR-HRM-RBAC-SCOPE-LADDER |
| **work_item_id** | `HRM-FIDELITY-SA` |
| **Program** | `HRM_FULL_FIDELITY_PROGRAM` · gate **G-FID-03** |
| **Status** | Accepted |
| **Date** | 2026-05-24 |
| **Decision owner** | SA |
| **Consumers** | BA (`HRM_SEED_CARDINALITY_RULES.md`), Dev-BE (seed + list API audit), Dev-FE (scope switcher), QA (persona matrix) |
| **Related ADRs** | `ADR-HRM-EMBED-DATA-MODE.md`, `ADR-XBOS-M01-OPENAPI-BOUNDARIES.md` |
| **Evidence (runtime)** | `apps/api/hrm-api/src/common/scope-context.ts`, `apps/api/hrm-api/src/common/scope-context.spec.ts`, `apps/api/xbos-api/src/common/scope-context.ts`, `apps/api/xbos-api/src/auth/auth.service.ts`, `apps/api/xbos-api/src/tenant-scope/tenant-scope.service.ts`, `docs/qa/PILOT_SCOPE_DATA_MATRIX.md` |

---

## 1. Context

XeVN operates as a **multi-tenant holding** with member subsidiaries. Users may hold **multiple memberships** (different `tenantId` / `roleCode`). Every API call must carry a **single active scope** (`tenantId` + `companyId`, and for mobile optionally `company_uuid`) that matches the signed JWT. Drift between JWT claims and query/header scope produces **HTTP 409** `SCOPE_CONTEXT_MISMATCH` — a pilot-blocking defect class (Command Center KPI, HRM embed, settings catalogs).

This ADR defines:

1. The **scope ladder** (group → company → operational narrowing).
2. **Multi-membership** semantics and JWT re-issue rules.
3. **XBOS catalog authority** vs **HRM operational data** boundaries.
4. How **portal Command Center + HRM embed** must resolve scope without 409 or cross-tenant leak.

Implementation truth is in code today; sections mark **Current** vs **Target** where fidelity work (G-FID-04..07) extends behavior.

---

## 2. Problem statement

| Pain | Cause | Impact |
|------|-------|--------|
| `409 companyId mismatches token scope` | FE sends `company_id=xevn` or `holding` while JWT has `main` | CC/HRM routes red; false “no data” |
| Cross-tenant confusion | `tenantId` in query ≠ JWT | Data leak risk + 409 |
| Group CEO vs member CEO | Same slug `main` across tenants; different **tenant** membership | Wrong satellite counts if list APIs ignore tenant partition |
| Catalog vs HRM rows | XBOS org uses `holding`; HRM employees use `main` | Teams conflate identifiers |
| Portal tenant switch without new JWT | `GlobalFilter` changes tenant; token still old | Subsequent XBOS/HRM calls scoped to stale claims |
| Manager “narrow view” | Only `employee_id` query param; no dept RBAC table | Managers may see full `company_id` lists (**Target** closes gap) |

---

## 3. Scope ladder (three rungs)

The ladder is **not** three different `companyId` slugs for the same API plane. It is **authorization breadth** within a resolved `(tenantId, companyId)` context.

```text
                    ┌─────────────────────────────────────┐
                    │ Rung 1 — Group leadership           │
                    │ tenant: master (xevn)               │
                    │ company: main (HRM) / holding (XBOS org only) │
                    │ role: group_ceo, group_*            │
                    │ Can: all member tenants (membership)│
                    │      group-member-units, rollup KPI │
                    └──────────────┬──────────────────────┘
                                   │ narrows by membership / filter
                    ┌──────────────▼──────────────────────┐
                    │ Rung 2 — Company leadership         │
                    │ tenant: member OR master+main       │
                    │ company: main (always for HRM ops)  │
                    │ role: ceo, subsidiary_ceo         │
                    │ Can: one tenant's operational data  │
                    │ Cannot: group-only XBOS endpoints   │
                    └──────────────┬──────────────────────┘
                                   │ narrows by role + query
                    ┌──────────────▼──────────────────────┐
                    │ Rung 3 — Dept / manager narrowing   │
                    │ Same tenantId + companyId as Rung 2 │
                    │ role: manager, hr_manager (mobile)  │
                    │ Can: team slice (employee_id / dept) │
                    │ Current: optional employee_id filter│
                    │ Target: org_unit_id + RBAC matrix   │
                    └─────────────────────────────────────┘
```

### 3.1 Rung 1 — Group leadership (all member companies)

| Dimension | Rule |
|-----------|------|
| **Membership** | `xbos_user_tenant_membership` includes master tenant (`tenant_kind=master`, e.g. `xevn`) with `role_code` such as `group_ceo`. |
| **JWT at login** | `auth.service.login()` picks CEO membership → `tenantId=xevn`, `companyId=registry.default_company_id` → **`main`** (not `holding`). |
| **XBOS group APIs** | `tenant-scope/group-member-units`, `group-org-overview` require master membership; resolve **tenant** via JWT `sub`, not `companyId` gate. |
| **HRM operational APIs** | Still use **`companyId=main`** for employee/attendance/payroll lists under master tenant. Group **legal entity** data in XBOS may use `holding` — **out of HRM embed path**. |
| **FE sentinel** | `holding` / `all` in UI are **group filter sentinels** only; `identityScope.isGroupCompanyId()` maps API scope back to **`main`**. |

**Invariant:** Group leadership is expressed by **master tenant membership + role**, not by passing `companyId=holding` to HRM REST.

### 3.2 Rung 2 — Company leadership (one company / one member tenant)

| Dimension | Rule |
|-----------|------|
| **Membership** | One row per member tenant (e.g. `xe-du-lich`) with `companyId=main` (`MEMBER_DEFAULT_COMPANY_ID`). |
| **JWT** | `tenantId=<member>`, `companyId=main`. |
| **Forbidden** | Member-only CEO calling group overview → **403** `XBOS-TENANT-403` (not 409). |
| **Data partition** | HRM SQL filters on `company_id` (+ future `tenant_id` column where populated). XBOS scoped endpoints use `resolveScopeContext`. |

**Invariant:** For every member tenant, **`companyId` in membership means operating company bucket `main`**, not the tenant slug. Using `company_id=xevn` as company → **409** (VAL-SCOPE-02).

### 3.3 Rung 3 — Department / manager narrowing

| Dimension | **Current (code)** | **Target (G-FID-04/FE/BE)** |
|-----------|-------------------|------------------------------|
| **Role derivation** | Mobile: `deriveRoles(job_title_key)` → `employee`, `manager`, `hr_manager`. Portal: `roleCode` on membership row. | Align portal + HRM with `position-rbac` assignments from XBOS. |
| **API gate** | `resolveScopeContext` — same `tenantId`/`companyId` as leader. | Unchanged at transport layer. |
| **Row filter** | Optional `employee_id` on attendance lists; employees list is **full company**. | Manager: `WHERE org_unit_id IN (:allowed)` or approval queue only; HRBP: tenant HR scope. |
| **Approvals** | Manager flows use authenticated employee + company scope. | Explicit “reports-to” graph from org seed. |

**Invariant:** Narrowing **never** changes JWT `tenantId`/`companyId` to another tenant; it only restricts **rows returned** inside the same scope.

---

## 4. Identifier contract (do not conflate)

| Identifier | Layer | Example (`ceo@xe.vn`) | Consumer |
|------------|-------|------------------------|----------|
| `tenantId` | Registry / membership | `xevn` | JWT, `x-tenant-id`, SQL partition |
| `companyId` | Operating scope within tenant | **`main`** (HRM, portal KPI, embed) | JWT, `x-company-id`, `?company_id=` |
| `holding` | XBOS org / business master only | `xevn` + `holding` | `org-foundation`, `business-master` — **not** HRM embed |
| `company_uuid` | Mobile attendance row key | derived / `attendance_company_uuid` | HRM `companyScopeMatches()` slug+UUID |
| `memberships[]` | Identity (many per user) | N tenants | Login payload; switcher UX |

Full pilot matrix: `docs/qa/PILOT_SCOPE_DATA_MATRIX.md` §2–§5.

---

## 5. Multi-role and multi-membership

### 5.1 Two membership planes

| Plane | Source | Shape | Switch mechanism |
|-------|--------|-------|------------------|
| **Portal (XBOS)** | `TenantScopeService.listAccessible(userId)` | `{ tenantId, companyId, roleCode, tenantKind, isMaster }[]` | **Target:** `POST /api/xbos/auth/select-membership` → new JWT. **Current:** login default only; FE `GlobalFilter` changes tenant without guaranteed JWT refresh. |
| **Mobile (HRM)** | Multiple `employees` rows per email | `MobileMembership[]` with `employee_id`, `company_id`, `company_uuid` | `POST /api/hrm/auth/mobile/select-membership` → **re-issue** access+refresh tokens (`mobile-auth.service.ts`). |

### 5.2 Login and default selection

**Portal** (`auth.service.ts`):

```typescript
// Default: first CEO membership, else first row
const defaultMembership = memberships.find((m) => m.roleCode.includes('ceo')) ?? memberships[0];
signServiceJwt({ sub, email, tenantId, companyId, roleCode }, PORTAL_LOGIN_JWT_TTL_SEC);
```

**Mobile** (`mobile-auth.service.ts`):

- All active employee rows for email → `memberships[]`.
- Default: `is_primary` membership, else first verified row.
- `selectMembership(email, employee_id)` rebuilds tokens for chosen row.

### 5.3 Scope switch rules (mandatory)

| Step | Portal + embed | Mobile |
|------|----------------|--------|
| 1 | User picks membership/tenant | User picks `employee_id` on Scope screen |
| 2 | **Re-issue JWT** with selected `tenantId`, `companyId`, `roleCode` | `select-membership` returns new `access_token` |
| 3 | Persist token (`authSession` / sessionStorage) | Secure store + refresh rotation |
| 4 | Recompute `resolveIdentityScope()` / `activeTenantScope` | Update `getHrmAuth()` headers |
| 5 | All API calls: query `company_id` + headers **match** new JWT | Attendance body UUID must match `company_uuid` claim |

**Forbidden:** Changing only UI filter (`setSelectedTenant`) while leaving JWT claims from a different membership — causes 409 or silent wrong-tenant reads.

### 5.4 JWT claims (minimum)

| Claim | Portal | Mobile HRM |
|-------|--------|------------|
| `sub` / email | ✓ | ✓ |
| `tenantId` | ✓ | ✓ |
| `companyId` | ✓ (slug) | ✓ (slug) |
| `roleCode` / `roles` | `roleCode` | `roles[]` |
| `company_uuid` | omit | ✓ when attendance uses UUID |
| `employee_id` | omit | ✓ |

TTL: portal 24h (`PORTAL_LOGIN_JWT_TTL_SEC`); mobile access 12h.

---

## 6. XBOS catalog authority vs HRM operational data

| Concern | System of record | Write path | Read path (HRM) |
|---------|------------------|------------|-----------------|
| Tenant registry, user membership | XBOS | Admin/seed | Portal login only |
| Catalog definitions (183 keys), publish version | XBOS `config-sync` | Publish/bootstrap | HRM `catalog-sync` pull (read replica) |
| Catalog extension approval | XBOS `catalog-governance` | Workflow | Command Center |
| Org tree, legal entity, position templates | XBOS `org-foundation`, `position-rbac` | XBOS APIs | Portal settings; metadata hints for HRM |
| Business master rows | XBOS `business-master/:domain` | Scoped CRUD | Portal; not employee payroll |
| KPI definitions + rollup math | XBOS `kpi-engine` | Evaluate/rollup | Portal dashboard |
| Employees, attendance, leave, payroll | HRM Postgres | HRM REST only | HRM web/mobile/embed |
| Extension field values on employees | HRM | HRM + workflow refs | Embed |

**Rules:**

1. HRM **must not** publish catalog versions or mutate `xbos_*` governance tables.
2. XBOS **must not** store authoritative attendance/payroll transaction rows (only aggregates via KPI if configured).
3. Scope for catalog publish uses `resolveScopeContext` (often `holding` for group legal entity). Scope for HRM list uses **`main`** aligned with portal JWT.
4. Internal edge (`x-internal-api-key`) bypasses JWT for ops only — not for end-user browser calls.

See `ADR-XBOS-M01-OPENAPI-BOUNDARIES.md` for controller-level map.

---

## 7. Portal Command Center + HRM embed — scope resolution

### 7.1 Resolution chain (no 409)

```text
[Login] auth.service → JWT(tenantId, companyId=main) + memberships[]
        ↓
[AuthContext] persist accessToken + memberships
        ↓
[GlobalFilterProvider] selectedTenant from memberships/accessible API
        ↓ activeTenantScope(tenantId, companyId: master→JWT main, member→main)
[identityScope.resolveIdentityScope(tenantHint, companyHint)]
        ↓ JWT wins; group sentinels → main
[HrmWorkspaceRoute] iframe ?portal=1&tenantId=&companyId=
        ↓
[hrm app] resolveHrmSpreadsheetScope — JWT over ?companyId=xevn
        ↓
[hrmApiClient] Authorization + x-tenant-id + x-company-id + query company_id
        ↓
[hrm-api] resolveScopeContext(Authorization, { tenantId, companyId })
```

### 7.2 FE rules (enforceable)

| Rule | Implementation |
|------|----------------|
| P-CC-HRM-01 | Embed URL `companyId` must equal JWT `companyId` after `resolveIdentityScope` (typically **`main`**). |
| P-CC-HRM-02 | Never pass `MASTER_TENANT_ID` (`xevn`) as **company** query param. |
| P-CC-HRM-03 | `isGroupCompanyId(holding\|all)` → resolve API scope to **`main`**. |
| P-CC-HRM-04 | Bearer portal token required in embed API mode; no Supabase REST on pilot routes (`ADR-HRM-EMBED-DATA-MODE`). |
| P-CC-HRM-05 | On tenant switch, block HRM iframe reload until JWT re-issued (**Target**). |
| P-CC-XBOS-01 | KPI/catalog calls on CC use same `tenantId`/`companyId` pair as JWT (rollup: `main` for group CEO pilot). |
| P-CC-XBOS-02 | Group-only endpoints check membership `isMaster`, not `companyId=holding` on HRM paths. |

### 7.3 BE rules (`resolveScopeContext`)

| Code | HTTP | When |
|------|------|------|
| `SCOPE_CONTEXT_MISMATCH` | **409** | JWT present and header/query `tenantId` or `companyId` ≠ claim (after `companyScopeMatches` for UUID) |
| `SCOPE_TENANT_REQUIRED` / `SCOPE_COMPANY_REQUIRED` | 400 | Missing both claim and request fallback |
| `SCOPE_TENANT_INVALID` / `SCOPE_COMPANY_INVALID` | 400 | Slug format violation |

HRM extends XBOS with **`companyScopeMatches`**: slug `holding` in JWT + UUID body allowed when `company_uuid` claim matches (`scope-context.spec.ts`).

XBOS `resolveTenantOnlyContext`: catalog/alert endpoints — `companyId` optional, falls back to `tenantId` for group-shaped context.

### 7.4 Cross-tenant leak prevention

| Layer | Control |
|-------|---------|
| Transport | JWT verified (`getVerifiedInternalJwtPayload`); mismatch → 409 before service |
| Service | SQL predicates include `company_id` (and tenant where modeled) from **resolved** scope, not raw user input alone |
| Membership | XBOS `assertMembership(userId, tenantId)` on tenant-scoped admin actions |
| FE | Do not send `x-tenant-id` for tenant user cannot access via `memberships[]` |
| Negative test | `company_id=xevn` with JWT `main` → expect **409**, not empty 200 |

---

## 8. Decision options (summary)

| Option | Summary | Verdict |
|--------|---------|---------|
| **A — JWT-single-scope + resolveScopeContext gate** | One active membership; strict JWT∩request match; FE identity layer normalizes `holding`→`main` for HRM | **Accepted** (current + harden) |
| **B — Request-scope only (no JWT company)** | Trust headers from FE | Rejected — cross-tenant leak risk |
| **C — Per-tenant JWT without companyId** | Tenant-only claims | Rejected — breaks multi-company within tenant and KPI contracts |

---

## 9. Rollout and validation (G-FID-03)

| Checkpoint | Owner | Evidence |
|------------|-------|----------|
| ADR published | SA | This file |
| BA data matrix aligns | BA-Data | `HRM_SEED_CARDINALITY_RULES.md` refs §3–§7 |
| BE list APIs audited | Dev-BE | Scope audit note + `seed:hrm:fidelity` |
| Portal select-membership JWT | Dev-BE/FE | New endpoint + switcher; no 409 on tenant change |
| Manager narrowing | Dev-BE | Dept/manager filters behind `roles` |
| QA personas | QA | Group CEO (`ceo@xe.vn`), member CEO (`du-lich.ceo@xe.vn`), HRBP/manager mobile |
| Automated | QA | `pnpm --filter hrm-api test scope-context.spec.ts`; `test:system:uat`; L2 matrix P-CC-* |

**Acceptance (G-FID-03):** Document accepted; BA/Dev/QA cite ADR-ID in traceability; zero open **409 scope** defects on mandatory pilot routes after fidelity sprint.

---

## 10. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| FE tenant switch without JWT refresh | Ship `select-membership` for portal; gate iframe navigation on token update |
| `holding` vs `main` documentation drift | Single table §6 + `PILOT_SCOPE_DATA_MATRIX.md` |
| Manager sees entire company | Target rung-3 filters; interim document in QA matrix |
| Mobile UUID mismatch | Seed `attendance_company_uuid`; test VAL-SCOPE-05/06 |
| Dual DB catalog vs ops confusion | ADR §6 boundaries; no HRM write to catalog publish |

---

## 11. Handoff

| Field | Value |
|-------|--------|
| **from_role** | sa |
| **to_role** | pm |
| **work_item_id** | `HRM-FIDELITY-SA` |
| **ack_status** | `PASS_TO_PM` |
| **evidence_path** | `docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md` |
| **exit_criteria** | ADR covers scope ladder, multi-membership JWT rules, XBOS/HRM boundary, CC+embed resolution — **met** |

**Next dispatch (PM):** Unblock `HRM-FIDELITY-BA-D` / `HRM-FIDELITY-BE` / `HRM-FIDELITY-FE` against §3 Target rows; QA adds persona checks from §9.

---

## 12. Code references

| Topic | Path |
|-------|------|
| HRM scope gate + UUID match | `apps/api/hrm-api/src/common/scope-context.ts` |
| HRM scope tests | `apps/api/hrm-api/src/common/scope-context.spec.ts` |
| XBOS scope gate | `apps/api/xbos-api/src/common/scope-context.ts` |
| Portal login + memberships | `apps/api/xbos-api/src/auth/auth.service.ts` |
| Accessible tenants | `apps/api/xbos-api/src/tenant-scope/tenant-scope.service.ts` |
| Mobile memberships + select | `apps/api/hrm-api/src/auth/mobile-auth.service.ts` |
| Portal identity resolution | `apps/web/web-portal/src/integrations/identityScope.ts` |
| Tenant filter + active scope | `apps/web/web-portal/src/contexts/GlobalFilterContext.tsx` |
| HRM embed iframe URL | `apps/web/web-portal/src/modules/hrm/HrmWorkspaceRoute.tsx` |
| HRM API client headers | `apps/web/web-portal/src/modules/hrm/hrmApiClient.ts` |

---

*End of ADR — no git commit per dispatch instruction.*
