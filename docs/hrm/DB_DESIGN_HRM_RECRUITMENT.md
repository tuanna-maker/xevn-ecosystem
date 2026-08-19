# DB_DESIGN — HRM Recruitment spine (Lane A)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-RECRUITMENT-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | khách `SRS_HRM_KHACH.md` **§3.7 FR-HRM-RC-01** Diễn biến #1–#8 · **§3.18 FR-HRM-RC-03** · **§3.19 FR-HRM-RC-05** · team `docs/hrm/SRS.md` **UC-HRM-22** |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§14.7** FR-RC-01 · **§16.1** RC-03/05 · **§17.1 / §17.6** dual-catalog SoT · **§18.2** REC-WF Option B |
| **ref_adr** | `docs/decisions/ADR-HRM-SETTINGS-SOT-REC-WF-COMPANY-20260723.md` (REC-WF company partition) · bridge XHRM-REC-WF |
| **ref_api** | `docs/hrm/API_DESIGN_HRM_RECRUITMENT.md` |
| **ref_align** | `docs/hrm/DB_DESIGN_HRM_EMPLOYEES.md` — soft `employee_id` on spine candidate; **same** TEXT `company_id` Plane B slug |
| **Template** | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` |
| **U71** | Physical DB slice before Dev claim on requisitions / candidates / interviews |
| **Date** | 2026-07-27 |
| **Runtime ensure** | `RecruitmentService.ensureSchema` + `RecruitmentWorkflowBridge.ensureSchema` |

> **must_keep:** Lane A SoT = `job_requisitions` → `recruitment_candidates` → `recruitment_interviews` (**§17.6**). **Cấm** bind FR-RC-01 headcount to `job_postings` / `headcount_proposals`. `company_id` = **TEXT operating slug** (not LE UUID). `workflow_instance_id` LOCK on status PATCH when active (XHRM-REC-WF). Soft `recruitment_candidates.employee_id` — no DB `REFERENCES employees` (G-DB-02). **must_keep pairs:** employees / contracts-ins / leave physical designs — do not rewrite.

> **Out of scope (Lane B leftover):** `job_postings`, `candidates` (pool), `interviews` (catalog), `headcount_proposals`, `recruitment_plans` — menu density only; not FR-RC primary (§17.6 F1–F10).

---

## 1. Table SoT — `public.job_requisitions`

| Item | Value |
|------|--------|
| Schema | `public` |
| Table | **`job_requisitions`** |
| Owner service | HRM (`hrm-api` · `RecruitmentService`) |
| Consumers | Embed UC-HRM-22 · FR-RC-01 create/list/get/update · `POST …/submit-workflow` · RecruitmentWorkflowBridge |
| Non-owner | Lane B postings/proposals; XBOS LE |

### 1.1 Columns (physical)

| Column | Type | Null | Meaning (VI) | Scope / CRUD role | `ref_srs` |
|--------|------|------|--------------|-------------------|-----------|
| `id` | UUID PK | NO | Khóa YCTD | Path `:requisitionId`; khóa mang #8 | FR-RC-01 #8 |
| **`company_id`** | **TEXT NOT NULL** | NO | Operating slug Plane B | Persist `resolveHrmPersistCompanyIdText`; list/get `resolveHrmListScope` | FR-RC-01 #1 · UC-HRM-22 |
| `title` | TEXT NOT NULL | NO | Tiêu đề / vị trí | Create required | FR-RC-01 #3 |
| `department` | TEXT NOT NULL | NO | Phòng ban (code hoặc snapshot) | Soft → Settings `departments` when product locks assert | FR-RC-01 #5 |
| `employment_type` | TEXT NOT NULL | NO | Loại HĐ tuyển (full-time…) | Create required | FR-RC-01 input |
| **`headcount`** | **INTEGER NOT NULL DEFAULT 1** | NO | **Số lượng cần tuyển ≥ 1** | G-RC-01 VERIFY CLOSED; **cấm** bind Lane B | FR-RC-01 #4/#6 |
| `status` | TEXT NOT NULL DEFAULT `'open'` | NO | Lifecycle (CHECK mở rộng WF) | Create runtime = `open` (G-RC-02 residual vs SRS nháp) | FR-RC-01 hậu điều kiện · UF-HRM-12 |
| `job_description` | TEXT | YES | Mô tả JD snapshot | Optional; từ template | FR-RC-01 JD |
| `requirements` | TEXT | YES | Yêu cầu ứng viên | Optional | FR-RC-01 |
| `job_template_id` | TEXT | YES | Snapshot id mẫu JD (không live FK) | BR-CD-F6-02 | FR-RC-01 |
| **`workflow_instance_id`** | UUID | YES | Instance XBOS WF requisition | Set on submit; **LOCK** status PATCH | §18.2 · XHRM-REC-WF |
| `rejected_reason` | TEXT | YES | Lý do từ chối WF | Terminal callback | REC-WF |
| `wf_callback_fingerprint` | TEXT | YES | Idempotent terminal | Bridge | REC-WF |
| `created_at` / `updated_at` | TIMESTAMPTZ NOT NULL | NO | Audit | List ORDER BY `created_at DESC` | UC-HRM-22 |

### 1.2 Constraints / indexes

| Name / definition | Purpose |
|-------------------|---------|
| `PRIMARY KEY (id)` | Row identity |
| **`chk_job_requisitions_headcount`** (`headcount >= 1`) | Diễn biến #4 · G-RC-01 |
| **`chk_job_requisitions_status`** | `open` \| `closed` \| `on_hold` \| `draft` \| `pending_approval` \| `approved` \| `rejected` \| `cancelled` (bridge ADDITIVE) |
| `idx_job_requisitions_workflow_instance_id` partial | WF lookup / LOCK |
| App list filter | `(company_id IN scope)` via `pushCompanyIdFilter` | Scope parity |

**Recommended ADD (non-blocking if ensureSchema lag):** `idx_job_requisitions_company_created` ON `(company_id, created_at DESC)`.

**Cấm:** `company_id` UUID / LE as SoT; claim FR-RC-01 SoT = `job_postings.headcount` / `headcount_proposals`.

### 1.3 Soft refs / catalog

| Field | Target | Enforcement | Note |
|-------|--------|-------------|------|
| `department` | Settings `departments` | Soft (assert khi BR-MD picker lock) | SRS #5 danh mục hết hiệu lực |
| `job_template_id` | JD templates (Lane B leftover OK as snapshot id) | Snapshot only — not live FK | BR-CD-F6-02 |
| Downstream | `recruitment_candidates.requisition_id` | **Hard** REFERENCES | Lane A spine |

### 1.4 Gaps retained (not invented closed)

| Gap | Spec says | Runtime | Severity |
|-----|-----------|---------|----------|
| **G-RC-02** | Nháp / chờ duyệt theo cấu hình | Create DEFAULT `open` | P1 — WF submit path tồn tại |
| **G-RC-03** | Ngày cần có mặt optional | **No column** | P2 — do not invent in this ADD |

---

## 2. Table SoT — `public.recruitment_candidates` (stages / FR-RC-03)

| Item | Value |
|------|--------|
| Schema | `public` |
| Table | **`recruitment_candidates`** |
| Owner | `RecruitmentService` Lane A |
| Consumers | FR-RC-03 · INT-01 hire soft link · interviews child |

### 2.1 Columns

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `id` | UUID PK | NO | Khóa ứng viên spine | FR-RC-03 #9 |
| **`company_id`** | **TEXT NOT NULL** | NO | Same Plane B slug | FR-RC-03 #1 |
| **`requisition_id`** | UUID NOT NULL **REFERENCES** `job_requisitions(id)` | NO | Gắn YCTD (Lane A) | FR-RC-03 #4/#7 |
| `full_name` | TEXT NOT NULL | NO | Họ tên | FR-RC-03 #3 |
| `email` | TEXT NOT NULL | NO | Liên hệ | FR-RC-03 #3 |
| `source` | TEXT NOT NULL | NO | Nguồn UV | FR-RC-03 |
| `status` | TEXT NOT NULL DEFAULT `'new'` | NO | Pipeline CHECK | FR-RC-03 #7 |
| **`employee_id`** | UUID | YES | Soft hire link → `employees.id` | INT-01 · G-DB-02 |
| `created_at` / `updated_at` | TIMESTAMPTZ NOT NULL | NO | Audit | #8 F5 |

**CHECK status:** `new` \| `screening` \| `interview` \| `offer` \| `hired` \| `rejected`.

**Cấm:** treat `public.candidates` (Lane B) as FR-RC-03 SoT; hard FK to `employees`.

---

## 3. Table SoT — `public.recruitment_interviews` (stages / FR-RC-05)

| Item | Value |
|------|--------|
| Schema | `public` |
| Table | **`recruitment_interviews`** |
| Owner | `RecruitmentService` Lane A |

### 3.1 Columns

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `id` | UUID PK | NO | Khóa lịch PV | FR-RC-05 #9 |
| **`company_id`** | **TEXT NOT NULL** | NO | Plane B slug | FR-RC-05 |
| **`candidate_id`** | UUID NOT NULL **REFERENCES** `recruitment_candidates(id)` | NO | **Không** = `candidates.id` catalog | FR-RC-05 #2 · §17.6 F4 |
| `scheduled_at` | TIMESTAMPTZ NOT NULL | NO | Thời điểm PV | FR-RC-05 #4/#5 |
| `interviewer` | TEXT NOT NULL | NO | Người PV (display) | FR-RC-05 #4 |
| `status` | TEXT NOT NULL DEFAULT `'scheduled'` | NO | CHECK lifecycle | FR-RC-05 #7 |
| `created_at` / `updated_at` | TIMESTAMPTZ NOT NULL | NO | Audit | — |

**CHECK status:** `scheduled` \| `passed` \| `failed` \| `cancelled`.

---

## 4. Logical ER (Lane A only)

```text
job_requisitions (company_id TEXT, headcount≥1, workflow_instance_id?)
        │ 1
        │
        ▼ *
recruitment_candidates (requisition_id HARD, employee_id SOFT → employees)
        │ 1
        │
        ▼ *
recruitment_interviews (candidate_id HARD → recruitment_candidates)

Lane B (NO shared PK/FK): job_postings · candidates · interviews · headcount_proposals
```

---

## 5. Identity / scope parity

| Rule | Detail |
|------|--------|
| Persist | `resolveHrmPersistCompanyIdText` → slug ∈ `HRM_GROUP_MEMBER_COMPANY_SLUGS` |
| List / get / mutate | **Same** `resolveHrmListScope` + `assertResourceInHrmScope` |
| JWT `main` | Rollup five slugs — rows never stored as `company_id='main'` |
| FAIL | Filter requisitions by LE UUID as company key |

Align soft hire: `recruitment_candidates.employee_id` → `DB_DESIGN_HRM_EMPLOYEES.md` PK only after hire gate (INT-01).

---

## 6. REC-WF binding (physical touchpoints)

| Concern | Column / behavior | ADR / TechSpec |
|---------|-------------------|----------------|
| Spawn | `POST …/requisitions/:id/submit-workflow` sets `workflow_instance_id` | §18.2 Option B partition |
| LOCK | Status PATCH rejected `HRM-REC-WF-LOCKED` while instance active | XHRM-REC-WF |
| Terminal | Bridge updates `status` / `rejected_reason` / fingerprint | Callback idempotent |
| Create without submit | Status stays `open`, `workflow_instance_id` NULL | **UF-HRM-12** must_keep |

---

## 7. Validation probes (read-only)

```sql
-- G-RC-01 headcount domain
SELECT COUNT(*) AS bad_headcount
FROM public.job_requisitions WHERE headcount < 1;

-- Plane B slug hygiene
SELECT COUNT(*) AS wrongly_keyed
FROM public.job_requisitions
WHERE company_id ~* '^[0-9a-f]{8}-';

-- Spine FK integrity
SELECT COUNT(*) AS orphan_candidates
FROM public.recruitment_candidates c
LEFT JOIN public.job_requisitions r ON r.id = c.requisition_id
WHERE r.id IS NULL;
```

---

## 8. must_keep / forbidden

| must_keep | forbidden |
|-----------|-----------|
| `job_requisitions.headcount ≥ 1` | FR-RC-01 SoT = postings/proposals |
| TEXT `company_id` slug | LE UUID as persist key |
| `workflow_instance_id` LOCK + UF-HRM-12 | Wipe CHECK statuses used by WF |
| Hard FK candidate→requisition; interview→recruitment_candidates | Cross-lane FK A↔B |
| Soft `employee_id` on spine candidate | Hard `REFERENCES employees` |
| Existing employees / CI / leave DB pairs | REPLACE those files |

---

## 9. Traceability

| Artifact | Path |
|----------|------|
| API F.1 | `docs/hrm/API_DESIGN_HRM_RECRUITMENT.md` |
| TechSpec | §14.7 · §16.1 · §17.6 · §18.2 |
| ADR REC-WF | `docs/decisions/ADR-HRM-SETTINGS-SOT-REC-WF-COMPANY-20260723.md` |
| Employees soft | `docs/hrm/DB_DESIGN_HRM_EMPLOYEES.md` |
| Pointer | `docs/tech-spec/DB_DESIGN_HRM_RECRUITMENT.md` |
| Evidence | `docs/qa/evidence/sa-u71-hrm-recruitment-design-01-20260727.md` |
