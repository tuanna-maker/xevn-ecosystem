# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QA-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QA-02` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **prior** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-FE-01` **READY_FOR_QA** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Stamp** | `SIINSQA2-MSJAJ04X` |
| **U65** | zero-seed · **browser-only** for UF · L1 probe ≠ 🟢 UF |
| **Retain** | L1 QA-01 stamp **`SIINSQA-MSJA2Z7H`** · QC-01 **GWC L1** — **NOT reopened / rewritten** |
| **Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · CTR legal-print + SI enrollment EMP-BE-02 **SEAL RETAIN** · EMP·DEC·PAY·ATT·REC·EXT·LIST-TOTALS **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · **DENY** module SI/CTR UAT |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** (enrollment Lưu with Nest open key ∈ EFF → **400** `HRM-VAL-001`) |
| **change_mode** | ADD verify · no `apps/**` · no seed · no ready flip |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-si-ins-catalog-qa-02.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-si-ins-catalog-qa-02-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-si-ins-catalog-qa-02/` |
| Git HEAD | `dc930c5` |
| Seed | **none** |

**spec_ref:** BA-01 §6 AC-PLT-SI-INS-01* · FE-01 READY · L1 retain `SIINSQA-MSJA2Z7H`

---

## 2. HDSD inventory (U76)

| testid / path | Used |
|---------------|------|
| `settings-tab-si-insurance-types` · `settings-si-insurance-types` · `settings-si-insurance-types-table` | ✅ |
| `hdsd-si-insurance-type-key` · `name` · `save` · `reload` · row `settings-si-insurance-type-row-{key}` | ✅ |
| `hdsd-policy-insurance-type-picker` · `insurance-policy-master-e3` | ✅ |
| `hdsd-enrollment-insurance-type-picker` · `hdsd-insurance-enrollments-root` · `?tab=insurance` | ✅ |
| `hdsd-policy-open-si-insurance-types` / enrollment CTA | wire present when empty (EFF>0 → not forced) |

**Click path:** login → Settings `?tab=si-insurance-types` → Tạo loại BH → F5 → `/hr/insurance` policy → F5 → `/hr/employees/{id}?tab=insurance` → Thêm BH → Lưu.

---

## 3. AC stamp table (L2 / L2.5)

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **L0** | stack 200 | 200 | 🟢 |
| **AC-PLT-SI-INS-01d** | Settings CREATE N+1 → F-SI-CAT-TYP 2xx → F5 row | PUT **200** `hr_si_cat_msjaj04x` · F5 row **true** | 🟢 |
| **AC-PLT-SI-INS-01-PICKER-SOT** | Policy Network GET `…/insurance-types/effective` (not MD-alone) | GET **200** · MD-alone=false · hits=1 | 🟢 |
| **AC-PLT-SI-INS-01c** | EFF empty soft + CTA · no seed | EFF=6 live — empty not forced · no seed · CTA wire N/A | 🟢 |
| **AC-PLT-SI-INS-01-POLICY** | Pick type ∈ EFF → Lưu 2xx → F5 | POST **201** `HRM-INS-POL-201` type=`hr_si_cat_msjaj04x` · F5 **true** | 🟢 |
| **AC-PLT-SI-INS-01b-POLICY** | Invent → FE block and/or **4xx** `HRM-INS-TYPE-KEY` | POST invent → **400** `HRM-INS-TYPE-KEY` | 🟢 |
| **AC-PLT-SI-INS-01-ENROLL-SOT** | Enrollment Network GET effective | GET **200** · picker visible | 🟢 |
| **AC-PLT-SI-INS-01-ENROLLMENT** | Pick type ∈ EFF → Lưu **2xx** → F5 | Pick `hr_si_cat_msjaj04x` · POST → **400** `HRM-VAL-001` | 🔴 |
| **AC-PLT-SI-INS-01b-ENROLLMENT** | Invent → KEY / honest reject | `accident` ∉ EFF → **400** `HRM-INS-TYPE-KEY` | 🟢 |
| **AC-PLT-SI-INS-01** (aggregate) | Policy + enrollment consumers | policy 🟢 · enrollment 🔴 | 🔴 |
| **AC-PLT-SI-INS-01H** | Honesty / seals / retain L1 | false · RETAIN · C-SLICE · no L1 rewrite | 🟢 |
| **MUST_KEEP-CTR-SMOKE** | CTR legal-print load no mutate | load OK · seals RETAIN | 🟢 |
| **R-PLT-SI-INS-03** | Close FE MD-alone SoT | Nest EFF picker proven policy+enrollment | ✅ **CLOSED** |

---

## 4. Key network stamps (browser)

```text
PUT  /api/hrm/contracts-insurance/insurance-types                 → 200  key=hr_si_cat_msjaj04x
GET  /api/hrm/contracts-insurance/insurance-types/effective?company_id=main → 200  (policy + enrollment)
POST /api/hrm/contracts-insurance/insurance-policies              → 201  HRM-INS-POL-201 type=hr_si_cat_msjaj04x
POST /api/hrm/contracts-insurance/insurance-policies (invent)     → 400  HRM-INS-TYPE-KEY
POST /api/hrm/employee-insurances (type=hr_si_cat_msjaj04x ∈ EFF) → 400  HRM-VAL-001  ← FAIL
POST /api/hrm/employee-insurances (type=accident ∉ EFF)          → 400  HRM-INS-TYPE-KEY
```

---

## 5. Defect / residual register

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| **D-PLT-SI-INS-DTO-ISIN** | **P1** | `CreateEmployeeInsuranceDto` / Update still `@IsIn(['social','health','unemployment','accident','life'])` — Nest open catalog key ∈ EFF (e.g. `hr_si_cat_*`) rejected as **`HRM-VAL-001`** before KEY assert. Blocks AC-PLT-SI-INS-01 enrollment U65 after FE picker rebind. Elevates L1 **OBS-DTO-IsIn** (P2) → **P1**. | **dev-be** |
| **R-PLT-SI-INS-03** | — | FE picker Nest EFF | **CLOSED** this seat |
| L1 OBS-DTO-IsIn | superseded | Same root cause — do not keep as idle OBS | → D-PLT-SI-INS-DTO-ISIN |

**Root cause (verified):** `apps/api/hrm-api/src/employee-insurances/dto/create-employee-insurance.dto.ts` `@IsIn([...])` vs Option B open N+1 type keys from F-SI-CAT-EFF-01.

**Not defects this seat:** Policy consumer path · Settings admin 01d · invent KEY policy · picker SoT · honesty / L1 retain.

---

## 6. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`contracts_printable_ready`** | **`false`** — **DENIED** flip |
| **`hrm_personnel_uat_ready`** | **`false`** — **DENIED** flip |
| CTR legal-print / library | **SEAL RETAIN** |
| SI enrollment EMP-BE-02 / ONE SoT | **SEAL RETAIN** (DTO deepen ≠ rewrite schema) |
| L1 QA-01 `SIINSQA-MSJA2Z7H` · QC-01 GWC L1 | **RETAIN** — not rewritten as new L1 stamp |
| Module SI / CTR UAT / Phase1 | **DENIED** — **`C-SLICE-≠-MODULE`** |
| Seed | **none** |

---

## 7. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **FAIL_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-qa-02.md` |
| **machine_json** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-si-ins-catalog-qa-02-browser.json` |
| **next_owner** | **dev-be** (then **qa** retest QA-02 · then **qc** narrow FE browser) |
| **completion_report** | See §8 |
| **next_dispatch_prompt** | See §9 |

---

## 8. completion_report

**Closed:** L2/L2.5 U65 browser for SI-INS FE-01 — Settings Loại BH CREATE `hr_si_cat_msjaj04x` PUT 200 + F5; policy + enrollment pickers Network GET `…/insurance-types/effective` 200 (R-PLT-SI-INS-03 **CLOSED**); policy Lưu type ∈ EFF → 201 + F5; invent policy → 400 `HRM-INS-TYPE-KEY`; invent enrollment OOS → 400 KEY; 01c soft (EFF≥1 not wiped); honesty false; L1/QC-01 seals **retained**; DENY module SI/CTR UAT; zero-seed.

**Open / FAIL:** Enrollment Lưu with Nest open key ∈ EFF → **400 `HRM-VAL-001`** (DTO `@IsIn` closed) — **D-PLT-SI-INS-DTO-ISIN** P1 → **dev-be**. Aggregate **AC-PLT-SI-INS-01** FAIL until enrollment 2xx + F5.

**Stamp:** `SIINSQA2-MSJAJ04X` · **ack_status:** **FAIL_TO_PM**.

---

## 9. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-02
from_role: pm
to_role: dev-be
lane: execution
priority: P0
program: PO-HRM-CONTINUOUS-W8-20260807
prior: SI-INS-CATALOG-QA-02 FAIL_TO_PM stamp SIINSQA2-MSJAJ04X · residual D-PLT-SI-INS-DTO-ISIN
retain: L1 QA-01 SIINSQA-MSJA2Z7H · QC-01 GWC L1 · CTR legal-print · enrollment EMP-BE-02 ONE SoT schema · R-PLT-SI-INS-03 CLOSED (FE)

entry_criteria:
  - Read docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-qa-02.md §5
  - BA-01 AC-PLT-SI-INS-01 enrollment · BR-PLT-SI-INS-06
  - CreateEmployeeInsuranceDto / UpdateEmployeeInsuranceDto @IsIn closed enum

exit_criteria:
  - Open catalog: type string passes DTO when format OK; when EFF>0 assert ∈ Nest EFF → invent still 400 HRM-INS-TYPE-KEY (not VAL-001 for open keys)
  - jest: open key ∈ EFF create 2xx · invent KEY · must_keep lifecycle actions F-CORE-SI-03
  - honesty printable/personnel=false · no schema rewrite employee_insurances · no claim SI UAT
  - evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-be-02.md
  - ack_status READY_FOR_QA
  - next: qa retest PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QA-02 enrollment UF only → then qc narrow FE browser

cấm: pnpm seed:* · flip printable/personnel · reopen L1 seals · rewrite enrollment ONE SoT · claim module SI/CTR UAT
```
