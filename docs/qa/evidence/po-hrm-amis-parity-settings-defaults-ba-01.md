# Evidence — PO-HRM-AMIS-PARITY-SETTINGS-DEFAULTS-BA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-SETTINGS-DEFAULTS-BA-01` |
| **parent** | `PO-HRM-AMIS-PARITY-RESEARCH-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P1 |
| **change_mode** | ADD · docs-only |
| **date** | 2026-08-07 |
| **ack_status** | **PASS_TO_PM** |
| **honesty** | `payroll_e2e_ready=false` · **cấm** AMIS parity DONE · **cấm** invent LIVE · **cấm** `apps/**` · U65 zero-seed · no_prompt_echo client docs |

---

## 0. Read ack (ordered)

| # | Artifact | Used |
|---|----------|------|
| 1 | `po-hrm-amis-parity-ba-01.md` §1 Settings row · §2 Step1 · EMP PC/KT row | Gap class **GAP P1** · AMIS Step1 partial |
| 2 | `PO_HRM_AMIS_PARITY_RESEARCH_01.md` §4 EMP · §3 Step1 | Scope «phụ cấp theo vị trí» · catalog + per-emp C&B |
| 3 | `ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` Option **B** | Catalog · FormSchema · MergeToken pattern |
| 4 | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md` §2.4 PAY · §2.7 SETTINGS | AC-PLT-PAY-01 · AC-PLT-SET-01 · BR-PLT-02/05/06 |
| 5 | `po-hrm-amis-parity-pay-depth-01.md` | BR-AMIS-PAY-SRC-02 employee C&B wins over defaults |
| 6 | `DB_DESIGN_HRM_ENTERPRISE.md` §3.2 · §5.4 · `hrm_company_settings` class | Paper entities — cite not invent LIVE |
| 7 | Public AMIS help (principles only) | PC/KT catalog · Step1 thiết lập — no UI clone |

### 0.1 AMIS principle anchors (no product copy)

| Topic | URL | Principle extracted |
|-------|-----|---------------------|
| Danh mục PC/KT | https://helpamis.misa.vn/amis-thong-tin-nhan-su/kb/danh-muc-khoan-phu-cap-khau-tru/ | Open catalog allowance/deduction; **tính chất thuế** + giá trị/định mức; đồng bộ hồ sơ · HĐ · lương |
| Tiền lương Step1 | https://helpamis.misa.vn/amis-tien-luong/kb/huong-dan-chung-luong-nghiep-vu-tinh-luong-tong-quan-tren-amis-tien-luong/ | **Thiết lập** thuế · BH · thông số · **lịch sử lương NV** trước thành phần/mẫu |
| HRM cross-app | https://helpamis.misa.vn/amis-thong-tin-nhan-su/kb/tong-quan-luong-nghiep-vu-ket-noi-giua-cac-ung-dung-trong-bo-misa-amis-hrm/ | PC theo **vị trí/chức danh** → hồ sơ → PAY |

**Sponsor lock:** Gap vs AMIS → backlog DOC; XeVN BETTER (scope ladder · soft-delete · Option B platform) → **không đè**.

---

## 1. Gap class (from ba-01 §1 Settings)

| Domain | AMIS capability | XeVN neo | Status | Pri | Gap class |
|--------|-----------------|----------|--------|-----|-----------|
| **Settings** | Thông số mặc định thuế/BH/PC theo vị trí/OU | `hrm_company_settings` + policies partial | **GAP** | **P1** | **paper-only** + **FE missing** + **policy layer absent** + **catalog orphan** (PC ↔ `salary_components`) |
| **EMP** (linked) | Danh mục PC/KT + gán theo vị trí/NV | Settings allowance catalog | **GAP** | **P0** | Same wave dependency — defaults **consume** catalog |
| **PAY** (linked) | Step1 Thiết lập thuế/BH/thông số | CORE-02 · `pay_insurance_rate_cfg` paper | **PARTIAL** | **P0** | Rate CFG paper ≠ Settings CRUD LIVE |

**Honesty:** This seat closes **BR/AC DOC delta** only — not product LIVE · not payroll UAT.

---

## 2. Process objective & scope

### 2.1 Objective

Khóa delta nghiệp vụ **«Thông số mặc đnh»** (AMIS Step1 + PC/KT catalog) theo **Platform Option B**: mọi tham số thuế · BH · phụ cấp mặc định theo **pháp nhân / OU / vị trí** là **dữ liệu Settings/catalog** — **cấm** hardcode Nest/FE — và **nạp** vào C&B/PAY theo thứ tự ưu tiên đã khóa (`BR-AMIS-PAY-SRC-02`: lịch sử NV thắng policy mặc định).

### 2.2 Actors

| Actor | Responsibility |
|-------|----------------|
| C&B / Payroll admin | CRUD thông số thuế · tỷ lệ BH · map PC theo vị trí |
| HCNS Settings admin | CRUD danh mục PC/KT (catalog mở) |
| System | Resolve effective-dated CFG · gợi ý PC khi hire/đổi vị trí · snapshot rate CFG trên process |
| QA | U65 browser AC below |

### 2.3 In / out

| In (GĐ1 DOC) | Out |
|--------------|-----|
| Tax param keys (company/OU) | Full clone AMIS Thuế TNCN standalone app |
| SI rate CFG CRUD (`pay_insurance_rate_cfg`) | AI AVA · Face marketing |
| PC/KT open catalog + dual bind PAY | GĐ1 formula DnD |
| Position → default PC policy rows | Seed mutate for UAT |
| Apply-on-hire **suggest** + C&B confirm | Silent overwrite employee history |
| MergeToken PC on HĐ (pointer CTR) | Claim parity DONE |

---

## 3. Platform Option B — layer map

```text
┌─────────────────────────────────────────────────────────────────┐
│ SETTINGS vertical (Option B)                                     │
├─────────────────────────────────────────────────────────────────┤
│ Catalog (open rows)                                                │
│  · allowance_deduction_types (PC/KT) ↔ dual bind salary_components│
│  · pay_insurance_rate_cfg (% BH + trần, effective-dated)         │
│  · hrm_company_settings tax keys (typed JSON registry)           │
│  · position_compensation_policy (position_key → PC lines)        │
├─────────────────────────────────────────────────────────────────┤
│ FormSchema (Settings UI)                                         │
│  · PC catalog form (nature: income/deduct/taxable/SI flags)      │
│  · Position policy matrix (picker position × picker PC × amount)   │
│  · SI rate form (type_key, %, ceiling, effective_from)            │
├─────────────────────────────────────────────────────────────────┤
│ MergeToken (consumer — partial GĐ1)                              │
│  · cb.allowance_{code} from catalog label + employee snapshot    │
│  · Register on PC catalog save (BR-PLT-01 class)                 │
└─────────────────────────────────────────────────────────────────┘
         │ effective-dated read              │ suggest on hire
         ▼                                   ▼
   PAY process (rate snapshot)         CORE C&B (allowances_json)
         │                                   │
         └──────── BR-AMIS-PAY-SRC-02: employee history wins ────┘
```

| AMIS surface | Option B layer | XeVN paper / target entity | Status |
|--------------|----------------|----------------------------|--------|
| Danh mục PC/KT | **Catalog** | `settings-catalogs` master `allowance_deduction_types` + **`salary_components`** FK | **GAP** orphan |
| Thuế mặc định (GTGC base, flags) | **Catalog (KV)** | `hrm_company_settings` keys `pay_tax_*` (registry) | **PARTIAL** keys sparse |
| BH % + trần pháp nhân | **Catalog** | `pay_insurance_rate_cfg` | **PAPER** |
| PC mặc định theo vị trí/OU | **Catalog + Schema** | ADD `hrm_position_compensation_policy` (+ lines) | **GAP** |
| Gán PC lên NV (hire/đổi CV) | **Consumer** | `hrm_employee_compensation.allowances_json` versioned | **PARTIAL** |
| PAY run đọc rate | **Consumer** | Process snapshots `pay_insurance_rate_cfg` id | **PAPER** |

**BR-PLT-02 apply:** Khi catalog PC có items active → policy line **phải** picker `component_code` catalog — **cấm** free-text mã SoT.

**BR-PLT-05 apply:** Starter PC rows (bootstrap) ≠ ceiling — HR CRUD thêm mã 9+.

---

## 4. Use-case catalog

| UC id | Tên | Actor | Happy path | Alternate | Exception |
|-------|-----|-------|------------|-----------|-----------|
| **UC-SET-DEF-01** | Cấu hình thông số thuế pháp nhân | C&B | Settings → Lương → Thông số thuế → sửa key (vd. `pay_tax_personal_deduction_vnd`) → Lưu 2xx → F5 còn | Copy từ holding template (group publish GĐ2) | Thiếu quyền C&B → 403; invalid JSON → 400 VI |
| **UC-SET-DEF-02** | Cấu hình tỷ lệ BH theo pháp nhân/OU | C&B | Settings → BH → thêm/sửa row `insurance_type_key` + % + trần + `effective_from` → Lưu → F5 | Version mới khi đổi % — kỳ cũ giữ snapshot | Overlap effective → 409; silent 0% → **FAIL** V-13 |
| **UC-SET-DEF-03** | CRUD danh mục PC/KT | HCNS | Settings → PC/KT → Tạo mã mới (nature + taxable/SI flags) → 2xx → F5 → catalog list | Ngừng theo dõi (soft) — picker ẩn | Trùng code active → 409; catalog trống → CTA not block other modules |
| **UC-SET-DEF-04** | Map PC mặc định theo vị trí | C&B | Chọn `position_key` (catalog) → thêm dòng PC (picker) + amount/calc_mode → Lưu → F5 | OU scope: policy chỉ áp OU được chọn | PC code không tồn tại catalog → 400; free-text position → reject (BR-HRM-MD-01) |
| **UC-SET-DEF-05** | Gợi ý PC khi tuyển/hire/đổi vị trí | System + C&B | Hire-link / đổi `position_key` → prefill C&B `allowances_json` từ policy effective date → C&B **xác nhận** Lưu | NV đã có C&B history → **chỉ** suggest diff, không overwrite (BR-AMIS-PAY-SRC-02) | Không policy → empty suggest OK; không auto-save without C&B |
| **UC-SET-DEF-06** | PAY process đọc rate CFG | System | Process kỳ → pick `pay_insurance_rate_cfg` active for period → snapshot on payslip | Multi OU → resolve company_id scope ladder | Missing rate → explicit VI / block process — **cấm** 0% silent |

### 4.1 As-is vs to-be

| Axis | As-is | To-be (GĐ1 DOC) |
|------|-------|-----------------|
| PC catalog | Mix settings-catalogs / không dual-bind PAY | Open catalog + **bind** `salary_components` (AC-PLT-PAY-01) |
| Position PC | Không policy table; free-text position risk | `hrm_position_compensation_policy` + picker |
| Tax defaults | Sparse `hrm_company_settings`; formula may hardcode | Key registry + typed JSON; **cấm** Nest const |
| SI rates | Paper `pay_insurance_rate_cfg` | Settings CRUD + effective-dated + process snapshot |
| Apply hire | Manual C&B entry | Suggest from position policy → C&B confirm |
| Precedence | Undefined vs template/catalog | Employee C&B **wins** (SRC-02) over position default |

---

## 5. Business rules (delta)

| BR id | Condition | Action | Outcome | Fail if |
|-------|-----------|--------|---------|---------|
| **BR-AMIS-SET-DEF-01** | Admin saves company/OU **tax param** key in registry | Upsert `hrm_company_settings` typed value; PAY/formula reads registry — **not** FE constant | Preview/process uses saved value after F5 | FE hardcode GTGC/deduction; Nest `%` fallback (align SRC-05) |
| **BR-AMIS-SET-DEF-02** | Admin saves **SI rate** row | Insert versioned `pay_insurance_rate_cfg`; status active; soft-delete retire | Process picks row where `effective_from` ≤ period end; snapshot id on payslip | Silent 0% employer/employee; overlap without policy |
| **BR-AMIS-SET-DEF-03** | PC/KT catalog item saved active | Row in allowance catalog + **mirror/link** `salary_components.code` (dual SoT) | PAY picker + policy lines use same code | Orphan catalog — policy references code absent in PAY catalog |
| **BR-AMIS-SET-DEF-04** | Position policy line saved | `(company_id, ou_id?, position_key, component_code, amount/calc_mode, effective_from)` unique active | Hire/position-change suggest builds `allowances_json` draft | Free-text `position_key`; amount without component_code |
| **BR-AMIS-SET-DEF-05** | Employee has effective **C&B version** with allowance amounts | PAY/C&B use employee version — **ignore** position default for that component | Line amount = employee history (SRC-02) | Position policy overwrites employee fixed PC on process |
| **BR-AMIS-SET-DEF-06** | Scope list policy / rate / catalog | Same `resolveHrmListScope` as module consumer; OU filter when `ou_id` set | Group CEO rollup vs member CEO isolation per ADR scope | 409 scope mismatch on Settings load |
| **BR-AMIS-SET-DEF-07** | Retire/delete config row | Soft-delete / status retired — **no** hard delete | History FK + issued payslip snapshots intact | Hard delete breaking payroll audit |
| **BR-AMIS-SET-DEF-08** | Catalog effective items > 0 for PC | Consumer (policy, C&B form) **picker only** (BR-PLT-02) | Reject free-text component code as SoT | Input mã PC tự do khi catalog đã có rows |

### 5.1 OU / position resolution

```mermaid
sequenceDiagram
  autonumber
  actor CB as C&B
  participant SET as Settings defaults
  participant POL as Position policy
  participant CBH as Employee C&B
  participant PAY as PAY process

  CB->>SET: Lưu PC catalog + SI rate + position map
  Note over SET: Option B catalog rows scoped company/OU

  CB->>CBH: Hire / đổi vị trí — mở C&B
  CBH->>POL: Resolve position_key + OU + effective_date
  POL-->>CBH: Suggested allowance lines (prefill)
  CB->>CBH: Xác nhận / chỉnh → Lưu version

  PAY->>CBH: Process kỳ — read effective C&B
  alt Employee allowance present
    PAY-->>PAY: Amount from CBH (SRC-02)
  else No employee line
    PAY->>POL: Fallback position default (suggest-only class — optional GĐ1 warn)
    Note over PAY: GĐ1 prefer explicit C&B save; fallback = P2 if sponsor waives
  end
  PAY->>SET: Snapshot pay_insurance_rate_cfg active version
```

**GĐ1 default:** Position policy **primarily** drives **hire prefill** + contract merge hints — **not** silent runtime override of saved employee C&B (align AMIS «lịch sử lương» > defaults).

---

## 6. Acceptance criteria (measurable · U65)

> Browser-only · zero-seed · FE sau 2xx + F5 · persona `ceo@xe.vn` holding or C&B role · **cấm** seed PC/policy.

| AC id | Domain | Pass (measurable) | Fail |
|-------|--------|-------------------|------|
| **AC-AMIS-SET-TAX-01** | SETTINGS | Settings → Lương → Thông số thuế → đổi `pay_tax_personal_deduction_vnd` (or registered key) → PUT **2xx** → **F5** → value còn → preview/process variable bag reflects change (probe or payslip meta) | Magic FE constant; F5 mất; only curl PASS |
| **AC-AMIS-SET-SI-01** | SETTINGS/PAY | Settings → BH → tạo/sửa `BHXH` row (NV 8% / CTY 17.5% example) + `effective_from` → **2xx** → F5 → process kỳ preview shows SI amounts ≠ 0 using that cfg | Silent 0%; rate not in snapshot |
| **AC-AMIS-SET-PC-CAT-01** | SETTINGS | Settings → PC/KT → **Tạo** mã `PC_DIEU_XE` (nature income) → **2xx** → F5 list → Lương → Thành phần lương **picker có** cùng mã (dual bind) | Orphan catalog; free-text TP code |
| **AC-AMIS-SET-POS-01** | SETTINGS/EMP | Map `position_key=DRIVER` → PC_DIEU_XE amount X → Lưu → **F5** → Hire/đổi CV DRIVER → C&B form **prefill** PC_DIEU_XE=X → C&B Lưu → F5 C&B còn | No prefill; auto-save without C&B confirm |
| **AC-AMIS-SET-POS-02** | EMP/PAY | NV có C&B PC=Y; position policy X → process line = **Y** not X (SRC-02) | Policy overwrites employee amount |
| **AC-AMIS-SET-SCOPE-01** | SETTINGS | Member CEO token → Settings defaults **chỉ** company slug; holding rollup per matrix — không 409 banner on load | 409 companyId mismatch |
| **AC-PLT-SET-02** (new) | SETTINGS | Retire PC catalog row → picker ẩn; **issued** payslip/history lines unchanged | Hard delete breaks FK |
| Reuse **AC-PLT-PAY-01** | PAY | TP chọn từ catalog khi catalog ≠ ∅ | Free-text SoT |
| Reuse **AC-PLT-SET-01** | SETTINGS | org_suffix class key pattern (CTR) applies same KV discipline to **pay_** keys | FE magic constant |

### 6.1 Journey pointers (QA dispatch)

| Journey | When LIVE |
|---------|-----------|
| **J-HRM-SET-DEF-01** | Settings tax+SI+PC catalog CRUD + F5 |
| **J-HRM-SET-DEF-02** | Position map → hire C&B prefill → PAY line (with formula wave) |
| Update `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` | When PM promotes matrix row |

---

## 7. Physical entity delta (handoff ba-data — cite paper)

| Entity | Action | Owner | Notes |
|--------|--------|-------|-------|
| `pay_insurance_rate_cfg` | **EXPAND** Settings API F.1 | ba-data | Already §5.4 DB_DESIGN — add API CRUD + VAL |
| `hrm_company_settings` | **ADD keys** `pay_tax_*` registry | ba-data | Pattern `leave_l1_max_days` / CTR CFG-01 |
| `allowance_deduction_types` (catalog master) | **ADD** / align settings-catalogs | ba-data | Dual FK `salary_components.code` |
| `hrm_position_compensation_policy` | **ADD** header + lines | ba-data | scope `company_id` · optional `ou_id` · `position_key` |
| `hrm_employee_compensation.allowances_json` | **KEEP** schema | — | Structured `[{ component_code, amount, calc_mode }]` |
| MergeToken `cb.allowance_*` | **ADD** register hook | platform BE | After PC catalog save (BR-PLT-01 class) |

**Cấm** this seat: DDL migration · `apps/**`.

---

## 8. Dependencies · open questions

| # | Item | Owner | Default |
|---|------|-------|---------|
| D1 | `PO-HRM-ALLOWANCE-CATALOG-SYNC-01` (ba-01 rank 8) dual SoT PC ↔ components | ba-data / sa | Blocks AC-AMIS-SET-PC-CAT-01 product |
| D2 | Formula/process wave for SI/tax **apply** on lines | PAYROLL-FORMULA-RUN-GAP | Tax may be formula-driven — keys feed vars only GĐ1 |
| D3 | EMP salary-history spec (`PO-HRM-EMP-SALARY-HISTORY-SPEC-01`) | ba-process | Overlaps SRC-02 — coordinate not duplicate |
| Q1 | Position default **runtime fallback** when employee C&B line missing — block vs warn vs use policy? | **pm/sponsor** | BA recommends: **GĐ1 = block/warn**; runtime fallback **P2** unless demo needs |
| Q2 | OU-specific policy vs company-wide only GĐ1? | sa | Recommend optional `ou_id` nullable — company default + OU override |
| Q3 | Group holding publish PC catalog to members? | pm | GĐ2 — parallel CTR library pattern |

---

## 9. Ranked follow-on work_items (PM)

| Rank | work_item_id | Owner | Why |
|------|--------------|-------|-----|
| 1 | `PO-HRM-ALLOWANCE-CATALOG-SYNC-01` | ba-data → sa | Dual SoT PC/KT ↔ `salary_components` — blocks orphan |
| 2 | `PO-HRM-SETTINGS-DEFAULTS-DATA-01` | ba-data | Physical policy table + tax key registry + rate CFG API |
| 3 | `PO-HRM-SETTINGS-DEFAULTS-API-01` | sa | F.1 Settings CRUD tax/SI/position-policy |
| 4 | `PO-HRM-EMP-SALARY-HISTORY-SPEC-01` | ba-process | Employee C&B timeline — SRC-02 consumer |
| 5 | Dev FE Settings surfaces | dev-fe | After API — U65 AC block |
| 6 | QA `J-HRM-SET-DEF-*` | qa | After L0 + FE mount |

**Preserve (must_keep):** Option B platform · BR-AMIS-PAY-SRC-02 · AC-PLT-PAY-01 · soft-delete · scope ladder · U65 · CTR CFG KV pattern · **cấm** Nest tenant % constants.

---

## completion_report

### Closed

1. Gap class **GAP P1** for Settings «Thông số mặc định» from ba-01 — decomposed to tax · SI · PC catalog · position policy.
2. **Platform Option B** layer map (Catalog / FormSchema / MergeToken) for SETTINGS vertical.
3. **UC-SET-DEF-01..06** with happy/alternate/exception paths.
4. **BR-AMIS-SET-DEF-01..08** condition → action → outcome.
5. **AC-AMIS-SET-*** measurable U65 set + reuse AC-PLT-PAY-01 / AC-PLT-SET-01.
6. Physical entity handoff table for ba-data (cite paper — no DDL).
7. AMIS public help principles only · no `apps/**` · honesty locks.

### Residual

- Product LIVE / Settings UI mount **not** claimed.
- Dual SoT PC catalog (`ALLOWANCE-CATALOG-SYNC`) still P0 dependency.
- Sponsor Q1 runtime fallback vs hire-prefill-only.
- DOC-DELTA Enterprise SRS FR (optional `FR-UC-BP-SET-DEF-01`) — **not** this seat (ba-docs after CONFIRM).

### Explicit non-claims

- Not AMIS parity DONE.
- Not `payroll_e2e_ready=true`.
- Not Step1 AMIS UAT-ready.

---

## next_owner

**pm** (dispatch) · **ba-data** (physical + catalog sync)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ALLOWANCE-CATALOG-SYNC-01
from_role: pm
to_role: ba-data
lane: governance
parent: PO-HRM-AMIS-PARITY-RESEARCH-01
priority: P0
change_mode: ADD

## Goal
Physical + API contract: allowance_deduction_types (settings-catalog) ↔ salary_components dual SoT — unblocks AC-AMIS-SET-PC-CAT-01 · BR-AMIS-SET-DEF-03. Cite po-hrm-amis-parity-settings-defaults-ba-01.md §7.

## read_first
1. docs/qa/evidence/po-hrm-amis-parity-settings-defaults-ba-01.md
2. docs/qa/evidence/po-hrm-amis-parity-ba-01.md §1 EMP PC/KT row
3. docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §5.x salary_components
4. ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md Option B

## exit
PASS_TO_PM · evidence docs/qa/evidence/po-hrm-allowance-catalog-sync-data-01.md · no apps/** · payroll_e2e_ready=false
```

**Parallel (after catalog sync paper):**

```text
work_item_id: PO-HRM-SETTINGS-DEFAULTS-DATA-01
from_role: pm
to_role: ba-data
lane: governance
parent: PO-HRM-AMIS-PARITY-SETTINGS-DEFAULTS-BA-01
priority: P1

## Goal
DB_DESIGN + API_DESIGN delta: pay_insurance_rate_cfg CRUD · hrm_company_settings pay_tax_* registry · hrm_position_compensation_policy (+ lines) · VAL effective-date overlap.

## read_first
docs/qa/evidence/po-hrm-amis-parity-settings-defaults-ba-01.md §5–§7

## exit
PASS_TO_PM · evidence docs/qa/evidence/po-hrm-settings-defaults-data-01.md · no apps/**
```

---

## evidence_path

`docs/qa/evidence/po-hrm-amis-parity-settings-defaults-ba-01.md`

## ack_status

**PASS_TO_PM**
