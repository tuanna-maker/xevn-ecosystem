# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-QA-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-QA-FE-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **priority** | P2 |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-FE-01` **READY_FOR_QA** agent `b5138764-070b-4db5-97aa-2493d96dfef0` |
| **ref_fe** | [`po-hrm-dynamic-config-platform-emp-dept-catalog-fe-01.md`](po-hrm-dynamic-config-platform-emp-dept-catalog-fe-01.md) Length≥7868 |
| **SA Option A** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-FE-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-FE-SA-01.md) |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` · `:5173` |
| **Stamp** | **`EMPDEPTQAFE-MSKG2900`** |
| **stamp_l1 RETAIN** | **`EMPDEPTQA-MSK3VVXX`** · invent → **400 `HRM-WH-DEPT-KEY`** ≡ `HRM-EMP-DEPT-KEY` LIVE (WH + `position_key`) |
| **U65** | zero-seed · **browser** FE click path · invent API spot ≠ UF 🟢 alone · **no wipe** EFF |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · EMP-POSITION FE CLOSED RETAIN · EMP-STATUS FE CLOSED RETAIN · EMP-CUSTOM / ATT / LVRULE HOLD · Nest emp_department DENY · **`C-SLICE-≠-MODULE`** · DENY QC-close this seat |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **FAIL** — **R-PLT-EMP-DEPT-FE-01 OPEN** |
| **condition_verify** | **R-PLT-EMP-DEPT-FE-01** → **OPEN** · Edit+Create department CatalogSearchPicker **PRESENT** ∈ departments EFF · **Lưu does NOT send department** · F5 **no persist** · mutation wire gap |
| **change_mode** | ADD verify · no `apps/**` product edit · no seed · no ready flip · **FORBIDDEN** reopen EMP-POSITION/STATUS FE CLOSED · Nest emp_department · invent LVRULE · module EMP UAT · QC-close |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Vitest | `empDeptCatalog` 7 + `empPositionCatalog` 7 + `EmployeeFormDialog.mount-guard` 9 = **23/23** exit **0** (incl. `R-PLT-EMP-DEPT-FE-02`) |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-emp-dept-catalog-qa-fe-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-dept-catalog-qa-fe-01-browser.json` (~23 386 B) |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-emp-dept-catalog-qa-fe-01/` (8 PNG) |
| FE parent | FE-01 READY_FOR_QA — force `'department'` into required basic fields + DEPT KEY toast helpers |
| L1 QA | stamp **`EMPDEPTQA-MSK3VVXX`** RETAIN · KEY LIVE |
| EMP-POSITION FE | stamp **`EMPPOSQCFE-8DEF5536` CLOSED RETAIN** — not reopened |
| EMP-STATUS FE | stamp **`EMPSTQAFE2-MSKE3NV1` CLOSED RETAIN** — not reopened |

**spec_ref:** AC-PLT-EMP-DEPT-01 / 01b · VAL-EMP-DEPT-CNS-* · HDSD CH06g · R-PLT-EMP-DEPT-FE-01 · KEY `HRM-EMP-DEPT-KEY` ≡ `HRM-WH-DEPT-KEY`

**Seed:** none · **ensureDefault:** none · **Nest emp_department:** DENIED.

**Target employee:** `0500220b-f289-40df-b07e-86316285439b` · `UAT NV 0100` · before department=`(none)` · after F5 still `(none)`

---

## 2. Click path (U65 · HDSD CH06g)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok |
| 1 | Settings `departments` EFF | **total=4** codes=`DEPT_01..04` labels=`Nhân sự,Vận hành,Kế toán,Kinh doanh` · **200** (L1 LIVE · no seed) |
| 2 | Invent API spot (WH) | POST invent `department_key` **with** `position_key=CEO` → **400 `HRM-WH-DEPT-KEY`** · no persist · L1 **RETAIN** |
| 2b | First WH probe missing `position_key` | **400 `HRM-WH-PICK-REQUIRED`** (orthogonal POSITION required) — not DEPT KEY; re-probed with position_key |
| 3 | Nest emp_department DENY | GET `/emp-departments*` → **400/404** · src route file **ABSENT** |
| 4 | Seals smoke | attendance-codes **200**/1 · emp-st **200**/4 · job_titles **200**/9 · EMP-POSITION/STATUS FE **CLOSED RETAIN** |
| 5 | **HRM → Nhân sự / Employees** | `/hr/employees?portal=1&companyId=main` · no Sync ERROR |
| 6 | Row ⋯ → **Sửa** Edit dialog | `hdsd-employee-form-dialog` opened via=`row_menu` |
| 7 | Department CatalogSearchPicker | **PRESENT** — options **4** · effHits=**4** (DEPT_01..04) · CatalogSearchPicker search |
| 8 | emp-employment-status-select | **PRESENT** — EMP-STATUS FE CLOSED RETAIN |
| 9 | Position CatalogSearchPicker | **PRESENT** · hits CEO…POS_01 — EMP-POSITION FE CLOSED RETAIN |
| 10 | Pick `DEPT_01` → **Lưu** | PATCH **did not include** `department` / `department_key` / `custom_fields.department` · last status **400 `HRM-EMP-STATUS-REASON-KEY`** (orthogonal status reason on this row) |
| 11 | F5 / GET | department=`(none)` · **exact=false** · reopen picker placeholder `Chọn phòng ban` |
| 12 | **Thêm** Create dialog | department combobox **PRESENT** · effHits=**4** · status+position **PRESENT** |
| 13 | EFF=0 branch | **NOTE_BLOCKED** — EFF=4; unit cite empty CTA `HRM-EMP-DEPT-EMPTY-CATALOG` |
| 14 | Static mutation wire | `useEmployeeMutations` **does not forward** `data.department` into create/update API payload |

**HDSD / testids:** `hdsd-employees-create-btn` · `hdsd-employee-form-dialog` · `hdsd-employee-form-submit` · `emp-employment-status-select` **PRESENT** · department CatalogSearchPicker **PRESENT** (eff-probe) · position CatalogSearchPicker **PRESENT**

**Screens:** `01-employees-list` · `02-edit-dialog` · `03-dept-picker-options` · `04-dept-selected` · `05-after-save` · `06-f5-list` · `07-f5-edit-picker` · `08-create-dialog`

---

## 3. UF matrix (dispatch CLOSABLE)

| UF | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **1 L0 + vitest 23** | stack 200 · mount-guard department in required[] | 200/200/200 · **23/23** | 🟢 |
| **2 Edit picker ∈ EFF** | CatalogSearchPicker options ∩ departments EFF | **PRESENT** · opts=4 · effHits=4 | 🟢 |
| **3 Create picker mounts** | Create same picker | **PRESENT** · effHits=4 | 🟢 |
| **4 AC-PLT-EMP-DEPT-01 Lưu + FE+F5** | PATCH/POST department ∈ EFF 2xx · F5 retain | **deptInBody=false** · F5 `(none)` | 🔴 |
| **5 invent KEY** | 400 DEPT-KEY / WH-DEPT-KEY + no persist | WH **400 `HRM-WH-DEPT-KEY`** (w/ position_key) · Select-only UI OBS | 🟢 / 🟡 UI |
| **6 status Select + position picker** | PRESENT Edit+Create · no reopen CLOSED peers | Edit+Create **PRESENT** both | 🟢 |
| **7 Nest emp_department DENY** | 404/absent | 400/404 · no src route | 🟢 |

**Overall:** **FAIL** — Condition **OPEN** (UF4 persist wire blocker).

---

## 4. Root cause (spec says / code does)

| Layer | Spec / FE-01 claim | Code does (QA verified) |
|-------|--------------------|-------------------------|
| Form-gate | Force `department` into `buildActiveFieldSet` required[] | ✅ mount-guard + browser Edit/Create picker **PRESENT** |
| Picker SoT | Settings `departments` EFF | ✅ options DEPT_01..04 |
| Mutate wire | «department already forwarded on create/update» | ❌ `useEmployeeMutations` create/update **omit** `department` — never maps into `custom_fields.department` or any API field |
| BE top-level | — | PATCH `{department:…}` → **400 `HRM-VAL-001`** `property department should not exist` |
| Persist storage | Lưu ∈ EFF → F5 | ❌ Network body has no dept · GET after F5 department empty |
| Invent KEY L1 | WH `department_key` invent → 400 KEY | ✅ **400 `HRM-WH-DEPT-KEY`** when payload includes required `position_key` |
| Toast helpers | `empDeptKeyToastFirst` wired | ✅ present in mutations catch path — but form never triggers DEPT KEY because dept not sent |

**Class:** same peer gap class as EMP-STATUS FE-01 / EMP-POSITION FE-01 *before* FE-02 — **except** here the field **mounts** (form-gate fixed) but **mutate wire ABSENT** → AC-01 persist FAIL.

---

## 5. Key network stamps

```text
GET  /api/hrm/settings-catalogs/departments/items?company_id=main
  → 200  active=4  DEPT_01..04

POST /api/hrm/employees/0500220b-…/work-timeline?company_id=main
  body: { department_key:"zz_invent_emp_dept_mskg2900", position_key:"CEO", … }
  → 400 HRM-WH-DEPT-KEY
  (L1 EMPDEPTQA-MSK3VVXX RETAIN · ≡ HRM-EMP-DEPT-KEY class)

GET  /api/hrm/emp-departments → 404 HRM-DATA-404
GET  /api/hrm/employees/emp-departments* → 400/404
  src emp-department*.ts ABSENT · Nest DENY

PATCH /api/hrm/employees/0500220b-…  (browser Lưu after pick DEPT_01)
  body: { status, status_reason_key:null, full_name, custom_fields:{BASIC_02,…} }
  → NO department / department_key / custom_fields.department
  → 400 HRM-EMP-STATUS-REASON-KEY (orthogonal OBS on this emp)

GET  /api/hrm/employees/0500220b-… after F5
  → department=(none)  persisted=false
```

**Spot (API, not UF 🟢):** PATCH top-level `department` → 400 VAL-001; accidental `custom_fields.department=invent` → 200 (no KEY assert on custom_fields) — **cleaned** before exit (set removed · 200 HRM-EMP-202). Confirms storage path for FE-02 should be `custom_fields.department` **and** invent KEY on that path is **not** LIVE yet (WH remains invent SoT L1).

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

## 7. Residual / next dispatch

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **R-PLT-EMP-DEPT-FE-01** | P2 **OPEN** | **dev-fe** | **FE-02:** wire `department` from `EmployeeFormDialog` → `useEmployeeMutations` create/update into **`custom_fields.department`** (BE rejects top-level `department`); after Lưu ∈ EFF → 2xx + F5 exact code/label; keep status+position required[]; keep DEPT KEY toast first; do not reopen POSITION/STATUS FE CLOSED; Nest DENY |
| Invent KEY form path | P3 OBS | note | WH KEY LIVE RETAIN; form invent Select-only; custom_fields invent currently **200** (no KEY) — do **not** invent Nest; if FE-02 only wires custom_fields without BE assert, invent AC stays WH SoT (document in FE-02 evidence) |
| STATUS-REASON-KEY on target row | OBS | — | Orthogonal to DEPT; pick emp with valid reason or set reason when testing Lưu |

**DENY this seat:** QC-close · module EMP UAT · seed · Nest emp_department · reopen EMP-POSITION/STATUS FE CLOSED · invent LVRULE · flip ready.

---

## 8. Handoff

- **completion_report:** QA-FE-01 U65 browser for EMP-DEPT catalog consumer. L0 200 · vitest 23/23 · departments EFF=4 · Edit+Create CatalogSearchPicker **PRESENT** ∈ EFF · status Select + position picker **PRESENT** (peers CLOSED RETAIN) · Nest emp_department DENY · WH invent **400 `HRM-WH-DEPT-KEY`** RETAIN. **FAIL** AC-PLT-EMP-DEPT-01 persist: `useEmployeeMutations` does not forward `department` → Network body omits dept → F5 empty. Condition **R-PLT-EMP-DEPT-FE-01 OPEN**. Stamp **`EMPDEPTQAFE-MSKG2900`**. Honesty false · C-SLICE · DENY QC-close.
- **residual:** R-PLT-EMP-DEPT-FE-01 OPEN — mutate wire FE-02
- **next_owner:** `dev-fe`
- **next_dispatch_prompt:** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-FE-02` — wire `department` from EmployeeFormDialog into `useEmployeeMutations` create/update as `custom_fields.department` (top-level `department` → 400 VAL-001); keep force-mount required[] + DEPT KEY toast; Lưu DEPT_0x ∈ EFF → 2xx + F5 persist; do not reopen EMP-POSITION/STATUS FE CLOSED; Nest emp_department DENY; no seed; honesty false. Cite QA FAIL stamp `EMPDEPTQAFE-MSKG2900` · evidence `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-qa-fe-01.md`.
- **evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-qa-fe-01.md`
- **ack_status:** **PASS_TO_PM**
- **overall:** **FAIL**
- **condition:** **R-PLT-EMP-DEPT-FE-01 OPEN** (not CLOSABLE)
