# NFR Observability & Security Baseline (P0)

## Log schema (JSON stdout)

| Field | Mô tả |
|-------|--------|
| `level` | `info` / `warn` / `error` |
| `time` | ISO-8601 |
| `service` | `hrm-api` \| `xbos-api` |
| `requestId` | Header `x-request-id` (generated nếu thiếu) |
| `traceId` | Từ `traceparent` (P1 OTel) |
| `tenantId`, `companyId`, `userId` | Từ JWT/headers (không log token) |
| `method`, `path`, `status`, `durationMs`, `code` | Access log on `finish` |
| `msg` | Human-readable message |

### Ví dụ Loki query

```logql
{container=~".*xevn.*-be.*"} | json | requestId="abc-123" | line_format "{{.method}} {{.path}} {{.status}} {{.durationMs}}ms"
```

```logql
{container=~".*hrm.*"} | json | level="error" | status >= 500
```

## Metrics (Prometheus)

- `GET /api/hrm/metrics?format=prometheus`
- `GET /api/xbos/metrics?format=prometheus`

Counters/histograms: `http_requests_total`, `http_request_duration_seconds`, `db_query_duration_seconds`, `pg_pool_waiting_count`.

## Production guard

`NODE_ENV=production` yêu cầu:

- `SERVICE_JWT_SECRET` (không dùng `xevn-dev-jwt-secret`)
- `CORS_ALLOWED_ORIGINS` (comma-separated)
- `INTERNAL_API_KEY` không dùng giá trị dev mặc định

Verify: `node scripts/verify-production-env.mjs --dry-run`

## Traceability

| SRS | Deliverable |
|-----|-------------|
| NFR-SEC-005 | Pino JSON + requestId |
| NFR-SEC-006 | `resolveCorsOptions()` |
| NFR-SEC-007 | Rate limit memory + Redis (P1) |
| NFR-AVAIL-001 | `/metrics` Prometheus |
| TS-06 | Grafana dashboards `deploy/observability/grafana/` |
