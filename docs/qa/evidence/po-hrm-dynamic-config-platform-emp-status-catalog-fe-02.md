# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-02` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution |
| **priority** | P2 |
| **change_mode** | FIX (preserve_default; code_memory_mode APPEND) |
| **parent / entry** | QA-FE-01 **FAIL** stamp `EMPSTQAFE-MSKDJH6V` · Condition **R-PLT-EMP-ST-FE-01** OPEN |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | SA Option A LOCKED · R-PLT-EMP-ST-FE-01 · AC-PLT-EMP-STATUS-01 / 01b / 01c · VAL-EMP-ST-CNS-02 · HDSD CH06e |

---

## 1. Root cause (confirmed from QA-FE-01 §4)

QA-FE-01 proved the Nest status hooks + `Employees.tsx` `emp-status-filter` list binding + invent-KEY 400 (`HRM-EMP-STATUS-KEY` / `HRM-EMP-STATUS-REASON-KEY`) all PASS. The **only** failing surface was the **form** status Select on Edit + Create.

`EmployeeFormDialog` renders the status Select inside `{hasBasicField('status') && (...)}` and the companion reason Select inside `{hasBasicField('status') && showStatusReason ? (...)}`.

`activeBasicFields` is built by:

```
buildActiveFieldSet<EmployeeBasicFieldKey>(basicFieldsCatalog, DEFAULT_BASIC_FIELDS, ['employee_code', 'full_name'])
```

When the Settings `hrm_employee_basic_fields` catalog has active items, `buildActiveFieldSet` returns **only** the configured/required set. Those active items **omit** `status`, and `status` was **not** in the required list — so `hasBasicField('status')` returned `false`, and neither the Nest-bound status Select (`emp-employment-status-select`) nor the reason Select (`emp-status-reason-select`) ever mounted on Edit/Create. The Nest EFF>0 branch was therefore unreachable from the form.

---

## 2. Fix (narrow — minimal, matches SA Option A consumer surface)

Single-line product change: force `status` into the **required** basic-field set (peer of `employee_code`/`full_name`), exactly the first remedy named in QA-FE-01 §4 residual (`R-PLT-EMP-ST-FE-01-GATE`).

`apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx`

```diff
- buildActiveFieldSet<EmployeeBasicFieldKey>(basicFieldsCatalog, DEFAULT_BASIC_FIELDS, ['employee_code', 'full_name']),
+ buildActiveFieldSet<EmployeeBasicFieldKey>(basicFieldsCatalog, DEFAULT_BASIC_FIELDS, ['employee_code', 'full_name', 'status']),
```

Effect:
- `hasBasicField('status')` is now always `true` → status Select mounts on **Edit + Create**, regardless of whether the MD catalog omits `status`.
- Because `status` visibility is restored, the existing companion logic runs unchanged: reason Select mounts when `showStatusReason` (`empStatusCatalogBound && (statusRequiresReason || empReasonEffectiveCount > 0)`).
- Nest EFF>0 branch: `statusOptions = nestStatusOptions` (bound to `GET /employees/employment-statuses/effective`).
- Nest EFF=0 branch: `statusOptions = bootstrapStatusOptions` (active/probation/inactive) — no wipe, no invent.
- No change to submit mapping, KEY toast, list filter, or invent-KEY guard (all already PASS in L1/QA-FE-01).

`change_mode: FIX` — `@CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-02` appended (APPEND-only; prior blocks retained).

---

## 3. Regression test (source-scan guard)

Added to `apps/web/hrm/src/components/employee/EmployeeFormDialog.mount-guard.test.ts`:

- **R-PLT-EMP-ST-FE-02** asserts the source contains `DEFAULT_BASIC_FIELDS, ['employee_code', 'full_name', 'status']` and retains the `emp-employment-status-select` testid — locks against a future catalog-omit regression re-hiding the status Select.

---

## 4. Vitest result (exit 0)

```
npx vitest run \
  src/components/employee/EmployeeFormDialog.mount-guard.test.ts \
  src/hooks/useEmpEmploymentStatusesEffective \
  src/hooks/useEmpStatusReasonsEffective \
  src/lib/empEmploymentStatusCatalog

 ✓ src/lib/empEmploymentStatusCatalog.test.ts (5 tests)
 ✓ src/components/employee/EmployeeFormDialog.mount-guard.test.ts (7 tests)   <- +1 new (R-PLT-EMP-ST-FE-02)
 ✓ src/hooks/useEmpStatusReasonsEffective.test.ts (7 tests)
 ✓ src/hooks/useEmpEmploymentStatusesEffective.test.ts (17 tests)

 Test Files  4 passed (4)
      Tests  36 passed (36)
```

(QA-FE-01 cited 29; +7 mount-guard, of which 1 is the new FE-02 guard = 36.)

---

## 5. Scope / preserve compliance

| must_keep | Status |
|-----------|--------|
| ST/STR KEY (invent 400 toast) | Untouched — no change to submit/mutation/KEY paths |
| EMP-CUSTOM | Untouched |
| ATT seals | Untouched |
| LVRULE HOLD | Untouched |
| list filter Nest PASS | Untouched (`Employees.tsx` not modified) |
| SoftDel mount guard / manager picker / CatalogSearchPicker / ET picker | Untouched |
| U65 no seed | Respected — no seed, no DB writes, no ensureDefault |

**DENY honored:** no FE-ADMIN invent · no LVRULE invent · no seed · no personnel/e2e ready flip · no module EMP UAT claim · no L1 reopen · no `apps/api/**` · no Settings admin panel invent.

**Honesty flags unchanged:** `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · `C-SLICE-≠-MODULE`.

**Files changed (2):**
- `apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx` (1-line required-set FIX + CODE-MEMORY APPEND)
- `apps/web/hrm/src/components/employee/EmployeeFormDialog.mount-guard.test.ts` (+1 regression assertion)

---

## 6. Handoff

- **ack_status:** READY_FOR_QA
- **next_owner:** qa
- **next_dispatch_prompt:** `EMP-STATUS-CATALOG-QA-FE-02 retest Thêm/Sửa: emp-employment-status-select mounts on Edit+Create (Nest EFF>0 nameVi), emp-status-reason-select mounts when requires_reason/STR EFF>0, PATCH/POST Nest keys 2xx, FE after 2xx + F5 retains Nest badge; prior FAIL stamp EMPSTQAFE-MSKDJH6V; verify list filter Nest still PASS (no regression); U65 browser click path :5173 ceo@xe.vn companyId=main.`
