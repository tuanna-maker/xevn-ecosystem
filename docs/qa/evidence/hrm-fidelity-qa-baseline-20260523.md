# HRM Fidelity QA — baseline & persona plan

**work_item_id:** `HRM-FIDELITY-QA`  
**gate:** `G-FID-07`  
**from_role:** qa  
**to_role:** pm, dev-be, qc  
**generated:** 2026-05-23T12:00:00Z (local run)  
**environment:** `deploy/xevn-ecosystem/.env` · DB `xevn_hrm` · portal `http://127.0.0.1:5175` · HRM `http://127.0.0.1:28001`  
**verdict:** **FAIL** — G-FID-07 not met; L2 HTTP smoke green does not imply data fidelity

---

## 1. Executive summary

| Layer | Command | Result | Notes |
|-------|---------|--------|-------|
| **G-FID-07 (DB density)** | `pnpm run verify:hrm:menu-density` | **FAIL** exit 1 | **5/7** checks; contracts & insurance ratios ~9% vs **≥85%** |
| L2 proxy smoke | `pnpm run test:pilot:flows` | **PASS** 11/11 | HTTP 200 only — masks empty `main` lists |
| L2 embed audit | `pnpm run test:hrm-embed:audit` | **PASS** 8/8 | Same — no row-count gate |
| Post-seed re-run | `pnpm run seed:hrm:fidelity` | **BLOCKED** | Script **not** in `package.json`; `HRM-FIDELITY-BE` not READY_FOR_QA on bus |

**PM action:** Keep QC “HRM pilot complete” **NO-GO** until G-FID-07 PASS + persona matrix executed after BE fidelity seed.

---

## 2. `verify:hrm:menu-density` — FAIL baseline

```text
verify-hrm-menu-data-density — xevn_hrm

PASS  employees       employees=1170 (need >=1000)
FAIL  contracts-ratio contracts=101 active=1104 ratio=0.091 need>=0.85
FAIL  insurance-ratio insurance=101 ratio need>=0.85
PASS  attendance-scale attendance=72 need>=22
PASS  payroll-periods  payroll_periods=43 need>=10
PASS  recruitment-pipeline requisitions=11 candidates=13 need>=5
PASS  leave-requests     leave_requests=12 need>=5

=== Summary: 5/7 PASS ===
```

### 2.1 Contracts / insurance ratio (primary blockers)

| Metric | Actual | Threshold | Gap |
|--------|--------|-----------|-----|
| Active employees (DB) | 1104 | — | Used as denominator |
| `employee_contracts` | 101 | ≥ 938 (85% × 1104) | **~837 rows short** |
| Contract ratio | **0.091** | ≥ **0.85** | **FAIL** |
| `employee_insurance_records` | 101 | ≥ 938 | **FAIL** (same ratio) |

### 2.2 Secondary fidelity signals (PASS at DB gate, weak at pilot scope)

| Check | DB | Risk |
|-------|-----|------|
| attendance-scale | 72 ≥ 22 | Low volume vs 1104 active |
| payroll-periods | 43 ≥ 10 | PASS globally; API `main` may differ |
| recruitment / leave | ≥ 5 | PASS; lists under `company_id=main` often **0** via API |

### 2.3 Scope vs seed distribution (root cause class)

`employees` by `company_id` (DB snapshot):

| company_id | count |
|------------|------:|
| holding / finance / logistics / services / trsport | 220 each |
| legacy UUID buckets | 30 each |
| **`main` (pilot JWT)** | **10** |

`employee_contracts` are seeded on UAT slugs (`holding`, `finance`, …), **not** `main`. Portal pilot uses JWT `companyId=main` → API returns **0 contracts** while DB gate counts **101** global contracts.

**Defect class:** `FID-SCOPE-01` — pilot scope (`main`) ≠ UAT workforce company distribution.

---

## 3. L2 smoke (pre-seed) — HTTP PASS, fidelity FAIL

| Command | Exit | Summary |
|---------|------|---------|
| `pnpm run test:pilot:flows` | 0 | P-CC-01..08 **11/11 PASS** (`ceo@xe.vn`) |
| `pnpm run test:hrm-embed:audit` | 0 | P-CC-03..08 + health **8/8 PASS** |

These scripts assert **status 200 / no 409 on rollup** — not menu row counts or DB ratios. Aligns with `HRM_FULL_FIDELITY_PROGRAM.md` §1.

---

## 4. Persona matrix — plan & baseline probes

**Goal:** Per persona, visible **row counts** (API `total` or UI table rows) must match RBAC scope and cardinality rules — not merely HTTP 200.

| Persona | Account | Auth path | Scope (expected) | Menus to probe |
|---------|---------|-----------|------------------|----------------|
| **Group CEO** | `ceo@xe.vn` / `Xevn@2026` | Portal XBOS → JWT | `tenantId=xevn`, `companyId=main` | P-CC-03..08 embed |
| **Member subsidiary CEO** | `du-lich.ceo@xe.vn` / `Xevn@2026` | Portal | `tenantId=xe-du-lich`, `companyId=main` | Same; **403** on `group-member-units` |
| **HRBP** | `uat.nv0006@xe.vn` / `xevn-uat-2026` | **Mobile** HRM JWT | `xevn` + dept subtree filter (TBD) | Mobile + portal parity TBD |

### 4.1 API paths & pass criteria (per menu)

| P-CC | Menu | Probe (portal proxy) | Pass (G-FID-07 extension) |
|------|------|----------------------|---------------------------|
| 03 | Nhân sự | `GET /api/hrm/employees?company_id={scope}&page_size=100` | `total` ≥ min for scope; group CEO ≥ policy |
| 04/05 | Hợp đồng / BH | contracts + insurance lists | `total` ≥ 85% active in scope |
| 06 | Tuyển dụng | `.../recruitment/requisitions` | `total` ≥ 5 per scope |
| 07 | Chấm công | attendance records | `total` ≥ scaled minimum |
| 08 | Lương | payslips | `total` ≥ 1 payslip / active sample |

### 4.2 Baseline probe (2026-05-23, portal proxy)

| Menu | Group CEO (`main`) | Member CEO (`xe-du-lich`/`main`) | HRBP mobile |
|------|-------------------:|---------------------------------:|------------:|
| employees | HTTP 200 **total=10** | HTTP 200 **total=10** | HTTP **409** (portal JWT path) |
| contracts | HTTP 200 **total=0** | HTTP 200 **total=0** | HTTP **409** |
| insurance | HTTP **404** | HTTP **404** | HTTP **404** |
| requisitions | HTTP 200 **total=0** | HTTP 200 **total=0** | HTTP **409** |
| attendance | HTTP 200 **total=0** | HTTP 200 **total=0** | HTTP **409** |
| payslips | HTTP 200 **total=50** | HTTP 200 **total=50** | HTTP **409** |

**Notes:**

- **FID-PERSONA-01:** Group vs member CEO return **identical** list totals under different tenants — scope isolation not proven on counts.
- **FID-PERSONA-02:** HRBP must use **mobile** endpoints (or portal re-auth); portal proxy with mobile token → **409**.
- **FID-PERSONA-03:** Insurance list path `/api/hrm/contracts-insurance/insurance` → **404** on proxy; align with FE tab route before persona sign-off.

### 4.3 Execution checklist (post `seed:hrm:fidelity`)

1. Dev-BE: `pnpm run seed:hrm:fidelity` + evidence JSON (`HRM-FIDELITY-BE`).
2. Re-run `pnpm run verify:hrm:menu-density` → expect **7/7 PASS**.
3. Re-run `test:pilot:flows` + `test:hrm-embed:audit` (regression).
4. Persona script (new): login × 3 → capture `total` per table above → attach as §4.4 in this file or `hrm-fidelity-qa-persona-YYYYMMDD.md`.
5. Optional L2: `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` rows with **visible row count** column (not only ERROR banner).

---

## 5. Defect register (open)

| ID | Sev | Summary | Owner | Re-test trigger |
|----|-----|---------|-------|-----------------|
| **FID-D-01** | P0 | `contracts-ratio` 0.091 &lt; 0.85 | dev-be | After `seed:hrm:fidelity` |
| **FID-D-02** | P0 | `insurance-ratio` &lt; 0.85 | dev-be | Same |
| **FID-D-03** | P1 | Pilot `company_id=main` has 10 NV; 1170 NV on UAT slugs | dev-be + dev-fe | Scope/seed alignment ADR |
| **FID-D-04** | P1 | API contracts `total=0` for `main` while DB has 101 contracts | dev-be | List filter + seed target company |
| **FID-D-05** | P2 | Persona counts identical group vs member CEO | dev-be | RBAC filter audit |
| **FID-D-06** | P2 | HRBP portal proxy 409; mobile path not in L2 scripts | dev-fe / qa | HRBP matrix row |
| **FID-D-07** | P3 | Insurance API path 404 on audit probe | dev-be | Route parity with UI tab |

---

## 6. Post-seed re-run (deferred)

| Step | Status |
|------|--------|
| `pnpm run seed:hrm:fidelity` | **NOT AVAILABLE** in repo root `package.json` |
| Re-run density + pilot + embed | **QUEUED** on `HRM-FIDELITY-BE` READY_FOR_QA |

---

## 7. Gate mapping

| Gate | Status | Evidence |
|------|--------|----------|
| **G-FID-07** | **FAIL** | This file §2 |
| L2 P-CC (HTTP) | PASS | §3; `scrum-s0-pilot-retest-20260523.md` |
| Persona matrix | **PLANNED** | §4; execution after seed |

---

## 8. References

- `docs/program/HRM_FULL_FIDELITY_PROGRAM.md`
- `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md`
- `docs/qa/PILOT_SCOPE_DATA_MATRIX.md`
- `scripts/verify-hrm-menu-data-density.mjs`
