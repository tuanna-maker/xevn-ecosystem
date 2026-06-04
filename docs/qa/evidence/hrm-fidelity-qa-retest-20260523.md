# HRM Fidelity QA — post-seed retest

**work_item_id:** `HRM-FIDELITY-QA-RETEST`  
**gate:** `G-FID-07`  
**from_role:** qa  
**to_role:** pm, dev-be, dev-fe, qc  
**generated:** 2026-05-23 (local)  
**environment:** `deploy/xevn-ecosystem/.env` · DB `xevn_hrm` · portal `http://127.0.0.1:5175` · XBOS `http://127.0.0.1:28002`  
**verdict:** **FAIL** — DB density **7/7 PASS**; persona/API scope fidelity **not met** (`company_id=main` lists still empty)

---

## 1. Executive summary

| Layer | Command | Result | Notes |
|-------|---------|--------|-------|
| L0 stack | `pnpm run qc:dev-stack` | **PASS** exit 0 | XBOS + portal HTTP 200 |
| **G-FID-07 (DB)** | `pnpm run verify:hrm:menu-density` | **PASS** exit 0 | **7/7** — contracts ratio **0.939**, insurance **1037/1104** |
| L2 proxy smoke | `pnpm run test:pilot:flows` | **PASS** 11/11 | HTTP 200 only (`ceo@xe.vn`) |
| L2 embed audit | `pnpm run test:hrm-embed:audit` | **PASS** 8/8 | Wrote `hrm-embed-fe-audit-20260523.md` |
| **Persona matrix** | Portal proxy row counts | **FAIL** | `main` contracts/requisitions/attendance **total=0**; group vs member CEO **identical** menu totals |

**G-FID-07 (program):** `verify-hrm-menu-data-density.mjs` **+ persona matrix PASS** (`docs/program/HRM_FULL_FIDELITY_PROGRAM.md` §4) — **not closed**.

**PM action:** Dispatch **dev-be** (seed target `company_id` / scope filter for pilot `main`) + **dev-fe** (G-FID-06 false-empty UX). QC G-FID-08 remains **NO-GO** until persona PASS.

---

## 2. `verify:hrm:menu-density` — PASS (7/7)

```text
verify-hrm-menu-data-density — xevn_hrm

PASS  employees       employees=1170 (need >=1000)
PASS  contracts-ratio contracts=1037 active=1104 ratio=0.939 need>=0.85
PASS  insurance-ratio insurance=1037 ratio need>=0.85
PASS  attendance-scale attendance=2819 need>=22
PASS  payroll-periods  payroll_periods=53 need>=10
PASS  recruitment-pipeline requisitions=21 candidates=33 need>=5
PASS  leave-requests     leave_requests=18 need>=5

=== Summary: 7/7 PASS ===
```

**FID-D-01 / FID-D-02:** **CLOSED** at DB gate (was 5/7 baseline).

---

## 3. L2 regression — PASS

| Command | Exit | Summary |
|---------|------|---------|
| `pnpm run test:pilot:flows` | 0 | P-CC-01..08 **11/11 PASS** |
| `pnpm run test:hrm-embed:audit` | 0 | P-CC-03..08 + health **8/8 PASS** |

L2 green does **not** imply pilot-scope row fidelity (unchanged from baseline).

---

## 4. Persona matrix — executed, FAIL

**Accounts:** `ceo@xe.vn` / `du-lich.ceo@xe.vn` · password `Xevn@2026` · portal proxy `http://127.0.0.1:5175`

### 4.1 Row counts per menu (`company_id` = JWT default `main`)

| Menu | Group CEO (`xevn`/`main`) | Member CEO (`xe-du-lich`/`main`) | Pass criteria (extension) |
|------|--------------------------:|---------------------------------:|---------------------------|
| employees | HTTP 200 **total=10** | HTTP 200 **total=10** | Scope-appropriate headcount — **FAIL** vs 1104 active DB |
| contracts | HTTP 200 **total=0** | HTTP 200 **total=0** | ≥85% active in scope — **FAIL** |
| insurance-expiring | HTTP 200 **total=0** | HTTP 200 **total=0** | Satellite visible — **FAIL** |
| requisitions | HTTP 200 **total=0** | HTTP 200 **total=0** | ≥5 in scope — **FAIL** |
| attendance | HTTP 200 **total=0** | HTTP 200 **total=0** | Scaled minimum in scope — **FAIL** |
| payslips | HTTP 200 **total=50** | HTTP 200 **total=50** | ≥1 sample — **PASS** (HTTP only) |
| group-member-units | HTTP 200 | HTTP **403** | Member CEO blocked on rollup — **PASS** (RBAC) |

### 4.2 Scope probe (Group CEO, alternate `company_id`)

| `company_id` query | HTTP | `total` |
|--------------------|------|--------:|
| `main` | 200 | **0** |
| `holding` | 409 | — |
| `finance` | 409 | — |
| `trsport` | 409 | — |

Satellite seed populated **UAT slugs** (`holding`, `finance`, …); JWT pilot uses **`main`** → API lists empty while DB gate counts global rows.

### 4.3 Defect delta vs baseline

| ID | Baseline | Retest |
|----|----------|--------|
| FID-D-01 | P0 open | **CLOSED** (DB ratio 0.939) |
| FID-D-02 | P0 open | **CLOSED** (DB insurance ratio) |
| FID-D-03 | P1 open | **OPEN** — API `main` still **10** employees |
| FID-D-04 | P1 open | **OPEN** — API contracts `total=0` for `main` |
| FID-D-05 | P2 open | **OPEN** — identical menu totals (except GMU 403) |
| FID-D-06 | P2 open | Not re-run (HRBP mobile out of scope this packet) |
| FID-D-07 | P3 open | **IMPROVED** — `insurance/expiring` **200** (was 404 on list probe); still **0** rows |

---

## 5. Gate mapping

| Gate | Status | Evidence |
|------|--------|----------|
| G-FID-07 DB script | **PASS** | §2 |
| G-FID-07 persona matrix | **FAIL** | §4 |
| **G-FID-07 overall** | **FAIL** | Program requires both |
| L2 P-CC HTTP | **PASS** | §3 |
| FID-D-01..02 | **CLOSED** | §2 |
| FID-D-03..05 | **OPEN** | §4 |

---

## 6. References

- Baseline: `docs/qa/evidence/hrm-fidelity-qa-baseline-20260523.md`
- Dev-BE seed: `docs/qa/evidence/hrm-fidelity-be-20260523.md`
- Program: `docs/program/HRM_FULL_FIDELITY_PROGRAM.md`
- Linkage matrix: `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md`
