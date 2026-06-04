# QA Runtime Evidence — P1-EX-QA-HTTPS-P-CC-01-JWT-01

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-P-CC-01-JWT-01` |
| from_role | `qa` |
| to_role | `pm` |
| execution_time_utc | `2026-05-29` (QA retest after dev-be deploy) |
| environment | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` / `Xevn@2026` |
| entry_evidence | `docs/ops/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260529.md` (READY_FOR_QA) |
| ack_status | **PASS_TO_PM** |

## Scope

1. **P-CC-01-jwt (L2):** Portal login returns `expiresInSec=86400` (24h) — closes QC GWC condition **C-JCC03-01** / prior probe residual (`43200` vs `86400`).
2. **Regression guard:** Full HTTPS probe script exit **0** (L2 23/23, L2.5 7/7) so QC can accept unconditional GO on probe script where previously blocked by sole `P-CC-01-jwt` fail.

Matrix row: `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` **P-CC-01** — JWT `expiresInSec=86400`.

---

## Runtime checks executed

### A) Login contract (direct API)

```text
POST https://14-225-217-232.nip.io/api/xbos/auth/login
  body: { email: ceo@xe.vn, password: [redacted] }
  HTTP 201
  expiresInSec=86400
```

Verdict: **PASS** (matches matrix + probe gate)

### B) API probe (`scripts/tmp-p1-ex-qa-https-01-probe.mjs`)

Command:

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-ex-qa-https-01-probe.mjs
```

Exit code: **0**

Excerpt (in-scope + summary):

```text
PASS  P-CC-01-login HTTP 201 XBOS-AUTH-200
PASS  P-CC-01-jwt
PASS  J-CC-03 HTTP 200 XBOS-KPI-202 — KPI rollup companyId=holding + x-company-id main
PASS  P-CC-04c HTTP 200 XBOS-KPI-202
=== L2 checks: 23/23 PASS ===
=== L2.5 journeys: 7/7 PASS ===
```

Verdict: **PASS** — `P-CC-01-jwt` closed; no failed checks.

### C) Prior failure (closed)

| Check | Before (QC/QA) | After (this retest) |
|-------|----------------|---------------------|
| `P-CC-01-jwt` | **FAIL** — `expiresInSec=43200` | **PASS** — `expiresInSec=86400` |
| Probe exit | **1** (sole fail) | **0** |

Root cause (dev-be): stale xbos-api on pilot; fixed per `docs/ops/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260529.md`.

---

## completion_report

- **Closed:** `P-CC-01-jwt` on HTTPS pilot — login `expiresInSec=86400`; `tmp-p1-ex-qa-https-01-probe.mjs` **exit 0** (L2 23/23, L2.5 7/7). QC GWC residual **C-JCC03-01** / probe-script blocker for JWT field **cleared**.
- **Residual:** DevOps note from dev-be — VPS partial `pscp` sync vs `git pull`; recommend align `/opt/xevn-ecosystem` on next deploy; optional ops `PORTAL_LOGIN_JWT_TTL_SEC=86400` in server `.env` if override needed. KPI `series=[]` on rollup (data_gap, informational) — not in this work item.

## next_owner

`qc`

## next_dispatch_prompt

QC re-gate `P1-EX-QC-HTTPS-01` / `qc-https-j-cc-03-01-20260529.md`: confirm `docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260529.md` closes **C-JCC03-01** (`P-CC-01-jwt`); re-run or accept QA probe **exit 0** on `https://14-225-217-232.nip.io`; update GWC to **GO** or **GO WITH CONDITIONS** only for remaining out-of-scope items (Production cutover, VPS git sync) — not `P-CC-01-jwt`.

## Handoff packet

```yaml
work_item_id: P1-EX-QA-HTTPS-P-CC-01-JWT-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260529.md
entry_criteria: docs/ops/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260529.md READY_FOR_QA
exit_criteria: PORTAL_DEV_URL probe exit 0; P-CC-01-jwt PASS
summary: P-CC-01-jwt CLOSED on HTTPS pilot — expiresInSec=86400; full probe 23/23 L2 + 7/7 L2.5 exit 0. Ready for QC GWC JWT closure.
pm_dispatch_hint: P1-EX-QC-HTTPS-01 — QC GWC after P-CC-01-jwt PASS
```
