# Evidence — PO-ECO-TC-HRM-CONTRACTS-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-ECO-TC-HRM-CONTRACTS-01` |
| **from_role** | qa |
| **to_role** | qa-synth (PM) |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **evidence_path** | `docs/qa/evidence/po-eco-tc-hrm-contracts-01.md` |
| **pack_path** | `docs/qa/testcases/hrm-web/HRM-CONTRACTS.md` |

## Scope

World-standard **catalog** TC depth cho menu **Hợp đồng** (menu `/contracts` + CC embed cùng UI + profile tab parity UF-HRM-02). **Không** chạy UAT browser wave; **không** seed; **không** claim UAT/Phase1 DONE.

| Trace | Ref |
|-------|-----|
| UF | **UF-HRM-02** · **UF-HRM-MENU-03** |
| Journey | **J-HRM-01** · **J-HRM-03** |
| Menu | **MENU-03** |
| Program | `PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` §2 · roster `HRM-CONTRACTS` |

## Method (read_first)

| # | Source | Use |
|---|--------|-----|
| 1 | `apps/web/hrm/src/pages/Contracts.tsx` | List, filter, CRUD dialogs, import hook, export |
| 2 | `apps/web/hrm/src/components/employee/EmployeeContracts.tsx` | Profile tabs HĐ/Đãi ngộ/Lịch sử, renew/history |
| 3 | `apps/web/hrm/src/components/contract/ContractImportDialog.tsx` | Import wizard fields/steps |
| 4 | `apps/web/hrm/src/hooks/useContracts.ts` | API paths, progressive list, POST position_key |
| 5 | `docs/hrm/SRS.md` UC-HRM-25 · FR-HRM-CI-* · BR-CD-F5-01 | Trace |
| 6 | `docs/hrm/TECHSPEC.md` §14.2 | HRM-CON-201/200 |
| 7 | Prior QA | `p1-hrm-h12-journey-qa-20260606.md` J-HRM-03 · `po-e2e-spine-01-qa-w5.md` Vite regression note |

## Depth gate (DoD)

| Gate | Result |
|------|--------|
| Screen inventory | ☑ 28 `screen_id` (§1 pack) |
| Field dictionary | ☑ 52 `field_id` (§2 pack) |
| Function inventory | ☑ 43 `fn_id` (§3 pack) |
| TC matrix HP/FD/BD/AU | ☑ 96 TC · coverage check **0 GAP** (§4 pack) |
| Trace SRS/TechSpec/API/HDSD | ☑ §5 pack |
| U65 precond wording | ☑ «data từ FE» · cấm seed trong execution |
| U76 HDSD paths | ☑ CC→Hợp đồng · NV→tab Hợp đồng · testids referenced |

## Coverage check summary (mirror pack §4)

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions ≥1 HP | 43 | 43 | 0 |
| Mutate fn ≥1 FD | 18 | 18 | 0 |
| Required fields ≥1 FD/BD | 8 | 8 | 0 |
| Dialogs/confirms open/cancel/submit | 11 | 11 | 0 |

## Residual / notes for synth

| Item | Note |
|------|------|
| Import `CONTRACT_TYPES` hardcoded labels | TC + **SPEC_GAP** vs catalog E2 — execution dùng catalog SoT |
| Compensation tab depth | Shell TC only — full package mutate → payroll/compensation pack |
| Insurance menu | Wave B `HRM-INSURANCE.md` — dedupe UC-HRM-25 insurance slice |
| Spine catalog TC-HP-10 / HP-05 | Map to TC-CON-NAV-* / TC-CON-J03-* — synth merge IDs |
| Vite 500 historical | TC-CON-REG-HP-001 regression guard — not execution PASS |

## completion_report

- **Closed:** Full menu TC pack `HRM-CONTRACTS.md` — 28 screens · 52 fields · 43 functions · 96 TC PLANNED; trace UF-HRM-02 · MENU-03 · J-HRM-01/03; CC embed parity row; profile F5/BR-CD-F5-01 coverage.
- **Open:** No browser execution; synth dedupe vs `PO_SPEC_TEST_CASE_CATALOG.md` and Wave A packs; roster `HRM-CONTRACTS` status still PLANNED until SYNTHED.

## next_owner

`qa-synth` — dedupe TC-ID + rollup ecosystem depth.

## next_dispatch_prompt

```
work_item_id: PO-ECO-TC-SYNTH-WAVE-B-01
from_role: pm
to_role: qa
Mission: SYNTH Wave B — include HRM-CONTRACTS.md; dedupe vs TC-HP-05/10 spine and HRM-EMPLOYEES tab contract TCs; update docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md HRM-CONTRACTS → SYNTHED; docs/qa/reports/PO_SPEC_TEST_REPORT.md § Ecosystem depth.
read_first: docs/qa/testcases/hrm-web/HRM-CONTRACTS.md · docs/qa/evidence/po-eco-tc-hrm-contracts-01.md · docs/qa/testcases/hrm-web/HRM-EMPLOYEES.md §4.6
exit_criteria: No duplicate TC-ID; coverage rollup; ack_status PASS_TO_PM
cấm: apps/** · seed · UAT DONE claim
```
