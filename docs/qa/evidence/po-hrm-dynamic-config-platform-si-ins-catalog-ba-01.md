# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — AC pack Option B (admin open N+1 vs consumer picker when Nest EFF ≠ empty) |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01` CONFIRMED Option **B** |
| **parallel** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01` (ba-data UNLOCK) |
| **ref_sa** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01.md) |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-si-ins-catalog-sa-01.md`](po-hrm-dynamic-config-platform-si-ins-catalog-sa-01.md) |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01.md) |
| **Verdict** | **CONFIRMED** |
| **ack_status** | `PASS_TO_PM` |
| **change_mode** | ADD · docs-only · **no** `apps/**` · **no** seed |
| **U65** | zero-seed · browser AC measurable (after Nest LIVE) |
| **OS honesty** | `C-SLICE-≠-MODULE` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · DENY CTR legal-print reopen · DENY module SI/CTR UAT · DENY reopen EMP·DEC·PAY·ATT·REC·EXT·LIST-TOTALS |

### Honesty locks (mandatory)

| Flag | Value | BA note |
|------|-------|---------|
| **`contracts_printable_ready`** | **`false`** | **DENIED** invent / promote |
| **`hrm_personnel_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **CTR legal-print / library** | **SEAL RETAIN** | **cấm reopen** without warrant |
| **SI enrollment EMP-BE-02** | **SEAL RETAIN** | ONE SoT `employee_insurances` · **cấm** schema rewrite |
| **EMP · DEC · PAY · ATT · REC · EXT · LIST-TOTALS** | **SEAL RETAIN** | **cấm reopen** |
| **Module SI/CTR UAT / Phase1** | **DENIED** | Slice AC ≠ module GO |
| **ba-data EXPAND** | **UNLOCK** · parallel DATA-01 | Nest `si_insurance_type` **absent** — **≠** ATT-LEAVE HOLD |
| **BE** | **HOLD** until BA **+** DATA | Then Nest + consumer assert |
| **Seed** | **DENIED** (U65) | |
| **Settings-MD-only picker SoT** | **DENIED** | Option A REJECT retained |
| **Insurers fold** | **DENIED** | OUT GĐ1 residual |

---

## 1. spec_read_ack

| Artifact | Used |
|----------|------|
| SA Option B | `SI-INS-CATALOG-SA-01` L-SI-INS-01..10 · §7 AC/VAL matrix · Nest DEFINE |
| Platform BA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01` **BR-PLT-02/04/05/06** |
| Peer ATT / PAY / REC BA | **AC-PLT-ATT-LEAVE-01*** · **AC-PLT-PAY-01*** · **AC-PLT-REC-STAGE-01*** admin≠consumer |
| Peer EMP/DEC | open catalog pattern |
| SRS | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-10** · **AC-SI-TL-*** (OUT fold) · E3 **AC-INS-*** |
| TechSpec / API / DB | **F-CORE-SI-02/03** · F-CORE-SI-01 · §3.6 enrollment · no Nest type yet |
| Nest AS-IS (code cite SA) | `assertInsuranceTypeKey` MD · enrollment free-text `type` · FE Settings picker |
| Prior seals | CTR legal-print · SI enrollment · EMP/DEC/PAY/ATT/REC/EXT/LIST-TOTALS |
| BA TRACE | **J-HRM-INS-E3-01** · UF-HRM-04 / J-HRM-04 |

**Không đụng:** `apps/**` · seed · flip printable/personnel · reopen CTR print · fold insurers · rewrite enrollment · BE before DATA.

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01.md) | Objective · AS-IS/TO-BE · BR-PLT-SI-INS-01..10 · surface matrix S-SI-ADM/CNS/REF/OUT · UC catalog · AC-PLT-SI-INS-01/01b/01c/01d/01H (+POL/ENR/RATE) · VAL-SI-CNS-01..06 · error taxonomy · honesty · handoff |

---

## 3. AC pack summary (machine-readable)

| ID | Intent | Pass signal |
|----|--------|-------------|
| **AC-PLT-SI-INS-01** | Consumer policy + enrollment picker from EFF when active ≥1 | GET F-SI-CAT-EFF-01 · 2xx · F5 type ∈ catalog |
| **AC-PLT-SI-INS-01b** | Invent unknown type | **4xx** `HRM-INS-TYPE-KEY` · no F5 persist · ≡ E3 AC-INS-03 deepen |
| **AC-PLT-SI-INS-01c** | EFF active =0 | Empty picker + CTA admin · no fake/seed · admin CREATE still OK |
| **AC-PLT-SI-INS-01d** | Admin CREATE open N+1 | **2xx/201** F-SI-CAT-TYP-02 · F5 · no «must pick only» |
| **AC-PLT-SI-INS-01H** | Honesty / seals | printable/personnel false · CTR/enrollment retain · C-SLICE · DENY module SI/CTR UAT |
| **AC-PLT-SI-INS-POL** | Policy surface | AC-INS-01/03 · J-HRM-INS-E3-01 deepen Nest |
| **AC-PLT-SI-INS-ENR** | Enrollment surface | FR-UC-BP-CORE-10 · F-CORE-SI-02 · **GAP BE** free-text |
| **AC-PLT-SI-INS-RATE** | Optional rate-cfg | F-SET-SI-02 key ∈ EFF |
| **VAL-SI-CNS-01** | Policy OOS | 4xx KEY · migrate MD→Nest |
| **VAL-SI-CNS-02** | Enrollment invent | 4xx KEY · **mandatory GAP BE** |
| **VAL-SI-CNS-03** | Rate-cfg invent | 4xx KEY · optional |
| **VAL-SI-CNS-04** | Settings-only SoT | FAIL AC-01 · **GAP FE** |
| **VAL-SI-CNS-05** | Scope drift | jest FAIL / 409 |

### Surface split (L-SI-INS-01)

| Class | Surf IDs |
|-------|----------|
| **ADMIN** | S-SI-ADM-01 (Settings Loại BH Nest) |
| **CONSUMER** | S-SI-CNS-01 policy · S-SI-CNS-02 enrollment · S-SI-CNS-03 rate-cfg (optional) |
| **REF only** | S-SI-REF-01 Settings MD / group REF |
| **OUT / RETAIN** | S-SI-OUT-01 insurers · S-SI-OUT-02 SI-TL actions · S-SI-OUT-03 CTR print · S-SI-OUT-04 participants |

### Cross-ref

| ID | Relation |
|----|----------|
| **AC-INS-01** | RETAIN policy CRUD — type SoT deepen |
| **AC-INS-02** | OUT insurers residual |
| **AC-INS-03** | ≡ **01b** invent type KEY (Nest EFF) |
| **AC-INS-04/05** | RETAIN participant/end |
| **AC-SI-TL-*** | OUT fold · must_keep separate |
| **F-CORE-SI-02/03** | 02 consumer type · 03 lifecycle OUT |
| **AC-PLT-ATT-LEAVE-01*** / **PAY-01*** / **REC-STAGE-01*** | Named peer pattern |

### Proposed journeys (ba-docs)

- Reuse **J-HRM-INS-E3-01** (deepen Nest type SoT)
- Proposed `J-HRM-SI-INS-CAT-01` · `02` · `03` · `04`
- Reuse J-HRM-04 / UF-HRM-04 **RETAIN** (no UAT flip)

### Gap stamps (execution unlock order)

| Gap | Owner after DATA | Mandatory? |
|-----|------------------|------------|
| Physical Nest `si_insurance_type` | **ba-data** (parallel) | **YES** |
| F-SI-CAT-TYP/EFF + policy assert migrate | **dev-be** | **YES** |
| Enrollment `type` assert | **dev-be** VAL-SI-CNS-02 | **YES** |
| FE picker rebind EFF | **dev-fe** VAL-SI-CNS-04 | **YES** |
| Rate-cfg assert | **dev-be** | Optional |

---

## 4. REJECT / DENY checklist (process)

| Item | Verdict |
|------|---------|
| Settings MD alone as SoT | **REJECT** (Option A) |
| Fold insurers Nest into this AC | **DENY** |
| Reopen CTR legal-print | **DENY** |
| Invent printable / personnel ready | **DENY** |
| Module SI/CTR UAT from this slice | **DENY** (`C-SLICE-≠-MODULE`) |
| BE before DATA CONFIRMED | **DENY** (HOLD) |
| Seed for picker density | **DENY** (U65) |

---

## 5. Handoff contract

```yaml
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01
from_role: ba-process
to_role: pm
ack_status: PASS_TO_PM
verdict: CONFIRMED
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-ba-01.md
spec_path: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01.md
ba_data: UNLOCK # parallel SI-INS-CATALOG-DATA-01
be: HOLD # until BA + DATA CONFIRMED
next_owner: pm
```

### completion_report

**Closed:** CONFIRMED AC pack **AC-PLT-SI-INS-01 / 01b / 01c / 01d / 01H** (+ POL/ENR/RATE) · **VAL-SI-CNS-01..06** · **BR-PLT-SI-INS-01..10** · consumer UF/J-* enumerate (policy · enrollment · optional rate-cfg) · cite **FR-UC-BP-CORE-10** · **F-CORE-SI-02/03** · E3 **AC-INS** cross-ref · Settings MD alone **REJECT** · insurers/CTR print/printable·personnel **DENY** · Nest F-SI-CAT-TYP/EFF = SoT · admin open N+1 ≠ consumer invent → **`HRM-INS-TYPE-KEY`** · ba-data **UNLOCK** · BE **HOLD** · honesty false · docs-only.

**Residual:** Physical DATA parallel · BE/FE after DATA · optional ba-docs journey rows after Nest LIVE · rate-cfg optional deepen.

### next_owner

**pm** — seal BA; ensure **ba-data** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01` completes; **then** unlock **dev-be** (Nest + asserts). **Do not** unlock BE before DATA CONFIRMED. **Do not** dispatch QA browser until Nest EFF LIVE.

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-DATA-01
(or if DATA already CONFIRMED → PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-01)
from_role: pm
to_role: ba-data  # OR dev-be if DATA CONFIRMED
lane: governance  # OR execution for BE
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01 CONFIRMED
ref_ba: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01.md
ref_sa: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01.md

## task (DATA — if not done)
ADD-plan public.si_insurance_type ICatalogRow peer att_leave_type / emp_document_type —
no CHK IN · soft FK text on enrollment/policy · FORBIDDEN rewrite employee_insurances ·
cite SA L-SI-INS-* · BA BR-PLT-SI-INS-10 · honesty false · no apps/**

## task (BE — only after DATA CONFIRMED)
Nest ensureSchema + F-SI-CAT-TYP/EFF · migrate assertInsuranceTypeKey → Nest EFF ·
enrollment type assert VAL-SI-CNS-02 · optional rate-cfg · jest VAL-SI-CNS-* ·
RETAIN enrollment ONE SoT · CTR print seals · honesty false · U65 · C-SLICE

exit: PASS_TO_PM · CONFIRMED · completion_report · next_owner · next_dispatch_prompt · evidence_path · ack_status
```

---

## 6. Non-claims

- No `apps/**` / migration / seed this seat.
- No claim Nest LIVE / consumer assert LIVE.
- No `contracts_printable_ready=true` · no `hrm_personnel_uat_ready=true` · no module SI/CTR UAT · no Phase1.
- No invent reopen CTR legal-print / SI enrollment / peer seals.
- Enrollment lifecycle **AC-SI-TL** / F-CORE-SI-03 **remain** separate must_keep.
