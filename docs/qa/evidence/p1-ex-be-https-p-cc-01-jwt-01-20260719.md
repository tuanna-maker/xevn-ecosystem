# P1-EX-BE-HTTPS-P-CC-01-JWT-01 — Portal login JWT TTL (24h)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-BE-HTTPS-P-CC-01-JWT-01` |
| from_role | `dev-be` |
| to_role | `qa` |
| date | `2026-07-19` |
| pilot_url | `https://14-225-217-232.nip.io` |
| ack_status | `READY_FOR_QA` |
| residual_auto_fix | `true` |

## spec_read_ack

| Artifact | Cite |
|---|---|
| SRS / UC | `docs/ecosystem/BRD_TONG_HOP_HE_SINH_THAI_XEVN.md` **UC-XBOS-AUTH-01** (login); **UC-XBOS-AUTH-02** (session) |
| Matrix | `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` **P-CC-01** — JWT `expiresInSec=86400` |
| UF | `docs/qa/USER_FLOW_SRS_TRACE_DELTA.md` **UF-XBOS-01** — `POST /api/xbos/auth/login` → **201** `expiresInSec` |
| TechSpec | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` — Portal `POST /api/xbos/auth/login` JWT access |
| OpenAPI | `docs/api/openapi/xbos-api.yaml` `/auth/login` |
| ADR / prior | Prior BE fix `docs/ops/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260529.md` / `docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260603.md` |

**spec says:** Portal login returns `expiresInSec=86400` (24h); JWT `exp - iat` = 86400.  
**code does:** `resolvePortalLoginJwtTtlSec()` default `24*60*60`; login + `selectMembership` pass TTL into `signServiceJwt` and response `expiresInSec`.

## Root cause (2026-07-19)

| Layer | Finding |
|---|---|
| **PRODUCT (pilot)** | Already correct — live login `expiresInSec=86400`, `jwt_delta=86400` |
| **PROBE CONTRACT** | `scripts/tmp-p1-ex-qa-https-01-probe.mjs` was **deleted** from tree (last present `570b117`; removed in `55cce93`) → QA/QC could not re-run gate script |
| **Not** | Auth 5/5 / residual-03 attendance — left untouched |

## Changes

| Path | Action |
|---|---|
| `scripts/tmp-p1-ex-qa-https-01-probe.mjs` | **Restored** from `570b117` (`git checkout 570b117 -- …`) |
| `apps/api/xbos-api/src/auth/auth.service.ts` | `@CODE-MEMORY` for JWT TTL contract (no TTL logic change) |
| `apps/api/xbos-api/src/auth/auth.service.spec.ts` | `selectMembership` asserts `expiresInSec` + JWT delta **86400** |

## Verification

### A) Live login contract

```powershell
node -e "(async()=>{const r=await fetch('https://14-225-217-232.nip.io/api/xbos/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'ceo@xe.vn',password:'Xevn@2026'})});const b=await r.json();const d=b.data??b;const t=d.accessToken;const p=JSON.parse(Buffer.from(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'),'base64').toString());console.log(JSON.stringify({status:r.status,expiresInSec:d.expiresInSec,jwt_delta:p.exp-p.iat,code:b.code}));})()"
```

**Output (2026-07-19):**

```text
{"status":201,"expiresInSec":86400,"jwt_delta":86400,"code":"XBOS-AUTH-200"}
```

### B) Full HTTPS probe — **exit 0**

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-ex-qa-https-01-probe.mjs
# PROBE_EXIT=0
```

**Stdout excerpt:**

```text
PASS  P-CC-01-login HTTP 201 XBOS-AUTH-200
PASS  P-CC-01-jwt
…
=== L2 checks: 23/23 PASS ===
=== L2.5 journeys: 7/7 PASS ===
PROBE_EXIT=0
```

### C) Unit tests

```text
cd apps/api/xbos-api
pnpm exec jest --testPathPatterns="auth\.(service|controller)\.spec|jwt-sign\.spec" --no-coverage
→ 13/13 PASS (pre-selectMembership TTL assert); auth.service.spec re-run after assert
```

## Regression guard

- Auth 5-endpoint / residual-03 attendance **not** modified.
- Probe L2 includes P-CC-05..08 + J-HRM-01..07 — all **PASS** on this run (no JWT-only carve-out needed).

## completion_report

- **Closed:** `P-CC-01-jwt` on HTTPS pilot — `expiresInSec=86400` / JWT delta **86400**; restored `tmp-p1-ex-qa-https-01-probe.mjs`; full probe **exit 0** (L2 **23/23**, L2.5 **7/7**).
- **Closed:** CODE-MEMORY + selectMembership TTL regression assert on auth service.
- **Residual:** None for JWT slice. Deploy VPS already green; no recreate required this wave.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: P1-EX-BE-HTTPS-P-CC-01-JWT-01
from_role: pm
to_role: qa
entry_criteria: dev-be READY_FOR_QA; evidence docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260719.md; U65 zero-seed
exit_criteria: Independent re-run PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs exit 0; assert PASS P-CC-01-jwt (expiresInSec=86400); do not break Auth 5/5 / residual-03 attendance; evidence append or new QA file; PASS_TO_PM for QC GWC JWT residual closure
cấm: seed; Phase1/PROD claim
```

## Handoff Packet

- **ack_status:** `READY_FOR_QA`
- **evidence_path:** `docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260719.md`
- **next_owner:** `qa`
