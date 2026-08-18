# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **Date** | 2026-08-07 |
| **ack_status** | **PASS_TO_PM** |
| **change_mode** | ADD |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BA-01.md` |
| **Honesty** | All `*_ready=false` · no personnel/payroll UAT invent · U65 · no apps/** · no seed |

---

## 1. read_first ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md` | §2.1 EMP Loại QSĐ · BR-PLT-01..06 · AC pattern |
| 2 | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md` | **L-EMP-CAT-06** QSĐ OUT GĐ1 → GĐ1.5 residual |
| 3 | Enterprise `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-01a** | BR-BP-DEC-EMP-01 · AC-DEC-WH · person-bound |
| 4 | Team `docs/hrm/SRS.md` UC-HRM-27 | BR-DEC-04/05 · catalog `decision_types` |
| 5 | Peer ATT/REC AC | **AC-PLT-ATT-01..03** · **AC-PLT-REC-02..04** · **AC-PLT-EMP-02..05** open/retire/assert |
| 6 | DB_DESIGN §3.11 `hr_decisions` | `decision_type` catalog · person-bound require |
| 7 | E1-B / W1B alias | `hr_decision_types` ↔ `decision_types` must_keep |
| 8 | `PO_HRM_CONTINUOUS_W8_20260807.md` | Peer SA DEC vertical parallel |

**no_prompt_echo:** Spec team-internal — không dán chat Sponsor vào tài liệu khách.

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BA-01.md) | AC/BR pack Loại QSĐ open catalog — UC-PLT-DEC-01..06 · **AC-PLT-DEC-01..06** · **BR-PLT-02/04/05/06** + **BR-PLT-DEC-01..06** · VAL matrix · must_keep spine · honesty |

**Không đụng:** `apps/**` · seed · wipe sealed EMP/ATT/REC · invent closed enum · flip `hrm_personnel_uat_ready`.

---

## 3. AC / BR stamp summary

| Class | IDs | Intent |
|-------|-----|--------|
| Open keys | **AC-PLT-DEC-01** · **BR-PLT-05** · **BR-PLT-DEC-04** | N+ create → F5 → Decisions picker |
| Retire | **AC-PLT-DEC-02** · **BR-PLT-04** | Soft-delete; history key intact |
| Consumer assert | **AC-PLT-DEC-03** · **BR-PLT-02** | Catalog >0 → unknown type **4xx** |
| Person-bound | **AC-PLT-DEC-04/05** · **BR-PLT-DEC-01/02** | Flag-driven `employee_id` — **not** closed type enum |
| Dual SoT | **AC-PLT-DEC-06** · **BR-PLT-06** · **BR-PLT-DEC-05** | Alias `hr_decision_types` ↔ `decision_types` |
| Spine must_keep | **BR-PLT-DEC-03** · **MK-DEC-SPINE-01** | effective → WH — create/approve path giữ |

---

## 4. Quality gates (ba-process)

| Check | Result |
|-------|--------|
| Peer pattern ATT/REC/EMP AC open/retire/assert | **PASS** |
| Align L-EMP-CAT-06 residual (not absorb EMP) | **PASS** |
| CORE-01a / BR-DEC-05 person-bound | **PASS** |
| Dual SoT alias E1-B | **PASS** |
| must_keep create/approve/effective/WH | **PASS** |
| No invent closed enum | **PASS** |
| Honesty flags false | **PASS** |
| U65 FE mutate AC when FE exists | **PASS** (AC-PLT-DEC-01..06) |
| No apps/** · no seed · no wipe seals | **PASS** |
| Measurable VAL matrix for SA/ba-data/QA | **PASS** |

---

## 5. completion_report

**Closed:** Implementation-ready BA for **Loại quyết định / QSĐ** open catalog (GĐ1.5 after EMP L-EMP-CAT-06): UC catalog, **AC-PLT-DEC-01..06**, platform BR-PLT-02/04/05/06 + **BR-PLT-DEC-01..06** (person_bound, alias, WH spine), validation matrix VAL-DEC-*, must_keep decisions create/approve/effective→WH and sealed EMP/ATT/REC, honesty all false, U65 browser paths defined.

**Residual / open:** Peer SA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01` F.1 CONFIRMED; then **ba-data** physical; ba-docs DOC-DELTA optional; Dev HOLD until DATA; QA browser after FE/BE; Q-DEC-01..04 for SA.

**Forbidden claims:** personnel UAT · Phase1 DONE · UC-HRM-27 DONE from catalog AC alone · wipe EMP/ATT/REC seals.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **pm**

### Primary (after both DEC-BA + DEC-SA CONFIRMED)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01
from_role: pm
to_role: ba-data
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01
program: PO-HRM-CONTINUOUS-W8-20260807
change_mode: ADD

## Mission
Physical DB map for open catalog Loại QSĐ / hr_decision_types (Option B ICatalogRow) — align SA DEC vertical F.1 + BA AC-PLT-DEC-01..06.

## read_first
1. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BA-01.md
2. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md (must be CONFIRMED)
3. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md / EMP-DATA-01 peer pattern
4. docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §3.11 hr_decisions
5. docs/qa/evidence/po-hrm-dynamic-config-platform-dec-ba-01.md

## Deliverables
- docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01.md
- evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-data-01.md
- VAL-DEC-CAT-* / CNS-* physical; soft-delete; dual SoT alias; person_bound column
- must_keep decisions create/approve/WH spine · no closed enum CHECK · no wipe EMP/ATT/REC
- honesty: hrm_personnel_uat_ready=false · no apps/** · no seed

## exit
PASS_TO_PM · unlock dev-be DEC-BE-01 after DATA CONFIRMED
```

### If SA DEC vertical not yet CONFIRMED

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01
from_role: pm
to_role: sa
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01
peer_ba: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BA-01 (BA LOCKED)

## Mission
Confirm Option B F.1 for hr_decision_types open catalog — align BA AC-PLT-DEC-01..06 / BR-PLT-DEC-*.

## read_first
1. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BA-01.md
2. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md L-EMP-CAT-06
3. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md F-ATT-CAT-LVT pattern
4. docs/architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md Option B
5. docs/qa/evidence/po-hrm-dynamic-config-platform-dec-ba-01.md

## exit
PASS_TO_PM · then ba-data DEC-DATA-01 (both CONFIRMED)
honesty false · no apps/**
```

---

## 7. Evidence checklist

- [x] Spec path written (AC-PLT-DEC · BR-PLT · VAL)
- [x] Align peer ATT/REC/EMP open-catalog AC
- [x] Align L-EMP-CAT-06 + CORE-01a + BR-DEC-05
- [x] Dual SoT alias
- [x] must_keep spine · no closed enum · no wipe seals
- [x] Honesty false · U65 FE mutate AC
- [x] No apps/** · no seed · no invent UAT
- [x] next_dispatch_prompt copy-ready (ba-data after both CONFIRMED)
