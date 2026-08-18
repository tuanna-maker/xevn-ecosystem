# P1-EX-QA-HTTPS-P-CC-01-JWT-01 — Independent retest (HTTPS pilot JWT TTL)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-BE-HTTPS-P-CC-01-JWT-01` |
| from_role | `qa` |
| to_role | `pm` |
| date | `2026-07-19` |
| pilot_url | `https://14-225-217-232.nip.io` |
| persona | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| ack_status | `PASS_TO_PM` |
| residual_auto_fix | `true` |
| U65 | zero-seed (no `pnpm seed:*`) |

## Entry / prior Dev

| Artifact | Path |
|---|---|
| Dev-BE READY_FOR_QA | `docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260719.md` |
| Probe script | `scripts/tmp-p1-ex-qa-https-01-probe.mjs` (restored by Dev) |
| Matrix | `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` **P-CC-01** — JWT `expiresInSec=86400` |
| Spec | UC-XBOS-AUTH-01 / UF-XBOS-01 — portal login JWT TTL 24h |

**Independent retest** — not rubber-stamp of Dev stdout.

## Command table

| # | Command | Exit | Result |
|---|---|---|---|
| 1 | `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs` | **0** | L2 **23/23** · L2.5 **7/7** · `PASS P-CC-01-jwt` |
| 2 | Login JWT decode assert (`expiresInSec` + `exp-iat`) | **0** | both **86400** · `XBOS-AUTH-200` · HTTP **201** |
| 3 | Auth 5-list guard (contracts/insurance/recruitment/attendance/payroll) | **0** | **5/5** HTTP **200** |
| 4 | Attendance `page_size=10` | **0** | **200** `HRM-ATT-200` |

## A) Full HTTPS probe (primary exit)

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-ex-qa-https-01-probe.mjs
# SHELL_EXIT=0
```

**Stdout excerpt (QA independent run 2026-07-19):**

```text
P1-EX-QA-HTTPS-01 probe — https://14-225-217-232.nip.io

PASS  P-CC-01-login HTTP 201 XBOS-AUTH-200
PASS  P-CC-01-jwt
PASS  P-CC-02 HTTP 200 XBOS-TENANT-200
PASS  P-CC-03 HTTP 200 HRM-EMP-200
…
PASS  J-CC-03 HTTP 200 XBOS-KPI-202 — KPI rollup companyId=holding + x-company-id main
…
PASS  P-CC-07 HTTP 200 HRM-ATT-200
…
PASS  J-HRM-01 … J-HRM-07
PASS  member-kpi-negative HTTP 409 SCOPE_CONTEXT_MISMATCH

=== L2 checks: 23/23 PASS ===
=== L2.5 journeys: 7/7 PASS ===
SHELL_EXIT=0
```

### P-CC-01-jwt contract (probe + explicit decode)

| Assert | Expected | Observed | Verdict |
|---|---|---|---|
| Probe `P-CC-01-jwt` | PASS (`expiresInSec === 86400`) | **PASS** | **PASS** |
| Login HTTP | 201 | **201** | **PASS** |
| Business code | `XBOS-AUTH-200` | **XBOS-AUTH-200** | **PASS** |
| `expiresInSec` | 86400 | **86400** | **PASS** |
| `jwt_delta` (`exp - iat`) | 86400 | **86400** | **PASS** |

```json
{"status":201,"expiresInSec":86400,"jwt_delta":86400,"code":"XBOS-AUTH-200","pass":true}
```

## B) Regression guard — Auth 5/5 + residual-03 attendance

JWT wave must not regress residual-03 Auth 5-list / attendance expectations.

| ID | Endpoint | HTTP | Code | Verdict |
|---|---|---|---|---|
| Contracts | `/api/hrm/contracts-insurance/contracts?company_id=main` | **200** | `HRM-CON-200` | **PASS** |
| Insurance | `/api/hrm/contracts-insurance/insurance?company_id=main` | **200** | `HRM-CON-200` | **PASS** |
| Recruitment | `/api/hrm/recruitment/requisitions?company_id=main&page_size=100` | **200** | `HRM-REC-200` | **PASS** |
| Attendance | `/api/hrm/attendance/records?company_id=main&page_size=10` | **200** | `HRM-ATT-200` | **PASS** |
| Payroll | `/api/hrm/payroll/payslips?company_id=main&page_size=100` | **200** | `HRM-PAY-200` | **PASS** |

- Auth **5/5** — **PASS** (no `HRM-AUTH-001`).
- Probe **P-CC-07** attendance list — **200** `HRM-ATT-200` (aligned with residual-03 attendance API expectation).
- No seed used.

## L2.5 J-* (in-scope via probe)

| J-ID | Verdict |
|---|---|
| J-CC-03 | **PASS** (200 `XBOS-KPI-202`, no 409 holding) |
| J-HRM-01..07 | **PASS** (7/7) |

## Overall QA Verdict

| Field | Value |
|---|---|
| **Verdict** | **PASS** |
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | `qc` |

All exit criteria met: probe **exit 0**, `PASS P-CC-01-jwt` with `expiresInSec=86400` / `jwt_delta=86400`, Auth 5/5 + attendance **not** broken.

**Not claimed:** Phase 1 Program DONE · PROD-READY · Excellence T6 close without QC.

## Residual

None for JWT TTL slice on HTTPS pilot (`P-CC-01-jwt`). Recommend QC close GWC condition `C-JCC03-01` / JWT residual using this evidence + Dev file.

## completion_report

- **Closed:** Independent QA retest `P1-EX-BE-HTTPS-P-CC-01-JWT-01` — probe exit **0**; `P-CC-01-jwt` PASS; `expiresInSec=86400` + `jwt_delta=86400`; L2 23/23; L2.5 7/7.
- **Closed (regression):** Auth 5-list **5/5** 200; attendance `HRM-ATT-200`.
- **Residual:** None for JWT slice — hand to QC for `C-JCC03-01` / JWT GWC close.

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: P1-EX-QC-HTTPS-P-CC-01-JWT-01
from_role: pm
to_role: qc
lane: governance
residual_auto_fix: true
entry_criteria: QA PASS_TO_PM docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260719.md; Dev docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260719.md; probe exit 0; P-CC-01-jwt expiresInSec=86400 jwt_delta=86400; Auth 5/5 + attendance HRM-ATT-200 green
exit_criteria: QC GO or GO WITH CONDITIONS for C-JCC03-01 / JWT GWC residual close only; audit evidence command_table + JWT asserts; do NOT claim Phase1/PROD; publish docs/qa/evidence/p1-ex-qc-https-p-cc-01-jwt-01-YYYYMMDD.md
cấm: seed; rubber-stamp without reading QA+Dev evidence
```

## Handoff Packet

- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260719.md`
- **next_owner:** `qc`
- **pm_dispatch_hint:** `P1-EX-QC-HTTPS-P-CC-01-JWT-01` — close `C-JCC03-01` / JWT GWC
