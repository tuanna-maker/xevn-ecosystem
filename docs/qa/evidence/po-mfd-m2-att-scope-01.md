# Evidence — PO-MFD-M2-ATT-SCOPE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-SCOPE-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **change_mode** | FIX |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |

## spec_read_ack

- **srs:** `docs/hrm/SRS.md` · FR-HRM-AT-10 · Diễn biến duyệt/từ chối đơn trong phạm vi công ty · `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_ENTERPRISE_API_MAP.md` ATT-C4 NFR scope gap
- **tech_spec:** `docs/hrm/TECHSPEC.md` §14.4–14.5 · ref_srs FR-HRM-AT-10 · mutate scope parity với list (pattern U78 update-requests)
- **db_design:** `leave_requests.company_id` TEXT · `overtime_requests.company_id` TEXT (attendance-requests ensureSchema)
- **api_design:** `POST …/leave-requests/:id/approve|reject` · `POST …/overtime-requests` + approve/reject/delete · mục đích: guard row slug vs JWT/header · bước SRS AT-10/12/13 manager quyết định
- **uc_ids:** HRM-AT-10 · ATT-C4
- **must_keep:** U78 update-requests · BR-WF-04 · AT-12 L2 ladder SPEC_GAP (no invented PASS)

## completion_report

**Closed:** C4 scope parity for leave + OT mutate paths.

1. **`attendance.controller.ts`** — leave approve/reject and OT create/approve/reject/delete now pass `resolveScopeContext(...).companyId` into services (same as U78 update-requests), not raw `x-company-id ?? 'main'`.
2. **`attendance-requests.service.ts`** — OT list/decide/delete use `normalizePayrollListCompanyId` before `resolveHrmListScope`; `createOvertimeRequest` accepts `resolvedCompanyId` from controller when body omits `company_id`.
3. **`leave-requests.service.ts`** — service ladder unchanged (already G-AT10-01); CODE-MEMORY notes controller fix.
4. **Tests:** `attendance-requests.service.spec.ts` +3 PO-MFD-M2; regression `leave-requests.service.spec.ts` + `hrm-list-scope.spec.ts` — **73/73 PASS**.

**Residual:** Other C4 types (business-trip, late-early, shift-change) still use `companyId ?? 'main'` at controller — out of this work_item; OT+leave were P0 in SA map. FE leave-balance WIRE unchanged.

## verify

```text
pnpm exec jest src/attendance/attendance-requests.service.spec.ts \
  src/attendance/leave-requests.service.spec.ts \
  src/common/hrm-list-scope.spec.ts
# 73 passed
```

## QA dispatch (U65)

- **Persona:** member OU manager (e.g. `trsport` JWT) with portal `x-company-id=main` on spreadsheet scope.
- **UF:** ATT-C4 — list pending OT/leave → **Duyệt** → Network 2xx, row status approved, **no** `SCOPE_CONTEXT_MISMATCH` / HRM-LEAVE-409 / HRM-ATT-REQ-409 on valid row.
- **F5:** list still shows decided row.
- **Cấm seed** in evidence.

## next_owner

qa

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-SCOPE-01-QA
from_role: pm
to_role: qa
lane: execution
u65_zero_seed: true
entry_criteria: hrm-api on :28001; L0 qc:dev-stack optional; dev-be READY_FOR_QA docs/qa/evidence/po-mfd-m2-att-scope-01.md
exit_criteria: Browser UF ATT-C4 — member mgr with x-company-id=main: leave approve + OT approve on row in JWT OU → 2xx + FE status; F5 persists; evidence block per qa-fe-outside-browser-gate; ack_status PASS_TO_PM or FAIL with J-* id
read_first: docs/qa/evidence/po-mfd-m2-att-scope-01.md · HRM-ATTENDANCE_ENTERPRISE_API_MAP.md C4 · U78 pattern
spec_ref: FR-HRM-AT-10 · TECHSPEC §14.5
residual: leave-balance FE WIRE not in scope — note WIRE-BALANCE if blocked on data only
```
