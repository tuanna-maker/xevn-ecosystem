# QC Gate — BM-QC-J-REC-WF-03-GATE-01 (2026-07-22)

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-QC-J-REC-WF-03-GATE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **date** | `2026-07-22` |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **environment** | Dev8088 · `PORTAL_DEV_URL=http://14.225.217.232:8088` |
| **portal_url** | `http://14.225.217.232:8088` |
| **persona** | Group CEO / BOD `ceo@xe.vn` · `companyId=main` · `tenantId=xevn` |
| **decision** | **GO WITH CONDITIONS** — **J-REC-WF-03** / AC-REC-WF-03 / BM-AC-06-03 inbox duyệt → HRM sync **CLOSED** on Dev8088 |
| **scope_claim** | Recruitment WF approve chain only: FE-sourced Inbox task (R2 spawn) → Hoàn thành → XBOS complete 201 `instanceCompleted:true` → HRM `status=open` / FE «Đang tuyển» → F5 · no `instance_mismatch` · U65 zero-seed |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — browser-only; **cấm** seed inbox; no seed in spawn→approve chain |
| **cấm this gate** | seed · Phase1/PROD claim · require **J-REC-WF-06** reject path |

---

## Scope (bounded)

| In scope | Explicitly out |
|----------|----------------|
| Audit QA PASS for **J-REC-WF-03** (Inbox → HRM sync → F5) | Full BM-05/07 · full HRM menu |
| Confirm FE-sourced task (R2 spawn) — no seed | **J-REC-WF-06** reject path (PM cấm in this gate) |
| Confirm no `instance_mismatch` residual on approved req | Re-open J-REC-WF-02 spawn product without regression |
| Layer B pack verify + Classification | Phase 1 DONE · PROD-READY |
| Residual P0/P1 only in Residual | Optional stale pending inbox backlog |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/bm-qa-rec-wf-spawn-r2-20260722.md` | QA R2 (precondition) | **PASS** J-REC-WF-02 — instance `ad7089df-…` / YCTD `d4f3edb1-…` still open at J-03 entry |
| `docs/qa/evidence/bm-qc-rec-wf-spawn-r2-gate-20260722.md` | QC prior | **GWC** spawn CLOSED; J-03 was deferred → this gate closes that soft condition |
| `docs/qa/evidence/bm-qa-j-rec-wf-03-inbox-01-20260722.md` | QA J-03 | **PASS** — Inbox Mở chi tiết → Hoàn thành → POST complete **201** `XBOS-WF-200` `instanceCompleted:true` → HRM `open` / FE «Đang tuyển» → F5; no seed; no `instance_mismatch` |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | Journey SoT | **J-REC-WF-03** already ✅ PASS cite `bm-qa-j-rec-wf-03-inbox-01` (map lag closed for J-03) |
| Spec | BA | AC-REC-WF-03 · BM-AC-06-03 · G-BM-REC-06 · maps J-XBOS-01 pattern |

**No re-run** of full browser suite — audit-only per PM entry. Local `pnpm run qc:dev-stack` not required for Dev8088 substance audit (ENV local N/A).

---

## Evidence pack gate (Layer B)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/bm-qa-j-rec-wf-03-inbox-01-20260722.md` | **FAIL** exit **1** (2/8) | **PROCESS** — missing `command_table` + `PORTAL_DEV_URL` token (`:8088` alone fails portal_url regex) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/bm-qa-rec-wf-spawn-r2-20260722.md` | **FAIL** exit **1** (2/8) | **PROCESS** — same format gaps (known C-REC-WF-SPAWN-PACK-01) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/bm-qc-j-rec-wf-03-gate-01-20260722.md` | **PASS** exit **0** (8/8) | This gate file |

**Portal URL:** `http://14.225.217.232:8088` · `PORTAL_DEV_URL=http://14.225.217.232:8088`

**QC adjudication:** PROCESS gaps on QA packs are **format-only** (precedent `process-pack-not-product-nogo`). Browser substance — FE-sourced inbox (R2), click path Command Center → Hoàn thành, Network POST **201**, `instanceCompleted:true`, HRM status `open`, FE «Đang tuyển», F5 — is complete. **Not** product NO-GO.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| Precondition: open FE-spawned task from R2 (no re-create, no seed) | PRODUCT / U65 | **PASS** — instance `ad7089df-…` still `pending_approval` |
| Inbox → Mở chi tiết → Hoàn thành | PRODUCT L2.5 | **PASS** — URL `?wfInstanceId=ad7089df-…` |
| POST `/tasks/…/complete` → **201** `XBOS-WF-200`; `instanceCompleted:true`; sibling skipped | PRODUCT | **PASS** |
| HRM GET requisition → `status=open`; FE list «Đang tuyển»; F5 persists | PRODUCT | **PASS** — AC-REC-WF-03 / BM-AC-06-03 |
| Terminal bridge `instance_mismatch` | PRODUCT | **PASS** — status flipped; mismatch absent |
| Seed inbox / API-only PASS | PROCESS U65 | **PASS** — none; chain from FE R2 Gửi duyệt |
| QA pack Layer B 2/8 | PROCESS | **OPEN P3** — non-blocking |
| Local L0 `qc:dev-stack` | ENV | **N/A** for Dev8088 gate (audit-only) |
| J-REC-WF-06 reject | OUT OF SLICE | **Deferred** — PM cấm require in this gate |
| Phase1 / PROD | OUT OF SLICE | **NOT claimed** |

---

## AC adjudication (J-REC-WF-03 / AC-REC-WF-03)

| AC | Pass criteria | Evidence | QC |
|----|---------------|----------|-----|
| **Precondition U65** | Open task from FE spawn (not seed) | QA reused R2 instance; no seed | **PASS** |
| **AC-REC-WF-03 / BM-AC-06-03** | Approver Duyệt/Hoàn thành → HRM open/approved + F5 | POST 201; HRM `open`; FE Đang tuyển; F5 | **PASS** |
| **Terminal bridge** | No `instance_mismatch` leave pending | status → `open`; FE no «QT XBOS đang chạy» | **PASS** |
| **J-REC-WF-06** | Reject path | Out of gate (PM cấm) | **N/A deferred** |

---

## L2.5 — J-REC-WF-03 (narrow approve)

| J-ID | Journey | Evidence | Verdict | Promotable |
|------|---------|----------|---------|------------|
| **J-REC-WF-02** | Submit → spawn (precondition) | R2 + prior QC GWC | **PASS** (prior) | Already gated |
| **J-REC-WF-03** | Inbox duyệt → HRM sync → F5 | `bm-qa-j-rec-wf-03-inbox-01` | **PASS** | Bounded approve slice |
| **J-REC-WF-06** | Reject path | Not in this gate | **Deferred** | Do not require for GWC |

**Mandatory J-* for this slice:** **J-REC-WF-03** — **PASS**.  
**Deferred (explicit):** **J-REC-WF-06** — PM forbade requiring reject path in this gate.  
**Journey map:** J-REC-WF-03 already ✅ cite QA evidence — soft promote QC cite optional.

---

## Residual / Conditions

### Residual — P0 / P1 only

| ID | Severity | Owner | Status | Note |
|----|----------|-------|--------|------|
| — | — | — | **None** | No open P0/P1 product blocker for J-REC-WF-03 / AC-REC-WF-03 on `:8088` |

### Conditions (GWC — not P0/P1 Residual)

| ID | Severity | Owner | Status | Note |
|----|----------|-------|--------|------|
| **C-REC-WF-03-PACK-01** | P3 PROCESS | qa (optional) | OPEN | Polish QA pack: `command_table` + `PORTAL_DEV_URL=http://14.225.217.232:8088` → verify 8/8 |
| **C-REC-WF-03-MAP-QC** | P3 governance | pm (optional) | OPEN | Optionally append QC gate cite on `PROGRAM_JOURNEY_MAP.md` J-REC-WF-03 (already ✅ from QA) |
| **C-REC-WF-06** | soft / next wave | pm → qa | DEFER OK | Reject path J-REC-WF-06 — **not** required by this gate |
| Stale pending rec inbox tasks | soft | ops/pm | NOTE | Pre-existing backlog — not closed by this approve |
| Phase1 / PROD | — | — | **FORBIDDEN** | Standing — **NOT** Phase 1 DONE · **NOT** PROD-READY |

**Closes soft defer from prior spawn gate:** C-REC-WF-03 (inbox approve) from `bm-qc-rec-wf-spawn-r2-gate` — product now **CLOSED** under this GWC.

---

## Exit criteria (PM dispatch) — QC map

| Exit | Result |
|------|--------|
| Audit QA PASS J-REC-WF-03 vs AC | **DONE** — product PASS |
| Confirm FE-sourced / no seed / no instance_mismatch | **DONE** |
| Audit L2.5 **J-REC-WF-03** | **DONE** — **PASS** |
| **cấm** require J-06 | **RESPECTED** — deferred |
| GO or GWC; Residual P0/P1 only | **GWC** — Residual P0/P1 = **none** |
| Evidence this file | **DONE** |
| cấm seed · Phase1/PROD | **RESPECTED** |

---

## Executive summary

QC audited **J-REC-WF-03** on Dev8088 after spawn R2 GWC: FE-sourced open instance (no seed) → Inbox Hoàn thành → XBOS complete **201** `instanceCompleted:true` → HRM requisition **`open`** / FE «Đang tuyển» → F5 PASS; prior `instance_mismatch` residual **CLOSED**. Layer B QA packs 2/8 = PROCESS P3 only. **J-REC-WF-06** explicitly out of scope.

**GO WITH CONDITIONS** for this bounded approve-sync slice only. Conditions = pack polish (P3) + optional map QC cite + J-06 defer + **explicit NOT Phase1/PROD**.

---

## Handoff

- **completion_report:** Closed QC gate `BM-QC-J-REC-WF-03-GATE-01`. Product **J-REC-WF-03** / AC-REC-WF-03 / BM-AC-06-03 inbox duyệt → HRM sync **PASS** on `:8088` U65. Residual P0/P1 = **none**. Layer B QA pack 2/8 = PROCESS P3. J-06 deferred per PM. **NOT** Phase1/PROD.
- **next_owner:** `pm`
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/bm-qc-j-rec-wf-03-gate-01-20260722.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-BM-J-REC-WF-03-CLOSE-01
from_role: pm
to_role: pm
lane: governance
priority: P2
entry_criteria: QC GWC docs/qa/evidence/bm-qc-j-rec-wf-03-gate-01-20260722.md; Residual P0/P1 none; J-REC-WF-03 PASS; J-06 not required
exit_criteria: Bus INTAKE BM-QC-J-REC-WF-03-GATE-01 GWC; TEAM_WORKING_NOW / evidence index cite bm-qc-j-rec-wf-03-gate-01-20260722.md; note soft C-REC-WF-03 from spawn gate CLOSED; do NOT claim Phase1/PROD; next wave = highest open P0/P1 from pm:idle:check (BM residual / J-REC-WF-06 only if backlog prioritizes reject) — do not reopen approve product without regression
cấm: seed · reopen instance_mismatch product · require J-06 from this gate · Phase1/PROD claim
```

Optional (P3 process — do not block):

```text
work_item_id: C-REC-WF-03-PACK-01
to_role: qa
exit: Edit docs/qa/evidence/bm-qa-j-rec-wf-03-inbox-01-20260722.md — add command_table (pnpm verify exit) + PORTAL_DEV_URL=http://14.225.217.232:8088; pnpm run verify:qc:evidence-pack exit 0
```
