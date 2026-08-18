# Evidence — PO-UAT-EMP-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UAT-EMP-01` |
| **program** | `PO-UAT-MODULES-PARALLEL-01` |
| **module** | Nhân sự (personnel / EMP E2E) |
| **role** | qa |
| **lane** | execution · U65 zero-seed · browser-only |
| **date** | 2026-08-07 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos via portal proxy |
| **prior GWC** | EMP qc-01 · qc-j03 · BE-03 WH neo · FE insurance D5 |
| **machine JSON** | `docs/qa/evidence/_tmp-po-uat-emp-01.FINAL.json` |
| **run log** | `docs/qa/evidence/_tmp-po-uat-emp-01.RUN.log` |
| **screens** | `docs/qa/evidence/screens/po-uat-emp-01/` (21 PNG) |
| **harness** | `scripts/qa/_tmp-po-uat-emp-01.mjs` |
| **stamp** | `EMPQA-ICBMY8` |
| **honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · **DENIED** module UAT · **DENIED** seed |
| **ack_status** | **PASS_TO_PM** |

---

## 0. L0 / honesty

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM/XBOS/portal **200** (L0 healthy) |
| `pnpm run qc:fe-be-health` | **ALL PASS** (login + employees + catalog + proxy) |
| Seed | **DENIED** (U65) |
| API-only PASS | **DENIED** — browser mutate only |
| `hrm_personnel_uat_ready` | **false** — **DENIED** claim |
| `employees_e2e_linkage_ready` | **false** — **DENIED** claim |
| Reopen sealed residuals | **NONE** without evidence gap |

---

## 1. Verdict matrix (UAT pack)

| Case | Prior GWC | UAT 2026-08-07 | Evidence highlight |
|------|-----------|----------------|-------------------|
| **L0** | 🟢 | 🟢 | Stack + fe-be-health ALL PASS |
| **D1 QSĐ→WH** | 🟢 sealed | 🟢 | HRD_01 effective → POST **201** `HRM-DEC-201` · `work_history_id=ae4a2a78-…` · WH F5 neo + badge «QSĐ QD-EMPQA-ICBMY8» · HRD_03 no invent |
| **D2 WH picker** | 🟢 sealed | 🟢 | CatalogSearchPicker · reject free-text · POST work-timeline **201** · F5 |
| **D5 SI timeline** | 🟢 sealed | 🟢 | `stop` → POST **201** `HRM-EINS-200` · body `"company_id":"main"` · periods F5 · `?tab=insurance` |
| **D6 HTP-05** | 🟢 sealed | 🟢 | Banner honest · GET **200** `HRM-HTP-200` · `state=ready` (active HĐ) · invent=false |
| **J-HRM-01** | 🟢 | 🟢 | Contracts → employee profile |
| **J-HRM-02** | 🟢 | 🟢 | Employees list → detail GET **200** |
| **J-HRM-03** | 🟢 CLOSED (qc-j03) | 🟢 | Eye → dialog open (reconfirm) |
| **J-HRM-04** | 🟢 | 🟢 | Insurance → employee GET **200** |
| Process gate | 🟢 | 🟢 | pageErrors=`[]` · consoleErrors=`[]` |

**Overall:** **PASS** (UAT pack slice). Honesty flags remain **false** — pack PASS ≠ personnel module UAT.

---

## 2. Sealed residuals (must_keep — not reopened)

| ID | Prior | UAT | Note |
|----|-------|-----|------|
| **R-EMP-DEC-WH-NEO-CATALOG** | CLOSED (BE-03/R3) | **SEALED** | `work_history_id` ≠ null + F5 decision neo |
| **R-EMP-SI-ACTION-COMPANY-ID-BODY** | CLOSED (FE-04/R4) | **SEALED** | body `company_id=main` + 201 |
| **R-J03-DIALOG** | CLOSED (qc-j03) | **SEALED** | J-HRM-03 dialog=true |

**P0 residuals for this WI:** none · `residuals: []` in machine JSON.

---

## 3. UF evidence blocks

### D1 — QSĐ HRD_01 effective → WH neo 🟢
- Persona / path: Decisions → Thêm → type **HRD_01** · employee UAT NV 0100 · position CEO · status **effective** → Lưu
- Network: POST decisions → **201** `HRM-DEC-201`
- Response: `decision_type=HRD_01` · `work_history_id=ae4a2a78-eee7-4513-a00c-9fccc8a13436` · `decision_id=38e094e6-…`
- FE sau 2xx + F5 WH: row `source_module=decision` · `decision_code=QD-EMPQA-ICBMY8` · badge «QSĐ QD-EMPQA-ICBMY8»
- Negative: HRD_03 probe → **no WH invent** (`hrd03NoWhInvent=true`)
- Screens: `06`–`08`
- Verdict: 🟢

### D2 — WH picker (reject free-text) 🟢
- Path: Employee profile → work timeline → CatalogSearchPicker position
- Assert: no free-text position input · `position_key=CEO` · POST **201** · F5 persist
- Screens: `02`–`04`
- Verdict: 🟢

### D5 — SI timeline action (`company_id` body) 🟢
- URL: `/hr/employees/22222222-…?companyId=main&tab=insurance`
- Mount: enrollments + timeline roots **true**
- Action: click stop → dialog → Lưu
- Network: `POST …/employee-insurances/bbbbbbbb-…/actions?company_id=main`
  - Body: `{ company_id: "main", action: "stop", effective_from: "2026-08-07" }`
  - Response: **201** `HRM-EINS-200`
- FE sau 2xx + F5: periods list visible · timeline root still mounted
- Screens: `10`–`13`
- Verdict: 🟢

### D6 — HTP-05 honest block/ready 🟢
- Path: employee contract/HTP surface
- GET hire-readiness **200** `HRM-HTP-200` · banner visible · `inventReady=false`
- Observed `state=ready` with active contract (honest — not invent-ready)
- Screen: `09`
- Verdict: 🟢

### J-HRM-01..04
| J-ID | Verdict | Notes |
|------|---------|-------|
| J-HRM-01 | 🟢 | contracts → `/employees/:id` |
| J-HRM-02 | 🟢 | list → detail scope GET **200** |
| J-HRM-03 | 🟢 | Eye dialog open (qc-j03 CLOSED reconfirm) |
| J-HRM-04 | 🟢 | insurance → employee GET **200** |

Screens: `14`–`20`

---

## 4. Honesty stamp (mandatory)

| Claim | Value |
|-------|--------|
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| Module personnel UAT / product GO | **DENIED** |
| Seed used | **DENIED** (U65) |
| Narrow pack | D1+D2+D5+D6+J PASS — **not** module ready |

---

## 5. Soft OBS (non-blocking)

| ID | Sev | Note |
|----|-----|------|
| OBS-D1-HINT | P3 | `hdsd-decisions-effective-wh-hint` still false for HRD_01 (cosmetic; neo + badge work) |

**P0/P1 residuals:** none.

---

## 6. Residual

| ID | Status |
|----|--------|
| P0 product residuals | **none** |
| Sealed D1/D5/J03 | **must_keep** — do not reopen without evidence gap |

---

## Handoff

```yaml
work_item_id: PO-UAT-EMP-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-uat-emp-01.md
machine: docs/qa/evidence/_tmp-po-uat-emp-01.FINAL.json
honesty:
  hrm_personnel_uat_ready: false
  employees_e2e_linkage_ready: false
next_owner: qc
next_dispatch: PO-UAT-EMP-QC-01
```

### completion_report
U65 browser UAT pack for Nhân sự EMP E2E: L0+fe-be-health PASS; **D1** HRD_01→`work_history_id`+F5 neo; **D2** picker reject free-text; **D5** SI `stop` POST 201 with body `company_id=main` + periods F5; **D6** HTP-05 honest (ready/no invent); **J-HRM-01..04** all PASS including J03 dialog reconfirm. Sealed residuals D1/D5/J03 **not reopened**. Honesty flags remain **false**. No seed. No module personnel UAT claim.

### next_owner
qc

### next_dispatch_prompt
```text
work_item_id: PO-UAT-EMP-QC-01
from_role: pm
to_role: qc
lane: governance
program: PO-UAT-MODULES-PARALLEL-01
module: Nhân sự (personnel / EMP E2E)
parent: PO-UAT-EMP-01 PASS_TO_PM
qa_ref: docs/qa/evidence/po-uat-emp-01.md
machine: docs/qa/evidence/_tmp-po-uat-emp-01.FINAL.json
stamp: EMPQA-ICBMY8
u65: zero-seed · observe-only
honesty: hrm_personnel_uat_ready=false · employees_e2e_linkage_ready=false until QC GO wording allows only slice GWC — cấm promote module UAT

entry:
- Audit QA pack D1/D2/D5/D6 + J-HRM-01..04
- Confirm sealed residuals not reopened (WH neo · SI body company_id · R-J03-DIALOG)
- Spot screens 08/11/13 + machine bodyHasCompanyId=true

exit: GO | GO WITH CONDITIONS | NO-GO
evidence: docs/qa/evidence/po-uat-emp-qc-01.md
cấm: claim personnel UAT true · seed · reopen CLOSED without gap
```
