# TEAM LIVE STATUS

Last updated: 2026-05-24 (PM Auto subagentStop follow-up: FE/BE/TM critical scans completed; **`DEPLOY-CONFIG-CRITICAL-REMEDIATION-20260524` → `PM -> DevOps + Dev-BE DISPATCHED`**; QA/QC queued after remediation evidence. Prior 2026-05-04 lanes remain as recorded below until PM re-baselines.)

## Where to track team work

PM Auto latest checkpoint (2026-05-24): P0 `CRITICAL-FE-BE-SECURITY-SCOPE-20260524` is recorded in `docs/program/AGENT_MESSAGE_BUS.md` as `PM -> Dev-FE + Dev-BE + TM DISPATCHED_VIA_BUS` because hook mode is `STOP` and this subagent session has no Task tool. Scope: protected-route bypass, tenant-scope/JWT mismatch, browser internal-key dependency, and public dev seeded login remediation.

- Command stream and handoffs: `docs/program/AGENT_MESSAGE_BUS.md`
- Current PM dispatch and deadlines: `docs/PM_EXECUTION_DISPATCH_XEVN_MULTI_COMPANY_GOVERNANCE_NEXT_CYCLE_P0_CLOSURE_V1.md`
- PM release order (next 24h): `docs/PM_RELEASE_EXECUTION_ORDER_XEVN_MULTI_COMPANY_GOVERNANCE_NEXT_24H_V1.md`
- MVP1 coding baseline: `docs/CODING_PLAN_MVP1_XEVN_MULTI_COMPANY_V1.md`, `docs/SRS_XEVN_MULTI_COMPANY_MVP1_V1.md`, `docs/TECHSPEC_XEVN_MULTI_COMPANY_MVP1_V1.md`
- MVP1 final QC gate: `docs/QC_GATE_DECISION_XEVN_MULTI_COMPANY_MVP1_M6_V1.md`
- QA gate state: `docs/QA_RETEST_REPORT_XEVN_MULTI_COMPANY_GOVERNANCE_NEXT_CYCLE_M4_V1.md`
- QC final gate state: `docs/QC_GATE_DECISION_XEVN_MULTI_COMPANY_GOVERNANCE_NEXT_CYCLE_M7_V1.md`
- Technical baseline: `docs/TM_TECHNICAL_SPEC_PACKAGE_XEVN_MULTI_COMPANY_GOVERNANCE_V1.md`

## Current cycle snapshot

- Overall gate: `GO` (MVP1 gate passed; runtime controls active in hypercare window).
- Role sequence active:
  - `MVP1 coding execution cycle` -> completed (`Dev-BE + Dev-FE delivered`)
  - `MVP1 M3 QA` -> completed (`PASS_TO_BA`)
  - `MVP1 M4 BA` -> completed (`PASS_TO_SA`)
  - `MVP1 M5 SA` -> completed (`PASS_TO_QC`)
  - `MVP1 M6 QC` -> completed (`GO WITH CONDITIONS`)
  - `MVP1 release controls (monitoring)` -> active (`T+0 smoke PASS`, waiting T+2h)
  - `M2 Dev-BE P0 closure` -> completed and handed off
  - `M3 Dev-FE P0 closure` -> completed and handed off
  - `M4 QA retest` -> completed (`PASS_TO_BA`)
  - `M5 BA traceability closure` -> completed (`PASS_TO_SA`)
  - `M6 SA conformance` -> completed (`PASS_TO_QC`)
  - `M7 QC re-gate` -> completed (`GO WITH CONDITIONS`)
  - `Release execution (T+24h controls)` -> active (`RC-02 technical gate re-verified at 02:35`)
  - `Post-MVP1 P0 FE bundle hardening` -> completed (`QA PASS_TO_PM`)
  - `Post-MVP1 P1 sync path hardening` -> completed (`QA PASS_TO_PM` for `POST-MVP1-P1-SYNC-PATH-HARDENING-20260502`)
  - `Post-MVP1 P0 BE CI perf budget` -> completed (`QA PASS_TO_PM` for `PM-POST-P1-NEXT-P0-BE-CI-PERF-20260502`; hrm 71/71 + perf 3/3, xbos 29/29 + perf 2/2, builds green; see bus for Windows `pnpm run test -- --runInBand` quirk)
  - `Post-MVP1 P1 FE deterministic error UX suite` -> completed (`QA PASS_TO_PM` for `POST-MVP1-P1-FE-DETERMINISTIC-ERROR-UX-SUITE-20260502`; web-portal `pnpm lint` + `pnpm build` + `pnpm test` green — 19 tests / 4 files; see bus for Windows shell + Vitest stderr notes)
  - `Post-MVP1 P2 security hardening` -> **B1 M1 done** + **M2 BE+FE QA `PASS_TO_PM`** (`POST-MVP1-P2-DEPENDENCY-SECURITY-HARDENING-20260503`). **M2** `POST-MVP1-P2-XLSX-SERVER-M2-20260524`: API **88/88** tests + **FE** lint/build green + employee import server path; **follow-on:** department/insurance import + giảm bundle `xlsx` còn lại; **M3** **2026-06-07** — bus
  - `BA reusable BRD/SRS prompt asset pack` -> completed (`PASS_TO_PM` for `BA-PROMPT-ASSET-PACK-20260504`; ready for PM save-path standardization + optional QA checklist review)
  - `XBOS -> HRM catalog sync coverage hardening` -> active (`8557b6f1-4e18-4aff-b066-5e51b72f621d`; QA verdict `PARTIAL`; PM dispatched Dev-BE to add service/controller/seed smoke coverage before next QA retest)
  - `HRM portal embedded modal viewport (Command Center)` -> **active** (`2e8bea66-623c-4b75-88d8-f8821805b087`; Dev-FE `READY_FOR_QA`; **PM dispatched QA** — smoke: `/command-center/hrm/employees` Add Employee backdrop full window; **chờ QA verdict**; hook dedupe: **state gitignored + fallback quét đuôi `subagent-stop.jsonl`** (bus `HOOK_HARDENED_V2` 2026-05-04) để tránh bắn PM khi thiếu file state)
  - `Critical frontend/backend/deploy security-scope remediation` -> **active P0** (`CRITICAL-FE-BE-SECURITY-SCOPE-20260524`; inbox scans completed for Dev-FE/Dev-BE/TM; formal bus dispatch recorded via bus; next exit: Dev-FE + Dev-BE + TM patches with build/test/smoke evidence, then QA/QC gate)
  - `Backend critical correctness/security scan` -> **PASS_TO_PM** (`SECURITY-CORRECTNESS-BACKEND-SCAN-20260524`; evidence recorded on bus 2026-05-24)
  - `Deploy/config critical remediation` -> **active P0** (`DEPLOY-CONFIG-CRITICAL-REMEDIATION-20260524`; PM dispatched DevOps + Dev-BE after critical FE/BE/TM scans; QA/QC queued after fixes). Gate blockers: committed/runtime-active secrets, public dev API ports with static internal key fallback, HRM host/app port coupling, XBOS `3002`/`28002` drift.

## What means "team is working"

- There is a new entry in `AGENT_MESSAGE_BUS.md` with:
  - `work_item_id`
  - `entry_criteria`
  - `exit_criteria`
  - `evidence_path`
  - `ack_status`
- A role is considered done only when:
  - evidence docs/files exist at the declared `evidence_path`
  - the next role ACK is recorded in message bus

## Fast check routine (for PM/user)

1. Open `docs/program/AGENT_MESSAGE_BUS.md`, scroll to latest blocks, check `ack_status`.
2. Open PM release order doc and follow the next 24h checkpoint sequence.
3. Open QA/QC docs to verify control conditions remain green and no downgrade to `NO-GO`.
