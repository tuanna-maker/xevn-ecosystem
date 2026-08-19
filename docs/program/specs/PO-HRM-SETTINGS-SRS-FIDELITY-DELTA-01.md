# PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01 — Cài đặt HRM: tab vs SRS/TechSpec/API_DESIGN

| Meta | Value |
|------|--------|
| **work_item_id** | `BA-PO-HRM-SETTINGS-SRS-FIDELITY-01` |
| **Ngày** | 2026-08-10 |
| **SoT nav** | `apps/web/hrm/src/lib/settingsNavigation.ts` |
| **SoT render** | `apps/web/hrm/src/pages/Settings.tsx` |
| **SRS** | `docs/hrm/SRS.md` §16 (FR-HRM-SC-*) · UF-HRM-10 · FR-UC-BP-CORE-09a/09d · FR-UC-BP-REC-00* · AC-PLT-* |
| **TechSpec / IA** | `docs/program/specs/PO-HRM-SETTINGS-IA-UX-REMasters-SPONSOR-01.md` |
| **API** | `docs/hrm/API_DESIGN_HRM_SETTINGS_CATALOG.md` · `API_DESIGN_HRM_SETTINGS_E1B.md` |
| **UI guide** | `docs/program/specs/PO-HRM-FE-UI-SCREEN-SPEC-GUIDE-01.md` |
| **ack_status** | `PASS_TO_PM` |
| **BA delta pass** | `BA-PO-HRM-SETTINGS-SRS-FIDELITY-01` · 2026-08-11 · §6–§8 open AC/BR only (post `SETW3MUTQC1-MSNHB5QC1`) |

---

## 1. Phạm vi audit

- **In:** Mọi `SettingsTabId` trong `SETTINGS_NAV_GROUPS` + alias `contract-legal` → `contract-clauses`.
- **Out:** Mobile `profileSettingsNav` · Command Center menu ngoài `/hr/settings`.
- **Gap class (định nghĩa):**
  - **C-SPEC-SHALLOW** — Có màn/tab nhưng IA/AC/mutate/FE-after-2xx lệch SRS hoặc PAT-* (mock, dialog rỗng, layout sai).
  - **C-ORPHAN-SCREEN** — SRS/TechSpec yêu cầu màn/tab hoặc list→detail không tồn tại trong nav.
  - **C-SPINE-BREAK** — Catalog/Settings không nối consumer (picker, dual SoT, sync không feed form nghiệp vụ).

**P0 sponsor (2026-08-10):** `contract-templates` dialog · `jd-dynamic` vs thư viện JD · `catalogs`/`master-data` consumer · mutate catalog ATT/EMP/SI theo SRS.

---

## 2. Ma trận fidelity (tab → gap)

| Tab id | UC/FR | Spec says | Code does | gap class | owner | UI_SCREEN_SPEC needed |
|--------|-------|-----------|-----------|-----------|-------|----------------------|
| `account` | (Portal profile — ngoài FR-HRM-SC) | Hồ sơ user đăng nhập: sửa tên/email/avatar → Lưu → API 2xx → F5 | Card mock `Admin` / `admin@company.vn`; Lưu không gọi API | C-SPEC-SHALLOW | dev-fe | N |
| `branding` | Tenant branding (TechSpec portal) | Lưu logo/màu tenant → persist BE | `BrandingSettings` — không bind `hrmApi` (local/UI only) | C-SPEC-SHALLOW | dev-fe | N |
| `notifications` | Thông báo module | Toggle theo loại sự kiện → persist preference | `Switch` defaultChecked; không API | C-SPEC-SHALLOW | dev-fe | N |
| `security` | Đổi MK / 2FA | POST auth change-password / 2FA enrollment | Form password + Switch SMS; không API | C-SPEC-SHALLOW | dev-fe | N |
| `roles` | RBAC HRM/XBOS | Ma trận role×permission theo tenant scope | `RolesPermissionsTab` — hooks `useRolePermissionsManagement` (có API) | C-SPEC-SHALLOW | dev-fe + dev-be | N |
| `system` | Locale tenant | Ngôn ngữ/ TZ / date / currency → company settings | Language+currency localStorage; TZ/date Select không persist; Lưu không API | C-SPEC-SHALLOW | dev-fe | N |
| `subscription` | Gói SaaS | Subscription status / billing | `SubscriptionManagement` panel (cần QA wire) | C-SPEC-SHALLOW | dev-fe | N |
| `catalogs` | **UF-HRM-10** · FR-HRM-08 sync | Overview nhóm DM + pull XBOS + extension CRUD; **consumer** form bind key sau sync | `SettingsCatalogsTab`: overview + sync + upsert; **không** audit consumer matrix; `settings_catalog_e2e_ready=false` (SRS honesty) | **C-SPINE-BREAK** | dev-fe + ba-data | **Y** (`UI-SETTINGS-CATALOGS-SYNC.md`) |
| `master-data` | **FR-HRM-SC-SET-UI-01** · FR-HRM-SC-POS/LEAVE/DEC/PAY-TYPE/CT/ET… | ≥10 bucket; search mã/nhãn; dialog/shell đồng bộ W3; alias `hr_decision_types` | `MasterDataSettingsPanel`: 14 bucket + search per tab; **chưa** `SettingsCatalogScreenShell`; JT/PAY deep-link stub; trùng vai `leave_types` vs tab ATT Nest | **C-SPINE-BREAK** | dev-fe | Y (wave W4) |
| `jd-dynamic` | **UC-BP-REC-00a–00f** (Q1 Settings) | Tab **cấu hình** field/group/pack/rule @ Cài đặt | `JdDynamicSettingsPanel` — đủ CFG tabs nội bộ | C-SPEC-SHALLOW | dev-fe | N (CFG) |
| *(missing)* `jd-master-list` | **FR-UC-BP-REC-00** · **FR-HRM-SC-JT-01** | **Thư viện JD master**: list mã/tên → detail writer (pack, group DnD) — tách khỏi Q1 CFG | **Không có tab** trong `settingsNavigation.ts`; writer chỉ `JobTemplatesTab` Tuyển dụng | **C-ORPHAN-SCREEN** | dev-fe | **Y** (`UI-SETTINGS-JD-MASTER-LIST.md`) |
| `contract-clauses` | **FR-UC-BP-CORE-09a** · AC-CTR-CL-01 | List + nhóm trái + search + **dialog** mutate; không gộp mẫu/publish | `view=clauses`: shell + group nav + clause dialog (W1) | — (PASS slice) | dev-fe | **Y** (QA U76) |
| `contract-templates` | **FR-UC-BP-CORE-09d** · PAT-CTR-TEMPLATE-COMPOSER-01 | List + search; **Sửa/Thêm = một surface** (dialog hoặc full-page) chứa meta + palette + canvas DnD + Lưu | List shell OK; **Dialog chỉ tiêu đề + Đóng**; composer DnD nằm **Card dưới list**, mở Sửa vẫn tách dialog/composer | **C-SPEC-SHALLOW** | dev-fe | **Y** (`UI-SETTINGS-CTR-TEMPLATE-COMPOSER.md`) |
| `contract-number-config` | CFG số HĐ (CORR-01 / XEVN open catalog) | Chỉ org_suffix + pattern + Lưu | `view=number-config`: CFG card tách (W1) | C-SPEC-SHALLOW | dev-fe | N |
| `contract-library-publish` | Publish holding / member pull | Chỉ publish + version table | `view=library-publish` tách | C-SPEC-SHALLOW | dev-fe | N |
| `merge-tokens` | **FR-PLT-TOK** · AC-PLT-CTR-05 | List + dialog (PAT-SETTINGS-CATALOG-01) | `MergeTokenSettingsPanel` + shell | — (PASS pattern) | dev-fe | N |
| `rec-pipeline-stages` | **F-REC-CAT-STG** · AC-PLT-REC-02..05 | Catalog shell + dialog + F5 | `RecPipelineStageSettingsPanel` W3 | C-SPEC-SHALLOW | dev-fe | N |
| `att-leave-types` | **AC-PLT-ATT-LEAVE-01*** · **FR-HRM-SC-LEAVE-01** (dual) | Nest `F-ATT-CAT-LVT` admin + U65 mutate retire; consumer picker; **một** SoT loại nghỉ | Panel Nest + shell+dialog **đúng mẫu**; **song song** `leave_types` trên master-data (settings-catalogs) — consumer đơn nghỉ vs MD có thể lệch | **C-SPINE-BREAK** | dev-fe + dev-be + ba-data | **Y** |
| `att-attendance-codes` | **AC-PLT-ATT-CODE-01*** · F-ATT-CAT-CODE | Shell + dialog + invent KEY rules | W3 shell | C-SPEC-SHALLOW | dev-fe | N |
| `att-ot-types` | **AC-PLT-ATT-OT-01*** · F-ATT-CAT-OT | Shell + dialog + EFF peer | W3 shell | C-SPEC-SHALLOW | dev-fe | N |
| `att-ot-comp-types` | **AC-PLT-ATT-COMP-01*** · F-ATT-CAT-OTC | Shell + dialog | W3 shell | C-SPEC-SHALLOW | dev-fe | N |
| `emp-document-types` | **AC-PLT-EMP-02/03** · F-EMP-CAT-DOC | Shell + dialog + soft-retire + F5 | W3 shell | — (PASS pattern) | dev-fe | N |
| `emp-employment-types` | **AC-PLT-EMP-01** · F-EMP-CAT-ET | Shell + dialog | W3 shell | C-SPEC-SHALLOW | dev-fe | N |
| `emp-employment-statuses` | **F-EMP-CAT-ST/STR** | Shell + dialog (2 sub-catalog) | W3 shell (2 panels) | C-SPEC-SHALLOW | dev-fe | N |
| `dec-decision-types` | **FR-HRM-SC-DEC-01** · AC-SC-DEC-ALIAS-* | Shell + alias keys | W3 shell | C-SPEC-SHALLOW | dev-fe | N |
| `si-insurance-types` | **AC-PLT-SI-INS-01d** · F-SI-CAT-TYP | Shell + dialog | W3 shell | C-SPEC-SHALLOW | dev-fe | N |
| `si-insurers` | **AC-PLT-SI-INSURER-01d** · F-SI-CAT-INS | Shell + dialog | W3 shell | C-SPEC-SHALLOW | dev-fe | N |
| `pay-sheet-tpl` | Payslip template admin | List + dialog pattern | `PaySheetTemplateSettingsPanel` + shell | C-SPEC-SHALLOW | dev-fe | N |
| `settings-defaults` | **UC-SET-DEF-01..05** · F-SET-TAX/SI/POS | Tab 3 vùng thuế/BH/PC → Lưu 2xx → F5; picker Loại BH từ SI catalog | `SettingsDefaultsPanel` — API wired; SI picker bind EFF | C-SPEC-SHALLOW | dev-fe | N |

---

## 3. P0 — hành động Dev-FE (tóm tắt)

| Priority | Tab / artifact | Acceptance (rút gọn) |
|----------|----------------|------------------------|
| **P0** | `contract-templates` | Mở Sửa/Thêm → **palette + canvas + Lưu trong cùng Dialog** (hoặc full-page detail); đóng dialog = không mất composer orphan dưới list. Ref `PO-HRM-CTR-TPL-DIALOG-COMPOSER-FE-01`. |
| **P0** | `jd-master-list` (new tab) | Thêm nav «Thư viện JD»; list→detail writer theo `PO-HRM-JD-GROUP-SPEC-01.md` §10; giữ `jd-dynamic` chỉ CFG. |
| **P0** | `catalogs` + consumers | Không chỉ tab sync: ma trận `catalog_key → màn consumer → AC chọn sau pull` (SRS §16 O4); CTA Settings khi empty. |
| **P0** | `att-leave-types` + MD | Làm rõ SoT: Nest LVT vs `leave_types` settings-catalogs — document + FE picker một đường; AC-PLT-ATT-LEAVE U65 giữ nguyên. |
| **P1** | `master-data` | W4: `SettingsCatalogScreenShell` + dialog parity Loại phép; không dual UX với PLT Nest nếu SRS chốt một SoT. |
| **P1** | Portal tabs | Wire account/security/system hoặc ghi OOS khách HRM embed. |

---

## 4. UI_SCREEN_SPEC pack (wave 01)

| File | Tab / màn |
|------|-----------|
| `docs/hrm/ui-screens/UI-SETTINGS-ATT-LEAVE-TYPES.md` | `att-leave-types` |
| `docs/hrm/ui-screens/UI-SETTINGS-CTR-CLAUSES.md` | `contract-clauses` |
| `docs/hrm/ui-screens/UI-SETTINGS-CTR-TEMPLATE-COMPOSER.md` | `contract-templates` |
| `docs/hrm/ui-screens/UI-SETTINGS-JD-MASTER-LIST.md` | `jd-master-list` (planned tab) |
| `docs/hrm/ui-screens/UI-SETTINGS-CATALOGS-SYNC.md` | `catalogs` |

Work item: `BA-PO-HRM-FE-UI-SCREEN-SPEC-PACK-01`.

---

## 5. Handoff (audit wave 2026-08-10)

| Field | Value |
|-------|--------|
| **completion_report** | Audit 28 tab ids + 1 orphan JD master; ma trận gap §2; 5 UI_SCREEN_SPEC §4; P0 mapped §3. |
| **evidence_path** | `docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` · `docs/hrm/ui-screens/UI-SETTINGS-*.md` |

---

## 6. Open fidelity — AC / BR (delta only · `BA-PO-HRM-SETTINGS-SRS-FIDELITY-01`)

**Parent RETAIN (cấm reopen slice):** `SETFIDQC1-MSN8VQ3L` · `SETW3MUTQC1-MSNHB5QC1` (8-tab mutate) · `ATTLVTSOTQC1-MSNGQC01` · `SETW3QC1-MSN9KGQC1` · `settings_catalog_e2e_ready=false`.

### 6.1 Ranh giới sweep W3 ~18 tab (`QA-PO-HRM-SETTINGS-W3-BROWSER-01`)

SoT inventory: `PO-HRM-SETTINGS-W3-UX-DENSITY-CONTINUOUS-01.md` § Wave W3 · honesty: `qc-po-hrm-settings-w3-mutate-gate-01.md` residual **W3-FULL-TAB-SWEEP**.

| Lớp | Tab / UF | QA hành động | Ghi chú |
|-----|----------|--------------|---------|
| **SEALED — mutate re-run cấm** | `att-attendance-codes` · `att-ot-types` · `att-ot-comp-types` · `emp-document-types` · `emp-employment-types` · `emp-employment-statuses` · `si-insurance-types` · `si-insurers` | Regression chỉ khi bus hotfix P0 | Stamp `SETFID02W3-MSNHB5VD` / `SETW3MUTQC1-MSNHB5QC1` |
| **SEALED — smoke only** | `att-leave-types` | `UF-ATT-LVT-SMOKE` (REF + effective GET) — **không** mutate catalog ATT LVT | `ATTLVTSOTQC1-MSNGQC01` |
| **SEALED — SETFID P1** | 5 tab P1 + `contract-templates` composer-in-dialog + F5 | Regression bus-only | `SETFID02-MSMZGC71` / `SETFIDQC1` |
| **IN SWEEP — mutate + F5 U65** | `rec-pipeline-stages` · `dec-decision-types` · `merge-tokens` · `pay-sheet-tpl` · `contract-clauses` · `contract-templates` (list/search/dialog UX leg) · `catalogs` · `master-data` · `settings-defaults` | Thêm→Lưu→pre-F5+F5 · select-in-dialog · pattern Loại phép | Batch B/C/D chưa trong 8-tab |
| **IN SWEEP — load / density** | `contract-number-config` · `contract-library-publish` · `jd-dynamic` (CFG only) · `roles` | Load không banner · toolbar/search parity · **không** claim JD thư viện mutate | C-SPEC-SHALLOW portal/mock tách WI `PO-HRM-SETTINGS-PORTAL-TABS-FE-02` |
| **OUT OF SWEEP (WI khác)** | `jd-master-list` / `jd-master-library` | JD mutate slice §6.3 | FE `PO-HRM-JD-IA-LIST-DETAIL-FE-01` trước QA mutate |
| **OUT OF SWEEP** | `account` · `branding` · `notifications` · `security` · `system` · `subscription` | Portal mock — load 🟡 hoặc wire WI E | Không gộp vào «18-tab catalog DONE» |

**AC-SWEEP-BOUNDARY-01:** QA chỉ được claim **«W3 browser sweep DONE»** khi mọi hàng **IN SWEEP** có block evidence U65 (Network 2xx · FE sau Lưu · F5) và **không** đổi verdict hàng **SEALED**.

**AC-SWEEP-BOUNDARY-02:** Sweep **≠** `settings_catalog_e2e_ready=true` · **≠** Settings module UAT · **≠** full UF-HRM-10 consumer matrix.

### 6.2 Phòng ban / catalog consumer (dept picker)

| ID | Loại | Trạng thái | Điều kiện (SRS §16 O4 · HRM-SC-02) | Hành động | PASS khi | FAIL khi |
|----|------|------------|-------------------------------------|-----------|----------|----------|
| **AC-SET-CONSUMER-DEPT-CTR-01** | AC | **CLOSED** (slice) | Contracts → Tạo HĐ bước 1 · catalog `departments` | QA regression only | `ctr-create-department-picker-combobox` mount · mở picker → ≥1 `catalog-picker-option-*` · Lưu gửi `department_key` · F5 row giữ label | Partial catalog bỏ trường phòng ban · label-only Select |
| **BR-SET-CONSUMER-DEPT-REG-01** | BR | **OPEN** (regression) | Mọi release đụng `contractFormFieldResolver` / `DEFAULT_CONTRACT_FORM_FIELDS` | dev-fe + qa | Union configured + `REQUIRED_CONTRACT_FORM_FIELDS` luôn có `department` khi catalog partial | `hasContractField('department')` false khi ≥1 active row khác |
| **AC-SET-CONSUMER-DEPT-EMP-01** | AC | **RETAIN** | NV form create/edit | Regression spot | `CatalogSearchPicker` dept unchanged vs `SETFID02DEPT` | Mất bind catalog |
| **AC-SET-CONSUMER-CH-REC-01** | AC | **CLOSED** (slice) | UV pool — `CandidateFormDialog` trường `source` | QA regression only | EFF>0: picker catalog `code`; POST `source`=code | Reopen without bus · seal `RECCHQC1-MSNKIJ5QC1` |
| **AC-SET-CONSUMER-CH-REC-02** | AC | **CLOSED** (slice) | `CandidatesTab` lọc nguồn | QA regression | Cùng option set với form | `RECCHQC1` |
| **AC-SET-CONSUMER-CH-REC-03** | AC | **CLOSED** (slice) | List/detail badge nguồn | QA regression | `resolveRecruitmentChannelLabel` | `RECCHQC1` |
| **BR-REC-CH-SOT-01..03** | BR | **OPEN** (regression) | FR-HRM-SC-CH-01 / AC-SC-CH-03 | dev-fe + qa | SoT `BA-HRM-REC-CHANNELS-CONSUMER-01.md` | YCTD/JobPosting không đòi kênh |
| **BR-SET-CONSUMER-MATRIX-01** | BR | **OPEN** | UF-HRM-10 đầy đủ | ba-data + qa | Ma trận `catalog_key → consumer màn → AC` đủ hàng P0 SRS | Chỉ 2 leg Contracts 🟢 slice coi là module PASS |

**Sealed (không chọn lượt này):** `departments` `DEPTCONREG1` · `recruitment_channels` `RECCHQC1-MSNKIJ5QC1` · CTR dept+`contract_types` `QACONPAYSTQC1-MSNG1JQC1`.

| ID | catalog_key | Màn → field | Owner | QA UF / hint | PASS khi | FAIL khi |
|----|-------------|-------------|-------|--------------|----------|----------|
| **AC-SET-CONSUMER-JT-WH-01** | `job_titles` (alias `positions`) | Nhân sự → chi tiết NV → **Quá trình công tác** · trường **Vị trí** | **dev-be** (persist `position_key` + assert EFF) → **dev-fe** (`CatalogSearchPicker`) | **UF-HRM-10** · SRS §16.8 O4 · **AC-HRM-PICKER-01** · U65: XBOS pull → thêm/sửa dòng QTCT → Lưu 2xx → F5 nhãn = catalog label | **CLOSED** `WHPOSQC1-MSNL78QC1` — regression only | Reopen without bus |
| **AC-SET-CONSUMER-ET-CTR-01** | `employment_types` | Hợp đồng → **Tạo HĐ** bước 1 · **Hình thức làm việc** (`work_arrangement`) | **dev-fe** (catalog picker) → **dev-be** (assert EFF khi >0) | **UF-HRM-10** narrow · **FR-HRM-SC-ET-01** · **AC-HRM-PICKER-01** · U65: sync `employment_types` → picker = EFF snake codes → Lưu → F5 label | **CLOSED** `ETCTRQC1` / `ETCTRQA1-MSNNRUZQ` — regression only | Reopen without bus |
| **AC-SET-CONSUMER-LV-ATT-01** | `leave_types` (consumer = Nest **effective** ∪ REF) | **Chấm công → Nghỉ phép** (`LeaveTab`) · **Dashboard** `HrmApiReminders` label | **dev-fe** (`useAttLeaveTypesEffective` on all TXN surfaces) → **dev-be** (assert create **RETAIN**) | **UF-HRM-10** narrow · **FR-HRM-SC-LEAVE-01** · **AC-PLT-ATT-LEAVE-01** · U65: ATT loại phép → đơn nghỉ picker = EFF codes → Lưu 2xx → F5 | `leaveTypeOptionsFromCatalog(settings)` trên Reminders; MD sole SoT | `HrmApiReminders.tsx` lệch LeaveTab |

**NEXT-02 (`GOV-HRM-SETTINGS-CONSUMER-MATRIX-NEXT-02`):** P0 leg **`employment_types` → CTR `work_arrangement`** · SoT `BA-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01.md` · **CLOSED** `ETCTRQC1`.

**NEXT-03 (`GOV-HRM-SETTINGS-CONSUMER-MATRIX-NEXT-03`):** P0 leg **`leave_types` → ATT consumer effective SoT** · **CLOSED** `ATTLVTCONQC1-MSNO8BQC1` · seal `PM-HRM-LEAVE-TYPES-CONSUMER-ATT-SEAL-01.md` (carry 🟡 Reminders live row).

**NEXT-04 (`GOV-HRM-SETTINGS-CONSUMER-MATRIX-NEXT-04`):** P0 leg **`job_grades` → REC YCTD** · **CLOSED** `JGRECQC1-MSNP1AXQC1` (CREATE+F5) · seal `PM-HRM-JOB-GRADES-CONSUMER-REC-SEAL-01.md` · carry PATCH when EFF≥2.

| **AC-SET-CONSUMER-JG-REC-01** | `job_grades` | Tuyển dụng → **Yêu cầu tuyển** · **Ngạch/bậc** (`job_grade_key`) | **dev-fe** → **dev-be** (assert EFF>0) | **UF-HRM-10** narrow · **FR-HRM-SC-GRADE-01** · U65 sync → picker → Lưu 2xx → F5 label | **CLOSED** `JGRECQC1-MSNP1AXQC1` — regression only | free-text / invent khi EFF>0 |

**NEXT-05 (`GOV-HRM-SETTINGS-CONSUMER-MATRIX-NEXT-05`):** P0 leg **`pay_types` → Payroll `component_type`** · SoT `BA-HRM-PAY-TYPES-CONSUMER-PAY-01.md` · **CLOSED** `PTPAYQC1-MSNPHTECQC1` (CREATE+F5) · seal `PM-HRM-PAY-TYPES-CONSUMER-PAY-SEAL-01.md` · carry PATCH bản chất browser · **last** SRS §16.7 allow-list consumer leg on CREATE slice.

| **AC-SET-CONSUMER-PT-PAY-01** | `pay_types` | Lương → **Thành phần lương** (`SalaryComponentsTab`) · **Bản chất** (`component_type` = catalog `code`) | **dev-fe** (`payTypeOptionsFromCatalog` + Zod) → **dev-be** (**`HRM-PAY-TYPE-KEY`** retain) | **UF-HRM-10** narrow · **J-HRM-PAY-E2-01** · **FR-HRM-SC-PAY-TYPE-01** · U65 sync → picker → Lưu 2xx → F5 label · invent → **400** | **CLOSED** `PTPAYQC1-MSNPHTECQC1` — regression only | PATCH carry · VI enum if EFF=0 |

**Honesty (RETAIN):** `settings_catalog_e2e_ready=false` · **≠** UF-HRM-10 full PASS · sealed legs dept/REC-CH/CTR/ET/WH/LV-ATT/JG-REC/**PT-PAY** · **BR-SET-CONSUMER-MATRIX-01** OPEN (PERF/portal/industry optional) · PERF KPI grade optional (E3).

**QA dispatch:** Dept leg **không** re-run full `PO-HRM-SETTINGS-FIDELITY-QA-02` — chỉ **BR-SET-CONSUMER-DEPT-REG-01** khi diff FE contracts/catalog.

### 6.3 JD master — mutate slice (`JD-SET-MUTATE-SLICE`)

SoT UI: `docs/hrm/ui-screens/UI-SETTINGS-JD-MASTER-LIST.md` · QC **DENY** promote trên `SETFIDQC1` (shell smoke only).

| ID | Bước (U65) | Network | FE sau 2xx | FAIL nếu |
|----|------------|---------|------------|----------|
| **AC-JD-SET-LIST-01** | Nav «Thư viện JD» ≠ tab «Cấu hình JD» (`jd-dynamic`) | — | Hai tab distinct | Gộp CFG + thư viện |
| **AC-JD-SET-LIST-02** | List → Sửa | GET detail 200 | `JdTemplateWriterDialog` load pack + groups | Composer Card dưới list |
| **AC-JD-SET-LIST-03** | Thêm → Lưu trong Dialog | POST/PUT 2xx | Dialog đóng · row list cập nhật | Dialog trống · writer ngoài list |
| **AC-JD-SET-LIST-04** | F5 list | GET list 200 | Row JD mới còn | Mất sau F5 |
| **AC-JD-SET-LIST-05** | Embed CC `:5173/command-center/hrm/...` | — | Dialog ≥85% viewport · footer Lưu visible | `iframe` portal · `sm:max-w-lg` |
| **AC-JD-SET-LIST-06** | Cross-nav J-HRM-JD-05 | YCTD picker | Chọn JD vừa tạo | Picker không thấy template |
| **AC-JD-SET-LIST-07** | Tab `jd-dynamic` | — | Không DnD thư viện trên CFG | DnD group trên CFG tab |
| **AC-JD-SET-LIST-08** | Empty list | — | Copy + CTA `?tab=jd-dynamic` · không crash | Stub cứng không hướng dẫn |

| BR-ID | Điều kiện | Hành động | Kết quả |
|-------|-----------|-----------|---------|
| **BR-JD-SET-SOT-01** | Q1 field/group/pack/rule | Chỉ tab `jd-dynamic` | Thư viện JD chỉ list + writer |
| **BR-JD-SET-PAT-01** | Mutate JD master | PAT-DIALOG-FULL-VIEWPORT-CC-01 parent portal | Không route `/settings/jd/:id` làm surface chính (mặc định) |
| **BR-JD-SET-API-01** | Lưu layout | API jd templates theo TechSpec | FE không SoT pack rule |

**Owner:** `dev-fe` `PO-HRM-JD-IA-LIST-DETAIL-FE-01` trước · `qa` `PO-HRM-SETTINGS-JD-MUTATE-QA-01` (UF chỉ AC-JD-SET-LIST-01..08).

### 6.4 Bảng BR tóm tắt (open only)

| BR-ID | Module | Owner | Done khi |
|-------|--------|-------|----------|
| BR-SET-CONSUMER-DEPT-REG-01 | Contracts dept | dev-fe + qa | Vitest + browser regression §6.2 |
| BR-SET-CONSUMER-MATRIX-01 | UF-HRM-10 | ba-data + qa | Matrix đủ P0 keys · không flip honesty |
| BR-SET-SWEEP-SEAL-01 | W3 QA | qa | Không re-stamp SEALED tabs without bus |
| BR-JD-SET-SOT-01 · PAT-01 · API-01 | JD master | dev-fe + qa | AC-JD-SET-LIST-01..08 🟢 |

---

## 7. Handoff — `BA-PO-HRM-SETTINGS-SRS-FIDELITY-01` (2026-08-11)

| Field | Value |
|-------|--------|
| **completion_report** | **Closed:** §6 open AC/BR cho dept consumer (CLOSED slice + regression OPEN) · JD mutate AC-JD-SET-LIST-01..08 + BR · ranh giới sweep 18-tab vs seals. **Residual:** full consumer matrix (ba-data) · portal tabs · P0 CTR/catalog từ §2–§3 chưa đóng execution. **Cấm:** reopen W3 8-tab · ATT LVT sealed. |
| **next_owner** | `pm` |
| **evidence_path** | `docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6–§7 |
| **ack_status** | `PASS_TO_PM` |

### next_dispatch_prompt (PM → max 2 execution WI)

```text
work_item_id: PO-HRM-JD-IA-LIST-DETAIL-FE-01
role: dev-fe
read_first:
  - docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md §6.3
  - docs/hrm/ui-screens/UI-SETTINGS-JD-MASTER-LIST.md
  - docs/qa/evidence/qc-po-hrm-settings-fidelity-gate-01.md (JD mutate HOLD)
entry_criteria: BA-PO-HRM-SETTINGS-SRS-FIDELITY-01 PASS; must_keep SETFIDQC1 + SETW3MUTQC1 + ATTLVTSOTQC1; settings_catalog_e2e_ready=false
exit_criteria: Tab jd-master-library/list; AC-JD-SET-LIST-01..05 FE-ready; vitest; evidence po-hrm-jd-ia-list-detail-fe-01.md; READY_FOR_QA PO-HRM-SETTINGS-JD-MUTATE-QA-01
cấm: DnD trên jd-dynamic; reopen sealed W3 8-tab mutate QA
evidence_path: docs/qa/evidence/po-hrm-jd-ia-list-detail-fe-01.md
```

```text
work_item_id: QA-PO-HRM-SETTINGS-W3-BROWSER-01
role: qa
read_first:
  - docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md §6.1
  - docs/program/dispatch/PO-HRM-SETTINGS-W3-UX-DENSITY-CONTINUOUS-01.md
  - docs/qa/evidence/qc-po-hrm-settings-w3-mutate-gate-01.md
entry_criteria: SETW3MUTQC1 sealed; L0 qc:dev-stack + qc:fe-be-health exit 0; :5173 up
exit_criteria: Browser U65 mọi tab IN SWEEP §6.1; AC-SWEEP-BOUNDARY-01; không re-run SEALED mutate; evidence po-hrm-settings-w3-browser-01.md; PASS_TO_PM; settings_catalog_e2e_ready DENY
cấm: seed; claim 18-tab = module UAT; reopen ATTLVTSOT / 8-tab stamps
evidence_path: docs/qa/evidence/po-hrm-settings-w3-browser-01.md
```

---

## 8. Trace (J-* / BA)

| J-ID / UF | Delta AC | Ghi chú |
|-----------|----------|---------|
| UF-CTR-DEPT-CATALOG-PICKER | AC-SET-CONSUMER-DEPT-CTR-01 CLOSED | Regression BR-SET-CONSUMER-DEPT-REG-01 |
| UF-HRM-10 (full) | BR-SET-CONSUMER-MATRIX-01 OPEN | dept **🟢** `DEPTCONREG1`; UV **🟢** `RECCHQC1`; CTR **🟢** `QACONPAYSTQC1`+`ETCTRQC1`; QTCT **🟢** `WHPOSQC1`; LV **🟢** `ATTLVTCONQC1`; JG REC **🟢 slice** `JGRECQC1`; PT PAY **🟢 slice** `PTPAYQC1-MSNPHTECQC1` |
| J-HRM-JD-05 | AC-JD-SET-LIST-06 | **🟢 CLOSED** `JDSETMUTQC1-MSNHWI0QC1` / `JDSETMUT-MSNHWI0A` |
| UF-SET-W3 sweep | AC-SWEEP-BOUNDARY-01..02 | **🟢 CLOSED** `SETW3SWPQC1-MSNHWVTOQC1` / `SETW3SWP-MSNHWVTO` |
