# P1-EX-DO-DEPLOY-PORTAL-HTTPS-01 — Resume interrupted portal HTTPS deploy

| Field | Value |
|---|---|
| work_item_id | `P1-EX-DO-DEPLOY-PORTAL-HTTPS-01` |
| from_role | `pm` |
| to_role | `devops` |
| ack_status | **PASS_TO_PM** |
| pilot_url | `https://14-225-217-232.nip.io` |
| date | `2026-05-28` |
| handoff_fe | `docs/qa/evidence/p1-ex-fe-https-jwt-embed-01-20260528.md` |
| pm_dispatch_hint | `P1-EX-QA-HTTPS-BROWSER-01-R3` |
| commit | `none` |

---

## Scope executed

1. Synced FE bridge files to VPS (`apps/web/web-portal`, `apps/web/hrm`) via `pscp` (no git commit).
2. Restarted FE services on VPS (`portal-fe`, `hrm-fe`) using compose at `deploy/xevn-ecosystem`.
3. Fixed interrupted deploy residual: missing HRM frontend source dependencies on VPS bind mount.
   - Synced additional files required by updated `hrmApi.ts` imports:
     - `apps/web/hrm/src/lib/hrmDataMode.ts`
     - `apps/web/hrm/src/lib/hrmSpreadsheetScope.ts`
4. Re-ran smoke with HTTPS pilot + browser check.

---

## Commands executed (redacted)

```bash
# Local -> VPS sync
pscp apps/web/web-portal/src/integrations/authSession.ts root@14.225.217.232:/opt/xevn-ecosystem/apps/web/web-portal/src/integrations/authSession.ts
pscp apps/web/web-portal/src/modules/hrm/portalEmbedSessionBridge.ts root@14.225.217.232:/opt/xevn-ecosystem/apps/web/web-portal/src/modules/hrm/portalEmbedSessionBridge.ts
pscp apps/web/hrm/src/lib/portalAuthBridge.ts root@14.225.217.232:/opt/xevn-ecosystem/apps/web/hrm/src/lib/portalAuthBridge.ts
pscp apps/web/hrm/src/lib/portalEmbedSessionBridge.ts root@14.225.217.232:/opt/xevn-ecosystem/apps/web/hrm/src/lib/portalEmbedSessionBridge.ts
pscp apps/web/hrm/src/integrations/hrmApi.ts root@14.225.217.232:/opt/xevn-ecosystem/apps/web/hrm/src/integrations/hrmApi.ts
pscp apps/web/hrm/src/lib/hrmDataMode.ts root@14.225.217.232:/opt/xevn-ecosystem/apps/web/hrm/src/lib/hrmDataMode.ts
pscp apps/web/hrm/src/lib/hrmSpreadsheetScope.ts root@14.225.217.232:/opt/xevn-ecosystem/apps/web/hrm/src/lib/hrmSpreadsheetScope.ts

# VPS restart
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem
docker compose --env-file .env up -d --force-recreate portal-fe hrm-fe
docker compose --env-file .env restart portal-fe
docker compose --env-file .env restart hrm-fe
```

---

## Gate table (runbook-style)

| Gate | Result | Evidence |
|---|---|---|
| Audit FE/BE containers | PASS | `xevn-portal-fe-dev Up`, `xevn-hrm-fe-dev Up`, `xevn-hrm-be-dev Up` |
| Local smoke `:8088/command-center` | PASS | HTTP 200 |
| Local smoke `:8080/hr/` | PASS | HTTP 200 |
| External smoke `https://14-225-217-232.nip.io/hr/` | PASS | HTTP 200 |
| External smoke `https://14-225-217-232.nip.io/api/hrm/` | PASS | HTTP 200 |
| Browser iframe src scope | PASS | `.../hr/employees?portal=1&tenantId=xevn&companyId=main` |
| Browser `/api/hrm/catalog-sync` via iframe token | PASS | HTTP 200 |
| Browser banner on `/command-center/hrm/employees` | PASS | `HRM API Sync CONNECTED` (no Sync ERROR) |

---

## Smoke details (requested checks)

1. **Login `ceo@xe.vn`**: active session present in portal context (browser probe).
2. **GET `/command-center/hrm/employees`**: iframe loaded with employee list and no Sync ERROR.
3. **DevTools-equivalent network check**: iframe token probe to `/api/hrm/catalog-sync` returned `200`.
4. **iframe src company scope**: includes `companyId=main`.

---

## Root-cause note for interrupted deploy

- Initial restart showed iframe blank and stale 401-style banner due to missing synced source files on VPS bind-mounted repo after partial handoff copy.
- `xevn-hrm-fe-dev` logs confirmed unresolved imports from `hrmApi.ts`:
  - `@/lib/hrmDataMode`
  - `@/lib/hrmSpreadsheetScope`
- Syncing these files and restarting `hrm-fe` resolved the frontend runtime break; banner changed to CONNECTED.

---

## Handoff packet

```yaml
work_item_id: P1-EX-DO-DEPLOY-PORTAL-HTTPS-01
from_role: devops
to_role: pm
ack_status: PASS_TO_PM
entry_criteria: Resume interrupted HTTPS deploy; fix iframe 401/companyId=xevn residual after FE handoff.
exit_criteria: Portal/hrm FE restarted on VPS; /command-center/hrm/employees iframe no Sync ERROR; catalog-sync 200; iframe src companyId=main.
evidence_path: docs/ops/evidence/p1-ex-do-deploy-portal-https-01-20260528.md
pm_dispatch_hint: P1-EX-QA-HTTPS-BROWSER-01-R3
summary: Resynced FE bridge files + missing HRM dependencies, restarted portal-fe/hrm-fe, and verified iframe bridge on HTTPS pilot with catalog-sync 200 and companyId=main.
```
