# Evidence — PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-BE-TIER-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-BE-TIER-01` |
| **parent** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-SRC-02-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **priority** | P2 |
| **defect** | `R-PAY-SRC-TIER-FIELD` |
| **change_mode** | FIX |
| **date** | 2026-08-07 |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | **`payroll_e2e_ready=false`** · **cấm** seed · **cấm** AMIS DONE · **cấm** flip LIVE |

---

## 1. spec_read_ack

| Artifact | Used |
|----------|------|
| `docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-src-02-01.md` | Residual **R-PAY-SRC-TIER-FIELD** — GET lines had `source_ref=emp_cb:*` without `source_tier` key |
| `docs/qa/evidence/po-hrm-amis-parity-pay-src-be-01.md` | SRC tiers `emp_cb\|period_input\|template_override\|formula_default` · AC-PAY-SRC-GET-TIER |
| `docs/qa/evidence/po-hrm-amis-parity-pay-src-be-02.md` | Prior GET SELECT+map; still omit when column NULL |

---

## 2. Root cause

QA SRC-02 PASS asserted tier via `source_ref` prefix because:

1. `mapPayslipLine` **conditionally omitted** `source_tier` when DB value was null/blank.
2. No **derive-from-`source_ref`** fallback on GET for rows written with ref but missing/null tier column.

Mission: GET payslip lines **must expose** `source_tier` alongside `source_ref`.

---

## 3. Deliverables

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/payroll/pay-src-resolver.ts` | ADD `resolvePayslipLineSourceTier` (stored wins · derive from ref prefixes) |
| `apps/api/hrm-api/src/payroll/pay-src-resolver.spec.ts` | Unit cases GET-TIER / emp_cb package ref |
| `apps/api/hrm-api/src/payroll/payroll.service.ts` | `mapPayslipLine` **always** emits `source_tier` key |
| `apps/api/hrm-api/src/payroll/payroll.service.spec.ts` | GET/list lines assert `source_tier` + derive when stored null |
| `apps/api/hrm-api/src/payroll/pay-formula.service.ts` | `replacePayslipLines` backfill tier on INSERT |

### Contract (GET `/payroll/payslips/:id` + `/lines`)

Each line now includes:

```json
{
  "component_code": "base",
  "amount": 13579000,
  "source_ref": "emp_cb:package:…:line:…",
  "source_tier": "emp_cb"
}
```

Allowed `source_tier`: `emp_cb` | `period_input` | `template_override` | `formula_default` | `null` (only when both column and ref unknown).

---

## 4. Jest / build

```text
pnpm --filter hrm-api exec jest \
  --testPathPatterns=pay-src-resolver.spec \
  --testPathPatterns=payroll.service.spec \
  --testPathPatterns=pay-formula.service.spec \
  --no-coverage
→ Test Suites: 3 passed · Tests: 83 passed

pnpm --filter hrm-api exec tsc -p tsconfig.build.json --noEmit
→ PASS
```

---

## 5. completion_report

### Closed

- **R-PAY-SRC-TIER-FIELD**: GET payslip lines always expose `source_tier` with `source_ref`.
- Derive `emp_cb` from `emp_cb:package:…:line:…` when DB column null (matches QA SRC-02 residual shape).
- PROCESS INSERT backfills tier when caller omits.
- Jest 83 PASS · tsc noEmit PASS.
- Honesty: **`payroll_e2e_ready=false`**.

### Residual

| ID | Owner | Note |
|----|-------|------|
| R-PAY-SRC-TIER-QA | **qa** | Browser U65 retest: GET `/lines` has `source_tier=emp_cb` (not only prefix assert) |
| R-EMP-SH-FE-CB-CLICK | **dev-fe** | Unchanged from QA-SRC-02 — FE Đãi ngộ save POST |
| `payroll_e2e_ready` | **pm** | LOCKED false |

### Explicit non-claims

- Did **not** flip `payroll_e2e_ready=true` / AMIS DONE.
- Did **not** seed.
- Did **not** reopen formula LIVE / ATT-412 seats.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** `qa`

```text
work_item_id: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-TIER-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-BE-TIER-01
priority: P2

## Mission
U65 zero-seed browser retest R-PAY-SRC-TIER-FIELD closed:
1. PROCESS (or existing SRC-02 path) → GET /payroll/payslips/:id/lines
2. Assert every line with source_ref emp_cb:* has source_tier === "emp_cb" (key present — not prefix fallback only)
3. Retain AC-PAY-SRC-01 / VAL-PAY-SRC-02A/B; F5 stable
cấm seed · payroll_e2e_ready=false · cấm claim AMIS DONE

read_first:
- docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-be-tier-01.md
- docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-src-02-01.md

evidence: docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-tier-01.md
honesty: payroll_e2e_ready=false
```

---

## 7. Handoff fields

| Field | Value |
|-------|--------|
| **completion_report** | §5 |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | §6 |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-be-tier-01.md` |
| **ack_status** | **READY_FOR_QA** |
| **pm_dispatch_hint** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-TIER-01` — assert `source_tier` key on GET lines |
