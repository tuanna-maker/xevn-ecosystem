# BA-HRM-PAY-TYPES-CONSUMER-PAY-01 — `pay_types` consumer (Payroll thành phần lương)

| Meta | Value |
|------|--------|
| **work_item_id** | `GOV-HRM-SETTINGS-CONSUMER-MATRIX-NEXT-05` |
| **parent** | `BR-SET-CONSUMER-MATRIX-01` · `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01` §6.2 |
| **date** | 2026-08-11 |
| **ack_status** | `PASS_TO_PM` |
| **lane** | governance · docs only |

## spec_read_ack

| Layer | Path |
|-------|------|
| srs | `docs/hrm/SRS.md` §16.7 P0 allow-list · **FR-HRM-SC-PAY-TYPE-01** · `docs/program/deltas/BA_ERP_E1B_SRS_01_20260728.md` · **FR-HRM-PAY-CLEAN-E2-01** (`docs/program/deltas/BA_ERP_E2_SRS_01_20260728.md`) |
| tech_spec | `docs/hrm/DB_DESIGN_HRM_SETTINGS_E1B.md` §6 · `docs/hrm/DB_DESIGN_HRM_ERP_E2.md` §2.1 `salary_components.component_type` |
| db_design | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` — module `payroll` · DM `pay_types` (≠ TX `salary_components` instance) |
| api_design | `docs/hrm/API_DESIGN_HRM_ERP_E2.md` · `assertCodeInEffectiveCatalog('pay_types', component_type)` → **`HRM-PAY-TYPE-KEY`** |

## Consumer row (P0 — last SRS §16.7 allow-list leg)

| AC-ID | catalog_key | Màn → field | Owner | QA hint |
|-------|-------------|-------------|-------|---------|
| **AC-SET-CONSUMER-PT-PAY-01** | `pay_types` (alias `component_types`, `pay_natures`, `salary_component_types`) | Lương → tab **Thành phần lương** (`SalaryComponentsTab`) · trường **Bản chất** (persist **`component_type`** = catalog `code` khi EFF>0) | **dev-fe** (`payTypeOptionsFromCatalog` + `CatalogSearchPicker`; Zod `getAllowedComponentTypes`; list/filter label `resolvePayTypeLabel`) → **dev-be** (retain `assertPayTypeCode` / **`HRM-PAY-TYPE-KEY`** on C/U) | **UF-HRM-10** narrow · **J-HRM-PAY-E2-01** · **FR-HRM-SC-PAY-TYPE-01** · **AC-E2-PAY-NATURE-01** · **AC-HRM-PICKER-01** · U65: Cài đặt đồng bộ/thêm `pay_types` → Tạo/sửa TP → POST/PATCH 2xx body `component_type`=code → F5 list + detail label · invent nature API → **400** `HRM-PAY-TYPE-KEY` · **≠** full UF-HRM-10 PASS |

## Spec says / Code does (2026-08-11)

| | Spec | Code |
|---|------|------|
| Nature SoT | `component_type` stores **`pay_types.code`**; polarity `nature` (`income`/`deduction`) là trục riêng | `SalaryComponentsTab` + `payTypeOptionsFromCatalog` wired (**PASS** audit `po-hrm-settings-catalog-consumer-audit-fe-01`) |
| BE guard | Invent / unknown code → **400** `HRM-PAY-TYPE-KEY` | `payroll-catalog.service.ts` assert (**PASS** `QA-ERP-E2-01` API leg) |
| Matrix gap | Consumer leg cần **U65 browser** CREATE+F5 như các slice JG/ET/CTR | `J-HRM-PAY-E2-01` UI từng **FAIL** `DEF-E2-PAYROLL-CRASH`; matrix leg **chưa seal** QC narrow |
| Distinction | Instance TP = bảng `salary_components`; bản chất = Settings `pay_types` | Không dùng TX table hoặc enum VI `['Lương',…]` làm SoT khi EFF>0 |

## BR & validation (narrow)

| ID | Rule |
|----|------|
| **BR-SET-CONSUMER-PT-SOT-01** | EFF>0 → picker chỉ options `mergeEffectiveItemsByKeys(..., pay_types family)`; POST/PATCH gửi **code** (không lưu nhãn VI làm SoT) |
| **BR-SET-CONSUMER-PT-SOT-02** | EFF=0 → honest empty + CTA Cài đặt bucket bản chất; không claim consumer PASS |
| **VAL-PT-PAY-FE-01** | Network body `component_type` khớp code đã chọn; Zod reject khi ∉ allowed set |
| **VAL-PT-PAY-BE-01** | Non-null `component_type` on create (và on update khi đổi type) ∉ effective `pay_types` → **400** `HRM-PAY-TYPE-KEY` |

## QA narrow matrix (copy-ready)

| Step | Pass khi |
|------|----------|
| 1 | `ceo@xe.vn` · `/hr/payroll` tab Thành phần lương load không banner đỏ |
| 2 | EFF>0: mở Tạo/sửa · `hdsd-pay-salary-component-type` (hoặc picker testid hiện hành) = options từ catalog |
| 3 | Chọn bản chất → Lưu → **POST/PATCH** `/api/hrm/payroll/salary-components` **2xx** · body `component_type` = code |
| 4 | F5 · row + detail hiển thị nhãn `resolvePayTypeLabel` |
| 5 | Regression API: POST invent `component_type` → **400** `HRM-PAY-TYPE-KEY` (không seed) |

## OUT OF SCOPE (this leg)

| Item | Rationale |
|------|-----------|
| Formula builder / PAY-02 LIVE | `payroll_e2e_ready=false` |
| Tax/insurance mock islands | AC-E2-NOMOCK — wave E2 cleanup |
| Allowance catalog `componentType` mirror | `PO-HRM-ALLOWANCE-CATALOG-SYNC-API-01` — VAL-ALLOW-05 peer |
| `salary_components` Settings dictionary bucket | Instance CRUD Nest primary — không thay `pay_types` nature |
| UF-HRM-10 full matrix close | **BR-SET-CONSUMER-MATRIX-01** còn PERF optional · portal tabs |

**must_keep:** sealed `JGRECQC1` · `ATTLVTSOTQC1` · `ETCTRQC1` · `RECCHQC1` · `settings_catalog_e2e_ready=false`.

## completion_report

**Closed:** P0 matrix leg **`pay_types` → Payroll `component_type`** with **AC-SET-CONSUMER-PT-PAY-01** + BR/VAL + QA narrow steps; delta §6.2 NEXT-05 appended. **Residual:** QA/QC narrow seal (U65 CREATE+F5) · `BR-SET-CONSUMER-MATRIX-01` (PERF `job_grades` E3 · portal) · `payroll_e2e_ready=false`.

## next_owner

`pm` → dispatch **dev-fe** regression vitest/hdsd (nếu gap) then **qa** narrow consumer leg (BE assert đã có — không block trên dev-be trừ regression jest).

## next_dispatch_prompt

```text
work_item_id: D-FE-HRM-PAY-PAY-TYPE-CONSUMER-REG-01
role: dev-fe
read_first:
  - docs/program/specs/BA-HRM-PAY-TYPES-CONSUMER-PAY-01.md
  - docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md §6.2 AC-SET-CONSUMER-PT-PAY-01
  - apps/web/hrm/src/components/payroll/SalaryComponentsTab.tsx
  - apps/web/hrm/src/components/payroll/salaryComponentFormSchema.ts
entry_criteria: GOV-HRM-SETTINGS-CONSUMER-MATRIX-NEXT-05 PASS_TO_PM; must_keep JGRECQC1 + payroll_e2e_ready=false; settings_catalog_e2e_ready=false
exit_criteria: Confirm SalaryComponentsTab bản chất = pay_types catalog only when EFF>0; list filter uses catalog codes not VI enum; vitest salaryComponentFormSchema + catalogSearchPicker; evidence docs/qa/evidence/po-hrm-pay-types-consumer-pay-fe-01.md; READY_FOR_QA narrow AC-SET-CONSUMER-PT-PAY-01
cấm: UF-HRM-10 full PASS; formula LIVE; seed
evidence_path: docs/qa/evidence/po-hrm-pay-types-consumer-pay-fe-01.md
```

```text
work_item_id: QA-PO-HRM-PAY-TYPES-CONSUMER-PAY-01
role: qa
read_first:
  - docs/program/specs/BA-HRM-PAY-TYPES-CONSUMER-PAY-01.md
  - docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md §72 · J-HRM-PAY-E2-01
  - docs/qa/evidence/qa-erp-e2-01-20260728.md (DEF-E2-PAYROLL-CRASH baseline)
entry_criteria: L0 qc:dev-stack + qc:fe-be-health exit 0; /hr/payroll tab Thành phần lương reachable; U65 zero-seed
exit_criteria: Narrow AC-SET-CONSUMER-PT-PAY-01 — U65 CREATE+F5 + invent API 400 HRM-PAY-TYPE-KEY; evidence docs/qa/evidence/qa-po-hrm-pay-types-consumer-pay-01.md; PASS_TO_PM; ≠ UF-HRM-10 full; settings_catalog_e2e_ready DENY
cấm: seed; claim Settings module UAT; reopen JGRECQC1 sealed legs
evidence_path: docs/qa/evidence/qa-po-hrm-pay-types-consumer-pay-01.md
```

## evidence_path

`docs/program/specs/BA-HRM-PAY-TYPES-CONSUMER-PAY-01.md` · `docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.2
