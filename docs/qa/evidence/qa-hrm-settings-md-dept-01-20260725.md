# QA-HRM-SETTINGS-MD-DEPT-01 — Department catalog SoT retest

| Field | Value |
|-------|--------|
| **Date** | 2026-07-25 |
| **Role** | qa |
| **work_item_id** | `QA-HRM-SETTINGS-MD-DEPT-01` (batch parent `QA-HRM-SETTINGS-MD-FE-BATCH-01`) |
| **Dev entry** | `docs/qa/evidence/fe-hrm-settings-md-dept-01-20260725.md` |
| **BA SoT** | `docs/qa/evidence/ba-hrm-settings-master-data-01-20260723.md` — **AC-SET-FS-01/03/05** · **BR-SET-MD-01** · FR-HRM-SC-MD-02 |
| **Prior FAIL** | `docs/qa/evidence/qa-hrm-settings-master-data-01-20260725.md` §1.2 |
| **U65** | zero-seed · **HOLD_DEPLOY** · **NOT** Phase1/PROD |
| **Overall verdict** | **PASS** (code + unit) · **BLOCKED** live browser UF (hrm-api down) — **no UF 🟢** |

---

## 0. Environment / L0

Same wave as leave retest:

| Check | Result |
|-------|--------|
| Portal `:5173` / HRM `:8080/hr/` | **200** (after QA started `dev:web-only`) |
| hrm-api `:28001` | **down** at evidence time (`tsc --noEmit` exit **0**) |
| Browser U65 mutate | **BLOCKED** |
| Seed | **not used** |

---

## 1. Exit criteria

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | Empty catalog → empty + CTA Cài đặt; no name-as-code list | **PASS** (code+unit) | `departmentOptionsFromCatalog([])` / missing key / empty items → `[]`; `EmployeeFormDialog` options = that helper only; **no** `departments` prop on dialog (`Employees.tsx` / `EmployeeProfile.tsx`); `CatalogSearchPicker` emptyHint → «Mở Cài đặt → Danh mục nghiệp vụ»; amber empty panel shared |
| 2 | With catalog → persist **code** not label | **PASSᵘ** · **BLOCKED** live | Unit: `value=HR` / label «Phòng Nhân sự»; `resolveCatalogPickerSelection(opts, 'Phòng Nhân sự')` = **null**; `isCatalogPickerValueAllowed(..., label)` = false; blank `code` skipped (never invent from label). Form bind `department: values.department` = picker value. Live save+F5 **not executed** |
| 3 | Evidence this file | **PASS** | — |

### AC-SET-FS rollup (departments)

| AC | Verdict | Note |
|----|---------|------|
| AC-SET-FS-01 | **PASSᶜ** | Catalog keys `departments\|department_catalog\|org_departments` via `HRM_MASTER_DATA_CATALOG_KEYS` |
| AC-SET-FS-02 | **PASSᶜ** | Shared picker search |
| AC-SET-FS-03 | **PASSᵘ** · **BLOCKED** live | Code SoT lock in unit; live persist blocked |
| AC-SET-FS-04 | **BLOCKED** | List/attendance filter not browser-exercised this wave |
| AC-SET-FS-05 | **PASS** (code+unit) | Closes prior **FAIL** name-as-code fallback |

**Prior §1.2 FAIL (name fallback)** → **CLOSED** at FE code/unit.

Grep: `Fallback: departments` / name-as-code map in `EmployeeFormDialog` = **0**; prop `departments` removed from dialog interface.

---

## 2. Verify commands (QA re-ran)

```bash
cd apps/web/hrm
pnpm exec vitest run src/lib/catalogSearchPicker.test.ts src/hooks/p1-hrm-perf-fe-03.test.ts
# → Test Files 2 passed · Tests 15 passed (13 picker + 2 perf)
```

---

## 3. Residuals

| Residual | Owner |
|----------|--------|
| Live U65 employee create/edit department + F5 | **qa** — `qa-hrm-settings-master-data-02`: **empty CTA PASS** live; persist code→F5 **not promoted** |
| G-ORPH-BE-03 BE seed `departments[]` registry | dev-be (separate; FE consumer path fixed) |
| `DepartmentManagement.tsx` still passes `departments=` (company tab) | out of EmployeeFormDialog scope — note only |

---

## 4. What was NOT done

- No seed / invent dept codes
- No UF 🟢 without browser FE path
- No Phase1 / PROD

---

## 5. Handoff

- **ack_status:** `PASS_TO_PM` (code gate closed; live UF not 🟢)
- **next_owner:** `pm`
- **evidence_path:** `docs/qa/evidence/qa-hrm-settings-md-dept-01-20260725.md`

### completion_report

**Closed:** Prior EmployeeFormDialog name-as-code FAIL closed — catalog SoT only; empty + CTA; unit locks code≠label; 15/15 vitest.

**Open:** Browser UF persist+F5 **BLOCKED** on hrm-api down; not QC-ready until live retest.
