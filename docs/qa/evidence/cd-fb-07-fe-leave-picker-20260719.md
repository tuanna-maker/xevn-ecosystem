# CD-FB-07-FE-LEAVE-PICKER — Leave create employee typeahead

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-07-FE-LEAVE-PICKER` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution |
| **change_mode** | UPGRADE |
| **condition** | QC GWC **C-CD-FB-07-01** / `D-CD-FB-07-FE-LEAVE-PICKER` |
| **executed_at** | `2026-07-19` |
| **spec_ref** | Customer demo F4 · QC `cd-fb-07-wf-dynamic-qc-20260719.md` · W2 picker ADR `useEmployeePicker` |
| **ack_status** | **READY_FOR_QA** |
| **U65** | **PASS** — no seed; no API fake state |

---

## completion_report

### Closed

1. **Leave create employee combobox** no longer dumps a capped Select-only list without search.
2. Wired **`useEmployeePickerSearch` + debounced keyword** (same W2 pattern as insurance) on:
   - Employee select (create dialog)
   - Handover person select
3. Options show **`full_name — employee_code`** so `HLD-0006` is discoverable via typeahead `keyword=HLD-0006` (server `listEmployees` page=1).
4. **Selected employee snapshot** kept so submit still works after keyword clear.
5. Picker query **deferred** until create dialog open (`enabled: isCreateOpen`) — no mount fan-out on Leave tab list.
6. **`@CODE-MEMORY` + `@CODE-MEMORY-CHANGE`** on `LeaveTab.tsx`; caller note on `useEmployeePicker.ts`.
7. i18n VI/EN: `leave.searchEmployee`, `leave.searchHandover`, `leave.pickerCappedHint`, `leave.noEmployeesFound`.
8. Soft-nav / F4 product path **untouched** (no edits to `PortalEmbedRouterSync`, workflow bridges, leave mutate API).

### Residual (out of this work_item)

- Full browser FE create→inbox for HLD-0006 = **QA** (U65 FE click path).
- QC conditions **C-CD-FB-07-02..05** (canvas / parallel / pack / Phase1) — not in scope.
- Prior P0 TEXT/`::uuid` — **do not reopen** without new FAIL.

### must_keep verified (static)

| Constraint | Status |
|------------|--------|
| No `listAllEmployees` in LeaveTab | PASS (grep/test) |
| Soft-nav files unchanged | PASS (not modified) |
| F4-01/02 API product path | PASS (no BE/WF edits) |
| U65 zero-seed | PASS |

---

## Files changed

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/attendance/LeaveTab.tsx` | Typeahead pickers + CODE-MEMORY |
| `apps/web/hrm/src/hooks/useEmployeePicker.ts` | Caller / CHANGE note |
| `apps/web/hrm/src/hooks/useEmployeePicker.test.ts` | LeaveTab typeahead regression |
| `apps/web/hrm/src/i18n/locales/vi.json` | leave search/capped strings |
| `apps/web/hrm/src/i18n/locales/en.json` | leave search/capped strings |

---

## Verification (agent)

```bash
cd apps/web/hrm
pnpm test -- src/hooks/useEmployeePicker.test.ts src/hooks/useLeaveRequests.test.ts src/components/layout/PortalEmbedRouterSync.test.ts
# 3 files · 12 tests PASS (2026-07-19)
```

| Suite | Result |
|-------|--------|
| `useEmployeePicker.test.ts` (8) | **PASS** — includes LeaveTab C-CD-FB-07-01 assert |
| `useLeaveRequests.test.ts` (2) | **PASS** |
| `PortalEmbedRouterSync.test.ts` (2) | **PASS** — soft-nav must_keep |

---

## QA click path (U65 — browser-only)

**Persona:** `ceo@xe.vn` / `Xevn@2026`  
**URL:** portal HRM embed → Attendance → tab **Nghỉ phép** → **Tạo yêu cầu nghỉ**

| Step | AC |
|------|-----|
| 1 | Open create dialog — keyword Input visible above employee Select |
| 2 | Type `HLD-0006` (or `Huỳnh`) — Network `GET /api/hrm/employees?...keyword=HLD-0006` **200** |
| 3 | Select **Huỳnh Văn An — HLD-0006** (beyond first uncapped page) |
| 4 | Fill dates + reason → Gửi — FE after 2xx shows new row; F5 retains |
| 5 | Soft-nav away from Attendance still works (regression spot) |

**J-*:** **J-HRM-06** (attendance leave surface)

**Cấm:** seed · reopen TEXT/uuid P0 without new FAIL · Phase1/PROD claim

---

## Handoff

**ack_status:** `READY_FOR_QA`  
**next_owner:** `qa`  
**evidence_path:** `docs/qa/evidence/cd-fb-07-fe-leave-picker-20260719.md`

### next_dispatch_prompt

```text
work_item_id: CD-FB-07-FE-LEAVE-PICKER-QA
from_role: pm
to_role: qa
lane: execution
entry_criteria: READY_FOR_QA docs/qa/evidence/cd-fb-07-fe-leave-picker-20260719.md — LeaveTab typeahead via useEmployeePickerSearch; vitest 12 PASS
exit_criteria: Browser U65 — Attendance → Nghỉ phép → Tạo yêu cầu → type HLD-0006 → select Huỳnh Văn An; GET employees keyword 200; create FE after 2xx + F5; soft-nav must_keep spot; evidence docs/qa/evidence/cd-fb-07-fe-leave-picker-qa-YYYYMMDD.md; ack PASS_TO_PM or FAIL_TO_PM
cấm: seed · Phase1/PROD · reopen TEXT/uuid P0 without new FAIL
UF/J: J-HRM-06 · C-CD-FB-07-01 close candidate
```
