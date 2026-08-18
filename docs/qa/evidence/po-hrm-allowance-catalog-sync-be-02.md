# Evidence — PO-HRM-ALLOWANCE-CATALOG-SYNC-BE-02

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-ALLOWANCE-CATALOG-SYNC-BE-02` (`ALLOW-CAT-BE-02` / `D-ALLOW-CAT-QA-01`) |
| **parent** | `PO-HRM-ALLOWANCE-CATALOG-SYNC-QA-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **priority** | P0 |
| **change_mode** | FIX |
| **date** | 2026-08-07 |
| **ref_qa** | `docs/qa/evidence/po-hrm-allowance-catalog-sync-qa-01.md` §4 D-ALLOW-CAT-QA-01 |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · U65 zero-seed · no UF claim |

---

## 1. spec_read_ack

| # | Artifact | Used |
|---|----------|------|
| 1 | QA-01 evidence §4 D-ALLOW-CAT-QA-01 | Aborted TX on retire · hypothesis SAVEPOINT |
| 2 | `PO-HRM-ALLOWANCE-CATALOG-SYNC-API-01.md` F-ALLOW-CAT-04 · VAL-ALLOW-07/09 | Soft retire + warn-only policy count · TX integrity |
| 3 | `allowance-catalog-sync.service.ts` `retireType` + `countActivePolicyLines` | Root cause |

---

## 2. Root cause

`countActivePolicyLines` queried `hrm_position_compensation_policy_lines` inside `withTransaction`. When the relation is missing (or SQL fails), PostgreSQL **aborts the transaction**. The JS `catch { return 0 }` swallowed the error but **did not** `ROLLBACK TO SAVEPOINT`, so subsequent UPDATE PC / SC / token failed with:

`current transaction is aborted, commands ignored until end of transaction block` → **500** `HRM-ALLOW-CAT-500-SYNC`.

---

## 3. Fix

| Cap | Change |
|-----|--------|
| **countActivePolicyLines** | `SAVEPOINT allow_cat_policy_line_count` → COUNT → `RELEASE` on success · `ROLLBACK TO SAVEPOINT` on fail → return `0` |
| **retireType** | Unchanged outer flow: soft PC `retired` + SC `is_active=false` + token `retired` |
| **must_keep** | Soft-delete only · open N+1 · PAY dual-write guard · U65 no seed · `payroll_e2e_ready=false` |

### Files

- `apps/api/hrm-api/src/settings/allowance-catalog-sync.service.ts` (FIX + CODE-MEMORY-CHANGE BE-02)
- `apps/api/hrm-api/src/settings/allowance-catalog-sync.service.spec.ts` (regression)

---

## 4. Jest evidence

```text
pnpm --filter hrm-api exec jest --testPathPatterns=allowance-catalog-sync.service.spec --no-coverage

Test Suites: 1 passed, 1 total
Tests:       17 passed, 17 total
```

New case: **`D-ALLOW-CAT-QA-01 / VAL-ALLOW-09: policy-line COUNT fail uses SAVEPOINT — retire still 200 (no aborted TX)`**

- Simulates `42P01` missing table → TX abort flag
- Asserts `SAVEPOINT` + `ROLLBACK TO SAVEPOINT`
- Asserts PC UPDATE `status='retired'` + SC `is_active=FALSE` still run
- Result `status=retired`, no `policyOrphanWarn`

Existing VAL-ALLOW-07 (count=2 → warn) still PASS.

---

## 5. Non-claims / residual

| Item | Status |
|------|--------|
| `payroll_e2e_ready` | **false** |
| Live L1 retire smoke on `:28001` | **QA-02** (restart/reload dist if needed) |
| Browser UF | deferred |
| OBS pay_types empty → create 400 | optional BA/BE — not this seat |

---

## 6. completion_report

### Closed

1. D-ALLOW-CAT-QA-01 root cause confirmed (catch without SAVEPOINT aborts outer TX).
2. FIX `countActivePolicyLines` with SAVEPOINT / ROLLBACK TO.
3. Regression jest PASS (17/17).
4. Soft-retire contract preserved (SC inactive + token retire path unchanged).

### Residual

- Live API retest AC5 retire → QA-02.
- `payroll_e2e_ready=false`.

---

## next_owner

**qa**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ALLOWANCE-CATALOG-SYNC-QA-02
from_role: pm
to_role: qa
lane: execution
priority: P0
parent: PO-HRM-ALLOWANCE-CATALOG-SYNC-BE-02
ref_fix: docs/qa/evidence/po-hrm-allowance-catalog-sync-be-02.md
ref_fail: docs/qa/evidence/po-hrm-allowance-catalog-sync-qa-01.md §4 D-ALLOW-CAT-QA-01

## task
L1 retest AC5 retire only (U65 zero-seed):
1. Ensure hrm-api :28001 serves BE-02 (restart start:prod / start:dev if stale).
2. Create PC via POST /settings/allowance-deduction-types (pay_types phu_cap/khau_tru via Settings product path if needed — no pnpm seed).
3. POST …/allowance-deduction-types/:id/retire?company_id=main → expect 200 status=retired (NOT 500 HRM-ALLOW-CAT-500-SYNC).
4. Assert SC mirror is_active=false on active_only list; default PC list hides retired; include_retired=true shows row; merge token status=retired.
5. Evidence: docs/qa/evidence/po-hrm-allowance-catalog-sync-qa-02.md
honesty: payroll_e2e_ready=false
```

---

## evidence_path

`docs/qa/evidence/po-hrm-allowance-catalog-sync-be-02.md`

## ack_status

**READY_FOR_QA**

## payroll_e2e_ready

**false**
