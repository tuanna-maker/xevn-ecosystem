# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-BE-PROCESS-FORMULA-412-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-BE-PROCESS-FORMULA-412-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **date** | 2026-08-07 |
| **lane** | execution |
| **priority** | P1 |
| **parent** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-PROCESS-POST-01` |
| **prior_fail** | stamp `PAYW3PROC-MSISALZ0` · POST `/process` **412** `HRM-PAY-FORMULA-412-VARS` |
| **overlap** | `PO-HRM-AMIS-PARITY-PAY-SRC-BE-02` (BASE↔LUONG_CO_BAN emp_cb) — **retained**; this seat fixes evaluate gate |
| **ack_status** | **`READY_FOR_QA`** |
| **U65** | zero-seed · no `pnpm seed:*` |
| **honesty** | **`payroll_e2e_ready=false`** LOCKED · cấm claim LIVE / module UAT |

---

## 1. Root cause

QA Sep draft `d92d3bbb-…` bound **company_active** formula with:

- `expression_json`: `gd1_eval_v1` line `source: const` amount **7_500_000** (BASE) — **does not reference** `base_salary`
- `required_vars_json.keys`: `["base_salary"]` — **stale publish metadata**

`evaluateBoundFormula` unioned expression keys **+** required_vars → hard-gated `base_salary`. First enrolled NV without CORE C&B → warnings `CB_PACKAGE_ABSENT` (+ bag `CATALOG_FORMULA_TEXT_FORBIDDEN`) → **412** `HRM-PAY-FORMULA-412-VARS` → fail-fast whole batch.

**Not** a missing emp_cb alias for NV with package (SRC-BE-02 already maps BASE↔LUONG_CO_BAN). Multi-emp residual `R-PAY-SRC-MULTI` was a symptom of this false gate on const formulas.

---

## 2. Fix (product)

| Change | Behavior |
|--------|----------|
| `evaluateBoundFormula` | Hard gate = `collectExpressionVarKeys(expressionJson)` **only** |
| Stale required_vars | Soft warning `REQUIRED_VARS_DECLARED_UNUSED:{keys}` — no 412 |
| Retain | `var`/`expr` that need `base_salary` + `CB_PACKAGE_ABSENT` → still **412** VARS (AC-CB2) |
| Retain | emp_cb short-circuit when C&B base present (SRC-BE-02) |
| Retain | `payroll_e2e_ready=false` on process response |

### Files

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/payroll/pay-formula.service.ts` | Expression-only var gate + CODE-MEMORY APPEND |
| `apps/api/hrm-api/src/payroll/pay-formula-evaluator.ts` | Doc `collectExpressionVarKeys` evaluate vs declare |
| `apps/api/hrm-api/src/payroll/pay-formula.service.spec.ts` | W3 const + stale required + no C&B → computed |
| `apps/api/hrm-api/src/payroll/pay-formula-evaluator.spec.ts` | expr-only empty for const; union still for declare |

---

## 3. Verification

### Jest

```text
pnpm --filter hrm-api exec jest \
  --testPathPatterns=pay-formula-evaluator.spec \
  --testPathPatterns=pay-formula.service.spec \
  --testPathPatterns=pay-src-resolver.spec \
  --no-coverage
→ Test Suites: 3 passed · Tests: 48 passed
```

`tsc -p tsconfig.build.json --noEmit` PASS · `pnpm --filter hrm-api run build` + `verify-dist` PASS · dist marker `REQUIRED_VARS_DECLARED_UNUSED` present.

### Live product path (U65 — no seed)

After restart `hrm-api` `start:prod` with new dist:

| Check | Result |
|-------|--------|
| POST `/payroll/periods/d92d3bbb-…/process` | **2xx path** — period → **`processed`** (`processed_at` 2026-08-07T10:20:34Z) |
| Re-POST same period | **409** `HRM-PAY-003` (only draft) — confirms prior success |
| Payslips | **53** status `processed` · **53** gross &gt; 0 |
| NV002 BASE | **9_500_000** · `source_tier=emp_cb` · `source_ref=emp_cb:package:084a6c66-…` |
| HLD-0001 BASE | **12_000_000** · `source_tier=emp_cb` |
| PORTAL-GCEO BASE (no C&B) | **7_500_000** const / formula path — **not** silent 0 blocked |
| Honesty | process body keeps **`payroll_e2e_ready=false`** (no flip) |

---

## 4. FE precondition (deterministic AC — when formula **uses** vars)

| Case | Expected |
|------|----------|
| Formula line `source: var` / `expr` references `base_salary` | Employee **must** have active CORE C&B base (or period_input / OV-C) as of period end — else **412** `HRM-PAY-FORMULA-412-VARS` + `CB_PACKAGE_ABSENT` |
| Formula line `source: const` only | C&B **not** required for that component; stale `required_vars` alone **must not** 412 |
| ATT closed same month | Still required when expression needs ATT hour vars / ATT-412 gate (`HRM_PAY_REQUIRE_CLOSED_TIMESHEET` default) |

**Browser QA note:** period `d92d3bbb` is now **processed** (live BE proof). Retest J-HRM-07 process-post on a **new draft** with ATT closed same month (create via FE Tính lương — U65), or another draft+ATT candidate — expect POST `/process` **2xx**.

---

## 5. Residuals

| ID | Status | Note |
|----|--------|------|
| `R-PAY-W3-PROCESS-FORMULA-412-VARS` | **CLOSED** (BE) | false gate fixed; live process proven |
| `R-PAY-SRC-MULTI` | **MITIGATED** for const/stale-required | True `var:base_salary` without C&B still fail-fast per AC-CB2 |
| TDZ `R-PAY-BATCHES-SHOWADD-TDZ` | **CLOSED retained** | not touched |
| `payroll_e2e_ready` | **LOCKED false** | |
| QA browser retest | **OPEN** | need fresh draft (Sep target already processed) |

---

## 6. Explicit non-claims

- Did **not** flip `payroll_e2e_ready=true` / formula LIVE / module UAT.
- Did **not** seed.
- Did **not** reopen showAddDialog TDZ / payslip-GET / ATT-LINE seats.

---

## completion_report

- **Closed:** Diagnose stale `required_vars` vs const expression; FIX evaluate hard-gate; jest 48 PASS; nest build; live Sep `d92d3bbb` process → processed 53/53; emp_cb retained for NV002/HLD-0001; honesty false.
- **Open:** QA browser Khóa on **new** draft+ATT closed (U65).
- **Residual:** true var-bag miss still 412 (by design).

## next_owner

**qa**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-PROCESS-POST-02
from_role: pm
to_role: qa
lane: execution
priority: P1
parent: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-BE-PROCESS-FORMULA-412-01

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-be-process-formula-412-01.md
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qa-process-post-01.md

Mission (U65 browser-only · zero-seed):
1. L0 qc:dev-stack + fe-be-health
2. Pick/create draft period with ATT closed same month — NOT already-processed d92d3bbb (BE live-proof already)
3. Enroll ≥1 NV (or preexisting) → Khóa → confirm
4. Expect Network POST /process **2xx**; period processed; payslip/lines UI; F5 persist
5. Honesty: payroll_e2e_ready=false; DENY LIVE claim; TDZ not reopened
6. Optional spot: employee with C&B → source_tier emp_cb on BASE when package present

evidence_path: docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qa-process-post-02.md
ack_status: PASS_TO_PM or FAIL_TO_PM
cấm: seed · flip ready=true · reopen TDZ
```

## ack_status

**`READY_FOR_QA`**
