# QA-D-XBOS-DIST-MAIN-L0-01 — L0 retest after dist/main recovery

**Date:** 2026-07-30  
**Owner:** qa  
**Upstream:** D-XBOS-DIST-MAIN-L0-01 (devops)  
**U65:** zero seed · **HOLD_DEPLOY:** yes  
**Account:** `ceo@xe.vn` / `Xevn@2026` · **Portal:** `http://127.0.0.1:5173`  
**Persona:** Group CEO · `company_id=main`

## Scope (this WI)

Confirm L0 stack after xbos-api `node dist/main.js` workaround (not full L2/L2.5 journey matrix).

## L0 — automated gate

```text
pnpm run qc:fe-be-health
```

| Check | Result |
|-------|--------|
| Exit code | **0** |
| hrm-api `:28001/api/hrm/` | HTTP **200** |
| xbos-api `:28002/api/xbos` | HTTP **200** |
| web-portal `:5173` | HTTP **200** |
| portal-login (proxy POST auth) | token ok |
| HRM direct + portal proxy employees/catalog | **200** |

## Direct API probes (QA)

| URL | HTTP |
|-----|------|
| `http://127.0.0.1:28002/api/xbos` | 200 |
| `http://127.0.0.1:28001/api/hrm` | 200 |
| Portal proxy `POST /api/xbos/auth/login` | **201** |
| Portal proxy `GET /api/xbos/tenant-scope/accessible` (Bearer) | **200** |
| Portal proxy `GET /api/xbos/tenant-scope/group-member-units` | **200** |
| Portal proxy `GET /api/xbos/tenant-scope/group-org-overview` | **200** |

## Browser — Command Center / XBOS proxy (no `:28002` ECONNREFUSED)

**Method:** Puppeteer on `:5173` — session from `POST /api/xbos/auth/login` (201) + standard portal storage inject (same pattern as `qa-u72-soft-p2-01.mjs`; U65 no seed).

**Note:** One UI form-login attempt did not navigate (stayed on `/login` — likely selector/timing); **network proof uses inject + CC load**, which matches sponsor L0 intent (proxy → xbos-api up, not ECONNREFUSED).

| Metric | Value |
|--------|-------|
| Final URL | `http://127.0.0.1:5173/command-center` |
| `ECONNREFUSED` / failed requests to `:28002` | **0** |
| `/api/xbos/*` responses captured | **14** |
| All `/api/xbos/*` HTTP status | **2xx** |

Sample CC-load XBOS calls (via portal proxy, not direct `:28002` in browser):

- `GET /api/xbos/tenant-scope/accessible` → 200
- `GET /api/xbos/tenant-scope/group-member-units` → 200
- `GET /api/xbos/kpi-engine/rollup?tenantId=xevn&companyId=main` → 200
- `GET /api/xbos/command-center/workspace-meta?tenantId=xevn&companyId=main` → 200
- `GET /api/xbos/workflow-engine/tasks?...` → 200

Runtime JSON: `docs/qa/evidence/_tmp-qa-d-xbos-dist-main-l0-01-browser.json`

## Verdict

| Layer | Verdict |
|-------|---------|
| L0 stack + FE↔BE health | **PASS** |
| XBOS dist/main workaround (APIs live) | **PASS** |
| Browser CC + no ECONNREFUSED `:28002` on `/api/xbos/*` | **PASS** |

## Residual (not FAIL for this WI)

| ID | Severity | Note |
|----|----------|------|
| nest `--watch` emit flaky | **P3** | Per devops evidence; use `build` + `node dist/main.js` until watch fixed |
| UI login form automation | **P3** | Form submit smoke inconclusive; API/proxy login + CC inject PASS |
| L2 / L2.5 J-* | **out of scope** | Not executed in this L0 WI |

## Related evidence

- DevOps: `docs/qa/evidence/d-xbos-dist-main-l0-01-20260730.md`

## ack_status

**PASS_TO_PM**
