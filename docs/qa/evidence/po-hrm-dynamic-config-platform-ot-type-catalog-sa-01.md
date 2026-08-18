# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — **OT type catalog Option B DEFINE only** · **not** module ATT/PAY UAT |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | U88 after `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-QC-01` **GWC** · invent KEY Network **LIVE SEALED** |
| **Verdict** | **CONFIRMED** — Option **B LOCKED** (Nest `att_ot_type` **DEFINE** · Settings/D4 stub **REF only** · invent **`HRM-ATT-OT-TYPE-KEY`**) |
| **ack_status** | `PASS_TO_PM` |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01.md) |
| **peer_cite** | ATT-SHIFT CITE OUT OT type · ATT leave-balance Nest-ABSENT DEFINE · ATT-CODE/WS/leave L1 · CTR-TEMPLATE RETAIN class (alternate) · PAY formula HOLD — **cite ≠ copy** · **SEAL RETAIN** |
| **U65** | zero-seed · docs-only · **no** `apps/**` · **no** `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — OT type catalog DEFINE ≠ attendance/payroll module UAT / Phase1 / flip ready / formula LIVE |

### Honesty locks (mandatory)

| Flag | Value | SA note |
|------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote · default coeff ≠ formula LIVE |
| **`contracts_printable_ready`** | **`false`** | **DENIED** invent / promote |
| CTR-TEMPLATE KEY LIVE | **SEAL RETAIN** | **cấm reopen** |
| CTR-CLAUSE `body_vi` Option B | **SEAL RETAIN** | **cấm reopen** |
| ATT leave-balance / FE LVRULE 01g HOLD | **HOLD RETAIN** | **DENY invent FE** |
| ATT-CODE / WS / SHIFT / leave L1 | **SEAL RETAIN** | **cấm reopen** · SHIFT orthogonal |
| EMP / SI / PAY / DEC / MergeToken | **SEAL RETAIN** | **cấm reopen** |
| Module ATT/PAY UAT / Phase 1 DONE | **DENIED** | Slice ≠ module seal |
| Seed | **DENIED** (U65) | empty CTA OK |
| Face / device LIVE | **DENIED** | BA-01 OUT |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | DEFINE ≠ module UAT |

---

## Verdict summary

**CONFIRMED Option B** — Nest OT-type catalog **ABSENT** (no `att_ot_type` / overtime type CRUD). FE `OvertimeRequestTab` hardcodes closed **weekday|weekend|holiday** + client coeff map 1.5/2.0/3.0. BE `CreateOvertimeRequestDto.overtime_type` is free `@IsString()` on TXN `overtime_requests` with **no** invent KEY. ADR **D4** Attendance sidebar «Tăng ca» = stub; DATA_CLASS §2.5 marks OT type catalog **REF SPEC_GAP / MISSING_CFG_UI**. ATT-SHIFT BA **S-ATT-SHIFT-CITE-01** explicitly **CITE OUT** OT type from work_shifts — this seat **OWN** orthogonal catalog. **LOCK:** DEFINE Nest `att_ot_type` (F-ATT-CAT-OT-01/02); admin CREATE open N+1 (starter three ≠ ceiling); consumer bind when EFF>0 → invent **`HRM-ATT-OT-TYPE-KEY`**; Settings/D4 stub REF only; payroll formula LIVE **HOLD**; Face/device/seed/mega-EAV/SHIFT reopen **OUT**. Closest peer class: **leave-balance / EMP-STATUS / SI-INS Nest-ABSENT DEFINE** (not CTR-TEMPLATE RETAIN — Nest not LIVE). ba-process **UNLOCK**; ba-data **UNLOCK**; BE **HOLD** until BA+DATA. Docs-only — **no** `apps/**`.

| Gate item | Evidence | SA |
|-----------|----------|-----|
| Nest OT catalog ABSENT | grep hrm-api: no `att_ot_type` CREATE / OT catalog service | 🟢 DEFINE trigger |
| FE hardcode residual | `OvertimeRequestTab.tsx` SelectItem weekday/weekend/holiday + `getCoefficient` | 🟢 closed-3 |
| TXN free string | DTO `overtime_type!: string` · INSERT trim · no KEY assert | 🟢 GAP KEY |
| Settings/D4 stub REF | ADR D4 · DATA_CLASS MISSING_CFG_UI · SPEC_GAP | 🟢 A REJECT sole |
| ATT-SHIFT CITE OUT | BA S-ATT-SHIFT-CITE-01 · SHIFT BE must_keep OT no invent KEY on shift path | 🟢 OWN orthogonal |
| Alternate RETAIN probe | Nest LIVE? **NO** — DEFINE not CTR RETAIN | 🟢 documented §4.3 |
| Option A REJECT | stub not LIVE ops producer | 🟢 |
| Option C REJECT | mega-EAV / fold / reopen / formula / seed / invent FE | 🟢 |
| Honesty / C-SLICE | false · RETAIN | 🟢 |
| Spec + evidence non-empty | both files ≥3KB | 🟢 (cite sizes below) |

**Cấm:** invent ready flags · claim formula LIVE · reopen CTR/ATT L1 / work_shifts · invent FE LVRULE · fold OT into shifts/code/leave · seed · Face LIVE · mega-EAV · module ATT/PAY UAT · Phase1 · Settings sole SoT.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true`? | **NO** |
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM set `contracts_printable_ready=true`? | **NO** |
| May PM claim OT default_coefficient = payroll formula LIVE? | **NO** |
| May PM reopen CTR KEY / clause / ATT L1 / work_shifts / invent FE LVRULE? | **NO** |
| May PM seal OT-TYPE-CATALOG Option B architecture? | **YES** — this seat CONFIRMED |
| Why | Nest ABSENT DEFINE · hardcode residual · peer Nest catalog class · SHIFT CITE OUT · `C-SLICE-≠-MODULE` |
| Recommended flag state | keep **all three honesty flags `false` LOCKED** |
| Forced residual dispatch this turn? | **U88** — **ba-process** OT-TYPE-CATALOG-BA-01 **+** **ba-data** OT-TYPE-CATALOG-DATA-01 (UNLOCK) |

---

## AS-IS audit (facts)

| Layer | Finding | Class |
|-------|---------|-------|
| Nest OT type table | No `att_ot_type` / overtime type catalog DDL in hrm-api attendance | **ABSENT producer** |
| Nest OT TXN | `overtime_requests` LIVE · `overtime_type TEXT` · create/approve/delete | **TXN LIVE** (retain) |
| Nest API invent | No `HRM-ATT-OT-TYPE-KEY` · free string accept | **GAP** |
| FE consumer hardcode | `OvertimeRequestTab` closed 3-id list + badge + filter | **Hardcode residual (H)** |
| FE coeff | `getCoefficient` weekday=1.5 / weekend=2.0 / holiday=3.0 | **Client invent default** ≠ formula LIVE claim |
| Settings / D4 | Sidebar «Tăng ca» stub · redirect Settings wording | **REF · stub · not sole SoT** |
| DATA_CLASS §2.5 | OT type catalog REF SPEC_GAP · MISSING_CFG_UI | **CONFIRMS gap** |
| ATT-SHIFT peer | OT type CITE OUT of shift AC pack | **Orthogonal OWN** |
| CTR parent | KEY Network LIVE GWC | **SEAL RETAIN** |
| FE LVRULE 01g | HOLD | **DENY invent FE** |

### Option evaluation (summary)

| Option | Result |
|--------|--------|
| **A** Settings/XBOS/D4 stub sole SoT | **REJECT** — no LIVE ops producer; dual orphan vs Nest TXN |
| **B** Nest `att_ot_type` DEFINE open catalog | **LOCK / CONFIRMED** |
| **C** Hybrid / mega-EAV / fold / reopen / formula / seed | **REJECT** |

### Alternate RETAIN note

If Nest OT catalog were already LIVE (CRUD + open N+1), SA would **RETAIN+clarify** like CTR-TEMPLATE (ba-data HOLD). **Probe 2026-08-08: ABSENT** → DEFINE + ba-data UNLOCK.

---

## Locks stamp (copy for BA)

| Stamp | Meaning |
|-------|---------|
| **`HRM-ATT-OT-TYPE-KEY`** | Consumer invent `overtime_type` when EFF>0 |
| **F-ATT-CAT-OT-01** | List / EFF |
| **F-ATT-CAT-OT-02** | Admin mutate CREATE N+1 / retire |
| **AC-PLT-ATT-OT-01*** | Draft stubs 01 / 01b / 01c / 01d / 01e / 01f / 01H |
| **L-ATT-OT-01..15** | Admin≠consumer · REF · soft-delete · orthogonal · honesty · Face OUT · seed DENY |

---

## Explicit OUT checklist (QA/QC reject if claimed)

- [ ] work_shifts reopen / ATT-SHIFT L1 wipe
- [ ] payroll formula LIVE / `payroll_e2e_ready=true`
- [ ] Face / device LIVE
- [ ] mega-EAV / fold OT into shifts·code·leave·worksite
- [ ] seed OT types for UF
- [ ] reopen CTR template/clause KEY · invent FE LVRULE 01g
- [ ] module ATT/PAY UAT · Phase1 DONE · UF 🟢 from SA docs

---

## Byte sizes (HARD EXIT GATE)

| Artifact | Path | Bytes (UTF-8) |
|----------|------|---------------|
| Spec | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01.md` | **24049** |
| Evidence | `docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-sa-01.md` | **11466** |

> Measured 2026-08-08 — both **≥ 3072** bytes. Empty seat = INVALID. Gate **PASS**.

---

## Handoff contract

| Field | Value |
|-------|--------|
| **completion_report** | Option **B CONFIRMED LOCKED** — Nest OT-type catalog DEFINE (`att_ot_type`) · invent **`HRM-ATT-OT-TYPE-KEY`** · admin N+1 ≠ consumer invent · bind OvertimeRequestTab when EFF>0 · Settings/D4 REF only · formula/Face/SHIFT reopen/CTR reopen/FE invent/seed/mega-EAV **OUT** · honesty false · C-SLICE · ba-data **UNLOCK** · ba-process **UNLOCK** · BE HOLD · no `apps/**` |
| **next_owner** | **ba-process** (+ **ba-data** UNLOCK — parallel or BA-first then DATA) |
| **next_dispatch_prompt** | See § below |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-sa-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BA-01
from_role: pm
to_role: ba-process
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01 CONFIRMED Option B
change_mode: ADD
no_code: true

## entry
- Read: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01.md
- Read: docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-sa-01.md
- Peer cite: ATT-SHIFT CITE OUT · leave-balance DEFINE · CTR KEY SEAL RETAIN · FE LVRULE 01g HOLD
- Honesty: attendance_uat_ready=false · payroll_e2e_ready=false · contracts_printable_ready=false · C-SLICE · U65

## task
Produce BA AC pack AC-PLT-ATT-OT-01* from SA stubs:
- Admin CREATE N+1 open OT type (starter weekday/weekend/holiday ≠ ceiling)
- Consumer OvertimeRequestTab picker when EFF>0
- Invent → HRM-ATT-OT-TYPE-KEY (taxonomy ≠ 404/VAL)
- Empty EFF CTA · no seed
- default_coefficient display-ready · FORBIDDEN claim payroll formula LIVE
- Explicit OUT: work_shifts reopen · formula LIVE · Face · mega-EAV · seed · invent FE HOLDs · flip ready
- Unlock handoff ba-data physical (Nest ABSENT) — coordinate PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-DATA-01
- RETAIN CTR KEY · ATT L1 · FE LVRULE HOLD

## exit
CONFIRMED AC pack · PASS_TO_PM · evidence ≥3KB · next_owner ba-data (if not parallel) then BE HOLD until BA+DATA
```

**Parallel ba-data prompt (PM may dispatch same turn):**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-DATA-01
from_role: pm
to_role: ba-data
lane: governance
priority: P1
parent: OT-TYPE-CATALOG-SA-01 Option B UNLOCK
task: Physicalize public.att_ot_type (or stamped synonym) · UQ (company_id, lower(code)) · soft-delete · default_coefficient · scope columns · F-ATT-CAT-OT map · FORBIDDEN mega-EAV · FORBIDDEN fold into work_shifts · no apps/** · cite SA L-ATT-OT-* · honesty false
exit: PASS_TO_PM · evidence ≥3KB · next BE HOLD until BA AC CONFIRMED
```

---

## residual

| ID | Owner | Note |
|----|-------|------|
| BA AC pack | ba-process | AC-PLT-ATT-OT-01* |
| Physical DDL | ba-data | UNLOCK |
| BE CRUD + KEY | dev-be | HOLD until BA+DATA |
| FE rebind Select | dev-fe | After BA · DENY invent LVRULE HOLD |
| Formula LIVE | — | OUT forever this seat alone |
