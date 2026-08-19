# DB_DESIGN — HRM Leave requests + balances

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-LEAVE-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` **§3.5 FR-HRM-AT-10** Diễn biến #4–#10 · **§3.13 FR-HRM-AT-12** · **§3.14 FR-HRM-AT-13** · delta **FR-HRM-AT-WF-01** · team `docs/hrm/SRS.md` **UC-HRM-10** |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§14.5** · **§16.1** FR-AT-10/12/13 · **§17.1** leave rows · G-DB-03 / G-AT10-01 CLOSED |
| **ref_api** | `docs/hrm/API_DESIGN_HRM_LEAVE.md` |
| **Template** | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` |
| **U71** | Physical DB slice before Dev claim on leave mutate / WF bridge |
| **Date** | 2026-07-27 |
| **Runtime ensure** | `LeaveRequestsService.ensureSchema` · `LeaveWorkflowBridge.ensureSchema` · `LeaveBalanceService.ensureSchema` (`CREATE TABLE IF NOT EXISTS`) |

> **must_keep:** `company_id` = **TEXT operating slug** (e.g. `holding`, member slug) — **not** holding legal-entity UUID as persist type. Catalog partition for `leave_type` uses `resolveHrmSettingsCatalogCompanyId` (master `main` / holding UUID → `holding`). Soft `employee_id` (no DB `REFERENCES employees`).

---

## 1. Table SoT — `public.leave_requests`

| Item | Value |
|------|--------|
| Schema | `public` |
| Table | **`leave_requests`** |
| Owner service | HRM (`hrm-api` attendance) |
| Consumers | Attendance LeaveTab · Inbox fanout · Mobile leave · LeaveWorkflowBridge · Command Center embed |

### 1.1 Columns (physical)

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `id` | UUID PK | NO | Khóa đơn nghỉ | FR-HRM-AT-10 #7 khóa mang |
| **`company_id`** | **TEXT NOT NULL** | NO | Đơn vị vận hành (slug ladder) — persist via `resolveHrmPersistCompanyIdText` | FR-HRM-AT-10 · G-AT10-01 |
| `employee_id` | UUID NOT NULL | NO | Hồ sơ NV — **soft FK** (app-enforced) | UC-HRM-10 · INT spine |
| **`leave_type`** | TEXT NOT NULL | NO | Mã loại nghỉ = **catalog code** `leave_types` (không free-text SoT) | FR-HRM-AT-10 #3 · FR-HRM-SC-LEAVE-01 |
| `start_date` | DATE NOT NULL | NO | Từ ngày | FR-HRM-AT-10 #4 |
| `end_date` | DATE NOT NULL | NO | Đến ngày | FR-HRM-AT-10 #4 |
| `reason` | TEXT | YES | Lý do | FR-HRM-AT-10 input |
| `status` | TEXT NOT NULL DEFAULT `'pending'` | NO | `pending` \| `approved` \| `rejected` \| `cancelled` | AT-10/12/13 |
| `requested_at` | TIMESTAMPTZ NOT NULL DEFAULT NOW() | NO | Thời điểm gửi | UC-HRM-10 |
| `reviewed_at` | TIMESTAMPTZ | YES | Thời điểm quyết định | AT-12/13 |
| `reviewed_by` | TEXT | YES | Tên / id người duyệt (display) | UC-HRM-10 `reviewer_name` |
| `employee_code` | TEXT | YES | Mã NV denormalized | List paint |
| `employee_name` | TEXT | YES | Tên NV denormalized | List paint |
| `department` | TEXT | YES | Phòng ban snapshot | Create DTO |
| `position` | TEXT | YES | Chức danh snapshot | Create DTO |
| `total_days` | NUMERIC NOT NULL DEFAULT 1 | NO | Số ngày (≥ 0.5 nghiệp vụ) | FR-HRM-AT-10 #6 balance |
| `handover_to` | TEXT | YES | Người bàn giao | Create optional |
| `handover_tasks` | TEXT | YES | Việc bàn giao | Create optional |
| `approver_employee_id` | UUID | YES | NV duyệt (optional) | UC-HRM-10 |
| `rejected_reason` | TEXT | YES | Lý do từ chối | FR-HRM-AT-13 #5–#6 |
| `attachment_url` | TEXT | YES | Đường dẫn file `/api/hrm/files/...` | W7-3 / FR-HRM-AT-10 đính kèm |
| **`workflow_instance_id`** | UUID | YES | Instance XBOS WF `hrm_leave_approval` | FR-HRM-AT-WF-01 #2 |

### 1.2 Constraints / indexes

| Name / definition | Purpose |
|-------------------|---------|
| `chk_leave_date_range` (`start_date <= end_date`) | Diễn biến #4 |
| `chk_leave_status` (`pending` \| `approved` \| `rejected` \| `cancelled`) | Lifecycle AT-10/12/13 |
| `idx_leave_requests_company_status` ON `(company_id, status, requested_at DESC)` | List theo scope + trạng thái |
| Soft unique (app): no overlapping `pending`/`approved` same `employee_id` + date range | Diễn biến #5 → `HRM-LEAVE-VAL-OVERLAP` |

**Cấm:** `company_id UUID` / cast `::uuid` trên persist hoặc scope match manager resolve (ADR F4 / G-AT10-01).

### 1.3 Catalog soft FK — `leave_type`

| Rule | Detail |
|------|--------|
| Catalog key | `leave_types` (`HRM_SC_LEAVE_KEY`) |
| Storage | TEXT code on row (e.g. `annual`) — **no** hard FK to catalog table |
| Assert on create | `SettingsCatalogsService.assertCodeInEffectiveCatalog` |
| Partition | `resolveHrmSettingsCatalogCompanyId(auth, tenantId, body.company_id)` — master tenant `main` / holding UUID → **`holding`** (parity Settings GET) |
| Reject | `HRM-ATT-LEAVE-TYPE` when code ∉ effective catalog |
| UI label | Catalog `label` VI (SRS_FIELD_DISPLAY F-06) — never show raw key when label known |

---

## 2. Table SoT — `public.employee_leave_balances`

| Item | Value |
|------|--------|
| Schema | `public` |
| Table | **`employee_leave_balances`** |
| Owner | HRM attendance / leave-balance |
| Role | Số dư theo dõi theo NV · loại · năm — **optional enforce** (chỉ khi có row tracked / custom_fields) |

### 2.1 Columns

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `id` | UUID PK DEFAULT `gen_random_uuid()` | NO | Khóa số dư | — |
| **`company_id`** | **TEXT NOT NULL** | NO | Slug đơn vị (cùng ladder leave_requests) | AT-10 #6 |
| `employee_id` | UUID NOT NULL | NO | Soft FK hồ sơ | AT-10 |
| `leave_type` | TEXT NOT NULL DEFAULT `'annual'` | NO | Cùng mã catalog | AT-10 · SC-LEAVE |
| `balance_year` | INT NOT NULL | NO | Năm lịch (HCM calendar on read default) | Balance GET |
| `entitled_days` | NUMERIC(5,1) NOT NULL DEFAULT 0 | NO | Ngày được hưởng | #6 |
| `used_days` | NUMERIC(5,1) NOT NULL DEFAULT 0 | NO | Đã dùng | #6 |
| `pending_days` | NUMERIC(5,1) NOT NULL DEFAULT 0 | NO | Đang chờ duyệt | #6 |
| `updated_at` | TIMESTAMPTZ NOT NULL DEFAULT NOW() | NO | Audit | — |

### 2.2 Constraints

| Constraint | Purpose |
|------------|---------|
| `uq_employee_leave_balances UNIQUE (company_id, employee_id, leave_type, balance_year)` | Một số dư / NV / loại / năm |

### 2.3 Enforce semantics (normative)

| Situation | Create behavior |
|-----------|-----------------|
| Row exists (tracked) and `remaining < total_days` | **400** `HRM-LEAVE-VAL-BALANCE` (Diễn biến #6) |
| No balance row / untracked | **Allow** create (TechSpec G-AT10-02) |
| Source alternate | `employees.custom_fields` leave balance when table empty (read path) |

---

## 3. Dual-plane / scope notes

```text
leave_requests.company_id     = operating slug TEXT  (Plane B workforce scope)
leave_type catalog partition  = resolveHrmSettingsCatalogCompanyId → often "holding" on master
xbos_legal_entity.id (UUID)   = Plane A — NEVER persist as leave_requests.company_id
```

| Invariant | Rule |
|-----------|------|
| List vs get-by-id vs approve/reject | Same `assertResourceInHrmScope` / slug normalize (G-AT10-01 inherit AT-12/13) |
| WF manager resolve | `employees.company_id` TEXT match set — never `::uuid` cast |
| Soft FK spine | `employee_id` without `REFERENCES` — G-DB-02 standing; orphan probe separate |

---

## 4. ER (logical)

```text
employees (id UUID)
    │ soft
    ├──< leave_requests (company_id TEXT, leave_type → catalog leave_types)
    └──< employee_leave_balances (company_id TEXT, leave_type, balance_year)

leave_requests.workflow_instance_id ──> XBOS workflow_instances (external)
```

---

## 5. Out of scope / non-goals

- Hard DB FK `leave_type` → catalog table (catalog is settings snapshot / extension)
- Migrating soft `employee_id` → hard FK (G-DB-02 wave riêng)
- Seed leave rows for U65 evidence (forbidden)
- Prisma model rename — physical names above are SoT (Nest ensureSchema)

---

## 6. Trace matrix (table → FR → API)

| Table | FR / Diễn biến | Primary API |
|-------|----------------|-------------|
| `leave_requests` | AT-10 #7 insert · AT-12 #6 update · AT-13 #6 update · AT-WF-01 #2/#4/#5 | See `API_DESIGN_HRM_LEAVE.md` |
| `employee_leave_balances` | AT-10 #6 read/assert · balance chip | `GET …/leave-balance` |
