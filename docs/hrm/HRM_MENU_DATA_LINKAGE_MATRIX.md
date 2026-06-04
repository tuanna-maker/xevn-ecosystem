# HRM — Menu data linkage matrix (COMPLETE)

**work_item_id:** `HRM-FIDELITY-BA-P`  
**Owner:** BA-Process  
**Status:** **COMPLETE** — gate **G-FID-01**  
**Program:** [`HRM_FULL_FIDELITY_PROGRAM.md`](../program/HRM_FULL_FIDELITY_PROGRAM.md)  
**Related:** [`BANG_TONG_HOP_USECASE_HRM.md`](./BANG_TONG_HOP_USECASE_HRM.md) (119 UC) · [`DANH_MUC_XBOS_CHO_HRM.md`](./DANH_MUC_XBOS_CHO_HRM.md) (72 DM) · cardinality rules → `HRM_SEED_CARDINALITY_RULES.md` (BA-Data, pending)

---

## 1. Mục tiêu và phạm vi

### 1.1 Mục tiêu

Khi pilot giả định **≥1000 nhân viên active** (`seed:hrm:1000-uat`), **mọi menu HRM có danh sách nghiệp vụ** phải:

1. Gọi **Nest HRM API** (`/api/hrm/*`) — không Supabase `:54321` bắt buộc trên load.
2. Có **FK hợp lệ** tới `employees.id` (hoặc catalog snapshot) trong cùng `tenant_id` + `company_id`.
3. Dùng **danh mục gốc XBOS** (publish → pull → `synced_catalogs` / settings overlay).
4. Đạt **ngưỡng mật độ** (count / ratio) — L2 smoke «empty+200» **không** đủ cho fidelity gate **G-FID-07**.

### 1.2 Định nghĩa đo lường

| Ký hiệu | Công thức |
|---------|-----------|
| `N_EMP(c)` | `COUNT(*)` từ `employees` WHERE `company_id = c` AND `status = 'active'` AND `archived_at IS NULL` |
| `N_EMP(*)` | Tổng active toàn tenant (rollup group CEO) |
| `R_child(c)` | `COUNT(child rows scoped c)` / `N_EMP(c)` |
| `R_distinct(c)` | `COUNT(DISTINCT child.employee_id WHERE company_id=c)` / `N_EMP(c)` |
| Pilot companies | `holding`, `trsport`, `logistics`, `finance`, `services` (UAT workforce) |

**Baseline DB 2026-05-23** (chưa đạt fidelity — tham chiếu gap):

| Bảng | Count | vs ~1170 NV |
|------|-------|-------------|
| `employees` | 1170 | 100% |
| `employee_contracts` | 101 | ~9% |
| `employee_insurance_records` | 101 | ~9% |
| `attendance_records` | 72 | ~6% |
| `payroll_periods` | 43 | ~4% |
| `job_requisitions` | 11 | ~1% |
| `recruitment_candidates` | 13 | ~1% |
| `leave_requests` | 12 | ~1% |

### 1.3 Quy tắc SoT (bắt buộc)

| Lớp | SoT | HRM đọc qua |
|-----|-----|-------------|
| Danh mục tập đoàn | XBOS `config_catalogs` | `POST /api/hrm/catalog-sync/pull/:catalogKey` hoặc `POST /api/hrm/settings-catalogs/sync-from-xbos` |
| Danh mục mở rộng công ty | XBOS publish + HRM extension | `GET /api/hrm/settings-catalogs` + `hrm_catalog_extension_items` |
| Giao dịch nhân sự | HRM Postgres | List/detail API theo scope JWT |

**XBOS publish (upstream):** `POST /api/xbos/config-sync/catalog/:catalogKey/publish`  
**XBOS read (pull upstream):** `GET /api/xbos/config-sync/catalog/:catalogKey?target=hrm&tenantId=&companyId=`

---

## 2. Ma trận tổng hợp — Menu ↔ UC ↔ API ↔ FK ↔ Catalog

> **Prefix API:** `/api/hrm` (global prefix `apps/api/hrm-api/src/main.ts`).  
> **Scope:** mọi list yêu cầu `Authorization` + `company_id` query/header khớp JWT (`SCOPE_CONTEXT_MISMATCH` → HTTP **409**).

### 2.1 Command Center embed (`/command-center/hrm/:view`)

| Menu key | Route | P-CC | UC chính | UC API liên quan | API list (primary) | Bảng / FK employee | XBOS catalog keys (publish → pull) | Min density (fidelity) |
|----------|-------|------|----------|------------------|-------------------|--------------------|-------------------------------------|------------------------|
| `dashboard` | `/command-center/hrm` hoặc `…/dashboard` | — | UC-HRM-20 | UC-HRM-01, HRM-PR-02, HRM-RC-02, HRM-AT-02 | `GET /operations/reports/summary` | Aggregate counts; không FK trực tiếp | `kpi_library` | Mỗi counter > 0 khi satellite seed xong; tổng NV ≥ 1000 |
| `employees` | `…/employees` | P-CC-03 | UC-HRM-21 | HRM-EM-02, HRM-EM-03 | `GET /employees?page_size=100` | `employees` (master) | `job_titles`, `hrm_employee_basic_fields`, `hrm_employee_*_fields`, dept/position từ tenant catalog | `N_EMP(*) ≥ 1000`; mỗi pilot `N_EMP(c) ≥ 180` |
| `contracts` | `…/contracts` | P-CC-04 | UC-HRM-25 (HĐ) | HRM-CI-03, HRM-CI-01 | `GET /contracts-insurance/contracts` | `employee_contracts.employee_id → employees.id` | `contract_types` (DM §27), `hrm_employee_work_fields.employment_type` | `R_distinct(c) ≥ 0.95` mỗi company có NV |
| `insurance` | `…/insurance` | P-CC-05 | UC-HRM-25 (BHXH) | HRM-CI-02, HRM-CI-07 | **Gap:** `GET /contracts-insurance/insurance` **chưa có** — embed dùng contracts proxy + `GET …/insurance/expiring` | `employee_insurance_records.employee_id → employees.id` | DM §20 BHXH, insurers (DM §20 nhóm) | `R_distinct(c) ≥ 0.95` NV có HĐ active; **R-FID-01** list API |
| `recruitment` | `…/recruitment` | P-CC-06 | UC-HRM-22 | HRM-RC-02, HRM-RC-04 | `GET /recruitment/requisitions`, `GET /recruitment/candidates` | `recruitment_candidates` (optional FK requisition); requisition không bắt buộc FK NV | `recruitment_channels` (DM §39), `job_grades` (DM §37–42) | ≥ **1** requisition open / company; ≥ **3** candidates / requisition |
| `attendance` | `…/attendance` | P-CC-07 | UC-HRM-23 | HRM-AT-02, HRM-AT-11 | `GET /attendance/records`, `GET /attendance/leave-requests` | `attendance_records.employee_id`, `leave_requests.employee_id` | `shifts` (DM §31), `leave_types` (DM §30), workflow §55–56 | ≥ **15** record-days / NV / tháng rolling cho ≥ **80%** NV active / company **hoặc** ≥ **12 000** records group |
| `payroll` | `…/payroll` | P-CC-08 | UC-HRM-24 | HRM-PR-02, HRM-PR-05 | `GET /payroll/payslips`, `GET /payroll/periods` | `payroll_payslips.employee_id → employees.id`; `payroll_periods` theo company | `salary_components` (DM §33–34), `payroll_templates`, `kpi_library` | ≥ **12** periods / company (12 tháng); payslip `R_distinct(c) ≥ 0.90` / kỳ closed gần nhất |
| `decisions` | `…/decisions` | — | UC-HRM-27 | — (backlog) | Chưa có REST — mock embed | — | `decision_types` (DM §28) | Deferred G-FID; empty phải ghi «chưa triển khai API» |
| `tasks` | `…/tasks` | — | HRM-OP-02 | HRM-OP-01 | `GET /operations/tasks` | `hrm_tasks` — **không** FK bắt buộc; `service_requests.employee_id` optional | `operations_request_types` (DM §35) | ≥ **5** tasks / company |
| `internal_services` | `…/internal_services` | — | HRM-SV-02 | HRM-SV- pack | `GET /operations/service-requests` | `service_requests.employee_id` (nullable) + denormalized name/code | DM §35 | ≥ **10** requests / company; ≥ **50%** có `employee_id` hợp lệ |
| `processes` | `…/processes` | — | XBOS-DM-HRM-14 | — | Workflow ref only (XBOS) | — | workflow codes §55–58 | Catalog synced; UI read-only OK |
| `hrm_ai` | `…/hrm_ai` | — | — | — | Không transactional | — | — | Out of fidelity density scope |
| `tools_equipment` | `…/tools_equipment` | — | — | — | Mock / backlog | — | — | Deferred |
| `company` | `…/company` | — | HRM-SC-01 | UC-HRM-03 | Portal tenant-scope + `GET /settings-catalogs` | Membership, không FK NV list | org tree DM §1–6 | ≥ 1 member unit visible group CEO |
| `reports` | `…/reports` | — | HRM-PR-06, HRM-OP-04 | — | `GET /payroll/reports/reconciliation`, `GET /operations/reports/summary` | Derived từ satellite | `kpi_library` | Report row > 0 khi payroll + attendance seeded |
| `settings` | `…/settings` | — | HRM-SC-01..09 | UC-HRM-06..08 | `GET /settings-catalogs`, `POST …/sync-from-xbos` | `synced_catalogs`, extension tables | **All keys §4** | `COUNT(DISTINCT catalog_key) ≥ 8` / company sau full sync |
| `guide` | `…/guide` | — | — | — | Static | — | — | N/A |

### 2.2 Web HRM standalone (`apps/web/hrm` — iframe / direct)

| Route | Module | UC chính | API primary | FK / bảng | Catalog keys | Min density |
|-------|--------|----------|-------------|-----------|--------------|-------------|
| `/employees`, `/employees/:id` | Nhân sự | HRM-EM-02..05 | `GET/POST/PATCH /employees` | `employees` | §2.1 employees | Same as embed |
| `/contracts` | Hợp đồng | HRM-CI-01..06 | `GET/POST/PATCH/DELETE /contracts-insurance/contracts` | `employee_contracts.employee_id` | `contract_types` | R_distinct ≥ 0.95 |
| `/insurance` | Bảo hiểm | HRM-CI-02,07 | `POST …/insurance`, `GET …/insurance/expiring` | `employee_insurance_records.employee_id` | BHXH fields | R_distinct ≥ 0.95 |
| `/recruitment` | Tuyển dụng | HRM-RC-01..06 | `/recruitment/*` | pipeline | recruitment DM §37–42 | §2.1 recruitment |
| `/attendance` | Chấm công | HRM-AT-01..13 | `/attendance/records`, `/update-requests`, `/leave-requests` | all `employee_id` | shifts, leave_types | §2.1 attendance |
| `/payroll` | Lương | HRM-PR-01..06 | `/payroll/periods`, `/payslips`, `/reports/reconciliation` | payslip → employee | salary components | §2.1 payroll |
| `/performance` | Đánh giá | HRM-PF-01..04 | `GET/POST /performance/cycles`, `/evaluations` | `performance_evaluations.employee_id` | `kpi_library` | ≥ 1 cycle active / company; eval ≥ 30% NV / cycle |
| `/company` | Công ty | UC-HRM-03 | Admin + settings | — | org DM §1–6 | Member units seeded |
| `/settings` | Cài đặt | HRM-SC-01..09 | `/settings-catalogs/*`, `/catalog-sync/*` | snapshots | full catalog set | §2.1 settings |
| `/reports` | Báo cáo | HRM-PR-06, HRM-OP-04 | reconciliation + summary | derived | kpi | counters > 0 |
| `/decisions` | Quyết định | UC-HRM-27 | **None** | — | decision_types | Deferred |
| `/tasks` | Công việc | HRM-OP-01..04 | `/operations/tasks` | optional employee on SR | operations types | §2.1 tasks |
| `/internal-services` | DVC nội bộ | HRM-SV-01..06 | `/operations/service-requests` | `employee_id` optional | §35 | §2.1 internal_services |
| `/processes` | Quy trình | XBOS workflow | XBOS ref | — | §55–58 | catalog present |
| `/ai` | UniAI | — | — | — | — | N/A |
| `/tools-equipment` | CCDC | — | backlog | — | — | Deferred |

### 2.3 Mobile HRM (`apps/mobile/hrm-mobile`)

| Màn hình | UC | API | FK | Catalog | Min density (UAT persona) |
|----------|-----|-----|-----|---------|---------------------------|
| Login / Scope | UC-HRM-MOB-01..02 | `POST /auth/mobile/login`, `select-membership`, `refresh` | JWT → `employee_id` | — | Login OK `uat.nv####@xe.vn` |
| Dashboard | UC-HRM-MOB-03 | aggregates | employee scope | — | Shows own attendance/payroll summary |
| Check-in / History | UC-HRM-MOB-04..05 | `POST/GET /attendance/records` | `employee_id` = self | shifts | ≥ 1 record / UAT user / 30 ngày |
| Leave / Update requests | UC-HRM-MOB-06..08 | `/attendance/leave-requests`, `/update-requests` | self `employee_id` | leave_types | ≥ 1 leave sample / 100 NV |
| Payroll summary / Payslip | UC-HRM-MOB-09 | `GET /payroll/payslips?employee_id=` | self | salary | ≥ 1 payslip / UAT NV có HĐ |
| Contract / Insurance | UC-HRM-MOB-10 | contracts + insurance expiring | self | contract_types | ≥ 1 contract / UAT NV |
| Tasks / Service | UC-HRM-MOB-11 | `/operations/*` | optional | §35 | optional pilot |
| Profile | UC-HRM-MOB-12 | `GET /employees/:id` | self | profile fields | Profile 200 |
| Notifications | UC-HRM-MOB-13 | `GET /notifications/inbox` | `employee_id` in payload | — | ≥ 1 notif / active workflow |
| Offline sync | UC-HRM-MOB-14 | queue → POST attendance | idempotent | — | retry PASS |

### 2.4 Nền tảng & đồng bộ (không menu — gate phụ thuộc)

| Khối | UC | API | FK | Catalog |
|------|-----|-----|-----|---------|
| Health | UC-HRM-01 | `GET /`, `GET /metrics` | — | — |
| Catalog pull | UC-HRM-06,07, XBOS-DM-HRM-10 | `POST /catalog-sync/pull/:key`, `GET /catalog-sync/:key`, `GET /catalog-sync` | `synced_catalogs` | per-key |
| Settings sync | HRM-SC-02 | `POST /settings-catalogs/sync-from-xbos` | bulk snapshots | assigned keys |
| Import | HRM-IM-01..04 | `/spreadsheet/import/*`, `/export` | creates `employees` | pre-sync check UC XBOS-DM-HRM-11 |
| Metadata queue | UC-HRM-26, HRM-MD-01..05 | `/employee-metadata/change-requests` | `employee_id` | `employee_profile`, field catalogs |
| Fleet (du lịch) | HRM-FL-01 | `GET /fleet/vehicles` | driver ref in `fleet_fields` (soft) | `hrm_fleet_*` (XBOS-DM-HRM-13) |
| Notifications | UC-HRM-12, HRM-NT-01..02 | `/notifications/inbox` | fanout from attendance/payroll | — |
| Admin | UC-HRM-02..05 | `/admin/*` | user ↔ employee invite | roles DM §11–13 |

---

## 3. Registry catalog keys — XBOS publish / HRM pull

| catalogKey (runtime) | DM § | Menu phụ thuộc | Publish (XBOS) | Pull (HRM) |
|---------------------|------|----------------|----------------|------------|
| `job_titles` | 7–10, 60 | employees, recruitment | `POST …/catalog/job_titles/publish` | `POST /catalog-sync/pull/job_titles` |
| `cost_centers` | finance | payroll, reports | publish | pull |
| `kpi_library` | 63, 71 | dashboard, performance, reports | publish | pull |
| `hrm_employee_basic_fields` | 15 | employees, import | seed/settings + optional publish | `GET /settings-catalogs` |
| `hrm_employee_personal_fields` | 16–17 | employee profile | seed | settings |
| `hrm_employee_work_fields` | 15, 27 | contracts, attendance | seed | settings |
| `hrm_employee_finance_fields` | payroll | payroll | seed | settings |
| `contract_types` | 27 | contracts | publish | pull |
| `leave_types` | 30 | attendance, leave | publish | pull |
| `shifts` | 31 | attendance | publish | pull |
| `payroll_templates` | 32–34 | payroll | publish | pull |
| `recruitment_channels` | 39 | recruitment | publish | pull |
| `job_grades` | 37–42 | recruitment | publish | pull |
| `operations_request_types` | 35 | internal_services | publish | pull |
| `employee_profile` | 15–20 | metadata | publish | pull |
| `hrm_fleet_*` | 46–54 | fleet (du lịch) | XBOS-DM-HRM-13 seed | pull per key |
| `positions` / dept overlay | 3, 8–10 | employees | tenant-position-catalog + XBOS org | `settings-catalogs/seed/tenant-position-catalog` |

**Full sync entry:** `POST /api/hrm/settings-catalogs/sync-from-xbos` (HRM-SC-02) phải pull **tất cả keys** trong cột trên cho mỗi `(tenant_id, company_id)` pilot trước khi chạy `seed:hrm:fidelity`.

---

## 4. Luồng Happy / Alternate / Exception — theo menu

Quy ước mã nhánh: `H-{menu}` happy · `A-{menu}` alternate · `E-{menu}-*` exception.

### 4.1 Nhân sự (`employees`) — UC-HRM-21, HRM-EM-02

| Nhánh | Điều kiện | Kết quả mong đợi | Mã lỗi |
|-------|-----------|------------------|--------|
| **H-EMP** | JWT scope khớp; `N_EMP(c) ≥ 180` | `GET /employees` **200**; `total ≥ page_size`; row hiển thị `employee_code`, `job_title_key` resolved từ catalog | — |
| **A-EMP-empty** | Company mới, chưa seed NV | **200** + `total=0` + banner «Chưa có nhân sự» (không mock che lỗi) | — |
| **A-EMP-page** | `total > 100` | Pagination `page`/`page_size`; FE embed load thêm trang | — |
| **E-EMP-409** | Query `company_id` ≠ JWT company | **409** `SCOPE_CONTEXT_MISMATCH` | scope |
| **E-EMP-401** | Thiếu auth | **401** `HRM-AUTH-001` | auth |
| **E-EMP-catalog** | `job_title_key` không có trong synced catalog | Row vẫn 200; UI badge «catalog missing» (G-FID-06) | HRM-SYNC-404 |

### 4.2 Hợp đồng (`contracts`) — UC-HRM-25, HRM-CI-03

| Nhánh | Điều kiện | Kết quả |
|-------|-----------|---------|
| **H-CON** | `R_distinct(c) ≥ 0.95` | List ≥ 1 row; mỗi `employee_id` ∈ employees; `contract_type` ∈ catalog |
| **A-CON-expiring** | HĐ sắp hết hạn | `GET /contracts/expiring` subset; badge cảnh báo HRM-CI-04 |
| **E-CON-409** | Scope mismatch | 409 |
| **E-CON-orphan** | FK employee không tồn tại | **FAIL fidelity** — seed invalid; QA SQL orphan = 0 |

### 4.3 Bảo hiểm (`insurance`) — UC-HRM-25, HRM-CI-02/07

| Nhánh | Điều kiện | Kết quả |
|-------|-----------|---------|
| **H-INS** | NV có HĐ active + policy | `employee_insurance_records` linked; expiring list 200 |
| **A-INS-proxy** | Chưa có list API | Embed hiển thị từ contracts tab / expiring (**R-FID-01** — BE thêm `GET /insurance`) |
| **E-INS-409** | Scope mismatch | 409 |
| **E-INS-no-policy** | NV có HĐ nhưng thiếu BH | **FAIL** nếu ratio < 0.95 sau fidelity seed |

### 4.4 Tuyển dụng (`recruitment`) — UC-HRM-22, HRM-RC-02/04

| Nhánh | Điều kiện | Kết quả |
|-------|-----------|---------|
| **H-REC** | Pipeline seeded | requisitions ≥ 1/company; candidates ≥ 3/requisition |
| **A-REC-empty** | Company không tuyển | 200 + empty có lý do «Không có chiến dịch» |
| **E-REC-409** | Scope mismatch | 409 |
| **E-REC-dangling** | `candidate.requisition_id` orphan | FAIL fidelity |

### 4.5 Chấm công (`attendance`) — UC-HRM-23, HRM-AT-02/11

| Nhánh | Điều kiện | Kết quả |
|-------|-----------|---------|
| **H-ATT** | Density đạt §2.1 | Records + leave visible; dates ≠ 1970 |
| **A-ATT-manager** | Manager scope | `manager_employee_id` filter subordinates only |
| **E-ATT-409** | Scope mismatch | 409 |
| **E-ATT-1970** | `attendance_date` epoch 0 | **FAIL** L2 instant |

### 4.6 Lương (`payroll`) — UC-HRM-24, HRM-PR-05

| Nhánh | Điều kiện | Kết quả |
|-------|-----------|---------|
| **H-PAY** | ≥ 12 periods / company | Payslips per employee; amounts > 0 |
| **A-PAY-draft** | Kỳ draft | List period; payslip chưa chốt — label rõ |
| **E-PAY-409** | Scope mismatch | 409 |
| **E-PAY-orphan** | payslip.employee_id ∉ employees | FAIL fidelity |

### 4.7 Cài đặt / Catalog (`settings`) — HRM-SC-01..09

| Nhánh | Điều kiện | Kết quả |
|-------|-----------|---------|
| **H-SET** | Post sync-from-xbos | ≥ 8 catalog keys; extension items merged |
| **A-SET-pending-ext** | Extension batch pending | Queue visible; không xóa field live |
| **E-SET-sync** | XBOS down | **502** `HRM-SYNC-001`; UI error recoverable |
| **E-SET-409** | Cross-company pull | 409 scope |

### 4.8 Metadata queue (`decisions` embed / UC-HRM-26) — HRM-MD-02

| Nhánh | Điều kiện | Kết quả |
|-------|-----------|---------|
| **H-META** | Pending requests | `GET /employee-metadata/change-requests?status=pending` ≥ 1 linked employee |
| **A-META-empty** | No pending | 200 empty |
| **E-META-409** | Approve wrong company | HRM-META-409 |

### 4.9 Vận hành (`tasks`, `internal_services`) — HRM-OP/SV

| Nhánh | Điều kiện | Kết quả |
|-------|-----------|---------|
| **H-OPS** | Seeded | tasks ≥ 5/co; SR ≥ 10/co; ≥ 50% SR có valid `employee_id` |
| **E-OPS-bad-employee** | SR `employee_id` invalid UUID | **400** validation |

### 4.10 Mobile (representative)

| Nhánh | Điều kiện | Kết quả |
|-------|-----------|---------|
| **H-MOB** | UAT account + scope | Own records only |
| **E-MOB-scope** | Wrong membership | 403 / re-select scope |

---

## 5. Acceptance criteria (AC-FID) — measurable

| AC ID | Menu / gate | Pass (FAIL nếu không đạt) | Evidence |
|-------|-------------|----------------------------|----------|
| **AC-FID-01** | Global workforce | Sau `seed:hrm:1000-uat`: `N_EMP(*) ≥ 1000` | SQL count / seed log |
| **AC-FID-02** | employees | Mỗi pilot company `N_EMP(c) ≥ 180` (±10% tolerance 162) | `verify-hrm-menu-density` |
| **AC-FID-03** | contracts | `R_distinct(c) ≥ 0.95` ∀ c ∈ pilot companies | orphan FK = 0 |
| **AC-FID-04** | insurance | Same ratio vs NV có HĐ active | list or expiring + SQL |
| **AC-FID-05** | attendance | Group records ≥ **12 000** OR per-company 80% NV ≥ 15 days/month | SQL + API total |
| **AC-FID-06** | leave | `leave_requests` ≥ **100** group (≥ 1/100 NV) | SQL |
| **AC-FID-07** | payroll periods | ≥ **60** group (12 × 5 companies) | SQL |
| **AC-FID-08** | payslips | Latest closed period: `R_distinct(c) ≥ 0.90` | API + SQL |
| **AC-FID-09** | recruitment | ≥ **5** requisitions group; ≥ **15** candidates; ≥ 3 cand/req avg | SQL |
| **AC-FID-10** | settings catalogs | ≥ **8** distinct `catalog_key` in `synced_catalogs` per pilot company | GET settings-catalogs |
| **AC-FID-11** | metadata | ≥ **20** pending or historical change requests linked to real employees | API |
| **AC-FID-12** | operations | tasks ≥ **25** group; service_requests ≥ **50** group | SQL |
| **AC-FID-13** | performance | ≥ **5** cycles; evaluations ≥ **300** group | SQL |
| **AC-FID-14** | scope RBAC | Group CEO sees rollup; member CEO sees only own co; HRBP dept filter — **0** cross-company rows | QA persona matrix |
| **AC-FID-15** | UI fidelity | No menu shows «empty OK» when API 4xx/5xx; no required `:54321` | L2 matrix + G-FID-06 |
| **AC-FID-16** | catalog lineage | 100% transactional rows use catalog codes present in synced snapshot for all keys §3 |

**Tolerance policy:** Ratio thresholds use **floor** (0.95 → pass at 0.950); counts use **≥** integer; waivers require PM + QC owner + expiry (Definition of Done gate).

---

## 6. Business rules (linkage)

| BR ID | Condition | Action | Outcome |
|-------|-----------|--------|---------|
| **BR-LINK-01** | Menu có list UI | API list phải filter `company_id` = JWT scope | Rows ⊆ company |
| **BR-LINK-02** | Child có `employee_id` | FK must resolve `employees.id` same company | Orphan = 0 |
| **BR-LINK-03** | Field `*_type`, `*_key`, status enum | Value ∈ XBOS catalog item `code` | Mismatch → metadata queue or seed fix |
| **BR-LINK-04** | Group CEO rollup | Query may aggregate pilot companies; không trả NV company ngoài tenant | Multi-company view |
| **BR-LINK-05** | Catalog SoT | HRM không hardcode danh mục tập đoàn; read snapshot | ADR catalog |
| **BR-LINK-06** | Attendance → Payroll | Cùng scope + kỳ; không FK trực tiếp nhưng **process checkpoint** cùng employee set | Reconciliation report |
| **BR-LINK-07** | Insurance list gap (R-FID-01) | Until `GET /insurance`, fidelity SQL on table; UI may use expiring | BA-Data tracks |

---

## 7. RBAC personas (QA fidelity matrix)

| Persona | Account | JWT scope | Must see (min rows) | Must NOT see |
|---------|---------|-----------|---------------------|--------------|
| Group CEO | `ceo@xe.vn` | tenant rollup | `N_EMP(*) ≥ 1000`; satellite sums > smoke | — |
| Member CEO | `du-lich.ceo@xe.vn` | single company | Only subsidiary employees + linked data | Other companies' rows |
| HRBP | dept-scoped HR | company + dept | Dept subtree employees + their contracts/attendance | Other depts |
| Mobile UAT | `uat.nv####@xe.vn` | self | Own payslip, attendance, leave | Other employees |

**role_code → filter predicate:** chi tiết scope ladder → `ADR-HRM-RBAC-SCOPE-LADDER.md` (SA, HRM-FIDELITY-SA).

---

## 8. Verification commands (QA / DevOps)

```bash
pnpm run seed:hrm:1000-uat          # workforce baseline (AC-FID-01)
pnpm run seed:hrm:fidelity          # satellite from workforce (Dev-BE — AC-FID-03..09)
pnpm run verify:hrm:menu-density    # scripted ratios (G-FID-07)
```

**SQL probes (manual):**

```sql
-- Orphan contracts
SELECT COUNT(*) FROM employee_contracts c
LEFT JOIN employees e ON e.id = c.employee_id AND e.company_id = c.company_id
WHERE e.id IS NULL;

-- Distinct contract coverage ratio (holding example)
SELECT COUNT(DISTINCT c.employee_id)::float / NULLIF(
  (SELECT COUNT(*) FROM employees WHERE company_id='holding' AND status='active'), 0
) FROM employee_contracts c WHERE c.company_id='holding' AND c.status='active';
```

---

## 9. Handoff package

| To role | work_item_id | Entry | Exit | Evidence |
|---------|--------------|-------|------|----------|
| **BA-Data** | HRM-FIDELITY-BA-D | Matrix §2–§5 | `HRM_SEED_CARDINALITY_RULES.md` + scope data matrix | This doc §5 AC-FID-* |
| **SA** | HRM-FIDELITY-SA | §7 personas | `ADR-HRM-RBAC-SCOPE-LADDER.md` | ADR + OpenAPI scope |
| **Dev-BE** | HRM-FIDELITY-BE | AC-FID-03..09 gaps | `seed-hrm-satellite-from-workforce.mjs` + `GET /insurance` (R-FID-01) | seed log + SQL |
| **Dev-FE** | HRM-FIDELITY-FE | G-FID-06 | Count badges; no false empty | L2 screenshots |
| **QA** | HRM-FIDELITY-QA | AC-FID-01..16 | `verify-hrm-menu-density` PASS + persona matrix | `docs/qa/evidence/hrm-fidelity-*` |
| **QC** | G-FID-08 | G-FID-01..07 closed | GO / NO-GO | QC evidence MD |

**Open risks**

| ID | Risk | Owner | Trigger |
|----|------|-------|---------|
| R-FID-01 | No `GET /contracts-insurance/insurance` list | Dev-BE | AC-FID-04 UI block |
| R-FID-02 | `decisions`, `tools_equipment` no API | PM | UC-HRM-27 scope |
| R-FID-03 | Current DB ~9% contract coverage vs 95% target | Dev-BE + DevOps | Before QC GO |

---

## 10. Traceability index — 119 UC → menu (summary)

| Nhóm UC (count) | Menu(s) chính | § matrix |
|-----------------|---------------|----------|
| XBOS-DM-HRM-01..15 (15) | settings, XBOS Command Center | §2.4, §3 |
| UC-HRM-01..08 (8) | platform, catalog-sync | §2.4 |
| HRM-AT-01..13 (13) | attendance, mobile | §2.1, §2.3 |
| HRM-SV + HRM-OP (10) | internal_services, tasks | §2.1 |
| HRM-EM (5) | employees | §2.1 |
| HRM-PR (6) | payroll | §2.1 |
| HRM-RC (6) | recruitment | §2.1 |
| HRM-CI (7) | contracts, insurance | §2.1 |
| HRM-MD (5) | metadata / decisions embed | §4.8 |
| HRM-SC (9) | settings | §4.7 |
| HRM-IM (4) | import (settings/spreadsheet) | §2.4 |
| HRM-PF (4) | performance | §2.2 |
| HRM-FL (1) | fleet (du lịch) | §2.4 |
| UC-HRM-20..27 (8) | embed all views | §2.1 |
| UC-HRM-MOB-01..15 (15) | mobile | §2.3 |

**Coverage:** 119/119 UC mapped to ≥1 menu/module or platform block; menus deferred (`decisions`, `tools_equipment`, `hrm_ai`) flagged explicit.

---

*Document version: 2026-05-24 · BA-Process · HRM-FIDELITY-BA-P · ack PASS_TO_PM*
