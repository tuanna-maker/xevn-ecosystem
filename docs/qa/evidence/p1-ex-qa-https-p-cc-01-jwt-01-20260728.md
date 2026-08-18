# P1-EX-QA-HTTPS-P-CC-01-JWT-01 — QA independent retest (2026-07-28)

| Field | Value |
|-------|-------|
| work_item_id | **P1-EX-QA-HTTPS-P-CC-01-JWT-01** |
| from_role | qa |
| to_role | pm |
| ack_status | **PASS_TO_PM** |
| host | `https://14-225-217-232.nip.io` |
| prior_be | `docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260728.md` (READY_FOR_QA — live dual 86400; probe exit 0; freshness; no TTL code change) |
| U65 | zero-seed — login + probe only; **no** `pnpm seed:*` |
| HOLD_DEPLOY | **yes** — NOT Phase1 / PROD / :8088 |
| executed_at | 2026-07-28T16:37+07:00 (QA independent after BE READY_FOR_QA) |
| root | `C:\xevn-ecosystem` |

## 1. Mission

Independent retest of **P-CC-01-jwt** after Dev-BE READY_FOR_QA (claim: live nip.io `expiresInSec=86400` **AND** `jwt_delta=86400`; probe exit 0). QA re-ran probe — BE exit 0 is not accepted alone.

## 2. Spot-check login (QA independent)

```bash
node -e "(async()=>{const r=await fetch('https://14-225-217-232.nip.io/api/xbos/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'ceo@xe.vn',password:'Xevn@2026'})});const b=await r.json();const d=b.data??b;const t=d.accessToken??d.access_token;const p=JSON.parse(Buffer.from(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'),'base64').toString());console.log(JSON.stringify({status:r.status,expiresInSec:d.expiresInSec??d.expires_in_sec,jwt_delta:p.exp-p.iat,code:b.code,pass:(d.expiresInSec??d.expires_in_sec)===86400&&(p.exp-p.iat)===86400}));})()"
```

```json
{"status":201,"expiresInSec":86400,"jwt_delta":86400,"code":"XBOS-AUTH-200","pass":true}
```

| Assert | Expected | Actual | Verdict |
|--------|----------|--------|---------|
| HTTP | 201 | 201 | **PASS** |
| `expiresInSec` | 86400 | 86400 | **PASS** |
| `jwt_delta` (exp−iat) | 86400 | 86400 | **PASS** |
| Dual assert (`expiresInSec` AND `jwt_delta`) | both 86400 | both 86400 | **PASS** |
| code | XBOS-AUTH-200 | XBOS-AUTH-200 | **PASS** |

## 3. Full probe (QA independent)

```bash
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs
```

(PowerShell: `$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'; node scripts/tmp-p1-ex-qa-https-01-probe.mjs`)

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

| Layer | Result |
|-------|--------|
| **P-CC-01-jwt** (`expiresInSec=86400` AND `jwt_delta=86400`) | **PASS** |
| L2 | **23/23 PASS** (suite unchanged vs prior wave) |
| L2.5 J-* | **7/7 PASS** (J-CC-03 + J-HRM-01..07 + J-XBOS-01-tasks in probe set; no delta) |
| Probe exit | **0** |

## Command table

| Command | Exit | Notes |
|---------|------|-------|
| `node -e "(async()=>{…login spot…})()"` | **0** | Spot: `expiresInSec=86400` · `jwt_delta=86400` · `pass=true` |
| `$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'; node scripts/tmp-p1-ex-qa-https-01-probe.mjs` | **0** | Hardened P-CC-01-jwt body+JWT; L2 23/23; L2.5 7/7 |

## L2.5 journey matrix (probe set)

| J-ID | Result | Notes |
|------|--------|-------|
| J-CC-03 | **PASS** | KPI rollup holding + x-company-id main · XBOS-KPI-202 |
| J-HRM-01 | **PASS** | contracts → employee deep |
| J-HRM-02 | **PASS** | list→detail |
| J-HRM-03 | **PASS** | list→detail |
| J-HRM-04 | **PASS** | list→detail |
| J-HRM-05 | **PASS** | list→detail |
| J-HRM-06 | **PASS** | list→detail |
| J-HRM-07 | **PASS** | list→detail |
| J-XBOS-01-tasks | **PASS** | HTTP 200 XBOS-WF-203 |

## 4. Exit criteria map

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Independent probe exit **0** | **PASS** |
| 2 | **PASS P-CC-01-jwt** (`expiresInSec=86400` AND `jwt_delta=86400`) | **PASS** |
| 3 | L2 23/23 · L2.5 7/7 (or document delta) | **PASS** — no suite delta |
| 4 | Evidence this path | **PASS** |
| 5 | ack PASS_TO_PM → next QC GWC JWT residual close | **PASS** |
| 6 | No Phase1/PROD claim · HOLD_DEPLOY · no seed | Affirmed |

## Residual

| ID | Severity | Status | Owner | Note |
|----|----------|--------|-------|------|
| **P-CC-01-jwt** | P2 | **CLOSED** (QA freshness 2026-07-28) | qc | body+JWT dual 86400; independent probe exit 0 |
| Historic VPS 43200 drift | Info | Monitor only | devops | Not present this retest |
| Phase1 / PROD / :8088 | — | **OUT OF SCOPE** | — | HOLD_DEPLOY; do not claim DONE |

- **Closed (this slice):** Live HTTPS **P-CC-01-jwt** — `expiresInSec=86400` **AND** `jwt_delta=86400`; independent probe **exit 0** (L2 23/23 · L2.5 7/7).
- **Next:** QC close GWC JWT residual / freshness stamp for **P-CC-01-jwt**.
- **Out of scope:** OpenAPI, G-BOOT, brand deploy, Phase 1 DONE, PROD-READY, seed, :8088.

---

### Handoff packet

- **work_item_id:** P1-EX-QA-HTTPS-P-CC-01-JWT-01
- **from_role:** qa
- **to_role:** pm
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260728.md`
- **completion_report:** Independent QA retest on `https://14-225-217-232.nip.io` after BE READY_FOR_QA: login 201 `expiresInSec=86400` `jwt_delta=86400` XBOS-AUTH-200; probe **PASS P-CC-01-jwt** (dual assert); L2 23/23; L2.5 7/7; exit **0**. U65 zero-seed. HOLD_DEPLOY. No Phase1/PROD claim.
- **next_owner:** qc
- **next_dispatch_prompt:** (see below)
- **pm_dispatch_hint:** Dispatch QC to close GWC freshness **P-CC-01-jwt** after this QA freshness PASS

```text
work_item_id: P1-EX-QC-HTTPS-P-CC-01-JWT-01
from_role: pm
to_role: qc
lane: governance
residual_auto_fix: true
entry_criteria: QA PASS_TO_PM evidence docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260728.md (dual assert expiresInSec+jwt_delta); Dev-BE docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260728.md; host https://14-225-217-232.nip.io; U65 zero-seed; HOLD_DEPLOY
exit_criteria: Audit QA probe exit 0 + PASS P-CC-01-jwt (expiresInSec=86400 AND jwt_delta=86400); L2 23/23 · L2.5 7/7; close GWC JWT residual P-CC-01-jwt; evidence docs/qa/evidence/p1-ex-qc-https-p-cc-01-jwt-01-20260728.md; GO or GWC scoped; Do NOT claim Phase1/PROD
cấm: seed · mutate DB · deploy :8088 · claim Phase1 DONE / PROD-READY
```
