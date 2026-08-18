# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **prior** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BE-01` **READY_FOR_QA** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · header `x-company-id=main` · employees mutate `holding` |
| **Stamp** | `EMPSTQA-MSK20G7H` |
| **U65** | zero-seed · L1 probe ≠ 🟢 UF · no `pnpm seed:*` · admin CREATE N+1 via Nest API then invent |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · EMP-CUSTOM CNS `EMPCFQA-MSK14LUH` · MergeToken EXT `EMPTOKEXTQA-MSJ57PE1` · DOC/ET · ATT/SI/CTR **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · DENY module EMP UAT / flip ready |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (L1 core · FE picker HOLD R-PLT-EMP-ST-FE-01) |
| **change_mode** | ADD verify · no `apps/**` invent · no seed · no ready flip · **FORBIDDEN** reopen EMP-CUSTOM/EXT/DOC-ET/ATT/SI/CTR |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Dist gate | `emp-employment-status.*` + `emp-status-reason.*` · controller `employment-statuses/effective` + `status-reasons/effective` · src KEY + DROP `chk_employees_status` — **not stale** |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-emp-status-catalog-qa-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-status-catalog-qa-01.json` |

**spec_ref:** BA-01 AC-PLT-EMP-STATUS-01* · VAL-EMP-ST/STR-CNS · SA Option **B** KEY codes · BE-01 READY

**Seed:** none.

---

## 2. L1 execution path (U65)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Dist KEY + L0 health | dist OK · GET `/api/hrm` **200** |
| 1 | Unauth GET employment-statuses/effective | **401** `HRM-AUTH-001` (≠ 404) |
| 2 | Login `ceo@xe.vn` | portal proxy **201** |
| 3 | GET `/employees/employment-statuses/effective?company_id=main` | **200** `HRM-EMP-ST-200` baseline total=3 (REF/live) · empty [] OK path not forced |
| 4 | GET `/employees/status-reasons/effective?company_id=main` | **200** `HRM-EMP-STR-200` total=0 (empty soft OK) |
| 5 | Admin CREATE N+1 status `hr_emp_st_msk20g7h` (`requiresReason=true`) | **PUT** → **200** `HRM-EMP-ST-200` · EFF hasOpenKey=true (total=4) |
| 6 | Admin CREATE N+1 reason `hr_emp_str_msk20g7h` | **PUT** → **200** `HRM-EMP-STR-200` · also upsert on `holding` (employee scope) |
| 7 | Invent employee `status=zz_invent_emp_st_msk20g7h` (EFF>0) | **PATCH** → **400** `HRM-EMP-STATUS-KEY` |
| 8 | Invent reason spot: status ∈ EFF + `status_reason_key=zz_invent_emp_str_*` | **PATCH** → **400** `HRM-EMP-STATUS-REASON-KEY` |
| 9 | Open key persist outside `active\|inactive` | **PATCH** status=`hr_emp_st_msk20g7h` + reason ∈ EFF → **200** `HRM-EMP-202` · list/get status persisted · **no** CHECK reject → `chk_employees_status` ABSENT (runtime) |
| 10 | Restore prior `active` | **200** `HRM-EMP-202` |
| 11 | Seals / honesty | EMP-CUSTOM CNS · EXT · DOC/ET · ATT/SI/CTR cite RETAIN · flags false · DENY EMP UAT |

---

## 3. AC stamp table

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **dist_gate** | ST/STR + effective in dist · KEY constants | present · stale=false · DROP chk in src | 🟢 |
| **L0** | stack 200 | 200 | 🟢 |
| **unauth effective** | 401/403 ≠ 404 | 401 | 🟢 |
| **AC-PLT-EMP-STATUS-01c** | GET ST/STR effective 200 · empty [] OK · no seed | ST 200 (live 3) · STR 200 empty=0 | 🟢 |
| **AC-PLT-EMP-STATUS-01d** | Admin CREATE N+1 · 2xx | PUT ST **200** `hr_emp_st_msk20g7h` · STR **200** `hr_emp_str_msk20g7h` | 🟢 |
| **AC-PLT-EMP-STATUS-01b** | invent status → 4xx `HRM-EMP-STATUS-KEY` | **400** KEY | 🟢 |
| **VAL-EMP-STR-CNS-01** | invent reason → `HRM-EMP-STATUS-REASON-KEY` | **400** REASON-KEY | 🟢 |
| **CHK absent** | open key persist / no closed CHECK | **200** persist `hr_emp_st_msk20g7h` | 🟢 |
| **AC-PLT-EMP-STATUS-01** FE picker | Nest EFF picker when FE READY | FE hardcode/Settings bind residual · **HOLD** | 🟡 HOLD |
| **AC-PLT-EMP-STATUS-01H** | Honesty / seals | false · RETAIN EMP-CUSTOM/EXT/DOC-ET/ATT/SI/CTR · C-SLICE · U65 | 🟢 |

**OBS (01c):** Empty ST EFF not forced live (REF/baseline ≥1); empty soft-allow covered by STR total=0 + BE/jest; no wipe seals.

**FE:** R-PLT-EMP-ST-FE-01 HOLD — L1 PASS ≠ UF 🟢 / module EMP UAT.

---

## 4. Key network stamps

```text
GET  /api/hrm                                                              → 200  HRM-HEALTH-200
GET  /api/hrm/employees/employment-statuses/effective (unauth)             → 401  HRM-AUTH-001
GET  /api/hrm/employees/employment-statuses/effective?company_id=main      → 200  HRM-EMP-ST-200 (baseline 3)
GET  /api/hrm/employees/status-reasons/effective?company_id=main           → 200  HRM-EMP-STR-200 (0)
PUT  /api/hrm/employees/employment-statuses                                → 200  HRM-EMP-ST-200 key=hr_emp_st_msk20g7h
PUT  /api/hrm/employees/status-reasons                                     → 200  HRM-EMP-STR-200 key=hr_emp_str_msk20g7h
PATCH /api/hrm/employees/{id} invent status zz_invent_emp_st_*             → 400  HRM-EMP-STATUS-KEY
PATCH /api/hrm/employees/{id} invent reason zz_invent_emp_str_*            → 400  HRM-EMP-STATUS-REASON-KEY
PATCH /api/hrm/employees/{id} open status+reason ∈ EFF                     → 200  HRM-EMP-202 (persist open key)
```

**Employee under test:** `0500220b-f289-40df-b07e-86316285439b` · company `holding` · restored `active`.

---

## 5. L2 / L2.5

| Surface | Status |
|---------|--------|
| Browser Settings Nest EMP status/reason admin | **HOLD** — L1 admin via API F-EMP-CAT-ST/STR-02 OK; Nest Settings tab = FE-01 |
| Employee form status picker SoT | **HOLD** R-PLT-EMP-ST-FE-01 — FE hardcode/Settings residual when EFF>0 |
| J-HRM-EMP-ST-CAT-* browser | **not executed** (FE not READY · L1 seat only · C-SLICE) |

---

## 6. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`hrm_personnel_uat_ready`** | **`false`** — **DENIED** flip |
| **`employees_e2e_linkage_ready`** | **`false`** — **DENIED** flip |
| **`contracts_printable_ready`** | **`false`** — **DENIED** flip |
| EMP-CUSTOM CNS L1 `EMPCFQA-MSK14LUH` | **SEAL RETAIN** — **FORBIDDEN** reopen |
| MergeToken EXT `EMPTOKEXTQA-MSJ57PE1` | **SEAL RETAIN** |
| EMP DOC/ET Nest | **SEAL RETAIN** |
| ATT / SI / CTR / enrollment | **SEAL RETAIN** |
| Module EMP UAT / Phase1 | **DENIED** — **`C-SLICE-≠-MODULE`** |
| Seed | **none** |

---

## 7. Defect / residual register

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| **R-PLT-EMP-ST-FE-01** | P2 HOLD | FE picker rebind Nest `GET …/employment-statuses/effective` (+ reason EFF) — reject hardcode/MD-alone SoT when EFF>0 | **dev-fe** (after QC L1 seal) |

No P0. No stale-dist. CHK DROP proven via open-key persist (runtime).

---

## 8. completion_report

**Closed:** L1 U65 for EMP **employment status/reason** catalog Option B after BE-01. Stamp `EMPSTQA-MSK20G7H`. Dist ST/STR + effective OK. GET ST/STR effective 200 (empty STR OK). Admin PUT open `hr_emp_st_msk20g7h` + `hr_emp_str_msk20g7h` 200 + EFF has keys. Invent status → 400 `HRM-EMP-STATUS-KEY`. Invent reason → 400 `HRM-EMP-STATUS-REASON-KEY`. Open key persist 200 outside closed `active|inactive` CHECK. Honesty false · EMP-CUSTOM CNS · EXT · DOC/ET · ATT/SI/CTR seals untouched · zero-seed · **C-SLICE-≠-MODULE** · DENY module EMP UAT / flip ready / Phase1 DONE.

**Residual:** R-PLT-EMP-ST-FE-01 → dev-fe after QC narrow L1 seal.

**Forbidden claims:** module EMP UAT · personnel/e2e/printable flip · Phase1 DONE · seed · reopen EMP-CUSTOM/EXT/DOC-ET/ATT/SI/CTR · UF 🟢 from L1 alone.

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-qa-01.md` |
| **next_owner** | **qc** (narrow L1 seal) |
| **next_dispatch_prompt** | See §10 |

---

## 10. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-QC-01
from_role: pm
to_role: qc
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: EMP-STATUS-CATALOG-QA-01 PASS_TO_PM stamp EMPSTQA-MSK20G7H
entry_criteria: QA L1 PASS evidence · U65 · honesty false · C-SLICE-≠-MODULE
read_first:
- docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-qa-01.md
- docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-be-01.md
- docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md
task:
- Narrow QC GWC/GO on L1 only: invent HRM-EMP-STATUS-KEY + HRM-EMP-STATUS-REASON-KEY · CHK absent via open key persist · GET ST/STR effective 200
- RETAIN seals: EMP-CUSTOM CNS EMPCFQA-MSK14LUH · EXT EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT/SI/CTR — do not reopen
- Condition HOLD R-PLT-EMP-ST-FE-01 (dev-fe picker) — do NOT invent module EMP UAT / flip ready / Phase1
- Honesty flags remain false · C-SLICE-≠-MODULE
exit_criteria: GO | GWC with conditions · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-qc-01.md
cấm: seed · flip *_ready · claim module EMP UAT · reopen sealed peers
```
