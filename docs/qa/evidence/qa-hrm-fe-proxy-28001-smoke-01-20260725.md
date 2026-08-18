# QA-HRM-FE-PROXY-28001-SMOKE-01 — HRM FE `:8080` proxy → `:28001`

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-HRM-FE-PROXY-28001-SMOKE-01` |
| **from_role** | pm → qa |
| **date** | 2026-07-25 |
| **closes** | Residual P2 from `QA-HRM-SETTINGS-MD-JT-BROWSER-01` / JT-01 (direct `:8080` → dead `:3001`) |
| **dev evidence** | `docs/qa/evidence/devops-hrm-fe-proxy-28001-01-20260725.md` (`D-HRM-FE-PROXY-28001-01` READY_FOR_QA) |
| **ack_status** | **PASS_TO_PM** |
| **locks** | U65 zero-seed · HOLD_DEPLOY · NOT `:8088` · NOT Phase1/PROD · `dist-uat-w6` kept |

## Environment

| Host | Status |
|------|--------|
| HRM FE Vite `http://127.0.0.1:8080` | **200** `/hr/` |
| HRM API `http://127.0.0.1:28001` | **200** metrics |
| Dead `:3001` | connection fail (baseline) |
| Portal `http://127.0.0.1:5173/` | **200** (touched, no regression probe deep) |
| `apps/api/hrm-api/dist-uat-w6/main.js` | **exists** (W6 freeze intact) |
| Code SoT | `apps/web/hrm/vite.config.ts` default `VITE_DEV_PROXY_HRM_API \|\| http://127.0.0.1:28001` |

Runtime JSON: `docs/qa/evidence/_tmp-qa-hrm-fe-proxy-28001-smoke-01-runtime.json`

## AC matrix

| # | AC | Evidence | Verdict |
|---|-----|----------|---------|
| 1 | Open `http://127.0.0.1:8080/hr/` (or settings/recruitment JD path) | Browser: `http://127.0.0.1:8080/hr/settings-catalogs?portal=1&companyId=main` **200** | **PASS** |
| 2 | Network GET `/api/hrm/settings-catalogs` **200** — not 500 to `:3001` | Curl + Bearer via `:8080` → **200** `HRM-SET-200` len=11914 byte-match direct `:28001`; noauth via `:8080` → Nest **401** `HRM-AUTH-001` (not Vite 500); browser Network GET catalogs **200** on `:8080` origin | **PASS** |
| 3 | Optional light: Job Titles / JD picker loads options (no seed) | Settings-catalogs page load triggered GET catalogs **200** (picker data path live); no seed; no 5xx | **PASS** (light) |
| 4 | Portal `:5173` regression | `GET /` **200**; not deep-retested (timeboxed) | **PASS** (touched) |

## Probes (local 2026-07-25)

```
baseline-3001-dead          PASS  status=0
l0-28001-metrics            PASS  HTTP 200
ac-proxy-metrics-200        PASS  HTTP 200 + http_requests_total
ac-catalogs-noauth          PASS  HTTP 401 Nest (not Vite 500)
ac-settings-catalogs-8080   PASS  HTTP 200 HRM-SET-200 len=11914
ac-byte-parity-28001        PASS  8080.len == 28001.len
optional-browser-network    PASS  GET /api/hrm/settings-catalogs 200 via :8080
portal-5173-touched         PASS  HTTP 200
```

Auth: Bearer minted with local `SERVICE_JWT_SECRET` from `apps/api/hrm-api/.env` (length 26, value redacted). Token not logged. Headers: `x-tenant-id=xevn`, `x-company-id=main`.

Browser also observed (same origin proxy): `GET /api/hrm/operating-units` 200, `GET /api/hrm/company-subscription?company_id=main` 200 — no calls to `:3001`.

## Residual

- None for this P2 proxy residual — **CLOSED**.
- Portal deep UF / JT create matrix already 🟢 on `:5173/hr` (prior waves); this wave only closed direct `:8080` proxy trap.
- HOLD_DEPLOY remains; not promoting Phase1/PROD/:8088.

## Handoff

- **completion_report:** Smoke PASS — standalone HRM FE `:8080` now proxies `/api/hrm/*` to live `:28001`; settings-catalogs **200** (curl + browser). Residual P2 from JT-BROWSER closed. U65 · HOLD_DEPLOY · dist-uat-w6 intact.
- **next_owner:** pm
- **ack_status:** `PASS_TO_PM`
- **next_dispatch_prompt:** Mark residual P2 `D-HRM-FE-PROXY-28001-01` / JT-BROWSER `:8080→:3001` **CLOSED** on bus + any open JT/Settings MD residual lists. Optional: QC note-only if pack cites proxy; no product re-QA required for this smoke alone. Continue HOLD_DEPLOY.
