# Evidence — PO-HRM-PAY-CNTT-LINKAGE-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-LINKAGE-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | governance · read-only code+spec audit |
| **parent** | `PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01` |
| **date** | 2026-08-11 |
| **method** | Browser-free: grep `apps/web/hrm`, `apps/api/hrm-api`, SRS/trace BA artifacts |
| **commit context** | `dc930c5` era (same as peer PAY/CTR waves) |
| **ack_status** | **PASS_TO_PM** |
| **honesty** | `payroll_e2e_ready=false` · **C-SLICE ≠ module** · **≠** CNTT pack UAT · U65 zero-seed |

---

## 0. Read ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` § payroll · J-HRM-PAY-* · P-CC-08 | L2/L2.5 context · honesty flags |
| 2 | `docs/hrm/ui-screens/UI-PAYROLL-CLUSTER-EMBED.md` | PAY-09 cluster UI↔API map |
| 3 | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-ba-01.md` § traceability | Formula/run gap classes · AC pack |
| 4 | `docs/program/PO_HRM_PAY_XEVN_CUSTOMER_CNTT_INTAKE_01.md` | 6 mô hình khách · linkage program goal |
| 5 | `apps/web/hrm/src/pages/Payroll.tsx` · `settingsNavigation.ts` · `payroll.controller.ts` | Menu vs route vs API inventory |

---

## 1. Executive summary (CNTT lens)

XeVN khách **P.CNTT** cần **≥6 mẫu bảng lương** + policy theo BP (ĐPHH, TĐHK, LX, LXT, VP tỉnh, thời gian) + **input pack** (KPI, doanh thu, CPSC, DLL…). Product hiện có **xương sống** period/enroll/ATT-bind + catalog TP/`pay_types` + metadata formula API — nhưng **phần lớn menu Lương** vẫn là **stub UI**, **tách rời** input nghiệp vụ khách, hoặc **chưa nối** closed-sheet vars → evaluate → payslip lines trên luồng U65.

| Lớp linkage | Trạng thái tổng | Blocker CNTT |
|-------------|-----------------|--------------|
| **Settings → Catalog** (`pay_types`, `salary_components`) | **PARTIAL PASS** (narrow) | Thiếu policy pack theo OU; O4 density `salary_components` carry |
| **Settings → Mẫu bảng lương** | **PARTIAL** | 1 tenant catalog — **không** 6+ mẫu Excel khách |
| **ATT closed → PAY period** | **PASS** (slice PAY-01) | Chưa chứng minh đúng tháng/pháp nhân cho mọi mô hình |
| **EMP/C&B → formula bag** | **PARTIAL** | `evaluateBoundFormula` cần C&B package — browser E2E process **UNTESTED** |
| **Formula author → process → lines** | **FAIL / HOLD** | Engine có trên BE; UAT run + lines từ CT active **chưa** PASS module |
| **Input pack (KPI/sales/DLL)** | **ORPHAN** | BE `input-lines` có; **0** FE surface; sales-data **không** feed process |
| **RD/CORE-08 → payroll_link** | **PARTIAL** | Enforce linked — process consume **UNTESTED** |

---

## 2. Inventory — menu Lương (`/payroll`)

**Shell:** `apps/web/hrm/src/pages/Payroll.tsx` · route `/payroll` · embed P-CC-08 `UF-HRM-06`.

### 2.1 Top tabs

| Menu (VI) | Tab id | FE component | Primary API(s) | Linkage | QA slice |
|------------|--------|--------------|----------------|---------|----------|
| Tổng quan | `overview` | inline charts/cards | **none** (hardcoded `getSalaryDistributionData` / Recharts) | **ORPHAN** vs Nest | **FAIL** mock ≠ khách |
| Thành phần lương | `components` | `SalaryComponentsTab` | `GET/POST/PATCH/DELETE /payroll/salary-components` · Settings `pay_types` via `CatalogSearchPicker` | **Settings catalog** + Nest TP instance | **PASS** narrow `J-HRM-PAY-E2-01` · `PTPAYQC1-MSNPHTECQC1` |
| Công thức lương | `formulas` | `PayFormulaAuthorPanel` | `GET/POST/PUT /payroll/formulas*` · preview/evaluate | **Formula** metadata · dual-control | **PARTIAL** — API+FE GWC slices; **≠** LIVE process UAT |
| Chính sách | `policy` | dropdown → §2.2 | mixed | mixed | mixed |
| Dữ liệu | `data` | dropdown → §2.3 | mixed | **ATT / sales** partial | mixed |
| Tính lương | `calculate` | dropdown → §2.4 | `periods*` · enroll · process | **ATT** + **EMP** eligibility | **PASS** enroll/bind slices · **UNTESTED** full process+lines |
| Chi trả | `payment` | `PaymentBatchesTab` | `payment-batches*` · `wire-payment-batch` | payslip processed | **UNTESTED** browser U65 |
| Phiếu của tôi | `ess` | `EssPayslipsPanel` | `GET/POST /payroll/me/payslips*` | **EMP** self | **PARTIAL** BE GWC · FE **UNTESTED** |
| Báo cáo | `reports` | `PayrollPayslipsApiTab` | `GET /payroll/payslips` | read-only payslip | **PARTIAL** L2 P-CC-08 list |

### 2.2 Chính sách — sub-menu

| Sub-menu | id | Component | API | Linkage | Verdict |
|----------|-----|-----------|-----|---------|---------|
| Chính sách thuế | `tax` | `TaxPolicyTab` | Settings `pay_tax_*` company-settings | Settings defaults peer | **PARTIAL** · không bind kỳ CNTT |
| Chính sách BH | `insurance` | `InsurancePolicyTab` | insurance policies + `SettingsDefaults` SI | Settings `si-insurance-types` | **PARTIAL** |
| Phân nhóm bảng lương | `payroll-groups` | `PayrollGroupsCatalogTab` | `/payroll/groups*` | PAY-09 catalog | **PASS** narrow `J-HRM-PAY-09-01` no-F5 |
| Chính sách phụ cấp | `allowance` | stub card `pay-allowance-stub-precision` | — | — | **ORPHAN** |
| Chính sách thưởng | `bonus` | `BonusPolicyTab` | `useBonusPolicies` hook | policy CRUD | **UNTESTED** · không ↔ process |
| Tổng hợp doanh số | `sales` | `SalesDataTab` | `/api/hrm/sales-data` | isolated table | **PARTIAL** FE+BE · **không** → `input-lines` / formula |

### 2.3 Dữ liệu — sub-menu

| Sub-menu | id | Component | API | Linkage | Verdict |
|----------|-----|-----------|-----|---------|---------|
| Dữ liệu chấm công | `data-attendance` | `PayrollAttendanceTab` | `useAttendanceSheets` / ATT APIs | **ATT** read/write sheets trong shell PAY | **PARTIAL** — duplicate ATT UI; **≠** ATT-11 close SoT trong module Chấm công |
| Dữ liệu doanh số | `data-sales` | `SalesDataTab` | `/sales-data` | standalone | **PARTIAL** · CNTT KPI/DLL **MISSING** |
| KPI / Sản phẩm / Thu nhập khác / Khấu trừ | `data-kpi` … | stub `pay-data-stub-precision` | — | — | **ORPHAN** (CNTT ĐPHH/TĐHK/LX) |

### 2.4 Tính lương — sub-menu

| Sub-menu | id | Component | API | Linkage | Verdict |
|----------|-----|-----------|-----|---------|---------|
| Lập bảng lương | `calc-create` | default stub | — | — | **ORPHAN** (create thực tế nằm trong `PayrollBatchesTab`) |
| Danh sách bảng lương | `calc-list` | `PayrollBatchesTab` (always — `resolveCalcListTabComponent` → `batches`) | `periods` · `eligibility` · `enroll` · `process` · `timesheet-binds` · `bind-sheet-template` | **ATT** closed bind · **EMP** active · **Settings** pay-sheet-template | **PASS** hire enroll `AC-PAY-HIRE-04/05` · PAY-01 bind/412 · **UNTESTED** `AC-PAY-RUN-06/07` |
| Tạm ứng | `calc-advance` | `AdvanceRequestsTab` | `advance-requests*` · `bridge-to-period` | period input pack (BE) | **UNTESTED** U65 |
| Mẫu lương (enroll pack) | `calc-template` | `SalaryTemplatesTab` | `salary-templates*` | **≠** mẫu bảng kỳ (`pay-sheet-templates`) | **PARTIAL** — AMIS enroll pack; CNTT cần **pay-sheet-tpl** |
| Quyết toán thuế | `calc-tax-settlement` | honesty card `pay-tax-settlement-honesty-precision` | — | — | **HOLD** (no invent) |

**Nested trong batch detail:** `PayrollPeriodTimesheetBindPanel` · `PayrollPeriodGroupScopePanel` — wire ATT bind + PAY-09 group scope.

---

## 3. Inventory — Cài đặt / Thiết lập (payroll-related)

**SoT menu:** `apps/web/hrm/src/lib/settingsNavigation.ts` · route `/settings?tab=`.

### 3.1 Nhóm «Lương» (Settings)

| Menu | tab id | Panel | API | Linkage | Verdict |
|------|--------|-------|-----|---------|---------|
| Mẫu bảng lương | `pay-sheet-tpl` | `PaySheetTemplateSettingsPanel` | `/payroll/pay-sheet-templates*` | bind period · lines ↔ `salary_components` | **PARTIAL** — AMIS parity BE GWC; **multi-OU CNTT MISSING** |
| Mặc định thuế/BH/PC | `settings-defaults` | `SettingsDefaultsPanel` | `company-settings` · `insurance-rate-cfg` · `position-compensation-policies` | Settings + **EMP** position resolve (SRC-02) | **PASS** narrow Settings UF · **≠** per-BP policy pack |

### 3.2 Catalog / master (payroll consumers)

| Menu | tab id | Payroll keys | API | Consumer on PAY | Verdict |
|------|--------|--------------|-----|-----------------|---------|
| Danh mục (sync) | `catalogs` | `pay_types`, `salary_components`, `payroll_templates` | `/settings-catalogs` | `SalaryComponentsTab` picker · formula seed | **PASS** `pay_types` consumer · **carry** O4 `salary_components` density |
| Danh mục nghiệp vụ | `master-data` | bucket `pay` → link `/payroll` | overview + XBOS sync | redirect only | **PARTIAL** — dictionary vs instance split đúng SRS |

### 3.3 Chấm công Settings (ATT → PAY precondition)

| Menu | tab id | PAY linkage | Verdict |
|------|--------|-------------|---------|
| Loại phép | `att-leave-types` | eligibility hours indirect | **PASS** consumer ATT · PAY vars **UNTESTED** |
| Mã chấm công | `att-attendance-codes` | sheet columns | **PARTIAL** |
| Loại OT / Chi trả OT | `att-ot-types` · `att-ot-comp-types` | display coeff ≠ formula (honest) | **PARTIAL** · OT vars to engine **UNTESTED** |

---

## 4. Inventory — EMP / hồ sơ (payroll touchpoints)

| Surface | Path / tab | Component | API | Linkage | Verdict |
|---------|------------|-----------|-----|---------|---------|
| Hồ sơ NV → Lương & thu nhập | `EmployeeProfile` `salary` | `EmployeeSalary` | `GET /payroll/payslips` | payslip read | **PARTIAL** UF-HRM-06 |
| Hồ sơ NV → Hợp đồng → Đãi ngộ | `EmployeeCompensationPanel` | compensation packages | `employee-compensation` | **EMP/C&B** → formula `base_salary` bag | **PARTIAL** · process evaluate **UNTESTED** U65 |
| Khen thưởng/Kỷ luật | `EmployeeRewardsDiscipline` | enforce + `payroll_link_status` | rewards/discipline + period list | **CORE-08** → PAY period | **PARTIAL** GWC slice · payroll consume **UNTESTED** |
| Tuyển dụng → offer | `CandidateAcceptOfferDialog` | hire chain | REC → EMP | **REC→EMP** hire precondition | **BLOCKED** FE hire chain (CTR wave carry) |

---

## 5. API spine (Nest `payroll.controller.ts`) — FE coverage

| API family | Implemented BE | FE wired | CNTT need | Gap |
|------------|----------------|----------|-----------|-----|
| `periods` CRUD/close/process | yes | `PayrollBatchesTab` | all models | process+lines **UNTESTED** U65 |
| `timesheet-binds` | yes | bind panel | closed ATT | **PASS** PAY-01 slice |
| `input-lines` | yes | **none** | KPI/DLL/revenue columns | **ORPHAN** — P0 CNTT |
| `eligibility` / `enroll` | yes | batches tab | hire mid-month | **PASS** narrow enroll |
| `salary-components` | yes | `SalaryComponentsTab` | TP catalog | **PASS** narrow |
| `formulas` | yes | `PayFormulaAuthorPanel` | 6 CT/mô hình | **PARTIAL** metadata ≠ customer LIVE |
| `pay-sheet-templates` | yes | Settings + period bind | 6 mẫu Excel | **MISSING** multi-template UX |
| `salary-templates` (enroll pack) | yes | `SalaryTemplatesTab` | ≠ sheet layout | naming confusion risk |
| `groups` | yes | `PayrollGroupsCatalogTab` | OU filter | **PASS** narrow |
| `payslips` / `lines` | yes | list/detail/ESS/print | phiếu khách | lines from evaluate **UNTESTED** |
| `advance-requests` | yes | `AdvanceRequestsTab` | tạm ứng LXT | **UNTESTED** |
| `payment-batches` / `wire-payment-batch` | yes | payment tabs | chi trả | **UNTESTED** |
| `sales-data` | yes (extensions) | `SalesDataTab` | doanh thu | **not linked** to PAY engine |

---

## 6. Linkage matrix — BA/SA feed (CNTT × pillar)

**Pillars:** **ATT** = bảng công chốt · **EMP** = hồ sơ/C&B · **SET** = Settings/catalog · **FRM** = công thức · **INP** = input pack khách · **OUT** = kỳ/phiếu/chi trả.

| CNTT capability (pack P.CNTT) | Product row | ATT | EMP | SET | FRM | INP | OUT | QA |
|---------------------------------|-------------|-----|-----|-----|-----|-----|-----|-----|
| Thang lương / QĐ chung | Settings defaults + position policy | — | partial | partial | — | — | — | **UNTESTED** |
| Policy theo BP (7 PDF ĐPHH…) | — | — | — | **MISSING** | — | — | — | **FAIL** |
| Mẫu bảng theo OU (6+ Excel) | `pay-sheet-tpl` | — | — | partial | bind | — | period | **FAIL** multi-template |
| Thành phần / bản chất TP | `components` + catalogs | — | — | **PASS** narrow | picker | — | — | **PASS** `PTPAYQC1` |
| Công thức theo mẫu | `formulas` | — | C&B bag | comp codes | partial | — | process | **FAIL** UAT run |
| DLL / KPI / CPSC / doanh thu | data-* stubs + sales-data | partial | — | — | vars | **ORPHAN** | — | **FAIL** |
| Bảng công → kỳ | batches + bind | **PASS** slice | elig | — | 412 gate | — | enroll | **PASS** PAY-01 |
| Tuyển → kỳ → phiếu | batches enroll | ATT | hire | — | — | — | payslip | **PARTIAL** |
| Khen thưởng → kỳ | RD enforce | — | link | period | — | — | line | **UNTESTED** |
| Chi trả / tạm ứng | payment / advance | — | — | — | — | partial | batch | **UNTESTED** |

---

## 7. Verdict rollup (UNTESTED / FAIL / PASS / HOLD)

| Class | Count (approx.) | Examples |
|-------|-----------------|----------|
| **PASS** (narrow C-SLICE) | 6 | `pay_types` consumer · PAY-01 bind/412 · enroll AC-04/05 · PAY-09 group create · Settings defaults UF |
| **PARTIAL** | 12 | TP catalog · pay-sheet-tpl · formula panel · ATT data tab · sales-data · EMP compensation · ESS BE |
| **UNTESTED** | 9 | process→lines U65 · payment wire · advance bridge · bonus policy · OT→vars · full J-HRM-PAY-02..08 |
| **FAIL** | 5 | overview mock · allowance/data-kpi stubs · CNTT multi-policy · input-lines no FE · module formula LIVE |
| **HOLD** | 2 | tax settlement honesty · `payroll_e2e_ready` program false |

**L2.5 note:** Không chạy browser wave này (governance audit). J-HRM-PAY-* rows trong `PILOT_BUSINESS_FLOW_BA_TRACE.md` §63–71 giữ nguyên — **L2 PASS alone ≠ linkage PASS**.

---

## 8. Residual → owners (for CNTT synth)

| ID | Gap | Owner | Priority |
|----|-----|-------|----------|
| R-CNTT-POLICY-PACK | Policy fragment per BP (PDF) → Settings/module | **ba-process** | P0 |
| R-CNTT-DATA-MAP | Excel columns → `input-lines` / entities | **ba-data** | P0 |
| R-CNTT-MULTI-TPL | ADR multi pay-sheet-template + formula bind per OU | **sa** | P0 |
| R-CNTT-INP-FE | FE input pack (KPI/sales/DLL) → `input-lines` | **dev-fe** (after spec) | P1 |
| R-CNTT-PROCESS-UAT | `AC-PAY-RUN-06/07` browser after formula+C&B | **qa** | P0 after Dev |
| R-CNTT-ORPHAN-MENU | overview mock + data stubs — hide or wire | **pm** + **ba-process** | P2 UX honesty |

---

## completion_report

### Closed

1. Full inventory **top + dropdown** menus `/payroll` (9 tabs + 18 sub-items) vs FE components + Nest routes.
2. Settings **Lương** group (2) + payroll-related catalog/ATT consumers (7+).
3. EMP touchpoints (salary tab, C&B, RD payroll_link).
4. Per-row linkage: **ATT | EMP | Settings | Formula | orphan/stub** + **PASS|FAIL|UNTESTED|HOLD**.
5. CNTT × pillar matrix for **ba-process / ba-data / sa** intake wave.
6. No `apps/**` edits · no seed · no `payroll_e2e_ready` flip.

### Residual (open)

- Browser retest `AC-PAY-RUN-*` + `AC-PAY-FORMULA-*` after SA/BA delta (not this WI).
- Multi-template + input pack = **P0 product gap** vs pack P.CNTT — governance only here.

---

## next_owner

**pm** — synth with `PO-HRM-PAY-CNTT-BA-PROCESS-01` / `BA-DATA-01` / `SA-01`; then W1 ba-docs delta if P0 confirmed.

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-PAY-CNTT-SYNTH-PM-01
from_role: pm
to_role: pm
lane: governance
parent: PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01

## Goal
Merge QA linkage matrix into BA/SA deliverables; lock P0 rows for delta SRS + ADR multi-template.

## read_first
1. docs/qa/evidence/po-hrm-pay-cntt-linkage-qa-01.md (this file) §5–§8
2. docs/qa/evidence/po-hrm-pay-cntt-ba-process-01.md (when ready)
3. docs/qa/evidence/po-hrm-pay-cntt-ba-data-01.md (when ready)
4. docs/qa/evidence/po-hrm-pay-cntt-sa-01.md (when ready)

## exit_criteria
- Single synthesis table: CNTT fragment → menu/API row → owner Dev or waiver
- Dispatch W1 ba-docs only if sponsor scope ADD confirmed
- Retain payroll_e2e_ready=false
```

---

## evidence_path

`docs/qa/evidence/po-hrm-pay-cntt-linkage-qa-01.md`
