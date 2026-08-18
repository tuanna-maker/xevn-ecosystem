# QC Gate Decision — XHRM-REC-WF-QC-01 (2026-07-19)

| Field | Value |
|-------|--------|
| **work_item_id** | `XHRM-REC-WF-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **change_mode** | GATE |
| **environment** | portal `:5173` · hrm `:28001` · xbos `:28002` |
| **accounts** | `ceo@xe.vn` · Group CEO · JWT `xevn`/`main` |
| **executed_at** | `2026-07-19` |
| **program** | XBOS ↔ HRM Recruitment Workflow Bridge (submit-workflow P0 close) |
| **spec_ref** | `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` · J-REC-WF-02 · AC-REC-WF-02 · UF-HRM-12 · ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE |
| **decision** | **GO WITH CONDITIONS** — P0 submit-scope closed; SPAWN-MISSING alternate PASS; inbox J-03/06 deferred under U65 |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

QC audited the chain **QA-01 FAIL** → **BE-02 READY** → **QA-02 PASS_TO_PM**. Product evidence shows requisition `POST .../submit-workflow` returns **201** `HRM-REC-WF-200` with `spawnMissing: true` (not 500). FE yellow **SPAWN-MISSING** banner + status «Chờ duyệt QT» / `pending_approval` / `workflow_instance_id: null` matches AC-REC-WF-02 alternate. **D-XHRM-REC-WF-SUBMIT-SCOPE** is **CLOSED**.

Smokes **UF-HRM-12** + **J-REC-WF-04** **PASS**. **J-REC-WF-03 / J-REC-WF-06** remain **🟡 BLOCKED** without FE-created WF definition + instance — **acceptable residual** under U65 (cấm seed inbox; **cấm require** inbox approve this gate).

**NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** full J-REC-WF-01..06 program exit.

---

## Chain audited

| Lane | Evidence | Verdict |
|------|----------|---------|
| qa prior | `docs/qa/evidence/xhrm-rec-wf-qa-01-20260719.md` | **FAIL_TO_PM** — P0 `tenantId?.trim is not a function` on requisition submit-workflow |
| dev-be | `docs/qa/evidence/xhrm-rec-wf-be-02-20260719.md` | **READY_FOR_QA** — `toHrmListScopeContext(tenantId)` + jest 8 suites / 53 tests |
| qa retest | `docs/qa/evidence/xhrm-rec-wf-qa-02-20260719.md` | **PASS_TO_PM** — J-02 **201** + SPAWN-MISSING; UF12 + J-04 smoke |
| screenshot | `docs/qa/evidence/xhrm-rec-wf-qa-02-spawn-missing-20260719.png` | **PASS** — banner + «Chờ duyệt QT» on `QA REC-WF UF12 20260719` |
| qc (this) | `docs/qa/evidence/xhrm-rec-wf-qc-01-20260719.md` | **GO WITH CONDITIONS** |

---

## Evidence pack gate (Layer B)

| File | verify exit | Score | QC adjudication |
|------|-------------|-------|-----------------|
| `xhrm-rec-wf-qa-02-20260719.md` | **1** | **1/8 fail** (`command_table` only) | **PROCESS** — format gap; **not** product NO-GO (substance: L0, journey matrix with PASS, residuals, screenshot, U65) |

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/xhrm-rec-wf-qa-02-20260719.md
# FAIL: QC evidence pack incomplete (1/8 checks)
#   - command_table: Include command table with exit codes (pnpm, adb, or node; PASS/FAIL or exit 0/1)
```

| QC spot command | Result |
|-----------------|--------|
| `pnpm run qc:dev-stack` | hrm **200** · xbos **200** · portal `:5173` **200** — **PASS** (Windows node UV assertion after healthy print — ENV noise, not stack down) |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| QA L0 hrm/xbos/portal **200** | ENV | **PASS** |
| QC `qc:dev-stack` 200×3 | ENV | **PASS** |
| `verify:qc:evidence-pack` 1/8 (`command_table`) | PROCESS | **GWC** → **C-XHRM-REC-WF-01** (non-blocking) |
| Prior P0 `tenantId?.trim` / submit 500 | PRODUCT | **CLOSED** — **D-XHRM-REC-WF-SUBMIT-SCOPE** — **do not reopen** |
| **J-REC-WF-02** submit **201** + SPAWN-MISSING | PRODUCT L2.5 | **PASS** |
| **UF-HRM-12** create requisition **201** | PRODUCT | **PASS** |
| **J-REC-WF-04** start-pipeline SPAWN-MISSING | PRODUCT smoke | **PASS** |
| **J-REC-WF-03 / J-06** inbox approve/reject | OUT OF SLICE (no instance) | **🟡 BLOCKED** acceptable → **C-XHRM-REC-WF-02** — **cấm require** / **cấm seed** |
| No active `hrm_requisition_approval` def | PRODUCT expected alternate | **PASS** AC alternate (SPAWN-MISSING) → **C-XHRM-REC-WF-03** (FE canvas later) |
| XBOS spawn payload 400 logged then mapped 2xx | PRODUCT P2 optional | **OPEN** → **C-XHRM-REC-WF-04** (when defs exist) |
| LOCKED UI / 409 with active instance | OUT OF SLICE | **UNTESTED** → **C-XHRM-REC-WF-05** |
| Seed in evidence | PROCESS U65 | **PASS** — none |
| Phase 1 DONE / PROD | OUT OF SLICE | **NOT claimed** → **C-XHRM-REC-WF-06** |

---

## L0 — Dev stack health

| Check | Source | Result |
|-------|--------|--------|
| hrm-api `:28001` | QA-02 + QC spot | HTTP **200** — **PASS** |
| xbos-api `:28002` | QA-02 + QC spot | HTTP **200** — **PASS** |
| web-portal `:5173` | QA-02 + QC spot | HTTP **200** — **PASS** |
| Mid-wave DB reset (QA residual OPS) | QA-02 | P3 ops noted — UF12 retry PASS after restart; **not** product NO-GO |

---

## Defect close audit

| Defect ID | Prior | Evidence close | QC |
|-----------|-------|----------------|-----|
| **D-XHRM-REC-WF-SUBMIT-SCOPE** | QA-01 **P0 FAIL** — headers bag → `.trim()` → **500** | BE-02 fix + jest; QA-02 browser **201** `HRM-REC-WF-200` + SPAWN-MISSING | **CLOSED** |

---

## L2.5 journey coverage (U19)

| Journey | In this gate? | Status |
|---------|---------------|--------|
| **J-REC-WF-02** | **Yes** (mandatory — P0 close) | **PASS** — Gửi duyệt QT → POST submit-workflow **201** · `spawnMissing: true` · banner SPAWN-MISSING · pending_approval |
| **J-REC-WF-04** | Yes (smoke) | **PASS** — Bắt đầu QT → **201** SPAWN-MISSING |
| **UF-HRM-12** | Yes (must_keep) | **PASS** — Thêm yêu cầu → POST **201** `HRM-REC-201` · list refresh · no WF required |
| **J-REC-WF-03** | Deferred | **🟡 BLOCKED** — no `workflow_instance_id` / inbox task; U65 cấm seed |
| **J-REC-WF-06** | Deferred | **🟡 BLOCKED** — same |
| **J-REC-WF-01** | Supporting | Canvas reachable / no recruitment codes — alternate SPAWN-MISSING expected (QA-01); not blocking P0 close |
| Full Phase1 / PROD matrix | Out of slice | Not claimed |

**NO-GO trigger not met:** mandatory in-scope **J-REC-WF-02** has browser click-path + Network 201 + screenshot; not left ⏳ against a blind PASS claim. Inbox journeys explicitly deferred — **do not** require for this GO.

---

## AC / exit adjudication

| ID | Expect | QA-02 | QC |
|----|--------|-------|-----|
| **AC-REC-WF-02** (alternate) | Submit → 2xx SPAWN-MISSING **or** instance | PASS — 201 + banner | **PASS** |
| **UF-HRM-12** | Create without WF | PASS | **PASS** |
| **J-REC-WF-04** smoke | start-pipeline SPAWN-MISSING/2xx | PASS | **PASS** |
| **AC-REC-WF-03 / 06** | Inbox duyệt / từ chối | N/A blocked | **Deferred** — not required |
| F6 funnel (must_keep) | 6 stages intact | PASS observed | **PASS** (not reopened) |

---

## Conditions

| ID | Severity | Owner | Expiry / trigger | Status |
|----|----------|-------|------------------|--------|
| **C-XHRM-REC-WF-01** | Process | optional `qa` | Add `command_table` (pnpm/jest exit) → pack **8/8** | **OPEN** (non-blocking) |
| **C-XHRM-REC-WF-02** | Scope defer | pm → qa after FE def | J-REC-WF-03 / J-06 inbox after FE-created active def + successful spawn — **cấm seed** | **OPEN** — **cấm require** this gate |
| **C-XHRM-REC-WF-03** | P2 expected | pm / XBOS admin (FE canvas) | Create active `hrm_requisition_approval` / `hrm_candidate_pipeline` via FE | **OPEN** (= R-XHRM-REC-WF-NO-DEF) |
| **C-XHRM-REC-WF-04** | P2 optional | optional `dev-be` | When defs exist: ensure XBOS start payload completeness (workflowCode / businessType / businessId / submitter.employeeId) | **OPEN** (= R-XHRM-REC-WF-SPAWN-PAYLOAD) |
| **C-XHRM-REC-WF-05** | P2 | qa later | LOCKED UI / 409 with active `workflow_instance_id` | **OPEN** |
| **C-XHRM-REC-WF-06** | Standing | pm | Forever for this gate | **OPEN** — **NOT** Phase1 DONE · **NOT** PROD |

---

## Residual (concur QA)

| ID | Severity | Note | QC |
|----|----------|------|-----|
| R-XHRM-REC-WF-NO-DEF | P2 / expected | No active recruitment WF codes on canvas | = **C-XHRM-REC-WF-03** |
| R-XHRM-REC-WF-SPAWN-PAYLOAD | P2 | XBOS 400 mapped to SPAWN-MISSING 2xx | = **C-XHRM-REC-WF-04** |
| R-XHRM-REC-WF-J03-J06 | P2 | Inbox after FE def | = **C-XHRM-REC-WF-02** |
| R-XHRM-REC-WF-LOCKED-UNTESTED | P2 | Needs instance | = **C-XHRM-REC-WF-05** |
| OPS-HRM-DB-RESET | P3 ops | Mid-wave crash then restart | Noted — not gate blocker |

**not promoted:** Phase1 DONE · PROD-READY · J-REC-WF-03/06 PASS · full bridge program exit · seed-based inbox

---

## Forbidden claims

- Phase 1 DONE / PROD-READY / UAT full-program exit
- Require inbox Duyệt/Từ chối without FE-created WF definition + live instance
- Seed inbox / `pnpm seed:*` to fabricate approve path
- Reopen **D-XHRM-REC-WF-SUBMIT-SCOPE** without new failing evidence
- Overwrite F6 / UF-HRM-12 green without regression

---

## completion_report

**Closed:** Gate **XHRM-REC-WF-QC-01** — **GO WITH CONDITIONS**. P0 **D-XHRM-REC-WF-SUBMIT-SCOPE** closed (submit-workflow **201** + SPAWN-MISSING). UF-HRM-12 + J-REC-WF-04 smoke PASS. Screenshot corroborates FE banner. U65 zero-seed honored. QC L0 spot 200×3.

**Open (conditions):** pack `command_table` PROCESS; J-03/06 + LOCKED deferred until FE canvas def; optional spawn payload; standing NOT Phase1/PROD.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: XHRM-REC-WF-PM-INTAKE-01
from_role: qc
to_role: pm
lane: governance
change_mode: INTAKE
residual_auto_fix: true

## read_first
1. docs/qa/evidence/xhrm-rec-wf-qc-01-20260719.md (GWC PASS_TO_PM)
2. docs/qa/evidence/xhrm-rec-wf-qa-02-20260719.md

## deliver
1. Record GWC: D-XHRM-REC-WF-SUBMIT-SCOPE CLOSED; J-REC-WF-02 PASS; NOT Phase1/PROD
2. Do NOT dispatch qa for J-03/06 until FE canvas creates active hrm_requisition_approval / hrm_candidate_pipeline (U65 — no seed)
3. Optional: Task qa to add command_table → pack 8/8 (C-XHRM-REC-WF-01 PROCESS only)
4. Optional later: FE canvas def wave → then qa J-03/06 + LOCKED
5. Update bus / journey flags for J-REC-WF-02 alternate PASS; keep J-03/06 🟡

## exit
Bus INTAKE + next_dispatch chosen; no Phase1/PROD claim
```

## ack_status

**PASS_TO_PM**
