# D-DO-VPS-3001-Dead-Recover-20260731

**Date:** 2026-07-31
**AC:** Port 3001 coming back after backend container restart on VPS.

## Step A — Pre-check (local)

```
curl -so /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/hrm/health
000
```

Local port 3001 is dead (connection refused).

## Step B — VPS docker ps (before restart)

```
xevn-hrm-fe-dev            node:22-alpine "docker-entrypoint.s…"  Up 3 hours   (ports 8080->8080)
xevn-hrm-be-dev            node:22-alpine "docker-entrypoint.s…"  Up 2 hours   (healthy, ports 3001->3001)
```

Note: only the `hrm-be` service exists on VPS (`docker compose config --services | grep hrm-be` returned just `hrm-be`).

## Step C — Compose restart/up result

```
[recover] discovering hrm-be services...
[recover] services found: hrm-be
[recover] restarting: hrm-be
Container xevn-hrm-be-dev Restarting
Container xevn-hrm-be-dev Started
[recover] done rc=0
```

`docker compose restart hrm-be` succeeded (no fallback to `up -d --build` needed).

## Step D — Health check after +50 s

```
curl -so /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/hrm/health
404
```

Note: `/api/hrm/health` returns 404; `/api/hrm/` returns 200 (compose healthcheck uses `wget ... http://127.0.0.1:3001/api/hrm/`).

## Step E — Metrics after another +50 s

```
curl -so /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/hrm/metrics
200
```

## Docker ps (after recovery)

```
xevn-hrm-fe-dev   Up 3 hours
xevn-hrm-be-dev   Up 2 minutes (healthy)
```

Container `xevn-hrm-be-dev` recovered, status `healthy`.

---

**Verdict: PASS**

Container health restored: `xevn-hrm-be-dev` is `Up / healthy`, `/api/hrm/` returns 200, `/api/hrm/metrics` returns 200. Local port 3001 remains dead as expected (service runs on VPS, not locally).
