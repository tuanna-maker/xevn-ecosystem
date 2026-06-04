# QA Runtime Evidence — P1-EX-QA-HTTPS-P-CC-01-JWT-01

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-P-CC-01-JWT-01` |
| from_role | `qa` |
| to_role | `pm` |
| execution_time_utc | `2026-06-03` (independent retest after `P1-EX-BE-HTTPS-P-CC-01-JWT-01`) |
| environment | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` / `Xevn@2026` |
| entry_evidence | `docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260603.md` (READY_FOR_QA) |
| ack_status | **PASS_TO_PM** |

## Scope (JWT slice only)

1. **P-CC-01-login (L2):** HTTPS pilot login **201** `XBOS-AUTH-200`.
2. **P-CC-01-jwt (L2):** `expiresInSec=86400` and JWT payload `exp-iat=86400` — closes QC GWC **C-JCC03-01** (scoped JWT only).
3. **Out of scope (residuals, do not block JWT):** Probe exit **1** from HRM L2/L2.5 rows — separate wave.

Matrix: `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` **P-CC-01**.

---

## Runtime checks executed

### A) Login contract (direct API)

```text
POST https://14-225-217-232.nip.io/api/xbos/auth/login
  body: { email: ceo@xe.vn, password: [redacted] }
  HTTP 201
  expiresInSec=86400
  jwt_delta (exp-iat)=86400
```

Verdict: **PASS**

### B) API probe (`scripts/tmp-p1-ex-qa-https-01-probe.mjs`)

Command:

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-ex-qa-https-01-probe.mjs
```

Exit code: **1** (HRM residuals; JWT slice **PASS**)

Full stdout:

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
FAIL  P-CC-05 HTTP 404 HRM-DATA-404
FAIL  P-CC-06 HTTP 400 HRM-VAL-001
FAIL  P-CC-07 HTTP 400 HRM-VAL-001
FAIL  P-CC-08 HTTP 400 HRM-VAL-001
PASS  P-CC-09 HTTP 200 XBOS-CAT-212
FAIL  J-HRM-01
FAIL  J-HRM-02
PASS  J-HRM-03
FAIL  J-HRM-04
FAIL  J-HRM-05
FAIL  J-HRM-06
FAIL  J-HRM-07
PASS  J-XBOS-01-tasks HTTP 200 XBOS-WF-203
PASS  member-kpi-negative HTTP 409 SCOPE_CONTEXT_MISMATCH — du-lich.ceo@xe.vn — expect 403/409 on group rollup

=== L2 checks: 13/23 PASS ===
=== L2.5 journeys: 1/7 PASS ===
Failed checks: P-CC-05, P-CC-06, P-CC-07, P-CC-08, J-HRM-01, J-HRM-02, J-HRM-04, J-HRM-05, J-HRM-06, J-HRM-07
Failed journeys: J-HRM-01, J-HRM-02, J-HRM-04, J-HRM-05, J-HRM-06, J-HRM-07
```

| Row | Verdict | Notes |
|-----|---------|-------|
| `P-CC-01-login` | **PASS** | In-scope |
| `P-CC-01-jwt` | **PASS** | In-scope — **C-JCC03-01** |
| `J-CC-03` / `P-CC-04c` | **PASS** | Collateral KPI rollup (not JWT blocker) |
| `P-CC-05`..`08`, `J-HRM-01/02/04/05/06/07` | **FAIL** | **Residual** — HRM pilot wave; do not block JWT QC |

### C) Prior failure (closed for JWT slice)

| Check | Before (QC GWC) | After (this retest) |
|-------|-----------------|---------------------|
| `P-CC-01-jwt` | **FAIL** — `expiresInSec=43200` | **PASS** — `expiresInSec=86400` |
| JWT `exp-iat` | mismatch | **86400** |

Root cause (dev-be): stale xbos-api on pilot; deploy per `docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260603.md`.

---

## completion_report

- **Closed:** `P-CC-01-login` + `P-CC-01-jwt` on HTTPS pilot — independent QA confirms **86400** via direct login and probe rows; **C-JCC03-01** ready for QC **GO (scoped JWT only)**.
- **Residual (separate defects):** Full probe exit **1** — `P-CC-05` (404), `P-CC-06/07/08` (400 `HRM-VAL-001`), `J-HRM-01/02/04/05/06/07` FAIL; L2 **13/23**, L2.5 **1/7**. Dispatch HRM/QA wave; VPS `git pull` full sync per dev-be note.

## next_owner

`qc`

## next_dispatch_prompt

QC scoped re-gate for **C-JCC03-01**: read `docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260603.md` and `docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260603.md` — confirm **PASS** `P-CC-01-jwt` (`expiresInSec=86400`, `jwt_delta=86400`) on `https://14-225-217-232.nip.io`; mark **C-JCC03-01 CLOSED** with **GO (JWT slice only)**. Do **not** require full `tmp-p1-ex-qa-https-01-probe.mjs` exit 0 for this condition — probe exit **1** is accepted with documented HRM residuals (`P-CC-05`..`08`, `J-HRM-*`). File GWC for remaining HRM/Production items only.

## Handoff packet

```yaml
work_item_id: P1-EX-QA-HTTPS-P-CC-01-JWT-01
from_role: qa
to_role: pm
entry_criteria: dev-be READY_FOR_QA on P1-EX-BE-HTTPS-P-CC-01-JWT-01
exit_criteria: PASS P-CC-01-jwt + P-CC-01-login; evidence attached
evidence_path: docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260603.md
ack_status: PASS_TO_PM
pm_dispatch_hint: P1-EX-QC-HTTPS-JWT — qc close C-JCC03-01 scoped GO
```
