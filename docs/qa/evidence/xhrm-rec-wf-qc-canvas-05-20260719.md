# QC Gate Decision — XHRM-REC-WF-QC-CANVAS-05 (2026-07-19)

| Field | Value |
|-------|--------|
| **work_item_id** | `XHRM-REC-WF-QC-CANVAS-05` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **change_mode** | GATE |
| **environment** | portal `:5173` · hrm `:28001` · xbos `:28002` |
| **accounts** | `ceo@xe.vn` · Group CEO · JWT `xevn`/`main` |
| **executed_at** | `2026-07-19` |
| **program** | XBOS ↔ HRM Recruitment Workflow Bridge — canvas / complete-instance remap |
| **spec_ref** | `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` · **AC-REC-WF-03** · **J-REC-WF-03** · AC-REC-WF-02/06 · UF-HRM-12 · AC-CD-F6 |
| **qa_evidence** | `docs/qa/evidence/xhrm-rec-wf-qa-canvas-05-20260719.md` |
| **decision** | **GO WITH CONDITIONS** — J-03 / AC-REC-WF-03 closed live; complete-instance remap PASS; P2 deeplink optional |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

QC audited QA **PASS_TO_PM** for `XHRM-REC-WF-QA-CANVAS-05` after BE-COMPLETE-INSTANCE-01. Browser U65 evidence shows CEO Inbox **Xử lý nhanh** → XBOS `instanceCompleted: true` → HRM `POST .../recruitment/workflow/terminal` **201** with **no** `instance_mismatch` → requisition `status=open` («Đang tuyển») + **F5**. That closes **AC-REC-WF-03** / **J-REC-WF-03** and parent QC-01 condition **C-XHRM-REC-WF-02** (inbox previously 🟡 BLOCKED).

Regress **J-REC-WF-02** (prefer instance / `spawnMissing: false`), **J-REC-WF-06** reject → `rejected`, **UF-HRM-12**, **AC-CD-F6**, leave load smoke — all **PASS**. Defect **D-XHRM-REC-WF-COMPLETE-INSTANCE-ID** is **CLOSED**.

**NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** full program exit J-REC-WF-01..06 / AC-REC-WF-01..11.

---

## Chain audited

| Lane | Evidence | Verdict |
|------|----------|---------|
| prior qc | `xhrm-rec-wf-qc-01-20260719.md` | **GWC** — J-03/06 **🟡 BLOCKED** under U65 (= **C-XHRM-REC-WF-02**) |
| be | `xhrm-rec-wf-be-complete-instance-01-20260719.md` (cited by QA) | `notifyInstance.id = instanceId` remap |
| qa prior fail | `xhrm-rec-wf-qa-canvas-04-20260719.md` (cited) | FAIL — instance_mismatch / HRM stayed pending |
| qa retest | `xhrm-rec-wf-qa-canvas-05-20260719.md` | **PASS_TO_PM** — J-03 closed + regress |
| screenshots | `*-leave-smoke-*.png` · `*-f6-*.png` | Present on disk |
| qc (this) | `xhrm-rec-wf-qc-canvas-05-20260719.md` | **GO WITH CONDITIONS** |

---

## Evidence pack gate (Layer B)

| File | verify exit | Score | QC adjudication |
|------|-------------|-------|-----------------|
| `xhrm-rec-wf-qa-canvas-05-20260719.md` | **0** | **8/8 PASS** | **PASS** — pack integrity OK |

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/xhrm-rec-wf-qa-canvas-05-20260719.md
# PASS: QC evidence pack ready (8/8)
```

| QC spot command | Result |
|-----------------|--------|
| `pnpm run qc:dev-stack` | hrm **200** · xbos **200** · portal `:5173` **200** — **PASS** (Windows node UV assertion after healthy print — ENV noise, not stack down; same class as QC-01) |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| QA L0 hrm/xbos/portal **200** | ENV | **PASS** |
| QC `qc:dev-stack` 200×3 | ENV | **PASS** |
| `verify:qc:evidence-pack` **8/8** | PROCESS | **PASS** (closes prior **C-XHRM-REC-WF-01** format gap for this wave) |
| **J-REC-WF-03** / **AC-REC-WF-03** approve → HRM `open` + F5 · terminal **201** · no `instance_mismatch` | PRODUCT L2.5 | **PASS** — **CLOSED** vs CANVAS-04 |
| **D-XHRM-REC-WF-COMPLETE-INSTANCE-ID** | PRODUCT | **CLOSED** — do not reopen |
| **J-REC-WF-02** prefer instance · `spawnMissing: false` · 201 | PRODUCT L2.5 | **PASS** |
| **J-REC-WF-06** reject → HRM `rejected` | PRODUCT L2.5 | **PASS** |
| **UF-HRM-12** create 201 | PRODUCT must_keep | **PASS** |
| **AC-CD-F6** 6 stages + vitest 7/7 | PRODUCT must_keep | **PASS** |
| Leave tab load smoke | PRODUCT must_keep | **PASS** (no mutate) |
| **R-XHRM-REC-WF-DEEPLINK-TASKID** synthetic instance-id reject 404 | PRODUCT P2 | **OPEN** → **C-XHRM-REC-WF-CANVAS-05-01** (optional) |
| **J-REC-WF-01 / 04 / 05** · AC-07 LOCKED · AC-09/10 | OUT OF SLICE | **NOT claimed** → standing conditions |
| Seed in evidence | PROCESS U65 | **PASS** — none |
| Phase 1 DONE / PROD | OUT OF SLICE | **NOT claimed** → **C-XHRM-REC-WF-CANVAS-05-02** |

---

## L0 — Dev stack health

| Check | Source | Result |
|-------|--------|--------|
| hrm-api `:28001` | QA + QC spot | HTTP **200** — **PASS** |
| xbos-api `:28002` | QA + QC spot | HTTP **200** — **PASS** (QA: reloaded with COMPLETE-INSTANCE dist) |
| web-portal `:5173` | QA + QC spot | HTTP **200** — **PASS** |
| U65 zero-seed | QA Forbidden | **PASS** — no seed / no admin inbox seed |

---

## AC / J-* adjudication (in-scope)

| ID | Expect (spec) | QA evidence | QC |
|----|---------------|-------------|-----|
| **AC-REC-WF-03** | Approver duyệt → HRM `approved`\|`open` → **F5 còn** | CEO Xử lý nhanh → `instanceCompleted: true` → terminal **201** → GET `status=open` · FE «Đang tuyển» · F5 | **PASS** |
| **J-REC-WF-03** | Inbox → Duyệt → HRM sync → F5 · **cấm** seed | Click path documented; task `6b8813dd-…`; no `instance_mismatch` in hrm log | **PASS** |
| **AC-REC-WF-02** / **J-02** | Spawn 2xx or SPAWN-MISSING | Prefer instance: **201** · `spawnMissing: false` · `workflow_instance_id` set · FE «QT XBOS đang chạy» | **PASS** |
| **AC-REC-WF-06** / **J-06** | Reject → rejected | Reject **201** `XBOS-WF-205` → HRM `rejected` | **PASS** |
| **UF-HRM-12** | Create requisition FE | POST **201** `HRM-REC-201` · list row | **PASS** |
| **AC-CD-F6** | Funnel 6 cols | Observed + vitest 7/7 | **PASS** |
| Leave regress | No break | Tab load · 86 requests · no ERROR | **PASS** smoke |

**Fail-closed checks (not met):** no seed; no orphan pending after approve; no Phase1/PROD claim.

---

## L2.5 journey coverage (U19)

| Journey | In this gate? | Status |
|---------|---------------|--------|
| **J-REC-WF-03** | **Yes — mandatory** | **PASS** — closes prior C-XHRM-REC-WF-02 |
| **J-REC-WF-02** | Yes (regress) | **PASS** |
| **J-REC-WF-06** | Yes (regress) | **PASS** |
| **UF-HRM-12** | Yes (must_keep) | **PASS** |
| **AC-CD-F6** / F6 | Yes (must_keep) | **PASS** |
| Leave smoke | Yes (must_keep) | **PASS** |
| **J-REC-WF-01** | Out of slice | **⬜ DRAFT** — not required for this gate |
| **J-REC-WF-04** | Out of slice | **⬜ DRAFT** / prior SPAWN-MISSING smoke only |
| **J-REC-WF-05** | Out of slice | **⬜ DRAFT** |
| Full Phase1 / PROD | Out of slice | **Not claimed** |

**NO-GO trigger not met:** mandatory in-scope **J-REC-WF-03** has FE click path + Network 201 + HRM open + F5 + no instance_mismatch — not left ⏳ against PASS claim.

---

## Defect / condition close audit

| ID | Prior | This gate | QC |
|----|-------|-----------|-----|
| **D-XHRM-REC-WF-COMPLETE-INSTANCE-ID** | CANVAS-04 FAIL (`task.id` notify) | Live remap → terminal 201 · HRM open | **CLOSED** |
| **C-XHRM-REC-WF-02** (QC-01) | J-03/06 🟡 BLOCKED | J-03 + J-06 browser PASS | **CLOSED** |
| **C-XHRM-REC-WF-01** (pack 1/8) | PROCESS | This QA pack **8/8** | **CLOSED** for this wave |
| **C-XHRM-REC-WF-03** (NO-DEF) | Expected SPAWN-MISSING | Live spawn with instance (`spawnMissing: false`) | **CLOSED** for requisition-approve path (defs present from prior FE waves) |
| **R-XHRM-REC-WF-DEEPLINK-TASKID** | Carry P2 | Synthetic deeplink reject 404 | **OPEN** → condition below |
| **C-XHRM-REC-WF-05** LOCKED 409 | Untested | Still out of slice | **OPEN** (standing, optional) |
| **C-XHRM-REC-WF-06** NOT Phase1/PROD | Standing | Still | **OPEN** |

---

## Conditions (GO WITH CONDITIONS)

| Condition ID | Severity | Owner | Requirement | Status |
|--------------|----------|-------|-------------|--------|
| **C-XHRM-REC-WF-CANVAS-05-01** | P2 optional | `dev-fe` (when prioritized) | Fix / harden deep-link so reject/complete uses **task id** not synthetic `wfInstanceId` (= **R-XHRM-REC-WF-DEEPLINK-TASKID**). Card/drawer path with task `cardId` already OK (J-06). **Non-blocking** for this GO. | **OPEN** |
| **C-XHRM-REC-WF-CANVAS-05-02** | Standing | `pm` | **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** full J-REC-WF-01..06 program exit | **OPEN** |
| **C-XHRM-REC-WF-CANVAS-05-03** | Scope defer | `pm` → later waves | J-01 canvas admin create, J-04 roadmap sync, J-05 funnel-after-WF, AC-07 LOCKED UI — **not** promoted by this gate | **OPEN** |

---

## Forbidden honored

- No seed / inbox seed / DB fake in QA or QC evidence
- No Phase1 / PROD claim
- No reopen of closed UF-HRM-12 / F6 greens
- No requirement to login `admin@xe.vn` for terminal (CEO path sufficient)
- QC did **not** GO from bus title alone — QA MD opened + pack verify **8/8** + L0 spot

---

## Residual risk statement

Bounded **canvas / complete-instance** slice is release-safe for Group CEO `ceo@xe.vn` approve + reject requisition WF sync. Residual risk is **P2 deep-link taskId** (optional UX) and **untested** LOCKED/roadmap/funnel-after-WF journeys — **do not** promote to Phase1 or PROD on this gate alone.

---

## completion_report

**Closed:** AC-REC-WF-03 / J-REC-WF-03 (CEO approve → HRM `open` + F5, no `instance_mismatch`); D-XHRM-REC-WF-COMPLETE-INSTANCE-ID; parent C-XHRM-REC-WF-02 (inbox); C-XHRM-REC-WF-01 pack gap for this wave; regress J-02 / J-06 / UF-12 / F6 / leave; U65.

**Open:** C-XHRM-REC-WF-CANVAS-05-01 (P2 deeplink optional); C-05-02 NOT Phase1/PROD; C-05-03 J-01/04/05/LOCKED defer.

**Decision:** **GO WITH CONDITIONS** — NOT Phase1 DONE · NOT PROD.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: XHRM-REC-WF-CANVAS-05-PM-INTAKE
from_role: qc
to_role: pm
lane: governance
change_mode: INTAKE

## entry
QC GO WITH CONDITIONS — docs/qa/evidence/xhrm-rec-wf-qc-canvas-05-20260719.md
CLOSED: J-REC-WF-03 / AC-REC-WF-03 · D-XHRM-REC-WF-COMPLETE-INSTANCE-ID · C-XHRM-REC-WF-02
OPEN conditions: C-XHRM-REC-WF-CANVAS-05-01 P2 deeplink (optional) · C-05-02 NOT Phase1/PROD · C-05-03 J-01/04/05/LOCKED defer

## deliver
1. Update PROGRAM_JOURNEY_MAP / BA delta: J-REC-WF-02/03/06 → PASS (browser U65); keep J-01/04/05 DRAFT
2. Optionally defer or Task dev-fe R-XHRM-REC-WF-DEEPLINK-TASKID (P2 non-blocking)
3. Do NOT claim Phase1/PROD; do NOT dispatch seed
4. Next product wave per REC-WF backlog (J-01 canvas admin / J-04 roadmap / AC-07 LOCKED) only if sponsor scope

## exit
Bus INTAKE + journey map refresh; residual owner assigned or defer_reason recorded
```

## ack_status

**PASS_TO_PM**
