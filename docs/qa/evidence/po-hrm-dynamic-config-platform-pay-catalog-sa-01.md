# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — Option/F.1 narrow **AC-PLT-PAY-01** (consumer picker when Nest `salary_components` ≠ empty) |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-QC-01` GWC · **R-EMP-TOK-EXT SEALED** |
| **ref_qc_peer** | [`po-hrm-dynamic-config-platform-merge-token-emp-ext-qc-01.md`](po-hrm-dynamic-config-platform-merge-token-emp-ext-qc-01.md) · stamps `EMPTOKEXTQA-MSJ57PE1` · `EMPTOKQA-MSJ290VB` |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md) |
| **Verdict** | **CONFIRMED** — Option **B** LOCKED |
| **ack_status** | `PASS_TO_PM` |
| **change_mode** | ADD Option/F.1 · docs-only · **no** `apps/**` · **no** seed |
| **U65** | zero-seed · no UF invent |
| **OS honesty** | `C-SLICE-≠-MODULE` · `payroll_e2e_ready=false` · DENY formula LIVE · DENY reopen EXT·EMP·DEC·CTR·LIST-TOTALS · J-HRM-07 FULL GWC **retain** |

### Honesty locks (mandatory)

| Flag | Value | SA note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote |
| **formula LIVE / process payslip GO** | **DENIED** | AC-PLT-PAY-01 ≠ evaluator LIVE |
| **`contracts_printable_ready`** | **`false`** | **DENIED** |
| **J-HRM-07 FULL GWC** | **RETAIN** | **DENIED** flip / reopen from this seat |
| **EXT · EMP · DEC · CTR · LIST-TOTALS · PAY-CATALOG QC** | **SEAL RETAIN** | **cấm reopen** |
| **Module PAY UAT / Phase1** | **DENIED** | Slice Option ≠ module GO |
| **Seed** | **DENIED** (U65) | |

---

## 1. spec_read_ack

| Artifact | Used |
|----------|------|
| Platform BA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md` **AC-PLT-PAY-01** · **BR-PLT-02/04/05** |
| SRS | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-02** dual SoT + **AC-PAY-COMP-01** |
| PAY-CATALOG API F.1 | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-API-01.md` F-PLT-PAY-COMP-01..04 |
| PAY-CATALOG QC GWC | `po-hrm-dynamic-config-platform-pay-catalog-qc-01.md` SEAL RETAIN |
| Allowance peer | `PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md` PC↔SC dual SoT |
| EMP / DEC peers | EMP-VERTICAL · DEC-VERTICAL consumer assert when catalog >0 |
| Formula peer | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md` — **cấm** invent LIVE |
| AS-IS O4 gap | `po-hrm-e2e-link-pay-cfg-qa-02.md` Settings key ABSENT vs Nest density |
| ADR | `ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` Option B L1/L6 · PAY row |
| EXT QC U88 | `po-hrm-dynamic-config-platform-merge-token-emp-ext-qc-01.md` next_dispatch |

**Prior evidence note:** Earlier `pay-catalog-sa-01` content unlocked **API F.1 → BE** (already shipped + QC GWC). This revision **owns AC-PLT-PAY-01 consumer Option** after EXT seal — does **not** reopen API seat.

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md) | Option A/B/C · trade-off · **B LOCKED** · L-PAY-AC-01..10 · AC/VAL matrix · ba-data HOLD · ba-process UNLOCK · BE HOLD |

**Không đụng:** `apps/**` · seed · flip ready · formula LIVE · reopen seals.

---

## 3. Option summary

| Option | Verdict |
|--------|---------|
| **A** Settings extension = sole picker SoT | **REJECT** — dual orphan / O4 class |
| **B** Nest `salary_components` via F-PLT-PAY-COMP-01 = code SoT; consumer picker when ≠ empty; admin CREATE open N+1 | **LOCKED / CONFIRMED** |
| **C** Invent formula LIVE / mega table / reopen seals | **REJECT** |

**Weighted score:** A 66 · **B 111** · C 24.

---

## 4. Architecture locks (machine-readable)

| Lock | Rule |
|------|------|
| **L-PAY-AC-01** | Admin CREATE open ≠ consumer free-text ban |
| **L-PAY-AC-02** | Code SoT = Nest F-PLT-PAY-COMP-01 — not Settings extension alone |
| **L-PAY-AC-03** | Nature = `pay_types` REF |
| **L-PAY-AC-04** | Empty catalog → no fake UF density |
| **L-PAY-AC-08** | Formula LIVE OUT |
| **L-PAY-AC-09** | Seals retain |
| **L-PAY-AC-10** | Honesty false · `C-SLICE-≠-MODULE` |

| Gate | Status |
|------|--------|
| ba-data physicalize | **HOLD** (already physical) |
| ba-process AC pack | **UNLOCK** |
| BE consumer assert | **HOLD** until BA |
| FE picker rebind | After BA (+ BE) |
| Formula / e2e | **DENIED** this seat |

---

## 5. Quality gates (SA)

| Check | Result |
|-------|--------|
| Option A/B/C + reject invent formula LIVE | **PASS** |
| Cite F-PLT-PAY-COMP / FR-UC-BP-PAY-02 / AC-PLT-PAY-01 | **PASS** |
| Peer EMP · DEC · Allowance | **PASS** |
| ba-data HOLD · ba-process unlock · BE HOLD | **PASS** |
| No apps/** · no seed · honesty false | **PASS** |
| Seals retain · J-HRM-07 retain | **PASS** |
| Admin vs consumer split (L-PAY-AC-01) | **PASS** |

---

## 6. completion_report

**Closed:** Docs-only Option/F.1 for **AC-PLT-PAY-01** **CONFIRMED** — Option **B** LOCKED: Nest `salary_components` via **F-PLT-PAY-COMP-01** is authoritative code catalog; when effective ≠ empty, consumers must pick catalog code (**BR-PLT-02** · **AC-PAY-COMP-01**); Settings extension alone **REJECT** as picker SoT; invent formula LIVE / mega-EAV / seal reopen **REJECT**; admin CREATE N+1 remains open (**BR-PLT-05**); ba-data **HOLD**; ba-process **UNLOCK**; BE consumer-validate **HOLD** until BA; honesty `payroll_e2e_ready=false`; PAY-CATALOG QC + EXT·EMP·DEC·CTR·LIST-TOTALS + J-HRM-07 FULL GWC **retained**; no `apps/**`.

**Residual:** ba-process AC surface matrix → then BE assert + FE rebind → QA U65 — **not** formula LIVE / e2e flip.

---

## 7. next_owner / next_dispatch_prompt

**next_owner:** **ba-process**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01
from_role: pm
to_role: ba-process
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01 CONFIRMED Option B
program: PO-HRM-CONTINUOUS-W8-20260807
change_mode: ADD
ref_sa: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md
ref_evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-sa-01.md
sponsor_confirm: Option B LOCKED 2026-08-07

## entry_criteria
SA-01 CONFIRMED Option B; ba-data HOLD; PAY-CATALOG QC + EXT·EMP·DEC·CTR·LIST-TOTALS seals retained; payroll_e2e_ready=false

## read_first
1. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md §5–§7 (L-PAY-AC-* · AC matrix)
2. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md AC-PLT-PAY-01 · BR-PLT-02
3. docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-PAY-02 · AC-PAY-COMP-01
4. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-API-01.md F-PLT-PAY-COMP-01..02
5. docs/qa/evidence/po-hrm-e2e-link-pay-cfg-qa-02.md O4 (SoT mis-bind — do not revive Option A)

## task
AC pack implementation-ready for Option B:
- Split AC: catalog admin CREATE open N+1 (retain PAY-CATALOG) vs consumer picker when Nest SC ≠ empty
- Enumerate consumer surfaces: template lines · period packs · compensation/salary-history lines · formula component refs (soft)
- Measurable AC-PLT-PAY-01 / 01b / 01c / 01H · AC-PAY-COMP-01 · VAL-PAY-CNS-* with FE click path + Network 2xx/4xx + F5
- Error taxonomy HRM-SC-COMP-KEY (or peer) when invent code
- DENY formula LIVE · DENY payroll_e2e flip · DENY reopen seals · DENY Settings-only SoT
- Spec: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-ba-01.md

## cấm
apps/** · seed · ba-data invent second table · unlock formula LIVE · flip ready · reopen EXT/EMP/DEC/CTR/PAY-CATALOG GWC

## exit
PASS_TO_PM · CONFIRMED AC pack · next_owner pm→dev-be CNS-BE HOLD-lift prompt · completion_report · evidence_path · ack_status
```

---

## 8. Handoff fields

| Field | Value |
|-------|--------|
| **completion_report** | §6 |
| **next_owner** | **ba-process** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01` |
| **next_dispatch_prompt** | §7 copy-ready |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-sa-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **pm_dispatch_hint** | Option B CONFIRMED — Task **ba-process** same session; ba-data HOLD; BE HOLD until BA |

---

## ack_status

**PASS_TO_PM**

## payroll_e2e_ready

**false**

## formula LIVE invent

**DENIED**

## seals

**RETAIN** — PAY-CATALOG QC · EXT · EMP · DEC · CTR · LIST-TOTALS · J-HRM-07 FULL GWC
