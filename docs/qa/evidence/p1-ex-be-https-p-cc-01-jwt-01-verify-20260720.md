# P1-EX-BE-HTTPS-P-CC-01-JWT-01 — VERIFY (2026-07-20)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-BE-HTTPS-P-CC-01-JWT-01` |
| from_role | `dev-be` |
| to_role | `pm` |
| change_mode | `VERIFY` |
| date | `2026-07-20` |
| pilot_url | `https://14-225-217-232.nip.io` |
| ack_status | `PASS_TO_PM` |
| residual_auto_fix | `true` |
| U65 | zero-seed (no seed) |

## Context

Hook forced re-dispatch after QC **GO** 2026-07-19 (`docs/qa/evidence/p1-ex-qc-https-p-cc-01-jwt-01-20260719.md`). Disk cleanup may have deleted `scripts/tmp-p1-ex-qa-https-01-probe.mjs`.

## spec_read_ack

| Artifact | Cite |
|---|---|
| Matrix | `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` **P-CC-01** — JWT `expiresInSec=86400` |
| Prior QC GO | `docs/qa/evidence/p1-ex-qc-https-p-cc-01-jwt-01-20260719.md` — **C-JCC03-01 CLOSED** |
| Prior BE | `docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260719.md` |
| Code | `apps/api/xbos-api/src/auth/auth.service.ts` — `PORTAL_LOGIN_JWT_TTL_DEFAULT_SEC = 24*60*60` |

**spec says:** Portal login `expiresInSec=86400`; JWT `exp-iat=86400`.  
**code does:** Already correct — no TTL rewrite this wave.

## Findings

| Layer | Result |
|---|---|
| Auth TTL config | **GREEN** — `resolvePortalLoginJwtTtlSec()` default **86400**; no code change |
| Live HTTPS login | **PASS** — `expiresInSec=86400`, `jwt_delta=86400` |
| Probe script | **MISSING** on disk → **restored** from `570b117` (same as 2026-07-19) |
| Full probe | **exit 0** — L2 **23/23**, L2.5 **7/7**, `PASS P-CC-01-jwt` |
| Unit tests | **13/13 PASS** (`auth.service` / `auth.controller` / `jwt-sign`) |

## Changes this wave

| Path | Action |
|---|---|
| `scripts/tmp-p1-ex-qa-https-01-probe.mjs` | Restored via `git checkout 570b117 -- …` |
| `apps/api/xbos-api/src/auth/**` | **No change** (already 86400) |

## Verification

### A) Live login contract (nip.io)

```powershell
node -e "(async()=>{const r=await fetch('https://14-225-217-232.nip.io/api/xbos/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'ceo@xe.vn',password:'Xevn@2026'})});const b=await r.json();const d=b.data??b;const t=d.accessToken;const p=JSON.parse(Buffer.from(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'),'base64').toString());console.log(JSON.stringify({status:r.status,expiresInSec:d.expiresInSec,jwt_delta:p.exp-p.iat,code:b.code,pass:d.expiresInSec===86400&&(p.exp-p.iat)===86400}));})()"
```

**Output (2026-07-20):**

```text
{"status":201,"expiresInSec":86400,"jwt_delta":86400,"code":"XBOS-AUTH-200","pass":true}
```

### B) Full HTTPS probe — exit 0

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-ex-qa-https-01-probe.mjs
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
→ Test Suites: 3 passed; Tests: 13 passed
```

## Regression / out of scope

- Auth 5/5 / residual-03 attendance — not modified.
- F3–F6 / REC green — not reopened.
- Phase 1 / PROD — **not claimed**.

## completion_report

- **Closed:** VERIFY freshness — login + JWT TTL still **86400** on nip.io; probe script restored; probe **exit 0** (L2 23/23 · L2.5 7/7 · `PASS P-CC-01-jwt`); jest auth **13/13**.
- **Closed:** Confirmed no product TTL rewrite needed (already green).
- **Residual:** Keep `scripts/tmp-p1-ex-qa-https-01-probe.mjs` in tree (or document as durable probe path) so disk cleanup does not re-delete; standing **NOT Phase 1 DONE / NOT PROD-READY**.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: P1-EX-BE-HTTPS-P-CC-01-JWT-01
from_role: dev-be
to_role: pm
ack_status: PASS_TO_PM
change_mode: VERIFY

PM: Dev-BE VERIFY 2026-07-20 — JWT still green (expiresInSec=86400 / jwt_delta=86400 on https://14-225-217-232.nip.io). Probe restored from 570b117; node scripts/tmp-p1-ex-qa-https-01-probe.mjs exit 0. Evidence: docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-verify-20260720.md. No auth code change. Prior QC GO 2026-07-19 remains valid freshness. Optional: commit restored probe so cleanup cannot delete again. Do NOT claim Phase1/PROD. Continue residual_auto_fix from pm:idle:check.
```

## Handoff Packet

```yaml
work_item_id: P1-EX-BE-HTTPS-P-CC-01-JWT-01
from_role: dev-be
to_role: pm
ack_status: PASS_TO_PM
change_mode: VERIFY
evidence_path: docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-verify-20260720.md
pilot_url: https://14-225-217-232.nip.io
jwt:
  expiresInSec: 86400
  jwt_delta: 86400
probe_exit: 0
auth_code_changed: false
probe_restored: true
forbidden_claims:
  - Phase 1 DONE
  - PROD-READY
next_owner: pm
```
