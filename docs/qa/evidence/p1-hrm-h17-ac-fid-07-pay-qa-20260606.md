# QA — P1-HRM-H17-AC-FID-07-PAY retest (payroll period fidelity)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H17-AC-FID-07-PAY-QA` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-07 |
| **dev_evidence** | `docs/qa/evidence/p1-hrm-h17-ac-fid-07-pay-20260606.md` |
| **matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` AC-FID-07 · CARD-PAY-01 |

## Verdict

**PASS_TO_PM** — Global `verify:hrm:menu-density` **7/7 PASS** (`payroll_periods=119`); AC-FID-07 group **119** ≥ **60**; per-company **all five UAT slugs** meet CARD-PAY-01 (`period_count` ≥ 12); L0 stack exit 0; L2 **P-CC-08 payroll tab** API **200** `HRM-PAY-200` with **80** scoped periods + **893** payslips @ `main`; J-HRM-07 list row id present (carry-forward PASS — UI detail from list payload).

## Environment

| Item | Value |
|------|-------|
| Portal | `http://127.0.0.1:5173` |
| hrm-api | `http://127.0.0.1:28001` |
| xbos-api | `http://127.0.0.1:28002` |
| Account | `ceo@xe.vn` / `Xevn@2026` |
| Scope | `company_id=main` |
| DB | `xevn_hrm` via deploy env |

## L0 — Stack + density gates

| Check | Command | Result |
|-------|---------|--------|
| Dev stack | `pnpm run qc:dev-stack` | **exit 0** — hrm-api, xbos-api, web-portal **200** |
| Menu density | `pnpm run verify:hrm:menu-density` | **exit 0** — **7/7 PASS** |

### Density counts (QA session)

```
PASS  employees          employees=1190 (need >=1000)
PASS  contracts-ratio    contracts=1275 active=1122 ratio=1.136 need>=0.85
PASS  insurance-ratio    insurance=2152 ratio need>=0.85
PASS  attendance-scale   attendance=13291 need>=22
PASS  payroll-periods    payroll_periods=119 need>=10
PASS  recruitment-pipeline requisitions=38 candidates=55 need>=5
PASS  leave-requests     leave_requests=100 need>=5

=== Summary: 7/7 PASS ===
```

## AC-FID-07 — Per-company CARD-PAY-01 + group ≥ 60

Probe: `node ./scripts/tmp-p1-hrm-acfid07-probe.mjs`

| company_id | period_count | target | Result |
|------------|--------------|--------|--------|
| **holding** | **21** | 12 | **PASS** |
| **trsport** | **21** | 12 | **PASS** |
| **logistics** | **21** | 12 | **PASS** |
| **finance** | **21** | 12 | **PASS** |
| **services** | **21** | 12 | **PASS** |

**Group total (DB):** **119** payroll periods (≥ **60**).

**Status mix (DB):** closed **69**, draft **19**, processed **31**.

Probe exit: **0** — `=== AC-FID-07 PASS ===`

## L2 — P-CC-08 payroll embed (API spot)

Probe: `node ./scripts/tmp-p1-hrm-h17-pay-qa-probe.mjs`

| P-CC | Route | Menu API | HTTP | Code | Scoped rows | 409 | Result |
|------|-------|----------|------|------|-------------|-----|--------|
| P-CC-08 | `/command-center/hrm/payroll` | `GET /api/hrm/payroll/periods?company_id=main` | **200** | HRM-PAY-200 | **80** periods | none | **PASS** |
| P-CC-08 | `/command-center/hrm/payroll` | `GET /api/hrm/payroll/payslips?company_id=main&page_size=50` | **200** | HRM-PAY-200 | **893** payslips | none | **PASS** |

**Note:** API rollup @ `main` returns **80** periods vs DB group **119** — consistent with ADR scope ladder (rollup vs full group seed). L2 criterion: non-empty periods + payslips + no 409.

## L2.5 — J-HRM-07 (carry-forward)

| Journey | Click path | List HTTP | Row id | Result |
|---------|------------|-----------|--------|--------|
| J-HRM-07 | payroll tab → payslip row → detail dialog | **200** | `37be40e7-…` | **PASS** |

**Note:** `PayrollController` has `GET payslips` list only — no `GET payslips/:id`; UI detail uses list row payload (prior browser retest 2026-06-06 PASS).

## Defects / closure

| ID | Prior status | QA verdict |
|----|--------------|------------|
| **AC-FID-07** group payroll periods | sparse **59** group | **CLOSED** (DB **119** ≥ 60) |
| **CARD-PAY-01** per-company | below 12/slug | **CLOSED** (all five slugs **21** ≥ 12) |
| **menu-density payroll-periods** | need ≥10 only | **PASS** at **119** |

## Residual (out of scope)

| ID | Owner | Note |
|----|-------|------|
| R-H10-02 | dev-be | `seed:hrm:fidelity` long TX / progress logging (unchanged) |
| **AC-FID-08** | backlog | Payslip ratio ≥ 0.90 latest closed period — separate wave |
| P-CC-08 browser iframe | qa | API L2 PASS; full iframe Eye-click not re-run this quick retest |

---

**completion_report:** **AC-FID-07 payroll period wave CLOSED** — DB group **119** ≥ **60**; all five UAT slugs CARD-PAY-01 **PASS**; global menu-density **7/7** (`payroll_periods=119`); L0 stack exit 0; P-CC-08 payroll tab **80** periods + **893** payslips @ main, no 409; J-HRM-07 carry-forward PASS. Residual: **AC-FID-08** payslip ratio (separate wave).

**next_owner:** pm

**next_dispatch_prompt:** PM intake `P1-HRM-H17-AC-FID-07-PAY-QA` PASS_TO_PM — mark AC-FID-07 **CLOSED** in `HRM_MENU_DATA_LINKAGE_MATRIX.md` + `PM_FIDELITY_STATUS.json`; dispatch **AC-FID-08** payslip-ratio wave (`P1-HRM-H18-AC-FID-08-PAYSLIP` or dev backlog) unless PM defers; optional **qc** narrow re-gate for fidelity batch closeout (AC-FID-04..07 chain).

**evidence_path:** `docs/qa/evidence/p1-hrm-h17-ac-fid-07-pay-qa-20260606.md`

**pm_dispatch_hint:** Payroll fidelity parity with leave/attendance — per-company SQL probe required; global gate alone insufficient. QA confirmed dev seed counts match live DB; API @ main scoped period count (80) ≠ DB group total (119) by design (rollup scope).
