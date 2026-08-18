# QC Gate Decision — P1-EX-QC-HTTPS-P-CC-01-JWT-01 (2026-07-27 freshness)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QC-HTTPS-P-CC-01-JWT-01` |
| from_role | `qc` |
| to_role | `pm` |
| execution_date | `2026-07-27` |
| stamp | **morning freshness re-gate** (post BE + QA PASS_TO_PM same day) |
| decision | **GO WITH CONDITIONS** — scoped **P-CC-01-jwt** / **C-JCC03-01** freshness closed; dual assert `expiresInSec=86400` **AND** `jwt_delta=86400` |
| environment | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` · holding / main scope via probe |
| ack_status | **PASS_TO_PM** |
| residual_auto_fix | `true` |
| U65 | zero-seed — **no** seed in evidence chain (BE/QA/QC) |
| HOLD_DEPLOY | **yes** |
| Phase1 / PROD / :8088 claim | **NONE** (U70) |

> **Freshness reconfirm** of prior evening GWC `docs/qa/evidence/p1-ex-qc-https-p-cc-01-jwt-01-20260725.md`. Does **not** reopen product TTL; closes QA residual «C-JCC03-01 OPEN for QC reconfirm».

## Scope audited

1. Dev-BE `P1-EX-BE-HTTPS-P-CC-01-JWT-01` — live dual 86400; probe exit 0; `READY_FOR_QA`
2. QA `P1-EX-QA-HTTPS-P-CC-01-JWT-01` — independent retest; `PASS_TO_PM`
3. QC independent login spot + full HTTPS probe + pack verify

**In scope:** **P-CC-01-jwt** dual TTL; close / reconfirm **C-JCC03-01**; perimeter probe exit **0**; evidence-pack integrity.

**Explicitly out of scope:** Phase 1 DONE; Production / PROD-READY; OpenAPI; G-BOOT; browser UF promote beyond API probe L2/L2.5; deploy `:8088`.

## Evidence consumed

| # | Artifact | Role | Verdict used |
|---|----------|------|--------------|
| 1 | `docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260727.md` | QA | **Authoritative** — probe exit **0**; `PASS P-CC-01-jwt` dual; L2 23/23 · L2.5 7/7; pack 8/8 |
| 2 | `docs/qa/evidence/p1-ex-be-https-p-cc-01-jwt-01-20260727.md` | Dev-BE | Live 86400/86400; jest 10/10; no TTL product change this wave |
| 3 | `docs/qa/evidence/p1-ex-qc-https-p-cc-01-jwt-01-20260725.md` | QC prior | Evening GWC closed same IDs — **reconfirmed** 2026-07-27 |
| 4 | `docs/program/PROGRAM_JOURNEY_MAP.md` | Journey | **J-CC-03** ✅ L2 — probe `PASS J-CC-03` collateral |

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260727.md
```

| Result | Detail |
|--------|--------|
| Exit **0** | **PASS: QC evidence pack ready (8/8)** |
| Checks | work_item_id, ack_status, portal_url (nip.io), journey_l25, crud_or_matrix, command_table, residual_section, timestamp — **all PASS** |

## Classification (ENV vs PRODUCT)

| Signal | Class | JWT gate impact |
|--------|-------|-----------------|
| `P-CC-01-jwt` **PASS** dual `expiresInSec=86400` **AND** `jwt_delta=86400` | **PRODUCT — CLOSED** | Satisfies **C-JCC03-01** freshness |
| Full HTTPS probe exit **0** (L2 23/23 · L2.5 7/7) | **PRODUCT — PASS** | Perimeter green; no JWT regression |
| Historic `43200` stale pilot | **PRODUCT — CLOSED** | Not reproducible (BE + QA + QC all green) |
| Evidence-pack 8/8 | **PROCESS — PASS** | No process NO-GO |
| Stack / ECONNREFUSED | **N/A** | QC reached nip.io; exit **0** |

## QC verification method (2026-07-27)

**Method:** Independent QC re-run of login spot **+** full HTTPS probe (not only accept QA log) **+** pack verify exit 0.

| Check | Method | Result |
|-------|--------|--------|
| Login / JWT contract | **QC independent** `node -e` login spot | **201** · `expiresInSec=**86400**` · `jwt_delta=**86400**` · `XBOS-AUTH-200` · `pass=true` |
| HTTPS probe (JWT + perimeter) | **QC independent** `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs` | Exit **0** · **PASS** `P-CC-01-login` · **PASS** `P-CC-01-jwt` · L2 **23/23** · L2.5 **7/7** |
| Pack integrity | `pnpm run verify:qc:evidence-pack -- --evidence …qa…20260727.md` | Exit **0** · **8/8** |
| BE alignment | BE evidence login + probe + jest | Matches QA + QC |

### Command table (QC)

| Command | Exit | Notes |
|---------|------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260727.md` | **0** | Pack **8/8** |
| `node -e "(async()=>{…login spot dual…})()"` | **0** | `expiresInSec=86400` · `jwt_delta=86400` · `pass=true` |
| `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs` | **0** | QC independent; **PASS P-CC-01-jwt**; L2 23/23; L2.5 7/7 |

U65 zero-seed observed (login + probe only).

## Gate matrix (P-CC-01-jwt / C-JCC03-01 only)

| Gate | Expected | Actual (QA + Dev-BE + QC) | Verdict |
|------|----------|---------------------------|---------|
| **P-CC-01-login** | HTTP **201** `XBOS-AUTH-200` | **201** | **PASS** |
| **P-CC-01-jwt** | `expiresInSec=86400` **AND** `jwt_delta=86400` | Dual **86400**; probe **PASS**; QC probe **PASS** | **PASS** → **CLOSED** |
| **C-JCC03-01** | JWT/probe-linked residual freshness | Freshness 2026-07-27; `PASS J-CC-03` | **CLOSED** |
| Full probe script | Exit **0** | QA + QC independent exit **0** | **PASS** |
| Evidence pack | Exit **0** 8/8 | QC verify **0** | **PASS** |
| Production / Phase 1 DONE | Out of slice | Not claimed | N/A |

## L2 / L2.5 journey coverage audit (U19)

| Journey / row | Requirement | In JWT slice? | Verdict |
|---------------|-------------|---------------|---------|
| **P-CC-01** | Login + JWT 24h dual | **Yes** | **PASS** |
| **J-CC-03** | KPI rollup (JWT/probe-linked carry) | Yes (residual link) | **PASS** (probe) |
| **J-HRM-01..07** | L2.5 API probe rows | Collateral | **PASS** 7/7 (probe) — **not** claimed as browser U65 UF promote |
| **J-XBOS-01-tasks** | Workflow tasks | Collateral | **PASS** (probe) |
| Browser click-path UF | Out of JWT residual close | **No** | Deferred / not required for **C-JCC03-01** |

**U19:** In-scope JWT slice has PASS evidence; no mandatory J-* left ⏳ for this condition close.

**J-* tested PASS (this gate):** J-CC-03, J-HRM-01..07, J-XBOS-01-tasks (API probe).  
**Deferred:** browser embed U65 UF promote — standing program, not JWT NO-GO.

## Conditions — closed vs remaining

### Closed / confirmed by this freshness gate

| ID | Source | Closure | Evidence refs |
|----|--------|---------|---------------|
| **P-CC-01-jwt** | QC GWC residual / historic `43200` | **CLOSED** (2026-07-27 dual-assert freshness) | QA + BE + QC probe exit **0** |
| **C-JCC03-01** | Prior QC + QA «OPEN for QC reconfirm» | **CLOSED** (freshness stamp 2026-07-27) | Same + probe `PASS J-CC-03` |

### Remaining conditions (standing — **not** JWT product NO-GO)

| ID | Condition | Owner | Notes |
|----|-----------|-------|-------|
| **C-JCC03-05** / program | Not Production / not Phase 1 DONE | PM/QC | **NOT Phase 1 DONE** · **NOT PROD-READY** · HOLD_DEPLOY · NOT `:8088` |
| OpenAPI / G-BOOT | Explicit cấm this Task | — | Not reopened |

## Residual

| ID | Severity | Status | Owner | Note |
|----|----------|--------|-------|------|
| **P-CC-01-jwt** | P2 | **CLOSED** | — | Freshness dual 86400 · 2026-07-27 |
| **C-JCC03-01** | Condition | **CLOSED** | — | Freshness reconfirm closed |
| Phase 1 / Production / :8088 | Program | **OPEN** | PM | Explicitly **not** claimed · HOLD_DEPLOY |

**No residual remaining inside JWT / C-JCC03-01 slice.**

## Decision summary

| Tier | Verdict |
|------|---------|
| **P-CC-01-jwt** on HTTPS pilot (dual assert) | **GO** (slice) |
| **C-JCC03-01** | **CLOSED** |
| Evidence pack Layer B | **PASS** 8/8 |
| Full perimeter probe | **PASS** exit **0** (QA + QC independent) |
| Overall release | **GO WITH CONDITIONS** — standing program HOLD_DEPLOY / NOT Phase1 / NOT PROD / NOT `:8088` |
| **Phase 1 / Production / Excellence** | **NOT approved** |

**Not approved:** Production release, Phase 1 / Excellence DONE, OpenAPI/G-BOOT fold-in, deploy `:8088`, or any claim beyond scoped JWT / C-JCC03-01 freshness.

## completion_report

- **closed_scope:**
  - Audited QA + Dev-BE 2026-07-27 evidence; QC independently re-ran login spot + HTTPS probe exit **0** (L2 23/23 · L2.5 7/7) with **PASS P-CC-01-jwt** dual (`expiresInSec=86400` **AND** `jwt_delta=86400`); pack verify **8/8 exit 0**.
  - **P-CC-01-jwt CLOSED**; **C-JCC03-01 CLOSED** (QA freshness reconfirm satisfied).
  - Verdict: **GO WITH CONDITIONS** (JWT slice GO; program Phase1/PROD remain standing under HOLD_DEPLOY).
  - U65 zero-seed observed.
- **residual_open (outside JWT slice):**
  - **NOT Phase 1 DONE / NOT PROD-READY / HOLD_DEPLOY** — no `:8088` deploy claim.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: P1-EX-PM-HTTPS-JWT-CLOSE-PROMOTE-20260727
from_role: qc
to_role: pm
ack_status target: DISPATCHED
residual_auto_fix: true

PM: QC **GO WITH CONDITIONS** — P-CC-01-jwt **CLOSED** (dual expiresInSec+jwt_delta=86400); C-JCC03-01 **CLOSED** (freshness 2026-07-27). Evidence: docs/qa/evidence/p1-ex-qc-https-p-cc-01-jwt-01-20260727.md (refs QA p1-ex-qa-https-p-cc-01-jwt-01-20260727.md + BE p1-ex-be-https-p-cc-01-jwt-01-20260727.md). Update bus + matrix/journey — mark P-CC-01-jwt HTTPS nip.io ✅ freshness dual-assert; do NOT claim Phase1/PROD/:8088. No further JWT dev-be unless dual assert regresses. Continue residual_auto_fix via pm:idle:check — next open P0/P1 outside JWT slice.
```

## Handoff packet

```yaml
work_item_id: P1-EX-QC-HTTPS-P-CC-01-JWT-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
decision: GO WITH CONDITIONS
evidence_path: docs/qa/evidence/p1-ex-qc-https-p-cc-01-jwt-01-20260727.md
closed:
  - P-CC-01-jwt
  - C-JCC03-01
conditions_standing:
  - HOLD_DEPLOY
  - NOT Phase1 DONE
  - NOT PROD-READY
  - NOT :8088 (U70)
next_owner: pm
U65: zero-seed affirmed
```
