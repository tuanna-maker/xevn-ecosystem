# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — **ATT work_shifts catalog AC pack only** · **not** module ATT UAT |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-SA-01` Option **B LOCKED** (ADR D1 Nest deepen) |
| **Verdict** | **CONFIRMED** — AC-PLT-ATT-SHIFT-01/01b/01c/01d/01e/01H + VAL-ATT-SHIFT-CNS-* · ba-data **HOLD** · BE **UNLOCK** deepen |
| **ack_status** | `PASS_TO_PM` |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BA-01.md) |
| **peer_cite** | ATT-WORKSITE BA deepen · ATT-LEAVE BA · ATT-CODE BA — **cite ≠ copy** · **SEAL RETAIN** |
| **U65** | zero-seed · docs-only · **no** `apps/**` · **no** `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — work_shifts AC ≠ attendance module UAT / Phase1 / flip ready / aggregate rewrite |

### Honesty locks (mandatory)

| Flag | Value | BA note |
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
| **`C-SLICE-≠-MODULE`** | **RETAIN** | AC pack ≠ module ATT UAT |

---

## Verdict summary

**CONFIRMED** AC pack for Option **B** Nest `public.work_shifts` deepen (ADR **D1**):

| AC | Rule locked |
|----|-------------|
| **01** | Consumer ShiftChange picks Nest when active≥1 · Settings/`shifts` REF only |
| **01b** | Invent → **`HRM-ATT-SHIFT-KEY`** (alias `HRM-ATT-SHIFT-UNKNOWN`) |
| **01c** | Empty active · CTA · invent skip · hardcode bootstrap **only** when empty · **no seed** |
| **01d** | Admin CREATE open N+1 ≠ invent ban |
| **01e** | Soft-retire `status='inactive'` · hide picker · history OK |
| **01H** | Honesty false · seals RETAIN · no invent FE ATT-CODE HOLD · no fold · no mega-EAV · no aggregate rewrite |

**Closest peer:** ATT-WORKSITE LIVE deepen (**cite ≠ copy**). **ATT-CODE** = orthogonal L-ATT-CODE-08 cite ≠ DEFINE copy.

**ba-data HOLD:** `status` column already LIVE — **no** `archived_at` EXPAND · unique code **GĐ1.5 HOLD**.

**BE UNLOCK** (gaps): invent KEY · list default active · soft-retire prefer · then FE ShiftChange Nest rebind · then QA.

**Cấm:** apps/** · seed · flip ready · reopen ATT-CODE/leave/worksite/EMP · fold · invent FE ATT-CODE · module ATT UAT · Phase1 · Settings sole · mega-EAV · rewrite aggregate.

### Gate checklist

| Gate item | Evidence | BA |
|-----------|----------|-----|
| Nest SoT = work_shifts (ADR D1) | SA LOCKED · schema LIVE `status` | 🟢 |
| Settings/`shifts` REF only | ADR D1 · MD dual-write DENY | 🟢 |
| Admin≠consumer (01/01d) | BR-PLT-ATT-SHIFT-01/02 · L-ATT-SHIFT-01 | 🟢 |
| Invent KEY stamp | `HRM-ATT-SHIFT-KEY` · ≠ leave/code/GEO | 🟢 |
| Empty CTA no seed (01c) | L-ATT-SHIFT-06 · U65 | 🟢 |
| Soft-retire (01e) | Prefer `status=inactive` · column LIVE | 🟢 |
| ShiftChange hardcode residual | `ShiftChangeRequestTab` 5-id — CNS-01/02 mandatory | 🟢 |
| OT bind? | OvertimeRequestTab **no** shift field — CITE OUT | 🟢 |
| ba-data EXPAND? | **HOLD** — not proved | 🟢 |
| DENY fold/reopen/FE invent/UAT/agg | 01H · §8 | 🟢 |
| Spec + evidence non-empty | both files | 🟢 |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true`? | **NO** |
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM reopen ATT-CODE L1 / leave / worksite / EMP / SI / CTR / aggregate? | **NO** |
| May PM invent FE Task for R-PLT-ATT-CODE-FE-01 as mandatory? | **NO** — HOLD retain |
| May PM unlock ba-data? | **NO** — HOLD (no EXPAND) |
| May PM unlock BE deepen? | **YES** — after this BA CONFIRMED |
| May PM seal ATT-SHIFT-CATALOG BA AC? | **YES** — this seat CONFIRMED |
| Why | Nest LIVE deepen · ADR D1 · peer worksite class · gaps BE/FE only · `C-SLICE-≠-MODULE` |
| Recommended flag state | keep **`attendance_uat_ready=false`** · **`payroll_e2e_ready=false`** |
| Forced residual dispatch this turn? | **U88** — **dev-be** ATT-SHIFT-CATALOG-BE-01 (not QA-first; BE GAPs block browser 01b/01e) |

---

## Surface inventory (authoritative summary)

| Surf | Class | Note |
|------|-------|------|
| **S-ATT-SHIFT-ADM-01** | ADMIN | Ca tab Nest CRUD |
| **S-ATT-SHIFT-CNS-01** | CONSUMER primary | ShiftChange — hardcode residual **H** |
| **S-ATT-SHIFT-REF-01** | REF | Settings/`shifts` — dual-write DENY |
| **S-ATT-SHIFT-CITE-01** | OUT | OT — no shift bind |
| ATT-CODE / leave / worksite / agg | OUT SEAL | FORBIDDEN reopen/fold |

---

## VAL matrix residual owners

| VAL | Gap | Owner after BA |
|-----|-----|----------------|
| **VAL-ATT-SHIFT-CNS-01** | Invent KEY absent | **dev-be** |
| **VAL-ATT-SHIFT-CNS-02** | Hardcode picker | **dev-fe** (after/with BE contract) |
| **VAL-ATT-SHIFT-CNS-03b** | List all rows | **dev-be** |
| **VAL-ATT-SHIFT-CNS-04** | Hard DELETE product retire | **dev-be** |
| **VAL-ATT-SHIFT-CNS-05/06** | Empty / REF | RETAIN verify QA |
| ba-data | — | **HOLD** |

---

## completion_report

**Closed:** BA-process **CONFIRMED** AC-PLT-ATT-SHIFT-01/01b/01c/01d/01e/01H + VAL-ATT-SHIFT-CNS-01..06 + BR-PLT-ATT-SHIFT-* · Nest `work_shifts` SoT (ADR D1) · Settings/`shifts` REF only · admin CREATE N+1 ≠ consumer invent **`HRM-ATT-SHIFT-KEY`** · empty CTA no seed · soft-retire `status=inactive` · ShiftChange hardcode residual mandatory · OT cite OUT · DENY fold ATT-CODE/leave/worksite · reopen seals · invent FE ATT-CODE HOLD · flip ready · mega-EAV · rewrite aggregate · Phase1 / module ATT UAT; ba-data **HOLD** (no EXPAND — `status` LIVE); BE **UNLOCK** deepen; honesty false · C-SLICE · seals RETAIN including `ATTCODEQA-MSK4T1A5`; docs-only · no `apps/**` · no seed.

**Open residual:** BE deepen (KEY · list active · soft-retire) → FE ShiftChange Nest rebind → QA U65 browser → QC slice GWC; ATT-CODE FE HOLD remains non-mandatory; unique code GĐ1.5 HOLD.

---

## next_owner / next_dispatch_prompt

**next_owner:** `dev-be` (primary — BE GAPs) · `ba-data` **HOLD** · QA **after** BE (+FE)

```text
Task dev-be
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BA-01 CONFIRMED Option B deepen

entry_criteria:
- Read: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BA-01.md (CONFIRMED)
- Read: docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-ba-01.md
- Read: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-SA-01.md (Option B LOCKED · ADR D1)
- RETAIN: ATTCODEQA-MSK4T1A5 · ATT leave/worksite · EMP seals · SI/CTR · aggregate GĐ1 · R-PLT-ATT-CODE-FE-01 HOLD (do not invent FE)
- Honesty: attendance_uat_ready=false · payroll_e2e_ready=false · C-SLICE · U65
- ba-data: HOLD — no new table · no archived_at migration required (status column LIVE)

task (narrow deepen — cite F-ATT-CAT-SHIFT LIVE paths):
- Soft-retire prefer PATCH status='inactive' as product retire (BR-PLT-04 · AC-01e · VAL-CNS-04); hard DELETE residual when no refs only
- List GET default active-only; include_inactive=true for admin audit (VAL-CNS-03b)
- Consumer invent assert on ShiftChange create: when active>0 ∧ current_shift/requested_shift/code ∉ scoped Nest → 4xx HRM-ATT-SHIFT-KEY (VAL-CNS-01 · AC-01b)
- Optional /effective or reuse list active for picker contract
- Scope parity list↔get-by-id↔assert (U19 · HRM-WS-404/409 retain)
- Display-ready code/name/times/coeff on list/get
- CẤM: ensureDefault/seed · Settings dual-write · fold into att_attendance_code/leave/worksite · reopen ATT-CODE L1 · invent FE ATT-CODE HOLD · flip ready · rewrite aggregate · mega-EAV · second shifts table

exit_criteria:
- jest covering invent KEY + soft-retire hide + list active default
- READY_FOR_QA · completion_report · next_dispatch_prompt → dev-fe ShiftChange Nest rebind (VAL-CNS-02) then qa AC-PLT-ATT-SHIFT-01*
- evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-be-01.md

cấm: apps outside attendance work_shifts / shift-change assert · seed · flip ready · reopen seals · invent ATT-CODE FE · module ATT UAT · Phase1
```

---

## Self-check

| Check | Result |
|-------|--------|
| Spec on disk non-empty | ✅ `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BA-01.md` |
| Evidence on disk non-empty | ✅ this file |
| CONFIRMED AC pack stated | ✅ AC-PLT-ATT-SHIFT-01* + VAL-ATT-SHIFT-CNS-* |
| ba-data HOLD (no EXPAND) | ✅ |
| BE UNLOCK after BA | ✅ |
| PASS_TO_PM | ✅ |
| completion_report + next_dispatch_prompt | ✅ |
| No apps/** / seed / ready flip | ✅ |
