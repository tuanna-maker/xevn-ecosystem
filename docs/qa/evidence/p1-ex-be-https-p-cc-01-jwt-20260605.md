# P1-EX-BE-HTTPS-P-CC-01-JWT-01 — Portal login JWT TTL (24h) re-verify

| Field | Value |
|---|---|
| work_item_id | `P1-EX-BE-HTTPS-P-CC-01-JWT-01` |
| from_role | `dev-be` |
| to_role | `qa` |
| date | `2026-06-05` |
| pilot_url | `https://14-225-217-232.nip.io` |
| ack_status | `READY_FOR_QA` |

## Summary

PM Watchdog re-dispatch for QC GWC **P-CC-01-jwt** (`expiresInSec` must be **86400**). Repo contract already correct from 2026-06-03 fix; **no code diff** required this wave. HTTPS pilot and full probe **PASS** on 2026-06-05.

## Code contract (repo — unchanged)

| File | Behavior |
|---|---|
| `apps/api/xbos-api/src/auth/auth.service.ts` | `PORTAL_LOGIN_JWT_TTL_DEFAULT_SEC = 86400`; `resolvePortalLoginJwtTtlSec()`; login returns `expiresInSec`; `signServiceJwt(..., expiresInSec)` |
| `apps/api/xbos-api/src/common/jwt-sign.ts` | `DEFAULT_SERVICE_JWT_TTL_SEC = 86400`; `exp = iat + ttlSec` |
| `deploy/xevn-ecosystem/.env.example` | `PORTAL_LOGIN_JWT_TTL_SEC=86400` |

## Unit tests + build (local)

| Command | Result |
|---|---|
| `pnpm test -- src/auth/auth.service.spec.ts src/common/jwt-sign.spec.ts src/auth/auth.controller.spec.ts` (in `apps/api/xbos-api`) | **5/5 PASS** |
| `pnpm build` (in `apps/api/xbos-api`) | **PASS** |

## Pilot verification (2026-06-05)

### Login spot-check

```powershell
node -e "(async()=>{const r=await fetch('https://14-225-217-232.nip.io/api/xbos/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'ceo@xe.vn',password:'Xevn@2026'})});const b=await r.json();const d=b.data??b;const t=d.accessToken??d.access_token;const p=JSON.parse(Buffer.from(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'),'base64').toString());console.log('status',r.status,'expiresInSec',d.expiresInSec,'jwt_delta',p.exp-p.iat);})()"
```

**Output:**

```text
status 201 expiresInSec 86400 jwt_delta 86400
```

### Full HTTPS probe

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-ex-qa-https-01-probe.mjs
```

**Output (excerpt):**

```text
PASS  P-CC-01-login HTTP 201 XBOS-AUTH-200
PASS  P-CC-01-jwt
...
=== L2 checks: 23/23 PASS ===
=== L2.5 journeys: 7/7 PASS ===
```

**Exit code:** **0**

## DevOps note

If pilot regresses to `expiresInSec=43200`, typical cause is **stale xbos-be container** or `PORTAL_LOGIN_JWT_TTL_SEC` override ≠ 86400 on VPS. Remediation:

1. Ensure `PORTAL_LOGIN_JWT_TTL_SEC=86400` in `deploy/xevn-ecosystem/.env`
2. `git pull origin main` on `/opt/xevn-ecosystem`
3. `docker compose --env-file .env up -d --force-recreate xbos-be`

## completion_report

- **Closed:** `P-CC-01-jwt` — login `expiresInSec=86400`, JWT `exp - iat = 86400` on HTTPS pilot; full `tmp-p1-ex-qa-https-01-probe.mjs` **exit 0** (L2 **23/23**, L2.5 **7/7**).
- **No code change:** prior fix in `auth.service.ts` / `jwt-sign.ts` already deployed and active on nip.io.
- **Residual:** None for this work item. If QC sees `43200` again, treat as **deploy drift** — restart/redeploy `xbos-be` per DevOps note above.

## next_owner

`qa`

## next_dispatch_prompt

Run QA for `P1-EX-BE-HTTPS-P-CC-01-JWT-01`: read `docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-20260605.md`; independently run `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs` — confirm **PASS** `P-CC-01-jwt` (`expiresInSec=86400`) and login JWT delta **86400**; attach stdout. If probe exit **0**, hand `PASS_TO_PM` and dispatch **qc** to close GWC **C-JCC03-01** / P-CC-01-jwt row in `PILOT_BUSINESS_FLOW_MATRIX.md`.
