# QA Runtime Evidence — P1-EX-QA-JWT-CLOSE-01

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-JWT-CLOSE-01` |
| from_role | `qa` |
| to_role | `pm` |
| execution_time_utc | `2026-06-05` |
| environment | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` / `Xevn@2026` |
| entry_evidence | `docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-20260605.md` |
| ack_status | **PASS_TO_PM** |

## Exit criteria

| Criterion | Result |
|---|---|
| `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs` exit **0** | **PASS** |
| `P-CC-01-jwt` PASS `expiresInSec=86400` | **PASS** |
| Login JWT `exp-iat=86400` | **PASS** |
| QC GWC **C-JCC03-01** satisfied | **READY FOR QC CLOSURE** |

Matrix: `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` **P-CC-01** · QC GWC **C-JCC03-01** (JWT TTL 24h).

---

## A) Login contract (direct API — independent)

```text
POST https://14-225-217-232.nip.io/api/xbos/auth/login
  body: { email: ceo@xe.vn, password: [redacted] }
  HTTP 201
  expiresInSec=86400
  jwt_delta (exp-iat)=86400
```

Command:

```powershell
node -e "(async()=>{const r=await fetch('https://14-225-217-232.nip.io/api/xbos/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'ceo@xe.vn',password:'Xevn@2026'})});const b=await r.json();const d=b.data??b;const t=d.accessToken??d.access_token;const p=JSON.parse(Buffer.from(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'),'base64').toString());console.log('status',r.status,'expiresInSec',d.expiresInSec,'jwt_delta',p.exp-p.iat);})()"
```

Stdout:

```text
status 201 expiresInSec 86400 jwt_delta 86400
```

---

## B) Full HTTPS probe (independent QA run)

Command:

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-ex-qa-https-01-probe.mjs
```

Stdout:

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

**Exit code:** **0**

---

## C) C-JCC03-01 closure assessment

| Condition | Prior state | QA verdict |
|---|---|---|
| **C-JCC03-01** | GWC open — `P-CC-01-jwt` expects `expiresInSec=86400` | **SATISFIED** — probe `P-CC-01-jwt` **PASS**; login `expiresInSec=86400`; JWT delta **86400**; full probe exit **0** |

Prior QC closures (`p1-ex-qc-https-p-cc-01-jwt-01-20260603.md`, `p1-ex-qc-https-post-deploy-20260603.md`) remain valid; this independent QA retest **confirms** no regression on JWT TTL or HTTPS perimeter.

---

## completion_report

- **Closed:** `P1-EX-QA-JWT-CLOSE-01` — independent QA confirms `P-CC-01-jwt` **PASS** (`expiresInSec=86400`, `jwt_delta=86400`); full `tmp-p1-ex-qa-https-01-probe.mjs` **exit 0** (L2 **23/23**, L2.5 **7/7**).
- **C-JCC03-01:** QA evidence satisfies closure criteria; dispatch **qc** for formal GWC sign-off.
- **Residual:** None for JWT slice. **Phase 1 DONE / PROD not claimed.**

## next_owner

`pm` → `qc`

## next_dispatch_prompt

```
work_item_id: P1-EX-QC-JWT-CLOSE-01
entry_criteria: QA PASS_TO_PM `P1-EX-QA-JWT-CLOSE-01` — evidence `docs/qa/evidence/p1-ex-qa-jwt-close-20260605.md`
exit_criteria: Formal close **C-JCC03-01** in `docs/qa/evidence/qc-https-j-cc-03-01-20260529.md` addendum; issue scoped **GO** for P-CC-01-jwt on nip.io; update bus if condition register still shows OPEN
evidence_path: docs/qa/evidence/p1-ex-qa-jwt-close-20260605.md
ack_status: PASS_TO_PM (QC verdict)
```

## pm_dispatch_hint

`P1-EX-QC-JWT-CLOSE-01` — dispatch **qc** to close GWC **C-JCC03-01** / confirm **P-CC-01-jwt** row; QA independent probe exit **0**, `expiresInSec=86400`, `jwt_delta=86400`.
