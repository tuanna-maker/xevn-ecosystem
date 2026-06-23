# QA — P1-HRM-H18-AC-FID-08-PAYSLIP retest (latest closed period payslip fidelity)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H18-AC-FID-08-PAYSLIP-QA` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-07 |
| **dev_evidence** | `docs/qa/evidence/p1-hrm-h18-ac-fid-08-payslip-20260606.md` |
| **matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` AC-FID-08 · CARD-PAY-01 |

## Verdict

**PASS_TO_PM** — Global `verify:hrm:menu-density` **7/7 PASS** (`payroll-fidelity` payslip_closed_ratio ≥ **0.90** all five UAT slugs on latest closed period 12/2025); independent AC-FID-08 SQL probe **PASS** (group **1905** payslips); L0 stack exit 0; L2 **P-CC-08 payroll tab** API **200** `HRM-PAY-200` with **80** scoped periods + **1833** payslips @ `main`; J-HRM-07 list row id present (carry-forward PASS — UI detail from list payload).

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
PASS  payroll-fidelity   payroll_periods=119 need>=10; payslip_closed_ratio need>=0.9 (holding=0.901@2025-12-31, trsport=0.903@2025-12-31, logistics=0.903@2025-12-31, finance=0.903@2025-12-31, services=0.903@2025-12-31)
PASS  recruitment-pipeline requisitions=38 candidates=55 need>=5
PASS  leave-requests     leave_requests=100 need>=5

=== Summary: 7/7 PASS ===
```

**Global payslips (DB):** **1905** (prior QA H17 wave **893** @ main API scope — seed wave +940 rows per dev evidence).

## AC-FID-08 — Per-company latest closed period payslip ratio ≥ 0.90

Formula: `payslip_ratio` = `COUNT(DISTINCT payroll_payslips.employee_id)` / `N_EMP(c)` for latest `payroll_periods.status='closed'` per slug.

Probe: `companyPayslipStats` via `seed-hrm-payslip-density.mjs` (QA session inline ESM probe)

| company_id | active_emp | with_payslip | ratio | period (closed) | Result |
|------------|------------|--------------|-------|-----------------|--------|
| **holding** | 213 | **192** | **0.901** | Kỳ lương 12/2025 — holding | **PASS** |
| **trsport** | 207 | **187** | **0.903** | Kỳ lương 12/2025 — trsport | **PASS** |
| **logistics** | 207 | **187** | **0.903** | Kỳ lương 12/2025 — logistics | **PASS** |
| **finance** | 207 | **187** | **0.903** | Kỳ lương 12/2025 — finance | **PASS** |
| **services** | 207 | **187** | **0.903** | Kỳ lương 12/2025 — services | **PASS** |

**Group total (DB):** **1905** payslips.

Probe exit: **0** — `=== AC-FID-08 PASS ===`

## L2 — P-CC-08 payroll embed (API spot)

Probe: `node ./scripts/tmp-p1-hrm-h17-pay-qa-probe.mjs`

| P-CC | Route | Menu API | HTTP | Code | Scoped rows | 409 | Result |
|------|-------|----------|------|------|-------------|-----|--------|
| P-CC-08 | `/command-center/hrm/payroll` | `GET /api/hrm/payroll/periods?company_id=main` | **200** | HRM-PAY-200 | **80** periods | none | **PASS** |
| P-CC-08 | `/command-center/hrm/payroll` | `GET /api/hrm/payroll/payslips?company_id=main&page_size=50` | **200** | HRM-PAY-200 | **1833** payslips | none | **PASS** |

**Note:** API rollup @ `main` returns **1833** payslips vs DB group **1905** — consistent with ADR scope ladder (rollup vs full group seed). L2 criterion: non-empty periods + payslips + no 409. Payslip count **increased** from H17 QA (**893**) confirming AC-FID-08 seed effect on scoped list.

## L2.5 — J-HRM-07 (carry-forward + post-seed corroboration)

| Journey | Click path | List HTTP | Row id | Result |
|---------|------------|-----------|--------|--------|
| J-HRM-07 | payroll tab → payslip row → detail dialog | **200** | `37be40e7-3f4a-4c7d-8337-7f4a115f0706` | **PASS** |

**Note:** `PayrollController` has `GET payslips` list only — no `GET payslips/:id`; UI detail uses list row payload (prior browser retest 2026-06-06 PASS). Post-seed API list non-empty (**1833**) removes prior J-HRM-07 data_gap risk.

## Defects / closure

| ID | Prior status | QA verdict |
|----|--------------|------------|
| **AC-FID-08** payslip ratio latest closed | ~0.07–0.45 per slug | **CLOSED** (all five slugs **≥ 0.901**) |
| **CARD-PAY-01** payslip cohort | sparse fidelity cohort | **CLOSED** (closed-period backfill **940** rows) |
| **menu-density payroll-fidelity** | periods only | **PASS** at **7/7** incl. payslip_closed_ratio |

## Residual (out of scope)

| ID | Owner | Note |
|----|-------|------|
| R-H10-02 | dev-be | `seed:hrm:fidelity` long TX / progress logging (unchanged) |
| **AC-FID-09+** | backlog | Recruitment / settings catalog per-company fidelity — separate waves |
| P-CC-08 browser iframe | qa | API L2 PASS; full iframe Eye-click not re-run this quick retest |

---

**completion_report:** **AC-FID-08 payslip density wave CLOSED** — all five UAT slugs latest closed period (12/2025) payslip_ratio **≥ 0.901**; global menu-density **7/7** (`payroll-fidelity` gate); L0 stack exit 0; P-CC-08 payroll tab **80** periods + **1833** payslips @ main, no 409; J-HRM-07 carry-forward PASS with non-empty payslip list post-seed. Residual: **AC-FID-09** recruitment pipeline fidelity (next wave).

**next_owner:** pm

**next_dispatch_prompt:** PM intake `P1-HRM-H18-AC-FID-08-PAYSLIP-QA` PASS_TO_PM — mark AC-FID-08 **CLOSED** in `HRM_MENU_DATA_LINKAGE_MATRIX.md` + `PM_FIDELITY_STATUS.json`; dispatch **AC-FID-09** recruitment pipeline wave (`P1-HRM-H19-AC-FID-09-REC` or dev backlog per PM priority); optional **qc** narrow re-gate for fidelity batch closeout (AC-FID-04..08 chain).

**evidence_path:** `docs/qa/evidence/p1-hrm-h18-ac-fid-08-payslip-qa-20260606.md`

**pm_dispatch_hint:** Payslip count @ main API (**1833**) now reflects seed; per-company SQL ratios independent of scope rollup — both probes required. Browser J-HRM-07 iframe click deferred GWC (API + prior browser sufficient).
