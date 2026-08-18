# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — Option/F.1 narrow **AC-PLT-SI-INS-01** (Nest insurance-type SoT · admin open · consumer picker when ≠ empty) |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-DOCS-01` DOC-DELTA **ACCEPT** · U88 |
| **ref_peer_emp** | EMP DOC/ET open catalog |
| **ref_peer_dec** | DEC decision-types |
| **ref_peer_pay** | PAY Nest salary_components Option B · AC-PLT-PAY-01 |
| **ref_peer_att** | ATT Nest leave Option B · AC-PLT-ATT-LEAVE-01 |
| **ref_peer_rec** | REC Nest stage Option B · AC-PLT-REC-STAGE-01 |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01.md) |
| **Verdict** | **CONFIRMED** — Option **B** LOCKED |
| **ack_status** | `PASS_TO_PM` |
| **change_mode** | ADD Option/F.1 · docs-only · **no** `apps/**` · **no** seed |
| **U65** | zero-seed · no UF invent |
| **OS honesty** | `C-SLICE-≠-MODULE` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · DENY CTR legal-print reopen · DENY reopen EMP·DEC·PAY·ATT·REC·EXT·LIST-TOTALS · DENY module SI/CTR UAT |

### Honesty locks (mandatory)

| Flag | Value | SA note |
|------|-------|---------|
| **`contracts_printable_ready`** | **`false`** | **DENIED** invent / promote |
| **`hrm_personnel_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **CTR legal-print QC-01/02 · library QC-03** | **SEAL RETAIN** | **cấm reopen** without warrant |
| **SI enrollment EMP-BE-02** (`employee_insurances` ONE SoT) | **SEAL RETAIN** | catalog ≠ rewrite enrollment |
| **`payroll_e2e_ready`** | **`false`** | retained |
| **EMP · DEC · PAY · ATT · REC · EXT · LIST-TOTALS** | **SEAL RETAIN** | **cấm reopen** |
| **Module SI / CTR UAT / Phase1** | **DENIED** | Slice Option ≠ module GO |
| **Seed** | **DENIED** (U65) | |

---

## 1. spec_read_ack

| Artifact | Used |
|----------|------|
| E2E SI spine | `PO-HRM-E2E-LINK-EMP-SA-01.md` F-CORE-SI-02/03 · enrollment ONE SoT |
| EMP-BE-02 bridge | `po-hrm-e2e-link-emp-be-02.md` · `employee_insurances` ≠ records |
| Platform BA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md` BR-PLT-02/04/05/06 |
| SRS | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-10** BH vòng đời |
| TechSpec | `TECHSPEC_HRM_ENTERPRISE.md` FR-UC-BP-CORE-10 → F-CORE-SI-02/03 |
| API | `API_DESIGN_HRM_ENTERPRISE.md` **F-CORE-SI-01** · physical `/contracts-insurance` · `/employee-insurances` |
| DB | `DB_DESIGN_HRM_ENTERPRISE.md` §3.6 enrollment · `insurance_type_key` text · **no** Nest type table |
| ADR | `ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` Option B · §7 Contracts/Settings |
| Peer ATT leave | `…-ATT-LEAVE-CATALOG-SA-01.md` Option B AC-PLT-ATT-LEAVE-01 |
| Peer PAY | `…-PAY-CATALOG-SA-01.md` Option B AC-PLT-PAY-01 |
| Peer REC stage | `…-REC-STAGE-CATALOG-SA-01.md` Option B AC-PLT-REC-STAGE-01 |
| Peer EMP / DEC | EMP-VERTICAL · DEC-VERTICAL Nest open catalog |
| Nest AS-IS | **Absent** `si_insurance_type` — Settings MD `insurance_types` via `assertInsuranceTypeKey` · `HRM-INS-TYPE-KEY` · enrollment free-text `type` GAP |
| Parent U88 | REC-STAGE-CATALOG-DOCS-01 ACCEPT → this SI-INS catalog SA |

**Prior note:** Unlike ATT-LEAVE / REC-STAGE / PAY Nest-already-sealed seats, SI has **no** Nest type catalog yet → Option B **defines** Nest SoT + **UNLOCK ba-data** physical EXPAND (peer EMP/DEC/ATT vertical class).

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01.md) | Option A/B/C · trade-off · **B LOCKED** · L-SI-INS-01..10 · AC/VAL matrix · ba-data **UNLOCK** · ba-process **UNLOCK** · BE HOLD |

**Không đụng:** `apps/**` · seed · flip printable/personnel · reopen CTR legal-print · reopen EMP/DEC/PAY/ATT/REC seals.

---

## 3. Option summary

| Option | Verdict |
|--------|---------|
| **A** Settings MD `insurance_types` = sole picker SoT | **REJECT** — dual orphan / PAY O4 class · ≠ peer Nest |
| **B** Nest `si_insurance_type` via F-SI-CAT-TYP/EFF = code SoT; consumer picker when ≠ empty; admin CREATE open N+1; invent → `HRM-INS-TYPE-KEY`; Settings REF merge-read only | **LOCKED / CONFIRMED** |
| **C** Invent printable/personnel / reopen CTR legal-print / mega table | **REJECT** |

**Weighted score:** A 70 · **B 105** · C 24.

---

## 4. AS-IS vs target (facts)

| Surface | AS-IS | Target Option B |
|---------|-------|-----------------|
| Type catalog physical | **None** (Settings MD only) | **ADD** `public.si_insurance_type` |
| Policy assert | `settingsCatalogs` · `insurance_types` · `HRM-INS-TYPE-KEY` | Nest F-SI-CAT-EFF-01 |
| Enrollment `type` | Free-text (default `social`) | ∈ EFF when count>0 |
| FE picker | `catalogSearchPicker` Settings | Nest `…/insurance-types/effective` |
| Insurers | Settings `insurers` · E3 | **OUT** residual this seat |
| Enrollment SoT | `employee_insurances` | **must_keep RETAIN** |

---

## 5. Gates

| Gate | Status |
|------|--------|
| ba-process | **UNLOCK** → `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01` |
| ba-data | **UNLOCK** → `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01` (physical EXPAND) |
| BE | **HOLD** until BA (+ DATA) |
| FE | After BE |
| CTR legal-print / SI enrollment seals | **RETAIN** |
| Honesty printable / personnel | **false** |

---

## 6. completion_report

**Closed:** Option/F.1 **AC-PLT-SI-INS-01** — Option **B CONFIRMED/LOCKED**; Nest SoT **defined** (`si_insurance_type` · F-SI-CAT-TYP/EFF); Settings MD alone **REJECT**; invent KEY retain `HRM-INS-TYPE-KEY`; admin open N+1 ≠ consumer picker; ba-process **UNLOCK**; ba-data **UNLOCK** (Nest absent); BE **HOLD**; honesty `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false`; CTR legal-print / SI enrollment / EMP·DEC·PAY·ATT·REC·EXT·LIST-TOTALS **SEAL RETAIN**; docs-only · no `apps/**` · no seed · `C-SLICE-≠-MODULE` · DENY module SI/CTR UAT.

**Residual:** ba-process AC pack surface matrix · ba-data physical ADD-plan · BE/FE after · insurers Nest OUT · enrollment free-text assert GAP stamped for BA.

---

## 7. Handoff contract

| Field | Value |
|-------|--------|
| **completion_report** | See §6 |
| **next_owner** | **ba-process** |
| **next_dispatch_prompt** | See §8 |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-sa-01.md` |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 8. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01
from_role: pm
to_role: ba-process
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01 CONFIRMED Option B
program: PO-HRM-CONTINUOUS-W8-20260807
change_mode: ADD
ref_sa: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01.md
ref_peer: AC-PLT-ATT-LEAVE-01 · AC-PLT-PAY-01 · AC-PLT-REC-STAGE-01 · EMP/DEC

## task
CONFIRMED AC pack **AC-PLT-SI-INS-01 / 01b / 01c / 01d / 01H** + VAL-SI-CNS-* + BR rows:
- Nest F-SI-CAT-TYP/EFF = insurance_type SoT (SA Option B)
- Admin CREATE open N+1 · consumer picker when EFF≠empty · invent → HRM-INS-TYPE-KEY
- Enumerate consumer UF/J-*: policy · enrollment type · optional rate-cfg
- Cite SRS FR-UC-BP-CORE-10 · F-CORE-SI-02/03 · E3 AC-INS cross-ref
- REJECT Settings MD alone as SoT · insurers fold · CTR print reopen · printable/personnel invent
- Spec: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01.md
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-ba-01.md

## must_keep / honesty
contracts_printable_ready=false · hrm_personnel_uat_ready=false
CTR legal-print / SI enrollment seals RETAIN · EMP/DEC/PAY/ATT/REC/EXT/LIST-TOTALS RETAIN
no apps/** · no seed · C-SLICE-≠-MODULE · DENY module SI/CTR UAT
ba-data parallel OK: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01 (si_insurance_type ADD)
BE HOLD until BA (+ DATA)

## exit
PASS_TO_PM · CONFIRMED · completion_report · next_owner · next_dispatch_prompt · evidence_path · ack_status
```

**Parallel (PM optional same session):**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01
to_role: ba-data
## task
ADD-plan public.si_insurance_type ICatalogRow peer att_leave_type / emp_document_type — no CHK IN · soft FK text on enrollment/policy · FORBIDDEN rewrite employee_insurances · cite SA L-SI-INS-* · honesty false · no apps/**
```
