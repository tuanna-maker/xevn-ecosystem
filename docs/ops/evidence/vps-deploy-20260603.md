# VPS deploy evidence — P1-EX-DEVOPS-VPS-DEPLOY-03 (2026-06-03)

| Field | Value |
|-------|--------|
| work_item_id | P1-EX-DEVOPS-VPS-DEPLOY-03 |
| VPS | root@14.225.217.232 `/opt/xevn-ecosystem` |
| Portal HTTPS | https://14-225-217-232.nip.io |
| HEAD (final) | `d2c9715` (after hotfix `fix(deploy): align portal-fe host port 8088 with vite 5173`) |
| Prior bulk commit | `570b117` — `deploy(dev): HTTPS pilot jwt 86400 + HRM probe fixes and QC reform artifacts` |

## Local git / push

```text
git add -A (core.longpaths=true — Windows long mobile paths)
git commit -m "deploy(dev): HTTPS pilot jwt 86400 + HRM probe fixes and QC reform artifacts"
git push origin main  # 15a3cbe..570b117
git commit -m "fix(deploy): align portal-fe host port 8088 with vite 5173"
git push origin main  # 570b117..d2c9715
```

Note: `pnpm run deploy:dev-server` failed (plink base64 quoting EOF). Deploy executed via `pscp` + `plink` + `/tmp/xevn-deploy-*.sh` (LF scripts).

## VPS steps

1. `git stash push -u` — cleared stale VPS local edits blocking pull
2. `git pull origin main` → `570b117`, then hotfix pull → `d2c9715`
3. `node scripts/merge-vps-port-env.mjs --apply-canonical`
4. `.env`: `PORTAL_LOGIN_JWT_TTL_SEC=86400`, `NODE_ENV=development` (dev pilot — `production` blocked xbos-be on `INTERNAL_API_KEY` guard)
5. `docker compose --env-file .env up -d --build --remove-orphans` (+ hotfix `--force-recreate portal-fe xbos-be hrm-be`)

## Remote smoke (post hotfix, sleep 50s)

| Endpoint | HTTP |
|----------|------|
| `127.0.0.1:3001/api/hrm/metrics` | 200 |
| `127.0.0.1:28002/api/xbos/metrics` | 200 |
| `127.0.0.1:8088/` | 200 |
| `127.0.0.1:8088/command-center` | 200 |
| HTTPS `/` | 200 |
| HTTPS `/command-center` | 200 |
| HTTPS `/api/xbos/metrics` | 200 |

## Workspace HTTPS probe

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-ex-qa-https-01-probe.mjs
```

| Result | Detail |
|--------|--------|
| **exit code** | **0** |
| L2 | 23/23 PASS |
| L2.5 | 7/7 PASS |
| Failed ids | none |
| JWT | `expiresInSec=86400` (P-CC-01-jwt PASS) |

## Incidents / fixes this deploy

| Issue | Mitigation |
|-------|------------|
| VPS git local changes blocked pull | `git stash` + pull + `stash drop` |
| portal-fe DNAT 8088→5175 but Vite binds **5173** | compose map `8088:5173` (`d2c9715`) |
| `NODE_ENV=production` on dev VPS → xbos-be crash loop | set `NODE_ENV=development` for dev pilot stack |
| First smoke @35s after recreate | portal/xbos 000 — resolved after 50s + hotfix |

## P1-EX-BE-HTTPS-HRM-PROBE-01

HRM API metrics 200; HTTPS probe **J-HRM-01..07** all PASS on deployed stack. No separate hrm-be redeploy required beyond compose recreate in this wave.

## Non-xevn containers

Not stopped (`docker compose down` not used). Only `xevn-*` services recreated.

## Residual

- `deploy-dev-server.ps1` plink base64 wrapper still broken on Windows — use pscp+script path until script fix.
- VPS `.env` may contain duplicate `KEY=` prefixes from repeated `sed`; verify single `PORTAL_LOGIN_JWT_TTL_SEC=86400` on next maintenance.
- Dev VPS intentionally `NODE_ENV=development`; production parity is separate (`P1-EX-DO-PROD-03`).

## ack_status

`PASS_TO_PM`
