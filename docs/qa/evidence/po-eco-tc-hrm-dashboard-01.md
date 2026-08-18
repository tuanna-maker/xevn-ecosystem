# Evidence — PO-ECO-TC-HRM-DASHBOARD-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-ECO-TC-HRM-DASHBOARD-01` |
| **from_role** | qa |
| **to_role** | qa-synth (PM) |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **evidence_path** | `docs/qa/evidence/po-eco-tc-hrm-dashboard-01.md` |
| **pack_path** | `docs/qa/testcases/hrm-web/HRM-DASHBOARD.md` |

## Scope

World-standard **catalog** TC depth cho menu **HRM Tổng quan / Dashboard** (`/` · MENU-01) + **CC embed** **P-CC-HRM-DASH** (`/command-center/hrm/dashboard`). Inventory từ `Dashboard.tsx` + `PortalOperationsSummary` · `ExpiringContractsAlert` · `HrmApiReminders` + hooks summary/overview/payslips/expiring/leave. **Không** chạy browser UAT wave; **không** seed; **không** claim UAT/Phase1 DONE.

| Trace | Ref |
|-------|-----|
| UF | **UF-HRM-MENU-01** |
| Matrix | **P-CC-HRM-DASH** · UC-HRM-20 |
| Journey | **J-HRM-MENU-SWEEP** (leaf MENU-01) |
| Program | `PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` §2 · U82/U83 · U65/U76 |
| Roster | **MENU-01** · Wave B/C · `ECOSYSTEM_MENU_ROSTER.md` |
| Data quality | `HRM_DASHBOARD_DATA_QUALITY_RULES.md` · BR-DQ-01 · AC-HC-03 |
| Runtime cite (no re-run) | `qa-hrm-dash-net-01-verify-20260730.md` · `PILOT_BUSINESS_FLOW_MATRIX.md` P-CC-HRM-DASH |

## Method (read_first)

| # | Source | Use |
|---|--------|-----|
| 1 | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` §2 | DoD depth gate |
| 2 | `docs/qa/testcases/_TEMPLATE_MENU_TC_PACK.md` | Pack structure §1–§7 |
| 3 | `docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md` | MENU-01 · XBOS-HRM-EMBED-DASH |
| 4 | `apps/web/hrm/src/pages/Dashboard.tsx` | Screens · fields · charts · period · export |
| 5 | `apps/web/hrm/src/components/dashboard/*.tsx` | Ops · expiring · reminders |
| 6 | Hooks: `useEmployeesSummary` · `useAttendanceOverview` · `usePayrollPayslips` · `useExpiringContractsDashboard` · `useLeaveRequestsData` · `useOperationsSummary` | API spine |
| 7 | `docs/hrm/SRS.md` UC-HRM-20 · `HRM_MENU_DATA_LINKAGE_MATRIX.md` §2.1 | Trace |
| 8 | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` UF-HRM-MENU-01 | UF linkage |
| 9 | `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` P-CC-HRM-DASH | Network acceptance cite |

## Depth gate (DoD)

| Gate | Result |
|------|--------|
| Screen inventory | ☑ 19 `screen_id` (§1 pack) |
| Field dictionary | ☑ 42 `field_id` (§2 pack) |
| Function inventory | ☑ 18 `fn_id` (§3 pack) |
| TC matrix HP/FD/BD/AU/UX/NET/DQ | ☑ 54 TC · coverage check **0 GAP** (§4 pack) |
| Trace SRS/TechSpec/API/HDSD | ☑ §5 pack |
| Phase-2 stubs marked | ☑ income pie mix · payroll history compare |
| U65 precond wording | ☑ «data từ FE» · cấm seed in execution |
| No apps/** changes | ☑ docs-only |

## Coverage check summary (mirror pack §4)

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions ≥1 HP | 18 | 18 | 0 |
| Mutate fn ≥1 FD | 2 | 2 | 0 |
| P-CC-HRM-DASH network spine | 4 GETs | TC-DASH-NET-HP-001/002 | 0 |
| CC embed ops tile | 1 | TC-DASH-OPS-* | 0 |
| Empty honesty (payroll/dept/new emp) | 3 testids | TC-DASH-PAY/CH/NEW UX | 0 |

## Residual / notes for synth

| Item | Note |
|------|------|
| Dedupe vs spine | Link existing P-CC-HRM-DASH / D-HRM-DASH-NET TC aliases to `TC-DASH-NET-*` |
| Approve leave on dashboard | Full leave lifecycle in HRM-ATTENDANCE pack — here entry-only mutate |
| Employee deep-link from expiring | Cross-ref HRM-EMPLOYEES / HRM-CONTRACTS J-* |
| Roster row | `HRM-DASHBOARD.md` PLANNED → **PACK_READY** on synth |
| Income structure Phase-2 | Do not FAIL catalog for 0% bonus slices |

## completion_report

- **Closed:** Full menu TC pack `HRM-DASHBOARD.md` (inventory + **54** TC **PLANNED**); trace MENU-01 · UF-HRM-MENU-01 · UC-HRM-20 · P-CC-HRM-DASH; network spine + empty-state + Phase-2 chart stubs documented.
- **Open:** No browser execution; synth dedupe TC-ID vs ecosystem catalog; Wave UAT remains PLANNED.

## next_owner

`qa-synth` (dedupe + rollup `PO_SPEC_TEST_REPORT.md` ecosystem depth section)

## next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-SYNTH-WAVE-C-01 (or next synth WI on bus)
from_role: pm
to_role: qa-synth
read_first: docs/qa/testcases/hrm-web/HRM-DASHBOARD.md · docs/qa/evidence/po-eco-tc-hrm-dashboard-01.md · docs/qa/testcases/README.md · docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md
task: Dedupe TC-DASH-* vs P-CC-HRM-DASH / spine catalog; merge counts into ecosystem depth rollup; set MENU-01 roster PLANNED→PACK_READY; no UAT execution.
exit_criteria: Synth note in docs/qa/evidence/po-eco-tc-synth-*.md · ack PASS_TO_PM or READY_FOR_PM
ack_status target: PASS_TO_PM
```

## ack_status

**READY_FOR_SYNTH**
