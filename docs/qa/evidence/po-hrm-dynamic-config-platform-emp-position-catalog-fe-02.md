# EV — PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-FE-02

- work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-FE-02
- from_role: dev-fe
- to_role: qa
- lane: execution
- priority: P2
- change_mode: FIX
- preserve_default: true
- ack_status: READY_FOR_QA
- date: 2026-08-08
- condition: R-PLT-EMP-POS-FE-01 (was OPEN) → fix landed, awaiting QA retest R-PLT-EMP-POS-FE-02

## Entry — QA FAIL context

- QA-FE-01 FAIL stamp: EMPPOSQAFE-MSKEVN7E (agent 008c6bda-671e-4afd-9d44-5e59d26da49e)
- Prior evidence: `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-qa-fe-01.md`
- Symptom: Vị trí (position / job_title) `CatalogSearchPicker` never mounted on Edit + Create,
  so the Settings `job_titles` effective catalog picker (AC-PLT-EMP-01) was unreachable and a
  `job_title_key` could not be persisted from the Employee form.

## Root cause (proven)

`EmployeeFormDialog.tsx` computes the active basic-field set via:

```
buildActiveFieldSet<EmployeeBasicFieldKey>(basicFieldsCatalog, DEFAULT_BASIC_FIELDS, ['employee_code', 'full_name', 'status'])
```

`buildActiveFieldSet` behavior:
- If the Settings catalog `hrm_employee_basic_fields` has ≥1 active effective item, it seeds
  `configured` from those items + the `required[]` list, then returns `configured` (short-circuit).
- Only when `configured.size === 0` does it fall back to the full `DEFAULT_BASIC_FIELDS`.

Consequence: when Settings publishes a basic-fields catalog that OMITS `position` (but has other
fields), `configured` is non-empty yet lacks `position`. `DEFAULT_BASIC_FIELDS` (which contains
`position`) is skipped. Therefore `hasBasicField('position')` is `false` and the JSX guard
`{hasBasicField('position') && ( ...CatalogSearchPicker... )}` never renders the Vị trí picker.

This mirrors the EMP-STATUS FE-02 defect for `status` — same short-circuit class, different key.

## Fix (narrow — peer EMP-STATUS FE-02)

File: `apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx`

Added `'position'` to the required basic-field set alongside `employee_code | full_name | status`
so the Vị trí picker mounts even when the Settings catalog omits `position`:

```
buildActiveFieldSet<EmployeeBasicFieldKey>(basicFieldsCatalog, DEFAULT_BASIC_FIELDS, [
  'employee_code',
  'full_name',
  'status',
  'position',
])
```

- `status` retained (EMP-STATUS FE CLOSED — no regression; status Select still mounts).
- No change to submit mapping: `positionKey = normalizeEmpPositionKey(values.position)` and
  `job_title_key` binding are untouched (POSITION KEY preserved).
- No Nest/API change; no seed; `emp_position` DENY respected; LVRULE / EMP-CUSTOM / ATT untouched.

CODE-MEMORY: `@CODE-MEMORY-CHANGE 2026-08-08 ...-EMP-POSITION-CATALOG-FE-02` APPENDED (no prior
block removed).

## Tests

File: `apps/web/hrm/src/components/employee/EmployeeFormDialog.mount-guard.test.ts`

- Updated `R-PLT-EMP-ST-FE-02` assertion to match the (now multi-line) required set flexibly so
  the EMP-STATUS FE guard does NOT regress (`status` still asserted present).
- Added `R-PLT-EMP-POS-FE-02`: asserts `position` is present in the basic required set and that the
  `hasBasicField('position')` render guard exists.

Command:
```
npx vitest run src/components/employee/EmployeeFormDialog.mount-guard.test.ts
```

Result:
```
 ✓ src/components/employee/EmployeeFormDialog.mount-guard.test.ts (8 tests) 5ms
 Test Files  1 passed (1)
      Tests  8 passed (8)
```

## Scope guard (DENY honored)

- No seed. No Nest `emp_position` change. `apps/api/**` untouched.
- EMP-STATUS FE CLOSED not reopened; status Select preserved.
- No invented LVRULE / EMP-ST FE-ADMIN keys. `ready` flag not flipped. Module EMP not marked UAT.

## must_keep verified

POSITION KEY · EMP-STATUS FE CLOSED (status required + Select) · EMP-CUSTOM · ATT · LVRULE · Nest DENY.

## Handoff

- next_owner: qa
- next_dispatch_prompt: EMP-POSITION-CATALOG-QA-FE-02 retest AC-PLT-EMP-01 — picker mounts on
  Edit+Create + Lưu job_title_key 2xx + F5 persists (prior FAIL EMPPOSQAFE-MSKEVN7E).
- ack_status: READY_FOR_QA
