# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QA-02` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01` READY_FOR_QA |
| **program** | `PO-HRM-CONTINUOUS-W7-20260807` |
| **Date** | 2026-08-07 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` · API probe `holding`+`main` |
| **Stamp** | `EMPPLATQA2-MSJ0OAL9` |
| **L1 SEAL ref** | `EMPPLATQA-MSIZXHIM` · EMP-QC-01 GWC — **not reopened** |
| **U65** | zero-seed · **browser-only** FE click path |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · pay/att/rec=false · **LOCKED** · DENY module personnel UAT |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (browser AC-PLT-EMP-02..05 · **21/21**) |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| `qc:fe-be-health` | **ALL PASS** (proxy employees + catalog-sync 200) |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-emp-qa-02.mjs` |
| YCTD retest | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-emp-qa-02-yctd-retest.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-qa-02-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-emp-qa-02/01..23-*.png` |

**spec_ref:** FE-01 §3 click path · SA vertical **AC-PLT-EMP-02..05** · L1 baseline QA-01 / QC-01 GWC SEAL (API-only — **not reopened**)

---

## 2. Click path (U65 · HDSD inventory)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok · L0 PASS |
| 1a | **Settings** → tab **Loại giấy tờ EMP** (`settings-tab-emp-document-types`) | 🟢 panel `settings-emp-document-types` |
| 1b | DOC invalid: nhập `CCCD` → **Tạo** | Toast **HRM-PLT-CAT-CODE-INVALID** / «Mã loại giấy tờ không hợp lệ» |
| 2 | DOC: key `hr_doc_custom_09_msj0oal9` · nhãn · **Tạo loại giấy tờ** | Network **PUT** `/api/hrm/employees/document-types` → **200** `HRM-EMP-DOC-200` id=`8be6fff0-…` |
| 3 | **F5** → tab lại → row + **Picker hiệu lực** | Row `settings-emp-document-type-row-hr_doc_custom_09_msj0oal9` · picker has key |
| 4a | **Settings** → **Loại hình thuê EMP** | Tab + panel visible |
| 4b | ET invalid: `FULL_TIME` | Toast **HRM-PLT-CAT-CODE-INVALID** |
| 5 | ET: `seasonal_temp_msj0oal9` → **2xx**; `full-time` → persist **`full_time`** | PUT **200** `HRM-EMP-ET-200` · F5 seasonal row · effective picker |
| 6 | **Nhân sự** → Thêm → tab Công việc → `hdsd-emp-employment-type-picker` | 🟢 option `seasonal_temp_msj0oal9` |
| 7 | **Tuyển dụng** → YCTD → `hdsd-requisition-create-btn` → `hdsd-requisition-employment-type` | 🟢 retest key `seasonal_temp_yctd_msj0rv2s` (see OBS) |
| 8 | **Ngừng** DOC + ET seasonal | Retire **201** · active rows gone · effective pickers hide |
| 9 | History soft-delete | GET-by-id DOC/ET **200** `status=retired` · keys intact |
| 10 | must_keep | Position/combobox on Emp form · `/hr/contracts` + SI surfaces load |

**HDSD ids exercised:** `settings-tab-emp-document-types` · `settings-tab-emp-employment-types` · `hdsd-emp-document-type-key|name|save|reload|retire-*|effective-picker` · `hdsd-emp-employment-type-key|name|save|reload|retire-*|effective-picker` · `hdsd-emp-employment-type-picker` · `hdsd-requisition-create-btn` · `hdsd-requisition-form-dialog` · `hdsd-requisition-employment-type`

**Seed:** none. **Flip honesty / invent personnel UAT:** none. **Wipe L1 SEAL:** none.

---

## 3. AC map

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **AC-PLT-EMP-02** | Settings DOC create → 2xx → F5 row → effective picker | PUT **200** · F5 row · picker has key · CCCD INVALID toast | 🟢 |
| **AC-PLT-EMP-04** | ET seasonal 2xx · full-time→full_time · FULL_TIME INVALID · Emp+YCTD pickers | All network + pickers PASS (YCTD after retest) | 🟢 |
| **AC-PLT-EMP-03** | Retire → active hide · historical key visible | Retire **201** · pickers hide · GET-by-id **200** retired | 🟢 |
| **AC-PLT-EMP-05** / consumers | GET employment-types/effective drives pickers | Emp form + YCTD + Settings preview | 🟢 |
| must_keep | Position XBOS REF · contracts/SI load | Form combobox + contracts/SI 🟢 | 🟢 |
| NO-HARDCODE | CCCD / FULL_TIME rejected (format-only) | Client toast INVALID · no invent closed enum | 🟢 |

**Out of scope / DENIED this seat:** module personnel UAT · flip `hrm_personnel_uat_ready` · J-* promote · reopen EMP-QC-01 L1 · Phase1 DONE · DOC checklist consumer full spine (FE residual; Settings effective covers picker AC).

---

## 4. Key network stamps

```text
PUT  /api/hrm/employees/document-types
     → 200 HRM-EMP-DOC-200 key=hr_doc_custom_09_msj0oal9 id=8be6fff0-…
GET  …/document-types?status=active → 200 (F5 row)
GET  …/document-types/effective → picker has key
POST …/document-types/:id/retire → 201
GET  …/document-types/:id → 200 status=retired (history)

PUT  /api/hrm/employees/employment-types
     → 200 HRM-EMP-ET-200 key=seasonal_temp_msj0oal9 id=25bccd05-…
PUT  …/employment-types (full-time) → 200 employmentTypeKey=full_time
GET  …/employment-types/effective?company_id=holding|main → has seasonal (pre-retire)
POST …/employment-types/:id/retire → 201
GET  …/employment-types/:id → 200 status=retired

YCTD retest: PUT employment-types seasonal_temp_yctd_msj0rv2s → 200
             FE picker hdsd-requisition-employment-type option_click
```

---

## 5. Honesty locks

| Flag | Value |
|------|-------|
| `hrm_personnel_uat_ready` | **false** — browser AC slice PASS ≠ module UAT |
| `employees_e2e_linkage_ready` | **false** |
| pay / att / rec ready | **false** |
| Module EMP / Phase1 DONE | **DENIED** |
| Seed | **none** |
| EMP-QC-01 L1 GWC | **SEAL retained** — not reopened |

---

## 6. Defect register / OBS

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| — | — | No browser blocker after YCTD retest | — |

**OBS (process):**
1. First pass YCTD failed `dialog_missing` — locator used role text; HDSD create is `hdsd-requisition-create-btn` («Thêm yêu cầu»). Retest with testid → **PASS**. Main runner should prefer that testid (script updated companion).
2. DOC checklist consumer full spine deferred (FE-01 residual) — Settings effective picker covers AC-PLT-EMP-02 picker for this seat.
3. History assert via GET-by-id soft-retired (list `status=` default may omit retired) — keys remain readable; active pickers hide.

---

## 7. completion_report

**Closed:** Browser U65 AC-PLT-EMP-02..05 after FE-01. Settings DOC open key `hr_doc_custom_09_msj0oal9` → PUT 200 → F5 row + effective picker · CCCD INVALID toast · ET `seasonal_temp_msj0oal9` PUT 200 · `full-time`→`full_time` · FULL_TIME INVALID · Emp form + YCTD ET pickers from effective · retire DOC+ET 201 hide active · GET-by-id retired history · must_keep position/contracts/SI. Stamp `EMPPLATQA2-MSJ0OAL9`. **21/21** PASS. Zero-seed. L1 SEAL retained.

**Residual:** `hrm_personnel_uat_ready=false` until program promotes module EMP / J-* separately · DENY module UAT from this seat · OBS YCTD createBtn locator (closed by retest).

**Forbidden claims:** personnel UAT-ready · Phase1 DONE · flip honesty · wipe L1 QC-01.

---

## 8. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qa-02.md` |
| **machine_json** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-qa-02-browser.json` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QC-02
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QA-02
priority: P0
program: PO-HRM-CONTINUOUS-W7-20260807
stamp: EMPPLATQA2-MSJ0OAL9
stamp_ref_l1: EMPPLATQA-MSIZXHIM · EMP-QC-01 GWC SEAL (do not reopen API-only)

## read_first
1. docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qa-02.md
2. docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-qa-02-browser.json
3. docs/qa/evidence/po-hrm-dynamic-config-platform-emp-fe-01.md
4. docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qc-01.md (L1 GWC SEAL — do not reopen)

## task
Narrow QC gate on browser AC-PLT-EMP-02..05 after QA-02 stamp EMPPLATQA2-MSJ0OAL9 (21/21).
- Audit click path: Settings DOC/ET create → PUT 2xx → F5 → CCCD/FULL_TIME INVALID toast → Emp+YCTD effective pickers → retire hide → GET-by-id retired history
- must_keep: position XBOS REF · contracts/SI · LIST-TOTALS/CTR · soft-delete · L1 SEAL
- Honesty LOCKED false — DENY hrm_personnel_uat_ready / employees_e2e / module EMP UAT / Phase1 · C-SLICE-≠-MODULE
- Cấm: reopen EMP-QC-01 L1 · invent ready=true · seed · wipe seal

## exit
GO | GO WITH CONDITIONS | NO-GO · PASS_TO_PM · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qc-02.md
```
