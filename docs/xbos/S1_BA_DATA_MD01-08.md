# S1 BA-Data — Master data contract matrix (UC-XBOS-MD-01..07 + UC-XBOS-08)

**work_item_id:** `P1-S1-BA-D-01`  
**program:** Phase 1 Sprint S1 · Module **M01-Master**  
**from_role:** ba-data  
**to_role:** pm  
**ack_status:** `PASS_TO_PM`  
**pilot account (settings smoke):** `ceo@xe.vn` / `Xevn@2026` · portal `http://localhost:5175`  
**related:** [`docs/decisions/ADR-XBOS-M01-OPENAPI-BOUNDARIES.md`](../decisions/ADR-XBOS-M01-OPENAPI-BOUNDARIES.md) · [`docs/api/openapi/xbos-api.yaml`](../api/openapi/xbos-api.yaml) · [`docs/qa/PILOT_SCOPE_DATA_MATRIX.md`](../qa/PILOT_SCOPE_DATA_MATRIX.md) · [`docs/xbos/SRS.md`](SRS.md) §10, §12.2

---

## 1. Purpose

Deterministic **field semantics**, **validation**, **ownership**, and **source of truth (SoT)** for XBOS master-data use cases in M01 S1 so Dev-BE/FE/QA can implement and test without cross-wiring domains or scope keys.

**Naming note:** Product UC list has **UC-XBOS-MD-01..07** (entity-specific) plus **UC-XBOS-08** (generic business-master CRUD). There is no separate `UC-XBOS-MD-08`; backlog item “MD-01..08” means **MD-01..07 + UC-XBOS-08**.

Implementation truth: `apps/api/xbos-api/src/business-master/*`, `apps/api/xbos-api/src/assets/*`, `apps/api/xbos-api/src/position-rbac/*`, `apps/web/web-portal/src/integrations/businessMasterApi.ts`, `assetRegistryApi.ts`.

---

## 2. Bounded context (ADR M01-Master)

| Plane | API prefix | Scope | Primary UCs |
|-------|------------|-------|-------------|
| **Business master** | `/api/xbos/business-master/{domain}/items` | `resolveScopeContext` (JWT ∩ query/header) | UC-XBOS-08, MD-01..06 (JSONB rows) |
| **Position RBAC** | `/api/xbos/position-rbac/templates`, `/assignments` | Templates: tenant-only; assignments: full scope | MD-01 (canonical templates), UC-XBOS-11 |
| **Asset registry** | `/api/xbos/assets` | `resolveScopeContext` + module claim | MD-07 (vehicle types) |

**Out of this matrix (other M01 planes):** `config-sync` (catalog definitions), `kpi-engine` (math), `org-foundation` (legal/org tree), `catalog-governance` (extension workflow).

---

## 3. Shared storage — `xbos_business_master_entries` (UC-XBOS-08)

### 3.1 Physical model

| Column | Type | Semantics | SoT |
|--------|------|-----------|-----|
| `tenant_id` | TEXT | Tenant slug (`xevn`, `xe-du-lich`, …) | Request scope after `resolveScopeContext` |
| `company_id` | TEXT | Operating company bucket within tenant | JWT / GlobalFilter — see §4 |
| `domain` | TEXT | Whitelist catalog key (lowercase) | Path param `:domain` |
| `item_id` | TEXT | Stable business key (slug/id) | Path param `:itemId` on PUT/DELETE |
| `payload` | JSONB | Domain-specific attributes | Request body on PUT (full replace) |
| `status` | TEXT | `active` \| `deleted` | Service on delete (soft-delete) |
| `created_at` / `updated_at` | TIMESTAMPTZ | Audit | DB default / trigger |

**Primary key:** `(tenant_id, company_id, domain, item_id)`  
**Index:** `(tenant_id, company_id, domain, updated_at DESC)`

### 3.2 API envelope (all business-master ops)

| Field | Rule |
|-------|------|
| Success | `{ success: true, code: 'XBOS-MASTER-200'|'201'|'204', message, data, timestamp }` |
| Error | `{ success: false, code, message, details?, timestamp }` |
| Auth | Internal: `Authorization: Bearer` and/or `x-internal-api-key` — else `XBOS-AUTH-001` (401) |
| List response | `data.items[]` — each item = `{ id: item_id, ...payload spread, status, tenantId, companyId, createdAt, updatedAt }` |
| `companies` empty list | Service returns **synthetic** two rows (`all`, current `companyId`) — not persisted until first PUT |

### 3.3 Domain whitelist (`BusinessMasterService.allowedDomains`)

| domain | MD UC | S1 settings / consumer |
|--------|-------|-------------------------|
| `positions` | MD-01 | `PositionsSettingsPage` |
| `vendors` | MD-02 | `VendorsSettingsPage` |
| `expense_categories` | MD-03 | `ExpenseCategoriesSettingsPage` |
| `kpi_metrics` | MD-04 | `KPIMetricsSettingsPage`, KPI dashboard (with `kpi-engine`) |
| `customers` | MD-05 | `CustomersPage` |
| `partners` | MD-06 | `PartnersPage` |
| `companies` | — | `useCompanyFilterOptions` / GlobalFilter |
| `organizations` | — | Org listing (defer normalized org-foundation in S1) |
| `dept_system_templates`, `command_center_catalogs`, `kpi_policies`, `kpi_sparkline_snapshots`, `department_catalog`, `geographic_regions`, `kpi_formulas` | CC / settings P4 | Command Center & placeholder settings — **not** MD-01..07 |

Unknown domain → `XBOS-MASTER-400` (400), `details.domain`.

### 3.4 Operations (OpenAPI `operationId`)

| Op | HTTP | operationId | Validation |
|----|------|-------------|------------|
| List | `GET /business-master/{domain}/items?tenantId&companyId` | `businessMasterListItems` | Domain whitelist; scope resolved |
| Upsert | `PUT /business-master/{domain}/items/{itemId}` | `businessMasterUpsertItem` | `itemId` non-empty trim; body = JSON payload |
| Delete | `DELETE /business-master/{domain}/items/{itemId}` | `businessMasterDeleteItem` | Soft-delete `status='deleted'` |

**No server-side JSON schema validation** on `payload` in S1 — FE + BA matrix are the contract; BE-01 may add DTOs per domain later.

---

## 4. Scope semantics (master data)

Align with [`PILOT_SCOPE_DATA_MATRIX.md`](../qa/PILOT_SCOPE_DATA_MATRIX.md).

| Context | `tenantId` | `companyId` | Rule |
|---------|------------|-------------|------|
| Group CEO — business master settings (default) | `xevn` | **`holding`** or JWT-aligned company from GlobalFilter | Query/header must match JWT; use `resolveIdentityScope()` on FE |
| Group CEO — HRM embed | `xevn` | **`main`** | **Not** used for MD settings rows |
| Member subsidiary CEO | `xe-*` | `main` | Rows partitioned per tenant + company |
| Anti-pattern | `xevn` | `xevn` (tenant slug as company) | **409** `SCOPE_CONTEXT_MISMATCH` |

**FE rule:** `businessMasterApi.ts` always sends `tenantId` + `companyId` from `resolveIdentityScope(tenantHint, companyHint)` — never pass tenant slug as `companyId`.

| VAL-ID | Condition | Expected |
|--------|-----------|----------|
| VAL-MD-SCOPE-01 | List/upsert with JWT `companyId=main` and query `companyId=main` | 200 `XBOS-MASTER-200` |
| VAL-MD-SCOPE-02 | JWT `main`, query `companyId=xevn` | 409 `SCOPE_CONTEXT_MISMATCH` |
| VAL-MD-SCOPE-03 | Missing tenant/company | 400 `SCOPE_TENANT_REQUIRED` / `SCOPE_COMPANY_REQUIRED` |
| VAL-MD-SCOPE-04 | Invalid slug format | 400 `SCOPE_TENANT_INVALID` / `SCOPE_COMPANY_INVALID` |

---

## 5. UC-XBOS-08 — Generic master CRUD (cross-cutting)

| Aspect | Contract |
|--------|----------|
| **Purpose** | Single write/read path for all whitelisted `domain` values |
| **SoT** | `public.xbos_business_master_entries` |
| **Owner** | XBOS API `BusinessMasterService` |
| **Idempotency** | PUT upsert by PK; repeat PUT replaces full `payload` |
| **Delete** | Logical only (`status=deleted`); list excludes deleted |
| **Uniqueness** | PK scope — duplicate `item_id` same scope → update, not second row |

---

## 6. Entity contracts (MD-01..07)

### 6.1 UC-XBOS-MD-01 — Chức danh (positions)

| Aspect | Value |
|--------|-------|
| **Primary API** | `GET/PUT/DELETE /api/xbos/business-master/positions/items[/{itemId}]` |
| **Secondary API (canonical RBAC)** | `GET/POST /api/xbos/position-rbac/templates` (UC-XBOS-11, tenant-scoped) |
| **SoT (settings UI)** | `xbos_business_master_entries` · `domain=positions` |
| **SoT (assignment / JD)** | `xbos_position_template`, `xbos_position_assignment`, `xbos_job_description` |
| **Owner** | Portal settings (JSONB); HR/org lane (normalized templates) |
| **FE** | `PositionsSettingsPage` → `businessMasterApi` |

**Payload fields (`positions` domain)**

| Field | Type | Required | Semantics | Validation |
|-------|------|----------|-----------|------------|
| `id` | string | Y (item_id) | Business key; mirrored in list as `id` | Non-empty; stable on update |
| `code` | string | Y | Short code (CEO, COO, …) | Unique per `(tenant, company, domain)` by convention |
| `name` | string | Y | Display name | Non-empty trim |
| `level` | number | Y | Hierarchy level (1=highest) | Integer ≥ 1 |
| `category` | enum | Y | `management` \| `driver` \| `operations` \| `technical` \| `warehouse` \| `support` | Must be known enum |
| `description` | string | N | Job summary | — |
| `requirements` | string | N | Hiring requirements | — |
| `salaryGrade` | string | N | Pay grade code | — |
| `applicableCompanies` | string[] | Y | `all` or subsidiary ids (`trsport`, …) | At least one entry; `all` = group-wide |
| `parentDepartmentCodes` | string[] | N | Link to dept catalog codes | Codes must exist when dept catalog enforced |

**Position template (normalized) — for cross-reference**

| Field | SoT column | Validation |
|-------|------------|------------|
| `code`, `name` | `xbos_position_template` | Required — `XBOS-POS-400` if missing |
| `levelScope` | `level_scope` | Default `group` |
| `orgTypeHint` | `org_type_hint` | Optional |
| `payload` | `payload` JSONB | Extension bag |

**Data risk R-MD-01:** Dual SoT (JSONB `positions` vs `xbos_position_template`) — S1 FE uses JSONB only; sync to templates is **out of scope** until ECO-MASTER-02.

---

### 6.2 UC-XBOS-MD-02 — Nhà cung cấp (vendors)

| Aspect | Value |
|--------|-------|
| **API** | `business-master/vendors` |
| **SoT** | `xbos_business_master_entries` · `domain=vendors` |
| **Owner** | Procurement / finance settings |
| **FE** | `VendorsSettingsPage` |

| Field | Type | Required | Semantics | Validation |
|-------|------|----------|-----------|------------|
| `id` | string | Y | item_id | Non-empty |
| `code` | string | Y | Vendor code (NCC-001) | Unique per scope by convention |
| `name` | string | Y | Legal / display name | Non-empty |
| `shortName` | string | Y | Short label | Non-empty |
| `category` | enum | Y | `fuel` \| `insurance` \| `repair` \| `rest_stop` \| `rescue` \| `toll` \| `parts` \| `technology` \| `port` \| `other` | Known enum |
| `taxCode` | string | Y | MST | Format per VN MST policy (FE) |
| `address` | string | Y | Address | — |
| `contactPerson` | string | Y | Contact | — |
| `phone` | string | Y | Phone | — |
| `email` | string | Y | Email | RFC5322 loose (FE) |
| `bankAccount` | string | N | Bank account | — |
| `bankName` | string | N | Bank name | — |
| `paymentTerms` | string | Y | Payment terms text | — |
| `creditLimit` | number | N | Credit limit VND | ≥ 0 if present |
| `contractExpiry` | string (date) | N | ISO date `YYYY-MM-DD` | — |
| `discountRate` | number | N | Percent | 0..100 |
| `relatedCompanies` | string[] | Y | Applicable company ids or `all` | Min length 1 |
| `status` | enum | Y | `active` \| `inactive` \| `pending` | — |
| `notes` | string | N | Free text | — |

---

### 6.3 UC-XBOS-MD-03 — Loại chi phí (expense_categories)

| Aspect | Value |
|--------|-------|
| **API** | `business-master/expense_categories` |
| **SoT** | `xbos_business_master_entries` · `domain=expense_categories` |
| **FE** | `ExpenseCategoriesSettingsPage` |

| Field | Type | Required | Semantics | Validation |
|-------|------|----------|-----------|------------|
| `id` | string | Y | item_id | Non-empty |
| `code` | string | Y | Cost type code | Unique per scope |
| `name` | string | Y | Display name | Non-empty |
| `category` | enum | Y | `direct` \| `indirect` \| `fixed` \| `variable` | — |
| `type` | enum | Y | `fuel` \| `toll` \| `maintenance` \| `labor` \| `parking` \| `insurance` \| `depreciation` \| `other` | — |
| `description` | string | Y | Description | — |
| `accountCode` | string | Y | GL account code | Non-empty |
| `taxDeductible` | boolean | Y | Tax deductible flag | — |
| `requiresReceipt` | boolean | Y | Receipt required | — |
| `approvalRequired` | boolean | Y | Approval gate | — |
| `maxAmountNoApproval` | number | N | VND threshold | ≥ 0 if set |
| `applicableCompanies` | string[] | Y | Scope | Min 1 |
| `status` | enum | Y | `active` \| `inactive` | — |

---

### 6.4 UC-XBOS-MD-04 — Chỉ số KPI (kpi_metrics)

| Aspect | Value |
|--------|-------|
| **API** | `business-master/kpi_metrics` |
| **SoT** | `xbos_business_master_entries` · `domain=kpi_metrics` |
| **Compute SoT** | `kpi-engine` (evaluate/rollup) — reads metric defs + actuals; **not** this table alone |
| **FE** | `KPIMetricsSettingsPage`, dashboard rollup |
| **Seed** | `pnpm seed:business-master:kpi` |

| Field | Type | Required | Semantics | Validation |
|-------|------|----------|-----------|------------|
| `id` | string | Y | item_id (e.g. `kpi-otif`) | Non-empty |
| `code` | string | Y | Metric code (OTIF) | Unique per scope; referenced by policies/formulas |
| `name` | string | Y | Display name | Non-empty |
| `unit` | string | Y | `%`, `tỷ VND`, etc. | — |
| `category` | string | Y | Grouping (Vận hành, Nhân sự, …) | — |
| `targetValue` | number | Y | Target for evaluate | Finite number |
| `warningThreshold` | number | Y | Warning band | Typically `< target` for higher-is-better |
| `criticalThreshold` | number | Y | Critical band | Worse than warning |
| `applicableCompanies` | string[] | Y | Rollup scope | `all` or company ids |
| `currentValue` | number | N | Last known actual (UI/seed) | Optional; evaluate uses request `actual` |

**Cross-UC:** `POST /api/xbos/kpi-engine/evaluate` requires `target` + `actual` in body (UC-XBOS-09) — metric row supplies default `targetValue`.

---

### 6.5 UC-XBOS-MD-05 — Khách hàng (customers)

| Aspect | Value |
|--------|-------|
| **API** | `business-master/customers` |
| **SoT** | `xbos_business_master_entries` · `domain=customers` |
| **FE** | `CustomersPage` (`mock-data.ts` types) |

| Field | Type | Required | Semantics | Validation |
|-------|------|----------|-----------|------------|
| `id` | string | Y | item_id | Non-empty |
| `code` | string | Y | Customer code | Unique per scope |
| `name` | string | Y | Name | Non-empty |
| `type` | enum | Y | `individual` \| `corporate` | — |
| `industry` | string | N | Industry | — |
| `contactPerson` | string | Y | Contact | — |
| `email` | string | Y | Email | — |
| `phone` | string | Y | Phone | — |
| `address` | string | Y | Address | — |
| `fromCompanyId` | string | Y | Owning / originating subsidiary id | Must be valid company slug in tenant |
| `status` | enum | Y | `active` \| `inactive` | — |
| `totalOrders` | number | N | Denormalized stats | ≥ 0 |
| `totalRevenue` | number | N | Denormalized VND | ≥ 0 |

---

### 6.6 UC-XBOS-MD-06 — Đối tác (partners)

| Aspect | Value |
|--------|-------|
| **API** | `business-master/partners` |
| **SoT** | `xbos_business_master_entries` · `domain=partners` |
| **FE** | `PartnersPage` |

| Field | Type | Required | Semantics | Validation |
|-------|------|----------|-----------|------------|
| `id` | string | Y | item_id | Non-empty |
| `code` | string | Y | Partner code | Unique per scope |
| `name` | string | Y | Name | Non-empty |
| `type` | string | Y | Partner type label (Nhiên liệu, Bảo hiểm, …) | Non-empty |
| `contactPerson` | string | Y | Contact | — |
| `email` | string | Y | Email | — |
| `phone` | string | Y | Phone | — |
| `relatedCompanies` | string[] | Y | Applicable companies or `all` | Min 1 |
| `status` | enum | Y | `active` \| `inactive` | — |

---

### 6.7 UC-XBOS-MD-07 — Loại xe / tài sản (vehicle types)

| Aspect | Value |
|--------|-------|
| **API** | `POST/GET/PATCH /api/xbos/assets` (asset registry) — **not** business-master |
| **SoT** | `public.asset_registry` + `metadata` JSONB |
| **Discriminator** | `assetType = 'vehicle_type'` |
| **Owner module** | `ownerModule = 'operations'` (canonical from UI module `fleet`) |
| **FE** | `VehicleTypesSettingsPage` → `assetRegistryApi` |

**Registry core fields**

| Field | Type | Required | Semantics | Validation (DTO) |
|-------|------|----------|-----------|------------------|
| `tenantId` | string | Y | Scope | Scope resolver + DTO |
| `companyId` | string | Y | Scope | Scope resolver + DTO |
| `assetCode` | string | Y | Business code (CONT-40) | `^[A-Za-z0-9_:-]{2,64}$` |
| `assetName` | string | Y | Display name | Non-empty |
| `assetType` | string | Y | **`vehicle_type`** for MD-07 | Literal for this UC |
| `ownerModule` | enum | Y | `hrm-admin` \| `operations` \| `finance-tax` | `@IsIn(assetOwnerModules)` |
| `status` | string | N | `active` / `inactive` | Default `active` |
| `vin` | string | N | VIN (real vehicles) | Optional regex when used |
| `chassisNo` | string | N | Chassis | Optional regex when used |
| `metadata` | object | N | Vehicle-type attributes | See below |

**`metadata` fields (vehicle type semantics)**

| Field | Type | Required | Semantics |
|-------|------|----------|-----------|
| `category` | enum | Y | `truck` \| `container` \| `bus` \| `van` \| `pickup` \| `refrigerated` \| `special` |
| `description` | string | N | Description |
| `payloadCapacity` | number | N | Payload (tons) |
| `passengerCapacity` | number | N | Seats (bus) |
| `boxType` | string | N | Box/trailer type |
| `dimensions` | object | N | `{ length, width, height, volume }` meters/m³ |
| `fuelType` | enum | N | `diesel` \| `gasoline` \| `electric` \| `hybrid` |
| `fuelConsumptionNorm` | number | N | L/100km |
| `requiredLicense` | enum | N | `B2` \| `C` \| `D` \| `E` \| `FC` |
| `maintenanceIntervalKm` | number | N | Service interval km |
| `applicableCompanies` | string[] | N | Default `['all']` |

**Uniqueness:** `(tenant_id, company_id, asset_code)`; optional unique `vin` / `chassis_no` per scope when set.

**Module auth:** JWT/header module claim required — `ASSET-OWN-002`, `ASSET-MOD-409` on mismatch.

---

## 7. Data interaction matrix (CRUD)

| UC | Entity | List | Create | Update | Delete | Scope key |
|----|--------|------|--------|--------|--------|-----------|
| MD-01 | positions | GET items | PUT new itemId | PUT same itemId | DELETE | tenant + company |
| MD-02 | vendors | GET | PUT | PUT | DELETE | tenant + company |
| MD-03 | expense_categories | GET | PUT | PUT | DELETE | tenant + company |
| MD-04 | kpi_metrics | GET | PUT | PUT | DELETE | tenant + company |
| MD-05 | customers | GET | PUT | PUT | DELETE | tenant + company |
| MD-06 | partners | GET | PUT | PUT | DELETE | tenant + company |
| MD-07 | vehicle_type asset | GET assets filter | POST | PATCH | soft via status | tenant + company + module |
| UC-XBOS-08 | any whitelist domain | GET | PUT | PUT | DELETE | tenant + company |

---

## 8. Deterministic error mapping (master plane)

| Code | HTTP | Trigger | UC |
|------|------|---------|-----|
| `XBOS-AUTH-001` | 401 | Missing/invalid internal auth | All |
| `SCOPE_CONTEXT_MISMATCH` | 409 | tenant/company ≠ JWT | All scoped |
| `SCOPE_TENANT_REQUIRED` / `SCOPE_COMPANY_REQUIRED` | 400 | Missing scope | All scoped |
| `SCOPE_TENANT_INVALID` / `SCOPE_COMPANY_INVALID` | 400 | Regex fail | All scoped |
| `XBOS-MASTER-400` | 400 | Unknown `domain` | UC-XBOS-08 |
| `XBOS-MASTER-422` | 400 | Empty `itemId` on upsert | UC-XBOS-08 |
| `XBOS-MASTER-200` / `201` / `204` | 2xx | Success | UC-XBOS-08 |
| `XBOS-POS-400` | 400 | Template missing code/name | MD-01 / UC-11 |
| `XBOS-POS-404` | 404 | Template/assignment not found | UC-11 |
| `ASSET-OWN-001` | 403 | Module cannot update field | MD-07 |
| `ASSET-OWN-002` | 400 | Missing/invalid module claim | MD-07 |
| `ASSET-MOD-409` | 409 | Header module ≠ JWT module | MD-07 |

---

## 9. Layer traceability

| Layer | Artifact | MD-01..07 + UC-08 |
|-------|----------|-------------------|
| ADR | `ADR-XBOS-M01-OPENAPI-BOUNDARIES.md` | M01-Master plane |
| OpenAPI | `docs/api/openapi/xbos-api.yaml` | `businessMasterListItems`, `businessMasterUpsertItem`, `businessMasterDeleteItem` |
| **BA data (this doc)** | `docs/xbos/S1_BA_DATA_MD01-08.md` | Field + VAL-MD-* |
| BE | `business-master.service.ts`, `assets.service.ts`, `position-rbac.service.ts` | Implementation |
| FE | `businessMasterApi.ts`, settings pages, `assetRegistryApi.ts` | Consumers |
| DB | `xbos_business_master_entries`, `asset_registry`, `xbos_position_template` | Persistence |
| QA S1 | Extend `test:system:uat` + settings routes in pilot matrix | Per-domain probes |

---

## 10. Data risks & mitigations

| ID | Risk | Mitigation |
|----|------|------------|
| R-MD-01 | Dual SoT positions JSONB vs `xbos_position_template` | Document ownership; ECO-MASTER-02 sync; FE stays on business-master in S1 |
| R-MD-02 | Seed scripts use `companyId=xevn` (tenant slug) | Align seeds to JWT `main` or `holding` per §4; QA probe after seed |
| R-MD-03 | No payload schema validation on BE | QA validates required fields; BE DTO backlog |
| R-MD-04 | MD-07 uses asset registry — different error set | Separate test suite from business-master |
| R-MD-05 | `companies` synthetic fallback masks empty DB | Accept for filter UX; document non-authoritative until seeded |

---

## 11. QA probe commands (business-master)

```powershell
$xbos = 'http://127.0.0.1:28002/api/xbos'
$key = 'xevn-dev-internal-key'
$h = @{ 'x-internal-api-key' = $key; 'x-tenant-id' = 'xevn'; 'x-company-id' = 'holding' }
# List positions (PASS)
Invoke-RestMethod -Uri "$xbos/business-master/positions/items?tenantId=xevn&companyId=holding" -Headers $h
# Unknown domain (400 XBOS-MASTER-400)
Invoke-WebRequest -Uri "$xbos/business-master/not_a_domain/items" -Headers $h -SkipHttpErrorCheck
```

---

## 12. Handoff packet

| Field | Value |
|-------|-------|
| work_item_id | `P1-S1-BA-D-01` |
| from_role | ba-data |
| to_role | pm |
| entry_criteria | P1-S1-SA-01 ADR + OpenAPI M01; S1 backlog item 5 |
| exit_criteria | UC-XBOS-MD-01..07 + UC-XBOS-08 data contract matrix (semantics, validation, SoT); PASS_TO_PM |
| evidence_path | **`docs/xbos/S1_BA_DATA_MD01-08.md`** (this file); `docs/decisions/ADR-XBOS-M01-OPENAPI-BOUNDARIES.md`; `docs/api/openapi/xbos-api.yaml` |
| needed_by | P1-S1-BE-01..03 (DTO/validation), P1-S1-FE-01 (settings), P1-S1-QA-01 (UAT rows) |
| ack_status | **PASS_TO_PM** |
