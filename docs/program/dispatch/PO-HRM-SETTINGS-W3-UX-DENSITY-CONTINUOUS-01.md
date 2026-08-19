# Dispatch — Cài đặt HRM W3 cuốn chiếu · đồng bộ UI Loại phép · giữ density

| Meta | Value |
|------|--------|
| **Parent** | `PO-HRM-SETTINGS-IA-UX-REMasters-SPONSOR-01` |
| **Sponsor** | 2026-08-10 — cuốn chiếu team · **cấm đè** padding W1.5 · **100% tab** = pattern **Loại phép** |
| **U65** | Zero seed · mutate + F5 từ FE |
| **SoT pattern** | `AttLeaveTypeSettingsPanel.tsx` + `SettingsCatalogScreenShell` (`compact`) + pagination + dialog |

---

## MUST_KEEP — cấm regression (Composer / sponsor lock)

| Path | Giữ nguyên hành vi |
|------|---------------------|
| `AppLayout.tsx` | `isHrmSettingsPath` → main embed `px-2 py-2 md:px-3 md:py-2.5` |
| `Settings.tsx` | Root `settings-page` · **không** `xevn-safe-inline` · `PageHeader density="compact"` · account `settings-panel-card` |
| `SettingsNavLayout.tsx` | Gap 2/3 · sidebar 13.5rem · max-h `calc(100dvh-7.5rem)` |
| `PageHeader.tsx` | Prop `density: 'compact' \| 'default'` |
| `index.css` | `.settings-page` · `.settings-panel-card` |
| `AttLeaveTypeSettingsPanel.tsx` | Reference implementation — chỉ sửa nếu extract shared, không revert list+dialog |
| `SettingsDialogSelectContent.tsx` | Dialog select `portalScope="parent"` |
| `ContractLegalPrintSettingsPanel` `view="clauses"` | List + search + dialog (W1) |

**Reject:** PR đụng must_keep mà tăng padding / restore `xevn-safe-inline` trên Settings / xóa `settingsDense`.

---

## Pattern bắt buộc (giống Loại phép)

1. `SettingsCatalogScreenShell` — `compact`, full width, toolbar search **mã/tên**
2. Bảng list only — **không** form inline cố định trên list
3. **Dialog** Thêm/Sửa — Select trong dialog → `SettingsDialogSelectContent`
4. `SettingsCatalogPagination` + `SettingsCatalogRowActions`
5. Card form-only tabs (account, notifications, …): `settings-panel-card` hoặc shell tương đương — **không** `CardHeader p-6` mặc định

Spec: `docs/program/specs/PO-HRM-SETTINGS-IA-UX-REMasters-SPONSOR-01.md` §2.2 · §2.4

---

## Wave W3 — inventory panel (refactor → shell)

| Tab id | Component | Batch |
|--------|-----------|-------|
| `att-leave-types` | `AttLeaveTypeSettingsPanel` | **DONE (reference)** |
| `att-attendance-codes` | `AttAttendanceCodeSettingsPanel` | **A** |
| `att-ot-types` | `AttOtTypeSettingsPanel` | **A** |
| `att-ot-comp-types` | `AttOtCompTypeSettingsPanel` | **A** |
| `emp-document-types` | `EmpDocumentTypeSettingsPanel` | **B** |
| `emp-employment-types` | `EmpEmploymentTypeSettingsPanel` | **B** |
| `emp-employment-statuses` | `EmpEmploymentStatusSettingsPanel` | **B** |
| `si-insurance-types` | `SiInsuranceTypeSettingsPanel` | **B** |
| `si-insurers` | `SiInsurerSettingsPanel` | **B** |
| `dec-decision-types` | `DecDecisionTypeSettingsPanel` | **B** |
| `rec-pipeline-stages` | `RecPipelineStageSettingsPanel` | **B** |
| `contract-clauses` | `ContractLegalPrintSettingsPanel` clauses | **DONE W1** |
| `contract-templates` | templates view | **C (W2)** list+popup trước DnD |
| `merge-tokens` | `MergeTokenSettingsPanel` | **C** |
| `pay-sheet-tpl` | `PaySheetTemplateSettingsPanel` | **C** |
| `catalogs` / `master-data` | `SettingsCatalogsTab` / `MasterDataSettingsPanel` | **D (W4)** toolbar search đồng bộ |
| Account / branding / … | Cards trong `Settings.tsx` | **E** compact card pattern |

---

## Work items (execution)

| work_item_id | Role | Exit |
|--------------|------|------|
| `PO-HRM-SETTINGS-W3-CAT-A-FE-01` | dev-fe | ATT 3 panel = shell+dialog+pagination · build+vitest panel · evidence |
| `PO-HRM-SETTINGS-W3-CAT-B-FE-01` | dev-fe | EMP+SI+DEC+REC 7 panel · same pattern |
| `PO-HRM-SETTINGS-W3-CAT-C-FE-01` | dev-fe | merge-tokens · pay-sheet · templates list shell (DnD giữ must_keep) |
| `PO-HRM-SETTINGS-W3-CAT-E-FE-01` | dev-fe | Notifications/security/branding cards compact · không đè must_keep |
| `QA-PO-HRM-SETTINGS-W3-BROWSER-01` | qa | Sau A+B: browser :5173 CC · mỗi tab mutate 1 dòng · F5 · select-in-dialog |
| `QC-PO-HRM-SETTINGS-W3-GATE-01` | qc | GWC · honesty flags RETAIN · must_keep grep |

---

## Handoff QA (copy)

- URL: `http://localhost:5173/command-center/hrm/settings?tab=<id>`
- Account: `ceo@xe.vn` / `Xevn@2026`
- UF: settings catalog per tab · **hdsd** Cài đặt
- **Cấm seed** · empty = 🟡 + CTA tạo từ FE

---

## Evidence paths

- `docs/qa/evidence/po-hrm-settings-w3-cat-a-fe-01.md`
- `docs/qa/evidence/po-hrm-settings-w3-cat-b-fe-01.md`
- `docs/qa/evidence/po-hrm-settings-w3-browser-01.md`
