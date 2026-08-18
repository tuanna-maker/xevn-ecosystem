# Evidence — PO-HRM-E2E-LINK-EMP-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-EMP-QA-01` |
| **role** | qa |
| **lane** | execution · U65 zero-seed · browser-only |
| **date** | 2026-08-06 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` |
| **parent** | BE-01 + FE-01 `READY_FOR_QA` |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-e2e-link-emp-qa-01.FINAL.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-e2e-link-emp-qa-01/` |
| **harness** | `scripts/qa/_tmp-po-hrm-e2e-link-emp-qa-01.mjs` |
| **honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · **DENIED** module UAT |
| **ack_status** | **FAIL_TO_PM** |

---

## 0. L0 / FE↔BE

| Check | Result |
|-------|--------|
| `qc:dev-stack` | HRM 200 · XBOS 200 · portal 5173 200 (earlier UV assert noise after PASS) |
| `qc:fe-be-health` | **ALL PASS** (after hrm-api recover) |
| Harness L0 | portal 200 · hrm 200 · xbos 200 |

**Note:** Mid-wave `nest start --watch` hit TS2339 in `recruitment.service.ts` (`workflow_instance_id` / `company_id` on UV-bind return union) — briefly blocked restart. Runtime process on `:28001` recovered with BE-01 routes live (`hire-readiness` **200** `HRM-HTP-200`). Residual compile risk for next Dev restart → **OBS** for PM/dev-be (REC lane), not EMP slice owner.

---

## 1. Verdict matrix

| Case | Verdict | Evidence highlight |
|------|---------|-------------------|
| **L0** | 🟢 | Stack healthy |
| **D2 WH picker** | 🟢 | CatalogSearchPicker `hdsd-work-timeline-position-picker`; no free-text `input[name=position]`; POST work-timeline **201** `position_key=CEO`; F5 list retains row |
| **D1 QSĐ→WH** | 🔴 | Submit blocked FE toast «Vui lòng nhập đầy đủ thông tin bắt buộc»; `posPicked=false`; `hintVisible=false`; **no** POST `/decisions`; WH sample `decision_id=null` / `source_module=manual` only |
| **D5 SI timeline** | 🔴 | `contracts-insurance/insurance` count=**1** natural; `employee-insurances` count=**0**; FE create attempt on profile did not materialize enrollment; **no** POST `…/actions`; dual-SoT P0 |
| **D6 HTP-05** | 🟢 | Banner `hdsd-hire-readiness-banner` · `data-htp05-state=blocked` · GET **200** `HRM-HTP-200` · blocker `HRM-HTP-NO-ACTIVE-CONTRACT` · **not** invent ready |
| **J-HRM-01** | 🟢 | Contracts → employee link → profile **200** |
| **J-HRM-02** | 🟢 | Employees list → detail GET **200** scope ok |
| **J-HRM-03** | 🟡 PARTIAL | Contracts list present; Eye/detail dialog not opened in harness |
| **J-HRM-04** | 🟢 | Insurance → employee deep link GET **200** (navigate href; chrome overlay blocks raw click) |
| Process gate | 🟢 | pageErrors=0 · no Uncaught / DnD storm |

**Overall:** **FAIL** — D1 + D5 P0 open. Slice **not** PASS. Honesty flags remain **false**.

---

## 2. UF evidence blocks

### D2 — WH CatalogSearchPicker (SPEC D2 / AC-WH-PICK)
- Persona / URL: `ceo@xe.vn` · `/hr/employees/0500220b-…?companyId=main`
- Action: Thêm WH → picker position → Lưu
- Network: `POST …/work-timeline` → **201** `HRM-EMP-PROFILE-201` · `position_key=CEO`
- FE sau 2xx + F5: timeline row present · no free-text position SoT control
- Screen: `02-wh-form.png` · `03-wh-after-save.png` · `04-wh-f5.png`
- Verdict: 🟢
- spec_ref: SPEC-01 §D.3 / E1-A A1 · FE-01 · BE F-CORE-WH-02

### D1 — QSĐ person-bound + effective → WH badge (SPEC D.2 / D6 task map)
- URL: `/hr/decisions` → Thêm
- Observed: type picked; employee `UAT NV 0100`; **position catalog pick failed** (`posPicked=false`); status effective hint not shown
- Action: Lưu → toast **«Vui lòng nhập đầy đủ thông tin bắt buộc»** — **no** Network POST decisions
- WH F5: only manual WH from D2 (`decision_id=null`)
- Verdict: 🔴
- Residual: **R-EMP-DEC-WH-BROWSER-01** (P0) — cannot prove F-CORE-DEC-02 write-on-effective in browser U65 this run
- spec_ref: SPEC-01 §D.2 · F-CORE-DEC-01/02

### D5 — SI timeline actions (SPEC D.5)
- API: `GET /contracts-insurance/insurance?company_id=main` → **200** count=1 (`emp=22222222-…`, status=active)
- API: `GET /employee-insurances?company_id=main` (+ per-employee) → **0** rows
- FE profile Insurance tab on list employee: create attempt → still **0** `employee-insurances`
- Timeline action buttons / POST `…/actions` → **not exercised**
- Verdict: 🔴
- Residual: **R-EMP-SI-DUAL-SOT** (P0) — list SoT (`contracts-insurance`) ≠ profile timeline SoT (`employee-insurances`); CORE-10 actions unreachable on natural list rows
- spec_ref: SPEC-01 §D.5 · F-CORE-SI-02/03 · DB-01 enrollment=`employee_insurances`

### D6 — HTP-05 hire-readiness (SPEC D.6)
- Tab Hợp đồng · banner visible · state=`blocked`
- Network: GET hire-readiness **200** · `ready_for_payroll=false` · `HRM-HTP-NO-ACTIVE-CONTRACT`
- Honesty: **does not** invent ready on failure
- Screen: `09-contract-tab-htp.png`
- Verdict: 🟢
- spec_ref: F-CORE-HTP-05 · AC-HTP-05

### J-HRM-01..04 must_keep
| J-ID | Verdict | Notes |
|------|---------|-------|
| J-HRM-01 | 🟢 | contracts → `/employees/:id` |
| J-HRM-02 | 🟢 | list → detail scope 200 |
| J-HRM-03 | 🟡 | dialog open flaky in harness — list OK |
| J-HRM-04 | 🟢 | insurance → employee GET 200 |

---

## 3. Honesty stamp (mandatory)

| Claim | Value |
|-------|--------|
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| Module personnel UAT / product GO | **DENIED** |
| Seed used | **DENIED** (U65) |
| Narrow flags | D2 + D6 browser PASS only — **not** sufficient for module ready |

---

## 4. Residuals (PM dispatch)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-EMP-SI-DUAL-SOT** | **P0** | **dev-be** (+ **dev-fe** wire) | Unify enrollment SoT: list `contracts-insurance` vs profile `employee-insurances` + actions; enable CORE-10 on natural rows without seed |
| **R-EMP-DEC-WH-BROWSER-01** | **P0** | **dev-fe** (form HDSD fill / position required UX) → QA retest | Browser create QSĐ effective → WH `decision_id`/`decision_code` badge + F5; harness hit required-fields toast (`posPicked=false`) |
| R-J03-DIALOG | P2 | qa retest | Contract Eye dialog open |
| OBS-REC-TS-COMPILE | P2 | dev-be REC | `recruitment.service.ts` TS2339 blocks `nest --watch` clean restart |

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | U65 browser EMP linkage: L0 PASS; **D2 PASS** (WH picker+F5); **D6 PASS** (HTP-05 honest blocked); **D1 FAIL** (QSĐ required toast / no WH neo); **D5 FAIL** (dual-SoT SI — no employee-insurances / no actions POST); J-HRM-01/02/04 PASS · J-03 PARTIAL; honesty false; **no seed**; **no** module UAT claim. |
| **next_owner** | **pm** → dispatch **dev-be** (R-EMP-SI-DUAL-SOT) + **dev-fe** (R-EMP-DEC-WH-BROWSER-01); then QA retest same work_item |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-e2e-link-emp-qa-01.md` |
| **ack_status** | **FAIL_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-E2E-LINK-EMP-BE-02
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-E2E-LINK-EMP-QA-01 FAIL_TO_PM
u65: zero-seed

entry_criteria:
  - evidence docs/qa/evidence/po-hrm-e2e-link-emp-qa-01.md · residual R-EMP-SI-DUAL-SOT P0
  - read_first: SPEC-01 §D.5 · SA F-CORE-SI-02/03 · DB-01 enrollment=employee_insurances
  - live: GET contracts-insurance/insurance returns rows; GET employee-insurances empty same persona

task:
  - Close dual-SoT: natural insurance list rows must resolve to enrollment usable by POST /employee-insurances/:id/actions (or single SoT path FE can call)
  - Preserve scope parity main rollup; no seed; no invent amounts
  - jest regression + READY_FOR_QA

parallel (same session):
work_item_id: PO-HRM-E2E-LINK-EMP-FE-02
to_role: dev-fe
residual: R-EMP-DEC-WH-BROWSER-01
task: QSĐ create HDSD path — decision_code/title/position_key/status=effective + person-bound employee_id; after 2xx WH badge decision_id/decision_code F5; ensure CatalogSearchPicker position required before Lưu

exit: READY_FOR_QA → retest PO-HRM-E2E-LINK-EMP-QA-01 (D1+D5+J keep)
cấm: seed · hrm_personnel_uat_ready=true · API-only PASS
```
