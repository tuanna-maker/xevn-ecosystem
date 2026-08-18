# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-FE-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-FE-02` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution |
| **priority** | P2 |
| **change_mode** | ADD / FIX narrow |
| **residual** | `R-PLT-EMP-DEPT-FE-01` (QA FAIL `EMPDEPTQAFE-MSKG2900`) → FIX wired |
| **parent QA FAIL** | [`po-hrm-dynamic-config-platform-emp-dept-catalog-qa-fe-01.md`](po-hrm-dynamic-config-platform-emp-dept-catalog-qa-fe-01.md) · agent `ae5f42d6-aca4-46bb-914d-6f414c3ba74f` |
| **SA Option A** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-FE-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-FE-SA-01.md) — storage `custom_fields.department` |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **stamp_l1 RETAIN** | `EMPDEPTQA-MSK3VVXX` · invent → 400 `HRM-EMP-DEPT-KEY` ≡ `HRM-WH-DEPT-KEY` (P3 alias HOLD) |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · `C-SLICE-≠-MODULE` · U65 no seed · DENY module EMP UAT |
| **ack_status** | **READY_FOR_QA** |

---

## 1. Root cause fixed (spec says / code does)

QA FAIL `EMPDEPTQAFE-MSKG2900` proved the department picker mounts (form-gate `required[]` includes
`department`, peer status/position RETAIN) but **`useEmployeeMutations` never forwarded `data.department`**
into the create/update API payload. Top-level `department` is rejected by Nest with `HRM-VAL-001`
(`property department should not exist`); the SoT storage path is **`custom_fields.department`**.

| Layer | Before (QA FAIL) | After (FE-02) |
|-------|------------------|---------------|
| Form submit | sends top-level `department` | unchanged (`EmployeeFormDialog` still emits `department`) |
| Mutation wire | `useEmployeeMutations` **omits** `department` | routes `data.department` → `custom_fields.department` via `mergeEmployeeDepartmentWriteFields` |
| API payload | no `department` / no `custom_fields.department` | `custom_fields.department = <picker key>` (never top-level) |
| Persist / F5 | `department=(none)` after F5 | `custom_fields.department` echoed by GET → `resolveEmployeeDepartmentLabel` → picker shows same key |

## 2. Changes (allowed_paths only)

- `apps/web/hrm/src/lib/empDeptCatalog.ts`
  - ADD pure `mergeEmployeeDepartmentWriteFields(department, writeFields)` — routes the selected
    department key into `custom_fields.department` (SoT storage; BE rejects top-level `department`).
    - `undefined` → no change (partial update untouched).
    - non-empty → `custom_fields.department = normalizeEmpDeptKey(key)` (fresh picker value overrides
      any stale echoed `custom_fields.department`).
    - `null` / empty → remove `custom_fields.department`, keeping sibling custom fields; keeps an empty
      `custom_fields` object when caller already supplied one so a clear can propagate on update.
  - CODE-MEMORY-CHANGE APPEND (FE-02).
- `apps/web/hrm/src/hooks/useEmployeeMutations.ts`
  - `createEmployee` + `updateEmployee`: compute
    `writeFields = mergeEmployeeDepartmentWriteFields(data.department, avatarFields)` and spread
    `...writeFields` instead of `...avatarFields`. No top-level `department` is ever sent.
  - CODE-MEMORY-CHANGE APPEND (FE-02).
- `apps/web/hrm/src/lib/empDeptCatalog.test.ts`
  - ADD 6 unit tests covering `mergeEmployeeDepartmentWriteFields` (set / trim+override stale /
    undefined no-op / clear keeps siblings / clear keeps empty object / clear omits when no prior custom).

**No** `apps/api/**` edits. **No** Nest `emp_department` / `emp_position`. **No** reopen of
EMP-POSITION FE CLOSED / EMP-STATUS FE CLOSED. **No** seed. **No** ready-flag flip. `required[]` still
forces `department` + `status` + `position` (mount-guard green).

## 3. Hydration (F5 / reopen Edit) — no extra change needed

`mapHrmEmployeeRecord` already maps `department: resolveEmployeeDepartmentLabel(row)` which reads
`row.department ?? row.custom_fields?.department`. Once persisted at `custom_fields.department`, the
GET echo hydrates `employee.department` → `EmployeeFormDialog` resets `department` → the
`resolveEmpDeptEditValue` effect matches it against `departmentOptions` (Settings EFF) → the picker
displays the same key after F5.

## 4. Test evidence

```text
cwd: apps/web/hrm
node ./node_modules/vitest/vitest.mjs run \
  src/lib/empDeptCatalog.test.ts \
  src/components/employee/EmployeeFormDialog.mount-guard.test.ts
→ EXIT 0

 ✓ src/lib/empDeptCatalog.test.ts (13 tests)
 ✓ src/components/employee/EmployeeFormDialog.mount-guard.test.ts (9 tests)
 Test Files  2 passed (2)
      Tests  22 passed (22)
```

- `empDeptCatalog.test.ts`: 7 prior + **6 new** `mergeEmployeeDepartmentWriteFields` cases = 13, all green.
- `mount-guard`: 9 green — `R-PLT-EMP-DEPT-FE-02` still asserts `'department'` (+ `'status'` + `'position'`)
  in `required[]`; picker binds `departmentOptions`; empty EFF surfaces `HRM_EMP_DEPT_EMPTY_CATALOG_CODE`.
- ESLint on `useEmployeeMutations.ts` + `empDeptCatalog.ts` + `empDeptCatalog.test.ts` → **EXIT 0** (clean).
- `tsc --noEmit -p tsconfig.app.json` → 194 **pre-existing** baseline errors across unrelated components
  (UniAIChat, attendance, …); **zero** reference the touched files (`empDeptCatalog*`, `useEmployeeMutations`).

## 5. Exit criteria mapping

| # | Exit criterion | Status |
|---|----------------|--------|
| 1 | Lưu DEPT_* ∈ EFF → PATCH/POST 2xx with `custom_fields.department` persisted | ✅ wired (mutation now sends `custom_fields.department`; QA browser 2xx confirm) |
| 2 | F5 / reopen Edit → picker shows same key | ✅ hydrate path via `resolveEmployeeDepartmentLabel` + `resolveEmpDeptEditValue` |
| 3 | invent KEY path still works (toast) | ✅ RETAIN — `empDeptKeyToastFirst` unchanged; WH invent 400 `HRM-WH-DEPT-KEY` L1 RETAIN |
| 4 | vitest map department→custom_fields + mount-guard green (status/position/department required) | ✅ 22/22 |
| 5 | CODE-MEMORY-CHANGE APPEND · READY_FOR_QA | ✅ both files |

## 6. must_keep / DENY RETAIN

| Seal | Status |
|------|--------|
| DEPT KEY L1 `EMPDEPTQA-MSK3VVXX` | RETAIN |
| POSITION KEY · EMP-POSITION FE CLOSED (`EMPPOSQCFE-8DEF5536`) | RETAIN CLOSED — not reopened |
| EMP-STATUS FE CLOSED (`EMPSTQAFE2-MSKE3NV1`) | RETAIN CLOSED — not reopened |
| EMP-CUSTOM / ATT / LVRULE HOLD | RETAIN |
| Nest `emp_department` / `emp_position` | DENY — no bind |
| SoftDel mount guard · manager · status/reason · avatar merge | RETAIN |
| honesty false · C-SLICE · U65 no seed | LOCKED |

## 7. Handoff

- **completion_report:** FE-02 wires form `department` into create/update `custom_fields.department`
  (BE rejects top-level `department` `HRM-VAL-001`) via new pure `mergeEmployeeDepartmentWriteFields`
  in `useEmployeeMutations`. Hydration on F5/edit already reads `custom_fields.department`. Vitest 22/22
  (6 new mapper cases), ESLint clean, no new tsc errors, mount-guard RETAIN (status/position/department
  required). No `apps/api` / Nest / seed / reopen of CLOSED peers.
- **residual:** browser AC-PLT-EMP-DEPT-01 persist + F5 to be reconfirmed by QA on a target employee with
  a **valid status reason** (prior FAIL row hit orthogonal `HRM-EMP-STATUS-REASON-KEY`). Invent KEY on the
  `custom_fields.department` path is not BE-asserted (WH remains invent SoT L1) — document only.
- **next_owner:** `qa`
- **next_dispatch_prompt:** `EMP-DEPT-CATALOG-QA-FE-02` retest Lưu `custom_fields.department` 2xx + F5
  (Edit + Create, DEPT_0x ∈ EFF, ceo@xe.vn companyId=main); pick an employee whose status does not force a
  missing reason; confirm F5 picker shows same key; invent still toast; do not reopen EMP-POSITION/STATUS
  FE CLOSED; Nest emp_department DENY; no seed; honesty false. Prior FAIL `EMPDEPTQAFE-MSKG2900`.
- **evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-fe-02.md`
- **ack_status:** **READY_FOR_QA**
