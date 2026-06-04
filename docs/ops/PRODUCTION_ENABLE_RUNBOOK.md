# Production Enable Runbook — DevOps Sub-Agent

> **Đối tượng:** Sub-agent `devops` / lane DevOps. **Tự chạy** toàn bộ lệnh; không chuyển lệnh cho user trừ khi thiếu quyền/secret.
>
> **Tham chiếu:** `docs/ecosystem/NFR_OBSERVABILITY_SECURITY_BASELINE.md`, `docs/ops/OBSERVABILITY_RUNBOOK.md`, `docs/ops/DEPLOY_GUIDE.md` §7 TLS.

---

## 1. Mục tiêu “Production-enabled”

| Gate | PASS khi |
|------|----------|
| Secrets | `SERVICE_JWT_SECRET` mạnh, không dev default; `INTERNAL_API_KEY` không `xevn-dev-internal-key` |
| CORS | `CORS_ALLOWED_ORIGINS` whitelist (comma-separated), không `origin: true` trên prod |
| TLS | nginx terminate HTTPS + HSTS (xem `deploy/nginx/upstream-replicas.conf`) |
| Observability | JSON log + `x-request-id`; Prometheus scrape OK |
| Env gate | `pnpm verify:production-env` PASS (dry-run trước, thật sau khi set secret) |
| Smoke | API health + metrics Prometheus + portal không 500 |

---

## 2. Biến môi trường bắt buộc (VPS `.env`)

File: `deploy/xevn-ecosystem/.env` — **không commit secret**.

```bash
# Bắt buộc production
NODE_ENV=production
SERVICE_JWT_SECRET=<openssl rand -hex 32 — KHÔNG dùng xevn-dev-jwt-secret>
INTERNAL_API_KEY=<random-strong-key>
CORS_ALLOWED_ORIGINS=https://portal.your-domain.vn,https://hrm.your-domain.vn
LOG_LEVEL=info

# Khuyến nghị P1+
REDIS_URL=redis://127.0.0.1:6379
RATE_LIMIT_MAX=300
RATE_LIMIT_WINDOW_MS=60000
PG_POOL_MAX=10
PG_IDLE_TIMEOUT_MS=30000

# Tracing (bật sau khi stack obs chạy)
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:31041/v1/traces
OTEL_TRACE_SAMPLE_RATIO=0.1

# Async (tùy pilot)
BULLMQ_ENABLED=false
PLATFORM_RLS_ENABLED=false
```

**Giữ nguyên cổng VPS** (`vps-host-ports.defaults`): không đổi `HRM_BE_PORT` / `XBOS_BE_PORT` trừ khi đã audit `ss -tlnp`.

---

## 3. Quy trình DevOps (tự thực hiện tuần tự)

### Phase A — Chuẩn bị (local/repo)

```powershell
cd <repo-root>
pnpm install
pnpm build:platform-core
pnpm --filter hrm-api run build
pnpm --filter xbos-api run build
node scripts/verify-production-env.mjs --dry-run
# Kỳ vọng FAIL nếu vẫn dev secret — ghi nhận checklist cần sửa trên VPS
```

### Phase B — Migrate & schema NFR

```powershell
node scripts/migrate-apply.mjs hrm
node scripts/migrate-apply.mjs xbos
node scripts/audit-company-id-types.mjs
```

### Phase C — Cập nhật `.env` trên VPS (SSH)

```bash
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem
# Backup
cp .env .env.bak.$(date +%F)

# Chỉnh NODE_ENV, SERVICE_JWT_SECRET, CORS_ALLOWED_ORIGINS, INTERNAL_API_KEY
# Dùng editor an toàn; không paste secret vào chat/log

grep -E '^(NODE_ENV|SERVICE_JWT_SECRET|CORS_ALLOWED|INTERNAL_API)' .env
```

### Phase D — Redeploy API (an toàn shared VPS)

```bash
cd /opt/xevn-ecosystem
git pull origin main
node scripts/merge-vps-port-env.mjs --apply-canonical
cd deploy/xevn-ecosystem
docker compose --env-file .env up -d --build --remove-orphans xevn-hrm-be-dev xevn-xbos-be-dev
sleep 35
```

**Không** `docker compose down`. **Không** stop container non-`xevn-`.

### Phase E — Smoke production path

```bash
HRM=3001
XBOS=28002

# Health
curl -sf "http://127.0.0.1:${HRM}/api/hrm/" -H "x-request-id: prod-smoke-1"
curl -sf "http://127.0.0.1:${XBOS}/api/xbos/" -H "x-request-id: prod-smoke-2"

# Prometheus
curl -sf "http://127.0.0.1:${HRM}/api/hrm/metrics?format=prometheus" | head -5
curl -sf "http://127.0.0.1:${XBOS}/api/xbos/metrics?format=prometheus" | grep -E 'http_requests_total|process_'

# CORS negative (từ máy có curl — Origin lạ phải bị chặn trên prod)
curl -si -X OPTIONS "http://127.0.0.1:${HRM}/api/hrm/" \
  -H "Origin: https://evil.example" -H "Access-Control-Request-Method: GET" | head -20
```

Từ repo (khi API reachable):

```powershell
pnpm verify:openapi-contract
pnpm verify:tenant-isolation
pnpm ops:synthetic-checks
pnpm test:e2e:security
```

### Phase F — Observability stack (profile `obs`)

```bash
cd /opt/xevn-ecosystem
docker compose -f deploy/docker-compose.observability.yml --profile obs up -d
# Port mặc định: Loki 31010, Prometheus 31020, Grafana 31030, OTel 31041
```

Kiểm tra Prometheus targets → `deploy/observability/prometheus.yml` (sửa host nếu API không `host.docker.internal`).

### Phase G — TLS / nginx (perimeter)

1. Certbot hoặc cert corporate trên nginx.
2. Include `deploy/nginx/upstream-replicas.conf` hoặc `waf-baseline.conf`.
3. Reload nginx: `nginx -t && systemctl reload nginx`
4. Verify: `curl -I https://<portal-host>/` có `Strict-Transport-Security`.

### Phase H — Gate cuối

```powershell
# Trên máy có deploy .env production-like (hoặc SSH chạy node trên VPS)
NODE_ENV=production node scripts/verify-production-env.mjs
# Phải exit 0
```

Ghi evidence vào handoff: `docs/qa/` hoặc bus `AGENT_MESSAGE_BUS.md` — mục `production_enable_evidence`.

---

## 4. Rollback nhanh

| Sự cố | Hành động |
|--------|-----------|
| API không start (exit 1 prod guard) | Khôi phục `.env.bak`; hoặc tạm `NODE_ENV=development` + fix secret |
| CORS chặn FE hợp lệ | Bổ sung origin vào `CORS_ALLOWED_ORIGINS`, recreate BE container |
| 429 hàng loạt | Tăng `RATE_LIMIT_MAX` hoặc bật `REDIS_URL` đồng bộ multi-instance |
| OTel CPU cao | `OTEL_TRACE_SAMPLE_RATIO=0.05` hoặc `OTEL_ENABLED=false` |

```bash
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem
cp .env.bak.<date> .env
docker compose --env-file .env up -d --build xevn-hrm-be-dev xevn-xbos-be-dev
```

---

## 5. Lệnh vận hành định kỳ (cron / sub-agent tự chạy)

| Tần suất | Lệnh |
|----------|------|
| Sau mỗi deploy | Smoke §Phase E |
| Hàng ngày | `pnpm ops:synthetic-checks` |
| Hàng tuần | `pnpm verify:tenant-isolation` |
| Pre-release | `pnpm verify:production-env` + `pnpm test:e2e:security` |
| Hàng quý | DR drill — `docs/ops/DISASTER_RECOVERY.md` |

---

## 6. Exit criteria cho DevOps sub-agent

Trả về PM/QC packet:

```yaml
work_item_id: NFR-PROD-ENABLE
evidence_path:
  - docs/ops/PRODUCTION_ENABLE_RUNBOOK.md (this run log)
  - curl/prometheus smoke output
  - verify-production-env exit 0
  - optional: Grafana screenshot / Loki query requestId
ack_status: READY_FOR_QC | BLOCKED
blocker: <nếu thiếu TLS cert / secret owner>
```

---

## 7. Không làm

- Commit `.env` có password lên git.
- Ghi secret vào `AGENT_MESSAGE_BUS.md` hoặc chat.
- `docker compose down` trên VPS shared multi-project.
- Bật `PLATFORM_RLS_ENABLED` without SA sign-off (`migrations/hrm/0010_tenant_rls_policies.sql`).
