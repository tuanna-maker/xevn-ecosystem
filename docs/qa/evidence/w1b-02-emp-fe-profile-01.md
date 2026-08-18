# Evidence — W1-B-02-EMP-FE-PROFILE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-02-EMP-FE-PROFILE-01` |
| **defect** | `D-HRM-EMP-PROFILE-PERM-FALLBACK-01` |
| **role** | dev-fe |
| **date** | 2026-08-03 |
| **parent FAIL** | `docs/qa/evidence/w1b-02-emp-qa-ret3.md` |
| **ack_status** | `READY_FOR_QA` |
| **U65** | zero-seed · no `pnpm seed:*` · no EMP BE rewrite |
| **mount_runtime** | `docs/qa/evidence/_tmp-w1b-02-emp-fe-profile-01-mount.json` |

## Problem

QA RET3: Employees list **AC1 PASS** (43 rows), but J-HRM-02 detail whitescreen:

- `GET :8080|:5173/hr/src/pages/EmployeeProfile.tsx` → **500**
- Missing `@/components/auth/PermissionFallback` (and chained `@/lib/employeeProfileTabGroups`)

→ no `GET /employees/{id}`; `#root` empty / profile not mounted.

## Fix (restore from stash — same pattern as Fleet / FE-LIBS-01)

Restored from stash commit `43c479afd56531654ee3d3100a9681f60ff7c4e0`:

### Primary (dispatch)

| Path | Role |
|------|------|
| `apps/web/hrm/src/components/auth/PermissionFallback.tsx` | UX-07 gated salary/PII fallback |
| `apps/web/hrm/src/components/auth/PermissionFallback.test.ts` | Unit |
| `apps/web/hrm/src/components/auth/permissionFallbackSot.ts` | VI/EN SoT + testids |
| `apps/web/hrm/src/lib/employeeProfileTabGroups.ts` | Core/HR/Career/Personal tab map |
| `apps/web/hrm/src/lib/employeeProfileTabGroups.test.ts` | Unit |

### Transitive (required for profile eager graph mount)

After primary restore, Vite still 500 on eager children of `EmployeeProfile`:

| Missing import | Restored path(s) |
|----------------|------------------|
| `@/components/ui/ViDateField` | `ViDateField.tsx` + `ViDatePickerField.tsx` (+ tests) |
| `@/components/employee/EmployeeCompensationPanel` | Panel + HistoryPanel + `useEmployeeCompensation.ts` |
| `@/lib/contractEndDatePolicy` | `contractEndDatePolicy.ts` (+ test) |
| `@/lib/compensationLines` | `compensationLines.ts` (+ test) |

CODE-MEMORY-CHANGE **APPEND** on restored production modules for `W1-B-02-EMP-FE-PROFILE-01`.

**Untouched:** Employees list · FE-LIBS-01 libs · Fleet · App.tsx · EMP BE · no seed.

## Verify

| Check | Result |
|-------|--------|
| vitest PermissionFallback + tabGroups + ViDate* + contractEndDatePolicy + compensationLines + CompensationPanel | **40/40 PASS** |
| `GET :8080/hr/src/pages/EmployeeProfile.tsx` | **200** · no resolve fail |
| `GET :5173/hr/src/pages/EmployeeProfile.tsx` | **200** · no resolve fail |
| `GET …/PermissionFallback.tsx` · `employeeProfileTabGroups.ts` · `ViDateField.tsx` · `EmployeeContracts.tsx` · `EmployeeSalary.tsx` | **200** both ports |
| `GET …/Employees.tsx` | **200** (must_keep list path) |
| Browser deep-link `/hr/employees/{id}?portal=1&companyId=main` | `#root` childCount=**4** · textLen=**1250** · tabs Chung/Công việc/Hợp đồng/Lương · `GET …/employees/{id}?company_id=main` **200** |
| Console resolve errors | **0** |

## must_keep

- Employees list path AC1
- FE-LIBS-01 (`hrmDialogPortalA11y`, `embedWorkingContext`, `scopeRoleLabels`)
- Fleet restore
- U65 zero-seed
- No EMP BE rewrite

## Residual

- Browser J-HRM-02 + case_matrix A/B/C + F5 + hdsd_align + test_log md+json = **QA** (`W1-B-02-EMP-QA-RET4`)
- No UF EMP 🟢 claimed here (profile mount unblock only)
- List CHỨC VỤ raw `STAFF` (RET3 note) = separate display residual — not this wave

## Handoff

- **next_owner:** qa
- **ack_status:** READY_FOR_QA
- **next_dispatch:** `W1-B-02-EMP-QA-RET4` (see completion packet `next_dispatch_prompt`)
