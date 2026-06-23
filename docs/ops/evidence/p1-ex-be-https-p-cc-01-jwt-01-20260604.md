# P1-EX-BE-HTTPS-P-CC-01-JWT-01 — Portal login JWT TTL (24h)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-BE-HTTPS-P-CC-01-JWT-01` |
| from_role | `dev-be` |
| to_role | `qa` |
| date | `2026-06-04` |
| pilot_url | `https://14-225-217-232.nip.io` |
| ack_status | `READY_FOR_QA` |

## Summary

QC GWC residual **C-JCC03-01** (`expiresInSec=43200` vs probe `86400`) — **not reproducible** on pilot as of 2026-06-04. Repo code already implements 24h TTL via `resolvePortalLoginJwtTtlSec()` + `signServiceJwt(..., expiresInSec)`. Prior VPS fix (2026-06-03) remains effective; **no new code diff** or container restart required this wave.

## Code contract (repo — unchanged)

| File | Behavior |
|---|---|
| `apps/api/xbos-api/src/auth/auth.service.ts` | `PORTAL_LOGIN_JWT_TTL_DEFAULT_SEC=86400`; `resolvePortalLoginJwtTtlSec()`; login returns `expiresInSec`; `signServiceJwt(..., expiresInSec)` |
| `apps/api/xbos-api/src/common/jwt-sign.ts` | `DEFAULT_SERVICE_JWT_TTL_SEC = 86400` |
| `deploy/xevn-ecosystem/.env.example` | `PORTAL_LOGIN_JWT_TTL_SEC=86400` (optional override on VPS) |

## Unit tests (local)

```powershell
Set-Location apps/api/xbos-api
pnpm test -- src/auth/auth.service.spec.ts src/common/jwt-sign.spec.ts src/auth/auth.controller.spec.ts
```

**Output:**

```text
Test Suites: 3 passed, 3 total
Tests:       5 passed, 5 total
```

## Pilot verification — login TTL

```powershell
node -e "(async()=>{const r=await fetch('https://14-225-217-232.nip.io/api/xbos/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'ceo@xe.vn',password:'Xevn@2026'})});const b=await r.json();const d=b.data??b;const t=d.accessToken;const p=JSON.parse(Buffer.from(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'),'base64').toString());console.log('status',r.status,'expiresInSec',d.expiresInSec,'jwt_delta',p.exp-p.iat);})()"
```

**Output (2026-06-04):**

```text
status 201 expiresInSec 86400 jwt_delta 86400
```

## Full HTTPS probe (exit criteria #2)

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-ex-qa-https-01-probe.mjs
```

**Stdout (2026-06-04):**

```text
P1-EX-QA-HTTPS-01 probe — https://14-225-217-232.nip.io

PASS  P-CC-01-login HTTP 201 XBOS-AUTH-200
PASS  P-CC-01-jwt
PASS  P-CC-02 HTTP 200 XBOS-TENANT-200
PASS  P-CC-03 HTTP 200 HRM-EMP-200
PASS  P-CC-04a HTTP 200 HRM-SET-200
PASS  P-CC-04b HTTP 200 HRM-CON-200
PASS  J-CC-03 HTTP 200 XBOS-KPI-202 — KPI rollup companyId=holding + x-company-id main
PASS  P-CC-04c HTTP 200 XBOS-KPI-202
PASS  P-CC-04
PASS  P-CC-05 HTTP 200 HRM-CON-200
PASS  P-CC-06 HTTP 200 HRM-REC-200
PASS  P-CC-07 HTTP 200 HRM-ATT-200
PASS  P-CC-08 HTTP 200 HRM-PAY-200
PASS  P-CC-09 HTTP 200 XBOS-CAT-212
PASS  J-HRM-01
PASS  J-HRM-02
PASS  J-HRM-03
PASS  J-HRM-04
PASS  J-HRM-05
PASS  J-HRM-06
PASS  J-HRM-07
PASS  J-XBOS-01-tasks HTTP 200 XBOS-WF-203
PASS  member-kpi-negative HTTP 409 SCOPE_CONTEXT_MISMATCH — du-lich.ceo@xe.vn — expect 403/409 on group rollup

=== L2 checks: 23/23 PASS ===
=== L2.5 journeys: 7/7 PASS ===
```

**Exit code:** `0`

## Ops note (if regression to 43200)

Per `docs/ops/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260603.md`: stale `xbos-be` on VPS — sync `auth.service.ts` + `jwt-sign.ts`, set `PORTAL_LOGIN_JWT_TTL_SEC=86400` in `deploy/xevn-ecosystem/.env`, `docker compose --env-file .env up -d --force-recreate xbos-be`. Prefer `git pull` on `/opt/xevn-ecosystem` over partial `pscp`.

## completion_report

- **Closed:** `P-CC-01-jwt` — `POST /api/xbos/auth/login` returns `expiresInSec=86400`, JWT `exp-iat=86400`.
- **Closed:** Full `tmp-p1-ex-qa-https-01-probe.mjs` **23/23 L2 + 7/7 L2.5**, exit **0** on nip.io.
- **Closed:** xbos-api auth TTL unit tests **5/5** PASS.
- **Residual:** None for this work item. If pilot regresses to 43200, dispatch **devops** redeploy `xbos-be` (no BE code change expected).

## next_owner

`qa`

## next_dispatch_prompt

work_item_id: P1-EX-BE-HTTPS-P-CC-01-JWT-01 — QA retest on HTTPS pilot. Run `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs` — require exit 0, `P-CC-01-jwt` PASS with `expiresInSec=86400`, and login JWT delta 86400. Evidence: `docs/ops/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260604.md`. On PASS, `ack_status: PASS_TO_PM` and close QC GWC **C-JCC03-01** if still open.
