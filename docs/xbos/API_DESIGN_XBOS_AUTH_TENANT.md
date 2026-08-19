# API_DESIGN — XBOS Auth · session · tenant-scope · ECO scope

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-XBOS-AUTH-TENANT-DESIGN-01` |
| **change_mode** | ADD · preserve_default |
| **ref_srs** | Khách `SRS_XBOS_KHACH.md` **§3.1–3.3** FR-XBOS-AUTH-01 · FR-XBOS-TENANT-01 · FR-ECO-SCOPE-02 · UF-XBOS-01 · UF-XBOS-11 |
| **ref_techspec** | `docs/xbos/TECHSPEC.md` **§14.1–14.3** · OpenAPI Platform / M01-Tenant |
| **ref_db** | `docs/xbos/DB_DESIGN_XBOS_AUTH_TENANT.md` |
| **must_keep_pairs** | `docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md` · `API_DESIGN_XBOS_WORKFLOW.md` · `API_DESIGN_XBOS_CATALOG_GOV.md` · `API_DESIGN_XBOS_KPI.md` |
| **Template** | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` (Mục đích · Nghiệp vụ · Bước SRS) |
| **U71** | F.1-complete physical API for auth/tenant/scope before Dev deepen |
| **Date** | 2026-07-27 |
| **Runtime** | `AuthController` · `AuthService` · `TenantScopeController` · `TenantScopeService` · `resolveScopeContext` |
| **OpenAPI** | `docs/api/openapi/xbos-api.yaml` — login / select-membership / tenant-scope/* |
| **Base paths** | `/api/xbos/auth` · `/api/xbos/tenant-scope` |

> **Envelope:** Nest `ok(data, code, message)`.  
> **must_keep:** UF-XBOS-01/11 🟢 · G-OA-02 CLOSED · RACI/WF/catalog-gov/KPI API pairs · U65 zero-seed.  
> **Primary FR map:** A=AUTH-01 · B=session · C+D=TENANT-01 · E=ECO-SCOPE-02 (cross-cutting).

---

## 0. Common contract

| Item | Value |
|------|--------|
| Auth login | `security: []` (no Bearer) |
| Auth session/select | Bearer JWT (`sub` = `user_id`) |
| Scope business APIs | Bearer + optional `x-tenant-id` / `x-company-id` / query — **must match JWT** |
| Password fail | Generic `XBOS-AUTH-401` — không phân biệt user/password |
| Empty membership list | Login → `XBOS-AUTH-403`; accessible → `[]` hợp lệ (Diễn biến #3) |
| JWT TTL | `expiresInSec` = `exp−iat` = default **86400** (`PORTAL_LOGIN_JWT_TTL_SEC`) |

### Locale / FE

| Concern | Rule |
|---------|------|
| Labels | VI trên form đăng nhập / chọn tư cách (U72) |
| After login 2xx | Vào không gian hoặc màn chọn tư cách; lưu `accessToken` |
| After select 2xx | Badge đơn vị; F5 giữ membership (Diễn biến #5–6) |
| Scope 403/409 | Không im lặng đổi đơn vị; empty ≠ lỗi hệ thống |

---

## 1. Endpoint A — Login (FR-XBOS-AUTH-01) **PRIMARY**

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/xbos/auth/login` |
| Success | HTTP 200 · **`XBOS-AUTH-200`** |
| Auth | None |
| Body | `{ email: string, password: string }` (trim; email → lower `user_id`) |
| OpenAPI | `operationId: xbosAuthLogin` |

### Mục đích

Xác thực tài khoản cổng điều hành, tạo **phiên JWT** kèm danh sách tư cách — mở khóa FR-XBOS-TENANT-01 / FR-ECO-SCOPE-02.

### Nghiệp vụ xử lý

1. Chuẩn hoá `email` → `user_id` lower; validate không rỗng (email + password).
2. Load `xbos_portal_user`; nếu thiếu / `status ≠ active` → `XBOS-AUTH-401`.
3. So khớp `password_hash` (timing-safe); sai → `XBOS-AUTH-401` (cùng message).
4. `listAccessible(userId)` từ membership × tenant registry; empty → `XBOS-AUTH-403`.
5. Chọn default membership: ưu tiên `roleCode` chứa `ceo`, else phần tử đầu.
6. Ký JWT (`sub`, `tenantId`, `companyId`, `roleCode`) TTL = `resolvePortalLoginJwtTtlSec()`.
7. Return `accessToken`, `expiresInSec`, `user`, `memberships[]`, `defaultTenantId`, `defaultCompanyId`.
8. **Không** ghi session table.

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| UC-XBOS-AUTH-01 / FR-XBOS-AUTH-01 | **#2** thiếu bắt buộc | Validate body → 400/401 path |
| | **#3** sai mật khẩu / tài khoản | `XBOS-AUTH-401` |
| | **#4** tài khoản khóa | `status ≠ active` → `XBOS-AUTH-401` |
| | **#5–6** đăng nhập đúng → vào không gian | **This endpoint** success |
| | **#7** hết phiên sau đó | Consumer: 401 trên API khác |
| | **#8** Thành công cuối | Khóa phiên mang TENANT |

### Response ↔ DB

| Wire | Source |
|------|--------|
| `user.userId` / `displayName` | `xbos_portal_user` |
| `memberships[]` | JOIN membership + `xbos_tenant_registry` |
| `accessToken` claims | Derived default membership |
| `expiresInSec` | TTL resolver (env / 86400) |

### Errors

| Condition | Code | HTTP | FE (SRS) |
|-----------|------|------|----------|
| Missing/invalid credentials shape | validation / `XBOS-AUTH-401` | 400/401 | Diễn biến #2 |
| Bad password / inactive | `XBOS-AUTH-401` | 401 | #3/#4 |
| No memberships | `XBOS-AUTH-403` | 403 | Liên hệ quản trị |

### FE after 2xx

Lưu token; nếu ≥2 tư cách có thể mở picker; F5 dùng Bearer → Endpoint B.

---

## 2. Endpoint B — Session me (supporting AUTH)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/xbos/auth/me` |
| Success | HTTP 200 · **`XBOS-AUTH-200`** |
| Auth | Bearer required |

### Mục đích

Tải lại **user + memberships** từ phiên hiện tại (F5 / hydrate AuthContext) — không đổi JWT claims.

### Nghiệp vụ xử lý

1. Parse Bearer → `userId` (`sub`); thiếu → `XBOS-AUTH-401`.
2. `listAccessible` + load `display_name` từ `xbos_portal_user`.
3. Return `{ user, memberships }` (memberships có thể `[]` sau revoke — FE xử lý empty).

### Bước SRS

| UC / FR | Diễn biến | API role |
|---------|-----------|----------|
| FR-XBOS-AUTH-01 | #7 hết phiên / hydrate | **This endpoint** khi còn token |
| FR-XBOS-TENANT-01 | #2 xem danh sách (kèm C) | Supporting |

### Response ↔ DB

| Wire | Source |
|------|--------|
| `user.*` | `xbos_portal_user` |
| `memberships[]` | Same as login list |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Missing/invalid Bearer | `XBOS-AUTH-401` | 401 |

### FE after 2xx

Bind user + dropdown tư cách; không toast bắt buộc.

---

## 3. Endpoint C — List accessible tenants (FR-XBOS-TENANT-01)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/xbos/tenant-scope/accessible` |
| Success | HTTP 200 · **`XBOS-TENANT-200`** |
| Auth | Bearer (runtime) |
| Query | optional `userId` (internal/admin patterns — portal dùng JWT sub) |
| OpenAPI | `operationId: tenantScopeAccessible` |

### Mục đích

Liệt kê **tư cách đơn vị được cấp** để Global filter / màn chọn membership — không lộ tenant ngoài danh sách.

### Nghiệp vụ xử lý

1. Resolve caller `userId` từ JWT (hoặc query khi policy cho phép).
2. SQL JOIN `xbos_user_tenant_membership` × `xbos_tenant_registry` (`status=active` cả hai).
3. Map → `AccessibleTenant[]`; sort master trước, rồi `name`.
4. Empty array = **hợp lệ** (Diễn biến #3) — không 500.

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| UC-XBOS-TENANT-01 / FR-XBOS-TENANT-01 | **#1** hết phiên | 401 upstream |
| | **#2** xem danh sách | **This endpoint** |
| | **#3** danh sách rỗng | `data: []` |

### Response ↔ DB

| Wire | Source |
|------|--------|
| `tenantId`, `roleCode` | membership |
| `name`, `shortName`, `tenantKind`, `companyId` | tenant registry |
| `isMaster` | derived |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Unauthorized | `XBOS-AUTH-001` / `XBOS-AUTH-401` | 401 |

### FE after 2xx

Render picker / badge options; empty → hướng dẫn liên hệ quản trị.

---

## 4. Endpoint D — Select membership (FR-XBOS-TENANT-01) **PRIMARY mutate phiên**

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/xbos/auth/select-membership` |
| Success | HTTP **201** · **`XBOS-AUTH-201`** |
| Auth | Bearer |
| Body | `SelectMembershipRequest`: `{ tenantId: string }` (required, minLength 1) |
| OpenAPI | `operationId: xbosAuthSelectMembership` · schemas **CLOSED** (G-OA-02) |

### Mục đích

Gắn **một tư cách đơn vị** vào phiên bằng JWT re-issue — khóa mang `tenantId`/`companyId` cho mọi API nghiệp vụ sau đó.

### Nghiệp vụ xử lý

1. Bearer → `userId`; thiếu → `XBOS-AUTH-401`.
2. Validate `tenantId` non-empty.
3. `listAccessible`; find case-insensitive `tenantId` match.
4. Không match → `XBOS-AUTH-403` «Membership không thuộc tài khoản hiện tại».
5. Ký JWT mới với claims của membership khớp; cùng TTL login.
6. Return `accessToken`, `expiresInSec`, `membership`, `memberships`, `defaultTenantId`, `defaultCompanyId`.
7. **Không** UPDATE DB membership row (chỉ đổi phiên).

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| UC-XBOS-TENANT-01 / FR-XBOS-TENANT-01 | **#4** tư cách lạ | `XBOS-AUTH-403` |
| | **#5** xác nhận hợp lệ | **This endpoint** |
| | **#6** đổi tư cách (≥2) | Gọi lại endpoint → nạp phạm vi |
| | **#7** Thành công cuối | Badge + khóa đơn vị |

### Response ↔ DB

| Wire | Source |
|------|--------|
| `membership` / `memberships` | Same JOIN as C |
| `accessToken` | New JWT (no row write) |

### Errors

| Condition | Code | HTTP | FE |
|-----------|------|------|-----|
| Validation empty tenantId | class-validator | 400 | Inline |
| No Bearer | `XBOS-AUTH-401` | 401 | Login lại |
| tenantId not in list | `XBOS-AUTH-403` | 403 | Chọn lại |

### FE after 2xx

Thay token; refresh Global filter + dữ liệu theo tư cách; F5 giữ membership đã chọn.

---

## 5. Endpoint E — ECO scope contract (FR-ECO-SCOPE-02) **cross-cutting**

> Không phải một HTTP path duy nhất. Đây là **hợp đồng phạm vi** áp trên mọi API nghiệp vụ XBOS/HRM sau khi có JWT từ A/D.

### Identity (enforcement surface)

| Item | Value |
|------|--------|
| Mechanism | `resolveScopeContext(authorization, { tenantId, companyId })` (+ module-specific group gates) |
| Illustrative group paths | `GET /api/xbos/tenant-scope/group-org-overview` · `GET …/group-member-units` → `XBOS-TENANT-200` / **`XBOS-TENANT-403`** |
| Success (in-scope business) | 200 + data hoặc empty trung thực |
| Fail out-of-scope | **409** `SCOPE_CONTEXT_MISMATCH` · **403** `XBOS-TENANT-403` |

### Mục đích

Đảm bảo mọi danh sách / chi tiết / mutate **chỉ** trong phạm vi tư cách đang gắn phiên — thành viên không xem rollup tập đoàn khi không được cấp.

### Nghiệp vụ xử lý

1. Đọc JWT claims `tenantId` / `companyId` (và `roleCode` khi group).
2. Chuẩn hoá portal echo `x-tenant-id=main` khi JWT master (`normalizePortalScopeRequest`).
3. Nếu request tenant/company **khác** claim → **409** `SCOPE_CONTEXT_MISMATCH` (không remap im lặng).
4. Group endpoints: yêu cầu master membership hoặc JWT group CEO trên master — else **403**.
5. Trong phạm vi + zero rows → **200 empty** (không 500).

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| UC-ECO-SCOPE-02 / FR-ECO-SCOPE-02 | **#1** hết phiên | 401 |
| | **#2** mở danh sách + lọc phạm vi | Consumer APIs + resolver |
| | **#3** thành viên xin rollup tập đoàn | 403/409 — FE ẩn |
| | **#4** sửa ngoài đơn vị | 403/409 |
| | **#5–6** trong phạm vi có/không dữ liệu | 200 data / empty |
| | **#7** Thành công cuối | Scope ổn định |

### Response ↔ DB

N/A (cross-cutting) — mỗi module bind bảng riêng; auth slice chỉ khóa claims + membership store (§ DB_DESIGN).

### Errors

| Condition | Code | HTTP | FE |
|-----------|------|------|-----|
| Missing tenant/company | `SCOPE_TENANT_REQUIRED` / `SCOPE_COMPANY_REQUIRED` | 400 | — |
| Mismatch token vs request | `SCOPE_CONTEXT_MISMATCH` | 409 | Không đổi im lặng đơn vị |
| Member on group API | `XBOS-TENANT-403` | 403 | Diễn biến #3 |
| Unauthorized | `XBOS-AUTH-001` / 401 | 401 | Login |

### FE after 2xx (consumer)

Sidebar / Global filter chỉ data trong phạm vi; empty hợp lệ; UF-XBOS-11.

### Residual (execution — không block U71 F.1)

| ID | Note | Owner |
|----|------|-------|
| **G-SCOPE-01** | Parity list↔get-by-id khi Dev chạm module | `dev-be` on-touch |
| Login OpenAPI body schema depth | Path exists; requestBody components optional P2 | `dev-be` optional |

---

## 6. Envelope & code cheat-sheet

| Code | HTTP | Endpoint |
|------|------|----------|
| `XBOS-AUTH-200` | 200 | login · me |
| `XBOS-AUTH-201` | 201 | select-membership |
| `XBOS-AUTH-401` | 401 | bad credentials / unauthorized |
| `XBOS-AUTH-403` | 403 | no membership / tenant not owned |
| `XBOS-TENANT-200` | 200 | accessible · group reads |
| `XBOS-TENANT-403` | 403 | group gate |
| `SCOPE_CONTEXT_MISMATCH` | 409 | ECO scope |

---

## 7. Non-goals / must_keep

- **must_keep:** API pairs RACI · Workflow · Catalog-gov · KPI — không đè.
- **must_keep:** G-OA-02 / G-DTO-01 select-membership OpenAPI **CLOSED**.
- **must_keep:** JWT TTL 86400 parity `expiresInSec` === `exp−iat`.
- **Cấm:** Fake login/membership trong evidence UAT (U65).
- **Cấm:** Đổi password hashing / IdP trong wave design này.
- **Out of scope API:** password reset, refresh-token rotation, HRM-only login.

---

## 8. Traceability

| Artifact | Path |
|----------|------|
| DB_DESIGN | `docs/xbos/DB_DESIGN_XBOS_AUTH_TENANT.md` |
| TechSpec | `docs/xbos/TECHSPEC.md` §14.1–14.3 |
| SRS khách | `docs/client-delivery/xbos/SRS_XBOS_KHACH.md` §3.1–3.3 |
| Evidence | `docs/qa/evidence/sa-u71-xbos-auth-tenant-design-01-20260727.md` |
