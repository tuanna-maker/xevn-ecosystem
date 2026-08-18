# QC Gate Decision — P1-EX-QC-HTTPS-P-CC-01-JWT-01 (2026-07-19)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QC-HTTPS-P-CC-01-JWT-01` |
| from_role | `qc` |
| to_role | `pm` |
| execution_date | `2026-07-19` |
| decision | **GO** — scoped **P-CC-01-jwt** / **C-JCC03-01** freshness only (`expiresInSec=86400`) |
| environment | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| ack_status | **PASS_TO_PM** |
| residual_auto_fix | `true` |
| U65 | zero-seed (no seed in evidence chain) |

## Scope audited

QC re-gate after QA `P1-EX-BE-HTTPS-P-CC-01-JWT-01` (`PASS_TO_PM`) and Dev-BE `READY_FOR_QA`.

**In scope:** **P-CC-01-jwt** — login `expiresInSec=86400`; JWT `exp-iat=86400`; confirm **C-JCC03-01** remains **CLOSED** (freshness after probe restore 2026-07-19).

**Explicitly out of scope (must not block this GO):** Phase 1 Program DONE; Production / PROD-READY; Excellence T6 close; UF promote from NFR alone; browser U65 click-path retest beyond probe L2/L2.5 API rows.

## Evidence consumed

| # | Artifact | Role | Verdict used |
|---|----------|------|--------------|
| 1 | `docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260719.md` | QA | **Authoritative** — `PASS_TO_PM`; probe exit **0**; Auth 5/5 + HRM-ATT-200 |
| 2 | `docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260719.md` | Dev-BE | Probe script restored; live login 86400; unit TTL asserts |
| 3 | `docs/qa/evidence/p1-ex-qc-https-p-cc-01-jwt-01-20260603.md` | QC (prior) | **C-JCC03-01 CLOSED** — this gate **reconfirms freshness** |
| 4 | `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` | Matrix | P-CC-01 JWT row |

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260719.md
```

| Result | Detail |
|--------|--------|
| Exit **1** | **1/8** — `command_table` regex wants `` `node …` `` / `pnpm run` in table; QA table uses env-prefixed command string |
| Other checks | work_item_id, ack_status, portal_url (nip.io), journey_l25, crud_or_matrix (L2.5 PASS rows), residual_section, timestamp — **PASS** |
| QC adjudication | **Accepted for scoped JWT gate** — substantive runtime evidence present (command table with exit **0**, JWT decode JSON, L2/L2.5 matrices). Process debt only. **Not** product NO-GO. Same adjudication class as `p1-ex-qc-https-p-cc-01-jwt-01-20260603.md`. |

## Classification (ENV vs PRODUCT)

| Signal | Class | JWT gate impact |
|--------|-------|-----------------|
| `P-CC-01-jwt` **PASS** `expiresInSec=86400` / `jwt_delta=86400` | **PRODUCT — CLOSED** | Satisfies **C-JCC03-01** freshness |
| Full HTTPS probe exit **0** (L2 23/23 · L2.5 7/7) | **PRODUCT — PASS** | Stronger than 2026-06-03 (then exit 1) |
| Auth 5/5 + attendance `HRM-ATT-200` | **PRODUCT — PASS** | Regression guard green; residual-03 not reopened |
| Evidence-pack `command_table` regex | **PROCESS** | Format only — not product blocker |
| Stack / ECONNREFUSED | **N/A** | Login spot-check reached nip.io 201 |

## QC reproduction (2026-07-19)

| Check | Method | Result |
|-------|--------|--------|
| Login contract | Independent `POST /api/xbos/auth/login` (`ceo@xe.vn`) | **201** · `expiresInSec=**86400**` · `jwt_delta=**86400**` · `XBOS-AUTH-200` · `pass=true` |
| HTTPS probe (JWT + perimeter) | QA independent stdout | Exit **0** · **PASS** `P-CC-01-login` · **PASS** `P-CC-01-jwt` · L2 **23/23** · L2.5 **7/7** |
| Auth / attendance guard | QA §B | Auth **5/5** 200; attendance **200** `HRM-ATT-200` |

QC independent login spot-check (2026-07-19):

```text
{"status":201,"expiresInSec":86400,"jwt_delta":86400,"code":"XBOS-AUTH-200","pass":true}
```

QC concurs: **QA runtime is SoT** for probe row verdicts; QC independent login matches QA and Dev-BE on all in-scope JWT checks.

## Gate matrix (P-CC-01-jwt / C-JCC03-01 only)

| Gate | Expected | Actual (QA + Dev-BE + QC repro) | Verdict |
|------|----------|----------------------------------|---------|
| **P-CC-01-login** | HTTP **201** `XBOS-AUTH-200` | **201** | **PASS** |
| **P-CC-01-jwt** | `expiresInSec=86400` | Login **86400**; probe **PASS**; QC spot **86400** | **PASS** |
| JWT `exp-iat` | **86400** | **86400** | **PASS** |
| **C-JCC03-01** | JWT probe closure | Freshness confirmed 2026-07-19 | **CLOSED** (retained) |
| Probe restore | Script runnable | Dev restored `tmp-p1-ex-qa-https-01-probe.mjs`; QA exit **0** | **PASS** |
| Auth 5/5 + HRM-ATT | No regression | **5/5** + `HRM-ATT-200` | **PASS** |
| Production / Phase 1 DONE | Out of slice | Not claimed | N/A |

## L2 / L2.5 journey coverage audit (U19)

| Journey / row | Requirement | In JWT slice? | Verdict |
|---------------|-------------|---------------|---------|
| **P-CC-01** | Login + JWT 24h | **Yes** | **PASS** |
| **J-CC-03** | KPI rollup (collateral via probe) | Informational | **PASS** (probe) — map ✅ L2 |
| **J-HRM-01..07** | L2.5 API probe rows | Collateral | **PASS** 7/7 (probe) — **not** claimed as browser U65 UF promote |
| Browser click-path UF | Out of JWT residual close | **No** | Deferred / not required for **C-JCC03-01** |

**U19:** In-scope JWT slice has PASS evidence; full perimeter probe L2.5 green strengthens confidence vs 2026-06-03. No mandatory J-* left ⏳ for this condition close.

## Conditions — closed vs remaining

### Closed / confirmed by this gate

| ID | Source | Closure |
|----|--------|---------|
| **C-JCC03-01** | Prior QC 2026-06-03 + freshness 2026-07-19 | **CLOSED** — `P-CC-01-jwt` **PASS** `expiresInSec=86400` on HTTPS pilot |
| **P-CC-01-jwt** freshness | Probe delete/restore wave | **CLOSED** — probe exit **0**; QC login spot **86400** |

### Remaining (standing — not part of JWT GO)

| ID | Condition | Owner | Notes |
|----|-----------|-------|-------|
| **C-JCC03-05** / program | Not Production / not Phase 1 DONE | PM/QC | **NOT Phase 1 DONE** · **NOT PROD-READY** |
| **C-HTTPSQC-PACK-01** | Pack `command_table` regex on next HTTPS QA pack | QA | Process — use `` `node …` `` or `pnpm run` in table |
| Persona / browser UF | Browser L2.5 U65 where required by other residuals | QA | Not blocking JWT |

## Residual (post-gate)

| ID | Severity | Status | Note |
|----|----------|--------|------|
| C-JCC03-01 | Condition | **CLOSED** | Freshness 2026-07-19 |
| P-CC-01-jwt | P2 | **CLOSED** | |
| Evidence-pack command_table | Process P3 | **OPEN** | Template hygiene for next HTTPS wave |
| Phase 1 / Production | Program | **OPEN** | Explicitly **not** claimed |

## Decision summary

| Tier | Verdict |
|------|---------|
| **P-CC-01-jwt** on HTTPS pilot | **GO** |
| **C-JCC03-01** | **CLOSED** (freshness confirmed) |
| Full perimeter probe | **PASS** exit **0** (collateral — not required to claim Phase1) |
| **Phase 1 / Production / Excellence** | **NOT approved** |

**Not approved:** Production release, Phase 1 / Excellence DONE, UF matrix promote from NFR alone, or any claim beyond scoped JWT / C-JCC03-01.

## completion_report

- **closed_scope:**
  - Audited QA + Dev-BE evidence; QC reproduced login **86400** / `jwt_delta=86400`.
  - **GO** for **P-CC-01-jwt** only on nip.io; **C-JCC03-01 CLOSED** (freshness retained after probe restore).
  - Collateral: probe L2 23/23 · L2.5 7/7 · Auth 5/5 · HRM-ATT-200 — no JWT regression.
- **residual_open:**
  - Standing **NOT Phase 1 DONE / NOT PROD-READY**.
  - Process: evidence-pack `command_table` regex (1/8) — QA template on next HTTPS pack.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: P1-EX-PM-HTTPS-JCC03-JWT-PROMOTE-20260719
from_role: qc
to_role: pm
ack_status target: DISPATCHED
residual_auto_fix: true

PM: QC **GO** issued for P-CC-01-jwt only — **C-JCC03-01 CLOSED** (freshness 2026-07-19). Evidence: docs/qa/evidence/p1-ex-qc-https-p-cc-01-jwt-01-20260719.md. Update PROGRAM_JOURNEY_MAP / PILOT_BUSINESS_FLOW_MATRIX / bus — mark P-CC-01-jwt HTTPS nip.io ✅ freshness confirmed; probe exit 0. **Do NOT** claim Phase 1 DONE or Production. Optional: remind QA next HTTPS pack use `node`/`pnpm run` in command_table backticks for verify:qc:evidence-pack exit 0. No further JWT dev-be unless expiresInSec regresses from 86400. Continue residual_auto_fix on next open P0/P1 from pm:idle:check / Excellence backlog.
```

## Handoff packet

```yaml
work_item_id: P1-EX-QC-HTTPS-P-CC-01-JWT-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
decision: GO
scope: P-CC-01-jwt / C-JCC03-01 freshness only
evidence_path: docs/qa/evidence/p1-ex-qc-https-p-cc-01-jwt-01-20260719.md
qa_evidence: docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260719.md
dev_evidence: docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260719.md
conditions_closed:
  - C-JCC03-01
  - P-CC-01-jwt
forbidden_claims:
  - Phase 1 DONE
  - PROD-READY
  - Excellence T6 close
next_owner: pm
```
