# PM Pipeline Recovery — 2026-07-29

Generated from proxy files only (read-only). No code, evidence, or bus state was modified.

## 1. Pending pipeline snapshot (PM_PENDING_PIPELINE.json)

Checked at 2026-07-28T15:34:53.422Z. `healthy: false`.

### dispatchRequired (3)
| work_item_id | role | priority | reason |
|---|---|---|---|
| HOOK-qa-276034_5 | qc | P0 | qa completed 2026-07-28T10:16:10.234Z — followup_suppressed, no bus INTAKE, no pm->qc DISPATCHED (QA ERP fidelity multi-domain spot) |
| HOOK-qa-309fd5_5 | qc | P0 | qa completed 2026-07-28T10:11:21.087Z — followup_suppressed, no bus INTAKE, no pm->qc DISPATCHED (QA spot HRM settings picker) |
| HRM-MD-PICKER-SPOT-01 | qc | P1 | final bus state: qa->pm PASS_TO_PM, not yet pm->qc DISPATCHED |

### inFlight (6)
| work_item_id | role | dispatchedAt |
|---|---|---|
| P1-EX-QA-HTTPS-RESIDUAL-03-R3 | qa | 2026-07-25T12:07:49+08:00 |
| HRM-REC-WF-OPTION-B-01 | qa | 2026-07-23T14:30:07+07:00 |
| HRM-EMP-COMPANY-COL-SYNC-01 | devops | 2026-07-23T14:27:35+07:00 |
| HRM-SETTINGS-MD-CRUD-FE-01 | dev-fe | 2026-07-23T14:18:44+07:00 |
| HRM-SETTINGS-MD-CRUD-BE-01 | dev-be | 2026-07-23T14:18:44+07:00 |
| HRM-EMP-COMPANY-COL-FE-01 | dev-fe | 2026-07-22T23:15:00+07:00 |

Notes:
- All `needsQa: false` in the recorded state.
- These items were dispatched but no followup handoff is recorded in the slice we inspected.

### defer (2)
| id | owner | reason | trigger |
|---|---|---|---|
| C-HRMQC-01 | devops | VPS :8088 retest — U32 local first; only dispatch when user requests deploy | user-request-deploy |
| C-MOB-H9-DEVICE-01 | qa-device | adb device UI smoke — optional GWC | adb-available |

## 2. Suppressed followups (28)

Source: PM_PENDING_PIPELINE.json report field `followupSuppressedCount: 28`.

Observations:
- The two P0 items above (`HOOK-qa-276034_5`, `HOOK-qa-309fd5_5`) are explicitly flagged with `followupSuppressed: true`.
- Proxy file `.pm-incident-cache.json` shows runtime incidents involving Vite `@xevn/x-bos-core` import resolution and `node_modules/.vite/deps EPERM rmdir` on Windows/OneDrive paths. These likely crashed or aborted followup generation before a clean bus INTAKE/DISPATCHED handoff could be written.
- `PM_INCIDENT_QUEUE.json` is minimal in the current snapshot, but cache shows the active failure mode is dev-server startup permission errors, not logic failures in work itself.

Root cause assessment:
- Not a single code regression.
- Root cause is operational/environmental: OneDrive path + Vite file-watcher + EPERM on `.vite/deps`, combined with `followupSuppressed` on subagent stop.
- Result: completed QA/qc did not become visible in PM_PENDING_PIPELINE or AGENT_MESSAGE_BUS.

## 3. Current backlog pressure (PM_OPEN_BACKLOG.json)

### dispatchRequired (6)
- MOB-XEVN-BRAND-TOKENS-L1-01 — qc, P1
- MOB-XEVN-BRAND-PRIMITIVES-L2-01 — qc, P1
- HRM-EMP-COMPANY-COL-01 — qc, P1
- MOB-SPEC-ORPHAN-CODE-SAMPLE-01 — qa, P1
- P1-EX-QA-HTTPS-RESIDUAL-03-R3 — qc, P1
- HRM-SETTINGS-MASTER-DATA-01 — qa, P1

### inFlight (6)
- Recruitments/options/company-col/settings pairs dispatched but not yet reflected in bus evidence.

## 4. Recommended recovery actions

1. Re-execute Vite-sensitive FE builds outside OneDrive path or with `.vite` cache excluded, then rerun the blocked QA spots.
2. For the 2 P0 `HOOK-qa-*` items: regenerate bus INTAKE and PM->qc DISPATCHED entries.
3. For `HRM-MD-PICKER-SPOT-01`: close current PASS_TO_PM by issuing qc dispatch explicitly.
4. Audit `.cursor/team/inbox/subagent-stop.jsonl` last 200 lines and map each completed task to evidence file; any task with evidence but no bus entry is a suppressed followup candidate.
5. Resolve or formally defer `C-HRMQC-01` depending on deploy intent from user.
6. Treat `C-MOB-H9-DEVICE-01` as optional GWC only when adb becomes available; do not let it block localhost UAT.
7. Reconcile `PM_OPEN_BACKLOG.dispatchRequired` with `PM_PENDING_PIPELINE.dispatchRequired` and deduplicate P1 items already in flight.
8. Do not treat Phase 1 as DONE until W6 sponsor sign-off and G8 mobile layout are resolved.

## 5. UX Wave B handoff context (07-28)

- Sponsor chốt Wave B remaster at 2026-07-28T15:50+07:00.
- Affected items: EmptyState, PermissionFallback, i18n, optional backlog items `D-UX-EMPTY-BLAND-LIST-01` and `D-UX-I18N-HARDCODE-01`.
- Active locks still apply: U65 zero-seed, HOLD_DEPLOY, must_keep C1/D5/P0-c/Profile.
- These UX items were CLOSED GWC earlier in the day and remain non-blocking for localhost.
