# VPS-DEPLOY-SCOPE-01 — DevOps evidence (2026-05-22)

| Step | Result | Notes |
|------|--------|-------|
| Credential `deploy/.vps-ssh.env` | **MISSING** | Only `deploy/.vps-ssh.env.example` present; `VPS_SSH_PASSWORD` env unset |
| SSH audit (plink / OpenSSH) | **BLOCKED** | Connection timed out to `14.225.217.232:22` |
| External HTTP smoke | **BLOCKED** | Timeouts on `:3001`, `:28002`, `:8088` from agent runner |
| git pull / merge ports / compose | **NOT RUN** | Requires SSH to VPS |
| migrate hrm/xbos on VPS | **NOT RUN** | Requires SSH |
| hrm-be / xbos-be rebuild | **NOT RUN** | Requires SSH |
| non-xevn container verify | **NOT RUN** | Requires SSH |

## Commands attempted (no secrets)

### Credential check (Windows, repo root)

```powershell
Test-Path deploy\.vps-ssh.env          # False
$env:VPS_SSH_PASSWORD                  # unset
```

### SSH (PuTTY plink)

```powershell
& "C:\Program Files\PuTTY\plink.exe" -ssh root@14.225.217.232 `
  -hostkey SHA256:WT2TUkDiv8fHzO2KyIyTlbRkQ3/0wlceizrudjT9Clo `
  -batch "echo SSH_OK"
# exit 1 — FATAL ERROR: Network error: Connection timed out
```

### SSH (OpenSSH)

```powershell
ssh -o BatchMode=yes -o ConnectTimeout=12 root@14.225.217.232 "echo SSH_OK"
# exit 255 — connect to host 14.225.217.232 port 22: Connection timed out
```

### External HTTP (no SSH)

```powershell
Invoke-WebRequest http://14.225.217.232:3001/ -TimeoutSec 8   # timeout
Invoke-WebRequest http://14.225.217.232:28002/ -TimeoutSec 8  # timeout
Invoke-WebRequest http://14.225.217.232:8088/ -TimeoutSec 8   # timeout
```

## Planned VPS steps (not executed — operator or cred unblock)

Per `docs/ops/VPS_POST_SCOPE_DEPLOY_NOTE.md` and `docs/ops/DEPLOY_GUIDE.md`:

1. Audit: `docker ps`, `ss -tlnp`, `docker compose ps`
2. `cd /opt/xevn-ecosystem && git pull origin main`
3. `node scripts/merge-vps-port-env.mjs --apply-canonical`
4. Migrate if needed (`pnpm migrate:hrm:apply:with-deploy-env`, `pnpm migrate:xbos:apply:with-deploy-env`)
5. `cd deploy/xevn-ecosystem && docker compose --env-file .env up -d --build --remove-orphans hrm-be xbos-be`
6. Smoke: `3001/api/hrm/`, `28002/api/xbos/`, metrics `?format=prometheus` → expect HTTP 200
7. Verify non-xevn containers still Up

## Blockers (exact)

| # | Item | Owner | Unblock |
|---|------|-------|---------|
| 1 | `deploy/.vps-ssh.env` with `VPS_SSH_PASSWORD` or `VPS_SSH_KEY_PATH` | PM / operator | Copy from `.example`, fill password or key path (gitignored) |
| 2 | Network path to `14.225.217.232` (SSH:22 + app ports) from DevOps runner | PM / infra | Allow Cursor agent egress or run deploy from host with VPS access (e.g. `pnpm run deploy:dev-server -- -SkipCommit -SkipPush`) |

## References

- `docs/ops/VPS_POST_SCOPE_DEPLOY_NOTE.md`
- `docs/ops/DEPLOY_GUIDE.md`
- Prior local prep: `docs/ops/evidence/nfr-prod-prep-01-20260522.md`

## Handoff

- **ack_status:** `BLOCKED`
- **work_item_id:** `VPS-DEPLOY-SCOPE-01`
- **next_owner:** PM — provide SSH cred file and/or network unblock; then re-dispatch devops or operator executes VPS note §2–4
