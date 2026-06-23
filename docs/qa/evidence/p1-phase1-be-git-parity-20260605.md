# BE evidence — P1-S5-BE-GIT-PARITY-01 (C-S5SCOPEQC-01 / C-CRUDQC-07-git)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-S5-BE-GIT-PARITY-01` |
| **condition** | **C-S5SCOPEQC-01** / **C-CRUDQC-07-git** — VPS `pscp` scope fixes applied on pilot but **not committed** to `origin/main` |
| **from_role** | dev-be |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-06-05 |

## Problem

Pilot **hrm-be** / **xbos-be** were hot-fixed via `pscp` (waves P0-S5-01/02, C-CRUDQC-07) while workspace changes remain **uncommitted**. `HEAD` and `origin/main` are both **`68ec457`** — no scope parity commits on main; next `git pull` deploy would **drop** fixes.

## Git baseline

| Ref | SHA | Note |
|-----|-----|------|
| `HEAD` | `68ec457586cc18830c53ee84b66dba16680cc649` | Local branch |
| `origin/main` | `68ec457586cc18830c53ee84b66dba16680cc649` | **Identical** — fixes only in working tree |

**Action required (PM → user):** approve commit + PR to `main` before standard VPS deploy replaces `pscp` drift.

---

## Uncommitted scope-related files — full manifest

### Track A — HRM employee persist + list scope (`P1-PHASE1-BE-EMP-CREATE-PARITY-01`, C-CRUDQC-07)

| Status | Path | Role |
|--------|------|------|
| `M` | `apps/api/hrm-api/src/employees/employees.service.ts` | `resolveHrmPersistCompanyIdText`, restore/archive scope, tenant partition |
| `M` | `apps/api/hrm-api/src/employees/employees.controller.ts` | Auth + `toHrmListScopeContext` on archive/restore/create |
| `M` | `apps/api/hrm-api/src/employees/employees.service.spec.ts` | Create/restore/archive scope regression |
| `M` | `apps/api/hrm-api/src/employees/employees.controller.spec.ts` | Controller scope context regression |
| `??` | `apps/api/hrm-api/src/employees/p1-phase1-be-emp-create-parity.spec.ts` | HTTP create→GET→PATCH→list parity |
| `M` | `apps/api/hrm-api/src/spreadsheet/spreadsheet.service.ts` | Import commit persist parity |
| `M` | `apps/api/hrm-api/src/spreadsheet/spreadsheet.controller.ts` | Import headers / scope context |

### Track B — HRM list-scope core (`P1-PHASE1-BE-SCOPE-P0-S5-01/02`)

| Status | Path | Role |
|--------|------|------|
| `M` | `apps/api/hrm-api/src/common/hrm-list-scope.ts` | Member assert (no main→holding UUID rollup), tenant partition, restore filters |
| `M` | `apps/api/hrm-api/src/common/hrm-list-scope.spec.ts` | Group CEO rollup + member CEO reject (+restore parity) |
| `M` | `apps/api/hrm-api/src/common/hrm-query-validation-regression.spec.ts` | Query validation regression |

### Track C — HRM mobile/payroll scope (`P1-PHASE1-BE-MOB-JMOB-04-05-01`)

| Status | Path | Role |
|--------|------|------|
| `M` | `apps/api/hrm-api/src/payroll/payroll.service.ts` | `normalizePayrollListCompanyId` / slug-UUID expand |
| `M` | `apps/api/hrm-api/src/payroll/payroll.service.spec.ts` | Payroll list scope regression |
| `M` | `apps/api/hrm-api/src/attendance/attendance.service.ts` | Pending list slug-UUID scope |
| `M` | `apps/api/hrm-api/src/attendance/attendance.service.spec.ts` | Attendance pending scope regression |
| `??` | `apps/api/hrm-api/src/common/p1-phase1-be-mob-jmob-04-05.spec.ts` | MOB payslip/pending scope HTTP regression |
| `??` | `apps/api/hrm-api/src/common/p1-ex-https-hrm-probe-l2.spec.ts` | HTTPS probe L2 supertest (insurance, slug company_id) |

### Track D — XBOS legal-entity read/mutation scope (`P1-PHASE1-BE-SCOPE-CRUD-01`, CC member legal)

| Status | Path | Role |
|--------|------|------|
| `M` | `apps/api/xbos-api/src/legal-entity-profile/legal-entity-profile.controller.ts` | `resolveXbosGroupLegalReadScopeContext` / mutation resolver |
| `M` | `apps/api/xbos-api/src/legal-entity-profile/legal-entity-profile.controller.spec.ts` | Group CEO member-tenant shareholders |
| `M` | `apps/api/xbos-api/src/common/xbos-group-legal-scope.spec.ts` | U28 member CEO block + org-foundation GET parity |

> `apps/api/xbos-api/src/common/xbos-group-legal-scope.ts` — **already on `68ec457`** (no local diff); include in build, no staging needed.

### Track E — XBOS org-foundation GET partition assert (`P1-PHASE1-BE-SCOPE-P0-S5-01`)

| Status | Path | Role |
|--------|------|------|
| `M` | `apps/api/xbos-api/src/org-foundation/org-foundation.controller.ts` | Partition assert after `readScope` on GET legal-entity |
| `M` | `apps/api/xbos-api/src/org-foundation/org-foundation.controller.spec.ts` | Member CEO cross-tenant UUID → **409** |
| `??` | `apps/api/xbos-api/src/org-foundation/org-foundation.legal-scope-crud.integration.spec.ts` | Supertest browser-shaped GET block |

### Diff summary (tracked scope paths)

```text
15 files changed, 635 insertions(+), 51 deletions(-)
```

---

## Commit-ready manifest (recommended single PR — BE scope only)

**22 paths** to stage for `main` merge (18 modified + 4 untracked; excludes PM/docs/mobile/portal noise):

```
apps/api/hrm-api/src/common/hrm-list-scope.ts
apps/api/hrm-api/src/common/hrm-list-scope.spec.ts
apps/api/hrm-api/src/common/hrm-query-validation-regression.spec.ts
apps/api/hrm-api/src/common/p1-ex-https-hrm-probe-l2.spec.ts
apps/api/hrm-api/src/common/p1-phase1-be-mob-jmob-04-05.spec.ts
apps/api/hrm-api/src/employees/employees.service.ts
apps/api/hrm-api/src/employees/employees.controller.ts
apps/api/hrm-api/src/employees/employees.service.spec.ts
apps/api/hrm-api/src/employees/employees.controller.spec.ts
apps/api/hrm-api/src/employees/p1-phase1-be-emp-create-parity.spec.ts
apps/api/hrm-api/src/spreadsheet/spreadsheet.service.ts
apps/api/hrm-api/src/spreadsheet/spreadsheet.controller.ts
apps/api/hrm-api/src/attendance/attendance.service.ts
apps/api/hrm-api/src/attendance/attendance.service.spec.ts
apps/api/hrm-api/src/payroll/payroll.service.ts
apps/api/hrm-api/src/payroll/payroll.service.spec.ts
apps/api/xbos-api/src/common/xbos-group-legal-scope.spec.ts
apps/api/xbos-api/src/legal-entity-profile/legal-entity-profile.controller.ts
apps/api/xbos-api/src/legal-entity-profile/legal-entity-profile.controller.spec.ts
apps/api/xbos-api/src/org-foundation/org-foundation.controller.ts
apps/api/xbos-api/src/org-foundation/org-foundation.controller.spec.ts
apps/api/xbos-api/src/org-foundation/org-foundation.legal-scope-crud.integration.spec.ts
```

**Suggested commit message (PM/user approval):**

```text
fix(be): scope parity — HRM restore/member assert, XBOS legal-entity partition

Closes C-CRUDQC-07-git / C-S5SCOPEQC-01. Consolidates P0-S5-01/02, employee
create persist, MOB payroll/attendance slug scope, and XBOS legal-entity read
partition asserts. VPS pscp drift eliminated after merge.
```

**Post-merge deploy:** `git pull origin main` on VPS → rebuild **`hrm-be`** + **`xbos-be`** (standard compose; retire partial `pscp`).

---

## Local verification (2026-06-05)

### HRM scope suites — exit 0

```bash
pnpm --filter hrm-api exec jest \
  src/common/hrm-list-scope.spec.ts \
  src/employees/employees.service.spec.ts \
  src/employees/employees.controller.spec.ts \
  src/employees/p1-phase1-be-emp-create-parity.spec.ts \
  src/common/hrm-query-validation-regression.spec.ts \
  src/attendance/attendance.service.spec.ts \
  src/payroll/payroll.service.spec.ts
```

→ **7 suites, 77/77 PASS**, exit **0**

### XBOS scope suites — exit 0

```bash
pnpm --filter xbos-api exec jest \
  src/common/xbos-group-legal-scope.spec.ts \
  src/org-foundation/org-foundation.controller.spec.ts \
  src/org-foundation/org-foundation.legal-scope-crud.integration.spec.ts \
  src/legal-entity-profile/legal-entity-profile.controller.spec.ts
```

→ **4 suites, 44/44 PASS**, exit **0**

### Build

```bash
pnpm --filter hrm-api build   # PASS
pnpm --filter xbos-api build  # PASS
```

---

## Wave traceability

| Wave | Evidence |
|------|----------|
| C-CRUDQC-07 | `docs/qa/evidence/p1-phase1-be-crud-parity-main-20260604.md` |
| P0-S5-01 | `docs/qa/evidence/p1-phase1-be-scope-p0-s5-20260605.md` |
| P0-S5-02 | `docs/qa/evidence/p1-phase1-be-scope-p0-s5-02-20260605.md` |
| QC condition | `docs/qa/evidence/p1-s5-qc-01-20260605.md` § C-S5SCOPEQC-01 |

## Residual (not in this work_item)

- **No git commit/push** performed — awaiting user/PM approval per task exit criteria.
- Portal FE `x-tenant-id` on archive/restore (dev-fe) — separate lane; pilot may still need FE deploy after BE merge.
- Full `hrm-api` jest suite may flake on `perf-budget/ci.perf-budget.spec.ts` (unrelated to scope).
- Post-merge: **devops** standard deploy + **qa** nip.io probe (`tmp-p1-phase1-qa-scope-p0-s5-probe.mjs`).

## Handoff

| Field | Value |
|-------|--------|
| `completion_report` | Catalogued **22** uncommitted BE scope paths (18 modified + 4 untracked) across P0-S5-01/02 + C-CRUDQC-07 waves; `HEAD` = `origin/main` = `68ec457` confirms fixes not on main. HRM scope jest **77/77** + XBOS scope jest **44/44** PASS; both API builds PASS. Commit-ready manifest prepared; **no commit/push**. |
| `next_owner` | **pm** |
| `next_dispatch_prompt` | PM: present user the 22-file commit-ready manifest in `docs/qa/evidence/p1-phase1-be-git-parity-20260605.md` for approval; on approval dispatch user commit+PR to `main`, then **devops** `P1-S5-DO-GIT-PARITY-01` standard VPS deploy (`git pull` + rebuild hrm-be/xbos-be), then **qa** retest `C-S5SCOPEQC-01` probes (`tmp-p1-phase1-qa-scope-p0-s5-probe.mjs`, member HRM CU probe). |
| `evidence_path` | `docs/qa/evidence/p1-phase1-be-git-parity-20260605.md` |
| `ack_status` | **PASS_TO_PM** |
