# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QC-01` GWC L1 SEAL |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-07 |
| **change_mode** | **ADD** Settings DOC/ET panels + API client · **FIX** EmployeeForm / YCTD ET picker → effective |
| **honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `payroll_e2e_ready=false` · `attendance_uat_ready=false` · `recruitment_uat_ready=false` · **LOCKED** · U65 |
| **must_keep** | LIST-TOTALS/CTR GWC · AC-PLT-EMP-01 XBOS position REF · soft-delete · profile/contracts/SI · no closed enum invent |
| **stamp_ref** | L1 SEAL `EMPPLATQA-MSIZXHIM` · QC `po-hrm-dynamic-config-platform-emp-qc-01.md` |
| **closes** | `R-PLT-EMP-FE` (wire) — browser UF for QA |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| QC GWC | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qc-01.md` — L1 SEAL · CONDITION `R-PLT-EMP-FE` |
| QA L1 | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qa-01.md` — stamp `EMPPLATQA-MSIZXHIM` |
| SA vertical | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md` §5 **AC-PLT-EMP-02..05** · §3 F-EMP-CAT-DOC/ET/EFF |
| BE | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-be-01.md` — routes document-types* · employment-types* |
| Pattern neo | `AttLeaveTypeSettingsPanel` · `RecPipelineStageSettingsPanel` |

---

## 2. Deliverable (apps)

| Path | Role |
|------|------|
| `apps/web/hrm/src/lib/empDocumentTypeCatalog.ts` | Format-only DOC key · picker map · history label |
| `apps/web/hrm/src/lib/empDocumentTypeCatalog.test.ts` | Open-catalog format tests (**5 PASS**) |
| `apps/web/hrm/src/lib/empEmploymentTypeCatalog.ts` | Format-only ET key · hyphen→underscore · history option |
| `apps/web/hrm/src/lib/empEmploymentTypeCatalog.test.ts` | Open-catalog + normalize tests (**5 PASS**) |
| `apps/web/hrm/src/hooks/useEmpDocumentTypesEffective.ts` | RQ GET `/employees/document-types/effective` |
| `apps/web/hrm/src/hooks/useEmpEmploymentTypesEffective.ts` | RQ GET `/employees/employment-types/effective` |
| `apps/web/hrm/src/components/settings/EmpDocumentTypeSettingsPanel.tsx` | CRUD + retire + effective picker preview |
| `apps/web/hrm/src/components/settings/EmpEmploymentTypeSettingsPanel.tsx` | CRUD + retire + effective picker preview |
| `apps/web/hrm/src/pages/Settings.tsx` | Tabs **Loại giấy tờ EMP** · **Loại hình thuê EMP** |
| `apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx` | employment_type → CatalogSearchPicker **effective** |
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | YCTD employment_type → **effective** (no closed 4-option) |
| `apps/web/hrm/src/integrations/hrmApi.ts` | F-EMP-CAT-DOC/ET/EFF client |
| `apps/web/hrm/src/lib/apiError.ts` | `HRM-PLT-CAT-CODE-INVALID` toast copy · DOC/ET UNKNOWN/404 |
| `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` | HDSD ids EMP DOC/ET |

**Cấm / not done:** seed · invent personnel UAT · flip honesty · wipe L1 SEAL · closed enum invent on FE · claim browser UF PASS.

---

## 3. Routes / click path (QA — AC-PLT-EMP-02..05)

| Step | Action |
|------|--------|
| 0 | Account: `ceo@xe.vn` / `Xevn@2026` · OU scope `holding` / portal `main` |
| 1a | **Settings** → tab **Loại giấy tờ EMP** (`settings-tab-emp-document-types`) |
| 1b | **Settings** → tab **Loại hình thuê EMP** (`settings-tab-emp-employment-types`) |
| 2a | DOC: nhập `documentTypeKey` (vd. `hr_doc_custom_09_*`) · **Nhãn tiếng Việt** → **Tạo loại giấy tờ** (`hdsd-emp-document-type-save`) → Network **PUT** `/api/hrm/employees/document-types` **2xx** |
| 2b | DOC invalid: nhập `CCCD` → toast **HRM-PLT-CAT-CODE-INVALID** (client format mirror BE; optional Network **400** nếu bypass) |
| 3a | ET: nhập `seasonal_temp_*` hoặc `full-time` → **Tạo loại hình** (`hdsd-emp-employment-type-save`) → **2xx**; persisted key = `full_time` khi nhập `full-time` |
| 3b | ET invalid: nhập `FULL_TIME` → toast **HRM-PLT-CAT-CODE-INVALID** |
| 4 | **Tải lại (F5 list)** / F5 trang → row trong table; **Picker hiệu lực** (`hdsd-emp-*-effective-picker`) chọn được mã mới |
| 5 | **Nhân sự** → Thêm/Sửa NV → work tab → picker `hdsd-emp-employment-type-picker` chọn mã mới (GET `/employment-types/effective`) |
| 6 | **Tuyển dụng** → YCTD create → loại hình picker (`hdsd-requisition-employment-type`) chọn mã mới |
| 7 | **Ngừng** DOC/ET → active list/picker ẩn; hồ sơ / YCTD cũ vẫn hiện key (history option) |
| 8 | must_keep smoke: position/dept XBOS REF pickers · contracts/SI surfaces load · LIST-TOTALS/CTR không reopen |

**HDSD inventory (U76):**

- `settings-tab-emp-document-types` · `settings-tab-emp-employment-types`
- `settings-emp-document-types` · `settings-emp-document-types-table` · `settings-emp-document-types-picker-preview`
- `hdsd-emp-document-type-key` · `hdsd-emp-document-type-name` · `hdsd-emp-document-type-save` · `hdsd-emp-document-type-reload` · `hdsd-emp-document-type-retire-{key}` · `hdsd-emp-document-type-effective-picker`
- `settings-emp-employment-types` · `settings-emp-employment-types-table` · `settings-emp-employment-types-picker-preview`
- `hdsd-emp-employment-type-key` · `hdsd-emp-employment-type-name` · `hdsd-emp-employment-type-save` · `hdsd-emp-employment-type-reload` · `hdsd-emp-employment-type-retire-{key}` · `hdsd-emp-employment-type-effective-picker`
- `hdsd-emp-employment-type-picker` · `hdsd-emp-open-employment-types` · `hdsd-requisition-employment-type`

**Expected network stamps:**

```text
GET  /api/hrm/employees/document-types?company_id=…&status=active     → 200 HRM-EMP-DOC-200
PUT  /api/hrm/employees/document-types                                 → 2xx (open key)
GET  /api/hrm/employees/document-types/effective                       → 200 (picker)
POST /api/hrm/employees/document-types/:id/retire                      → 201 soft
GET  /api/hrm/employees/employment-types?company_id=…&status=active    → 200 HRM-EMP-ET-200
PUT  /api/hrm/employees/employment-types                               → 2xx (key full_time if full-time)
GET  /api/hrm/employees/employment-types/effective                     → 200 EMP-native wins
POST /api/hrm/employees/employment-types/:id/retire                    → 201 soft
```

---

## 4. Verification (dev)

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/empDocumentTypeCatalog.test.ts src/lib/empEmploymentTypeCatalog.test.ts --reporter=dot
→ Test Files: 2 passed · Tests: 10 passed
```

| Suite | Result |
|-------|--------|
| `empDocumentTypeCatalog.test.ts` | **5 PASS** (open N+ · reject CCCD · trim-only · picker · history) |
| `empEmploymentTypeCatalog.test.ts` | **5 PASS** (open 5th+ · FULL_TIME reject · full-time→full_time · history) |

---

## 5. Honesty

| Flag | Value |
|------|-------|
| `hrm_personnel_uat_ready` | **false LOCKED** |
| `employees_e2e_linkage_ready` | **false LOCKED** |
| `payroll_e2e_ready` / att / rec | **false LOCKED** |
| U65 seed in evidence | **none** |
| Module / Phase1 UAT flip | **none** |
| Browser UF | **HOLD for QA** (this seat = wire only) |
| L1 SEAL | **not wiped** |

---

## 6. completion_report

**Closed:** ADD Settings EMP CFG document-types + employment-types open catalog FE (peer ATT/REC); hrmApi F-EMP-CAT-DOC/ET/EFF; effective pickers in Settings preview + EmployeeFormDialog + YCTD; format-only CCCD/FULL_TIME → toast `HRM-PLT-CAT-CODE-INVALID`; `full-time` normalizes to `full_time` on save; soft-retire hides active + history option; display-ready from BE; vitest **10 PASS**; honesty false LOCKED; must_keep position XBOS / soft-delete / LIST-TOTALS·CTR / profile·contracts·SI untouched.

**Residual:** Browser U65 AC-PLT-EMP-02..05 (create→2xx→F5→picker · retire hide · invalid toast) — owner **qa**. Checklist hồ sơ DOC consumer full spine deferred if surface not yet in product (Settings effective preview covers picker AC for this seat).

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-fe-01.md` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QA-02
from_role: pm
to_role: qa
lane: execution
priority: P0
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01 READY_FOR_QA
program: PO-HRM-CONTINUOUS-W7-20260807
ref_fe: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-fe-01.md
stamp_ref: EMPPLATQA-MSIZXHIM · L1 SEAL GWC EMP-QC-01
U65: zero-seed · browser-only · cấm seed / API-only PASS

## entry_criteria
- FE evidence READY: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-fe-01.md
- Portal :5173 / :8088 + hrm-api :28001 up
- Account: ceo@xe.vn / Xevn@2026 · company_id holding / main JWT
- Honesty LOCKED false — do not flip personnel/e2e/pay/att/rec
- must_keep: LIST-TOTALS/CTR · AC-PLT-EMP-01 position XBOS · soft-delete · profile/contracts/SI

## task (browser UF)
1) Settings → Loại giấy tờ EMP: create open key → Network PUT document-types 2xx → F5 → table + effective picker shows key (AC-PLT-EMP-02)
2) Enter CCCD → toast HRM-PLT-CAT-CODE-INVALID (no invent closed enum)
3) Settings → Loại hình thuê EMP: create seasonal_temp* 2xx; create full-time → persist full_time; FULL_TIME → INVALID toast (AC-PLT-EMP-04)
4) F5 → ET effective picker shows key; Nhân sự form + YCTD form pickers show new key (GET employment-types/effective)
5) Retire DOC + ET → active hide; historical row/edit still shows key (AC-PLT-EMP-03)
6) must_keep smoke: position picker XBOS REF · contracts/SI load
7) Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qa-02.md · click path + network stamps · PASS_TO_PM or FAIL

## cấm
seed · invent hrm_personnel_uat_ready · claim module UAT · wipe L1 SEAL · PASS chỉ probe
```
