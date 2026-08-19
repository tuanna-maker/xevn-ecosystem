# ADR: HRM Payroll — Multi pay_sheet_template & Thiết lập lương (AMIS Step 1–3)

| Field | Value |
|-------|--------|
| **ADR-ID** | ADR-HRM-PAY-MULTI-TEMPLATE-01 |
| **work_item_id** | `PO-HRM-PAY-CNTT-SA-01` |
| **Status** | **CONFIRMED** — ADD-only governance · cites AMIS parity SA-01 (2026-08-07) |
| **Date** | 2026-08-11 |
| **Decision owner** | SA |
| **Parent** | `PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01` · `PO_HRM_AMIS_PARITY_RESEARCH_01` |
| **Related** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md`](./ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option **B** · [`ADR-HRM-4-PILLAR-API-BOUNDARY.md`](../client-delivery/hrm-enterprise-blueprint/ADR-HRM-4-PILLAR-API-BOUNDARY.md) §10 Option **A** · `PO-HRM-AMIS-PARITY-PAY-TPL-API-01` · `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01` |
| **Honesty** | `payroll_e2e_ready=false` · formula **evaluator HOLD** until `expression_json` inner schema physical CONFIRMED · no Phase1 DONE |
| **Evidence** | `docs/qa/evidence/po-hrm-pay-cntt-sa-01.md` |

---

## 1. Decision context

- **Title:** Architecture for **Thiết lập lương** — multiple pay sheet templates, open component catalog, per-template formula override, and input-pack profiles per business line — without hardcoding tenant models in Nest.
- **Requestor:** PM / sponsor pack **Gửi P.CNTT** (XeVN customer payroll reality ≠ single template).
- **Trigger:** Customer operates **6+ payroll models** (ĐPHH, TĐHK, lương thời gian, LX tuyến, LX tải, VP tỉnh + chung) while AMIS parity research already locked template + SRC layers — CNTT intake requires explicit **setup module** binding policy + template + inputs.
- **Failure if unresolved:** Hardcode six models in code; conflate enroll `salary_templates` with AMIS mẫu; inline formula on template bypassing dual-control; claim UAT from Settings CRUD without engine.

---

## 2. Problem to solve

### 2.1 Reconciliation — AMIS spine vs XeVN vs customer reality

| AMIS Tiền lương step | AMIS behavior (public help) | XeVN today (2026-08-11) | Customer CNTT (6 models) | Target GĐ1 |
|----------------------|----------------------------|-------------------------|--------------------------|------------|
| **1 Thiết lập** | Thuế/BH/tham số · lịch sử lương · policy | Partial Settings (tax/SI params) | QĐ 2A · QĐ 127A · KPI/PC PDF per BP | **ADD** `pay_policy_pack` bind + cite existing SI/tax CFG |
| **2 Thành phần lương** | CRUD khoản + công thức catalog | `salary_components` LIVE admin; formula registry paper/BE partial | Distinct columns per Excel mẫu | Open catalog + `default_formula_definition_id` |
| **3 Mẫu bảng lương** | Components · column order · **override formula per mẫu/OU** | `pay_sheet_templates` + lines **LIVE** (Settings tab); period bind partial QA residual | 6+ Excel templates (ĐPHH, TĐHK, …) | Multi-template + `applicability_scope` + OV-C FK |
| **4 Dữ liệu tính lương** | Bảng công + thu nhập khác + tạm ứng | ATT closed gate OK; `pay_period_input_lines` APIs CONFIRMED | KPI · DT · CPSC · điểm CLDV · XDTN | **ADD** `pay_input_pack_profile` per business line |
| **5 Lập bảng** | Tạo bảng theo mẫu · auto tính | Period + template snapshot; **process → 0₫** (eval HOLD) | Customer `done.xlsx` outputs | Template snapshot + SRC resolver + engine when schema LIVE |
| **6 Gửi phiếu / 7 Chi trả** | ESS · payment batch | Partial | Out of GĐ1 CNTT scope | GĐ1.5+ |

**XeVN preserves (must_keep):** scope ladder · ATT-412 closed sheet · enroll `salary_templates` ≠ mẫu · dual-control Option A · no FE net · SRC BR-AMIS-PAY-SRC-01..05 · soft-delete.

### 2.2 Constraints

| Invariant | Rule |
|-----------|------|
| Platform Option B | Catalog + FormSchema consumer — no closed enum of template/component codes |
| Q-PAY-FORMULA Option A | All executable expressions in `pay_formula_definitions`; template override = **FK only** (Storage Option B — SA AMIS-01 §4) |
| R-PAY-DD-01 | GĐ1 form author · GĐ2 DnD — **cấm** GĐ1 DnD AC |
| Q-PAY-F-3 | Hour/OT/leave vars **only** closed timesheet |
| U19 scope parity | list ↔ get ↔ mutate same resolver on all new PAY setup APIs |
| U65 | Browser UF for setup mutate — zero seed |
| Customer models | **Metadata** (`code` open string) — **FORBIDDEN** `CHECK (code IN ('DPHH',…))` or Nest switch on 6 slugs |

### 2.3 Non-goals

- Hardcode six XeVN business lines in `apps/**`.
- Clone AMIS UI/brand/AI AVA.
- Ship formula **evaluator** or claim `payroll_e2e_ready=true` in this ADR seat.
- Replace enroll `salary_templates` pack (hire default components).
- Full tax/BHXH app parity with AMIS Kế toán.

---

## 3. Options — Thiết lập lương composition

### Option A — Single template + Nest switches per business line

- **Description:** One `pay_sheet_template`; business rules in Nest `if (businessLine === 'LX')`.
- **Verdict:** **Reject** — violates sponsor customer-ready + Platform open catalog; unmaintainable for P.CNTT pack.

### Option B — Multi-template + catalog + FK override + input profile (RECOMMEND)

- **Description:** Logical module **Thiết lập lương** composes existing + ADD entities:

```text
┌─────────────────────────────────────────────────────────────────┐
│ Thiết lập lương (Settings / PAY setup — logical module)         │
├─────────────────────────────────────────────────────────────────┤
│ L1 Catalog      salary_components · pay_types (Platform PAY)    │
│ L2 Formula      pay_formula_definitions (dual-control) [eval HOLD]│
│ L3 Mẫu          pay_sheet_templates + pay_sheet_template_lines    │
│                 └─ override_formula_definition_id (OV-C)        │
│ L4 Policy pack  pay_policy_pack (ADD) — refs QĐ/rate/KPI policy │
│ L5 Input profile pay_input_pack_profile (ADD) — allowed source_ │
│                 kinds + component bindings per business line      │
│ L6 Applicability template.policy_pack_id? · scope · ou_id ·      │
│                 business_line_tag (open string)                   │
└─────────────────────────────────────────────────────────────────┘
         │ period create snapshots template + profile version
         ▼
   payroll_periods · pay_period_input_lines · F-PAY-PROCESS-01
```

- **Benefits:** Matches AMIS Step 1–4; maps 6 customer models without code fork; reuses LIVE TPL BE/FE; extends SRC tier 2 with profile validation.
- **Costs:** Two ADD tables + F.1 APIs + BA column map from Excel; governance before Dev wave.
- **Risks:** Overlap Settings tabs — mitigate with single «Thiết lập lương» hub linking sub-panels (FE routing only).

### Option C — EAV mega-table for all setup

- **Description:** One `pay_setup_config` jsonb per company.
- **Verdict:** **Reject** — weak audit, breaks dual-control formula registry, conflicts with physical TPL tables already LIVE.

---

## 4. Selected: Option B — layer detail

### 4.1 `pay_sheet_template` (existing — deepen applicability)

| Field / behavior | Rule |
|------------------|------|
| Multiplicity | **Unlimited** active templates per `company_id` — customer needs ≥6 |
| `code` | Open tenant-defined (`CNTT_DPHH`, `LX_TUYEN_T06`, …) — starter rows optional |
| `applicability_scope` | `company` \| `ou` \| `position` \| `employee` (existing) |
| **ADD** `business_line_tag` | Optional open string linking OU/policy (not FK to closed enum) |
| **ADD** `policy_pack_id` | Nullable FK → `pay_policy_pack` |
| **ADD** `input_pack_profile_id` | Nullable FK → `pay_input_pack_profile` |
| Lines | `component_code` · `sort_order` · `display_label_vi` · `formula_override_definition_id` |
| Period bind | Immutable `sheet_template_snapshot_json` after process start |

### 4.2 `pay_policy_pack` (ADD)

| Purpose | Store metadata + attachment refs for chính sách/quy định (PDF/QĐ) and scalar policy params not expressible as formula alone |
| Key columns | `company_id`, `code`, `name_vi`, `status`, `effective_from`, `effective_to`, `policy_doc_refs_json` (URLs/paths), `rate_params_json` (opaque validated keys e.g. KPI thresholds), `archived_at` |
| AMIS mapping | Step **1 Thiết lập** — complements existing `pay_insurance_rate_cfg` / tax settings |
| Process role | **GĐ1:** reference + manual input validation hints; **GĐ2:** selective auto-bind to formula vars |

### 4.3 `pay_input_pack_profile` (ADD)

| Purpose | Define which **period input** shapes a business line expects (AMIS Step 4) |
| Key columns | `company_id`, `code`, `name_vi`, `status`, `allowed_source_kinds_json` (open: `kpi`, `revenue`, `cpsc`, `advance`, `other_income`, …), `required_component_codes_json`, `column_hints_json` (BA map from customer Excel), `archived_at` |
| Runtime | Period inherits profile from template snapshot; `pay_period_input_lines.source_kind` validated against profile |
| ≠ | `pay_period_timesheet_bind` (ATT header) · `att_timesheet_line` (hours bag) |

### 4.4 Formula override per template (unchanged lock)

- **SoT:** `pay_formula_definitions` only.
- Template line: `formula_override_definition_id` → **published** version.
- Author scoped code pattern: `TPL:{template_code}:{component_code}`.
- **Evaluator:** **HOLD** — see §6 honesty.

### 4.5 SRC priority (unchanged)

```text
1 Emp salary-history / C&B fixed
2 Period input pack (validated by input_pack_profile)
3 Template OV-C published formula
4 Catalog default published formula
ELSE HRM-PAY-FORMULA-412
```

Hour/OT/leave vars: SRC-01 closed sheet only.

---

## 5. Customer CNTT — six-model mapping (metadata, not code)

| # | Customer model | Suggested template `code` | Policy pack | Input profile highlights |
|---|----------------|---------------------------|-------------|--------------------------|
| 0 | Chung (QĐ 2A · 127A) | `CNTT_COMMON` | `POL_QD_2A_127A` | Shared rate tables |
| 1 | Điều phối hàng hóa | `CNTT_DPHH` | `POL_DPHH_*` (7 PDF) | DLL CPN · logistics KPI |
| 2 | Tổng đài HK | `CNTT_TDHK` | `POL_KPI_1500_1731` | KPI/BCC/PCCV |
| 3 | Lương thời gian | `CNTT_TIME_VP_HN` | — | Standard time + ATT |
| 4 | Lái xe tuyến | `CNTT_LX_ROUTE` | `POL_LX_TINH_*` | BCC · CPSC · điểm CLDV |
| 5 | Lái xe tải | `CNTT_LX_TRUCK` | `POL_LXT` | DT · tạm ứng · XDTN |
| 6 | Văn phòng tỉnh | `CNTT_PROV_OFFICE` | `POL_VP_TINH_*` | Chi phí VP · trợ lương |

**Rule:** Table is **onboarding seed suggestion** for BA-data import wave — **not** closed enum. HR may add model 7+ without release.

---

## 6. Honesty — formula engine HOLD

| Layer | Status | Gate to lift HOLD |
|-------|--------|-------------------|
| `pay_formula_definitions` CRUD / publish | Paper CONFIRMED + partial BE | API-01 CONFIRMED ✓ |
| `expression_json` **inner schema** (form AST) | **NOT CONFIRMED physical** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-01` depth sign-off |
| Evaluator on `F-PAY-PROCESS-01` | **HOLD** | DATA inner schema + jest golden + U65 process ≠ 0₫ |
| Template OV-C bind | LIVE CRUD | Process using override = **BLOCKED** until evaluator LIVE |
| Thiết lập lương UI | Partial (components · mẫu · formula form) | Hub UX after policy/profile F.1 |

**Explicit:** Multi-template architecture **unlocks BA/API/DB design** for setup — it does **not** unlock payroll UAT or evaluator implementation.

---

## 7. Implementation & validation plan

| Phase | Deliverable | Owner |
|-------|-------------|-------|
| G0 | This ADR + `PO-HRM-PAY-CNTT-SA-01.md` spec | sa ✓ |
| G1 | BA-process matrix 6 models × AC; BA-data Excel column → entity map | ba-process · ba-data |
| G1 | DB_DESIGN ADD `pay_policy_pack` · `pay_input_pack_profile` + template FKs | ba-data |
| G1 | API_DESIGN APPEND F-PAY-SETUP-* (see spec unlock list) | sa |
| G2 | ensureSchema + CRUD (after F.1 CONFIRMED) | dev-be |
| G2 | Settings «Thiết lập lương» hub FE | dev-fe |
| G3 | Formula evaluator + PROCESS SRC (serial after DATA schema) | dev-be |
| G4 | QA U65: setup → template → period → input → process | qa → qc |

**Rollback:** New tables nullable FKs — templates without policy/profile remain valid (company-wide defaults).

**Success criteria (architecture):** Sponsor can describe each CNTT model as `(policy_pack?, template, input_profile)` tuple without Nest fork; QC agrees API_DESIGN APPEND complete; `payroll_e2e_ready` stays false until G4.

---

## 8. Decision summary

| # | Decision |
|---|----------|
| D1 | **Thiết lập lương** = logical module L1–L6 (Option B) — **not** a second payroll engine |
| D2 | Multi `pay_sheet_template` is **required** for CNTT + AMIS parity — unlimited per company |
| D3 | Formula override per template = **FK** to published `pay_formula_definitions` only |
| D4 | **ADD** `pay_policy_pack` + `pay_input_pack_profile` — bind via template FK + snapshot at period |
| D5 | Customer 6 models = **open catalog codes** + BA import — **cấm** Nest hardcode |
| D6 | Formula evaluator remains **HOLD** until physical `expression_json` schema CONFIRMED |
| D7 | Cite Platform ADR B + Q-PAY-FORMULA A — **no rewrite** of locked ADRs |
