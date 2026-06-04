# Observability Runbook

## Stack (profile `obs`)

```bash
docker compose -f deploy/docker-compose.observability.yml --profile obs up -d
```

| Service | Default host port |
|---------|-------------------|
| Loki | 31010 |
| Prometheus | 31020 |
| Grafana | 31030 |
| OTel Collector HTTP | 31041 |

## Scrape targets

Chỉnh `deploy/observability/prometheus.yml` nếu API bind cổng VPS khác (`HRM_BE_PORT`, `XBOS_BE_PORT`).

## Drill: simulate 500

1. Gọi endpoint lỗi có `requestId` cố định.
2. Loki: `{container=~".*xevn-hrm-be.*"} | json | requestId="<id>"`.
3. Grafana panel **Error rate** chuyển đỏ trong 5 phút (rule `HighErrorRate5xx`).

## Promtail

Thu stdout container Docker có tên chứa `xevn` — xem `deploy/observability/promtail-config.yml`.

## OTel (P1)

API: `OTEL_ENABLED=true`, `OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:31041/v1/traces`
