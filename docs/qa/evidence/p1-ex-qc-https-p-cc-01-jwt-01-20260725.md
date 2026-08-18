# QC Gate Decision — P1-EX-QC-HTTPS-P-CC-01-JWT-01 (2026-07-25 evening supersede)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QC-HTTPS-P-CC-01-JWT-01` |
| from_role | `qc` |
| to_role | `pm` |
| execution_date | `2026-07-25` |
| stamp | **evening supersede** (post BE probe-harden + QA evening PASS_TO_PM) |
| decision | **GO WITH CONDITIONS** — scoped **P-CC-01-jwt** / **C-JCC03-01** freshness; dual assert `expiresInSec=86400` **AND** `jwt_delta=86400` |
| environment | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` · `companyId=main` |
| ack_status | **PASS_TO_PM** |
| residual_auto_fix | `true` |
| U65 | zero-seed — **no** seed in evidence chain (BE/QA/QC) |
| HOLD_DEPLOY | **yes** |
| Phase1 / PROD claim | **NONE** |

> **Supersedes** earlier same-day QC body (morning/afternoon stamp) that accepted pack **2/8** process debt. Evening QA pack + QC re-verify = **8/8 exit 0**. Prior product closures retained and reconfirmed under hardened dual-assert probe.

## Scope audited

QC freshness reconfirm after:

1. Dev-BE `P1-EX-BE-HTTPS-P-CC-01-JWT-01` — probe hardened (`expiresInSec===86400` **AND** `jwt_delta===86400`); `READY_FOR_QA`
2. QA `P1-EX-QA-HTTPS-P-CC-01-JWT-01` — independent evening retest; `PASS_TO_PM`

**In scope:** **P-CC-01-jwt** dual TTL; close / reconfirm **C-JCC03-01**; full HTTPS probe exit **0** as perimeter regression guard; evidence-pack integrity.

**Explicitly out of scope:** Phase 1 DONE; Production / PROD-READY; OpenAPI; G-BOOT; browser UF promote beyond API probe L2/L2.5; deploy `:8088`.

## Evidence consumed

| # | Artifact | Role | Verdict used |
|---|----------|------|--------------|
| 1 | `docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260725.md` | QA evening | **Authoritative** — probe exit **0**; `PASS P-CC-01-jwt` dual; L2 23/23 · L2.5 7/7; pack claims 8/8 |
| 2 | `docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260725.md` | Dev-BE | Probe harden + live 86400; jest auth exit 0; no TTL product change |
| 3 | This file (prior morning stamp) | QC | Prior **GWC** / conditions closed — **superseded** by evening dual-assert + pack 8/8 |
| 4 | `docs/program/PROGRAM_JOURNEY_MAP.md` | Journey | **J-CC-03** linked — probe `PASS J-CC-03` collateral |

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260725.md
```

| Result | Detail |
|--------|--------|
| Exit **0** | **PASS: QC evidence pack ready (8/8)** |
| Checks | work_item_id, ack_status, portal_url (nip.io), journey_l25, crud_or_matrix, command_table, residual_section, timestamp — **all PASS** |
| Delta vs morning QC | Morning accepted process **2/8** (`command_table` / `residual_section`). Evening QA pack fixed → **C-HTTPSQC-PACK-01 CLOSED** |

## Classification (ENV vs PRODUCT)

| Signal | Class | JWT gate impact |
|--------|-------|-----------------|
| `P-CC-01-jwt` **PASS** dual `expiresInSec=86400` **AND** `jwt_delta=86400` | **PRODUCT — CLOSED** | Satisfies **C-JCC03-01** freshness under hardened probe |
| Full HTTPS probe exit **0** (L2 23/23 · L2.5 7/7) | **PRODUCT — PASS** | Perimeter green; no JWT regression |
| Historic `43200` stale pilot | **PRODUCT — CLOSED** | Not reproducible (BE + QA + QC evening all green) |
| Evidence-pack 8/8 | **PROCESS — CLOSED** | Was open as C-HTTPSQC-PACK-01 morning; closed evening |
| Stack / ECONNREFUSED | **N/A** | QC probe reached nip.io; exit **0** |

## QC verification method (2026-07-25 evening)

**Method:** Independent QC re-run of login spot **+** full HTTPS probe (not only accept QA log) **+** pack verify exit 0.

| Check | Method | Result |
|-------|--------|--------|
| Login / JWT contract | **QC independent** `node -e` login spot | **201** · `expiresInSec=**86400**` · `jwt_delta=**86400**` · `XBOS-AUTH-200` · `pass=true` |
| HTTPS probe (JWT + perimeter) | **QC independent** `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs` | Exit **0** · **PASS** `P-CC-01-login` · **PASS** `P-CC-01-jwt` · L2 **23/23** · L2.5 **7/7** |
| Dual assert in probe source | Spot-check `scripts/tmp-p1-ex-qa-https-01-probe.mjs` | `expiresInSec === 86400 && jwtDelta === 86400` — confirmed |
| Pack integrity | `pnpm run verify:qc:evidence-pack -- --evidence …qa…20260725.md` | Exit **0** · **8/8** |
| BE alignment | BE evidence login + probe + jest | Matches QA + QC |

### Command table (QC)

| Command | Exit | Notes |
|---------|------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260725.md` | **0** | Pack **8/8** — closes morning process debt |
| `node -e "(async()=>{…login spot dual…})()"` | **0** | `expiresInSec=86400` · `jwt_delta=86400` · `pass=true` |
| `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs` | **0** | QC independent; **PASS P-CC-01-jwt**; L2 23/23; L2.5 7/7 |

QC concurs: **QA runtime SoT** for evening dual assert; **QC independent** login + probe confirm same-evening freshness. U65 zero-seed observed (login + probe only).

## Gate matrix (P-CC-01-jwt / C-JCC03-01 only)

| Gate | Expected | Actual (QA + Dev-BE + QC evening) | Verdict |
|------|----------|-----------------------------------|---------|
| **P-CC-01-login** | HTTP **201** `XBOS-AUTH-200` | **201** | **PASS** |
| **P-CC-01-jwt** | `expiresInSec=86400` **AND** `jwt_delta=86400` | Dual **86400**; probe **PASS**; QC probe **PASS** | **PASS** → **CLOSED** |
| **C-JCC03-01** | JWT/probe-linked residual | Freshness evening 2026-07-25; `PASS J-CC-03` | **CLOSED** |
| Full probe script | Exit **0** | QA + QC independent exit **0** | **PASS** |
| Evidence pack | Exit **0** 8/8 | QC verify **0** | **PASS** → **C-HTTPSQC-PACK-01 CLOSED** |
| Production / Phase 1 DONE | Out of slice | Not claimed | N/A |

## L2 / L2.5 journey coverage audit (U19)

| Journey / row | Requirement | In JWT slice? | Verdict |
|---------------|-------------|---------------|---------|
| **P-CC-01** | Login + JWT 24h dual | **Yes** | **PASS** |
| **J-CC-03** | KPI rollup (JWT/probe-linked carry) | Yes (residual link) | **PASS** (probe) |
| **J-HRM-01..07** | L2.5 API probe rows | Collateral | **PASS** 7/7 (probe) — **not** claimed as browser U65 UF promote |
| Browser click-path UF | Out of JWT residual close | **No** | Deferred / not required for **C-JCC03-01** |

**U19:** In-scope JWT slice has PASS evidence; no mandatory J-* left ⏳ for this condition close. Full perimeter L2.5 green strengthens confidence.

## Conditions — closed vs remaining

### Closed / confirmed by this evening gate

| ID | Source | Closure | Evidence refs |
|----|--------|---------|---------------|
| **P-CC-01-jwt** | QC GWC residual / historic `43200` | **CLOSED** (evening dual-assert freshness) | QA + BE + QC evening probe exit **0** |
| **C-JCC03-01** | Prior QC 20260603/20260719/20260722 + morning 20260725 | **CLOSED** (freshness retained evening) | Same + probe `PASS J-CC-03` |
| **C-HTTPSQC-PACK-01** | Morning pack 2/8 process | **CLOSED** | verify exit **0** · 8/8 |

### Remaining conditions (standing — **not** JWT product NO-GO)

| ID | Condition | Owner | Notes |
|----|-----------|-------|-------|
| **C-JCC03-05** / program | Not Production / not Phase 1 DONE | PM/QC | **NOT Phase 1 DONE** · **NOT PROD-READY** · HOLD_DEPLOY |
| OpenAPI / G-BOOT | Explicit cấm this Task | — | Not reopened |

## Residual

| ID | Severity | Status | Owner | Note |
|----|----------|--------|-------|------|
| **P-CC-01-jwt** | P2 | **CLOSED** | — | Evening freshness dual 86400 |
| **C-JCC03-01** | Condition | **CLOSED** | — | Freshness retained evening |
| **C-HTTPSQC-PACK-01** | Process P3 | **CLOSED** | — | Pack 8/8 evening |
| Phase 1 / Production | Program | **OPEN** | PM | Explicitly **not** claimed · HOLD_DEPLOY |

**No residual remaining inside JWT / C-JCC03-01 / pack slice.**

## Decision summary

| Tier | Verdict |
|------|---------|
| **P-CC-01-jwt** on HTTPS pilot (dual assert) | **GO** (slice) |
| **C-JCC03-01** | **CLOSED** |
| Evidence pack Layer B | **PASS** 8/8 |
| Full perimeter probe | **PASS** exit **0** (QA + QC independent) |
| Overall release | **GO WITH CONDITIONS** — standing program HOLD_DEPLOY / NOT Phase1 / NOT PROD |
| **Phase 1 / Production / Excellence** | **NOT approved** |

**Not approved:** Production release, Phase 1 / Excellence DONE, OpenAPI/G-BOOT fold-in, deploy `:8088`, or any claim beyond scoped JWT / C-JCC03-01 freshness.

**Fresh-evening note:** Supersedes morning same-day GWC that accepted pack 2/8; evening closes pack process + reconfirms dual-assert probe after BE harden. Not a program upgrade.

## completion_report

- **closed_scope:**
  - Audited evening QA + Dev-BE evidence; QC independently re-ran login spot + HTTPS probe exit **0** (L2 23/23 · L2.5 7/7) with **PASS P-CC-01-jwt** dual (`expiresInSec=86400` **AND** `jwt_delta=86400`); pack verify **8/8 exit 0**.
  - **P-CC-01-jwt CLOSED**; **C-JCC03-01 CLOSED**; **C-HTTPSQC-PACK-01 CLOSED**.
  - Verdict: **GO WITH CONDITIONS** (JWT slice GO; program Phase1/PROD remain standing under HOLD_DEPLOY).
  - U65 zero-seed observed.
- **residual_open (outside JWT slice):**
  - **NOT Phase 1 DONE / NOT PROD-READY / HOLD_DEPLOY** — no `:8088` deploy claim.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: P1-EX-PM-HTTPS-JWT-CLOSE-PROMOTE-20260725-EVE
from_role: qc
to_role: pm
ack_status target: DISPATCHED
residual_auto_fix: true

PM: QC evening **GO WITH CONDITIONS** — P-CC-01-jwt **CLOSED** (dual expiresInSec+jwt_delta=86400); C-JCC03-01 **CLOSED**; C-HTTPSQC-PACK-01 **CLOSED** (pack 8/8). Evidence: docs/qa/evidence/p1-ex-qc-https-p-cc-01-jwt-01-20260725.md (evening supersede; refs QA p1-ex-qa-https-p-cc-01-jwt-01-20260725.md + BE p1-ex-be-https-p-cc-01-jwt-01-20260725.md). Update bus + matrix/journey — mark P-CC-01-jwt HTTPS nip.io ✅ evening freshness dual-assert; do NOT claim Phase1/PROD/:8088. No further JWT dev-be unless dual assert regresses. Continue residual_auto_fix via pm:idle:check.
```

## Handoff packet

```yaml
work_item_id: P1-EX-QC-HTTPS-P-CC-01-JWT-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
decision: GO WITH CONDITIONS
scope: P-CC-01-jwt / C-JCC03-01 freshness (evening dual-assert supersede)
stamp: 2026-07-25 evening
evidence_path: docs/qa/evidence/p1-ex-qc-https-p-cc-01-jwt-01-20260725.md
qa_evidence: docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260725.md
dev_evidence: docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260725.md
verify_method: QC independent login spot + full probe + pack 8/8
conditions_closed:
  - P-CC-01-jwt
  - C-JCC03-01
  - C-HTTPSQC-PACK-01
forbidden_claims:
  - Phase 1 DONE
  - PROD-READY
  - deploy :8088
  - OpenAPI / G-BOOT fold-in
next_owner: pm
```
