# P1-EX-BE-HTTPS-P-CC-01-JWT-01 — Portal login JWT TTL (24h)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-BE-HTTPS-P-CC-01-JWT-01` |
| from_role | `dev-be` |
| to_role | `qa` |
| date | `2026-06-03` |
| pilot_url | `https://14-225-217-232.nip.io` |
| ack_status | `READY_FOR_QA` |

## Root cause

HTTPS pilot **xbos-api** disk was **stale** vs git:

- `auth.service.ts` hardcoded `expiresInSec: 12 * 60 * 60` (**43200**) and called `signServiceJwt(...)` **without** TTL argument.
- Repo already had `resolvePortalLoginJwtTtlSec()` + explicit `expiresInSec` / 24h sign — **not deployed** to VPS.

## Code (repo — no diff required)

| File | Contract |
|---|---|
| `apps/api/xbos-api/src/auth/auth.service.ts` | `resolvePortalLoginJwtTtlSec()`; login returns `expiresInSec`; `signServiceJwt(..., expiresInSec)` |
| `apps/api/xbos-api/src/common/jwt-sign.ts` | `DEFAULT_SERVICE_JWT_TTL_SEC = 86400` |
| `deploy/xevn-ecosystem/.env.example` | `PORTAL_LOGIN_JWT_TTL_SEC=86400` |

## Unit tests (local)

| Command | Result |
|---|---|
| `pnpm test -- src/auth/auth.service.spec.ts src/common/jwt-sign.spec.ts src/auth/auth.controller.spec.ts` (in `apps/api/xbos-api`) | **5/5 PASS** |

## Pilot deploy (2026-06-03)

| Step | Result |
|---|---|
| `pscp` `auth.service.ts`, `jwt-sign.ts` → `/opt/xevn-ecosystem/...` | PASS |
| Append/set `PORTAL_LOGIN_JWT_TTL_SEC=86400` in `deploy/xevn-ecosystem/.env` | PASS |
| `docker compose --env-file .env up -d --force-recreate xbos-be` | PASS |
| KPI scope files sync + `docker compose restart xbos-be` (restore J-CC-03 after partial sync) | PASS — Nest **0 errors**, metrics **200** |

**DevOps follow-up:** `git pull origin main` on `/opt/xevn-ecosystem` to replace partial `pscp` with full tree parity.

## Verification commands

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node -e "(async()=>{const r=await fetch(process.env.PORTAL_DEV_URL+'/api/xbos/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'ceo@xe.vn',password:'Xevn@2026'})});const b=await r.json();const d=b.data??b;const t=d.accessToken;const p=JSON.parse(Buffer.from(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'),'base64').toString());console.log('status',r.status,'expiresInSec',d.expiresInSec,'jwt_delta',p.exp-p.iat);})()"
```

**Output (2026-06-03):**

```text
status 201 expiresInSec 86400 jwt_delta 86400
```

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-ex-qa-https-01-probe.mjs
```

**Probe excerpt (in-scope rows):**

```text
PASS  P-CC-01-login HTTP 201 XBOS-AUTH-200
PASS  P-CC-01-jwt
PASS  J-CC-03 HTTP 200 XBOS-KPI-202
PASS  P-CC-04c HTTP 200 XBOS-KPI-202
```

**Full probe:** exit **1** — HRM rows `P-CC-05`..`08`, `J-HRM-01/02/04/05/06/07` FAIL (out of this work item; separate HRM wave).

## completion_report

- **Closed:** `P-CC-01-jwt` — login `expiresInSec=86400`, JWT `exp-iat=86400` on HTTPS pilot; QC condition **C-JCC03-01** JWT slice cleared.
- **Closed (collateral):** J-CC-03 / P-CC-04c rollup **200** after xbos-be restart with scope files.
- **Residual:** Full `tmp-p1-ex-qa-https-01-probe.mjs` **13/23** L2 (HRM 404/400 + journey list→detail) — not P-CC-01-jwt; dispatch HRM/QA wave. VPS needs `git pull` full sync vs partial `pscp`.

## next_owner

`qa`

## next_dispatch_prompt

Run QA for `P1-EX-BE-HTTPS-P-CC-01-JWT-01`: `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs` — assert **PASS** `P-CC-01-jwt` (`expiresInSec=86400`) and login JWT delta **86400**; attach stdout to this evidence file. If QC only needs JWT closure, hand `PASS_TO_PM` for **C-JCC03-01**; file separate defects for HRM probe failures (`P-CC-05`..`08`, `J-HRM-*`) without blocking JWT sign-off.
