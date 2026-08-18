# D-FE-REMOVE-NIPIO-01 — Remove perimeter host from apps/web

**Date:** 2026-07-28  
**Role:** dev-fe  
**Sponsor:** TG-INTAKE-1785231917281  
**ack_status:** READY_FOR_QA

## Scope closed

| File | Change |
|------|--------|
| `apps/web/hrm/vite.config.ts` | Removed perimeter hosts from default `allowedHosts`; keep localhost / 127.0.0.1 / `hrm-fe` / `xevn-hrm-fe-dev`; CODE-MEMORY ADD |
| `apps/web/web-portal/vite.config.ts` | Comments local/Docker only; keep `/hr` `changeOrigin: false` + local proxy defaults; CODE-MEMORY ADD |
| `apps/web/hrm/src/integrations/supabase/supabaseRestGuard.test.ts` | Fixture → `http://127.0.0.1:5173/hr/attendance?...` |
| `apps/web/hrm/src/lib/hrmDataMode.test.ts` | Remote misconfig fixture → Docker sibling `http://hrm-fe:8080/...` (still non-localhost host) |
| `apps/web/web-portal/src/utils/workflowDisplayLabels.test.ts` | Remote hostname → `example.invalid` (not VPS IP) |

## must_keep verified

- Vite proxy local/dev (`VITE_DEV_PROXY_*` → 127.0.0.1)
- HOLD_DEPLOY — no deploy hostname SoT change (Ops/Mobile lanes separate)
- CODE-MEMORY on both vite configs

## Grep gate

```text
rg -n "nip\.io|14-225-217-232|14\.225\.217\.232" apps/web
→ zero matches (exit 1)
```

## Tests

```text
apps/web/hrm: vitest supabaseRestGuard + hrmDataMode → 19 passed
apps/web/web-portal: vitest workflowDisplayLabels → 3 passed
```

## Residual

- None in FE web scope.
- Coordinate: D-OPS-REMOVE-NIPIO-01 / D-MOB-REMOVE-NIPIO-01 own deploy/mobile hostname SoT — FE did not touch those paths.

## next_owner

qa

## next_dispatch_prompt

```text
work_item_id: QA-FE-REMOVE-NIPIO-01
from_role: pm
to_role: qa
entry_criteria: D-FE-REMOVE-NIPIO-01 READY_FOR_QA; evidence docs/qa/evidence/d-fe-remove-nipio-01-20260728.md
exit_criteria: rg apps/web zero nip.io / 14-225-217-232 / 14.225.217.232; confirm Vite allowedHosts local-only; smoke portal :5173 proxy /hr still loads locally; PASS_TO_PM
cấm: seed; claim PASS via perimeter URL
U65: browser/local only
```
