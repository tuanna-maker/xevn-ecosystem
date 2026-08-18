# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — AC pack Option B (admin open N+1 vs consumer picker when Nest EFF ≠ empty) |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01` CONFIRMED Option **B** |
| **parallel** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01` (ba-data UNLOCK) |
| **peer_ba** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01` (type — **SEAL RETAIN · do not reopen L1**) |
| **ref_sa** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01.md) |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-si-insurer-catalog-sa-01.md`](po-hrm-dynamic-config-platform-si-insurer-catalog-sa-01.md) |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01.md) |
| **Verdict** | **CONFIRMED** |
| **ack_status** | `PASS_TO_PM` |
| **change_mode** | ADD · docs-only · **no** `apps/**` · **no** seed |
| **U65** | zero-seed · browser AC measurable (after Nest LIVE) |
| **OS honesty** | `C-SLICE-≠-MODULE` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · DENY SI-INS L1 reopen · DENY CTR legal-print reopen · DENY fold into type · DENY module SI/CTR UAT · DENY reopen EMP·DEC·PAY·ATT·REC·EXT·LIST-TOTALS |

### Honesty locks (mandatory)

| Flag | Value | BA note |
|------|-------|---------|
| **`contracts_printable_ready`** | **`false`** | **DENIED** invent / promote |
| **`hrm_personnel_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **SI-INS-CATALOG-QC-01 L1 type** | **SEAL RETAIN** | **cấm reopen** / fold insurers into type |
| **CTR legal-print / library** | **SEAL RETAIN** | **cấm reopen** without warrant |
| **SI enrollment EMP-BE-02** | **SEAL RETAIN** | ONE SoT `employee_insurances` · **cấm** schema rewrite |
| **EMP · DEC · PAY · ATT · REC · EXT · LIST-TOTALS** | **SEAL RETAIN** | **cấm reopen** |
| **Module SI/CTR UAT / Phase1** | **DENIED** | Slice AC ≠ module GO |
| **ba-data EXPAND** | **UNLOCK** · parallel DATA-01 | Nest `si_insurer` **absent** — peer SI type DATA class |
| **BE** | **HOLD** until BA **+** DATA | Then Nest + consumer assert |
| **Seed** | **DENIED** (U65) | |
| **Settings-MD-only picker SoT** | **DENIED** | Option A REJECT retained |
| **Fold into `si_insurance_type`** | **DENIED** | L-SI-INR-08 |

---

## 1. spec_read_ack

| Artifact | Used |
|----------|------|
| SA Option B | `SI-INSURER-CATALOG-SA-01` L-SI-INR-01..10 · §7 AC/VAL matrix · Nest DEFINE |
| Peer SI type BA | `SI-INS-CATALOG-BA-01` **AC-PLT-SI-INS-01*** — **do not reopen L1** |
| Platform BA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01` **BR-PLT-02/04/05/06** |
| Peer ATT / PAY BA | **AC-PLT-ATT-LEAVE-01*** · **AC-PLT-PAY-01*** admin≠consumer pattern |
| SRS / E3 | **FR-UC-BP-CORE-10** · **AC-INS-02** · AC-INS-01/03..05 retain · **AC-SI-TL-*** OUT fold |
| TechSpec / API / DB | E-INS-DEPTH · F-CORE-SI-01 · DOC-DELTA F-SI-CAT-INS-* · §3.6b pointer · no Nest insurer yet |
| Nest AS-IS (code cite SA) | `assertInsurerKey` MD · FE Settings `insurers` picker · records soft key via same assert |
| Prior seals | SI type L1 · CTR legal-print · SI enrollment · EMP/DEC/PAY/ATT/REC/EXT/LIST-TOTALS |
| BA TRACE | **J-HRM-INS-E3-01** deepen insurer · UF-HRM-04 / J-HRM-04 |

**Không đụng:** `apps/**` · seed · flip printable/personnel · reopen SI-INS L1 · reopen CTR print · fold into type · rewrite enrollment · BE before DATA · reopen peer type BA L1.

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01.md) | Objective · AS-IS/TO-BE · BR-PLT-SI-INR-01..10 · surface matrix S-SI-INR-ADM/CNS/REF/OUT · UC catalog · AC-PLT-SI-INSURER-01/01b/01c/01d/01H (+POL/REC) · VAL-SI-INR-CNS-01..06 · error taxonomy · honesty · handoff |

---

## 3. AC pack summary (machine-readable)

| ID | Intent | Pass signal |
|----|--------|-------------|
| **AC-PLT-SI-INSURER-01** | Consumer policy picker from EFF when active ≥1 | GET F-SI-CAT-INS-EFF-01 · 2xx · F5 key ∈ catalog |
| **AC-PLT-SI-INSURER-01b** | Invent unknown insurer | **4xx** `HRM-INS-INSURER-KEY` · no F5 persist · ≡ E3 AC-INS-02 deepen |
| **AC-PLT-SI-INSURER-01c** | EFF active =0 | Empty picker + CTA admin · no fake/seed · admin CREATE still OK |
| **AC-PLT-SI-INSURER-01d** | Admin CREATE open N+1 | **2xx/201** F-SI-CAT-INS-02 · F5 · no «must pick only» |
| **AC-PLT-SI-INSURER-01H** | Honesty / seals | printable/personnel false · SI type L1 + CTR/enrollment retain · C-SLICE · DENY module SI/CTR UAT · DENY fold into type |
| **AC-PLT-SI-INSURER-POL** | Policy surface | AC-INS-02 · J-HRM-INS-E3-01 deepen Nest insurer |
| **AC-PLT-SI-INSURER-REC** | Optional records soft key | invent → KEY when present + EFF>0 |
| **VAL-SI-INR-CNS-01** | Policy OOS | 4xx KEY · migrate MD→Nest |
| **VAL-SI-INR-CNS-02** | Records invent | 4xx KEY · optional UF |
| **VAL-SI-INR-CNS-03** | Settings-only SoT | FAIL AC-01 · **GAP FE** |
| **VAL-SI-INR-CNS-04** | Scope drift | jest FAIL / 409 |
| **VAL-SI-INR-CNS-05** | Retire hide | not in default picker |
| **VAL-SI-INR-CNS-06** | KEY taxonomy | insurer KEY ≠ type KEY |

### Surface split (L-SI-INR-01)

| Class | Surf IDs |
|-------|----------|
| **ADMIN** | S-SI-INR-ADM-01 (Settings Nhà BH Nest) |
| **CONSUMER** | S-SI-INR-CNS-01 policy · S-SI-INR-CNS-02 records (optional) |
| **REF only** | S-SI-INR-REF-01 Settings MD / group REF |
| **OUT / RETAIN** | S-SI-INR-OUT-01 type Nest L1 · OUT-02 enrollment type · OUT-03 SI-TL · OUT-04 CTR print · OUT-05 ATT work-sites · OUT-06 participants |

### Cross-ref

| ID | Relation |
|----|----------|
| **AC-INS-01** | RETAIN policy CRUD — insurer SoT deepen |
| **AC-INS-02** | ≡ **01b** invent insurer KEY (Nest EFF) |
| **AC-INS-03** | OUT this pack — peer type KEY `HRM-INS-TYPE-KEY` · L1 SEAL |
| **AC-INS-04/05** | RETAIN participant/end |
| **AC-PLT-SI-INS-01*** | Peer type catalog — **SEAL RETAIN · do not reopen L1** |
| **AC-SI-TL-*** | OUT fold · must_keep separate |
| **AC-PLT-ATT-LEAVE-01*** / **PAY-01*** | Named peer pattern |

### Proposed journeys (ba-docs)

- Reuse **J-HRM-INS-E3-01** (deepen Nest **insurer** SoT)
- Proposed `J-HRM-SI-INR-CAT-01` · `02` · `03` · `04`
- Peer type `J-HRM-SI-INS-CAT-*` **RETAIN**
- Reuse J-HRM-04 / UF-HRM-04 **RETAIN** (no UAT flip)

### Gap stamps (execution unlock order)

| Gap | Owner after DATA | Mandatory? |
|-----|------------------|------------|
| Physical Nest `si_insurer` | **ba-data** (parallel) | **YES** |
| F-SI-CAT-INS/EFF + policy assert migrate | **dev-be** | **YES** |
| Records soft assert migrate | **dev-be** VAL-SI-INR-CNS-02 | Shared helper · optional UF |
| FE picker rebind EFF | **dev-fe** VAL-SI-INR-CNS-03 | **YES** |

---

## 4. REJECT / DENY checklist (process)

| Item | Verdict |
|------|---------|
| Settings MD alone as SoT | **REJECT** (Option A) |
| Fold insurers into `si_insurance_type` / reopen SI-INS L1 | **DENY** |
| Reopen CTR legal-print | **DENY** |
| Invent printable / personnel ready | **DENY** |
| Module SI/CTR UAT from this slice | **DENY** (`C-SLICE-≠-MODULE`) |
| BE before DATA CONFIRMED | **DENY** (HOLD) |
| Seed for picker density | **DENY** (U65) |
| Reopen peer SI type BA L1 | **DENY** |

---

## 5. Handoff contract

```yaml
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01
from_role: ba-process
to_role: pm
ack_status: PASS_TO_PM
verdict: CONFIRMED
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-ba-01.md
spec_path: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01.md
ba_data: UNLOCK # parallel SI-INSURER-CATALOG-DATA-01
be: HOLD # until BA + DATA CONFIRMED
next_owner: pm
```

### completion_report

**Closed:** CONFIRMED AC pack **AC-PLT-SI-INSURER-01 / 01b / 01c / 01d / 01H** (+ POL/REC) · **VAL-SI-INR-CNS-01..06** · **BR-PLT-SI-INR-01..10** · consumer UF/J-* enumerate (policy · optional records soft key) · cite **AC-INS-02** · **J-HRM-INS-E3-01** insurer deepen · Settings MD alone **REJECT** · fold into type / SI-INS L1 reopen / CTR print / printable·personnel **DENY** · Nest F-SI-CAT-INS/EFF = SoT · admin open N+1 ≠ consumer invent → **`HRM-INS-INSURER-KEY`** · peer type L1 **SEAL RETAIN** · ba-data **UNLOCK** · BE **HOLD** · honesty false · docs-only.

**Residual:** Physical DATA parallel · BE/FE after DATA · optional ba-docs journey rows after Nest LIVE · records optional UF deepen.

### next_owner

**pm** — seal BA; ensure **ba-data** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01` completes; **then** unlock **dev-be** (Nest + asserts). **Do not** unlock BE before DATA CONFIRMED. **Do not** dispatch QA browser until Nest EFF LIVE. **Do not** reopen SI type L1.

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01
(or if DATA already CONFIRMED → PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BE-01)
from_role: pm
to_role: ba-data  # OR dev-be if DATA CONFIRMED
lane: governance  # OR execution for BE
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01 CONFIRMED
ref_ba: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01.md
ref_sa: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01.md
peer_type: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01 L1 SEAL RETAIN — do not reopen

## task (DATA — if not done)
ADD-plan public.si_insurer ICatalogRow peer si_insurance_type / att_leave_type / emp_document_type —
no CHK IN · soft FK text on policy/records · FORBIDDEN fold into si_insurance_type ·
FORBIDDEN rewrite employee_insurances · cite SA L-SI-INR-* · BA BR-PLT-SI-INR-10 ·
honesty false · no apps/**

## task (BE — only after BA + DATA both CONFIRMED)
Nest ensureSchema + F-SI-CAT-INS-01/02/EFF-01 · migrate assertInsurerKey → Nest EFF ·
optional records soft assert · jest VAL-SI-INR-CNS-* ·
RETAIN SI type L1 · enrollment ONE SoT · CTR print seals · honesty false · U65 · C-SLICE

## cấm
apps/** before unlock · seed · flip printable/personnel · reopen SI-INS L1 · reopen CTR print ·
fold into si_insurance_type · invent module SI/CTR UAT · Phase1 DONE

exit: PASS_TO_PM · CONFIRMED · completion_report · next_owner · next_dispatch_prompt · evidence_path · ack_status
```

---

## 6. Non-claims

- No `apps/**` / migration / seed this seat.
- No claim Nest LIVE / consumer assert LIVE.
- No `contracts_printable_ready=true` · no `hrm_personnel_uat_ready=true` · no module SI/CTR UAT · no Phase1.
- No invent reopen SI-INS L1 / CTR legal-print / SI enrollment / peer seals.
- Insurance **type** Nest / enrollment `type` / AC-SI-TL / F-CORE-SI-03 **remain** separate must_keep.
- Peer SI-INS-CATALOG-BA-01 type pack **not** reopened.
