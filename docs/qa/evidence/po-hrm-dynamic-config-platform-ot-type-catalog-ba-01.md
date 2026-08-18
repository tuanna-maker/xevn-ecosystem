# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — **OT type open catalog AC pack only** · **not** module ATT/PAY UAT · **not** formula LIVE · **not** work_shifts reopen |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01` **CONFIRMED** Option **B** Nest `att_ot_type` DEFINE |
| **Verdict** | **CONFIRMED** — AC pack `AC-PLT-ATT-OT-01/01b/01c/01d/01e/01f/01H` + `VAL-ATT-OT-CNS-*` implementation-ready |
| **ack_status** | `PASS_TO_PM` |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BA-01.md) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01.md) |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-ot-type-catalog-sa-01.md`](./po-hrm-dynamic-config-platform-ot-type-catalog-sa-01.md) |
| **peer_cite** | ATT-SHIFT **S-ATT-SHIFT-CITE-01** OWN reverse · leave-balance Nest DEFINE cite ≠ copy · CTR KEY/clause **SEAL RETAIN** · FE LVRULE 01g **HOLD RETAIN** · PAY formula HOLD cite |
| **U65** | zero-seed · docs-only · **no** `apps/**` · **no** `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — OT type catalog AC ≠ attendance/payroll module UAT / Phase1 / flip ready / formula LIVE / SHIFT reopen |

### Honesty locks (mandatory)

| Flag | Value | BA note |
|------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote · default_coefficient ≠ formula LIVE |
| **`contracts_printable_ready`** | **`false`** | **DENIED** invent / promote |
| CTR-TEMPLATE KEY LIVE / CTR-CLAUSE `body_vi` | **SEAL RETAIN** | **cấm reopen** |
| ATT leave-balance / FE LVRULE 01g HOLD | **HOLD RETAIN** | **DENY invent FE** |
| ATT-CODE / WS / SHIFT / leave L1 | **SEAL RETAIN** | **cấm reopen** · SHIFT orthogonal OWN |
| EMP / SI / PAY / DEC / MergeToken | **SEAL RETAIN** | **cấm reopen** |
| Face / device LIVE | **DENIED** | OUT |
| Settings/D4 sole SoT | **DENIED** | Option A REJECT |
| Mega-EAV / fold into work_shifts | **DENIED** | Q-PLT-03 · L-ATT-OT-08 |
| Seed | **DENIED** (U65) | empty CTA OK |
| Module ATT/PAY UAT / Phase 1 DONE | **DENIED** | Slice ≠ module seal |
| Formula LIVE | **DENIED** | HOLD forever this seat alone |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | catalog AC ≠ module GO |

---

## Verdict summary

**CONFIRMED AC pack** from SA Option B stubs:

| Lock | CONFIRMED |
|------|-----------|
| Nest `att_ot_type` DEFINE = **catalog SoT** (Settings/D4 REF only) | 🟢 |
| Admin CREATE **N+1** ≠ consumer invent **`HRM-ATT-OT-TYPE-KEY`** when EFF>0 | 🟢 |
| `OvertimeRequestTab` bind Nest when EFF>0 · hardcode weekday\|weekend\|holiday **only** EFF=0 | 🟢 |
| Empty CTA · soft-retire · display-ready · no seed | 🟢 |
| `default_coefficient` display-ready · **FORBIDDEN** claim payroll formula LIVE (**01f**) | 🟢 |
| OUT: work_shifts reopen · formula LIVE · Face · mega-EAV · flip ready · Settings sole · invent FE HOLDs · CTR/ATT L1 reopen | 🟢 |
| Surface / UF / proposed J-HRM-ATT-OT-* / UF-HRM-ATT-OT-* inventory | 🟢 |
| ba-data **UNLOCK** parallel · BE **HOLD** until BA+DATA | 🟢 |

Docs-only — **no** `apps/**`.

| Gate item | Evidence | BA |
|-----------|----------|-----|
| SA Option B LOCKED | SA-01 + evidence | 🟢 cite |
| AC-PLT-ATT-OT-01 | Spec §6.1 bind Nest OvertimeRequestTab | 🟢 |
| AC-PLT-ATT-OT-01b | Invent → `HRM-ATT-OT-TYPE-KEY` | 🟢 |
| AC-PLT-ATT-OT-01c | Empty CTA no seed · hardcode bootstrap only EFF=0 | 🟢 |
| AC-PLT-ATT-OT-01d | Admin N+1 open (starter three ≠ ceiling) | 🟢 |
| AC-PLT-ATT-OT-01e | Soft-retire | 🟢 |
| AC-PLT-ATT-OT-01f | Coeff display-ready · formula HOLD | 🟢 |
| AC-PLT-ATT-OT-01H | Honesty / seals / C-SLICE | 🟢 |
| VAL-ATT-OT-CNS-01..10 | Spec §6.2 | 🟢 |
| UF/J-* enumerate | Spec §4 · §6.4 | 🟢 |
| Honesty / C-SLICE | false · RETAIN | 🟢 |
| Spec + evidence non-empty | both files ≥3KB | 🟢 (cite sizes below) |

**Cấm:** invent `attendance_uat_ready=true` · invent `payroll_e2e_ready=true` · invent `contracts_printable_ready=true` · claim module ATT/PAY UAT / Phase1 · reopen CTR/ATT L1 / work_shifts · invent FE LVRULE · Face · seed · Settings sole · mega-EAV · claim formula LIVE · unlock BE before DATA CONFIRMED.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true`? | **NO** |
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM set `contracts_printable_ready=true`? | **NO** |
| May PM claim OT `default_coefficient` = payroll formula LIVE? | **NO** |
| May PM reopen CTR KEY / clause / ATT L1 / work_shifts / invent FE LVRULE? | **NO** |
| May PM unlock BE now? | **NO** — wait **DATA-01 CONFIRMED** (BA alone insufficient) |
| May PM seal OT-TYPE-CATALOG Option B **AC pack**? | **YES** — this seat CONFIRMED |
| Why | Nest DEFINE AC measurable · admin≠consumer · hardcode bootstrap only empty · formula HOLD · seals retained · `C-SLICE-≠-MODULE` · ba-data UNLOCK parallel |
| Recommended flag state | keep **all three honesty flags `false` LOCKED** |
| Forced residual dispatch this turn? | If DATA not yet CONFIRMED → ensure **ba-data** `OT-TYPE-CATALOG-DATA-01`; **after DATA** → **dev-be** (see `next_dispatch_prompt`) |

---

## AC confirmation matrix (SA stub → BA)

| SA stub | BA status | Measurable PASS | FAIL |
|---------|-----------|-----------------|------|
| **01** | **CONFIRMED** | Nest EFF≥1 · OvertimeRequestTab picker Network GET ot-types · 2xx · F5 | Settings/D4 sole · free invent hardcode succeed when EFF>0 |
| **01b** | **CONFIRMED** | 4xx `HRM-ATT-OT-TYPE-KEY` · no persist | 2xx invent · wrong KEY (SHIFT/LEAVE/CTR/LVRULE) |
| **01c** | **CONFIRMED** | Empty CTA · invent skip · no seed · hardcode three only EFF=0 · admin CREATE OK | Seed density · hardcode-as-SoT when EFF>0 |
| **01d** | **CONFIRMED** | Admin N+1 2xx · F5 · picker includes · starter ≠ ceiling | Admin treated as invent · closed 3 ceiling |
| **01e** | **CONFIRMED** | Soft-retire hide · history OK | Hard-delete |
| **01f** | **CONFIRMED** | Display-ready coeff prefill · TXN override · **no** formula claim | Claim formula LIVE / flip payroll_e2e |
| **01H** | **CONFIRMED** | Honesty false · CTR/ATT/FE HOLD RETAIN · C-SLICE · Face OUT | Flip / reopen / invent FE / formula GO / module UAT |
| **VAL-ATT-OT-CNS-*** | **CONFIRMED** | Spec §6.2 CNS-01..10 | Collapsed admin/consumer · scope drift · formula claim · fold SHIFT |

---

## Surface / UF inventory (authoritative excerpt)

| Surf | Class | AC |
|------|-------|-----|
| S-ATT-OT-ADM-01/02 | ADMIN | 01d / 01e / 01 |
| S-ATT-OT-CNS-01 OvertimeRequestTab create | CONSUMER | **01** · **01b** |
| S-ATT-OT-CNS-02 list filter | CONSUMER-READ | 01 / 01c |
| S-ATT-OT-CNS-03 badge/detail | CONSUMER-READ | 01 / 01f |
| S-ATT-OT-CNS-04 coeff prefill | CONSUMER display | **01f** |
| S-ATT-OT-CNS-05 mobile OT (optional) | CONSUMER | same KEY if in-scope |
| S-ATT-OT-REF-01 Settings/D4 stub | REF ≠ SoT | L-ATT-OT-03 |
| OUT SHIFT/CODE/leave/WS/CTR/LVRULE/Face/agg/formula | OUT RETAIN | **01H** |

Proposed UF: **UF-HRM-ATT-OT-01 / 01b / 01c / 01d / 01e**.  
Proposed journeys: **J-HRM-ATT-OT-01..04**.  
Reuse **UF-HRM-05** / **J-HRM-06*** **RETAIN** — **cấm** claim attendance UAT.

---

## ba-data / BE gates

| Gate | Status |
|------|--------|
| ba-data | **UNLOCK** parallel `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-DATA-01` — Nest ABSENT DEFINE physicalize |
| BE | **HOLD** until BA CONFIRMED (this) **+** DATA CONFIRMED |
| FE | After BE — rebind OvertimeRequestTab · **DENY invent FE LVRULE 01g** |

---

## Explicit OUT checklist (QA/QC reject if claimed)

- [x] work_shifts reopen / ATT-SHIFT L1 wipe  
- [x] payroll formula LIVE / `payroll_e2e_ready=true`  
- [x] Face / device LIVE  
- [x] mega-EAV / fold OT into shifts·code·leave·worksite  
- [x] seed OT types for UF  
- [x] reopen CTR template/clause KEY · invent FE LVRULE 01g  
- [x] Settings/D4 sole SoT  
- [x] flip `attendance_uat_ready` / `contracts_printable_ready`  
- [x] module ATT/PAY UAT · Phase1 DONE · UF 🟢 from BA docs alone  

---

## Byte sizes (HARD EXIT GATE)

| Artifact | Path | Bytes (UTF-8) |
|----------|------|---------------|
| Spec | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BA-01.md` | **31124** |
| Evidence | `docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-ba-01.md` | **12702** |

> Measured 2026-08-08 — both **≥ 3072** bytes. Empty seat = INVALID. Gate **PASS**.

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Closed: docs-only CONFIRMED AC pack for OT type open catalog Option B — Nest `att_ot_type` SoT; admin N+1 ≠ invent `HRM-ATT-OT-TYPE-KEY` when EFF>0; OvertimeRequestTab bind Nest when EFF>0 · hardcode three bootstrap only empty; soft-retire/empty CTA/display-ready/no seed; formula/Face/SHIFT reopen/CTR reopen/FE invent/Settings sole/mega-EAV/flip ready OUT; UF/J-* + VAL-ATT-OT-CNS-* locked; honesty false · C-SLICE; ba-data UNLOCK parallel; BE HOLD until DATA; no `apps/**`. Residual: PM → await DATA then BE. |
| **next_owner** | **pm** → ensure **ba-data** DATA-01 CONFIRMED → then **dev-be** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-ba-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BA-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready — BE after DATA)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: OT-TYPE-CATALOG-BA-01 CONFIRMED + OT-TYPE-CATALOG-DATA-01 CONFIRMED
change_mode: ADD

## entry_criteria
- BA CONFIRMED: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BA-01.md · evidence po-hrm-dynamic-config-platform-ot-type-catalog-ba-01.md
- DATA CONFIRMED: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-DATA-01.md · evidence po-hrm-dynamic-config-platform-ot-type-catalog-data-01.md
- SA Option B: Nest att_ot_type DEFINE · invent HRM-ATT-OT-TYPE-KEY · Settings/D4 REF only
- Honesty: attendance_uat_ready=false · payroll_e2e_ready=false · contracts_printable_ready=false · C-SLICE · U65
- RETAIN: CTR KEY/clause · ATT leave-balance/CODE/WS/SHIFT L1 · FE LVRULE 01g HOLD — cấm reopen · DENY invent FE

## task
- EnsureSchema + F-ATT-CAT-OT-01 list/EFF + F-ATT-CAT-OT-02 admin CREATE N+1 / soft-retire
- Consumer OT create (overtime-requests) when EFF>0 → invent HRM-ATT-OT-TYPE-KEY (taxonomy ≠ 404/VAL)
- Display-ready code/name_vi/default_coefficient · FORBIDDEN claim payroll formula LIVE
- Scope parity U19 list↔assert · jest VAL-ATT-OT-CNS-*
- FORBIDDEN: fold into work_shifts · mega-EAV · seed · reopen CTR/ATT L1 · invent FE LVRULE · flip ready · Face

## exit
READY_FOR_QA · evidence ≥3KB · ack_status READY_FOR_QA
next_owner: qa (U65 OvertimeRequestTab · AC-PLT-ATT-OT-01*) then FE rebind if needed
```

**If DATA-01 not yet CONFIRMED — PM dispatch / wait first:**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-DATA-01
from_role: pm
to_role: ba-data
lane: governance
priority: P1
parent: OT-TYPE-CATALOG-SA-01 Option B UNLOCK + BA-01 CONFIRMED
task: Physicalize public.att_ot_type (or stamped synonym) · UQ (company_id, lower(code)) · soft-delete · default_coefficient · scope · F-ATT-CAT-OT map · FORBIDDEN mega-EAV · FORBIDDEN fold into work_shifts · no apps/** · cite L-ATT-OT-* · honesty false
exit: PASS_TO_PM · evidence ≥3KB · next BE HOLD until this DATA + BA both CONFIRMED
```

---

## residual

| ID | Owner | Note |
|----|-------|------|
| Physical DDL | ba-data | UNLOCK parallel — gate for BE |
| BE CRUD + KEY | dev-be | HOLD until BA+DATA |
| FE rebind Select | dev-fe | After BE · DENY invent LVRULE HOLD |
| Formula LIVE | — | OUT forever this seat alone |
| Journey promote J-HRM-ATT-OT-* | ba-docs/qa | OPTIONAL after Nest LIVE + QA stamp |
