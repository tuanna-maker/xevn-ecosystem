# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QA-02-R2`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QA-02-R2` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **prior** | `SI-INS-CATALOG-BE-02` **READY_FOR_QA** · `D-PLT-SI-INS-DTO-ISIN` **FIXED** |
| **prior_fail** | QA-02 stamp **`SIINSQA2-MSJAJ04X`** — enrollment **400 `HRM-VAL-001`** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Stamp** | `SIINSQA2R2-MSJB0DY7` (runner stamp `SIINSQA2-MSJB0DY7`) |
| **U65** | zero-seed · **browser-only** enrollment UF · L1 probe ≠ 🟢 UF |
| **Retain** | L1 QA-01 **`SIINSQA-MSJA2Z7H`** · QC-01 **GWC L1** — **NOT reopened** · CTR legal-print · EMP-BE-02 ONE SoT · **R-PLT-SI-INS-03 CLOSED** |
| **Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · **`C-SLICE-≠-MODULE`** · **DENY** module SI/CTR UAT |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (enrollment open key ∈ EFF → **201** + F5; invent → **400 `HRM-INS-TYPE-KEY`**; not VAL-001) |
| **change_mode** | ADD verify · no `apps/**` product · no seed · no ready flip |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-si-ins-catalog-qa-02.mjs` (R2 date-fill hygiene) |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-si-ins-catalog-qa-02-r2-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-si-ins-catalog-qa-02/` |
| Git HEAD | `dc930c5` |
| Seed | **none** |

**spec_ref:** BA-01 AC-PLT-SI-INS-01-ENROLLMENT / 01b · BE-02 evidence · prior FAIL `SIINSQA2-MSJAJ04X`

---

## 2. HDSD inventory (U76)

| testid / path | Used |
|---------------|------|
| `settings-tab-si-insurance-types` · Settings CREATE (spot retain) | ✅ |
| `hdsd-policy-insurance-type-picker` · policy Nest EFF (R-PLT-SI-INS-03 retain) | ✅ |
| `hdsd-enrollment-insurance-type-picker` · `hdsd-insurance-enrollments-root` · `?tab=insurance` | ✅ |
| ViDateField `dd/MM/yyyy` start+end (runner fill — see residual note) | ✅ |

**Click path:** login → Settings SI type N+1 (retain) → `/hr/insurance` policy EFF (retain) → `/hr/employees/{id}?tab=insurance` → Thêm BH → pick Nest open key ∈ EFF → fill provider + dates → **Lưu** → Network 201 → F5.

---

## 3. AC stamp table (R2 focus + retain)

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **L0** | stack 200 | 200 | 🟢 |
| **Spot retain 01d / picker SoT / policy** | Settings + Nest EFF + policy still OK | PUT 200 · GET effective 200 · policy 201 · invent KEY | 🟢 **RETAIN** |
| **R-PLT-SI-INS-03** | CLOSED — Nest EFF not MD-alone | proven policy + enrollment GET effective | ✅ **CLOSED retain** |
| **AC-PLT-SI-INS-01-ENROLLMENT** | Open key ∈ EFF → POST **2xx** → FE + F5 | Pick `hr_si_cat_msjb0dy7` · POST **201** `HRM-EINS-201` · F5 **true** | 🟢 |
| **AC-PLT-SI-INS-01b-ENROLLMENT** | Invent ∉ EFF → **400 `HRM-INS-TYPE-KEY`** (not VAL-001 for open keys) | `accident` ∉ EFF → **400 `HRM-INS-TYPE-KEY`** | 🟢 |
| **D-PLT-SI-INS-DTO-ISIN** | FIXED — open key not VAL-001 | Open key 201 (not VAL-001); invent KEY | ✅ **CLOSED** |
| **AC-PLT-SI-INS-01H** | Honesty / seals / L1 retain | false · RETAIN · C-SLICE · DENY UAT | 🟢 |
| **MUST_KEEP-CTR-SMOKE** | CTR legal-print no mutate | load OK · seals RETAIN | 🟢 |

---

## 4. Key network stamps (browser)

```text
PUT  /api/hrm/contracts-insurance/insurance-types                 → 200  key=hr_si_cat_msjb0dy7
GET  /api/hrm/contracts-insurance/insurance-types/effective?company_id=main → 200  (policy + enrollment)
POST /api/hrm/contracts-insurance/insurance-policies              → 201  type=hr_si_cat_msjb0dy7
POST /api/hrm/contracts-insurance/insurance-policies (invent)     → 400  HRM-INS-TYPE-KEY
POST /api/hrm/employee-insurances (type=hr_si_cat_msjb0dy7 ∈ EFF) → 201  HRM-EINS-201  ← R2 PASS (was VAL-001)
POST /api/hrm/employee-insurances (type=accident ∉ EFF)          → 400  HRM-INS-TYPE-KEY
```

**Enrollment request body (happy path):** `type=hr_si_cat_msjb0dy7` · `start_date=2026-08-01` · `end_date=2026-12-31`

---

## 5. Defect / residual register

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| **D-PLT-SI-INS-DTO-ISIN** | — | Closed `@IsIn` on enrollment `type` | **CLOSED** this R2 (BE-02 + browser 201) |
| **OBS-PLT-SI-INS-EMPTY-DATE** | **P2** | Default dialog Lưu with `start_date`/`end_date` = `""` → **500 `HRM-SYS-001`** `invalid input syntax for type date: ""` (masked previously by VAL-001). Happy path with ViDateField filled **PASS**. FE omit empty **or** BE coerce `""`→null — **does not reopen** DTO-ISIN / L1. | **dev-fe** (preferred) or **dev-be** normalize |

**Not defects this seat:** Invent KEY · Nest EFF picker SoT · policy consumer · honesty / L1 retain.

---

## 6. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`contracts_printable_ready`** | **`false`** — **DENIED** flip |
| **`hrm_personnel_uat_ready`** | **`false`** — **DENIED** flip |
| CTR legal-print / library | **SEAL RETAIN** |
| SI enrollment EMP-BE-02 / ONE SoT | **SEAL RETAIN** |
| L1 QA-01 `SIINSQA-MSJA2Z7H` · QC-01 GWC L1 | **RETAIN** — not rewritten as new L1 stamp |
| Module SI / CTR UAT / Phase1 | **DENIED** — **`C-SLICE-≠-MODULE`** |
| Seed | **none** |

---

## 7. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-qa-02-r2.md` |
| **machine_json** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-si-ins-catalog-qa-02-r2-browser.json` |
| **next_owner** | **qc** (narrow FE browser QC-02) |
| **completion_report** | See §8 |
| **next_dispatch_prompt** | See §9 |

---

## 8. completion_report

**Closed:** R2 retest after BE-02 — **D-PLT-SI-INS-DTO-ISIN CLOSED**. U65 browser: pick Nest open key `hr_si_cat_msjb0dy7` ∈ EFF → Lưu POST `/employee-insurances` → **201 `HRM-EINS-201`** → FE + F5; invent ∉ EFF → **400 `HRM-INS-TYPE-KEY`** (not VAL-001 for open keys). Spot retain Settings/policy Nest EFF (R-PLT-SI-INS-03 CLOSED). Honesty false; L1/QC-01/CTR/EMP-BE-02 seals retained; DENY module SI/CTR UAT; zero-seed.

**Open / residual (non-blocking R2 exit):** **OBS-PLT-SI-INS-EMPTY-DATE** P2 — blank ViDateField posts `""` → 500 date cast (optional follow FE/BE).

**Stamp:** `SIINSQA2R2-MSJB0DY7` · **ack_status:** **PASS_TO_PM**.

---

## 9. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QC-02
from_role: pm
to_role: qc
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
prior: SI-INS-CATALOG-QA-02-R2 PASS_TO_PM stamp SIINSQA2R2-MSJB0DY7 · D-PLT-SI-INS-DTO-ISIN CLOSED
retain: L1 SIINSQA-MSJA2Z7H · QC-01 GWC L1 · CTR legal-print · EMP-BE-02 ONE SoT · R-PLT-SI-INS-03 CLOSED

entry_criteria:
  - Read docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-qa-02-r2.md
  - Machine JSON docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-si-ins-catalog-qa-02-r2-browser.json
  - U65 zero-seed · honesty printable/personnel=false · C-SLICE-≠-MODULE

exit_criteria:
  - Narrow FE browser gate: enrollment open key ∈ EFF 201+F5 · invent KEY · Nest EFF retain
  - Confirm DTO-ISIN CLOSED · do NOT flip printable/personnel · DENY module SI/CTR UAT
  - Residual OBS-PLT-SI-INS-EMPTY-DATE P2 may stay Condition (not reopen L1)
  - evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-qc-02.md
  - ack_status PASS_TO_PM | GWC | NO-GO

cấm: seed · reopen L1 seals wording · claim module SI/CTR UAT · flip honesty flags
```
