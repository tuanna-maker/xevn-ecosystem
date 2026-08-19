# PO-HRM-PAY-CNTT-FE-STP-01-TECHSPEC-01 — Technical Specification · Thiết lập lương L1–L6 (CNTT FE-STP-01)

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-PAY-CNTT-FE-STP-01-TECHSPEC-01` |
| **parent** | `PO-HRM-PAY-CNTT-FE-STP-01-SRS-01` |
| **lane** | ba-docs / sa |
| **change_mode** | **ADD-only** — slice-specific architecture CHO FE-STP-01; **không** rewrite TECH_SPEC_NEW.md chung |
| **date** | 2026-08-12 |
| **ack_status** | DRAFT |
| **honesty** | `payroll_e2e_ready=false` · formula evaluator **HOLD** · schema PAPER until ensureSchema; này là PAPER TechSpec |

---

## 0. read_first ack

| # | Artifact | Dùng gì |
|---|----------|---------|
| 1 | `PO-HRM-PAY-CNTT-FE-STP-01-SRS-01.md` | UC-BP-PAY-STP-01..12 slice-specific |
| 2 | `docs/hrm/DB_DESIGN_HRM_PAYROLL.md` §8.2–8.7 | `pay_policy_pack` · `pay_input_pack_profile` · template FK · `pay_sheet_template_lines` fragment bind |
| 3 | `PO-HRM-PAY-CNTT-API-01.md` | F-PAY-POLICY-PACK-* · F-PAY-INPUT-PROFILE-* · F-PAY-SHEET-TPL-* · F-PAY-SETUP-RESOLVE-01 CONFIRMED |
| 4 | `PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01.md` | `applicability_scope=province` · `applicability_province_code` · resolveForEmployee · two-layer resolver |
| 5 | `PO-HRM-PAY-SRC-PRIORITY-SPEC-01.md` | 63 fragment → SRC tier map; SRC-03A/B distinction |
| 6 | `PO-HRM-PAY-INPUT-PACKS-SPEC-01.md` | 12 input pack type · `allowed_source_kinds_json` taxonomy · profile codes |
| 7 | `docs/hrm/DB_DESIGN_HRM_ERP_E2.md` | `salary_components` · `pay_types` (L1 catalog — LIVE) |
| 8 | `docs/brand-new-documents-20270801/TECH_SPEC_NEW.md` | Runtime (Node/Nest/TS) · Catalog cache §3.2 · Error envelope · Pagination |
| 9 | `PO-HRM-PAY-CNTT-SA-01.md` §2 | 6-model capability map · L1–L6 layer architecture |

---

## 1. Runtime & process model (ADD to TECH_SPEC_NEW.md §1)

Slice FE-STP-01 runs on **existing** hrm-api runtime (Node.js 20+, NestJS, PostgreSQL 16+, Prisma). **No new Nest module** — adds tables+services inside existing `PayrollModule`.

| Layer | Entity / API family | Slice adds |
|-------|---------------------|-----------|
| **L1** | `salary_components` · F-PLT-PAY-COMP-* | LIVE — slice FE ui binds |
| **L2** | `pay_formula_definitions` · F-PAY-FORMULA-* | HOLD eval — slice ref-only |
| **L3** | `pay_sheet_templates` · F-PAY-SHEET-TPL-* | EXPAND FK: `policy_pack_id` · `input_pack_profile_id` · `business_line_tag` |
| **L4** | `pay_policy_pack` · F-PAY-POLICY-PACK-* | **NEW table** — ADD |
| **L5** | `pay_input_pack_profile` · F-PAY-INPUT-PROFILE-* | **NEW table** — ADD |
| **L6** | Applicability | `applicability_scope=province` · `applicability_province_code` · resolveForEmployee helper |

**Architecture rationale:** Co-locate with `PayrollService` (existing) — avoid new microservice for Thiết lập slice. Catalog cache (Redis) covers `salary_components` + fragment catalog read-model (TECH_SPEC_NEW §3.2 — key pattern `catalog:{tenantId}:v{version}`).

---

## 2. Data model (slice-specific — ADD PAPER)

### 2.1 Table `public.pay_policy_pack` (L4 — ADD)

cite `docs/hrm/DB_DESIGN_HRM_PAYROLL.md` §8.1

| Column | Type | Null | Meaning (VI) | Constraint |
|--------|------|------|--------------|------------|
| `id` | UUID PK | NO | Khóa gói chính sách | |
| **`company_id`** | **TEXT NOT NULL** | NO | Pháp nhân slug Plane B | SCOPE |
| `code` | TEXT NOT NULL | NO | Mã gói (`POL_DPHH_2025`) | UQ partial WHERE archived IS NULL |
| `name_vi` | TEXT NOT NULL | NO | Tên hiển thị | |
| `status` | TEXT NOT NULL DEFAULT `'draft'` | NO | `draft`/`active`/`retired` | |
| `scope` | TEXT NOT NULL | NO | `CHUNG`/`RIENG` | CHK scope ∈ set |
| `business_line_tag` | TEXT | YES | `DPHH`/`TDHK`/`LX_ROUTE` … open | IX (company_id, status) |
| `effective_from` | DATE NOT NULL | NO | Hiệu lực từ | |
| `effective_to` | DATE | YES | Hiệu lực đến | CHK ≥ effective_from |
| `policy_doc_refs_json` | JSONB | YES | `{doc_id, path, fragment_ids[]}` | — validate fragment_ids[] ⊆ catalog |
| `rate_params_json` | JSONB | YES | KPI ngưỡng · đơn giá · % DT | validate finite numbers only |
| `archived_at` | TIMESTAMPTZ | YES | Soft-delete | |
| `created_by`/`updated_by` | TEXT | YES | Audit | |
| `created_at`/`updated_at` | TIMESTAMPTZ NOT NULL | NO | Audit | |

**Index:** `(company_id, status)` · `(company_id, business_line_tag)` · `(company_id, effective_from DESC)`

**Validation (app-level):**
- Duplicate active `(company_id, lower(code))` → `HRM-PAY-POL-409-CODE`
- `effective_to < effective_from` → `HRM-PAY-POL-400-DATE`
- `policy_doc_refs_json[].fragment_ids[]` ⊆ catalog fragment export → `HRM-PAY-FRG-404`
- `scope=CHUNG` + `business_line_tag` optional; `scope=RIENG` → recommended tag

### 2.2 Table `public.pay_input_pack_profile` (L5 — ADD)

cite `DB_DESIGN_HRM_PAYROLL.md` §8.2

| Column | Type | Null | Meaning | Constraint |
|--------|------|------|---------|------------|
| `id` | UUID PK | NO | Khóa profile | |
| **`company_id`** | **TEXT NOT NULL** | NO | Pháp nhân slug | SCOPE |
| `code` | TEXT NOT NULL | NO | `INP_DPHH_DLL` … | UQ partial |
| `name_vi` | TEXT NOT NULL | NO | Tên profile | |
| `status` | TEXT NOT NULL DEFAULT `'draft'` | NO | `draft`/`active`/`retired` | |
| `allowed_source_kinds_json` | JSONB NOT NULL | NO | Allowed `source_kind` set | open string array — **CẤM** `CHECK (...)` |
| `required_component_codes_json` | JSONB | YES | Required component codes | each ∈ active `salary_components` |
| `column_hints_json` | JSONB | YES | `input_pack_type → component_code[]` | |
| `archived_at` | TIMESTAMPTZ | YES | Soft-delete | |
| `created_by`/`updated_by` | TEXT | YES | Audit | |
| `created_at`/`updated_at` | TIMESTAMPTZ NOT NULL | NO | Audit | |

**Starter profile codes (suggestion — not DB enum):**

| Code | Models | `allowed_source_kinds_json` (summary) |
|------|--------|--------------------------------------|
| `INP_DPHH_DLL` | ĐPHH | `manual`, `dll_cpn`, `other_income`, `rd_transfer`, `revenue`, `kpi`, `advance` |
| `INP_TDHK_KPI` | TĐHK | `kpi`, `manual`, `other_income`, `rd_transfer`, `cldv`, `advance` |
| `INP_TG_BCC` | TG | `manual`, `other_income`, `rd_transfer` (hours via ATT bind) |
| `INP_LXT_ROUTE` | LX-T | `cpsc`, `cldv`, `manual`, `other_income`, `rd_transfer`, **`route_count`** (ADD), `dll_cpn`, `revenue`, `advance` |
| `INP_LXT_TRUCK` | LX-TR | `revenue`, `advance`, `xdtn`, `manual`, `other_income`, `rd_transfer`, `kpi` |
| `INP_VP_PROV` | VP-T | `vp_cost`, `vp_allowance`, `manual`, `other_income`, `rd_transfer`, `advance` |

**APPEND action for `route_count`:** Data operation via `PATCH /pay-input-pack-profiles/:id` (no DDL change).

### 2.3 Table `public.pay_sheet_templates` EXPAND (nullable FKs)

cite `DB_DESIGN_HRM_PAYROLL.md` §8.3

| ADD column | Type | Null | FK / rule |
|------------|------|------|-----------|
| `business_line_tag` | TEXT | YES | Open string — links OU/BP applicability |
| `policy_pack_id` | UUID | YES | Soft FK → `pay_policy_pack.id`; same `company_id` |
| `input_pack_profile_id` | UUID | YES | Soft FK → `pay_input_pack_profile.id`; same `company_id` |

**Rollback-safe:** Nullable FKs — templates without pack/profile remain valid.

### 2.4 Table `public.pay_sheet_template_lines` EXPAND (fragment bind)

cite `DB_DESIGN_HRM_PAYROLL.md` §8.7

| ADD column | Type | Null | Meaning | Constraint |
|------------|------|------|---------|------------|
| `fragment_id` | TEXT | YES | Mã fragment catalog `FRG-*` — traceability QĐ/PDF | CHK: when NOT NULL → `fragment_bind_mode` ∈ allowed |
| `fragment_bind_mode` | TEXT | YES | `CHUNG_ONLY`/`RIENG_OVERRIDE`/`STATUTORY`/`IDENTITY`/`INPUT_PACK`/`DEDUCTION_GAP` | CHK: when NOT NULL → `fragment_bind_mode` ∈ allowed; CHK: `fragment_id IS NOT NULL` ⇒ `fragment_bind_mode` IN (`CHUNG_ONLY`,`RIENG_OVERRIDE`) |

**Fragment resolver contract (ADR-FRAGMENT-BIND-01 §5 — two-layer resolver):**

1. **Resolver mẫu** (TPL-SPEC-01 §3): `resolveForEmployee(employee, period)` → selects `pay_sheet_template` by `(company_id, business_line_tag, applicability_province_code, employee.province_code)`. Ranking: employee > position > **province** (NEW tier) > ou > company.
2. **Resolver fragment** (ADR-FRAGMENT-BIND-01 §5 — **không thay đổi** spec này): within selected template, for each line `fragment_id IS NOT NULL`, resolve `resolved_fragment_id` via `effective_from` chain at `pay_period_end_date`.

**CHỐI CHỒNG lấp (admission):** Spec này chỉ bổ Layer 1 (mẫu theo tỉnh); Layer 2 fragment `effective_from` giữ nguyên ADR-FRAGMENT-BIND-01 — không đổi.

### 2.5 Period snapshot (`payroll_periods`) EXPAND

| JSON path | Location | Content |
|-----------|----------|---------|
| `sheet_template_snapshot_json.setupContext` | jsonb sibling | `{ policyPackId, policyPackCode, policyPackVersionAt, policyPackRateParams, inputPackProfileId, inputPackProfileCode, inputPackProfileVersionAt, allowedSourceKinds[], requiredComponentCodes[] }` |
| `sheet_template_snapshot_json` (dual-template bind) | jsonb | `primaryTemplateId`, `secondaryTemplates[]`, `mergeRule`, `siBaseSource`, `lines[].resolved_fragment_id`, `lines[].resolver_trace_json` |

---

## 3. Catalog read-model (L1 + fragment)

### 3.1 salary_components (L1 — LIVE)

Source of truth for component picker. cite `DB_DESIGN_HRM_ERP_E2.md`.

| Column | Type | Meaning |
|--------|------|---------|
| `id` | UUID PK | Component PK |
| `company_id` | TEXT NOT NULL | Pháp nhân |
| `code` | TEXT NOT NULL | Component code (open catalog — `PC_CPSC`, `PC_KPI_TDHK`, …) |
| `name_vi` | TEXT NOT NULL | Display name |
| `category` | TEXT | `PHU_CAP`/`THUONG`/`KHOAN`/`HE_SO`/`KHAC` |
| `p_level` | TEXT | `P1`/`P2`/`P3`/`P4` |
| `default_formula_definition_id` | UUID | Tier-4 default (L2 — HOLD eval) |
| `archived_at` | TIMESTAMPTZ | Soft-delete |

**UQ:** `(company_id, lower(code))` WHERE `archived_at IS NULL`

### 3.2 Fragment catalog export (read-model — P0 seed)

Static JSON read model (seeded at deploy / `ensureSchema` + operator update flow GĐ2).

```json
[
  {
    "fragment_id": "FRG-DPHH-DT-HG-02",
    "fragment_name_vi": "Lương DT hàng gửi bậc 02 (từ 01/10/2024)",
    "scope": "RIENG",
    "business_line_tag": "DPHH",
    "inputs_required": ["revenue"],
    "fragment_type": "formula",
    "system_home": "pay_sheet_template_lines"
  }
]
```

**63 fragment total** (CHUNG 4 · ĐPHH 7 · TĐHK 7 · TG 4 · LX-T 24 · LX-TR 7 · VP-T 13 · GAP-FRG 18 — HOLD items).

---

## 4. Fragment bind resolver logic (FE display contract)

### 4.1 Two-layer resolver (SA-01 §2.4 — preserve)

**Layer 1 — Template resolver** (`resolveForEmployee` — TPL-SPEC-01 §3):

```text
Rank active non-archived templates by:
  1. applicability_scope=employee + employee_id match (most specific)
  2. applicability_scope=position + position_key match
  3. applicability_scope=province + business_line_tag match AND applicability_province_code == employee.province_code  ← NEW TIER
  4. applicability_scope=ou + ou_id match
  5. applicability_scope=company (default BP)
Tie-break: is_default=true → updated_at DESC
Output: matchStatus ∈ {MATCHED, NO_PROVINCE_MATCH, AMBIGUOUS, NO_CANDIDATE}
```

**Layer 2 — Fragment effective_from resolver** (ADR-FRAGMENT-BIND-01 §5 — **unchanged**):

Within selected template, for each `fragment_id IS NOT NULL`:
- Load candidate chain for same `component_code` ordered by `effective_from DESC`
- Pick first where `effective_from <= pay_period_end_date`
- If none → `resolved_fragment_id = null` + `resolverStatus: HRM-PAY-FRG-412`

### 4.2 Fragment bind modes (FE write contract)

| Mode | Meaning | When to use | BE validate |
|------|---------|-------------|-------------|
| `CHUNG_ONLY` | Fragment applies to CHUNG (tập đoàn) base formula | CHUNG scope pack; no override | OK if pack scope=CHUNG |
| `RIENG_OVERRIDE` | Fragment overrides CHUNG base for this BP/tỉnh | RIENG scope; province template | Reject if pack scope=CHUNG → `HRM-PAY-FRG-409` |
| `STATUTORY` | BHXH/BHYT/BHTN/TNCN — government mandated | No `fragment_id` | FK null |
| `IDENTITY` | CCCD/họ tên mapping | No `fragment_id` | FK null |
| `INPUT_PACK` | Amount from `pay_period_input_lines` | No `fragment_id` | FK null |
| `DEDUCTION_GAP` | GAP-FRG deduction items | No `fragment_id` | FK null |

**CHỐI CHỒNG lấp:** When `fragment_bind_mode ∈ {STATUTORY, IDENTITY, INPUT_PACK, DEDUCTION_GAP}` → `fragment_id MUST be NULL`. BE enforces via CHECK constraint.

### 4.3 Province applicability scope (ADD — TPL-SPEC-01 §2)

| Field | Type | Rule |
|-------|------|------|
| `applicability_scope` | TEXT | Add value `'province'` recommended; existing values `company`/`ou`/`position`/`employee` preserved |
| `applicability_province_code` | TEXT NULL | Open string — **not** `CHECK (IN ('ND','NB',...))`. Required when `applicability_scope=province` |
| `business_line_tag` | TEXT | **Required** alongside `applicability_province_code` — province alone ambiguous (LX-T ND ≠ VP-T ND) |

**Business rules:**
- **BR-TPL-PROV-01:** `applicability_province_code` set w/o `business_line_tag` → reject (`HRM-PAY-TPL-400-PROVINCE-SCOPE`)
- **BR-TPL-PROV-02:** No ≥2 active (non-archived) templates with same `(business_line_tag, applicability_province_code)` → `HRM-PAY-TPL-409-PROVINCE-DUP`
- **BR-TPL-PROV-03:** `employees.custom_fields.work_location` (TEXT free-text) → normalize to `province_code` TODO (ba-data wave). Un-normalized → resolver returns `NO_PROVINCE_MATCH` (no guessing)

---

## 5. Input pack taxonomy (L5 — INPUT-PACKS-SPEC-01 bind)

### 5.1 `source_kind` taxonomy (12 types — open string)

| `source_kind` | VI name | Model(s) | Fragment(s) | SRC tier | Profile code |
|---------------|---------|----------|-------------|----------|--------------|
| `manual` | Nhập tay tự do | All | GAP-FRG deductions/HOLD items | SRC-03A | All |
| `kpi` | Điểm KPI/đơn giá | TĐHK, ĐPHH, LX-TR | `FRG-TDHK-CUOC-01`, `FRG-TDHK-HD-01`, `FRG-DPHH-KPI-01`, `FRG-LXTR-KPI-01` | SRC-03B | `INP_TDHK_KPI` |
| `dll_cpn` | Doanh lượng CPN | ĐPHH, LX-T | `FRG-DPHH-BASE-01` (BIND), `FRG-LXT-CPN-01` | SRC-03B | `INP_DPHH_DLL`, `INP_LXT_ROUTE` |
| `cpsc` | Chi phí sửa chữa chung | LX-T | `FRG-LXT-GT-01`, `FRG-LXT-DT-01` | SRC-03B | `INP_LXT_ROUTE` |
| `cldv` | Điểm chất lượng dịch vụ | LX-T, TĐHK | `FRG-LXT-CLDV-01`, `FRG-TDHK-TOP-01` | SRC-03B | `INP_LXT_ROUTE`, `INP_TDHK_KPI` |
| **`route_count`** *(ADD)* | Số lượt theo bậc/loại xe | LX-T | `FRG-LXT-LUOT-*`, `FRG-LXT-QD439-LUOT` | SRC-03B | `INP_LXT_ROUTE` |
| `revenue` | Doanh thu (DT) | ĐPHH, LX-T, LX-TR | `FRG-DPHH-DT-HG-*`, `FRG-DPHH-DT-HN-*`, `FRG-DPHH-SHIP-*`, `FRG-LXT-DT-01`, `FRG-LXTR-DT-01` | SRC-03B | `INP_DPHH_DLL`, `INP_LXT_ROUTE`, `INP_LXT_TRUCK` |
| `advance` | Tạm ứng lương (LIVE bridge) | All | GAP-FRG #9/#10/#16/#17 | SRC-03A | All |
| `xdtn` | Phụ cấp XDTN/đi đường | LX-TR | `FRG-LXTR-PC-01` | SRC-03B | `INP_LXT_TRUCK` |
| `vp_cost` | Chi phí VP | VP-T | `FRG-VPT-BASE-01` | SRC-03B | `INP_VP_PROV` |
| `vp_allowance` | Trợ lương VP | VP-T | `FRG-VPT-BASE-01` | SRC-03B | `INP_VP_PROV` |
| `other_income` | Thu nhập khác (HOLD) | TG, TĐHK, ĐPHH | GAP-FRG #4/#5/#6 | SRC-03A | All |
| `rd_transfer` | Truy thu/Truy lĩnh | All | GAP-FRG #11 | SRC-03A | All |

**Cấm:** `CHECK (source_kind IN (...))` — open string catalog per BR-DATA-INP-01. Validation at `POST /periods/:id/input-lines` against `allowed_source_kinds_json` snapshot → `HRM-PAY-INP-PROFILE-422`.

### 5.2 SRC tier chain (SRC-PRIORITY-SPEC-01 — preserve)

```text
SRC-01 (ATT closed hours — orthogonal) → SRC-02 (C&B fixed) → SRC-03 (input pack) → SRC-04 (override formula) → SRC-05 (catalog default)
ELSE → HRM-PAY-FORMULA-412

SRC-03 subtypes:
  SRC-03A (direct amount): advance, other_income, rd_transfer → short-circuit to payslip line
  SRC-03B (formula variable): kpi, dll_cpn, cpsc, cldv, route_count, revenue, xdtn, vp_cost, vp_allowance → feed formula eval
```

---

## 6. Applicability scope — province resolver (TPL-SPEC-01 §2)

### 6.1 BusinessLineTag strategy

| Tag | Models | Province applicability | Template count |
|-----|--------|----------------------|----------------|
| `LX_ROUTE` | LX-T | Province-per-template (ND/NB/TB/PT/VT/YB × 1 mỗi tỉnh) | 6 active |
| `DPHH` | ĐPHH | Company-wide (KHÔNG province split) | 1 active |
| `TDHK` | TĐHK | Company-wide | 1 active |
| `PROV_OFFICE` | VP-T | Province-per-template (ND/NB/TB × 1 mỗi tỉnh; PT/VT/YB **chờ PDF**) | 3 active (nay) |
| `TIME_VP_HN` | TG/VP Hà Nội | **Không** province — resolver falls straight to company-wide | 1 active |
| `LX_TRUCK` | LX-TR | Company-wide (KHÔNG province split) | 1 active |

**CHỜ BA-01 BỔ SUNG:** VP-T PT/VT/YB — catalog R3 gap (chỉ 3 PDF QC / 6 tỉnh). `NO_PROVINCE_MATCH` fallback per TPL-SPEC-01 §3.4.

### 6.2 Province resolver cases (TPL-SPEC-01 §3.4 trace)

| Case | `employee.province_code` | Template resolver expected | `matchStatus` |
|------|--------------------------|---------------------------|---------------|
| LX-T Nam Định | `ND` | Template `LX_ROUTE/ND` | `MATCHED` |
| VP-T Vĩnh Phúc (chưa có mẫu VT) | `VT` | Fallback tier 4/5 (OU/company) + warning | `NO_PROVINCE_MATCH` |
| TG VP Hà Nội | *(null hoặc `HN`)* | `TIME_VP_HN` company-wide `VP_HN_THOI_GIAN` — **không** tier province | `MATCHED` (company tier) |

---

## 7. Error taxonomy (ADD slice-specific)

| Code | HTTP | When (VI) | Layer | trace SRS |
|------|------|-----------|-------|-----------|
| `HRM-PAY-POL-409-CODE` | 409 | Duplicate active policy pack code | L4 write | STP-01/02 |
| `HRM-PAY-POL-400-DATE` | 400 | `effective_to` < `effective_from` | L4 write | STP-01/02 |
| `HRM-PAY-INP-PROF-409-CODE` | 409 | Duplicate active input profile code | L5 write | STP-12 |
| `HRM-PAY-INP-PROFILE-422` | 422 | `source_kind` ∉ profile `allowedSourceKinds` snapshot | L5 validate | SETUP-04 |
| `HRM-PAY-SETUP-404-PACK` | 404 | Policy/profile FK archived/out-of-scope | L3/L4 FK | STP-10 |
| `HRM-PAY-TPL-400-PROVINCE-SCOPE` | 400 | `applicability_province_code` w/o `business_line_tag` | L3 write | STP-11 |
| `HRM-PAY-TPL-409-PROVINCE-DUP` | 409 | Dup active template `(business_line_tag, applicability_province_code)` | L3 write | STP-11 |
| `HRM-PAY-TPL-409-IMMUTABLE` | 409 | Mutate setupContext on processed/closed period | L3 write | SETUP-03 |
| `HRM-PAY-TPL-412-TEMPLATE` | 404 | Secondary template not active/out-of-scope (dual-template bind) | L3 write | GAP-CNTT-08/10 |
| `HRM-PAY-FRG-404` | 404 | Fragment `fragment_id` ∉ catalog | L3 line write | STP-08 |
| `HRM-PAY-FRG-409` | 409 | `RIENG_OVERRIDE` + `policy_pack.scope=CHUNG` | L3 line write | STP-02/08 |
| `HRM-PAY-FRG-412` | 412 | No `resolved_fragment_id` effective at `pay_period_end_date` | L6 resolve | STP-03 |
| *(existing)* | — | `HRM-SC-COMP-KEY` · scope 403/409 · `HRM-VAL-400` | Generic | — |

**Error envelope per TECH_SPEC_NEW §7:** All errors → `{code, message, details?, requestId}`.

---

## 8. Observability + pagination (ADD to TECH_SPEC_NEW §7)

Slice inherits:
- **Error envelope:** `{code, message, details?, requestId}` (TECH_SPEC_NEW §7)
- **Pagination:** `page` + `limit` query; `{ total, page, data[] }` response
- **Observability:** OpenTelemetry + Jaeger export; JSON log with `tenantId, membershipId, requestId`

---

## 9. NFR slice-specific (ADD)

| NFR id | Target | Binding |
|--------|--------|---------|
| NFR-03 | Payroll batch 500 emp 30min | Setup list: 100 items < 300ms P95; P99 < 800ms |
| NFR-01 | API < 300ms P95 | Setup pages: list policy + template + input profile each < 300ms |
| NFR-PROV-01 | Province resolver < 50ms | `GET /pay-setup/resolve` with `province_code` param |

---

## 10. Out of scope (slice boundary)

- Formula evaluator (L2) — **HOLD** gĐ1 (gd1_eval_v1 staged — spec chỉ describe input/output, không implement)
- `att_timesheet_line` line-level (SRC-01) — PAPER (ATT-OFFICE lane)
- `PO-HRM-EMP-SALARY-HISTORY-SPEC-01` (SRC-02 fixed C&B) — NOT STARTED (ba-process wave)
- Sales bridge `hrm_sales_data` → `source_kind=revenue` auto-feed — GĐ2
- XLSX import API — GĐ2 (SA-01 §3.4)
- `FRG-CHUNG-TET-01`, `FRG-LXT-ELEC-01` fragment PROPOSE (chờ sponsor PDF)

---

## 11. Handoff

| Field | Value |
|-------|-------|
| **next_owner** | `pm` → `dev-be` (ensureSchema §2.1..2.4) → `dev-fe` (FE-STP-01 screen) |
| **ack_status** | DRAFT — chờ PM/SA review; SA xác nhận `applicability_province_code` schema + two-layer resolver |
| **payroll_e2e_ready** | `false` |
| **spec_ref** | PO-HRM-PAY-CNTT-FE-STP-01-TECHSPEC-01 · PO-HRM-PAY-CNTT-API-01.md · DB_DESIGN_HRM_PAYROLL.md §8 |
