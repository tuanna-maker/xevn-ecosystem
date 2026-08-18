# P1-EX-QA-HTTPS-P-CC-01-JWT-01 — Independent retest (HTTPS pilot JWT TTL)

| Field | Value |
|-------|-------|
| work_item_id | **P1-EX-QA-HTTPS-P-CC-01-JWT-01** |
| from_role | qa |
| to_role | pm / qc |
| date | **2026-07-22** |
| pilot_url | `https://14-225-217-232.nip.io` |
| persona | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| ack_status | **PASS_TO_PM** |
| U65 | zero-seed — **no** `pnpm seed:*` |
| Phase1 / PROD claim | **NONE** (JWT freshness only) |

## 1. Spec says / BE claims (entry)

| Layer | Statement |
|-------|-----------|
| **spec says** | Matrix **P-CC-01** + portal session BR: login `expiresInSec=86400` (24h); JWT `exp − iat = 86400`. |
| **BE claims** (`docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260722.md`) | Live HTTPS already returns `expiresInSec=86400` / `jwt_delta=86400`; full probe exit 0 (L2 23/23 · L2.5 7/7); TTL code unchanged this wave (LastVerified only). |
| **QA action** | Independent re-run — **not** rubber-stamp of BE stdout. |

## 2. Command table (QA independent)

| # | Command | Exit | Result |
|---|---|---|---|
| 1 | `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs` | **0** | L2 **23/23** · L2.5 **7/7** · `PASS P-CC-01-jwt` |
| 2 | Login JWT decode spot (`expiresInSec` + `exp−iat`) | **0** | both **86400** · `XBOS-AUTH-200` · HTTP **201** |

**Cấm observed:** no seed; no OpenAPI / G-BOOT / G-DEC scope creep.

## 3. Full HTTPS probe (primary)

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-ex-qa-https-01-probe.mjs
# PROBE_EXIT=0
```

**Stdout (QA independent run 2026-07-22 ~19:10 ICT):**

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
PROBE_EXIT=0
```

### Counts

| Layer | Result |
|-------|--------|
| L2 P-CC-* / related | **23/23 PASS** |
| L2.5 J-* (J-HRM-01..07 + J-CC-03 in probe) | **7/7 PASS** |
| Probe exit | **0** |

## 4. Assert PASS P-CC-01-jwt + spot login

| Assert | Expected | Observed | Verdict |
|--------|----------|----------|---------|
| Probe `P-CC-01-jwt` | PASS | **PASS** | **PASS** |
| Login HTTP | 201 | **201** | **PASS** |
| Business code | `XBOS-AUTH-200` | **XBOS-AUTH-200** | **PASS** |
| `expiresInSec` | 86400 | **86400** | **PASS** |
| `jwt_delta` (`exp − iat`) | 86400 | **86400** | **PASS** |

```json
{"status":201,"expiresInSec":86400,"jwt_delta":86400,"code":"XBOS-AUTH-200","pass":true}
```

## 5. Residual / QC note

| Residual | QA recommendation |
|----------|-------------------|
| QC GWC **P-CC-01-jwt** / `expiresInSec` freshness | **Eligible to CLOSE** — independent probe + spot login both **86400** on `https://14-225-217-232.nip.io` |
| **C-JCC03-01** freshness (if still open on same probe wave) | Probe line `PASS J-CC-03` present; QC may sample-close if that residual was JWT/probe-linked |
| Phase 1 / PROD | **Not claimed** |

**Out of scope this Task:** OpenAPI · G-BOOT · G-DEC · seed.

## 6. Completion / handoff

- **Closed:** Independent verify `P-CC-01-jwt` on HTTPS pilot — `expiresInSec=86400`, `jwt_delta=86400`; full probe **exit 0**.
- **Residual for PM/QC:** Close GWC JWT residual if still open; optional commit of restored probe script (governance, not QA gate).
- **Do not** claim Phase 1 / PROD-READY.

---

### Handoff packet

- **work_item_id:** P1-EX-QA-HTTPS-P-CC-01-JWT-01
- **from_role:** qa
- **to_role:** qc (preferred) / pm
- **entry_criteria:** Independent probe exit 0 + JWT assert 86400 evidence below
- **exit_criteria:** QC close GWC residual **P-CC-01-jwt** (and C-JCC03-01 if still open) or PM intake residual close note; no Phase1/PROD claim
- **evidence_path:** `docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260722.md`
- **needed_by:** same-day QC sample / residual close
- **ack_status:** **PASS_TO_PM**
- **completion_report:** Independent HTTPS probe exit 0 (L2 23/23 · L2.5 7/7); `PASS P-CC-01-jwt`; spot login `expiresInSec=86400` + `jwt_delta=86400`. BE claim confirmed. QC GWC P-CC-01-jwt eligible to close. No Phase1/PROD claim. U65 zero-seed observed.
- **next_owner:** qc
- **next_dispatch_prompt:** (see below)

```text
work_item_id: P1-EX-QC-HTTPS-P-CC-01-JWT-01
role: qc
entry_criteria: QA evidence docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260722.md; BE docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260722.md; U65 zero-seed
exit_criteria: Sample-verify or accept QA probe log: PASS P-CC-01-jwt + expiresInSec/jwt_delta=86400; close GWC residual P-CC-01-jwt (and C-JCC03-01 if JWT/probe-linked still open); verdict GO WITH CONDITIONS or residual-close note; DO NOT claim Phase1/PROD; evidence docs/qa/evidence/p1-ex-qc-https-p-cc-01-jwt-01-20260722.md
cấm: seed; scope creep OpenAPI/G-BOOT/G-DEC
```
