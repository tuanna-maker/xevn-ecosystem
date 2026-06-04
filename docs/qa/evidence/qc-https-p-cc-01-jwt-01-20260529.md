# QC Gate Decision — P1-EX-QC-HTTPS-P-CC-01-JWT-01

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QC-HTTPS-P-CC-01-JWT-01` |
| from_role | `qc` |
| to_role | `pm` |
| execution_date | `2026-05-29` |
| decision | **GO** (P-CC-01-jwt + full HTTPS probe script) · **GO WITH CONDITIONS** (HTTPS pilot bundle — Production/VPS only) |
| environment | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` / `Xevn@2026` |
| ack_status | **PASS_TO_PM** |

## Scope audited

QC re-gate after QA `P1-EX-QA-HTTPS-P-CC-01-JWT-01` (`PASS_TO_PM`) and Dev-BE `P1-EX-BE-HTTPS-P-CC-01-JWT-01` deploy.

**In scope:** **P-CC-01-jwt** — login `expiresInSec=86400`; `scripts/tmp-p1-ex-qa-https-01-probe.mjs` exit **0** (L2 **23/23**, L2.5 **7/7**); closure of **C-JCC03-01** from `qc-https-j-cc-03-01-20260529.md` and **C-HTTPSQC-04** from `p1-ex-qc-https-01-20260527.md`.

**Out of scope (unchanged carry):** Production cutover, Phase 1 / Excellence DONE, PROD column lift, full browser L2.5 click UAT on HTTPS, VPS git tree parity.

## Evidence consumed

| # | Artifact | Role | Verdict used |
|---|----------|------|--------------|
| 1 | `docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260529.md` | QA | **Authoritative** — `PASS_TO_PM` |
| 2 | `docs/ops/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260529.md` | Dev-BE | Root cause + deploy + dev-be probe exit 0 |
| 3 | `docs/qa/evidence/qc-https-j-cc-03-01-20260529.md` | QC (prior) | **C-JCC03-01** open — **closed by this gate** |
| 4 | `docs/qa/evidence/p1-ex-qc-https-01-20260527.md` | QC bundle | **C-HTTPSQC-04** open — **closed by this gate** |

## QC reproduction (2026-05-29)

| Check | Method | Result |
|-------|--------|--------|
| Login contract | `POST /api/xbos/auth/login` (`ceo@xe.vn`) | **201** · `data.expiresInSec=**86400**` |
| HTTPS probe | `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs` | Exit **0** |
| L2 summary | Probe stdout | **23/23 PASS** incl. **P-CC-01-jwt** |
| L2.5 summary | Probe stdout | **7/7 PASS** |
| J-CC-03 / P-CC-04c | Probe | **200** `XBOS-KPI-202` (rollup scope) |
| Member negative | Probe | **409** `du-lich.ceo@xe.vn` — expected negative |

QC probe excerpt:

```text
PASS  P-CC-01-login HTTP 201 XBOS-AUTH-200
PASS  P-CC-01-jwt
PASS  J-CC-03 HTTP 200 XBOS-KPI-202 — KPI rollup companyId=holding + x-company-id main
PASS  P-CC-04c HTTP 200 XBOS-KPI-202
=== L2 checks: 23/23 PASS ===
=== L2.5 journeys: 7/7 PASS ===
```

QC concurs: **QA runtime is SoT**; QC independent reproduction matches QA on all in-scope checks.

## Gate matrix (P-CC-01-jwt)

| Gate | Expected | Actual (QA + QC repro) | Verdict |
|------|----------|------------------------|---------|
| **P-CC-01-jwt** | `expiresInSec=86400` | Login **86400**; probe **PASS** | **PASS** |
| Prior mismatch | `43200` vs `86400` | Not reproducible post xbos-be deploy | **CLOSED** |
| Full probe script | Exit **0** | Exit **0** (was **1** sole fail) | **PASS** |
| **C-JCC03-01** | JWT probe closure | Satisfied | **CLOSED** |
| **C-HTTPSQC-04** | JWT TTL alignment | Satisfied | **CLOSED** |
| Production / Phase 1 DONE | Out of slice | Not claimed | N/A |

## L2 / L2.5 journey coverage audit (U19)

| Journey / row | Requirement | QA | QC |
|---------------|-------------|-----|-----|
| **P-CC-01** | Login + JWT 24h | **PASS** | **PASS** |
| **J-CC-03** | KPI rollup no **409** | Probe **200** | **PASS** (inherits J-CC-03 gate) |
| **P-CC-04c** | Rollup dependency | Probe **200** | **PASS** |
| **J-HRM-01..07** | L2.5 list→detail (API) | **7/7** | **PASS** — probe only; browser click still deferred per HTTPS-01 bundle |
| Browser L2.5 CC click | Full embed click path | Not this work item | **Deferred** — **C-HTTPSQC-01** |

**NO-GO avoided:** QA did not claim PASS on login field alone without full probe regression (**exit 0**).

## Conditions — closed vs remaining

### Closed by this gate

| ID | Source | Closure |
|----|--------|---------|
| **C-JCC03-01** | `qc-https-j-cc-03-01` | **CLOSED** — `P-CC-01-jwt` **PASS**; probe exit **0** |
| **C-HTTPSQC-04** | `p1-ex-qc-https-01` | **CLOSED** — pilot returns **86400**; probe aligned |
| **P-CC-01-jwt** (residual) | J-CC-03 / HTTPS-01 bundles | **CLOSED** |

### Remaining (GO WITH CONDITIONS — Production / VPS / pilot ops only)

| ID | Condition | Owner | Notes |
|----|-----------|-------|-------|
| **C-JCC03-02** | KPI `series[]` empty (`data_gap`) | dev-be / data | Informational — not scope fail |
| **C-JCC03-03** | Persona `ceo@xe.vn` / `main` only | QA | Member negative tested (409 expected) |
| **C-JCC03-04** | VPS partial `pscp` vs `git pull` | DevOps | Align `/opt/xevn-ecosystem` on next deploy |
| **C-JCC03-05** | Not Production / not Phase 1 DONE | PM/QC | **C-HTTPSQC-05** / **C-EXQC5-03** |
| **C-HTTPSQC-01** | Browser L2.5 click on HTTPS embed | QA + dev-fe | API probe **7/7** ≠ browser click |
| **C-HTTPSQC-02** | Attendance seed for J-HRM-06 detail | devops | List **200**, `total: 0` |
| **C-HTTPSQC-03** | Governed fidelity seed chain | devops | Ephemeral seed risk |
| **C-HTTPSQC-05** | Production GO + `verify:production-env` | DevOps + QC | PROD 🔴 |
| **C-HTTPSQC-06** | Sponsor messaging HTTPS ≠ PROD | PM | Immediate |
| **C-HTTPSQC-07** | TLS-R2 `/hr/` embed | devops | External demo |

Optional ops: set `PORTAL_LOGIN_JWT_TTL_SEC=86400` in server `.env` if override needed (dev-be residual note).

## Residual (post-gate)

| ID | Severity | Status | Note |
|----|----------|--------|------|
| P-CC-01-jwt | P2 | **CLOSED** | Was blocker for probe exit 0 |
| C-JCC03-01 | Condition | **CLOSED** | |
| C-HTTPSQC-04 | Condition | **CLOSED** | |
| VPS-git-sync | P3 | **OPEN** | DevOps — next deploy wave |
| KPI-series-empty | P3 | **OPEN** | `data_gap` |
| Production cutover | P0 program | **OPEN** | Not in HTTPS pilot JWT slice |

## Decision summary

| Tier | Verdict |
|------|---------|
| **P-CC-01-jwt** on HTTPS pilot | **GO** |
| **Full perimeter probe script** (`tmp-p1-ex-qa-https-01-probe.mjs`) | **GO** — exit **0**, L2 **23/23**, L2.5 **7/7** |
| **HTTPS pilot program / Production** | **GO WITH CONDITIONS** — only **C-JCC03-02..05**, **C-HTTPSQC-01..03,05..07**, **C-EXQC5-*** remain |

**Not approved:** Production release, Phase 1 / Excellence DONE, unconditional corporate PROD GO, or “all HTTPS governance closed” (browser + prod gates still open).

## qc-https bundle update (cross-reference)

| Bundle artifact | Update |
|-----------------|--------|
| `qc-https-j-cc-03-01-20260529.md` | Addendum § — **C-JCC03-01 CLOSED** (this gate) |
| `p1-ex-qc-https-01-20260527.md` | Addendum § — **C-HTTPSQC-04 CLOSED**; probe exit **0** as of 2026-05-29 |
| `qc-https-j-hrm-06-01-r6-20260529.md` | Unchanged — J-HRM-06 slice already GWC |

## completion_report

- **closed_scope:**
  - Audited QA + Dev-BE evidence; QC reproduced login **86400** and probe **exit 0**.
  - **GO** for **P-CC-01-jwt** and full HTTPS API probe script on nip.io.
  - Closed **C-JCC03-01** and **C-HTTPSQC-04**; cleared probe-script blocker from J-CC-03 GWC.
- **residual_open:**
  - Production/VPS/ops conditions only (see table); browser L2.5 HTTPS click; KPI `data_gap`; VPS git sync.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: P1-EX-PM-HTTPS-PROBE-PROMOTE
from_role: qc
to_role: pm
ack_status target: DISPATCHED

PM: QC **GO** issued for P-CC-01-jwt + full HTTPS probe exit 0 (docs/qa/evidence/qc-https-p-cc-01-jwt-01-20260529.md). Update PROGRAM_JOURNEY_MAP / PILOT_BUSINESS_FLOW_MATRIX / bus — mark P-CC-01 HTTPS nip.io ✅; close C-JCC03-01 and C-HTTPSQC-04. **Do not** claim Production or Phase 1 DONE. Residual auto-fix (optional): devops align VPS git on next deploy (C-JCC03-04); qa C-HTTPSQC-01 browser L2.5 on nip.io. No further dev-be dispatch for JWT unless regression.
```

## Handoff packet

```yaml
work_item_id: P1-EX-QC-HTTPS-P-CC-01-JWT-01
from_role: qc
to_role: pm
entry_criteria: docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260529.md PASS_TO_PM
exit_criteria: Close C-JCC03-01; update qc-https bundle; GO or GWC for Production/VPS only
evidence_path: docs/qa/evidence/qc-https-p-cc-01-jwt-01-20260529.md
ack_status: PASS_TO_PM
decision_p_cc_01_jwt: GO
decision_https_bundle: GO_WITH_CONDITIONS
conditions_closed:
  - C-JCC03-01
  - C-HTTPSQC-04
```
