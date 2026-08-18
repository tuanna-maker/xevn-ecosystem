# Evidence — PO-HRM-AMIS-PARITY-PAY-SRC-BE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-SRC-BE-02` |
| **parent** | `PO-HRM-AMIS-PARITY-PAY-SRC-BE-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **change_mode** | FIX |
| **defect** | `D-PAY-SRC-01` — QA FAIL `po-hrm-amis-parity-pay-src-qa-01.md` |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | **`payroll_e2e_ready=false`** · **cấm** seed · **cấm** reopen L1 formula seats · **cấm** claim AMIS DONE |

---

## 1. Root cause (live)

1. **BASE ↔ `LUONG_CO_BAN` alias** — template/catalog uses `LUONG_CO_BAN`; C&B lines use `component_code=base` / `line_type=base`. Matcher needed harden + soft backfill when column empty.
2. **asOfDate** — period `end_date` as pg `Date` / ISO must coerce via `toLeaveDayKey` before C&B effective window SQL.
3. **Bound formula columns** — when no template snapshot, PROCESS listed formula `component_code` with `formula_definition_id=null`, so amounts never fell to formula_default after emp_cb miss.
4. **GET lines** — `source_tier` was written on PROCESS but **not** SELECTed/mapped on GET (AC-PAY-SRC-GET-TIER).

Multi-employee period `d92d3bbb` still fail-fasts on first NV **without** C&B when bound formula needs `base_salary` vars — **not** silent zero; QA AC-PAY-SRC-01 should use NV002-only enroll (or period with C&B coverage).

---

## 2. spec_read_ack

| Artifact | Used |
|----------|------|
| `docs/qa/evidence/po-hrm-amis-parity-pay-src-qa-01.md` | D-PAY-SRC-01 · AC-PAY-SRC-01/06 |
| `docs/qa/evidence/po-hrm-amis-parity-pay-depth-01.md` §3 | BR-AMIS-PAY-SRC-02 |
| `docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-be-src-02-01.md` | component_code backfill |

---

## 3. Files touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/payroll/pay-src-resolver.ts` | Alias harden · `normalizePayrollAsOfDate` · `ensureCompensationComponentCodeForSrc` · export `componentCodesMatch` |
| `apps/api/hrm-api/src/payroll/pay-formula.service.ts` | Bound formula → formula_default (`override_applied===true` strict OV-C) · alias match on formula line extract |
| `apps/api/hrm-api/src/payroll/payroll.service.ts` | GET lines expose `source_tier` |
| `apps/api/hrm-api/src/payroll/pay-src-resolver.spec.ts` | LUONG_CO_BAN ↔ base · Date asOf |
| `apps/api/hrm-api/src/payroll/pay-formula.service.spec.ts` | SRC-02 LUONG_CO_BAN snapshot → emp_cb |

---

## 4. Jest

```text
pnpm --filter hrm-api exec jest \
  --testPathPatterns=pay-src-resolver.spec \
  --testPathPatterns=pay-formula.service.spec \
  --testPathPatterns=payroll.service.spec \
  --no-coverage
→ Test Suites: 3 passed · Tests: 78 passed
```

`tsc -p tsconfig.build.json --noEmit` PASS · `pnpm --filter hrm-api run build` + `verify-dist` PASS.

---

## 5. Live repro (product path — zero seed)

| Step | Result |
|------|--------|
| Active C&B NV002 | package `084a6c66-…` · line base **9_500_000** · `component_code=base` |
| Create period `QA-SRC-BE02-EMP-CB` · enroll **explicit NV002 only** · process | **201** `HRM-PAY-202` · gross **9_500_000** |
| GET `/payroll/payslips/{id}/lines` | `amount=9500000` · `source_ref=emp_cb:package:084a6c66-…:line:87c46658-…` · **`source_tier=emp_cb`** |

Note: isolated enroll used temporary `HRM_PAY_REQUIRE_CLOSED_TIMESHEET=0` only for ATT-free far-future period; stack restarted afterward with **default ATT-412 gate**. QA browser must use closed-sheet month / bind per matrix (U65).

---

## 6. completion_report

### Closed

- D-PAY-SRC-01: emp_cb wins for BASE / LUONG_CO_BAN on PROCESS when C&B base line present.
- Soft component_code ensure/backfill on SRC load path.
- GET lines expose `source_tier` for AC-PAY-SRC-06 / GET-TIER.
- Regression jest 78 PASS · nest build PASS · live NV002 process → emp_cb.

### Residual

| ID | Note | Owner |
|----|------|-------|
| R-PAY-SRC-MULTI | Period with mixed C&B coverage still fail-fasts on first employee missing vars | qa note / later soft-skip policy |
| R-PAY-SRC-QA | Browser U65 retest AC-PAY-SRC-01/06 | **qa** |
| `payroll_e2e_ready` | LOCKED **false** | pm |

### Explicit non-claims

- Did **not** flip `payroll_e2e_ready=true` / AMIS DONE.
- Did **not** seed.
- Did **not** reopen formula L1 seats.

---

## 7. next_owner / next_dispatch_prompt

**next_owner:** `qa`

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-SRC-QA-02
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-AMIS-PARITY-PAY-SRC-BE-02
prior: PO-HRM-AMIS-PARITY-PAY-SRC-BE-02 READY_FOR_QA
priority: P0

## Mission
Retest AC-PAY-SRC-01 + AC-PAY-SRC-06 / AC-PAY-SRC-GET-TIER (U65 zero-seed browser):
1. holding · NV002 active C&B 9.5M · enroll NV002 (prefer period with closed sheet / avoid multi-emp without C&B)
2. PROCESS → expect 2xx · payslip line amount 9.5M · source_tier=emp_cb · source_ref emp_cb:package:…:line:…
3. GET payslip lines includes source_tier
4. Retain AC-PAY-SRC-04 ATT-412 · AC-PAY-SRC-05 FORMULA-412 not silent 0
cấm seed · payroll_e2e_ready=false · cấm claim AMIS DONE

read_first:
- docs/qa/evidence/po-hrm-amis-parity-pay-src-be-02.md
- docs/qa/evidence/po-hrm-amis-parity-pay-src-qa-01.md (prior FAIL)

evidence: docs/qa/evidence/po-hrm-amis-parity-pay-src-qa-02.md
```

---

## 8. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | §6 |
| **next_owner** | `qa` |
| **next_dispatch_prompt** | §7 |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-src-be-02.md` |
| **ack_status** | **READY_FOR_QA** |
