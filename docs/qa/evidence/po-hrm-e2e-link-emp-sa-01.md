# Evidence — PO-HRM-E2E-LINK-EMP-SA-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-E2E-LINK-EMP-SA-01` |
| from_role | sa |
| to_role | pm |
| lane | governance |
| change_mode | ADD · **NO CODE** `apps/**` |
| date | 2026-08-06 |
| program | `PO-HRM-ALL-MENU-E2E-LINK-01` |
| techspec_delta | `docs/program/specs/PO-HRM-E2E-LINK-EMP-SA-01.md` |
| entry | docs merge PASS `po-hrm-e2e-link-emp-docs-01.md` |
| ref_srs | CORE-01a · CORE-10 · REC-07 AC-HTP-05 · AC-WH-PICK · team BR-DEC-05 |
| ack_status | **PASS_TO_PM** |

---

## 1. Deliverables

| Artifact | Action |
|----------|--------|
| `PO-HRM-E2E-LINK-EMP-SA-01.md` | **ADD** — F.1 F-CORE-DEC-01/02 · WH-01/02 · SI-02/03 · HTP-05 + DB intents §4 + error taxonomy |
| `TECHSPEC_HRM_ENTERPRISE.md` | **DOC-DELTA** header + matrix CORE-01a/10/HTP + residual R-BP-EMP-E2E-* — no wipe |
| `API_DESIGN_HRM_ENTERPRISE.md` | **DOC-DELTA** header pointer → program SA-01 |
| `DB_DESIGN_HRM_ENTERPRISE.md` | **DOC-DELTA** header + §3.9 `decision_id` intent note |
| `apps/**` | **HOLD** — not touched |

---

## 2. Map SRS → F-id (audit)

| SRS / AC | F-id | DB intent |
|----------|------|-----------|
| CORE-01a #1–3 · AC-DEC-WH-01 · AC-DEC-EMP-01 | F-CORE-DEC-01 | `hr_decisions.employee_id` required person-bound |
| CORE-01a #4–5 · AC-DEC-WH-02..04 | F-CORE-DEC-02 | `employee_work_timeline.decision_id` UPSERT |
| AC-WH-PICK-01..03 | F-CORE-WH-02 | `position_key` / `department_key` enforce |
| CORE-10 AC-SI-TL-01..05 | F-CORE-SI-03 | append period + action enum |
| REC-07 AC-HTP-05-01..03 | F-CORE-HTP-05 | read `employee_contracts` active same company |

---

## 3. AS-IS vs target (spec says / code does)

| Topic | Spec says (post-docs) | Code/UI does (skim) | SA lock |
|-------|----------------------|---------------------|---------|
| QSĐ→WH | decision_id on WH after effective | WH CRUD tách; no `decision_id` column | ADD column + F-CORE-DEC-02 |
| WH position | catalog picker | FE Input free-text | F-CORE-WH-02 + FE after DB |
| SI actions | close/stop/suspend/change_rate | participant + policy; no timeline actions | F-CORE-SI-03 + period table if missing |
| HTP-05 | active contract same company | hire link without readiness gate | F-CORE-HTP-05 read-model |

---

## 4. Locks verified

| Lock | Status |
|------|--------|
| Option A overlay AS-IS (no dual WH table) | PASS |
| Soft FK `decision_id` UUID (not only decision_ref text) | PASS |
| Q-SI-SUSPEND GĐ1 vocabulary superseded by AC-SI-TL actions | PASS |
| Dev HOLD until ba-data DB-01 | PASS |
| `hrm_personnel_uat_ready=false` | PASS |
| No wipe F-CORE-EMP-03 / F-CORE-SI-01 stubs | PASS |
| `apps/**` untouched | PASS |

---

## 5. Residual (not closed by SA)

| Residual | Owner next |
|----------|------------|
| Confirm physical enrollment SoT ONE table + period DDL | **ba-data** `PO-HRM-E2E-LINK-EMP-DB-01` |
| Effective status enum on `hr_decisions` | ba-data + BE |
| C&B field hide on EmployeeForm (D1) | **dev-fe** after DB |
| CORE-09 template wizard | FE-TPL-01 later |
| AC-SI-TL-06 PAY read | PAY seat |
| Browser U65 D1–D7 | **qa** after FE/BE |

---

## 6. Completion / handoff

| Field | Value |
|-------|--------|
| completion_report | SA ADD F.1 DEC→WH · SI timeline actions · HTP-05 · WH picker keys; DB intents alias `employee_work_timeline`+`decision_id`; client DOC-DELTA; HOLD apps/**; honesty false. |
| next_owner | **ba-data** |
| next_dispatch_prompt | §7 below |
| evidence_path | `docs/qa/evidence/po-hrm-e2e-link-emp-sa-01.md` |
| ack_status | **PASS_TO_PM** |

---

## 7. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-E2E-LINK-EMP-DB-01
from_role: pm
to_role: ba-data
lane: governance
program: PO-HRM-ALL-MENU-E2E-LINK-01
change_mode: ADD
ack_target: PASS_TO_PM

entry_criteria:
  - SA PASS: docs/qa/evidence/po-hrm-e2e-link-emp-sa-01.md
  - read_first:
      - docs/program/specs/PO-HRM-E2E-LINK-EMP-SA-01.md §4 DB intents · §3 F.1
      - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §3.6 · §3.9
      - AS-IS: public.hr_decisions · public.employee_work_timeline · employee_contracts · insurance tables
      - SRS CORE-01a · CORE-10 · AC-HTP-05

task:
  - CONFIRM physical column plan: employee_work_timeline.decision_id (soft FK UUID) + source_module + IX unique
  - CONFIRM ONE enrollment SoT table + ADD rate_period timeline if missing (AC-SI-TL append)
  - CONFIRM hr_decisions employee_id required rule for person-bound types + effective status enum for F-CORE-DEC-02
  - Alias map logical hrm_employment_history ↔ employee_work_timeline (NO dual table)
  - DOC-DELTA DB_DESIGN_HRM_ENTERPRISE.md ADD-only · no wipe · no apps/** · no migrations

exit_criteria:
  - evidence docs/qa/evidence/po-hrm-e2e-link-emp-db-01.md
  - completion_report + next_dispatch_prompt → pm unlock PO-HRM-E2E-LINK-EMP-BE-01 + FE-01 (parallel)
  - ack_status PASS_TO_PM
  - honesty hrm_personnel_uat_ready=false

cấm: apps/** · seed · dual-write WH · claim UAT-ready
```

### After DB confirm — PM unlock (do not run until DB-01 PASS)

```text
work_item_id: PO-HRM-E2E-LINK-EMP-BE-01
from_role: pm
to_role: dev-be
lane: execution
program: PO-HRM-ALL-MENU-E2E-LINK-01

entry_criteria:
  - DB-01 CONFIRMED: docs/qa/evidence/po-hrm-e2e-link-emp-db-01.md
  - SA F.1: docs/program/specs/PO-HRM-E2E-LINK-EMP-SA-01.md
  - read_first SRS CORE-01a · CORE-10 · REC-07 AC-HTP-05 · BR-DEC-05

task:
  - Implement F-CORE-DEC-01/02 (employee_id required person-bound; WH write-on-effective with decision_id)
  - F-CORE-WH-02 picker key validation; F-CORE-SI-03 actions append period; F-CORE-HTP-05 readiness
  - Regression jest scope_parity · U65 no seed
  - @CODE-MEMORY + spec_read_ack

exit_criteria:
  - evidence docs/qa/evidence/po-hrm-e2e-link-emp-be-01.md
  - READY_FOR_QA or PASS_TO_PM with next FE if FE parallel not done
  - honesty hrm_personnel_uat_ready=false

cấm: seed · claim UAT · wipe public C&B serializer contract incorrectly
```
