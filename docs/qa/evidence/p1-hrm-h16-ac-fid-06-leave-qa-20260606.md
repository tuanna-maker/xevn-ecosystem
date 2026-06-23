# QA — P1-HRM-H16-AC-FID-06-LEAVE retest (leave fidelity)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H16-AC-FID-06-LEAVE-QA` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-07 |
| **dev_evidence** | `docs/qa/evidence/p1-hrm-h16-ac-fid-06-leave-20260606.md` |
| **matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` AC-FID-06 · CARD-LVE-01 |

## Verdict

**PASS_TO_PM** — Global `verify:hrm:menu-density` **7/7 PASS** (`leave_requests=100`); AC-FID-06 group **100** ≥ **100**; per-company **all five UAT slugs** meet CARD-LVE-01 (`leave_count` ≥ target); L2 **P-CC-07 leave tab** API **200** `HRM-LEAVE-200` with **75** scoped rows @ `main`, pending+approved mix; scope parity list→employee **200**.

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
PASS  payroll-periods    payroll_periods=59 need>=10
PASS  recruitment-pipeline requisitions=38 candidates=55 need>=5
PASS  leave-requests     leave_requests=100 need>=5

=== Summary: 7/7 PASS ===
```

## AC-FID-06 — Per-company CARD-LVE-01 + group ≥ 100

Probe: `node ./scripts/tmp-p1-hrm-acfid06-probe.mjs`

| company_id | active_emp | leave_count | target | Result |
|------------|------------|-------------|--------|--------|
| **holding** | 213 | **15** | 11 | **PASS** |
| **trsport** | 207 | **15** | 11 | **PASS** |
| **logistics** | 207 | **15** | 11 | **PASS** |
| **finance** | 207 | **15** | 11 | **PASS** |
| **services** | 207 | **15** | 11 | **PASS** |

**Group total (DB):** **100** leave requests (≥ **100**).

**Status mix (DB):** approved **48**, pending **27**, rejected **25**.

Probe exit: **0** — `=== AC-FID-06 PASS ===`

## L2 — P-CC-07 attendance embed leave tab (API spot)

Probe: `node ./scripts/tmp-p1-hrm-h16-leave-qa-probe.mjs`

| P-CC | Route | Menu API | HTTP | Code | Scoped rows | Status mix (page) | 409 | Result |
|------|-------|----------|------|------|-------------|-------------------|-----|--------|
| P-CC-07 | `/command-center/hrm/attendance` (leave tab) | `/api/hrm/attendance/leave-requests?company_id=main&page_size=100` | **200** | HRM-LEAVE-200 | **75** | approved 27 · pending 23 · rejected 25 | none | **PASS** |

**Note:** API rollup @ `main` returns **75** rows (scoped workforce join); DB group fidelity **100** includes group top-up rows — both consistent with ADR scope ladder. L2 criterion: non-empty list + pending/approved mix + no 409.

## Scope parity — leave row → employee detail

| From | Click path | List HTTP | Detail HTTP | Result |
|------|------------|-----------|-------------|--------|
| P-CC-07 leave tab | row `bf9ac32e-…` → `GET /api/hrm/employees/3796d949-4513-45c0-88fa-33030a062b17?company_id=main` | **200** | **200** | **PASS** |

## Defects / closure

| ID | Prior status | QA verdict |
|----|--------------|------------|
| **AC-FID-06** group leave density | sparse ~25 group | **CLOSED** (DB **100** ≥ 100) |
| **CARD-LVE-01** per-company | below target | **CLOSED** (all five slugs ≥ target) |
| **menu-density leave-requests** | need ≥5 only | **PASS** at **100** |

## Residual (out of scope)

| ID | Owner | Note |
|----|-------|------|
| R-H10-02 | dev-be | `seed:hrm:fidelity` long TX / progress logging (unchanged) |
| AC-FID-07+ | backlog | Payroll periods / payslip per-company fidelity — separate waves |
| P-CC-07 leave browser iframe | qa | API L2 PASS; full iframe tab click not re-run this quick retest |

---

**completion_report:** **AC-FID-06 leave wave CLOSED** — DB group **100** ≥ **100**; all five UAT slugs CARD-LVE-01 **PASS**; global menu-density **7/7** (`leave_requests=100`); L0 stack exit 0; P-CC-07 leave tab **75** scoped rows @ main with pending+approved mix; scope parity employee detail **200**. Residual: AC-FID-07+ payroll/payslip fidelity (separate wave).

**next_owner:** pm

**next_dispatch_prompt:** PM intake `P1-HRM-H16-AC-FID-06-LEAVE-QA` PASS_TO_PM — mark AC-FID-06 **CLOSED** in `HRM_MENU_DATA_LINKAGE_MATRIX.md`; dispatch **AC-FID-07** payroll-period group density per dev backlog unless PM defers; optional **qc** narrow re-gate for fidelity batch closeout (AC-FID-04..06 chain).

**evidence_path:** `docs/qa/evidence/p1-hrm-h16-ac-fid-06-leave-qa-20260606.md`

**pm_dispatch_hint:** Leave fidelity parity with insurance/attendance — per-company SQL probe required; global gate alone insufficient. QA confirmed dev seed ratios match live DB; API @ main scoped count (75) ≠ DB group total (100) by design (rollup scope).
