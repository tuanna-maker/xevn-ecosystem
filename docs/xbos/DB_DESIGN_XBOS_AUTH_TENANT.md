# DB_DESIGN — XBOS Auth · tenant membership · session scope

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-XBOS-AUTH-TENANT-DESIGN-01` |
| **change_mode** | ADD · preserve_default |
| **ref_srs** | Khách `docs/client-delivery/xbos/SRS_XBOS_KHACH.md` **§3.1 FR-XBOS-AUTH-01** Diễn biến #1–8 · **§3.2 FR-XBOS-TENANT-01** Diễn biến #1–7 · **§3.3 FR-ECO-SCOPE-02** Diễn biến #1–7 · UF-XBOS-01 · UF-XBOS-11 |
| **ref_techspec** | `docs/xbos/TECHSPEC.md` **§14.1–14.3** · §5 Platform / M01-Tenant · §12.1 `tenantScopeApi` · ecosystem dual-ref FR-ECO-SCOPE-02 |
| **ref_api** | `docs/xbos/API_DESIGN_XBOS_AUTH_TENANT.md` |
| **must_keep_pairs** | `docs/xbos/DB_DESIGN_XBOS_RACI_RBAC.md` · `DB_DESIGN_XBOS_WORKFLOW.md` · `DB_DESIGN_XBOS_CATALOG_GOV.md` · `DB_DESIGN_XBOS_KPI.md` (**cấm** đè / rewrite) |
| **Template** | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` |
| **U71** | Physical DB slice for portal auth + tenant membership before any future Dev deepen |
| **Date** | 2026-07-27 |
| **Owner service** | XBOS (`xbos-api` · `AuthService` · `TenantScopeService` · `resolveScopeContext`) |
| **Runtime DDL** | `AuthService.ensureSchema` (`xbos_portal_user`) · org-foundation / seed DDL (`xbos_tenant_registry` · `xbos_user_tenant_membership`) |

> **Scope:** (A) portal credentials, (B) tenant registry + memberships, (C) JWT session claims as **logical** store (no session table).  
> **Out of scope:** RACI / WF / catalog-gov / KPI DDL · org-legal LE mutate · password reset / IdP federation.  
> **must_keep:** UF-XBOS-01 / UF-XBOS-11 🟢 · RACI/WF/catalog-gov/KPI pairs · U65 zero-seed for nghiệm thu (empty membership = AUTH-403 / empty list — không fake membership để pass UF).

---

## 1. Ownership & plane (normative)

```text
Portal login / Global filter FE
        │
        │ POST /auth/login              → xbos_portal_user + list memberships → JWT
        │ GET  /auth/me                 → user + memberships (Bearer)
        │ GET  /tenant-scope/accessible → JOIN membership × tenant_registry
        │ POST /auth/select-membership  → re-issue JWT (same membership store)
        │ Business APIs                 → resolveScopeContext(JWT ± headers)
        ▼
xbos-api  tenant_id TEXT · company_id TEXT slug (Plane B operating)
```

| Subsystem | Owner | Tables (this file) | Plane key |
|-----------|-------|--------------------|-----------|
| **Portal user** | `auth` | `xbos_portal_user` | `user_id` TEXT (email lower) |
| **Tenant catalog** | `tenant-scope` / foundation | `xbos_tenant_registry` | `tenant_id` TEXT |
| **Membership** | `tenant-scope` | `xbos_user_tenant_membership` | UNIQUE `(user_id, tenant_id)` |
| **Session** | JWT HS256 | *(no DB table)* | claims: `sub`, `tenantId`, `companyId`, `roleCode`, `exp` |

**Reject:** Treating LE UUID as JWT `companyId` / membership company key.  
**Reject:** Silent scope remap on mismatch (must 409 `SCOPE_CONTEXT_MISMATCH`).  
**Reject:** Seed memberships in QA evidence path to force UF-XBOS-01 PASS (U65).

---

## 2. `public.xbos_portal_user` (credential SoT)

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `user_id` | TEXT PK | NO | Email đăng nhập (chuẩn hoá lower) | FR-AUTH #2/#5 |
| `display_name` | TEXT | NO | Tên hiển thị phiên | Kết quả trả về |
| `password_hash` | TEXT | NO | SHA-256(`userId:password:xevn-portal-dev`) — runtime hiện tại | FR-AUTH #3 |
| `status` | TEXT | NO | `active` \| locked/inactive — chỉ `active` được login | FR-AUTH #4 |
| `created_at` | TIMESTAMPTZ | NO | Audit | — |
| `updated_at` | TIMESTAMPTZ | NO | Audit | — |

**Index:** PK `user_id`.  
**Login rule:** missing row OR `status ≠ active` OR hash mismatch → **cùng** `XBOS-AUTH-401` (không lộ “user không tồn tại”).  
**No membership after auth:** `XBOS-AUTH-403` «Tài khoản chưa được gán tenant».

---

## 3. `public.xbos_tenant_registry` (tenant directory)

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `tenant_id` | TEXT PK | NO | Mã tenant (`xevn`, `xe-du-lich`, …) | FR-TENANT #2 |
| `name` | TEXT | NO | Tên đầy đủ | List tư cách |
| `short_name` | TEXT | NO | Tên ngắn / badge | FE |
| `tenant_kind` | TEXT | NO | `master` \| `member` | Group vs member scope |
| `default_company_id` | TEXT | NO | Slug công ty mặc định (vd. `main`) — **Plane B** | JWT `companyId` |
| `modules` | JSONB | NO | Module flags (mặc định `[]`) | Platform |
| `status` | TEXT | NO | Chỉ `active` join vào listAccessible | FR-TENANT #3 empty |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | Audit | — |

**Join rule:** `listAccessible` = membership `active` ∩ tenant `active`.  
**Master:** `tenant_kind=master` (vd. `xevn`) — điều kiện group overview / group-member-units.

---

## 4. `public.xbos_user_tenant_membership` (tư cách đơn vị)

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `id` | UUID PK | NO | Surrogate | — |
| `user_id` | TEXT | NO | FK logical → `xbos_portal_user.user_id` (**soft** — không cứng FK nếu bootstrap lệch casing) | FR-AUTH / TENANT |
| `tenant_id` | TEXT | NO | Soft → `xbos_tenant_registry.tenant_id` | FR-TENANT #2/#4 |
| `role_code` | TEXT | NO | Vai trò trong tenant (`ceo`, `group_ceo`, …) | JWT `roleCode` |
| `is_default` | BOOLEAN | NO | Gợi ý mặc định (login vẫn ưu tiên role chứa `ceo`) | Default membership |
| `status` | TEXT | NO | `active` required for list/select | FR-TENANT #4 |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | Audit | — |

**UNIQUE:** `(user_id, tenant_id)`.  
**Index (recommended):** `(user_id, status)` · `(tenant_id, status)`.

### 4.1 Logical wire row (`AccessibleTenant`)

Derived (không cột riêng):

| Wire | Source |
|------|--------|
| `tenantId` | `m.tenant_id` |
| `name` / `shortName` / `tenantKind` | `xbos_tenant_registry` |
| `roleCode` | `m.role_code` |
| `companyId` | `t.default_company_id` (fallback member `main`) |
| `isMaster` | `isMasterTenant(tenantId)` |

---

## 5. Session store (JWT — no table)

| Claim | Meaning | `ref_srs` |
|-------|---------|-----------|
| `sub` / `email` | `user_id` | FR-AUTH khóa phiên |
| `tenantId` | Tư cách đang chọn | FR-TENANT #5 |
| `companyId` | Slug Plane B | FR-ECO-SCOPE |
| `roleCode` | Vai trò membership | Scope ladder |
| `iat` / `exp` | TTL — default **86400** s (`PORTAL_LOGIN_JWT_TTL_SEC`) | P-CC-01-jwt · FR-AUTH #7 |

**Re-issue:** `select-membership` ký JWT mới cùng TTL; **không** UPDATE bảng membership (chỉ đổi claims phiên).  
**F5:** FE giữ `accessToken` → `GET /auth/me` + business calls với cùng claims.

---

## 6. Scope enforcement (cross-cutting · FR-ECO-SCOPE-02)

Không bảng riêng. Resolver runtime:

| Function | When | Fail |
|----------|------|------|
| `resolveScopeContext` | API cần `tenantId`+`companyId` | 409 `SCOPE_CONTEXT_MISMATCH` nếu header/query ≠ JWT |
| `resolveTenantOnlyContext` | Một số list tenant-wide | tenant mismatch |
| `TenantScopeService.assertMembership` | Explicit tenant check | `XBOS-TENANT-403` |
| Group gates | `group-org-overview` / `group-member-units` | `XBOS-TENANT-403` nếu thiếu master / group CEO |

**Parity (U19):** list + get-by-id + mutate **cùng** resolver trong mỗi module consumer — residual **G-SCOPE-01** on-touch (không đóng trong slice auth).

**Dual-plane cite:** JWT/`default_company_id` = **Plane B slug**; LE UUID thuộc org-legal pair — **cấm** nhầm làm claim scope.

---

## 7. Indexes & constraints summary

| Object | Definition |
|--------|------------|
| PK portal user | `user_id` |
| PK tenant | `tenant_id` |
| PK membership | `id` UUID |
| UNIQUE membership | `(user_id, tenant_id)` |
| Soft FKs | user ↔ membership ↔ tenant (join runtime; soft cite) |

---

## 8. Non-goals / must_keep

- **must_keep:** RACI · Workflow · Catalog-gov · KPI DB pairs — không sửa nội dung.
- **must_keep:** UF-XBOS-01 (login → membership) · UF-XBOS-11 (scope) 🟢.
- **must_keep:** OpenAPI `select-membership` G-OA-02 **CLOSED** — không reopen bằng design rewrite.
- **Cấm:** Session table / Redis bắt buộc trong U71 (JWT đủ cho Phase 1).
- **Cấm:** Invent IdP / OAuth columns beyond portal hash store.
- **Residual:** Optional OpenAPI login `requestBody` schema depth P2 · G-SCOPE-01 per-module on-touch.

---

## 9. Traceability

| Artifact | Path |
|----------|------|
| API_DESIGN | `docs/xbos/API_DESIGN_XBOS_AUTH_TENANT.md` |
| TechSpec | `docs/xbos/TECHSPEC.md` §14.1–14.3 |
| OpenAPI | `docs/api/openapi/xbos-api.yaml` — `xbosAuthLogin` · `xbosAuthSelectMembership` · `tenantScopeAccessible` |
| ADR | `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` · `ADR-HRM-RBAC-SCOPE-LADDER.md` |
| Evidence | `docs/qa/evidence/sa-u71-xbos-auth-tenant-design-01-20260727.md` |
