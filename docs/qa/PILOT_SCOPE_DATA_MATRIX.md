# Pilot scope data matrix — Command Center HRM embed

**work_item_id:** `P1-S0-BA-D-01`  
**program:** `PHASE1-SCRUM-S0` · sprint S0  
**from_role:** ba-data  
**to_role:** pm  
**ack_status:** `PASS_TO_PM`  
**pilot account:** `ceo@xe.vn` / `Xevn@2026` · portal `http://localhost:5175`  
**related:** [`PILOT_BUSINESS_FLOW_BA_TRACE.md`](PILOT_BUSINESS_FLOW_BA_TRACE.md) §9 · [`PILOT_BUSINESS_FLOW_MATRIX.md`](PILOT_BUSINESS_FLOW_MATRIX.md)

---

## 1. Purpose

Deterministic rules for **`tenantId`**, **`companyId`**, and **JWT claims** so Command Center HRM embed and portal-side APIs do not return **`409 SCOPE_CONTEXT_MISMATCH`** (`companyId mismatches token scope`).

Implementation truth: `apps/api/hrm-api/src/common/scope-context.ts`, `apps/api/xbos-api/src/auth/auth.service.ts`, `apps/web/web-portal/src/integrations/identityScope.ts`, `apps/web/hrm/src/lib/hrmSpreadsheetScope.ts`.

---

## 2. Identifier semantics (do not conflate)

| Identifier | Type | Example (`ceo@xe.vn` pilot) | Meaning |
|------------|------|-----------------------------|---------|
| **tenant_id** / **tenantId** | Slug (registry PK) | `xevn` | Legal/operating **tenant** in `xbos_tenant_registry` / HRM multi-tenant partition. |
| **company_id** / **companyId** | Slug (scope within tenant) | `main` | **Operating company** bucket for HRM rows and most portal API scope. |
| **company_uuid** | UUID | derived / `attendance_company_uuid` | **Mobile-only** row key for attendance writes when body/query uses UUID; must match JWT `company_uuid` when present. |
| **holding** | company slug (XBOS org) | `xevn` + `holding` | Group **legal entity** in org foundation / business master — **not** the HRM embed query company for pilot CEO. |
| **xevn as companyId** | Anti-pattern | `company_id=xevn` | **Wrong:** `xevn` is the **tenant** id, not company scope → **409** on HRM/XBOS scoped APIs. |

---

## 3. `ceo@xe.vn` — seed and login contract

### 3.1 XBOS membership (source of JWT scope)

| Field | Value | Source |
|-------|-------|--------|
| `user_id` | `ceo@xe.vn` | `xbos_portal_user` |
| Master membership | `tenant_id=xevn`, `role_code=group_ceo` | `xbos_user_tenant_membership` |
| Registry default company | `default_company_id=main` | `xbos_tenant_registry` (seed `MEMBER_COMPANY='main'` in `seed-org-foundation.ts`) |

Login (`POST /api/xbos/auth/login`) signs JWT from **default CEO membership**:

- `tenantId` ← `defaultMembership.tenantId` → **`xevn`**
- `companyId` ← `defaultMembership.companyId` ← registry **`main`** (not tenant slug, not `holding` on fresh org seed)

**Evidence:** `docs/qa/evidence/portal-auth-token-20260522.md` (A1–A3), `docs/qa/evidence/hrm-embed-employees-fix-20260522.md` (JWT `companyId=main`).

### 3.2 Portal JWT claims (access token payload)

| Claim key (aliases) | Pilot value | Consumer |
|---------------------|-------------|----------|
| `sub` / `email` | `ceo@xe.vn` | Audit, `x-user-id` |
| `tenantId` / `tenant_id` / `tid` | `xevn` | `resolveIdentityScope`, `x-tenant-id` |
| `companyId` / `company_id` / `cid` | **`main`** | `resolveIdentityScope`, `x-company-id`, HRM query `company_id` |
| `roleCode` | `group_ceo` (or `ceo_group` in tests) | RBAC hints |
| `exp` − `iat` | `86400` | Session TTL |

**Not in portal JWT (pilot):** `company_uuid` — required only on **mobile** HRM JWT for UUID-bodied attendance APIs.

### 3.3 Login response `memberships[]` (when to use)

| Use | Rule |
|-----|------|
| **Default session** | First CEO membership → same as JWT: `tenantId=xevn`, `companyId=main`. |
| **Tenant switcher (future)** | User picks another `memberships[i]` → new JWT must be re-issued with that row’s `tenantId` + `companyId`; all API headers/query must match **new** token. |
| **Member subsidiary CEO** | e.g. `du-lich.ceo@xe.vn` → `tenantId=xe-du-lich`, `companyId=main` — **no** master `group-member-units` (403). |

**Main vs membership `companyId`:** For every seeded member tenant, `companyId` in membership is **`main`** (`MEMBER_DEFAULT_COMPANY_ID`). The word “membership” refers to **which tenant** the user belongs to, not a different company slug. Group-level org data may live under XBOS `(tenantId=xevn, companyId=holding)` but **HRM embed pilot APIs must use `main` aligned with JWT**.

---

## 4. When to use which `companyId`

| Context | `tenantId` | `companyId` | Notes |
|---------|------------|-------------|-------|
| Command Center HRM iframe (`HrmWorkspaceRoute`) | `xevn` | **`main`** | `resolveIdentityScope()` → `hrmProxyPath(..., companyId=main)` |
| HRM app in iframe (`resolveHrmSpreadsheetScope`) | JWT / QS | **JWT wins** over `?companyId=xevn` | Prevents 409 on settings-catalogs / spreadsheet |
| Portal `hrmApiClient` / KPI rollup | `xevn` | **`main`** | Must not pass `MASTER_TENANT_ID` as company (D6 defect class) |
| HRM REST query | `xevn` | **`main`** | e.g. `GET /api/hrm/employees?company_id=main&page_size=100` |
| XBOS group catalog / business master | `xevn` | `holding` | Org seed / `xbos_business_master_entries` — **out of HRM embed path** |
| UI group filter sentinel | any | `holding` \| `all` | `isGroupCompanyId()` → FE falls back to **`main`** for API scope |
| Mobile attendance POST body | session tenant | **`company_uuid` (UUID)** | Slug `main` in JWT + UUID body allowed via `companyScopeMatches()` |
| Negative test | `xevn` | `xevn` | Expect **409** `SCOPE_CONTEXT_MISMATCH` |

---

## 5. Validation matrix (scope)

| ID | Condition | Rule | Expected HTTP / code |
|----|-----------|------|----------------------|
| VAL-SCOPE-01 | Portal CEO calls HRM with Bearer JWT | `company_id` / `x-company-id` = JWT `companyId` (`main`) | **200** or business 4xx, not scope 409 |
| VAL-SCOPE-02 | `company_id=xevn` with JWT `companyId=main` | Mismatch tenant slug used as company | **409** `SCOPE_CONTEXT_MISMATCH` |
| VAL-SCOPE-03 | `x-tenant-id` ≠ JWT `tenantId` | Header/query tenant override | **409** `SCOPE_CONTEXT_MISMATCH` |
| VAL-SCOPE-04 | iframe `?companyId=xevn` + portal session | HRM `resolveHrmSpreadsheetScope` prefers JWT | Effective scope **`main`**; no 409 on catalogs |
| VAL-SCOPE-05 | Mobile UUID body | JWT has `company_uuid`; body UUID equals claim | **200**; not `SCOPE_CONTEXT_MISMATCH` |
| VAL-SCOPE-06 | Mobile UUID body, JWT lacks `company_uuid` | Foreign UUID vs slug `main` | **409** `SCOPE_CONTEXT_MISMATCH` |
| VAL-SCOPE-07 | Missing tenant/company | No claim and no request fallback | **400** `SCOPE_TENANT_REQUIRED` / `SCOPE_COMPANY_REQUIRED` |
| VAL-SCOPE-08 | `page_size` > 100 on employees list | HRM validation | **400** `HRM-VAL-001` |

---

## 6. Deterministic error mapping

| Code | HTTP | Message (typical) | Trigger |
|------|------|-------------------|---------|
| `SCOPE_CONTEXT_MISMATCH` | 409 | `companyId mismatches token scope` | Query/header/body company or tenant ≠ JWT |
| `SCOPE_TENANT_REQUIRED` | 400 | `tenantId is required` | No tenant in JWT or request |
| `SCOPE_COMPANY_REQUIRED` | 400 | `companyId is required` | No company in JWT or request |
| `SCOPE_TENANT_INVALID` / `SCOPE_COMPANY_INVALID` | 400 | format invalid | Fails `^[a-zA-Z0-9][a-zA-Z0-9_-]{1,62}$` |
| `XBOS-TENANT-403` | 403 | master membership required | `du-lich.ceo@xe.vn` on `group-member-units` |

Envelope: `{ success: false, code, message, details?: { field, token, request, tokenCompanyUuid? } }`.

---

## 7. Layer traceability (pilot HRM embed)

| Layer | Artifact / module | Scope for P-CC-03..08 |
|-------|-------------------|------------------------|
| BRD/SRS | `docs/ecosystem/SRS.md` §8.1; `docs/hrm/SRS.md` §13 | BR-SCOPE-01..02 |
| BA process | `PILOT_BUSINESS_FLOW_BA_TRACE.md` §2, §9 | BR-SCOPE-* |
| **BA data (this doc)** | `PILOT_SCOPE_DATA_MATRIX.md` | Claims + validation VAL-SCOPE-* |
| BE | `hrm-api/.../scope-context.ts`, `xbos-api/.../auth.service.ts` | `resolveScopeContext` |
| FE portal | `identityScope.ts`, `HrmWorkspaceRoute.tsx`, `kpiEngineApi.ts` | JWT-aligned headers |
| FE HRM iframe | `hrmSpreadsheetScope.ts`, `hrmApi.ts` | Portal JWT bridge |
| QA L2 | `PILOT_BUSINESS_FLOW_MATRIX.md` P-CC-03..08 | No 409 on primary load |
| QA evidence | `hrm-embed-*-20260522.md`, `pilot-business-flow-20260522.md` | PASS/FAIL rows |

---

## 8. QA probe commands (reproducible)

```powershell
$xbos = 'http://127.0.0.1:28002/api/xbos'
$hrm = 'http://127.0.0.1:28001/api/hrm'
$login = Invoke-RestMethod -Uri "$xbos/auth/login" -Method POST -Body '{"email":"ceo@xe.vn","password":"Xevn@2026"}' -ContentType 'application/json'
$t = $login.data.accessToken
$h = @{ Authorization = "Bearer $t"; 'x-tenant-id' = 'xevn'; 'x-company-id' = 'main' }
# PASS
Invoke-RestMethod -Uri "$hrm/employees?company_id=main&page_size=100" -Headers $h
# FAIL (409)
Invoke-WebRequest -Uri "$hrm/employees?company_id=xevn&page_size=100" -Headers $h -SkipHttpErrorCheck | Select-Object StatusCode, Content
```

Decode JWT payload (manual): middle segment of `accessToken` → confirm `"companyId":"main"` and `"tenantId":"xevn"`.

---

## 9. Data risks

| ID | Risk | Mitigation |
|----|------|------------|
| R-SCOPE-01 | Stale xbos-api binary issued `holding` or 12h TTL | Rebuild/restart API; verify `expiresInSec=86400` and `companyId=main` |
| R-SCOPE-02 | iframe QS `companyId=xevn` | `resolveHrmSpreadsheetScope` + `HrmWorkspaceRoute` JWT-first |
| R-SCOPE-03 | Sparkline/KPI uses tenant id as company | `resolveIdentityScope()` not `MASTER_TENANT_ID` for company param |
| R-SCOPE-04 | Confusion `holding` vs `main` in XBOS vs HRM | Use §4 table; QA negative probe `company_id=xevn` only as test |

---

## 10. Handoff packet

| Field | Value |
|-------|-------|
| work_item_id | `P1-S0-BA-D-01` |
| from_role | ba-data |
| to_role | pm |
| entry_criteria | PM dispatch S0; pilot 409 scope class documented in QA evidence |
| exit_criteria | Scope matrix published; BA trace §9 linked; VAL-SCOPE-* ready for QA L2 |
| evidence_path | **`docs/qa/PILOT_SCOPE_DATA_MATRIX.md`** (this file); `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` §9 |
| needed_by | QA attaches matrix to P-CC-03..08 probes; Dev-FE/BE regression guard |
| ack_status | **PASS_TO_PM** |
