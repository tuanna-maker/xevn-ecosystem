# Evidence — `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-FE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-07 |
| **lane** | execution |
| **priority** | P1 |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-02` PASS_TO_PM stamp `PAYINPQA2-MSISF85U` |
| **change_mode** | **FIX** |
| **ack_status** | **`READY_FOR_QA`** |
| **honesty** | **`payroll_e2e_ready=false`** · **DENIED** flip / module UAT / AMIS DONE / seed |

### Honesty locks

| Flag | Value |
|------|-------|
| **`payroll_e2e_ready`** | **`false`** (unchanged · not flipped) |
| **Seed** | **DENIED** (U65) |
| **Module UAT / J-HRM-07 claim** | **DENIED** |
| **AMIS DONE** | **DENIED** |

---

## spec_read_ack

| Artifact | Used |
|----------|------|
| `docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qa-02.md` | Residual FE wire POST employees; L1 `HRM-ADV-201` live |
| Nest `CreateAdvanceRequestEmployeeDto` | `employee_code` · `employee_name` · `advance_amount` (+ optional id/dept/position/note) |
| Nest `POST …/advance-requests/:requestId/employees` | Query `company_id`; body DTO; code `HRM-ADV-201` |
| `AdvanceRequestsTab` / `useAdvanceRequests` | Prior throw «API thêm NV vào bảng tạm ứng chưa có trên Nest» |

### solid_convention_ack (FE–BE)

- FE binds Nest snake_case DTO (`employee_code` / `employee_name` / `advance_amount`).
- `company_id` / `request_id` **not** in POST body — `company_id` query-only; `requestId` path.
- No FE payroll amount invent beyond user-entered advance; no `payroll_e2e_ready` flip.

---

## Delivered

| Surface | Change |
|---------|--------|
| `lib/advanceRequestEmployeeRequest.ts` | Whitelist body builder + CODE-MEMORY |
| `lib/advanceRequestEmployeeRequest.test.ts` | 3 unit tests |
| `integrations/hrmApi.ts` | `createAdvanceRequestEmployee` → POST `…/employees?company_id=` |
| `hooks/useAdvanceRequests.ts` | `addEmployeeMutation` calls API; invalidate list; **removed throw** |
| `components/payroll/AdvanceRequestsTab.tsx` | After save: re-fetch employees + refresh detail counts; CODE-MEMORY APPEND |

### Click path (QA U65 browser — recommended)

1. Login `ceo@xe.vn` / `Xevn@2026` → HRM → **Tiền lương** → **Tạm ứng**.
2. Open a **pending** advance request (or create one) → **Thêm nhân viên**.
3. Select NV + amount → Lưu / Thêm.
4. Network: **POST** `/api/hrm/payroll/advance-requests/{id}/employees?company_id=…` → **201** `HRM-ADV-201`.
5. Body includes `employee_code`, `employee_name`, `advance_amount` (no FE throw toast).
6. Employee list on detail refreshes; F5 → row còn.
7. Regression: do **not** expect module UAT; mark-paid still needs `payrollPeriodId` (optional residual — not this slice).

---

## Unit evidence

```text
pnpm --filter vite_react_shadcn_ts exec vitest run \
  src/lib/advanceRequestEmployeeRequest.test.ts \
  src/components/payroll/__tests__/advanceRequestFormUi.test.ts
→ Test Files 2 passed · Tests 7 passed
```

---

## Exit criteria map

| # | Criteria | Status |
|---|----------|--------|
| 1 | `useAdvanceRequests` POST employees with DTO code/name/amount | **PASS** |
| 2 | After save list refreshes; no throw | **PASS** (tab re-fetch + invalidate) |
| 3 | Evidence this file | **PASS** |
| 4 | `READY_FOR_QA` | **PASS** |

---

## Residual / not promoted

| Item | Owner |
|------|-------|
| Browser Step4 UF packs / J-HRM-07 process UAT | QA browser (separate) |
| mark-paid UI picker for `payrollPeriodId` (MarkAdvancePaidDto required) | Optional follow-up — approve wired; mark-paid period picker **not** this WI |
| Module UAT / `payroll_e2e_ready` flip | **DENIED** |
| removeEmployee / update/delete advance request Nest APIs | Still stub throws (out of scope) |

---

## completion_report

### Closed

1. Removed FE throw «API thêm NV chưa có trên Nest».
2. Wired `hrmApi.createAdvanceRequestEmployee` + `useAdvanceRequests.addEmployee` to Nest POST (HRM-ADV-201 DTO).
3. Detail employee list refresh after save; list query invalidate for counts.
4. Vitest 7 PASS; honesty locks held.

### Residual

- Browser UF not run in this FE wave (U65 QA next).
- mark-paid period picker / removeEmployee Nest wire — out of slice.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-fe-01.md` |
| **ack_status** | **`READY_FOR_QA`** |
| **pm_dispatch_hint** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-03` — U65 browser Thêm NV on pending advance → POST 201 + list refresh |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-03
from_role: pm
to_role: qa
lane: execution
priority: P1
prior: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-FE-01 READY_FOR_QA

entry_criteria:
- evidence: docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-fe-01.md
- L0 stack up; U65 zero-seed; payroll_e2e_ready must stay false
- account: ceo@xe.vn / Xevn@2026 · company_id=main

exit_criteria:
1) Browser: Payroll → Tạm ứng → pending request → Thêm NV → Network POST …/employees 201 HRM-ADV-201
2) Body has employee_code / employee_name / advance_amount; no toast/error «API thêm NV chưa có»
3) FE list employees refreshes after 2xx; F5 row remains
4) evidence: docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qa-03.md
5) ack_status PASS_TO_PM (or FAIL with residual)

cấm: pnpm seed:* · payroll_e2e_ready flip · claim module UAT / AMIS DONE
```
