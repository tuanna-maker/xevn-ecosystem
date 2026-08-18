# Evidence — PO-HRM-E2E-LINK-EMP-DB-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-E2E-LINK-EMP-DB-01` |
| from_role | ba-data |
| to_role | pm |
| lane | governance |
| parent | `PO-HRM-E2E-LINK-EMP-SA-01` PASS_TO_PM |
| change_mode | ADD confirm · **NO** `apps/**` · **no migrate executed** |
| date | 2026-08-06 |
| program | `PO-HRM-ALL-MENU-E2E-LINK-01` · `W-ALL-PARALLEL-01` |
| spec_path | `docs/program/specs/PO-HRM-E2E-LINK-EMP-DB-01.md` |
| ack_status | **PASS_TO_PM** |

---

## Honesty locks (unchanged)

| Flag | Value |
|------|--------|
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| U65 zero-seed | **true** |
| apps/** touched | **no** |
| seed | **no** |
| Module UAT / PROD claim | **none** |

---

## spec_read_ack

| Layer | Path / § |
|-------|----------|
| SA TechSpec | `PO-HRM-E2E-LINK-EMP-SA-01.md` §3 F.1 · §4 DB intents |
| SA evidence | `po-hrm-e2e-link-emp-sa-01.md` |
| BA spine | `PO-HRM-E2E-LINK-EMP-SPEC-01.md` §D.2/D.5/D.6 |
| Logical client | `DB_DESIGN_HRM_ENTERPRISE.md` §3.6 · §3.9 · §3.11 (DOC-DELTA) |
| AS-IS WH | `employee-profile.service.ts` `ensureSchema` → `employee_work_timeline` (+ `position_key`/`department_key`) |
| AS-IS QSĐ | `decisions.service.ts` → `hr_decisions` (`employee_id` nullable; `status` TEXT default `draft`) |
| AS-IS SI | `employee-insurances.service.ts` → **`employee_insurances`**; peers `employee_insurance_records` · `hrm_insurance_policy_participants` |
| AS-IS HĐ | `contracts-insurance.service.ts` → `employee_contracts` CHECK `active\|expired\|terminated` |
| FE status vocab | `Decisions.tsx` `getStatusOptions` includes **`effective`** |

---

## Verdict — **CONFIRMED**

| Topic | Stamp |
|-------|--------|
| ONE enrollment SoT | **`public.employee_insurances`** |
| NOT enrollment SoT | `employee_insurance_records` · `hrm_insurance_policy_participants` |
| Rate timeline | **ADD** `public.hrm_insurance_rate_period` (missing AS-IS) |
| WH SoT | **`public.employee_work_timeline`** — alias only; no dual table |
| `decision_id` on WH | **ADD** uuid soft FK → `hr_decisions.id` + UQ partial |
| SI action enums 1:1 | `close→closed` · `stop→stopped` · `suspend→suspended` · `change_rate/resume→applying` period |
| QSĐ effective trigger | **`status='effective'`** |
| HTP-05 | `employee_contracts.status='active'` same `company_id` — no new table |
| Soft FK / no dual-write | **locked** |
| Migrate this seat | **none executed** — BE-01 Nest `ensureSchema` ADD list |

**Unlock:** PM → **`PO-HRM-E2E-LINK-EMP-BE-01`** + **`PO-HRM-E2E-LINK-EMP-FE-01`** parallel.

---

## Physical cross-check (read-only)

### A. Enrollment candidates → ONE SoT

| Table | Role AS-IS | Verdict |
|-------|------------|---------|
| **`employee_insurances`** | Employee-scoped CRUD: `type`, dates, `contribution`/`employer_contribution`, `status` default `active` | **CONFIRMED enrollment SoT** |
| `employee_insurance_records` | Provider + `expiry_date`; status `active\|expired\|cancelled` | **NOT** AC-SI-TL SoT |
| `hrm_insurance_policy_participants` | Policy attach + rate columns on row | **NOT** enrollment lifecycle SoT |
| `hrm_insurance_rate_period` | — | **ABSENT** → **ADD** |

**Rationale:** Rates live on enrollment row today → overwrite risk for AC-SI-TL-04/05 → close with append-only period table FK soft → `employee_insurances.id`.

### B. `employee_work_timeline` vs SA §4.2

| Column | AS-IS | DB-01 |
|--------|-------|-------|
| `position_key` / `department_key` | yes (E1-A) | enforce on mutate |
| `event_date` | yes | alias `effective_from` |
| `position` / `department` | free-text denorm | **≠** SoT |
| `decision_id` | **missing** | **ADD** |
| `source_module` | **missing** | **ADD** |
| `archived_at` | **missing** | **ADD** |
| `title` | NOT NULL | denorm from catalog/decision on auto row |

### C. `hr_decisions`

| Item | AS-IS | Confirm |
|------|-------|---------|
| `employee_id` | nullable | Required person-bound (app) |
| `status` | TEXT, default `draft` | Trigger WH when **`effective`** (FE already lists value) |
| Status set FE | draft, pending, signed, **effective**, expired, cancelled | **CONFIRMED vocabulary** |
| `position_key` | yes | keep |
| `department_key` | **missing** | **ADD preferred** |

### D. Soft FK rules

| Link | Rule |
|------|------|
| WH.`decision_id` → `hr_decisions.id` | Soft UUID; UQ where not null + not archived; no CASCADE |
| Period.`enrollment_id` → `employee_insurances.id` | Soft; same `company_id`; no CASCADE |
| HTP contract → employee | Soft; status `active` + date window |

---

## Action → status map (locked)

| action | enrollment.status | period_status |
|--------|-------------------|---------------|
| close | closed | closed |
| stop | stopped | stopped |
| suspend | suspended | suspended |
| change_rate | keep active* | applying |
| resume | active | applying |

\*unless currently suspended — then change_rate does not auto-resume (resume is separate action).

---

## Client DOC-DELTA (no wipe)

| File | Action |
|------|--------|
| `DB_DESIGN_HRM_ENTERPRISE.md` | §3.6 ONE SoT stamp · §3.9 CONFIRMED (replace intent) · **ADD §3.11** `hr_decisions` |
| `apps/**` | **untouched** |

---

## Residual (not blocking unlock)

| Residual | Owner |
|----------|-------|
| Nest ensureSchema ADD columns/table + jest | **dev-be** |
| FE WH picker · SI actions · C&B D1 | **dev-fe** |
| AC-SI-TL-06 PAY read | PAY |
| CORE-09 | FE-TPL-01 |
| Browser U65 D1–D7 | **qa** |

---

## Completion / handoff

| Field | Value |
|-------|--------|
| completion_report | CONFIRMED enrollment=`employee_insurances`; WH=`employee_work_timeline`+ADD `decision_id`/`source_module`/`archived_at`; ADD `hrm_insurance_rate_period`; SI enums 1:1; QSĐ trigger `effective`; HTP=`employee_contracts.active`; soft FK / no dual-write; honesty false; no apps/**. |
| next_owner | **pm** |
| next_dispatch_prompt | § below |
| evidence_path | `docs/qa/evidence/po-hrm-e2e-link-emp-db-01.md` |
| ack_status | **PASS_TO_PM** |

---

## next_dispatch_prompt (copy-ready) — unlock BE + FE

```text
work_item_id: PO-HRM-E2E-LINK-EMP-BE-01
from_role: pm
to_role: dev-be
lane: execution
program: PO-HRM-ALL-MENU-E2E-LINK-01
change_mode: ADD
ack_target: READY_FOR_QA or PASS_TO_PM

entry_criteria:
  - DB-01 CONFIRMED: docs/qa/evidence/po-hrm-e2e-link-emp-db-01.md
  - Spec: docs/program/specs/PO-HRM-E2E-LINK-EMP-DB-01.md
  - SA F.1: docs/program/specs/PO-HRM-E2E-LINK-EMP-SA-01.md
  - read_first SRS CORE-01a · CORE-10 · REC-07 AC-HTP-05 · BR-DEC-05

task:
  - ensureSchema ADD: employee_work_timeline.decision_id + source_module + archived_at + UQ partial
  - ensureSchema ADD: hrm_insurance_rate_period; expand employee_insurances status enum app-side
  - F-CORE-DEC-01/02: person-bound employee_id required; on status=effective UPSERT WH by decision_id
  - F-CORE-WH-02: reject free-text SoT; F-CORE-SI-03 append period; F-CORE-HTP-05 readiness read-model
  - Soft FK only · NO dual-write · NO seed · @CODE-MEMORY + spec_read_ack
  - Regression jest scope_parity list↔get

exit_criteria:
  - evidence docs/qa/evidence/po-hrm-e2e-link-emp-be-01.md
  - honesty hrm_personnel_uat_ready=false · employees_e2e_linkage_ready=false

cấm: seed · claim UAT · wipe F-CORE-EMP-01/02 ring · invent second WH/enrollment table
```

```text
work_item_id: PO-HRM-E2E-LINK-EMP-FE-01
from_role: pm
to_role: dev-fe
lane: execution
program: PO-HRM-ALL-MENU-E2E-LINK-01
change_mode: ADD
ack_target: READY_FOR_QA or PASS_TO_PM

entry_criteria:
  - DB-01 CONFIRMED (same evidence)
  - BE contract in flight or READY (coordinate F-CORE-* paths)
  - read_first SPEC-01 D1/D2/D5/D6 · SA F.1 · AC-WH-PICK · AC-SI-TL · AC-HTP-05

task:
  - WH CatalogSearchPicker position_key (cấm Input SoT)
  - QSĐ person-bound bắt employee_id; after effective show WH neo decision_id
  - SI timeline actions close/stop/suspend/change_rate/resume + F5 periods
  - HTP-05 readiness surface / blockers (no seed)
  - C&B fields off public EmployeeForm (D1) per SRS boundary
  - U65 browser-ready paths; honesty flags false

exit_criteria:
  - evidence docs/qa/evidence/po-hrm-e2e-link-emp-fe-01.md
  - must_keep J-HRM-01..04 regression

cấm: seed · claim UAT · invent CORE-09 wizard (FE-TPL-01 later)
```
