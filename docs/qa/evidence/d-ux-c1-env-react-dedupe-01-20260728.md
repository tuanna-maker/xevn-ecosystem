# D-UX-C1-ENV-REACT-DEDUPE-01 — HRM dual React mount fix

| Field | Value |
|-------|--------|
| **work_item_id** | `D-UX-C1-ENV-REACT-DEDUPE-01` |
| **from_role** | pm |
| **to_role** | dev-fe |
| **date** | 2026-07-28 |
| **change_mode** | FIX (vite / package pin — no business TSX) |
| **ack_status** | **READY_FOR_QA** |
| **locks** | U65 zero-seed · HOLD_DEPLOY · no Phase1 claim · no x-bos-core · no Attendance/Payroll IA reopen |

## Trigger

`QA-UX-C1-01` **FAIL_TO_PM** @ `docs/qa/evidence/qa-ux-c1-01-20260728.md` — white screen on `/hr/attendance` + `/hr/payroll`:

- `Invalid hook call`
- `TypeError: Cannot read properties of null (reading 'useEffect')`
- `#root` empty (`innerHTML` length 0)

## Root cause

Under `apps/web/hrm`, Node/Vite bare resolve hoisted **`react@18.2.0`** (workspace root symlink) while **`react-dom@18.3.1`** peers **`react@18.3.1`** → two React copies → hooks dispatcher null.

`@xevn/ui` is aliased to **source** (`packages/ui/src`), so shared components import `react` through the same resolver — dual instance breaks mount before any C1 feature code runs.

## Before / after resolve paths

### Before (QA / pre-fix probe from `apps/web/hrm`)

| Package | Version | Path |
|---------|---------|------|
| `react` (bare) | **18.2.0** | `node_modules/.pnpm/react@18.2.0/node_modules/react` |
| `react` via `react-dom` paths | **18.3.1** | `node_modules/.pnpm/react@18.3.1/node_modules/react` |
| `react-dom` | **18.3.1** | `node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom` |

### After (Vite `resolve.alias` + `dedupe` — used by bundler)

| Package | Version | Path |
|---------|---------|------|
| `react` (alias target = peer of react-dom) | **18.3.1** | `node_modules/.pnpm/react@18.3.1/node_modules/react` |
| `react-dom` (alias) | **18.3.1** | `node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom` |

**Note:** bare Node `require.resolve('react')` from HRM cwd may still see **18.2.0** until a workspace `pnpm install` applies root overrides (pins below). Dev/prod Vite bundle uses the alias paths above — browser mount verified.

## Changes

| File | Change |
|------|--------|
| `apps/web/hrm/vite.config.ts` | `resolve.dedupe: ['react','react-dom']` + alias both to dirs resolved from `react-dom` peer |
| `apps/web/hrm/package.json` | Pin `react` / `react-dom` to exact `18.3.1` (was `^18.3.1`) |
| `package.json` (root) | `pnpm.overrides` `react` + `react-dom` → `18.3.1` |

**Not touched:** Attendance/Payroll feature IA, `apps/web/x-bos-core/**`, seed, deploy, portal vite (HRM served via `/hr` proxy to `:8080` — dual instance was inside HRM resolve).

**Ops after edit:** cleared `apps/web/hrm/node_modules/.vite`; restarted `pnpm --filter vite_react_shadcn_ts dev` on `:8080`.

## Mount proof (browser — U65, no seed)

| Check | Result |
|-------|--------|
| URL | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| `#root` length | **9958** (not empty) |
| Title | `UNICOM HRM - Hệ thống quản lý nhân sự` |
| Body sample | tabs: Tổng quan · Chấm công · Ca làm việc · … |
| Console / pageerror | **0** — no Invalid hook call / useEffect null |
| Direct `:8080` | `#root` length **9958** |
| Runtime JSON | `docs/qa/evidence/_tmp-d-ux-c1-env-react-dedupe-01-runtime.json` |
| Screenshot | `docs/qa/evidence/screens/d-ux-c1-env-react-dedupe-01/attendance-mount.png` |

**Verdict (ENV mount):** PASS — C1 feature paths not re-validated here (handoff to QA-UX-C1-01).

## Residual

| ID | Owner | Note |
|----|-------|------|
| R1 | qa | Re-run `QA-UX-C1-01` — Attendance Path A/B + Payroll null-guard browser |
| R2 Info | devops / next install | Bare hoist may still list `react@18.2.0` until `pnpm install` applies overrides; Vite alias already forces 18.3.1 in bundle |
| R3 Info | — | Tax edit still **BLOCKED-DATA** under U65 if no FE-created settlement rows |

## completion_report

**Closed:** Dual-React ENV mount blocker for HRM Vite — dedupe/alias + version pins; portal `/hr/attendance` and direct `:8080` mount with non-empty `#root`, zero hook TypeErrors.

**Open:** Full C1 UF browser retest; optional `pnpm install` to drop leftover `react@18.2.0` from workspace store; tax rows U65 data.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-UX-C1-01
from_role: pm
to_role: qa
lane: execution
entry_criteria:
  - D-UX-C1-ENV-REACT-DEDUPE-01 READY_FOR_QA @ docs/qa/evidence/d-ux-c1-env-react-dedupe-01-20260728.md
  - Local portal :5173 + HRM Vite :8080 up; /hr/attendance mounts (root not empty)
  - U65 zero-seed · HOLD_DEPLOY · no Phase1 claim
exit_criteria:
  - Re-run Attendance Path A/B (Clock-In proxy depth) + Payroll tax floating null-guard browser
  - Tax edit: if no settlement rows → BLOCKED-DATA OK (do not seed)
  - Evidence update qa-ux-c1-01 (or dated retest file); PASS_TO_PM or residual owners
  - cấm: seed · claim C1 GO without browser UF
```

## ack_status

**READY_FOR_QA**
