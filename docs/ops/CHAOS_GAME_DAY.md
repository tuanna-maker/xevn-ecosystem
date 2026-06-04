# Chaos Game Day (P2.5)

## Load (k6)

```bash
k6 run scripts/load/k6-hrm-smoke.js
k6 run scripts/load/k6-portal-browse.js
```

SLO: error rate < 1%, p95 < doc `SLO_ALERTING.md`.

## Chaos scenarios

| Scenario | Command / action | Expected |
|----------|------------------|----------|
| DB latency | `tc qdisc add dev eth0 root netem delay 200ms` | p95 tăng, không 5xx hàng loạt |
| Kill API container | `docker restart xevn-hrm-be-dev` | nginx 502 < 30s, recovery |
| Redis down | stop redis | rate limit fallback memory |

## Evidence

Ghi `docs/qa/` report: RTO/RPO đạt mục tiêu `DISASTER_RECOVERY.md`.
