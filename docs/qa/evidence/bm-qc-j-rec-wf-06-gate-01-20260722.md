# QC Gate — BM-QC-J-REC-WF-06-GATE-01 (2026-07-22)

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-QC-J-REC-WF-06-GATE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **date** | `2026-07-22` |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **environment** | Dev8088 · `PORTAL_DEV_URL=http://14.225.217.232:8088` |
| **portal_url** | `http://14.225.217.232:8088` |
| **persona** | Group CEO / BOD `ceo@xe.vn` · `companyId=main` · `tenantId=xevn` |
| **decision** | **GO WITH CONDITIONS** — **J-REC-WF-06** / reject path Inbox Từ chối → HRM `rejected` **CLOSED** on Dev8088 |
| **scope_claim** | Recruitment WF reject chain only: FE Gửi duyệt QT (draft YCTD, no seed) → Inbox deep-link → Từ chối + lý do → POST reject **201** `XBOS-WF-205` → HRM `status=rejected` → FE «Từ chối» F5 · no hired downgrade · peer R2 stays `open` · U65 zero-seed |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — browser-only; **cấm** seed inbox; chain from FE submit |
| **cấm this gate** | seed · Phase1/PROD claim · full HRM sweep · reopen J-01..05 product without regression |

---

## Scope (bounded)

| In scope | Explicitly out |
|----------|----------------|
| Audit QA PASS for **J-REC-WF-06** only (`bm-qa-j-rec-wf-06-reject-01-20260722.md`) | Full BM-05/07 · full HRM menu · Phase1/PROD |
| Confirm FE-sourced submit → reject (no seed inbox) | Re-open J-REC-WF-02/03/05 product without regression |
| Confirm no hired downgrade; peer open unchanged | Free-text lý do UX (P3 soft — reason present on payload) |
| Layer B pack verify + Classification | Full REC-WF remaster |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/bm-qa-j-rec-wf-06-reject-01-20260722.md` | QA J-06 | **PASS** — Gửi duyệt → Inbox Từ chối → POST reject **201** `XBOS-WF-205` · HRM `rejected` · F5 «Từ chối»; R2 peer `open`; funnel Đã tuyển **1** unchanged |
| `docs/qa/evidence/bm-qc-j-rec-wf-03-gate-01-20260722.md` | QC prior | **GWC** approve CLOSED; J-06 was deferred → this gate closes that soft condition |
| `docs/qa/evidence/qc-bm-j-rec-wf-05-funnel-01-20260722.md` | QC prior | **GWC** funnel; J-06 deferred → closed here |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | Journey SoT | **J-REC-WF-06** still ⬜ DRAFT — map lag vs QA PASS (PM promote P3) |
| Spec | Journey / UC | `PROGRAM_JOURNEY_MAP.md` J-REC-WF-06 · UC-HRM-REC-WF-06 · reject + lý do → `rejected`; không downgrade `hired` |

**No re-run** of full browser suite — audit-only per PM entry (`NARROW: audit … only`). Local `pnpm run qc:dev-stack` not required for Dev8088 substance audit (ENV local N/A).

---

## Evidence pack gate (Layer B)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/bm-qa-j-rec-wf-06-reject-01-20260722.md` | **FAIL** exit **1** (2/8) | **PROCESS** — missing `command_table` + `PORTAL_DEV_URL` token (`:8088` / URL alone fails portal_url regex) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/bm-qc-j-rec-wf-06-gate-01-20260722.md` | **PASS** exit **0** (8/8) | This gate file |

**Portal URL:** `http://14.225.217.232:8088` · `PORTAL_DEV_URL=http://14.225.217.232:8088`

**QC adjudication:** PROCESS gaps on QA pack are **format-only** (precedent `process-pack-not-product-nogo`). Browser substance — FE Gửi duyệt QT, Inbox Từ chối + confirm, Network POST **201** `XBOS-WF-205` with reason, HRM `status=rejected`, FE list «Từ chối» after F5, peer R2 `open`, funnel Đã tuyển unchanged — is complete. **Not** product NO-GO.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| FE Gửi duyệt QT on existing draft (wi=null → spawn) | PRODUCT / U65 | **PASS** — `201` `HRM-REC-WF-200` · `spawnMissing:false` · no seed |
| Inbox → Từ chối nhiệm vụ → confirm | PRODUCT L2.5 | **PASS** — deep-link `?wfInstanceId=5a3346d0-…&wfTaskId=97884fbc-…` |
| POST `/tasks/…/reject` → **201** `XBOS-WF-205`; reason present | PRODUCT | **PASS** — `outcome:rejected` · `reason:rejected_from_portal` |
| HRM GET requisition → `status=rejected`; FE «Từ chối»; F5 | PRODUCT | **PASS** — J-REC-WF-06 / UC-HRM-REC-WF-06 |
| No hired downgrade; peer R2 stays `open`; funnel Đã tuyển 1 | PRODUCT must_keep | **PASS** |
| Confirm dialog default reason (no free-text a11y field) | PRODUCT soft P3 | **NOTE** — reason still on payload; not P0/P1 |
| Seed inbox / API-only PASS | PROCESS U65 | **PASS** — none; FE submit + inbox only |
| QA pack Layer B 2/8 | PROCESS | **OPEN P3** — non-blocking |
| Local L0 `qc:dev-stack` | ENV | **N/A** for Dev8088 gate (audit-only) |
| Journey map J-REC-WF-06 still ⬜ | PROCESS / governance | **OPEN P3** — promote ⬜→✅ |
| Phase1 / PROD | OUT OF SLICE | **NOT claimed** |

---

## AC adjudication (J-REC-WF-06)

| AC | Pass criteria | Evidence | QC |
|----|---------------|----------|-----|
| **Precondition U65** | Reject from FE-spawned task (not seed inbox) | QA: Gửi duyệt QT then Inbox reject | **PASS** |
| **Reject + lý do** | Inbox Từ chối + reason → rejected | POST 201 `XBOS-WF-205` · reason `rejected_from_portal` | **PASS** |
| **HRM sync** | Requisition `status=rejected` + F5 FE | GET 200 · FE «Từ chối» after F5 | **PASS** |
| **No hired downgrade** | Peer hired/open not flipped incorrectly | R2 `open`; funnel Đã tuyển **1** | **PASS** |

---

## L2.5 — J-REC-WF-06 (narrow reject)

| J-ID | Journey | Evidence | Verdict | Promotable |
|------|---------|----------|---------|------------|
| **J-REC-WF-02** | Submit → spawn (precondition this run) | QA submit `spawnMissing:false` | **PASS** (this chain) | Already gated prior |
| **J-REC-WF-03** | Inbox approve (prior) | Prior QC GWC | **PASS** (prior) | Already gated |
| **J-REC-WF-06** | Inbox reject → HRM rejected → F5 | `bm-qa-j-rec-wf-06-reject-01` | **PASS** | Bounded reject slice |

**Mandatory J-* for this slice:** **J-REC-WF-06** — **PASS**.  
**Deferred (explicit):** none required for this gate; prior soft C-REC-WF-06 from approve/funnel gates **CLOSED**.  
**Journey map:** still ⬜ DRAFT — **PM promote** cite QA + this QC gate (P3 Condition).

---

## Residual / Conditions

### Residual — P0 / P1 only

| ID | Severity | Owner | Status | Note |
|----|----------|-------|--------|------|
| — | — | — | **None** | No open P0/P1 product blocker for J-REC-WF-06 on `:8088` |

### Conditions (GWC — not P0/P1 Residual)

| ID | Severity | Owner | Status | Note |
|----|----------|-------|--------|------|
| **C-REC-WF-06-PACK-01** | P3 PROCESS | qa (optional) | OPEN | Polish QA pack: `command_table` + `PORTAL_DEV_URL=http://14.225.217.232:8088` → verify 8/8 |
| **C-REC-WF-06-MAP-01** | P3 governance | pm | OPEN | Promote `PROGRAM_JOURNEY_MAP.md` J-REC-WF-06 ⬜→✅ cite `bm-qa-j-rec-wf-06-reject-01` + this QC gate |
| **C-REC-WF-06-REASON-UX** | P3 soft | ba (optional) | DEFER OK | Confirm dialog uses default `rejected_from_portal` — free-text lý do if SRS requires typed input |
| Phase1 / PROD | — | — | **FORBIDDEN** | Standing — **NOT** Phase 1 DONE · **NOT** PROD-READY |

**Closes soft defer from prior gates:** C-REC-WF-06 (reject path) from `bm-qc-j-rec-wf-03-gate` / `qc-bm-j-rec-wf-05-funnel` — product now **CLOSED** under this GWC.

---

## Exit criteria (PM dispatch) — QC map

| Exit | Result |
|------|--------|
| Audit QA PASS J-REC-WF-06 only | **DONE** — product PASS |
| Confirm FE-sourced / no seed / no hired downgrade | **DONE** |
| Audit L2.5 **J-REC-WF-06** | **DONE** — **PASS** |
| GO or GWC; Residual P0/P1 only | **GWC** — Residual P0/P1 = **none** |
| Evidence this file | **DONE** |
| cấm seed · Phase1/PROD · full HRM sweep | **RESPECTED** |

---

## Executive summary

QC audited **J-REC-WF-06** on Dev8088: FE Gửi duyệt QT (no seed) → Inbox Từ chối (+ lý do on payload) → XBOS reject **201** `XBOS-WF-205` → HRM requisition **`rejected`** / FE «Từ chối» → F5 PASS; peer R2 stays `open`; funnel Đã tuyển unchanged (no hired downgrade). Layer B QA pack 2/8 = PROCESS P3 only. Soft defer of reject path from prior approve/funnel GWC **CLOSED**.

**GO WITH CONDITIONS** for this bounded reject slice only. Conditions = pack polish (P3) + journey map promote (P3) + optional reason UX BA + **explicit NOT Phase1/PROD**.

---

## Handoff

- **completion_report:** Closed QC gate `BM-QC-J-REC-WF-06-GATE-01`. Product **J-REC-WF-06** reject path Inbox → HRM `rejected` **PASS** on `:8088` U65. Residual P0/P1 = **none**. Layer B QA pack 2/8 = PROCESS P3. Map still ⬜ (PM promote). Soft C-REC-WF-06 from prior gates CLOSED. **NOT** Phase1/PROD.
- **next_owner:** `pm`
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/bm-qc-j-rec-wf-06-gate-01-20260722.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-BM-J-REC-WF-06-CLOSE-01
from_role: pm
to_role: pm
lane: governance
priority: P2
entry_criteria: QC GWC docs/qa/evidence/bm-qc-j-rec-wf-06-gate-01-20260722.md; Residual P0/P1 none; J-REC-WF-06 PASS; soft C-REC-WF-06 from J-03/J-05 gates CLOSED
exit_criteria: Bus INTAKE BM-QC-J-REC-WF-06-GATE-01 GWC; promote PROGRAM_JOURNEY_MAP.md J-REC-WF-06 ⬜→✅ cite bm-qa-j-rec-wf-06-reject-01 + bm-qc-j-rec-wf-06-gate-01-20260722.md; TEAM_WORKING_NOW / evidence index cite QC gate; do NOT claim Phase1/PROD; next wave = highest open P0/P1 from pm:idle:check — do not reopen reject product without regression
cấm: seed · reopen J-REC-WF-06 product without regression · Phase1/PROD claim · full HRM sweep
```

Optional (P3 process — do not block):

```text
work_item_id: C-REC-WF-06-PACK-01
to_role: qa
exit: Edit docs/qa/evidence/bm-qa-j-rec-wf-06-reject-01-20260722.md — add command_table (pnpm verify exit) + PORTAL_DEV_URL=http://14.225.217.232:8088; pnpm run verify:qc:evidence-pack exit 0
```
