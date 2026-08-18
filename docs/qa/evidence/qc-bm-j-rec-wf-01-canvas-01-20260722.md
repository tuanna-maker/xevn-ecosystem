# QC Gate — QC-BM-J-REC-WF-01-CANVAS-01 (2026-07-22)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-BM-J-REC-WF-01-CANVAS-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **date** | `2026-07-22` |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **environment** | Dev8088 · `PORTAL_DEV_URL=http://14.225.217.232:8088` |
| **portal_url** | `http://14.225.217.232:8088` |
| **persona** | Group CEO / BOD `ceo@xe.vn` lane · Command Center unlocked |
| **decision** | **GO WITH CONDITIONS** — **J-REC-WF-01** / AC-REC-WF-01 / BM-03 soft (canvas + resolver) **CLOSED** on Dev8088 |
| **scope_claim** | Recruitment WF canvas only: CC → Hệ thống quy trình → open `hrm_requisition_approval` → BM-03 resolver types → Lưu PUT 200 → F5 active · must_keep spawn path Toàn tập đoàn |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — browser-only; no seed in QA/QC chain |
| **cấm this gate** | seed · Phase1/PROD claim · reopen **J-REC-WF-02/03** product |

---

## Scope (bounded)

| In scope | Explicitly out |
|----------|----------------|
| Audit QA PASS for **J-REC-WF-01** (canvas open/save/F5 + BM-03 soft resolvers) | Full BM-05/07 · full HRM menu |
| Confirm must_keep: applying scope left **Toàn tập đoàn** (no wipe spawn) | Re-open / mutate **J-REC-WF-02** spawn or **J-REC-WF-03** inbox product |
| Layer B pack verify + Classification | Phase 1 DONE · PROD-READY |
| Residual P0/P1 only in Residual | Optional GET-by-id 404 probe / tab-race UX |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/bm-qa-j-rec-wf-01-canvas-01-20260722.md` | QA | **PASS** — CC `?settings=workflow` → open `hrm_requisition_approval` (`944c9abf-…`) → resolver options `direct_manager` / `position_template` / `parallel_group` → PUT **200** `XBOS-WF-201` → F5 list `status=active` · Toàn tập đoàn · no seed |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | Journey SoT | **J-REC-WF-01** already ✅ PASS cite `bm-qa-j-rec-wf-01-canvas-01` |
| Prior QC | Spawn / Inbox | **J-REC-WF-02** / **J-REC-WF-03** already GWC/PASS — **must_keep** not reopened by this canvas save |
| Spec | BA | UC-HRM-REC-WF-01 · AC-REC-WF-01 · BM-03 soft (resolver types) |

**No re-run** of full browser suite — audit-only per PM entry. Local `pnpm run qc:dev-stack` not required for Dev8088 substance audit (ENV local N/A).

---

## Evidence pack gate (Layer B)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/bm-qa-j-rec-wf-01-canvas-01-20260722.md` | **FAIL** exit **1** (2/8) | **PROCESS** — missing `command_table` + `PORTAL_DEV_URL` token (`:8088` alone fails portal_url regex) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-bm-j-rec-wf-01-canvas-01-20260722.md` | **PASS** exit **0** (8/8) | This gate file |

**Portal URL:** `http://14.225.217.232:8088` · `PORTAL_DEV_URL=http://14.225.217.232:8088`

**QC adjudication:** PROCESS gaps on QA pack are **format-only** (precedent `process-pack-not-product-nogo`). Browser substance — click path, Network PUT **200**, FE toast after 2xx, F5 active + resolver options, must_keep Toàn tập đoàn — is complete. **Not** product NO-GO.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| CC → Hệ thống quy trình deep-link loads | PRODUCT L2 | **PASS** |
| Open active `hrm_requisition_approval` canvas | PRODUCT L2.5 | **PASS** — id `944c9abf-…` |
| BM-03 soft: resolver types present | PRODUCT | **PASS** — `direct_manager`, `position_template`, `parallel_group` (+ fixed_user, role_code) |
| Lưu quy trình → PUT 200 `XBOS-WF-201` | PRODUCT | **PASS** — FE toast DB save |
| F5 → definition still active / bridge «đã có» | PRODUCT | **PASS** — GET list 200 `XBOS-WF-200` |
| must_keep applyingEntityId empty / Toàn tập đoàn | PRODUCT / must_keep | **PASS** — did not set VISUN/member; J-02/03 spawn path intact |
| Seed / API-only PASS | PROCESS U65 | **PASS** — none; browser FE only |
| QA pack Layer B 2/8 | PROCESS | **OPEN P3** — non-blocking |
| GET `/definitions/{id}` 404 ad-hoc | PRODUCT soft | **NOTE P3** — list+FE path sufficient for UF |
| Tab race CC→HR recruitment | UX soft | **NOTE P3** — workaround deep-link documented |
| Local L0 `qc:dev-stack` | ENV | **N/A** for Dev8088 gate (audit-only) |
| Reopen J-REC-WF-02/03 | OUT OF SLICE | **FORBIDDEN** — PM cấm |
| Phase1 / PROD | OUT OF SLICE | **NOT claimed** |

---

## AC adjudication (J-REC-WF-01 / AC-REC-WF-01)

| AC | Pass criteria | Evidence | QC |
|----|---------------|----------|-----|
| **J-REC-WF-01 / L2** | CC → Hệ thống quy trình loads | QA click path + list/bridge | **PASS** |
| **J-REC-WF-01 / open** | Open/create active `hrm_recruitment_*` or `hrm_requisition_approval` | Opened existing `hrm_requisition_approval` | **PASS** |
| **BM-03 soft** | Resolver types: direct_manager / position_template / parallel | UI `parallel_group` maps «parallel» | **PASS** |
| **Save active** | Lưu → 2xx | PUT 200 `XBOS-WF-201` | **PASS** |
| **F5 persist** | Reload → still active | List GET; status=active; FE «đã có» | **PASS** |
| **must_keep** | Do not wipe J-REC-WF-02/03 spawn path | Toàn tập đoàn unchanged | **PASS** |

---

## L2.5 — J-REC-WF-01 (narrow canvas)

| J-ID | Journey | Evidence | Verdict | Promotable |
|------|---------|----------|---------|------------|
| **J-REC-WF-01** | XBOS canvas QT tuyển dụng → save → F5 | `bm-qa-j-rec-wf-01-canvas-01` | **PASS** | Bounded canvas slice |
| **J-REC-WF-02** | Submit → spawn | Prior R2 + QC GWC | **PASS** (prior) — **do not reopen** | Already gated |
| **J-REC-WF-03** | Inbox duyệt → HRM sync | Prior inbox + QC GWC | **PASS** (prior) — **do not reopen** | Already gated |

**Mandatory J-* for this slice:** **J-REC-WF-01** — **PASS**.  
**Deferred / forbidden reopen:** **J-REC-WF-02** / **J-REC-WF-03** — PM cấm reopen in this gate.  
**Journey map:** J-REC-WF-01 already ✅ cite QA evidence — soft promote QC cite optional.

---

## Residual / Conditions

### Residual — P0 / P1 only

| ID | Severity | Owner | Status | Note |
|----|----------|-------|--------|------|
| — | — | — | **None** | No open P0/P1 product blocker for J-REC-WF-01 / AC-REC-WF-01 on `:8088` |

### Conditions (GWC — not P0/P1 Residual)

| ID | Severity | Owner | Status | Note |
|----|----------|-------|--------|------|
| **C-REC-WF-01-PACK-01** | P3 PROCESS | qa (optional) | OPEN | Polish QA pack: `command_table` + `PORTAL_DEV_URL=http://14.225.217.232:8088` → verify 8/8 |
| **C-REC-WF-01-MAP-QC** | P3 governance | pm (optional) | OPEN | Optionally append QC gate cite on `PROGRAM_JOURNEY_MAP.md` J-REC-WF-01 (already ✅ from QA) |
| GET-by-id 404 soft | P3 | — | NOTE | List+FE sufficient; not blocker |
| Tab-race settings→HR | P3 UX | — | NOTE | Deep-link workaround documented |
| Phase1 / PROD | — | — | **FORBIDDEN** | Standing — **NOT** Phase 1 DONE · **NOT** PROD-READY |
| Reopen J-02/03 | — | — | **FORBIDDEN** | must_keep — canvas save left Toàn tập đoàn |

---

## Exit criteria (PM dispatch) — QC map

| Exit | Result |
|------|--------|
| Audit QA PASS J-REC-WF-01 vs AC | **DONE** — product PASS |
| Confirm BM-03 soft resolvers + save/F5 | **DONE** |
| Confirm must_keep J-02/03 not wiped | **DONE** — Toàn tập đoàn |
| Audit L2.5 **J-REC-WF-01** | **DONE** — **PASS** |
| **cấm** reopen J-02/03 · seed · Phase1/PROD | **RESPECTED** |
| GO or GWC; Residual P0/P1 only | **GWC** — Residual P0/P1 = **none** |
| Evidence this file | **DONE** |

---

## Executive summary

QC audited **J-REC-WF-01** on Dev8088: Command Center workflow canvas opened `hrm_requisition_approval`, BM-03 soft resolver catalog present (`direct_manager` / `position_template` / `parallel_group`), Lưu → PUT **200** `XBOS-WF-201`, F5 still **active**, applying scope left **Toàn tập đoàn** (J-REC-WF-02/03 spawn path **must_keep** intact). Layer B QA pack 2/8 = PROCESS P3 only. No seed. **NOT** Phase1/PROD. **Did not** reopen J-02/03.

**GO WITH CONDITIONS** for this bounded canvas slice only. Conditions = pack polish (P3) + optional map QC cite + **explicit NOT Phase1/PROD** + **cấm reopen J-02/03**.

---

## Handoff

- **completion_report:** Closed QC gate `QC-BM-J-REC-WF-01-CANVAS-01`. Product **J-REC-WF-01** / AC-REC-WF-01 / BM-03 soft canvas **PASS** on `:8088` U65. Residual P0/P1 = **none**. Layer B QA pack 2/8 = PROCESS P3. must_keep J-02/03 intact. **NOT** Phase1/PROD.
- **next_owner:** `pm`
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/qc-bm-j-rec-wf-01-canvas-01-20260722.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-BM-J-REC-WF-01-CLOSE-01
from_role: pm
to_role: pm
lane: governance
priority: P2
entry_criteria: QC GWC docs/qa/evidence/qc-bm-j-rec-wf-01-canvas-01-20260722.md; Residual P0/P1 none; J-REC-WF-01 PASS; J-02/03 must_keep intact
exit_criteria: Bus INTAKE QC-BM-J-REC-WF-01-CANVAS-01 GWC; TEAM_WORKING_NOW / evidence index cite qc-bm-j-rec-wf-01-canvas-01-20260722.md; do NOT claim Phase1/PROD; do NOT reopen J-REC-WF-02/03 without regression; next wave = highest open P0/P1 from pm:idle:check (BM residual / other J-* only if backlog prioritizes)
cấm: seed · reopen J-REC-WF-02/03 product · Phase1/PROD claim
```

Optional (P3 process — do not block):

```text
work_item_id: C-REC-WF-01-PACK-01
to_role: qa
exit: Edit docs/qa/evidence/bm-qa-j-rec-wf-01-canvas-01-20260722.md — add command_table (pnpm verify exit) + PORTAL_DEV_URL=http://14.225.217.232:8088; pnpm run verify:qc:evidence-pack exit 0
```
