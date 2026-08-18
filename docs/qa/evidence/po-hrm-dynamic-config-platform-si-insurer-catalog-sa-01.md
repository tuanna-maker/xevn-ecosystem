# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — Option/F.1 narrow **AC-PLT-SI-INSURER-01** (Nest insurers SoT · admin open · consumer picker when ≠ empty) |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QC-01` **GWC** L1 type SEAL · U88 · residual insurers Nest OUT |
| **ref_qc_prior** | [`po-hrm-dynamic-config-platform-si-ins-catalog-qc-01.md`](po-hrm-dynamic-config-platform-si-ins-catalog-qc-01.md) |
| **ref_peer_si_type** | SI-INS-CATALOG-SA-01 Option B · F-SI-CAT-TYP/EFF L1 sealed |
| **ref_peer_att** | ATT-LEAVE-CATALOG-SA-01 · ATT work-sites cite only |
| **ref_peer_pay** | PAY-CATALOG-SA-01 Option B · AC-PLT-PAY-01 |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01.md) |
| **Verdict** | **CONFIRMED** — Option **B** LOCKED |
| **ack_status** | `PASS_TO_PM` |
| **change_mode** | ADD Option/F.1 · docs-only · **no** `apps/**` · **no** seed |
| **U65** | zero-seed · no UF invent |
| **OS honesty** | `C-SLICE-≠-MODULE` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · DENY SI-INS L1 reopen · DENY CTR legal-print reopen · DENY fold into type · DENY module SI/CTR UAT |

### Honesty locks (mandatory)

| Flag | Value | SA note |
|------|-------|---------|
| **`contracts_printable_ready`** | **`false`** | **DENIED** invent / promote |
| **`hrm_personnel_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **SI-INS-CATALOG-QC-01 L1 type** | **SEAL RETAIN** | **cấm reopen** / fold insurers into type |
| **CTR legal-print QC-01/02 · library QC-03** | **SEAL RETAIN** | **cấm reopen** without warrant |
| **SI enrollment EMP-BE-02** | **SEAL RETAIN** | catalog ≠ rewrite enrollment |
| **`payroll_e2e_ready`** | **`false`** | retained |
| **EMP · DEC · PAY · ATT · REC · EXT · LIST-TOTALS** | **SEAL RETAIN** | **cấm reopen** |
| **Module SI / CTR UAT / Phase1** | **DENIED** | Slice Option ≠ module GO |
| **Seed** | **DENIED** (U65) | |

---

## 1. spec_read_ack

| Artifact | Used |
|----------|-------|
| Prior QC | SI-INS-CATALOG-QC-01 GWC · L1 type sealed · honesty false · U88 continuous |
| Prior SA type | `…-SI-INS-CATALOG-SA-01.md` Option B · insurers **OUT** residual · L-SI-INS-08 |
| Prior BA/DATA type | insurers FORBIDDEN fold · R-PLT-DATA-04 SI type CLOSED · insurers residual open |
| Platform BA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md` BR-PLT-02/04/05/06 · work-sites = ATT cite |
| SRS / E3 | FR-UC-BP-CORE-10 · **AC-INS-02** insurer soft-ref · `HRM-INS-INSURER-KEY` |
| TechSpec | E-INS-DEPTH · soft `insurer_key` ∈ `insurers` |
| API | F-CORE-SI-01 · `/contracts-insurance/*` · DOC-DELTA pointer F-SI-CAT-INS-* |
| DB | §3.6 / §3.6a type · **no** `si_insurer` · DOC-DELTA pointer §3.6b |
| ADR | Option B · L1 Catalog · L6 soft-delete |
| Peer ATT leave / PAY / REC | Option B Nest SoT · admin ≠ consumer invent KEY |
| Nest AS-IS insurers | **Absent** `si_insurer` — Settings MD `insurers` via `assertInsurerKey` · `HRM-INS-INSURER-KEY` |
| Code cite | `contracts-insurance.service.ts` assertInsurerKey · `hrm-settings-master-keys.ts` familyId insurers |

**Prior note:** Peer SI type seat — Nest was absent → Option B **DEFINE** + ba-data **UNLOCK**. Same class for insurers. ATT work-sites already Nest physical — **cite pattern only**, not reuse table.

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01.md) | Option A/B/C · trade-off · **B LOCKED** · L-SI-INR-01..10 · F-SI-CAT-INS-* · AC/VAL matrix · DOC-DELTA pointers · ba-data **UNLOCK** · ba-process **UNLOCK** · BE HOLD |

**Không đụng:** `apps/**` · seed · flip printable/personnel · reopen SI-INS L1 · reopen CTR legal-print · reopen EMP/DEC/PAY/ATT/REC seals · fold into `si_insurance_type`.

---

## 3. Option summary

| Option | Verdict |
|--------|---------|
| **A** Settings MD `insurers` = sole picker SoT | **REJECT** — dual orphan vs sealed SI type Nest · PAY O4 class |
| **B** Nest `si_insurer` via F-SI-CAT-INS-01 / INS-02 / INS-EFF-01 = code SoT; consumer picker when ≠ empty; admin CREATE open N+1; invent → `HRM-INS-INSURER-KEY`; Settings REF merge-read only | **LOCKED / CONFIRMED** |
| **C** Invent printable/personnel / reopen CTR·SI-type L1 / mega table / fold into type | **REJECT** |

**Weighted score:** A 70 · **B 105** · C 24.

---

## 4. AS-IS vs target (facts)

| Surface | AS-IS | Target Option B |
|---------|-------|-----------------|
| Insurer catalog physical | **None** (Settings MD only) | **ADD** `public.si_insurer` (`ICatalogRow`) |
| Policy assert | `settingsCatalogs` · `insurers` · `HRM-INS-INSURER-KEY` | Nest F-SI-CAT-INS-EFF-01 |
| FE picker | `catalogSearchPicker` Settings | Nest `…/insurers/effective` |
| SI type Nest | L1 sealed F-SI-CAT-TYP/EFF | **SEPARATE** · FORBIDDEN fold / reopen |
| Enrollment SoT | `employee_insurances` | **must_keep RETAIN** |
| ATT work-sites | Nest GPS sites | Pattern cite only · **≠** this table |

---

## 5. F.1 API map (locked)

| Cap | ID | Path (target) |
|-----|-----|---------------|
| List | **F-SI-CAT-INS-01** | `GET /api/hrm/contracts-insurance/insurers` |
| Admin open N+1 | **F-SI-CAT-INS-02** | POST/PUT/retire |
| Effective picker | **F-SI-CAT-INS-EFF-01** | `GET …/insurers/effective` |
| Consumer invent | — | **4xx** `HRM-INS-INSURER-KEY` when EFF>0 ∧ key ∉ EFF |

**Admin open N+1 ≠ consumer invent** (L-SI-INR-01).

---

## 6. Gates

| Gate | Status |
|------|--------|
| ba-process AC pack | **UNLOCK** → `…-SI-INSURER-CATALOG-BA-01` |
| ba-data physical | **UNLOCK** → ADD `si_insurer` (Nest absent) |
| BE | **HOLD** until BA + DATA CONFIRMED |
| FE | After BE — EFF Nest rebind |
| SI type L1 / CTR / enrollment / printable | **RETAIN / DENIED flip** |

---

## 7. Explicit OUT (this seat)

| OUT | Rule |
|-----|------|
| Fold into SI type seat | **FORBIDDEN** |
| Reopen SI-INS L1 GWC | **FORBIDDEN** |
| Reopen CTR legal-print | **FORBIDDEN** |
| Flip printable / personnel | **FORBIDDEN** |
| Invent module SI/CTR UAT / Phase1 | **FORBIDDEN** |
| Mega-EAV / second type table | **FORBIDDEN** |

---

## completion_report

### Closed

1. F.1 Option pack for **insurers Nest open catalog** complete (docs-only).
2. **Option B CONFIRMED / LOCKED** — ADD `public.si_insurer` · F-SI-CAT-INS-01/02/EFF-01 · dual SoT Settings REF · admin open ≠ consumer invent · KEY `HRM-INS-INSURER-KEY`.
3. Options A (MD sole) and C (invent UAT / fold / reopen) **REJECTED** with trade-off matrix.
4. DOC-DELTA pointers locked for API_DESIGN (F-SI-CAT-INS-*) and DB_DESIGN §3.6b — **no wipe**.
5. ba-data **UNLOCK** · ba-process **UNLOCK** · BE **HOLD**.
6. Honesty false · SI type L1 + CTR legal-print + enrollment seals **RETAIN** · `C-SLICE-≠-MODULE`.
7. No `apps/**` · no seed.

### Residual

- ba-process must deepen AC-PLT-SI-INSURER-01* + consumer UF inventory (policy / optional records).
- ba-data must physicalize `si_insurer` ADD-plan (parallel OK).
- BE/FE not unlocked this seat.
- R-PLT-DATA-04 insurers Nest residual → close on DATA CONFIRMED (type slice already closed).

---

## next_owner

**pm** → **ba-process** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01` (AC pack) · optional parallel **ba-data** `…-SI-INSURER-CATALOG-DATA-01`

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01
from_role: pm
to_role: ba-process
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01 Option B CONFIRMED
ref_sa: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01.md
ref_evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-sa-01.md
peer_ba: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01 (type — do not reopen L1)

## entry_criteria
- SA Option B LOCKED — Nest si_insurer DEFINE · F-SI-CAT-INS-01/02/EFF-01 · admin open ≠ consumer invent
- Honesty: contracts_printable_ready=false · hrm_personnel_uat_ready=false · C-SLICE-≠-MODULE
- SEAL RETAIN: SI-INS L1 type GWC · CTR legal-print · enrollment EMP-BE-02 · EMP/DEC/PAY/ATT/REC/EXT/LIST-TOTALS
- Read: SA-01 insurers · peer SI-INS-CATALOG-BA-01 · E3 AC-INS-02 · BR-PLT-02/05/06

## task (governance only — NO apps/**)
Confirm AC pack AC-PLT-SI-INSURER-01 / 01b / 01c / 01d / 01H + VAL-SI-INR-CNS-*:
- Consumers: policy insurer_key picker when EFF>0; invent → HRM-INS-INSURER-KEY; optional records soft key enumerate
- Admin F-SI-CAT-INS-02 open N+1 ≠ consumer invent
- Settings MD alone REJECT as sole SoT
- Cross-ref AC-INS-02 · J-HRM-INS-E3-01 deepen (insurer path) — type SoT remain separate sealed
- Explicit OUT: fold into SI type · reopen SI-INS L1 · reopen CTR print · flip printable/personnel · module SI UAT
- Unlock ba-data parallel OK; BE HOLD until BA+DATA
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-ba-01.md
- Spec: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01.md

## cấm
apps/** · seed · flip ready flags · invent module SI/CTR UAT · reopen SI-INS L1 · reopen CTR legal-print · fold insurers into si_insurance_type · Phase1 DONE

## exit
CONFIRMED AC pack · or HOLD-WITH-RATIONALE · PASS_TO_PM · completion_report · next_owner · next_dispatch_prompt · evidence_path · ack_status
```

---

## evidence_path

`docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-sa-01.md`

## ack_status

**PASS_TO_PM**

## contracts_printable_ready

**false**

## hrm_personnel_uat_ready

**false**

## C-SLICE-≠-MODULE

**RETAIN**
