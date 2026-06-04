# P1-EX-DO-NGINX-HR-HOST-01 — Perimeter `/hr/` → hrm-fe Host (C-HTTPSQC-07)

**Date:** 2026-05-28  
**Owner:** DevOps  
**VPS:** `14.225.217.232`  
**Pilot host:** `https://14-225-217-232.nip.io`  
**No commit.**

## Handoff

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-EX-DO-NGINX-HR-HOST-01` |
| **from_role** | devops |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **qc_ref** | **C-HTTPSQC-07** (TLS-R2 `/hr/` 403) |

## Root cause

1. Perimeter nginx (`/etc/nginx/sites-available/xevn-ecosystem`) had **no** `location /hr/` — requests fell through to portal `:8088`, causing wrong upstream / Vite Host mismatch.
2. VPS `apps/web/hrm/vite.config.ts` lacked `server.allowedHosts: true` — direct proxy with `Host: 14-225-217-232.nip.io` returned **403** from Vite even after nginx route added.

## Actions executed

| Step | Command / change | Result |
|------|------------------|--------|
| 1 | Added `location /hr/` → `http://127.0.0.1:8080/hr/` with `proxy_set_header Host $host` in repo `deploy/nginx/xevn-ecosystem-vhost.conf` | Config ready |
| 2 | `pscp` → `/etc/nginx/sites-available/xevn-ecosystem` | Uploaded |
| 3 | `nginx -t && systemctl reload nginx` | **PASS** (warn: unrelated `_` on :80) |
| 4 | `pscp` `apps/web/hrm/vite.config.ts` (`allowedHosts: true`) → VPS | Synced dev-fe parity |
| 5 | `docker compose --env-file .env up -d hrm-fe` (recreated `hrm-fe` + `hrm-be` after failed `restart`) | Stack **Up** |

## Gate table

| Check | Before | After | Verdict |
|-------|--------|-------|---------|
| `GET http://127.0.0.1:8080/hr/` (default Host) | 200 | 200 | PASS |
| `GET :8080/hr/` Host `14-225-217-232.nip.io` | **403** | **200** | PASS |
| `GET https://14-225-217-232.nip.io/hr/` | **403** | **200** | PASS |
| `GET https://…/hr/employees?portal=1` | **403** | **200** | PASS |
| `GET https://…/hr/@vite/client` | — | **200** | PASS |
| `GET https://…/command-center` | 200 | 200 | PASS |
| `GET https://…/api/hrm/` | 200 | 200 | PASS |

## Smoke (2026-05-28, VPS)

```text
hrm-api:200
default:200
nip:200
hr-https:200
hr-employees:200
portal-cc:200
hr-vite-client:200
```

HTTPS `/hr/` response headers include `content-type: text/html`, `cache-control: no-cache` (Vite dev), HSTS from perimeter.

## Nginx snippet (perimeter)

```nginx
location /hr/ {
    proxy_pass http://127.0.0.1:8080/hr/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Request-Id $xevn_request_id;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## Coordination / residual

| Item | Owner | Note |
|------|-------|------|
| Commit repo `deploy/nginx/xevn-ecosystem-vhost.conf` + `vite.config.ts` | PM / dev-fe | Applied on VPS only this run |
| **C-HTTPSQC-01** browser L2.5 embed | **qa** | Re-run J-HRM-* on HTTPS now `/hr/` serves 200 |
| `hrm-be` recreated during compose up | — | API smoke **200** post-wait ~35s |

## Shared-VPS safety

- No `docker compose down`; only `hrm-fe` / `hrm-be` recreate via targeted `compose up -d hrm-fe`.
- Non-xevn containers untouched.

## Verdict

**PASS** — Perimeter `/hr/` routes to hrm-fe with pilot `Host`; Vite no longer returns 403 for nip.io. Ready for QA browser retest (C-HTTPSQC-01 / C-HTTPSQC-07 closure).
