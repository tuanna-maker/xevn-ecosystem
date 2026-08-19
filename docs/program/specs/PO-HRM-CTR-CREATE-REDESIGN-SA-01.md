# PO-HRM-CTR-CREATE-REDESIGN-SA-01 — Option A LOCK · AMIS IA wizard · clause-on-contract · display-ready gaps

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-CREATE-REDESIGN-SA-01` |
| **parent** | `PO_HRM_CTR_CREATE_REDESIGN_SPONSOR_INTAKE.md` · `PO-HRM-CTR-CREATE-REDESIGN-BA-01` |
| **lane** | governance · sa |
| **date** | 2026-08-10 |
| **priority** | **P0** (sponsor — trước wave program khác) |
| **change_mode** | **ADD** IA + API bind · **REPLACE** create-dialog UX (not registry CRUD) · **NO CODE** `apps/**` this seat |
| **status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **`PO-HRM-CTR-CREATE-REDESIGN-FE-01`** (+ parallel **`BE-01`** after API-01 seat) |
| **uc_ids** | `FR-UC-BP-CORE-09` · `09a`–`09d` · UF-HRM-02 · peer `FR-UC-BP-PLT-01` (catalog / merge registry) |
| **ref_ba** | [`PO-HRM-CTR-CREATE-REDESIGN-BA-01.md`](./PO-HRM-CTR-CREATE-REDESIGN-BA-01.md) §3–§6 · O1–O15 · J-HRM-CTR-CREATE-* |
| **ref_tpl** | [`PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md) §2–§5 · CORR-01 open catalog |
| **ref_api_live** | [`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01.md) · **RETAIN** `F-CORE-CTR-PACK-01` · `F-CORE-CTR-PREV-01` |
| **ref_api_ci** | `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` §1–§4 (registry CRUD — **must_keep**) |
| **ref_code_as_is** | `apps/web/hrm/src/pages/Contracts.tsx` (dialog + `ContractPrintSpinePanel` embed) · `ContractPrintSpinePanel.tsx` (template clause bind anti-pattern on create) |
| **Honesty** | `contracts_printable_ready=false` · **C-SLICE-≠-MODULE** · **cấm** claim printable / CTR module UAT |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Decision — Option A LOCKED (sponsor AMIS IA)

| Option | Mô tả | Verdict |
|--------|--------|---------|
| **A** | **2 bước:** Bước 1 = grid «Thông tin chung» kiểu AMIS (đủ trường intake) + chọn `template_code` catalog mở; Bước 2 = palette/canvas clause DnD + preview X.E (không honesty) | **LOCK** |
| B | Giữ một dialog dài, chỉ gỡ banner honesty | **REJECT** — sponsor: IA **WRONG** (print spine lẫn registry) |
| C | Clone pixel AMIS / hàng loạt only | **REJECT** — nghiệp vụ parity, không pixel |

**Sponsor reference (IA, không UI clone):** AMIS «Thêm hợp đồng hàng loạt» — nhóm Thông tin chung + Lương/BH + Đại diện + Phụ cấp + (Bước 2) mẫu/điều khoản/preview. Nguồn: intake §AMIS + [MISA AMIS HRM contract article](https://sme.misa.vn/1206/lam-viec-hieu-qua-hon-voi-phan-he-hop-dong-tren-misa-hrm-net-2010/).

**Giải thích kiến trúc «vì sao màn cũ»:** Wave CORE-09 C-SLICE gắn **print-spine** (`ContractPrintSpinePanel`) **cuối** dialog registry → UX lẫn sổ đăng ký + in + honesty; clause DnD **ghi template junction** (`syncContractTemplateClauseBind`) thay vì **HĐ đang tạo** → không AMIS-equivalent.

---

## 2. Target architecture (text)

```text
  HCNS — Thêm HĐ (Contracts.tsx)
        │
        ▼
  ┌─ ContractCreateWizardDialog (REPLACE dialog body) ─────────────────────┐
  │ Stepper h-10 · max-w-5xl · xevn-safe-inline · grid-cols-12            │
  │                                                                         │
  │  STEP 1 — ContractCreateStep1GeneralGrid                               │
  │    · NV · mã HĐ · loại catalog · trạng thái (UF-HRM-02 must_keep)      │
  │    · Combobox template_code (GET catalog mở — AC-CTR-XEVN-01/11)        │
  │    · AMIS grid: tên HĐ · ngày ký · hiệu lực/hết hạn · hình thức LV      │
  │    · tỉ lệ hưởng lương · Bên B read-only · C&B card · phụ cấp sub-grid   │
  │    · đại diện công ty ký · trích yếu/ghi chú · DRIVER block conditional │
  │    · Link «Chỉ lưu sổ» (AC-CTR-XEVN-08)                                 │
  │    · DENY honesty paragraphs (AC-CTR-UX-01)                              │
  │                                                                         │
  │  [Tiếp] ──requires template_code OR registry-only path──►                │
  │                                                                         │
  │  STEP 2 — ContractCreateStep2ClausePreview                             │
  │    · Palette 4/12 + Canvas 8/12 (DnD @hello-pangea/dnd)                 │
  │    · Preview panel (POST preview — ephemeral)                            │
  │    · DENY mutate template PUT /clauses from this flow (NEW invariant)     │
  │    · PUT contract print-overlay clause_ids (GAP BE-01)                   │
  │                                                                         │
  │  Footer: Quay lại · Lưu · Xem trước · Lưu phiên bản (when can_issue)     │
  └─────────────────────────────────────────────────────────────────────────┘
        │
        │  Network (U19 same scope family)
        ▼
  RETAIN LIVE
    GET  …/contract-templates*          (open catalog)
    GET  …/contracts/pack-resolve       (F-CORE-CTR-PACK-01)
    POST …/contracts                    (registry + overlay cols)
    PATCH…/contracts/:id
    POST …/contracts/:id/preview        (F-CORE-CTR-PREV-01 ephemeral)
    POST …/contracts/:id/print-versions (peer CORE-09c — when can_issue)

  GAP EXPAND (BE-01 + API-01 doc)
    GET  …/compensation-packages/:id/display  (or embed on contract create bundle)
    PUT  …/contracts/:id/print-overlay      (clause_ids[] per contract draft)
    ContractPreviewDto.clause_ids?            (preview before overlay persist)
    list/get contract SELECT + DTO            (template_code · signed_at · AMIS fields)

  REMOVED from create path
    ContractPrintSpinePanel in dialog
    syncContractTemplateClauseBind from create wizard
    core09HonestyBannerText / ctr-print-honesty user-visible
```

**Invariant CTR-CREATE-IA-01:** Bước 1 field set = **superset** AMIS intake table (intake §AMIS) mapped to merge §5 + AMIS-only registry fields — **không** thay bằng pack picker + paragraph kỹ thuật.

**Invariant CTR-CREATE-CLAUSE-01:** Clause order trên **HĐ** (`employee_contracts` overlay hoặc `print_draft_clause_ids`) — **cấm** coi PUT `contract-templates/:id/clauses` là thao tác tạo HĐ (Settings-only).

**Invariant CTR-CREATE-PREV-01:** Preview **không** INSERT issued `hrm_contract_print_versions` (RETAIN CORE-09b ephemeral).

---

## 3. API sequence LOCK (create / edit wizard)

### 3.1 Luồng chuẩn (O6–O7 · U65)

| Phase | Actor | API | Ghi chú |
|-------|-------|-----|---------|
| 0 | FE | `GET …/contract-templates?status=active` | Picker catalog mở |
| 0b | FE | `GET …/compensation-packages?employee_id=` hoặc **GAP** `GET …/employees/:id/contract-create-bundle` | C&B + phụ cấp read-only |
| 0c | FE | `GET …/contracts/pack-resolve?employee_id=` | Gợi ý pack (optional banner) |
| 1 | User | Điền Bước 1 · chọn `template_code` | FE resolve `term_type` / duration hint từ template row |
| 2a | FE | **«Tiếp»** → nếu chưa có `contractId`: `POST …/contracts` (registry + overlay) **201** | **R-CTR-CREATE-API** — cần id cho preview |
| 2b | FE | `PUT …/contracts/:id/print-overlay` **GAP** body `{ clause_ids: uuid[] }` | Sau DnD hoặc trước preview |
| 3 | FE | `POST …/contracts/:id/preview` body `{ template_code, pack_code?, field_overrides?, clause_ids? **GAP**, can_view_cb }` | Ephemeral |
| 4 | User | «Lưu» / «Lưu phiên bản» | `PATCH …/contracts/:id` và/hoặc `POST …/print-versions` khi `can_issue` |
| 5 | QA | F5 list → mở sửa → Bước 1/2 khớp | J-HRM-CTR-CREATE-06 |

### 3.2 «Chỉ lưu sổ đăng ký» (BR-CTR-CREATE-01 · AC-CTR-XEVN-08)

| Bước | API |
|------|-----|
| User chọn link «Chỉ lưu sổ» | `POST/PATCH …/contracts` **không** `template_code` · **không** mở Bước 2 |
| Kết quả | 2xx · list/F5 có HĐ · print optional sau |

### 3.3 Đổi `template_code` (BR-CTR-CREATE-02)

FE confirm → reset canvas từ template default clause list **hoặc** giữ custom order → `PUT print-overlay` + re-preview.

---

## 4. FE component split plan (REPLACE dialog — FE-01)

| Component | Trách nhiệm | Nguồn / ghi chú |
|-----------|-------------|-----------------|
| **`ContractCreateWizardDialog.tsx`** | Shell: stepper, footer, open/close, `work_item` state `contractId`, orchestration API sequence §3 | **NEW** — thay `Dialog` body tạo/sửa trong `Contracts.tsx` |
| **`ContractCreateStep1GeneralGrid.tsx`** | AMIS «Thông tin chung» grid 12 cột; field manifest §5; template combobox; duration presets; DRIVER block; link «Chỉ lưu sổ» | **NEW** |
| **`ContractCreateStep2ClausePreview.tsx`** | Palette + canvas DnD; preview panel; missing bullets (không honesty); actions Đồng bộ / Xem trước / Lưu phiên bản | **NEW** — extract logic từ `ContractPrintSpinePanel` **không** copy honesty UI |
| **`ContractCbReadOnlyCard.tsx`** | Lương cơ bản · lương đóng BH · tỉ lệ % — vi-VN money grouping exempt rules | **NEW** |
| **`ContractAllowancesSubGrid.tsx`** | Sub-grid phụ cấp (snapshot lines) — read-only | **NEW** |
| **`ContractEmployerSignatoryBlock.tsx`** | Đại diện công ty ký (picker / read-only merge Bên A) | **NEW** |
| **`ContractPartyBReadOnlyCard.tsx`** | Bên B identity (tên, CCCD, phone…) display-ready từ employee GET | **NEW** |
| **`contractCreateWizardState.ts`** | Wizard state, BR-CTR-CREATE-02 confirm, map submit → `CreateContractDto` | **NEW** |
| **`contractCreateFieldManifest.ts`** | Static manifest + `visibleBlocks(template_code)` — BIND §5 | **NEW** (hoặc load từ BE §6.2) |

**Deprecate / forbidden paths (FE-01):**

| AS-IS | TO-BE |
|-------|-------|
| `Contracts.tsx` dialog: `grid-cols-2` + `ContractPrintSpinePanel` cuối form | **Cấm** embed `ContractPrintSpinePanel` trong create/edit dialog |
| `data-testid="ctr-core09-registry-honesty"` banner list | **Remove** user-visible (O9) — flag chỉ `data-qa` / env |
| `ctr-core09-registry-no-tpl-note` paragraph | ≤1 câu hint hoặc icon help (AC-CTR-UX-01) |
| `syncContractTemplateClauseBind` on preview from create panel | **Cấm** — dùng `PUT …/print-overlay` (BE-01) |
| Default `printPackCode = GENERAL` without `template_code` | Default **empty** template; pack từ template resolve |

**Giữ nguyên file (không xóa):** `ContractPrintSpinePanel.tsx` — chỉ **Settings** hoặc maintenance slice nếu còn reference; **không** production create path.

**`Contracts.tsx` edits (allowed_paths FE-01):** mount wizard · remove honesty banner · list page only · **must_keep** list CRUD · view dialog · UF-HRM-02 submit ids.

---

## 5. FormSchema / merge field manifest (per `template_code`)

**BIND PLT-01:** In-form visibility = **merge §5** + AMIS intake — không hardcode 8 `template_code` trên FE. Catalog SoT = `hrm_contract_templates` (+ `keyword_map` / `matrix_family`).

### 5.1 AMIS → logical field manifest (Bước 1)

| AMIS (intake) | Logical key | Nguồn SoT | UI Bước 1 | Ghi chú |
|---------------|-------------|-----------|-----------|---------|
| Số HĐ* | `contract_number` / `contract_code` | `employee_contracts.contract_code` | editable | BR-CTR-TPL-05 pattern gợi ý |
| Tên HĐ | `contract_name` | **GAP** col hoặc `job_description_text` alias | editable | BA O3 |
| Thời hạn HĐ (preset) | `term_type` + duration hint | template + `employee_contracts.term_type` | read-only badge + nút áp dụng ngày | O5 |
| Ngày hiệu lực* | `effective_from` | `start_date` | date dd/MM/yyyy | |
| Ngày ký* | `signing_date` | **GAP** `signed_at` | date | AMIS required |
| Loại HĐ* | `contract_type` | catalog `contract_types` | select F-04 label | UF-HRM-02 |
| Hình thức làm việc | `work_arrangement` | **GAP** catalog key | select | AMIS |
| Ngày hết hạn* | `effective_to` | `end_date` | hidden when `indefinite` | BR-CTR-TPL-03 |
| Lương cơ bản | `base_salary_vnd` | CORE-02 package line `base` | read-only card | BR-CD-F5-01 |
| Lương đóng BH | `insurance_salary_vnd` | CORE-02 / SI snapshot | read-only card | **GAP** display |
| Tỉ lệ hưởng lương | `salary_ratio_percent` | **GAP** package or contract col | read-only or % | AMIS |
| Người đại diện công ty ký | `company_signatory` | `signer_name` + `signer_position` (+ keys) | picker | employer side |
| Trích yếu | `abstract` | **GAP** `abstract_text` vs `notes` | textarea | |
| Ghi chú | `notes` | `notes` | textarea | |
| Phụ cấp (+ Thêm) | `allowance_lines[]` | compensation package allowance lines | sub-grid read-only | AMIS parity |
| Mẫu in | `template_code` | catalog | combobox | AC-CTR-XEVN-01 |
| Bên B block | §5.1 PII | employee GET | read-only card | |
| Nơi làm việc | `work_location` | contract col | editable | |
| GPLX block | §5.2 DRIVER | contract cols | conditional `*_DRIVER` | O11 |

### 5.2 `template_code` family → visible blocks (delta)

| Family (`matrix_family` / code pattern) | `effective_to` | GPLX block | Clause pack |
|----------------------------------------|----------------|------------|-------------|
| `*_PROBATION_*` | required · default +60d | `*_DRIVER` only | `IT_OFFICE` / `DRIVER` |
| `*_FT_12M_*` | required · +12m | DRIVER only | same |
| `*_FT_24M_*` | required · +24m | DRIVER only | same |
| `*_INDEF_*` | hidden / optional | DRIVER only | same |

**FE rule:** `visibleBlocks(template)` = union(skeleton §5.1) + family row + `keyword_map` optional keys — **không** closed enum 8.

### 5.3 Optional BE-driven FormSchema (BE-01 / PLT)

**EXPAND (khuyến nghị):** `GET …/contract-templates/:id` (hoặc field trên list row) thêm:

- `visible_merge_fields[]` — `{ key, label_vi, required, source_ring, read_only }`
- `default_term_type`, `default_duration_months`, `pack_code`, `title_print_vi`

→ FE manifest có thể **thin** — BIND `layout_json` cho in, không cho Bước 1 registry (CTR FormSchema SoT = template metadata + manifest API).

---

## 6. BE display-ready DTO gaps (AMIS fields)

> **RETAIN:** BR-CD-F5-01 — không nhập lương free-type trên contract body; C&B từ package.

| AMIS / BA field | Physical / SoT today | List `GET` contracts | `GET` by id | Create/PATCH DTO | Create-step bundle | Verdict |
|-----------------|----------------------|----------------------|-------------|------------------|-------------------|---------|
| `template_code` | `employee_contracts.template_code` | **MISSING** in SELECT | **MISSING** in SELECT | **YES** | template list | **GAP DISPLAY** — FE-02 restore đã type; SQL omit |
| `signed_at` / ngày ký | column exists | missing | missing | **MISSING** | — | **GAP** DTO + SELECT + `signing_date` display |
| `contract_name` | partial `job_description_text` | partial | partial | `job_description_text` | — | **GAP** dedicated `contract_name` or normative alias |
| `work_arrangement` | — | — | — | — | — | **GAP** col + catalog + label_vi |
| `salary_ratio_percent` | — | — | — | — | package? | **GAP** display from CB snapshot |
| `insurance_salary_vnd` | CORE-02 lines / SI base | — | — | — | package GET | **GAP** embed in create bundle |
| `allowance_lines[]` | `compensation_package` lines | separate API | separate API | — | **GAP** `allowances[]` display-ready | sub-grid FE-01 |
| `company_signatory` | `signer_name` / `signer_position` | **YES** | **YES** | **YES** | — | **OK** + picker UX |
| `employer_legal_name` / unit | merge / company | preview only | preview | — | company scope GET | Bước 1 read-only **GAP** bundle |
| `clause_ids` order (per HĐ) | template junction only | — | — | — | — | **GAP** `print_overlay_clause_ids` JSONB or child table |
| Preview `clause_ids` body | — | — | — | preview DTO **no** field | — | **GAP** ephemeral override |
| `statusLabelVi` | FE-derive | optional | optional | — | — | RETAIN optional |
| Employee PII block | employee join | partial | partial | — | employee GET | **OK** + card layout |

**Recommended display bundle (BE-01):**

`GET /api/hrm/contracts-insurance/employees/:employeeId/contract-create-context?company_id=` →

```json
{
  "employee_party_b": { "full_name", "id_number", "phone", "dob_display", … },
  "compensation_snapshot": {
    "base_salary_vnd", "insurance_salary_vnd", "salary_ratio_percent",
    "allowances": [{ "code", "label_vi", "amount_vnd" }]
  },
  "employer_party_a": { "legal_name", "unit_label" },
  "suggested_signatory": { "signer_name", "signer_position_key", … }
}
```

AuthZ: same scope as contract create · mask C&B when `HRM-CORE-CB-403`.

---

## 7. API_DESIGN delta (for `API-01` seat — append `API_DESIGN_HRM_CONTRACTS_INS.md` or slice doc)

| Fn ID | Method / path | Mục đích (VI) | Nghiệp vụ | SRS bước |
|-------|---------------|---------------|----------|----------|
| **F-CORE-CTR-CREATE-CTX-01** **GAP** | `GET …/employees/:id/contract-create-context` | Card C&B + Bên A/B cho Bước 1 | Scope + package active + labels vi-VN | FR-09d #1–#3 · O10 |
| **F-CORE-CTR-OVERLAY-01** **GAP** | `PUT …/contracts/:id/print-overlay` | Lưu `clause_ids[]` cho HĐ draft | Validate clause active + pack; **không** sửa template junction | FR-09b #DnD · O6 |
| **F-CORE-CTR-PREV-01** **EXPAND** | `POST …/contracts/:id/preview` | Thêm optional `clause_ids[]` | Nếu có → resolve clauses theo order; else template junction | FR-09b preview |
| **F-CORE-CTR-REG-01** **EXPAND** | `GET` list/get contracts | Thêm SELECT `template_code`, `signed_at`, `driver_license_*`, … | Display-ready + F5 edit restore | UF-HRM-02 · O12 |
| **F-CORE-CTR-REG-02** **EXPAND** | `POST/PATCH` contracts | `signed_at`, `work_arrangement`, `contract_name` (or mapped) | G-CI-01 + BR-CTR-TPL | FR-CI-01 / 09d |
| **RETAIN** | `PUT …/contract-templates/:id/clauses` | Settings template composer only | **Cấm** gọi từ create wizard | 09a/09d Settings |

Errors (additive): `HRM-CTR-OVERLAY-400` (clause pack mismatch) · reuse `HRM-CTR-TPL-PACK-MISMATCH` · scope 409 family.

---

## 8. must_keep / forbidden (FE-01 · BE-01)

| must_keep | forbidden |
|-----------|-----------|
| UF-HRM-02 / J-HRM-03 registry CRUD + F5 | Claim `contracts_printable_ready=true` |
| AC-CTR-XEVN-08 registry without template | Closed enum 8 on FE |
| AC-CTR-UX-01 — no honesty paragraphs | Clone AMIS pixels only |
| CORE-09a/b/c GWC seals · J-HRM-CTR-04..07 | `syncContractTemplateClauseBind` on create wizard |
| F-CORE-CTR-PACK/PREV RETAIN paths | Nest `/core` SoT for pack/preview |
| Open catalog CORR-01 · preview ephemeral | Seed body / catalog to pass QA |
| BR-CD-F5-01 · G-CI-01 end_date by type | Salary on contract body |
| U65 zero-seed browser evidence | Wipe Q-CTR-01/02 CLOSED |

---

## 9. Rollout & validation

| Wave | Owner | Entry | Exit |
|------|-------|-------|------|
| **API-01** | sa / doc | This LOCK | F.1 rows in API_DESIGN + unlock BE-01 |
| **BE-01** | dev-be | SA-01 + API-01 | Overlay PUT · context GET · list/get SELECT · preview `clause_ids` |
| **FE-01** | dev-fe | SA-01 LOCK (**this doc**) | O1–O11 · O13–O14 · wizard replaces spine |
| **QA** | qa | READY_FOR_QA | J-HRM-CTR-CREATE-01..08 U65 |
| **QC** | qc | QA PASS | GWC slice — **không** module CTR UAT |

**Regression:** J-HRM-CTR-04..07 · UF-HRM-02 · AC-CTR-PRINT-08 after wizard.

**Probation SI clause (SPEC §4.3):** **HOLD** — giữ mandatory SI clause hiện SPEC-01; không mở rộng GĐ1 trong seat này.

---

## 10. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | LOCK Option A: AMIS-aligned Step1 grid + Step2 clause/preview X.E; API sequence create→overlay→preview; FE component split replacing `ContractPrintSpinePanel` in dialog; BE display-ready gap table (signing_date, contract_name, work_arrangement, salary_ratio, insurance_salary, allowances, company_signatory, template_code list/get, per-contract clause_ids); API_DESIGN delta F-CORE-CTR-CREATE-CTX/OVERLAY; must_keep UF-HRM-02 + UX-01 + open catalog; **no** `apps/**` |
| **residual** | API-01 F.1 physical doc · BE-01 impl · printable module · probation SI depth |
| **next_owner** | **dev-fe** (`PO-HRM-CTR-CREATE-REDESIGN-FE-01`) — **parallel** dispatch **dev-be** when API-01 ready |
| **evidence_path** | `docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **printable** | **false** |

### next_dispatch_prompt (copy-ready — FE-01)

```text
work_item_id: PO-HRM-CTR-CREATE-REDESIGN-FE-01
role: dev-fe
read_first:
  - docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-SA-01.md (§4 component split · §5 manifest · §3 API sequence)
  - docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-BA-01.md (O1–O15 · AC-CTR-UX-01)
  - apps/web/hrm/src/pages/Contracts.tsx (AS-IS dialog — replace body)
spec_read_ack:
  srs: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09a–09d
  tech_spec: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md §5
  api_design: PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01.md RETAIN preview/pack; SA-01 overlay GAP (stub UI until BE-01 if needed)
change_mode: ADD wizard · REPLACE create dialog layout
entry_criteria: SA-01 Option A LOCKED; sponsor P0 AMIS IA
exit_criteria:
  - ContractCreateWizardDialog + Step1 grid + Step2 palette/preview (§4 table)
  - REMOVE ContractPrintSpinePanel from create/edit dialog; REMOVE user-visible honesty banners (O9)
  - Step1 shows AMIS field groups incl. C&B card + allowances sub-grid (read-only; mock API shape from SA §6 until BE bundle)
  - Step2 DnD: do NOT call syncContractTemplateClauseBind; wire PUT print-overlay when BE ready else feature-flag + QA BLOCKED note
  - template_code open catalog combobox; grid-cols-12; «Chỉ lưu sổ» path
  - data-testid for O1–O8 journeys
allowed_paths:
  - apps/web/hrm/src/pages/Contracts.tsx
  - apps/web/hrm/src/components/contracts/ContractCreate*.tsx
  - apps/web/hrm/src/components/contracts/ContractCb*.tsx
  - apps/web/hrm/src/lib/contractCreate*.ts
forbidden_paths:
  - syncContractTemplateClauseBind from wizard preview path
  - user-visible contracts_printable_ready / CORE-09 DONE paragraphs
must_keep: UF-HRM-02 submit · J-HRM-CTR-04..07 regression · AC-CTR-XEVN-08
evidence_path: docs/qa/evidence/po-hrm-ctr-create-redesign-fe-01.md
ack_status target: READY_FOR_QA
cấm: claim printable UAT; hardcode 8 template codes; pixel-clone AMIS
```
