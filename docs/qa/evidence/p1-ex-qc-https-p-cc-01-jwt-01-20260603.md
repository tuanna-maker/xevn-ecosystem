# QC Gate Decision — P1-EX-QC-HTTPS-P-CC-01-JWT-01 (2026-06-03)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QC-HTTPS-P-CC-01-JWT-01` |
| from_role | `qc` |
| to_role | `pm` |
| execution_date | `2026-06-03` |
| decision | **GO** — scoped **P-CC-01-jwt** only (`expiresInSec=86400`) |
| environment | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` / `Xevn@2026` |
| ack_status | **PASS_TO_PM** |

## Scope audited

QC re-gate after QA `P1-EX-QA-HTTPS-P-CC-01-JWT-01` (`PASS_TO_PM`) and Dev-BE `P1-EX-BE-HTTPS-P-CC-01-JWT-01` (`READY_FOR_QA` → QA PASS).

**In scope:** **P-CC-01-jwt** — login `expiresInSec=86400`; JWT payload `exp-iat=86400`; closure of **C-JCC03-01** from `docs/qa/evidence/qc-https-j-cc-03-01-20260529.md`.

**Explicitly out of scope (must not block this GO):** Full `scripts/tmp-p1-ex-qa-https-01-probe.mjs` exit **0**; `P-CC-05`..`P-CC-08`; `J-HRM-01/02/04/05/06/07`; Production cutover; Phase 1 / Excellence DONE.

## Evidence consumed

| # | Artifact | Role | Verdict used |
|---|----------|------|--------------|
| 1 | `docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260603.md` | QA | **Authoritative** — `PASS_TO_PM` |
| 2 | `docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260603.md` | Dev-BE | Root cause (stale pilot xbos-api) + deploy + unit tests **5/5** |
| 3 | `docs/qa/evidence/qc-https-j-cc-03-01-20260529.md` | QC (prior) | **C-JCC03-01** OPEN — **closed by this gate** |
| 4 | `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` | Matrix | P-CC-01 login + JWT rows |

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260603.md
```

| Result | Detail |
|--------|--------|
| Exit **1** | **2/8** cosmetic checks: missing `pnpm run` command table pattern; no `## Residual` heading (residuals documented in `completion_report`) |
| QC adjudication | **Accepted for scoped JWT gate** — substantive runtime evidence present (login contract + probe rows + classification). Process debt: QA should add `## Residual` + command table on next pack. **Not** product NO-GO for P-CC-01-jwt. |

## Classification (ENV vs PRODUCT)

| Signal | Class | JWT gate impact |
|--------|-------|-----------------|
| `P-CC-01-jwt` **PASS** `expiresInSec=86400` | **PRODUCT — CLOSED** | Satisfies **C-JCC03-01** |
| `P-CC-05` HTTP **404** `HRM-DATA-404` | **PRODUCT — residual** | Out of slice; separate HRM wave |
| `P-CC-06/07/08` HTTP **400** `HRM-VAL-001` | **PRODUCT — residual** | Out of slice; **do not NO-GO JWT** |
| `J-HRM-*` L2.5 FAIL (6/7 journeys) | **PRODUCT — residual** | Out of slice; separate QA dispatch |
| Full probe exit **1** | **Bounded residual** | **Accepted** per PM scoped dispatch — not a JWT blocker |

## QC reproduction (2026-06-03)

| Check | Method | Result |
|-------|--------|--------|
| Login contract | `POST /api/xbos/auth/login` (`ceo@xe.vn`) | **201** · `expiresInSec=**86400**` · `jwt_delta=**86400**` |
| HTTPS probe (JWT rows) | QA stdout in evidence §B | **PASS** `P-CC-01-login`, **PASS** `P-CC-01-jwt` |
| Full HTTPS probe | `node scripts/tmp-p1-ex-qa-https-01-probe.mjs` | Exit **1** — L2 **13/23**, L2.5 **1/7** — **not required** for this condition |
| Collateral KPI | Probe | **PASS** `J-CC-03`, **PASS** `P-CC-04c` (inherits prior J-CC-03 gate; not JWT blocker) |

QC independent login spot-check (2026-06-03):

```text
status 201 expiresInSec 86400 jwt_delta 86400
```

QC concurs: **QA runtime is SoT** for probe row verdicts; QC independent login matches QA and Dev-BE on all in-scope JWT checks.

## Gate matrix (P-CC-01-jwt only)

| Gate | Expected | Actual (QA + Dev-BE + QC repro) | Verdict |
|------|----------|----------------------------------|---------|
| **P-CC-01-login** | HTTP **201** `XBOS-AUTH-200` | **201** | **PASS** |
| **P-CC-01-jwt** | `expiresInSec=86400` | Login **86400**; probe **PASS**; QC spot **86400** | **PASS** |
| JWT `exp-iat` | **86400** | **86400** | **PASS** |
| Prior mismatch | `43200` vs `86400` (stale pilot) | Not reproducible post 2026-06-03 deploy | **CLOSED** |
| **C-JCC03-01** | JWT probe closure | Satisfied on scoped slice | **CLOSED** |
| Full probe script exit **0** | Out of **C-JCC03-01** | Exit **1** (HRM residuals) | **N/A — not required** |
| Production / Phase 1 DONE | Out of slice | Not claimed | N/A |

## L2 / L2.5 journey coverage audit (U19)

| Journey / row | Requirement | In JWT slice? | Verdict |
|---------------|-------------|---------------|---------|
| **P-CC-01** | Login + JWT 24h | **Yes** | **PASS** |
| **J-CC-03** / **P-CC-04c** | KPI rollup (collateral) | No (informational) | **PASS** — unchanged from 2026-05-29 |
| **J-HRM-01..07** | L2.5 list→detail | **No** | **FAIL** — documented residual; **does not block C-JCC03-01** |
| **P-CC-05..08** | HRM embed L2 | **No** | **FAIL** — separate wave; **does not NO-GO JWT** |

**NO-GO avoided:** QC did not require full probe exit **0** or HRM row PASS to close **C-JCC03-01**; scoped JWT contract is independently satisfied.

## Conditions — closed vs remaining

### Closed by this gate

| ID | Source | Closure |
|----|--------|---------|
| **C-JCC03-01** | `qc-https-j-cc-03-01-20260529.md` | **CLOSED** — `P-CC-01-jwt` **PASS** `expiresInSec=86400` on HTTPS pilot (2026-06-03 redeploy) |
| **P-CC-01-jwt** (JWT mismatch) | J-CC-03 GWC carry | **CLOSED** — stale xbos-api corrected per Dev-BE evidence |

### Remaining (not part of this GO)

| ID | Condition | Owner | Notes |
|----|-----------|-------|-------|
| **C-JCC03-02** | KPI `series[]` empty (`data_gap`) | dev-be / data | Informational |
| **C-JCC03-03** | Persona `ceo@xe.vn` / `main` only | QA | Unchanged |
| **C-JCC03-04** | VPS partial `pscp` vs `git pull` | DevOps | Dev-BE note 2026-06-03 |
| **C-JCC03-05** | Not Production / not Phase 1 DONE | PM/QC | **NOT Phase 1 DONE** |
| **HRM-HTTPS-RESID** | `P-CC-05` 404; `P-CC-06/07/08` 400; `J-HRM-*` 6/7 FAIL | dev-be / qa | New wave — probe exit **1** |
| **C-HTTPSQC-01..07** | Browser L2.5, attendance, PROD | QA / DevOps | Unchanged from HTTPS bundle |

## Residual (post-gate)

| ID | Severity | Status | Note |
|----|----------|--------|------|
| C-JCC03-01 | Condition | **CLOSED** | Scoped JWT only |
| P-CC-01-jwt | P2 | **CLOSED** | |
| HRM probe rows | P1/P2 | **OPEN** | `P-CC-05`..`08`, `J-HRM-01/02/04/05/06/07` — separate dispatch |
| Full probe exit 0 | P2 | **OPEN** | Not claimed by this gate |
| VPS-git-sync | P3 | **OPEN** | DevOps |
| Production cutover | P0 program | **OPEN** | Not in JWT slice |

## Decision summary

| Tier | Verdict |
|------|---------|
| **P-CC-01-jwt** on HTTPS pilot | **GO** |
| **C-JCC03-01** | **CLOSED** |
| **Full perimeter probe script** | **Not promoted** — exit **1** acceptable; HRM residuals tracked separately |
| **Phase 1 / Production / Excellence** | **NOT approved** |

**Not approved:** Production release, Phase 1 / Excellence DONE, full HTTPS probe exit **0**, or closure of HRM embed / L2.5 journeys via this JWT gate.

## completion_report

- **closed_scope:**
  - Audited QA + Dev-BE evidence; QC reproduced login **86400** and concurred probe **PASS** on `P-CC-01-jwt`.
  - **GO** for **P-CC-01-jwt** only on nip.io; **C-JCC03-01 CLOSED**.
  - Full probe exit **1** with HRM residuals **accepted** — no JWT NO-GO for `P-CC-05`..`08` or `J-HRM-*`.
- **residual_open:**
  - HRM HTTPS wave (`P-CC-05`..`08`, `J-HRM-*`); VPS git sync; Production gates; evidence-pack cosmetic verify gaps.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: P1-EX-PM-HTTPS-JCC03-JWT-PROMOTE
from_role: qc
to_role: pm
ack_status target: DISPATCHED

PM: QC **GO** issued for P-CC-01-jwt only — **C-JCC03-01 CLOSED** (docs/qa/evidence/p1-ex-qc-https-p-cc-01-jwt-01-20260603.md). Update PROGRAM_JOURNEY_MAP / PILOT_BUSINESS_FLOW_MATRIX / bus — mark P-CC-01-jwt HTTPS nip.io ✅. **Do not** claim full probe exit 0, Production, or Phase 1 DONE. Residual auto-fix: dispatch dev-be/qa HRM wave for probe failures P-CC-05..08 + J-HRM-01/02/04/05/06/07 (exit 1); devops C-JCC03-04 VPS git pull. No further dev-be for JWT unless regression on expiresInSec.
```

## Handoff packet

```yaml
work_item_id: P1-EX-QC-HTTPS-P-CC-01-JWT-01
from_role: qc
to_role: pm
entry_criteria:
  - docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260603.md PASS_TO_PM
  - docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260603.md READY_FOR_QA chain closed
exit_criteria: Close C-JCC03-01; GO scoped P-CC-01-jwt; HRM residuals documented not blocking
evidence_path: docs/qa/evidence/p1-ex-qc-https-p-cc-01-jwt-01-20260603.md
ack_status: PASS_TO_PM
decision_p_cc_01_jwt: GO
decision_full_probe: NOT_PROMOTED
conditions_closed:
  - C-JCC03-01
residual_dispatch_hint: P1-EX-QA-HTTPS-HRM-RESID — P-CC-05..08 + J-HRM-*
```
