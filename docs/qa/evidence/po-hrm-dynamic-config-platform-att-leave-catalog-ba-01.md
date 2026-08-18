# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — AC pack Option B (admin open N+1 vs consumer picker when Nest EFF ≠ empty) |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01` CONFIRMED Option **B** |
| **ref_sa** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md) |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-att-leave-catalog-sa-01.md`](po-hrm-dynamic-config-platform-att-leave-catalog-sa-01.md) |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md) |
| **Verdict** | **CONFIRMED** |
| **ack_status** | `PASS_TO_PM` |
| **change_mode** | ADD · docs-only · **no** `apps/**` · **no** seed |
| **U65** | zero-seed · browser AC measurable |
| **OS honesty** | `C-SLICE-≠-MODULE` · `attendance_uat_ready=false` · DENY leave WAIVE / sign / J-HRM-06c reopen · DENY reopen EMP·DEC·PAY·EXT·CTR·LIST-TOTALS · DENY module ATT UAT |

### Honesty locks (mandatory)

| Flag | Value | BA note |
|------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **Leave WAIVE / LV-02 / WAIVE_L2 / J-HRM-06c / sheet-sign** | **SEAL RETAIN** | **cấm reopen** without warrant |
| **ATT-QC-01 L1 · ATT-QC-02 browser** | **SEAL RETAIN** | AC-PLT-ATT-01..02 retained; **01d** = admin open stamp |
| **EMP · DEC · PAY · EXT · CTR · LIST-TOTALS** | **SEAL RETAIN** | **cấm reopen** |
| **Module ATT UAT / Phase1** | **DENIED** | Slice AC ≠ module GO |
| **ba-data EXPAND** | **HOLD** · **no EXPAND** | Physical `att_leave_type` already exists |
| **Seed** | **DENIED** (U65) | |
| **Settings-MD-only picker SoT** | **DENIED** | Option A REJECT retained |

---

## 1. spec_read_ack

| Artifact | Used |
|----------|------|
| SA Option B | `ATT-LEAVE-CATALOG-SA-01` L-ATT-LEAVE-01..10 · §7 AC/VAL matrix |
| ATT vertical F.1 | `ATT-VERTICAL-SA-01` F-ATT-CAT-LVT/EFF · **AC-PLT-ATT-01..03** |
| Platform BA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01` **BR-PLT-02/04/05/06** · ATT §2.3 |
| Peer PAY BA | `PAY-CATALOG-BA-01` **AC-PLT-PAY-01*** admin≠consumer pattern |
| SRS | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-04/04b/05/05b/06/07/08/09** |
| DB | `DB_DESIGN_HRM_ENTERPRISE.md` §4.4 `att_leave_type` |
| Nest AS-IS | `AttLeaveTypeService` · `leave-requests` → `HRM-LEAVE-TYPE-UNKNOWN` · LeaveTab `useAttLeaveTypesEffective` · Settings `AttLeaveTypeSettingsPanel` |
| Prior seals | ATT-QC-01/02 · leave WAIVE / J-HRM-06c |

**Không đụng:** `apps/**` · seed · flip ready · reopen WAIVE/sign/J-06c · reopen peer seals · ba-data second table.

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md) | Objective · AS-IS/TO-BE · BR-PLT-ATT-LEAVE-01..10 · surface matrix S-ATT-ADM/CNS/REF/OUT · UC catalog · AC-PLT-ATT-LEAVE-01/01b/01c/01d/01H (+05b/09/07) · VAL-ATT-CNS-01..05 · error taxonomy · honesty · handoff |

---

## 3. AC pack summary (machine-readable)

| ID | Intent | Pass signal |
|----|--------|-------------|
| **AC-PLT-ATT-LEAVE-01** | Consumer create picker from EFF when active ≥1 | GET F-ATT-CAT-EFF-01 · 2xx · F5 type ∈ catalog |
| **AC-PLT-ATT-LEAVE-01b** | Invent unknown on create | **4xx** `HRM-LEAVE-TYPE-UNKNOWN` · no F5 persist · ≡ **AC-PLT-ATT-03** |
| **AC-PLT-ATT-LEAVE-01c** | EFF active =0 | Empty picker + CTA admin · no fake/seed · admin CREATE still OK |
| **AC-PLT-ATT-LEAVE-01d** | Admin CREATE open N+1 | **2xx/201** F-ATT-CAT-LVT-02 · F5 · ATT-QC-02 retain · no «must pick only» |
| **AC-PLT-ATT-LEAVE-01H** | Honesty / seals | ready=false · WAIVE/sign/J-06c retain · seals retain · C-SLICE |
| **AC-PLT-ATT-LEAVE-05b** | Balance panel bind | Panel theo loại picker · FR-UC-BP-ATT-05b |
| **AC-PLT-ATT-LEAVE-09** | Hold on submit | Hold after assert · invent no hold · FR-UC-BP-ATT-09 |
| **AC-PLT-ATT-LEAVE-07** | Sick class | Type ∈ EFF · invent UNKNOWN ≠ attach VAL · FR-UC-BP-ATT-07 |
| **VAL-ATT-CNS-01** | Create OOS | 4xx UNKNOWN · **BE RETAIN** |
| **VAL-ATT-CNS-02** | Balance/hold invent | 4xx or picker-only · same TXN |
| **VAL-ATT-CNS-03** | Scope drift | jest FAIL / 409 |

### Surface split (L-ATT-LEAVE-01)

| Class | Surf IDs |
|-------|----------|
| **ADMIN** | S-ATT-ADM-01 (Settings Loại phép ATT) |
| **CONSUMER** | S-ATT-CNS-01 create · S-ATT-CNS-03 hold · S-ATT-CNS-04 sick |
| **CONSUMER-READ** | S-ATT-CNS-02 balance panel |
| **REF only** | S-ATT-REF-01 Settings MD / group REF |
| **OUT / RETAIN** | S-ATT-OUT-01 WAIVE/sign/J-06c · S-ATT-OUT-02 sites/shifts |

### Cross-ref

| ID | Relation |
|----|----------|
| **AC-PLT-ATT-01** | RETAIN ≡ deepen stamp **01d** |
| **AC-PLT-ATT-02** | RETAIN retire/history |
| **AC-PLT-ATT-03** | ≡ **01b** invent 4xx (L1 SEAL + browser) |
| **AC-PLT-PAY-01*** | Named peer pattern |

### Proposed journeys (ba-docs)

- `J-HRM-ATT-LEAVE-CAT-01` · `02` · `03` · `04`
- Reuse J-HRM-06 / J-HRM-06c / WAIVE **RETAIN** (no reopen / no UAT flip)

### Gates

| Gate | Status |
|------|--------|
| ba-data physicalize | **HOLD** · **no EXPAND** |
| BE consumer assert | **RETAIN** create assert · deepen **only** if QA FAIL gap |
| FE picker | LeaveTab EFF **RETAIN** (verify Network) · rebind only if MD sole |
| ATT UAT / WAIVE reopen | **DENIED** |
| ba-docs DOC-DELTA | **OPTIONAL** (§9 spec) |

---

## 4. Quality gates (BA-process)

| Check | Result |
|-------|--------|
| Admin ≠ consumer split measurable | **PASS** |
| Enumerate create · balance 05b · hold 09 · sick 07 | **PASS** |
| AC-PLT-ATT-LEAVE-01/01b/01c/01d/01H · VAL-ATT-CNS-01..03 | **PASS** |
| Cross-ref AC-PLT-ATT-01..03 · peer AC-PLT-PAY-01 · SRS FR-UC-BP-ATT-04..09 | **PASS** |
| DENY UAT flip · WAIVE reopen · Settings-MD-only SoT · seed | **PASS** |
| ba-data HOLD · no apps/** · honesty false | **PASS** |
| Exception/error paths on every consumer UC | **PASS** |
| Align 01b ≡ AC-PLT-ATT-03 (no conflicting rules) | **PASS** |

---

## 5. completion_report

**Closed:** Docs-only AC pack **CONFIRMED** for Option **B**: Nest `att_leave_type` via **F-ATT-CAT-LVT-01 / F-ATT-CAT-EFF-01** = leave-type SoT; **admin** CREATE remains open N+1 (**AC-PLT-ATT-LEAVE-01d** · **BR-PLT-ATT-LEAVE-01** · ATT-QC-02 retain); **consumers** (Nghỉ phép create · balance panel FR-UC-BP-ATT-05b · hold FR-UC-BP-ATT-09 · sick FR-UC-BP-ATT-07) when EFF active >0 must picker/FK (**AC-PLT-ATT-LEAVE-01** · invent → **`HRM-LEAVE-TYPE-UNKNOWN`** as **01b** ≡ **AC-PLT-ATT-03** · **VAL-ATT-CNS-01..02**); empty EFF = empty picker no seed (**01c**); Settings MD **not** sole SoT; honesty `attendance_uat_ready=false` + WAIVE/sign/J-06c + peer seals **RETAIN** (**01H**); ba-data **HOLD** no EXPAND; leave create BE assert **RETAIN** (no mandatory CNS-BE); FE LeaveTab EFF **RETAIN** pending QA Network proof; no `apps/**`.

**Residual:** QA U65 browser stamp AC-PLT-ATT-LEAVE-01* (+05b/09/07 spot) → QC slice GWC · **C-SLICE-≠-MODULE** — **not** module ATT UAT / WAIVE reopen; BE/FE Task only if QA finds invent 2xx or MD-only SoT.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** `qa`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01 CONFIRMED
program: PO-HRM-CONTINUOUS-W8-20260807
change_mode: ADD
ref_ba: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md
ref_sa: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md
ref_evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-catalog-ba-01.md

## task
U65 browser AC pack (zero-seed · FE after 2xx/4xx + F5 · probe ≠ 🟢 UF):
- AC-PLT-ATT-LEAVE-01: Nghỉ phép create — picker Network GET /attendance/leave-types/effective when EFF≥1 · 2xx · F5 type ∈ catalog
- AC-PLT-ATT-LEAVE-01b: invent unknown leave_type → 4xx HRM-LEAVE-TYPE-UNKNOWN · no persist/hold (≡ AC-PLT-ATT-03)
- AC-PLT-ATT-LEAVE-01c: EFF=0 empty picker + CTA admin · no fake/seed · admin CREATE still OK
- AC-PLT-ATT-LEAVE-01d: Settings Loại phép ATT CREATE N+1 open · ATT-QC-02 RETAIN (spot, no wipe)
- AC-PLT-ATT-LEAVE-01H: attendance_uat_ready=false · WAIVE/sign/J-HRM-06c SEAL RETAIN · C-SLICE-≠-MODULE
- Spot: AC-PLT-ATT-LEAVE-05b panel · 09 hold · 07 sick type ∈ EFF
- VAL-ATT-CNS-04: FAIL if picker SoT = Settings MD alone when EFF>0
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-catalog-qa-01.md

## entry
BA CONFIRMED · LeaveTab EFF bind AS-IS · BE create assert RETAIN · L0 stack up if needed
## exit
PASS_TO_PM or FAIL_TO_PM with residual owner · stamp AC table · honesty false
## must_keep / cấm
no seed · no apps/** invent · no attendance_uat_ready flip · no WAIVE/sign/J-06c reopen · no reopen EMP/DEC/PAY/EXT/CTR/LIST-TOTALS · DENY module ATT UAT
```

---

## 7. Handoff contract

| Field | Value |
|-------|--------|
| **completion_report** | §5 above |
| **next_owner** | **qa** (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-QA-01`) |
| **next_dispatch_prompt** | §6 copy-ready |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-catalog-ba-01.md` |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **ba-data** | **HOLD** |
| **BE** | RETAIN create assert · deepen only on QA FAIL |
