# Evidence — PO-HRM-E2E-LINK-EMP-QA-01 R3

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-EMP-QA-01` |
| **round** | **R3** |
| **role** | qa |
| **lane** | execution · U65 zero-seed · browser-first |
| **date** | 2026-08-06 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` (restarted `node dist/main.js` after `nest build` — BE-03 `hrd_01` in dist) · xbos via portal proxy |
| **parent** | BE-03 `READY_FOR_QA` + FE-03 `READY_FOR_QA` (PM unlock D5 same WI) |
| **prior** | R2 FAIL `docs/qa/evidence/po-hrm-e2e-link-emp-qa-01-r2.md` · residual **R-EMP-DEC-WH-NEO-CATALOG** |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-e2e-link-emp-qa-01-r3.FINAL.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-e2e-link-emp-qa-01-r3/` |
| **harness** | `scripts/qa/_tmp-po-hrm-e2e-link-emp-qa-01.mjs` (R3 · FE03 auto + `?tab=insurance`) |
| **honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · **DENIED** module UAT · **DENIED** seed |
| **ack_status** | **FAIL_TO_PM** |

---

## 0. L0 / restart / honesty

| Check | Result |
|-------|--------|
| Kill stale `:28001` + `nest build` hrm-api | PASS — dist contains `hrd_01` (BE-03 neo map) |
| Restart `node dist/main.js` | Nest up · health **200** |
| Portal `:5173` | **200** |
| Seed | **DENIED** (U65) |
| API-only D5 PASS | **DENIED** |

---

## 1. Verdict matrix (R3)

| Case | R2 | R3 | Evidence highlight |
|------|----|----|-------------------|
| **L0** | 🟢 | 🟢 | Stack healthy after BE-03 rebuild/restart |
| **D1 QSĐ→WH** | 🔴 neo null | 🟢 | Catalog **HRD_01** + effective → POST **201** `HRM-DEC-201` · **`work_history_id=419f3cbe-…`** · WH F5 `decision_id` + badge «QSĐ QD-EMPQA-HNJ0IQ» · HRD_03 probe **no WH invent** |
| **D2 WH picker** | 🟢 | 🟢 | CatalogSearchPicker · POST work-timeline **201** `position_key=CEO` · F5 |
| **D5 SI timeline** | 🔴 no panel | 🔴 **POST body** | FE-03 path **CLOSED** (UI): `?tab=insurance` → `enrollmentsRoot=true` · `timelineRoot=true` · dialog open; **POST actions 400** `HRM-VAL-001` — body missing `company_id` (query-only) |
| **D6 HTP-05** | 🟢 | 🟢 | Banner `blocked` · GET **200** `HRM-HTP-200` · no invent ready |
| **J-HRM-01** | 🟢 | 🟢 | Contracts → employee profile |
| **J-HRM-02** | 🟢 | 🟢 | Employees list → detail GET **200** |
| **J-HRM-03** | 🟡 | 🟡 PARTIAL | Eye dialog not opened |
| **J-HRM-04** | 🟢 | 🟢 | Insurance → employee GET **200** |
| Process gate | 🟢 | 🟢 | pageErrors=0 · consoleErrors=1 (expected handled 400) |

**Overall:** **FAIL** — D1 P0 CLOSED; D5 U65 mutate FAIL (contract). Slice **not** personnel UAT. Honesty flags remain **false**.

---

## 2. Closed residuals

| ID | Status | Proof |
|----|--------|-------|
| **R-EMP-DEC-WH-NEO-CATALOG** | **CLOSED** | Browser HRD_01 effective → `work_history_id ≠ null` + WH `decision_id` / badge; HRD_03 no invent |
| **R-EMP-SI-FE-ACTION-UI** (mount path) | **CLOSED** (UI only) | Deep-link `tab=insurance` + enrollments/timeline roots visible |

---

## 3. UF evidence blocks

### D1 — QSĐ HRD_01 effective → WH neo (P0)
- Persona / URL: `/hr/decisions` → Thêm
- Fill: code `QD-EMPQA-HNJ0IQ` · type catalog **HRD_01** · employee UAT NV 0100 · position CEO · status **Có hiệu lực**
- Network: POST `/api/hrm/decisions` → **201** `HRM-DEC-201`
- Response: `decision_type=HRD_01` · `status=effective` · **`work_history_id=419f3cbe-c63a-4081-8b13-b0a75dd0e3c4`**
- FE sau 2xx + F5: WH sample `decision_id=f13f5f96-…` · `source_module=decision` · badge count=1
- HRD_03 API probe: `work_history_id=null` / no invent (**PASS** negative)
- Screens: `05`–`08`
- Verdict: 🟢
- spec_ref: F-CORE-DEC-02 · BE-03 evidence

### D2 — WH CatalogSearchPicker (regression)
- POST work-timeline **201** · `position_key=CEO` · F5 persist
- Verdict: 🟢

### D5 — SI timeline actions (FE-03 unlocked)
- Path: `/hr/employees/22222222-…?tab=insurance` (enrollment `bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2`)
- FE mount: `hdsd-insurance-enrollments-root` **true** · `hdsd-insurance-timeline-root` **true**
- Action: click `suspend` → dialog → submit
- Network: POST `…/employee-insurances/…/actions?company_id=main` → **400** `HRM-VAL-001`
- Message: `company_id must be shorter than or equal to 64 characters; company_id must be a string`
- Root cause: FE `postEmployeeInsuranceAction` puts `company_id` in **query only**; `InsuranceActionDto` requires **body** `company_id` string → ValidationPipe rejects undefined
- Periods F5: **not** updated (no 2xx)
- Verdict: 🔴
- Residual: **R-EMP-SI-ACTION-COMPANY-ID-BODY** (P0)
- **cấm claim:** API-only PASS — not applied; U65 requires FE POST 2xx

### D6 — HTP-05 (regression)
- `data-htp05-state=blocked` · blocker `HRM-HTP-NO-ACTIVE-CONTRACT`
- Verdict: 🟢

### J-HRM-01..04
| J-ID | Verdict | Notes |
|------|---------|-------|
| J-HRM-01 | 🟢 | contracts → `/employees/:id` |
| J-HRM-02 | 🟢 | list → detail scope 200 |
| J-HRM-03 | 🟡 | dialog open flaky |
| J-HRM-04 | 🟢 | insurance → employee GET 200 |

---

## 4. Honesty stamp (mandatory)

| Claim | Value |
|-------|--------|
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| Module personnel UAT / product GO | **DENIED** |
| Seed used | **DENIED** (U65) |
| Narrow flags | D1+D2+D6+J PASS · D5 FAIL — **not** module ready |

---

## 5. Residuals (PM dispatch)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-EMP-SI-ACTION-COMPANY-ID-BODY** | **P0** | **dev-fe** | Include `company_id` in POST body for `/employee-insurances/:id/actions` (match `InsuranceActionDto`); keep query optional; verify change_rate maps `employee_amount`/`employer_amount` if BE uses those field names |
| R-J03-DIALOG | P2 | qa retest | Contract Eye dialog |
| OBS | P2 | — | FE hint `hdsd-decisions-effective-wh-hint` still false for HRD_01 (cosmetic; neo works) |

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | R3 U65 browser after BE-03 restart + FE-03 unlock: **D1 PASS** (`work_history_id` + WH decision neo; HRD_03 no invent); **D2/D6/J-01/02/04 PASS**; FE-03 mount **PASS** (`tab=insurance` roots visible); **D5 FAIL** POST 400 `HRM-VAL-001` missing body `company_id`; honesty false; no seed; no module UAT. |
| **next_owner** | **pm** → **dev-fe** (R-EMP-SI-ACTION-COMPANY-ID-BODY) → QA R4 D5 retest |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-e2e-link-emp-qa-01-r3.md` |
| **ack_status** | **FAIL_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-E2E-LINK-EMP-FE-04
from_role: pm
to_role: dev-fe
lane: execution
parent: PO-HRM-E2E-LINK-EMP-QA-01 R3 FAIL_TO_PM
u65: zero-seed
residual: R-EMP-SI-ACTION-COMPANY-ID-BODY P0
must_keep: D1 WH neo · D2 picker · D6 HTP · FE-03 tab=insurance mount · no apps/api/**

entry_criteria:
  - evidence docs/qa/evidence/po-hrm-e2e-link-emp-qa-01-r3.md §D5
  - live: POST …/employee-insurances/:id/actions?company_id=main body without company_id → 400 HRM-VAL-001
  - DTO: apps/api/hrm-api/src/employee-insurances/dto/insurance-action.dto.ts requires company_id string

task:
  - Fix postEmployeeInsuranceAction / buildInsuranceActionBody / panel submit to send company_id in JSON body (string, e.g. main)
  - Align change_rate field names with BE DTO (employee_amount / employer_amount) if still contribution aliases
  - Vitest + keep HDSD testids; no seed; honesty false

exit: READY_FOR_QA → PO-HRM-E2E-LINK-EMP-QA-01 R4 (D5 only + smoke D1/D2/D6)
evidence: docs/qa/evidence/po-hrm-e2e-link-emp-fe-04.md
```
