# DB_DESIGN — HRM Admin (platform / company / invite / credentials)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-ADMIN-DESIGN-01` · **ADD** `SA-HRM-ADM-AUDIT-DESIGN-01` (G-ADM-01 physical) |
| **change_mode** | ADD · preserve_default |
| **ref_srs** | khách `docs/client-delivery/hrm/SRS_HRM_KHACH.md` **§3.24–3.27** FR-HRM-02 · FR-HRM-03 · FR-HRM-04 · FR-HRM-05 · **NFR-HRM-04** · team `docs/hrm/SRS.md` UC-HRM-02..05 |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§16.2** rows 24–27 · **§17.1** `platform_admins` · `user_company_memberships` · `profiles` · residual **G-ADM-01** |
| **ref_api** | `docs/hrm/API_DESIGN_HRM_ADMIN.md` |
| **ref_align** | UUID `user_id` HRM credential plane · TEXT `company_id` membership · soft `employee_id` · cite XBOS Auth/Tenant JWT (must_keep — **không** rewrite) |
| **Template** | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` |
| **U71** | Physical DB before Dev claim on Admin FR-02..05 |
| **Date** | 2026-07-27 |
| **Runtime ensure** | `HrmAdminService.ensureAdminSchema` (`CREATE TABLE IF NOT EXISTS` + unique index) — **BE-HRM-ADM-AUDIT-01** extends with `admin_audit_logs` |

> **must_keep:** Do **not** rewrite Fleet · Operations · W2 slice · Payroll · Leave · ATT · XBOS Auth/Tenant · RACI · WF · catalog-gov · KPI pairs. U65 honest empty; no seed for nghiệm thu.  
> **Out of scope this slice:** Inbox notifications · Metadata queue · XBOS `xbos_portal_user` / `xbos_user_tenant_membership` DDL (cite only).  
> **Import preview (IM-01):** closed separately — cite `DB_DESIGN_HRM_IMPORT_PREVIEW` (**N/A table**) · `API_DESIGN_HRM_IMPORT_PREVIEW` · `SA-U71-HRM-IMPORT-PREVIEW-DESIGN-01`.

---

## 0. Inventory & ownership

| Store | Role | Key physical | Soft/Hard |
|-------|------|--------------|-----------|
| **`public.profiles`** | Credential + display SoT (HRM admin plane) | `user_id` **UUID** UNIQUE | Soft email lower |
| **`public.platform_admins`** | Platform privilege grant (FR-02) | `user_id` **UUID** UNIQUE | Soft → profiles |
| **`public.user_company_memberships`** | Company role / invite link (FR-03/04) | `id` UUID · `(user_id, company_id)` UK | Soft `employee_id` → employees; **TEXT** `company_id` |
| **`public.admin_audit_logs`** | Sensitive credential audit (FR-05 · NFR-HRM-04) | `id` UUID · append-only | Soft `actor_user_id` / `target_user_id` → `profiles.user_id` · **G-ADM-01 CLOSED** (`BE-HRM-ADM-AUDIT-01`) |
| **XBOS Auth/Tenant (cite)** | Portal JWT login / tenant membership | TEXT `user_id`=email · TEXT tenant | **must_keep** `DB_DESIGN_XBOS_AUTH_TENANT` — not redefined |

```text
Caller JWT (platform_admin | group_ceo | row in platform_admins)
        │
        │ POST …/admin/platform-admin     → profiles + platform_admins
        │ POST …/admin/company-admin      → profiles + user_company_memberships (role admin)
        │ POST …/admin/invite-employee    → profiles + memberships (role employee, soft employee_id)
        │ POST …/admin/reset-user-password→ profiles (+ cascade email) + INSERT admin_audit_logs
        ▼
hrm-api  user_id UUID · company_id TEXT (membership) · password_hash SHA-256 · audit append-only
```

### 0.1 Dual credential planes (normative — do not merge in this wave)

| Plane | Owner | Identity | Design rule |
|-------|-------|----------|-------------|
| **XBOS portal** | `xbos-api` Auth/Tenant | `user_id` = email **TEXT** | JWT session for Command Center — **must_keep cite** |
| **HRM admin** | `hrm-api` Admin | `user_id` = **UUID** in `profiles` | Privileged admin mutate FR-02..05 |

**Reject:** Wiping or rewriting XBOS Auth tables to “unify” with HRM `profiles` in this design wave.  
**Reject:** Treating LE UUID as the only membership `company_id` without documenting DTO vs TEXT gap (**G-ADM-DTO-01**).  
**Reject:** Seed memberships/admins to force UF PASS (U65).

---

## 1. Table SoT — `public.profiles`

| Item | Value |
|------|--------|
| Schema | `public` |
| Table | **`profiles`** |
| Owner | `hrm-api` · `HrmAdminService` |
| Consumers | FR-HRM-02/03/04/05 · mobile/portal credential consumers that read HRM profiles (out of F.1 depth) |
| `ref_srs` | FR-02 #3/#6 · FR-05 #6/#8 |

### 1.1 Columns (physical)

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `id` | UUID PK | NO | Surrogate row | — |
| **`user_id`** | **UUID NOT NULL UNIQUE** | NO | Khóa tài khoản mang sang admin/membership/reset | FR-02 khóa · FR-05 đích |
| `email` | TEXT | YES | Email đăng nhập (normalize lower on write) | FR-02 #3/#4 · FR-05 email |
| `full_name` | TEXT | YES | Họ tên hiển thị | FR-02 input |
| `password_hash` | TEXT | YES | SHA-256(password) — **không** plaintext · FR-04 invite new user = CSPRNG temp per API §C.1 (**G-ADM-04 CLOSED**) | FR-02 cấp MK · FR-04 invite · FR-05 #6 |
| `avatar_url` | TEXT | YES | Ảnh đại diện (optional) | — |
| `phone` | TEXT | YES | SĐT (optional) | — |
| `job_title` | TEXT | YES | Chức danh hiển thị (optional) | — |
| `onboarding_completed` | BOOLEAN NOT NULL DEFAULT FALSE | NO | Cờ onboarding | — |
| `created_at` / `updated_at` | TIMESTAMPTZ NOT NULL | NO | Audit | FR-05 #8 |

### 1.2 Constraints / indexes

| Name / definition | Purpose |
|-------------------|---------|
| PK `id` | Surrogate |
| UNIQUE `user_id` | One profile per account |
| Lookup | `LOWER(email)` equality in service (recommend functional unique index residual) |

**Login/hash rule (runtime):** `hashPassword` = `sha256(password)` hex — **different** from XBOS `sha256(userId:password:xevn-portal-dev)` — do not claim cross-plane password reuse without BA/SA unify wave.

---

## 2. Table SoT — `public.platform_admins`

| Item | Value |
|------|--------|
| Schema | `public` |
| Table | **`platform_admins`** |
| Owner | `hrm-api` · `HrmAdminService.createPlatformAdmin` / `assertPlatformAdmin` |
| `ref_srs` | **FR-HRM-02** #6/#8 |

### 2.1 Columns (physical)

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `id` | UUID PK | NO | Surrogate | — |
| **`user_id`** | **UUID NOT NULL UNIQUE** | NO | Soft → `profiles.user_id` | FR-02 khóa tài khoản |
| `email` | TEXT NOT NULL | NO | Email grant (lower) | FR-02 #3/#4 |
| `granted_at` | TIMESTAMPTZ NOT NULL DEFAULT NOW() | NO | Thời điểm cấp quyền | Audit |
| `granted_by` | TEXT | YES | Ai cấp (runtime string e.g. `Platform Admin`) | Audit soft |

### 2.2 Constraints / indexes

| Name / definition | Purpose |
|-------------------|---------|
| UNIQUE `user_id` | One platform grant per user — `ON CONFLICT DO UPDATE` email/granted_by |
| Assert path | `user_id::text = JWT.sub` **OR** `LOWER(email) = LOWER(JWT.sub)` |

**Privilege gate:** Caller JWT `roleCode` ∈ `{platform_admin, group_ceo}` **OR** row exists in `platform_admins` → else `HRM-AUTH-002` (FR-02 #1).

**SoT vs Diễn biến #4:** Runtime upserts on conflict — **không** hard-fail `HRM-ERR-CONFLICT`. Policy **KEEP UPSERT** — ~~G-ADM-03~~ **CLOSED** (`BA-HRM-ADM-CONFLICT-01`).

---

## 3. Table SoT — `public.user_company_memberships`

| Item | Value |
|------|--------|
| Schema | `public` |
| Table | **`user_company_memberships`** |
| Owner | `hrm-api` · company-admin / invite / membership CRUD helpers |
| `ref_srs` | **FR-HRM-03** #6/#8 · **FR-HRM-04** #6/#7 |

### 3.1 Columns (physical)

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `id` | UUID PK | NO | Khóa membership (PATCH/DELETE helpers) | FR-03 khóa bản ghi |
| `user_id` | UUID | YES | Soft → `profiles.user_id` (NULL allowed in DDL; UK only when NOT NULL) | FR-03/04 |
| **`company_id`** | **TEXT NOT NULL** | NO | Đơn vị membership — **TEXT** physical (Plane B family) | FR-03 #2/#3 · FR-04 đơn vị |
| `role` | TEXT NOT NULL DEFAULT `'member'` | NO | `admin` (FR-03) · `employee` (FR-04) · other | FR-03 vai trò · FR-04 |
| `email` | TEXT | YES | Email tại membership (lower) | FR-04 dòng |
| `full_name` | TEXT | YES | Họ tên tại membership | FR-04 |
| `avatar_url` | TEXT | YES | Optional | — |
| **`employee_id`** | **UUID** | YES | Soft → `employees.id` (no hard FK) | FR-04 gắn hồ sơ sẵn có |
| `invited_at` | TIMESTAMPTZ NOT NULL DEFAULT NOW() | NO | Thời điểm mời/gán | FR-04 #6 |
| `invited_by` | TEXT | YES | Nguồn (`Platform Admin` / `Email Invite` / `Admin`) | Audit soft |
| `status` | TEXT NOT NULL DEFAULT `'active'` | NO | `active` (và giá trị khác khi PATCH) | FR-03 trạng thái |
| `is_primary` | BOOLEAN NOT NULL DEFAULT FALSE | NO | Membership chính | — |
| `created_at` / `updated_at` | TIMESTAMPTZ NOT NULL | NO | Audit | FR-03 #7 F5 |

### 3.2 Constraints / indexes

| Name / definition | Purpose |
|-------------------|---------|
| **`uq_user_company_memberships_user_company`** UNIQUE `(user_id, company_id)` WHERE `user_id IS NOT NULL` | Một user / một ĐV; upsert on conflict |
| List filter | Optional `company_id = $1`; ORDER BY `created_at DESC` LIMIT 1000 |
| Soft employee | `employee_id` — **cấm** invent hard FK in this slice |

### 3.3 DTO vs physical plane (**G-ADM-DTO-01**)

| Layer | `company_id` type | Fact |
|-------|-------------------|------|
| DDL / SQL bind | **TEXT** | `CreateCompanyAdmin` / `inviteEmployees` insert TEXT |
| DTO class-validator | **`@IsString` `@MaxLength(64)`** | `CreateCompanyAdminDto` · `InviteEmployeesDto` — **G-ADM-DTO-01 CLOSED** (`BE-HRM-ADMIN-DTO-01`) |
| XBOS JWT / Fleet / Leave family | TEXT slug Plane B | must_keep Auth/Tenant + workforce pairs |

**Design stance (ADD, no rewrite siblings):** Physical SoT = **TEXT**. DTO aligned to slug/UUID-as-text (leave/fleet ladder) — **do not** invent Plane A UUID rewrite of membership DDL.

---

## 4. Supporting routes (storage reuse — not primary FR)

TechSpec §16.2 primary = four POSTs. Runtime also exposes membership list/upsert/patch/delete (`HRM-ADMIN-205..209`) on the **same** `user_company_memberships` table — document storage only; F.1 depth stays on FR-02..05 (API §E residual/supporting).

---

## 5. Table SoT — `public.admin_audit_logs` (FR-05 · NFR-HRM-04)

| Meta | Giá trị |
|------|---------|
| **Mục đích** | Nhật ký **append-only** cho thao tác cập nhật thông tin nhạy cảm tài khoản (đổi mật khẩu / email) — truy vết sự cố theo **NFR-HRM-04** và «ghi nhật ký» **UC-HRM-05** / **FR-HRM-05** |
| **Aggregate** | HRM Admin credential plane (`profiles` UUID) |
| **ref_srs** | khách **FR-HRM-05** Diễn biến **#6** (Lưu thành công) · **#8** (Thành công cuối — kiểm tra nhật ký) · **NFR-HRM-04** · team UC-HRM-05 «Else → cập nhật thành công và ghi nhật ký» |
| **ref_techspec** | `TECHSPEC.md` §16.2 row FR-HRM-05 · residual **G-ADM-01** |
| **owned_by** | `hrm-api` · `HrmAdminService.resetUserPassword` (+ future list reader) |
| **Identity plane** | HRM admin UUID `user_id` (same as `profiles`) — **không** unify XBOS TEXT portal |
| **Runtime today** | **In** `ensureAdminSchema` — **IMPLEMENTED** `BE-HRM-ADM-AUDIT-01` (CREATE + indexes + FR-05 INSERT) |
| **Template** | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` |

### 5.1 Columns (physical)

| Column | Type | Null | Default | Meaning (VI) | `ref_srs` |
|--------|------|------|---------|--------------|-----------|
| `id` | UUID | NO | `gen_random_uuid()` | PK nhật ký | — |
| `occurred_at` | TIMESTAMPTZ | NO | `NOW()` | Thời điểm ghi nhận | NFR-HRM-04 · FR-05 #6/#8 |
| **`actor_user_id`** | UUID | YES | — | Soft → `profiles.user_id` (người thực hiện) khi resolve được từ JWT | FR-05 #1 |
| `actor_sub` | TEXT | NO | — | JWT `sub` nguyên bản (UUID hoặc email text) — luôn ghi | FR-05 #1 |
| **`target_user_id`** | UUID | NO | — | Soft → `profiles.user_id` tài khoản đích | FR-05 #2 · khóa mang |
| `action` | TEXT | NO | — | Loại thao tác (enum text — §5.3) | FR-05 loại cập nhật |
| `outcome` | TEXT | NO | `'success'` | `success` (bắt buộc trên path 2xx FR-05); future `rejected` | FR-05 #6/#8 |
| `reason` | TEXT | YES | — | Lý do (optional wire — SRS #4 residual khi bắt buộc) | FR-05 #4 |
| `detail` | JSONB | YES | — | Chi tiết **không** chứa plaintext/hash mật khẩu — §5.4 | FR-05 quy tắc «không ghi log plaintext» |
| `company_id` | TEXT | YES | — | Optional Plane B slug khi caller/context có ĐV (không bắt buộc FR-05 body hôm nay) | G-ADM-SCOPE-01 future |
| `request_id` | TEXT | YES | — | Correlation (`x-request-id` nếu có) | NFR-HRM-04 |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Insert time (mirror `occurred_at` nếu không truyền) | Audit |

### 5.2 Constraints / indexes / FK

| Loại | Định nghĩa |
|------|------------|
| **PK** | `id` |
| **FK cứng** | **Không** — soft refs tới `profiles.user_id` (append-only; cấm cascade delete audit khi xóa profile) |
| **CHK `action`** | `IN ('credential_password_reset','credential_email_change','credential_password_and_email')` |
| **CHK `outcome`** | `IN ('success','rejected')` |
| **Index** `ix_admin_audit_logs_target_time` | `(target_user_id, occurred_at DESC)` — tra cứu theo tài khoản đích (FR-05 #8 «kiểm tra nhật ký») |
| **Index** `ix_admin_audit_logs_actor_time` | `(actor_user_id, occurred_at DESC)` WHERE `actor_user_id IS NOT NULL` |
| **Index** `ix_admin_audit_logs_occurred` | `(occurred_at DESC)` — quét thời gian / NFR truy vết |
| **Index** `ix_admin_audit_logs_action_time` | `(action, occurred_at DESC)` |

**Append-only rule:** Service **INSERT only**. Cấm UPDATE/DELETE từ admin mutate paths. Retention / purge = ops wave riêng (non-goal này).

### 5.3 `action` vocabulary (normative)

| `action` | Khi nào (FR-05 success path) |
|----------|------------------------------|
| `credential_password_reset` | Body có `new_password`, **không** có `new_email` |
| `credential_email_change` | Body có `new_email`, **không** có `new_password` |
| `credential_password_and_email` | Cả hai field có giá trị |

**Non-goal this table (do not invent rows for):** FR-02 platform-admin create · FR-03 company-admin · FR-04 invite — residual broaden if BA expands NFR-HRM-04 scope later (`G-ADM-01-BROAD` Info).

### 5.4 `detail` JSONB contract (no secrets)

| Key | Type | Rule |
|-----|------|------|
| `password_changed` | boolean | `true` nếu đổi MK — **cấm** `password` / `password_hash` / plaintext |
| `email_changed` | boolean | `true` nếu đổi email |
| `email_after` | string \| omit | Email **sau** đổi (lower) — allowed; không bắt buộc log email cũ |
| `rows_profiles` | number \| omit | Optional `UPDATE` rowcount (G-ADM-05 CLOSED — 0-row → 404 before audit) |

### 5.5 RLS / scope notes

| Concern | Design |
|---------|--------|
| **Write** | Only `hrm-api` after privilege assert + successful credential mutate (same TX preferred) |
| **Read** | Same gate as admin mutate: `platform_admin` \| `group_ceo` \| row in `platform_admins` — **no** member-tenant self-serve list invent in this WI |
| **RLS Postgres** | Optional later (`PLATFORM_RLS_ENABLED`) — **not** required to close G-ADM-01 design; document app-layer gate first (cite Auth must_keep) |
| **Plane** | Platform credential audit — **not** Plane B workforce list scope; do not apply `resolveHrmListScope` invent |

### 5.6 DDL sketch (Dev implement — not run in this WI)

```sql
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_user_id UUID,
  actor_sub TEXT NOT NULL,
  target_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  outcome TEXT NOT NULL DEFAULT 'success',
  reason TEXT,
  detail JSONB,
  company_id TEXT,
  request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_admin_audit_logs_action CHECK (
    action IN (
      'credential_password_reset',
      'credential_email_change',
      'credential_password_and_email'
    )
  ),
  CONSTRAINT chk_admin_audit_logs_outcome CHECK (outcome IN ('success', 'rejected'))
);
-- indexes per §5.2
```

**Password in logs:** Service continues hash-only update on `profiles` — audit `detail` never stores secrets (FR-05 quy tắc).

---

## 6. Gaps vs SRS (documented — do not invent as DONE)

| Gap | Spec says | Physical / API now | Sev |
|-----|-----------|-------------------|-----|
| ~~**G-ADM-01**~~ | Audit log completeness (NFR-HRM-04 / FR-05 nhật ký) | Table **`admin_audit_logs`** §5 + `ensureAdminSchema` + reset INSERT — **CLOSED** `BE-HRM-ADM-AUDIT-01` | ~~P2~~ → **CLOSED** |
| **G-ADM-01-READ** | FR-05 #8 «quản trị kiểm tra nhật ký (nếu có)» | No GET list F.1 invent this wave | Info |
| ~~**G-ADM-03**~~ | FR-02 #4 = upsert grant (SoT) | `ON CONFLICT DO UPDATE` — khớp policy | **CLOSED** |
| ~~**G-ADM-04**~~ | Invite cấp mật khẩu an toàn / kênh mời | Runtime CSPRNG ≥12 hash-only · **no** plaintext on wire · **HOLD** outbox/accept-SM — **CLOSED** `BE-HRM-ADM-INVITE-04` · evidence `be-hrm-adm-invite-04-20260727.md` | ~~P2~~ → **CLOSED** |
| ~~**G-ADM-SCOPE-01**~~ | FR-03/04/05 #3 ngoài phạm vi | SoT **Option A** platform-only (`assertPlatformAdmin` → 403); không `resolveHrmListScope` — **CLOSED** `BA-HRM-ADM-SCOPE-01` | ~~P2~~ → **CLOSED** |
| ~~**G-ADM-DTO-01**~~ | Đơn vị Plane B slug nhất quán | DTO TEXT MaxLength(64) · **CLOSED** `BE-HRM-ADMIN-DTO-01` | ~~P2~~ |
| **G-ADM-PATH-01** | Team SRS path `invite-employees` | Runtime/TechSpec `invite-employee` (singular) | Info |
| **G-ADM-CODE-01** | Team SRS `HRM-OK-*` | Wire envelope `HRM-ADMIN-201..204` (TechSpec SoT) | Info |
| Cross-plane auth | Unified login | HRM UUID profiles ≠ XBOS TEXT portal user | Info — cite Auth must_keep |

---

## 7. must_keep verification (this wave)

| Pair | Action |
|------|--------|
| `docs/hrm/DB_DESIGN_HRM_FLEET.md` | Untouched |
| `docs/hrm/DB_DESIGN_HRM_OPERATIONS.md` | Untouched |
| `docs/hrm/DB_DESIGN_HRM_W2_SLICE.md` | Untouched |
| Payroll / Leave / ATT | Untouched |
| `docs/xbos/DB_DESIGN_XBOS_AUTH_TENANT.md` | **Cite only** — JWT/membership SoT preserved |
| XBOS RACI / WF / catalog-gov / KPI | Untouched |
| G-ADM-DTO-01 · OpenAPI admin F.1 · G-ADM-03 | **CLOSED** — not reopened |
| `apps/**` / migration | **Not** in this WI (spec-before-code) |

---

## 8. Traceability hooks

| FR | Tables written | Primary key returned |
|----|----------------|----------------------|
| FR-HRM-02 | `profiles` + `platform_admins` | `user_id` |
| FR-HRM-03 | `profiles` + `user_company_memberships` | `user_id` (+ membership UK) |
| FR-HRM-04 | `profiles` + `user_company_memberships` (batch) | per-row email result |
| FR-HRM-05 | `profiles` (+ email cascade memberships/admins) + **`admin_audit_logs` INSERT** | `user_id` target (+ audit `id` internal) |

**Pointer:** `docs/tech-spec/DB_DESIGN_HRM_ADMIN.md` → this file.  
**Evidence (audit ADD):** `docs/qa/evidence/sa-hrm-adm-audit-design-01-20260727.md`.
