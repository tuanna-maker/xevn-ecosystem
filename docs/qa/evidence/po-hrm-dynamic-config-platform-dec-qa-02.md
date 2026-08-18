# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QA-02` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-01` READY_FOR_QA |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-07 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` · API scope `holding`+`main` |
| **Stamp** | `DECPLATQA2-MSJ21R6Z` · retest `DECPLATQA2R-MSJ2CPVI` |
| **L1 SEAL ref** | `DECPLATQA-MSJ1FB3D` · DEC-QC-01 GWC — **not wiped** |
| **U65** | zero-seed · **browser-only** FE click path |
| **Honesty** | decisions UAT=**false** · personnel/e2e/pay/att/rec/printable=**false** · **LOCKED** · DENY module decisions UAT |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (browser AC-PLT-DEC · **21/21** after retest) |
| **closes** | `R-PLT-DEC-FE-01` verify |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 portal / hrm / xbos | **200** / **200** / **200** |
| `qc:fe-be-health` | **ALL PASS** (pre-run) |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-dec-qa-02.mjs` |
| Retest | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-dec-qa-02-retest.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-dec-qa-02-browser.json` |
| Retest JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-dec-qa-02-retest.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-dec-qa-02/` (01–24) |

**spec_ref:** FE-01 §3 click path · L1 SEAL `DECPLATQA-MSJ1FB3D` · QC GWC CONDITION `R-PLT-DEC-FE-01`

---

## 2. Click path (U65 · HDSD inventory)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok · L0 PASS |
| 1 | **Settings** → tab **Loại quyết định DEC** (`settings-tab-dec-decision-types`) | 🟢 panel `settings-dec-decision-types` |
| 2a | Format INVALID: `BAD KEY` / `9bad_key` → **Tạo** | Toast **HRM-PLT-CAT-CODE-INVALID** / «Mã loại quyết định không hợp lệ» |
| 2b | Open key `hr_custom_dec_09_msj21r6z` · nhãn · **Tạo loại quyết định** | Network **PUT** `/api/hrm/decisions/decision-types` → **200** `HRM-DEC-TYP-200` id=`9b733ebe-…` |
| 2c | `HRD_QA_MSJ21R6Z` uppercase-alone | **PUT 200** — **not** CODE-INVALID (case allowed) |
| 3 | **Tải lại / F5** → row + **Picker hiệu lực** | Row `settings-dec-decision-type-row-hr_custom_dec_09_msj21r6z` · picker has key · GET effective holding+main has key |
| 4 | **Quyết định** → Thêm → `hdsd-decisions-form-type` | 🟢 option open key from effective |
| 5 | CNS unknown when EFF>0 (retest) | FE submit → **400** `HRM-DEC-TYPE-UNKNOWN` + toast catalog copy |
| 6 | Create QSĐ + retire + history (retest) | POST decisions **201** `HRM-DEC-201` · retire **201** · list still shows key · form picker hides |
| 7 | must_keep | Decisions UI + WH hint · EMP DOC/ET tabs · ATT leave · REC tabs |

**HDSD ids exercised:** `settings-tab-dec-decision-types` · `settings-dec-decision-types` · `settings-dec-decision-types-table` · `settings-dec-decision-types-picker-preview` · `hdsd-dec-decision-type-key|name|save|reload|retire-*|effective-picker` · `hdsd-decisions-form-type|code|title|employee|position|status|submit` · `hdsd-decisions-effective-wh-hint`

**Seed:** none. **Flip honesty / invent decisions UAT:** none. **Wipe L1 SEAL:** none.

---

## 3. AC map

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| L0-STACK | Stack 200 | portal/hrm/xbos 200 | 🟢 |
| AC-PLT-DEC-TAB / PANEL | Settings DEC tab+panel | Visible | 🟢 |
| AC-PLT-DEC-FORMAT-SPACE/DIGIT | Space / leading digit → CODE-INVALID toast | Toast PASS | 🟢 |
| AC-PLT-DEC-CREATE-2XX | Open key PUT 2xx | **200** `HRM-DEC-TYP-200` | 🟢 |
| AC-PLT-DEC-HRD-CASE-VALID | HRD_* uppercase VALID | **200** (not INVALID) | 🟢 |
| AC-PLT-DEC-F5-ROW | F5 row persists | Row after F5 | 🟢 |
| AC-PLT-DEC-EFFECTIVE-PICKER | Settings effective picker | Has open key | 🟢 |
| AC-PLT-DEC-FORM-OPEN / TYPE-PICKER | Decisions form binds effective | Dialog + option PASS | 🟢 |
| AC-PLT-DEC-MUSTKEEP-CREATE | Create QSĐ 2xx | Retest **201** `HRM-DEC-201` id=`c8a10aa6-…` type=`hr_custom_dec_09_msj2cpvi` | 🟢 |
| AC-PLT-DEC-CNS-UNKNOWN | 400 TYPE-UNKNOWN + FE toast | Retest **400** + toast | 🟢 |
| AC-PLT-DEC-RETIRE-HIDE / FORM-HIDE | Retire hides pickers | Active gone · form hide | 🟢 |
| AC-PLT-DEC-HISTORY-KEY | Old QSĐ keeps key | FE+API type=`hr_custom_dec_09_msj2cpvi` | 🟢 |
| must_keep DEC/EMP/ATT/REC | Surfaces load | All PASS · WH hint visible | 🟢 |

**Out of scope / DENIED this seat:** module decisions UAT · flip `*_ready` · claim module GO · wipe L1 SEAL `DECPLATQA-MSJ1FB3D` · Phase1 DONE.

---

## 4. Key network stamps

```text
# First pass (Settings CFG)
PUT  /api/hrm/decisions/decision-types
     → 200 HRM-DEC-TYP-200 key=hr_custom_dec_09_msj21r6z id=9b733ebe-…
PUT  /api/hrm/decisions/decision-types
     → 200 HRM-DEC-TYP-200 key=HRD_QA_MSJ21R6Z id=75a863e4-…
GET  …/decision-types/effective?company_id=holding|main → 200 has open key
POST …/decision-types/:id/retire → 2xx (first-pass retire of msj21r6z)

# Retest (create / CNS / history) stamp DECPLATQA2R-MSJ2CPVI
PUT  /api/hrm/decisions/decision-types
     → 200 HRM-DEC-TYP-200 key=hr_custom_dec_09_msj2cpvi id=6dfd7f66-…
POST /api/hrm/decisions
     → 201 HRM-DEC-201 id=c8a10aa6-… type=hr_custom_dec_09_msj2cpvi
POST /api/hrm/decisions (CNS rewrite unknown)
     → 400 HRM-DEC-TYPE-UNKNOWN + FE toast
POST …/decision-types/:id/retire → 201
GET  /api/hrm/decisions → row keeps decision_type=hr_custom_dec_09_msj2cpvi
```

---

## 5. Honesty locks

| Flag | Value |
|------|-------|
| Decisions / QSĐ module UAT | **false** — browser AC slice PASS ≠ module UAT |
| personnel / e2e / pay / att / rec / printable | **false LOCKED** |
| Module DEC / Phase1 DONE | **DENIED** |
| Seed | **none** |
| DEC-QC-01 L1 GWC | **SEAL retained** — not wiped |

---

## 6. Defect register / OBS

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| — | — | No browser blocker after retest | — |

**OBS (process):**
1. First-pass create/CNS failed client gate — Settings `emptyForm.isPersonBound` defaults **true**, so new open keys require **employee Select** (not name-only). Retest selected `hdsd-decisions-form-employee` → PASS.
2. CNS FE path: one-shot route rewrite of POST `decision_type` → unknown (picker cannot select ∉ effective); asserts FE toast on **400** `HRM-DEC-TYPE-UNKNOWN`.

---

## 7. completion_report

**Closed:** U65 browser Settings DEC CFG + Decisions effective picker UF; format INVALID toast; HRD_* case VALID; create open key PUT 2xx → F5 row + pickers; Decisions form binds effective; CNS **400** + FE toast; create QSĐ **201** → retire hide → history keeps key; must_keep DEC/EMP/ATT/REC smoke; L1 SEAL `DECPLATQA-MSJ1FB3D` retained; honesty false LOCKED; **21/21 PASS**; closes `R-PLT-DEC-FE-01` verify.

**Residual:** none P0 for this seat. Next = QC slice gate DEC-QC-02 (browser GWC) — **do not** invent decisions UAT / flip ready / wipe L1.

---

## 8. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qa-02.md` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QC-02
from_role: pm
to_role: qc
lane: governance
priority: P0
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QA-02 PASS_TO_PM
program: PO-HRM-CONTINUOUS-W8-20260807
ref_qa: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qa-02.md
stamp_ref: DECPLATQA2-MSJ21R6Z · retest DECPLATQA2R-MSJ2CPVI · L1 SEAL DECPLATQA-MSJ1FB3D (do not wipe)

## task
QC gate slice DEC FE browser UF (R-PLT-DEC-FE-01 closed by QA-02):
1) Audit evidence AC 21/21 + network stamps (PUT decision-types 2xx · HRD_* case · effective picker · POST decisions 201 · CNS 400 TYPE-UNKNOWN · retire hide · history key)
2) Confirm U65 zero-seed · honesty decisions/personnel/e2e/pay/att/rec/printable=false LOCKED
3) Confirm L1 SEAL DECPLATQA-MSJ1FB3D not wiped; DENY invent decisions UAT / flip *_ready / claim module GO
4) Verdict GO | GWC | NO-GO with residual + next_dispatch_prompt
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qc-02.md
```
