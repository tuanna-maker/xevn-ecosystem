# P1-EX-BE-HTTPS-P-CC-01-JWT-01 — Dev-BE (2026-07-22)

| Field | Value |
|-------|-------|
| work_item_id | **P1-EX-BE-HTTPS-P-CC-01-JWT-01** |
| from_role | dev-be |
| to_role | qa |
| ack_status | **READY_FOR_QA** |
| host | `https://14-225-217-232.nip.io` |
| U65 | zero-seed — login + probe only |

## 1. Entry / residual

QC GWC residual **P-CC-01-jwt** / `expiresInSec` (historic class: pilot returned `43200` vs probe expect `86400`). Re-verify production contract + full `tmp-p1-ex-qa-https-01-probe` **exit 0**.

## 2. Root-cause (spec says / code does)

| Layer | Statement |
|-------|-----------|
| **spec says** | Matrix **P-CC-01** + BR portal session: login returns `expiresInSec=86400` (24h); JWT `exp - iat = 86400`. |
| **code does** | `resolvePortalLoginJwtTtlSec()` default `PORTAL_LOGIN_JWT_TTL_DEFAULT_SEC = 24*60*60`; `login` + `selectMembership` pass TTL into `signServiceJwt(..., expiresInSec)` and response `expiresInSec`. |
| **probe does** | `record('P-CC-01-jwt', (login.data?.expiresInSec ?? …) === 86400, …)` in `scripts/tmp-p1-ex-qa-https-01-probe.mjs`. |
| **this wave** | **No product TTL bug** on live HTTPS — login already **86400** / `jwt_delta` **86400**. Prior failure class was stale VPS image (`43200`) or missing probe script; probe present in working tree (restored prior wave, still uncommitted `A`). |

**Fix applied this wave (minimal):** freshness verify only — update `@CODE-MEMORY` `LastVerified` → 2026-07-22 on `auth.service.ts`. **No** change to TTL math, OpenAPI, or FE. **No** seed.

## 3. Live login spot-check

```bash
node -e "(async()=>{const r=await fetch('https://14-225-217-232.nip.io/api/xbos/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'ceo@xe.vn',password:'Xevn@2026'})});const b=await r.json();const d=b.data??b;const t=d.accessToken;const p=JSON.parse(Buffer.from(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'),'base64').toString());console.log(JSON.stringify({status:r.status,expiresInSec:d.expiresInSec,jwt_delta:p.exp-p.iat,code:b.code,pass:d.expiresInSec===86400&&(p.exp-p.iat)===86400}));})()"
```

```json
{"status":201,"expiresInSec":86400,"jwt_delta":86400,"code":"XBOS-AUTH-200","pass":true}
```

## 4. Full probe — exit 0 (last 10+ lines)

```bash
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs
```

```text
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

Also confirmed earlier lines: `PASS P-CC-01-login` · `PASS P-CC-01-jwt`.

## 5. Unit regression

```bash
pnpm --filter xbos-api exec jest src/auth/auth.service.spec.ts --no-coverage
```

→ **8/8 passed**, exit **0** (includes login + `selectMembership` `expiresInSec` / JWT delta **86400**).

## 6. Files touched

| Path | Change |
|------|--------|
| `apps/api/xbos-api/src/auth/auth.service.ts` | `@CODE-MEMORY` LastVerified **2026-07-22** only (TTL logic unchanged) |
| `scripts/tmp-p1-ex-qa-https-01-probe.mjs` | Present (working tree; was restored prior — needed for probe) |
| `docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260722.md` | This evidence |

## 7. Completion / residual

- **Closed:** `P-CC-01-jwt` freshness on HTTPS pilot — `expiresInSec=86400`, `jwt_delta=86400`; full probe **exit 0** (L2 23/23 · L2.5 7/7).
- **Residual:** Optional commit of restored probe script so cleanup cannot delete again (sponsor/PM — not this Task). Do **not** claim Phase 1 / PROD.
- **Out of scope:** G-BOOT / G-DEC / OpenAPI.

---

### Handoff packet

- **work_item_id:** P1-EX-BE-HTTPS-P-CC-01-JWT-01
- **from_role:** dev-be
- **to_role:** qa
- **entry_criteria:** Evidence below; live JWT 86400; probe script at `scripts/tmp-p1-ex-qa-https-01-probe.mjs`
- **exit_criteria:** Independent re-run probe exit 0; assert `PASS P-CC-01-jwt`; `PASS_TO_PM` for QC GWC JWT residual close if still open
- **evidence_path:** `docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260722.md`
- **needed_by:** same-day QA re-probe
- **ack_status:** **READY_FOR_QA**
- **completion_report:** Live HTTPS login + JWT TTL already match production contract (`86400`); probe exit 0 (23/23 + 7/7); jest auth 8/8; no TTL code change this wave (LastVerified only). Residual: optional commit of probe script.
- **next_owner:** qa
- **next_dispatch_prompt:** (see below)

```text
work_item_id: P1-EX-QA-HTTPS-P-CC-01-JWT-01
role: qa
entry_criteria: Dev-BE evidence docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260722.md; U65 zero-seed; no pnpm seed:*
exit_criteria: Independent PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs exit 0; assert PASS P-CC-01-jwt (expiresInSec=86400); spot login jwt_delta=86400; evidence docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260722.md; ack PASS_TO_PM for QC GWC P-CC-01-jwt / C-JCC03-01 freshness close if still open. Do NOT claim Phase1/PROD.
cấm: seed; scope creep OpenAPI/G-BOOT
```
