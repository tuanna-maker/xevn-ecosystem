# PO-HRM-PAY-CNTT-SA-01 — Architecture spec · Thiết lập lương · CNTT intake

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-SA-01` |
| **Parent** | `PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01` |
| **lane** | governance · sa |
| **Date** | 2026-08-11 |
| **change_mode** | ADD-only |
| **Status** | **CONFIRMED** |
| **ADR** | [`ADR-HRM-PAY-MULTI-TEMPLATE-01.md`](../../architecture/ADR-HRM-PAY-MULTI-TEMPLATE-01.md) · [`ADR-HRM-PAY-XEVN-CUSTOMER-CNTT-01.md`](../../architecture/ADR-HRM-PAY-XEVN-CUSTOMER-CNTT-01.md) |
| **Honesty** | `payroll_e2e_ready=false` · formula evaluator **HOLD** until `expression_json` physical CONFIRMED |
| **ack_status** | **PASS_TO_PM** |

---

## 0. read_first ack

| # | Artifact | Verdict used |
|---|----------|--------------|
| 1 | `PO_HRM_AMIS_PARITY_RESEARCH_01.md` | AMIS spine 1–7 · Step 3 override · precedence |
| 2 | `PO_HRM_PAYROLL_FORMULA_AND_RUN_GAP_01.md` | Formula/run gap · customer-ready goal |
| 3 | `po-hrm-amis-parity-sa-01.md` | Layer map · Storage Option B · SRC · `pay_sheet_template` ADD |
| 4 | `po-hrm-payroll-formula-run-gap-sa-01.md` | F-PAY-FORMULA unlock checklist · Q-PAY-FORMULA ANSWERED |
| 5 | `PO_HRM_PAY_XEVN_CUSTOMER_CNTT_INTAKE_01.md` | 6 models · 67 files · Thiết lập gap |
| 6 | `PO-HRM-AMIS-PARITY-PAY-TPL-API-01` | F-PAY-SHEET-TPL-* CONFIRMED — cite not reopen |
| 7 | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01` | F-PAY-PERIOD-INPUT-* CONFIRMED — cite not reopen |

---

## 1. Reconciliation matrix — AMIS vs XeVN vs customer 6-model

| Dimension | AMIS (help principle) | XeVN (2026-08-11 evidence) | Customer CNTT | SA stance |
|-----------|----------------------|------------------------------|---------------|-----------|
| **Single vs multi mẫu** | Many templates per OU/position | `pay_sheet_templates` CRUD LIVE; 1 QA template smoke | 6+ Excel mẫu + chung | **Multi required** — ADR D2 |
| **Thành phần** | Open catalog + formula on component | `salary_components` admin LIVE; TEXT `formula` ≠ engine | Distinct columns per mẫu | Catalog + `default_formula_definition_id` |
| **Override on mẫu** | Yes — per column | OV-C FK on `pay_sheet_template_lines` LIVE | Per-model formulas in Excel | FK → published definition only |
| **Policy / QĐ** | Step 1 setup | Tax/SI partial Settings | QĐ 2A/127A + 7–13 PDF/BP | **ADD** `pay_policy_pack` |
| **Input data** | Step 4 packs | `pay_period_input_lines` API CONFIRMED | KPI · DT · CPSC · XDTN | **ADD** `pay_input_pack_profile` |
| **Precedence** | History > kỳ > mẫu > DM | BR-AMIS-PAY-SRC DOC locked; **not implemented** on process | Same order expected | **must_keep** SRC 01..05 |
| **Process** | Auto from mẫu | Period+bind partial; **0₫ stub** | Customer done.xlsx | Evaluator **HOLD** |
| **Enroll pack** | (hire defaults) | `salary_templates` LIVE ≠ mẫu | Not customer Excel | **Alias lock** preserve |

### 1.1 Six-model capability map (customer → metadata)

| Model | Primary outputs | Template layer | Policy layer | Input layer |
|-------|-----------------|----------------|--------------|-------------|
| Chung | Thang lương · lịch PVTHK | `CNTT_COMMON` optional | `POL_QD_2A_127A` | Shared ATT |
| ĐPHH | BP ĐPHH · DLL CPN | `CNTT_DPHH` | 7× policy PDF | CPN / logistics vars |
| TĐHK | TĐHK done · KPI | `CNTT_TDHK` | KPI 1500/1731 | KPI/BCC/PCCV |
| Lương TG | VP Hà Nội time | `CNTT_TIME_VP_HN` | — | Standard hours |
| LX tuyến | LX tuyến T06 | `CNTT_LX_ROUTE` | Per-tỉnh PDF | BCC · CPSC · CLDV |
| LX tải | LXT t5 | `CNTT_LX_TRUCK` | 2× PDF | DT · tạm ứng · XDTN |
| VP tỉnh | 6 tỉnh T05 | `CNTT_PROV_OFFICE` | 3× PDF/tỉnh | Chi phí VP · trợ lương |

**Codes are suggestions** — open catalog per Platform Option B.

---

## 2. Thiết lập lương — recommended architecture

### 2.1 Logical module (not new Nest monolith)

**Menu label (VI):** «Thiết lập lương»  
**Route (proposed):** `/payroll/setup` or Settings aggregate tab — FE decision in dev-fe wave.

| Layer | Entity / API family | Status | CNTT action |
|-------|---------------------|--------|-------------|
| **L1** | `salary_components` · `pay_types` · F-PLT-PAY-COMP-* | LIVE admin | Map customer columns → component codes (BA-data) |
| **L2** | `pay_formula_definitions` · F-PAY-FORMULA-* | F.1 CONFIRMED · eval HOLD | Author per-component + per-template override versions |
| **L3** | `pay_sheet_templates` · F-PAY-SHEET-TPL-* | LIVE BE/FE | One template per customer model (+ chung) |
| **L4** | `pay_policy_pack` · **F-PAY-POLICY-PACK-*** | **ADD** | Attach QĐ/PDF metadata per BP |
| **L5** | `pay_input_pack_profile` · **F-PAY-INPUT-PROFILE-*** | **ADD** | KPI/DT/CPSC allowed kinds per BP |
| **L6** | Applicability | EXPAND template header | `policy_pack_id` · `input_pack_profile_id` · `business_line_tag` |

### 2.2 Multi pay_sheet_template rules

1. Unlimited active templates per `company_id` (soft-delete `archived_at`).
2. Period create **requires** `paySheetTemplateId` for CNTT AC (extend AC-PAY-TPL-03).
3. Snapshot includes: header fields · lines · resolved policy/profile **version ids**.
4. `salary_templates` enroll pack — **forbidden** as mẫu substitute.

### 2.3 Component catalog rules

- Picker SoT = Nest `salary_components` when active > 0 (AC-PLT-PAY-01).
- Customer-specific components = **new rows** (e.g. `PC_CPSC`, `PC_KPI_TDHK`) — not TS enum.
- `default_formula_definition_id` for SRC tier 4.

### 2.4 Formula override per template

- Storage Option B (locked): `pay_sheet_template_lines.formula_override_definition_id` → published only.
- PROCESS: jsonb-only override → `HRM-PAY-FORMULA-412` (existing VAL-PAY-TPL-OV-01).
- Evaluator using override: **BLOCKED** until §4 HOLD lifted.

### 2.5 Input pack per business line

- Profile defines: `allowed_source_kinds_json`, `required_component_codes_json`, optional `column_hints_json` (BA from Excel).
- Period input lines validated on POST against snapshot profile version.
- Orthogonal to ATT closed hours (SRC-01).

---

## 3. API_DESIGN unlock list

### 3.1 REWRITE — **none** (cấm wipe)

| Section | Rule |
|---------|------|
| `API_DESIGN_HRM_ENTERPRISE.md` §4 PAY P1–P6 | **must_keep** meeting-locked rows |
| F-PAY-FORMULA-* CONFIRMED | Cite only — no reopen |
| F-PAY-SHEET-TPL-* CONFIRMED | Cite only — no reopen |
| F-PAY-PERIOD-INPUT-* CONFIRMED | Cite only — no reopen |

### 3.2 APPEND — new F.1 families (after ba-data physical)

| F-id | Mục đích (VI) | SRS hook | Owner |
|------|---------------|----------|-------|
| **F-PAY-POLICY-PACK-LIST-01** | Liệt kê/xem gói chính sách lương theo pháp nhân | FR-UC-BP-PAY-02 Thiết lập · **new UC Thiết lập lương** (BA) | sa → ba-docs delta |
| **F-PAY-POLICY-PACK-UPSERT-01** | Tạo/sửa gói (code, name, doc refs, rate params) | same | sa |
| **F-PAY-POLICY-PACK-ARCHIVE-01** | Soft-delete gói | same | sa |
| **F-PAY-INPUT-PROFILE-LIST-01** | Liệt kê profile nhập liệu kỳ theo BP | FR-UC-BP-PAY-02 · AMIS Step 4 | sa |
| **F-PAY-INPUT-PROFILE-UPSERT-01** | CRUD profile (allowed source kinds, required components) | same | sa |
| **F-PAY-INPUT-PROFILE-ARCHIVE-01** | Soft-delete profile | same | sa |
| **F-PAY-SETUP-RESOLVE-01** | Resolve default template+policy+profile for OU/`business_line_tag` (read-only helper for period form) | AC-CNTT-SETUP-* | sa |

### 3.3 EXPAND — existing CONFIRMED sections (APPEND rows only)

| F-id | Expansion | Content |
|------|-----------|---------|
| **F-PAY-SHEET-TPL-UPSERT-01** | ADD columns | `policy_pack_id?`, `input_pack_profile_id?`, `business_line_tag?` |
| **F-PAY-SHEET-TPL-LIST-01** | ADD filters | `business_line_tag?`, `policy_pack_id?` |
| **F-PAY-PERIOD-01** | ADD snapshot fields | `policy_pack_version`, `input_pack_profile_version` inside `sheet_template_snapshot_json` or sibling jsonb |
| **F-PAY-PERIOD-INPUT-01** | ADD validation | Reject `source_kind` ∉ profile snapshot → `HRM-PAY-INP-PROFILE-422` |
| **F-PAY-PROCESS-01** | ADD note only | Cite policy scalar params as read-only context GĐ1 — **no** eval until engine LIVE |

### 3.4 HOLD — do not APPEND implementation unlock

| F-id | Reason |
|------|--------|
| **F-PAY-FORMULA-EVAL** / process evaluate | `expression_json` inner schema **not** physical CONFIRMED |
| **F-PAY-FORMULA-PREVIEW-01** (full UAT) | Hours bag blocked until `att_timesheet_line` depth per G-PAY-F-06 |
| Any **import XLSX** API | GĐ2 — out of CNTT G1 |

---

## 4. Formula engine honesty (mandatory)

| Claim | Allowed? |
|-------|----------|
| Multi-template architecture CONFIRMED | **Yes** |
| Policy pack / input profile ADD approved | **Yes** |
| API F.1 for setup APPEND approved | **Yes** (after DATA) |
| Formula **evaluator** LIVE | **No** — HOLD |
| `payroll_e2e_ready=true` | **No** |
| PROCESS with real customer amounts | **No** — until DATA + BE + U65 |
| Template override affects payslip lines | **No** — until evaluator |

**Gate to lift HOLD:**

1. `po-hrm-payroll-formula-run-gap-data-01` (or successor) CONFIRMS `expression_json` inner schema + `required_vars_json` allow-list.
2. `PO-HRM-PAYROLL-FORMULA-EVAL-BE-01` READY_FOR_QA with jest + ATT-412 + FORMULA-412.
3. QC browser U65 process ≠ silent 0₫.

---

## 5. Wave order (CNTT program)

```text
PO-HRM-PAY-CNTT-SA-01 (this) PASS_TO_PM
  → PO-HRM-PAY-CNTT-BA-PROCESS-01 (6×AC matrix)
  → PO-HRM-PAY-CNTT-BA-DATA-01 (Excel→entity + ADD tables)
  → PO-HRM-PAY-CNTT-API-01 (sa APPEND F.1 policy/profile + TPL expand)
  → dev-be ensureSchema (policy/profile + template FKs)
  → dev-fe Thiết lập lương hub
  → PO-HRM-PAY-CNTT-LINKAGE-QA-01
  ║ parallel serial gate: FORMULA-EVAL-BE-01 after expression_json CONFIRMED
  → qa U65 per model · qc honesty
```

**Parallel OK:** CTR/MergeToken lanes — must_keep no regression.

---

## 6. Non-goals

- Hardcode 6 models in Nest.
- Seed customer XLSX for UAT.
- GĐ1 formula DnD · AI AVA.
- Claim AMIS parity DONE.
- Rewrite enroll `salary_templates` as mẫu.

---

## 7. completion_report

**Closed**

1. Reconciled AMIS spine vs XeVN vs customer 6-model reality (§1).
2. Recommended **Thiết lập lương** architecture L1–L6 (§2).
3. Published ADR-HRM-PAY-MULTI-TEMPLATE-01 + ADR-HRM-PAY-XEVN-CUSTOMER-CNTT-01.
4. API_DESIGN unlock: REWRITE none · APPEND 7 new F-ids · EXPAND 5 existing (§3).
5. Formula engine **HOLD** documented with lift gates (§4).

**Residual**

| ID | Owner |
|----|-------|
| `PO-HRM-PAY-CNTT-BA-PROCESS-01` | ba-process |
| `PO-HRM-PAY-CNTT-BA-DATA-01` | ba-data |
| `PO-HRM-PAY-CNTT-API-01` | sa (after DATA) |
| `PO-HRM-PAYROLL-FORMULA-EVAL-BE-01` | dev-be (after expression_json CONFIRMED) |
| `PO-HRM-PAY-CNTT-LINKAGE-QA-01` | qa |

---

## 8. Handoff

- **next_owner:** `pm`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/po-hrm-pay-cntt-sa-01.md`

---

## 9. ADD delta — fragment bind (`PO-HRM-PAY-CNTT-SA-FRAGMENT-MAP-02`)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-SA-FRAGMENT-MAP-02` |
| **parent** | `PO-HRM-PAY-CNTT-BA-DATA-FRAGMENT-MAP-02` PASS |
| **change_mode** | ADD — **does not** reopen §2 L1–L6 · §3 API REWRITE/APPEND baseline · §4 evaluator HOLD |
| **ADR slice** | [`ADR-HRM-PAY-FRAGMENT-BIND-01.md`](../../architecture/ADR-HRM-PAY-FRAGMENT-BIND-01.md) |
| **read_first** | `PO-HRM-PAY-CNTT-XLSX-COLUMN-MAP.md` · `PO-HRM-PAY-CNTT-POLICY-FRAGMENT-CATALOG.md` |
| **Date** | 2026-08-11 |

### 9.1 Template line — `fragment_id` bind (EXPAND L3)

| ADD on `pay_sheet_template_lines` | Rule |
|-------------------------------------|------|
| `fragment_id` TEXT NULL | Cites catalog `FRG-*`; validated at template publish |
| `fragment_bind_mode` TEXT NULL | `CHUNG_ONLY` \| `RIENG_OVERRIDE` \| `STATUTORY` \| `IDENTITY` \| `INPUT_PACK` \| `DEDUCTION_GAP` |

- **Identity / statutory** columns: `fragment_id` NULL.
- **Mapped RIENG/CHUNG earnings:** `fragment_id` set per XLSX column map §2–§5.
- **GAP-FRG (18):** `fragment_id` NULL; mode `INPUT_PACK` or `DEDUCTION_GAP` — see ADR §8.

### 9.2 Policy pack bind (EXPAND L4)

- `pay_policy_pack.policy_doc_refs_json` carries `fragment_ids[]` per `doc_id` (catalog §3 inventory).
- Starter packs: `POL_CNTT_CHUNG_2A_127A` · `POL_CNTT_DPHH` · `POL_CNTT_TDHK` · `POL_CNTT_LX_ROUTE` · `POL_CNTT_TIME_VP_HN` (ADR-FRAGMENT-BIND §4.1).
- Template `policy_pack_id` FK unchanged (SA-01 §2.1 L6).

### 9.3 `effective_from` resolver — RIENG-OVERRIDE

At period bind, for each line with `fragment_bind_mode=RIENG_OVERRIDE`:

```text
pay_period_end_date + policy_pack.fragment_ids + catalog overrides[]
  → resolved_fragment_id = max(effective_from) in override chain
```

Examples: `FRG-LXT-QD439-LUOT` supersedes `FRG-LXT-LUOT-*` for period ≥ 2025-09-01; `FRG-DPHH-DT-HG-02` supersedes `FRG-DPHH-DT-HG-01` for period ≥ 2024-10-01.

Errors: `HRM-PAY-FRG-404` · `HRM-PAY-FRG-412` · `HRM-PAY-FRG-409`. Trace stored in period snapshot; **no** amount eval (ENGINE-GAP).

### 9.4 Dual-template options (GAP-CNTT-08 · 09 · 10)

| GAP | Option (LOCK) | Rule |
|-----|---------------|------|
| **GAP-CNTT-08** ĐPHH time + DT | **A** Primary + secondary template bind | Single BHXH net per employee (`merge_rule: DPHH_BHXH_NET_ONCE`) |
| **GAP-CNTT-10** TĐHK TG + KPI | **A** Same pattern | Statutory once on primary `TDHK_THOI_GIAN` |
| **GAP-CNTT-09** LX summary + detail | Detail-only SoT | `Luong lai tuyen` = process; summary = export |

### 9.5 ENGINE-GAP (`xevn_today=MISSING`)

- Catalog §4: all 63 fragments `xevn_today=MISSING` → bind is **governance trace only** until GAP-CNTT-11 evaluator LIVE.
- `rate_params_json` on policy pack = GĐ1 manual/scalar hints — not OCR auto-feed.
- **must_keep:** formula evaluator HOLD (§4) · `payroll_e2e_ready=false`.

### 9.6 GAP-FRG summary (18 → HOLD)

| Disposition | Count | Action |
|-------------|-------|--------|
| **HOLD** (component + input_pack / deduction entity) | 17 | No new `fragment_id`; map `salary_components.code` per BA-DATA-01 |
| **BIND** existing fragment | 1 | DLL CPN → `FRG-DPHH-BASE-01` + input_pack |
| **PROPOSE** (sponsor PDF required) | 2 deferred | `FRG-CHUNG-TET-01` · `FRG-LXT-ELEC-01` — **not** approved GĐ1 |

Full matrix: ADR-HRM-PAY-FRAGMENT-BIND-01 §8.

### 9.7 API / DB APPEND pointers

- EXPAND `F-PAY-SHEET-TPL-LINE-*` · `F-PAY-POLICY-PACK-UPSERT-01` · `F-PAY-SETUP-RESOLVE-01` (see ADR §10).
- EXPAND `DB_DESIGN_HRM_PAYROLL.md` §8.7 `pay_sheet_template_lines` columns.

### 9.8 completion_report (fragment-map seat)

**Closed:** fragment_id on template lines · policy_pack fragment membership · effective_from resolver spec · dual-template Option A · ENGINE-GAP honesty · 18 GAP-FRG HOLD map.

**Residual:** DB §8.7 physical (dev-be) · API-01 line expand · INPUT-DATA WI for input_pack keys · formula evaluator (GAP-CNTT-11).

- **evidence_path:** `docs/qa/evidence/po-hrm-pay-cntt-sa-fragment-map-02.md`
- **ack_status:** `PASS_TO_PM`
