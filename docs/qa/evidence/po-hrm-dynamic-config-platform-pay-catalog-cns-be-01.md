# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-BE-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01` CONFIRMED Option **B** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-07 |
| **change_mode** | **ADD** (EXPAND consumer-write assert · **no** new table · **no** admin invent ban) |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `payroll_e2e_ready=false` · formula LIVE **DENIED** · PAY-CATALOG QC + EXT·EMP·DEC·CTR·LIST-TOTALS **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 zero-seed |

---

## 1. spec_read_ack

| Layer | Path / section |
|-------|----------------|
| **BA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md` §3–§7 · BR-PLT-PAY-01..08 · S-PAY-CNS-01..04 · VAL-PAY-CNS-01..05 · `HRM-SC-COMP-KEY` |
| **SA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md` L-PAY-AC-01..10 |
| **API** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-API-01.md` **F-PLT-PAY-COMP-01** picker SoT · admin **F-PLT-PAY-COMP-02** open retained |
| **BA evidence** | `docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-ba-01.md` |

---

## 2. completion_report

**Closed (BE):**

| Surf | Path | Assert |
|------|------|--------|
| **S-PAY-CNS-01** | `pay-sheet-template.service` `replaceLines` | `assertComponentIdInEffectiveCatalog` → **`HRM-SC-COMP-KEY`** |
| **S-PAY-CNS-02** | `pay-period-input-pack.service` create input / advance bridge | `assertComponentCodeInEffectiveCatalog` → **`HRM-SC-COMP-KEY`** |
| **S-PAY-CNS-03/04** | `employee-compensation.service` package create/revise lines | **ALL** derived `component_code` (explicit + allowance/base/probation) when Nest active **>0** |
| Shared helper | `salary-component-consumer-assert.ts` | count active → soft if **0** (AC-PLT-PAY-01b) · membership `lower(code)` / id · **same** `resolveHrmListScope` + `expandPayrollPeriodCompanyIds` as list (**U19**) |
| Taxonomy | `payroll-catalog.constants.ts` | **`HRM-SC-COMP-KEY`** primary; peer **`HRM-COMP-004`** documented **1:1 alias** (legacy compensation class) |
| Admin | **F-PLT-PAY-COMP-02** | **UNTOUCHED** — open N+1 retained (**L-PAY-AC-01** · **AC-PLT-PAY-01c**) |

**Cấm giữ:** no second catalog table · no seed · formula LIVE DENIED · no seal reopen · `payroll_e2e_ready=false`.

**Residual (not this seat):**

- FE picker rebind Nest **F-PLT-PAY-COMP-01** (`CNS-FE-01`) — Settings-only SoT remove (**VAL-PAY-CNS-06**)
- Formula soft warn GĐ1 (**VAL-PAY-CNS-07**) — no LIVE
- QA U65 browser AC-PLT-PAY-01/01b/01c/01H · AC-PAY-COMP-01

---

## 3. Error taxonomy (emit)

| Code | HTTP | When |
|------|------|------|
| **`HRM-SC-COMP-KEY`** | **422** (empty code **400**) | Consumer invent / OOS / retired when Nest effective active **>0** |
| Peer **`HRM-COMP-004`** | — | **1:1 alias** documented — BE now emits **`HRM-SC-COMP-KEY`** on compensation path (same membership semantics) |

---

## 4. Verification

```bash
cd apps/api/hrm-api
pnpm exec jest \
  src/payroll/salary-component-consumer-assert.spec.ts \
  src/payroll/pay-sheet-template.service.spec.ts \
  src/contracts-insurance/employee-compensation.service.spec.ts \
  src/payroll/pay-period-input-pack.service.spec.ts \
  src/payroll/payroll-catalog.service.spec.ts \
  --no-cache
# Test Suites: 5 passed · Tests: 54 passed
```

| VAL | Result |
|-----|--------|
| **VAL-PAY-CNS-01** template invent | PASS · `HRM-SC-COMP-KEY` |
| **VAL-PAY-CNS-02** compensation invent | PASS · `HRM-SC-COMP-KEY` |
| **VAL-PAY-CNS-03** scope_parity | PASS · COUNT scope ≡ membership scope; group CEO `main`→holding; member OOS KEY |
| **VAL-PAY-CNS-04** period/pack invent | PASS · `HRM-SC-COMP-KEY` |
| **VAL-PAY-CNS-05** retired | PASS · reject |
| Empty Nest soft allow | PASS · invent code → `null` (no seed) |
| Admin open catalog N+1 | PASS · payroll-catalog suite retained |

---

## 5. Files touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/payroll/salary-component-consumer-assert.ts` | **ADD** shared assert |
| `apps/api/hrm-api/src/payroll/salary-component-consumer-assert.spec.ts` | **ADD** VAL-PAY-CNS-01..05 |
| `apps/api/hrm-api/src/payroll/payroll-catalog.constants.ts` | `HRM_SC_COMP_KEY` + alias note |
| `apps/api/hrm-api/src/payroll/pay-sheet-template.service.ts` | wire CNS-01 |
| `apps/api/hrm-api/src/payroll/pay-period-input-pack.service.ts` | wire CNS-02 |
| `apps/api/hrm-api/src/contracts-insurance/employee-compensation.service.ts` | wire CNS-03/04 |
| `*.spec.ts` peers | expect KEY · COUNT mocks |

---

## 6. Handoff

- **next_owner:** `qa`
- **ack_status:** `READY_FOR_QA`
- **evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-cns-be-01.md`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-QA-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-BE-01
program: PO-HRM-CONTINUOUS-W8-20260807

read_first:
1. docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-cns-be-01.md
2. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md §6 AC-PLT-PAY-01* · AC-PAY-COMP-01
3. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-API-01.md F-PLT-PAY-COMP-01

entry_criteria: L0 stack up; hrm-api :28001; browser-only U65; ceo@xe.vn / Xevn@2026; Nest SC active≥1 from admin/Allowance (no seed in evidence)
exit_criteria:
- AC-PAY-COMP-01: invent unknown component_code on template line and/or compensation → Network 4xx HRM-SC-COMP-KEY · no F5 persist
- Spot S-PAY-CNS-02 pack invent → 4xx same taxonomy (or note FE not exposed)
- Admin S-PAY-ADM-01 CREATE N+1 still 201 (AC-PLT-PAY-01c) — must_keep
- Honesty: payroll_e2e_ready=false · formula LIVE DENIED · seals RETAIN · C-SLICE-≠-MODULE
- evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-cns-qa-01.md
- ack_status: PASS_TO_PM or FAIL with defect

cấm: seed · API-only UF 🟢 · flip payroll_e2e_ready · reopen PAY-CATALOG/EXT/EMP/DEC/CTR/LIST-TOTALS · claim module UAT
parallel residual: CNS-FE-01 picker rebind Nest (if not already dispatched)
```
