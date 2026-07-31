# HRM dashboard & chart — data quality rules (BR-DQ)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-DQ-DATA-CONTRACT-01` · `P1-PROD-INT-BA-D-01` · **`PCOMP-W0-BA-D-01`** · **`GWC-HRM-RPT-HEADCOUNT-01`** |
| **incident** | User 2026-06-07 — recruitment UI hiển thị **CÔNG TY CỔ PHẦN 1OFFICE** (mock) ≠ XBOS org-foundation |
| **full evidence** | [`p1-hrm-dq-data-contract-20260607.md`](../program/governance/p1-hrm-dq-data-contract-20260607.md) · [`p1-prod-int-ba-d-01-20260607.md`](../program/governance/p1-prod-int-ba-d-01-20260607.md) · [`pcomp-w0-ba-d-01-20260607.md`](../program/governance/pcomp-w0-ba-d-01-20260607.md) |
| **execution fix** | `P1-HRM-DQ-REC-MOCK-01` (dev-fe) · `P1-PROD-INT-BE-01` (slug map + reconciliation) |
| **ack_status** | `PASS_TO_PM` (ba-data) |

---

## BR-EXEC-01 — No user-visible mock when API mode on (product completion)

> **Program rule (`P1-PRODUCT-COMPLETE`):** When `isHrmApiDataMode()` is true, portal embed runtime is active, or mock fallback is disabled — **cấm** mọi dữ liệu user-visible (bảng, chart, KPI, nhãn công ty/phòng ban) từ static demo arrays hoặc `HRM_MOCK_*` fallback. API rỗng → empty state (BR-MOCK-01); API lỗi → banner (BR-MOCK-02) — **không** fiction im lặng.

| Sub-rule | When | Expected |
|----------|------|----------|
| BR-EXEC-01a | API 200 + `data=[]` | Empty state — no `const data = [...]` |
| BR-EXEC-01b | API 4xx/5xx | Error banner — no `previewMockRows` / `MOCK_SEED` |
| BR-EXEC-01c | Chart/KPI mount | Scoped API call precedes render OR skeleton |
| BR-EXEC-01d | Company/dept axis label | BR-DQ-01 join — no demo tenant strings |
| BR-EXEC-01e | Profile/recruitment widgets | API-backed or hidden — no `radarChartData` / `monthlyPerformanceData` constants |

**Mock inventory & probes:** [`pcomp-w0-ba-d-01-20260607.md`](../program/governance/pcomp-w0-ba-d-01-20260607.md) §3–§7 (M-HRM-01..06, REC-EXEC-GREP-W1/W2).

---

## BR-DQ-01 — Chart / KPI labels MUST be API-backed (no static tenant fiction)

**Rule:** Mọi nhãn trục, legend, tooltip và KPI trên **HRM dashboard**, **recruitment dashboard tab**, và **báo cáo embed** phải lấy từ **aggregate hoặc dimension đã scope** — **cấm** chuỗi tên công ty/phòng ban hardcode (vd. `1OFFICE`, `Chi nhánh HCM - Echard Phong…`).

**Allowed label sources (ưu tiên theo thứ tự):**

| Layer | SoT | API / hook | Dùng cho |
|-------|-----|------------|----------|
| **Legal entity / công ty thành viên** | XBOS org-foundation | `GET /api/xbos/org-foundation/legal-entities` · embed: `tenantScopeApi.fetchGroupMemberUnits()` | Bar/pie theo **công ty** (group CEO rollup) |
| **Phòng ban** | HRM `departments` (sync catalog ← XBOS) | `GET /api/hrm/departments?company_id=` | Bar theo **phòng ban** |
| **Recruitment metrics** | HRM transactional | `GET /api/hrm/recruitment/candidates`, `…/requisitions`, `…/recruitment-plans` | Count, stage, trend — group-by `department_id` / `company_id` slug rồi **join** tên từ hai hàng trên |
| **Operations summary** | HRM aggregate | `GET /api/hrm/operations/reports/summary` | Counter dashboard chính (`HRM_MENU_DATA_LINKAGE_MATRIX` §dashboard) |

**Scope (U19):** Cùng `tenantId` + `companyId=main` + rollup semantics với list API (`PILOT_SCOPE_DATA_MATRIX.md`). Label từ legal entity **ngoài** JWT scope → **không** render.

**Fail closed UI:** API empty → empty state / skeleton — **không** fallback mock tenant names.

### BR-DQ-01a — G-INT-02 Label join (operating slug vs member legal entity)

Hai **plane** dữ liệu — **không** join nhầm:

| Chart group-by | Label SoT | Cấm |
|----------------|-----------|-----|
| `employees.company_id` ∈ `GROUP_MEMBER_SLUGS` | `company_slug_map.display_name` (target) hoặc §5 trong [`p1-prod-int-ba-d-01-20260607.md`](../program/governance/p1-prod-int-ba-d-01-20260607.md) | Dùng `group-member-units.name` trực tiếp (Plane A) |
| Member tenant / legal entity | `group-member-units` · `legal-entities.name` | Dùng slug code (`trsport`) làm nhãn hiển thị |
| `department_id` | `GET /api/hrm/departments` → `name` | Tên chi nhánh fiction; `Khác` chỉ khi orphan có telemetry |

### BR-DQ-01b — G-INT-03 Cardinality (XBOS member units ↔ HRM partitions)

- **5** slug vận hành trên master (`holding`, `trsport`, `logistics`, `finance`, `services`) phải có ≥1 NV active + row `company_slug_map` + dept catalog.
- **4** member tenant XBOS (`xe-tmdv`, `visun`, `xe-du-lich`, `xe-vietnam`) là Plane A — map sang slug qua bridge (dev-be), không giả định 1:1 cho đến khi reconciliation script PASS.
- Probe: [`p1-prod-int-ba-d-01-20260607.md`](../program/governance/p1-prod-int-ba-d-01-20260607.md) §7.

---

## Validation IDs (QA / Dev-FE)

| ID | Condition | Expected |
|----|-----------|----------|
| VAL-DQ-01 | Chart Y-axis / legend text | Mỗi chuỗi ∈ union(legal entity `name`, department `name`) từ API scope hiện tại |
| VAL-DQ-02 | Grep `1OFFICE\|mockData\|const data = [` trong recruitment + dashboard FE | **0** hit production path (trừ comment/test fixture có tag `@mock-allowed`) |
| VAL-DQ-03 | Group CEO `ceo@xe.vn` · P-CC-06 recruitment dashboard tab | Không nhãn công ty không thuộc seed XeVN (`holding`, `trsport`, `logistics`, `finance`, `services`) |
| VAL-DQ-04 | `RecruitmentBarChart` dept axis | Values = `COUNT(candidates)` grouped by resolved department name |
| VAL-DQ-05 | `RecruitmentLineChart` trend | Months from `created_at` aggregate — không series `01/2023`… cố định |
| VAL-INT-02-01 | Chart by `company_id` slug | Label ∈ §5 display names | Không `Khác` khi slug có NV và map row |
| VAL-INT-02-02 | Chart by `department_id` | Join `departments` | `Khác` + telemetry nếu orphan |
| VAL-INT-03-01 | Master workforce | 5 distinct slugs in `employees` | REC-INT-SQL-01 |
| VAL-INT-03-03 | `company_slug_map` | 5 rows `tenant_id=xevn` | UUID khớp `HRM_COMPANY_UUID_BY_SLUG` |
| VAL-INT-03-06 | scope_parity | List id under `main` rollup | get-by-id **200** |
| VAL-EXEC-01 | API mode on · P-CC-03..08 | BR-EXEC-01 | Zero demo tenant strings in DOM |
| VAL-EXEC-02 | Attendance weekly view | No `weeklyAttendanceData` render | REC-EXEC-GREP-W1-02 exit 0 |
| VAL-EXEC-05 | W1 grep bundle post-FE | M-HRM-01..06 | All REC-EXEC-GREP-W1-* PASS |
| VAL-EXEC-06 | W2 portal grep post-FE | M-CC-01..06 | REC-EXEC-GREP-W2-* PASS |

---

## BR-DQ-HEADCOUNT-01 — Employee count semantics (total vs active vs archived)

> **GWC-HRM-RPT-HEADCOUNT-01 (2026-07-17):** Reports «Biến động NS» **Nhân viên hiện tại = 1041** vs Nhân sự list subtitle **1107** — **by-design**, not page-size undercount. Evidence: `docs/qa/evidence/gwc-hrm-rpt-headcount-01-20260717.md`.

### Operational definitions (same JWT scope `companyId=main`)

| Metric | API field | SQL predicate (rollup scope) | UI surfaces | Dev8088 pilot (2026-07-17) |
|--------|-----------|------------------------------|-------------|----------------------------|
| **N_EMP active** (`Nhân viên hiện tại` / `Đang làm việc`) | `GET /employees/summary` → `active_count` | `status = 'active'` AND `archived_at IS NULL` | Dashboard tile «Đang làm việc»; Reports tab **Biến động NS** KPI «Nhân viên hiện tại»; turnover `totalActive` override | **1041** |
| **Workforce total (non-archived)** | `summary.total` **or** `GET /employees` pagination `total` | `archived_at IS NULL` (no `status` filter on default list) | Dashboard «Tổng nhân viên»; Employees list subtitle `… - {total}` | **1107** |
| **Inactive (non-archived)** | `summary.inactive_count` | `status = 'inactive'` AND `archived_at IS NULL` | (no dedicated tile today) | **66** |
| **Archived** | `summary.archived_count` | `archived_at IS NOT NULL` | Excluded from default list unless `include_archived=true` | **0** |

**Identity (pilot):** `active_count + inactive_count = total` when `archived_count = 0` → `1041 + 66 = 1107`.

**SoT cross-refs:**

- `HRM_MENU_DATA_LINKAGE_MATRIX.md` §1.2 — `N_EMP(c)` = **active** only (fidelity / satellite ratios).
- `HRM_SEED_CARDINALITY_RULES.md` §3.1 — seed target **N** = active headcount (~6% inactive pattern in workforce).
- `employees.service.ts` — list default: non-archived, **all statuses**; summary aggregates split `active` / `inactive` / `archived`.
- `useReportsData.ts` — turnover uses `active_count` via `totalActiveOverride` (fixes prior ~95 page-1 bug).

### Acceptance criteria (delta)

| AC-ID | Surface | Must show | Must NOT |
|-------|---------|-----------|----------|
| **AC-HC-01** | Reports → Biến động NS → «Nhân viên hiện tại» | `employees/summary.active_count` same scope | `employees` page-1 `.length`; `summary.total` |
| **AC-HC-02** | Employees list subtitle / pagination total | `GET /employees` `total` (non-archived, default status filter) | `active_count` unless UI filter `status=active` |
| **AC-HC-03** | Dashboard (UC-HRM-20) | **Both** «Tổng nhân viên» = `total` **and** «Đang làm việc» = `active_count` | Single ambiguous headcount tile |
| **AC-HC-04** | Cross-surface compare | Compare only metrics with **matching definition** | Fail QA when comparing `active_count` to list `total` without documenting inactive delta |

### Validation IDs

| ID | Condition | Expected |
|----|-----------|----------|
| VAL-HC-01 | `ceo@xe.vn` · `company_id=main` · `GET /employees/summary` | `active_count + inactive_count = total` (±0); `archived_count` documented |
| VAL-HC-02 | Reports turnover «Nhân viên hiện tại» | Equals `active_count` from same summary call used on load |
| VAL-HC-03 | Employees list subtitle | Equals list API `total`; if ≠ `active_count`, inactive delta explainable via `inactive_count` |
| VAL-HC-04 | scope_parity | List employee id under rollup → get-by-id **200** (unchanged) |

### P2 UX polish (non-blocking — optional dev-fe)

| Item | Issue | Owner |
|------|-------|-------|
| Reports overview card | May bind `active_count` while label reads «Tổng nhân viên» (`OverviewReportTab`) | **dev-fe** — use `total` or relabel «Đang làm việc» |
| Employees list subtitle | «Danh sách nhân viên - 1107» does not state includes **66** inactive | **dev-fe** — optional breakdown tooltip/subtitle |

**Defect class:** **Not dev-be** — API contract correct (`HRM-EMP-SUMMARY-200`). Prior defect was page-1 undercount (~95); **closed** by summary wiring.

---

## Traceability pointer

Recruitment widgets: [`p1-hrm-dq-data-contract-20260607.md`](../program/governance/p1-hrm-dq-data-contract-20260607.md) §4.

**M-HRM-01..06** (attendance, payroll, reports, employee perf, candidate radar, headcount): [`pcomp-w0-ba-d-01-20260607.md`](../program/governance/pcomp-w0-ba-d-01-20260607.md) §4.

Cardinality + label join: [`p1-prod-int-ba-d-01-20260607.md`](../program/governance/p1-prod-int-ba-d-01-20260607.md) §5–§8.

**Journey:** J-HRM-05 (P-CC-06) · J-HRM-06 (P-CC-07) · J-HRM-07 (P-CC-08) — retest chart/label parity after W1 mock closure, not chỉ list 200.
