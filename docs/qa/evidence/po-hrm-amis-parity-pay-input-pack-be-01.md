# Evidence — PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-01` |
| **parent** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **date** | 2026-08-07 |
| **change_mode** | ADD / EXPAND |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · U65 zero-seed |

---

## spec_read_ack

| Artifact | Sections |
|----------|----------|
| `docs/program/specs/PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01.md` | F-PAY-PERIOD-BIND/INPUT/ADV-BRIDGE · PROCESS SRC-03 · errors §7 |
| `docs/program/specs/PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-DATA-01.md` | §2 bind · §3 input lines · §4 advance bridge · validation §7 |
| `docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-api-01.md` | F.1 CONFIRMED gate |
| `apps/api/hrm-api/src/payroll/pay-src-resolver.ts` | SRC-03 loader baseline |

**must_keep:** formula F.1 · TPL F.1 · ATT-LINE-01 · scope_parity U19 · payroll_e2e_ready=false

---

## Deliverables

| Area | Implementation |
|------|----------------|
| **Schema** | `ensurePayPeriodInputPackSchema` — `pay_period_timesheet_bind` + full `pay_period_input_lines` (DATA-01 columns, UQ/IX, soft-delete) |
| **F-PAY-PERIOD-BIND-01** | `GET/POST …/periods/:periodId/timesheet-binds` · `GET …/:bindId` · `POST …/:bindId/archive` |
| **F-PAY-PERIOD-INPUT-01** | `GET/POST/PATCH …/periods/:periodId/input-lines` · `POST …/:lineId/archive` |
| **F-PAY-ADV-BRIDGE-01** | EXPAND `mark-paid` (`payrollPeriodId` required) · `POST …/bridge-to-period` · reject archives bridged lines |
| **F-PAY-PERIOD-01 EXPAND** | `POST /periods` optional `timesheetBinds[]` + `boundTimesheetHeaderIds[]` |
| **F-PAY-ATT-CLOSED-01** | `loadAttHoursFromClosedLine` + `hasClosedAttendanceSheet` prefer bind table over EXISTS probe |
| **PROCESS SRC-03** | `loadPeriodInputAmount` returns `{id,amount,source_kind}` · `source_ref=period_input:{id}` · VAL-INP-SRC-03b throws on corrupt row |

**New files:** `pay-period-input-pack.service.ts` · `pay-period-bind-resolver.ts` · DTOs · constants

---

## Jest (exit 0)

```bash
pnpm --filter hrm-api exec jest src/payroll --no-cache
# 9 suites · 129 tests PASS

pnpm --filter hrm-api run build
# nest build + verify-dist PASS
```

| Test ID | Spec file | Verdict |
|---------|-----------|---------|
| VAL-INP-BIND-01 | `pay-period-input-pack.service.spec.ts` | open sheet → HRM-PAY-ATT-412 |
| VAL-INP-BIND-04 | `pay-period-input-pack.service.spec.ts` | scope_parity list↔get under `main` rollup |
| VAL-INP-SRC-03 | `pay-src-resolver.spec.ts` | row returns id + amount |
| VAL-INP-SRC-03b | `pay-src-resolver.spec.ts` | non-finite amount throws (no silent 0) |
| VAL-INP-ADV-01 | `pay-period-input-pack.service.spec.ts` | bridge upserts `source_kind=advance` |
| VAL-INP-LINE-03 | `pay-period-input-pack.service.spec.ts` | processed period → IMMUTABLE |

---

## QA dispatch (U65 browser)

**Persona:** `ceo@xe.vn` / HRM payroll AMIS Step4

| UF | Steps |
|----|-------|
| AC-AMIS-ATT-XFER-01 | Open draft period → bind closed sheet → list shows display label → process eligibility OK |
| AC-PAY-SRC-03 | POST input line (other_income) → process period → payslip line `source_tier=period_input` |
| Advance bridge | Approve advance → mark-paid with `payrollPeriodId` → input line `source_ref=advance_request_employee:{id}` |

**Cấm seed** · FE path only · F5 after mutate

---

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| FE Step4 UI packs | dev-fe | Routes LIVE; no FE in this wave |
| `payroll_e2e_ready` | — | remains **false** |
| RD `rd_transfer` materialize | future | PROCESS read path only via input line |

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | AMIS Step4 input pack BE: schema + bind/input CRUD + advance bridge + SRC-03/ATT-CLOSED bind preference · jest 129 PASS · build PASS |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-be-01.md` |
| **ack_status** | **READY_FOR_QA** |
