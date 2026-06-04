# ADR: Phase 1 production topology — deploy layout, ports, HTTPS pilot, UAT vs cutover

| Field | Value |
|-------|--------|
| **ADR-ID** | ADR-P1-R3-PRODUCTION-TOPOLOGY |
| **work_item_id** | `P1-R3-SA-01` |
| **Status** | Accepted |
| **Date** | 2026-05-29 |
| **Decision owner** | SA |
| **Epic** | P1-R3 — Production readiness (`docs/program/PHASE1_TEAM_WBS.md`) |
| **Related** | [`DEPLOY_GUIDE.md`](../ops/DEPLOY_GUIDE.md), [`PRODUCTION_ENABLE_RUNBOOK.md`](../ops/PRODUCTION_ENABLE_RUNBOOK.md), [`SERVICE_READINESS_UAT_PRODUCTION.md`](../program/SERVICE_READINESS_UAT_PRODUCTION.md), [`NFR_OBSERVABILITY_SECURITY_BASELINE.md`](../ecosystem/NFR_OBSERVABILITY_SECURITY_BASELINE.md) |

---

## 1. Context

Phase 1 closure requires a single, evidence-backed picture of **where services run**, **which ports mean what**, and **how UAT (HTTPS pilot) differs from corporate production cutover**. The repo already ships `deploy/xevn-ecosystem` (Docker Compose dev stack), host-level nginx for TLS pilot (`deploy/nginx/xevn-ecosystem-vhost.conf`), and NFR gates (`verify:production-env`, Prometheus metrics). QC **G7 MET (GWC)** left **Production** open (`C-P1R2QC-05` → P1-R3).

This ADR does **not** change runtime code; it locks topology assumptions for DevOps (`P1-R3-DO-01`), QC (`P1-R3-QC-01`), and PM (`SERVICE_READINESS` PROD column).

---

## 2. Decision summary

| Topic | Decision |
|-------|----------|
| **Runtime unit** | One VPS (`14.225.217.232`) runs **Docker Compose** stack under `deploy/xevn-ecosystem`; **host nginx** terminates TLS for HTTPS pilot and path-routes to host ports. |
| **Canonical VPS host ports** | `PORTAL_FE_PORT=8088`, `HRM_FE_PORT=8080`, `XBOS_FE_PORT=5173`, `HRM_BE_PORT=3001`, `XBOS_BE_PORT=28002` — source: `vps-host-ports.defaults` (do not collide with foreign `node` on `:3002`). |
| **Local dev reference ports** | Monorepo scripts/QA often cite **28001 / 28002 / 5175** — same logical services; map to host ports via `.env` or `deploy:pick-ports` (`PORTS.md`). |
| **HTTPS pilot** | `https://14-225-217-232.nip.io` — same-origin `/`, `/hr/`, `/api/hrm/`, `/api/xbos/`; **not** production domain. |
| **Production cutover** | Corporate hostnames + cert + split vhosts optional; same service boundaries; stricter secrets/CORS; QC **GO** before PROD-READY. |

---

## 3. Service topology

### 3.1 Logical components (Phase 1 in scope)

| ID | Service | Code | Deploy folder | In `docker-compose.yml` |
|----|---------|------|---------------|-------------------------|
| SVC-03 | Command Center portal | `apps/web/web-portal` | `portal-fe` | Yes (`xevn-portal-fe-dev`) |
| — | HRM web (embed `/hr/`) | `apps/web/hrm` | `hrm-fe` | Yes (`xevn-hrm-fe-dev`) |
| SVC-01 | XBOS API | `apps/api/xbos-api` | `xbos-be` | Yes (`xevn-xbos-be-dev`) |
| SVC-02 | HRM API | `apps/api/hrm-api` | `hrm-be` | Yes (`xevn-hrm-be-dev`) |
| — | XBOS UI (standalone) | `apps/web/x-bos-core` | `xbos-fe` | Yes (optional; CC is primary shell) |
| SVC-11 | HRM mobile | Expo app | `hrm-mobile/` | **No** — points to HRM API URL only |

Shared bootstrap: one-shot `pnpm-install` container; repo bind-mount + `xevn_repo_node_modules` volume.

### 3.2 Port matrix (three planes)

| Plane | Portal (user) | HRM API | XBOS API | HRM FE embed |
|-------|---------------|---------|----------|--------------|
| **Container listen** | 5175 (Vite) | 3001 | `XBOS_BE_PORT` (28002 on VPS) | 8080 |
| **VPS host (canonical)** | **8088** → 5175 | **3001** → 3001 | **28002** → 28002 | **8080** → 8080 |
| **Local dev (typical)** | 28088 or 5175 | **28001** | **28002** | 28080 |

**Invariant:** `xbos-api` binds **`XBOS_BE_PORT`**, not generic `PORT`. Compose must map `host:container` with the **same** value (`28002:28002` on VPS). Portal Vite proxy inside compose uses **container DNS** (`http://xbos-be:28002`, `http://hrm-be:3001`).

**Documentation alias:** `SERVICE_READINESS` and `qc:fe-be-health` refer to HRM **28001** on workstation; on VPS smoke use **3001** (`DEPLOY_GUIDE.md` §2).

### 3.3 Request flow — HTTPS pilot (UAT perimeter)

```text
Browser  https://14-225-217-232.nip.io
              │
              ▼
┌─────────────────────────────────────────────┐
│ Host nginx (443) deploy/nginx/              │
│   xevn-ecosystem-vhost.conf                 │
│   TLS (Let's Encrypt) + HSTS                │
└─────┬───────────┬────────────┬──────────────┘
      │           │            │
 /api/hrm/*   /api/xbos/*    /hr/*      /*
      │           │            │         │
      ▼           ▼            ▼         ▼
  :3001       :28002        :8080     :8088
 hrm-be      xbos-be       hrm-fe   portal-fe
 (Nest)      (Nest)        (Vite)   (Vite + dev proxies)
```

- **Same-origin** avoids cross-port CORS for CC + HRM iframe; portal still injects JWT via `portalAuthBridge` (separate browsing context).
- **Raw IP :8088** remains valid for ops smoke; **user UAT** should use **HTTPS** host when testing cookie/TLS/CORS (`CORS_ALLOWED_ORIGINS` includes `https://14-225-217-232.nip.io`).
- **HTTP :80** on nip.io host: ACME + redirect 301 → HTTPS only (does not capture default site on bare IP).

### 3.4 Request flow — local developer

```text
Browser http://127.0.0.1:5175 (or 28088)
    → Vite proxy /api/hrm → HRM_BE (28001)
    → Vite proxy /api/xbos → XBOS_BE (28002)
    → Vite proxy /hr → HRM web dev server
```

`pnpm dev` does **not** start `hrm-api` by default — run `pnpm run dev:hrm-api` (or compose) before `qc:fe-be-health`.

### 3.5 Future production cutover (target state)

```text
Browser https://portal.<corp-domain>
    → nginx (corp cert) → static portal OR portal-fe upstream
    → /api/hrm → hrm-api pool (internal)
    → /api/xbos → xbos-api pool
    → /hr/ → hrm-fe or CDN static build
```

Pilot nip.io vhost is a **stand-in** for one hostname; production may split API subdomains — contracts (paths `/api/hrm`, `/api/xbos`) stay stable per OpenAPI ADR.

---

## 4. Environment boundaries

| Layer | Path | Owns | Must not |
|-------|------|------|----------|
| **Deploy stack** | `deploy/xevn-ecosystem/.env` | Host ports, `NODE_ENV`, `DB_*`, `SERVICE_JWT_SECRET`, `CORS_ALLOWED_ORIGINS`, rate limits, optional Redis/OTel | Commit secrets; `docker compose down` on shared VPS |
| **App overlays** | `apps/api/hrm-api/.env`, `apps/api/xbos-api/.env` | App-local overrides (compose `env_file` order: deploy wins for `NODE_ENV`) | Drift JWT/CORS without runbook |
| **Workstation** | `apps/web/*/.env.local`, root `.env` | `VITE_DEV_PROXY_*`, local port picks | Assume same ports as VPS without reading `.env` |
| **Perimeter** | `/etc/nginx/...` (from `deploy/nginx/*.conf`) | TLS, HSTS, `X-Forwarded-Proto`, `X-Request-Id` | Point `proxy_pass` at wrong host port after port audit |
| **Data** | PostgreSQL cluster (`DB_HOST`) | `xevn_hrm`, `xevn_xbos` logical DBs | Treat HRM as catalog SoT for group frameworks (XBOS publishes) |

**POC vs production guard:**

| Flag / check | UAT / pilot | Production cutover |
|--------------|-------------|-------------------|
| `XEVN_POC_DEV=1` | Allowed on dev VPS | **Off** — no placeholder password bypass |
| `NODE_ENV` | Often `development` on long-running dev containers; HTTPS pilot may set `production` on APIs after DO waves | **`production`** on all API containers |
| `SERVICE_JWT_SECRET` | Dev default tolerated only for local | Strong secret; `verify:production-env` **exit 0** |
| `CORS_ALLOWED_ORIGINS` | Must include pilot HTTPS origin | Corporate portal origins only |
| `INTERNAL_API_KEY` | Dev key on POC | Non-default strong key |

---

## 5. Observability & security (references)

Implementations use `@xevn/platform-core` per platform NFR bootstrap. **Evidence gates** (not duplicated here):

| Capability | Endpoint / command | Baseline doc |
|------------|-------------------|--------------|
| Structured logs | JSON stdout, `x-request-id` | `NFR_OBSERVABILITY_SECURITY_BASELINE.md` § Log schema |
| Metrics | `GET /api/hrm/metrics?format=prometheus`, `GET /api/xbos/metrics?format=prometheus` | Same § Metrics |
| Production guard | `node scripts/verify-production-env.mjs` | Same § Production guard |
| Enablement procedure | Phases A→H | `PRODUCTION_ENABLE_RUNBOOK.md` |
| Optional stack | Loki/Prometheus/Grafana profile `obs` | `OBSERVABILITY_RUNBOOK.md` |

Perimeter nginx forwards `X-Request-Id` for cross-layer correlation (see `map` in `xevn-ecosystem-vhost.conf`).

---

## 6. Rollback & safe deploy

Aligned with `DEPLOY_GUIDE.md` and `PRODUCTION_ENABLE_RUNBOOK.md` §4.

| Rule | Rationale |
|------|-----------|
| **No `docker compose down`** on shared VPS | Protects non-`xevn-*` workloads |
| **Backup `.env` before secret/TLS change** | `cp .env .env.bak.<date>` |
| **Rollback API** | Restore `.env.bak`; `docker compose up -d --build` **only** `xevn-hrm-be-dev` / `xevn-xbos-be-dev` |
| **Rollback FE** | Recreate `portal-fe` / `hrm-fe` from last known good image or git ref; host nginx reload only after `nginx -t` |
| **Port change** | Update `vps-host-ports.defaults` + `merge-vps-port-env.mjs --apply-canonical` + **both** compose proxies and `deploy/nginx/xevn-ecosystem-vhost.conf` |

**Git deploy path:** `/opt/xevn-ecosystem` → `deploy/xevn-ecosystem/deploy.sh` (pull, merge ports, `up -d --build`). Prefer full-tree sync (`P1-R3-DO-02`) over partial `pscp` for FE bridge files.

---

## 7. Phase 1 — UAT vs production cutover assumptions

### 7.1 UAT-READY (persona slice — current program state)

**Environment:** VPS HTTP ports **or** HTTPS pilot `https://14-225-217-232.nip.io` with seeds (`seed:hrm:1000-uat`, fidelity) and gates:

- L0: `pnpm run qc:dev-stack` (local) / perimeter curl 200 (pilot)
- L1: `pnpm run test:system:uat` (37/37 after seed fixes)
- L2 + L2.5: `PILOT_BUSINESS_FLOW_MATRIX` + `PROGRAM_JOURNEY_MAP` J-* on pilot URL

**Scope limit (explicit):** Group CEO `ceo@xe.vn`, tenant `xevn`, scope `main` / rollup — **not** all member personas or PROD domain (`SERVICE_READINESS` footnote).

**HTTPS pilot ≠ PROD-READY:** TLS on nip.io proves perimeter pattern; QC still lists PROD column 🔴 until `P1-R3-QC-01` and corporate cutover checklist.

### 7.2 UAT-PASS

BA/QA scripted sign-off on UAT environment; defect P0/P1 = 0 for in-scope journeys; does not by itself flip `PROD-READY`.

### 7.3 PROD-READY / PROD-LIVE (cutover)

| Assumption | Detail |
|------------|--------|
| Hostnames | Replace `14-225-217-232.nip.io` with corporate DNS; re-issue certs |
| Secrets | All production guard checks pass on **target** `.env` |
| QC | `P1-R3-QC-01` **GO** or **GO WITH CONDITIONS** with dated waivers |
| Data | Backup/restore tested (`DISASTER_RECOVERY.md`); migrations applied via `migrate-apply.mjs` |
| Mobile | `hrm-mobile` aims at **public** HRM API URL for prod build — not compose service |
| Phase 1 program | `P1-R4-*` program GO is **separate** from first PROD-LIVE service |

**Non-goals for P1-R3 topology ADR:** Multi-region, K8s, blue/green at scale — defer to Phase 2+ ADR if needed.

---

## 8. Validation & acceptance

| Check | Owner | PASS when |
|-------|-------|-----------|
| Port audit on VPS | DevOps | `ss -tlnp` matches `vps-host-ports.defaults` |
| Compose health | DevOps | `docker compose ps` all `xevn-*` up; portal 8088, HRM 3001, XBOS 28002 smoke 200 |
| HTTPS pilot | QA | L2/L2.5 on `https://14-225-217-232.nip.io` per matrix |
| Production env | DevOps | `verify:production-env` exit **0** on prod-like `.env` |
| Metrics | QA/DevOps | Prometheus text includes `http_requests_total` on both APIs |
| ADR published | SA | This file + PM bus `PASS_TO_PM` |

---

## 9. Consequences

- **DevOps** must keep host nginx `proxy_pass` ports synchronized with `vps-host-ports.defaults` (historical failure: XBOS at 3002 vs 28002).
- **QA** documents environment URL explicitly (HTTP port vs HTTPS host) in evidence filenames.
- **QC** treats PROD-READY as **corporate env + gates**, not nip.io pilot alone.
- **PM** updates `SERVICE_READINESS` PROD column only after `P1-R3-QC-01`, not when UAT-READY 🟡.

---

## 10. References

| Artifact | Path |
|----------|------|
| Compose stack | `deploy/xevn-ecosystem/docker-compose.yml` |
| Port table | `deploy/xevn-ecosystem/PORTS.md`, `vps-host-ports.defaults` |
| HTTPS vhost | `deploy/nginx/xevn-ecosystem-vhost.conf` |
| Static portal nginx (image build) | `deploy/xevn-ecosystem/nginx/web-portal.conf` |
| Deploy ops | `docs/ops/DEPLOY_GUIDE.md` |
| Production enable | `docs/ops/PRODUCTION_ENABLE_RUNBOOK.md` |
| Service states | `docs/program/SERVICE_READINESS_UAT_PRODUCTION.md` |
| NFR baseline | `docs/ecosystem/NFR_OBSERVABILITY_SECURITY_BASELINE.md` |
