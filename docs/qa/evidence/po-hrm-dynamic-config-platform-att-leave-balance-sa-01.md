# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — **ATT leave balance / accrual rule schema Option B DEFINE only** · **not** leave-type L1 reopen · **not** module ATT UAT |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | U88 after ATT-SHIFT-CATALOG QC GWC + DOCS-01 ACCEPT · BA-01 §2.1 Leave types / balance rules GĐ1 deepen |
| **Verdict** | **CONFIRMED** — Option **B LOCKED** (Nest versioned `att_leave_accrual_policy` = rule SoT · bound to sealed `att_leave_type` · Settings/`attendance_rules` ≠ sole · engine LIVE HOLD) |
| **ack_status** | `PASS_TO_PM` |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md) |
| **peer_cite** | ATT-LEAVE L1 Option B **SEAL RETAIN** · EMP-STATUS/SI-INS Nest-absent DEFINE **cite ≠ copy** · PAY catalog≠formula LIVE **cite** |
| **U65** | zero-seed · docs-only · **no** `apps/**` · **no** `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — rule schema ≠ attendance module UAT / Phase1 / flip ready / aggregate rewrite / leave-type L1 reopen |

### Honesty locks (mandatory)

| Flag | Value | SA note |
|------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote |
| ATT leave-type L1 | **SEAL RETAIN** | **cấm reopen** invent KEY seats |
| ATT-CODE `ATTCODEQA-MSK4T1A5` | **SEAL RETAIN** | **cấm reopen** L1 · FE HOLD **RETAIN** (do not invent) |
| ATT worksite | **SEAL RETAIN** | **cấm reopen** |
| ATT-SHIFT `ATTSHIFTQA-MSK5FXP3` | **SEAL RETAIN** | L1 retain · CNS-02 FE Condition **RETAIN** (do not invent) |
| EMP / SI / CTR / PAY / LIST-TOTALS / aggregate GĐ1 | **SEAL RETAIN** | **FORBIDDEN** rewrite aggregate |
| Accrue engine LIVE (F-ATT-LEAVE-04) | **HOLD / OUT** | schema ≠ engine GO |
| Module ATT UAT / Phase 1 DONE | **DENIED** | Slice ≠ module seal |
| Seed | **DENIED** (U65) | empty CTA OK |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | rule schema ≠ module ATT UAT |

---

## Verdict summary

**CONFIRMED Option B** — Leave **balance/accrual rule schema** is **Catalog + Schema** deepen (BA-01 §2.1), **not** a reopen of sealed Nest `att_leave_type` L1. Nest **`att_leave_accrual_policy` is ABSENT** in hrm-api while DB_DESIGN §4.4b + API F-ATT-LEAVE-04 outline already name ATT-owned policy → ledger.entitled. Ledger `employee_leave_balances` + GET leave-balance/panel are **LIVE**. `attendance_rules` = punch/GPS/standard days — **wrong sole SoT**. Settings `leave_types` remains **type REF** only (ATT-LEAVE locks).

**LOCK:** Nest versioned policy rows soft-FK `leave_type_key` → sealed EFF leave types; admin CREATE **N+1** ≠ consumer invent **`HRM-ATT-LVRULE-KEY`**; type invent remains **`HRM-LEAVE-TYPE-UNKNOWN`** (RETAIN); accrue engine LIVE **HOLD**; ba-data **UNLOCK**; ba-process **UNLOCK**; BE **HOLD** until BA+DATA.

**REJECT:** Option A Settings-sole · Option C hybrid/mega-EAV/reopen L1/invent FE HOLDs/flip ready/aggregate rewrite/engine LIVE as this AC.

Docs-only — **no** `apps/**`.

| Gate item | Evidence | SA |
|-----------|----------|-----|
| BA-01 §2.1 Catalog + Schema GĐ1 | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md` Leave types / balance rules | 🟢 |
| Leave-type L1 sealed OUT residual | ATT-LEAVE SA L-ATT-LEAVE · BA BR-PLT-ATT-LEAVE-08 / R3 accrual OUT | 🟢 OWN this seat |
| Nest policy ABSENT | grep hrm-api: no `att_leave_accrual_policy` CREATE/service | 🟢 DEFINE |
| Nest ledger LIVE | `leave-balance.service.ts` · `employee_leave_balances` · panel MVP hardcode | 🟢 ledger ≠ rule |
| `attendance_rules` ≠ accrual | `attendance-config.service.ts` punch/GPS/standard | 🟢 A REJECT |
| DB §4.4b / API F-ATT-LEAVE-04 | client-delivery DB_DESIGN + API_DESIGN outline | 🟢 cite |
| R-PLT-ATT-02 | ATT-VERTICAL residual accrual policy CRUD | 🟢 closes arch |
| Peer Nest-absent B | EMP-STATUS / SI-INS | 🟢 cite ≠ copy |
| Peer engine HOLD | PAY formula LIVE DENY | 🟢 cite |
| Option A REJECT | Settings-sole | 🟢 |
| Option C REJECT | hybrid / reopen / UAT / FE invent / agg / engine | 🟢 |
| Honesty / C-SLICE | false · RETAIN | 🟢 |
| Spec + evidence non-empty | both files | 🟢 |

**Cấm:** invent `attendance_uat_ready=true` · invent `payroll_e2e_ready=true` · claim module ATT UAT / Phase1 · reopen ATT-LEAVE/CODE/WS/SHIFT L1 · invent FE HOLDs · Face/device · aggregate rewrite · seed · Settings sole rule SoT · mega-EAV · second leave-type table · claim accrue engine LIVE from this seat.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true`? | **NO** |
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM reopen ATT-LEAVE / CODE / WS / SHIFT L1? | **NO** |
| May PM invent FE Tasks for ATT-CODE FE / ATT-SHIFT CNS-02 as mandatory from this seat? | **NO** — HOLDs **RETAIN** |
| May PM claim accrue engine / formula LIVE GO? | **NO** |
| May PM seal ATT-LEAVE-BALANCE Option B architecture? | **YES** — this seat CONFIRMED |
| Why | Nest-absent rule schema DEFINE · leave-type L1 retain · admin≠consumer · engine HOLD · `C-SLICE-≠-MODULE` |
| Recommended flag state | keep **`attendance_uat_ready=false`** · **`payroll_e2e_ready=false`** |
| Forced residual dispatch this turn? | **U88** — **ba-process** ATT-LEAVE-BALANCE-BA-01 **+** **ba-data** ATT-LEAVE-BALANCE-DATA-01 (UNLOCK) |

---

## AS-IS audit (facts)

| Layer | Finding | Class |
|-------|---------|-------|
| Leave type catalog | Nest `att_leave_type` + F-ATT-CAT-EFF · L1 GWC sealed | **SEAL RETAIN** (type SoT) |
| Accrual policy table | No Nest physical `att_leave_accrual_policy` | **ABSENT → DEFINE** |
| Balance ledger | `employee_leave_balances` entitled/used/pending LIVE | **RETAIN ledger** |
| Panel | GET leave-balance/panel · `MVP_LEAVE_BALANCE_TYPES` hardcode 5 | **Hardcode residual (panel types)** |
| Attendance rules | `attendance_rules` punch/GPS/standard days | **≠ accrual SoT** |
| Settings leave_types | Group REF merge into EFF | **REF type only** |
| Accrue job | F-ATT-LEAVE-04 outline · Q-LEAVE-ACCRUAL partial | **Engine HOLD** |
| Prior OUT | ATT-LEAVE pack stamped accrual policy admin OUT | **OWN this seat** |

---

## Option decision (summary)

| Option | Verdict |
|--------|---------|
| **A** Settings-sole | **REJECT** |
| **B** Nest `att_leave_accrual_policy` versioned · bound to `att_leave_type` | **LOCKED / CONFIRMED** |
| **C** Hybrid / mega-EAV / reopen L1 / invent FE HOLD / flip / aggregate / engine LIVE | **REJECT** |

### Invent KEY stamp

| Stamp | Use |
|-------|-----|
| **`HRM-ATT-LVRULE-KEY`** | Consumer invent policy_id / ad-hoc accrual params when active policy >0 |
| **`HRM-LEAVE-TYPE-UNKNOWN`** | Type invent — **RETAIN** (≠ this pack reopen) |

### ba-data

| Decision | **UNLOCK** |
|----------|------------|
| Why | Nest policy ABSENT (DEFINE class) |
| Scope | ADD `att_leave_accrual_policy` (+ optional ledger EXPAND) · **no** second leave-type table |

### Draft AC stubs delivered

`AC-PLT-ATT-LEAVE-BAL-01` / `01b` / `01c` / `01d` / `01e` / `01f` / `01g` / `01H` + VAL-ATT-LVRULE-CNS-01..03 — see spec §10.

### Explicit OUT checklist

- [x] Face/device  
- [x] Aggregate rewrite  
- [x] ATT-CODE fold / reopen  
- [x] Seed  
- [x] Flip ready  
- [x] Roster/shift reopen  
- [x] Leave-type L1 reopen  
- [x] Invent FE HOLDs  
- [x] Accrue engine LIVE as this AC  

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Closed: docs-only Option B LOCK for leave balance/accrual **rule schema** — Nest versioned `att_leave_accrual_policy` SoT bound to sealed `att_leave_type`; Settings/`attendance_rules` REJECT sole; invent `HRM-ATT-LVRULE-KEY`; type invent RETAIN `HRM-LEAVE-TYPE-UNKNOWN`; F-ATT-LVRULE-01..04 + CNS map; engine LIVE HOLD; ba-data UNLOCK; AC stubs drafted; seals/FE HOLDs/honesty retained; no `apps/**`. Residual: ba-process AC pack + ba-data physical + BE HOLD. |
| **next_owner** | **ba-process** (+ **ba-data** UNLOCK) |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-sa-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01
from_role: pm
to_role: ba-process
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01 CONFIRMED Option B
change_mode: ADD
no_code: true

## entry_criteria
- Read: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md (Option B LOCK · L-ATT-LVRULE-* · F-ATT-LVRULE-* · AC stubs §10)
- Read: docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-sa-01.md
- Read: PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md §2.1 Leave types / balance rules
- Read peer: ATT-LEAVE-CATALOG-BA-01 (type invent RETAIN · accrual was OUT — now OWN rules pack)
- Honesty: attendance_uat_ready=false · payroll_e2e_ready=false · C-SLICE-≠-MODULE · U65
- RETAIN: att_leave_type L1 · ATT-CODE ATTCODEQA-MSK4T1A5 · ATT-WS · ATT-SHIFT ATTSHIFTQA-MSK5FXP3 · FE HOLDs (ATT-CODE FE · ATT-SHIFT CNS-02) — cấm reopen L1 invent KEY seats

## task
Confirm AC pack AC-PLT-ATT-LEAVE-BAL-01/01b/01c/01d/01e/01f/01g/01H + VAL-ATT-LVRULE-CNS-* from SA stubs:
- Nest att_leave_accrual_policy versioned = rule SoT (bound leave_type_key ∈ EFF)
- Admin CREATE N+1 ≠ consumer invent HRM-ATT-LVRULE-KEY
- Type invent HRM-LEAVE-TYPE-UNKNOWN RETAIN (≠ reopen leave-type L1)
- Empty policy CTA no seed; soft-retire; engine LIVE HOLD (F-ATT-LEAVE-04)
- Enumerate UF surfaces; cross-ref ATT-LEAVE AC-PLT-ATT-LEAVE-01* RETAIN
- Parallel note: ba-data UNLOCK for DATA-01 (PM may dispatch same turn)

## FORBIDDEN
apps/** · seed · flip ready · reopen ATT-LEAVE/CODE/WS/SHIFT L1 · invent FE HOLDs · Face/device · aggregate rewrite · module ATT UAT · Phase1 · mega-EAV · claim accrue engine LIVE GO

## exit
CONFIRMED AC pack
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-ba-01.md
spec: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01.md
completion_report · next_owner ba-data (if not yet) or pm→dev-be HOLD · next_dispatch_prompt
ack_status PASS_TO_PM
```

**Parallel ba-data (UNLOCK) — copy-ready if PM dual-dispatch:**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-DATA-01
from_role: pm
to_role: ba-data
lane: governance
priority: P1
parent: ATT-LEAVE-BALANCE-SA-01 Option B · ba-data UNLOCK
change_mode: ADD
no_code: true

## task
Physicalize Nest public.att_leave_accrual_policy per DB_DESIGN §4.4b + SA L-ATT-LVRULE-* (version/effective · soft FK leave_type_key · soft-retire). Optional EXPAND employee_leave_balances carried_in/advanced if gap vs AS-IS. FORBIDDEN second att_leave_type · mega-EAV · wipe ledger · seed · flip ready.

## exit
CONFIRMED DATA · evidence + spec non-empty · PASS_TO_PM · next_owner pm (BE HOLD until BA+DATA)
```
