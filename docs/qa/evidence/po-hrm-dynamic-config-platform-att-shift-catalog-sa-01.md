# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-SA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-SA-01` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — **ATT work_shifts catalog Option B deepen only** · **not** module ATT UAT |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | U88 after `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-QC-01` **GWC** stamp **`ATTCODEQA-MSK4T1A5`** · **L-ATT-CODE-08** orthogonal `work_shifts` |
| **Verdict** | **CONFIRMED** — Option **B LOCKED** (Nest `work_shifts` = ops SoT deepen · Settings/`shifts` REF only · ADR D1) |
| **ack_status** | `PASS_TO_PM` |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-SA-01.md) |
| **peer_cite** | ATT-LEAVE · ATT-WORKSITE · ATT-CODE Option B — **cite ≠ copy** · **SEAL RETAIN** |
| **U65** | zero-seed · docs-only · **no** `apps/**` · **no** `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — work_shifts catalog deepen ≠ attendance module UAT / Phase1 / flip ready / aggregate rewrite |

### Honesty locks (mandatory)

| Flag | Value | SA note |
|------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote |
| ATT-CODE `ATTCODEQA-MSK4T1A5` | **SEAL RETAIN** | **cấm reopen** L1 · **cấm invent FE** R-PLT-ATT-CODE-FE-01 |
| ATT leave `ATTLEAVEQA-MSJ7CPJH` | **SEAL RETAIN** | **cấm reopen** |
| ATT worksite `ATTWSQA-MSJC3IN9` | **SEAL RETAIN** | **cấm reopen** |
| EMP seals (DEPT/POS/ST/CF/EXT) | **SEAL RETAIN** | **cấm reopen** |
| SI / CTR / PAY / LIST-TOTALS / aggregate GĐ1 | **SEAL RETAIN** | **FORBIDDEN** rewrite aggregate |
| Module ATT UAT / Phase 1 DONE | **DENIED** | Slice ≠ module seal |
| Seed | **DENIED** (U65) | empty CTA OK |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | Nest deepen ≠ module ATT UAT |

---

## Verdict summary

**CONFIRMED Option B** — Nest `public.work_shifts` already **LIVE** (AttendanceCatalogService CRUD + FE `useWorkShifts`). ADR **D1** locks ops SoT = Nest; Settings/XBOS `shifts` = **REF only** (MD dual-write forbidden). Residual = named **AC-PLT-ATT-SHIFT-01*** deepen: admin CREATE open N+1 ≠ consumer invent **`HRM-ATT-SHIFT-KEY`**; empty CTA no seed; soft-retire vs hard DELETE; default active list filter; kill FE `ShiftChangeRequestTab` closed hardcode (`morning|afternoon|night|office|flexible`) when active>0. **Closest peer:** ATT-WORKSITE LIVE deepen (not ATT-CODE DEFINE / not EMP-POSITION Settings A). **REJECT** Option A Settings sole · Option C mega-EAV / fold into code·leave·worksite / reopen ATT-CODE L1 / invent FE ATT-CODE HOLD / flip ready / rewrite aggregate. ba-process **UNLOCK**; ba-data **HOLD**; BE **HOLD** until BA (± DATA if EXPAND). Docs-only — **no** `apps/**`.

| Gate item | Evidence | SA |
|-----------|----------|-----|
| Nest producer LIVE | `attendance-catalog.service.ts` `ensureWorkShiftSchema` + CRUD · controller `work-shifts` | 🟢 LIVE |
| Settings/`shifts` REF only | ADR D1 · `mdBucketRegistry` no dual-write · MasterDataSettingsPanel must_keep | 🟢 REF ≠ sole |
| Hardcode residual | `ShiftChangeRequestTab.tsx` closed 5-id list | 🟢 deepen trigger |
| Hard DELETE residual | `deleteWorkShift` SQL `DELETE FROM` | 🟢 BR-PLT-04 deepen |
| No invent KEY AS-IS | no `HRM-ATT-SHIFT-KEY` / consumer assert spot | 🟢 GAP for BA/BE |
| L-ATT-CODE-08 orthogonal | ATT-CODE SA/BA OUT `work_shifts` | 🟢 OWN this seat |
| Peer leave/WS/code Option B cite | specs on disk · seals RETAIN | 🟢 cite ≠ copy |
| Option A REJECT | Settings not LIVE ops producer | 🟢 |
| Option C REJECT | mega-EAV / fold / reopen / UAT / FE invent / agg | 🟢 |
| Honesty / C-SLICE | false · RETAIN | 🟢 |
| Spec + evidence non-empty | both files | 🟢 |

**Cấm:** invent `attendance_uat_ready=true` · invent `payroll_e2e_ready=true` · claim module ATT UAT / Phase1 · reopen ATT-CODE/leave/worksite/EMP/SI/CTR · fold shifts into day-code · aggregate rewrite · seed · invent FE ATT-CODE HOLD · Settings sole SoT · mega-EAV · second Nest shifts table.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true`? | **NO** |
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM reopen ATT-CODE L1 / leave / worksite / EMP / SI / CTR / aggregate? | **NO** |
| May PM invent FE Task for R-PLT-ATT-CODE-FE-01 as mandatory? | **NO** — HOLD retain |
| May PM seal ATT-SHIFT-CATALOG Option B architecture? | **YES** — this seat CONFIRMED |
| Why | Nest LIVE deepen · ADR D1 · peer worksite class · `C-SLICE-≠-MODULE` |
| Recommended flag state | keep **`attendance_uat_ready=false`** · **`payroll_e2e_ready=false`** |
| Forced residual dispatch this turn? | **U88** — **ba-process** ATT-SHIFT-CATALOG-BA-01 (± **ba-data** only if BA proves EXPAND) |

---

## AS-IS audit (facts)

| Layer | Finding | Class |
|-------|---------|-------|
| Nest table | `public.work_shifts` CREATE IF NOT EXISTS in `AttendanceCatalogService` | **LIVE producer** |
| Nest API | `GET/POST/PATCH/DELETE /api/hrm/attendance/work-shifts*` · codes `HRM-WS-200/201/404/409` | **LIVE** |
| FE admin | `useWorkShifts` · Attendance tab Ca | **Nest-bound** |
| FE consumer hardcode | `ShiftChangeRequestTab` `morning|afternoon|night|office|flexible` | **Hardcode residual (H)** |
| Settings MD | bucket `shifts` — description «không đồng ghi bảng Attendance work_shifts» | **REF · dual-write DENY** |
| ADR | D1 work_shifts wins · XBOS `shifts` REF · dual SoT HOLD closed as split | **SoT lock** |
| Retire | Hard `DELETE` | **BR-PLT-04 deepen** |
| List filter | No default active-only | **Deepen** |
| Invent KEY | Absent | **GAP** → `HRM-ATT-SHIFT-KEY` |
| Orthogonal | ATT-CODE L-ATT-CODE-08 · leave · worksite ≠ shifts | **OWN seat** |

---

## Option decision package

| Option | Summary | Verdict |
|--------|---------|---------|
| **A** Settings/`shifts` sole SoT | Contradicts ADR D1 · REF ≠ LIVE ops | **REJECT** |
| **B** Nest `work_shifts` deepen | LIVE producer + hardcode/soft-delete deepen · peer worksite | **LOCKED / CONFIRMED** |
| **C** Hybrid / mega-EAV / fold / reopen / UAT / FE invent / agg rewrite | Honesty + seal breach | **REJECT** |

**Heuristic check:** Prefer A if Settings producer LIVE → **N/A** (Settings is REF, Nest is LIVE ops). Prefer B if Nest absent / hardcode residual → Nest LIVE **+** hardcode residual → **B deepen** (not DEFINE new table).

---

## Gates unlocked / held

| Gate | State |
|------|-------|
| ba-process AC pack | **UNLOCK** → `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BA-01` |
| ba-data physical | **HOLD** — LIVE table · EXPAND only if BA proves column gap |
| BE deepen | **HOLD** until BA (± DATA) CONFIRMED |
| FE consumer rebind | After BA — ShiftChange Nest picker; **not** invent ATT-CODE FE |
| ATT-CODE FE HOLD | **RETAIN HOLD** — do not invent |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **AC-PLT-ATT-SHIFT-01*** pack | P1 | **ba-process** | Enumerate UF/J-* · stamp invent KEY · admin≠consumer · empty CTA · soft-retire · honesty 01H |
| Optional soft-retire column / unique code | P2 | **ba-data** (conditional) | Only if BA proves EXPAND — else HOLD |
| BE soft-retire · KEY · list filter | P1 | **dev-be** (after BA) | HOLD until BA CONFIRMED |
| FE ShiftChange Nest bind | P2 | **dev-fe** (after BA) | Do not invent ATT-CODE FE |
| Honesty / C-SLICE / seals | — | **pm** | Keep ready=false · no reopen · no fold |

---

## completion_report

**Closed:** SA Option **B CONFIRMED LOCKED** for ATT **work_shifts** open catalog deepen — Nest LIVE SoT (ADR D1) · Settings/`shifts` REF only · invent **`HRM-ATT-SHIFT-KEY`** · empty CTA no seed · admin N+1 · reject Settings sole · mega-EAV · fold into attendance-code/leave/worksite · reopen ATT-CODE L1 · invent FE ATT-CODE HOLD · flip attendance/payroll ready · rewrite aggregate · Phase1 / module ATT UAT; ba-process **UNLOCK**; ba-data **HOLD**; BE **HOLD**; honesty false · C-SLICE · seals RETAIN including `ATTCODEQA-MSK4T1A5`; docs-only · no `apps/**` · no seed.

**Open residual:** BA AC pack (± DATA if EXPAND proved) → then BE deepen → QA; FE ShiftChange rebind after BA; ATT-CODE FE HOLD remains non-mandatory.

---

## next_owner / next_dispatch_prompt

**next_owner:** `ba-process` (primary) · `ba-data` **HOLD** unless BA proves physical EXPAND

```text
Task ba-process
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BA-01
from_role: pm
to_role: ba-process
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-SA-01 Option B LOCKED

entry_criteria:
- Read: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-SA-01.md (CONFIRMED Option B)
- Read: docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-sa-01.md
- Cite peer AC packs: ATT-LEAVE / ATT-WORKSITE / ATT-CODE — cite ≠ copy
- RETAIN: ATTCODEQA-MSK4T1A5 · ATT leave/worksite · EMP seals · SI/CTR · aggregate GĐ1 · R-PLT-ATT-CODE-FE-01 HOLD (do not invent FE)
- Honesty: attendance_uat_ready=false · payroll_e2e_ready=false · C-SLICE · U65

task (governance — NO apps/** · no seed):
- Produce AC-PLT-ATT-SHIFT-01 / 01b / 01c / 01d / 01e / 01H + VAL-ATT-SHIFT-CNS-*
- Nest work_shifts = SoT (ADR D1); Settings/shifts REF only
- Admin CREATE open N+1 ≠ consumer invent HRM-ATT-SHIFT-KEY when active>0
- Empty CTA · no seed · soft-retire prefer status=inactive
- Enumerate consumer surfaces (ShiftChange hardcode residual mandatory; OT/assignment if in-scope)
- DENY fold into att_attendance_code/leave/worksite · reopen ATT-CODE L1 · invent FE ATT-CODE HOLD · flip ready · mega-EAV · rewrite aggregate
- If column EXPAND required (archived_at / unique code): stamp ba-data UNLOCK narrow; else ba-data HOLD
- BE HOLD until BA CONFIRMED (± DATA)

deliverables:
- docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BA-01.md
- docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-ba-01.md
- CONFIRMED · PASS_TO_PM · completion_report · next_dispatch_prompt

cấm: apps/** · seed · flip ready · reopen ATT-CODE/leave/worksite/EMP · fold codes · invent FE ATT-CODE · module ATT UAT · Phase1 · rewrite aggregate
```

---

## Self-check

| Check | Result |
|-------|--------|
| Spec on disk non-empty | ✅ `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-SA-01.md` |
| Evidence on disk non-empty | ✅ this file |
| CONFIRMED Option stated | ✅ **B** |
| PASS_TO_PM | ✅ |
| completion_report + next_dispatch_prompt | ✅ |
| No apps/** / seed / ready flip | ✅ |
