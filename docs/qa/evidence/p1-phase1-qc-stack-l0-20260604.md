# QC gate — P1-PHASE1-QC-STACK-L0-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QC-STACK-L0-01` |
| **from_role** | qc |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **qa_evidence** | `docs/qa/evidence/p1-phase1-qa-stack-l0-20260604.md` |
| **executed_at** | 2026-06-04 |

---

## Verdict

**GO WITH CONDITIONS** — bounded **L0 stack + L1 system UAT + pilot login stability (zero 502)** slice only.

**Not claimed:** Phase 1 DONE, Production GO, L2 pilot matrix, L2.5 J-* cross-navigation, full `phase1:gate` / G4–G5 closure.

---

## Evidence pack gate (Layer B)

| Check | Result |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-stack-l0-20260604.md` | **7/8** — fail `crud_or_matrix` only |
| Adjudication | **Process GWC** — CRUD matrix not in scope for `P1-PHASE1-QA-STACK-L0-01` (L0/L1/probe only); do not reject product slice on missing C/R/U/D table |

---

## Classification (ENV vs PRODUCT)

| ID | Item | Class | Gate impact |
|----|------|-------|-------------|
| — | `qc:dev-stack` exit **0** (hrm + xbos **200**) | PRODUCT slice **PASS** | Promotable |
| — | `test:system:uat` **37/37**, `verdict: PASS` in `system-integration-uat-report.json` | PRODUCT slice **PASS** | Promotable |
| — | `probe:stack-stability` **20/20** × **201**, `f502=0` on `https://14-225-217-232.nip.io` | PRODUCT slice **PASS** | Promotable |
| R1 | `pnpm run dev:hrm-api` turbo no-op; QA used `start:dev` | **PRODUCT (tooling)** | **CLOSED** — QA R1 `P1-PHASE1-QA-STACK-R1-VERIFY-01` (2026-06-04) |
| R2 | web-portal `:5173` optional down | **ENV** | Non-blocking for L0 per `qc-dev-stack.mjs` |
| R3 | Historical VPS 502 (DevOps R2) | **informational** | Closed at retest time (zero 502 in probe) |

---

## Layer audit

| Layer | Requirement | QA claim | QC audit |
|-------|-------------|----------|----------|
| **L0** | `pnpm run qc:dev-stack` exit **0** | PASS | **Concurred** — QA table + QC spot-check exit **0** (`2026-06-04`, hrm **200**, xbos **200**; portal optional fail OK) |
| **L1** | `pnpm run test:system:uat` exit **0** | PASS 37/37 | **Concurred** — JSON SoT `verdict: PASS`, `summary.fail: 0`, `started_at` 2026-06-04 |
| **L0 pilot stability** | `probe:stack-stability` zero **502** | PASS 20/20 | **Concurred** — excerpt JSON consistent; aligns DevOps `p1-phase1-do-stack-stability-20260604.md` (30/30 post-warmup) |
| **L2** | P-CC-* matrix | Out of scope | **Not evaluated** — PM dispatch separate wave |
| **L2.5** | J-* journeys | Out of scope | **Not evaluated** — no over-claim; U19 does not apply to this work_item_id |

**P0 stack flap (502):** No open P0 on login path at QA retest; historical 502 mitigated by DevOps warmup/healthchecks (informational).

---

## Conditions (carry)

| ID | Condition | Owner | Expiry / trigger |
|----|-----------|-------|------------------|
| **C-STACKQC-01** | Align `dev:hrm-api` with L0 doc — add `dev` script to `hrm-api` or fix turbo pipeline so `pnpm run dev:hrm-api` runs `start:dev` | **devops** → **CLOSED** | QA `P1-PHASE1-QA-STACK-R1-VERIFY-01` — turbo `hrm-api#dev` → `nest start --watch`; `qc:dev-stack` exit **0** |
| **C-STACKQC-02** | L2/L2.5 pilot matrix + J-* on nip.io (group CEO) | **CLOSED** | QA `P1-PHASE1-QA-STACK-L2-01` — probe **23/23** L2 + **7/7** L2.5; QC L2 addendum § below |

---

## Independent spot-check

| Command | Exit | Note |
|---------|------|------|
| `pnpm run qc:dev-stack` | **0** | QC workstation; optional portal **5173** down — same as QA R2 |

---

## completion_report

**Closed (scoped):** L0 local HRM+XBOS health, L1 system integration UAT **37/37 PASS**, nip.io login stability probe **zero 502**. **Closed (2026-06-04 R1):** **C-STACKQC-01**. **Closed (2026-06-04 L2):** **C-STACKQC-02** — QA `P1-PHASE1-QA-STACK-L2-01` + QC L2 addendum (probe **23/23**, **7/7** on nip.io). **Open:** R-L2-01..06 program/PROD/mobile/browser residuals only — **NOT** Phase 1 DONE / **NOT** PROD.

## next_owner

**pm**

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-DO-STACK-R1-DEV-HRM-API
from_role: pm
to_role: devops
entry_criteria: QC GWC P1-PHASE1-QC-STACK-L0-01 — condition C-STACKQC-01: pnpm run dev:hrm-api must start hrm-api (today turbo no-op; L0 doc says dev:hrm-api).
exit_criteria: pnpm run dev:hrm-api starts Nest on :28001; pnpm run qc:dev-stack exit 0; note in docs/ops/LOCAL_DEV_STACK_L0.md if command changes; ack_status READY_FOR_QA or PASS_TO_PM with evidence_path docs/ops/evidence/p1-phase1-do-stack-r1-dev-hrm-api-YYYYMMDD.md
evidence_path: docs/ops/evidence/p1-phase1-do-stack-r1-dev-hrm-api-YYYYMMDD.md
```

Alternate (parallel): dispatch QA L2/L2.5 wave with explicit J-* ids — stack slice already **GWC**; do not claim Phase 1 DONE.

## evidence_path

`docs/qa/evidence/p1-phase1-qc-stack-l0-20260604.md`

## ack_status

**PASS_TO_PM**

---

## R1 addendum — `P1-PHASE1-QC-STACK-R1-VERIFY-01` (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QC-STACK-R1-VERIFY-01` |
| **from_role** | qc |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **qa_evidence** | `docs/qa/evidence/p1-phase1-qa-stack-l0-20260604.md` § R1 retest |
| **executed_at** | 2026-06-04 |

### Verdict

**PASS** — **C-STACKQC-01 CLOSED** (concurs QA § R1). No reopen unless `dev:hrm-api` regresses to turbo no-op.

Parent slice **GO WITH CONDITIONS** (`P1-PHASE1-QC-STACK-L0-01`) unchanged — **not** Phase 1 DONE / **not** PROD / **not** L2.5.

### Evidence pack gate (R1)

| Check | Result |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-stack-l0-20260604.md` | **7/8** — fail `crud_or_matrix` only |
| Adjudication | **Process GWC** — L0/R1 slice; CRUD matrix out of scope (same as L0-01 gate) |

### R1 audit (concurrence)

| Check | QA claim | QC |
|-------|----------|-----|
| `turbo run dev --filter=hrm-api --dry-run` | `hrm-api#dev` → `nest start --watch` | **Concurred** — aligns `docs/ops/evidence/p1-phase1-do-stack-r1-dev-hrm-api-20260604.md` |
| `pnpm run dev:hrm-api` | turbo executes Nest (EADDRINUSE acceptable if :28001 already up) | **Concurred** — tooling fix verified; not empty turbo scope |
| `pnpm run qc:dev-stack` | exit **0**, hrm/xbos **200** | **Concurred** — QC spot-check exit **0** (`2026-06-04`; portal **5173** optional fail = **ENV**, non-blocking) |

### Condition status (post-R1)

| ID | Status | Note |
|----|--------|------|
| **C-STACKQC-01** | **CLOSED** | DevOps R1 + QA R1 + QC R1 — do **not** re-dispatch `P1-PHASE1-DO-STACK-R1-DEV-HRM-API` |
| **C-STACKQC-02** | **CLOSED** | QA `P1-PHASE1-QA-STACK-L2-01` + QC L2 addendum — do **not** re-dispatch stack L2 wave unless probe regression |

### completion_report (R1)

**Closed:** **C-STACKQC-01** / stack R1 residual — `dev:hrm-api` runs `nest start --watch` via turbo; L0 health reproducible. **Closed (L2 wave):** **C-STACKQC-02** — see L2 addendum. **Open:** R-L2-01..06 (program, PROD, mobile, optional browser, J-XBOS-02, member browser); Phase 1 / Production claims still forbidden.

### next_owner

**pm**

### next_dispatch_prompt (R1)

```
work_item_id: P1-PHASE1-PM-STACK-SLICE-NEXT
from_role: pm
to_role: qa
entry_criteria: QC PASS_TO_PM P1-PHASE1-QC-STACK-R1-VERIFY-01 — C-STACKQC-01 CLOSED; L0+L1 stack slice GWC per docs/qa/evidence/p1-phase1-qc-stack-l0-20260604.md; do not re-open dev:hrm-api unless regression.
exit_criteria: Dispatch L2 P-CC-* and/or L2.5 J-* from docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md + docs/program/PROGRAM_JOURNEY_MAP.md with explicit ids; evidence_path dated QA MD; ack_status PASS_TO_PM; NOT Phase 1 DONE.
evidence_path: docs/qa/evidence/p1-phase1-qa-stack-l2-YYYYMMDD.md
```

### evidence_path (R1)

`docs/qa/evidence/p1-phase1-qc-stack-l0-20260604.md` (this addendum)

### ack_status (R1)

**PASS_TO_PM**

---

## L2 addendum — `P1-PHASE1-QC-STACK-L2-01` (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QC-STACK-L2-01` |
| **from_role** | qc |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **qa_evidence** | `docs/qa/evidence/p1-phase1-qa-stack-l2-20260604.md` |
| **executed_at** | 2026-06-04 |

### Verdict

**GO WITH CONDITIONS** — bounded **L2 P-CC-01..09 + L2.5 J-CC-01..03 + J-HRM-01..08** (group CEO, HTTPS nip.io, API probe path) on stack promotion slice.

**C-STACKQC-02 CLOSED** (concurs QA). **Not claimed:** Phase 1 DONE, PROD-READY, full program QC GO, mobile J-MOB-03..05 device L2.5.

### Evidence pack gate (L2)

| Check | Result |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-stack-l2-20260604.md` | **7/8** — fail `command_table` only |
| Adjudication | **Process GWC** — L2/L2.5 probe slice; missing formal command table does not block product concurrence when stdout + exit **0** are recorded in § A |

### Layer audit (L2 / L2.5 — U19)

| Layer | Requirement | QA claim | QC audit |
|-------|-------------|----------|----------|
| **L2** | P-CC-01..09 matrix (group CEO, nip.io) | **23/23 PASS** | **Concurred** — QA § A stdout + QC spot-check probe exit **0** (`2026-06-04`) |
| **L2.5** | J-CC-01..03, J-HRM-01..08 (+ J-XBOS-01 partial) | **7/7 PASS** (probe journeys) | **Concurred** — explicit J-* table in QA § C; aligns `PROGRAM_JOURNEY_MAP.md` in-scope ids |
| **Gap** | P-CC-03 catalog-sync CONNECTED | **200** `connected` | **Concurred** — QA § D |
| **L0/L1** | Parent stack slice | GWC from L0-01 | **Unchanged** — not re-opened |

**J-* deferred (not blocking stack L2 gate):** J-MOB-01..05 (mobile), optional browser iframe clicks (R-L2-04), J-XBOS-02 E2E (R-L2-05), member CEO browser L2.5 (R-L2-06 / C-RBACQC-04).

### Condition status (post-L2)

| ID | Status | Note |
|----|--------|------|
| **C-STACKQC-01** | **CLOSED** | Unchanged — R1 |
| **C-STACKQC-02** | **CLOSED** | L2 **23/23** + L2.5 **7/7** on `https://14-225-217-232.nip.io`, `ceo@xe.vn` |

### Residuals (GWC carry — R-L2 only)

| ID | Item | Class | Gate impact |
|----|------|-------|-------------|
| **R-L2-01** | Phase 1 program / UC matrix closure | PROGRAM | **NOT Phase 1 DONE** |
| **R-L2-02** | PROD-READY / security deploy evidence | PROGRAM | **NOT PROD** — 🔴 unchanged |
| **R-L2-03** | Mobile J-MOB-03..05 device L2.5 | PRODUCT (out of slice) | Separate `dev-mobile` / `qa` wave |
| **R-L2-04** | Browser iframe P-CC UI click paths | **GWC optional** | API L2.5 sufficient for this stack slice |
| **R-L2-05** | J-XBOS-02 catalog publish → HRM sync E2E | PRODUCT partial | `dev-be` when in scope |
| **R-L2-06** | Member CEO browser L2.5 (C-RBACQC-04) | PRODUCT deferred | API negatives PASS; browser separate |

### Independent spot-check

| Command | Exit | Note |
|---------|------|------|
| `node scripts/tmp-p1-ex-qa-https-01-probe.mjs` (`PORTAL_DEV_URL=https://14-225-217-232.nip.io`) | **0** | QC **2026-06-04** — **23/23** L2, **7/7** L2.5 (matches QA) |

### completion_report (L2)

**Closed:** **C-STACKQC-02** — stack slice L2/L2.5 promotable for group CEO Command Center + HRM embed on pilot HTTPS (API path). **Open:** R-L2-01..06 only; no Phase 1 / PROD promotion from this gate.

### next_owner

**pm**

### next_dispatch_prompt (L2)

```
work_item_id: P1-PHASE1-PM-STACK-SLICE-STATUS
from_role: pm
to_role: pm
entry_criteria: QC PASS_TO_PM P1-PHASE1-QC-STACK-L2-01 — C-STACKQC-01+02 CLOSED per docs/qa/evidence/p1-phase1-qc-stack-l0-20260604.md (L2 addendum); stack slice GWC L0+L1+L2+L2.5 API on nip.io for ceo@xe.vn; residuals R-L2-01..06 only.
exit_criteria: Refresh SERVICE_READINESS / USER_SERVICE_STATUS stack row (UAT slice — not PROD); bus PM->USER summary; optional dispatch qa mobile J-MOB or qc program gate — do NOT claim Phase 1 DONE.
evidence_path: docs/qa/evidence/p1-phase1-qc-stack-l0-20260604.md
```

Alternate: `technical-manager` narrow scope_parity audit if PM promotes beyond stack slice.

### evidence_path (L2)

`docs/qa/evidence/p1-phase1-qc-stack-l0-20260604.md` (this L2 addendum)

### ack_status (L2)

**PASS_TO_PM**
