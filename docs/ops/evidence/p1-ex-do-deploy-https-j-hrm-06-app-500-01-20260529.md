# P1-EX-DO-DEPLOY-HTTPS-J-HRM-06-APP-500-01 — App.tsx pilot 500 recovery

| Field | Value |
|---|---|
| work_item_id | `P1-EX-DO-DEPLOY-HTTPS-J-HRM-06-APP-500-01` |
| from_role | `devops` |
| to_role | `qa` |
| date | `2026-05-29` |
| pilot_url | `https://14-225-217-232.nip.io` |
| entry_evidence | `docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r4-20260529.md` |
| ack_status | `READY_FOR_QA` |

## Root cause found

- `GET /hr/src/App.tsx` returned **500** because Vite could not resolve imports on VPS bind-mounted source.
- First blocker from logs: missing `./lib/hrmPortalUrlSync` and `@/hooks/useWorkforceHeadcount`.
- After patching those two files, next blocker appeared: missing `./components/auth/PortalLoginRedirect`.
- Root cause class: **partial/stale FE source sync on VPS** (not full `apps/web/hrm/src` parity).

## Actions executed

1. SSH audit + Vite log inspection on `xevn-hrm-fe-dev`.
2. Synced missing files first (`hrmPortalUrlSync.ts`, `useWorkforceHeadcount.ts`) via `pscp`.
3. Recreated only `hrm-fe` (`docker compose --env-file .env up -d --force-recreate hrm-fe`).
4. Re-checked logs; found next missing import (`PortalLoginRedirect.tsx`).
5. Synced full `apps/web/hrm/src/*` to `/opt/xevn-ecosystem/apps/web/hrm/src/` via `pscp -r`.
6. Recreated only `hrm-fe` again.
7. Ran HTTPS smoke for `App.tsx`, `AttendanceEntry.tsx`, attendance route.

## Verification outputs (sanitized)

```text
before fix:
APP:500 LEN:55369
vite error: Failed to resolve import "./lib/hrmPortalUrlSync" from "src/App.tsx"
vite error: Failed to resolve import "./components/auth/PortalLoginRedirect" from "src/App.tsx"

after full src sync + recreate:
container_started: 2026-05-29T01:46:10.168806967Z
APP:200 LEN:74586
ATT:200 LEN:7979
ROUTE:200 LEN:1400
VITE v5.4.21 ready
```

## Gate table

| Gate | Result |
|---|---|
| App import path references `hrmPortalUrlSync` | **PASS** |
| Diagnose App.tsx 500 root cause | **PASS** |
| `GET /hr/src/App.tsx` on pilot | **PASS** (`200`) |
| `GET /hr/src/pages/AttendanceEntry.tsx` | **PASS** (`200`) |
| `GET /hr/attendance?portal=1&companyId=main` | **PASS** (`200`) |
| `hrm-fe` targeted recreate (no compose down) | **PASS** |
| Non-xevn containers safety check | **PASS** (tasmos containers remain Up) |

## completion_report

- **Closed:** App.tsx Vite transform failure on pilot is fixed; hrm-fe has been recreated with full `apps/web/hrm/src` parity; pilot source endpoint `/hr/src/App.tsx` now returns 200.
- **Residual:** L2.5 business journey validation (J-HRM-06 list → detail, root mount behavior in CC iframe/direct path) is still QA-owned and not promoted by DevOps.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: P1-EX-QA-HTTPS-J-HRM-06-01-R5
from_role: pm
to_role: qa
entry_criteria: docs/ops/evidence/p1-ex-do-deploy-https-j-hrm-06-app-500-01-20260529.md — pilot GET /hr/src/App.tsx now 200; hrm-fe recreated at 2026-05-29T01:46:10Z after full apps/web/hrm/src sync.
exit_criteria: J-HRM-06 L2.5 PASS on https://14-225-217-232.nip.io with ceo@xe.vn (attendance list/row -> employee profile in CC iframe + direct /hr route, #root non-empty <=30s) and P-CC-07 UI CONNECTED + fallback54321=0.
evidence_path: docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r5-20260529.md
ack_status: PASS_TO_PM or FAIL_TO_PM
```

## pm_dispatch_hint

`P1-EX-QA-HTTPS-J-HRM-06-01-R5` — DevOps recovered pilot App.tsx compile path; QA must re-run full L2.5 UI journey before PM promotion.
