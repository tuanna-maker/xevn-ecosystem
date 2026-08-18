# D-CD-FB-08-ACTIVE-COLD-500 — QA evidence (2026-07-19)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-CD-FB-08-ACTIVE-COLD-500-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **closes** | QC condition **C-CD-FB-08-01** / residual **R-CD-FB-08-ACTIVE-COLD-500** |
| **ack_status** | **PASS_TO_PM** |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · JWT `companyId=main` · `roleCode=group_ceo` |
| **env** | local portal `:5173` · hrm-api `:28001` · xbos-api `:28002` |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD claim |
| **spec_ref** | `CUSTOMER_DEMO_HRM_DELTA_20260620.md` §5 · UC-HRM-25 · parent QC `cd-fb-08-contract-qc-20260719.md` |
| **BE entry** | `docs/qa/evidence/d-cd-fb-08-active-cold-500-be-20260719.md` |
| **parent QC** | `docs/qa/evidence/cd-fb-08-contract-qc-20260719.md` (GWC · C-01 OPEN) |
| **date** | `2026-07-19` |

---

## Entry / L0

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** (**PASS**) |
| Seed | **None** (U65) |
| Method | Live Nest production path (same routes FE tab Đãi ngộ calls); no DB mutate outside API |

---

## Exit criteria matrix

| # | Exit | Evidence | Verdict |
|---|------|----------|---------|
| **1** | Cold `GET …/compensation-packages/active` before first create → **200** (`data: null`), **not** 500 `pg_type` | Subject **HLD-0996** (`ff16d855-…`) list packages **0**; parallel list+/active → both **200** `HRM-COMP-200`; `active.data === null`; no `pg_type_typname_nsp_index` | **PASS** |
| **1b** | Parallel cold (FE race pattern) | **30/30** HLD employees with empty packages: list **200** + active **200** null; **BURST×8** concurrent list+/active on HLD-0996 → all **200** / `HRM-COMP-200` | **PASS** |
| **2** | Optional smoke create still **201** | `POST …/compensation-packages` → **201** `HRM-COMP-201` · package `0bf31579-…`; post-create `/active` **200** with base line `12000000` | **PASS** |
| **3** | Evidence path | this file | **PASS** |
| **4** | C-CD-FB-08-01 closable | Cold 500 residual reproduced-as-fixed; recommend QC close | **PASS** |

---

## Network probe (ceo@xe.vn · company_id=main)

| Step | Method / path | Status / code | Body note |
|------|---------------|---------------|-----------|
| Login | `POST /api/xbos/auth/login` | **201** `XBOS-AUTH-200` | JWT main / group_ceo |
| Cold parallel list | `GET /api/hrm/contracts-insurance/compensation-packages?company_id=main&employee_id=ff16d855-…` | **200** `HRM-COMP-200` | empty (0 pkgs) |
| Cold parallel active | `GET …/compensation-packages/active?company_id=main&employee_id=ff16d855-…` | **200** `HRM-COMP-200` | **`data: null`** — **not** 500 |
| Burst ×8 list+/active | same endpoints concurrent | **200** / **200** ×8 | no `HRM-SYS-001` / no pg_type |
| Smoke create | `POST …/compensation-packages` | **201** `HRM-COMP-201` | lines: base 12M + `PHU_CAP_AN` + `PHU_CAP_XANG` |
| Post-create active | `GET …/active?…` | **200** `HRM-COMP-200` | package id `0bf31579-…` · base 12000000 |

Subject employee: **HLD-0996** · Phạm Đức Hùng · `company_id=holding` (listed under group `main` rollup). Create used `company_id=main` (group CEO path — same as parent F5 wave).

---

## Jest corroboration (BE unit)

```text
pnpm --filter hrm-api exec jest --testPathPatterns="employee-compensation.service.spec" --no-coverage
# Test Suites: 1 passed · Tests: 9 passed (includes D-CD-FB-08 cold/race/single-flight cases)
```

---

## Scope / must_keep

| Item | Status |
|------|--------|
| Parent F5 AC-CD-F5-01..04/07 (already QC GWC) | **Not reopened** — smoke create only |
| P-CC-04 / J-HRM-01 / J-HRM-03 | **Not re-run** (closed in parent QA/QC) |
| Phase1 DONE / PROD-READY | **NOT claimed** |
| Seed | **None** |

---

## Residual

| ID | Severity | Status |
|----|----------|--------|
| `R-CD-FB-08-ACTIVE-COLD-500` / **C-CD-FB-08-01** | P2 | **CLOSED for QA** — recommend QC close |
| `C-CD-FB-08-02` pack format | Process | Unchanged (parent GWC) |
| `C-CD-FB-08-03` payroll AC-F5-06 | P3 deferred | Unchanged |

---

## Verdict

| Gate | Verdict |
|------|---------|
| Cold `/active` 200 null (no pg_type 500) | **PASS** |
| Concurrent list+/active | **PASS** |
| Smoke create 201 + active 200 | **PASS** |
| U65 zero-seed | **PASS** |
| Overall | **PASS_TO_PM** |

**Not claimed:** Phase 1 DONE / PROD-READY / F-DELIVERY program exit.

---

## Handoff

**completion_report:** Residual cold `GET compensation-packages/active` 500 (`pg_type_typname_nsp_index`) **closed** on live stack. Before create: **200** + `data: null` (30 empty HLD + burst×8). Optional create **201** `HRM-COMP-201`; post `/active` **200**. Jest employee-compensation 9/9. U65 no seed. Recommend QC close **C-CD-FB-08-01** without reopening parent F5 GWC.

**next_owner:** `qc`

**ack_status:** **PASS_TO_PM**

**evidence_path:** `docs/qa/evidence/d-cd-fb-08-active-cold-500-qa-20260719.md`

**pm_dispatch_hint:** `C-CD-FB-08-01-QC` — close condition on this QA pack; retain parent GWC for C-02/C-03

### next_dispatch_prompt

```text
work_item_id: C-CD-FB-08-01-QC
from_role: pm
to_role: qc
lane: governance
entry_criteria: QA PASS_TO_PM docs/qa/evidence/d-cd-fb-08-active-cold-500-qa-20260719.md; BE READY docs/qa/evidence/d-cd-fb-08-active-cold-500-be-20260719.md; parent GWC docs/qa/evidence/cd-fb-08-contract-qc-20260719.md
exit_criteria:
  - Close condition C-CD-FB-08-01 / R-CD-FB-08-ACTIVE-COLD-500 (cold /active 200 null, not 500 pg_type)
  - Retain parent CD-FB-08 GO WITH CONDITIONS for C-02 (pack process) / C-03 (payroll defer) unless already closed
  - evidence: docs/qa/evidence/c-cd-fb-08-01-qc-20260719.md (or append section on parent QC)
  - NOT Phase1/PROD
cấm: seed; reopen F5 AC-01..04/07; require browser re-run of full contract wave
```
