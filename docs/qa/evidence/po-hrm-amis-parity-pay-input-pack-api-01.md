# Evidence — PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01` |
| **parent** | `PO-HRM-AMIS-PARITY-RESEARCH-01` |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-DATA-01` PASS · TPL-API-01 · formula API-01 CONFIRMED |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **change_mode** | ADD / EXPAND · docs-only · **no** `apps/**` · **no** seed |
| **ack_status** | **PASS_TO_PM** |
| **honesty** | `payroll_e2e_ready=false` · **cấm** invent LIVE · bind/input tables **PAPER** until BE |

---

## 1. spec_read_ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `po-hrm-amis-parity-pay-input-pack-data-01.md` | CONFIRMED DDL · BR-SRC-03 · advance bridge · alias lock |
| 2 | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-DATA-01.md` | Physical §2–§7 · validation matrix |
| 3 | `po-hrm-amis-parity-pay-depth-01.md` §3 | BR-AMIS-PAY-SRC-01..05 · AC-PAY-SRC-03 |
| 4 | `PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md` | F.1 pattern · SRC resolver outline · scope_parity |
| 5 | `API_DESIGN_HRM_ENTERPRISE.md` §4 PAY | PERIOD/PROCESS/ATT-CLOSED pointers |
| 6 | `ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` | Open catalog · soft-delete |
| 7 | Nest payroll (read-only) | `advance-requests*` LIVE · bind table ABSENT · `pay-src-resolver` probe input PAPER |

---

## 2. Deliverables

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01.md`](../../program/specs/PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01.md) | **CONFIRMED** F.1 SoT — BIND/INPUT/ADV-BRIDGE · PROCESS SRC-03 EXPAND · errors · Dev unlock |
| `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md` | DOC-DELTA ADD — F-PAY-PERIOD-BIND/INPUT/ADV-BRIDGE · EXPAND PERIOD/PROCESS · §7.2/§7.3 |

**Không đụng:** `apps/**` · seed · invent LIVE · reopen formula/TPL F.1 · alias bind to `att_timesheet_line`.

---

## 3. F.1 coverage checklist

| F-id | Mục đích · Nghiệp vụ · bước SRS · DTO↔DATA | Verdict |
|------|---------------------------------------------|---------|
| **F-PAY-PERIOD-BIND-01** LIST/GET | Scope parity · display-ready sheet join · soft archive filter | **PASS** |
| **F-PAY-PERIOD-BIND-01** CREATE | Assert closed ATT-412 · overlap · UQ · no hours on bind | **PASS** |
| **F-PAY-PERIOD-BIND-01** ARCHIVE | Soft unbind before process | **PASS** |
| **F-PAY-PERIOD-INPUT-01** LIST/GET | Filters · display-ready employee/component | **PASS** |
| **F-PAY-PERIOD-INPUT-01** UPSERT | Open catalog component · source_kind · immutability | **PASS** |
| **F-PAY-PERIOD-INPUT-01** ARCHIVE | Soft delete pack row | **PASS** |
| **F-PAY-ADV-BRIDGE-01** EXPAND mark-paid | payrollPeriodId · upsert advance input lines · idempotent | **PASS** |
| **F-PAY-ADV-BRIDGE-01** bridge-to-period | Admin re-sync | **PASS** |
| **F-PAY-ADV-BRIDGE-01** reject revoke | Archive bridged lines | **PASS** |
| **F-PAY-PERIOD-01** EXPAND | Optional timesheetBinds on create | **PASS** |
| **F-PAY-PROCESS-01** EXPAND | SRC-03 tier 2 · source_tier=period_input · no live advance join | **PASS** |
| Alias bind ≠ ATT-LINE | DATA §1 · ATT-LINE-01 retain | **PASS** |
| Formula / TPL | Explicit non-touch | **PASS** |

---

## 4. Path & table locks

| Item | Lock |
|------|------|
| Nest tables (ADD) | `pay_period_timesheet_bind` · `pay_period_input_lines` |
| Bind FK | `timesheet_header_id` → `attendance_sheets.id` |
| Hours SoT | `att_timesheet_line` — **ATT-LINE-01 unchanged** |
| Nest HTTP (bind) | `/api/hrm/payroll/periods/:periodId/timesheet-binds*` |
| Nest HTTP (input) | `/api/hrm/payroll/periods/:periodId/input-lines*` |
| Advance bridge | EXPAND `/advance-requests/:id/mark-paid` + optional `/bridge-to-period` |
| SRC-03 audit | `source_tier=period_input` · `source_ref=period_input:{id}` |

---

## 5. Architecture decisions (SA)

| Decision | Rationale |
|----------|-----------|
| Period-nested routes | Consistent with `bind-sheet-template` · scope via period id |
| PROCESS reads input lines only | BR-PAY-ADV-BRIDGE-04 — deterministic evaluate · no mid-flight join |
| mark-paid requires payrollPeriodId | Fixes TEXT `salary_period` grain gap (DATA §4.1) |
| SRC-03 before template | AMIS precedence · depth-01 BR-AMIS-PAY-SRC-03 |
| Open source_kind | Platform Option B · no closed enum |

---

## 6. Staging honesty

| Capability | Docs | LIVE / UAT |
|------------|------|------------|
| BIND/INPUT/ADV-BRIDGE F.1 | **CONFIRMED** | Unlocked for **dev-be** |
| PROCESS SRC-03 full | Contract EXPAND | After BE wire + optional ATT-LINE LIVE |
| AMIS Step4 UAT | Not claimed | U65 after QA AC-PAY-SRC-03 |

---

## completion_report

### Closed

1. **CONFIRMED F.1** `F-PAY-PERIOD-BIND-01` — LIST/CREATE/ARCHIVE `pay_period_timesheet_bind` with ATT-412 closed gate and scope_parity.
2. **CONFIRMED F.1** `F-PAY-PERIOD-INPUT-01` — CRUD `pay_period_input_lines` for other_income/manual/rd_transfer/advance pack rows.
3. **CONFIRMED F.1** `F-PAY-ADV-BRIDGE-01` — EXPAND mark-paid + bridge-to-period + reject archive; idempotent upsert per BR-PAY-ADV-BRIDGE-*.
4. **EXPAND** F-PAY-PROCESS-01 — SRC tier 2 BR-AMIS-PAY-SRC-03: active input line amount wins; audit `source_tier=period_input`.
5. **EXPAND** F-PAY-PERIOD-01 — optional binds on period create.
6. Client DOC-DELTA ADD-only appended to enterprise API blueprint.
7. **Alias lock** documented: bind header ≠ `att_timesheet_line`; ATT-LINE-01 retained.
8. **No** `apps/**`; `payroll_e2e_ready=false`.

### Residual

| ID | Owner |
|----|-------|
| ensureSchema + HTTP routes + bridge wire | **dev-be** BE-01 |
| AC-PAY-SRC-03 · AC-AMIS-ATT-XFER-01 U65 | **qa** |
| Optional `input_pack_flags` header | P2 defer |
| Sponsor Q1 other-income P0 vs P1 | pm (unchanged) |

---

## next_owner

**pm** → dispatch **dev-be** `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-01`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P0
parent: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01
entry_criteria: API F.1 CONFIRMED — docs/program/specs/PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01.md + docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-api-01.md

## Mission
Implement AMIS Step4 input packs per CONFIRMED F.1:
- ensureSchema pay_period_timesheet_bind + pay_period_input_lines (align DATA-01 columns: quantity, source_ref, bound_by, transfer_kind, etc.)
- Routes: GET/POST …/periods/:periodId/timesheet-binds · archive · GET/POST/PATCH …/input-lines · archive
- EXPAND markAdvanceRequestPaid: require payrollPeriodId · upsert input lines source_kind=advance · idempotent source_ref
- POST bridge-to-period · archive on reject per ADV-BRIDGE-03
- Wire F-PAY-ATT-CLOSED-01 to prefer bind table over EXISTS probe when present
- PROCESS: SRC-03 loadPeriodInputAmount must not silent-fail when row exists (VAL-INP-SRC-03b)
- scope_parity jest: bind list id = get-by-id under main rollup
- Retain att_timesheet_line per ATT-LINE-01 — separate from bind

## read_first
- docs/program/specs/PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01.md
- docs/program/specs/PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-DATA-01.md
- docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-api-01.md
- apps/api/hrm-api/src/payroll/pay-src-resolver.ts (extend, do not rewrite formula wave)

## spec_read_ack required
change_mode: ADD
must_keep: formula F.1 · TPL F.1 · ATT-LINE-01 · scope_parity · payroll_e2e_ready=false
forbidden_paths: unrelated payroll modules

## Exit
READY_FOR_QA
- jest: VAL-INP-BIND-01 closed gate · VAL-INP-SRC-03 source_tier · VAL-INP-ADV-01 bridge idempotent
- evidence: docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-be-01.md
ack_status: READY_FOR_QA
```

---

## evidence_path

`docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-api-01.md`

## ack_status

**PASS_TO_PM**
