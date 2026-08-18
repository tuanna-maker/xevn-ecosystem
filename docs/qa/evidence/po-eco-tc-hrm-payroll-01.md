# Evidence — PO-ECO-TC-HRM-PAYROLL-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-ECO-TC-HRM-PAYROLL-01` |
| **from_role** | qa |
| **to_role** | qa-synth (PM) |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **evidence_path** | `docs/qa/evidence/po-eco-tc-hrm-payroll-01.md` |
| **pack_path** | `docs/qa/testcases/hrm-web/HRM-PAYROLL.md` |

## Scope

World-standard **catalog** TC depth cho menu **HRM Lương** (`/payroll`) + **CC embed** `P-CC-08` `/command-center/hrm/payroll`: tổng quan, thành phần lương, chính sách, dữ liệu, tính lương (kỳ/phiếu/tạm ứng), chi trả, **FR-UC-H04** honest mount/empty, **taxSettlement UI HIDE** (AC-E2-P3-02), cross-nav **J-HRM-07** và NV tab Lương. **Không** chạy UAT browser wave; **không** seed; **không** claim UAT/Phase1 DONE.

| Trace | Ref |
|-------|-----|
| UF | **UF-HRM-06** · **UF-HRM-MENU-08** |
| Journey | **J-HRM-07** · UF-HRM-MENU-02b |
| Program | `PO_SPEC_TEST_SUITE_PROGRAM.md` §2 · `PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` · U82/U83 · U65/U76/U78 |
| Spine | **FR-UC-H04** · `PO_SPEC_TEST_CASE_CATALOG.md` **TC-HP-11** |
| Runtime cite (no re-run) | `po-e2e-spine-01-qa-w5.md` FAIL blank · `po-e2e-spine-01-qa-w5-r1.md` PASS mount · `po-e2e-spine-01-fe-vite-pay-con-01.md` FE fix |

## Method (read_first)

| # | Source | Use |
|---|--------|-----|
| 1 | `docs/program/PO_SPEC_TEST_SUITE_PROGRAM.md` §2.1 catalog columns | TC matrix shape |
| 2 | `docs/qa/testcases/_TEMPLATE_MENU_TC_PACK.md` | Depth gate §1–§7 |
| 3 | `docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md` | MENU-08 · pack path Wave B |
| 4 | `apps/web/hrm/src/pages/Payroll.tsx` | 7 tabs · overview · calc/policy/data routing · tax HIDE |
| 5 | `apps/web/hrm/src/components/payroll/*` | PayslipsApiTab · BatchesTab · SalaryComponentsTab · AdvanceRequestsTab · PaymentBatchesTab · policy/data tabs |
| 6 | `apps/api/hrm-api/src/payroll/payroll.controller.ts` | Endpoint + code inventory |
| 7 | `docs/hrm/SRS.md` UC-HRM-24 · `docs/hrm/TECHSPEC.md` §14.6/§16.1 | AC honest empty · 3-state periods |
| 8 | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` UF-HRM-06 · MENU-08 | UF/J linkage |
| 9 | `docs/qa/PO_SPEC_TEST_CASE_CATALOG.md` TC-HP-11 | Spine dedupe on synth |

## Depth gate (DoD)

| Gate | Result |
|------|--------|
| Screen inventory | ☑ 38 `screen_id` (§1 pack) |
| Field dictionary | ☑ 78 `field_id` (§2 pack) |
| Function inventory | ☑ 52 `fn_id` (§3 pack) |
| TC matrix HP/FD/BD/AU/UX/STUB/BLK | ☑ 96 TC · coverage check **0 GAP** (§4 pack) |
| Trace SRS/TechSpec/API/HDSD | ☑ §5 pack |
| FR-UC-H04 mount + honest empty | ☑ §4.1 · §4.3 · TC-PAY-MNT-* · TC-PAY-J07-* |
| taxSettlement HIDE (no invent) | ☑ §4.9 · TC-PAY-TAX-* · LEG-TAX-UI BLK |
| Vite mount context (inventory) | ☑ TC-PAY-MNT-HP-003 · cite W5/W5-R1 |
| U65 precond wording | ☑ «data từ FE» · cấm seed in execution steps |

## Coverage check summary (mirror pack §4)

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions ≥1 HP | 52 | 52 | 0 |
| Mutate fn ≥1 FD | 22 | 22 | 0 |
| Required fields ≥1 FD/BD | 18 | 18 | 0 |
| Dialogs open/cancel/submit | 12 | 12 | 0 |
| FR-UC-H04 / embed mount | 2 | 4 | 0 |

## Residual / notes for synth

| Item | Note |
|------|------|
| Tab **Báo cáo** top-level | AS-IS `renderMainContent` default → overview — STUB TC |
| Overview charts when payslips=0 | Demo/static buckets — TC mark UX not API |
| G-PR-03 process FE bind | TechSpec **PARTIAL** — TC-PAY-BAT-HP-006 verify on execution |
| `TC-HP-11` catalog | Map to `TC-PAY-SPINE-HP-001` + J-HRM-07 block — dedupe IDs on synth |
| W5-R1 runtime PASS | Catalog remains **PLANNED** until Wave B browser execution |
| Member CEO payroll scope | AU TC — không rollup tập đoàn |
| Feedback card | EmbedApiEmptyState — no mutate TC until API defined |

## completion_report

- **Closed:** Full menu TC pack `HRM-PAYROLL.md` (inventory + **96** TC **PLANNED**); trace UF-HRM-06/MENU-08 · J-HRM-07 · FR-UC-H04; tax settlement HIDE; CC embed mount class; cross-ref spine TC-HP-11.
- **Open:** Không execution verdict; synth dedupe vs catalog + Wave A/B roster; browser UAT for payroll mutate paths still PLANNED.

## next_owner

`qa-synth` (dedupe + rollup `PO_SPEC_TEST_REPORT.md` § Ecosystem depth) → PM dispatch execution QA when synth PASS.

## next_dispatch_prompt

```
work_item_id: PO-ECO-TC-SYNTH-WAVE-A-01
from_role: pm
to_role: qa
Mission: SYNTH Wave A/B menu packs — dedupe TC-ID vs PO_SPEC_TEST_CASE_CATALOG (incl. TC-HP-11 ↔ TC-PAY-SPINE-HP-001); merge HRM-PAYROLL with ATTENDANCE/RECRUITMENT/EMPLOYEES FK; update docs/qa/reports/PO_SPEC_TEST_REPORT.md § Ecosystem depth và docs/qa/testcases/README.md + roster ECOSYSTEM_MENU_ROSTER status HRM-PAYROLL → SYNTHED.
read_first: docs/qa/testcases/hrm-web/HRM-PAYROLL.md · docs/qa/evidence/po-eco-tc-hrm-payroll-01.md · docs/qa/testcases/hrm-web/HRM-ATTENDANCE.md · docs/qa/PO_SPEC_TEST_CASE_CATALOG.md
exit_criteria: No duplicate TC-ID; roster HRM-PAYROLL READY_FOR_SYNTH→SYNTHED; coverage rollup table; ack_status PASS_TO_PM
cấm: apps/** edits · seed · UAT DONE claim
```

## ack_status

**READY_FOR_SYNTH**
