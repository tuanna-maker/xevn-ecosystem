# Evidence — PO-ECO-TC-HRM-PERFORMANCE-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-ECO-TC-HRM-PERFORMANCE-01` |
| **from_role** | qa |
| **to_role** | qa-synth (PM) |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **evidence_path** | `docs/qa/evidence/po-eco-tc-hrm-performance-01.md` |
| **pack_path** | `docs/qa/testcases/hrm-web/HRM-PERFORMANCE.md` |

## Scope

World-standard **catalog** TC depth cho menu **HRM Hiệu suất / Đánh giá** (`/performance`) + **CC embed** `P-CC-HRM-09` (`/command-center/hrm/performance` — CTA **Mở HRM / Đánh giá**, không full iframe). Inventory từ `Performance.tsx` + Nest `performance.controller.ts` + E3 SM/helpers. **Không** chạy browser UAT wave; **không** seed; **không** claim UAT/Phase1 DONE.

| Trace | Ref |
|-------|-----|
| UF | **UF-HRM-MENU-09** |
| Journey | **J-HRM-MENU-SWEEP** (leaf); không J-HRM-09 mutate cross-nav |
| Program | `PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` §2 · U82/U83 · U65/U76/U78 |
| Roster | **MENU-09** · `ECOSYSTEM_MENU_ROSTER.md` Wave B |
| SRS/BR | HRM-PF-01..04 · FR-HRM-PERF-SM-E3-01 · AC-PERF-01..05 · AC-FID-13 |
| Runtime cite (no re-run) | `PILOT_BUSINESS_FLOW_MATRIX.md` P-CC-HRM-09 · menu sweep R2 dates |

## Method (read_first)

| # | Source | Use |
|---|--------|-----|
| 1 | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` §2 | DoD depth gate |
| 2 | `docs/qa/testcases/_TEMPLATE_MENU_TC_PACK.md` | Pack structure §1–§7 |
| 3 | `docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md` | MENU-09 · XBOS-HRM-EMBED-PERF |
| 4 | `apps/web/hrm/src/pages/Performance.tsx` | Screens · fields · functions · testids |
| 5 | `apps/web/hrm/src/lib/statusMachineE3.ts` | Cycle/eval SM · delete/edit gates |
| 6 | `apps/web/web-portal/src/modules/hrm/HrmWorkspacePanel.tsx` | CC embed CTA case `performance` |
| 7 | `apps/api/hrm-api/src/performance/performance.controller.ts` | API inventory |
| 8 | `apps/api/hrm-api/src/performance/performance.service.ts` | Error codes · delete block · catalog keys |
| 9 | `docs/hrm/TECHSPEC.md` §16.1 · `HRM_MENU_DATA_LINKAGE_MATRIX.md` | Trace · density |
| 10 | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` UF-HRM-MENU-09 | UF linkage |

## Depth gate (DoD)

| Gate | Result |
|------|--------|
| Screen inventory | ☑ 13 `screen_id` (§1 pack) |
| Field dictionary | ☑ 28 `field_id` (§2 pack) |
| Function inventory | ☑ 15 `fn_id` (§3 pack) |
| TC matrix HP/FD/BD/AU/UX/DEN/BLK | ☑ 58 TC · coverage check **0 GAP** (§4 pack) |
| Trace SRS/TechSpec/API/HDSD | ☑ §5 pack |
| CC embed AS-IS (CTA not iframe) | ☑ TC-PERF-L-HP-002/003 |
| U65 precond wording | ☑ «data từ FE» · cấm seed in execution |
| No apps/** changes | ☑ docs-only |

## Coverage check summary (mirror pack §4)

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions ≥1 HP | 15 | 15 | 0 |
| Mutate fn ≥1 FD | 7 | 7 | 0 |
| Required fields ≥1 FD/BD | 7 | 7 | 0 |
| Inline forms cancel/submit | 2 flows | TC-PERF-CYC-HP-004 + create FDs | 0 |
| UF-HRM-MENU-09 / embed | 2 | 3 | 0 |

## Residual / notes for synth

| Item | Note |
|------|------|
| Dedupe vs spine catalog | No dedicated spine TC for PF — synth may link HRM-PF-* to pack IDs |
| FN-EV-UPDATE (PATCH content) | BE ready · FE OOS — do not invent TC until UI exists |
| Employee UUID field | Cross-link future employee picker pack · keep UUID TC for AS-IS |
| MP-11 mobile performance | OOS · web-only |
| AC-FID-13 density | BLK TC — not execution blocker for catalog |
| `performanceFormSchema.ts` | Imported by FE; file may be git-untracked — Zod rules reflected via EVAL_MSG/CYCLE_MSG in page |

## completion_report

- **Closed:** Full menu TC pack `HRM-PERFORMANCE.md` (inventory + **58** TC **PLANNED/BLK**); trace MENU-09 · UF-HRM-MENU-09 · HRM-PF-01..04 · E3 SM; CC CTA embed documented.
- **Open:** No browser execution; synth dedupe TC-ID vs ecosystem roster; Wave B UAT remains PLANNED.

## next_owner

`qa-synth` (dedupe + rollup `PO_SPEC_TEST_REPORT.md` ecosystem depth section)

## next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-SYNTH-WAVE-B-01 (or next synth WI on bus)
from_role: pm
to_role: qa-synth
read_first: docs/qa/testcases/hrm-web/HRM-PERFORMANCE.md · docs/qa/evidence/po-eco-tc-hrm-performance-01.md · docs/qa/testcases/README.md
task: Dedupe TC-PERF-* vs existing catalog/spine; merge counts into ecosystem depth rollup; confirm MENU-09 roster PLANNED→PACK_READY; no UAT execution.
exit_criteria: Synth note in docs/qa/evidence/po-eco-tc-synth-*.md · ack PASS_TO_PM or READY_FOR_PM
ack_status target: PASS_TO_PM
```

## ack_status

**READY_FOR_SYNTH**
