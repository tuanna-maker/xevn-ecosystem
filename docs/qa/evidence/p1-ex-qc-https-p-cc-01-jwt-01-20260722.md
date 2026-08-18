# QC Gate Decision — P1-EX-QC-HTTPS-P-CC-01-JWT-01 (2026-07-22)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QC-HTTPS-P-CC-01-JWT-01` |
| from_role | `qc` |
| to_role | `pm` |
| execution_date | `2026-07-22` |
| decision | **GO WITH CONDITIONS** — scoped **P-CC-01-jwt** / **C-JCC03-01** freshness only (`expiresInSec=86400`) |
| environment | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| ack_status | **PASS_TO_PM** |
| residual_auto_fix | `true` |
| U65 | zero-seed — **no** seed in evidence chain (BE/QA/QC) |
| Phase1 / PROD claim | **NONE** |

## Scope audited

QC residual-close after QA `P1-EX-QA-HTTPS-P-CC-01-JWT-01` (`PASS_TO_PM`) and Dev-BE `P1-EX-BE-HTTPS-P-CC-01-JWT-01` (`READY_FOR_QA` → QA PASS).

**In scope:** **P-CC-01-jwt** — login `expiresInSec=86400`; JWT `exp−iat=86400`; close / reconfirm **C-JCC03-01** (JWT/probe-linked); accept full HTTPS probe exit **0** as perimeter regression guard.

**Explicitly out of scope (must not block this GWC):** Phase 1 Program DONE; Production / PROD-READY; OpenAPI; G-BOOT; G-DEC density; browser UF promote beyond API probe L2/L2.5.

## Evidence consumed

| # | Artifact | Role | Verdict used |
|---|----------|------|--------------|
| 1 | `docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260722.md` | QA | **Authoritative** — independent probe exit **0**; `PASS P-CC-01-jwt`; spot login **86400** |
| 2 | `docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260722.md` | Dev-BE | Live HTTPS already **86400**; jest auth 8/8; TTL logic unchanged (LastVerified only) |
| 3 | `docs/qa/evidence/p1-ex-qc-https-p-cc-01-jwt-01-20260719.md` | QC (prior) | Prior **GO** / **C-JCC03-01 CLOSED** — this gate **reconfirms freshness** 2026-07-22 |
| 4 | `docs/program/PROGRAM_JOURNEY_MAP.md` | Journey | **J-CC-03** ✅ L2 (map) — probe `PASS J-CC-03` collateral |

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260722.md
```

| Result | Detail |
|--------|--------|
| Exit **1** | **2/8** PROCESS: `command_table` (regex wants `` `node …` `` / `pnpm run` ); `residual_section` (wants `## Residual` heading) |
| Other checks | work_item_id, ack_status, portal_url (nip.io), journey_l25, crud_or_matrix, timestamp — **PASS** (inferred from prior class + QA content) |
| QC adjudication | **Accepted for scoped JWT gate** — substantive runtime evidence present (command table with exit **0**, JWT JSON, L2 23/23 · L2.5 7/7). Process debt only. **Not** product NO-GO. Same class as 2026-07-19 / 2026-06-03. |

## Classification (ENV vs PRODUCT)

| Signal | Class | JWT gate impact |
|--------|-------|-----------------|
| `P-CC-01-jwt` **PASS** `expiresInSec=86400` / `jwt_delta=86400` | **PRODUCT — CLOSED** | Satisfies **C-JCC03-01** freshness |
| Full HTTPS probe exit **0** (L2 23/23 · L2.5 7/7) | **PRODUCT — PASS** | Perimeter green; no JWT regression |
| Historic `43200` stale pilot | **PRODUCT — CLOSED** | Not reproducible 2026-07-22 (QC + QA + BE all **86400**) |
| Evidence-pack `command_table` / `residual_section` | **PROCESS** | Format only — not product blocker |
| Stack / ECONNREFUSED | **N/A** | QC login spot reached nip.io **201** |

## QC verification method (2026-07-22)

**Method:** Sample-verify login JWT TTL (independent) **+** accept QA full probe log (not re-run full probe — log complete + BE khớp).

| Check | Method | Result |
|-------|--------|--------|
| Login contract | QC independent `POST /api/xbos/auth/login` (`ceo@xe.vn`) | **201** · `expiresInSec=**86400**` · `jwt_delta=**86400**` · `XBOS-AUTH-200` · `pass=true` |
| HTTPS probe (JWT + perimeter) | **Accept QA stdout** in `p1-ex-qa-https-p-cc-01-jwt-01-20260722.md` §3–4 | Exit **0** · **PASS** `P-CC-01-login` · **PASS** `P-CC-01-jwt` · L2 **23/23** · L2.5 **7/7** |
| BE alignment | BE evidence login + probe | Matches QA + QC spot |

QC independent login spot-check (2026-07-22 ~19:12 ICT):

```text
{"status":201,"expiresInSec":86400,"jwt_delta":86400,"code":"XBOS-AUTH-200","pass":true}
```

QC concurs: **QA runtime is SoT** for probe row verdicts; QC independent login matches QA and Dev-BE on all in-scope JWT checks. U65 zero-seed observed (login + probe only).

## Gate matrix (P-CC-01-jwt / C-JCC03-01 only)

| Gate | Expected | Actual (QA + Dev-BE + QC sample) | Verdict |
|------|----------|----------------------------------|---------|
| **P-CC-01-login** | HTTP **201** `XBOS-AUTH-200` | **201** | **PASS** |
| **P-CC-01-jwt** | `expiresInSec=86400` | Login **86400**; probe **PASS**; QC spot **86400** | **PASS** → **CLOSED** |
| JWT `exp−iat` | **86400** | **86400** | **PASS** |
| **C-JCC03-01** | JWT/probe-linked residual | Freshness confirmed 2026-07-22; `PASS J-CC-03` in probe | **CLOSED** |
| Full probe script | Exit **0** (regression guard) | QA independent exit **0** | **PASS** (accepted) |
| Production / Phase 1 DONE | Out of slice | Not claimed | N/A |

## L2 / L2.5 journey coverage audit (U19)

| Journey / row | Requirement | In JWT slice? | Verdict |
|---------------|-------------|---------------|---------|
| **P-CC-01** | Login + JWT 24h | **Yes** | **PASS** |
| **J-CC-03** | KPI rollup (JWT/probe-linked carry) | Yes (residual link) | **PASS** (probe) — map ✅ L2 |
| **J-HRM-01..07** | L2.5 API probe rows | Collateral | **PASS** 7/7 (probe) — **not** claimed as browser U65 UF promote |
| Browser click-path UF | Out of JWT residual close | **No** | Deferred / not required for **C-JCC03-01** |

**U19:** In-scope JWT slice has PASS evidence; no mandatory J-* left ⏳ for this condition close. Full perimeter L2.5 green strengthens confidence.

## Conditions — closed vs remaining

### Closed / confirmed by this gate

| ID | Source | Closure | Evidence refs |
|----|--------|---------|---------------|
| **P-CC-01-jwt** | QC GWC residual / historic `43200` | **CLOSED** | QA `p1-ex-qa-https-p-cc-01-jwt-01-20260722.md`; BE `p1-ex-be-https-p-cc-01-jwt-01-20260722.md`; QC spot **86400** |
| **C-JCC03-01** | `qc-https-j-cc-03-01-20260529.md` + prior QC 20260603/20260719 | **CLOSED** (freshness retained 2026-07-22) | Same + probe `PASS J-CC-03` |

### Remaining conditions (standing — **not** JWT product NO-GO)

| ID | Condition | Owner | Notes |
|----|-----------|-------|-------|
| **C-JCC03-05** / program | Not Production / not Phase 1 DONE | PM/QC | **NOT Phase 1 DONE** · **NOT PROD-READY** |
| **C-HTTPSQC-PACK-01** | Pack `command_table` + `## Residual` on next HTTPS QA pack | QA | Process P3 — template hygiene |
| **G-DEC** density (if still open) | Out of this JWT wave | PM → QA | Queue separately — **cấm** fold into JWT GO |
| Optional probe script commit | `scripts/tmp-p1-ex-qa-https-01-probe.mjs` still uncommitted risk | PM/sponsor | Governance — not gate blocker |
| OpenAPI / G-BOOT | Explicit cấm this Task | — | Not reopened |

## Residual

| ID | Severity | Status | Owner | Note |
|----|----------|--------|-------|------|
| **P-CC-01-jwt** | P2 | **CLOSED** | — | Freshness 2026-07-22 |
| **C-JCC03-01** | Condition | **CLOSED** | — | Freshness retained |
| Evidence-pack command_table / residual_section | Process P3 | **OPEN** | QA | Template on next HTTPS wave |
| Phase 1 / Production | Program | **OPEN** | PM | Explicitly **not** claimed |
| G-DEC (if open) | Program | Standing | PM → QA | Next queue — not JWT |

**No residual remaining inside JWT / C-JCC03-01 slice.**

## Decision summary

| Tier | Verdict |
|------|---------|
| **P-CC-01-jwt** on HTTPS pilot | **GO** (slice) |
| **C-JCC03-01** | **CLOSED** |
| Full perimeter probe | **PASS** exit **0** (accepted QA log) |
| Overall release | **GO WITH CONDITIONS** — standing program conditions above |
| **Phase 1 / Production / Excellence** | **NOT approved** |

**Not approved:** Production release, Phase 1 / Excellence DONE, OpenAPI/G-BOOT/G-DEC fold-in, or any claim beyond scoped JWT / C-JCC03-01 freshness.

## completion_report

- **closed_scope:**
  - Audited QA + Dev-BE evidence; QC sample-verified login **86400** / `jwt_delta=86400`; accepted QA full probe log exit **0** (L2 23/23 · L2.5 7/7).
  - **P-CC-01-jwt CLOSED**; **C-JCC03-01 CLOSED** (freshness 2026-07-22).
  - Verdict: **GO WITH CONDITIONS** (JWT slice GO; program Phase1/PROD/G-DEC/pack process remain standing).
  - U65 zero-seed observed.
- **residual_open (outside JWT slice):**
  - **NOT Phase 1 DONE / NOT PROD-READY**.
  - Process: evidence-pack `command_table` + `## Residual` (2/8) — QA template next HTTPS pack.
  - If G-DEC density still open → PM queue G-DEC QA (not reopened here).

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: P1-EX-PM-HTTPS-JWT-CLOSE-PROMOTE-20260722
from_role: qc
to_role: pm
ack_status target: DISPATCHED
residual_auto_fix: true

PM: QC **GO WITH CONDITIONS** — P-CC-01-jwt **CLOSED**; C-JCC03-01 **CLOSED** (freshness 2026-07-22). Evidence: docs/qa/evidence/p1-ex-qc-https-p-cc-01-jwt-01-20260722.md (refs QA p1-ex-qa-https-p-cc-01-jwt-01-20260722.md + BE p1-ex-be-https-p-cc-01-jwt-01-20260722.md). Update bus + matrix/journey — mark P-CC-01-jwt HTTPS nip.io ✅; do NOT claim Phase1/PROD. Optional: commit restored probe script if still untracked. If G-DEC density still open in backlog → queue G-DEC QA next (out of JWT scope). No further JWT dev-be unless expiresInSec regresses from 86400. Continue residual_auto_fix via pm:idle:check.
```

## Handoff packet

```yaml
work_item_id: P1-EX-QC-HTTPS-P-CC-01-JWT-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
decision: GO WITH CONDITIONS
scope: P-CC-01-jwt / C-JCC03-01 freshness only
evidence_path: docs/qa/evidence/p1-ex-qc-https-p-cc-01-jwt-01-20260722.md
qa_evidence: docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260722.md
dev_evidence: docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260722.md
verify_method: QC sample login JWT + accept QA probe log
conditions_closed:
  - P-CC-01-jwt
  - C-JCC03-01
forbidden_claims:
  - Phase 1 DONE
  - PROD-READY
  - OpenAPI / G-BOOT / G-DEC fold-in
next_owner: pm
```
