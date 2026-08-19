# API_DESIGN — HRM Fleet (vehicles list · FL-01)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-FLEET-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | khách `SRS_HRM_KHACH.md` **§3.49 FR-HRM-FL-01** |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§16.5** row 49 · envelope `HRM-FLEET-*` |
| **ref_db** | `docs/hrm/DB_DESIGN_HRM_FLEET.md` |
| **OpenAPI** | `docs/api/openapi/hrm-api.yaml` — `fleetListVehicles` F.1 + `keyword`/`q` · `FleetVehicleList` (BE-HRM-FLEET-KEYWORD-01 · **G-FL-02 CLOSED**) |
| **Template** | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` (Mục đích · Nghiệp vụ · Bước SRS) |
| **U71** | Physical API before Dev claim on FL-01 |
| **Date** | 2026-07-27 |
| **Runtime** | `FleetController` · `FleetService` |

> **must_keep:** TEXT slug persist · empty 200 honesty · U65 no seed · do not rewrite OP/W2/Payroll/Leave/ATT/Auth/RACI/WF/catalog-gov/KPI.  
> **TechSpec-required HTTP:** **list only** (`GET …/fleet/vehicles`). Public mutate **not** in FR-HRM-FL-01 (SRS: bước chỉ xem không tạo). Service upsert documented as residual (§B).  
> **Cấm:** PASS QA bằng seed xe; claim detail DONE (G-FL-01); invent public upsert (G-FL-UPSERT); Phase1/PROD claim.  
> **G-FL-02:** **CLOSED** 2026-07-27 — `BE-HRM-FLEET-KEYWORD-01` · `keyword`/`q` on GET list.

---

## 0. Endpoint map

| § | Method / path | Success code | Primary SRS | TechSpec |
|---|----------------|--------------|-------------|----------|
| **A** | `GET /api/hrm/fleet/vehicles` | `HRM-FLEET-200` | **FR-HRM-FL-01** #2/#3/#8 | **Required** ALIGNED |
| **B** | *(no public HTTP)* Service `upsertVehicle` | — | FL-01 non-write · future write FR | Residual **G-FL-UPSERT** |

**Cross-cite (no duplicate F.1 body):**

| Topic | Canonical |
|-------|-----------|
| Tourism fleet field catalogs | `API_DESIGN_HRM_SETTINGS_CATALOG` · keys `hrm_fleet_*` |
| Scope ladder | Auth/Tenant + `resolveHrmListScope` (Employees/Leave family) |
| Detail by id | **Non-goal** this FR — **G-FL-01** |

---

## A. Endpoint — List fleet vehicles

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/fleet/vehicles` |
| Query | `company_id?` · `status?` · `keyword?` · `q?` · `limit?` (+ headers `x-tenant-id` / `x-company-id` / JWT) |
| Success | `200` · **`HRM-FLEET-200`** · `{ total, data[] }` |
| Runtime | `listVehicles` · `resolveHrmListScope` · `pushCompanyIdFilter` |

### Mục đích

Cấp **danh sách hồ sơ xe** trong phạm vi đơn vị (du lịch / ĐV được cấp) để bảng Hồ sơ xe hiển thị đúng biển số và thuộc tính — **empty trung thực** khi chưa khai xe; không lộ xe đơn vị khác.

### Nghiệp vụ xử lý

1. Auth internal/JWT — thiếu / hết phiên → `HRM-AUTH-001` (FL-01 #1).
2. `resolveScopeContext` + `resolveHrmListScope(authorization, requestedCompany)` — `company_id` query hoặc header; `main` rollup → member slug array (FL-01 #2/#6).
3. Filter `tenant_id` + `company_id IN scope`; optional `status` ∈ active|inactive; `limit` clamp 1..2000 (default 500).
4. Optional `keyword` / `q` (prefer `q`) — trim, max 100; ILIKE `license_plate` **or** soft name keys in `fleet_fields` (`driver_name`, `manufacturer`, `model`, `route_name`, `name`, `vehicle_name`) — still within scope filters (FL-01 #4 · **G-FL-02 CLOSED**).
5. ORDER BY `license_plate ASC`; map rows (`id`, `tenant_id`, `company_id`, `license_plate`, `fleet_fields`, `status`, timestamps).
6. Empty = `total=0`, `data=[]` — not ERROR (FL-01 #3); empty keyword result also honest empty.
7. Dedicated `GET …/vehicles/:id` — **non-goal** → residual **G-FL-01** (SRS #5); FE may use list row.
8. Catalog sync gate (#7) — not enforced in list; FE/Settings VERIFY **G-FL-07**.
9. Không side-effect seed; không ghi bảng ở GET.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-FL-01** | **#1** Auth / hết phiên / ngoài quyền | Guard `HRM-AUTH-001` |
| 2 | **FR-HRM-FL-01** | **#2** Mở Hồ sơ xe | **This endpoint** |
| 3 | **FR-HRM-FL-01** | **#3** Empty trung thực | `data=[]` |
| 4 | **FR-HRM-FL-01** | **#4** Tìm biển số / tên | **This endpoint** · `keyword`/`q` (G-FL-02 **CLOSED**) |
| 5 | **FR-HRM-FL-01** | **#5** Mở chi tiết | Residual **G-FL-01** / list row |
| 6 | **FR-HRM-FL-01** | **#6** Xe ngoài ĐV | Scope filter — not in `data` |
| 7 | **FR-HRM-FL-01** | **#7** Thiếu danh mục | Residual **G-FL-07** / Settings |
| 8 | **FR-HRM-FL-01** | **#8** Thành công cuối | Response `HRM-FLEET-200` |

### Request ↔ DB

| Query / header | Column / filter |
|----------------|-----------------|
| `x-tenant-id` / JWT tenant | `tenant_id` |
| `company_id` / `x-company-id` / JWT | `company_id` via `resolveHrmListScope` → IN list |
| `status?` | `status` |
| `keyword?` / `q?` | ILIKE `license_plate` + `fleet_fields` name keys (in-scope) |
| `limit?` | SQL `LIMIT` (not a column) |

### Response ↔ DB

| Field | Column |
|-------|--------|
| `id` | `id` |
| `tenant_id` | `tenant_id` |
| `company_id` | `company_id` |
| `license_plate` | `license_plate` |
| `fleet_fields` | `fleet_fields` |
| `status` | `status` |
| `created_at` / `updated_at` | timestamps |
| `total` | `data.length` (page-less list) |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Empty in-scope | `HRM-FLEET-200` + empty | 200 |
| Unauth | `HRM-AUTH-001` | 401 |
| Scope mismatch family | SCOPE_* | 409 (standing **G-SCOPE-01**) |

### FE after 2xx (U65)

Bảng xe đúng ĐV hoặc empty rõ · F5 giữ · không lộ ĐV khác · **cấm** seed để có dòng.

---

## B. Service upsert — no public HTTP (residual)

### Identity

| Item | Value |
|------|--------|
| Method / path | **None on controller** — `FleetService.upsertVehicle` only |
| Body (logical) | `tenantId`, `companyId` (TEXT slug), `licensePlate`, `fleetFields`, `status?` |
| Success (if exposed later) | Target envelope family `HRM-FLEET-201` / update — **not claimed ALIGNED** |
| Runtime | INSERT … ON CONFLICT `(tenant_id, company_id, license_plate)` DO UPDATE |

### Mục đích

**(Residual / future write FR)** Cho phép ghi hoặc cập nhật một hồ sơ xe theo biển số trong ĐV — **không** thuộc Diễn biến FR-HRM-FL-01 (SRS: bước chỉ xem không tạo bản ghi mới). Document để Dev không nhầm service method = API đã mở cho UAT.

### Nghiệp vụ xử lý

1. Trim + UPPER `license_plate`; empty → `HRM-FLEET-001` 400.
2. Resolve existing row by `(tenant_id, company_id, license_plate)` or new UUID.
3. UPSERT `fleet_fields` + `status` (default `active`); bump `updated_at`.
4. Persist TEXT `company_id` slug — **no** Operations UUID map.
5. **Do not** expose via controller until sponsor/BA opens write FR + TechSpec row + U65 FE path.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-FL-01** | Thành công «Không tạo mới ở bước chỉ xem» | Confirms write **out of** FL-01 |
| 2 | *(future write FR)* | TBD BA | Would become public POST/PUT |

### Errors (service today)

| Condition | Code | HTTP |
|-----------|------|------|
| Missing plate | `HRM-FLEET-001` | 400 |

### Residual

**G-FL-UPSERT** — Info/P2: public mutate endpoint + OpenAPI + FE create/edit only when product opens write FR; until then keep service internal / seed-ops paths separate from UAT (U65).

---

## C. Residual register (design-time)

| ID | Sev | Owner | Exit |
|----|-----|-------|------|
| **G-FL-01** | Info | `ba-docs` / `dev-fe` optional | Detail via list row OK **or** ADD `GET …/vehicles/:id` + scope parity if BA locks detail |
| **G-FL-02** | P2 | `dev-be` | **CLOSED** 2026-07-27 — `BE-HRM-FLEET-KEYWORD-01` · `keyword`/`q` ILIKE plate + fleet_fields name keys · evidence `be-hrm-fleet-keyword-01-20260727.md` |
| **G-FL-07** | P2 | `dev-fe`+`qa`+`qc` | **CLOSED** QC 2026-07-27 (`QC-HRM-FLEET-CATALOG-UX-01`) — FE empty/catalog-missing VI · no raw keys · no invent create · evidence `qc-hrm-fleet-catalog-ux-01-20260727.md` |
| **G-FL-UPSERT** | Info/P2 | `pm`→BA→`dev-be` | Public write only after write FR + TechSpec |
| **G-SCOPE-01** | P0 standing | `dev-be`+`qa` | on-touch fleet list scope tests |
| OpenAPI fleet path | P2 | `dev-be` | **CLOSED** 2026-07-27 — `/fleet/vehicles` + F.1 + FleetVehicleList in `hrm-api.yaml` · evidence `be-hrm-oa-import-fleet-01-20260727.md` |

**Non-claims:** Phase 1 DONE · PROD-READY · UF 🟢 · seed for evidence · Admin/Import (next SA residual).
