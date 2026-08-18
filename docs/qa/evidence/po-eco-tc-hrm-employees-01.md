# Evidence — PO-ECO-TC-HRM-EMPLOYEES-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-ECO-TC-HRM-EMPLOYEES-01` |
| **role** | qa |
| **date** | 2026-08-03 |
| **deliverable** | `docs/qa/testcases/hrm-web/HRM-EMPLOYEES.md` |
| **ack_status** | `READY_FOR_SYNTH` |

## Summary counts (inventory)

| Artifact | Count | Notes |
|----------|------:|-------|
| Pages | 2 | `/employees` (+ alias `/dashboard`), `/employees/:id` |
| Profile tabs | 15 | `employeeProfileTabGroups.ts` |
| Form dialog tabs | 4 | basic / personal / work / finance (catalog-gated) |
| Dialogs / sheets | 18 | import, export, form, deleted, archive, restore + profile sub-CRUD |
| Confirms | 2 | soft-delete archive, restore |
| Popovers | 3 | HR / Career / Personal group pickers |
| **Fields (dictionary rows)** | **118** | list + filters + form + profile read-only + export + import preview + tab CRUD |
| **Functions (inventory rows)** | **72** | 28 read/nav · 44 mutate |
| **Test cases (matrix rows)** | **156** | PLANNED — chưa execution U65 |

## Coverage gate (pack self-check)

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions với ≥1 HP | 72 | 72 | 0 |
| Mutate functions với ≥1 FD | 44 | 44 | 0 |
| Required fields với ≥1 FD/BD | 12 | 12 | 0 |
| Dialogs với open/cancel/submit TC | 18 | 18 | 0 |

## Residual / SPEC_GAP

| ID | Item | Status |
|----|------|--------|
| SPEC_GAP-HDSD-EMP-01 | Chưa có HDSD leaf riêng «Danh sách nhân sự» | **Closed** — `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH06_HRM_NHAN_SU.md` |
| HOLD-T_L1 | Tab KPI / JobList một phần mock-local — TC đánh dấu MANUAL+DATA | OOS execution precond |

## Sources read

- `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` §2
- `docs/qa/testcases/_TEMPLATE_MENU_TC_PACK.md`
- `apps/web/hrm/src/pages/Employees.tsx`, `EmployeeProfile.tsx`, `employee/*`, `employeeProfileTabGroups.ts`
- `docs/hrm/SRS.md` UC-HRM-21 · §15 employees · `SRS_FIELD_DISPLAY.md`
- `apps/api/hrm-api/src/employees/employees.controller.ts`
- UF/J: `USER_FLOW_OPERABILITY_MATRIX.md` UF-HRM-01/03 · UF-HRM-MENU-02/02b · `PROGRAM_JOURNEY_MAP.md` J-HRM-01/02/IM-01

## Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-hrm-employees-01.md
next_owner: qa-synth
counts: screens=40 fields=118 functions=72 tcs=156
completion_report: Menu TC pack HRM Employees filled — screen/field/function inventories + 156 TC matrix rows; zero coverage GAP on pack rules; HDSD leaf SPEC_GAP documented.
next_dispatch_prompt: qa-synth — Dedupe TC-ID `TC-EMP-*` across wave A; rollup `docs/qa/reports/PO_SPEC_TEST_REPORT.md` §Ecosystem depth; flag cross-menu FK (contracts→profile J-HRM-01) for trace merge.
```
