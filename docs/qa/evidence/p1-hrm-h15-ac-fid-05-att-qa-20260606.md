# QA — P1-HRM-H15-AC-FID-05-ATT retest (attendance fidelity)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H15-AC-FID-05-ATT` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-07 |
| **dev_evidence** | `docs/qa/evidence/p1-hrm-h15-ac-fid-05-att-20260606.md` |
| **matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` AC-FID-05 · CARD-ATT-01 |

## Verdict

**PASS_TO_PM** — Global `verify:hrm:menu-density` **7/7 PASS**; per-company AC-FID-05 **all five UAT slugs** `employee_ratio` **≥ 0.80** (≥ 15 distinct record-days / rolling 30d); group attendance **13 291** ≥ **12 000**; L2 **P-CC-07** attendance API **200** with **13 095** rows @ `main` (no 409, no 1970 dates); L2.5 **J-HRM-06** list→employee detail **200**.

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
PASS  leave-requests     leave_requests=25 need>=5

=== Summary: 7/7 PASS ===
```

## AC-FID-05 — Per-company employee_ratio (rolling 30d, ≥ 15 days / active NV)

Probe: `node ./scripts/tmp-p1-hrm-acfid05-probe.mjs`

| company_id | active_emp | emp_with_min_days | employee_ratio | Target | Result |
|------------|------------|-------------------|----------------|--------|--------|
| **holding** | 213 | 171 | **0.803** | ≥ 0.80 | **PASS** |
| **trsport** | 207 | 166 | **0.802** | ≥ 0.80 | **PASS** |
| **logistics** | 207 | 166 | **0.802** | ≥ 0.80 | **PASS** |
| **finance** | 207 | 166 | **0.802** | ≥ 0.80 | **PASS** |
| **services** | 207 | 166 | **0.802** | ≥ 0.80 | **PASS** |

**Group total:** **13 291** attendance records (≥ **12 000**).

Probe exit: **0** — `=== AC-FID-05 PASS ===`

## L2 — P-CC-07 attendance embed (API spot)

Probe: `node ./scripts/tmp-p1-hrm-h15-att-qa-probe.mjs`

| P-CC | Route | Menu API | HTTP | Code | Total rows | 1970 date | Result |
|------|-------|----------|------|------|------------|-----------|--------|
| P-CC-07 | `/command-center/hrm/attendance` | `/api/hrm/attendance/records?company_id=main&page_size=100` | **200** | HRM-ATT-200 | **13095** | none | **PASS** |

## L2.5 — J-HRM-06 cross-navigation

| J-ID | From | Click path | List HTTP | Detail HTTP | Result |
|------|------|------------|-----------|-------------|--------|
| **J-HRM-06** | P-CC-07 | `/command-center/hrm/attendance` → row → `GET /api/hrm/employees/3c5aa470-3725-46e8-867b-590916de1196?company_id=main` | **200** | **200** | **PASS** |

Sample record: `8a90df5c-2831-4a30-9150-5e472565eefe` · date `Sat Jun 06` (not epoch 1970).

## Defects / GWC closure

| ID | Prior status | QA verdict |
|----|--------------|------------|
| **AC-FID-05** per-company attendance | backlog (~6% ratio) | **CLOSED** (all five slugs ≥ 0.80; group ≥ 12000) |
| **CARD-ATT-01** | seed gap | **CLOSED** via `seed:hrm:attendance-density` |

## Residual (out of scope)

| ID | Owner | Note |
|----|-------|------|
| R-H10-02 | dev-be | `seed:hrm:fidelity` long TX / progress logging (unchanged) |
| AC-FID-06+ | backlog | Leave / payslip per-company fidelity — separate waves |
| J-HRM-06 browser iframe | qa | API L2.5 PASS; full iframe click-path not re-run this batch |

---

**completion_report:** **AC-FID-05 attendance wave CLOSED** — all five UAT slugs `employee_ratio` ≥ **0.80**; group attendance **13 291** ≥ **12 000**; global menu-density **7/7**; L0 stack exit 0; P-CC-07 attendance data **13095** @ main; J-HRM-06 list→employee **200**. Residual: AC-FID-06+ leave/payslip per-company (separate wave).

**next_owner:** pm

**next_dispatch_prompt:** PM intake `P1-HRM-H15-AC-FID-05-ATT` PASS_TO_PM — mark AC-FID-05 **CLOSED** in `HRM_MENU_DATA_LINKAGE_MATRIX.md`; dispatch **AC-FID-06** leave per-company fidelity (`pm_dispatch_hint` from dev handoff) unless PM defers; optional **qc** narrow re-gate for fidelity batch closeout.

**evidence_path:** `docs/qa/evidence/p1-hrm-h15-ac-fid-05-att-qa-20260606.md`

**pm_dispatch_hint:** Attendance fidelity parity with insurance (AC-FID-04) — per-company SQL probe required; global gate alone insufficient. QA confirmed dev ratios match live DB.
