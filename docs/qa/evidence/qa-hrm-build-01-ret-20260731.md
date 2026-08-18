# QA-HRM-BUILD-01-RET

| Field | Value |
|-------|-------|
| **work_item_id** | QA-HRM-BUILD-01-RET |
| **from_role** | pm |
| **to_role** | qa |
| **upstream** | D-HRM-BUILD-01 READY_FOR_QA |
| **Generated** | 2026-07-31T00:18:00+07:00 |
| **Account** | ceo@xe.vn · companyId=main · U65 zero-seed |
| **ack_status** | PASS_TO_PM |

## Verdict

🟢 **PASS** — `verify-dist.mjs` exit 0 on full spine; `build:clean` exit 0 (676 dist files); jest spine 13/13; L0 `qc:fe-be-health` 8/8; runtime `:28001` serves **`dist/main.js`** with HTTP 200 — **no MODULE_NOT_FOUND** (including no dist-uat-w6 freeze path).

## Scope (this retest)

Focused build/dist gate per dispatch — **not** full L2.5 J-* browser matrix (prior run 20260730 covered dashboard+employees 🟢).

| Check | Result |
|-------|--------|
| `node scripts/verify-dist.mjs` (post build:clean) | exit **0** |
| Negative gate (delete `http-exception.filter.js`) | exit **1** — `missing: dist/common/http-exception.filter.js` |
| `pnpm --filter hrm-api run build:clean` | exit **0** |
| Jest spine `app.controller.spec` + `scope-context.spec` | **13/13** pass |
| Runtime MODULE_NOT_FOUND | **None** — health 200 |

## HRM runtime (:28001)

| Item | Value |
|------|-------|
| PID | 33980 |
| Mode | **`dist/main.js`** (canonical — not dist-uat-w6) |
| CommandLine | `"C:\Program Files\nodejs\node.exe" --enable-source-maps dist/main.js` |

```http
GET http://127.0.0.1:28001/api/hrm/ → 200
{"success":true,"code":"HRM-HEALTH-200","message":"HRM service is healthy",...}
```

> **dist-uat-w6:** Not in use on `:28001` during this retest. Prior freeze workaround no longer required for L0 — no MODULE_NOT_FOUND observed on live runtime or post-`build:clean` dist.

## Dist spine (D-HRM-BUILD-01 — all 6)

| File | Present |
|------|---------|
| `dist/main.js` | 🟢 |
| `dist/app.module.js` | 🟢 |
| `dist/common/http-exception.filter.js` | 🟢 |
| `dist/platform/platform-runtime.js` | 🟢 |
| `dist/spreadsheet/spreadsheet-template.service.js` | 🟢 |
| `dist/spreadsheet/spreadsheet.module.js` | 🟢 |

**Dist file count after build:clean:** 676

## verify-dist gate

### Positive (post build:clean)

```powershell
cd apps/api/hrm-api
node ./scripts/verify-dist.mjs
# exit 0
```

### Negative (partial dist catch)

```powershell
Remove-Item dist/common/http-exception.filter.js -Force
node ./scripts/verify-dist.mjs
# exit 1 — [hrm-api] verify-dist FAIL — missing: dist/common/http-exception.filter.js
pnpm run build:clean
# exit 0 — spine restored
```

## Jest spine

```powershell
pnpm exec jest src/app.controller.spec.ts src/common/scope-context.spec.ts --runInBand
```

```
Test Suites: 2 passed, 2 total
Tests:       13 passed, 13 total
Time:        6.434 s
```

## L0 gates

| Gate | Exit | Notes |
|------|------|-------|
| qc:dev-stack | 3221226505 | Functional PASS — HRM+XBOS+portal HTTP 200; Windows UV_HANDLE_CLOSING crash on exit — waived per QA precedent |
| qc:fe-be-health | 0 | ALL PASS (8/8) |

### qc:fe-be-health summary

```
PASS  hrm-api-health  HTTP 200
PASS  xbos-api-health  HTTP 200
PASS  web-portal  HTTP 200
PASS  portal-login  token ok
PASS  hrm-employees-direct  HTTP 200
PASS  hrm-catalog-sync-direct  HTTP 200
PASS  portal-proxy-hrm-employees  HTTP 200
PASS  portal-proxy-hrm-catalog  HTTP 200
=== Summary: ALL PASS ===
```

## Hard fails

_None_

## Residual

| ID | Owner | Note |
|----|-------|------|
| R-HRM-PARTIAL-DIST | dev-be | Stale partial `dist/` without `build:clean` still causes MODULE_NOT_FOUND at runtime — `verify-dist` gate catches spine only; always run `build:clean` before serving `dist/main.js` |
| L2.5 J-* | qa | Not re-run this slice; prior 20260730 browser evidence still valid for P-CC-HRM-DASH/EMP |

## Promoted / closed

- D-HRM-BUILD-01 dist spine + verify gate — **verified** 🟢
- D-OPS-HRM-DIST-MAIN-SWITCH-01 — **runtime now on `dist/main.js`** (was dist-uat-w6 in 20260730 retest)

## Handoff

- **ack_status:** PASS_TO_PM
- **next_owner:** pm
- **evidence_path:** docs/qa/evidence/qa-hrm-build-01-ret-20260731.md
- **cấm:** seed

### completion_report

**Closed:** `verify-dist.mjs` exit 0 on 6-file spine after `build:clean` (676 files); negative gate exit 1 on deliberate partial dist; jest spine 13/13; L0 `qc:fe-be-health` 8/8; `:28001` serves canonical `dist/main.js` with health 200 — **no MODULE_NOT_FOUND**, dist-uat-w6 not active.

**Open:** R-HRM-PARTIAL-DIST process note (always `build:clean` before prod-like serve); L2.5 J-* not in this narrow retest scope.

### next_dispatch_prompt

```
work_item_id: QC-HRM-BUILD-01-GATE
from_role: qa
to_role: qc
program: INC-HRM-DASH-500-01
entry_criteria: QA-HRM-BUILD-01-RET PASS_TO_PM; docs/qa/evidence/qa-hrm-build-01-ret-20260731.md; verify-dist+build:clean+jest spine PASS; :28001 dist/main.js HTTP 200
exit_criteria:
- Audit L0 evidence (qc:fe-be-health 8/8; qc:dev-stack functional PASS)
- Confirm D-HRM-BUILD-01 + dist-main switch closed in SERVICE_READINESS if applicable
- GO/GWC with residual R-HRM-PARTIAL-DIST noted (process, not blocker)
- evidence: docs/qa/evidence/qc-hrm-build-01-gate-20260731.md
ack_status: PASS_TO_PM
read_first: docs/qa/evidence/d-hrm-build-01-20260730.md · docs/qa/evidence/qa-hrm-build-01-ret-20260731.md
cấm: seed
```
