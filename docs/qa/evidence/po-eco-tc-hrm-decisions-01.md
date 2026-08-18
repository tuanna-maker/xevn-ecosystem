# Evidence — PO-ECO-TC-HRM-DECISIONS-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-ECO-TC-HRM-DECISIONS-01` |
| **from_role** | qa |
| **to_role** | qa-synth (PM) |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **evidence_path** | `docs/qa/evidence/po-eco-tc-hrm-decisions-01.md` |
| **pack_path** | `docs/qa/testcases/hrm-web/HRM-DECISIONS.md` |

## Scope

World-standard **catalog** TC depth cho menu **HRM Quyết định** (`/decisions`). **Không** chạy UAT browser wave; **không** seed; **không** claim UAT/Phase1/UC-27 product DONE.

| Trace | Ref |
|-------|-----|
| UF | **UF-HRM-MENU-05** · **UF-HRM-27** (gate) |
| Journey | **J-HRM-DEC-01** (proposed L2.5 trong pack) |
| Menu | **MENU-05** — Density GWC **≠** product DONE |
| Program | `PO_SPEC_TEST_SUITE_PROGRAM.md` §2 · `PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` · U83 |
| Slice | `docs/program/slices/DOC-ENT-P0-HRM-DEC.md` |

## Method (read_first)

| # | Source | Use |
|---|--------|-----|
| 1 | `docs/program/PO_SPEC_TEST_SUITE_PROGRAM.md` §2 | TC column contract · depth program SoT |
| 2 | `docs/qa/testcases/hrm-web/HRM-ATTENDANCE.md` | WORLD-STANDARD pack template |
| 3 | `apps/web/hrm/src/pages/Decisions.tsx` | Screen/field/fn inventory (read-only) |
| 4 | `apps/web/hrm/src/hooks/useDecisions.ts` | API mutate chain (read-only cite) |
| 5 | `docs/hrm/SRS.md` UC-HRM-27 · AC-DEC-* · BR-DEC-* | Trace + fail-deep |
| 6 | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §decisions | Live-empty · NOT DONE gate |
| 7 | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` UF-HRM-MENU-05 | MENU-05 🟢 density GWC note |
| 8 | `docs/program/PO_E2E_BUSINESS_SPINE_PROGRAM.md` | MENU-05 «Density ≠ product DONE» |
| 9 | Prior runtime | `p1-hrm-h12-journey-qa-20260606.md` · `c-w2qc-01-qa-retest-d01-d16-20260602.md` · `qc-hrm-g-dec-01-density-01-20260722.md` |

## Depth gate (DoD)

| Gate | Result |
|------|--------|
| Screen inventory | ☑ 15 `screen_id` (§1 pack) |
| Field dictionary | ☑ 38 `field_id` (§2 pack) |
| Function inventory | ☑ 27 `fn_id` (§3 pack) |
| TC matrix HP/FD/BD/AU/DEN | ☑ **59** TC · coverage check **0 GAP** (§4 pack) |
| Trace SRS/TechSpec/API/HDSD | ☑ §5 pack |
| U65 precond wording | ☑ «data từ FE» · cấm seed trong execution steps |
| U76 HDSD paths | ☑ CC→Quyết định trên mọi TC UI |
| MENU-05 / density honesty | ☑ TC-DEC-DEN-* + BR-DEC-06 blocked DONE claim |

## Coverage check summary (mirror pack §4)

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions ≥1 HP | 27 | 27 | 0 |
| Mutate fn ≥1 FD | 12 | 12 | 0 |
| Required fields ≥1 FD | 4 | 4 | 0 |
| Dialogs open/cancel/submit | 4 | 4 | 0 |
| AC-DEC-01..04 mapped | 4 | 4 | 0 |

## Residual / notes for synth

| Item | Note |
|------|------|
| G-DEC-01 density QC 2026-07-22 | Cite as **GWC** — synth must not promote to UC-27 DONE |
| J-HRM-DEC-01 | **Proposed** journey — BA may add row `PROGRAM_JOURNEY_MAP.md` on first execution PASS |
| No `hdsdMutateTestIds` for decisions yet | Execution wave may dispatch dev-fe testid — not blocker for catalog |
| API unit TC-DEC-API-* | Cross-ref T2 `PO_SPEC_UNIT_TEST_PLAN` when decisions jest gap listed |
| D-DEC-SOFT-01 DELETE `deleted_at` | Slice residual — FD TC may need update after BE soft-delete |

## completion_report

- **Closed:** Full menu TC pack `HRM-DECISIONS.md` — inventory + **59** TC **PLANNED**; trace UC-HRM-27 · UF-HRM-MENU-05 · MENU-05 density policy · J-HRM-DEC-01 draft.
- **Open:** No browser/API execution verdict; synth dedupe vs spine catalog; `J-HRM-DEC-01` not yet on journey map SoT.

## next_owner

`qa-synth` (dedupe + rollup ecosystem depth) → PM dispatch execution QA when synth PASS.

## next_dispatch_prompt

```
work_item_id: PO-ECO-TC-SYNTH-WAVE-B-01
from_role: pm
to_role: qa
Mission: SYNTH Wave B — merge HRM-DECISIONS.md với PO_SPEC_TEST_CASE_CATALOG + roster; dedupe TC-ID; add J-HRM-DEC-01 proposal to PROGRAM_JOURNEY_MAP if PM accepts; update docs/qa/reports/PO_SPEC_TEST_REPORT.md § Ecosystem depth.
read_first: docs/qa/testcases/hrm-web/HRM-DECISIONS.md · docs/qa/evidence/po-eco-tc-hrm-decisions-01.md · docs/qa/evidence/po-eco-tc-roster-01.md
exit_criteria: MENU-05 pack status SYNTHED; no duplicate TC-ID; MENU-05 density ≠ DONE note preserved; ack_status PASS_TO_PM
cấm: apps/** edits · seed · UAT DONE claim
```
