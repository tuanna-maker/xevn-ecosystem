# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BE-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BA-01` **CONFIRMED** Option B |
| **prior** | SA Option **B** LOCKED · ADR **D1** · ba-data **HOLD** (Nest `work_shifts` LIVE · no `archived_at`) |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **change_mode** | **FIX** (deepen F-ATT-CAT-SHIFT only · **no** new table · **no** fold code/leave/worksite) |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · ATT-CODE **`ATTCODEQA-MSK4T1A5`** · leave **`ATTLEAVEQA-MSJ7CPJH`** · worksite **`ATTWSQA-MSJC3IN9`** · EMP/SI/CTR · aggregate GĐ1 **SEAL RETAIN** · R-PLT-ATT-CODE-FE-01 **HOLD** · **`C-SLICE-≠-MODULE`** · U65 zero-seed · DENY module ATT UAT |

---

## 1. spec_read_ack

| Layer | Path / section |
|-------|----------------|
| **SRS** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` FR-HRM-SC-SHIFT-01 · UC-HRM-ATT-SHIFT-CHANGE |
| **SA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-SA-01.md` Option **B** · L-ATT-SHIFT-01..14 · F.1 · ADR D1 |
| **BA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BA-01.md` AC-PLT-ATT-SHIFT-01* · VAL-ATT-SHIFT-CNS-* · BR-PLT-ATT-SHIFT-* |
| **BA evidence** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-ba-01.md` |
| **ADR** | ADR-HRM-ATTENDANCE-CFG-PERSIST **D1** · ADR-HRM-DYNAMIC-CONFIG-PLATFORM Option B |
| **DB** | `public.work_shifts` LIVE (`status` column) — **no** ba-data EXPAND this seat |

---

## 2. completion_report

**Closed (Nest F-ATT-CAT-SHIFT deepen):**

| Gap | Impl |
|-----|------|
| **VAL-ATT-SHIFT-CNS-03b** list default active | `listWorkShifts` adds `status = 'active'` unless `include_inactive=true` |
| **VAL-ATT-SHIFT-CNS-04** soft-retire | DELETE → soft `status='inactive'` (product SoT); `?hard=true` residual hard DELETE only when no `shift_change_requests` refs; PATCH `status=inactive` RETAIN |
| **VAL-ATT-SHIFT-CNS-01** invent KEY | `assertShiftKeysForConsumer` on ShiftChange create → **`HRM-ATT-SHIFT-KEY`** when active>0 ∧ `current_shift`/`requested_shift` ∉ Nest |
| Empty active (01c) | invent assert **skip** when active=0 · **no** ensureDefault/seed |
| Picker contract | `GET /work-shifts/effective` = active-only alias · default list also active-only |
| Display-ready | map exposes `code`/`name`/`start_time`/`end_time`/`coefficient`/`status` |
| **U19 scope_parity** | list / effective / count / get-by-id / mutate / assert share `resolveHrmListScope` · **HRM-WS-404/409** RETAIN |
| CODE-MEMORY | APPEND on `attendance-catalog.service.ts` · `attendance.controller.ts` · `attendance-requests.service.ts` |

**Paths KEEP / deepen:**

| Cap | Path |
|-----|------|
| F-ATT-CAT-SHIFT-01 list | `GET /api/hrm/attendance/work-shifts?company_id=` (+ `include_inactive`) |
| EFF picker | `GET /api/hrm/attendance/work-shifts/effective?company_id=` |
| get-by-id | `GET /api/hrm/attendance/work-shifts/:shiftId?company_id=` |
| F-ATT-CAT-SHIFT-02 mutate | `POST/PATCH/DELETE /api/hrm/attendance/work-shifts*` |
| Consumer | `POST /api/hrm/attendance/shift-change-requests` (+ invent assert) |

**Cấm giữ:** seed · ensureDefault · Settings dual-write / sole SoT · fold into ATT-CODE/leave/worksite · reopen ATT-CODE L1 · invent FE ATT-CODE HOLD · flip ready · rewrite aggregate · mega-EAV · second shifts table · Phase1 DONE.

**Residual:**

| Item | Owner |
|------|-------|
| **VAL-ATT-SHIFT-CNS-02** FE ShiftChange Nest rebind (hardcode 5-id when active>0) | **dev-fe** after QA or parallel if contract OK |
| Browser U65 AC-PLT-ATT-SHIFT-01/01b/01c/01d/01e/01H | **qa** (L1 invent KEY first) |
| Slice GWC · honesty false | **qc** after QA |

---

## 3. Error taxonomy (emit)

| Code | HTTP | When |
|------|------|------|
| **`HRM-ATT-SHIFT-KEY`** | 400 | Consumer invent shift code/id when active>0 |
| **`HRM-WS-VAL`** | 400 / 409 | Admin empty code/name · hard-delete with refs (409) |
| **`HRM-WS-404`** | 404 | Admin get/mutate not found / OOS empty |
| **`HRM-WS-409`** | 409 | Scope mismatch (U19) |

---

## 4. Verification

```bash
cd apps/api/hrm-api
pnpm exec jest --testPathPatterns="attendance-catalog-work-shift.spec|attendance-requests.service.spec|attendance.controller.spec" --no-coverage
# Test Suites: 3 passed · Tests: 38 passed
```

| VAL / AC | Jest result |
|----------|-------------|
| **CNS-01** invent KEY + wire ShiftChange | PASS |
| **CNS-03b** list active default + effective | PASS |
| **CNS-04** soft-retire DELETE + hard blocked with refs | PASS |
| **CNS-05** empty active skip invent | PASS |
| U19 get-by-id holding under main · OOS reject | PASS |
| Controller suite regression | PASS |

---

## 5. Honesty / seals

| Flag / seal | Value |
|-------------|-------|
| `attendance_uat_ready` | **false** — **DENIED** flip |
| `payroll_e2e_ready` | **false** — **DENIED** flip |
| ATT-CODE `ATTCODEQA-MSK4T1A5` | **SEAL RETAIN** · R-PLT-ATT-CODE-FE-01 **HOLD** |
| ATT leave `ATTLEAVEQA-MSJ7CPJH` | **SEAL RETAIN** |
| ATT worksite `ATTWSQA-MSJC3IN9` | **SEAL RETAIN** |
| EMP / SI / CTR / aggregate GĐ1 | **SEAL RETAIN** |
| ba-data | **HOLD** — no second table · no `archived_at` |
| `C-SLICE-≠-MODULE` | work_shifts deepen ≠ module ATT UAT |
| Seed / ensureDefaultWorkShift | **DENIED** |

---

## 6. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Deepened Nest F-ATT-CAT-SHIFT: list default active-only (`include_inactive` audit); DELETE soft-retire `status=inactive` (hard=?hard=true when no refs); invent **`HRM-ATT-SHIFT-KEY`** on ShiftChange create when active>0; `/effective` + get-by-id display-ready; U19 scope parity; jest **38 PASS**; honesty false; seals retained; no seed/table/fold. Residual FE CNS-02 ShiftChange Nest rebind. |
| **next_owner** | **qa** (prefer L1 invent KEY AC-01b first) · note FE CNS-02 residual for PM after QA or parallel |
| **next_dispatch_prompt** | See §7 |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-be-01.md` |
| **ack_status** | **READY_FOR_QA** |

---

## 7. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BE-01 READY_FOR_QA

## entry_criteria
- Read BE evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-be-01.md
- Read BA: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BA-01.md
- L0 stack up · U65 zero-seed · prefer L1 invent KEY LIVE first (AC-01b) then browser UF
- Honesty: attendance_uat_ready=false · payroll_e2e_ready=false · C-SLICE-≠-MODULE
- RETAIN: ATTCODEQA-MSK4T1A5 · ATT leave/worksite · EMP · SI/CTR · aggregate · R-PLT-ATT-CODE-FE-01 HOLD

## task
1) L1 LIVE: Nest active≥1 (admin CREATE — no seed) → POST shift-change-requests with invent current_shift/requested_shift ∉ Nest → expect 4xx HRM-ATT-SHIFT-KEY · no persist (AC-PLT-ATT-SHIFT-01b · VAL-CNS-01)
2) L1: GET work-shifts default excludes inactive; include_inactive=true shows retired (CNS-03b)
3) L1: DELETE work-shift → status inactive · default list hides (CNS-04 / 01e)
4) L1: active=0 invent skip (01c) — do not seed
5) Browser U65 when FE available: AC-01/01d admin CREATE N+1 → F5; note CNS-02 FE hardcode residual if picker still closed 5-id
6) Spot U19 scope if member OOS

## cấm
seed · ensureDefault · flip ready · reopen ATT-CODE/leave/worksite · invent FE ATT-CODE HOLD · PASS probe-only as UF 🟢 · claim module ATT UAT

## residual note for PM
If L1 KEY PASS but browser picker still hardcode → dispatch dev-fe VAL-ATT-SHIFT-CNS-02 Nest rebind (ShiftChangeRequestTab)

## evidence_path
docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-qa-01.md

## exit
PASS_TO_PM or FAIL_TO_PM · matrix · honesty false · next_dispatch_prompt
```
