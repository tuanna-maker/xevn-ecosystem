# QC-HRM-BUILD-01-GATE

| Field | Value |
|-------|-------|
| **work_item_id** | QC-HRM-BUILD-01-GATE |
| **from_role** | qc |
| **to_role** | pm |
| **program** | INC-HRM-DASH-500-01 |
| **upstream** | QA-HRM-BUILD-01-RET PASS_TO_PM |
| **Generated** | 2026-07-31T00:35:00+07:00 |
| **ack_status** | PASS_TO_PM |
| **cấm** | seed |

## Decision

**GO WITH CONDITIONS** — **build/dist slice only** (`D-HRM-BUILD-01` + `dist/main.js` runtime switch).

**NOT Phase 1 DONE · NOT PROD-READY · NOT full L2.5 J-* re-promotion.**

## Scope audited

| In scope | Out of scope (this gate) |
|----------|---------------------------|
| `verify-dist.mjs` spine gate (6 files) | Full J-* browser matrix re-run |
| `build:clean` emit completeness | CRUD mutate matrix |
| Jest spine 13/13 | Phase 1 program closure |
| L0 `qc:fe-be-health` 8/8 | `dist-uat-w6` artifact deletion |
| Runtime `:28001` on **`dist/main.js`** | `R-HRM-WATCH-01` nest watch crash |

## Evidence pack integrity

```powershell
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-build-01-ret-20260731.md
# FAIL: 7/8 — missing portal_url only
```

| Check | QA pack | QC note |
|-------|---------|---------|
| work_item_id | PASS | — |
| ack_status | PASS | — |
| command_table | PASS | verify-dist, build:clean, jest |
| portal_url | **FAIL** | Process gap — add `http://127.0.0.1:5173` (fe-be-health proves portal) |
| journey_l25 | PASS | Deferred note + prior 20260730 |
| crud_or_matrix | PASS | L2.5 defer + gate table |
| residual_section | PASS | R-HRM-PARTIAL-DIST |
| timestamp | PASS | 2026-07-31 |

**Classification:** Pack gap is **PROCESS** (missing URL line on narrow build slice), not product defect. Independent L0 confirms portal `:5173` healthy.

## Independent QC spot-check (2026-07-31)

### verify-dist spine

```powershell
cd apps/api/hrm-api
node ./scripts/verify-dist.mjs
# exit 0
Test-Path dist/main.js                    # True
Test-Path dist/common/http-exception.filter.js  # True
```

### L0 fe-be-health

```powershell
pnpm run qc:fe-be-health
# exit 0 — ALL PASS (8/8)
# portal-base http://127.0.0.1:5173
# hrm-api-health HTTP 200 :28001
# portal-proxy-hrm-employees HTTP 200
# portal-proxy-hrm-catalog HTTP 200
```

### Runtime mode (:28001)

| PID | CommandLine |
|-----|-------------|
| 33980 | `node.exe --enable-source-maps dist/main.js` |
| 17876 | `node.exe --enable-source-maps dist/main.js` |

**Confirmed:** canonical **`dist/main.js`** — not `dist-uat-w6` freeze workaround.

## QA upstream audit (cross-read)

| Artifact | Key finding | QC agree |
|----------|-------------|----------|
| `d-hrm-build-01-20260730.md` | Root cause: incremental nest build skips missing dist files; fix = verify-dist + build:clean | Yes |
| `qa-hrm-build-01-ret-20260731.md` | build:clean 676 files; negative gate exit 1; jest 13/13; health 200; no MODULE_NOT_FOUND | Yes |
| `qa-hrm-build-01-ret-20260730.md` | Prior L2 P-CC-HRM-DASH/EMP 🟢 on dist-uat-w6; superseded by dist-main switch | Prior L2.5 valid for DASH/EMP only |

## Classification (ENV vs PRODUCT vs PROCESS)

| Signal | Class | QC action |
|--------|-------|-----------|
| `qc:dev-stack` exit 3221226505 | **ENV** | Windows UV_HANDLE_CLOSING on exit; functional PASS — waived per precedent |
| `MODULE_NOT_FOUND` on dist spine | **PRODUCT** (was P0) | **CLOSED** — verify-dist + build:clean + runtime dist/main.js |
| Stale partial dist without build:clean | **PROCESS** | **R-HRM-PARTIAL-DIST** — document in runbook; not slice blocker |
| Evidence pack missing portal_url | **PROCESS** | Condition C-HRM-BUILD-PACK-01 |

## Closed in this slice

| ID | Status |
|----|--------|
| D-HRM-BUILD-01 | **CLOSED** |
| R-HRM-BUILD-01 | **CLOSED** |
| D-OPS-HRM-DIST-MAIN-SWITCH-01 | **CLOSED** — `:28001` serves `dist/main.js` |

## Conditions (must not block this slice reopen)

| ID | Owner | Condition | Expiry |
|----|-------|-----------|--------|
| C-HRM-BUILD-PACK-01 | qa | Add portal URL (`http://127.0.0.1:5173`) to QA evidence so `verify:qc:evidence-pack` → 8/8 on next build retest | Next QA pack touch |
| R-HRM-PARTIAL-DIST | dev-be / devops | Runbook: always `pnpm --filter hrm-api run build:clean` before prod-like `dist/main.js` serve | Standing |
| R-HRM-WATCH-01 | dev-be | `nest start --watch` platform-runtime crash — separate WI | Open |
| L2.5 J-* full matrix | qa | Not re-run 20260731; prior 20260730 DASH/EMP only — do not extrapolate to all J-* | Next HRM browser wave |

## L2.5 / INC-HRM-DASH-500 note

- **INC-HRM-DASH-500** dashboard 500 class: closed on separate local5173 evidence (`p1-ex-qc-https-residual-03-r3-20260730-local5173.md` § r2).
- This gate closes **build root cause** (incomplete dist → runtime crash), not re-audits dashboard browser spot.
- L0 proxy paths (`employees`, `catalog-sync`) **200** on QC spot — consistent with incident closure.

## Definition of Done (slice)

| Gate | Result |
|------|--------|
| Scope closure (build/dist) | **PASS** |
| Quality (jest + verify-dist + L0) | **PASS** |
| Evidence pack format | **PARTIAL** (7/8) |
| Program Phase 1 / PROD | **NOT DONE** |

## Handoff

### completion_report

**Closed:** D-HRM-BUILD-01 dist spine + verify gate; runtime switch to canonical `dist/main.js` on `:28001`; QA retest substantively PASS (verify-dist 0, build:clean 0, jest 13/13, fe-be-health 8/8); QC independent spot confirms same; R-HRM-BUILD-01 and dist-uat-w6 workaround no longer required for L0.

**Open:** C-HRM-BUILD-PACK-01 (portal_url in QA MD); R-HRM-PARTIAL-DIST process note; R-HRM-WATCH-01; full J-* not in narrow retest.

### next_owner

pm

### next_dispatch_prompt

```
work_item_id: PM-INTAKE-HRM-BUILD-GATE-01
from_role: qc
to_role: pm
program: INC-HRM-DASH-500-01
entry_criteria: QC-HRM-BUILD-01-GATE GWC; docs/qa/evidence/qc-hrm-build-01-gate-20260731.md; D-HRM-BUILD-01 + dist-main switch CLOSED
exit_criteria:
- Update TEAM_WORKING_NOW + bus: QC-HRM-BUILD-01-GATE CLOSED
- Optional: dispatch qa one-liner to add portal_url to qa-hrm-build-01-ret for pack 8/8 (C-HRM-BUILD-PACK-01)
- Continue program backlog (RESIDUAL-03, HDSD, mobile) — do NOT claim Phase 1 DONE
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/qc-hrm-build-01-gate-20260731.md
cấm: seed
```
