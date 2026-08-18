# QC Gate — BM-QC-J-REC-WF-04-STEP-SYNC-R2 (2026-07-22)

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-QC-J-REC-WF-04-STEP-SYNC-R2` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **date** | `2026-07-22` |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **environment** | Dev8088 · `PORTAL_DEV_URL=http://14.225.217.232:8088` |
| **portal_url** | `http://14.225.217.232:8088` |
| **persona** | Group CEO / BOD `ceo@xe.vn` · `companyId=main` · `tenantId=xevn` |
| **decision** | **GO WITH CONDITIONS** — **J-REC-WF-04** / AC-REC-WF-04 step-sync R2 **CLOSED** on Dev8088 |
| **scope_claim** | Recruitment WF candidate step → stage sync only: FE **Bắt đầu QT** → Inbox complete intake+screening → `stage=screening` + `wf_callback_fingerprint` non-null → F5 · U65 zero-seed |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — browser-only; **cấm** seed |
| **cấm this gate** | seed · Phase1/PROD claim · reopen **J-REC-WF-02/03** |

---

## Scope (bounded)

| In scope | Explicitly out |
|----------|----------------|
| Audit QA R2 PASS for **J-REC-WF-04** step-sync | Full BM-05/07 · full HRM menu |
| Confirm prior FAIL closed (stage stuck `new` / fp null) | Re-run full browser suite |
| Confirm BE callback bare aliases + DevOps :8088 sync chain | Reopen J-REC-WF-02/03 product |
| Layer B pack verify + Classification | Phase 1 DONE · PROD-READY |
| Residual P0/P1 only in Residual | Soft hired-CTA when `wi=null` (defer) |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/bm-qa-j-rec-wf-04-step-sync-01-20260722.md` | QA prior | **FAIL** — stage stayed `new` · `wf_callback_fingerprint=null` after Inbox screening complete |
| `docs/qa/evidence/bm-be-rec-wf-04-step-sync-callback-01-20260722.md` | BE | **READY** — bare `intake\|screening\|…` aliases + `map(taskType) ?? map(stepKey)` |
| `docs/qa/evidence/d-do-sync-8088-bm-wf04-callback-01-20260722.md` | DevOps | **PASS** — bridge synced · hrm-be×3 recreate · dist has bare `screening` |
| `docs/qa/evidence/bm-qa-j-rec-wf-04-step-sync-r2-20260722.md` | QA R2 | **PASS** — start-pipeline **201** · Inbox intake+screening **201** · GET `stage=screening` · fp non-null · F5 chip **Sàng lọc** |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | Journey SoT | **J-REC-WF-04** still 🟡 PASS baseline · GAP step-sync — **PM promote** after this GWC |
| Spec | BA/ADR | AC-REC-WF-04 · `REC_WF_TASK_TYPE_TO_STAGE` · ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE |

**No re-run** of full browser suite — audit-only per PM ANTI-STUCK. Local `pnpm run qc:dev-stack` **N/A** for Dev8088 substance audit.

---

## Evidence pack gate (Layer B)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/bm-qa-j-rec-wf-04-step-sync-r2-20260722.md` | **FAIL** exit **1** (2/8) | **PROCESS** — missing `command_table` + `PORTAL_DEV_URL` token (`:8088` alone fails portal_url regex) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/bm-qc-j-rec-wf-04-step-sync-r2-20260722.md` | **PASS** exit **0** (8/8) | This gate file |

**Portal URL:** `http://14.225.217.232:8088` · `PORTAL_DEV_URL=http://14.225.217.232:8088`

**QC adjudication:** PROCESS gaps on QA pack are **format-only** (precedent `process-pack-not-product-nogo`). Browser substance — start-pipeline → Inbox screening → stage/fp/F5 — is complete. **Not** product NO-GO.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| Prior FAIL: stage=`new` / fp=null after screening complete | PRODUCT | **CLOSED** by BE bare-alias map + R2 retest |
| `POST …/start-pipeline` → **201** · `spawnMissing:false` · wi set | PRODUCT L2.5 | **PASS** — wi `3d882db2-…` |
| Inbox FE complete intake then screening → **201** each | PRODUCT L2.5 | **PASS** — U65 FE-sourced; no seed |
| GET candidate → `stage=screening` · fp non-null · F5 chip **Sàng lọc** | PRODUCT AC | **PASS** — AC-REC-WF-04 / J-REC-WF-04 |
| Soft: hired row shows **Bắt đầu QT** when `wi=null` | PRODUCT soft | **DEFER** — out of R2 AC; not P0/P1 |
| Seed / API-only PASS | PROCESS U65 | **PASS** — none in R2 chain |
| QA pack Layer B 2/8 | PROCESS | **OPEN P3** — non-blocking |
| Local L0 `qc:dev-stack` | ENV | **N/A** for Dev8088 gate (audit-only) |
| Reopen J-REC-WF-02/03 | OUT OF SLICE | **cấm** — not touched |
| Phase1 / PROD | OUT OF SLICE | **NOT claimed** |

---

## Micro-checklist (QC ≤5)

| # | Item | Result |
|---|------|--------|
| 1 | Product AC: start-pipeline + Inbox screening → `stage=screening` + fingerprint non-null + F5 | **PASS** |
| 2 | U65 no seed | **PASS** |
| 3 | Residual P0/P1 empty or listed | **Empty** (soft hired-CTA only · Conditions) |
| 4 | GO or GWC (NOT Phase1/PROD) | **GWC** — NOT Phase1/PROD |
| 5 | Evidence this file + next_dispatch PM promote map | **DONE** |

---

## AC adjudication (J-REC-WF-04 / AC-REC-WF-04)

| AC | Pass criteria | Evidence | QC |
|----|---------------|----------|-----|
| **Start pipeline** | Applied UV · Bắt đầu QT → 2xx · wi set · spawnMissing false | POST **201** `HRM-REC-CP-WF-200` · wi `3d882db2-…` | **PASS** |
| **Inbox step complete** | Complete screening (FE) → 2xx | intake **201** + screening **201** `XBOS-WF-200` | **PASS** |
| **Stage + fingerprint** | `stage=screening` · fp non-null · F5 chip | GET `stage=screening` · fp `…:screening:d9390c68-…` · list **Sàng lọc** | **PASS** |
| **Prior FAIL closed** | No longer stuck `new` / fp null | R2 vs FAIL-01 contrast | **PASS** |
| **U65** | No seed | QA + BE + DO declare zero-seed | **PASS** |

---

## L2.5 — J-REC-WF-04 (narrow step-sync)

| J-ID | Journey | Evidence | Verdict | Promotable |
|------|---------|----------|---------|------------|
| **J-REC-WF-04** | Roadmap bước ứng viên · step → stage | `bm-qa-j-rec-wf-04-step-sync-r2` | **PASS** | Yes — PM promote 🟡→✅ |
| **J-REC-WF-02** | Spawn (must_keep) | Prior GWC | **PASS** (prior) | **cấm reopen** |
| **J-REC-WF-03** | Inbox approve (must_keep) | Prior GWC | **PASS** (prior) | **cấm reopen** |

**Mandatory J-* for this slice:** **J-REC-WF-04** — **PASS**.  
**Deferred (explicit):** soft hired-CTA when `wi=null` — not R2 AC.  
**Journey map:** still 🟡 — **PM promote** to ✅ cite R2 QA + this QC gate.

---

## Residual / Conditions

### Residual — P0 / P1 only

| ID | Severity | Owner | Status | Note |
|----|----------|-------|--------|------|
| — | — | — | **None** | No open P0/P1 product blocker for J-REC-WF-04 step-sync on `:8088` |

### Conditions (GWC — not P0/P1 Residual)

| ID | Severity | Owner | Status | Note |
|----|----------|-------|--------|------|
| **C-REC-WF-04-PACK-01** | P3 PROCESS | qa (optional) | OPEN | Polish QA pack: `command_table` + `PORTAL_DEV_URL=http://14.225.217.232:8088` → verify 8/8 |
| **C-REC-WF-04-MAP-01** | P2 governance | **pm** | **OPEN** | Promote `PROGRAM_JOURNEY_MAP.md` **J-REC-WF-04** 🟡→✅ cite `bm-qa-j-rec-wf-04-step-sync-r2` + this QC gate; close queue #5 |
| Soft hired CTA when `wi=null` | soft | defer | NOTE | Prior soft; out of R2 AC — queue #6 optional |
| Phase1 / PROD | — | — | **FORBIDDEN** | Standing — **NOT** Phase 1 DONE · **NOT** PROD-READY |

**Closes prior FAIL:** `BM-QA-J-REC-WF-04-STEP-SYNC-01` stage/fp FAIL — product now **CLOSED** under this GWC.

---

## Exit criteria (PM dispatch) — QC map

| Exit | Result |
|------|--------|
| Audit QA PASS J-REC-WF-04 vs AC (start → Inbox → stage/fp/F5) | **DONE** — product PASS |
| Confirm U65 no seed | **DONE** |
| Confirm prior FAIL + BE + DO chain | **DONE** |
| Residual P0/P1 empty or listed | **DONE** — empty |
| GO or GWC; NOT Phase1/PROD | **GWC** |
| Evidence this file + next_dispatch PM promote map | **DONE** |
| cấm seed · Phase1/PROD · reopen J-02/03 | **RESPECTED** |

---

## Executive summary

QC audited **J-REC-WF-04** step-sync R2 on Dev8088: prior FAIL (stage stuck `new` / fp null) closed via BE bare-alias callback + DevOps sync; QA R2 browser chain **Bắt đầu QT** → Inbox screening complete → `stage=screening` + fingerprint non-null + F5 **PASS**. Residual P0/P1 = **none**. Layer B QA pack 2/8 = PROCESS P3 only. Soft hired-CTA deferred. **cấm** reopen J-02/03 · seed · Phase1/PROD.

**GO WITH CONDITIONS** for this bounded step-sync slice only. Conditions = pack polish (P3) + **PM map promote** (P2) + soft hired-CTA note + **explicit NOT Phase1/PROD**.

---

## Handoff

- **completion_report:** Closed QC gate `BM-QC-J-REC-WF-04-STEP-SYNC-R2`. Product **J-REC-WF-04** / AC-REC-WF-04 step-sync **PASS** on `:8088` U65; prior FAIL CLOSED. Residual P0/P1 = **none**. Layer B QA pack 2/8 = PROCESS P3. Map still 🟡 → PM promote. **NOT** Phase1/PROD. J-02/03 not reopened.
- **next_owner:** `pm`
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/bm-qc-j-rec-wf-04-step-sync-r2-20260722.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-BM-J-REC-WF-04-MAP-PROMOTE-01
from_role: pm
to_role: pm
lane: governance
priority: P2
program: P1-BMINUTES-CUST-RETEST-01
queue: docs/program/BMINUTES_MEMBER_SEQUENTIAL_QUEUE.md #5

entry_criteria:
- QC GWC: docs/qa/evidence/bm-qc-j-rec-wf-04-step-sync-r2-20260722.md
- QA PASS: docs/qa/evidence/bm-qa-j-rec-wf-04-step-sync-r2-20260722.md
- Residual P0/P1 none; soft hired-CTA deferred only

exit_criteria:
- Bus INTAKE BM-QC-J-REC-WF-04-STEP-SYNC-R2 GWC
- Update PROGRAM_JOURNEY_MAP.md J-REC-WF-04 🟡→✅ cite bm-qa-j-rec-wf-04-step-sync-r2 + bm-qc-j-rec-wf-04-step-sync-r2-20260722
- Mark BMINUTES queue #4 QC DONE · #5 promote DONE
- do NOT claim Phase1/PROD
- next: pm:idle:check top open (do not reopen J-02/03 / step-sync product without regression)

cấm: seed · reopen J-REC-WF-02/03 · Phase1/PROD claim · re-run full HRM sweep
```

Optional (P3 process — do not block):

```text
work_item_id: C-REC-WF-04-PACK-01
to_role: qa
exit: Edit docs/qa/evidence/bm-qa-j-rec-wf-04-step-sync-r2-20260722.md — add command_table (pnpm verify exit) + PORTAL_DEV_URL=http://14.225.217.232:8088; pnpm run verify:qc:evidence-pack exit 0
```
