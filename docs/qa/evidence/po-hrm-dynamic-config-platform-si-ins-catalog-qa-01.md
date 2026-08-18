# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **prior** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-01` **READY_FOR_QA** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `x-company-id=main` |
| **Stamp** | `SIINSQA-MSJA2Z7H` |
| **U65** | zero-seed · L1 probe ≠ 🟢 UF · browser picker **HOLD** (FE not READY) |
| **Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · CTR legal-print / SI enrollment EMP-BE-02 **SEAL RETAIN** · EMP·DEC·PAY·ATT·REC·EXT·LIST-TOTALS **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · DENY module SI/CTR UAT |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (L1 10/10 · FE picker HOLD R-PLT-SI-INS-03) |
| **change_mode** | ADD verify · no `apps/**` invent · no seed · no ready flip |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Dist gate | `si-insurance-type.service.js` + constants + `insurance-types/effective` in controller — **not stale** |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-si-ins-catalog-qa-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-si-ins-catalog-qa-01.json` |

**spec_ref:** BA-01 §6 AC-PLT-SI-INS-01* · BE-01 READY · SA Option **B**

**Seed:** none.

---

## 2. L1 execution path (U65)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Dist KEY + L0 health | dist OK · GET `/api/hrm` **200** |
| 1 | Unauth GET effective | **401** `HRM-AUTH-001` (not 404) |
| 2 | Login `ceo@xe.vn` | portal proxy **201** |
| 3 | GET `/contracts-insurance/insurance-types/effective?company_id=main` | **200** `HRM-SI-INS-TYPE-200` total=4 (group_ref) — empty [] OK path not forced |
| 4 | Admin CREATE N+1 `hr_si_cat_msja2z7h` | **PUT** → **200** `HRM-SI-INS-TYPE-200` source=`si_native` id=`9f07e442-…` |
| 5 | GET effective again | **200** total=5 · has `hr_si_cat_msja2z7h` |
| 6 | Invent policy `zz_invent_si_msja2z7h` | **POST** policies → **400** `HRM-INS-TYPE-KEY` |
| 7 | Invent enrollment free text | **400** `HRM-VAL-001` (DTO IsIn closed — OBS) |
| 8 | Invent enrollment enum OOS `accident` ∉ EFF | **400** `HRM-INS-TYPE-KEY` (VAL-SI-CNS-02) |
| 9 | Valid policy type ∈ EFF | **POST** → **201** `HRM-INS-POL-201` type=`hr_si_cat_msja2z7h` |
| 10 | FE bind spot | Settings MD `insurance_types` — **no** Nest `/effective` · **HOLD** R-PLT-SI-INS-03 |
| 11 | Honesty | ready=false · seals retain · C-SLICE · DENY SI/CTR UAT |

---

## 3. AC stamp table

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **dist_gate** | si-insurance-type + effective route in dist | present · stale=false | 🟢 |
| **L0** | stack 200 | 200 | 🟢 |
| **unauth effective** | 401/403 ≠ 404 | 401 | 🟢 |
| **AC-PLT-SI-INS-01c** | GET effective 200 · empty [] OK · no seed | 200 total=4 baseline (live REF) · no seed wipe | 🟢 |
| **AC-PLT-SI-INS-01d** | Admin CREATE N+1 · 2xx | PUT **200** `hr_si_cat_msja2z7h` | 🟢 |
| **AC-PLT-SI-INS-01** (L1) | EFF≥1 · valid consumer type ∈ EFF | EFF=5 · policy **201** type=open key | 🟢 |
| **AC-PLT-SI-INS-01b** policy | invent → 400 `HRM-INS-TYPE-KEY` | **400** KEY | 🟢 |
| **AC-PLT-SI-INS-01b** enrollment | invent → 400 KEY | enum OOS **400** KEY · free → VAL-001 OBS | 🟢 |
| **AC-PLT-SI-INS-01** FE picker | Nest EFF picker when FE READY | FE MD-alone · **HOLD** | 🟡 HOLD |
| **AC-PLT-SI-INS-01H** | Honesty / seals | false · RETAIN · C-SLICE · U65 | 🟢 |

**OBS:** `CreateEmployeeInsuranceDto` still `@IsIn(['social','health',…])` — free invent key hits `HRM-VAL-001` before Nest KEY. Nested assert proven via IsIn-allowed key ∉ EFF (`accident`). Open-catalog DTO deepen = residual for FE/BE align (not L1 FAIL).

**OBS (01c):** Empty EFF not forced live (REF total≥1); empty soft-allow covered by BE/jest; no wipe seals.

---

## 4. Key network stamps

```text
GET  /api/hrm                                                          → 200  HRM-HEALTH-200
GET  /api/hrm/contracts-insurance/insurance-types/effective (unauth)    → 401  HRM-AUTH-001
GET  /api/hrm/contracts-insurance/insurance-types/effective?company_id=main → 200  total=4→5
PUT  /api/hrm/contracts-insurance/insurance-types                       → 200  HRM-SI-INS-TYPE-200 key=hr_si_cat_msja2z7h
POST /api/hrm/contracts-insurance/insurance-policies (invent)           → 400  HRM-INS-TYPE-KEY zz_invent_si_msja2z7h
POST /api/hrm/employee-insurances (free invent)                        → 400  HRM-VAL-001 (DTO IsIn)
POST /api/hrm/employee-insurances (type=accident ∉ EFF)                → 400  HRM-INS-TYPE-KEY
POST /api/hrm/contracts-insurance/insurance-policies (valid EFF)        → 201  HRM-INS-POL-201 type=hr_si_cat_msja2z7h
```

---

## 5. L2 / L2.5

| Surface | Status |
|---------|--------|
| Browser Settings Nest SI type admin tab | **OBS** — L1 admin via API F-SI-CAT-TYP-02 OK; dedicated Settings Nest tab = FE-01 |
| Policy / enrollment picker SoT | **HOLD** R-PLT-SI-INS-03 — `catalogSearchPicker` / policy panel still Settings MD `insurance_types` · no `insurance-types/effective` |
| J-* browser UF | **not executed** (FE not READY — per dispatch parallel_note) |

---

## 6. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`contracts_printable_ready`** | **`false`** — **DENIED** flip |
| **`hrm_personnel_uat_ready`** | **`false`** — **DENIED** flip |
| CTR legal-print / library | **SEAL RETAIN** |
| SI enrollment EMP-BE-02 / ONE SoT | **SEAL RETAIN** |
| EMP · DEC · PAY · ATT · REC · EXT · LIST-TOTALS | **SEAL RETAIN** |
| Module SI / CTR UAT / Phase1 | **DENIED** — **`C-SLICE-≠-MODULE`** |
| Seed | **none** |

---

## 7. Defect / residual register

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| **R-PLT-SI-INS-03** | P1 HOLD | FE picker rebind Nest `GET …/insurance-types/effective` — reject MD-alone SoT | **dev-fe** |
| OBS-DTO-IsIn | P2 OBS | Enrollment DTO closed IsIn blocks open N+1 type keys at validation — deepen when FE picker open | **dev-be** (with FE-01) |

No stale-dist. No P0.

---

## 8. completion_report

**Closed:** L1 U65 for SI insurance-type catalog Option B after BE-01. Stamp `SIINSQA-MSJA2Z7H`. Dist KEY OK. GET effective 200 (empty OK / live REF). Admin PUT open `hr_si_cat_msja2z7h` 200 + EFF has key. Invent policy → 400 `HRM-INS-TYPE-KEY`. Invent enrollment OOS enum → 400 KEY. Valid policy 201 ∈ EFF. FE picker **HOLD** R-PLT-SI-INS-03 (MD SoT). Honesty false · CTR/enrollment seals untouched · zero-seed · **C-SLICE-≠-MODULE** · DENY module SI/CTR UAT.

**Residual:** R-PLT-SI-INS-03 → dev-fe (then QA browser retest). OBS enrollment DTO IsIn with FE-01.

**Forbidden claims:** module SI/CTR UAT · printable/personnel flip · Phase1 DONE · seed · reopen CTR/enrollment seals.

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-qa-01.md` |
| **next_owner** | **qc** (narrow L1 seal) **parallel** **dev-fe** R-PLT-SI-INS-03 |
| **next_dispatch_prompt** | See §10 |

---

## 10. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QC-01
from_role: pm
to_role: qc
lane: governance
priority: P1
prior: SI-INS-CATALOG-QA-01 PASS_TO_PM stamp SIINSQA-MSJA2Z7H
entry_criteria: read QA evidence; honesty flags false; C-SLICE-≠-MODULE
exit_criteria:
  - Narrow GWC/GO on L1 AC-PLT-SI-INS-01* only — DENY module SI/CTR UAT
  - Confirm residual R-PLT-SI-INS-03 HOLD → FE-01 (picker Nest EFF)
  - Confirm seals CTR legal-print + enrollment EMP-BE-02 RETAIN
  - evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-qc-01.md
  - ack_status PASS_TO_PM | FAIL_TO_PM
cấm: flip printable/personnel · claim module SI/CTR UAT · seed

PARALLEL (if FE-01 not already DISPATCHED):
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-FE-01
from_role: pm
to_role: dev-fe
residual: R-PLT-SI-INS-03
exit: Settings Nest admin surface if needed + policy/enrollment picker bind GET …/insurance-types/effective when EFF>0; reject MD-alone SoT; READY_FOR_QA → QA browser UF
```
