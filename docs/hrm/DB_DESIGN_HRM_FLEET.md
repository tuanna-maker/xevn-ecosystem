# DB_DESIGN — HRM Fleet (vehicles list · FL-01)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-FLEET-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | khách `SRS_HRM_KHACH.md` **§3.49 FR-HRM-FL-01** · team matrix Fleet / menu `fleet` · `HRM_MENU_DATA_LINKAGE_MATRIX` Fleet row |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§16.5** FR-HRM-FL-01 · **§17.1** `hrm_fleet_vehicles` |
| **ref_api** | `docs/hrm/API_DESIGN_HRM_FLEET.md` |
| **ref_align** | Plane B TEXT `company_id` + `tenant_id` · UK plate scope · `resolveHrmListScope` · `pushCompanyIdFilter` · soft `fleet_fields` JSONB |
| **Template** | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` |
| **U71** | Physical DB before Dev claim on Fleet FL-01 |
| **Date** | 2026-07-27 |
| **Runtime ensure** | `FleetService.ensureSchema` (`CREATE TABLE IF NOT EXISTS` + unique index) |

> **must_keep:** Do **not** rewrite Operations · W2 slice · Payroll · Leave · ATT · Auth/Tenant · RACI/WF/catalog-gov/KPI pairs. U65 honest empty. Tourism fleet **Settings catalogs** (`hrm_fleet_*` keys) remain Settings SoT — cite only.  
> **Out of scope this slice:** `employee_assets` / overtime / advance (G-DB-05 leftover) · Admin invite · Import preview · public HTTP write FR (FL-01 = xem danh sách).

---

## 0. Inventory

| Store | Role | `company_id` physical | Soft/Hard |
|-------|------|----------------------|-----------|
| **`public.hrm_fleet_vehicles`** | Hồ sơ xe đơn vị — FL-01 list/empty SoT | **TEXT** Plane B slug | Soft company (no FK to LE); UK with `tenant_id` + plate |
| **Settings catalogs (cite)** | Field schemas `hrm_fleet_vehicle_fields` / driver / registration / insurance | TEXT catalog partition | Settings pair must_keep — not redefined here |
| **Detail get-by-id** | SRS Diễn biến #5 «mở chi tiết» | — | **Non-goal** HTTP (`G-FL-01` Info) if FE list-only |

> **Physical fact (Plane):** Unlike Operations (`hrm_tasks` UUID + map), Fleet persists **`company_id` TEXT slug** (`xe-du-lich`, `holding`, …) — same family as Leave/Payroll/Employees. Wire/JWT Plane B; list uses `resolveHrmListScope` → `companyIds[]` + `pushCompanyIdFilter`. **Cấm** treat LE UUID as workforce `company_id` without slug bridge.

---

## 1. Table SoT — `public.hrm_fleet_vehicles`

| Item | Value |
|------|--------|
| Schema | `public` |
| Table | **`hrm_fleet_vehicles`** |
| Owner | `hrm-api` · `FleetService` |
| Consumers | Embed/App Hồ sơ xe (du lịch) · FR-HRM-FL-01 · menu Fleet |
| `ref_srs` | **FR-HRM-FL-01** #2/#3/#4/#6/#8 |

### 1.1 Columns (physical)

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `id` | UUID PK | NO | Khóa hồ sơ xe (khóa mang nếu chọn dòng) | FL-01 Thành công · #5 |
| **`tenant_id`** | **TEXT NOT NULL** | NO | Tenant vận hành (vd. `xevn`, `xe-du-lich`) | SCOPE · list filter |
| **`company_id`** | **TEXT NOT NULL** | NO | Đơn vị Plane B slug | FL-01 #2/#6 · SCOPE |
| `license_plate` | TEXT NOT NULL | NO | Biển số (normalize UPPER trim on upsert) | FL-01 #4 tìm biển |
| `fleet_fields` | JSONB NOT NULL DEFAULT `'{}'` | NO | Thuộc tính mở rộng (tài xế soft ref, loại xe, …) theo catalog Settings | FL-01 #7 catalog; matrix soft driver |
| `status` | TEXT NOT NULL DEFAULT `'active'` | NO | `active` \| `inactive` | FL-01 filter `status?` |
| `created_at` / `updated_at` | TIMESTAMPTZ NOT NULL | NO | Audit | List ORDER BY plate |

### 1.2 Constraints / indexes

| Name / definition | Purpose |
|-------------------|---------|
| `chk_hrm_fleet_status` | Domain `active` \| `inactive` |
| **`uq_hrm_fleet_plate_scope`** UNIQUE `(tenant_id, company_id, license_plate)` | Một biển / ĐV / tenant; upsert `ON CONFLICT` |
| List filter | `tenant_id = $1` + `pushCompanyIdFilter` — never leak other units |
| Recommended (optional) | `idx_hrm_fleet_company_status (company_id, status)` if volume grows — Dev residual |

### 1.3 Soft references (JSONB · no hard FK)

| Logical key (in `fleet_fields`) | Meaning | Soft target |
|---------------------------------|---------|-------------|
| Driver / staff ids (catalog-driven) | Gắn tài xế | Soft → `employees.id` (no DB FK) |
| Vehicle type / attrs | Thuộc tính mở | Values from synced Settings catalogs when required |

**Cấm:** hard FK driver → employees in this slice; invent columns that duplicate Settings catalog schemas.

### 1.4 Gaps vs SRS (documented — do not invent as DONE)

| Gap | Spec says | Physical / API now | Sev |
|-----|-----------|-------------------|-----|
| **G-FL-01** | Diễn biến #5 mở chi tiết | **No** `GET …/vehicles/:id` — TechSpec non-goal if FE list-only | Info |
| **G-FL-02** | Diễn biến #4 tìm biển số / tên | List `keyword?`/`q?` ILIKE plate + fleet_fields name keys — **CLOSED** BE-HRM-FLEET-KEYWORD-01 | ~~P2~~ CLOSED |
| **G-FL-UPSERT** | FL-01 = xem (không tạo ở bước chỉ xem) | Service `upsertVehicle` exists; **no** public HTTP controller route | Info / future write FR |
| **G-FL-07** | #7 thiếu danh mục → báo cấu hình | FE list empty + catalog banner VI (`D-FE-HRM-FLEET-CATALOG-UX-01`) — **CLOSED** FE pending QA | P2 |

**Cấm:** seed fleet rows for QA (U65); claim detail/search DONE without DTO+tests; wipe Operations UUID plane into this TEXT table.

---

## 2. Settings catalog cite (must_keep — not DDL here)

| Catalog key (examples) | Role |
|------------------------|------|
| `hrm_fleet_vehicle_fields` | Schema thuộc tính xe |
| `hrm_fleet_driver_fields` | Schema tài xế |
| `hrm_fleet_registration_fields` / `hrm_fleet_insurance_fields` | Đăng kiểm / BH xe |

Canonical: `docs/hrm/DB_DESIGN_HRM_SETTINGS_CATALOG.md` · tourism seed path is **ops-only** (not UAT evidence). FL-01 empty when no vehicles — **không** giả dòng từ catalog.

---

## 3. Dual-plane / scope invariants

| Rule | Detail |
|------|--------|
| Wire / JWT | Plane B slug (`main`, `holding`, members, `xe-du-lich`) |
| Persist Fleet | **TEXT** `company_id` + `tenant_id` (no UUID map class G-OP-PLANE-01) |
| List parity | `resolveHrmListScope` → `companyIds[]` same family as Employees/Leave |
| Group rollup | `company_id=main` → member slug array (controller spec) |
| Cấm | Filter by LE UUID as if slug; cast TEXT with `::uuid`; cross-tenant plate leak |

---

## 4. must_keep / non-goals

| Keep | Path |
|------|------|
| Operations tasks/reports | `DB_DESIGN_HRM_OPERATIONS.md` |
| W2 Performance/Decisions/Metadata/Mobile | `DB_DESIGN_HRM_W2_SLICE.md` |
| Payroll / Leave / ATT / Employees / Recruitment / Settings / CO-HC | prior `docs/hrm/DB_DESIGN_HRM_*` |
| XBOS Auth/Tenant · KPI · RACI · WF · catalog-gov | `docs/xbos/DB_DESIGN_XBOS_*` |
| Admin / Import | Next residual §3 README — **not** this file |
| `employee_assets` | G-DB-05 leftover — **not** mapped to FL-01 |

---

## 5. Trace → API

| FR | Primary read/write | Table / store |
|----|--------------------|---------------|
| FL-01 | `GET …/fleet/vehicles` | SELECT `hrm_fleet_vehicles` |
| *(future write)* | Service `upsertVehicle` — HTTP TBD | INSERT/UPSERT same table |

Paired contract: `docs/hrm/API_DESIGN_HRM_FLEET.md`.
