# Evidence — PO-HRM-E2E-LINK-EMP-QA-01 R2

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-EMP-QA-01` |
| **round** | **R2** |
| **role** | qa |
| **lane** | execution · U65 zero-seed · browser-only |
| **date** | 2026-08-06 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` (restarted `node dist/main.js` with BE-02 bridge) · xbos `:28002` |
| **parent** | BE-02 + FE-02 `READY_FOR_QA` |
| **prior** | R1 FAIL `docs/qa/evidence/po-hrm-e2e-link-emp-qa-01.md` |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-e2e-link-emp-qa-01-r2.FINAL.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-e2e-link-emp-qa-01-r2/` |
| **harness** | `scripts/qa/_tmp-po-hrm-e2e-link-emp-qa-01.mjs` (R2 HDSD testids + SoT parity) |
| **honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · **DENIED** module UAT |
| **ack_status** | **FAIL_TO_PM** |

---

## 0. L0 / FE↔BE / restart

| Check | Result |
|-------|--------|
| Kill + restart hrm-api | Port cleared; `node dist/main.js` — Nest up; dist contains `insurance-enrollment-bridge` |
| `qc:dev-stack` | HRM 200 · XBOS 200 · portal 5173 200 |
| `qc:fe-be-health` | **ALL PASS** |
| Harness L0 | portal 200 · hrm 200 · xbos 200 |
| Seed | **DENIED** (U65) |

---

## 1. Verdict matrix (R2)

| Case | R1 | R2 | Evidence highlight |
|------|----|----|-------------------|
| **L0** | 🟢 | 🟢 | Stack healthy after restart |
| **D2 WH picker** | 🟢 | 🟢 | CatalogSearchPicker; POST work-timeline **201** `position_key=CEO`; F5 persist |
| **D1 QSĐ→WH** | 🔴 form toast | 🔴 **neo** | FE-02 CLOSED: HDSD fill + POST **201** `HRM-DEC-201` + toast «Tạo quyết định thành công»; `status=effective`; **`work_history_id=null`**; WH sample all `decision_id=null` / `source_module=manual`; badge=0 |
| **D5 SI timeline** | 🔴 dual-SoT | 🔴 **FE actions** | BE-02 CLOSED: CI∩EI **idOverlap=1** · `enrollment_id===id`; FE `timelineRoot=false` · no action buttons · U65 browser POST actions **not** exercised |
| **D6 HTP-05** | 🟢 | 🟢 | Banner blocked · GET **200** `HRM-HTP-200` · `HRM-HTP-NO-ACTIVE-CONTRACT` · no invent ready |
| **J-HRM-01** | 🟢 | 🟢 | Contracts → employee profile |
| **J-HRM-02** | 🟢 | 🟢 | Employees list → detail GET **200** |
| **J-HRM-03** | 🟡 | 🟡 PARTIAL | Eye dialog not opened |
| **J-HRM-04** | 🟢 | 🟢 | Insurance → employee GET **200** |
| Process gate | 🟢 | 🟢 | pageErrors=0 · consoleErrors=0 |

**Overall:** **FAIL** — D1 WH neo + D5 FE action path still open. Slice **not** PASS. Honesty flags remain **false**.

---

## 2. Closed residuals (from R1)

| ID | Status | Proof |
|----|--------|-------|
| **R-EMP-DEC-WH-BROWSER-01** (form/labels/validate) | **CLOSED** | `hdsd-decisions-form-code/title/type/employee/position/status` filled; `posPicked=true`; `statusEffective=true`; Network POST `/decisions` **201** `HRM-DEC-201` |
| **R-EMP-SI-DUAL-SOT** | **CLOSED** | `contracts-insurance/insurance` count=1 id=`…bbb2`; `employee-insurances` count=2; **idOverlapCount=1**; `enrollment_id` equals `id` |

---

## 3. UF evidence blocks

### D2 — WH CatalogSearchPicker (regression)
- URL: `/hr/employees/0500220b-…?companyId=main`
- Network: POST `…/work-timeline` → **201** `HRM-EMP-PROFILE-201` · `position_key=CEO`
- FE + F5: row retained · no free-text position SoT
- Screens: `01`–`04`
- Verdict: 🟢

### D1 — QSĐ person-bound + effective → WH badge
- URL: `/hr/decisions` → Thêm
- Fill (FE-02): code `QD-EMPQA-HMSE7X` · title · type catalog **`HRD_01`** (label matched bổ nhiệm) · employee UAT NV 0100 · position CEO · status **Có hiệu lực**
- Network: POST `/api/hrm/decisions` → **201** `HRM-DEC-201`
- Response body: `status=effective` · `employee_id=0500220b-…` · `position_key=CEO` · **`work_history_id=null`**
- WH F5: sample rows `decision_id=null` · badge testid count=0 · `hintVisible=false` (type not FE-person-bound for HRD_01)
- Verdict: 🔴
- **Root cause (corroborate):**
  1. Live catalog SoT accepts `HRD_01`; rejects free-text `appointment` (`HRM-DEC-TYPE` 400 on API probe).
  2. BE `PERSON_BOUND_DECISION_TYPES` = only `appointment` \| `transfer` → `upsertWorkHistoryFromDecision` returns **null** for `HRD_01`.
  3. FE person-bound set ≠ catalog codes; WH neo AC unreachable on natural catalog path.
- Residual: **R-EMP-DEC-WH-NEO-CATALOG** (P0)
- spec_ref: SPEC-01 §D.2 · F-CORE-DEC-01/02 · AC-DEC-WH-01/02

### D5 — SI timeline actions
- API SoT: CI first id = EI overlap id `bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2` · emp `22222222-…` · status active
- Browser: profile Insurance tab → **`hdsd-insurance-timeline-root` absent** · no `hdsd-insurance-action-*` buttons
- Harness API corroborate (not U65 PASS): POST actions with wrong DTO → **400** `HRM-VAL-001` (`effective_from` required; not product dual-SoT fail)
- Verdict: 🔴 (U65 requires FE click → POST 2xx → periods/F5)
- Residual: **R-EMP-SI-FE-ACTION-UI** (P1) — enrollment ids usable; profile UI path missing / empty list binding
- spec_ref: SPEC-01 §D.5 · F-CORE-SI-02/03

### D6 — HTP-05 (regression)
- Banner `data-htp05-state=blocked` · GET hire-readiness **200** · blocker `HRM-HTP-NO-ACTIVE-CONTRACT`
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
| Narrow flags | D2+D6 PASS · FE-02 form PASS · BE-02 SoT PASS — **not** module ready |

---

## 5. Residuals (PM dispatch)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-EMP-DEC-WH-NEO-CATALOG** | **P0** | **dev-be** (+ FE align person-bound) | Align catalog `decision_types` codes with F-CORE-DEC-02 person-bound set (or map HRD_* → WH upsert); natural browser path must leave WH `decision_id`/`decision_code` + `work_history_id` on effective create |
| **R-EMP-SI-FE-ACTION-UI** | **P1** | **dev-fe** | Profile Insurance must load enrollment SoT rows (`employee-insurances`) and render `InsuranceTimelineActionsPanel` so CORE-10 actions POST + periods F5 work without seed |
| R-J03-DIALOG | P2 | qa retest | Contract Eye dialog |
| OBS | P2 | devops/dev-be | Full `nest build` currently fails on `attendance.service.ts` missing imports — restart used existing `dist/` (BE-02 present). Watch restart fragile. |

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | R2 U65 browser: L0 PASS; **D2/D6 PASS**; FE-02 D1 form **CLOSED** (POST 201); BE-02 dual-SoT **CLOSED** (id overlap); **D1 FAIL** WH neo (`HRD_01` vs BE person-bound `appointment/transfer` + catalog forbids `appointment`); **D5 FAIL** FE timeline/actions absent despite enrollment ids; J-01/02/04 PASS · J-03 PARTIAL; honesty false; no seed; no module UAT. |
| **next_owner** | **pm** → dispatch **dev-be** (R-EMP-DEC-WH-NEO-CATALOG) + **dev-fe** (R-EMP-SI-FE-ACTION-UI); then QA R3 |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-e2e-link-emp-qa-01-r2.md` |
| **ack_status** | **FAIL_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-E2E-LINK-EMP-BE-03
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-E2E-LINK-EMP-QA-01 R2 FAIL_TO_PM
u65: zero-seed
residual: R-EMP-DEC-WH-NEO-CATALOG P0

entry_criteria:
  - evidence docs/qa/evidence/po-hrm-e2e-link-emp-qa-01-r2.md §D1
  - live: POST decisions type=HRD_01 status=effective → 201 work_history_id=null
  - live: POST decisions type=appointment → 400 HRM-DEC-TYPE (not in catalog)

task:
  - Close F-CORE-DEC-02 on natural catalog path: effective + person-bound catalog codes (e.g. HRD_*) must UPSERT WH with decision_id/decision_code; return work_history_id
  - Align PERSON_BOUND_DECISION_TYPES with catalog SoT (or catalog attribute person_bound) — do not require free-text appointment when catalog forbids it
  - Preserve scope parity; no seed; jest regression
  - Parallel FE: PO-HRM-E2E-LINK-EMP-FE-03 R-EMP-SI-FE-ACTION-UI — profile Insurance loads employee-insurances enrollment + action panel testids

exit: READY_FOR_QA → PO-HRM-E2E-LINK-EMP-QA-01 R3 (D1 neo + D5 FE actions + keep D2/D6/J-01..04)
cấm: seed · claim hrm_personnel_uat_ready · invent WH without decision
```

### Parallel FE dispatch (copy-ready)

```text
work_item_id: PO-HRM-E2E-LINK-EMP-FE-03
from_role: pm
to_role: dev-fe
lane: execution
parent: PO-HRM-E2E-LINK-EMP-QA-01 R2 FAIL_TO_PM
u65: zero-seed
residual: R-EMP-SI-FE-ACTION-UI P1

entry_criteria:
  - BE-02 CLOSED — GET contracts-insurance/insurance ids ∩ employee-insurances (evidence R2)
  - Profile emp 22222222-… Insurance tab: no hdsd-insurance-timeline-root in R2 browser

task:
  - Wire profile Insurance list to enrollment SoT so natural rows render InsuranceTimelineActionsPanel
  - Browser-ready: action buttons → POST …/employee-insurances/:id/actions (DTO effective_from + company_id) → periods + F5
  - must_keep: D2 WH picker · D6 HTP · J-HRM-01..04 · no apps/api/**

exit: READY_FOR_QA with vitest + HDSD testids
```
