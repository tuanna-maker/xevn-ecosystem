# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-FE-01 (dev-fe)

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-FE-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **priority** | P2 |
| **change_mode** | ADD |
| **residual** | R-PLT-EMP-DEPT-FE-01 |
| **SA spec** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-FE-SA-01.md` (Option A LOCKED) |
| **Date** | 2026-08-08 |
| **ack_status** | **READY_FOR_QA** |

---

## 1. Scope closed (Option A — FE consumer deepen)

Unlock FE consumer of Settings/XBOS `departments` EFF picker deepen — peer of EMP-POSITION FE / EMP-STATUS FE / ATT-CODE FE Option A. ADD-only, `apps/web/hrm` only, no `apps/api/**`, no seed.

### 1.1 Exit criteria mapping

| # | Exit criterion | Status | Where |
|---|----------------|--------|-------|
| 1 | Force `department` into `buildActiveFieldSet` required[] (peer `employee_code`/`full_name`/`status`/`position`) so `CatalogSearchPicker` **always mounts** even when Settings basic-fields omits department | ✅ | `EmployeeFormDialog.tsx` `activeBasicFields` required list now `['employee_code','full_name','status','position','department']` |
| 2 | Form + WH department picker = Settings `departments` EFF when EFF>0; empty only EFF=0 + CTA CH06g | ✅ | Form: `departmentOptions = departmentOptionsFromCatalog(catalogs ?? [])`; WH `EmployeeWorkTimeline.tsx` already binds same SoT (RETAIN) |
| 3 | invent / out-of-EFF → Network 400 `HRM-EMP-DEPT-KEY` (or `HRM-WH-DEPT-KEY` ≡) + VI toast · no persist · F5 path | ✅ | `useEmployeeMutations.ts` `empFormMutateToastMessage` now DEPT KEY first via `empDeptKeyToastFirst`; WH `handleSave` catch surfaces DEPT KEY first; out-of-EFF legacy value cleared by `resolveEmpDeptEditValue` so no silent invent submit |
| 4 | empty EFF CTA · no seed · soft-retire hide from picker · display-ready labels | ✅ | Form empty hint tagged `data-hrm-empty-catalog={HRM_EMP_DEPT_EMPTY_CATALOG_CODE}` + CH06g VI copy; soft-retire hidden via `toCatalogPickerOptions` (active-only); labels via catalog (OS 28), never raw key |
| 5 | vitest mount-guard asserts `department` in required[] + render guard · lint/build PASS · CODE-MEMORY-CHANGE APPEND · READY_FOR_QA | ✅ | New `R-PLT-EMP-DEPT-FE-02` test; `empDeptCatalog.test.ts`; tsc + eslint clean; CODE-MEMORY appended to 3 files + new lib header |

---

## 2. Files changed (allowed_paths only)

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/empDeptCatalog.ts` | **NEW** — KEY constants (`HRM-EMP-DEPT-KEY`, `HRM-WH-DEPT-KEY` ≡, `HRM-EMP-DEPT-EMPTY-CATALOG`), `normalizeEmpDeptKey`, `resolveEmpDeptEditValue`, `isEmpDeptKeyInCatalog`, `isEmpDeptInventKeyError`, `empDeptKeyToastMessage`, `empDeptKeyToastFirst` (composable chain). Mirrors peer `empPositionCatalog.ts`. |
| `apps/web/hrm/src/lib/empDeptCatalog.test.ts` | **NEW** — 7 unit tests: constants, normalize, edit-value clear on EFF>0, keep raw on EFF=0, in-catalog check, invent KEY toast (EMP + WH alias), chain delegation. |
| `apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx` | Force `department` into required[]; `empDeptCatalogBound`; out-of-EFF resolver effect; empty-catalog CTA marker; `void` KEY refs; CODE-MEMORY-CHANGE. |
| `apps/web/hrm/src/components/employee/EmployeeFormDialog.mount-guard.test.ts` | `R-PLT-EMP-DEPT-FE-02` — asserts `department` in required[], `status`/`position` retained, `hasBasicField('department')` render guard, `options={departmentOptions}`, empty-catalog code present. |
| `apps/web/hrm/src/components/employee/EmployeeWorkTimeline.tsx` | Save catch surfaces DEPT invent KEY toast first (`empDeptKeyToastFirst` → `empPositionKeyToastMessage`); picker SoT RETAIN; CODE-MEMORY-CHANGE. |
| `apps/web/hrm/src/hooks/useEmployeeMutations.ts` | `empFormMutateToastMessage` DEPT KEY first, then POSITION/WH-PICK, then STATUS/REASON; CODE-MEMORY-CHANGE. |

**Not touched (must_keep RETAIN):** `apps/api/**` (Nest `emp_department` / `emp_position` DENY · L1 invent KEY seat `EMPDEPTQA-MSK3VVXX` · P3 alias rename), EMP-POSITION FE CLOSED, EMP-STATUS FE CLOSED (status/position still in required[]), EMP-CUSTOM, ATT seals, LVRULE HOLD, seed/flip/Face.

---

## 3. Automated verification (agent-run)

Run from `apps/web/hrm`:

```text
npx vitest run src/lib/empDeptCatalog.test.ts \
  src/lib/empPositionCatalog.test.ts \
  src/components/employee/EmployeeFormDialog.mount-guard.test.ts
→ Test Files  3 passed (3)
→ Tests  23 passed (23)   EXIT=0

npx tsc --noEmit         → TSC_EXIT=0
npx eslint <touched 6 files> → ESLINT_EXIT=0
```

- `empDeptCatalog.test.ts` (7) PASS
- `empPositionCatalog.test.ts` (7) PASS — peer regression (no reopen)
- `EmployeeFormDialog.mount-guard.test.ts` (9) PASS — includes new `R-PLT-EMP-DEPT-FE-02`, prior `status` FE-02, `position` FE-02, SoftDel `departments.map` guard, manager picker

---

## 4. Behaviour contract (for QA browser U65)

- **EFF>0, valid pick** → PATCH/POST `department` ∈ EFF → 2xx → FE updates → F5 persists.
- **EFF>0, invent/legacy out-of-EFF** → picker cleared on open (no silent submit); if forced invent submit → Network **400 `HRM-EMP-DEPT-KEY`** (WH surface may show `HRM-WH-DEPT-KEY` ≡ class) → VI toast, **no persist**.
- **EFF=0** → soft empty + CTA `Mở Cài đặt → Danh mục nghiệp vụ` tagged `HRM-EMP-DEPT-EMPTY-CATALOG` (CH06g) · **no seed** · no free-text fallback SoT.
- **Settings basic-fields omit `department`** → picker **still mounts** (required[] force) — was the FE HOLD gap.
- **soft-retire / inactive** dept → hidden from picker; history keeps retired keys; labels display-ready (never raw key).

---

## 5. Honesty / must_keep

- `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · `C-SLICE-≠-MODULE` — **NOT flipped**. This is a consumer FE slice, not module EMP UAT.
- Nest `emp_department` **DENY** · Nest `emp_position` **DENY** — no Nest routes bound.
- EMP-POSITION FE CLOSED (`EMPPOSQCFE-8DEF5536`) · EMP-STATUS FE CLOSED (`EMPSTQAFE2-MSKE3NV1`) — **RETAIN**, `status`+`position` still in required[].
- L1 EMP-DEPT invent KEY `EMPDEPTQA-MSK3VVXX` · DOCS CH06g · P3 alias HOLD — **RETAIN**, no BE change this seat.
- U65: no seed anywhere.

---

## 6. Hand-off

- **completion_report:** Option A FE consumer deepen for R-PLT-EMP-DEPT-FE-01 closed on FE lane. Department forced into `buildActiveFieldSet` required[] so `CatalogSearchPicker` always mounts; department picker SoT = Settings `departments` EFF on `EmployeeFormDialog` + `EmployeeWorkTimeline`; invent/out-of-EFF → 400 `HRM-EMP-DEPT-KEY`/`HRM-WH-DEPT-KEY` VI toast (no persist) via `empDeptKeyToastFirst` in mutations + WH save; empty EFF CTA CH06g `HRM-EMP-DEPT-EMPTY-CATALOG`, no seed; soft-retire hidden; display-ready labels. New `empDeptCatalog.ts` (+test) + mount-guard `R-PLT-EMP-DEPT-FE-02`. tsc + eslint + 23 vitest PASS. Nest DENY / EMP-POSITION+STATUS FE CLOSED / L1 KEY / LVRULE HOLD / honesty false all RETAIN.
- **residual:** none on FE lane. Open = QA browser AC-PLT-EMP-DEPT-01/01b/01c + FE-02 mount, then QC-FE Condition close.
- **next_owner:** qa
- **next_dispatch_prompt:** `EMP-DEPT-CATALOG-QA-FE-01` U65 browser AC-PLT-EMP-DEPT-01 — verify department `CatalogSearchPicker` mounts on Edit + Create (even when Settings basic-fields omit department), pick dept ∈ EFF → Lưu `department` 2xx → F5 persists; invent/out-of-EFF → 400 `HRM-EMP-DEPT-KEY`/`HRM-WH-DEPT-KEY` + VI toast no persist; EFF=0 → CTA CH06g no seed; confirm EMP-POSITION/EMP-STATUS FE not reopened. Account `ceo@xe.vn` / `Xevn@2026`, HRM `/employees`.
- **evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-fe-01.md`
- **ack_status:** READY_FOR_QA
