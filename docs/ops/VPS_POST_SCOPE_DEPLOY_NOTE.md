# VPS Post-Scope Deploy Note (operator)

> **Work item:** `NFR-PROD-PREP-01`  
> **Context:** Local stack GREEN after `ENV-RESTART-POST-SCOPE-01` (scope/JWT fixes). VPS must receive the same API images/dist before production enable.  
> **Agent note:** `deploy/.vps-ssh.env` was **not present** on the DevOps runner — SSH audit skipped. Execute this note on the VPS as `root@14.225.217.232`.

---

## Preconditions

- Repo on VPS: `/opt/xevn-ecosystem`
- Compose dir: `/opt/xevn-ecosystem/deploy/xevn-ecosystem`
- **Do not** run `docker compose down` or stop non-`xevn-` containers.

---

## 1. Audit (read-only)

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E 'xevn|NAMES'
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem && docker compose ps
ss -tlnp | grep -E ':(3001|28002)\s'
```

Expected xevn API containers (names may vary slightly):

| Service | Typical name | Host port |
|---------|--------------|-----------|
| HRM API | `xevn-hrm-be-dev` | **3001** |
| XBOS API | `xevn-xbos-be-dev` | **28002** |

---

## 2. Pull + canonical ports

```bash
cd /opt/xevn-ecosystem
git stash -u 2>/dev/null || true
git pull origin main
git stash pop 2>/dev/null || true
# If stash pop conflicts on deploy files only:
#   git checkout HEAD -- deploy/xevn-ecosystem/docker-compose.yml
#   git stash drop

node scripts/merge-vps-port-env.mjs --apply-canonical
grep -E '_PORT=' deploy/xevn-ecosystem/.env
```

---

## 3. Rebuild **only** HRM + XBOS backends

```bash
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem
docker compose --env-file .env up -d --build --remove-orphans hrm-be xbos-be
```

Do **not** recreate portal/fe unless a separate change requires it.

Wait ~30s for Nest boot.

---

## 4. Smoke (host)

```bash
for ep in \
  "3001/api/hrm/" \
  "3001/api/hrm/metrics?format=prometheus" \
  "28002/api/xbos/" \
  "28002/api/xbos/metrics?format=prometheus"; do
  CODE=$(curl -so /dev/null -w "%{http_code}" "http://127.0.0.1:${ep}" 2>/dev/null || echo 000)
  echo ":${ep} -> $CODE"
done
```

**PASS:** HTTP 200 on all four; Prometheus bodies include `http_requests_total`.

If HRM returns `000` while XBOS is 200:

- Check container logs: `docker logs --tail 80 xevn-hrm-be-dev`
- Confirm port bind inside container: `docker exec xevn-hrm-be-dev wget -qO- http://127.0.0.1:3001/api/hrm/ 2>&1 | head -3`
- Recreate only HRM: `docker compose --env-file .env up -d --build hrm-be` (no `compose down`)

---

## 5. Optional contract script (from repo root on VPS or local)

```bash
cd /opt/xevn-ecosystem
# VPS uses HRM host port 3001 in compose defaults:
HRM_BE_PORT=3001 XBOS_BE_PORT=28002 node scripts/verify-openapi-contract.mjs
```

---

## 6. Production track (after VPS smoke PASS)

1. Backup `.env`: `cp .env .env.bak.$(date +%Y%m%d%H%M)`
2. Set production vars per `docs/ops/PRODUCTION_ENABLE_RUNBOOK.md` §2 (secrets **not** in this doc).
3. `docker compose --env-file .env up -d --build --remove-orphans` (xevn services only).
4. On operator workstation with repo + deploy env: `pnpm verify:production-env` (expect PASS after real secrets).

---

## Credential for autonomous DevOps

Copy `deploy/.vps-ssh.env.example` → `deploy/.vps-ssh.env` (gitignored), set `VPS_SSH_PASSWORD`, then re-dispatch `NFR-PROD-PREP-01` for automated SSH audit.

---

## References

- `docs/ops/DEPLOY_GUIDE.md`
- `docs/ops/PRODUCTION_ENABLE_RUNBOOK.md`
- `.cursor/skills/devops-deploy/SKILL.md`
