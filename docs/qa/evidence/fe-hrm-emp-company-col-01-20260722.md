# D-HRM-EMP-COMPANY-COL-FE-01 — Cột «Thông tin công ty» (Employees list)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-EMP-COMPANY-COL-FE-01` |
| **date** | 2026-07-22 (ICT) |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | `docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md` · UC-HRM-21 · AC-EMP-COL-01..07 |
| **HOLD_DEPLOY** | **true** — cấm sync :8088 / pilot deploy |
| **U65** | no seed |

---

## 1. spec_read_ack

| Item | Value |
|------|--------|
| **srs** | `docs/hrm/SRS.md` UC-HRM-21 · §15 BR-INT-05 (via BA evidence) |
| **ba_ac** | `docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md` AC-EMP-COL-01..07 · BR-EMP-COL-01..02 |
| **sponsor_confirm** | BA-HRM-EMP-COMPANY-COL-01 PASS_TO_PM (2026-07-22) |
| **change_mode** | ADD / UPGRADE resolve path — **không** Option C đổi header |

---

## 2. What changed (FE)

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/employeeCompanyDisplayName.ts` | New pure resolve: prefer `company_display_name` → non-Khối OU map → membership → `—`; reject `^Khối\s+` |
| `apps/web/hrm/src/lib/employeeCompanyDisplayName.test.ts` | 7 vitest — AC-EMP-COL-01/02/03 · BR-EMP-COL-02 fail-closed |
| `apps/web/hrm/src/pages/Employees.tsx` | Column bind `resolveEmployeeCompanyColumnLabel(emp)`; CODE-MEMORY |
| `apps/web/hrm/src/hooks/useEmployees.ts` | `Employee.company_display_name?` |
| `apps/web/hrm/src/hooks/useEmployee.ts` | `mapHrmEmployeeRecord` pass-through `company_display_name` / `company_name` |
| `apps/web/hrm/src/integrations/hrmApi.ts` | `HrmEmployeeRecord.company_display_name?` / `company_name?` |
| `apps/web/hrm/src/lib/hrmOperatingUnits.ts` | TEST_FIXTURE → LE/ĐVTV names (aligned BE registry); CODE-MEMORY |
| `apps/web/hrm/src/lib/hrmOperatingUnits.test.ts` | Assert no Khối in fixture; LE resolve |
| `apps/web/hrm/src/components/hrm/HrmOperatingUnitFilter.tsx` | aria-label «Lọc đơn vị thành viên» (AC-EMP-COL-07) |
| `apps/web/hrm/src/hooks/useEmployee.test.ts` | Pass-through company_display_name |

### Resolve priority (column)

```text
company_display_name (BE, non-Khối)
  → operatingUnitLabelMap[company_id] (non-Khối)
  → membership company.name (non-Khối)
  → «—»   // fail-closed — never surface Khối*
```

Header remains `t('company.title')` = «Thông tin công ty» (Option C rejected).

---

## 3. BE coordination

| Item | Status |
|------|--------|
| BE-HRM-EMP-COMPANY-COL-01 | **READY_FOR_QA** — `company_display_name` on employees list/get |
| FE bind | Prefer `emp.company_display_name` first; OU map + membership as fallback |
| Residual for QA | Browser local only (`HOLD_DEPLOY`); assert cells ∈ LE set |

---

## 4. Test evidence

```text
pnpm test -- src/lib/employeeCompanyDisplayName.test.ts \
  src/lib/hrmOperatingUnits.test.ts \
  src/hooks/useEmployee.test.ts \
  src/pages/Employees.smoke.test.ts
→ Test Files  4 passed (4)
→ Tests      27 passed (27)
```

---

## 5. AC self-check (FE unit)

| AC | FE status |
|----|-----------|
| AC-EMP-COL-01 | Vitest: LE map resolve; Khối rejected |
| AC-EMP-COL-02 | holding → Tập đoàn XeVN |
| AC-EMP-COL-03 | Prefer API `company_display_name`; no Khối hardcode as final |
| AC-EMP-COL-04 | BE-owned (slug map seed) |
| AC-EMP-COL-05 | J-HRM-02 nav untouched (`navigate(/employees/:id)`) |
| AC-EMP-COL-06 | Browser QA (F5) |
| AC-EMP-COL-07 | Filter copy «Đơn vị thành viên» + aria; same OU API SoT as column |

---

## 6. Cấm / locks honored

- No Option C header rename
- No deploy / :8088 sync (`HOLD_DEPLOY=true`)
- No seed (U65)
- No Phase 1 DONE claim

---

## 7. Handoff contract

```yaml
work_item_id: D-HRM-EMP-COMPANY-COL-FE-01
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/fe-hrm-emp-company-col-01-20260722.md
HOLD_DEPLOY: true
completion_report: |
  Closed: Employees company column uses LE/ĐVTV resolve; rejects Khối;
  wires company_display_name from BE; OU fixture + filter aria aligned; vitest 27 PASS.
  Residual: browser U65 assert (HOLD_DEPLOY local); J-HRM-02 + F5.
next_owner: qa
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QA-HRM-EMP-COMPANY-COL-01
entry_criteria: D-HRM-EMP-COMPANY-COL-FE-01 READY_FOR_QA; BE-HRM-EMP-COMPANY-COL-01 preferred live; HOLD_DEPLOY=true (browser local unless sponsor opens deploy); U65 no seed
spec_ref: docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md · docs/qa/evidence/fe-hrm-emp-company-col-01-20260722.md
exit_criteria:
  - ceo@xe.vn → /command-center/hrm/employees (or local embed) · cột «Thông tin công ty» ∈ ĐVTV/LE names
  - 0 cell «Khối … X.E» when LE SoT available
  - Filter Đơn vị thành viên labels align with column (AC-EMP-COL-07)
  - J-HRM-02 list→detail + F5
  - evidence docs/qa/evidence/qa-hrm-emp-company-col-01-YYYYMMDD.md
cấm: seed; PASS chỉ probe; deploy pilot without sponsor allow
```
