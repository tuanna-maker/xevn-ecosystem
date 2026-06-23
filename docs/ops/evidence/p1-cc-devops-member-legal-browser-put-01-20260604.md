# VPS deploy evidence — P1-CC-DEVOPS-MEMBER-LEGAL-BROWSER-PUT-01 (2026-06-04)

| Field | Value |
|-------|--------|
| work_item_id | P1-CC-DEVOPS-MEMBER-LEGAL-BROWSER-PUT-01 |
| depends_on | P1-CC-BE-MEMBER-LEGAL-BROWSER-PUT-01 (`5ae6bca`) |
| VPS | root@14.225.217.232 `/opt/xevn-ecosystem` |
| Portal HTTPS | https://14-225-217-232.nip.io |
| HEAD (VPS) | `5ae6bca` |
| ack_status | **READY_FOR_QA** |

## BE commit deployed

```text
5ae6bca fix(xbos-api): browser legal-entity PUT validation order (P1-CC-BE-MEMBER-LEGAL-BROWSER-PUT-01)
```

Change: `LegalEntityEnrichPipe` registered **before** `ValidationPipe` so browser payload-only PUTs get `code`/`name` enriched prior to DTO validation.

Dev-BE evidence: `docs/qa/evidence/p1-cc-be-member-legal-browser-put-01-20260604.md`.

## Pre-deploy

- Local `main` was **ahead 1** of `origin/main` — pushed `0ea889d..5ae6bca` before VPS pull.

## VPS steps (minimal blast)

1. Audit — xevn containers Up; no `docker compose down`
2. `git stash` → `git pull origin main` (fast-forward `0ea889d..5ae6bca`) → `stash pop`
3. `node scripts/merge-vps-port-env.mjs --apply-canonical` (ports unchanged: 8088/8080/5173/3001/28002)
4. `docker compose --env-file .env up -d --build --force-recreate xbos-be` only (portal-fe/hrm-be untouched)

## Remote smoke (post recreate)

Nest boot ~5 min on this cycle (pnpm-install + compile). Metrics stable after ~75s from container start.

| Endpoint | HTTP |
|----------|------|
| `127.0.0.1:28002/api/xbos/metrics` | **200** |
| `127.0.0.1:28002/api/xbos/metrics?format=prometheus` | **200** (`process_cpu_user_seconds_total`, `http_requests_total` present) |
| `https://14-225-217-232.nip.io/api/xbos/metrics` | **200** |

Container: `xevn-xbos-be-dev` Up, `28002:28002`.

## HTTPS functional probe (member save — primary exit)

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
pnpm run test:xbos:cc-member-save
```

| Step | Result |
|------|--------|
| Login `ceo@xe.vn` | **PASS** |
| GET group-member-units | **200**, members=4 |
| PUT XE_TMDV / VISUN / XE_DU_LICH / XE_VIETNAM | **200** `XBOS-ORG-201` each |
| POST-save reload | **200** |
| **Exit code** | **0** (`=== 4/4 member PUT PASS ===`) |

## Non-xevn containers

No stop/rm on non-`xevn-` containers. Only `xevn-xbos-be-dev` recreated.

## Residual

- Browser L2.5 **J-CC-02** (form save banner-free) — **QA retest required** on `5ae6bca`; prior FAIL on `0ea889d` (`docs/qa/evidence/p1-cc-qa-member-legal-save-l25-20260604.md`).
- Allow **≥90s** after xbos-be recreate before metrics smoke on VPS (cold boot can exceed 45s).

## next_owner

**qa** — `P1-CC-QA-MEMBER-LEGAL-SAVE-L25-01` browser L2.5 retest on nip.io after BE validation-order fix.
