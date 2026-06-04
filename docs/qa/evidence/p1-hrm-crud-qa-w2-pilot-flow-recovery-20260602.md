# P1-HRM-CRUD-QA-W2-PILOT-FLOW-RECOVERY

- work_item_id: `P1-HRM-CRUD-QA-W2-PILOT-FLOW-RECOVERY`
- date: `2026-06-02`
- tester: `qa`
- environment: local (`hrm-api=:28001`, `xbos-api=:28002`, `web-portal=:5173`)
- objective: Recover strict-gate command `pnpm run test:pilot:flows` and determine whether failure is runtime defect or environment contract drift.
- prior strict artifact: `docs/qa/evidence/p1-hrm-crud-qa-minigate-w1-rerun-20260602.md` (command #6 failed with `ECONNREFUSED 127.0.0.1:5175`)

## Recovery execution summary

| step | command | env contract | result |
|---|---|---|---|
| 1 (reproduce as-is) | `pnpm run test:pilot:flows` | default (`PORTAL_DEV_URL` unset, script fallback `http://127.0.0.1:5175`) | **FAIL** — `TypeError: fetch failed` / `ECONNREFUSED 127.0.0.1:5175` |
| 2 (stack readiness) | `pnpm run qc:dev-stack` | script resolves portal contract | **PASS** — portal healthy at `http://127.0.0.1:5173`, APIs healthy |
| 3 (FE-BE integration) | `pnpm run qc:fe-be-health` | auto-detect portal (`5173` then `5175`) | **PASS** — `portal-base http://127.0.0.1:5173`, all 8 checks PASS |
| 4 (aligned rerun) | `$env:PORTAL_DEV_URL='http://127.0.0.1:5173'; pnpm run test:pilot:flows` | explicit aligned contract | **PASS** — `13/13 PASS` |

## Deterministic command outputs (key excerpts)

### 1) Reproduce fail as-is

```text
pilot-business-flow-smoke — http://127.0.0.1:5175
PASS  P-CC-01  portal login expiresInSec=86400
TypeError: fetch failed
[cause]: Error: connect ECONNREFUSED 127.0.0.1:5175
ELIFECYCLE Command failed with exit code 1.
```

### 2) Stack readiness and portal alignment

```text
pnpm run qc:dev-stack
✓ hrm-api: HTTP 200 ← http://127.0.0.1:28001/api/hrm
✓ xbos-api: HTTP 200 ← http://127.0.0.1:28002/api/xbos
✓ web-portal (optional): HTTP 200 ← http://127.0.0.1:5173
```

```text
pnpm run qc:fe-be-health
INFO  portal-base  http://127.0.0.1:5173
PASS ... (8/8 checks)
=== Summary: ALL PASS ===
```

### 3) Recovery rerun with aligned contract

```text
pilot-business-flow-smoke — http://127.0.0.1:5173
PASS  P-CC-01 ... P-CC-09b
=== Summary: 13/13 PASS ===
```

## Root cause assessment

- Root cause class: **environment contract drift** (not functional business defect in pilot flow logic).
- Why: `scripts/pilot-business-flow-smoke.mjs` defaults to `5175` when `PORTAL_DEV_URL` is unset, while current repo runtime and health gates resolve portal at `5173` (`apps/web/web-portal/vite.config.ts` + `qc:dev-stack`/`qc:fe-be-health` evidence).
- Functional evidence: once URL contract is aligned to `5173`, pilot flow suite passes completely (`13/13`), confirming no active pilot-flow functional blocker in this wave.

## Permanent fix recommendation (do not hide drift evidence)

1. **Owner: dev-be/devops script maintainer (or platform script owner)**  
   Update `scripts/pilot-business-flow-smoke.mjs` fallback order to align with current repository contract (`5173` primary; optional `5175` fallback) or adopt same resolver utility pattern as `qc-fe-be-api-health.mjs`.
2. **Owner: PM/QA docs governance**  
   Update strict-gate runbook references that still imply default `5175` to require explicit `PORTAL_DEV_URL` in QA/QC reruns.

## Verdict

- Recovery status: **RECOVERED**
- Fail-closed statement: prior strict artifact remained valid for its environment assumptions; under corrected environment contract this command is now reproducibly green.
- QC readiness: Pilot-flow command gate is re-openable for QC re-gate with this recovery evidence plus prior strict artifact.

## Handoff contract

- ack_status: `PASS_TO_PM`
- completion_report: Reproduced original strict failure exactly, validated stack/port alignment, and recovered `test:pilot:flows` deterministically (`13/13 PASS`) using explicit portal contract `5173`; root cause determined as environment contract drift.
- next_owner: `pm`
- next_dispatch_prompt: `Dispatch qc for work_item_id P1-HRM-CRUD-QC-W2-FINAL-GATE-RERUN-RECOVERY. Entry: audit docs/qa/evidence/p1-hrm-crud-qa-minigate-w1-rerun-20260602.md (original fail-closed strict artifact) together with docs/qa/evidence/p1-hrm-crud-qa-w2-pilot-flow-recovery-20260602.md (recovery run). Verify: (1) as-is command still reproduces ECONNREFUSED on default 5175, (2) stack alignment proves live portal on 5173, (3) rerun with PORTAL_DEV_URL=http://127.0.0.1:5173 passes 13/13. Exit: publish GO/GO_WITH_CONDITIONS or NO-GO with explicit owner for permanent script/docs contract fix.`
