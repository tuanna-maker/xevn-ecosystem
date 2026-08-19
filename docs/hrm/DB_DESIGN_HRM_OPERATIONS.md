# DB_DESIGN — HRM Operations (tasks + reports aggregate)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-OPERATIONS-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | khách `SRS_HRM_KHACH.md` **§3.45–3.48 FR-HRM-OP-01..04** · team matrix OP / menu `tasks` · `reports` |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§16.5** FR-HRM-OP-01..04 · **§17.1** `hrm_tasks` · aggregate summary · twin `service_requests` (FR-HRM-11 cite) |
| **ref_api** | `docs/hrm/API_DESIGN_HRM_OPERATIONS.md` |
| **ref_align** | Scope UUID filter `pushCompanyIdUuidFilter` · persist map `resolveHrmOperationsPersistCompanyId` · soft emp on SR · TEXT-slug siblings (Payroll/Leave/ATT) must_keep |
| **Template** | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` |
| **U71** | Physical DB before Dev claim on Operations OP-01..04 |
| **Date** | 2026-07-27 |
| **Runtime ensure** | `OperationsService.ensureSchema` (`CREATE TABLE IF NOT EXISTS` + SR index) |

> **must_keep:** Do **not** rewrite W2 slice · Payroll · Leave · ATT · Auth/Tenant · RACI/WF/catalog-gov/KPI pairs. U65 honest empty. Soft `employee_id` on service_requests (G-DB-02).  
> **Out of scope this slice:** Fleet FL-01 · Admin invite · Import preview · full FR-HRM-11 F.1 body (twin cited for summary counts only).

---

## 0. Inventory

| Store | Role | `company_id` physical | Soft/Hard |
|-------|------|----------------------|-----------|
| **`public.hrm_tasks`** | Công việc vận hành — OP-01/02/03 SoT | **UUID** + API slug→UUID map | Soft company (no FK to LE) |
| **`public.service_requests`** | Twin svc — FR-HRM-11; counted in OP-04 summary | **UUID** + same map | Soft optional `employee_id` |
| **Reports aggregate** | OP-04 — no dedicated table | Counts via scope on `hrm_tasks` + `service_requests` (+ cross-domain text/workforce tables) | Read-only |

> **Physical fact (Plane):** DDL stores `company_id` as **UUID** (pilot map `HRM_COMPANY_UUID_BY_SLUG`). Wire/JWT still Plane B slug (`main`/`holding`/…). API maps before persist/list via `resolveHrmOperationsPersistCompanyId` / `pushCompanyIdUuidFilter`. Residual **G-OP-PLANE-01** — optional TEXT migration (same class as Metadata G-MD-PLANE-01); **not** a wipe of this design.

---

## 1. Table SoT — `public.hrm_tasks`

| Item | Value |
|------|--------|
| Schema | `public` |
| Table | **`hrm_tasks`** |
| Owner | `hrm-api` · `OperationsService` |
| Consumers | Embed/App Công việc · FR-OP-01/02/03 · OP-04 `tasks` count |
| `ref_srs` | **FR-HRM-OP-01** #5/#6/#8 · **OP-02** #2/#5 · **OP-03** #6/#7 |

### 1.1 Columns (physical)

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `id` | UUID PK | NO | Khóa công việc | OP-01 #5/#8 khóa mang |
| **`company_id`** | **UUID NOT NULL** | NO | Partition đơn vị (mapped từ slug) | OP-01 #4 · SCOPE |
| `title` | TEXT NOT NULL | NO | Tiêu đề | OP-01 #3 |
| `description` | TEXT | YES | Mô tả | OP-01 input |
| `priority` | TEXT NOT NULL | NO | `low` \| `medium` \| `high` | Create DTO |
| `status` | TEXT NOT NULL DEFAULT `'todo'` | NO | `todo` \| `in_progress` \| `done` \| `blocked` | OP-03 SM |
| `due_date` | DATE | YES | Hạn xử lý | OP-01 input |
| `created_at` / `updated_at` | TIMESTAMPTZ NOT NULL | NO | Audit | List ORDER BY |

### 1.2 Constraints / indexes

| Name / definition | Purpose |
|-------------------|---------|
| `chk_hrm_task_priority` | Domain priority |
| `chk_hrm_task_status` | Lifecycle statuses for OP-03 |
| **Recommended** `idx_hrm_tasks_company_status` `(company_id, status, created_at DESC)` | List + summary count by scope (runtime may ADD IF NOT EXISTS — Dev residual) |
| Scope list | `pushCompanyIdUuidFilter` — never LE UUID as workforce key without map |

### 1.3 Status machine (tasks)

```text
todo ──► in_progress ──► done
  │            │
  └──── blocked ◄──┘   (CHK cho phép mọi giá trị ∈ set; transition matrix chặt = residual nếu BA khóa)
```

| Transition | Guard (current runtime) | Error |
|------------|-------------------------|-------|
| Any → status ∈ set | Row in scope (`assertResourceInHrmScope`) | `HRM-OPS-404` / `HRM-OPS-409` |
| Invalid enum | DTO `@IsIn` | 400 validation |
| SRS “chuyển cấm” | Not fully enforced beyond CHK | Residual G-OP-03 (Info/P2) |

### 1.4 Gaps vs SRS (documented — do not invent columns as DONE)

| Gap | Spec says | Physical / DTO now | Sev |
|-----|-----------|-------------------|-----|
| **G-OP-01** | Người được giao + loại/nhóm việc (optional) | **No** `assignee_*` / `task_type` columns | P2 → Dev when sponsor opens |
| **G-OP-02** | Lọc status/loại/keyword | List = page + `company_id` only | P2 |
| **G-OP-PLANE-01** | Prefer TEXT slug spine (Leave/Payroll) | UUID persist + map | P2 optional migrate |

**Cấm:** seed tasks for QA; persist LE UUID without map; claim assignee DONE without column+DTO+SRS delta.

---

## 2. Twin cite — `public.service_requests` (FR-HRM-11 · summary only)

| Item | Value |
|------|--------|
| Role | Yêu cầu dịch vụ (meal/vehicle/supply…) — **not** primary OP-01..03 SoT |
| Why in this file | OP-04 `getSummary` returns `service_requests` count with UUID scope mode |
| Soft/Hard | Soft optional `employee_id`; UUID `company_id` same map as tasks |
| Index (runtime) | `idx_service_requests_company_status (company_id, status, created_at DESC)` |
| Full F.1 | TechSpec **§16.3** FR-HRM-11 — separate API body if PM opens `SA-U71-HRM-SVC-REQ-DESIGN-*` |

Key columns (cite — do not duplicate FR-11 depth here): `id`, `company_id` UUID, `service_type`, `employee_id` soft, `employee_name`, `request_date`, `status` (`pending`…), type-specific nullable fields, approve/reject audit.

---

## 3. Reports aggregate (no table) — FR-HRM-OP-04

| Item | Value |
|------|--------|
| Store | Derived counts — **not** a materialised report table |
| Runtime | `OperationsService.getSummary` |
| Scope | `resolveHrmListScope` then per-table count mode |

| Metric key | Source table | Scope mode |
|------------|--------------|------------|
| `tasks` | `hrm_tasks` | `company_uuid` |
| `service_requests` | `service_requests` | `company_uuid` |
| `attendance_records` | `attendance_records` | `workforce` (cite ATT pair) |
| `payroll_periods` | `payroll_periods` | `company_text` (cite Payroll pair) |
| `job_requisitions` | `job_requisitions` | `company_text` (cite Recruitment pair) |

**Rules:** empty = zeros / honest empty UI (G-OP-04 FE VERIFY). **Cấm** fake non-zero when counts are 0. Cross-domain tables **must_keep** — Operations design does not redefine ATT/Payroll/Recruitment DDL.

---

## 4. Dual-plane / scope invariants

| Rule | Detail |
|------|--------|
| Wire / JWT | Plane B slug (`main`, `holding`, members) |
| Persist OP tables | UUID via `HRM_COMPANY_UUID_BY_SLUG` · `main` group → `holding` UUID |
| List / mutate parity | Same `resolveHrmListScope` + `assertResourceInHrmScope` on PATCH status |
| Cấm | Filter by LE UUID as if it were slug; cast TEXT slug tables with `::uuid` |

---

## 5. must_keep / non-goals

| Keep | Path |
|------|------|
| W2 Performance/Decisions/Metadata/Mobile | `DB_DESIGN_HRM_W2_SLICE.md` |
| Payroll / Leave / ATT / Employees / Recruitment / Settings / CO-HC | prior `docs/hrm/DB_DESIGN_HRM_*` |
| XBOS Auth/Tenant · KPI · RACI · WF · catalog-gov | `docs/xbos/DB_DESIGN_XBOS_*` |
| Fleet | Next `SA-U71-HRM-FLEET-DESIGN-01` — **not** this file |

---

## 6. Trace → API

| FR | Primary write/read | Table / store |
|----|--------------------|---------------|
| OP-01 | `POST …/operations/tasks` | INSERT `hrm_tasks` |
| OP-02 | `GET …/operations/tasks` | SELECT `hrm_tasks` |
| OP-03 | `PATCH …/tasks/:id/status` | UPDATE `hrm_tasks.status` |
| OP-04 | `GET …/operations/reports/summary` | Aggregate counts |

Paired contract: `docs/hrm/API_DESIGN_HRM_OPERATIONS.md`.
