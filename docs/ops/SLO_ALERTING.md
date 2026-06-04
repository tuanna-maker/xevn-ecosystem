# SLO & Alerting (Pilot VPS)

## SLO đề xuất

| SLO | Target (30d pilot) |
|-----|---------------------|
| API availability | 99.5% |
| p95 read API | < 800ms (không tính report) |
| Error rate 5xx | < 0.5% |

## Alert rules

File: `deploy/observability/prometheus/alerts.yml`

- `HighErrorRate5xx` — `rate(http_requests_total{status=~"5.."}[5m]) > 0.05`
- `HighP95Latency` — p95 > 2s
- `RateLimitSpike` — 429 spike
- Health down — cấu hình blackbox exporter (tùy VPS)

## Grafana

Import dashboards từ `deploy/observability/grafana/dashboards/xevn-api-overview.json`.

Provisioning: `deploy/observability/grafana/provisioning/datasources/datasources.yml`
