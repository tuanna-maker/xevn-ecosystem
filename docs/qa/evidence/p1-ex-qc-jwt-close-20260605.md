# QC Gate Decision — P1-EX-QC-JWT-CLOSE-01 (2026-06-05)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QC-JWT-CLOSE-01` |
| from_role | `qc` |
| to_role | `pm` |
| execution_date | `2026-06-05` |
| decision | **GO** — scoped **P-CC-01-jwt** + full HTTPS probe confirmation |
| environment | `https://14-225-217-232.nip.io` |
| PORTAL_DEV_URL | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` / `Xevn@2026` |
| ack_status | **PASS_TO_PM** |

## Scope audited

QC formal closure after QA `P1-EX-QA-JWT-CLOSE-01` (`PASS_TO_PM`) and Dev-BE `P1-EX-BE-HTTPS-P-CC-01-JWT-01` (`READY_FOR_QA` → QA PASS).

**In scope:** **P-CC-01-jwt** — login `expiresInSec=86400`; JWT payload `exp-iat=86400`; formal closure of **C-JCC03-01** (originated `docs/qa/evidence/qc-https-j-cc-03-01-20260529.md`; prior partial closures `p1-ex-qc-https-p-cc-01-jwt-01-20260603.md`, `p1-ex-qc-https-post-deploy-20260603.md`).

**Explicitly out of scope:** Production cutover; Phase 1 DONE; Excellence Program DONE; unconditional PROD-READY.

## Evidence consumed

| # | Artifact | Role | Verdict used |
|---|----------|------|--------------|
| 1 | `docs/qa/evidence/p1-ex-qa-jwt-close-20260605.md` | QA | **Authoritative** — `PASS_TO_PM` |
| 2 | `docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-20260605.md` | Dev-BE | Repo contract unchanged; pilot repro **86400** |
| 3 | `docs/qa/evidence/p1-ex-qc-https-p-cc-01-jwt-01-20260603.md` | QC (prior) | Scoped **GO** with probe exit **1** — superseded by full probe exit **0** |
| 4 | `docs/qa/evidence/qc-https-j-cc-03-01-20260529.md` | QC (prior) | **C-JCC03-01** OPEN — **formally CLOSED** by this gate |
| 5 | `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` | Matrix | P-CC-01 login + JWT rows |

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-jwt-close-20260605.md
```

| Result | Detail |
|--------|--------|
| Exit **1** | **1/8** cosmetic: `command_table` pattern (missing formal command table with exit codes) |
| QC adjudication | **Accepted for scoped JWT gate** — substantive runtime evidence present (login contract §A, full probe §B, classification §C). Process debt: QA should add command table on next pack. **Not** product NO-GO. |

## Classification (ENV vs PRODUCT)

| Signal | Class | JWT gate impact |
|--------|-------|-----------------|
| `P-CC-01-jwt` **PASS** `expiresInSec=86400` | **PRODUCT — CLOSED** | Satisfies **C-JCC03-01** |
| Login `jwt_delta=86400` | **PRODUCT — CLOSED** | Independent QA + QC repro |
| Full probe exit **0** (L2 **23/23**, L2.5 **7/7**) | **PRODUCT — CONFIRMED** | No JWT regression; perimeter green on nip.io |
| Prior `43200` stale pilot mismatch | **PRODUCT — CLOSED** | Not reproducible post 2026-06-03 deploy |

## QC reproduction (2026-06-05)

| Check | Method | Result |
|-------|--------|--------|
| Login contract | `POST /api/xbos/auth/login` (`ceo@xe.vn`) | **201** · `expiresInSec=**86400**` · `jwt_delta=**86400**` |
| Full HTTPS probe | QA stdout in `p1-ex-qa-jwt-close-20260605.md` §B | Exit **0** — L2 **23/23**, L2.5 **7/7**; **PASS** `P-CC-01-jwt` |

QC independent login spot-check (2026-06-05):

```text
status 201 expiresInSec 86400 jwt_delta 86400
```

QC concurs: QA runtime is SoT for full probe row verdicts; QC independent login matches QA and Dev-BE on all in-scope JWT checks.

## Gate matrix (P-CC-01-jwt + C-JCC03-01)

| Gate | Expected | Actual (QA + Dev-BE + QC repro) | Verdict |
|------|----------|----------------------------------|---------|
| **P-CC-01-login** | HTTP **201** `XBOS-AUTH-200` | **201** | **PASS** |
| **P-CC-01-jwt** | `expiresInSec=86400` | Login **86400**; probe **PASS**; QC spot **86400** | **PASS** |
| JWT `exp-iat` | **86400** | **86400** | **PASS** |
| Full probe script | Exit **0** (regression guard) | Exit **0** (QA independent) | **PASS** |
| **C-JCC03-01** | JWT TTL 24h on HTTPS pilot | Satisfied + full perimeter confirmed | **CLOSED** |
| Production / Phase 1 DONE | Out of slice | Not claimed | N/A |

## L2.5 journey audit (U19)

| Journey | In slice? | QA verdict | QC concurrence |
|---------|-----------|------------|----------------|
| J-CC-03 | Collateral (KPI rollup) | **PASS** | Concurs — not JWT blocker |
| J-HRM-01..07 | Full probe L2.5 | **7/7 PASS** | Concurs — confirms no JWT-side regression on HRM embed |
| Browser click-path | Not re-run by QC | QA API L2.5 only | **GWC accepted** — API probe sufficient for JWT closure wave |

**NO-GO avoided:** This gate closes **C-JCC03-01** only; does not claim Phase 1 DONE or PROD.

## Condition register update

| Condition ID | Source | Status | Notes |
|--------------|--------|--------|-------|
| **C-JCC03-01** | `qc-https-j-cc-03-01-20260529.md` | **CLOSED** | `P-CC-01-jwt` **PASS** `expiresInSec=86400` on nip.io; QA independent probe exit **0** (2026-06-05) |
| **C-HTTPSQC-04** | `p1-ex-qc-https-01-20260527.md` | **CLOSED** (collateral) | Full probe exit **0** reaffirms prior post-deploy closure |

## Verdict

**GO** for **P-CC-01-jwt** on HTTPS pilot (`https://14-225-217-232.nip.io`).

**C-JCC03-01: CLOSED** — formal QC sign-off; no further JWT TTL dispatch unless regression on `expiresInSec` or `jwt_delta`.

**NOT** Phase 1 DONE · **NOT** PROD · **NOT** unconditional program closure.

## Residual

| ID | Severity | Owner | Notes |
|----|----------|-------|-------|
| — | — | — | **None** for JWT slice. Parent program blockers (G5/G8/PROD, member persona, mobile device) remain on other QC registers. |

## completion_report

- **Closed:** `P1-EX-QC-JWT-CLOSE-01` — formal **GO** for **P-CC-01-jwt**; **C-JCC03-01 CLOSED** on nip.io with QA independent full probe exit **0** and QC login repro **86400**.
- **Promoted:** Matrix row **P-CC-01-jwt** HTTPS pilot ✅; collateral L2 **23/23** + L2.5 **7/7** confirmed (no JWT regression).
- **Residual:** None in JWT slice. Program-level G5/G8/PROD and Phase 1 gates remain open on parent registers.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: P1-EX-PM-JWT-CLOSE-01
entry_criteria: QC PASS_TO_PM `P1-EX-QC-JWT-CLOSE-01` — evidence `docs/qa/evidence/p1-ex-qc-jwt-close-20260605.md`; **C-JCC03-01 CLOSED**; **GO** P-CC-01-jwt nip.io
exit_criteria: Update `docs/program/AGENT_MESSAGE_BUS.md` INTAKE + mark **C-JCC03-01 CLOSED** on condition registers; sync `PILOT_BUSINESS_FLOW_MATRIX.md` P-CC-01-jwt row ✅; refresh `TEAM_WORKING_NOW.md` — remove JWT from open P0; do NOT claim Phase 1 DONE or PROD
evidence_path: docs/qa/evidence/p1-ex-qc-jwt-close-20260605.md
ack_status: PASS_TO_PM (PM status refresh)
```

## pm_dispatch_hint

`P1-EX-PM-JWT-CLOSE-01` — PM status refresh only; **C-JCC03-01** closed; no dev-be unless `expiresInSec` regresses from **86400**.
