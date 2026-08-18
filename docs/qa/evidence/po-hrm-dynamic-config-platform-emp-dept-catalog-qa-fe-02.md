# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-QA-FE-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-QA-FE-02` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **priority** | P2 |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-FE-02` **READY_FOR_QA** agent `44672925-dcc4-4882-8ba7-8d693f49d386` |
| **ref_fe** | [`po-hrm-dynamic-config-platform-emp-dept-catalog-fe-02.md`](po-hrm-dynamic-config-platform-emp-dept-catalog-fe-02.md) Length≥8077 |
| **prior_fail** | [`po-hrm-dynamic-config-platform-emp-dept-catalog-qa-fe-01.md`](po-hrm-dynamic-config-platform-emp-dept-catalog-qa-fe-01.md) stamp **`EMPDEPTQAFE-MSKG2900`** — mutate wire omit department |
| **fix** | `mergeEmployeeDepartmentWriteFields` → `custom_fields.department` (never top-level `department`) |
| **SA Option A** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-FE-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-FE-SA-01.md) |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` · `:5173` |
| **Stamp** | **`EMPDEPTQAFE2-MSKH0E5J`** |
| **stamp_l1 RETAIN** | **`EMPDEPTQA-MSK3VVXX`** · invent → **400 `HRM-WH-DEPT-KEY`** ≡ `HRM-EMP-DEPT-KEY` LIVE (WH + `position_key`) |
| **U65** | zero-seed · **browser** FE click path · invent API spot ≠ UF 🟢 alone · **no wipe** EFF |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · EMP-POSITION FE CLOSED RETAIN · EMP-STATUS FE CLOSED RETAIN · EMP-CUSTOM / ATT / LVRULE HOLD · Nest emp_department DENY · **`C-SLICE-≠-MODULE`** · DENY QC-close this seat |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS_WITH_OBS** — **R-PLT-EMP-DEPT-FE-01 CLOSABLE** |
| **condition_verify** | **R-PLT-EMP-DEPT-FE-01** → **CLOSABLE** · Edit+Create department CatalogSearchPicker **PRESENT** ∈ departments EFF · Lưu PATCH **`custom_fields.department=DEPT_01`** (no top-level) **200 `HRM-EMP-202`** · F5 exact · status+position PRESENT |
| **change_mode** | ADD verify · no `apps/**` product edit · no seed · no ready flip · **FORBIDDEN** reopen EMP-POSITION/STATUS FE CLOSED · Nest emp_department · invent LVRULE · module EMP UAT · QC-close |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Vitest | `empDeptCatalog` **13** (incl. 6× `mergeEmployeeDepartmentWriteFields`) + `EmployeeFormDialog.mount-guard` **9** = **22/22** exit **0** |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-emp-dept-catalog-qa-fe-02.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-dept-catalog-qa-fe-02-browser.json` (~23 667 B) |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-emp-dept-catalog-qa-fe-02/` (8 PNG) |
| FE parent | FE-02 READY_FOR_QA — wire `data.department` → `custom_fields.department` |
| L1 QA | stamp **`EMPDEPTQA-MSK3VVXX`** RETAIN · KEY LIVE |
| EMP-POSITION FE | stamp **`EMPPOSQCFE-8DEF5536` CLOSED RETAIN** — not reopened |
| EMP-STATUS FE | stamp **`EMPSTQAFE2-MSKE3NV1` CLOSED RETAIN** — not reopened |

**spec_ref:** AC-PLT-EMP-DEPT-01 / 01b · VAL-EMP-DEPT-CNS-* · HDSD CH06g · R-PLT-EMP-DEPT-FE-01 · KEY `HRM-EMP-DEPT-KEY` ≡ `HRM-WH-DEPT-KEY`

**Seed:** none · **ensureDefault:** none · **Nest emp_department:** DENIED.

**Target employee (safe status reason):** `0f6e1369-4170-42e3-ad6b-3d04b3ec2edd` · `Nguyễn Văn QA M3 987275` · `status=active` (`requiresReason=false`) · `job_title_key=CEO` · before department=`(none)` · after F5 `DEPT_01`  
*(Prior FAIL used `UAT NV 0100` with Nest status `hr_emp_st_msk20g7h` `requiresReason=true` → orthogonal `HRM-EMP-STATUS-REASON-KEY` — avoided this seat.)*

---

## 2. Click path (U65 · HDSD CH06g)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok |
| 1 | Settings `departments` EFF | **total=4** codes=`DEPT_01..04` labels=`Nhân sự,Vận hành,Kế toán,Kinh doanh` · **200** (L1 LIVE · no seed) |
| 2 | Invent API spot (WH) | POST invent `department_key` **with** `position_key=CEO` → **400 `HRM-WH-DEPT-KEY`** · no persist · L1 **RETAIN** |
| 3 | Nest emp_department DENY | GET `/emp-departments*` → **400/404** · src route file **ABSENT** |
| 4 | Seals smoke | attendance-codes **200**/1 · emp-st **200**/4 · job_titles **200**/9 · EMP-POSITION/STATUS FE **CLOSED RETAIN** |
| 5 | Static mutation wire | `mergeEmployeeDepartmentWriteFields` **PRESENT** · custom_fields path **true** · never top-level **true** |
| 6 | **HRM → Nhân sự / Employees** | `/hr/employees?portal=1&companyId=main` · no Sync ERROR |
| 7 | Row ⋯ → **Sửa** Edit dialog | `hdsd-employee-form-dialog` opened via=`row_menu` · prefer active+CEO |
| 8 | Department CatalogSearchPicker | **PRESENT** — options **4** · effHits=**4** (DEPT_01..04) · CatalogSearchPicker search |
| 9 | emp-employment-status-select | **PRESENT** — EMP-STATUS FE CLOSED RETAIN |
| 10 | Position CatalogSearchPicker | **PRESENT** · hits CEO…POS_01 — EMP-POSITION FE CLOSED RETAIN |
| 11 | Pick `DEPT_01` → **Lưu** | PATCH **200 `HRM-EMP-202`** · body **`custom_fields.department=DEPT_01`** · **no** top-level `department` / `department_key` |
| 12 | F5 / GET | department=`DEPT_01` · **exact=true** · reopen picker `DEPT_01` / Nhân sự |
| 13 | **Thêm** Create dialog | department combobox **PRESENT** · effHits=**4** · status+position **PRESENT** |
| 14 | EFF=0 branch | **NOTE_BLOCKED** — EFF=4; unit cite empty CTA `HRM-EMP-DEPT-EMPTY-CATALOG` |

**HDSD / testids:** `hdsd-employees-create-btn` · `hdsd-employee-form-dialog` · `hdsd-employee-form-submit` · `emp-employment-status-select` **PRESENT** · department CatalogSearchPicker **PRESENT** · position CatalogSearchPicker **PRESENT**

**Screens:** `01-employees-list` · `02-edit-dialog` · `03-dept-picker-options` · `04-dept-selected` · `05-after-save` · `06-f5-list` · `07-f5-edit-picker` · `08-create-dialog`

---

## 3. UF matrix (dispatch CLOSABLE)

| UF | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **1 L0 + vitest 22** | stack 200 · mapper+mount-guard | 200/200/200 · **22/22** | 🟢 |
| **2 Edit picker ∈ EFF** | CatalogSearchPicker options ∩ departments EFF | **PRESENT** · opts=4 · effHits=4 | 🟢 |
| **3 Create picker mounts** | Create same picker | **PRESENT** · effHits=4 | 🟢 |
| **4 AC-PLT-EMP-DEPT-01 Lưu + FE+F5** | PATCH `custom_fields.department` ∈ EFF 2xx · no top-level · F5 retain | **custom_fields.department=DEPT_01** · topLeak=false · **200 HRM-EMP-202** · F5 exact | 🟢 |
| **5 invent KEY** | 400 DEPT-KEY / WH-DEPT-KEY + no persist | WH **400 `HRM-WH-DEPT-KEY`** (w/ position_key) · Select-only UI OBS | 🟢 / 🟡 UI |
| **6 status Select + position picker** | PRESENT Edit+Create · no reopen CLOSED peers | Edit+Create **PRESENT** both | 🟢 |
| **7 Nest emp_department DENY** | 404/absent | 400/404 · no src route | 🟢 |

**Overall:** **PASS_WITH_OBS** — Condition **CLOSABLE** (UF4 persist wire closed; OBS = EFF=0 NOTE_BLOCKED + invent Select-only UI).

---

## 4. Root cause closure (spec says / code does)

| Layer | Prior FAIL `EMPDEPTQAFE-MSKG2900` | FE-02 + QA-FE-02 |
|-------|----------------------------------|------------------|
| Form-gate | department in required[] · picker PRESENT | ✅ RETAIN |
| Mutate wire | `useEmployeeMutations` **omit** department | ✅ `mergeEmployeeDepartmentWriteFields(data.department, …)` |
| API payload | no dept field · F5 empty | ✅ `custom_fields.department=DEPT_01` · never top-level |
| BE top-level | PATCH `{department}` → 400 VAL-001 | ✅ FE never sends top-level |
| Persist / F5 | `(none)` | ✅ GET/F5 `DEPT_01` · reopen picker same key |
| Orthogonal block | STATUS-REASON-KEY on UAT NV 0100 | ✅ prefer `status=active` + `job=CEO` |
| Invent KEY L1 | WH 400 WH-DEPT-KEY | ✅ RETAIN (w/ position_key) |

**Class:** peer FE-02 wire fix (same family as EMP-STATUS / EMP-POSITION mount-gate FE-02) — here mount was already green; **persist wire** was the blocker; now closed.

---

## 5. Key network stamps

```text
GET  /api/hrm/settings-catalogs/departments/items?company_id=main
  → 200  active=4  DEPT_01..04

POST /api/hrm/employees/0f6e1369-…/work-timeline?company_id=main
  body: { department_key:"zz_invent_emp_dept_mskh0e5j", position_key:"CEO", … }
  → 400 HRM-WH-DEPT-KEY
  (L1 EMPDEPTQA-MSK3VVXX RETAIN · ≡ HRM-EMP-DEPT-KEY class)

GET  /api/hrm/emp-departments → 404
GET  /api/hrm/employees/emp-departments* → 400/404
  src emp-department*.ts ABSENT · Nest DENY

PATCH /api/hrm/employees/0f6e1369-…  (browser Lưu after pick DEPT_01)
  body: {
    job_title_key:"CEO",
    status:"active",
    full_name:"Nguyễn Văn QA M3 987275",
    custom_fields:{ tenant_id:"xevn", status_reason_key:"hr_emp_str_msk20g7h", department:"DEPT_01" }
  }
  → 200 HRM-EMP-202
  → NO top-level department / department_key

GET  /api/hrm/employees/0f6e1369-… after F5
  → department=DEPT_01  exact=true
```

**OBS (not FAIL):** invent UI = CatalogSearchPicker Select-only (free-text invent N/A) — KEY proven via WH API. EFF=0 empty CTA live path **NOTE_BLOCKED** (EFF=4 · unit cite empty catalog code).

---

## 6. Honesty / must_keep RETAIN

| Seal | Status |
|------|--------|
| L1 DEPT KEY `EMPDEPTQA-MSK3VVXX` | **RETAIN** |
| EMP-POSITION FE `EMPPOSQCFE-8DEF5536` | **CLOSED RETAIN** — picker still PRESENT |
| EMP-STATUS FE `EMPSTQAFE2-MSKE3NV1` | **CLOSED RETAIN** — select still PRESENT |
| Nest `emp_department` | **DENY** |
| Nest `emp_position` | **DENY** (orthogonal) |
| EMP-CUSTOM / ATT / LVRULE | **HOLD RETAIN** — not reopened |
| Honesty false / C-SLICE-≠-MODULE | **LOCKED** — no module EMP UAT claim |
| Seed / wipe EFF / flip ready | **NONE** |

---

## 7. Verdict & handoff

| Item | Value |
|------|-------|
| **overall** | **PASS_WITH_OBS** |
| **Condition R-PLT-EMP-DEPT-FE-01** | **CLOSABLE** |
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | `qc` |
| **DENY this seat** | seed · Nest emp_department · reopen EMP-POSITION/STATUS FE CLOSED · invent LVRULE · flip ready · module EMP UAT · QC-close *this* QA seat alone |

**completion_report:** FE-02 retest PASS_WITH_OBS. Prior FAIL mutate-wire gap closed: browser Lưu sends `custom_fields.department=DEPT_01` (never top-level), PATCH **200 HRM-EMP-202**, F5 exact. Edit+Create pickers PRESENT ∈ EFF=4. Invent WH **400 HRM-WH-DEPT-KEY** L1 RETAIN. Nest emp_department DENY. Status+position PRESENT (CLOSED peers RETAIN). Vitest 22/22 · L0 200. OBS only: EFF=0 NOTE_BLOCKED + invent Select-only UI. Honesty locks intact — Condition CLOSABLE ≠ module EMP UAT.

**residual:** none P0/P1 for R-PLT-EMP-DEPT-FE-01 · OBS accept EFF0/Select-only · honesty false LOCKED

**next_dispatch_prompt:**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-QC-FE-01
from_role: pm
to_role: qc
lane: governance
priority: P2
entry: QA-FE-02 PASS_WITH_OBS stamp EMPDEPTQAFE2-MSKH0E5J · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-qa-fe-02.md
close: R-PLT-EMP-DEPT-FE-01 (FE mutate wire custom_fields.department + F5)
RETAIN: L1 EMPDEPTQA-MSK3VVXX · EMP-POSITION FE EMPPOSQCFE-8DEF5536 CLOSED · EMP-STATUS FE EMPSTQAFE2-MSKE3NV1 CLOSED · Nest emp_department DENY
ACCEPT OBS: EFF=0 NOTE_BLOCKED · invent Select-only UI
DENY: seed · flip ready · invent LVRULE · reopen CLOSED peers · module EMP UAT · Phase1 · UF 🟢
honesty: personnel/e2e/printable=false · C-SLICE-≠-MODULE
exit: GWC | GO_WITH_CONDITIONS wording · Condition CLOSED · PASS_TO_PM · evidence qc-fe-01.md
```
