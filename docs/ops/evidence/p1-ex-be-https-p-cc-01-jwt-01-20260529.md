# P1-EX-BE-HTTPS-P-CC-01-JWT-01 — Portal login JWT TTL (24h)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-BE-HTTPS-P-CC-01-JWT-01` |
| from_role | `dev-be` |
| to_role | `qa` |
| date | `2026-05-29` |
| pilot_url | `https://14-225-217-232.nip.io` |
| entry | QC GWC J-CC-03 — `P-CC-01-jwt` probe expected `expiresInSec=86400`, pilot returned `43200` |

---

## Root cause

- Repo already used `PORTAL_LOGIN_JWT_TTL_SEC = 86400` in `auth.service.ts`, but **HTTPS pilot xbos-api** was running a **stale build** where `signServiceJwt` default TTL was **12h (43200)** and login did not pass explicit 24h TTL.
- `signServiceJwt` default parameter was `12 * 60 * 60` — any missed second argument regressed probe + JWT `exp`.

---

## Code changes

| File | Change |
|---|---|
| `apps/api/xbos-api/src/auth/auth.service.ts` | `resolvePortalLoginJwtTtlSec()` (+ env `PORTAL_LOGIN_JWT_TTL_SEC`); login uses resolved TTL for sign + `expiresInSec` |
| `apps/api/xbos-api/src/common/jwt-sign.ts` | Default TTL **24h** (`DEFAULT_SERVICE_JWT_TTL_SEC = 86400`) |
| `apps/api/xbos-api/src/common/jwt-sign.spec.ts` | Assert default omitted TTL = 86400 |
| `deploy/xevn-ecosystem/.env.example` | Document `PORTAL_LOGIN_JWT_TTL_SEC=86400` |

---

## Unit tests

```text
apps/api/xbos-api (jest):
  src/auth/auth.service.spec.ts — PASS
  src/common/jwt-sign.spec.ts — PASS (incl. default 24h)
  src/auth/auth.controller.spec.ts — PASS
```

---

## Pilot deploy (xbos-be)

| Step | Result |
|---|---|
| `pscp` sync `auth.service.ts`, `jwt-sign.ts` → `/opt/xevn-ecosystem/...` | **PASS** |
| `docker compose ... up -d --build --force-recreate xbos-be` | **PASS** (`xevn-xbos-be-dev` recreated) |

---

## Verification (HTTPS)

```text
POST https://14-225-217-232.nip.io/api/xbos/auth/login (ceo@xe.vn)
  status=201 expiresInSec=86400  P-CC-01-jwt PASS

PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs
  exit 0
  PASS P-CC-01-login
  PASS P-CC-01-jwt
  L2 checks: 23/23 PASS
  L2.5 journeys: 7/7 PASS
```

---

## Handoff packet

```yaml
work_item_id: P1-EX-BE-HTTPS-P-CC-01-JWT-01
from_role: dev-be
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/ops/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260529.md
entry_criteria: P-CC-01-jwt FAIL (expiresInSec 43200 vs 86400)
exit_criteria: Probe P-CC-01-jwt PASS on HTTPS pilot; JWT login contract 86400
```

## completion_report

- **Closed:** Portal login on HTTPS pilot returns `expiresInSec=86400` with JWT `exp-iat=86400`; full `tmp-p1-ex-qa-https-01-probe.mjs` **exit 0** (incl. `P-CC-01-jwt`, L2 23/23, L2.5 7/7).
- **Residual:** VPS tree still partial-sync (pscp) vs `git pull` — recommend devops align `/opt/xevn-ecosystem` with main on next deploy wave; set `PORTAL_LOGIN_JWT_TTL_SEC=86400` in server `.env` if ops override needed.

## next_owner

`qa`

## next_dispatch_prompt

Run QA retest for `P1-EX-BE-HTTPS-P-CC-01-JWT-01`: `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs` — confirm `P-CC-01-jwt` PASS and attach stdout to `docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260529.md`; if full probe exit 0, promote matrix row P-CC-01 and hand `PASS_TO_PM` for QC GWC closure on HTTPS probe script.
