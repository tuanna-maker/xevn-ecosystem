# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — **ATT leave balance / accrual rule schema AC pack only** · **not** leave-type L1 reopen · **not** module ATT UAT · **not** engine LIVE |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01` **CONFIRMED** Option **B** |
| **Verdict** | **CONFIRMED** — AC pack `AC-PLT-ATT-LEAVE-BAL-01/01b/01c/01d/01e/01f/01g/01H` + `VAL-ATT-LVRULE-CNS-*` implementation-ready |
| **ack_status** | `PASS_TO_PM` |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01.md) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md) |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-att-leave-balance-sa-01.md`](./po-hrm-dynamic-config-platform-att-leave-balance-sa-01.md) |
| **peer_cite** | ATT-LEAVE-CATALOG-BA-01 type invent **RETAIN** · OWN **BR-PLT-ATT-LEAVE-08** residual · PAY engine HOLD **cite** · EMP-STATUS/SI-INS Nest DEFINE **cite ≠ copy** |
| **U65** | zero-seed · docs-only · **no** `apps/**` · **no** `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — rule schema AC ≠ attendance module UAT / Phase1 / flip ready / aggregate rewrite / leave-type L1 reopen / engine LIVE |

### Honesty locks (mandatory)

| Flag | Value | BA note |
|------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote |
| Accrue engine LIVE (F-ATT-LEAVE-04) | **HOLD / OUT** | schema AC ≠ engine GO |
| ATT leave-type L1 | **SEAL RETAIN** | **cấm reopen** invent KEY seats · type invent **`HRM-LEAVE-TYPE-UNKNOWN`** |
| ATT-CODE `ATTCODEQA-MSK4T1A5` | **SEAL RETAIN** | **cấm reopen** L1 · FE HOLD **RETAIN** (do not invent) |
| ATT worksite | **SEAL RETAIN** | **cấm reopen** |
| ATT-SHIFT `ATTSHIFTQA-MSK5FXP3` | **SEAL RETAIN** | L1 retain · CNS-02 FE Condition **RETAIN** (do not invent) |
| Leave WAIVE / sign / **J-HRM-06c** | **SEAL RETAIN** | **cấm reopen** |
| EMP / SI / CTR / PAY / LIST-TOTALS / aggregate GĐ1 | **SEAL RETAIN** | **FORBIDDEN** rewrite aggregate |
| Face / device | **DENIED** | OUT |
| Settings-sole / `attendance_rules` sole rule | **DENIED** | Option A REJECT |
| Mega-EAV | **DENIED** | Q-PLT-03 |
| Seed | **DENIED** (U65) | empty CTA OK |
| Module ATT UAT / Phase 1 DONE | **DENIED** | Slice ≠ module seal |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | rule schema ≠ module ATT UAT |

---

## Verdict summary

**CONFIRMED AC pack** from SA Option B stubs:

| Lock | CONFIRMED |
|------|-----------|
| Nest `att_leave_accrual_policy` versioned = **rule SoT** (DEFINE · bound `leave_type_key` ∈ EFF) | 🟢 |
| Admin CREATE **N+1** ≠ consumer invent **`HRM-ATT-LVRULE-KEY`** | 🟢 |
| Type invent **`HRM-LEAVE-TYPE-UNKNOWN`** **RETAIN** (≠ reopen leave-type L1) | 🟢 |
| Engine F-ATT-LEAVE-04 accrue LIVE = **HOLD** | 🟢 |
| Empty CTA / soft-retire / display-ready / no seed | 🟢 |
| Panel types ⊆ EFF/policy-bound when catalog>0 (**01g**) | 🟢 |
| DENY Face · aggregate · mega-EAV · Settings-sole · flip ready · invent FE HOLDs · reopen CODE/WS/SHIFT L1 | 🟢 |
| Surface / UF / proposed J-HRM-ATT-LVRULE-* inventory | 🟢 |
| Cross-ref ATT-LEAVE AC-PLT-ATT-LEAVE-01* **RETAIN** · OWN BR-PLT-ATT-LEAVE-08 | 🟢 |
| ba-data **UNLOCK** parallel · BE **HOLD** until BA+DATA | 🟢 |

Docs-only — **no** `apps/**`.

| Gate item | Evidence | BA |
|-----------|----------|-----|
| SA Option B LOCKED | SA-01 + evidence | 🟢 cite |
| AC-PLT-ATT-LEAVE-BAL-01 | Spec §6.1 bind/resolve Nest F-ATT-LVRULE | 🟢 |
| AC-PLT-ATT-LEAVE-BAL-01b | Invent → `HRM-ATT-LVRULE-KEY` | 🟢 |
| AC-PLT-ATT-LEAVE-BAL-01c | Empty CTA no seed | 🟢 |
| AC-PLT-ATT-LEAVE-BAL-01d | Admin N+1 open | 🟢 |
| AC-PLT-ATT-LEAVE-BAL-01e | Soft-retire | 🟢 |
| AC-PLT-ATT-LEAVE-BAL-01f | Type UNKNOWN RETAIN | 🟢 |
| AC-PLT-ATT-LEAVE-BAL-01g | Panel types kill MVP-sole | 🟢 |
| AC-PLT-ATT-LEAVE-BAL-01H | Honesty / seals / C-SLICE | 🟢 |
| VAL-ATT-LVRULE-CNS-01..11 | Spec §6.2 | 🟢 |
| UF/J-* enumerate | Spec §4 · §6.4 | 🟢 |
| Column matrix handoff | Spec §9 → ba-data | 🟢 |
| Honesty / C-SLICE | false · RETAIN | 🟢 |
| Spec + evidence non-empty | both files | 🟢 |

**Cấm:** invent `attendance_uat_ready=true` · invent `payroll_e2e_ready=true` · claim module ATT UAT / Phase1 · reopen ATT-LEAVE/CODE/WS/SHIFT L1 · invent FE HOLDs · Face/device · aggregate rewrite · seed · Settings sole rule SoT · mega-EAV · second leave-type table · claim accrue engine LIVE · unlock BE before DATA CONFIRMED.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true`? | **NO** |
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM reopen ATT-LEAVE / CODE / WS / SHIFT L1? | **NO** |
| May PM invent FE Tasks for ATT-CODE FE / ATT-SHIFT CNS-02 as mandatory from this seat? | **NO** — HOLDs **RETAIN** |
| May PM claim accrue engine / formula LIVE GO? | **NO** |
| May PM unlock BE now? | **YES** — **BA CONFIRMED** (this) **and** peer **DATA-01 CONFIRMED** (parallel seat on disk) |
| May PM seal ATT-LEAVE-BALANCE Option B **AC pack**? | **YES** — this seat CONFIRMED |
| Why | Nest rule schema AC measurable · admin≠consumer · type invent RETAIN · engine HOLD · seals retained · `C-SLICE-≠-MODULE` · DATA physical ADD locked |
| Recommended flag state | keep **`attendance_uat_ready=false`** · **`payroll_e2e_ready=false`** |
| Forced residual dispatch this turn? | **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-01` (both BA+DATA CONFIRMED) |

---

## AC confirmation matrix (SA stub → BA)

| SA stub | BA status | Measurable PASS | FAIL |
|---------|-----------|-----------------|------|
| **01** | **CONFIRMED** | Nest F-ATT-LVRULE bind · display-ready · F5 | Settings/`attendance_rules` sole · free-text rule SoT |
| **01b** | **CONFIRMED** | 4xx `HRM-ATT-LVRULE-KEY` | 2xx invent |
| **01c** | **CONFIRMED** | Empty CTA · no seed · admin CREATE OK | Seed density |
| **01d** | **CONFIRMED** | Admin N+1 2xx · F5 · orphan type 4xx | Admin treated as invent |
| **01e** | **CONFIRMED** | Soft-retire hide · history OK | Hard-delete |
| **01f** | **CONFIRMED** | `HRM-LEAVE-TYPE-UNKNOWN` RETAIN | Reopen L1 / conflate KEY |
| **01g** | **CONFIRMED** | Panel types ⊆ EFF/policy-bound | MVP-five sole SoT |
| **01H** | **CONFIRMED** | Honesty false · seals · engine HOLD · C-SLICE | Flip / reopen / invent FE HOLD / engine GO |
| **VAL-ATT-LVRULE-CNS-*** | **CONFIRMED** | Spec §6.2 CNS-01..11 | Collapsed admin/consumer · scope drift · engine claim |

---

## Surface / UF inventory (authoritative excerpt)

| Surf | Class | AC |
|------|-------|-----|
| S-ATT-LVRULE-ADM-01/02 | ADMIN | 01 / 01d / 01e |
| S-ATT-LVRULE-CNS-01 leave create | CONSUMER | 01b (if gated) · **01f** type RETAIN |
| S-ATT-LVRULE-CNS-02 panel | CONSUMER-READ | **01g** |
| S-ATT-LVRULE-CNS-03 hold | CONSUMER | with 01f/01b gates |
| S-ATT-LVRULE-CNS-04 grant/adjust | CONSUMER | **01b** primary invent |
| S-ATT-LVRULE-CNS-05 accrue job | ENGINE HOLD | **OUT LIVE** |
| OUT CODE/WS/SHIFT/WAIVE/Face/agg/FE HOLDs | OUT RETAIN | **01H** |

Proposed journeys: **J-HRM-ATT-LVRULE-01..06** · reuse UF-HRM-05 / J-HRM-06* **RETAIN**.

---

## ba-data / BE gates

| Gate | Status |
|------|--------|
| ba-data | **CONFIRMED** peer `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-DATA-01` (parallel — evidence on disk) |
| BE | **UNLOCK** for PM dispatch — entry = BA CONFIRMED **+** DATA CONFIRMED |
| FE | After BE — **no** invent FE HOLDs |

---

## Explicit OUT checklist

- [x] Face/device  
- [x] Aggregate rewrite  
- [x] ATT-CODE fold / reopen L1  
- [x] ATT-WS / ATT-SHIFT L1 reopen  
- [x] Leave-type L1 invent KEY reopen  
- [x] Invent FE HOLDs  
- [x] Seed  
- [x] Flip ready  
- [x] Accrue engine LIVE as this AC  
- [x] Mega-EAV / Settings-sole  
- [x] Module ATT UAT / Phase1  

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Closed: docs-only CONFIRMED AC pack for leave balance/accrual **rule schema** Option B — Nest `att_leave_accrual_policy` rule SoT; admin N+1 ≠ invent `HRM-ATT-LVRULE-KEY`; type invent `HRM-LEAVE-TYPE-UNKNOWN` RETAIN; empty CTA/soft-retire/display-ready/01g panel; F-ATT-LEAVE-04 engine LIVE HOLD; UF/J-* + VAL-ATT-LVRULE-CNS-* locked; seals/FE HOLDs/honesty retained; OWN BR-PLT-ATT-LEAVE-08 residual; peer DATA-01 already CONFIRMED; BE unlockable; no `apps/**`. Residual: PM → BE-01. |
| **next_owner** | **pm** → **dev-be** (BA+DATA both CONFIRMED) |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-ba-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: ATT-LEAVE-BALANCE-BA-01 CONFIRMED + ATT-LEAVE-BALANCE-DATA-01 CONFIRMED
change_mode: ADD
entry_criteria:
- BA CONFIRMED: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01.md · evidence po-hrm-dynamic-config-platform-att-leave-balance-ba-01.md
- DATA CONFIRMED: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-DATA-01.md · evidence po-hrm-dynamic-config-platform-att-leave-balance-data-01.md
- SA Option B: Nest att_leave_accrual_policy DEFINE
- Honesty: attendance_uat_ready=false · payroll_e2e_ready=false · C-SLICE-≠-MODULE · U65
- RETAIN: att_leave_type L1 · ATTCODEQA-MSK4T1A5 · ATT-WS · ATTSHIFTQA-MSK5FXP3 · FE HOLDs · type invent HRM-LEAVE-TYPE-UNKNOWN
task:
- Implement F-ATT-LVRULE-01..04 + F-ATT-LVRULE-CNS-01 per BA/SA/DATA
- ensureSchema att_leave_accrual_policy per DATA-01 physical plan
- Admin CREATE N+1 open ≠ consumer invent → 400 HRM-ATT-LVRULE-KEY
- Soft-retire · resolve · scope_parity · display-ready
- Panel type source deepen vs MVP_LEAVE_BALANCE_TYPES sole (01g) — BE display-ready fields
- RETAIN leave-type UNKNOWN assert — cấm reopen L1 invent seats
- F-ATT-LEAVE-04 accrue engine LIVE = HOLD (outline only — cấm claim GO)
FORBIDDEN:
apps outside allowed_paths · seed · flip ready · reopen ATT-LEAVE/CODE/WS/SHIFT L1 · invent FE HOLDs · Face · aggregate rewrite · mega-EAV · Settings-sole · claim engine LIVE · module ATT UAT
exit:
READY_FOR_QA · jest VAL-ATT-LVRULE-CNS-* · evidence path · completion_report · next_dispatch_prompt qa
```
