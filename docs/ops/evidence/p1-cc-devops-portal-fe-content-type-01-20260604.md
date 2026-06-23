# VPS deploy evidence — P1-CC-DEVOPS-PORTAL-FE-DEPLOY-01 (2026-06-04)

| Field | Value |
|-------|--------|
| work_item_id | P1-CC-DEVOPS-PORTAL-FE-DEPLOY-01 |
| VPS | root@14.225.217.232 `/opt/xevn-ecosystem` |
| Portal HTTPS | https://14-225-217-232.nip.io |
| VPS HEAD (full) | `68ec457586cc18830c53ee84b66dba16680cc649` |
| VPS HEAD (short) | `68ec457` |
| xbos-be | unchanged at `5ae6bca` (not recreated) |
| ack_status | **PASS_TO_PM** |

## Commit deployed (portal-fe)

| SHA | Message |
|-----|---------|
| `68ec457` | fix(portal): mergeRequestHeaders dedupe Content-Type (P1-CC-FE-MEMBER-LEGAL-CONTENT-TYPE-01) |

`mergeRequestHeaders` verified on VPS in `apps/web/web-portal/src/integrations/xbosHttp.ts`.

Pushed `5ae6bca..68ec457` to `origin/main` from deploy workstation before VPS pull.

## VPS steps

1. Pre-audit: xevn stack Up; non-xevn containers untouched
2. `git pull origin main` → fast-forward `5ae6bca..68ec457`
3. `node scripts/merge-vps-port-env.mjs --apply-canonical` (ports unchanged)
4. `docker compose --env-file .env up -d --build --force-recreate portal-fe` only
5. Wait ~45s; smoke below

No `docker compose down`. Only `xevn-portal-fe-dev` recreated.

## Remote smoke

| Endpoint | HTTP |
|----------|------|
| `http://127.0.0.1:8088/command-center` | **200** |
| `https://14-225-217-232.nip.io/command-center` | **200** |

## Functional gate (exit 0 required)

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
pnpm run test:xbos:cc-member-save
```

| Step | Result |
|------|--------|
| Login `ceo@xe.vn` | PASS |
| GET group-member-units | 200, members=4 |
| PUT xe-tmdv / visun / xe-du-lich / xe-vietnam | **4/4** HTTP 200 `XBOS-ORG-201` |
| POST-save reload list | 200 |
| **409 SCOPE_CONTEXT_MISMATCH** | **none** |

**Probe exit code: 0** (4/4 member PUT PASS).

## Residual

- QA L2.5 browser retest **J-CC-02** (`?settings=company_member_units` form save, single Content-Type in DevTools) — **not run by DevOps** (API probe + portal 200 only).
- User pilot browser test pending QA after this deploy.

## next_owner

**qa** — L2 P-CC-02 + L2.5 J-CC-02 on nip.io with browser PUT verification.
