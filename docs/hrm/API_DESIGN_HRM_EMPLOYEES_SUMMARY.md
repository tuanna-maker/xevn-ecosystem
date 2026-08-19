# API_DESIGN — `GET /api/hrm/employees/summary` (Company headcount + dashboard aggregates)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-CO-HC-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | `docs/hrm/SRS.md` **UC-HRM-CO-01** / **FR-HRM-CO-HC-01** — sequence «GET employees summary company_id main» → «total và by_company theo slug» · **AC-CO-EMP-01..06** |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§19.2–§19.5** |
| **ref_db** | `docs/hrm/DB_DESIGN_HRM_CO_HC.md` |
| **ref_control** | `docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md` §3 |
| **OpenAPI** | `docs/api/openapi/hrm-api.yaml` → `operationId: getEmployeesSummary` · schema `EmployeeSummary` |
| **Template** | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` (Mục đích · Nghiệp vụ · Bước SRS) |
| **U71** | Physical API slice before Dev/QA claim on Company headcount |
| **Date** | 2026-07-27 |
| **Consumers** | Company Management enrich · Dashboard Nhân sự · FE bind `employee_count` / card «Tổng nhân viên» |

> **Cấm tuyệt đối:** trả hoặc chấp nhận **XBOS legal-entity UUID** làm khóa Plane B trong `by_company[].company_id` hoặc như SoT filter workforce thay slug.

---

## 1. Endpoint — Employee summary (headcount SoT)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/employees/summary` |
| Query | `company_id` — `CompanyIdQuery` (`main` \| operating slug) — **same** as `GET /employees` |
| Headers | `x-tenant-id`, `x-company-id` (JWT parity) |
| Optional query | `keyword`, `status` (`active`\|`inactive`), `include_archived` |
| OpenAPI | `getEmployeesSummary` · `EmployeeSummary` |
| Runtime | `EmployeesController` → summary builder (`employee-summary.ts`) + `resolveHrmListScope` / `buildEmployeeListFilters` |
| Auth | Bearer / internal API key |
| Success | `200` · code **`HRM-EMP-SUMMARY-200`** · envelope §5 |

---

### Mục đích

Cấp **một round-trip** tổng hợp nhân sự trong scope JWT để:

1. **Card «Tổng nhân viên»** trên Company Management / Dashboard = `data.total` (rollup Group CEO `company_id=main`).
2. **Cột «Số nhân viên»** từng ĐVTV = `data.by_company[].total` khớp **operating slug** sau bridge BR-INT-05 — **không** đếm theo UUID pháp nhân Plane A.
3. Phụ: breakdown phòng ban, payroll range, new hires (Dashboard) — **không** thay SoT headcount Company.

API này là **SoT headcount** cho màn Công ty (Plane B). XBOS `group-member-units` **không** sở hữu số NV.

---

### Nghiệp vụ xử lý

1. **Auth / scope:** Resolve caller JWT → `resolveHrmListScope` (**same helper** as `GET /employees` — U19 scope_parity).
2. **Query `company_id`:**
   - `main` (Group CEO) → `companyIds = HRM_GROUP_MEMBER_COMPANY_SLUGS` (5 slugs).
   - Single slug (`holding`…`services`) → filter that slug only.
   - Known pilot UUID → **merge to slug** before filter; **unknown UUID dropped** — never emit UUID in `by_company[].company_id`.
3. **DB aggregate:** `GROUP BY employees.company_id` under master tenant partition (`custom_fields.tenant_id` / default `xevn`) + archive/status filters from query — see `DB_DESIGN_HRM_CO_HC.md` §5.
4. **Build `by_company[]`:**
   - Keys **only** Plane B slugs: `holding` \| `trsport` \| `logistics` \| `finance` \| `services`.
   - Group CEO `main`: **always length 5**, **zero-fill** missing slugs (`total=0`, counts=0).
   - Single slug: length **1**.
5. **Rollup fields:** `data.company_id` echoes request scope (`main` or slug); `data.total` / status counts = sum of in-scope rows (non-archived definition aligned Dashboard).
6. **Does not** join `xbos_legal_entity`. Does not invent LE→slug bridge (FE/registry owns bridge before bind).
7. **Does not** return industry / MST / founded (Plane A — `API_DESIGN_HRM_COMPANY_LIST`).

---

### Tham chiếu bước SRS

| # | UC | Sequence / Diễn biến (SRS UC-HRM-CO-01) | API role |
|---|----|------------------------------------------|----------|
| 1 | **UC-HRM-CO-01** | «Mở menu Công ty» | Entry — UI only |
| 2 | **UC-HRM-CO-01** | «Lấy group-member-units» → «Danh sách ĐVTV pháp nhân» | Plane A — **not this API** (`API_DESIGN_HRM_COMPANY_LIST`) |
| 3 | **UC-HRM-CO-01** | «Map tên LE sang operating slug» (Bridge BR-INT-05) | FE/registry — prerequisite before bind |
| 4 | **UC-HRM-CO-01** / **FR-HRM-CO-HC-01** | **«GET employees summary company_id main»** | **This endpoint** |
| 5 | **UC-HRM-CO-01** | **«total và by_company theo slug»** | Response `data.total` + `data.by_company[]` |
| 6 | **UC-HRM-CO-01** Happy | «Card Tổng NV và cột Số nhân viên» | FE bind § FE contract below |
| 7 | **UC-HRM-CO-01** Exception | «Hiển thị gạch ngang không ép 0» | FE on non-2xx / unmapped — API may still 401/5xx |

**Usecases table mapping:** Happy / Alternate (0 NV) / Exception API fail / Exception unmapped LE → AC-CO-EMP-01..06.

---

### Request ↔ scope

| Input | Maps to | DB / helper |
|-------|---------|-------------|
| Query `company_id=main` | Rollup 5 slugs | `resolveHrmListScope` → `company_id = ANY(slugs)` |
| Query `company_id=logistics` | One ĐVTV workforce | `company_id = 'logistics'` |
| Header `x-tenant-id` | Tenant partition | `custom_fields->>'tenant_id'` coalesce |
| `include_archived=true` | Include archived in aggregates | Drop default `archived_at IS NULL` |
| `status=active` | Narrow counts | `status` filter |
| **`company_id=<LE UUID>`** (unknown) | **Dropped / no UUID key emitted** | **Cấm** success path VAL-CO-HC-03 |

---

### Response DTO ↔ DB (headcount-critical)

Envelope: `{ success, code: "HRM-EMP-SUMMARY-200", data: EmployeeSummary }`.

| DTO field | Type | DB / rule | UI bind (Company) |
|-----------|------|-----------|-------------------|
| `data.company_id` | string | Echo scope (`main` \| slug) | Scope context |
| **`data.total`** | integer ≥ 0 | COUNT non-archived in scope (default) | **Card «Tổng nhân viên»** |
| `data.active_count` | integer ≥ 0 | `status=active` ∧ non-archived | Optional / Dashboard |
| `data.inactive_count` | integer ≥ 0 | `status=inactive` ∧ non-archived | Optional |
| `data.archived_count` | integer ≥ 0 | `archived_at IS NOT NULL` | Optional |
| **`data.by_company[]`** | array **required** | Aggregates `GROUP BY employees.company_id` + zero-fill | Per-row enrich |
| **`by_company[].company_id`** | enum slug | **`employees.company_id` TEXT slug only** | Join key = `operating_slug` |
| **`by_company[].total`** | integer ≥ 0 | COUNT per slug | **`employee_count` / «Số nhân viên»** |
| `by_company[].active_count` | integer ≥ 0 | Per-slug active | If AC specifies active-only |
| `by_company[].inactive_count` | integer ≥ 0 | Per-slug inactive | — |
| `by_company[].archived_count` | integer ≥ 0 | Per-slug archived | — |
| `data.payroll` / `by_department` / `salary_ranges` / `new_hires` | … | Dashboard aggregates | **Not** Company column SoT |

**Cardinality:**

| Query `company_id` | `by_company.length` | Behavior |
|--------------------|---------------------|----------|
| `main` | **Always 5** | Zero-fill missing slugs |
| One of five slugs | **1** | That unit only |

**Sample (Group CEO):**

```http
GET /api/hrm/employees/summary?company_id=main
x-tenant-id: xevn
Authorization: Bearer <group_ceo>
```

```json
{
  "success": true,
  "code": "HRM-EMP-SUMMARY-200",
  "data": {
    "company_id": "main",
    "total": 1109,
    "active_count": 1050,
    "inactive_count": 57,
    "archived_count": 3,
    "by_company": [
      { "company_id": "holding", "total": 120, "active_count": 110, "inactive_count": 10, "archived_count": 0 },
      { "company_id": "trsport", "total": 400, "active_count": 380, "inactive_count": 20, "archived_count": 0 },
      { "company_id": "logistics", "total": 250, "active_count": 240, "inactive_count": 10, "archived_count": 0 },
      { "company_id": "finance", "total": 180, "active_count": 170, "inactive_count": 10, "archived_count": 0 },
      { "company_id": "services", "total": 157, "active_count": 150, "inactive_count": 7, "archived_count": 0 }
    ]
  }
}
```

---

### Errors

| Condition | HTTP / code | FE (SRS Exception) | Forbidden |
|-----------|-------------|--------------------|-----------|
| Unauthenticated | `401` · `HRM-AUTH-001` | Banner; count cells **«—»** | `null \|\| 0` |
| Scope mismatch / conflict | `409` · scope codes | **«—»** + scope message | Fake 0 |
| Timeout / 5xx / network | transport fail · logical `HRM-CO-HC-API` | **«—»** + toast | Treat as 0 success |
| LE unmapped to slug (FE) | N/A (API may 200) | **«—»** · `HRM-CO-HC-SLUG-UNMAPPED` | COUNT with LE UUID |
| Slug mapped + 2xx + `total=0` | `200` | Display **0** (real empty) | Show «—» for empty workforce |
| Response missing `by_company` | Contract break | Interim N× slug summary **or** «—»; **not** AC PASS on stub | Silent null stub |

Maps **AC-CO-EMP-04** · **VAL-CO-HC-05** · **BR-CO-EMP-02** · TECHSPEC §19.4.

---

## 2. FE bind contract (Company Management — copy into Dev/QA Task)

```text
MUST:
  1) Load Plane A list (group-member-units) for profile
  2) Bridge each ĐVTV → operating_slug (TECHSPEC §19.1 / registry)
  3) One GET /api/hrm/employees/summary?company_id=main
  4) employee_count = by_company.find(r => r.company_id === operating_slug)?.total
  5) Card «Tổng nhân viên» = data.total  (OR sum of known slug totals — not both)
  6) API fail / unmapped → UI «—» (never null||0 / ??0)

MUST NOT:
  - GET summary?company_id=<xbos_legal_entity.id>
  - Treat by_company[].company_id as UUID
  - Hardcode employee_count: null then || 0
  - Use XBOS group-member-units as headcount SoT
  - Mix industry bind into this API (see API_DESIGN_HRM_COMPANY_LIST)
```

| Surface | PASS | FAIL |
|---------|------|------|
| Card Tổng NV | ≈ `data.total` / Dashboard same session | Card 0 when summary > 0 |
| Cột Số NV | `by_company[slug].total` after bridge | All 0 via LE UUID / stub |
| Network | `company_id=main` (or slug); no LE UUID query | `company_id=<uuid>` |
| F5 | Same numbers + 2xx | F5 → all 0 |

---

## 3. Scope parity (U19 — gate)

| Pair | Rule |
|------|------|
| `GET /employees` ↔ `GET /employees/summary` | **Same** `resolveHrmListScope` + company filter builder |
| List get-by-id | Same scope resolver family — fail GO if summary diverges |
| Evidence | Jest `be-hrm-co-emp-count-01` · `hrm-list-scope.spec.ts` |

---

## 4. Orthogonal surfaces (do not redefine)

| Concern | API / design |
|---------|----------------|
| ĐVTV list + industry | `API_DESIGN_HRM_COMPANY_LIST.md` · TECHSPEC §20 |
| Plane A columns DB | `DB_DESIGN_HRM_COMPANY_DISPLAY.md` |
| Plane B keys DB | `DB_DESIGN_HRM_CO_HC.md` |
| Control checklist | `DATA_LINKAGE_BE_FE_QA_CONTROL.md` |

---

## 5. QA evidence expectations (U65 · browser)

```markdown
### UF-HRM-CO-HC — Số nhân viên màn Công ty
- Persona / URL: ceo@xe.vn · /command-center/hrm/company
- Dashboard Nhân sự (cùng session): N=
- Card Tổng nhân viên: N=
- Cột theo dòng: holding=… trsport=… logistics=… finance=… services=…
- Network: GET /api/hrm/employees/summary?company_id=main → 200 HRM-EMP-SUMMARY-200
  - by_company.length=5 · slugs only (no LE UUID keys)
  - query company_id is main or slug — not LE UUID
- FE sau 2xx: cột/card khớp by_company / total; không overlay lỗi
- F5: giữ số
- Verdict: 🟢 / 🔴
- spec_ref: UC-HRM-CO-01 Diễn biến #4–6 · TECHSPEC §19 · DB_DESIGN_HRM_CO_HC · API_DESIGN_HRM_EMPLOYEES_SUMMARY · AC-CO-EMP-*
```

**Cấm seed** / API inbox fake / PASS chỉ probe JSON without FE click path.

---

## 6. Out of scope / must_keep

| must_keep | forbidden |
|-----------|-----------|
| Industry API_DESIGN pair | Wipe industry files |
| OpenAPI `EmployeeSummary.by_company` enum slugs | Emit LE UUID as `by_company[].company_id` |
| Dual-plane doctrine | Persist LE UUID onto `employees.company_id` for UI cosmetics |
| U65 zero-seed | Seed workforce solely for QA PASS |

**Out of scope:** Employees CRUD mutate API_DESIGN; XBOS org PUT; changing JWT ladder.
