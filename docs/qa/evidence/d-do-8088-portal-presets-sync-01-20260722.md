# D-DO-8088-PORTAL-PRESETS-SYNC-01 — VPS portal presets sync

**Date:** 2026-07-22 (UTC 2026-07-21T17:16:15Z)  
**Work item:** `D-DO-8088-PORTAL-PRESETS-SYNC-01`  
**Lane:** execution · DevOps  
**Priority:** P0  
**Trigger:** QA R-BM-04-PORTAL-VITE-PRESETS — missing `hrm-recruitment-workflow-presets` on VPS broke `/command-center`  
**Constraints honored:** no seed · not Phase1/PROD cutover · no `docker compose down` · non-xevn untouched

## Problem

Vite on `:8088` (`xevn-portal-fe-dev`, bind-mount `/opt/xevn-ecosystem → /app`) failed import-analysis:

```
Failed to resolve import "../../data/hrm-recruitment-workflow-presets"
from "src/pages/command-center/CommandCenterPage.tsx"
```

## Actions

1. Audited VPS: file absent under `apps/web/web-portal/src/data/`; portal container Up.
2. Narrow `pscp` of primary file + transitive deps required for CommandCenter transform:
   - `apps/web/web-portal/src/data/hrm-recruitment-workflow-presets.ts` (+ `.test.ts`)
   - `apps/web/web-portal/src/data/workflow-resolver.ts` (+ `.test.ts`) — dep of presets
   - Full `pages/command-center/*` slice refresh (incl. `MetadataTypedFieldControls.tsx`, drawers/panels)
   - `apps/web/web-portal/src/modules/hrm/inboxDeepLink.ts` (+ `.test.ts`)
3. Restarted `xevn-portal-fe-dev` once early; later probes used bind-mount live files (no rebuild/seed).
4. Recursive relative-import graph from `CommandCenterPage.tsx` on VPS → **MISSING_COUNT 0**.

## Gate results

| Check | Result |
|-------|--------|
| File present on VPS | PASS |
| MD5 presets local↔VPS | PASS `86c60d3182f32f8e38291ad40152c81e` |
| MD5 workflow-resolver local↔VPS | PASS `b6b1545579ecf2347c8d6a5ef4f88c3a` |
| `GET :8088/` | 200 · no Failed to resolve |
| `GET :8088/command-center` | 200 · no Failed to resolve |
| `GET :8088/src/data/hrm-recruitment-workflow-presets.ts` | 200 · no Failed to resolve |
| `GET :8088/src/pages/command-center/CommandCenterPage.tsx` | 200 · no Failed to resolve (~1.97MB transform) |
| Vite new resolve errors (30s after probe) | NONE |
| Non-xevn containers | Still Up (ytexa_*, hsbx_*) |

## Residual

- L0 host/Vite module transform only — **not** browser U65 click path.
- Broader portal drift vs local may still exist outside CommandCenter import graph; this wave closed the R-BM-04 presets blocker chain.

## Verdict

**PASS** — `/command-center` serves without Vite import-analysis error for recruitment presets.

`ack_status:` **PASS_TO_PM**  
`next_owner:` **qa** (browser retest R-BM-04 / UF command-center U65)
