# API_DESIGN — HRM Admin (FR-HRM-02..05)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-ADMIN-DESIGN-01` · **ADD** `SA-HRM-ADM-AUDIT-DESIGN-01` (G-ADM-01 FR-05 audit write) · **ADD** `BA-HRM-ADM-INVITE-04` (G-ADM-04 temp password policy) |
| **change_mode** | ADD · preserve_default |
| **ref_srs** | khách `SRS_HRM_KHACH.md` **§3.24–3.27** FR-HRM-02..05 · **NFR-HRM-04** · team UC-HRM-02..05 |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§16.2** rows 24–27 · codes `HRM-ADMIN-201..204` |
| **ref_db** | `docs/hrm/DB_DESIGN_HRM_ADMIN.md` (incl. **`admin_audit_logs`** §5) |
| **OpenAPI** | **CLOSED** deepen `BE-HRM-OA-ADMIN-01` — `hrm-api.yaml` 1.3.5-admin-f1 · FR-02..05 F.1 — **cấm** reopen; audit write deepen = `BE-HRM-ADM-AUDIT-01` |
| **Template** | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` (Mục đích · Nghiệp vụ · Bước SRS) |
| **U71** | F.1-complete physical API for Admin FR-02..05 before Dev deepen |
| **Date** | 2026-07-27 |
| **Runtime** | `HrmAdminController` · `HrmAdminService` |
| **Base path** | `/api/hrm/admin` |

> **must_keep:** Fleet · OP · W2 · Payroll · Leave · ATT · XBOS Auth/Tenant (JWT cite) · RACI/WF/catalog-gov/KPI — **không** rewrite. U65 no-seed.  
> **Wire codes SoT:** TechSpec `HRM-ADMIN-201..204` (team `HRM-OK-*` = alias residual **G-ADM-CODE-01**).  
> **Cấm:** seed admin/membership để pass UF · Phase1/PROD claim · plaintext password in logs/response.

---

## 0. Endpoint map

| § | Method / path | Success code | Primary SRS | TechSpec |
|---|----------------|--------------|-------------|----------|
| **A** | `POST /api/hrm/admin/platform-admin` | `HRM-ADMIN-201` | **FR-HRM-02** | Required ALIGNED |
| **B** | `POST /api/hrm/admin/company-admin` | `HRM-ADMIN-202` | **FR-HRM-03** | Required ALIGNED |
| **C** | `POST /api/hrm/admin/invite-employee` | `HRM-ADMIN-203` | **FR-HRM-04** | Required ALIGNED (path singular) |
| **D** | `POST /api/hrm/admin/reset-user-password` | `HRM-ADMIN-204` | **FR-HRM-05** | Required ALIGNED (sensitive) |
| **E** | Supporting membership/companies GET/POST/PATCH/DELETE | `HRM-ADMIN-205..209` | FR-03 list/F5 helpers | Supporting — not invent as FR primary DONE |

**Cross-cite (no duplicate F.1 body):**

| Topic | Canonical |
|-------|-----------|
| Portal JWT / tenant membership | `API_DESIGN_XBOS_AUTH_TENANT` · `DB_DESIGN_XBOS_AUTH_TENANT` |
| Soft employee link | `API_DESIGN_HRM_EMPLOYEES` / `DB_DESIGN_HRM_EMPLOYEES` |
| Scope ladder standing | G-SCOPE-01 on-touch for any list that filters by company |

### 0.1 Common contract

| Item | Value |
|------|--------|
| Auth | Bearer JWT (internal verify) — missing → `HRM-AUTH-001` |
| Privilege | `roleCode` ∈ `platform_admin` \| `group_ceo` **OR** row in `platform_admins` — else `HRM-AUTH-002` |
| Invite exception | Service-role token = `INTERNAL_API_KEY` / `HRM_INTERNAL_API_KEY` may skip platform-admin assert |
| Envelope | Nest `ok(data, code, message)` |
| Password policy (DTO) | `@MinLength(8)` on create/reset password fields |
| Invite temp password | **G-ADM-04 CLOSED** — CSPRNG ≥12 · charset §C.1 · **cấm** literal `12345678` · evidence `be-hrm-adm-invite-04-20260727.md` |
| Password response | Never return hash or plaintext (invite `results[]` included) |
| Empty invite list | Validation fail (class-validator / service) — FR-04 #3 |

---

## A. Endpoint — Create platform admin (FR-HRM-02)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/admin/platform-admin` |
| Success | HTTP 200 (envelope) · **`HRM-ADMIN-201`** · message `Platform admin created` |
| Auth | Bearer + platform privilege |
| Body | `{ email, password, full_name? }` — `CreatePlatformAdminDto` |
| Runtime | `createPlatformAdmin` |

### Mục đích

Cho phép quản trị nền tảng được ủy quyền **tạo hoặc cập nhật quyền (upsert grant)** tài khoản quản trị nền tảng — ghi `profiles` + `platform_admins` — để vận hành cấu hình cấp nền tảng và mở khóa UC-HRM-03.

### Nghiệp vụ xử lý

1. Validate Bearer; verify JWT → thiếu/hết phiên → `HRM-AUTH-001` (FR-02 #1).
2. `assertPlatformAdmin` — JWT role `platform_admin`/`group_ceo` **hoặc** tồn tại grant trong `platform_admins` (match `user_id` hoặc email) → else `HRM-AUTH-002` (FR-02 #1).
3. Validate body: email hợp lệ; password ≥ 8; `full_name` optional (default local-part email) — thiếu → validation 400 (FR-02 #3).
4. `findOrCreatePortalUser`: lookup `profiles` by `LOWER(email)`; nếu chưa có → INSERT `profiles` (`user_id` UUID mới, `password_hash` SHA-256); nếu đã có → giữ `user_id` (không bắt buộc đổi mật khẩu trên nhánh đã tồn tại).
5. UPSERT `platform_admins` on `user_id` — set email lower + `granted_by='Platform Admin'` (**SoT BR-ADM-02-UPSERT-01** — idempotent; **không** `409` / `HRM-ERR-CONFLICT` khi email đã có grant).
6. Return `{ success: true, user_id }` — **không** trả password. Message có thể «created» dù nhánh cập nhật grant (alias `G-ADM-CODE-01`).
7. FE sau 2xx: thông báo thành công; F5 danh sách (khi có list UI) vẫn thấy grant (FR-02 #6/#7/#8).

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-02** / UC-HRM-02 | **#1** Auth / ngoài quyền | Guard `HRM-AUTH-001/002` |
| 2 | | **#2** Mở form tạo | FE — precondition |
| 3 | | **#3** Thiếu bắt buộc | DTO validation |
| 4 | | **#4** Email đã có quyền nền tảng | **UPSERT grant** → 2xx `HRM-ADMIN-201` (SoT; ~~G-ADM-03~~ **CLOSED**) |
| 5 | | **#5** Vai trò sai | Residual — body không nhận role catalog field |
| 6 | | **#6** Lưu thành công | **This endpoint** write (tạo mới hoặc cập nhật grant) |
| 7 | | **#7** Tải lại trang | FE + optional §E list |
| 8 | | **#8** Thành công cuối | `HRM-ADMIN-201` + `user_id` |

### Request ↔ DB

| Wire | DB |
|------|-----|
| `email` | `profiles.email` · `platform_admins.email` (lower) |
| `password` | `profiles.password_hash` (hash only) |
| `full_name` | `profiles.full_name` |
| `user_id` (response) | `profiles.user_id` / `platform_admins.user_id` |

### Errors

| Condition | Code | HTTP | FE (SRS) |
|-----------|------|------|----------|
| No/invalid Bearer | `HRM-AUTH-001` | 401 | #1 |
| Not platform admin | `HRM-AUTH-002` | 403 | #1 |
| Invalid email / short password | validation | 400 | #3 |
| Email đã có grant / profile | *(không lỗi)* | **2xx** | #4 upsert — **cấm** expect `409` `HRM-ERR-CONFLICT` |

### Policy lock (G-ADM-03)

| Item | Value |
|------|--------|
| **Decision** | **KEEP UPSERT** (idempotent platform-admin grant) |
| **Rejected alt** | Hard-fail `409` khi trùng email |
| **Rationale** | Khớp runtime `ON CONFLICT DO UPDATE`; parity FR-HRM-03 «created or updated»; email trùng = làm mới quyền, không phải lỗi nghiệp vụ mặc định |
| **AC** | `AC-ADM-02-UPSERT-01..03` · `BR-ADM-02-UPSERT-01` (`docs/hrm/SRS.md` UC-HRM-02 · khách §3.24) |
| **Code change** | **Không** — policy-as-upsert CLOSED |
| **BA evidence** | `docs/qa/evidence/ba-hrm-adm-conflict-01-20260727.md` |

---

## B. Endpoint — Create / update company admin (FR-HRM-03)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/admin/company-admin` |
| Success | **`HRM-ADMIN-202`** · `Company admin created or updated` |
| Auth | Bearer + platform privilege |
| Body | `{ email, password, full_name?, company_id, role? }` — `CreateCompanyAdminDto` |
| Runtime | `createCompanyAdmin` |

### Mục đích

Gán hoặc cập nhật **quản trị doanh nghiệp** cho một đơn vị đích — tạo/khôi phục `profiles` và UPSERT `user_company_memberships` với `role` quản trị — để HCNS đơn vị vận hành và mở khóa mời nhân viên (UC-HRM-04).

### Nghiệp vụ xử lý

1. Auth + `assertPlatformAdmin` (FR-03 #1).
2. Validate: email, password ≥ 8, `company_id` present — DTO `@IsString` `@IsNotEmpty` `@MaxLength(64)` (TEXT Plane B · **G-ADM-DTO-01 CLOSED** `BE-HRM-ADMIN-DTO-01`).
3. `findOrCreatePortalUser` → `user_id` (+ `is_existing_user` flag).
4. UPSERT membership `(user_id, company_id)`: `role = payload.role ?? 'admin'`, `status='active'`, email/full_name sync, `invited_by='Platform Admin'`.
5. Return `{ success, user_id, is_existing_user }` — không plaintext password.
6. **Phạm vi SoT (G-ADM-SCOPE-01 CLOSED — Option A):** chỉ caller **platform** (`assertPlatformAdmin`). Non-platform → `HRM-AUTH-002` **403**. **Không** gọi `resolveHrmListScope` trên mutate này; platform đã có phạm vi mọi đơn vị đích hợp lệ. Mở `company_admin` + membership filter = CR / Option B — **HOLD**.
7. FE sau 2xx + F5: dòng membership còn (FR-03 #6/#7/#8).

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-03** / UC-HRM-03 | **#1** Auth | Guard |
| 2 | | **#2** Chọn đơn vị | Body `company_id` |
| 3 | | **#3** Ngoài phạm vi | **Platform gate** — non-platform → `HRM-AUTH-002` (SoT Option A; ~~G-ADM-SCOPE-01~~) |
| 4 | | **#4** Thiếu bắt buộc | DTO validation |
| 5 | | **#5** Trùng gán cấm | Runtime **upsert** (công bố cập nhật — khớp TechSpec «created or updated») |
| 6 | | **#6** Lưu thành công | **This endpoint** |
| 7 | | **#7** F5 | FE + §E list |
| 8 | | **#8** Thành công cuối | `HRM-ADMIN-202` |

### Policy lock (G-ADM-SCOPE-01)

| Item | Value |
|------|--------|
| **Decision** | **Option A — KEEP platform-only** |
| **Rejected alt** | Option B — cho `company_admin` gọi + `resolveHrmListScope` trên `company_id` |
| **Rationale** | Khớp runtime `assertPlatformAdmin`; ADR ladder (`resolveHrmListScope`) áp dụng **list/ops** FR-SCOPE, không invent persona admin hẹp trên FR-02..05; không nhân bản matrix CEO/HRBP |
| **AC** | `AC-ADM-SCOPE-01..03` · `BR-ADM-SCOPE-01` (`docs/hrm/SRS.md` UC-HRM-03) |
| **Code change** | **Không** — policy CLOSED |
| **BA evidence** | `docs/qa/evidence/ba-hrm-adm-scope-01-20260727.md` |
| **HOLD** | CR mở caller `company_admin` / membership scope → WI Option B riêng |

### Request ↔ DB

| Wire | DB |
|------|-----|
| `company_id` | `user_company_memberships.company_id` **TEXT** |
| `role` | `user_company_memberships.role` (default `admin`) |
| `email` / `full_name` / `password` | `profiles` + membership email/name |
| `is_existing_user` | Derived from profile lookup |

### Errors

| Condition | Code | HTTP | FE (SRS) |
|-----------|------|------|----------|
| Auth / privilege (incl. non-platform = ngoài phạm vi SoT) | `HRM-AUTH-001/002` | 401/403 | #1 · **#3** |
| Empty / overlong `company_id` | validation | 400 | #4 · slug + UUID-as-text OK |

---

## C. Endpoint — Invite employees batch (FR-HRM-04)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/admin/invite-employee` |
| Success | **`HRM-ADMIN-203`** · `Employee invitation batch processed` |
| Auth | Bearer + platform privilege **OR** service-role API key token |
| Body | `{ company_id, employees: [{ email, full_name?, employee_id? }] }` |
| Runtime | `inviteEmployees` |
| Path note | TechSpec/runtime singular; team SRS table `invite-employees` → **G-ADM-PATH-01** |

### Mục đích

Xử lý **lô mời nhân viên** theo đơn vị — mỗi dòng có kết quả thành công/lỗi riêng — tạo/khôi phục tài khoản + membership `role=employee` (soft `employee_id` khi có) mà **không** dừng cả lô khi một dòng lỗi.

### Nghiệp vụ xử lý

1. Bearer required; if token ≠ internal API key → `assertPlatformAdmin` (FR-04 #1). Non-platform không service-role → `HRM-AUTH-002` (~~G-ADM-SCOPE-01~~ Option A CLOSED — không `resolveHrmListScope`).
2. Validate array present; empty → validation / reject (FR-04 #3).
3. For **each** employee:
   - Missing email → `{ success:false, error:'No email provided' }` (FR-04 #4 class).
   - **New profile only:** generate **temporary password** per **§C.1** (CSPRNG) → `findOrCreatePortalUser(email, tempPassword, fullName)` → store **hash only**.
   - **Existing profile:** membership UPSERT only — **do not** overwrite `password_hash` with a new temp (**BR-ADM-04-TEMP-PWD-02**).
   - UPSERT membership: `role='employee'`, soft `employee_id`, `invited_by='Email Invite'`, `status='active'`.
   - On exception → per-row `{ success:false, error }` — continue loop (FR-04 #4/#5/#6).
4. Aggregate `{ success:true, total, invited, failed, results[] }` (FR-04 #7/#8) — **no** password fields on envelope or per-row result (**AC-ADM-04-TEMP-02**).
5. **HOLD / non-goal:** email outbox, invite token table, accept-invite state machine, one-time plaintext reveal in API body — **không** claim FR-04 «kênh đã cấu hình» / «chờ chấp nhận» as DONE this wave.
6. **Không** tạo `employees` row giả khi chỉ mời tài khoản (khớp SRS quy tắc — chỉ soft link nếu `employee_id` cung cấp).

### C.1 Policy lock — Temporary password on invite create (**G-ADM-04** · `BA-HRM-ADM-INVITE-04`)

> **Status:** **CLOSED** `BE-HRM-ADM-INVITE-04` — runtime CSPRNG §C.1 · hash-only · no plaintext on wire · evidence `be-hrm-adm-invite-04-20260727.md`.

| Rule ID | Normative value |
|---------|-----------------|
| **BR-ADM-04-TEMP-PWD-01** | **Cấm** hardcoded / fixed temporary password (incl. `12345678`, empty, or predictable sequence). |
| **BR-ADM-04-TEMP-PWD-02** | Generate only when creating a **new** portal profile; existing profile → membership path only (no password mutate). |
| **BR-ADM-04-TEMP-PWD-03** | Generator = **CSPRNG** (Node `crypto.randomBytes` / equivalent) — not `Math.random`, not clock-based. |
| **BR-ADM-04-TEMP-PWD-04** | Length **≥ 12** characters. |
| **BR-ADM-04-TEMP-PWD-05** | Charset: mix of uppercase `A–Z`, lowercase `a–z`, digits `0–9`; must include **≥1 letter** and **≥1 digit**. Optional symbols from `!@#$%^&*-_=+` only (no whitespace / quotes). |
| **BR-ADM-04-TEMP-PWD-06** | Persist via existing hash path (`profiles.password_hash`) — same algorithm as FR-02/03/05 create/reset. |
| **BR-ADM-04-TEMP-PWD-07** | Response / logs / FE toast: **never** plaintext or hash. Prefer **no** one-time delivery channel in API body. |
| **BR-ADM-04-TEMP-PWD-08** | **HOLD:** email outbox · invite accept SM · pending membership status invent. Credential handoff after create = FR-05 reset (admin) or future CR for outbox — not this WI. |

**AC (BE / QA contract):**

| AC | Pass when |
|----|-----------|
| **AC-ADM-04-TEMP-01** | Source of `inviteEmployees` (and unit test of generator) has **zero** literal `12345678` as invite password. |
| **AC-ADM-04-TEMP-02** | Successful `HRM-ADMIN-203` body / `results[]` contain **no** `password`, `temp_password`, `plainPassword`, or equivalent secret field. |
| **AC-ADM-04-TEMP-03** | Two consecutive invites for **new** distinct emails → stored password hashes **differ** (not same fixed secret). |
| **AC-ADM-04-TEMP-04** | Re-invite existing email → membership success path; `password_hash` **unchanged** vs before call. |
| **AC-ADM-04-TEMP-05** | Jest/unit: generated string length ≥12 and matches charset rules (§C.1). |

**Sibling note:** `upsertCompanyMembership` fixed temp **CLOSED** `BE-HRM-ADM-UPSERT-PWD-01` — same `generateInviteTempPassword` factory for **new** profiles only · evidence `be-hrm-adm-upsert-pwd-01-20260727.md`. `createCompanyAdmin` / `createPlatformAdmin` keep **client-supplied** `payload.password` (not a fixed temp).

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-04** / UC-HRM-04 | **#1** Auth / quyền ĐV | Guard / service-role |
| 2 | | **#2** Nhập danh sách | Body `employees[]` |
| 3 | | **#3** Danh sách rỗng | Validation |
| 4 | | **#4** Email sai | Per-row fail |
| 5 | | **#5** Đã là thành viên | Upsert reactivates — may count success (**document**; stricter reject = residual) |
| 6 | | **#6** Dòng hợp lệ ghi lời mời | New user: CSPRNG temp → hash · Membership UPSERT (**§C.1**) |
| 7 | | **#7** Xem kết quả lô | Response `results[]` — **no** password echo |
| 8 | | **#8** Thành công cuối | `HRM-ADMIN-203` |

### Request ↔ DB

| Wire | DB |
|------|-----|
| `company_id` | `user_company_memberships.company_id` TEXT |
| `employees[].email` | profiles + membership |
| `employees[].employee_id` | soft `user_company_memberships.employee_id` |
| *(generated temp — never on wire)* | `profiles.password_hash` only (new profile) |
| `results[]` | Derived per iteration (no batch table; **no** secret fields) |

### Errors

| Condition | Code | HTTP | FE (SRS) |
|-----------|------|------|----------|
| Auth | `HRM-AUTH-001/002` | 401/403 | #1 |
| Empty/invalid body | validation | 400 | #3 |
| Per-row fail | still **203** envelope with `results[].success=false` | 200 | #4/#5/#7 |

---

## D. Endpoint — Reset sensitive credentials (FR-HRM-05)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/admin/reset-user-password` |
| Success | **`HRM-ADMIN-204`** · `User credential updated` |
| Auth | Bearer + platform privilege |
| Body | `{ user_id, new_password?, new_email? }` — at least one of password/email (ValidateIf) |
| Runtime | `resetUserPassword` (+ **INSERT** `admin_audit_logs` — `BE-HRM-ADM-AUDIT-01`) |
| `ref_db` | `DB_DESIGN_HRM_ADMIN.md` §1 `profiles` · §5 **`admin_audit_logs`** |

### Mục đích

Cho phép quản trị có quyền **cập nhật thông tin nhạy cảm** (mật khẩu và/hoặc email) của tài khoản đích — cập nhật `profiles` và cascade email sang memberships/platform_admins — **ghi nhật ký append-only** (`admin_audit_logs`) theo **FR-HRM-05** / **NFR-HRM-04** — **không** lộ bí mật trên UI/log/response.

### Nghiệp vụ xử lý

1. Auth + `assertPlatformAdmin` (FR-05 #1/#3 privilege class) — capture `actor_sub` = JWT `sub`; resolve optional `actor_user_id` when `sub` matches `profiles.user_id`.
2. Validate `user_id` UUID; require `new_password` (≥8) and/or `new_email`.
3. If `new_password`: `UPDATE profiles SET password_hash = sha256(...), updated_at=NOW()` WHERE `user_id` — **cấm** plaintext trong log.
4. If `new_email`: lower email → update `profiles`, all `user_company_memberships` for user, `platform_admins.email`.
5. **Audit write (bắt buộc trên success path — G-ADM-01 DESIGN READY):** `INSERT INTO admin_audit_logs` với:
   - `target_user_id` = body `user_id`
   - `actor_sub` / optional `actor_user_id`
   - `action` ∈ `{credential_password_reset | credential_email_change | credential_password_and_email}` (DB_DESIGN §5.3)
   - `outcome='success'`
   - `detail` JSONB per §5.4 (`password_changed` / `email_changed` / optional `email_after`) — **never** password or hash
   - Prefer **same DB transaction** as profile updates; if audit INSERT fails → fail request (không trả 204-success im lặng mất nhật ký)
6. Return `{ success: true }` — **never** echo password; **không** bắt buộc trả `audit_id` trên wire (internal).
7. Password strength beyond MinLength(8) / reason field — residual vs SRS #4/#5 (optional `reason` column exists for future wire).
8. Target user not found (`profiles` UPDATE `rowCount < 1`): **HTTP 404** · **`HRM-ERR-USER-NOT-FOUND`** — **G-ADM-05 CLOSED** `BE-HRM-ADM-05-01` (không silent 2xx; không INSERT audit khi thiếu profile).

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-05** / UC-HRM-05 | **#1** Auth / quyền | Guard |
| 2 | | **#2** Chọn tài khoản | Body `user_id` |
| 3 | | **#3** Ngoài phạm vi | **Platform gate** — non-platform → `HRM-AUTH-002` (SoT Option A; ~~G-ADM-SCOPE-01~~) |
| 4 | | **#4** Thiếu lý do bắt buộc | Residual (no reason field on DTO yet) |
| 5 | | **#5** Mật khẩu yếu | `@MinLength(8)` only |
| 6 | | **#6** Lưu thành công | **This endpoint** — UPDATE `profiles` (+ cascade) **và** INSERT `admin_audit_logs` |
| 7 | | **#7** Đăng nhập sau đổi | Consumer Auth cite (XBOS/HRM login planes) |
| 8 | | **#8** Thành công cuối | `HRM-ADMIN-204` · nhật ký sẵn sàng tra cứu (**G-ADM-01-READ** = GET list residual Info) |

### Request ↔ DB

| Wire | DB |
|------|-----|
| `user_id` | `profiles.user_id` · `admin_audit_logs.target_user_id` |
| `new_password` | `profiles.password_hash` only — audit `detail.password_changed=true` |
| `new_email` | `profiles.email` + memberships + platform_admins · audit `detail.email_changed` (+ optional `email_after`) |
| (JWT `sub`) | `admin_audit_logs.actor_sub` (+ soft `actor_user_id`) |

### Errors

| Condition | Code | HTTP | FE (SRS) |
|-----------|------|------|----------|
| Auth / privilege (incl. non-platform = ngoài phạm vi SoT) | `HRM-AUTH-001/002` | 401/403 | #1 · **#3** |
| Invalid body | validation | 400 | #4/#5 |
| User missing (`profiles` 0-row) | **`HRM-ERR-USER-NOT-FOUND`** | **404** | UC-HRM-05 · **G-ADM-05 CLOSED** `BE-HRM-ADM-05-01` |
| Audit INSERT fail after mutate | 5xx / transaction rollback | 500 | #6/#8 — không claim success thiếu nhật ký |

### D.1 Audit write — F.1 slice (G-ADM-01)

| Meta | Value |
|------|--------|
| **fn_service** | `resetUserPassword` → `INSERT admin_audit_logs` |
| **Mục đích** | Ghi nhận thao tác nhạy cảm để truy vết sự cố (NFR-HRM-04) và hoàn tất «ghi nhật ký» FR-05 |
| **Nghiệp vụ** | Sau UPDATE credential thành công → append-only row; cấm UPDATE/DELETE audit; cấm secret trong `detail` |
| **Bước SRS** | FR-HRM-05 Diễn biến **#6** (ghi nhận thay đổi) · **#8** (thành công / nhật ký) · team UC-HRM-05 «ghi nhật ký» |
| **Non-goal** | GET `/admin/audit-logs` list UI — **G-ADM-01-READ** Info; FR-02/03/04 audit broaden — **G-ADM-01-BROAD** Info |

---

## E. Supporting — membership / companies (storage reuse)

| Method / path | Code | Purpose | FR link |
|---------------|------|---------|---------|
| `GET /admin/companies` | `HRM-ADMIN-205` | Distinct `company_id` from memberships | FR-03 list helper |
| `GET /admin/company-memberships?company_id=` | `HRM-ADMIN-206` | List memberships (F5 evidence) | FR-03 #7 · FR-04 follow-up |
| `POST /admin/company-memberships` | `HRM-ADMIN-207` | Generic upsert membership | Adjacent to FR-03/04 |
| `PATCH /admin/company-memberships/:id` | `HRM-ADMIN-208` | Update role/status/employee link | FR-03 update path |
| `DELETE /admin/company-memberships/:id` | `HRM-ADMIN-209` | Hard delete row | SRS prefers clear status — residual harden |

**F.1 bar:** Primary DONE = §A–D. §E documented for discoverability; deepen OpenAPI + soft-delete status = Dev residual.

---

## 6. Locale / FE (U72 · U63)

| Concern | Rule |
|---------|------|
| Labels | VI trên form Quản trị |
| After 2xx | Toast/thông báo; **không** hiện mật khẩu (invite batch included — **AC-ADM-04-TEMP-02**) |
| F5 | Grant/membership vẫn còn (FR-02/03 #7) |
| Batch | Hiển thị `results[]` từng dòng (FR-04 #7) — **cấm** cột/field mật khẩu tạm |
| U65 | Cấm seed admin để có dòng list |

---

## 7. Residual summary (API)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| ~~**G-ADM-01**~~ | ~~P2~~ → **CLOSED** | `dev-be` | Physical `admin_audit_logs` + FR-05 write F.1 — **CLOSED** `BE-HRM-ADM-AUDIT-01` · evidence `be-hrm-adm-audit-01-20260727.md` · design `sa-hrm-adm-audit-design-01-20260727.md` |
| **G-ADM-01-READ** | Info | `dev-be` optional | GET audit list UI — non-goal this WI |
| ~~**G-ADM-03**~~ | ~~P2~~ | `ba` | **CLOSED** `BA-HRM-ADM-CONFLICT-01` — SoT **KEEP UPSERT**; #4 ≠ 409 · evidence `ba-hrm-adm-conflict-01-20260727.md` |
| ~~**G-ADM-04**~~ | ~~P2~~ → **CLOSED** | `dev-be` | Temp password CSPRNG §C.1 — **CLOSED** `BE-HRM-ADM-INVITE-04` · **HOLD** email outbox / accept-invite SM · evidence `be-hrm-adm-invite-04-20260727.md` · design `ba-hrm-adm-invite-04-20260727.md` |
| ~~**G-ADM-DTO-01**~~ | ~~P2~~ | `dev-be` | **CLOSED** `BE-HRM-ADMIN-DTO-01` — company_id TEXT MaxLength(64); user_id reset `@IsUUID` · evidence `be-hrm-admin-dto-01-20260727.md` |
| ~~**G-ADM-SCOPE-01**~~ | ~~P2~~ | `ba` | **CLOSED** `BA-HRM-ADM-SCOPE-01` — SoT **Option A platform-only**; Diễn biến #3 = `HRM-AUTH-002`; **không** `resolveHrmListScope` · evidence `ba-hrm-adm-scope-01-20260727.md` |
| ~~**G-ADM-05**~~ | ~~P2~~ → **CLOSED** | `dev-be` | Reset when user missing → **404** `HRM-ERR-USER-NOT-FOUND` — **CLOSED** `BE-HRM-ADM-05-01` · evidence `be-hrm-adm-05-01-20260727.md` |
| **G-ADM-PATH-01** / **G-ADM-CODE-01** | Info | `ba` optional | Path/code alias docs |
| ~~OpenAPI admin paths~~ | ~~P2~~ | `dev-be` | **CLOSED** `BE-HRM-OA-ADMIN-01` — F.1 Mục đích·Nghiệp vụ·Bước SRS + slug examples · evidence `be-hrm-oa-admin-01-20260727.md` |
| ~~SA-U71-HRM-IMPORT-PREVIEW-DESIGN-01~~ | ~~P3~~ | `sa` | **DONE** → `API_DESIGN_HRM_IMPORT_PREVIEW` · evidence `sa-u71-hrm-import-preview-design-01-20260727.md` |

---

## 8. must_keep

- Cite XBOS Auth/Tenant for portal JWT — do not redefine login tables here.
- Do not wipe Fleet/OP/W2/Payroll/Leave/ATT or XBOS RACI/WF/catalog-gov/KPI API pairs.
- Soft `employee_id` only — Employees CRUD pair remains SoT for hồ sơ NV.

**Pointer:** `docs/tech-spec/API_DESIGN_HRM_ADMIN.md` → this file.
