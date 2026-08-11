# TECH_SPEC_NEW v1
Technical Specification — XeVN Ecosystem OS
Based on: SRS-XEVN-NEW v1
Date: 2026-08-07
Status: Draft
Sponsor: Product Management — XeVN Ecosystem
Classification: Internal Use Only

---

## 1. Runtime and Process Model

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| API runtime | Node.js 20+, NestJS (controller → service → repository), Express fallback | Structured architecture, dependency injection, interceptors for cross-cutting concerns |
| Language | TypeScript 5.x, strict | Type safety end-to-end, no `any` |
| Frontend runtime | React 18+ on Vite, React Native 0.76+ on Expo | Shared toolchain, fast HMR, native parity |
| Database | PostgreSQL 16+ via Prisma ORM | Mature ecosystem, JSONB support for metadata, strong multi-tenant patterns |
| Cache | Redis 7+ | Session revocation, rate-limit counters, catalog keys, Socket.IO adapter |
| Build orchestrator | Turborepo with pnpm 9.15 workspaces | Monorepo with shared packages, filtered pipelines |
| Container | Docker Compose (dev), container images for production | Reproducible environments across developer machines |

---

## 2. Authentication and Identity

| Decision | Specification |
|----------|---------------|
| Access token | RS256 JWT, two-hour expiry |
| Refresh token | Rotating, thirty-day expiry |
| Revocation | Redis blacklist keyed by jti; TTL matches remaining JWT lifetime |
| Token issuance | xbos-api only; all other services validate, never issue |
| Tenant binding | JWT carries tenantId and membershipId; X-Tenant-ID header must match JWT claim |
| Session cleanup | Background job sweeps expired blacklist entries |

---

## 3. Performance and Caching

### 3.1 Database Connection Pools

| Service | Min Connections | Max Connections | Idle Timeout |
|---------|---------------|----------------|--------------|
| hrm-api | 5 | 20 | Ten minutes |
| xbos-api | 5 | 20 | Ten minutes |

PgBouncer is optional for production; recommended when connection count approaches pool ceiling.

### 3.2 Catalog Cache

- Redis key pattern: `catalog:{tenantId}:v{version}`
- TTL: twenty-four hours; invalidated on CATALOG_UPDATED event
- Fallback: database lookup on cache miss with event-driven repopulation

### 3.3 Latency Targets

| Percentile | Target |
|-----------|--------|
| P95 | Below three hundred milliseconds |
| P99 | Below eight hundred milliseconds |

Measured at the API gateway response for successful non-batch requests.

---

## 4. Jobs and Messaging

| Job | Schedule | Owner |
|-----|----------|-------|
| Payroll batch | Twenty-fifth of each month (or nearest business day) | hrm-api |
| Catalog propagation | On CATALOG_UPDATED event or daily fallback | xbos-api |
| Notification dispatch | Event-driven | Notification service |
| Reminder cron | Every four hours for pending workflows | xbos-api |
| Escalation check | Every four hours, triggered at two times SLA | xbos-api |
| Blacklist cleanup | Hourly | xbos-api |

Messaging uses BullMQ with Redis backend. Dead-letter queues capture failed dispatching after retry exhaustion.

---

## 5. Storage

| Asset Type | Storage | Notes |
|-----------|---------|-------|
| Employee documents | S3-compatible object storage | Upload validated for format, size, and virus scan before persistence |
| Payslip PDFs | S3-compatible object storage | Encrypted at rest; TLS in transit |
| Development environment | MinIO container | Mirrors S3 API locally |
| Production | AWS S3 or equivalent | Server-side encryption enabled |

---

## 6. Mobile Specifics

| Decision | Specification |
|----------|---------------|
| Push notifications | FCM for Android, APNs for iOS |
| Map and geofence | Google Maps or Mapbox |
| Anti-spoof (Android) | Play Integrity API challenge |
| Anti-spoof (iOS) | Device-check or equivalent Apple mechanism |
| Offline queue | SQLite / AsyncStorage with sync-on-reconnect and conflict resolution |

---

## 7. Cross-Cutting Concerns

| Concern | Approach |
|---------|----------|
| Rate limiting | Per-tenant and per-user buckets in middleware |
| Observability | Distributed tracing via OpenTelemetry with Jaeger export |
| Structured logging | JSON with tenantId, membershipId, requestId fields |
| Error envelope | `{code, message, details?, requestId}` on all API responses |
| Pagination | `page` and `limit` query parameters; `total` and `page` in response envelope |

---

## 8. Deployment Topology (Development)

| Service | Host Port | Container Port | URL |
|---------|-----------|----------------|-----|
| portal-fe | 8088 | 5175 | http://host:8088/command-center |
| hrm-fe | 8080 | 8080 | http://host:8080/hr/ |
| hrm-be | 3001 | 3001 | http://host:3001/api/hrm |
| xbos-fe | 5173 | 5173 | http://host:5173 |
| xbos-be | 3002 | 28002 | http://host:3002/api/xbos |

Port mappings are defined in deploy/xevn-ecosystem/PORTS.md and managed via deploy/xevn-ecosystem/.env.

---

## 9. Traceability

| Document | Relationship |
|----------|-------------|
| BRD-XEVN-NEW v1 | Business objectives driving technical decisions |
| SRS-XEVN-NEW v1 | Functional requirements implemented by this spec |
| DB_DESIGN_NEW.md | Schema-level decisions supporting runtime architecture |
| API_CONTRACT_NEW.md | Interface definitions enforced by this runtime |
