# D-HRM-SETTINGS-MD-DEPT-FE-01 — Department catalog SoT (no name-as-code)

| Field | Value |
|-------|--------|
| **Date** | 2026-07-25 |
| **Role** | dev-fe |
| **work_item_id** | `D-HRM-SETTINGS-MD-DEPT-FE-01` |
| **QA FAIL SoT** | `docs/qa/evidence/qa-hrm-settings-master-data-01-20260725.md` §1.2 |
| **BA / FR** | FR-HRM-SC-MD-02 · AC-SET-FS-01 / 03 / 05 · BR-SET-MD-01 |
| **change_mode** | UPGRADE |
| **U65** | zero-seed · **HOLD_DEPLOY** · NOT Phase1/PROD |
| **ack_status** | **READY_FOR_QA** |

---

## 1. Problem (spec says / code did)

| | |
|--|--|
| **Spec** | Empty/missing `departments\|department_catalog\|org_departments` → honest empty + CTA Settings; persist **catalog code** only |
| **Before** | `EmployeeFormDialog` fell back to `departments` prop with `value=label=name` (name-as-code) when catalog empty — FAIL AC-SET-FS-01/03/05 |
| **After** | Options = `departmentOptionsFromCatalog(catalogs)` only; empty → `CatalogSearchPicker` empty CTA |

---

## 2. Changes

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/catalogSearchPicker.ts` | ADD `departmentOptionsFromCatalog` (keys from `HRM_MASTER_DATA_CATALOG_KEYS.departments`) |
| `apps/web/hrm/src/lib/catalogSearchPicker.test.ts` | +4 tests: empty / missing / code≠label / skip blank code |
| `apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx` | Remove name fallback + `departments` prop; CODE-MEMORY CHANGE |
| `apps/web/hrm/src/pages/Employees.tsx` | Stop passing `departments` to dialog (list filter state **kept**) |
| `apps/web/hrm/src/pages/EmployeeProfile.tsx` | Drop unused `useDepartments` for dialog only |

**must_keep verified:** position picker unchanged; other employee fields untouched; save path still binds `department` form value = picker `value` (= catalog code when options exist).

**cấm:** seed; invent department codes from labels — `toCatalogPickerOptions` skips empty `code`.

---

## 3. Verification

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/catalogSearchPicker.test.ts src/hooks/p1-hrm-perf-fe-03.test.ts
→ Test Files 2 passed · Tests 15 passed (catalogSearchPicker 13 + perf 2)
```

| Check | Result |
|-------|--------|
| Grep `Fallback: departments` / name-as-code map in EmployeeFormDialog | **0 hits** |
| Empty catalog → `departmentOptionsFromCatalog([])` = `[]` | unit PASS |
| Label as value rejected | `resolveCatalogPickerSelection(opts, 'Phòng Nhân sự')` = null |
| Seed | **not used** |

**Live browser UF:** still depends on L0 / `D-HRM-SETTINGS-MD-COMPILE-BE-01` (hrm-api). This wave = code + unit only — QA retest when stack up.

---

## 4. Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/fe-hrm-settings-md-dept-01-20260725.md`
- **HOLD_DEPLOY:** yes

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QA-HRM-SETTINGS-MD-DEPT-01
role: qa
entry: Dev-FE READY_FOR_QA D-HRM-SETTINGS-MD-DEPT-FE-01; evidence docs/qa/evidence/fe-hrm-settings-md-dept-01-20260725.md; L0 prefer green (or static+unit if compile still blocked — do not claim UF 🟢 without FE browser)
AC: AC-SET-FS-01/03/05 phòng ban — catalog empty → empty + CTA Cài đặt; no name list; when catalog has items → persist code not label; U65 zero-seed; HOLD_DEPLOY
exit: evidence update; PASS_TO_PM or FAIL with residual
cấm: seed; invent dept codes
```
