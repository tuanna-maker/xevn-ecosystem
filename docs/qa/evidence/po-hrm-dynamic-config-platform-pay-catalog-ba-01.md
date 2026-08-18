# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — AC pack Option B (admin open N+1 vs consumer picker when Nest SC ≠ empty) |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01` CONFIRMED Option **B** |
| **ref_sa** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md) |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-pay-catalog-sa-01.md`](po-hrm-dynamic-config-platform-pay-catalog-sa-01.md) |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md) |
| **Verdict** | **CONFIRMED** |
| **ack_status** | `PASS_TO_PM` |
| **change_mode** | ADD · docs-only · **no** `apps/**` · **no** seed |
| **U65** | zero-seed · browser AC measurable |
| **OS honesty** | `C-SLICE-≠-MODULE` · `payroll_e2e_ready=false` · DENY formula LIVE · DENY reopen EXT·EMP·DEC·CTR·LIST-TOTALS·PAY-CATALOG · J-HRM-07 FULL GWC **RETAIN** |

### Honesty locks (mandatory)

| Flag | Value | BA note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote |
| **formula LIVE / process payslip GO** | **DENIED** | Soft warn formula refs GĐ1 only (**VAL-PAY-CNS-07**) |
| **J-HRM-07 FULL GWC** | **RETAIN** | **DENIED** flip / reopen |
| **EXT · EMP · DEC · CTR · LIST-TOTALS · PAY-CATALOG QC** | **SEAL RETAIN** | **cấm reopen** |
| **Module PAY UAT / Phase1 / AMIS DONE** | **DENIED** | Slice AC ≠ module GO |
| **ba-data EXPAND** | **HOLD** · **no EXPAND** | Physical Nest SC already exists |
| **Seed** | **DENIED** (U65) | |
| **Settings-only picker SoT** | **DENIED** | Option A REJECT retained |

---

## 1. spec_read_ack

| Artifact | Used |
|----------|------|
| SA Option B | `PAY-CATALOG-SA-01` §5 L-PAY-AC-* · §7 AC/VAL matrix |
| Platform BA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01` **AC-PLT-PAY-01** · **BR-PLT-02/04/05** |
| SRS | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-02** dual SoT · **AC-PAY-COMP-01** · PAY-06 cross |
| API F.1 | `PAY-CATALOG-API-01` **F-PLT-PAY-COMP-01..04** · **VAL-PAY-COMP-01** |
| Allowance peer | `PO-HRM-ALLOWANCE-CATALOG-SYNC-01` PC→SC mirror ADD |
| O4 AS-IS | `po-hrm-e2e-link-pay-cfg-qa-02.md` Settings key ABSENT vs Nest density |
| Peer BA pattern | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BA-01` admin vs consumer split |
| Journey / UF | `PROGRAM_JOURNEY_MAP` **J-HRM-07** RETAIN · `USER_FLOW` **UF-HRM-06** |

**Không đụng:** `apps/**` · seed · flip ready · formula LIVE · reopen seals · ba-data second table.

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md) | Objective · AS-IS/TO-BE · BR-PLT-PAY-01..08 · surface matrix S-PAY-ADM/CNS/REF · UC catalog · AC-PLT-PAY-01/01b/01c/01H · AC-PAY-COMP-01 · VAL-PAY-CNS-01..07 · error taxonomy · honesty · handoff |

---

## 3. AC pack summary (machine-readable)

| ID | Intent | Pass signal |
|----|--------|-------------|
| **AC-PLT-PAY-01** | Consumer template (+ spot period) picker from Nest when active ≥1 | GET F-PLT-PAY-COMP-01 · 2xx · F5 code ∈ Nest |
| **AC-PLT-PAY-01b** | Nest active =0 | Empty picker + VI · no fake/seed · admin CREATE still OK |
| **AC-PLT-PAY-01c** | Admin CREATE open N+1 | **201** F-PLT-PAY-COMP-02 · F5 · no «must pick only» |
| **AC-PLT-PAY-01H** | Honesty / seals | ready=false · no LIVE · seals retain · C-SLICE |
| **AC-PAY-COMP-01** | Invent unknown on consumer | **4xx** `HRM-SC-COMP-KEY` · no F5 persist |
| **VAL-PAY-CNS-01** | Template OOS | 4xx |
| **VAL-PAY-CNS-02** | Compensation/history invent | 4xx |
| **VAL-PAY-CNS-03** | Scope drift list↔assert | jest FAIL / 409 |
| **VAL-PAY-CNS-04** | Period/pack invent | 4xx |
| **VAL-PAY-CNS-05** | Retired code on new line | reject / hidden |
| **VAL-PAY-CNS-06** | Settings-only SoT when Nest >0 | FAIL AC-PLT-PAY-01 |
| **VAL-PAY-CNS-07** | Formula soft | warn OK · no LIVE |

### Surface split (L-PAY-AC-01)

| Class | Surf IDs |
|-------|----------|
| **ADMIN** | S-PAY-ADM-01 |
| **CONSUMER** | S-PAY-CNS-01..04 (+ CNS-05 soft) |
| **REF only** | S-PAY-REF-01 Settings extension · S-PAY-REF-02 Allowance mirror writer |

### Proposed journeys (ba-docs)

- `J-HRM-PAY-COMP-01` · `J-HRM-PAY-COMP-02` · `J-HRM-PAY-COMP-03`
- Reuse UF-HRM-06 / J-HRM-07 **RETAIN** (no flip)

### Gates

| Gate | Status |
|------|--------|
| ba-data physicalize | **HOLD** · **no EXPAND** |
| BE consumer assert | **UNLOCK** after PM (`…-CNS-BE-01`) |
| FE picker rebind | After/with CNS-BE |
| Formula / e2e | **DENIED** |
| ba-docs DOC-DELTA | **OPTIONAL** (§9 spec) |

---

## 4. Quality gates (BA-process)

| Check | Result |
|-------|--------|
| Admin ≠ consumer split measurable | **PASS** |
| Enumerate template · period · compensation · formula-soft | **PASS** |
| AC-PLT-PAY-01/01b/01c/01H · AC-PAY-COMP-01 · VAL-PAY-CNS-* | **PASS** |
| DENY formula LIVE · ready flip · reopen seals · Settings-only SoT | **PASS** |
| ba-data HOLD · no apps/** · no seed · honesty false | **PASS** |
| Cite SA B · F-PLT-PAY-COMP · FR-UC-BP-PAY-02 · BR-PLT-02 | **PASS** |
| Exception/error paths on every consumer UC | **PASS** |

---

## 5. completion_report

**Closed:** Docs-only AC pack **CONFIRMED** for Option **B**: Nest `salary_components` via **F-PLT-PAY-COMP-01** = code SoT; **admin** CREATE remains open N+1 (**AC-PLT-PAY-01c** · **BR-PLT-PAY-01**); **consumers** (template · period/pack · compensation/history · formula soft) when Nest active >0 must picker/FK (**AC-PLT-PAY-01** · **AC-PAY-COMP-01** · **VAL-PAY-CNS-01..05**); empty Nest = empty picker no seed (**AC-PLT-PAY-01b**); Settings extension **not** sole SoT (**VAL-PAY-CNS-06**); formula soft warn only (**VAL-PAY-CNS-07**) — **DENIED** LIVE; honesty `payroll_e2e_ready=false` + seals **RETAIN** (**AC-PLT-PAY-01H**); ba-data **HOLD** no EXPAND; no `apps/**`.

**Residual:** PM unlock **dev-be** CNS assert + **dev-fe** Nest picker rebind → QA U65 → QC slice GWC — **not** formula LIVE / e2e / module UAT. Optional ba-docs journey ADD `J-HRM-PAY-COMP-*`.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **pm** → **dev-be** (primary) · **dev-fe** parallel OK

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-BE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01 CONFIRMED Option B
program: PO-HRM-CONTINUOUS-W8-20260807
change_mode: ADD
ref_ba: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md
ref_sa: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md
ref_api: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-API-01.md
ref_evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-ba-01.md

## entry_criteria
BA-01 CONFIRMED; SA Option B LOCKED; ba-data HOLD; PAY-CATALOG QC + EXT·EMP·DEC·CTR·LIST-TOTALS seals retained; payroll_e2e_ready=false

## read_first
1. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md §3–§7 (BR-PLT-PAY · surfaces · VAL-PAY-CNS · HRM-SC-COMP-KEY)
2. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md L-PAY-AC-01..10
3. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-API-01.md F-PLT-PAY-COMP-01
4. Peer assert patterns EMP DOC/ET · DEC decision-types when catalog >0

## task
EXPAND consumer-write validation (no new table):
- When Nest salary_components effective active count >0: assert component_code ∈ catalog on S-PAY-CNS-01..04 mutate endpoints
- Emit 4xx HRM-SC-COMP-KEY (or document 1:1 peer alias)
- Retain admin F-PLT-PAY-COMP-02 open N+1 (do NOT apply invent ban to admin create)
- jest: VAL-PAY-CNS-01..05 + VAL-PAY-CNS-03 scope_parity
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-cns-be-01.md
- Parallel FE (separate work_item OK): rebind consumer CatalogSearchPicker → GET /api/hrm/payroll/salary-components; DENY Settings-only SoT

## must_keep / cấm
payroll_e2e_ready=false · DENY formula LIVE · DENY reopen seals · no seed · no ba-data second table · C-SLICE-≠-MODULE · must_keep F-PLT-PAY-COMP admin paths · pay_types nature REF

## exit
READY_FOR_QA · completion_report · next_dispatch_prompt (qa U65 AC-PLT-PAY-01*) · evidence_path · ack_status
```

**Parallel FE prompt (optional same session):**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-FE-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01 CONFIRMED
ref_ba: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md §4 S-PAY-CNS-* · §6 AC-PLT-PAY-01*
## task
Rebind consumer pickers (template builder/lines · period packs · compensation/history) to Nest F-PLT-PAY-COMP-01 list when active>0; empty Nest = empty picker + VI (AC-PLT-PAY-01b); keep admin SalaryComponentsTab CREATE open (AC-PLT-PAY-01c); remove Settings extension as sole SoT (VAL-PAY-CNS-06); formula soft warn only (VAL-PAY-CNS-07); no formula LIVE; U65; evidence docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-cns-fe-01.md
## exit
READY_FOR_QA
```

---

## 7. Handoff fields

| Field | Value |
|-------|--------|
| **completion_report** | §5 |
| **next_owner** | **pm** → **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-BE-01` (+ **dev-fe** `…-CNS-FE-01`) |
| **next_dispatch_prompt** | §6 copy-ready |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-ba-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **pm_dispatch_hint** | BA CONFIRMED — Task **dev-be** CNS-BE same session; ba-data HOLD; optional parallel **dev-fe**; then QA U65 |

---

## ack_status

**PASS_TO_PM**

## payroll_e2e_ready

**false**

## formula LIVE invent

**DENIED**

## ba-data

**HOLD** · **no EXPAND**

## seals

**RETAIN** — PAY-CATALOG QC · EXT · EMP · DEC · CTR · LIST-TOTALS · J-HRM-07 FULL GWC
