# VPS deploy evidence — P1-CC-DEVOPS-MEMBER-LEGAL-BROWSER-DEPLOY-01 (2026-06-04)

| Field | Value |
|-------|--------|
| work_item_id | P1-CC-DEVOPS-MEMBER-LEGAL-BROWSER-DEPLOY-01 |
| VPS | root@14.225.217.232 `/opt/xevn-ecosystem` |
| Portal HTTPS | https://14-225-217-232.nip.io |
| VPS HEAD | `0ea889d` (includes FE `46d20a3`) |
| ack_status | **PASS_TO_PM** |

## Commits deployed

| Layer | SHA | Message |
|-------|-----|---------|
| BE | `0ea889d` | fix(xbos-api): harden legal-entity browser save path |
| FE | `46d20a3` | fix(portal): normalize member legal-entity PUT code from list slug |

`git push origin main` `4e55d31..0ea889d` from dev workstation (commits were ahead of origin before deploy).

## VPS steps

1. Pre-audit: xevn containers Up; non-xevn (tasmos, etc.) untouched
2. `git pull origin main` → fast-forward `4e55d31..0ea889d`
3. `node scripts/merge-vps-port-env.mjs --apply-canonical` (ports 8088/8080/5173/3001/28002 unchanged)
4. `docker compose --env-file .env up -d --build --force-recreate xbos-be portal-fe`
5. Sleep 50s; smoke below

No `docker compose down`. Only `xevn-xbos-be-dev` and `xevn-portal-fe-dev` recreated.

## Remote smoke

| Endpoint | HTTP |
|----------|------|
| `127.0.0.1:28002/api/xbos/metrics` | 200 |
| `127.0.0.1:8088/` | 200 |
| `https://14-225-217-232.nip.io/api/xbos/metrics` | 200 |
| `https://14-225-217-232.nip.io/command-center` | 200 |

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

## Residual

- QA L2.5 browser retest J-CC-02 (`?settings=company_member_units` form save + banner/console) — **not run by DevOps** (API probe only).
- Prior note: GET legal-entity by id with member partition headers may still 409 on read path (out of scope for this deploy).

## next_owner

**qa** — `P1-CC-QA-MEMBER-LEGAL-SAVE-L25-01` browser retest J-CC-02 on nip.io.
