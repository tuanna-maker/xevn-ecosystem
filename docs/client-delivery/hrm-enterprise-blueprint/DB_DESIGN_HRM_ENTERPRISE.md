# DB_DESIGN — HRM Enterprise Blueprint (logical)

| Field | Value |
|-------|--------|
| **Doc ID** | DB-DESIGN-HRM-ENT-BP |
| **work_item_id** | `PO-HRM-BP-MEET-DB-01` · align `PO-HRM-BP-MEET-DB-ALIGN-01` · **DOC-DELTA** `PO-HRM-BP-SYNTH-PAY-DB-01` · **DOC-DELTA** `PO-HRM-BP-ATT-SIGN-DB-API-01` (§4.6.1 sign-step) · **DOC-DELTA** `PO-HRM-JD-YCTD-REF-DB-01` (§2.3 soft FK alias) · **DOC-DELTA** `PO-HRM-REC-UV-YCTD-DB-01` (§2.4–§2.5 UV soft FK + position) · **DOC-DELTA** `PO-HRM-E2E-LINK-EMP-SA-01` (§3.9 intent) · **DOC-DELTA CONFIRMED** `PO-HRM-E2E-LINK-EMP-DB-01` (§3.6 enrollment ONE SoT · §3.9 WH `decision_id` · §3.11 `hr_decisions`) · **DOC-DELTA CONFIRMED** `PO-HRM-ATT-LEAVE-FUNNEL-DB-01` (§4.5a records soft FK · §4.6.2 sheet/line bridge) · **DOC-DELTA CONFIRMED** `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01` (§3.4 EXPAND + §3.4a–d template/clause/print/pack) · **DOC-DELTA CONFIRMED** `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02` (§3.4e publishes + lineage EXPAND + pull_audits) · **DOC-DELTA CORR** `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01-SA-DOC` (§3.4a open catalog · **FORBIDDEN** CHK `code IN (8)`) · **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01` (§4.4 platform ATT catalog · §4.4c work-sites ICatalogRow) · **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01` (§2.4a `rec_pipeline_stage` · §2.5–2.6 stage open catalog) · **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01` (§3.0a–b EMP open catalogs · §3.5 `document_type_key`) · **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01` (§3.11a `hr_decision_type` · §3.11 `decision_type` open catalog) · **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DOCS-01` (API F.1 pointer F-DEC-CAT-TYP/EFF) · **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DOCS-01` (API F.1 pointer F-EMP-TOK · origin CHK **`emp_catalog`** · **cấm** bảng token thứ hai) · **DOC-DELTA CONFIRMED** PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01 (§3.6a si_insurance_type · §3.6 type open catalog · F-SI-CAT-TYP/EFF) · **DOC-DELTA CONFIRMED** PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01 (§3.6b si_insurer · F-SI-CAT-INS/EFF · **cấm** fold vào §3.6a) · **DOC-DELTA CONFIRMED** PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01 (§3.0c–d emp_employment_status + emp_status_reason · §3.1 status open catalog · **DROP** closed chk_employees_status · **cấm** fold vào §3.0b / EMP-CUSTOM) · **DOC-DELTA CONFIRMED** PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01 (§4.4d att_attendance_code · §4.5a status open catalog · **DROP** closed attendance status CHECK/DTO IsIn · **cấm** fold vào §4.4 leave / §4.4c work-sites · **cấm** rewrite aggregate) · **DOC-DELTA CONFIRMED** `PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01` (§2.2–§2.3 alias → `recruitment_plans` cell projection · YCTD `headcount_cell_id`/`mode`/`target_month` · **DENY** dual `rec_headcount_*`) |
| **Status** | **DRAFT for design** — họp 4 trụ **đã xong** (SYNTHESIS §2.4) · chưa customer-ký giấy (D7) · chưa TechSpec physical lock · column-aligned API §7 |
| **Date** | 2026-08-04 |
| **Version** | **0.3.0-DRAFT** (PAY logical P1–P6 + ATT leave_type catalog) |
| **Scope** | Logical tables · PK/FK · indexes · ownership pillar · lifecycle |
| **Sources** | `SYNTHESIS_MASTER_HRM_ENTERPRISE.md` · `DATA_OWNERSHIP_MATRIX.md` · `API_BOUNDARY_MAP.md` · `ADR-HRM-4-PILLAR-API-BOUNDARY.md` · `SRS_HRM_ENTERPRISE.md` (FR PAY) · `API_DESIGN_HRM_ENTERPRISE.md` |
| **Companion** | `API_DESIGN_HRM_ENTERPRISE.md` §7 · physical DDL after SRS+TechSpec + customer paper confirm |
| **Forbidden** | Migrations `apps/**` · invent unsigned formula engine DDL · dual SoT giờ công · REC→PAY FK · claim Dev unlock |

> Template mindset: `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md`.  
> Convention: `company_id` = TEXT slug (Phase 1 scope ladder); soft-delete = `archived_at`; list↔get-by-id **scope_parity** (U19).

---

## 0. Conventions

| Rule | Value |
|------|--------|
| PK | `id` UUID |
| Tenant plane | `company_id` TEXT NOT NULL (ops slug); group CEO `main` rollup = same resolver as AS-IS Nest |
| Audit | `created_at`, `updated_at`, `created_by`, `updated_by` trên mọi bảng TXN |
| Soft-delete | `archived_at` NULL; **cấm** hard-delete nếu còn FK TXN |
| Sensitivity | Cột/bảng đánh dấu **Public** vs **C&B** — serializer tách; không index C&B trên replica không kiểm soát |
| Cross-pillar write | Chỉ owner pillar; consumers GET / event — xem §8 Forbidden FK |
| Unit giờ lương | Chỉ trên `att_timesheet_line.*_hours` (đã hệ số OT) — PAY **không** materialize lại |

### Naming prefix (logical)

| Pillar | Prefix |
|--------|--------|
| REC | `rec_` |
| CORE | `hrm_` (employee master) / `core_` khi cần tách |
| ATT | `att_` |
| PAY | `pay_` (logical P1–P6; formula **expression** depth = Q-PAY-FORMULA pointer) |

---

## 1. ER notes (logical)

### 1.1 Cross-pillar spine

```text
rec_headcount_plan_cell ──► rec_recruitment_request
rec_job_description ────────► rec_recruitment_request
rec_pipeline_stage (open catalog · ICatalogRow) ──validates──► rec_candidate_application.stage
rec_candidate ◄──N── rec_candidate_application ──N──► rec_recruitment_request
rec_interview_eval_template ──► rec_interview_evaluation (per application)
rec_mail_outbox / rec_mail_log (R7 template mail)
        │
        │ hire (REC→CORE: rec_candidate.employee_id · offer.accepted)
        ▼
emp_document_type (open catalog · ICatalogRow) ──validates──► hrm_document_checklist_item.document_type_key
emp_employment_type (open catalog · ICatalogRow) ──validates──► employee / YCTD employment_type
emp_employment_status (open catalog · ICatalogRow) ──validates──► hrm_employee.status
emp_status_reason (open catalog · ICatalogRow) ──validates──► employee status-change reason (when required)
hr_decision_type (open catalog · ICatalogRow) ──validates──► hr_decisions.decision_type
hrm_employee (Public) ──1── hrm_employee_compensation (C&B)
        ├── hrm_dependent (Public family / quà 1/6)
        ├── hrm_contract (+ annex C&B)
        ├── hrm_document_checklist_item
        ├── hrm_insurance_enrollment ──► hrm_insurance_rate_period (timeline NV)
        ├── hrm_reward_discipline ──► payroll_link_status (pointer kỳ PAY)
        ├── hrm_asset_assignment (+ handover)
        ├── hrm_employment_history
        ├── hr_decisions ──(effective + flags)──► employee_work_timeline (decision_id)
        └── hrm_termination
                │
                │ employee.activated → ATT enroll
                ▼
att_shift ◄── att_shift_assignment / att_work_schedule
att_attendance_rule (late/early penalty — A3; scoped OU/shift)
att_holiday_calendar
att_leave_type (catalog A3–A4) ──► att_leave_accrual_policy ──► att_leave_balance ──► att_leave_hold
att_attendance_code (open catalog · ICatalogRow) ──validates──► attendance_records.status (day-code)
att_attendance_punch
att_timesheet_header (status→closed) ──1──N── att_timesheet_line
                └──1──N── att_timesheet_sign_step (WF ký chốt · UC-BP-ATT-11)
                │
                │ timesheet.closed · PAY GET closed only (P1 · D8)
                ▼
pay_payroll_period ──binds──► att_timesheet_header (closed)
pay_payslip ──FK──► att_timesheet_header + pay_payroll_period
pay_payslip_line · pay_payslip_split_segment (P6 logical)
pay_formula_definition (versioned pointer · Q-PAY-FORMULA)
pay_insurance_rate_cfg (master % pháp nhân; ≠ enrollment) ──read──► PAY run
hrm_reward_discipline ──soft──► pay_payroll_period / pay_payslip (P3)
hrm_termination ──► pay_termination_settlement (P6 final pay pointer)
```

### 1.2 MVP vs GĐ2 (meeting R1 / SYNTHESIS)

| Entity | Phase | Note |
|--------|-------|------|
| `rec_job_description`, `rec_recruitment_request`, `rec_candidate`, `rec_candidate_application`, `rec_pipeline_stage`, `rec_interview_*`, `rec_mail_outbox` | **MVP GĐ1** | Pipeline stages = open catalog (§2.4a) · trạng thái đăng/CV/PV **trên YCTD / application** · mail R7 |
| `rec_campaign`, `rec_job_post`, `rec_job_post_channel` | **GĐ2 optional** | Chỉ khi có API đối tác đa kênh; FK YCTD 1–n Campaign |
| PAY logical tables §5 (period, payslip, bind, rate CFG, reward/term pointers, split segments) | **MVP GĐ1 DRAFT** | Họp PAY **đã chốt** P1–P6 (SYNTHESIS §2.4) — chờ khách ký giấy D7 trước Dev |
| PAY formula **UI/engine expression** depth | **Q-PAY-FORMULA** | Pointer `expression_json` + dual-control publish — **không** = «họp lương chưa xong» |

### 1.3 Ownership invariants (DB-enforced intent)

| ID | Rule |
|----|------|
| D-I-2 | **Không** FK từ `rec_*` → `pay_*` |
| D-I-3 | `pay_payslip.timesheet_header_id` bắt buộc; app layer assert header.`status=closed` |
| D-I-3b | **Không** FK `pay_*` → `att_leave_*` / OT request / `att_attendance_punch` |
| D-I-4 | C&B columns **không** nằm trên bảng public employee list projection |
| D-I-6 | OT coefficient applied **into** timesheet lines before close — PAY reads weighted hours only |

---

## 2. Table catalog — REC (MVP)

### 2.1 `rec_job_description` — Mô tả công việc (master)

| Meta | Giá trị |
|------|---------|
| **Pillar** | REC |
| **ref_srs** | Meeting R2 · FR-UC-BP-REC-02 / REC-04 (skill family) |
| **Lifecycle** | draft → active → retired |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | Scope |
| `code` | text | NO | Mã JD trong CT |
| `title` | text | NO | Chức danh hiển thị |
| `position_key` | text | YES | Soft key catalog XBOS/HRM |
| `department_id` | text | YES | OU / bộ phận |
| `grade_band` | text | YES | Cấp bậc (nếu dùng) |
| `responsibilities` | text | YES | Nội dung JD |
| `requirements_json` | jsonb | YES | Kỹ năng / kinh nghiệm cấu trúc |
| `status` | text | NO | draft\|active\|retired |
| `archived_at` | timestamptz | YES | Soft-delete |

| Key / Index | Định nghĩa |
|-------------|------------|
| **PK** | `id` |
| **UQ** | `(company_id, code)` WHERE `archived_at IS NULL` |
| **IX** | `(company_id, status)`, `(company_id, position_key)` |

---

### 2.2 `rec_headcount_plan` + `rec_headcount_plan_cell` — Định biên năm / ô tháng

| Meta | Giá trị |
|------|---------|
| **Pillar** | REC |
| **ref_srs** | FR-UC-BP-REC-01 · Meeting R4–R5 |
| **Note** | Lưới: Hiện tại / Cần tuyển / Dự kiến — **không** cột kế hoạch·đề xuất trùng |
| **Physical Option A (DOC-DELTA CONFIRMED `PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01`)** | Logical names below = **alias only**. Nest SoT = **UPGRADE** `public.recruitment_plans` + `recruitment_plan_departments` + `recruitment_plan_positions.months_data` **cell projection** (`cell_id` · `headcount_need_hire` · `headcount_current` · `cell_status` · `lifecycle_status`). Legacy `{ns,dx}` → `need_hire←dx` / `current←ns`. **FORBIDDEN** CREATE second physical `rec_headcount_plan` / `rec_headcount_plan_cell`. Team SoT: [`PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md). |

**`rec_headcount_plan`**

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | |
| `year` | int | NO | Năm kế hoạch |
| `status` | text | NO | draft\|submitted\|approved\|rejected |
| `submitted_by_dept_id` | text | YES | Phòng ban trình (R5) |
| `submit_comment` | text | YES | F-REC-HC-02 |
| `approved_by` | uuid | YES | F-REC-HC-03 |
| `approved_at` | timestamptz | YES | |
| `rejected_reason` | text | YES | Reject path |
| `archived_at` | timestamptz | YES | |

**`rec_headcount_plan_cell`**

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `plan_id` | uuid | NO | FK → plan |
| `company_id` | text | NO | Denorm scope |
| `department_id` | text | NO | |
| `position_key` | text | NO | |
| `month` | int | NO | 1–12 |
| `headcount_current` | numeric | YES | Hiện tại (snapshot nhập/rollup) |
| `headcount_need_hire` | numeric | NO | **Cần tuyển** — SoT số mở YCTD |
| `headcount_projected` | numeric | YES | Dự kiến |
| `cell_status` | text | NO | open\|need_hire_approved\|fulfilled\|cancelled |

| Key / Index | |
|-------------|---|
| **UQ** | `(plan_id, department_id, position_key, month)` |
| **IX** | `(company_id, year, cell_status)` |

**Lifecycle plan:** draft → submitted → approved/rejected → (cells fulfilled). Invalid: mutate cell số sau `approved` trừ UC revise.

---

### 2.3 `rec_recruitment_request` — Yêu cầu tuyển dụng (YCTD)

| Meta | Giá trị |
|------|---------|
| **Pillar** | REC |
| **ref_srs** | FR-UC-BP-REC-02 / 02b · Meeting R2–R3 · **v0.10 Diễn biến 1a–1d** (JD picker) |
| **Lifecycle** | draft → submitted → approved\|rejected → open → filled\|cancelled |
| **JD ref SoT** | [`PO-HRM-JD-YCTD-REF-DB-01.md`](../../program/specs/PO-HRM-JD-YCTD-REF-DB-01.md) — **ONE** physical soft FK |
| **Physical Option A (DOC-DELTA CONFIRMED `PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01` · Wave-2 `PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01`)** | AS-IS table = `public.job_requisitions` (**sole** YCTD SoT; paper name = **alias**). **RETAIN** REC-01: `headcount_cell_id` · `headcount_mode` · `target_month` + partial **UQ spawn**. Soft resolve cell → `months_data[].cell_id` — **no** hard FK into JSON. `qty` ↔ `headcount`. **Wave-2 ADD:** `hire_reason` · `replace_employee_id` · `out_of_plan_reason` · `approval_matrix_key` · `pipeline_flags_json` · status token `open_for_hire` in CHK · O2 vượt ô = **409** (no silent) · O4 NULL mode = LEGACY_UNCLASSIFIED (block CV; no auto `in_plan` backfill). **FORBIDDEN** second physical `rec_recruitment_request` / Nest `/rec` dual. Team SoT: [`PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md) (+ REC-01 DATA). `recruitment_uat_ready=false`. |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | |
| `code` | text | NO | Mã YCTD |
| `job_description_id` | uuid | YES | **Logical alias** → soft FK JD master (`rec_job_description`); **physical AS-IS** = `job_requisitions.job_template_id` (**không** invent cột physical thứ hai) |
| `job_description` | text | YES | **Optional snapshot** mô tả ngắn trên YCTD — one-way copy từ preview/template; **≠** live `values_json` SoT thư viện |
| `requirements` | text | YES | **Optional snapshot** yêu cầu trên YCTD — one-way; chỉnh không đè Thư viện JD |
| `headcount_cell_id` | uuid | YES | FK cell — bắt buộc nếu `headcount_mode=in_plan` |
| `department_id` | text | NO | Phòng đề xuất |
| `position_key` | text | NO | |
| `qty` | int | NO | Số cần tuyển |
| `headcount_mode` | text | NO | `in_plan` \| `out_of_plan` (trong/ngoài ĐB) |
| `hire_reason` | text | NO | `new` \| `replace` (tuyển mới / thay thế; API alias `replacement`→`replace`) |
| `replace_employee_id` | uuid | YES | FK soft → `hrm_employee` khi replace |
| `out_of_plan_reason` | text | YES | Bắt buộc khi `headcount_mode=out_of_plan` (F-REC-YCTD-02) |
| `approval_matrix_key` | text | YES | Snapshot nhánh duyệt (rút gọn vs dài) |
| `status` | text | NO | |
| `approved_at` | timestamptz | YES | F-REC-YCTD-03 |
| `approved_by` | uuid | YES | |
| `pipeline_flags_json` | jsonb | YES | MVP keys: `posted` / `has_cv` / `interview_started` (+ ts) — F-REC-YCTD-04; không cần Campaign |
| `target_month` | date | YES | Tháng cần người |
| `archived_at` | timestamptz | YES | |

| Key / Index | |
|-------------|---|
| **UQ** | `(company_id, code)` active |
| **IX** | `(company_id, status)`, `(company_id, headcount_mode)`, `(headcount_cell_id)`, `(job_description_id)` soft lookup |
| **CHK** | `headcount_mode='in_plan' ⇒ headcount_cell_id IS NOT NULL` (app hoặc DB check) |
| **CHK** | `hire_reason='replace' ⇒ replace_employee_id IS NOT NULL` |

**JD soft FK / bindable (DOC-DELTA `PO-HRM-JD-YCTD-REF-DB-01`):**

| Rule | Value |
|------|--------|
| Physical column | `job_requisitions.job_template_id` only |
| Logical name | `job_description_id` (API/DB_DESIGN alias — same id) |
| FK style | Soft resolve → `job_description_templates` / `rec_job_description`; **cấm** `ON DELETE CASCADE` xóa YCTD khi Ngừng JD |
| Bindable | Chỉ JD **Hiệu lực** (`status=active` / `is_active=true`); Nháp/Ngừng → reject bind mới; history YCTD vẫn đọc được |
| Snapshot vs SoT | `job_description`/`requirements` trên YCTD = one-way text; dynamic SoT = template `values_json` |
| FORBIDDEN | Dual physical FK · `job_postings` làm SoT JD · bắt buộc `rec_campaign`/`rec_job_post*` GĐ1 (giữ §2.8 GĐ2) |

---

### 2.4 `rec_candidate` — Ứng viên (person)

| Meta | Giá trị |
|------|---------|
| **Pillar** | REC |
| **ref_srs** | FR-UC-BP-REC-04/05 · **05a** · Meeting R2, R8 |
| **Sensitivity** | Public + PII CV |
| **Position SoT** | [`PO-HRM-REC-UV-YCTD-DB-01.md`](../../program/specs/PO-HRM-REC-UV-YCTD-DB-01.md) — **không** free-text trên person |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | Owning CT (pool) |
| `full_name` | text | NO | |
| `email` | text | YES | |
| `phone` | text | YES | |
| `source_code` | text | YES | Nguồn tuyển |
| `cv_file_ref` | text | YES | |
| `desired_salary` | numeric | YES | Mong muốn — timeline chi tiết ở history |
| `employee_id` | uuid | YES | Soft link sau hire — **CORE owns employee** |
| `archived_at` | timestamptz | YES | |

| Key / Index | |
|-------------|---|
| **IX** | `(company_id, email)`, `(company_id, phone)`, `(employee_id)` |
| **Forbidden** | Cột payslip / salary_structure · **free-text `position` làm SoT vị trí ứng tuyển** (AC-REC-UV-03) |

**Position note (DOC-DELTA `PO-HRM-REC-UV-YCTD-DB-01`):** Vị trí hiển thị = **derived từ YCTD** (`position_key` / `position_name`) qua application soft FK — **không** lưu chữ tự do trên `rec_candidate` làm nguồn sự thật. AS-IS Lane B `candidates.position` (nếu còn) = legacy nullable — **deprecated as SoT**.

**Lifecycle person:** active pool → (applications drive stage) → hired_link / archived. `hired` không tạo `pay_*`.

---

### 2.4a `rec_pipeline_stage` — Catalog giai đoạn pipeline · Platform REC `ICatalogRow` (CONFIRMED physical)

| Meta | Giá trị |
|------|---------|
| **Pillar** | REC |
| **Physical** | **ADD** `public.rec_pipeline_stage` — **ABSENT AS-IS Nest** (closes **R-PLT-DATA-04** REC stage slice) |
| **ref_srs** | FR-UC-BP-REC-05 «danh mục pipeline đơn vị» · **AC-PLT-REC-02..05** |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md) |
| **SoT file** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01.md) |
| **Platform** | Option B **`ICatalogRow`** — domain table · **FORBIDDEN** mega-EAV |
| **Dual SoT GĐ1** | Tenant writer **`rec_pipeline_stage`** = SoT · XBOS WF task codes = **ops map** (`wf_task_type_key`) — **≠** second catalog · **no** XBOS stages REF partition required GĐ1 |
| **must_keep** | JD DnD `rec_jd_*` · IV one-active · hire→EMP · YCTD soft FK · history append-only |

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug |
| `stage_key` | text | NO | | Open catalog code |
| `name_vi` | text | NO | | UI label |
| `sort_order` | int | NO | 100 | Kanban / picker order |
| `is_terminal` | boolean | NO | false | Terminal lane |
| `is_hired_outcome` | boolean | NO | false | Hire spine target — ≤1 active / company |
| `is_reject_outcome` | boolean | NO | false | Reject class |
| `allows_interview_schedule` | boolean | NO | true | IV schedule gate |
| `wf_task_type_key` | text | YES | NULL | Optional WF ops map |
| `color_token` | text | YES | NULL | Optional UI chip |
| `metadata_json` | jsonb | YES | NULL | Optional — **not** typed-flag SoT |
| `status` | text | NO | `'active'` | active \| retired |
| `archived_at` | timestamptz | YES | NULL | Soft-delete |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | |

| Key / Index / CHK | Rule |
|-------------------|------|
| **UQ active** | `(company_id, lower(stage_key)) WHERE archived_at IS NULL` |
| **UQ hired outcome** | At most one `(company_id)` WHERE `is_hired_outcome=true AND archived_at IS NULL` |
| **IX** | `(company_id, status)` · `(company_id, sort_order)` |
| **CHK format** | `stage_key ~ '^[a-z][a-z0-9_]*$'` — **format only** |
| **CHK status** | `status IN ('active','retired')` |
| **CHK flags** | `is_hired_outcome` ⇒ `is_terminal`; **cấm** hired∧reject cùng true |
| **FORBIDDEN** | `CHECK (stage_key IN ('screening','interview','offer','hired','rejected','withdrawn'))` · hard-delete |

**Starter six** (`screening`…`withdrawn`) = bootstrap examples only — **≠** ceiling (**BR-PLT-05**). Soft-delete = `status=retired` + `archived_at` — history / past `application.stage` intact (**BR-PLT-04**).

**ICatalogRow:** `code`=`stage_key` · `label_vi`=`name_vi` · `catalog_kind`=`rec_pipeline_stage`.

**Out of this table:** `rec_jd_*` FormSchema · interview schedule status · YCTD `pipeline_flags_json` · eval template · REC-03.

---

### 2.5 `rec_candidate_application` — N–N Ứng viên × YCTD

| Meta | Giá trị |
|------|---------|
| **Pillar** | REC |
| **ref_srs** | Meeting R8 · FR-UC-BP-REC-05 · **05a** · **06b** |
| **Note** | Một UV nhiều YCTD (khác phòng/dự án/offer) |
| **YCTD soft FK SoT** | [`PO-HRM-REC-UV-YCTD-DB-01.md`](../../program/specs/PO-HRM-REC-UV-YCTD-DB-01.md) — **ONE** physical soft FK |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | |
| `candidate_id` | uuid | NO | FK → candidate |
| `recruitment_request_id` | uuid | NO | **Logical alias** → soft FK YCTD **bắt buộc** (R2 · BR-BP-CV-03); **physical AS-IS** = **`requisition_id`** (**không** invent cột physical thứ hai) |
| `position_key` | text | YES | **Optional denorm** copy từ YCTD tại lúc gắn — read cache; **≠** free-text SoT; lệch client → `HRM-REC-UV-POSITION-MISMATCH` |
| `stage` | text | NO | Stores **`stage_key`** from open catalog §2.4a — starter examples `screening`\|`interview`\|`offer`\|`hired`\|`rejected`\|`withdrawn` **≠** ceiling (**BR-PLT-05**) · **FORBIDDEN** closed `CHECK IN (6)` |
| `stage_changed_at` | timestamptz | NO | |
| `offer_salary` | numeric | YES | Đề xuất lương PV (REC) — **không** ghi CORE C&B đến khi hire |
| `rejected_reason` | text | YES | |
| `archived_at` | timestamptz | YES | |

| Key / Index | |
|-------------|---|
| **UQ** | `(candidate_id, recruitment_request_id)` active |
| **IX** | `(recruitment_request_id, stage)`, `(company_id, stage)` |

**YCTD soft FK / UV bind (DOC-DELTA `PO-HRM-REC-UV-YCTD-DB-01`):**

| Rule | Value |
|------|--------|
| Physical column | **`requisition_id`** only (AS-IS Lane A spine name; N–N home = application) |
| Logical name | `recruitment_request_id` (API/DB_DESIGN alias — same id) |
| Target | `job_requisitions.id` / `rec_recruitment_request.id` |
| FK style | Soft resolve; **cấm** `ON DELETE CASCADE` xóa application/eval khi đóng YCTD |
| Position SoT | YCTD.`position_key` (+ display name); optional denorm on application |
| Compare / eval | Filter by YCTD soft FK; scores neo `application_id` |
| FORBIDDEN | Dual physical FK · `job_postings` / `job_posting_id` làm UV/compare SoT · free-text position SoT · REC-03 GĐ1 (giữ §2.8 GĐ2) |

**Invalid transition:** `hired` → pool im lặng; rollback hire chỉ UC admin + CORE employee state.

**Pipeline stage SoT (DOC-DELTA CONFIRMED `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01`):**

| Rule | Value |
|------|--------|
| Catalog table | `rec_pipeline_stage` (§2.4a) — tenant writer = SoT |
| Column semantics | `stage` = soft key text (`stage_key`) — **no rename** |
| When catalog >0 | Mutate / transition `to_stage` **must** ∈ effective active catalog → else `HRM-REC-STAGE-UNKNOWN` (**BR-PLT-02** · **AC-PLT-REC-04**) |
| When catalog empty | Compat: starter map / free-text allowed until first active row |
| Historical / retired | Display of retired keys **allowed**; picker hides retired |
| Hire target | Active row with `is_hired_outcome=true` (default starter `hired`) — F-REC-HIRE-01 must_keep |
| FORBIDDEN | Closed enum CHECK · FE hardcode six as ceiling · dual stage enum · wipe JD / IV / YCTD |

---

### 2.6 `rec_candidate_stage_history` — Timeline trạng thái

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `application_id` | uuid | NO | FK |
| `from_stage` | text | YES | Prior `stage_key` (may be retired) |
| `to_stage` | text | NO | New `stage_key` (may later be retired) |
| `note` | text | YES | |
| `changed_by` | uuid | YES | |
| `changed_at` | timestamptz | NO | |

Append-only. ref_srs FR-UC-BP-REC-05.

**DOC-DELTA CONFIRMED `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01`:** `from_stage` / `to_stage` reference open-catalog keys; **may** retain **retired** keys after catalog soft-delete (**BR-PLT-04**) — **FORBIDDEN** hard-delete stages that cascade-wipe history.

---

### 2.7 `rec_interview_eval_template` + `rec_interview_evaluation` — Mẫu PV động

| Meta | Giá trị |
|------|---------|
| **Pillar** | REC |
| **ref_srs** | Meeting R7 · FR-UC-BP-REC-06 |

**Template**

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | |
| `name` | text | NO | |
| `criteria_json` | jsonb | NO | Tiêu chí, trọng số, thang điểm |
| `status` | text | NO | active\|retired |

**Evaluation (instance)**

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `application_id` | uuid | NO | FK application |
| `template_id` | uuid | NO | FK template |
| `interviewer_user_id` | uuid | YES | |
| `scores_json` | jsonb | NO | Điểm theo tiêu chí |
| `result` | text | NO | pass\|fail |
| `salary_recommendation` | numeric | YES | Đề xuất lương |
| `evaluated_at` | timestamptz | NO | |

| **IX** | `(application_id)`, `(company_id via join)` |

---

### 2.8 GĐ2 optional — Campaign / JobPost

> **Không bắt buộc MVP.** Giữ schema dự phòng — không wire GĐ1.

#### `rec_campaign` (GĐ2)

| Cột | Kiểu | Ý nghĩa |
|-----|------|---------|
| `id`, `company_id`, `name`, `status`, `opened_at`, `closed_at` | | Hub chiến dịch 1–n YCTD |

#### `rec_campaign_request_link` (GĐ2)

| Cột | | |
|-----|---|---|
| `campaign_id`, `recruitment_request_id` | UQ pair | |

#### `rec_job_post` + `rec_job_post_channel` (GĐ2)

| Cột | Ý nghĩa |
|-----|---------|
| `job_post`: `recruitment_request_id`, `channel_code`, `external_ref`, `posted_at`, `status` | Tin đa kênh khi có API đối tác |
| `job_post_channel`: catalog kênh (Facebook, LinkedIn, …) | CFG |

---

### 2.9 `rec_mail_outbox` + `rec_mail_log` — Mail tuyển theo mẫu (R7 · F-REC-MAIL-01)

| Meta | Giá trị |
|------|---------|
| **Pillar** | REC |
| **ref_srs** | Meeting R7 · FR-UC-BP-REC-06 |
| **Note** | Async outbox; **không** dual-write CORE/PAY |

**`rec_mail_outbox`**

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK · API `outbox_id` |
| `company_id` | text | NO | |
| `application_id` | uuid | YES | FK soft → `rec_candidate_application` |
| `recruitment_request_id` | uuid | YES | Context YCTD |
| `template_code` | text | NO | fail_cv \| interview_invite \| offer \| … |
| `to_emails_json` | jsonb | NO | `to[]` |
| `cc_emails_json` | jsonb | YES | `cc_interviewers[]` — **bắt buộc** khi template=interview_invite |
| `payload_json` | jsonb | YES | Bind fields |
| `status` | text | NO | queued\|sending\|sent\|failed |
| `queued_at` | timestamptz | NO | |
| `sent_at` | timestamptz | YES | |
| `error_message` | text | YES | |
| `archived_at` | timestamptz | YES | |

**`rec_mail_log`** (append — mọi lần gửi / retry)

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `outbox_id` | uuid | NO | FK → outbox |
| `company_id` | text | NO | |
| `attempt_no` | int | NO | |
| `provider_ref` | text | YES | |
| `result` | text | NO | sent\|failed |
| `logged_at` | timestamptz | NO | |

| **IX** | `(application_id, template_code)`, `(company_id, status)`, `(outbox_id)` |
| **Rule** | Thiếu CC interviewer khi `interview_invite` → reject ở API (`HRM-VAL-400`) trước insert |

---

## 3. Table catalog — CORE

### 3.0a `emp_document_type` — Catalog loại giấy tờ · Platform EMP `ICatalogRow` (CONFIRMED physical)

| Meta | Giá trị |
|------|---------|
| **Pillar** | CORE |
| **Physical** | **ADD** `public.emp_document_type` — **ABSENT AS-IS Nest** (closes R-PLT-DATA-04 EMP document slice) |
| **Platform** | Option B **`ICatalogRow`** — open catalog `document_type_key` per company (**BR-PLT-05**) |
| **ref_srs** | FR-UC-BP-CORE-03 · Meeting C4 checklist · **AC-PLT-EMP-02/03/06** · **BR-PLT-02/04/05** |
| **Writer** | EMP CFG / Settings — **tenant** CRUD on this table = SoT for checklist picker |
| **Group REF** | Optional later — GĐ1 tenant writer only |

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug — **same** list/get/mutate resolver (**U19**) |
| `document_type_key` | text | NO | | Mã loại giấy tờ mở — format `^[a-z][a-z0-9_]*$` — **cấm** enum đóng |
| `name_vi` | text | NO | | Nhãn UI |
| `sort_order` | int | NO | 100 | Thứ tự checklist / picker |
| `required_by_default` | boolean | NO | false | Mặc định bắt buộc khi tạo dòng checklist NV mới |
| `requires_expiry` | boolean | NO | false | Có hạn — UI cảnh báo |
| `blocks_activation` | boolean | NO | false | Thiếu mục bắt buộc → chặn kích hoạt hồ sơ |
| `is_identity_doc` | boolean | NO | false | Giấy tờ định danh (CCCD/hộ chiếu) |
| `allowed_mime_json` | jsonb | YES | NULL | Allow-list MIME tùy chọn — trống = mặc định nền tảng |
| `metadata_json` | jsonb | YES | NULL | Gợi ý tùy chọn — **không** thay cờ typed |
| `status` | text | NO | `'active'` | `active`\|`retired` |
| `archived_at` | timestamptz | YES | NULL | Soft-delete — ẩn picker; lịch sử checklist giữ key |
| `created_at` / `updated_at` | timestamptz | NO | now() | Audit |

| Constraint (hint) | Rule |
|---------------------|------|
| **PK** | `id` |
| **UQ active** | **Partial:** `(company_id, lower(document_type_key)) WHERE archived_at IS NULL` |
| **IX** | `(company_id, status)` · `(company_id, sort_order)` |
| **CHK format** | `document_type_key ~ '^[a-z][a-z0-9_]*$'` — **chỉ format** |
| **CHK status** | `status IN ('active','retired')` |
| **FORBIDDEN** | `CHECK (document_type_key IN (...))` · hard-delete khi còn dòng checklist |

**Starter keys** (`cccd`, `cv`, `degree`, …) = ví dụ bootstrap — **không** là trần sản phẩm.

---

### 3.0b `emp_employment_type` — Catalog loại hình thuê · Platform EMP `ICatalogRow` (CONFIRMED physical)

| Meta | Giá trị |
|------|---------|
| **Pillar** | CORE |
| **Physical** | **ADD** `public.emp_employment_type` — **ABSENT AS-IS Nest** (closes R-PLT-DATA-04 EMP employment slice) |
| **Platform** | Option B **`ICatalogRow`** — open catalog `employment_type_key` (**BR-PLT-05**) |
| **Dual SoT** | Group REF `settings-catalogs` / catalog-sync key **`employment_types`** (XBOS) **≠** EMP writer — union đọc; **dòng tenant thắng** khi trùng key (**BR-PLT-06**) |
| **ref_srs** | CORE hồ sơ / YCTD · **AC-PLT-EMP-04/05** · **BR-PLT-02/04/05/06** |
| **OUT** | Vị trí / phòng ban = catalog XBOS (**AC-PLT-EMP-01**) — **không** bảng `emp_position` tại đây |

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug |
| `employment_type_key` | text | NO | | Mã mở — ghi nhận chuẩn hóa `-` → `_` |
| `name_vi` | text | NO | | Nhãn UI |
| `sort_order` | int | NO | 100 | Thứ tự picker |
| `counts_toward_headcount` | boolean | NO | true | Tính định biên |
| `eligible_for_si` | boolean | NO | true | Gợi ý UX BHXH — **không** thay SoT enrollment / % phí |
| `is_contingent` | boolean | NO | false | Thời vụ / thực tập / hợp đồng ngoài |
| `metadata_json` | jsonb | YES | NULL | Gợi ý tùy chọn |
| `status` | text | NO | `'active'` | `active`\|`retired` |
| `archived_at` | timestamptz | YES | NULL | Soft-delete |
| `created_at` / `updated_at` | timestamptz | NO | now() | Audit |

| Constraint (hint) | Rule |
|---------------------|------|
| **PK** | `id` |
| **UQ active** | **Partial:** `(company_id, lower(employment_type_key)) WHERE archived_at IS NULL` |
| **IX** | `(company_id, status)` · `(company_id, sort_order)` |
| **CHK format** | `employment_type_key ~ '^[a-z][a-z0-9_]*$'` — **chỉ format** |
| **CHK status** | `status IN ('active','retired')` |
| **FORBIDDEN** | `CHECK (employment_type_key IN ('full_time','part_time',…))` · hard-delete · ghi đè partition REF XBOS qua API EMP |

**Starter keys** (`full_time`, `part_time`, `contract`, `intern`) = ví dụ bootstrap — **không** trần 4 lựa chọn.

> **Peer trạng thái làm việc:** Catalog trạng thái NV / lý do → **§3.0c** `emp_employment_status` + **§3.0d** `emp_status_reason` — **khác** loại hình thuê (§3.0b). **Cấm** gộp trạng thái vào bảng ET / trường tùy chỉnh EMP-CUSTOM.

---

### 3.0c `emp_employment_status` — Catalog trạng thái làm việc · Platform EMP `ICatalogRow` (CONFIRMED physical)

| Meta | Giá trị |
|------|---------|
| **Pillar** | CORE |
| **Physical** | **ADD** `public.emp_employment_status` — **ABSENT AS-IS Nest** (closes **R-PLT-DATA-04** EMP status catalog slice) |
| **Platform** | Option B **`ICatalogRow`** — open catalog `status_key` per company (**BR-PLT-05**) |
| **Dual SoT** | Group REF `settings-catalogs` / catalog-sync storage **`employee_statuses`** / **`employment_statuses`** **≠** EMP writer **`emp_employment_status`** — effective union; EMP row **wins** on key collision (**BR-PLT-06**) — Settings = **REF**, không phải SoT duy nhất |
| **ref_srs** | CORE hồ sơ · **AC-PLT-EMP-STATUS-01*** · **BR-PLT-02/04/05/06** |
| **OUT** | Loại hình thuê = §3.0b · giấy tờ = §3.0a · EMP-CUSTOM extension · máy trạng thái chuyển reverse (code residual) |

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug — **same** list/get/mutate resolver (**U19**) |
| `status_key` | text | NO | | Mã trạng thái mở — format `^[a-z][a-z0-9_]*$` — **cấm** enum đóng |
| `name_vi` | text | NO | | Nhãn UI (display-ready) |
| `sort_order` | int | NO | 100 | Thứ tự picker |
| `is_workforce_active` | boolean | NO | true | Đang trong lực lượng làm việc |
| `is_terminal` | boolean | NO | false | Trạng thái kết thúc quan hệ |
| `requires_reason` | boolean | NO | false | Đổi sang mã này cần lý do ∈ §3.0d |
| `counts_toward_headcount` | boolean | NO | true | Tính định biên / báo cáo |
| `legacy_alias_keys_json` | jsonb | YES | NULL | Alias → mã chuẩn (tùy chọn) |
| `metadata_json` | jsonb | YES | NULL | Gợi ý tùy chọn — **không** thay cờ typed |
| `status` | text | NO | `'active'` | `active`\|`retired` (vòng đời dòng catalog) |
| `archived_at` | timestamptz | YES | NULL | Soft-delete — ẩn picker; lịch sử NV giữ key |
| `created_at` / `updated_at` | timestamptz | NO | now() | Audit |

| Constraint (hint) | Rule |
|---------------------|------|
| **PK** | `id` |
| **UQ active** | **Partial:** `(company_id, lower(status_key)) WHERE archived_at IS NULL` |
| **IX** | `(company_id, status)` · `(company_id, sort_order)` · effective `(company_id) WHERE archived_at IS NULL AND status='active'` |
| **CHK format** | `status_key ~ '^[a-z][a-z0-9_]*$'` — **chỉ format** |
| **CHK row status** | `status IN ('active','retired')` |
| **FORBIDDEN** | `CHECK (status_key IN (...))` · hard-delete khi còn hồ sơ NV · gộp vào §3.0b |

**Starter keys** (`active`, `probation`, `inactive`, `on_leave`, `resigned`, `terminated`) = ví dụ bootstrap — **không** trần sản phẩm.

---

### 3.0d `emp_status_reason` — Catalog lý do đổi trạng thái · Platform EMP `ICatalogRow` (CONFIRMED physical)

| Meta | Giá trị |
|------|---------|
| **Pillar** | CORE |
| **Physical** | **ADD** `public.emp_status_reason` — **ABSENT AS-IS Nest** (companion §3.0c) |
| **Platform** | Option B **`ICatalogRow`** — open catalog `reason_key` (**BR-PLT-05**) |
| **ref_srs** | **AC-PLT-EMP-STATUS-01e** · **BR-PLT-02/04/05** |
| **Consumer** | Khi trạng thái `requires_reason` hoặc danh mục lý do hiệu lực >0 — invent → **`HRM-EMP-STATUS-REASON-KEY`** |

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug |
| `reason_key` | text | NO | | Mã lý do mở — format `^[a-z][a-z0-9_]*$` |
| `name_vi` | text | NO | | Nhãn UI |
| `sort_order` | int | NO | 100 | Thứ tự picker |
| `applies_to_status_keys_json` | jsonb | YES | NULL | Tùy chọn: danh sách `status_key` áp dụng — trống = theo quy tắc BA |
| `metadata_json` | jsonb | YES | NULL | Gợi ý tùy chọn |
| `status` | text | NO | `'active'` | `active`\|`retired` |
| `archived_at` | timestamptz | YES | NULL | Soft-delete |
| `created_at` / `updated_at` | timestamptz | NO | now() | Audit |

| Constraint (hint) | Rule |
|---------------------|------|
| **PK** | `id` |
| **UQ active** | **Partial:** `(company_id, lower(reason_key)) WHERE archived_at IS NULL` |
| **IX** | `(company_id, status)` · `(company_id, sort_order)` · effective active |
| **CHK format** | `reason_key ~ '^[a-z][a-z0-9_]*$'` — **chỉ format** |
| **CHK row status** | `status IN ('active','retired')` |
| **FORBIDDEN** | `CHECK (reason_key IN (...))` · hard FK DDL sang §3.0c GĐ1 · hard-delete |

---

### 3.1 `hrm_employee` — Hồ sơ vòng Public

| Meta | Giá trị |
|------|---------|
| **Pillar** | CORE |
| **Sensitivity** | **Public** |
| **ref_srs** | FR-UC-BP-CORE-01 · Meeting C1–C2 |
| **Lifecycle** | pending_docs → active → terminated |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | |
| `employee_code` | text | NO | Mã NV trong CT |
| `full_name` | text | NO | |
| `work_email` | text | YES | Email làm việc |
| `work_phone` | text | YES | ĐT làm việc |
| `personal_phone` | text | YES | Liên hệ cá nhân (public ring) |
| `department_id` | text | YES | |
| `position_key` | text | YES | |
| `manager_employee_id` | uuid | YES | Self-FK |
| `status` | text | NO | Mã trạng thái mở (§3.0c) — soft key text; **không** hard FK GĐ1 |
| `hire_date` | date | YES | |
| `activated_at` | timestamptz | YES | F-CORE-ACT-01 khi `status→active` |
| `candidate_id` | uuid | YES | Soft audit link REC (read) |
| `profile_groups_json` | jsonb | YES | Config nhóm hiển thị (CORE-02b) — không chứa C&B |
| `archived_at` | timestamptz | YES | |

| **UQ** | `(company_id, employee_code)` active |
| **IX** | `(company_id, status)`, `(company_id, department_id)`, `(manager_employee_id)` |
| **Cấm cột** | `base_salary`, `tax_id`, `bank_*`, `social_insurance_no`, `% BH` |
| **FORBIDDEN DDL** | Khôi phục `CHECK (status IN ('active','inactive'))` làm trần sản phẩm — **DROP/REPLACE** khi ensureSchema (EMP-STATUS-CATALOG-DATA-01) |

> **Loại hình thuê (EXPAND note):** Nếu AS-IS / physical có cột `employment_type` hoặc `employment_type_key` trên hồ sơ — lưu **mã** từ catalog §3.0b (không đổi tên cột). Khi catalog tenant >0, giá trị phải thuộc danh mục hiệu lực; lịch sử có thể giữ mã đã `retired`. Vị trí / phòng ban vẫn là picker REF XBOS — không thuộc bảng EMP catalog này.

> **Trạng thái làm việc (EXPAND — EMP-STATUS-CATALOG-DATA-01):** Cột `status` **vẫn là text** (không rename / không hard FK GĐ1). Khi danh mục hiệu lực Nest `emp_employment_status` **>0**: tạo/sửa NV phải chọn mã ∈ F-EMP-CAT-ST-EFF-01; invent → **`HRM-EMP-STATUS-KEY`**; dòng lịch sử **được** giữ mã đã nghỉ. Dual SoT: settings-catalogs **`employee_statuses`** / **`employment_statuses`** = group REF; tenant writer = §3.0c — **tenant thắng**. Settings MD **không** còn SoT picker duy nhất. Lý do đổi trạng thái (khi bắt buộc) ∈ §3.0d — invent → **`HRM-EMP-STATUS-REASON-KEY`**.

---

### 3.2 `hrm_employee_compensation` — Vòng C&B (extension 1–1 / versioned)

| Meta | Giá trị |
|------|---------|
| **Pillar** | CORE |
| **Sensitivity** | **C&B** |
| **ref_srs** | FR-UC-BP-CORE-02 · Meeting C2 |
| **Note** | Version theo `effective_from` — PAY đọc vars; REC/ATT **cấm** write |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `employee_id` | uuid | NO | FK employee |
| `company_id` | text | NO | |
| `effective_from` | date | NO | |
| `effective_to` | date | YES | NULL = open |
| `base_salary` | numeric | YES | |
| `allowances_json` | jsonb | YES | Phụ cấp cấu trúc |
| `tax_id` | text | YES | MST |
| `bank_account` | text | YES | |
| `bank_name` | text | YES | |
| `social_insurance_no` | text | YES | Số sổ / = CCCD khi policy |
| `archived_at` | timestamptz | YES | |

| **IX** | `(employee_id, effective_from DESC)` |
| **Rule** | Không overlap kỳ active (V-05 style); cấm ghi đè segment kỳ đã trả lương |

---

### 3.3 `hrm_dependent` — Người phụ thuộc / gia đình

| Meta | Giá trị |
|------|---------|
| **Pillar** | CORE |
| **Sensitivity** | Public (đủ quà 1/6) · chi tiết thuế GTCG có thể C&B flag |
| **ref_srs** | Meeting C2 · FR-UC-BP-PAY-03 (read) |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `employee_id` | uuid | NO | FK |
| `company_id` | text | NO | |
| `full_name` | text | NO | |
| `relation_code` | text | NO | child\|spouse\|… |
| `date_of_birth` | date | YES | Quà 1/6 |
| `is_tax_dependent` | boolean | NO | GTCG — C&B consumer |
| `effective_from` / `effective_to` | date | | |
| `archived_at` | timestamptz | YES | |

| **IX** | `(employee_id)`, `(company_id, relation_code)` |

---

### 3.4 `hrm_contract` — Hợp đồng lao động

| Meta | Giá trị |
|------|---------|
| **Pillar** | CORE |
| **ref_srs** | FR-UC-BP-CORE-09 · **09a** · **09b** · **09c** · Meeting C4 |
| **Physical AS-IS alias** | **`public.employee_contracts`** — **ONE** registry SoT (UF-HRM-02) |
| **Lifecycle** | registry: `active`\|`expired`\|`terminated` (AS-IS CHECK) · print: draft_preview → issued → superseded (child table) |
| **CONFIRMED** | `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01` (2026-08-06) — Option A EXPAND + child tables §3.4a–d |

**Alias map — registry ONE SoT (no dual-write)**

| Logical | Physical AS-IS / ADD | Role |
|---------|----------------------|------|
| `hrm_contract` | **`public.employee_contracts`** | Registry CRUD must_keep |
| `contract_type_key` | **`contract_type`** | Alias only |
| `effective_from` / `effective_to` | **`start_date` / `end_date`** | Alias only |
| Live C&B link | **`compensation_package_id`** (AS-IS) | Soft FK F5 — **must_keep** |
| Print salary snapshot | **`hrm_contract_print_versions.compensation_snapshot_json`** | **≠** live PAY · **≠** registry body salary |
| `salary_calc_mode` / body `salary` | — | **DEPRECATED** — BR-CD-F5-01 ignore on write |

| Cột (logical / physical) | Kiểu | Null | Ý nghĩa |
|--------------------------|------|------|---------|
| `id` | uuid | NO | PK |
| `employee_id` | uuid | NO | Soft FK employees |
| `company_id` | text | NO | Scope |
| `contract_code` | text | YES | AS-IS nullable; UQ when present |
| `contract_type_key` / `contract_type` | text | NO | Catalog / type string |
| `signed_at` | date | YES | **ADD** optional |
| `effective_from` / `start_date` | date | NO | |
| `effective_to` / `end_date` | date | YES | Open-ended G-CI-01 |
| `position_key` | text | YES | Catalog SoT; `position` denorm |
| `department_key` / `department` | text | YES | AS-IS |
| `signer_name` · `signer_position` · `signer_position_key` | text | YES | AS-IS must_keep |
| `notes` | text | YES | AS-IS |
| `compensation_package_id` | uuid | YES | Soft FK F5 |
| `work_location` | text | YES | Đ.21.c — **ADD** (AS-IS missing) |
| `work_location_scope` | text | YES | **ADD** fixed\|mobile\|multi |
| `pack_code` | text | YES | **ADD** denorm last issued pack |
| `template_id` | uuid | YES | **ADD** soft FK → templates |
| `term_type` | text | YES | **ADD** indefinite\|definite\|seasonal_other |
| `job_description_text` | text | YES | **ADD** — ≠ free-text position SoT |
| `probation_days` / `probation_end` | int / date | YES | **ADD** |
| `license_class` · `vehicle_plate` · `route_or_region` | text | YES | **ADD** DRIVER pack |
| `status` | text | NO | AS-IS `active`\|`expired`\|`terminated` |
| `archived_at` | timestamptz | YES | **ADD** soft-delete preferred (AS-IS Nest may hard DELETE until BE) |

| **UQ** | Partial prefer: `(company_id, contract_code) WHERE contract_code IS NOT NULL AND archived_at IS NULL` |
| **IX** | `(company_id, end_date)` AS-IS; `(employee_id, status)`; `(company_id, pack_code)` |
| **Rule** | ≤1 `active` overlapping (V-05); **salary ignored on write**; print SoT = §3.4c |

> Full physical plan: [`PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md). Honesty: `contracts_printable_ready=false`.

#### 3.4a `hrm_contract_template` ↔ `hrm_contract_templates` (**ADD**)

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id`, `company_id`, `code`, `name_vi` | | NO | PK + UQ code/company |
| `pack_code` | text | NO | Default GENERAL\|IT_OFFICE\|DRIVER\|LOGISTICS |
| `layout_json` · `keyword_map` | jsonb | NO | Section order + merge map |
| `status` | text | NO | draft\|active\|retired |
| `version` | int | NO | |
| `origin` | text | NO | **EXPAND DATA-02** — default `member` · `member`\|`group`\|`member_override` |
| `origin_company_id` | text | YES | **EXPAND DATA-02** — `holding` when pulled |
| `origin_publish_version` | int | YES | **EXPAND DATA-02** — publish N after pull |
| `lineage_code` | text | YES | **EXPAND DATA-02** — stable = `code` for group rows |
| `archived_at` | timestamptz | YES | Soft-delete |

| **UQ** | `(company_id, code) WHERE archived_at IS NULL` |
| **IX** | `(company_id, status)`, `(company_id, pack_code)` · **DATA-02** `(company_id, lineage_code)` WHERE lineage not null · `(company_id, origin, origin_publish_version)` |
| **CORR-01** | Catalog **open** — starter 8 `XEVN_*` = examples only; **FORBIDDEN** ship `CHECK code IN (8 XEVN_*)` / closed enum; HR CRUD code **9+** (AC-CTR-XEVN-11). SoT [`CORR-01`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md) · platform [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-01`](../../program/PO_HRM_DYNAMIC_CONFIG_PLATFORM_01.md) (clauses/structure also dynamic — pointer). |

#### 3.4b `hrm_contract_clause` ↔ `hrm_contract_clauses` (**ADD**)

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id`, `company_id`, `code`, `title_vi`, `body_vi` | | NO | |
| `clause_group` | text | NO | SPEC §B.3 |
| `apply_to_packs` | text[] | NO | Packs or `*` |
| `sort_order` | int | NO | |
| `mandatory` | boolean | NO | Pack gate |
| `status` · `version` | text / int | NO | BR-CTR-CL-01 |
| `effective_from` | date | YES | |
| `origin` | text | NO | **EXPAND DATA-02** — default `member` · `member`\|`group`\|`member_override` |
| `origin_company_id` | text | YES | **EXPAND DATA-02** |
| `origin_publish_version` | int | YES | **EXPAND DATA-02** |
| `lineage_code` | text | YES | **EXPAND DATA-02** — stable = `code` |
| `archived_at` | timestamptz | YES | |

| **UQ** | `(company_id, code) WHERE status='active' AND archived_at IS NULL` |
| **IX** | `(company_id, clause_group)`, `(company_id, status)` · **DATA-02** lineage IX same as §3.4a |

#### 3.4c `hrm_contract_print_version` ↔ `hrm_contract_print_versions` (**ADD**)

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id`, `contract_id`, `company_id`, `version_no` | | NO | Soft FK contract; UQ (contract_id, version_no) |
| `pack_code` · `template_id` · `template_version` | | | Frozen |
| `merged_fields_json` · `clauses_snapshot_json` | jsonb | NO | Issued snapshot |
| `compensation_snapshot_json` | jsonb | YES | Historical print — **≠** live PAY |
| `status` | text | NO | draft_preview\|issued\|superseded |
| `issued_at` · `issued_by` · `pdf_artifact_ref` | | YES | |
| `archived_at` | timestamptz | YES | |

| **Rule** | Amend = **new** version; cấm overwrite `issued`; PDF from snapshot |

#### 3.4d `hrm_contract_pack_rule` ↔ `hrm_contract_pack_rules` (**ADD**)

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id`, `company_id`, `match_type`, `pack_code`, `priority`, `status` | | | `job_family` MVP · `fallback` |
| `match_value` | text | YES | Family tag |
| `origin` | text | NO | **EXPAND DATA-02** — default `member` |
| `origin_company_id` | text | YES | **EXPAND DATA-02** |
| `origin_publish_version` | int | YES | **EXPAND DATA-02** |
| `lineage_code` | text | YES | **EXPAND DATA-02** — `pr:{match_type}:{match_value|∅}:{pack_code}` |
| `archived_at` | timestamptz | YES | |

| **IX** | `(company_id, match_type, priority)` · **DATA-02** lineage IX |
| **Rule** | Pattern reuse JD pack rules; **≠** dual-write `rec_jd_pack_rule` (pack codes khác) · no match → `GENERAL` |

> **DOC-DELTA CONFIRMED `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02` (2026-08-07):** EXPAND lineage on §3.4a/b/d — `origin` · `origin_company_id` · `origin_publish_version` · `lineage_code` (+ IX). ADD §3.4e publishes + §3.4f pull_audits. Full SoT [`PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md). **Không** wipe §3.4a–d / print_versions. `contracts_printable_ready=false`.

#### 3.4e `hrm_contract_library_publish` ↔ `hrm_contract_library_publishes` (**ADD** · DATA-02)

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id`, `tenant_id`, `source_company_id` | uuid / text | NO | PK · master tenant · **`holding`** |
| `publish_version` | int | NO | Monotonic per tenant |
| `checksum` · `payload_json` | text / jsonb | NO | Immutable freeze |
| `label_vi` | text | YES | |
| `template_count` · `clause_count` · `pack_rule_count` | int | NO | Denorm list |
| `published_at` · `published_by` · `status` | | | `published`\|`retired` |
| `archived_at` | timestamptz | YES | Soft-delete |

| **UQ** | `(tenant_id, publish_version)` |
| **IX** | `(tenant_id, status, publish_version DESC)` |
| **Rule** | Never mutate `payload_json` after INSERT · **≠** `synced_catalogs` |

#### 3.4f `hrm_contract_library_pull_audit` ↔ `hrm_contract_library_pull_audits` (**ADD** · DATA-02)

| Cột | Kiểu | Ý nghĩa |
|-----|------|---------|
| `id`, `company_id`, `tenant_id`, `publish_version`, `publish_id?` | | Soft FK publish |
| `force`, `pulled_at`, `pulled_by` | | |
| `result_json` | jsonb | `{ upserted, skipped_override, conflicts }` |
| `archived_at` | timestamptz | YES |

| **IX** | `(company_id, pulled_at DESC)` · `(company_id, publish_version)` |
| **Rule** | **CONFIRMED** dedicated audit — **reject** platform-audit-only as sole SoT GĐ1.5 |

---

### 3.5 `hrm_document_checklist_item` — Giấy tờ còn thiếu

| Cột | Kiểu | Ý nghĩa |
|-----|------|---------|
| `id`, `employee_id`, `company_id` | | |
| `document_type_key` | text | Mã loại giấy tờ — **open catalog** (§3.0a `emp_document_type`); starter ví dụ ≠ trần |
| `required` | boolean | |
| `status` | text | missing\|submitted\|approved |
| `file_ref` | text | YES |

Meeting C4 checklist trên hồ sơ. Activate employee (CORE-07) khi đủ bắt buộc.

> **EXPAND — `document_type_key`:** Cột **vẫn là text** (không rename / không hard FK GĐ1). Sau khi danh mục tenant có dòng: tạo/sửa checklist phải chọn mã ∈ catalog hiệu lực; dòng lịch sử **được** giữ mã đã nghỉ (`retired` + `archived_at` trên §3.0a). Cờ `required_by_default` / `blocks_activation` trên catalog định nghĩa mặc định và cổng kích hoạt — không xóa spine checklist / hợp đồng / BHXH.

---

### 3.6 `hrm_insurance_enrollment` + `hrm_insurance_rate_period` — BHXH lifecycle

| Meta | Giá trị |
|------|---------|
| **Pillar** | CORE (participant + timeline áp dụng NV) |
| **ref_srs** | FR-UC-BP-CORE-10 · **AC-SI-TL-01..05** · Meeting C5 |
| **Split** | Master % pháp nhân = `pay_insurance_rate_cfg` (PAY CFG §5.4) — participant ≠ rate master (`DATA_OWNERSHIP` §9.6) |
| **CONFIRMED** | `PO-HRM-E2E-LINK-EMP-DB-01` (2026-08-06) — Option A overlay |

**Alias map — ONE enrollment SoT (no dual-write)**

| Logical | Physical AS-IS (Nest) | Role |
|---------|----------------------|------|
| `hrm_insurance_enrollment` | **`public.employee_insurances`** | **ONE** enrollment lifecycle SoT (F-CORE-SI-02/03) |
| `hrm_insurance_rate_period` | **`public.hrm_insurance_rate_period`** (**ADD** — AS-IS thiếu) | Append-only rate/amount timeline |
| *(not enrollment SoT)* | `public.employee_insurance_records` | Contracts-insurance expiry/provider list — **read/legacy**; **cấm** AC-SI-TL SoT |
| *(not enrollment SoT)* | `public.hrm_insurance_policy_participants` | Policy participation / PAY CFG attach — **≠** enrollment lifecycle |

**Rationale (AS-IS skim):** `employee_insurances` = employee-scoped Nest CRUD (`EmployeeInsurancesService`) với `type` / `start_date` / `end_date` / `contribution` / `status` — khớp enrollment. Rates hiện nằm cùng row → **overwrite risk** → đóng bằng period append. Participants giữ gắn chính sách; records giữ proxy hết hạn — **không** invent bảng enrollment thứ hai.

**`hrm_insurance_enrollment`** ↔ physical `employee_insurances`

| Cột (logical / physical) | Kiểu | Null | Ý nghĩa |
|--------------------------|------|------|---------|
| `id` | uuid | NO | PK |
| `employee_id` | uuid | NO | FK soft → employees |
| `company_id` | text | NO | Scope |
| `insurance_type_key` / AS-IS `type` | text | NO | BHXH / BHYT / … (alias `type`) |
| `si_number` | text | YES | C&B-ish; = CCCD khi policy — **ADD nullable** nếu AS-IS thiếu |
| `status` | text | NO | **CONFIRMED enum:** `active`\|`suspended`\|`stopped`\|`closed` (mở rộng AS-IS `active` only) |
| `policy_id` | uuid | YES | Optional soft → insurance policy / participant context — **không** đổi SoT |
| `archived_at` | timestamptz | YES | Soft-delete |

| **EXPAND — `type` / `insurance_type_key` (SI-INS-CATALOG-DATA-01)** | Cột **vẫn là text** (không rename / không hard FK GĐ1). Khi danh mục hiệu lực **>0**: tạo/sửa enrollment / policy / rate-cfg phải chọn mã ∈ catalog Nest `si_insurance_type` (F-SI-CAT-EFF-01); dòng lịch sử **được** giữ mã đã nghỉ. **FORBIDDEN** `CHECK (type IN (...))`. Dual SoT: settings-catalogs partition **`insurance_types`** = group REF; tenant writer = §3.6a — **tenant thắng** khi trùng khóa. Settings MD **không** còn SoT picker duy nhất. |
| **EXPAND — `insurer_key` (SI-INSURER-CATALOG-DATA-01)** | Cột policy / records **vẫn là text** (không hard FK GĐ1). Khi danh mục hiệu lực Nest `si_insurer` **>0**: tạo/sửa phải chọn mã ∈ F-SI-CAT-INS-EFF-01; dòng lịch sử **được** giữ mã đã nghỉ. Dual SoT: settings-catalogs partition **`insurers`** = group REF; tenant writer = §3.6b — **tenant thắng**. Settings MD **không** còn SoT picker duy nhất. |
| **FORBIDDEN** | Dual enrollment SoT · gộp catalog nhà bảo hiểm vào bảng loại BH (§3.6a) · mega-EAV · seed UF · claim printable/personnel UAT |

**Action → enrollment.status + period_status (F-CORE-SI-03) — CONFIRMED EMP-DB-01:**

| action | enrollment.status | period_status |
|--------|-------------------|---------------|
| `close` | `closed` | `closed` |
| `stop` | `stopped` | `stopped` |
| `suspend` | `suspended` | `suspended` |
| `change_rate` | giữ `active` (trừ đang `suspended`) | `applying` |
| `resume` | `active` | `applying` |

**`hrm_insurance_rate_period`** (timeline mức đóng NV/CTY — **ADD physical**; giữ dữ liệu khi tạm dừng)

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `enrollment_id` | uuid | NO | Soft FK → `employee_insurances.id` |
| `company_id` | text | NO | Scope parity với enrollment |
| `effective_from` | date | NO | |
| `effective_to` | date | YES | Prior row close = day-before next |
| `employee_rate_pct` | numeric | YES | % NV |
| `employer_rate_pct` | numeric | YES | % CTY |
| `employee_amount` | numeric | YES | Amount mode (map AS-IS `contribution`) |
| `employer_amount` | numeric | YES | Amount mode (map AS-IS `employer_contribution`) |
| `pay_rate_cfg_id` | uuid | YES | Soft → `pay_insurance_rate_cfg` (PAY owns master %) |
| `period_status` | text | NO | `applying`\|`suspended`\|`closed`\|`stopped` |
| `action` | text | YES | `close`\|`stop`\|`suspend`\|`change_rate`\|`resume` — audit |
| `change_reason` / `suspend_reason` | text | YES | Đổi mức / căn cứ tạm hoãn |
| `archived_at` | timestamptz | YES | |

| **IX** | `(enrollment_id, effective_from)`, `(company_id, period_status)`; **UQ** open period: `(enrollment_id) WHERE effective_to IS NULL AND archived_at IS NULL` (một kỳ đang mở / enrollment) |
| **Rule** | Action AC-SI-TL = **append** period + set prior `effective_to`; **cấm** UPDATE đè amount/rate im lặng; suspend **không** xóa lịch sử; PAY đọc period + CFG — **không** dual-write % lên employee public |
| **Q-SI-SUSPEND** | **SUPERSEDED** cho GĐ1 action vocabulary bởi AC-SI-TL / EMP-SA-01 — giữ residual **AC-SI-TL-06** PAY read |

---

### 3.6a `si_insurance_type` — Catalog loại bảo hiểm · Platform SI `ICatalogRow` (CONFIRMED physical)

| Meta | Giá trị |
|------|---------|
| **Pillar** | CORE · Contracts & Insurance |
| **ref_srs** | FR-UC-BP-CORE-10 · BR-PLT-02/04/05/06 · AC-PLT-SI-INS-01* · E3 AC-INS |
| **Physical** | **ADD** `public.si_insurance_type` — **ABSENT AS-IS Nest** (closes **R-PLT-DATA-04** SI insurance-type catalog slice) |
| **CONFIRMED** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01` (2026-08-08) |
| **Platform** | Option B **`ICatalogRow`** — domain table · **not** mega-EAV · **not** bảng catalog thứ hai cho policy |
| **Dual SoT** | Group REF `settings-catalogs` / catalog-sync storage **`insurance_types`** **≠** SI writer **`si_insurance_type`** — effective union; SI row **wins** on key collision (**BR-PLT-06**) |
| **Caps** | F-SI-CAT-TYP-01/02 · F-SI-CAT-EFF-01 |
| **Peer insurers** | Catalog nhà bảo hiểm → **§3.6b** `si_insurer` · **cấm** gộp vào bảng loại BH này |

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug |
| `insurance_type_key` | text | NO | | Mã danh mục mở — định dạng `^[a-zA-Z][a-zA-Z0-9_]*$` (cho phép `BHXH`); UQ/assert `lower(key)` |
| `name_vi` | text | NO | | Nhãn UI |
| `sort_order` | int | NO | 100 | Thứ tự picker |
| `is_statutory` | boolean | NO | false | Nhóm BH bắt buộc (BHXH/BHYT/BHTN) vs thương mại |
| `eligible_for_rate_cfg` | boolean | NO | true | Cổng mềm Settings `pay_insurance_rate_cfg` |
| `requires_policy` | boolean | NO | false | Gợi ý UX cần gắn hợp đồng BH — **không** hard FK |
| `legacy_alias_keys_json` | jsonb | YES | NULL | Alias tùy chọn (vd. `social`) → khóa chuẩn |
| `metadata_json` | jsonb | YES | NULL | Gợi ý — **không** thay cờ typed |
| `status` | text | NO | `'active'` | `active` \| `retired` |
| `archived_at` | timestamptz | YES | NULL | Soft-delete |
| `created_at` / `updated_at` | timestamptz | NO | now() | Audit |

| Constraint | Rule |
|------------|------|
| **UQ active** | `(company_id, lower(insurance_type_key)) WHERE archived_at IS NULL` |
| **IX list** | `(company_id, status)` · `(company_id, sort_order)` |
| **IX effective** | `(company_id) WHERE archived_at IS NULL AND status = 'active'` |
| **CHK format** | `insurance_type_key ~ '^[a-zA-Z][a-zA-Z0-9_]*$'` — **chỉ định dạng** |
| **CHK status** | `status IN ('active','retired')` |
| **FORBIDDEN** | `CHECK (insurance_type_key IN ('BHXH','BHYT','social',…))` · hard-delete khi còn lịch sử · gộp `insurers` · bảng catalog thứ hai |

| Consumer (soft key — không hard FK GĐ1) | Cột |
|----------------------------------------|-----|
| Policy contracts-insurance | `insurance_type` |
| Enrollment `employee_insurances` | `type` (alias `insurance_type_key`) |
| Settings rate master | `pay_insurance_rate_cfg.insurance_type_key` |

| **Rule** | Khi danh mục hiệu lực **>0**: consumer phải chọn mã ∈ F-SI-CAT-EFF-01; invent → `HRM-INS-TYPE-KEY`; lịch sử được giữ mã `retired`. Enrollment ONE SoT §3.6 **must_keep**. |
| **Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · **C-SLICE ≠ module UAT** |

---

### 3.6b `si_insurer` — Catalog nhà bảo hiểm · Platform SI `ICatalogRow` (CONFIRMED physical)

| Meta | Giá trị |
|------|---------|
| **Pillar** | CORE · Contracts & Insurance |
| **ref_srs** | FR-UC-BP-CORE-10 · E3 AC-INS-02 · BR-PLT-02/04/05/06 · AC-PLT-SI-INSURER-01* |
| **Physical** | **ADD** `public.si_insurer` — **ABSENT AS-IS Nest** (closes **R-PLT-DATA-04** SI insurers catalog slice) |
| **CONFIRMED** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01` (2026-08-08) |
| **Platform** | Option B **`ICatalogRow`** — domain table · **not** mega-EAV · **not** gộp vào §3.6a `si_insurance_type` |
| **Dual SoT** | Group REF `settings-catalogs` / catalog-sync storage **`insurers`** (aliases `insurance_providers` / `bhxh_providers`) **≠** SI writer **`si_insurer`** — effective union; SI row **wins** on key collision (**BR-PLT-06**) |
| **Caps** | F-SI-CAT-INS-01/02 · F-SI-CAT-INS-EFF-01 |
| **Peer type** | §3.6a `si_insurance_type` **RETAIN** — SoT riêng · **cấm** fold / reopen L1 |

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug |
| `insurer_key` | text | NO | | Mã danh mục mở — định dạng `^[a-zA-Z][a-zA-Z0-9_]*$`; UQ/assert `lower(key)` |
| `name_vi` | text | NO | | Nhãn UI |
| `sort_order` | int | NO | 100 | Thứ tự picker |
| `legacy_alias_keys_json` | jsonb | YES | NULL | Alias tùy chọn → khóa chuẩn |
| `metadata_json` | jsonb | YES | NULL | Gợi ý — **không** thay cột ICatalogRow · **không** mega-EAV SoT |
| `status` | text | NO | `'active'` | `active` \| `retired` |
| `archived_at` | timestamptz | YES | NULL | Soft-delete |
| `created_at` / `updated_at` | timestamptz | NO | now() | Audit |

| Constraint | Rule |
|------------|------|
| **UQ active** | `(company_id, lower(insurer_key)) WHERE archived_at IS NULL` |
| **IX list** | `(company_id, status)` · `(company_id, sort_order)` |
| **IX effective** | `(company_id) WHERE archived_at IS NULL AND status = 'active'` |
| **CHK format** | `insurer_key ~ '^[a-zA-Z][a-zA-Z0-9_]*$'` — **chỉ định dạng** |
| **CHK status** | `status IN ('active','retired')` |
| **FORBIDDEN** | `CHECK (insurer_key IN (…))` · hard-delete khi còn lịch sử · gộp vào `si_insurance_type` · mega-EAV · rewrite enrollment |

| Consumer (soft key — không hard FK GĐ1) | Cột |
|----------------------------------------|-----|
| Policy Nest `hrm_insurance_policies` | `insurer_key` (+ snapshot `insurer_label`) |
| Legacy records | `employee_insurance_records.insurer_key` (BA enumerate) |

| **Rule** | Khi danh mục hiệu lực **>0**: consumer phải chọn mã ∈ F-SI-CAT-INS-EFF-01; invent → `HRM-INS-INSURER-KEY`; lịch sử được giữ mã `retired`. Type KEY `HRM-INS-TYPE-KEY` **≠** insurer KEY. Enrollment ONE SoT §3.6 **must_keep**. |
| **Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · **C-SLICE ≠ module UAT** |

---

### 3.7 `hrm_reward_discipline` — KT / KL

| Meta | Giá trị |
|------|---------|
| **Pillar** | CORE |
| **ref_srs** | FR-UC-BP-CORE-08 · Meeting C6 |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `employee_id` | uuid | NO | |
| `company_id` | text | NO | |
| `kind` | text | NO | reward\|discipline |
| `title` | text | NO | Tiêu đề trước |
| `amount` | numeric | YES | NULL = không tiền |
| `decision_date` | date | YES | |
| `payroll_link_status` | text | NO | `none`\|`pending_period`\|`linked`\|`executed` |
| `payroll_period_id` | uuid | YES | Soft → `pay_payroll_period` (P3 · KT/KL có tiền) |
| `payroll_period_ref` | text | YES | Legacy/display mã kỳ — ưu tiên `payroll_period_id` |
| `payslip_id` | uuid | YES | Soft → `pay_payslip` sau khi executed — **PAY owns payslip** |
| `status` | text | NO | draft\|approved\|cancelled |
| `archived_at` | timestamptz | YES | |

| **IX** | `(employee_id, kind)`, `(company_id, payroll_link_status)`, `(payroll_period_id)` |
| **Rule** | Có `amount` → bắt buộc theo dõi `payroll_link_status` đến `executed` (SYNTHESIS P3) |
| **Boundary** | CORE owns case; PAY chỉ link kỳ/phiếu — **không** dual-write amount sang payslip ngoài engine |

---

### 3.8 `hrm_asset_assignment` + `hrm_asset_handover` — Tài sản stub

| Meta | Giá trị |
|------|---------|
| **Pillar** | CORE |
| **ref_srs** | FR-UC-BP-CORE-05/06 · Meeting C7 · ADR Q-ASSET-MODULE GĐ1 stub |
| **Lifecycle** | allocated → return_pending → returned\|lost |

**Assignment**

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `employee_id` | uuid | NO | |
| `company_id` | text | NO | |
| `asset_code` | text | NO | Mã / serial stub |
| `asset_name` | text | YES | |
| `status` | text | NO | allocated\|return_pending\|returned\|lost |
| `allocated_at` | timestamptz | YES | |
| `archived_at` | timestamptz | YES | |

**Handover (biên bản)**

| Cột | Kiểu | Ý nghĩa |
|-----|------|---------|
| `id`, `assignment_id`, `handover_type` | issue\|return | |
| `signed_internal_at`, `signer_user_ids_json` | e-sign nội bộ metadata | |
| `checklist_on_termination` | boolean | Đưa vào checklist nghỉ việc |

| **Rule** | Allocate khi `employee.status=terminated` → reject (V-06) |

---

### 3.9 `hrm_employment_history` — Lịch sử công tác

| Meta | Giá trị |
|------|---------|
| **Pillar** | CORE |
| **ref_srs** | Meeting C8 · **FR-UC-BP-CORE-01a** (DOC-DELTA EMP-SA-01) |
| **Physical AS-IS alias** | `public.employee_work_timeline` — **ONE** SoT; không dual-write bảng mới |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `employee_id` | uuid | NO | |
| `company_id` | text | NO | |
| `event_type` | text | NO | appointment\|transfer\|secondment\|title_change\|… |
| `decision_ref` | text | YES | Số QĐ (hiển thị) |
| `decision_id` | uuid | YES | **CONFIRMED EMP-DB-01:** soft FK → `hr_decisions.id`; **NOT NULL** khi `source_module='decision'`; UNIQUE where not null + not archived |
| `from_department_id` / `to_department_id` | text | YES | |
| `from_position_key` / `to_position_key` | text | YES | Catalog codes — SoT (mirror AS-IS `position_key` / `department_key`) |
| `effective_from` | date | NO | AS-IS `event_date` |
| `note` | text | YES | |
| `source_module` | text | YES | decision\|manual — **ADD** physical |
| `archived_at` | timestamptz | YES | Soft supersede khi hủy QSĐ — cấm hard-delete lịch sử báo cáo — **ADD** physical |

Append-oriented SoT — **không** chỉ form ghi nhận rời không persist history.  
**CONFIRMED:** `PO-HRM-E2E-LINK-EMP-DB-01` (2026-08-06) — physical alias `employee_work_timeline`; ADD `decision_id`/`source_module`/`archived_at` via Nest ensureSchema (Dev BE-01). Evidence: `docs/qa/evidence/po-hrm-e2e-link-emp-db-01.md`.

---

### 3.10 `hrm_termination` — Nghỉ việc

| Meta | Giá trị |
|------|---------|
| **Pillar** | CORE |
| **ref_srs** | Meeting C9 · FR-UC-BP-PAY-07 (consumer) |
| **Lifecycle** | draft → started → completed\|cancelled |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `employee_id` | uuid | NO | |
| `company_id` | text | NO | |
| `reason_class` | text | NO | `voluntary` \| `dismissal` (tự nghỉ vs đuổi) |
| `reason_code` | text | YES | Catalog chi tiết |
| `last_working_date` | date | NO | |
| `status` | text | NO | |
| `asset_checklist_closed` | boolean | NO | default false |
| `final_settlement_id` | uuid | YES | Soft → `pay_termination_settlement` (PAY owns final pay — P6) |
| `archived_at` | timestamptz | YES | |

| **IX** | `(employee_id, status)`, `(company_id, reason_class)` |
| **Event** | `termination.started` → ATT/PAY consumers; **không** xóa history công/lương |
| **PAY pointer** | Tất toán kỳ cuối = `pay_termination_settlement` + payslip period — CORE **không** materialize net |

---

### 3.11 `hr_decisions` — Quyết định (physical AS-IS alias)

| Meta | Giá trị |
|------|---------|
| **Pillar** | CORE |
| **ref_srs** | FR-UC-BP-CORE-01a · BR-DEC-05 · AC-DEC-WH-01 · AC-DEC-EMP-01 |
| **Physical AS-IS** | `public.hr_decisions` — **ONE** SoT (logical `hrm_decision`) |
| **CONFIRMED** | `PO-HRM-E2E-LINK-EMP-DB-01` (2026-08-06) |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | Scope |
| `decision_code` | text | NO | Số QĐ hiển thị |
| `decision_type` | text | NO | **Open catalog key** → §3.11a `hr_decision_type.decision_type_key` (family aliases `decision_types` / storage REF `hr_decision_types`); starter `appointment`\|`transfer`\|`HRD_*` = **ví dụ** — **không** trần enum |
| `title` / `content` | text | NO / YES | |
| `employee_id` | uuid | YES→**require** person-bound | Soft → employees; BR-DEC-05 · catalog `is_person_bound` |
| `employee_name` / `employee_code` | text | NO / YES | Denorm display — **≠** SoT thay id |
| `department` | text | YES | Denorm |
| `department_key` | text | YES | **ADD preferred** catalog SoT |
| `position` / `position_key` | text | YES | Label / catalog SoT (E1-A) |
| `effective_date` | date | YES | |
| `status` | text | NO | AS-IS FE: `draft`\|`pending`\|`signed`\|**`effective`**\|`expired`\|`cancelled` — default `draft` |
| `archived_at` | timestamptz | YES | Prefer soft over hard-delete when WH linked |

| **Rule** | F-CORE-DEC-02 WH write **chỉ** khi `status='effective'` + person-bound + `employee_id`; UPSERT `employee_work_timeline` by `decision_id` |
| **EXPAND — `decision_type` (DEC-DATA-01)** | Cột **vẫn là text** (không rename / không hard FK GĐ1). Khi danh mục hiệu lực **>0**: tạo/sửa QSĐ phải chọn mã ∈ catalog; dòng lịch sử **được** giữ mã đã nghỉ (`retired` + `archived_at` trên §3.11a). **FORBIDDEN** `CHECK (decision_type IN (...))`. Dual SoT: settings-catalogs partition **`hr_decision_types`** = group REF; tenant writer = §3.11a — **tenant thắng** khi trùng khóa. |
| **FORBIDDEN** | Dual decision table · seed QSĐ for QA · claim personnel UAT · closed enum ceiling |

---

### 3.11a `hr_decision_type` — Catalog loại quyết định / QSĐ · Platform DEC `ICatalogRow` (CONFIRMED physical)

| Meta | Giá trị |
|------|---------|
| **Pillar** | CORE · Decisions |
| **ref_srs** | FR-UC-BP-CORE-01a · BR-BP-DEC-EMP-01 · BR-PLT-02/04/05/06 · AC-PLT-DEC-01..06 |
| **Physical** | **ADD** `public.hr_decision_type` — **ABSENT AS-IS Nest** (closes R-PLT-DATA-04 DEC / QSĐ types slice) |
| **CONFIRMED** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01` (2026-08-07) |
| **Platform** | Option B **`ICatalogRow`** — domain table · **not** mega-EAV |
| **Dual SoT** | Group REF `settings-catalogs` / catalog-sync storage **`hr_decision_types`** (aliases `decision_types`) **≠** DEC writer **`hr_decision_type`** — effective union; DEC row **wins** on key collision (**BR-PLT-06**) |

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug |
| `decision_type_key` | text | NO | | Open catalog code — format `^[a-zA-Z][a-zA-Z0-9_]*$` (cho phép `HRD_01`); UQ/assert `lower(key)` |
| `name_vi` | text | NO | | Nhãn UI |
| `sort_order` | int | NO | 100 | Thứ tự picker / tab |
| `is_person_bound` | boolean | NO | false | Bắt `employee_id` khi tạo/sửa QSĐ |
| `writes_work_history` | boolean | NO | false | Ghi lịch sử công tác khi QSĐ hiệu lực |
| `wh_event_type` | text | YES | NULL | Khi ghi WH: `appointment` \| `transfer` \| `termination` (TEXT mở — không SoT WH mới) |
| `requires_position_key` | boolean | NO | false | Cổng mềm mã chức danh |
| `legacy_alias_keys_json` | jsonb | YES | NULL | Alias tùy chọn → khóa chuẩn |
| `color_token` | text | YES | NULL | Chip UI tùy chọn |
| `metadata_json` | jsonb | YES | NULL | Gợi ý — **không** thay cờ typed |
| `status` | text | NO | `'active'` | `active` \| `retired` |
| `archived_at` | timestamptz | YES | NULL | Soft-delete |
| `created_at` / `updated_at` | timestamptz | NO | now() | Audit |

| Constraint | Rule |
|------------|------|
| **UQ active** | `(company_id, lower(decision_type_key)) WHERE archived_at IS NULL` |
| **CHK format** | `decision_type_key ~ '^[a-zA-Z][a-zA-Z0-9_]*$'` — **chỉ định dạng** |
| **CHK status** | `status IN ('active','retired')` |
| **CHK flags** | `writes_work_history` ⇒ `is_person_bound` + `wh_event_type` NOT NULL |
| **FORBIDDEN** | `CHECK (decision_type_key IN ('appointment','HRD_01',…))` · hard-delete khi còn lịch sử QSĐ |

| **ICatalogRow** | `code`→`decision_type_key` · `label_vi`→`name_vi` · `status`+`archived_at` · `meta`=typed flags |
| **Starter** | `appointment` / `transfer` / `HRD_*` = ví dụ bootstrap — **không** trần · **không** bằng chứng UF |
| **must_keep** | Tạo → duyệt/ký → hiệu lực → lịch sử công tác (`decision_id`) — không cắt spine |
| **OUT** | `contract_types` (CTR) · FormSchema theo loại (GĐ1.5) · in/merge QSĐ (GĐ2) · EMP/ATT/REC sealed |

---

## 4. Table catalog — ATT

### 4.1 `att_shift` — Định nghĩa ca

| Meta | Giá trị |
|------|---------|
| **Pillar** | ATT |
| **ref_srs** | FR-UC-BP-ATT-01 · Meeting A1 |
| **Lifecycle** | draft → active → retired |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | |
| `code` | text | NO | |
| `name` | text | NO | |
| `start_time` | time | NO | |
| `end_time` | time | NO | |
| `break_minutes` | int | YES | |
| `grace_late_minutes` | int | YES | Ân hạn |
| `late_penalty_mode` | text | YES | **Default** trên ca — `per_minute`\|`block`\|`tier`; override bởi `att_attendance_rule` khi có |
| `late_penalty_config_json` | jsonb | YES | Default bands trên ca |
| `work_coeff` | numeric | YES | Hệ số công ca |
| `department_scope_json` | jsonb | YES | Gợi ý phạm vi ca (không thay rule table) |
| `status` | text | NO | |
| `catalog_shift_type_key` | text | YES | Pull XBOS khung — instance = ATT |
| `archived_at` | timestamptz | YES | |

| **UQ** | `(company_id, code)` |
| **Rule** | Hard-delete cấm nếu đã có punch (V-08) → retire |

---

### 4.1b `att_attendance_rule` — Phạt muộn / về sớm (A3 · F-ATT-RULE-01)

| Meta | Giá trị |
|------|---------|
| **Pillar** | ATT |
| **ref_srs** | Meeting A3 · FR-UC-BP-ATT-02 · TIME-002 |
| **SoT** | **Đây** là bảng API `attendance_rules` ghi vào — **không** hardcode một mức cả CT |
| **Resolve** | Match `(company_id, department_id?, shift_id?)` specificity cao hơn → thấp hơn → fallback `att_shift.late_penalty_*` |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK · API `rule_id` |
| `company_id` | text | NO | |
| `department_id` | text | YES | API `org_unit_id` — NULL = rộng hơn |
| `shift_id` | uuid | YES | FK soft → `att_shift` — NULL = mọi ca trong OU |
| `mode` | text | NO | `minute`\|`block`\|`band` (API) ≡ `per_minute`\|`block`\|`tier` |
| `bands_json` | jsonb | YES | `bands[]` — không overlap |
| `early_leave_mode` | text | YES | Symmetric về sớm (optional) |
| `early_leave_bands_json` | jsonb | YES | |
| `status` | text | NO | active\|retired |
| `archived_at` | timestamptz | YES | |

| **IX** | `(company_id, department_id, shift_id)`, `(company_id, status)` |
| **Rule** | Bands overlap → `HRM-VAL-400`; evaluate lúc aggregate/close (F-ATT-SHEET-01) |

---

### 4.2 `att_shift_assignment` / `att_work_schedule` — Phân ca ≠ định nghĩa ca

| Meta | Giá trị |
|------|---------|
| **Pillar** | ATT |
| **ref_srs** | Meeting A1 · BR-BP-SHF-01 |

**`att_shift_assignment`** (gán NV ↔ ca theo khoảng)

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | |
| `employee_id` | uuid | NO | FK CORE read |
| `shift_id` | uuid | NO | FK shift |
| `effective_from` | date | NO | |
| `effective_to` | date | YES | |
| `department_id` | text | YES | Bộ phận chấm đang áp dụng (kiêm nhiệm) |

**`att_work_schedule`** (lịch tuần/tháng — optional grain)

| Cột | Kiểu | Ý nghĩa |
|-----|------|---------|
| `id`, `company_id`, `employee_id` \| `department_id` | | Phạm vi |
| `schedule_date` | date | Ngày |
| `shift_id` | uuid | Ca ngày đó |
| `source` | text | assignment_default\|manual\|import |

| **IX** | `(employee_id, effective_from)`, `(company_id, schedule_date)` |

---

### 4.3 `att_holiday_calendar` + `att_holiday_day`

| Meta | Giá trị |
|------|---------|
| **Pillar** | ATT |
| **ref_srs** | FR-UC-BP-ATT-03b · Meeting A2 |

| Cột calendar | `id`, `company_id`, `year`, `name`, `status` |
| Cột day | `calendar_id`, `holiday_date`, `name`, `is_paid`, `lunar_flag` |

| **UQ day** | `(calendar_id, holiday_date)` |

---

### 4.4 `att_leave_type` — Catalog loại phép · Platform ATT `ICatalogRow` (CONFIRMED physical)

| Meta | Giá trị |
|------|---------|
| **Pillar** | ATT |
| **Physical** | **ADD** `public.att_leave_type` — **ABSENT AS-IS Nest** (closes R-PLT-DATA-04 ATT slice) |
| **Platform** | Option B **`ICatalogRow`** — open catalog `leave_type_key` per company scope (**BR-PLT-05**) |
| **ref_srs** | SYNTHESIS A3–A4 · FR-UC-BP-ATT-04/04b/05/06/07 · **AC-PLT-ATT-01..03** · BR-BP-LV-01..04 · **BR-PLT-02/04/06** |
| **ref_api** | F-ATT-CAT-LVT-01/02 · F-ATT-CAT-EFF-01 · [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md) |
| **Writer** | ATT CFG / Settings — **tenant** CRUD on this table only |
| **Dual SoT** | Group REF `settings-catalogs` / catalog-sync key **`leave_types`** (XBOS publish) **≠** ATT writer **`att_leave_type`** — consumer TXN validates **effective union** (REF pulled + tenant rows); ATT row **wins** on key collision (**BR-PLT-06**) |

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug — **same** `resolveHrmListScope` as list/get/mutate (**U19**) |
| `leave_type_key` | text | NO | | Open catalog code — format `^[a-z][a-z0-9_]*$` — **cấm** closed enum ceiling |
| `name_vi` | text | NO | | Nhãn UI (display-ready) |
| `category` | text | NO | | `annual`\|`seniority`\|`ot_comp`\|`carry_over`\|`advance`\|`sick`\|`other` |
| `is_paid` | boolean | NO | true | Có lương / không lương mặc định cho sheet aggregate |
| `allows_carry_over` | boolean | NO | false | Chuyển kỳ (A3) |
| `allows_advance` | boolean | NO | false | Ứng phép (A3 · ATT-04b) |
| `insurance_regime_flag` | boolean | NO | false | Nghỉ ốm nhánh BHXH (A4 · ATT-07) |
| `company_topup_flag` | boolean | NO | false | Công ty hỗ trợ thêm / 100% (A4) |
| `counts_toward_timesheet` | boolean | NO | true | Đóng vào paid/unpaid hours khi chốt công |
| `metadata_json` | jsonb | YES | NULL | **Optional** — sick/attach bridge (LV-03 class): `is_sick`, attachment rules — **not** replace typed flags |
| `status` | text | NO | `'active'` | `active`\|`retired` |
| `archived_at` | timestamptz | YES | NULL | Soft-delete — pickers hide; history FK intact |
| `created_at` | timestamptz | NO | now() | Audit |
| `updated_at` | timestamptz | NO | now() | Audit |

| Constraint (hint) | Rule |
|---------------------|------|
| **PK** | `id` |
| **UQ active** | **Partial:** `(company_id, lower(leave_type_key)) WHERE archived_at IS NULL` |
| **IX** | `(company_id, status)` · `(company_id, category)` |
| **CHK `chk_att_leave_type_key_format`** | `leave_type_key ~ '^[a-z][a-z0-9_]*$'` — **format only** |
| **CHK `chk_att_leave_type_category`** | `category IN ('annual','seniority','ot_comp','carry_over','advance','sick','other')` |
| **CHK `chk_att_leave_type_status`** | `status IN ('active','retired')` |
| **FORBIDDEN** | `CHECK (leave_type_key IN ('annual','sick','LVT_01',…))` · hard-delete when TXN references key · second mega-catalog EAV table GĐ1 |

**`ICatalogRow` binding (platform)**

| Logical | Physical | Notes |
|---------|----------|-------|
| `code` | `leave_type_key` | Consumer FK on `leave_requests.leave_type` · balance · policy · funnel snapshot |
| `label_vi` | `name_vi` | |
| `status` | `status` + `archived_at` | retire = both |
| `scope_company_id` | `company_id` | TEXT slug |
| `meta` | `category` + flag columns | Typed flags = SoT; `metadata_json` = optional bridge only |
| `catalog_kind` | adapter `att_leave_type` | |

**Bootstrap starter keys (examples only — not ceiling · not UF evidence U65)**

| Key | category | Flags gợi ý |
|-----|----------|-------------|
| `annual` | annual | paid; carry_over theo policy ATT-05 |
| `seniority` | seniority | paid |
| `ot_comp` | ot_comp | paid — **không** PAY đọc OT request |
| `carry_over` | carry_over | paid; quỹ bảo lưu Q1 (ATT-05) |
| `advance` | advance | `allows_advance=true` trên loại đích hoặc type riêng |
| `sick` | sick | `insurance_regime_flag` **và/hoặc** `company_topup_flag` |
| `LVT_01`…`LVT_04` | per policy | Unpaid/special — **open catalog** allows HR thêm `LVT_09+` (**AC-PLT-ATT-01**) |

> Catalog **cấu hình được** — HR thêm mã **thứ 9+** không bị DB/API reject. PAY **không** FK tới leave_type / leave_request (D-I-3b). **`work_shifts`** = operational SoT (**ADR D1**) — **not** catalog duplicate of XBOS `shifts` REF.

---

### 4.4c `attendance_work_sites` — Geofence catalog · Platform `ICatalogRow` note (EXPAND — table LIVE)

| Meta | Giá trị |
|------|---------|
| **Physical** | **LIVE AS-IS** Nest `ensureWorkSitesSchema` — **no new table GĐ1** · **HOLD class = NO second table** |
| **ref_adr** | [`ADR-HRM-ATTENDANCE-CFG-PERSIST`](../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) **D3** geofence SoT |
| **ref_api** | F-ATT-CAT-WS-01/02 · deepen soft-retire + list active filter |
| **ref_data** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DATA-01`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DATA-01.md) **CONFIRMED EXPAND** (2026-08-08) |

| Cột (AS-IS) | Kiểu | Null | Ý nghĩa |
|-------------|------|------|---------|
| `id` | uuid | NO | PK · identity GĐ1 |
| `company_id` | text | NO | Scope slug (migrated from UUID) · U19 parity |
| `name` | text | NO | Display label |
| `address` | text | YES | |
| `latitude` | double precision | NO | Geofence center |
| `longitude` | double precision | NO | |
| `radius_meters` | integer | NO | default 200 |
| `active` | boolean | NO | default true — **product retire SoT** = `active=false` GĐ1 |
| `created_at` | timestamptz | NO | |

| Platform map / deepen | Rule |
|-----------------------|------|
| `ICatalogRow.code` | GĐ1 = `id` string · optional `site_code` **HOLD GĐ1.5** — **no column invent** this wave |
| `ICatalogRow.label_vi` | `name` |
| `ICatalogRow.status` | derived from `active` (`true`→active · `false`→retired) |
| **Product retire** | Soft `active=false` — list default + geofence **hide**; history punches retain (**BR-PLT-04**) |
| **Hard DELETE** | Residual only (explicit `hard` when no refs) — **FORBIDDEN** as sole product retire path |
| **`archived_at`** | **NOT required GĐ1** — optional later HOLD |
| **List default** | Filter `active = TRUE` unless `include_inactive=true` (admin audit) |
| **Geofence set** | Same `active = TRUE` predicate · consumer soft-ref lat/lon ∈ radii → **`HRM-ATT-GEO-001`** |
| **`HRM-ATT-SITE-UNKNOWN`** | Consumer `work_site_id` invent — **HOLD** until surface binds id |
| **IX note** | Recommend `(company_id, active)` for list + assert — optional BE ensure · **not** new table |
| **FORBIDDEN** | `ensureDefaultWorkSite` / seed on U65 · second geofence table · fold into `att_leave_type` · UUID `company_id` regression · Settings/`gps_locations` sole SoT · flip `attendance_uat_ready` |

> Work sites = geofence SoT only (ADR D3). Platform deepen **documents** soft-retire + active list filter on **LIVE** columns — **no second table** · **no wipe** §4.4 leave catalog.

---

### 4.4d `att_attendance_code` — Catalog ký hiệu công (day-code) · Platform ATT `ICatalogRow` (CONFIRMED physical)

| Meta | Giá trị |
|------|---------|
| **Pillar** | ATT |
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01` |
| **Physical** | **ADD** `public.att_attendance_code` — **ABSENT AS-IS Nest** (closes **R-PLT-DATA-04** ATT attendance-code catalog slice) |
| **Platform** | Option B **`ICatalogRow`** — open catalog `code` per company (**BR-PLT-05**) |
| **Dual SoT** | Group REF settings-catalogs / catalog-sync **`attendance_codes`** (tương lai) **≠** ATT writer **`att_attendance_code`** — effective union; ATT row **wins** on key collision (**BR-PLT-06**) — Settings = **REF**, không phải SoT duy nhất |
| **Orthogonal** | **≠** §4.4 `att_leave_type` (loại phép) · **≠** §4.4c `attendance_work_sites` (geofence) · **≠** `work_shifts` (ops) — **cấm** gộp |
| **ref_srs** | FR-UC-BP-ATT-01/02/10/11 · **AC-PLT-ATT-CODE-01*** · **BR-PLT-02/04/05/06** |
| **ref_api** | F-ATT-CAT-CODE-01..04 · F-ATT-CAT-CODE-EFF-01 · F-ATT-CODE-CNS-01 |

| Cột | Kiểu | Null | Default | Ý nghĩa |
|-----|------|------|---------|---------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `company_id` | text | NO | | Scope slug (**U19**) |
| `code` | text | NO | | Mã day-code mở — format `^[a-z][a-z0-9_]*$` — **cấm** enum đóng |
| `name_vi` | text | NO | | Nhãn UI (`status_label`) |
| `symbol` | text | NO | | Ký hiệu công hiển thị (vd. `X`, `CT`, `½`) |
| `sort_order` | int | NO | 100 | Thứ tự picker |
| `counts_as` | text | NO | `'other'` | Lớp ngữ nghĩa: `work`\|`paid_leave`\|`unpaid_leave`\|`holiday`\|`absent`\|`other` — metadata GĐ2 |
| `day_weight` | numeric(4,2) | NO | 1 | Trọng số ngày (1 / 0.5 …) — metadata GĐ2 |
| `is_paid` | boolean | NO | true | Gợi ý có lương — metadata GĐ2 |
| `is_present` | boolean | NO | false | Gợi ý present-like — metadata GĐ2 |
| `color` | text | YES | NULL | Gợi ý badge UI |
| `legacy_alias_keys_json` | jsonb | YES | NULL | Alias → `code` chuẩn |
| `metadata_json` | jsonb | YES | NULL | Gợi ý tùy chọn — **không** thay typed flags |
| `status` | text | NO | `'active'` | `active`\|`retired` (vòng đời dòng catalog) |
| `archived_at` | timestamptz | YES | NULL | Soft-delete |
| `created_at` / `updated_at` | timestamptz | NO | now() | Audit |

| Constraint | Rule |
|------------|------|
| **UQ active** | **Partial:** `(company_id, lower(code)) WHERE archived_at IS NULL` |
| **IX** | `(company_id, status)` · `(company_id, sort_order)` · effective `(company_id) WHERE archived_at IS NULL AND status='active'` |
| **CHK format** | `code ~ '^[a-z][a-z0-9_]*$'` — **chỉ format** |
| **CHK symbol** | `char_length(trim(symbol)) BETWEEN 1 AND 16` |
| **CHK counts_as** | `counts_as IN ('work','paid_leave','unpaid_leave','holiday','absent','other')` — lớp typed (**≠** trần `code`) |
| **CHK day_weight** | `day_weight > 0 AND day_weight <= 1` |
| **CHK row status** | `status IN ('active','retired')` |
| **FORBIDDEN** | `CHECK (code IN ('pending','present','absent','leave',…))` · hard-delete khi còn bản ghi công · gộp vào §4.4 / §4.4c · rewrite aggregate counting từ flags trong wave này |

**`ICatalogRow`:** `code`→`code` · `label_vi`→`name_vi` · `meta`→`symbol` + typed flags · `catalog_kind`=`att_attendance_code`.

**Starter keys** (`present`/`absent`/`leave`/`business_trip`/`half_day`/…) = bootstrap examples only — **≠** ceiling (**BR-PLT-05**). Soft-delete = `status=retired` + `archived_at` — history `attendance_records.status` intact (**BR-PLT-04**).

> **Đếm công / bảng công:** Cột typed flags **chỉ** metadata cho giai GĐ2. Engine đếm `att-timesheet-line-aggregate` (present→công chuẩn · leave→có/không lương) **giữ code** GĐ1 — **cấm** tuyên bố wave catalog này rewrite aggregate / payroll LIST-TOTALS.

---

### 4.4b `att_leave_accrual_policy` + `att_leave_balance` + `att_leave_hold`

| Meta | Giá trị |
|------|---------|
| **Pillar** | ATT |
| **ref_srs** | FR-UC-BP-ATT-04/09 · SYNTHESIS A3–A5 · Q-LEAVE-ACCRUAL mở |

**Policy**

| Cột | Kiểu | Ý nghĩa |
|-----|------|---------|
| `id`, `company_id`, `leave_type_key` | | Soft → `att_leave_type.leave_type_key` |
| `accrual_mode` | text | `year_start_grant`\|`month_end_accrual`\|`after_6_months`\|… |
| `annual_days` | numeric | |
| `unit` | text | day\|hour — Q-LEAVE-UNIT |
| `allow_negative` | boolean | Ứng phép khi true + type `allows_advance` |
| `carry_over_expire_rule` | text | YES | vd. `end_of_q1_next_year` (ATT-05) |
| `status` | text | active\|retired |

**Balance**

| Cột | Kiểu | Ý nghĩa |
|-----|------|---------|
| `id`, `employee_id`, `company_id`, `leave_type_key`, `year` | | |
| `entitled` | numeric | Đã cấp |
| `used` | numeric | Đã trừ sau duyệt |
| `held` | numeric | Đang hold khi submit |
| `adjusted` | numeric | Điều chỉnh |
| `carried_in` | numeric | YES | Từ kỳ trước (carry_over) |
| `advanced` | numeric | YES | Đã ứng |
| **derived available** | entitled + carried_in + adjusted − used − held − advanced | App layer |

**Hold** (ATT-09)

| Cột | Kiểu | Ý nghĩa |
|-----|------|---------|
| `id`, `balance_id`, `leave_request_id` | | |
| `qty` | numeric | |
| `status` | text | held\|released\|consumed |
| `created_at` | | |

| **Writer** | ATT only — CORE/PAY **cấm** mutate (ownership matrix) |
| **IX** | `(employee_id, leave_type_key, year)`, `(leave_request_id)` |

`att_leave_request` (pointer — đã có hướng AS-IS): `id`, `employee_id`, `leave_type_key`, `start_date`, `end_date`, `deduct_days`, `status`, optional `insurance_branch` (`si`\|`company_topup`\|`none`) khi type=sick — **không** FK từ PAY.

---

### 4.5 `att_attendance_punch` — Điểm danh thô

| Meta | Giá trị |
|------|---------|
| **Pillar** | ATT |
| **ref_srs** | FR-UC-BP-ATT-03 · Meeting A6 |
| **Lifecycle** | punched → corrected (via update-request) |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | |
| `employee_id` | uuid | NO | |
| `punched_at` | timestamptz | NO | |
| `punch_type` | text | NO | in\|out\|break… |
| `source` | text | NO | mobile\|gps\|manual\|device |
| `geo_lat` / `geo_lng` | numeric | YES | |
| `work_site_id` | uuid | YES | |
| `shift_id` | uuid | YES | Ca áp dụng lúc chấm |
| `timesheet_header_id` | uuid | YES | Gắn kỳ khi đã vào sheet |
| `archived_at` | timestamptz | YES | |

| **IX** | `(employee_id, punched_at)`, `(company_id, punched_at)`, `(timesheet_header_id)` |
| **Rule** | PATCH khi sheet `closed` → `409 HRM-ATT-SHEET-LOCKED` (V-07) |

### 4.5a `attendance_records` — Day grid / leave funnel markers (AS-IS physical · DOC-DELTA CONFIRMED)

| Meta | Giá trị |
|------|---------|
| **Pillar** | ATT |
| **work_item_id** | `PO-HRM-ATT-LEAVE-FUNNEL-DB-01` |
| **ref_srs** | FR-UC-BP-ATT-09 → ATT-10 «Công nghỉ phép» · AC-ATT-LV-SHEET-01 |
| **ref_sa** | `PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01` F-ATT-LEAVE-FUNNEL-01..04 |
| **Physical SoT** | `public.attendance_records` (Nest weekly / Bản ghi) — **companion** to punch; **not** dual-write PAY hours |
| **Writer** | ATT — materialize on leave **approved**; reverse on leave leave-approved |

**AS-IS columns (keep):** `id`, `company_id` TEXT, `employee_id`, `attendance_date`, `check_in_at`, `check_out_at`, `status` (text day-code — xem EXPAND dưới), `note`, audit.

| Cột ADD | Kiểu | Null | Ý nghĩa |
|---------|------|------|---------|
| `leave_request_id` | uuid | YES | Soft FK → `leave_requests.id` — **no CASCADE** |
| `leave_type_key` | text | YES | Snapshot `leave_requests.leave_type` (catalog code) |

| **UQ** | `(company_id, employee_id, attendance_date)` — keep AS-IS |
| **IX ADD** | `(leave_request_id)` WHERE `leave_request_id IS NOT NULL` |
| **Rule funnel** | Approve → UPSERT `status=leave` + soft FK; day `present` → `409 HRM-ATT-LEAVE-FUNNEL-CONFLICT` |
| **Rule reverse** | Reject/cancel after approve → clear markers by `leave_request_id` **chỉ khi** không thuộc sheet `closed` |
| **Rule locked** | Sheet `closed` overlapping date → `409 HRM-ATT-SHEET-LOCKED` |
| **Cấm** | FE-join leave list (Option C) · seed records on create sheet · invent ladder N |

> **Ký hiệu công / day-code (EXPAND — ATT-CODE-CATALOG-DATA-01):** Cột `status` **vẫn là text** (không rename / không hard FK GĐ1). Khi danh mục hiệu lực Nest `att_attendance_code` (**§4.4d**) **>0**: tạo/sửa bản ghi công phải chọn mã ∈ F-ATT-CAT-CODE-EFF-01; invent → **`HRM-ATT-CODE-KEY`**; dòng lịch sử **được** giữ mã đã nghỉ. Dual SoT: settings-catalogs **`attendance_codes`** (tương lai) = group REF; tenant writer = §4.4d — **tenant thắng**. **Cấm** khôi phục `CHECK (status IN ('pending','present','absent','leave'))` hoặc DTO `@IsIn(4)` làm trần sản phẩm — **DROP/REPLACE** khi ensureSchema. Loại phép (§4.4) **khác** day-code — `leave_type_key` funnel **RETAIN**. Engine đếm bảng công **không** rewrite trong wave catalog này.

> SoT file: [`docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-DB-01.md`](../../program/specs/PO-HRM-ATT-LEAVE-FUNNEL-DB-01.md) · catalog day-code: [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01.md)

---

### 4.6 `att_timesheet_header` + `att_timesheet_line` — Bảng công chốt (SoT lương)

| Meta | Giá trị |
|------|---------|
| **Pillar** | ATT |
| **ref_srs** | FR-UC-BP-ATT-10/11 · Meeting A5 · ADR I-3/I-6 |
| **Lifecycle** | open → submitted → **closed** (immutable) \| reopen via UC |

**Header**

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | |
| `period_from` | date | NO | |
| `period_to` | date | NO | |
| `scope_dept_id` | text | YES | NULL = toàn CT trong scope |
| `status` | text | NO | open\|submitted\|closed |
| `closed_at` | timestamptz | YES | |
| `closed_by` | uuid | YES | |
| `checksum` | text | YES | Event `timesheet.closed` |
| `reopen_reason` | text | YES | F-ATT-SHEET-03 |
| `reopened_at` | timestamptz | YES | |
| `reopened_by` | uuid | YES | |
| `archived_at` | timestamptz | YES | |

| **UQ** | `(company_id, period_from, period_to, coalesce(scope_dept_id,''))` active |

**Line — đơn vị «giờ công tính lương»**

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `header_id` | uuid | NO | FK |
| `company_id` | text | NO | |
| `employee_id` | uuid | NO | |
| `standard_hours` | numeric | NO | Giờ chuẩn sau làm tròn |
| `ot_hours_weighted` | numeric | NO | OT **đã × hệ số** |
| `paid_leave_hours` | numeric | NO | |
| `unpaid_leave_hours` | numeric | NO | |
| `late_penalty_hours` | numeric | YES | hoặc amount mode ở JSON |
| `meal_shift_hours` | numeric | YES | Ăn ca (A5) |
| `other_components_json` | jsonb | YES | Thành phần phễu mở rộng |
| `payable_hours` | numeric | NO | Tổng giờ công tính lương |
| `line_locked` | boolean | NO | true khi header closed |
| `archived_at` | timestamptz | YES | |

| **UQ** | `(header_id, employee_id)` |
| **IX** | `(company_id, employee_id)`, `(header_id)` WHERE status join |
| **Immutability** | `status=closed` ⇒ `line_locked=true`; PAY **chỉ** đọc dòng này |
| **Cấm** | Bảng shadow giờ trên PAY copy từ punch |

#### 4.6.1 `att_timesheet_sign_step` — Bước ký workflow bảng công (UC-BP-ATT-11)

| Meta | Giá trị |
|------|---------|
| **Pillar** | ATT |
| **ref_srs** | FR-UC-BP-ATT-11 · **BR-BP-TS-02** · R-SIGN-01 |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` **§6.4.4** |
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-DB-API-01` |
| **Lifecycle** | Ghi khi `header.status=submitted`; **immutable** trong một vòng ký; vòng mới sau reopen (F-ATT-SHEET-03) |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | Scope tenant — **cùng** resolver list↔get sheet (U19) |
| `header_id` | uuid | NO | FK → `att_timesheet_header.id` |
| `workflow_definition_id` | text | YES | Id định nghĩa WF đồng bộ từ XBOS theo tenant |
| `step_code` | text | NO | Mã bước ổn định từ WF (vd. `sign_employee`, `sign_direct_manager`, `sign_hr`) |
| `step_order` | int | YES | Thứ tự hiển thị / gợi ý sắp xếp — **không** thay thế cấu hình song song trên XBOS |
| `persona_role` | text | NO | `employee` \| `direct_manager` \| `hr_admin` — map task WF → persona |
| `wf_task_instance_id` | text | YES | Id task runtime (XBOS/inbox) nếu có — audit cross-system |
| `signer_user_id` | uuid | NO | User thực hiện xác nhận |
| `signer_employee_id` | uuid | YES | NV liên quan khi khác ngữ cảnh membership |
| `outcome` | text | NO | `approved` \| `rejected` |
| `comment` | text | YES | Lý do khi `rejected` (khuyến nghị bắt buộc nghiệp vụ) |
| `signed_at` | timestamptz | NO | Thời điểm ký |
| `created_at` / `updated_at` | timestamptz | NO | Audit |
| `created_by` / `updated_by` | uuid | YES | Audit |
| `archived_at` | timestamptz | YES | Soft-delete; **set khi reopen** sheet để tách vòng ký |

| **FK** | `header_id` → `att_timesheet_header(id)` · `company_id` khớp header |
| **UQ** | `(header_id, step_code)` WHERE `archived_at IS NULL` — một bước active / vòng ký |
| **IX** | `(company_id, header_id)` · `(header_id, outcome)` · `(signer_user_id, signed_at DESC)` |

| **Rule BR-BP-TS-02** | `F-ATT-SHEET-02` chỉ khi evaluator đọc các row active: mọi bước **bắt buộc** theo WF tenant có `outcome=approved`; có `rejected` → **cấm** `closed` |
| **Rule must_keep** | Phải có bước NV (`persona_role=employee`) `approved` trước khi coi đủ chữ ký — evaluator WF, **không** hard-code ladder toàn tập đoàn |
| **Rule mutate** | Chỉ insert khi header `status IN (submitted)`; header `closed` → `409 HRM-ATT-SHEET-LOCKED` |
| **Rule reopen** | F-ATT-SHEET-03: set `archived_at` trên mọi sign_step active của header; header về `submitted` — giữ history archived |
| **Writer** | ATT only · F-ATT-WF-SIGN-01 |

#### 4.6.2 Physical bridge — `attendance_sheets` ↔ logical header/line (DOC-DELTA CONFIRMED `PO-HRM-ATT-LEAVE-FUNNEL-DB-01`)

| Meta | Giá trị |
|------|---------|
| **work_item_id** | `PO-HRM-ATT-LEAVE-FUNNEL-DB-01` |
| **Honesty** | `attendance_uat_ready=false` · Option A records first · staged B line hours |

| Logical | Physical AS-IS / plan | Dual-write |
|---------|----------------------|------------|
| `att_timesheet_header` | **`public.attendance_sheets`** (ONE table — **alias**) | **no** second header |
| `period_from` / `period_to` | `start_date` / `end_date` | alias only |
| `att_timesheet_line` | **ABSENT AS-IS** → **ADD** when F-ATT-SHEET-AGG-01 (columns §4.6 incl. `paid_leave_hours` / `unpaid_leave_hours`) | n/a until ADD |
| `att_timesheet_sign_step` | **PRESENT** — **must_keep** §4.6.1 | no wipe |

> **DOC-DELTA 2026-08-07 — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-ATT-LINE-01`:** physical ADD of `public.att_timesheet_line` **CONFIRMED** for PAY hours bag residual **R-PAY-F-ATT-LINE** / **G-PAY-F-06** (Nest probe name exact; UQ `(header_id, employee_id)`; PAY read closed+`line_locked` only; cấm silent `0`). Full column/BR/unlock SoT: [`PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-ATT-LINE-01.md`](../../program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-ATT-LINE-01.md). **must_keep** this §4.6.2 bridge + sign — **no wipe**. `payroll_e2e_ready=false` until BE+UF.

**Paid / unpaid hours source (OPEN-Q3 CONFIRMED — no invent catalog DDL):**

1. Optional catalog item `metadata.is_paid` if already present (read-only).
2. Else unpaid code/lineage: `unpaid` · `LVT_04` (+ label «Không lương» / NFD `khong luong`).
3. Else default **paid** (`LVT_01`/`02`/`03` and classic paid types).
4. Future: prefer `att_leave_type.is_paid` (§4.4) when that table is physical — ADD-only.

**Cấm:** dual header table · PAY FK leave · wipe sign · invent settings `is_paid` column this wave.

> SoT: [`PO-HRM-ATT-LEAVE-FUNNEL-DB-01.md`](../../program/specs/PO-HRM-ATT-LEAVE-FUNNEL-DB-01.md)

---

## 5. Table catalog — PAY (logical P1–P6 — họp đã chốt)

> **CORRECTION:** Họp tiền lương **đã xong** (`SYNTHESIS_MASTER` §2.4 · P1–P6). Status tài liệu = **DRAFT chờ khách ký giấy (D7)** — **không** ghi «họp lương chưa xong».  
> **Q-PAY-FORMULA:** giữ pointer `expression_json` + dual-control — **không** invent UI/engine DDL chi tiết trước khi khách confirm Option A.  
> **Boundary:** PAY đọc ATT **closed** + CORE C&B; **cấm** FK leave/OT/punch/candidate (D-I-2 / D-I-3 / D-I-3b).

### 5.0 Map SYNTHESIS P1–P6 → bảng

| P# | Yêu cầu | Bảng / cột |
|----|---------|------------|
| **P1** | Nguồn giờ = bảng công chốt | `pay_period_timesheet_bind` · `pay_payslip.timesheet_header_id` NOT NULL + assert closed |
| **P2** | C&B từ HĐ/BH — không hồ sơ public | Read-path only → `hrm_employee_compensation` / contract / enrollment (**không** copy cột C&B sang PAY) |
| **P3** | KT/KL có tiền → kỳ + trạng thái thi hành | Soft `hrm_reward_discipline.payroll_period_id` / `payslip_id` · optional `pay_reward_link` |
| **P4** | Công thức cấu hình | `pay_formula_definition` versioned — depth expression = **Q-PAY-FORMULA** |
| **P5** | Tách module PAY | Prefix `pay_*` · no REC/ATT write |
| **P6** | Split-month / tất toán nghỉ | `pay_payslip_split_segment` · `pay_termination_settlement` |

---

### 5.1 `pay_payroll_period` — Kỳ lương

| Meta | Giá trị |
|------|---------|
| **Pillar** | PAY |
| **ref_srs** | FR-UC-BP-PAY-01/06/08 · SYNTHESIS P1/P5 |
| **Lifecycle** | open → processing → closed \| cancelled |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | Scope |
| `code` | text | YES | Mã kỳ hiển thị |
| `period_from` | date | NO | |
| `period_to` | date | NO | |
| `payroll_group_id` | uuid | YES | → `pay_payroll_group` (PAY-09) |
| `formula_definition_id` | uuid | YES | Version công thức áp kỳ |
| `status` | text | NO | open\|processing\|closed\|cancelled |
| `closed_at` / `closed_by` | | YES | Khóa kỳ |
| `archived_at` | timestamptz | YES | |

| **UQ** | `(company_id, period_from, period_to, coalesce(payroll_group_id,''))` active |
| **Writer** | PAY only |

---

### 5.2 `pay_period_timesheet_bind` — Kỳ ↔ bảng công chốt (P1)

| Meta | Giá trị |
|------|---------|
| **Pillar** | PAY |
| **ref_srs** | FR-UC-BP-PAY-01 · BR-BP-TS-03 · D8 |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | |
| `payroll_period_id` | uuid | NO | FK → period |
| `timesheet_header_id` | uuid | NO | FK → `att_timesheet_header` |
| `bound_at` | timestamptz | NO | |
| `bound_by` | uuid | YES | |

| **UQ** | `(payroll_period_id, timesheet_header_id)` |
| **Rule** | App assert header.`status=closed` trước bind / process — else `HRM-PAY-ATT-412` |
| **Cấm** | Bind punch / leave_request / OT request |

---

### 5.3 `pay_formula_definition` — Pointer công thức (P4 · Q-PAY-FORMULA)

| Meta | Giá trị |
|------|---------|
| **Pillar** | PAY |
| **ref_srs** | FR-UC-BP-PAY-02 · DECISION_PACKET_Q_PAY_FORMULA · ADR §10 |
| **Lifecycle** | draft → pending_publish → active → retired |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | |
| `code` | text | NO | Mã mẫu |
| `version` | int | NO | Monotonic per code |
| `status` | text | NO | draft\|pending_publish\|active\|retired |
| `expression_json` | jsonb | YES | **Opaque** đến khi Q-PAY-FORMULA ký — không khóa schema con |
| `required_vars_json` | jsonb | YES | Danh sách biến bắt buộc (timesheet + CORE C&B keys) |
| `authored_by` | uuid | YES | C&B soạn |
| `published_at` | timestamptz | YES | |
| `published_by` | uuid | YES | Dual-control publisher |
| `effective_from` | date | YES | |
| `effective_to` | date | YES | |
| `archived_at` | timestamptz | YES | |

| **UQ** | `(company_id, code, version)` |
| **Rule** | Kỳ chỉ bind `status=active`; sửa kỳ đã paid → version mới |
| **HOLD** | DDL chi tiết node kéo-thả / hệ số tenant hardcode — **cấm invent** trước confirm |

---

### 5.4 `pay_insurance_rate_cfg` — Master % BH pháp nhân (PAY CFG read)

| Meta | Giá trị |
|------|---------|
| **Pillar** | PAY (CFG) |
| **ref_srs** | FR-UC-BP-PAY-05 · DATA_OWNERSHIP insurance_rate · CORE enrollment ≠ rate master |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | |
| `insurance_type_key` | text | NO | BHXH / BHYT / … |
| `employee_rate_pct` | numeric | NO | |
| `employer_rate_pct` | numeric | NO | |
| `ceiling_amount` | numeric | YES | Trần đóng (BR-BP-SPL-02) |
| `effective_from` | date | NO | |
| `effective_to` | date | YES | |
| `status` | text | NO | active\|retired |
| `archived_at` | timestamptz | YES | |

| **IX** | `(company_id, insurance_type_key, effective_from)` |
| **Consumer** | PAY run + soft snapshot `hrm_insurance_rate_period.pay_rate_cfg_id` |
| **Rule** | Run dùng version hiệu lực kỳ — không silent 0% (V-13) |

---

### 5.5 `pay_payroll_group` — Nhóm bảng lương (PAY-09)

| Meta | Giá trị |
|------|---------|
| **Pillar** | PAY |
| **ref_srs** | FR-UC-BP-PAY-09 · BR-BP-PAY-04 |

| Cột | Kiểu | Ý nghĩa |
|-----|------|---------|
| `id`, `company_id`, `code`, `name_vi` | | vd. office / sales / driver / ops |
| `priority` | int | Rule ưu tiên khi overlap |
| `match_rule_json` | jsonb | dept / position_key / explicit employee list |
| `status` | active\|retired | |
| `archived_at` | | |

| **Rule** | Mỗi NV thuộc **một** nhóm đang áp / hoặc priority rõ — không hai nhóm cùng kỳ không rule |

---

### 5.6 `pay_payslip` — Phiếu lương (P1 + PAY-08)

| Meta | Giá trị |
|------|---------|
| **Pillar** | PAY |
| **ref_srs** | FR-UC-BP-PAY-01/06/08 · BR-BP-LC-04 · BR-BP-PAY-03 |
| **Lifecycle** | calculated → previewed → confirmed → paid \| void |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | |
| `employee_id` | uuid | NO | NV Hoạt động trong kỳ (BR-BP-LC-04) |
| `payroll_period_id` | uuid | NO | FK → period |
| `timesheet_header_id` | uuid | **NO** | **FK bắt buộc** → `att_timesheet_header` |
| `formula_definition_id` | uuid | YES | Version đã dùng |
| `payroll_group_id` | uuid | YES | Snapshot nhóm |
| `status` | text | NO | calculated\|previewed\|confirmed\|paid\|void |
| `gross` | numeric | YES | |
| `net` | numeric | YES | **Một** net / NV / kỳ (BR-BP-SPL-01) |
| `tax_amount` | numeric | YES | TNCN — tính một lần trên gộp |
| `si_employee_amount` | numeric | YES | BH NV — trần một lần |
| `si_employer_amount` | numeric | YES | |
| `gtgc_amount` | numeric | YES | Giảm trừ gia cảnh — đọc CORE dependents (PAY-03); **không** nhập tay trùng |
| `payment_status` | text | YES | unpaid\|partial\|paid\|budget_hold |
| `version` | int | NO | default 1 — tăng khi điều chỉnh kỳ |
| `is_final_pay` | boolean | NO | true nếu kỳ tất toán nghỉ (PAY-07) |
| `termination_settlement_id` | uuid | YES | Soft → settlement |
| `archived_at` | timestamptz | YES | |

| **UQ** | `(payroll_period_id, employee_id, version)` active non-void |
| **FK allowed** | `timesheet_header_id` → ATT (**app: status=closed**); period; formula |
| **FK forbidden** | leave_request, overtime_request, attendance_punch, candidate, recruitment_request |
| **Writer** | PAY only · ESS read self |

---

### 5.7 `pay_payslip_line` — Dòng thành phần phiếu

| Meta | Giá trị |
|------|---------|
| **Pillar** | PAY |
| **ref_srs** | FR-UC-BP-PAY-02/08 |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `payslip_id` | uuid | NO | FK |
| `company_id` | text | NO | |
| `component_code` | text | NO | base\|allowance\|ot_pay\|leave_pay\|reward\|discipline\|si\|tax\|… |
| `component_label` | text | YES | |
| `amount` | numeric | NO | |
| `source_ref` | text | YES | vd. `reward_discipline:{id}` · `timesheet_line` — **không** FK cứng leave/OT |
| `sort_order` | int | YES | |

| **IX** | `(payslip_id, component_code)` |

---

### 5.8 `pay_payslip_split_segment` — Đoạn gộp giữa kỳ (P6 · PAY-04/05)

| Meta | Giá trị |
|------|---------|
| **Pillar** | PAY |
| **ref_srs** | FR-UC-BP-PAY-04/05 · BR-BP-SPL-01/02 |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `payslip_id` | uuid | NO | FK — nhiều đoạn → **một** payslip |
| `company_id` | text | NO | |
| `segment_seq` | int | NO | 1..n |
| `effective_from` | date | NO | Cắt theo ngày hiệu lực CORE/HĐ |
| `effective_to` | date | NO | |
| `base_salary_snapshot` | numeric | YES | Lương CB đoạn |
| `hours_payable` | numeric | YES | Cộng dồn từ timesheet closed (không dual punch) |
| `segment_gross` | numeric | YES | Thu nhập đoạn (biến thời gian) |
| `archived_at` | timestamptz | YES | |

| **Rule** | Biến tĩnh tháng (TNCN, GTCG, trần BH) **chỉ** trên header `pay_payslip` — **cấm** trừ kép từng đoạn |
| **Cấm** | Hai `pay_payslip` net cùng NV cùng `payroll_period_id` chỉ vì đổi giữa tháng |

---

### 5.9 `pay_reward_link` — KT/KL → kỳ (P3 optional explicit)

| Meta | Giá trị |
|------|---------|
| **Pillar** | PAY |
| **ref_srs** | SYNTHESIS P3 · FR-UC-BP-CORE-08 consumer |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | |
| `reward_discipline_id` | uuid | NO | Soft → CORE case |
| `payroll_period_id` | uuid | NO | |
| `payslip_id` | uuid | YES | Sau executed |
| `amount_snapshot` | numeric | YES | |
| `link_status` | text | NO | pending\|linked\|executed\|skipped |
| `archived_at` | timestamptz | YES | |

| **UQ** | `(reward_discipline_id, payroll_period_id)` |
| **Note** | GĐ1 có thể chỉ dùng soft columns trên `hrm_reward_discipline`; bảng này khi cần audit PAY-side |

---

### 5.10 `pay_termination_settlement` — Tất toán nghỉ việc (P6 · PAY-07)

| Meta | Giá trị |
|------|---------|
| **Pillar** | PAY |
| **ref_srs** | FR-UC-BP-PAY-07 · BR-BP-LC-05 · SYNTHESIS P6 |
| **Lifecycle** | draft → ready → posted \| cancelled |

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | |
| `termination_id` | uuid | NO | Soft → `hrm_termination` |
| `employee_id` | uuid | NO | |
| `payroll_period_id` | uuid | YES | Kỳ cuối |
| `final_payslip_id` | uuid | YES | → `pay_payslip` (`is_final_pay=true`) |
| `timesheet_header_id` | uuid | YES | Closed sheet kỳ cắt — assert closed |
| `si_cutoff_done` | boolean | NO | Cắt BH |
| `leave_cashout_done` | boolean | NO | Trả phép còn (số từ ATT balance **qua** checklist — PAY không mutate balance) |
| `asset_checklist_ack` | boolean | NO | Đọc CORE asset closed |
| `reward_discipline_included` | boolean | NO | KT/KL đang thi hành vào kỳ cuối |
| `status` | text | NO | draft\|ready\|posted\|cancelled |
| `archived_at` | timestamptz | YES | |

| **Rule** | Thứ tự nghiệp vụ: chốt công → tất toán → lương cuối; **không** xóa history công/lương |
| **Formula depth** | Cách tính tiền phép / phụ cấp nghỉ = trong `expression_json` / BR — **Q-PAY-FORMULA**, không invent hệ số ở bảng này |

---

### 5.11 PAY lifecycle (legal transitions)

| Entity | From → To | Invalid |
|--------|-----------|---------|
| `pay_payroll_period` | open→processing→closed | closed→processing không UC reopen |
| `pay_payslip` | calculated→previewed→confirmed→paid | paid→calculated (dùng version mới / void) |
| `pay_formula_definition` | draft→pending_publish→active | active→draft in-place |
| `pay_termination_settlement` | draft→ready→posted | posted→draft |

---

## 6. Validation matrix (DB-oriented)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| DV-01 | YCTD `in_plan` thiếu `headcount_cell_id` | CHK / API | 4xx |
| DV-02 | Application không có `recruitment_request_id` | NOT NULL | Reject |
| DV-03 | 2 application cùng UV+YCTD | UQ | 409 |
| DV-04 | PATCH employee public với `base_salary` | Column absent / reject DTO | `HRM-CORE-CB-403` |
| DV-05 | 2 HĐ active chồng ngày | App unique window | 409 |
| DV-06 | Allocate asset khi terminated | BR | 409 |
| DV-07 | Sửa punch thuộc sheet closed | Immutability | `HRM-ATT-SHEET-LOCKED` |
| DV-08 | Approve phép vượt quỹ (`allow_negative=false`) | Hold+balance | 409 |
| DV-09 | Insert payslip / bind khi header ≠ closed | Precondition | `HRM-PAY-ATT-412` |
| DV-10 | FK payslip → leave_request / OT / punch | Schema forbid | Migration/review FAIL |
| DV-11 | `company_id` list ≠ detail | scope_parity | Same resolver |
| DV-12 | Insurance suspend xóa period cũ | Cấm | Soft status only |
| DV-13 | Hai payslip net cùng NV+kỳ vì split | BR-BP-SPL-01 | Reject / merge segments |
| DV-14 | Split: TNCN/GTCG/trần BH trên từng segment | BR-BP-SPL-01/02 | Static chỉ trên payslip header |
| DV-15 | Payslip cho employee chưa Hoạt động | BR-BP-LC-04 | 409 |
| DV-16 | Sick type: `insurance_regime` + `company_topup` cùng kỳ không rule | BR-BP-LV-04 | 409 |
| DV-17 | Leave_type_key ngoài catalog active | REF | 4xx |
| DV-18 | Formula publish thiếu required_vars | Q-PAY-FORMULA | Block pending_publish→active |
| DV-19 | Rate CFG hết hiệu lực kỳ mà run silent 0% | V-13 | Fail hoặc pick version đúng |
| DV-20 | REC subject trên PAY process | D-I-2 | `HRM-REC-PAY-403` |
| DV-21 | YCTD bind JD không Hiệu lực | Soft FK status gate | `HRM-JD-YCTD-STATUS` 400 |
| DV-22 | YCTD thiếu `job_description_id`/`job_template_id` khi BR bắt buộc | BR-YCTD-JD-REF-01 | `HRM-JD-YCTD-REQUIRED` 400 |
| DV-23 | Retire JD CASCADE xóa / orphan cứng YCTD | Soft FK only | Review FAIL · history giữ |
| DV-24 | Invent cột physical `job_description_id` song song `job_template_id` | Alias-only | Schema review FAIL |
| DV-25 | Dual-write mô tả JD vào `job_postings` / Campaign GĐ1 | REC-03 OUT | FORBIDDEN |
| DV-26 | Application thiếu `recruitment_request_id` / `requisition_id` | BR-BP-CV-03 · soft FK NOT NULL | `HRM-REC-UV-YCTD-REQUIRED` 400 |
| DV-27 | Invent cột physical `recruitment_request_id` song song `requisition_id` | Alias-only | Schema review FAIL |
| DV-28 | Gắn / lọc UV qua `job_posting_id` / `job_postings` | REC-03 OUT · AC-REC-CMP-01 | FORBIDDEN |
| DV-29 | Persist free-text `candidates.position` làm position SoT | AC-REC-UV-03 | Reject / deprecate SoT |
| DV-30 | `position_key` client ≠ YCTD.`position_key` | Soft derive | `HRM-REC-UV-POSITION-MISMATCH` 400 |
| DV-31 | Đóng YCTD CASCADE xóa applications / evals | Soft FK only | Review FAIL · history giữ |

---

## 7. Data interaction (CRUD / transition)

| Entity | C | R | U | D/Archive | Transition owner |
|--------|---|---|---|-----------|------------------|
| job_description | REC | REC, CORE read | REC | soft | REC |
| recruitment_request | REC | REC, CORE read | REC | soft | REC approval |
| candidate / application | REC | REC; CORE read post-hire | REC stage | soft | REC |
| employee public | CORE (hire/onboard) | ALL pillars read | CORE | soft | CORE |
| employee C&B | CORE C&B role | PAY, C&B | CORE C&B | version+soft | CORE |
| insurance_* | CORE | PAY read | CORE actions | soft periods | CORE |
| reward_discipline | CORE | PAY link read | CORE | soft | CORE → PAY link |
| termination | CORE | PAY settlement | CORE | soft | CORE; PAY settlement |
| shift / assignment | ATT | ATT, Mobile; CORE display | ATT | retire | ATT |
| leave_type / policy | ATT CFG | ATT, ESS | ATT | retire | ATT |
| leave balance/hold | ATT | ATT, CORE display | ATT | — | ATT |
| punch | ATT | ATT | ATT (pre-close) | soft | ATT |
| timesheet | ATT | **PAY closed**; ATT UI | ATT pre-close | reopen UC | ATT |
| payroll_period / bind | PAY | PAY | PAY | soft | PAY |
| formula_definition | PAY | PAY | PAY draft/publish | retire | PAY (+ dual-control) |
| insurance_rate_cfg | PAY | PAY run; CORE snapshot soft | PAY CFG | retire | PAY |
| payslip / lines / segments | PAY | PAY, ESS self | PAY | void/soft | PAY |
| termination_settlement | PAY | PAY, CORE display | PAY | soft | PAY |

---

## 8. Forbidden overlap (schema checklist)

| Anti-pattern | DB control |
|--------------|------------|
| PAY shadow hours table | **Không** tạo `pay_worked_hours` copy từ punch |
| REC→PAY FK | **Không** cột `payslip_id` bắt buộc trên candidate |
| C&B trên `hrm_employee` | Tách `hrm_employee_compensation` |
| Leave/OT FK từ payslip | Absent (D-I-3b) |
| Campaign bắt buộc MVP | Tables §2.8 marked GĐ2; YCTD `pipeline_flags_json` đủ GĐ1 |
| Dual writer leave_balance | Only ATT services |
| Invent formula engine tables trước Q-PAY-FORMULA ký | Chỉ `expression_json` opaque + publish audit |
| Ghi «họp lương chưa xong» | Meeting closed — dùng DRAFT D7 / Q-PAY-FORMULA |
| Dual physical JD FK trên YCTD | Chỉ `job_template_id` physical; `job_description_id` = alias (`PO-HRM-JD-YCTD-REF-DB-01`) |
| `job_postings` / Lane B làm SoT mô tả cho bind YCTD | Thư viện JD (`job_description_templates`) only |
| CASCADE delete YCTD khi Ngừng JD | Soft FK + history readable |
| `values_json` live trên hàng YCTD thay Thư viện | Snapshot text optional only |
| Dual physical UV↔YCTD FK | Chỉ `requisition_id` physical; `recruitment_request_id` = alias (`PO-HRM-REC-UV-YCTD-DB-01`) |
| `job_postings` / `job_posting_id` làm SoT gắn UV / so sánh | YCTD soft FK only · REC-03 OUT |
| Free-text `candidates.position` làm SoT vị trí ứng tuyển | YCTD.`position_key` derived · AC-REC-UV-03 |
| CASCADE delete applications khi đóng YCTD | Soft FK + eval/history readable |

---

## 9. Traceability (entity → SRS / meeting → API / FE / test)

| Table | Meeting / SRS | Write API (logical) | FE | Test idea |
|-------|---------------|---------------------|----|-----------|
| `rec_job_description` | R2 | `/recruitment/job-descriptions` | REC JD master | CRUD + code UQ |
| `rec_recruitment_request` | R3 · REC-02/02b · **1a–1d** | `/recruitment/requests` · F-YCTD-JD-* | YCTD + JD soft FK | Bind Hiệu lực · snapshot · J-HRM-JD-YCTD-01 |
| `rec_candidate_application` | R8 · REC-05a/06b | `/recruitment/applications` · F-REC-UV-YCTD-* · F-REC-CMP-* | Pipeline + UV bind YCTD · So sánh | Soft FK `requisition_id` · J-HRM-REC-UV-01 · J-HRM-REC-CMP-01 |
| `rec_interview_*` | R7 · REC-06 | `/recruitment/interview-*` | Eval form | Dynamic criteria JSON |
| `rec_mail_outbox` / `rec_mail_log` | R7 · REC-06 | F-REC-MAIL-01 | Mail queue | Interviewer CC required |
| `rec_campaign*` | R1 GĐ2 | HOLD | OUT MVP | — |
| `hrm_employee` / compensation | C1–C2 · CORE-01/02 | `/employees` vs C&B resource | Profile rings | Persona non-C&B 403 |
| `hrm_dependent` | C2 | `/employees/:id/dependents` | Family | Quà 1/6 filter DOB |
| `hrm_contract` + templates/clauses/print/pack | C4 · CORE-09/09a/09b/09c | `/contracts-insurance` F-CORE-CTR-* | HĐ registry + Settings + preview/print | Overlap 409 · AC-CTR-PRINT-* · scope_parity |
| `hrm_insurance_*` | C5 · CORE-10 | `/insurance/enrollments` | BH UI | Suspend keeps periods |
| `hrm_reward_discipline` | C6 · CORE-08 | `/reward-discipline` | KT-KL | payroll_link_status |
| `hrm_asset_*` | C7 · CORE-05/06 | `/employees/:id/assets` | Asset | Termination checklist |
| `hrm_employment_history` | C8 | `/employment-history` | Timeline | Decision → row |
| `hrm_termination` | C9 | `/terminations` | Offboard | voluntary vs dismissal |
| `att_shift*` | A1 · ATT-01 | `/work-shifts` · assignments | ATT settings | Shift ≠ assignment |
| `att_attendance_rule` | A3 · ATT-02 | F-ATT-RULE-01 | Phạt muộn/sớm | OU/shift scoped + shift fallback |
| `att_holiday_*` | A2 | `/holiday-calendars` | Lễ năm | Year publish |
| `att_leave_type` | A3–A4 · ATT-04..07 | leave-type CFG | Settings phép | Catalog keys + sick flags |
| `att_leave_*` | A4 · ATT-09 | leave balance/hold | Phép | Hold/release; carry/advance cols |
| `att_attendance_punch` | A6 · ATT-03 | `/attendance/records` | Mobile/Web | Sheet locked |
| `att_timesheet_*` | A5 · ATT-10/11 | `/attendance-sheets` | Bảng công | Close → PAY 412 if open |
| `att_timesheet_sign_step` | A5 · ATT-11 · BR-BP-TS-02 | F-ATT-WF-SIGN-01/02 | Ký chốt WF | UQ step/vòng · reopen archive |
| `pay_payroll_period` + bind | P1 · PAY-01/06 | `/payroll/periods` · process precheck | PAY kỳ | Closed timesheet bind |
| `pay_formula_definition` | P4 · PAY-02 | formula CFG (**Q-PAY-FORMULA**) | C&B formula | Dual-control publish |
| `pay_insurance_rate_cfg` | PAY-05 · ownership | rate CFG | C&B BH | Version pick kỳ |
| `pay_payroll_group` | PAY-09 | group CFG | Nhóm VP/KD/TX/VH | One group / NV |
| `pay_payslip` + lines + segments | P1/P6 · PAY-04/08 | payslips | Phiếu + ESS | One net; no double static |
| `pay_reward_link` / RD soft | P3 · CORE-08 | link on process | KT-KL kỳ | executed status |
| `pay_termination_settlement` | P6 · PAY-07 | settlements | Tất toán | Checklist flags |

**J-* (design intent — gắn ID khi QA khóa):** hire REC→CORE · close timesheet · PAY←closed · public vs C&B · final pay termination · leave_type catalog smoke.

**scope_parity (U19):** list + get-by-id `pay_payslip` / `pay_payroll_period` dùng cùng `company_id` resolver với ATT timesheet list (slug rollup `main` = same as Nest AS-IS).

---

## 10. Open questions (không bịa)

| ID | Impact on DB |
|----|----------------|
| Q-REC-HEADCOUNT | Độ dài approval — chỉ ảnh hưởng `approval_matrix_key` CFG, không đổi PK |
| Q-LEAVE-ACCRUAL / UNIT | Enum `accrual_mode` + `unit` trên policy — keys A3 đã khóa |
| Q-SI-SUSPEND | Action set trên enrollment — period_status values |
| Q-PAY-FORMULA | Depth schema **trong** `expression_json` + UI kéo-thả GĐ2 — **không** chặn bảng pointer §5.3 |
| Contract `salary_calc_mode` (2 kiểu) | Enum values — chờ confirm giấy nếu còn lệch transcript |

---

## 11. Risks & mitigation

| Risk | Mitigation |
|------|------------|
| AS-IS Nest table names lệch prefix | Mapping alias trong TechSpec/API_DESIGN; không force rename prod trong draft |
| Insurance % dual SoT CORE vs PAY | Enrollment timeline CORE; master CFG PAY; snapshot FK optional |
| GĐ2 Campaign leak vào MVP schema as required | Explicit optional §2.8; YCTD flags |
| scope_parity | Mọi bảng TXN có `company_id`; same list/detail resolver |
| Formula invent trước khách ký | `expression_json` opaque; Q-PAY-FORMULA packet |
| Artifact còn câu «họp lương chưa xong» | CORRECTION SYNTHESIS — DB §5 đã gỡ |
| Split-month double deduct | Segments + static-only-on-header (DV-13/14) |

---

## 12. Exit / handoff

| Field | Value |
|-------|--------|
| **Status** | DRAFT design v0.3.0 — họp PAY **đã chốt** · **not** customer-signed (D7) · align-01 folded |
| **ack_status** | `PASS_TO_PM` (`PO-HRM-BP-SYNTH-PAY-DB-01`) |
| **next_owner** | `pm` → SA/API_DESIGN PAY F.* delta (gỡ «họp chưa xong») · ba-process SRS leave A3–A4 nếu còn · **no Dev unlock** |
| **evidence** | `docs/qa/evidence/po-hrm-bp-synth-pay-db-01.md` |
| **prior** | `po-hrm-bp-meet-db-01.md` · `po-hrm-bp-meet-db-align-01.md` (**CLOSED** — folded, no reopen) |
| **Do not** | Migrations · claim physical SoT · invent formula engine DDL · customer-signed / Dev unlock |

### DOC-DELTA `PO-HRM-BP-MEET-DB-ALIGN-01` (2026-08-04) — CLOSED

| Change | Detail |
|--------|--------|
| ADD | `rec_mail_outbox` + `rec_mail_log` (§2.9) — close API phantom `mail_outbox` |
| ADD | `att_attendance_rule` (§4.1b) — SoT F-ATT-RULE-01; `att_shift.late_penalty_*` = fallback default |
| ADD cols | plan submit/approve audit; YCTD `out_of_plan_reason` / `approved_*` / pipeline JSON keys; `hrm_employee.activated_at`; timesheet reopen audit |
| Align | Hire link SoT = `rec_candidate.employee_id` (not application) |
| Note | PAY stubs superseded by SYNTH-PAY-DB-01 below |

### DOC-DELTA `PO-HRM-BP-SYNTH-PAY-DB-01` (2026-08-04)

| Change | Detail |
|--------|--------|
| CORRECTION | Gỡ «stub / họp lương chưa xong» — PAY meeting complete per SYNTHESIS §2.4 |
| ADD | `att_leave_type` catalog — annual, seniority, ot_comp, carry_over, advance, sick + insurance/company flags |
| UPGRADE | leave balance `carried_in` / `advanced`; policy `carry_over_expire_rule` |
| UPGRADE | §5 PAY logical: period, timesheet bind, formula pointer, rate CFG, payroll group, payslip + lines + split segments, reward link, termination settlement |
| ADD cols | `hrm_reward_discipline.payroll_period_id`; `hrm_termination.final_settlement_id` |
| ADD | DV-13..20 · lifecycle §5.11 · P1–P6 map |
| HOLD | `expression_json` inner schema — Q-PAY-FORMULA unsigned |
| Fold | MEET-DB-ALIGN-01 already CLOSED — no reopen; PAY column intent ready for SA API §4/§7 delta |

### DOC-DELTA `PO-HRM-BP-ATT-SIGN-DB-API-01` (2026-08-05)

| Change | Detail |
|--------|--------|
| ADD | §4.6.1 `att_timesheet_sign_step` — cột/FK/UQ/IX + BR-BP-TS-02 evaluator rules |
| ADD | ERD + §9 catalog row sign-step |
| Align | TechSpec §6.4.4 proposed → physical logical SoT |
| **Do not** | Migrations · Dev unlock · Attendance CLOSED product claim |

### DOC-DELTA `PO-HRM-JD-YCTD-REF-DB-01` (2026-08-06)

| Change | Detail |
|--------|--------|
| CONFIRM | **ONE** physical soft FK: `job_requisitions.job_template_id` ↔ logical `rec_recruitment_request.job_description_id` (**alias only**) |
| ADD note | §2.3 — optional snapshot cols `job_description` / `requirements` = one-way ≠ template `values_json` SoT |
| ADD | Status/bindable: chỉ Hiệu lực bind YCTD mới; Ngừng JD ≠ CASCADE xóa history |
| ADD | DV-21..25 · §8 forbidden dual FK / job_postings JD SoT / CASCADE |
| FORBIDDEN | Dual physical FK · REC-03/`rec_campaign`/`rec_job_post*` as JD SoT GĐ1 (giữ §2.8 GĐ2) |
| SoT file | [`docs/program/specs/PO-HRM-JD-YCTD-REF-DB-01.md`](../../program/specs/PO-HRM-JD-YCTD-REF-DB-01.md) |
| **Do not** | Migrations · Dev unlock · wipe §2.3 stubs · claim `jd_dynamic_done` |
| Next | `PO-HRM-JD-YCTD-REF-API-01` (sa) — F.1 map alias + error codes |

### DOC-DELTA `PO-HRM-REC-UV-YCTD-DB-01` (2026-08-06)

| Change | Detail |
|--------|--------|
| CONFIRM | **ONE** physical soft FK: **`requisition_id`** ↔ logical `rec_candidate_application.recruitment_request_id` (**alias only**) |
| ADD note | §2.4 — deprecate free-text person `position` as SoT; vị trí = YCTD.`position_key` derived |
| ADD | §2.5 — optional denorm `position_key` on application; soft FK rules; compare/eval neo `application_id` |
| ADD | DV-26..31 · §8 forbidden dual UV FK / job_postings UV SoT / free-text position SoT / CASCADE |
| FORBIDDEN | Dual physical FK · `job_postings`/`job_posting_id` UV/compare SoT · REC-03 GĐ1 (giữ §2.8 GĐ2) |
| Honesty | `recruitment_uat_ready=false` · `jd_dynamic_done=false` |
| SoT file | [`docs/program/specs/PO-HRM-REC-UV-YCTD-DB-01.md`](../../program/specs/PO-HRM-REC-UV-YCTD-DB-01.md) |
| **Do not** | Migrations · Dev unlock · wipe §2.4–§2.5 stubs · claim UAT/JD-dynamic done |
| Next | `PO-HRM-REC-UV-YCTD-API-01` (sa) — F.1 overlay + error codes |

### DOC-DELTA `PO-HRM-ATT-LEAVE-FUNNEL-DB-01` (2026-08-06) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| ADD | §4.5a `attendance_records` — soft FK `leave_request_id` + `leave_type_key`; partial IX; reverse/locked rules |
| ADD | §4.6.2 physical bridge — `attendance_sheets` = alias `att_timesheet_header`; `att_timesheet_line` ABSENT → ADD-plan staged B |
| CONFIRM | OPEN-Q3 paid/unpaid via code/label/optional `metadata.is_paid` — **no invent** catalog fields (`LVT_04`/unpaid → unpaid hours) |
| must_keep | §4.6.1 `att_timesheet_sign_step` · J-HRM-06b/06c · WAIVE_L2 · empty sheet honesty |
| FORBIDDEN | Option C FE-join · wipe sign · dual header · seed funnel · claim `attendance_uat_ready` |
| Honesty | `attendance_uat_ready=false` |
| SoT file | [`docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-DB-01.md`](../../program/specs/PO-HRM-ATT-LEAVE-FUNNEL-DB-01.md) |
| **Do not** | Migrations this seat · implement AGG line in BE-01 |
| Next | `PO-HRM-ATT-LEAVE-FUNNEL-BE-01` (dev-be) Option A; AGG-01 staged |

### DOC-DELTA `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01` (2026-08-06) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| CONFIRM | Registry SoT **ONE** = `public.employee_contracts` ↔ `hrm_contract` — UF-HRM-02 must_keep |
| ADD | §3.4a–d physical: `hrm_contract_templates` · `hrm_contract_clauses` · `hrm_contract_print_versions` · `hrm_contract_pack_rules` |
| EXPAND | §3.4 columns: `pack_code`, `template_id` soft FK, `term_type`, `work_location*`, `job_description_text`, `probation*`, DRIVER fields, `archived_at`, optional `signed_at` |
| Alias | `contract_type_key`↔`contract_type` · `effective_from/to`↔`start_date/end_date` · live C&B = `compensation_package_id` · print C&B snapshot **only** on print_version |
| must_keep | Registry columns · BR-CD-F5-01 salary off-body · F5 packages · soft-delete library · scope_parity |
| FORBIDDEN | Dual registry · dual-write PAY · wipe §3.4 checklist §3.5 · use `rec_jd_pack_rule` as contract pack SoT · seed · claim printable UAT |
| Honesty | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` |
| SoT file | [`docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md) |
| **Do not** | Migrations / `apps/**` this seat · Dev unlock before sponsor CONFIRM |
| Next | PM → sponsor CONFIRM docs pack → then BE/FE (HOLD until CONFIRM) |

### DOC-DELTA `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02` (2026-08-07) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| ADD | §3.4e `hrm_contract_library_publishes` — UQ `(tenant_id, publish_version)` · checksum · immutable `payload_json` · soft-delete |
| EXPAND | §3.4a/b/d lineage: `origin` · `origin_company_id` · `origin_publish_version` · `lineage_code` |
| ADD | §3.4f `hrm_contract_library_pull_audits` — **CONFIRMED** (reject platform-audit-only sole SoT) |
| must_keep | DATA-01 §3.4a–d · print_versions · UF-HRM-02 · print-spine GWC |
| FORBIDDEN | `synced_catalogs` dual-write · live holding join at preview · wipe DATA-01 · seed · invent printable UAT |
| Honesty | `contracts_printable_ready=false` |
| SoT file | [`docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md) |
| **Do not** | Migrations / `apps/**` this seat |
| Next | PM → **dev-be** PUB/PULL/APPLY + scope_parity jest |

### DOC-DELTA `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01-SA-DOC` (2026-08-07) — **ADD**

| Change | Detail |
|--------|--------|
| **AFFIRM** | §3.4a `hrm_contract_templates.code` = **open catalog** (UQ per company) — client DB never stated closed `CHK IN (8)`; this delta **locks FORBIDDEN** to ship such CHECK |
| **SUPERSEDE (program intent)** | Any prior XEVN-TPL «exactly 8 / FORBIDDEN 9th» product ceiling — cite [`CORR-01`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md) · [`DYNAMIC-LOCK`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md) |
| **KEEP** | §3.4a–f · print_versions · lineage DATA-02 · UF-HRM-02 · soft-delete |
| Platform pointer | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-01`](../../program/PO_HRM_DYNAMIC_CONFIG_PLATFORM_01.md) — clause/structure/content dynamic (not this seat) |
| FORBIDDEN | Wipe §3.4* · migrations/`apps/**` · invent printable UAT · re-introduce closed enum CHECK |
| Honesty | `contracts_printable_ready=false` |
| BE gate | **Do not block** BE dynamic — pointer only |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01` (2026-08-07) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **CONFIRM** | §4.4 **`public.att_leave_type`** — platform ATT **`ICatalogRow`** physical ADD (ABSENT AS-IS) |
| **EXPAND** | Columns: `metadata_json` · audit `created_at`/`updated_at` · UQ `(company_id, lower(leave_type_key))` partial |
| **LOCK** | Open catalog — **FORBIDDEN** `CHECK leave_type_key IN (...)` closed starter set |
| **ADD** | §4.4c `attendance_work_sites` platform `ICatalogRow` note — table **LIVE** · no new table GĐ1 |
| **Dual SoT** | `settings-catalogs.leave_types` group REF **≠** `att_leave_type` tenant writer — effective union (**BR-PLT-06**) |
| must_keep | `work_shifts` ops SoT · sheet/sign spine §4.6.1 · soft-delete · scope TEXT slug · U65 |
| FORBIDDEN | Seed UF evidence · hard-delete history · mega-EAV · wipe §4.4b balance/policy pointers |
| Honesty | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · no Phase1 DONE |
| SoT file | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md) |
| **Do not** | Migrations / `apps/**` this seat |
| Next | **`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-BE-01`** (dev-be) ensureSchema + F-ATT-CAT-* |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01` (2026-08-07) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **CONFIRM ADD** | §2.4a **`public.rec_pipeline_stage`** — platform REC **`ICatalogRow`** physical (ABSENT AS-IS) |
| **EXPAND** | §2.5 `stage` = open `stage_key` · starter six ≠ ceiling · validate ∈ catalog when >0 |
| **EXPAND** | §2.6 history may hold retired keys · soft-delete catalog only |
| **EXPAND** | §1.1 ER + MVP row includes `rec_pipeline_stage` |
| **LOCK** | Open catalog — **FORBIDDEN** `CHECK stage_key IN (6)` · hired-outcome UQ partial · soft-delete |
| **Dual SoT GĐ1** | Tenant writer SoT · WF `wf_task_type_key` = ops map — **no** XBOS stages REF required |
| must_keep | JD DnD / `rec_jd_*` · IV one-active · hire→EMP · YCTD · history append-only · U65 |
| FORBIDDEN | Seed UF · hard-delete · mega-EAV · wipe §2.3–§2.8 · invent REC-03 |
| Honesty | `recruitment_uat_ready=false` · `payroll_e2e_ready=false` · no Phase1 DONE |
| Closes | **R-PLT-DATA-04** REC pipeline-stage slice |
| SoT file | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01.md) |
| **Do not** | Migrations / `apps/**` this seat |
| Next | **`PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01`** (dev-be) ensureSchema + F-REC-CAT-STG/EFF |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01` (2026-08-07) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **CONFIRM ADD** | §3.0a **`public.emp_document_type`** · §3.0b **`public.emp_employment_type`** — platform EMP **`ICatalogRow`** physical (ABSENT AS-IS) |
| **EXPAND** | §3.5 `document_type_key` = open catalog key · starter ≠ ceiling · history may hold retired |
| **EXPAND** | §3.1 note — `employment_type` / `employment_type_key` soft key space when present |
| **EXPAND** | §1.1 ER — EMP catalogs validate checklist / employment_type consumers |
| **LOCK** | Open keys — **FORBIDDEN** closed `CHECK … IN (starter)` on DOC or ET keys · soft-delete only |
| **Dual SoT (ET)** | `settings-catalogs.employment_types` group REF **≠** `emp_employment_type` tenant writer — EMP wins |
| must_keep | CORE-01 profile · UF-HRM-02 contracts · SI enrollment · AC-PLT-EMP-01 XBOS position · soft-delete · scope TEXT · U65 |
| FORBIDDEN | Seed UF · hard-delete · mega-EAV · wipe employees / contracts / SI · invent `emp_position` |
| Honesty | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `payroll_e2e_ready=false` · `attendance_uat_ready=false` · `recruitment_uat_ready=false` · no Phase1 DONE |
| Closes | **R-PLT-DATA-04** EMP document + employment catalog slice |
| SoT file | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md) |
| **Do not** | Migrations / `apps/**` this seat |
| Next | **`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01`** (dev-be) ensureSchema + F-EMP-CAT-* |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01` (2026-08-07) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **CONFIRM ADD** | §3.11a **`public.hr_decision_type`** — platform DEC **`ICatalogRow`** physical (ABSENT AS-IS) |
| **EXPAND** | §3.11 `decision_type` = open catalog key · starter/HRD_* ≠ ceiling · history may hold retired · **FORBIDDEN** closed CHECK |
| **EXPAND** | §1.1 ER — `hr_decision_type` validates `hr_decisions.decision_type` · WH via `decision_id` |
| **LOCK** | Open keys — **FORBIDDEN** closed `CHECK … IN (starter\|HRD_*)` on catalog or TXN column · soft-delete only |
| **Dual SoT** | `settings-catalogs.hr_decision_types` group REF **≠** `hr_decision_type` tenant writer — DEC wins |
| **Typed flags** | `is_person_bound` · `writes_work_history` · `wh_event_type` · `requires_position_key` |
| must_keep | Create → approve/sign → effective → WH `decision_id` · EMP DOC/ET · ATT leave · REC stages · CTR types OUT · soft-delete · scope TEXT · U65 |
| FORBIDDEN | Seed UF · hard-delete · mega-EAV · wipe decisions/WH · absorb `contract_types` · reopen EMP/ATT/REC seals |
| Honesty | Decisions UAT **false** · `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `payroll_e2e_ready=false` · `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `contracts_printable_ready=false` · no Phase1 DONE |
| Closes | **R-PLT-DATA-04** DEC / QSĐ decision-type catalog slice |
| SoT file | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01.md) |
| **Do not** | Migrations / `apps/**` this seat |
| Next | **`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BE-01`** (dev-be) ensureSchema + F-DEC-CAT-* |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01` (2026-08-08) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **CONFIRM ADD** | §3.6a **`public.si_insurance_type`** — platform SI **`ICatalogRow`** physical (ABSENT AS-IS) |
| **EXPAND** | §3.6 `type` / `insurance_type_key` = open catalog key · starter ≠ ceiling · history may hold retired · **FORBIDDEN** closed CHECK |
| **EXPAND** | §1.1 ER — `si_insurance_type` validates policy / enrollment / rate-cfg type keys |
| **LOCK** | Open keys — **FORBIDDEN** closed `CHECK … IN (BHXH\|social\|…)` · soft-delete only |
| **Dual SoT** | `settings-catalogs.insurance_types` group REF **≠** `si_insurance_type` tenant writer — SI wins |
| **Typed flags** | `is_statutory` · `eligible_for_rate_cfg` · `requires_policy` |
| **Caps** | F-SI-CAT-TYP-01/02 · F-SI-CAT-EFF-01 |
| must_keep | Enrollment ONE SoT `employee_insurances` · F-CORE-SI-02/03 · CTR legal-print/library seals · soft-delete · scope TEXT · U65 |
| FORBIDDEN | Seed UF · hard-delete · mega-EAV · insurers fold · second policy catalog · enrollment SM rewrite · invent printable/personnel |
| Honesty | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · `payroll_e2e_ready=false` · no Phase1 DONE · **C-SLICE-≠-MODULE** |
| Closes | **R-PLT-DATA-04** SI insurance-type catalog slice |
| SoT file | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01.md) |
| **Do not** | Migrations / `apps/**` this seat |
| Next | **`PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-01`** (dev-be) after BA-01 CONFIRMED — ensureSchema + F-SI-CAT-* |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01` (2026-08-08) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **CONFIRM ADD** | §3.6b **`public.si_insurer`** — platform SI insurers **`ICatalogRow`** physical (ABSENT AS-IS) |
| **EXPAND** | §3.6 policy/records `insurer_key` = open catalog key · starter ≠ ceiling · history may hold retired · **FORBIDDEN** closed CHECK |
| **EXPAND** | §3.6a peer pointer — insurers → §3.6b · **FORBIDDEN** fold into type |
| **EXPAND** | §1.1 ER — `si_insurer` validates policy / records insurer keys |
| **LOCK** | Open keys — **FORBIDDEN** closed `CHECK … IN (…)` · soft-delete only |
| **Dual SoT** | `settings-catalogs.insurers` group REF **≠** `si_insurer` tenant writer — SI wins |
| **Caps** | F-SI-CAT-INS-01/02 · F-SI-CAT-INS-EFF-01 |
| must_keep | §3.6a type L1 · Enrollment ONE SoT · F-CORE-SI-02/03 · CTR legal-print/library seals · soft-delete · scope TEXT · U65 |
| FORBIDDEN | Seed UF · hard-delete · mega-EAV · fold into `si_insurance_type` · reopen type L1 · enrollment SM rewrite · invent printable/personnel |
| Honesty | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · `payroll_e2e_ready=false` · no Phase1 DONE · **C-SLICE-≠-MODULE** |
| Closes | **R-PLT-DATA-04** SI **insurers** catalog slice |
| SoT file | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01.md) |
| **Do not** | Migrations / `apps/**` this seat |
| Next | **`PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BE-01`** (dev-be) **after BA-01 also CONFIRMED** — ensureSchema + F-SI-CAT-INS-* |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01` (2026-08-08) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **CONFIRM ADD** | §3.0c **`public.emp_employment_status`** · §3.0d **`public.emp_status_reason`** — platform EMP status/reason **`ICatalogRow`** physical (ABSENT AS-IS) |
| **EXPAND** | §3.1 `hrm_employee.status` = open catalog key · starter ≠ ceiling · history may hold retired · validate ∈ EFF when >0 · invent **`HRM-EMP-STATUS-KEY`** / reason **`HRM-EMP-STATUS-REASON-KEY`** |
| **EXPAND** | §3.0b peer pointer — status ≠ employment_type · **FORBIDDEN** fold into ET / EMP-CUSTOM |
| **EXPAND** | §1.1 ER — status/reason catalogs validate employee status (+ reason when required) |
| **LOCK** | Open keys — **FORBIDDEN** closed `CHECK … IN (…)` · **DROP/REPLACE** Nest `chk_employees_status` ceiling · soft-delete only |
| **Dual SoT** | `settings-catalogs.employee_statuses` / `employment_statuses` group REF **≠** `emp_employment_status` tenant writer — EMP wins · Settings **not** sole producer |
| **Caps** | F-EMP-CAT-ST-01..04/EFF-01 · F-EMP-CAT-STR-*/EFF · F-EMP-ST-CNS-01/02 |
| must_keep | §3.0a–b DOC/ET · EMP-CUSTOM CNS L1 · MergeToken EXT · soft-delete · scope TEXT · U65 · transition-graph code residual OK |
| FORBIDDEN | Seed UF · hard-delete · mega-EAV · fold into ET/custom · wipe EMP-CUSTOM/EXT · reopen ATT/SI/CTR · invent personnel/e2e/printable |
| Honesty | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · no Phase1 DONE · **C-SLICE-≠-MODULE** |
| Closes | **R-PLT-DATA-04** EMP **status/reason** catalog slice |
| SoT file | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01.md) |
| **Do not** | Migrations / `apps/**` this seat |
| Next | **`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BE-01`** (dev-be) **after BA-01 also CONFIRMED** — ensureSchema + F-EMP-CAT-ST/STR + DROP CHECK |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DOCS-01` (2026-08-08) — **CONFIRMED (client SRS/API/HDSD delta)**

| Change | Detail |
|--------|--------|
| **Pointer** | Client SRS/API/HDSD delta cho §3.0c/§3.0d — **không** đổi vật lý DATA-01 (giữ nguyên bảng, cột, khóa, CHK-drop) |
| **API** | ADD F-EMP-CAT-ST-01..04/EFF-01 · F-EMP-CAT-STR-01/02/EFF-01 · F-EMP-ST-CNS-01/02/03 · §0.1 **HRM-EMP-STATUS-KEY** / **HRM-EMP-STATUS-REASON-KEY** |
| **SRS** | EXPAND FR-UC-BP-PLT-01 AC-PLT-EMP-STATUS-01* · v0.32 |
| **HDSD** | ADD CH06e trạng thái NV / lý do (+ CH06 pointer) |
| must_keep | §3.0a–d physical DATA-01 · DOC/ET · EMP-CUSTOM CNS L1 · MergeToken EXT · ATT/SI/CTR seals · transition-graph code residual |
| FORBIDDEN | apps/** · seed · flip personnel/e2e/printable · reopen EMP-CUSTOM/EXT/DOC-ET/ATT/SI/CTR · invent FE R-PLT-EMP-ST-FE-01 · module EMP UAT · Phase1 |
| Honesty | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · **C-SLICE-≠-MODULE** |
| SoT file | [`docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-docs-01.md`](../../qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-docs-01.md) · QC GWC L1 SEAL · QA stamp EMPSTQA-MSK20G7H |

---


### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DOCS-01` (2026-08-07) — **CONFIRMED** (API pointer)

| Change | Detail |
|--------|--------|
| **POINTER** | Client **API_DESIGN** ADD F-EMP-CAT-DOC/ET/EFF F.1 ↔ physical §3.0a–b (EMP-DATA-01) — **no wipe** tables |
| **KEEP** | §3.0a–b · §3.5 open `document_type_key` · dual SoT ET · AC-PLT-EMP-01 XBOS position OUT |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · no Phase1 DONE |
| **Closes** | **R-PLT-EMP-03** with API DOC-DELTA |
| SoT API | [`API_DESIGN_HRM_ENTERPRISE.md`](./API_DESIGN_HRM_ENTERPRISE.md) F-EMP-CAT-* |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DOCS-01` (2026-08-07) — **CONFIRMED** (API pointer)

| Change | Detail |
|--------|--------|
| **POINTER** | Client **API_DESIGN** ADD F-DEC-CAT-TYP/EFF F.1 ↔ physical §3.11a (DEC-DATA-01) — **no wipe** tables |
| **KEEP** | §3.11a · §3.11 open `decision_type` · dual SoT REF `hr_decision_types` · WH `decision_id` spine · EMP/ATT/REC sealed · CTR types OUT |
| **Honesty** | Decisions UAT **false** · `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · no Phase1 DONE |
| **Closes** | **R-PLT-DEC-02** with API DOC-DELTA |
| **FORBIDDEN** | Invent QSĐ MergeToken print GĐ2 · flip any `*_ready` |
| SoT API | [`API_DESIGN_HRM_ENTERPRISE.md`](./API_DESIGN_HRM_ENTERPRISE.md) F-DEC-CAT-* |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DOCS-01` (2026-08-07) — **CONFIRMED** (API + origin pointer)

| Change | Detail |
|--------|--------|
| **POINTER** | Client **API_DESIGN** ADD F-EMP-TOK-01..05 ↔ physical **`hrm_merge_tokens`** (platform DATA-01) — **no** new EMP catalog tables · **no** second token table |
| **EXPAND DOC** | Origin CHK **`chk_hrm_merge_tok_origin`** ADD **`emp_catalog`** (peer `allowance_catalog`) — register matrix: `emp.doc.*` / `emp.et.*` → `emp_catalog` · `custom.emp.*` → `extension_field` |
| **KEEP** | §3.0a–b EMP DOC/ET **SEALED** (triggers only) · §3.4 CTR print spine · DEC §3.11a · soft-delete · keyword_map fallback when registry empty |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · no Phase1 DONE · `C-SLICE-≠-MODULE` |
| **FORBIDDEN** | Invent QSĐ MergeToken print GĐ2 LIVE · invent `emp_merge_tokens` · flip any `*_ready` · reopen EMP-QC seals |
| **Closes** | **R-EMP-TOK-DOCS** with API DOC-DELTA |
| SoT API | [`API_DESIGN_HRM_ENTERPRISE.md`](./API_DESIGN_HRM_ENTERPRISE.md) F-EMP-TOK-* · peer F-PLT-TOK |
| SoT DATA | Program [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01.md) |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-DOCS-01` (2026-08-07) — **CONFIRMED** (API + SRS pointer)

| Change | Detail |
|--------|--------|
| **POINTER** | Client **API_DESIGN** EXPAND F-PLT-PAY-COMP-01/02 · F-PAY-SHEET-TPL-LINES-01 · F-CORE-EMP-02 footnote — admin mở N+1 ≠ consumer invent · Nest `salary_components` SoT picker · **`HRM-SC-COMP-KEY`** |
| **KEEP** | Physical `salary_components` / `pay_types` already locked (ba-data **HOLD** — **no** second catalog table) · §5 PAY logical · formula / TPL F.1 · peer EMP/DEC/CTR seals |
| **Honesty** | `payroll_e2e_ready=false` · formula LIVE **DENIED** · no Phase1 DONE · `C-SLICE-≠-MODULE` |
| **FORBIDDEN** | ba-data EXPAND second table · flip ready · invent module PAY UAT · reopen PAY-CATALOG / EXT / EMP / DEC / CTR / LIST-TOTALS |
| **Closes** | Client DOC-DELTA Nest SC admin≠consumer (no physical DDL this seat) |
| SoT API | [`API_DESIGN_HRM_ENTERPRISE.md`](./API_DESIGN_HRM_ENTERPRISE.md) F-PLT-PAY-COMP-* |
| SoT SRS | [`SRS_HRM_ENTERPRISE.md`](./SRS_HRM_ENTERPRISE.md) FR-UC-BP-PAY-02 v0.25 |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-DOCS-01` (2026-08-08) — **CONFIRMED** (API + SRS pointer)

| Change | Detail |
|--------|--------|
| **POINTER** | Client **API_DESIGN** ADD F-ATT-CAT-LVT-01/02 · F-ATT-CAT-EFF-01 · EXPAND F-ATT-LEAVE-02 — admin mở N+1 ≠ consumer invent · Nest `att_leave_type` / effective SoT picker · **`HRM-LEAVE-TYPE-UNKNOWN`** |
| **KEEP** | Physical §4.4 `att_leave_type` already locked (ba-data **HOLD** — **no** second catalog table) · sheet/sign · leave funnel · `work_shifts` ops · peer EMP/DEC/PAY/EXT/CTR/LIST-TOTALS · WAIVE/sign/J-HRM-06c · ATT-QC-01/02 seals |
| **Honesty** | `attendance_uat_ready=false` · no Phase1 DONE · `C-SLICE-≠-MODULE` · DENY module ATT UAT |
| **FORBIDDEN** | ba-data EXPAND second table · flip ready · invent module ATT UAT · reopen WAIVE/sign/J-HRM-06c · reopen ATT-QC / EMP/DEC/PAY/EXT/CTR/LIST-TOTALS |
| **Closes** | Client DOC-DELTA Nest LVT admin≠consumer (no physical DDL this seat) |
| SoT API | [`API_DESIGN_HRM_ENTERPRISE.md`](./API_DESIGN_HRM_ENTERPRISE.md) F-ATT-CAT-LVT/EFF · F-ATT-LEAVE-02 |
| SoT SRS | [`SRS_HRM_ENTERPRISE.md`](./SRS_HRM_ENTERPRISE.md) FR-UC-BP-ATT-04/05b/07/09 v0.26 |
| SoT HDSD | [`HDSD_XEVN_CH05_HRM_CHAM_CONG_PHEP.md`](../hdsd/hrm/HDSD_XEVN_CH05_HRM_CHAM_CONG_PHEP.md) |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-DOCS-01` (2026-08-08) — **CONFIRMED** (API + SRS pointer)

| Change | Detail |
|--------|--------|
| **POINTER** | Client **API_DESIGN** ADD F-REC-CAT-STG-01/02 · F-REC-CAT-EFF-01 · F-REC-IV-SCHED-SOFT · EXPAND F-REC-APP-01/02 · F-REC-HIRE-01 — admin mở N+1 ≠ consumer invent · Nest `rec_pipeline_stage` / effective SoT picker/kanban · **`HRM-REC-STAGE-UNKNOWN`** · **`HRM-REC-IV-400-STAGE-DISALLOW`** |
| **KEEP** | Physical §2.4a `rec_pipeline_stage` already locked (ba-data **HOLD** — **no** second catalog table) · §2.5/§2.6 application/history · JD / IV one-active / YCTD · peer EMP/DEC/PAY/ATT/EXT/CTR/LIST-TOTALS · REC-QC/UX/JD seals |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · no Phase1 DONE · `C-SLICE-≠-MODULE` · DENY module REC UAT |
| **FORBIDDEN** | ba-data EXPAND second table · flip ready · invent module REC UAT · reopen IV one-active / REC UX / JD · reopen REC-QC / EMP/DEC/PAY/ATT/EXT/CTR/LIST-TOTALS |
| **Closes** | Client DOC-DELTA Nest STG admin≠consumer (no physical DDL this seat) |
| SoT API | [`API_DESIGN_HRM_ENTERPRISE.md`](./API_DESIGN_HRM_ENTERPRISE.md) F-REC-CAT-STG/EFF · F-REC-APP-01/02 · HIRE · IV-SCHED-SOFT |
| SoT SRS | [`SRS_HRM_ENTERPRISE.md`](./SRS_HRM_ENTERPRISE.md) FR-UC-BP-REC-05/05a/06a/07 v0.27 |
| SoT HDSD | [`HDSD_XEVN_CH07b_HRM_DANH_MUC_GIAI_DOAN.md`](../hdsd/hrm/HDSD_XEVN_CH07b_HRM_DANH_MUC_GIAI_DOAN.md) |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DOCS-01` (2026-08-08) — **CONFIRMED** (API + SRS pointer)

| Change | Detail |
|--------|--------|
| **POINTER** | Client **API_DESIGN** ADD F-SI-CAT-TYP-01/02 · F-SI-CAT-EFF-01 · F-SI-POL-01 · EXPAND F-CORE-SI-01 — admin mở N+1 ≠ consumer invent · Nest `si_insurance_type` / effective SoT picker · **`HRM-INS-TYPE-KEY`** |
| **KEEP** | Physical §3.6a `si_insurance_type` already locked (ba-data **HOLD** — **no** second type table) · §3.6 enrollment ONE SoT · CTR print spine · peer EMP/DEC/PAY/ATT/REC/EXT/LIST-TOTALS · CTR legal-print / enrollment EMP-BE-02 seals |
| **Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · no Phase1 DONE · `C-SLICE-≠-MODULE` · DENY module SI/CTR UAT |
| **FORBIDDEN** | ba-data EXPAND second **type** table · flip printable/personnel · invent module SI/CTR UAT · reopen CTR legal-print · reopen enrollment · invent FE-01 · reopen EMP/DEC/PAY/ATT/REC/EXT/LIST-TOTALS · fold insurers into type |
| **Closes** | Client DOC-DELTA Nest SI type admin≠consumer (**R-PLT-SI-INS-04**) — no physical DDL this seat |
| SoT API | [`API_DESIGN_HRM_ENTERPRISE.md`](./API_DESIGN_HRM_ENTERPRISE.md) F-SI-CAT-TYP/EFF · F-SI-POL-01 · F-CORE-SI-01 |
| SoT SRS | [`SRS_HRM_ENTERPRISE.md`](./SRS_HRM_ENTERPRISE.md) FR-UC-BP-CORE-10 / CORE-02 v0.28 |
| SoT HDSD | [`HDSD_XEVN_CH06b_HRM_DANH_MUC_LOAI_BH.md`](../hdsd/hrm/HDSD_XEVN_CH06b_HRM_DANH_MUC_LOAI_BH.md) |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DOCS-01` (2026-08-08) — **CONFIRMED** (API + SRS pointer)

| Change | Detail |
|--------|--------|
| **POINTER** | Client **API_DESIGN** ADD F-SI-CAT-INS-01/02 · F-SI-CAT-INS-EFF-01 · F-SI-REC-01 · EXPAND F-SI-POL-01 — admin mở N+1 ≠ consumer invent · Nest `si_insurer` / effective SoT picker · **`HRM-INS-INSURER-KEY`** ≠ **`HRM-INS-TYPE-KEY`** |
| **KEEP** | Physical §3.6b `si_insurer` already locked (ba-data **HOLD** — **no** second insurer table · **no** fold into §3.6a) · §3.6 enrollment ONE SoT · F-SI-CAT-TYP/EFF · CTR print spine · peer EMP/DEC/PAY/ATT/REC/EXT/LIST-TOTALS · SI type L1 · CTR legal-print / enrollment EMP-BE-02 seals |
| **Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · no Phase1 DONE · `C-SLICE-≠-MODULE` · DENY module SI/CTR UAT |
| **FORBIDDEN** | ba-data EXPAND second table · flip printable/personnel · invent module SI/CTR UAT · reopen SI type L1 · reopen CTR legal-print · reopen enrollment · invent FE-01 · fold into `si_insurance_type` · reopen EMP/DEC/PAY/ATT/REC/EXT/LIST-TOTALS |
| **Closes** | Client DOC-DELTA Nest SI insurer admin≠consumer — no physical DDL this seat |
| SoT API | [`API_DESIGN_HRM_ENTERPRISE.md`](./API_DESIGN_HRM_ENTERPRISE.md) F-SI-CAT-INS/EFF · F-SI-POL-01 · F-SI-REC-01 |
| SoT SRS | [`SRS_HRM_ENTERPRISE.md`](./SRS_HRM_ENTERPRISE.md) FR-UC-BP-CORE-10 / CORE-02 v0.29 |
| SoT HDSD | [`HDSD_XEVN_CH06c_HRM_DANH_MUC_NHA_BH.md`](../hdsd/hrm/HDSD_XEVN_CH06c_HRM_DANH_MUC_NHA_BH.md) |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DATA-01` (2026-08-08) — **CONFIRMED EXPAND**

| Change | Detail |
|--------|--------|
| **EXPAND** | §4.4c `attendance_work_sites` — soft-retire **`active=false`** = sole product retire SoT · hard DELETE residual only · list default `active=TRUE` · IX note `(company_id, active)` · GEO soft-ref **`HRM-ATT-GEO-001` RETAIN** · **`HRM-ATT-SITE-UNKNOWN` HOLD** |
| **KEEP** | Table **LIVE** · columns AS-IS · ATT-DATA-01 §3 · §4.4 `att_leave_type` · SI type/insurer · CTR · enrollment · EMPTY-DATE CLOSED · peer seals |
| **LOCK** | **HOLD class = NO second table** · **FORBIDDEN** fold into `att_leave_type` · `ensureDefaultWorkSite` / seed · Settings/`gps_locations` sole SoT · invent `site_code`/`archived_at` GĐ1 · flip `attendance_uat_ready` |
| **Honesty** | `attendance_uat_ready=false` · printable/personnel false · `C-SLICE-≠-MODULE` · DENY module ATT UAT / Phase1 |
| **BE** | Supports in-flight **ATT-WORKSITE-CATALOG-BE-01** deepen — **does not** block / re-dispatch / invent duplicate BE |
| **Closes** | Physical DOC-DELTA for AC-PLT-ATT-WORKSITE-01* deepen (policy on LIVE) |
| SoT file | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DATA-01.md) |
| **Do not** | Migrations execute / `apps/**` / seed this seat |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DOCS-01` (2026-08-08) — **CONFIRMED** (API + SRS pointer)

| Change | Detail |
|--------|--------|
| **POINTER** | Client **API_DESIGN** ADD F-ATT-CAT-WS-01/02 · EXPAND F-ATT-PUNCH-01 — admin mở N+1 ≠ consumer invent tọa độ · Nest `attendance_work_sites` SoT geofence · **`HRM-ATT-GEO-001`** · **`HRM-ATT-GEO-REQ`** · soft-retire **`active=false`** · **`HRM-ATT-SITE-UNKNOWN` HOLD** |
| **KEEP** | Physical §4.4c already EXPAND (ATT-WORKSITE-CATALOG-DATA-01) · ba-data **HOLD** — **no** second sites table · §4.4 `att_leave_type` · F-ATT-CAT-LVT/EFF · sheet/sign · `work_shifts` ops · ATT-LEAVE GWC · WAIVE/sign/J-HRM-06c · SI type/insurer · CTR · enrollment · peer seals |
| **Honesty** | `attendance_uat_ready=false` · printable/personnel false · no Phase1 DONE · `C-SLICE-≠-MODULE` · DENY module ATT UAT |
| **FORBIDDEN** | ba-data EXPAND second table · flip ready · invent module ATT UAT · reopen ATT-LEAVE · reopen WAIVE/sign/J-HRM-06c · invent FE · invent SITE-UNKNOWN FAIL · invent J-MOB-02 FAIL · seed |
| **Closes** | Client DOC-DELTA Nest work-sites admin≠consumer (no physical DDL this seat) |
| SoT API | [`API_DESIGN_HRM_ENTERPRISE.md`](./API_DESIGN_HRM_ENTERPRISE.md) F-ATT-CAT-WS · F-ATT-PUNCH-01 |
| SoT SRS | [`SRS_HRM_ENTERPRISE.md`](./SRS_HRM_ENTERPRISE.md) FR-UC-BP-ATT-03d v0.30 |
| SoT HDSD | [`HDSD_XEVN_CH05b_HRM_DANH_MUC_DIEM_GPS.md`](../hdsd/hrm/HDSD_XEVN_CH05b_HRM_DANH_MUC_DIEM_GPS.md) |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-DOCS-01` (2026-08-08) — **CONFIRMED** (API + SRS pointer)

| Change | Detail |
|--------|--------|
| **POINTER** | Client **API_DESIGN** ADD F-EMP-CF-01..03 · F-EMP-CF-CNS-01/02 · EXPAND F-EMP-TOK-03 · F-CORE-EMP-01 footnote — Settings extension-items allow-list = field-def SoT · admin mở N+1 ≠ consumer invent · **`HRM-EMP-CUSTOM-FIELD-KEY`** |
| **KEEP** | Physical **`hrm_catalog_extension_items`** + **`hrm_merge_tokens`** LIVE · ba-data **HOLD** — **no** Nest `emp_custom_field` / mega-EAV · F-EMP-CAT DOC/ET · F-EMP-TOK-01/02/04/05 · MergeToken EMP EXT seal · ATT/SI/CTR/PAY/REC/DEC peer seals |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · no Phase1 DONE · `C-SLICE-≠-MODULE` · DENY module EMP UAT |
| **FORBIDDEN** | ba-data EXPAND Nest field-def · flip personnel/e2e/printable · invent module EMP UAT · reopen EXT/ATT/SI/CTR · invent FE · seed |
| **Closes** | Client DOC-DELTA Settings extension SoT admin≠consumer (no physical DDL this seat) |
| SoT API | [`API_DESIGN_HRM_ENTERPRISE.md`](./API_DESIGN_HRM_ENTERPRISE.md) F-EMP-CF-* · F-EMP-TOK-03 |
| SoT SRS | [`SRS_HRM_ENTERPRISE.md`](./SRS_HRM_ENTERPRISE.md) FR-UC-BP-CORE-02b / PLT-01 v0.31 |
| SoT HDSD | [`HDSD_XEVN_CH06d_HRM_TRUONG_MO_RONG_NS.md`](../hdsd/hrm/HDSD_XEVN_CH06d_HRM_TRUONG_MO_RONG_NS.md) |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-DOCS-01` (2026-08-08) — **CONFIRMED** (API + SRS pointer)

| Change | Detail |
|--------|--------|
| **POINTER** | Client **API_DESIGN** ADD F-EMP-CAT-POS-01/02/03 · F-EMP-CAT-POS-EFF-01 · F-EMP-POS-CNS-01..04 — Settings/XBOS `job_titles` = position SoT · admin CREATE/sync N+1 ≠ consumer invent · **`HRM-EMP-POSITION-KEY`** (≡ **`HRM-WH-PICK-REQUIRED`**) · empty **`HRM-WH-PICK-EMPTY-CATALOG`** |
| **KEEP** | Physical Settings/XBOS `job_titles` LIVE · ba-data **HOLD** — **no** Nest `emp_position` · §3 EMP OUT vị trí/phòng XBOS RETAIN · F-EMP-CAT DOC/ET/ST · F-EMP-CF-* · F-EMP-TOK-* · EMP-STATUS · EMP-CUSTOM · MergeToken EXT · ATT/SI/CTR seals |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · no Phase1 DONE · `C-SLICE-≠-MODULE` · DENY module EMP UAT |
| **FORBIDDEN** | ba-data EXPAND Nest `emp_position` · flip personnel/e2e/printable · invent module EMP UAT · reopen EMP-STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · invent EMP-STATUS FE · invent FE WH picker · seed |
| **OUT note** | Dept companion (`departments`) same Option A — closed by **EMP-DEPT-CATALOG-DOCS-01** (cite below) |
| **Closes** | Client DOC-DELTA Settings/XBOS chức danh admin≠consumer (no physical DDL this seat) · cite **R-PLT-EMP-POS-BE-01 CLOSED** |
| SoT API | [`API_DESIGN_HRM_ENTERPRISE.md`](./API_DESIGN_HRM_ENTERPRISE.md) F-EMP-CAT-POS-* · F-EMP-POS-CNS-* |
| SoT SRS | [`SRS_HRM_ENTERPRISE.md`](./SRS_HRM_ENTERPRISE.md) FR-UC-BP-PLT-01 / CORE-01a v0.33 |
| SoT HDSD | [`HDSD_XEVN_CH06f_HRM_DANH_MUC_CHUC_DANH.md`](../hdsd/hrm/HDSD_XEVN_CH06f_HRM_DANH_MUC_CHUC_DANH.md) |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-DOCS-01` (2026-08-08) — **CONFIRMED** (API + SRS pointer)

| Change | Detail |
|--------|--------|
| **POINTER** | Client **API_DESIGN** ADD F-EMP-CAT-DEPT-01/02/03 · F-EMP-CAT-DEPT-EFF-01 · F-EMP-DEPT-CNS-01..04 — Settings/XBOS `departments` = department SoT · admin CREATE/sync N+1 ≠ consumer invent · **`HRM-EMP-DEPT-KEY`** (≡ **`HRM-WH-DEPT-KEY`**) · empty **`HRM-EMP-DEPT-EMPTY-CATALOG`** |
| **KEEP** | Physical Settings/XBOS `departments` LIVE · ba-data **HOLD** — **no** Nest `emp_department` · **no** org-tree sole invent SoT · **no** Nest `emp_position` · §3 EMP OUT vị trí/phòng XBOS RETAIN · F-EMP-CAT DOC/ET/ST/POS · F-EMP-CF-* · F-EMP-TOK-* · EMP-POSITION · EMP-STATUS · EMP-CUSTOM · MergeToken EXT · ATT/SI/CTR seals |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · no Phase1 DONE · `C-SLICE-≠-MODULE` · DENY module EMP UAT · 01c NOTE_BLOCKED · P3 alias HOLD |
| **FORBIDDEN** | ba-data EXPAND Nest `emp_department` · flip personnel/e2e/printable · invent module EMP UAT · reopen EMP-POSITION/STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · invent EMP-STATUS FE · invent FE dept picker · BE unlock alias string alone · seed |
| **Closes** | Client DOC-DELTA Settings/XBOS phòng ban admin≠consumer (no physical DDL this seat) · cite **R-EMP-POS-DEPT-01 CLOSED** |
| SoT API | [`API_DESIGN_HRM_ENTERPRISE.md`](./API_DESIGN_HRM_ENTERPRISE.md) F-EMP-CAT-DEPT-* · F-EMP-DEPT-CNS-* |
| SoT SRS | [`SRS_HRM_ENTERPRISE.md`](./SRS_HRM_ENTERPRISE.md) FR-UC-BP-PLT-01 / CORE-01a v0.34 |
| SoT HDSD | [`HDSD_XEVN_CH06g_HRM_DANH_MUC_PHONG_BAN.md`](../hdsd/hrm/HDSD_XEVN_CH06g_HRM_DANH_MUC_PHONG_BAN.md) |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01` (2026-08-08) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **ADD** | §4.4d `att_attendance_code` — platform ATT **`ICatalogRow`** physical ADD (ABSENT AS-IS) · open `code` · `symbol` · typed flags `counts_as`/`day_weight`/`is_paid`/`is_present` · UQ partial · soft-delete |
| **EXPAND** | §4.5a `attendance_records.status` — open catalog day-code · validate ∈ EFF when >0 · invent **`HRM-ATT-CODE-KEY`** · **DROP/REPLACE** closed CHECK / DTO `IsIn` ceiling |
| **EXPAND** | §1.1 ER — attendance-code catalog validates record day-code |
| **Dual SoT** | Future settings-catalogs **`attendance_codes`** group REF **≠** `att_attendance_code` tenant writer — effective union (**BR-PLT-06**) |
| **KEEP** | §4.4 `att_leave_type` · §4.4c work-sites · sheet/sign · `work_shifts` ops · funnel soft FK · EMP/SI/CTR seals · aggregate counting **code** GĐ1 |
| **LOCK** | **FORBIDDEN** mega-EAV · fold into leave/work-sites/shifts · rewrite `att-timesheet-line-aggregate` this wave · seed · flip `attendance_uat_ready` |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · **`C-SLICE-≠-MODULE`** · DENY module ATT UAT / Phase1 |
| **BE** | **HOLD** until parallel BA-01 CONFIRMED — DATA alone ≠ unlock BE |
| **Closes** | Physical DOC-DELTA for **AC-PLT-ATT-CODE-01*** · **R-PLT-DATA-04** ATT attendance-code slice |
| SoT file | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01.md) |
| **Do not** | Migrations execute / `apps/**` / seed this seat |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DOCS-01` (2026-08-08) — **CONFIRMED** (client pointer)

| Change | Detail |
|--------|--------|
| **POINTER** | Client **API_DESIGN** ADD F-ATT-CAT-CODE-01..04 · F-ATT-CAT-CODE-EFF-01 · F-ATT-CODE-CNS-01/02 — Nest `att_attendance_code` = day-code SoT · admin CREATE N+1 ≠ consumer invent · **`HRM-ATT-CODE-KEY`** · display `status_label`/`symbol` · DROP closed `@IsIn(4)` ceiling cite |
| **KEEP** | Physical §4.4d / §4.5a **DATA-01 CONFIRMED** — **no** column/key rewrite this seat · §4.4 leave · §4.4c worksite · sheet/sign · `work_shifts` · aggregate counting **code** GĐ1 · EMP/SI/CTR seals |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · no Phase1 DONE · `C-SLICE-≠-MODULE` · DENY module ATT UAT · DENY fold leave/worksite/shifts · DENY aggregate rewrite |
| **FORBIDDEN** | Physical DDL change this seat · flip attendance/payroll ready · invent module ATT UAT · reopen leave/WS/EMP/SI/CTR · invent FE R-PLT-ATT-CODE-FE-01 · seed |
| **Closes** | Client DOC-DELTA API/SRS/HDSD admin≠consumer (physical already DATA-01) |
| SoT API | [`API_DESIGN_HRM_ENTERPRISE.md`](./API_DESIGN_HRM_ENTERPRISE.md) F-ATT-CAT-CODE-* · F-ATT-CODE-CNS-* |
| SoT SRS | [`SRS_HRM_ENTERPRISE.md`](./SRS_HRM_ENTERPRISE.md) FR-UC-BP-PLT-01 / ATT-10 v0.35 |
| SoT HDSD | [`HDSD_XEVN_CH05c_HRM_DANH_MUC_KY_HIEU_CONG.md`](../hdsd/hrm/HDSD_XEVN_CH05c_HRM_DANH_MUC_KY_HIEU_CONG.md) |

### DOC-DELTA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-DOCS-01` (2026-08-08) — **CONFIRMED** (client pointer)

| Change | Detail |
|--------|--------|
| **POINTER** | Client **API_DESIGN** ADD F-ATT-CAT-SHIFT-01/02 · F-ATT-CAT-SHIFT-EFF-01 · F-ATT-SHIFT-CNS-01 — Nest `work_shifts` = ca SoT · Settings/`shifts` REF only · admin CREATE N+1 ≠ consumer invent · **`HRM-ATT-SHIFT-KEY`** · soft-retire `status=inactive` · list default active |
| **KEEP** | Physical `work_shifts` LIVE (ADR D1) — **no** second shifts table · ba-data **HOLD** · §4.4 leave · §4.4c worksite · §4.4d day-code · sheet/sign · aggregate counting **code** GĐ1 · EMP/SI/CTR seals |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · no Phase1 DONE · `C-SLICE-≠-MODULE` · DENY module ATT UAT · DENY fold leave/worksite/code · DENY invent FE ATT-CODE HOLD · FE CNS-02 Condition **OPEN** (note only) |
| **FORBIDDEN** | Physical DDL change this seat · flip attendance/payroll ready · invent module ATT UAT · reopen ATT-CODE L1 / leave / worksite · invent FE product closed · seed |
| **Closes** | Client DOC-DELTA API/SRS/HDSD admin≠consumer (physical already LIVE) |
| SoT API | [`API_DESIGN_HRM_ENTERPRISE.md`](./API_DESIGN_HRM_ENTERPRISE.md) F-ATT-CAT-SHIFT-* · F-ATT-SHIFT-CNS-01 |
| SoT SRS | [`SRS_HRM_ENTERPRISE.md`](./SRS_HRM_ENTERPRISE.md) FR-UC-BP-PLT-01 / ATT-01 v0.36 |
| SoT HDSD | [`HDSD_XEVN_CH05d_HRM_DANH_MUC_CA_LAM_VIEC.md`](../hdsd/hrm/HDSD_XEVN_CH05d_HRM_DANH_MUC_CA_LAM_VIEC.md) |

### DOC-DELTA `PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01` (2026-08-09) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **EXPAND §2.2** | Logical `rec_headcount_plan` / `_cell` = **alias** → physical **UPGRADE** `recruitment_plans` + dept/pos + `months_data` cell projection (`cell_id` · `headcount_need_hire` · O1 `dx→need_hire` / `ns→current`) |
| **EXPAND §2.3** | YCTD AS-IS `job_requisitions` **ADD** `headcount_cell_id` · `headcount_mode` · `target_month` + partial **UQ spawn** `(company_id, headcount_cell_id)` WHERE `in_plan` |
| **LOCK** | Option A · **FORBIDDEN** CREATE dual physical `rec_headcount_*` · REC-03 OUT · `headcount_proposals` ≠ FR-01 SoT |
| must_keep | XBOS WF · YCTD/JD soft FK · UF-HRM-12 · J-HRM-05 · soft-delete · U65 |
| Honesty | `recruitment_uat_ready=false` · C-SLICE · no Phase1 DONE |
| SoT file | [`docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md) |
| **Do not** | Migrations execute / `apps/**` / seed this seat |
| Next | **`PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01`** (sa) F.1 physical paths |


### DOC-DELTA `PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01` (2026-08-09) — **CONFIRMED**

| Change | Detail |
|--------|--------|
| **EXPAND §2.3** | YCTD AS-IS `job_requisitions` **ADD** `hire_reason` · `replace_employee_id` · `out_of_plan_reason` · `approval_matrix_key` · `pipeline_flags_json` · CHK status + `open_for_hire` · O2 409 · O4 NULL-mode classify |
| **RETAIN** | REC-01 `headcount_mode` / `headcount_cell_id` / `target_month` / `uq_job_requisitions_spawn_cell` · JD soft FK · XBOS `hrm_requisition_approval` |
| **LOCK** | Option A · **FORBIDDEN** CREATE dual physical `rec_recruitment_request` · Nest `/rec/...` dual · REC-03 Campaign SoT · silent vượt ô · auto backfill NULL→`in_plan` |
| must_keep | Soft-delete only · UF-HRM-12 · J-HRM-JD-YCTD-01 · J-REC-WF-* · cell soft resolve · U65 |
| Honesty | `recruitment_uat_ready=false` · C-SLICE · no Phase1 DONE |
| SoT file | [`docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md) |
| **Do not** | Migrations execute / `apps/**` / seed this seat |
| Next | **`PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01`** (sa) F.1 physical paths |

*End of DB_DESIGN_HRM_ENTERPRISE.md (logical draft v0.3.0).*

