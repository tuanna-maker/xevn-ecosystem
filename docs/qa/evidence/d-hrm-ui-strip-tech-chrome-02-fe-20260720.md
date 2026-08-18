# D-HRM-UI-STRIP-TECH-CHROME-02 — FE evidence (2026-07-20)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-UI-STRIP-TECH-CHROME-02` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **parent** | `D-HRM-UI-STRIP-TECH-CHROME-01` + QA `QA-HRM-MENU-FULL-SWEEP-01` FAIL residuals |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD claim · no payroll calc change |
| **date** | 2026-07-20 |

## spec_read_ack

- QA residual SoT: `docs/qa/evidence/qa-hrm-menu-full-sweep-01-20260720.md` § Defect list
- Mandate: same as `D-HRM-UI-STRIP-TECH-CHROME-01` — user-facing copy must not expose Nest/hrm-api/DM codes/raw ISO-Z
- change_mode: FIX (display/copy only)

## Closed (batch)

| ID | Sev | Fix |
|----|-----|-----|
| `D-HRM-PAYROLL-STRIP-HRM-API-LABEL-01` | P1 | `PayrollPayslipsApiTab` header count only (no `— hrm-api`); `Payroll.tsx` feedback empty body business VI |
| `D-HRM-EMP-SALARY-GRADE-API-BADGE-01` | P2 | `EmployeeSalary` — stop hardcoding `salaryGrade: 'API'`; hide grade badge unless real label; empty body no hrm-api |
| `D-HRM-PROCESSES-STRIP-XBOS-DM-CODE-01` | P2 | `PROCESSES_MUTATION_UNSUPPORTED_VI` → Command Center wording; DM code stays in CODE-MEMORY only |
| `D-HRM-SETTINGS-SYNC-ISO-FORMAT-01` | P2 | `SettingsCatalogsTab` — `formatDisplayDate(xbosSyncedAt, 'dd/MM/yyyy HH:mm')` |
| `D-HRM-PERF-CYCLE-ISO-DISPLAY-01` | P2 | `Performance` cycle list — `formatDisplayDate(start/end)` |

## Keep (verified)

- `@CODE-MEMORY` / UC ids in comments
- `data-testid` attrs (`payroll-payslips-count`, `salary-grade-badge`, `catalog-sync-stamp`, `perf-cycle-row`, `processes-readonly-notice`)
- Scope bars **not** remounted
- Payroll calculation / mutate payloads untouched

## Tests

```text
pnpm exec vitest run \
  src/lib/d-hrm-ui-strip-tech-chrome-02.test.ts \
  src/hooks/useProcesses.test.ts \
  src/lib/formatDisplayDate.test.ts \
  src/pages/Processes.readOnly.test.ts

→ 4 files, 19 tests PASS
```

## QA retest focus (FAIL rows only)

| Menu | Assert |
|------|--------|
| Payroll | Header `N / M bản ghi` — **no** `hrm-api` substring |
| Employee → Lương | **No** badge text `API`; empty copy no hrm-api |
| Processes | Empty notice — **no** `XBOS-DM-*` |
| Settings → Danh mục (+ `/settings-catalogs`) | Sync stamp `dd/MM/yyyy HH:mm` — **no** raw `…Z` |
| Performance | Cycle dates humanized — **no** `T17:00:00.000Z` |

## Residual

- Metadata queue may still show workflow id strings (`xbos.employee_metadata.default`) — P3 from parent QA; **out of this batch**.
- Tools & equipment Phase 2 stub copy unchanged (expected).

## Handoff

- **next_owner:** `qa`
- **ack_status:** `READY_FOR_QA`
- **next_dispatch_prompt:** see completion packet below
