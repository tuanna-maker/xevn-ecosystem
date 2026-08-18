# P1-EX-BE-HTTPS-P-CC-01-JWT-01 — Dev-BE (2026-07-27)

| Field | Value |
|-------|-------|
| work_item_id | **P1-EX-BE-HTTPS-P-CC-01-JWT-01** |
| from_role | dev-be |
| to_role | qa |
| ack_status | **READY_FOR_QA** |
| host | `https://14-225-217-232.nip.io` |
| change_mode | **FIX** freshness (no TTL math / no VPS recreate) |
| U65 | zero-seed — login + probe only |
| HOLD_DEPLOY | **yes** — NOT Phase1 / PROD / :8088 |

## 1. Entry / residual

PM `DISPATCHED` 2026-07-27 — QC GWC residual **P-CC-01-jwt** (probe `expiresInSec`). Mandate: root-cause so probe PASS; re-run `tmp-p1-ex-qa-https-01-probe` → **exit 0**.

## 2. Root-cause (spec says / code does)

| Layer | Statement |
|-------|-----------|
| **spec says** | Matrix **P-CC-01** + BR portal session: login returns `expiresInSec=86400` (24h); JWT `exp − iat = 86400`. |
| **code does** | `resolvePortalLoginJwtTtlSec()` default `PORTAL_LOGIN_JWT_TTL_DEFAULT_SEC = 24*60*60`; `login` + `selectMembership` pass TTL into `signServiceJwt(..., expiresInSec)` and response `expiresInSec`. Probe asserts **both** body TTL and JWT delta. |
| **historic fail class** | Stale VPS auth returning `43200` (12h) vs expect `86400`. |
| **this wave (2026-07-27)** | **No product TTL bug** on live HTTPS — login already **86400** / `jwt_delta` **86400**. No VPS recreate / TTL math change required. |

**Fix applied this wave (minimal):**

1. Freshness verify live contract (spot login + full probe dual assert).
2. `@CODE-MEMORY-CHANGE` on `auth.service.ts` — LastVerified 2026-07-27.
3. Evidence + READY_FOR_QA handoff.

**No** change to TTL default, OpenAPI, FE, seed, or deploy (:8088 HOLD).

## 3. Live login spot-check

```bash
node -e "(async()=>{const r=await fetch('https://14-225-217-232.nip.io/api/xbos/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'ceo@xe.vn',password:'Xevn@2026'})});const b=await r.json();const d=b.data??b;const t=d.accessToken??d.access_token;const p=JSON.parse(Buffer.from(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'),'base64').toString());console.log(JSON.stringify({status:r.status,expiresInSec:d.expiresInSec??d.expires_in_sec,jwt_delta:p.exp-p.iat,code:b.code,pass:(d.expiresInSec??d.expires_in_sec)===86400&&(p.exp-p.iat)===86400}));})()"
```

```json
{"status":201,"expiresInSec":86400,"jwt_delta":86400,"code":"XBOS-AUTH-200","pass":true}
```

## 4. Full probe — exit 0

```bash
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs
```

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
EXIT=0
```

**EXIT code:** `0`

## 5. Unit tests

```bash
pnpm --filter xbos-api exec jest src/auth/auth.service.spec.ts src/common/jwt-sign.spec.ts --forceExit
```

→ **2 suites / 10 tests passed**, exit **0** (`expiresInSec` / JWT delta **86400**).

## 6. Exit checklist

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Root-cause so `expiresInSec` (+ jwt_delta) PASS | **PASS** — product already 86400/86400; historic class was stale VPS 43200 |
| 2 | `tmp-p1-ex-qa-https-01-probe` exit 0 | **PASS** — EXIT=0 · L2 23/23 · L2.5 7/7 |
| 3 | Evidence path | **this file** |
| 4 | READY_FOR_QA | **yes** |
| 5 | HOLD_DEPLOY · no seed · not Phase1/PROD | **held** |

## 7. Residual

- **Closed (this slice):** P-CC-01-jwt freshness on HTTPS pilot — body + JWT claim **86400**; probe exit **0**.
- **Out of scope:** Phase1 DONE · PROD · :8088 deploy · seed.
- **Next:** QA independent retest same probe URL.

## 8. Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260727.md`

### spec_read_ack

- srs / BR: PILOT matrix **P-CC-01** / portal session TTL 24h (`expiresInSec=86400`)
- tech_spec: `apps/api/xbos-api/src/auth/auth.service.ts` + `jwt-sign.ts` · `PORTAL_LOGIN_JWT_TTL_SEC`
- sponsor_confirm: wave PM DISPATCHED 2026-07-27 · HOLD_DEPLOY

### next_dispatch_prompt

```text
work_item_id: P1-EX-QA-HTTPS-P-CC-01-JWT-01
role: qa
entry_criteria: Dev-BE READY_FOR_QA; evidence docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260727.md
exit_criteria: Independent PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs exit 0; assert PASS P-CC-01-jwt expiresInSec=86400 + jwt_delta=86400; evidence docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260727.md; PASS_TO_PM for QC GWC JWT residual close if open
cấm: seed · Phase1/PROD claim · deploy :8088
U65: zero-seed browser/API login path only
```
