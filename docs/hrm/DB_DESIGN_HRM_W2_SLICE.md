# DB_DESIGN — HRM W2 slice (Performance · Decisions · Metadata · Mobile)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-W2-SLICE-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | khách `SRS_HRM_KHACH.md` **§3.20 FR-HRM-PF-01** · **§3.31 FR-HRM-MD-01** · **§3.41–3.44 FR-HRM-MOB-01/04/06/08** · **§3.50 FR-HRM-27** · team UC-HRM-27 · UC-HRM-MOB-* · `SRS_MOBILE.md` |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§16.1** PF-01 · **§16.2** MD-01 · **§16.3** MOB-* · **§16.5** FR-27 · **§17.1** rows performance / metadata / decisions / JWT · `TECHSPEC_MOBILE.md` §5.2 |
| **ref_api** | `docs/hrm/API_DESIGN_HRM_W2_SLICE.md` |
| **ref_align** | Soft emp hub `DB_DESIGN_HRM_EMPLOYEES.md` · Plane B TEXT slug (CO-HC / Leave / ATT / Payroll must_keep) · Settings catalog `decision_types` (SC-DEC) |
| **Template** | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` |
| **U71** | Physical DB batch before Dev claim on W2 P2 Performance / Decisions / Metadata / Mobile |
| **Date** | 2026-07-27 |
| **Runtime ensure** | `PerformanceService.ensureSchema` · `DecisionsService.ensureSchema` · `EmployeeMetadataRepository.ensureSchema` · mobile JWT (no session table) |

> **must_keep:** Do **not** rewrite CO-HC / Employees / Leave / ATT / Payroll / Recruitment / Settings / XBOS Auth·KPI·RACI·WF·catalog-gov pairs. U65 honest empty. Soft `employee_id` (G-DB-02).  
> **Out of scope this slice:** OP/FL/admin/import preview · leftover MOB-02/03/05/07/09 (G-MOB-LEFT) · advance/overtime orphans (G-DB-05).

---

## 0. Batch inventory

| Domain | Table(s) / store | `company_id` physical | Soft/Hard |
|--------|------------------|-----------------------|-----------|
| **A — Performance** | `performance_cycles` · `performance_evaluations` | **TEXT slug** (Plane B) | Soft emp · **Hard** `cycle_id` |
| **B — Decisions** | `hr_decisions` | **TEXT slug** (Plane B) | Soft emp optional |
| **C — Metadata** | `employee_metadata_change_requests` · `employee_metadata_values` · `employee_metadata_audit_logs` | **UUID** persist + API slug→UUID (`resolveHrmCompanyUuidForSlug`) | Soft emp · soft/hard audit→request |
| **D — Mobile auth** | *(JWT session — no table)* · optional `employees.custom_fields.mobile_password_hash` | Claims Plane B slug | Cite `TECHSPEC_MOBILE.md` |
| **D′ — Mobile mutate** | Reuse ATT / Leave tables | TEXT slug (existing pairs) | Cross-cite ATT_SHEET / LEAVE |

---

## A. Performance — `public.performance_cycles`

| Item | Value |
|------|--------|
| Owner | `hrm-api` · `PerformanceService` |
| Consumers | Embed / App hiệu suất · FR-PF-01 · eval create |
| `ref_srs` | **FR-HRM-PF-01** Diễn biến #2–#9 |

### A.1 Columns

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `id` | UUID PK | NO | Khóa chu kỳ | PF-01 #9 khóa mang |
| **`company_id`** | **TEXT NOT NULL** | NO | Đơn vị vận hành (slug) | PF-01 #6 · SCOPE |
| `cycle_name` | TEXT NOT NULL | NO | Tên chu kỳ | PF-01 #3 |
| `start_date` / `end_date` | DATE NOT NULL | NO | Khoảng đánh giá | PF-01 #4 |
| `status` | TEXT NOT NULL DEFAULT `'draft'` | NO | `draft` \| `active` \| `closed` | PF-01 #8 trạng thái |
| `created_by` | TEXT | YES | Người tạo | Audit |
| `created_at` / `updated_at` | TIMESTAMPTZ NOT NULL | NO | Audit | List ORDER BY |

### A.2 Constraints / indexes

| Name / definition | Purpose |
|-------------------|---------|
| `chk_performance_cycle_status` | Lifecycle draft/active/closed |
| `chk_performance_cycle_dates` (`start_date <= end_date`) | PF-01 #4 → `HRM-PERF-001` |
| `idx_performance_cycles_company_status` `(company_id, status, start_date DESC)` | List by scope |
| App overlap (when policy cấm) | Same scope overlapping open cycles → reject (PF-01 #5) — document residual if not yet enforced |

**Cấm:** persist LE UUID; auto-bulk evaluations on cycle create (PF-01 Quy tắc).

---

## A′. Performance — `public.performance_evaluations`

| Item | Value |
|------|--------|
| Role | Phiếu đánh giá theo NV × chu kỳ — catalog sau PF-01 (TechSpec §17.1 note) |
| Soft/Hard | **HARD** `cycle_id` → cycles CASCADE · **SOFT** `employee_id` |

### A′.1 Columns

| Column | Type | Null | Meaning (VI) | Soft/Hard |
|--------|------|------|--------------|-----------|
| `id` | UUID PK | NO | Khóa phiếu đánh giá | — |
| **`company_id`** | **TEXT NOT NULL** | NO | Slug (denorm từ cycle) | Plane B |
| **`employee_id`** | UUID NOT NULL | NO | Hồ sơ NV | **SOFT** → employees |
| **`cycle_id`** | UUID NOT NULL | NO | Chu kỳ | **HARD** `REFERENCES performance_cycles(id) ON DELETE CASCADE` |
| `score` | NUMERIC(5,2) NOT NULL | NO | Điểm 0–100 | CHK |
| `summary` | TEXT NOT NULL | NO | Nhận xét | — |
| `reviewer` | TEXT NOT NULL | NO | Người đánh giá | — |
| `created_at` / `updated_at` | TIMESTAMPTZ NOT NULL | NO | Audit | — |

### A′.2 Indexes

| Name | Purpose |
|------|---------|
| `idx_performance_evaluations_company_cycle` `(company_id, cycle_id, created_at DESC)` | List by cycle |
| `chk_performance_score` (`score` 0..100) | Domain |

---

## B. Decisions — `public.hr_decisions`

| Item | Value |
|------|--------|
| Owner | `hrm-api` · `DecisionsService` |
| Consumers | Embed UC-HRM-27 · FR-HRM-27 |
| `ref_srs` | **FR-HRM-27** Diễn biến #2–#9 |

### B.1 Columns

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `id` | UUID PK | NO | Khóa QSĐ | #6/#9 khóa mang |
| **`company_id`** | **TEXT NOT NULL** | NO | Slug đơn vị | SCOPE · #8 |
| `decision_code` | TEXT NOT NULL | NO | Mã QSĐ (auto nếu trống) | #6 |
| `decision_type` | TEXT NOT NULL DEFAULT `'appointment'` | NO | ∈ catalog `decision_types` (FR-HRM-SC-DEC-01) | #5 · W2e |
| `title` | TEXT NOT NULL | NO | Tiêu đề | #5 |
| `content` | TEXT | YES | Nội dung | — |
| `employee_id` | UUID | YES | NV liên quan | **SOFT** optional |
| `employee_name` | TEXT NOT NULL | NO | Tên hiển thị / snapshot | List paint |
| `employee_code` | TEXT | YES | Mã NV | — |
| `department` / `position` | TEXT | YES | Snapshot nhãn (U72) | — |
| **`position_key`** | TEXT | YES* | Soft → Settings `job_titles` / `positions` (**E1-A ADD**) | FR-HRM-SC-POS-01 · `DB_DESIGN_HRM_MD_BIND_E1A.md` §4 |
| `effective_date` / `expiry_date` / `signing_date` | DATE | YES | Ngày hiệu lực / hết / ký | Form |
| `signer_name` / `signer_position` | TEXT | YES | Người ký / snapshot chức danh | — |
| **`signer_position_key`** | TEXT | YES | Soft catalog code người ký (**E1-A ADD**) | FR-HRM-SC-POS-01 · E1-A §4 |
| `file_url` | TEXT | YES | File đính kèm | POST files |
| `status` | TEXT NOT NULL DEFAULT `'draft'` | NO | Trạng thái QSĐ | List filter |
| `notes` | TEXT | YES | Ghi chú | — |
| `created_at` / `updated_at` | TIMESTAMPTZ NOT NULL | NO | Audit | ORDER BY |

### B.2 Indexes / rules

| Name / rule | Purpose |
|-------------|---------|
| `idx_hr_decisions_company_id` | Scope list |
| `idx_hr_decisions_decision_type` | Filter loại |
| Catalog assert | `assertCodeInEffectiveCatalog(decision_types)` → `HRM-DEC-TYPE` |
| Position keys (E1-A) | `assertCodeInEffectiveCatalog(job_titles)` → `HRM-DEC-POS-KEY` / `HRM-DEC-SIGNER-POS-KEY` — see `API_DESIGN_HRM_MD_BIND_E1A.md` |
| Scope parity | list / get-by-id / PATCH / DELETE dùng cùng `resolveHrmListScope` + `assertResourceInHrmScope` |

**Cấm:** free-text `decision_type` ngoài catalog; free-text `position` / `signer_position` làm SoT sau E1-A cutover; seed QSĐ để pass density; copy «chưa triển khai» khi empty (FR-27 #3/#4).

> **DOC-DELTA 2026-07-28 (`BA-ERP-E1A-DB-API-01`):** APPEND `position_key` / `signer_position_key`. DDL apply = Dev execution WI — not this governance file alone.

> **DOC-DELTA 2026-07-28 (`BA-ERP-E3-DB-API-01`):** Performance E3 — cycle PATCH/DELETE rules + evaluation **`status` SM** (`draft→submitted→approved→completed`) + soft `kpi_code` / `job_grade_key` / `department_key`. Physical SoT: `docs/hrm/DB_DESIGN_HRM_ERP_E3.md` · API `API_DESIGN_HRM_ERP_E3.md`. Cycle enums `draft|active|closed` **must_keep** (orthogonal to eval SM). DDL apply = Dev WI after SA ack — **cấm** apply in BA WI.

---

## C. Metadata — change queue + values + audit

> **Physical fact:** DDL stores `company_id` as **UUID** (legacy). API accepts slug **or** UUID and maps via `resolveHrmCompanyUuidForSlug` before persist. Wire/JWT still Plane B slug. Residual **G-MD-PLANE-01** — optional TEXT migration wave (not this design rewrite).

### C.1 `public.employee_metadata_change_requests`

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `id` | UUID PK | NO | Khóa yêu cầu | MD-01 #8 |
| **`company_id`** | **UUID NOT NULL** | NO | Company UUID (mapped from slug) | MD-01 #1/#2 |
| **`employee_id`** | UUID NOT NULL | NO | Hồ sơ đích | **SOFT** · MD-01 #2 |
| `legal_entity_id` | UUID | YES | LE Plane A optional | Dual-plane cite |
| `field_key` | TEXT NOT NULL | NO | Trường đổi | MD-01 #2/#5 |
| `current_value` | JSONB | YES | Giá trị hiện tại | Snapshot |
| `requested_value` | JSONB NOT NULL | NO | Giá trị đề xuất | MD-01 #3 |
| `reason` | TEXT | YES | Lý do | MD-01 #3 |
| `actor_user_id` / `actor_name` | TEXT | YES | Người gửi | Audit |
| `workflow_code` | TEXT | YES | WF code (default `xbos.employee_metadata.default`) | Bridge |
| `source_catalog_key` | TEXT | YES | Nguồn danh mục | MD-01 #4 |
| `status` | TEXT NOT NULL DEFAULT `'pending'` | NO | `pending` \| `approved` \| `rejected` \| `cancelled` | MD-01 #6 |
| `decided_by` / `decided_note` / `decided_at` | TEXT / TEXT / TIMESTAMPTZ | YES | Duyệt | UC-26 / MD-03/04 |
| `submitted_at` / `updated_at` | TIMESTAMPTZ NOT NULL | NO | Audit | List |

**Indexes:** `idx_employee_metadata_change_requests_scope (company_id, status, submitted_at DESC)` · CHK status.

### C.2 `public.employee_metadata_values`

| Column | Type | Null | Meaning (VI) |
|--------|------|------|--------------|
| `id` | UUID PK | NO | Giá trị hiện hành sau duyệt |
| `company_id` | UUID NOT NULL | NO | Same UUID plane as requests |
| `employee_id` | UUID NOT NULL | NO | Soft hub |
| `legal_entity_id` | UUID | YES | Optional LE |
| `field_key` | TEXT NOT NULL | NO | Trường |
| `field_value` | JSONB NOT NULL | NO | Giá trị áp |
| `source_catalog_key` / `workflow_code` | TEXT | YES | Provenance |
| `updated_by` / `updated_at` | TEXT / TIMESTAMPTZ | — | Audit |

**UK:** `uq_employee_metadata_values_scope (company_id, employee_id, field_key)`.

### C.3 `public.employee_metadata_audit_logs`

| Column | Type | Null | Meaning (VI) |
|--------|------|------|--------------|
| `id` | UUID PK | NO | Audit row |
| `change_request_id` | UUID | YES | **SOFT/SET NULL** FK → change_requests |
| `company_id` | UUID NOT NULL | NO | Scope |
| `employee_id` | UUID NOT NULL | NO | Soft |
| `field_key` / `action` | TEXT NOT NULL | NO | Hành động |
| `actor_*` / `payload` | TEXT / JSONB | YES | Chi tiết |
| `created_at` | TIMESTAMPTZ NOT NULL | NO | ORDER BY |

**Cấm:** apply `requested_value` to values on submit alone (MD-01 Quy tắc — chờ duyệt trừ cấu hình tự áp).

---

## D. Mobile auth — logical session (no table)

| Item | Value |
|------|--------|
| Persist | JWT access + refresh (HS256 · `SERVICE_JWT_SECRET`) — **không** bảng session |
| Claims | `sub`, `tenantId`, `companyId` (Plane B slug), `employee_id`, `roles` |
| Password | env `HRM_MOBILE_PILOT_PASSWORD` **or** `employees.custom_fields.mobile_password_hash` |
| Refresh store (client) | SecureStore — `TECHSPEC_MOBILE.md` §5.2 |
| `ref_srs` | **FR-HRM-MOB-01** Diễn biến #2–#8 |

**Cấm:** AsyncStorage for refresh token; invent session table this wave; hardcode company in mobile client.

### D′. Mobile mutate persistence

| FR | Persist SoT | Physical design |
|----|-------------|-----------------|
| MOB-04 | `attendance_records` (+ events) | **Cite** `DB_DESIGN_HRM_ATT_SHEET.md` — không duplicate |
| MOB-06 | `leave_requests` / `attendance_update_requests` | **Cite** `DB_DESIGN_HRM_LEAVE.md` (+ ATT update_requests §17.1) |
| MOB-08 | Same leave approve/reject | **Cite** Leave pair — role gate MOB |

---

## 5. Identity dual-plane

| Plane | Key | W2 usage |
|-------|-----|----------|
| **A** | XBOS LE UUID | Metadata optional `legal_entity_id` only — **never** as Performance/Decisions `company_id` |
| **B** | Operating slug | Persist Performance/Decisions; JWT mobile claims; API wire for Metadata (mapped to UUID) |

`company_id=main` (JWT) → rollup five slugs on **read**; rows **never** stored as `main`.

---

## 6. Logical linkage

```text
employees (hub, soft)
    ├──< performance_evaluations ──HARD──> performance_cycles
    ├──< hr_decisions.employee_id (optional)
    └──< employee_metadata_* (UUID company_id mapped)
JWT (mobile) ──claims──> employee_id + companyId slug
```

---

## 7. Gap / residual (document only)

| ID | Finding | Owner |
|----|---------|-------|
| **G-MD-PLANE-01** | Metadata DDL = UUID `company_id` while HRM spine = TEXT slug; API maps slug→UUID | `dev-be` optional migrate / TM on-touch |
| **G-PF-OVERLAP** | PF-01 #5 chồng chu kỳ — confirm app enforcement vs doc-only | `dev-be` |
| **G-MOB-LEFT** | MOB-02/03/05/07/09 leftover catalog | Info · non-goal |
| **G-SCOPE-01** | Standing list↔get parity on decisions / metadata decide | `dev-be`+`qa` on-touch |
| **G-DEC-DONE** | Density CLOSED ≠ UC-27 product DONE (AC-DEC-DONE) | PM/BA product |

---

## 8. must_keep / forbidden

| Keep | Forbidden |
|------|-----------|
| TEXT slug on cycles / decisions | LE UUID as Performance/Decisions persist key |
| Soft `employee_id` | Hard FK cascade wipe employees |
| Metadata approve ≠ submit apply | Seed change-requests / decisions / cycles for U65 |
| Cite ATT/Leave for MOB-04/06/08 | Duplicate ATT/Leave column packs here |
| Existing U71 pairs listed in dispatch | Wipe/rewrite those files |

---

## 9. Verification probes (read-only)

```sql
-- Performance cycles by slug
SELECT company_id, status, COUNT(*) FROM public.performance_cycles
GROUP BY 1, 2 ORDER BY 1, 2;

-- Decisions density by slug
SELECT company_id, decision_type, status, COUNT(*) FROM public.hr_decisions
GROUP BY 1, 2, 3 ORDER BY 1, 2;

-- Metadata pending (UUID plane)
SELECT status, COUNT(*) FROM public.employee_metadata_change_requests GROUP BY 1;
```
