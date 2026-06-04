# HRM seed cardinality & scope rules

**work_item_id:** `HRM-FIDELITY-BA-D`  
**program:** `HRM-FULL-FIDELITY-01` · gate **G-FID-02**  
**from_role:** ba-data  
**to_role:** pm  
**ack_status:** `PASS_TO_PM`  
**related:** [`PILOT_SCOPE_DATA_MATRIX.md`](../qa/PILOT_SCOPE_DATA_MATRIX.md) · [`HRM_MENU_DATA_LINKAGE_MATRIX.md`](HRM_MENU_DATA_LINKAGE_MATRIX.md) · [`HRM_FULL_FIDELITY_PROGRAM.md`](../program/HRM_FULL_FIDELITY_PROGRAM.md) · [`DANH_MUC_XBOS_CHO_HRM.md`](DANH_MUC_XBOS_CHO_HRM.md)

---

## 1. Purpose

Deterministic **row-count targets** and **scope predicates** for HRM satellite data so seed scripts, list APIs, and QA density checks agree. Given **N active employees** per `company_slug`, every menu in the pilot embed must have linked rows — not merely HTTP 200 with empty lists.

Implementation consumers: `seed-hrm-satellite-from-workforce.mjs` (planned), `pnpm run verify:hrm:menu-density`, Dev-BE list API scope audit, QA persona matrix.

---

## 2. Identifier layers (do not conflate)

Aligned with [`PILOT_SCOPE_DATA_MATRIX.md`](../qa/PILOT_SCOPE_DATA_MATRIX.md) §2–§4.

| Layer | Field | Master pilot (`ceo@xe.vn`) | Member pilot (`du-lich.ceo@xe.vn`) | HRM row partition |
|-------|-------|----------------------------|-------------------------------------|-------------------|
| **Tenant** | `tenant_id` / `tenantId` | `xevn` | `xe-du-lich` | `employees.custom_fields.tenant_id` (required for member rows) |
| **JWT / API scope** | `companyId` | **`main`** | **`main`** | Must match JWT on every HRM REST call |
| **Operating unit** | `company_slug` | `holding`, `trsport`, `logistics`, `finance`, `services` | **`main`** (single legal bucket) | `employees.company_id` and satellite `company_id` |
| **XBOS org (catalog only)** | `company_id` on publish | `holding` | `main` | **Not** used as HRM list query for embed CEO |
| **Mobile attendance** | `company_uuid` | derived `stableUuid(tenant, company_slug)` | JWT claim | Body/query UUID on attendance writes |

**Anti-patterns (expect 409):**

- `company_id=xevn` on HRM API (tenant slug used as company) → `SCOPE_CONTEXT_MISMATCH`
- HRM-defined catalog keys without XBOS publish → reject at fidelity gate (§8)

---

## 3. Baseline: N active employees per `company_slug`

### 3.1 Definition of N

```text
N(C) = COUNT employees
  WHERE company_id = C                          -- company_slug
    AND status = 'active'
    AND archived_at IS NULL
    AND (custom_fields->>'tenant_id' = :tenant OR (:tenant = 'xevn' AND company_id IN GROUP_MEMBER_SLUGS))
```

| Symbol | Value (master UAT) | Notes |
|--------|-------------------|-------|
| `GROUP_MEMBER_SLUGS` | `holding`, `trsport`, `logistics`, `finance`, `services` | `scripts/lib/uat-workforce.mjs` |
| `C` | one slug from table above | Round-robin workforce: 1000 NV → **N ≈ 188–200** active per slug (≈6% inactive pattern) |
| Member tenant | `C = main` only | Tourism / subsidiary pilots |

### 3.2 Required satellite counts (per `company_slug` C, given N = N(C))

| Entity / menu | Table | Min count | Formula / rule ID | FK / linkage |
|---------------|-------|-----------|-------------------|--------------|
| Nhân sự | `employees` | **N** | CARD-EMP-01 | — |
| Hợp đồng | `employee_contracts` | **⌈N × 0.95⌉** | CARD-CON-01      | `employee_id` → `employees.id`, same `company_id` slug |
| Bảo hiểm | `employee_insurance_records` | **⌈N × 0.95⌉** | CARD-INS-01 | one policy per employee with active contract |
| Chấm công | `attendance_records` | **max(⌈N × 0.20⌉, 20)** per rolling month | CARD-ATT-01 | `employee_id`, `company_id` (UUID or slug per table schema) |
| Nghỉ phép | `leave_requests` | **max(5, ⌈N × 0.05⌉)** | CARD-LVE-01 | `employee_id`; mix `pending` / `approved` / `rejected` |
| Kỳ lương | `payroll_periods` | **≥ 12 per slug per calendar year** (pilot: **≥ 2** open/closed) | CARD-PAY-01 | same `company_id` slug |
| Phiếu lương | `payroll_payslips` | **⌈N × 0.95⌉ per `processed` period** | CARD-PAY-02 | `period_id`, `employee_id` |
| Tuyển dụng — requisition | `job_requisitions` | **≥ 2 per slug** | CARD-REC-01 | same `company_id` slug |
| Tuyển dụng — ứng viên | `recruitment_candidates` | **≥ 1 per open requisition** | CARD-REC-02 | `requisition_id` |
| Phỏng vấn (optional) | `recruitment_interviews` | **≥ 1 per candidate in pipeline** | CARD-REC-03 | `candidate_id` |

### 3.3 Global rollup (group CEO view)

For **group CEO** on master tenant, **total visible rows** = sum over all `C ∈ GROUP_MEMBER_SLUGS` of counts above. QA script `verify-hrm-menu-data-density.mjs` uses **global** thresholds:

| Check | Global minimum (current script defaults) |
|-------|------------------------------------------|
| `employees` | ≥ 1000 |
| `contracts / active employees` | ≥ 0.85 |
| `insurance / active employees` | ≥ 0.85 |
| `attendance_records` | ≥ ⌊active_total × 0.02⌋ |
| `payroll_periods` | ≥ 10 |
| `job_requisitions` | ≥ 5 |
| `recruitment_candidates` | ≥ 5 |
| `leave_requests` | ≥ 5 |

Dev-BE seed must satisfy **per-slug CARD-* rules** first; global verify script is the backstop.

---

## 4. RBAC scope matrix — who sees what

### 4.1 Group CEO (`ceo@xe.vn`)

| Aspect | Rule |
|--------|------|
| **JWT after portal login** | `tenantId=xevn`, `companyId=main`, `roleCode=group_ceo` |
| **API headers / query** | `x-tenant-id: xevn`, `x-company-id: main`, `company_id=main` on HRM REST |
| **Row filter (target)** | All HRM rows in master partition: `tenant_id=xevn` (via `custom_fields`) across **all** `GROUP_MEMBER_SLUGS` |
| **XBOS-only paths** | Group catalog / `group-member-units` — `companyId=holding` on **XBOS API only** (see PILOT_SCOPE §4) |
| **Must see** | Aggregated counts ≥ sum of CARD-* across member slugs |
| **Must NOT see** | Rows with `custom_fields.tenant_id` of member tenants (`xe-du-lich`, …) |

### 4.2 Member company CEO (e.g. `du-lich.ceo@xe.vn`)

| Aspect | Rule |
|--------|------|
| **JWT** | `tenantId=xe-du-lich`, `companyId=main`, `roleCode=subsidiary_ceo` |
| **API scope** | `x-tenant-id: xe-du-lich`, `x-company-id: main` |
| **Row filter** | `custom_fields.tenant_id = 'xe-du-lich'` AND `company_id = 'main'` |
| **Must see** | CARD-* counts for **N(main)** only |
| **Must NOT see** | Master tenant rows; **403** on `GET /tenant-scope/group-member-units` (`XBOS-TENANT-403`) |

### 4.3 Dept HRBP (`*.hr@xe.vn`, `HRBP_MANAGER`, `HR_SPECIALIST`)

| Aspect | Rule |
|--------|------|
| **JWT** | Same tenant/company as employer entity (`main` + member or master slug set) |
| **Row filter** | `company_id = :effective_slug` **AND** `custom_fields->>'department' = :dept` (pilot: single dept from seed) |
| **Must see** | Subset of employees in assigned department; satellite rows only for those `employee_id`s |
| **Must NOT see** | Other departments' employees or cross-tenant rows |
| **Count rule** | CARD-* applied to **N(C, dept)** = active employees in that dept, not whole company |

**Note:** Full RBAC ladder (manager chain, hat keys) → `ADR-HRM-RBAC-SCOPE-LADDER.md` (HRM-FIDELITY-SA). This section fixes **data-scope predicates** for seed and list API tests.

---

## 5. Multi-membership leader rules

Leaders may hold **multiple memberships** (portal) and/or **multiple employee rows** (HRM/mobile).

| ID | Condition | Rule | Expected outcome |
|----|-----------|------|------------------|
| MEM-01 | User has >1 row in `xbos_user_tenant_membership` | Login returns `memberships[]` with distinct `(tenantId, companyId)` | Portal shows tenant switcher; default = `is_default` membership |
| MEM-02 | User selects non-default membership | New JWT issued with **selected** `tenantId` + `companyId` only | All API headers match new JWT |
| MEM-03 | Mobile employee with multiple rows (same email) | `POST /auth/mobile/login` returns `memberships[]`; `is_primary_membership` in `custom_fields` picks default | Scope screen before home |
| MEM-04 | Seed data for dual-hat leader | One row per `(tenant_id, company_slug)` OR explicit XBOS memberships + one HRM row per hat | Each scope satisfies CARD-* independently |
| MEM-05 | API call under scope A | Row filter uses **current** JWT only | No rows from scope B (empty list or 404/409 — deterministic per endpoint) |
| MEM-06 | `admin@xe.vn` (super dev) | Membership on master + each member tenant | QA: switching tenant changes visible row counts per §4.1 / §4.2 |

**Pilot accounts:**

| Email | Memberships | Seed note |
|-------|-------------|-----------|
| `ceo@xe.vn` | `xevn` / `group_ceo` | Single membership; group rollup |
| `admin@xe.vn` | Master + all member tenants | Multi-membership switcher QA |
| `du-lich.ceo@xe.vn` | `xe-du-lich` only | Isolated member scope |
| `uat.nv####@xe.vn` | Single employee row each | UAT workforce; not multi-hat |

---

## 6. Catalog source of truth (user requirement)

| ID | Rule | Expected result |
|----|------|-----------------|
| CAT-01 | All HRM catalog keys (positions, departments, contract types, leave types, shifts, insurers, salary components, …) | Published on **XBOS** `xbos_business_master_entries` or config catalogs |
| CAT-02 | HRM ingestion | `POST /api/hrm/catalog-sync/pull/:key` or `settings-catalogs/sync-from-xbos` only |
| CAT-03 | HRM seed | Satellite rows reference catalog codes that exist in synced snapshot — no ad-hoc labels (e.g. contract type must map to XBOS item) |
| CAT-04 | Group employee import template | `pnpm seed:hrm:group-employee-catalog` → XBOS-backed field defs |
| CAT-05 | Violation | Fidelity gate **FAIL** — treat as data defect, not “empty UI OK” |

Reference keys per menu: [`HRM_MENU_DATA_LINKAGE_MATRIX.md`](HRM_MENU_DATA_LINKAGE_MATRIX.md), [`DANH_MUC_XBOS_CHO_HRM.md`](DANH_MUC_XBOS_CHO_HRM.md).

---

## 7. Validation matrix (cardinality + scope)

| ID | Condition | Expected result |
|----|-----------|-----------------|
| VAL-CARD-01 | After `seed:hrm:fidelity`, count contracts for slug C | ≥ ⌈N(C) × 0.95⌉ |
| VAL-CARD-02 | Insurance rows for slug C | ≥ ⌈N(C) × 0.95⌉ |
| VAL-CARD-03 | Attendance for slug C (month window) | ≥ max(⌈N×0.20⌉, 20) |
| VAL-CARD-04 | Leave requests for slug C | ≥ max(5, ⌈N×0.05⌉) |
| VAL-CARD-05 | Payroll periods for slug C | ≥ 2 (pilot) / 12 (production target) |
| VAL-CARD-06 | Payslips for last `processed` period | ≥ ⌈N(C) × 0.95⌉ |
| VAL-CARD-07 | Requisitions + candidates per C | ≥ 2 reqs, ≥ 1 candidate per req |
| VAL-SCOPE-01..08 | As in [`PILOT_SCOPE_DATA_MATRIX.md`](../qa/PILOT_SCOPE_DATA_MATRIX.md) | No 409 on valid CEO scope |
| VAL-RBAC-01 | Group CEO list employees | Count ≥ sum of N(C) across GROUP_MEMBER_SLUGS |
| VAL-RBAC-02 | Member CEO | Count = N(main) for that tenant only |
| VAL-RBAC-03 | HRBP | Count = N(C, dept) |
| VAL-CAT-01 | Catalog codes on contracts/leave | All codes exist in `hrm_catalog_snapshots` post-sync |

---

## 8. Traceability

| Requirement | This doc | Implementation / test |
|-------------|----------|-------------------------|
| User: 1000+ NV with linked menu data | §3 CARD-* | `seed-hrm-satellite-from-workforce.mjs`, `verify-hrm-menu-data-density.mjs` |
| User: catalogs from XBOS only | §6 CAT-* | `seed-hrm-group-employee-catalog.mjs`, catalog-sync API |
| G-FID-02 | Full document | QA G-FID-07, Dev-BE HRM-FIDELITY-BE |
| Scope / 409 class | §4, VAL-SCOPE-* | `scope-context.ts`, PILOT_SCOPE_DATA_MATRIX |
| Multi-membership | §5 MEM-* | `auth.service.ts`, `mobile-auth.service.ts`, ADR (SA) |
| Menu linkage | §3 table | HRM_MENU_DATA_LINKAGE_MATRIX |

---

## 9. Handoff packet

| Field | Value |
|-------|-------|
| work_item_id | `HRM-FIDELITY-BA-D` |
| from_role | ba-data |
| to_role | pm |
| entry_criteria | HRM-FULL-FIDELITY-01 dispatched; PILOT_SCOPE_DATA_MATRIX published |
| exit_criteria | Cardinality rules + RBAC scope matrix + multi-membership seed rules documented; linked to menu matrix and XBOS catalog policy |
| evidence_path | **`docs/hrm/HRM_SEED_CARDINALITY_RULES.md`** (this file) |
| needed_by | HRM-FIDELITY-BE (seed), HRM-FIDELITY-QA (density + personas), HRM-FIDELITY-SA (ADR alignment) |
| ack_status | **PASS_TO_PM** |

---

## 10. Data risks

| ID | Risk | Mitigation |
|----|------|------------|
| R-CARD-01 | JWT `companyId=main` vs row slugs | BE list APIs must apply group rollup predicate (§4.1); until fixed, QA may see under-count on `company_id=main` queries |
| R-CARD-02 | UUID vs text `company_id` columns | Seed must detect via `information_schema` (see `seed-full-ecosystem.mjs`) |
| R-CARD-03 | Catalog code drift | Run sync-from-xbos before fidelity seed; VAL-CAT-01 |
| R-CARD-04 | Multi-membership scope leak | MEM-05 + tenant switch re-auth |
