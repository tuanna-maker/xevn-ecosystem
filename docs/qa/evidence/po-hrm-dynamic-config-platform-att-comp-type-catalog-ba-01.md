# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — **OT compensation_type open catalog AC pack only** · **not** module ATT/PAY UAT · **not** formula LIVE · **not** OT-TYPE fold/reopen |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01` **CONFIRMED** Option **B** Nest `att_ot_comp_type` DEFINE |
| **Verdict** | **CONFIRMED** — AC pack `AC-PLT-ATT-COMP-01/01b/01c/01d/01e/01f/01H` + `VAL-ATT-COMP-CNS-*` implementation-ready |
| **ack_status** | `PASS_TO_PM` |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BA-01.md) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md) |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-att-comp-type-catalog-sa-01.md`](./po-hrm-dynamic-config-platform-att-comp-type-catalog-sa-01.md) |
| **peer_cite** | OT-TYPE KEY LIVE orthogonal **SEAL RETAIN** · leave-balance Nest DEFINE cite ≠ copy · CTR KEY/clause **SEAL RETAIN** · FE LVRULE 01g **HOLD RETAIN** · PAY formula HOLD cite · ATT L1 seals RETAIN |
| **U65** | zero-seed · docs-only · **no** `apps/**` · **no** `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — OT compensation catalog AC ≠ attendance/payroll module UAT / Phase1 / flip ready / formula LIVE / OT-TYPE reopen |

### Honesty locks (mandatory)

| Flag | Value | BA note |
|------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote · compensation catalog ≠ formula LIVE |
| **`contracts_printable_ready`** | **`false`** | **DENIED** invent / promote |
| OT-TYPE KEY LIVE (`HRM-ATT-OT-TYPE-KEY`) / `att_ot_type` | **SEAL RETAIN** | **cấm reopen** · **cấm fold** compensation into OT type |
| CTR-TEMPLATE KEY LIVE / CTR-CLAUSE `body_vi` | **SEAL RETAIN** | **cấm reopen** |
| ATT leave-balance / FE LVRULE 01g HOLD | **HOLD RETAIN** | **DENY invent FE** |
| ATT-CODE / WS / SHIFT / leave L1 | **SEAL RETAIN** | **cấm reopen** |
| EMP / SI / PAY / DEC / MergeToken | **SEAL RETAIN** | **cấm reopen** |
| Face / device LIVE | **DENIED** | OUT |
| Settings sole SoT | **DENIED** | Option A REJECT |
| Mega-EAV / fold into `att_ot_type` | **DENIED** | Q-PLT-03 · L-ATT-OTC-08 |
| Seed | **DENIED** (U65) | empty CTA OK |
| Module ATT/PAY UAT / Phase 1 DONE | **DENIED** | Slice ≠ module seal |
| Formula LIVE | **DENIED** | HOLD forever this seat alone |
| Auto leave-funnel LIVE | **DENIED** | OUT |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | catalog AC ≠ module GO |

---

## Verdict summary

**CONFIRMED AC pack** from SA Option B stubs:

| Lock | CONFIRMED |
|------|-----------|
| Nest `att_ot_comp_type` DEFINE = **catalog SoT** (Settings REF only) | 🟢 |
| Admin CREATE **N+1** ≠ consumer invent **`HRM-ATT-OT-COMP-KEY`** when EFF>0 | 🟢 |
| `OvertimeRequestTab` bind Nest compensation when EFF>0 · hardcode **`salary` \| `compensatory_leave`** **only** EFF=0 (AS-IS cite — **not** `time_off`) | 🟢 |
| Empty CTA · soft-retire · display-ready · no seed · kill binary invent when Nest label | 🟢 |
| Display-ready Nest `name_vi` · **FORBIDDEN** claim payroll formula LIVE (**01f**) | 🟢 |
| OUT: fold into `att_ot_type` · reopen OT-TYPE/CTR/ATT L1 · formula LIVE · Face · mega-EAV · flip ready · Settings sole · invent FE HOLDs · leave-funnel LIVE | 🟢 |
| Surface / UF / proposed J-HRM-ATT-COMP-* / UF-HRM-ATT-COMP-* inventory | 🟢 |
| ba-data **UNLOCK** parallel · BE **HOLD** until BA+DATA | 🟢 |

Docs-only — **no** `apps/**`.

| Gate item | Evidence | BA |
|-----------|----------|-----|
| SA Option B LOCKED | SA-01 + evidence | 🟢 cite |
| AC-PLT-ATT-COMP-01 | Spec §6.1 bind Nest OvertimeRequestTab compensation | 🟢 |
| AC-PLT-ATT-COMP-01b | Invent → `HRM-ATT-OT-COMP-KEY` | 🟢 |
| AC-PLT-ATT-COMP-01c | Empty CTA no seed · hardcode salary\|compensatory_leave only EFF=0 | 🟢 |
| AC-PLT-ATT-COMP-01d | Admin N+1 open (starter two ≠ ceiling) | 🟢 |
| AC-PLT-ATT-COMP-01e | Soft-retire | 🟢 |
| AC-PLT-ATT-COMP-01f | Display-ready · formula HOLD · no binary invent | 🟢 |
| AC-PLT-ATT-COMP-01H | Honesty / seals / C-SLICE / DENY OT-TYPE fold | 🟢 |
| VAL-ATT-COMP-CNS-01..10 | Spec §6.2 | 🟢 |
| UF/J-* enumerate | Spec §4 · §6.4 | 🟢 |
| AS-IS FE slug cite | OvertimeRequestTab SelectItem salary / compensatory_leave | 🟢 |
| Honesty / C-SLICE | false · RETAIN | 🟢 |
| Spec + evidence non-empty | both files ≥3KB / spec ≥5KB | 🟢 (cite sizes below) |

**Cấm:** invent `attendance_uat_ready=true` · invent `payroll_e2e_ready=true` · invent `contracts_printable_ready=true` · claim module ATT/PAY UAT / Phase1 · reopen OT-TYPE/CTR/ATT L1 · fold into `att_ot_type` · invent FE LVRULE · Face · seed · Settings sole · mega-EAV · claim formula LIVE · unlock BE before DATA CONFIRMED · invent AS-IS as `time_off`.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true`? | **NO** |
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM set `contracts_printable_ready=true`? | **NO** |
| May PM claim compensation catalog = payroll formula LIVE? | **NO** |
| May PM reopen OT-TYPE KEY / fold into `att_ot_type` / reopen CTR/ATT L1 / invent FE LVRULE? | **NO** |
| May PM seal ATT-COMP-TYPE-CATALOG-BA-01 AC pack? | **YES** — this seat CONFIRMED |
| Why | SA Option B LOCKED · AC/VAL/UF/J inventory · admin≠consumer · orthogonal OT-TYPE · U65 · `C-SLICE-≠-MODULE` |
| Recommended flag state | keep **all three honesty flags `false` LOCKED** |
| Forced residual dispatch this turn? | **U88** — ensure **ba-data** ATT-COMP-TYPE-CATALOG-DATA-01 CONFIRMED (parallel OK) · **BE HOLD** until BA+DATA · then **dev-be** |

---

## AS-IS cite (FE — mandatory accuracy)

| Finding | Path / fact |
|---------|-------------|
| Create Select closed-2 | `OvertimeRequestTab.tsx` SelectItem `salary` / `compensatory_leave` |
| i18n label | `overtime.compensationTimeOff` for compensatory_leave — **slug ≠** `time_off` |
| Detail binary invent | `compensation_type === 'salary' ? Salary : TimeOff` |
| BE free string | CreateOvertimeRequestDto `compensation_type?: string` · INSERT default `'salary'` · no invent KEY |
| Nest comp catalog | **ABSENT** (SA) |
| Nest OT type | **LIVE** orthogonal — asserts `overtime_type` only |

---

## AC stamp checklist (copy for QA)

| ID | One-line PASS |
|----|---------------|
| **01** | Nest EFF≥1 · OvertimeRequestTab compensation picker Nest · 2xx · F5 |
| **01b** | Invent → **400 `HRM-ATT-OT-COMP-KEY`** · no persist |
| **01c** | EFF=0 soft empty + CTA · hardcode two only · no seed |
| **01d** | Admin CREATE N+1 open · F5 · picker sees |
| **01e** | Soft-retire hide · history OK |
| **01f** | Nest `name_vi` · no binary invent · formula HOLD |
| **01H** | Honesty false · seals RETAIN · C-SLICE · DENY OT-TYPE fold |

---

## Explicit OUT checklist (QA/QC reject if claimed)

- [ ] OT-TYPE L1 / `att_ot_type` reopen or fold compensation into OT type
- [ ] payroll formula LIVE / `payroll_e2e_ready=true`
- [ ] Face / device LIVE
- [ ] mega-EAV / fold into shifts·code·leave·worksite
- [ ] seed / ensureDefault compensation types
- [ ] invent FE LVRULE 01g / ATT-CODE FE HOLD wipe
- [ ] reopen CTR KEY/clause / ATT leave-balance
- [ ] module ATT/PAY UAT / Phase1 / flip attendance_uat
- [ ] Settings sole SoT / free-TEXT invent as product SoT
- [ ] auto leave-funnel LIVE from compensatory_leave
- [ ] AS-IS documented as slug `time_off` (wrong — use `compensatory_leave`)
- [ ] invent KEY stamped as `HRM-ATT-OT-TYPE-KEY` for compensation field

---

## File size gate

| Artifact | Min | Result |
|----------|-----|--------|
| Spec BA-01 | ≥5KB | see PowerShell Length below |
| Evidence BA-01 | ≥3KB | see PowerShell Length below |

---

## next_dispatch_prompt (copy-ready for PM)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-DATA-01
from_role: pm
to_role: ba-data
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: ATT-COMP-TYPE-CATALOG-SA-01 Option B LOCKED · BA-01 CONFIRMED
change_mode: ADD

## entry_criteria
- SA CONFIRMED: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md
- BA CONFIRMED: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BA-01.md
- Evidence BA: docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-ba-01.md
- Invent KEY: HRM-ATT-OT-COMP-KEY
- Orthogonal to sealed att_ot_type (DENY fold)
- Honesty false · C-SLICE · U65 · formula HOLD · BE HOLD until DATA CONFIRMED

## task (docs-only physical)
- ADD-plan public.att_ot_comp_type (or stamped synonym — ONE table)
- Columns intent: company_id, code, name_vi, optional name_en/sort_order, status active|inactive, soft-retire, scope U19
- UQ (company_id, lower(code)) · soft-delete · F-ATT-CAT-OTC-01/02 map
- Soft FK pattern: overtime_requests.compensation_type TEXT stores Nest code
- Bootstrap codes document: salary | compensatory_leave (NOT time_off)
- FORBIDDEN: mega-EAV · fold into att_ot_type · seed · formula LIVE columns as engine · reopen OT-TYPE/CTR/ATT L1

## exit
CONFIRMED · PASS_TO_PM · BE HOLD until BA+DATA · ack_status PASS_TO_PM
```

---

## completion_report

**Closed:** Docs-only BA AC pack **CONFIRMED** for OT compensation_type Option B — Nest `att_ot_comp_type` SoT · Settings REF only · admin CREATE N+1 ≠ invent **`HRM-ATT-OT-COMP-KEY`** when EFF>0 · OvertimeRequestTab bind Nest when EFF>0 · hardcode **`salary` \| `compensatory_leave`** only EFF=0 (AS-IS cite ≠ `time_off`) · soft-retire · empty CTA · display-ready · no seed · formula HOLD · OUT fold/reopen OT-TYPE·CTR·ATT L1 · Face · mega-EAV · flip ready · leave-funnel · module UAT · honesty false · **C-SLICE** · ba-data **UNLOCK** parallel · BE **HOLD**. **No** `apps/**`.

**Residual:** ba-data physicalize · later BE/FE · formula LIVE never this vertical alone · OT-TYPE KEY SEAL RETAIN.

| Field | Value |
|-------|--------|
| **next_owner** | **pm** |
| **ack_status** | **PASS_TO_PM** |
| **ba-data parallel** | **OK / UNLOCK** |
| **BE** | **HOLD** until BA+DATA |