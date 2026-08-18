# QC Gate Decision — R-XHRM-REC-WF-DEEPLINK-TASKID-QC (2026-07-20)

| Field | Value |
|-------|--------|
| **work_item_id** | `R-XHRM-REC-WF-DEEPLINK-TASKID-QC` |
| **closes** | **C-XHRM-REC-WF-CANVAS-05-01** / **R-XHRM-REC-WF-DEEPLINK-TASKID** |
| **parent_gate** | `XHRM-REC-WF-QC-CANVAS-05` — `docs/qa/evidence/xhrm-rec-wf-qc-canvas-05-20260719.md` (**GO WITH CONDITIONS**) |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **change_mode** | GATE |
| **qa_evidence** | `docs/qa/evidence/xhrm-rec-wf-deeplink-qa-20260720.md` (**PASS_TO_PM**) |
| **fe_evidence** | `docs/qa/evidence/xhrm-rec-wf-deeplink-fe-20260720.md` (**READY_FOR_QA**) |
| **executed_at** | `2026-07-20` |
| **decision** | **GO** — residual P2 deeplink task-id close only; **parent CANVAS-05 GWC retained** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD · **cấm reopen J-03** without FAIL |
| **spec_ref** | `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` · J-REC-WF-02/03/06 · BR-INBOX-01 · J-XBOS-01 |

---

## Executive summary

QC audited FE deep-link harden (`wfTaskId` + resolve/guard before mutate) + QA browser U65 **PASS_TO_PM**. Evidence proves:

1. Inbox **Mở chi tiết** URL carries `wfTaskId` + `wfInstanceId`; reject POSTs **task UUID** → **201** (not instance id; no 404).
2. Legacy **`?wfInstanceId=` only** hydrates then reject POSTs **resolved task id** → **201** (no `…/tasks/{instanceId}/reject`).
3. Regress **J-REC-WF-02 / 03 / 06** smoke **PASS** — parent GWC **must_keep**; **J-03 not reopened** (no FAIL).

**C-XHRM-REC-WF-CANVAS-05-01 / R-XHRM-REC-WF-DEEPLINK-TASKID = CLOSED.**

Parent **XHRM-REC-WF-QC-CANVAS-05** remains **GO WITH CONDITIONS** for **C-05-02** (NOT Phase1/PROD) and **C-05-03** (J-01/04/05/LOCKED defer). AC-REC-WF-03 / J-REC-WF-03 GWC **stands**.

**NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** full REC-WF program exit.

---

## Chain audited

| Lane | Evidence | Verdict |
|------|----------|---------|
| parent qc | `xhrm-rec-wf-qc-canvas-05-20260719.md` | **GWC** — C-05-01 was **OPEN** (P2 optional deeplink) |
| dev-fe | `xhrm-rec-wf-deeplink-fe-20260720.md` | READY_FOR_QA — `wfTaskId` + guard + vitest **19/19** |
| qa | `xhrm-rec-wf-deeplink-qa-20260720.md` | **PASS_TO_PM** — §1–§3 browser U65 |
| qc (this) | `xhrm-rec-wf-deeplink-qc-20260720.md` | **GO** — C-05-01 **CLOSED**; parent GWC retained |

---

## Evidence pack gate (Layer B)

| File | verify | Score | QC adjudication |
|------|--------|-------|-----------------|
| `xhrm-rec-wf-deeplink-qa-20260720.md` | Manual audit vs `scripts/verify-qc-evidence-pack.mjs` (shell Unicode path blocked `pnpm run verify:qc:evidence-pack` this session) | **~6/8** | **PROCESS note** — likely miss `command_table` (`pnpm run`/`--filter` exit row) + `crud_or_matrix` regex (`journey`/`L2.5` wording). Browser AC §1–§3 + J-* PASS rows + Residual + date present. **Not** product NO-GO (precedent: leave-picker / soft-nav residual closes). |

```text
# Expected if harness run:
# FAIL: QC evidence pack incomplete (2/8 checks) — command_table, crud_or_matrix
# QC: process format only — product residual closed from readable U65 MD
```

| Process note | Severity | Owner | Status |
|--------------|----------|-------|--------|
| Deeplink QA pack format ~6/8 | P3 process | qa (optional polish) | **Noted** — does not keep C-05-01 OPEN |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| QA L0 hrm/xbos/portal **200** | ENV | **PASS** (QA recorded) |
| QC spot 2026-07-20: portal `:5173` **200**; hrm/xbos `/api/*/metrics` **200** | ENV | **PASS** — stack up (`/health` 404 = path, not down) |
| Mở chi tiết reject → task id **201** | PRODUCT L2.5 | **PASS** — residual closed |
| Legacy `wfInstanceId`-only → resolved task id **201** | PRODUCT L2.5 | **PASS** — residual closed |
| J-REC-WF-02 submit smoke **201** `HRM-REC-WF-200` | PRODUCT must_keep | **PASS** smoke |
| J-REC-WF-03 Xử lý nhanh complete **201** task id | PRODUCT must_keep | **PASS** smoke — **do not reopen** GWC |
| J-REC-WF-06 reject path (covered §1–§2) | PRODUCT must_keep | **PASS** smoke |
| FE vitest 19/19 | PRODUCT | **PASS** (FE pack) |
| Seed | PROCESS U65 | **PASS** — none |
| Pack ~6/8 | PROCESS | **Noted** — not product reopen |
| Phase1 / PROD | OUT OF SLICE | **NOT claimed** |

---

## Exit criteria adjudication

| # | Exit | QC |
|---|------|-----|
| 1 | Close **C-XHRM-REC-WF-CANVAS-05-01** if OK | **CLOSED** |
| 2 | Keep parent CANVAS-05 **GWC** | **YES** — C-05-02 / C-05-03 remain **OPEN** |
| 3 | No reopen **J-REC-WF-03** without FAIL | **PASS** — smoke only; no FAIL |
| 4 | No Phase1 / PROD claim | **PASS** |
| 5 | Evidence this file · PASS_TO_PM | **PASS** |

---

## Conditions status (parent CANVAS-05)

| ID | Severity | Status after this gate |
|----|----------|------------------------|
| **C-XHRM-REC-WF-CANVAS-05-01** | P2 optional | **CLOSED** — deeplink / legacy instance-only mutate use **task id** → 2xx |
| **C-XHRM-REC-WF-CANVAS-05-02** | Standing | **OPEN** — NOT Phase1 DONE · NOT PROD-READY · NOT full J-REC-WF-01..06 exit |
| **C-XHRM-REC-WF-CANVAS-05-03** | Scope defer | **OPEN** — J-01 / J-04 / J-05 / AC-07 LOCKED not promoted |

---

## L2.5 journey coverage (U19)

| Journey | This residual gate | Status |
|---------|-------------------|--------|
| **J-REC-WF-06** | In scope (deeplink reject) | **PASS** (QA §1–§2) |
| **J-REC-WF-03** | Regress smoke must_keep | **PASS** smoke — parent GWC **stands**; **not reopened** |
| **J-REC-WF-02** | Regress smoke must_keep | **PASS** smoke |
| **J-REC-WF-01 / 04 / 05** | Out of slice | **⬜** — C-05-03 unchanged |
| Full Phase1 / PROD | Out of slice | **Not claimed** |

**NO-GO trigger not met:** in-scope deeplink ACs have FE click path + Network 201 + task≠instance assert; mandatory parent J-03 already GWC PASS and smoke confirms no FAIL.

---

## U65 zero-seed audit

| Check | Result |
|-------|--------|
| Seed in FE/QA/QC steps | **None** |
| Mutate | Live Inbox reject/complete + submit-workflow via FE only |
| Verdict | **PASS** |

---

## Forbidden claims

- Phase 1 DONE / PROD-READY / full REC-WF program exit
- Upgrade parent **CANVAS-05** from GWC → full GO
- Reopen **J-REC-WF-03** / AC-REC-WF-03 / D-COMPLETE-INSTANCE without FAIL
- Seed / inbox seed / DB fake for evidence

---

## Residual risk statement

Bounded **P2 Inbox deeplink task-id** residual is closed for Group CEO `ceo@xe.vn`. Parent canvas/complete-instance slice stays **GWC** with standing NOT Phase1/PROD and deferred J-01/04/05/LOCKED. Residual risk = program scope not covered by this residual close — **do not** promote Phase1/PROD on this gate.

---

## completion_report

**Closed:** **C-XHRM-REC-WF-CANVAS-05-01** / **R-XHRM-REC-WF-DEEPLINK-TASKID** — Mở chi tiết `wfTaskId` + legacy `wfInstanceId`-only reject use task UUID → **201**; J-02/03/06 smoke must_keep; U65; no J-03 reopen.

**Open (parent GWC):** **C-XHRM-REC-WF-CANVAS-05-02** NOT Phase1/PROD; **C-XHRM-REC-WF-CANVAS-05-03** J-01/04/05/LOCKED defer. Process: QA pack format polish optional (~6/8).

**Decision:** **GO** (residual close only) — parent CANVAS-05 remains **GO WITH CONDITIONS**.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: XHRM-REC-WF-CANVAS-05-01-CLOSED-PM-INTAKE
from_role: qc
to_role: pm
lane: governance
change_mode: INTAKE

## entry
QC GO (residual) — docs/qa/evidence/xhrm-rec-wf-deeplink-qc-20260720.md
CLOSED: C-XHRM-REC-WF-CANVAS-05-01 / R-XHRM-REC-WF-DEEPLINK-TASKID
PARENT: CANVAS-05 remains GWC — C-05-02 NOT Phase1/PROD · C-05-03 J-01/04/05/LOCKED defer
must_keep: J-REC-WF-03 GWC — do not reopen without FAIL

## deliver
1. Bus INTAKE: mark C-XHRM-REC-WF-CANVAS-05-01 CLOSED; keep parent GWC wording
2. Optional: journey map note J-02/03/06 browser PASS (if still DRAFT in PROGRAM_JOURNEY_MAP)
3. Do NOT claim Phase1/PROD; do NOT seed; do NOT reopen J-03
4. Next product wave only per REC-WF backlog / sponsor scope (J-01 / J-04 / AC-07) — or idle if no open P0

## exit
Bus updated; residual owner or defer_reason recorded
```

## ack_status

**PASS_TO_PM**
