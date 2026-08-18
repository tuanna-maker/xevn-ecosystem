# QC Gate Decision — QC-HRM-REC-WF-OPTION-B-01 (2026-07-25)

work_item_id: `QC-HRM-REC-WF-OPTION-B-01`
ack_status: `PASS_TO_PM`
variant: **re-gate after PACK-01**

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-REC-WF-OPTION-B-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-07-25` |
| **decision** | **GO WITH CONDITIONS** — Option B local product PASS; residuals ENV P2 + doc P3 only |
| **prior decision** | **NO-GO (process)** — Layer B `command_table` incomplete (same file, earlier turn) |
| **scope** | REC-WF **Option B** company partition — **local only** · HOLD_DEPLOY |
| **environment** | Local portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` |
| **persona** | `ceo@xe.vn` · `du-lich.ceo@xe.vn` |
| **HOLD_DEPLOY** | **honored** — **no** `:8088` / Bay.vn / R2 / Phase1 / PROD claim |
| **U65** | zero-seed — QA chain reports **none** |
| **Phase1 / PROD** | **NONE** — **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** `:8088` |
| **sponsor 1B** | HOLD_DEPLOY honored |

---

## 1. Mission / scope audited

Re-gate after `QA-HRM-REC-WF-OPTION-B-01-PACK-01` closed Layer B (Command table). Product claims unchanged from QA retest after SPAWN-FIX.

**In-scope promoted:** AC-REC-WF-OPT-B-01/02 · DUAL · J-REC-WF-02/03 · must_keep SPAWN-MISSING · prior D-SPAWN / D-DUAL **CLOSED local**.

**Explicitly not approved:** Phase 1 DONE · PROD-READY · `:8088` UF · Bay.vn · R2 · AC-OPT-B-03 fallback · VISUN LE live spawn pick.

---

## 2. Evidence consumed

| # | Artifact | Role | Status |
|---|----------|------|--------|
| 1 | `docs/qa/evidence/qa-hrm-rec-wf-option-b-01-20260725-retest.md` | QA | **READY_FOR_QC** — product PASS + Command table · pack **8/8** |
| 2 | `docs/qa/evidence/be-hrm-rec-wf-option-b-spawn-fix-01-20260725.md` | Dev-BE | JWT submitter + version MAX+1 · READY_FOR_QA |
| 3 | `docs/qa/evidence/qa-hrm-rec-wf-option-b-01-20260725.md` | QA prior | FAIL — spawnMissing + UNIQUE (superseded by retest) |
| 4 | This file (prior turn) | QC | NO-GO process — Layer B FAIL |
| 5 | ADR-HRM-SETTINGS-SOT-REC-WF-COMPANY-20260723 §3 Option B | ADR | Normative partition pick |
| 6 | `docs/program/PROGRAM_JOURNEY_MAP.md` | Journey | J-REC-WF-02/03 must_keep (prior R2 ✅; this wave re-confirms spawn + inbox smoke local) |

---

## 3. Evidence pack integrity (Layer B — PASS)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-rec-wf-option-b-01-20260725-retest.md
→ exit 0 — PASS: QC evidence pack ready (8/8)
```

| Check | Result |
|-------|--------|
| Pack completeness | **8/8 PASS** |
| **C-OPT-B-QA-PACK-01** | **CLOSED** (process) |
| Layer B process gate | **PASS** — product GWC authorized |

Portal URL (QA slice): `http://127.0.0.1:5173`

---

## 4. Product audit (promoted)

Cross-check QA retest vs ADR Option B + BE SPAWN-FIX + prior FAIL. Pack exit 0 → provisional rows **promoted**.

| ID | ADR / must_keep | Prior FAIL | QA retest | QC |
|----|-----------------|------------|-----------|-----|
| **J-REC-WF-02** | Holding submit → instance; Bearer alone | `spawnMissing:true` | `spawnMissing:false` + wi (`HRM-REC-WF-200`) | **CONCUR PASS** |
| **AC-REC-WF-OPT-B-DUAL** | ≥2 active defs, distinct partition | UNIQUE 500 | POST **201** v2/v3 | **CONCUR PASS** |
| **AC-REC-WF-OPT-B-02** | Holding → group-wide | N/A (no wi) | `definition_id=944c9abf-…` | **CONCUR PASS** |
| **AC-REC-WF-OPT-B-01** | Member → override ≠ group | N/A | `du-lich.ceo` → `dd86a5e9-…` | **CONCUR PASS** |
| **must_keep SPAWN-MISSING** | Banner only when no def | False-negative | Active def → `spawnMissing:false` | **CONCUR PASS** |
| **J-REC-WF-03** | Inbox smoke if spawned | BLOCKED | `related≥2`; **no approve seed** | **CONCUR PASS** (smoke; full approve→HRM sync = prior map ✅, not re-claimed) |

### Prior FAIL closure (formal)

| Defect | Status |
|--------|--------|
| **D-HRM-REC-WF-SPAWN-8088-01** / spawnMissing false-negative | **CLOSED local** (Bearer-only; **not** asserted on `:8088`) |
| **D-HRM-REC-WF-OPTION-B-DUAL-01** UNIQUE version | **CLOSED local** |
| Local hrm TS compile blocking L0 | **CLOSED** this WI |

### L1 unit (QA Command table)

| Suite | Result |
|-------|--------|
| xbos `workflow-apply-scope` + `workflow-engine.service` | **26/26 PASS** |
| hrm `resolve-submitter-user-id` + `recruitment-workflow.bridge` | **23/23 PASS** |

---

## 5. L2.5 journey coverage (U19)

| ID | QA | QC | Note |
|----|----|----|------|
| **J-REC-WF-02** | **PASS** | **PASS** | Instance spawn + Bearer; SoT path `/instances/:id/detail` |
| **J-REC-WF-03** | **PASS** (inbox list smoke) | **PASS** | related tasks; **cấm** seed approve |
| Full approve→HRM sync | Prior map ✅ | Deferred | Out of Option B delta exit |
| `:8088` | ⬜ HOLD | ⬜ deferred | HOLD_DEPLOY — not a product FAIL |

**U19:** In-scope J-02/03 have PASS rows — **not** L1-only. Slice GWC ≠ journey map R2 rewrite / Bay.vn.

---

## 6. Commands / QC spot (re-gate 2026-07-25)

| Command / check | Exit | Verdict | Class |
|-----------------|------|---------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-rec-wf-option-b-01-20260725-retest.md` | **0** | **PASS 8/8** | **Process** |
| Full `pnpm run qc:dev-stack` re-spot | not run | — | ENV optional; flaky residual listed |
| Live browser re-spot Option B | not re-run | — | Rely QA probe + pack integrity (PM: no full re-matrix) |

---

## 7. Classification

| Finding | Type | Gate impact |
|---------|------|-------------|
| Pack Command table (PACK-01) | **PROCESS** | **CLOSED** — verify exit 0 |
| Prior spawnMissing / UNIQUE | **PRODUCT** | **CLOSED local** — promote |
| R-HRM-LOCAL-STACK-FLAKY-01 portal/hrm intermittent | **ENV P2** | **GWC condition** (not product NO-GO) |
| R-WF-INSTANCE-GET-PATH-01 bare GET 404 | **PROCESS/DOC P3** | **GWC condition** |
| AC-OPT-B-03 / VISUN persona spawn | **PRODUCT P2/P3 defer** | Out of exit — not NO-GO |
| Phase1 / PROD / `:8088` / Bay.vn / R2 | **Process** | **Forbidden** to promote |

---

## Residual (GO WITH CONDITIONS)

| ID | Severity | Owner | Status |
|----|----------|-------|--------|
| **C-OPT-B-QA-PACK-01** | Process P0 | `qa` | **CLOSED** |
| **R-HRM-LOCAL-STACK-FLAKY-01** | ENV **P2** | `devops` | **OPEN** — GWC condition; dispatch if sponsor needs stable browser window |
| **R-WF-INSTANCE-GET-PATH-01** | **P3** | `dev-be` / docs | **OPEN** — document SoT `instances/:id/detail` |
| **AC-REC-WF-OPT-B-03** | P2 defer | `qa` later | Out of slice |
| Phase1 / PROD / `:8088` / Bay.vn / R2 | — | — | **not promoted** |

**No product P0/P1 residual** on Option B local scope.

---

## 9. Gate decision

### **GO WITH CONDITIONS** — Option B local

**Promoted:** J-REC-WF-02/03 · AC-OPT-B-01/02 · DUAL · SPAWN-MISSING must_keep · prior spawn/UNIQUE defects **CLOSED local**.

**Conditions (only):**

1. **R-HRM-LOCAL-STACK-FLAKY-01** (P2 · devops) — portal/hrm intermittent; not Option B logic fail.
2. **R-WF-INSTANCE-GET-PATH-01** (P3 · docs/BE) — probe SoT path `/detail`.
3. **HOLD_DEPLOY** — **NOT** Phase 1 DONE · **NOT** PROD · **NOT** `:8088` / Bay.vn / R2.

**Process:** Prior NO-GO Layer B superseded; **C-OPT-B-QA-PACK-01 CLOSED**.

---

## 10. Handoff contract

```yaml
work_item_id: QC-HRM-REC-WF-OPTION-B-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/qc-hrm-rec-wf-option-b-01-20260725.md
decision: GO WITH CONDITIONS
HOLD_DEPLOY: true
completion_report: |
  Closed: Re-gate after PACK-01 — pack verify 8/8 exit 0; C-OPT-B-QA-PACK-01 CLOSED.
  Product CONCUR: spawnMissing/UNIQUE CLOSED local; J-REC-WF-02/03 + AC-OPT-B-01/02 PASS.
  Verdict GO WITH CONDITIONS — residuals R-HRM-LOCAL-STACK-FLAKY-01 P2 + R-WF-INSTANCE-GET-PATH-01 P3 only.
  Cấm Phase1/PROD/:8088/Bay.vn/R2.
next_owner: pm
residual_auto_fix: true
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: D-OPS-HRM-LOCAL-STACK-FLAKY-01
from_role: pm
to_role: devops
entry_criteria: QC GWC docs/qa/evidence/qc-hrm-rec-wf-option-b-01-20260725.md · residual R-HRM-LOCAL-STACK-FLAKY-01 P2 · Option B product CLOSED local · HOLD_DEPLOY
exit_criteria:
  (1) Stabilize local portal :5173 + hrm :28001 (dist wipe / port contention) for sponsor browser window
  (2) qc:dev-stack or equivalent smoke green; evidence short note
  (3) Do not deploy :8088 / Bay.vn / R2 unless sponsor unlocks HOLD_DEPLOY
  (4) Optional parallel P3: docs note SoT GET instances/:id/detail (R-WF-INSTANCE-GET-PATH-01) — owner docs or dev-be
evidence_path: docs/qa/evidence/devops-hrm-local-stack-flaky-01-20260725.md
cấm: Phase1 DONE claim · PROD · seed for UF · promote Option B to :8088 without new QA wave
```

**Alternate (if sponsor defers ops):** PM may close wave idle with residuals tracked — **no** Phase1/PROD promotion.

**evidence_path:** `docs/qa/evidence/qc-hrm-rec-wf-option-b-01-20260725.md`

**ack_status:** **PASS_TO_PM**
