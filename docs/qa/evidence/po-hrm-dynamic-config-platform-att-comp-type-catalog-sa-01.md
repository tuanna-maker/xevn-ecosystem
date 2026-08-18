# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — **OT compensation_type catalog Option B DEFINE only** · **not** module ATT/PAY UAT |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | U88 after `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-QC-01` **GWC** · invent KEY Network **LIVE SEALED** · DOCS ACCEPT |
| **Verdict** | **CONFIRMED** — Option **B LOCKED** (Nest `att_ot_comp_type` **DEFINE** · Settings **REF only** · free-TEXT RETAIN **REJECT** as SoT · invent **`HRM-ATT-OT-COMP-KEY`**) |
| **ack_status** | `PASS_TO_PM` |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md) |
| **peer_cite** | OT-TYPE KEY LIVE orthogonal · ATT leave-balance Nest-ABSENT DEFINE · ATT-CODE/WS/SHIFT/leave L1 · CTR KEY · PAY formula HOLD — **cite ≠ copy** · **SEAL RETAIN** · **DENY fold into att_ot_type** |
| **U65** | zero-seed · docs-only · **no** `apps/**` · **no** `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — compensation catalog DEFINE ≠ attendance/payroll module UAT / Phase1 / flip ready / formula LIVE |

### Honesty locks (mandatory)

| Flag | Value | SA note |
|------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote · compensation catalog ≠ formula LIVE |
| **`contracts_printable_ready`** | **`false`** | **DENIED** invent / promote |
| OT-TYPE KEY LIVE (`HRM-ATT-OT-TYPE-KEY`) | **SEAL RETAIN** | **cấm reopen** · **cấm fold** compensation into `att_ot_type` |
| CTR-TEMPLATE KEY LIVE | **SEAL RETAIN** | **cấm reopen** |
| CTR-CLAUSE `body_vi` Option B | **SEAL RETAIN** | **cấm reopen** |
| ATT leave-balance / FE LVRULE 01g HOLD | **HOLD RETAIN** | **DENY invent FE** |
| ATT-CODE / WS / SHIFT / leave L1 | **SEAL RETAIN** | **cấm reopen** |
| EMP / SI / PAY / DEC / MergeToken | **SEAL RETAIN** | **cấm reopen** |
| Module ATT/PAY UAT / Phase 1 DONE | **DENIED** | Slice ≠ module seal |
| Seed | **DENIED** (U65) | empty CTA OK |
| Face / device LIVE | **DENIED** | BA-01 OUT |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | DEFINE ≠ module UAT |

---

## Verdict summary

**CONFIRMED Option B** — Nest OT **compensation_type** catalog **ABSENT** (no `att_ot_comp_type`). FE `OvertimeRequestTab` hardcodes closed **`salary` \| `compensatory_leave`** (i18n TimeOff label — slug is **not** `time_off`). Detail UI binary-maps any non-salary string → TimeOff invent. BE `CreateOvertimeRequestDto.compensation_type` is optional free `@IsString()`; `attendance-requests.service` INSERT uses `body.compensation_type?.trim() ?? 'salary'` with **no** invent KEY. Nested peer **`att_ot_type`** is **LIVE** (KEY LIVE GWC) and asserts **`overtime_type` only** — compensation is **orthogonal OWN**. **LOCK:** DEFINE Nest `att_ot_comp_type` (F-ATT-CAT-OTC-01/02); admin CREATE open N+1 (starter two ≠ ceiling); consumer bind on **`createOvertimeRequest`** when EFF>0 → invent **`HRM-ATT-OT-COMP-KEY`**; Settings REF only; free-TEXT RETAIN **REJECT** as product SoT (TEXT column retained as storage); payroll formula LIVE **HOLD**; Face/device/seed/mega-EAV/OT-TYPE fold/reopen **OUT**. Closest peer class: **OT-TYPE / leave-balance / EMP-STATUS Nest-ABSENT DEFINE**. ba-process **UNLOCK**; ba-data **UNLOCK**; BE **HOLD** until BA+DATA. Docs-only — **no** `apps/**`.

| Gate item | Evidence | SA |
|-----------|----------|-----|
| Nest comp catalog ABSENT | grep hrm-api: no `att_ot_comp_type` CREATE / service | 🟢 DEFINE trigger |
| FE hardcode residual | `OvertimeRequestTab.tsx` SelectItem `salary` / `compensatory_leave` + binary detail | 🟢 closed-2 |
| TXN free string | DTO `compensation_type?: string` · INSERT trim/default · no KEY assert | 🟢 GAP KEY |
| OT type LIVE orthogonal | `att_ot_type` + `assertOtTypeInEffectiveCatalog` on `overtime_type` only | 🟢 OWN · DENY fold |
| Settings sole REF | no LIVE MD compensation producer for OT | 🟢 A REJECT sole |
| Free-TEXT RETAIN REJECT as SoT | open-catalog seat · BR-PLT-05 | 🟢 C1 REJECT |
| Alternate RETAIN probe | Nest LIVE? **NO** — DEFINE not CTR/OT-TYPE RETAIN | 🟢 documented §4.3 |
| Option C REJECT | fold / reopen / formula / seed / invent FE | 🟢 |
| Honesty / C-SLICE | false · RETAIN | 🟢 |
| Spec + evidence non-empty | both files ≥3KB / spec ≥5KB | 🟢 (cite sizes below) |

**Cấm:** invent ready flags · claim formula LIVE · reopen OT-TYPE/CTR/ATT L1 · fold into `att_ot_type` · invent FE LVRULE · seed · Face LIVE · mega-EAV · module ATT/PAY UAT · Phase1 · Settings sole SoT · free-TEXT invent as SoT.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true`? | **NO** |
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM set `contracts_printable_ready=true`? | **NO** |
| May PM claim compensation catalog = payroll formula LIVE? | **NO** |
| May PM reopen OT-TYPE KEY / CTR / ATT L1 / fold into ot_type / invent FE LVRULE? | **NO** |
| May PM seal ATT-COMP-TYPE-CATALOG Option B architecture? | **YES** — this seat CONFIRMED |
| Why | Nest ABSENT DEFINE · hardcode residual · peer Nest catalog class · OT-TYPE orthogonal · `C-SLICE-≠-MODULE` |
| Recommended flag state | keep **all three honesty flags `false` LOCKED** |
| Forced residual dispatch this turn? | **U88** — **ba-process** ATT-COMP-TYPE-CATALOG-BA-01 **+** **ba-data** ATT-COMP-TYPE-CATALOG-DATA-01 (UNLOCK) · BE **HOLD** |

---

## AS-IS audit (facts)

| Layer | Finding | Class |
|-------|---------|-------|
| Nest OT comp-type table | No `att_ot_comp_type` / compensation catalog DDL in hrm-api attendance | **ABSENT producer** |
| Nest OT type table | `att_ot_type` LIVE · invent `HRM-ATT-OT-TYPE-KEY` on `overtime_type` | **LIVE peer · orthogonal · SEAL RETAIN** |
| Nest OT TXN | `overtime_requests` LIVE · `compensation_type TEXT DEFAULT 'salary'` | **TXN LIVE** (retain column) |
| Nest API invent | No `HRM-ATT-OT-COMP-KEY` · free string accept / default salary | **GAP** |
| FE consumer hardcode | `OvertimeRequestTab` closed 2-id Select + binary detail label | **Hardcode residual (H)** |
| FE slug note | Value = `compensatory_leave` (not `time_off` / `time-off`) | **Document accurately for BA** |
| Settings | No LIVE OT compensation MD producer | **REF · not sole SoT** |
| OT-TYPE parent | KEY Network LIVE GWC + DOCS ACCEPT | **SEAL RETAIN · DENY reopen** |
| FE LVRULE 01g | HOLD | **DENY invent FE** |

### Option evaluation (summary)

| Option | Result |
|--------|--------|
| **A** Settings/XBOS sole SoT | **REJECT** — no LIVE ops producer; dual orphan vs Nest TXN |
| **B** Nest `att_ot_comp_type` DEFINE open catalog | **LOCK / CONFIRMED** |
| **C** RETAIN free-TEXT-as-SoT / hybrid / mega-EAV / fold into ot_type / reopen / formula / seed | **REJECT** |

### Alternate RETAIN note

If Nest OT compensation catalog were already LIVE (CRUD + open N+1), SA would **RETAIN+clarify** like CTR-TEMPLATE / post-LIVE OT-TYPE (ba-data HOLD). **Probe 2026-08-08: ABSENT** → DEFINE + ba-data UNLOCK.

### Orthogonality stamp

| Dimension | Catalog | Invent KEY | Consumer assert field |
|-----------|---------|------------|------------------------|
| OT type (when/class) | `att_ot_type` LIVE | `HRM-ATT-OT-TYPE-KEY` | `overtime_type` |
| OT compensation (how settled) | `att_ot_comp_type` DEFINE | **`HRM-ATT-OT-COMP-KEY`** | `compensation_type` |

**FORBIDDEN** fold · **FORBIDDEN** reopen OT-TYPE to «fix» compensation hardcode.

---

## Locks stamp (copy for BA)

| Stamp | Meaning |
|-------|---------|
| **`HRM-ATT-OT-COMP-KEY`** | Consumer invent `compensation_type` when EFF>0 |
| **F-ATT-CAT-OTC-01** | List / EFF |
| **F-ATT-CAT-OTC-02** | Admin mutate CREATE N+1 / retire |
| **AC-PLT-ATT-COMP-01*** | Draft stubs 01 / 01b / 01c / 01d / 01e / 01f / 01H |
| **L-ATT-OTC-01..16** | Admin≠consumer · REF · soft-delete · orthogonal · honesty · Face OUT · seed DENY · KEY taxonomy |

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

---

## next_dispatch_prompt (copy-ready for PM)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BA-01
from_role: pm
to_role: ba-process
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: ATT-COMP-TYPE-CATALOG-SA-01 Option B LOCKED
change_mode: ADD

## task
AC pack AC-PLT-ATT-COMP-01 / 01b / 01c / 01d / 01e / 01f / 01H + VAL-ATT-OTC-CNS-* from SA Option B:
- Nest att_ot_comp_type = SoT; admin CREATE N+1 ≠ invent HRM-ATT-OT-COMP-KEY
- createOvertimeRequest + OvertimeRequestTab bind when EFF>0
- starter salary|compensatory_leave = bootstrap ≠ ceiling (note slug compensatory_leave ≠ time_off)
- empty CTA no seed; soft-retire; display-ready name_vi; formula HOLD
- OUT: fold into att_ot_type · reopen OT-TYPE/CTR/ATT L1 · Face · mega-EAV · Settings sole · flip ready · invent FE HOLDs · leave-funnel LIVE
- Enumerate UF/J-HRM-ATT-OTC-* ; honesty false · C-SLICE · U65

## read_first
- docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md
- docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-sa-01.md
- Peer OT-TYPE BA: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BA-01.md (cite ≠ copy)

## exit
CONFIRMED AC pack · PASS_TO_PM
spec ≥5KB · evidence ≥3KB
next_owner: pm → ba-data parallel UNLOCK (or after BA) · BE HOLD until BA+DATA
ack_status: PASS_TO_PM
```

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-DATA-01
from_role: pm
to_role: ba-data
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: ATT-COMP-TYPE-CATALOG-SA-01 Option B LOCKED · ba-data UNLOCK
change_mode: ADD

## task
Physical DDL for public.att_ot_comp_type (or stamped synonym — ONE table):
- company_id · code · name_vi · optional name_en/sort_order · status · soft-retire · U19 scope indexes
- soft FK pattern: overtime_requests.compensation_type TEXT stores Nest code (RETAIN column — no wipe)
- invent KEY class HRM-ATT-OT-COMP-KEY documented
- DENY second mega-EAV · DENY fold into att_ot_type · DENY Settings dual-write SoT · DENY migrate/apps/seed · DENY flip ready · DENY formula LIVE
- Parallel OK with BA-01; BE HOLD until BA+DATA CONFIRMED

## read_first
- SA-01 spec + evidence (this seat)
- Peer OT-TYPE DATA-01 physical pattern cite ≠ copy

## exit
CONFIRMED DATA · PASS_TO_PM · evidence ≥3KB
ack_status: PASS_TO_PM
```

---

## completion_report

**Closed:** Docs-only SA Option **B LOCKED** for OT `compensation_type` open catalog. Nest ABSENT → DEFINE `att_ot_comp_type`; invent **`HRM-ATT-OT-COMP-KEY`**; admin N+1 ≠ consumer invent; `createOvertimeRequest` assert when EFF>0; Settings REF only; free-TEXT RETAIN REJECT as SoT; OT-TYPE orthogonal SEAL RETAIN (DENY fold/reopen); formula/Face/seed/mega-EAV/CTR/ATT L1 reopen **OUT**; honesty false · **C-SLICE**; ba-process + ba-data **UNLOCK**; BE **HOLD**. No `apps/**`.

**Residual:** BA AC + DATA DDL · later BE/FE · leave-funnel OUT · formula never this slice alone.

| Artifact | Path |
|----------|------|
| Spec | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md` |
| Evidence | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-sa-01.md` |

**ack_status:** `PASS_TO_PM`  
**next_owner:** `pm` → `ba-process` + `ba-data` (UNLOCK) · BE HOLD
