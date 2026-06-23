# QA Runtime Evidence — P1-EX-QA-HTTPS-P-CC-01-JWT-01

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-P-CC-01-JWT-01` |
| from_role | `qa` |
| to_role | `pm` |
| execution_time_utc | `2026-06-04` (independent retest after `P1-EX-BE-HTTPS-P-CC-01-JWT-01`) |
| environment | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` / `Xevn@2026` |
| entry_evidence | `docs/ops/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260604.md` |
| ack_status | **PASS_TO_PM** |

## Exit criteria

| Criterion | Result |
|---|---|
| `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs` exit **0** | **PASS** |
| `P-CC-01-jwt` PASS `expiresInSec=86400` | **PASS** |
| Login JWT `exp-iat=86400` | **PASS** |

Matrix: `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` **P-CC-01** · QC GWC **C-JCC03-01** (JWT TTL 24h).

---

## A) Login contract (direct API)

```text
POST https://14-225-217-232.nip.io/api/xbos/auth/login
  body: { email: ceo@xe.vn, password: [redacted] }
  HTTP 201
  expiresInSec=86400
  jwt_delta (exp-iat)=86400
```

Command:

```powershell
node -e "(async()=>{const r=await fetch('https://14-225-217-232.nip.io/api/xbos/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'ceo@xe.vn',password:'Xevn@2026'})});const b=await r.json();const d=b.data??b;const t=d.accessToken;const p=JSON.parse(Buffer.from(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'),'base64').toString());console.log('status',r.status,'expiresInSec',d.expiresInSec,'jwt_delta',p.exp-p.iat);})()"
```

Stdout:

```text
status 201 expiresInSec 86400 jwt_delta 86400
```

---

## B) Full HTTPS probe

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-ex-qa-https-01-probe.mjs
```

**Exit code:** `0`

**Stdout:**

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

---

## completion_report

- **Closed:** `P-CC-01-login` + `P-CC-01-jwt` on HTTPS pilot — `expiresInSec=86400`, JWT delta **86400**.
- **Closed:** Full probe **23/23 L2 + 7/7 L2.5**, exit **0** — no HRM residual blockers for this wave.
- **Residual:** None for `P1-EX-QA-HTTPS-P-CC-01-JWT-01`. PM may close QC GWC **C-JCC03-01** on JWT TTL.

## next_owner

`pm`

## next_dispatch_prompt

work_item_id: P1-EX-QA-HTTPS-P-CC-01-JWT-01 — QA **PASS_TO_PM**. Evidence `docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260604.md`: probe exit **0**, `P-CC-01-jwt` PASS `expiresInSec=86400`, login `jwt_delta=86400`. Dispatch **qc** to re-gate and close GWC **C-JCC03-01** if still open; update `PILOT_BUSINESS_FLOW_MATRIX.md` P-CC-01 row if needed.
