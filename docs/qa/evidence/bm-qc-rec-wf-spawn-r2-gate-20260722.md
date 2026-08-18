# QC Gate — BM-QC-REC-WF-SPAWN-R2-GATE (2026-07-22)

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-QC-REC-WF-SPAWN-R2-GATE` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **date** | `2026-07-22` |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **environment** | Dev8088 · `PORTAL_DEV_URL=http://14.225.217.232:8088` |
| **portal_url** | `http://14.225.217.232:8088` |
| **persona** | Group CEO / BOD `ceo@xe.vn` · `companyId=main` · `tenantId=xevn` |
| **decision** | **GO WITH CONDITIONS** — BM-06 / **J-REC-WF-02** spawn after member (VISUN) apply **CLOSED** on Dev8088 |
| **scope_claim** | Recruitment WF spawn only: XBOS apply member → HRM Gửi duyệt QT → `spawnMissing:false` + non-null `workflow_instance_id` · no SPAWN-MISSING · WF restore Toàn tập đoàn |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — browser-only; no seed in BE / DevOps / QA / QC chain |
| **prior FAIL** | `docs/qa/evidence/bm-qa-rec-e2e-8088-01-20260722.md` (SPAWN-MISSING after VISUN) |

---

## Scope (bounded)

| In scope | Explicitly out |
|----------|----------------|
| Audit QA R2 PASS closing prior BM-06 / J-REC-WF-02 FAIL | Full BM-05/07 retest · full HRM menu |
| Confirm VISUN apply → submit-workflow 201 · spawnMissing false · F5 | **J-REC-WF-03** inbox approve → terminal |
| Layer B pack verify + Classification | Phase 1 DONE · PROD-READY |
| Residual P0/P1 only in Residual | Optional FE banner/`company_id` polish |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/bm-qa-rec-e2e-8088-01-20260722.md` | QA prior | **FAIL** BM-06 — VISUN apply OK; Gửi duyệt → `spawnMissing:true` + SPAWN-MISSING banner |
| `docs/qa/evidence/bm-be-rec-wf-spawn-member-01-20260722.md` | Dev-BE | G-BM-REC-02 apply-scope; Group CEO holding/main spawn OK under member apply; jest 16/16 |
| `docs/qa/evidence/d-do-sync-8088-bm-wave1-01-20260722.md` | DevOps | Sync cited by QA (entry chain) |
| `docs/qa/evidence/bm-qa-rec-wf-spawn-r2-20260722.md` | QA R2 | **PASS** — PUT VISUN 200; POST submit-workflow **201** `HRM-REC-WF-200`; `spawnMissing:false`; `workflow_instance_id=ad7089df-…`; FE «QT XBOS đang chạy»; F5 OK; WF restored Toàn tập đoàn; G-RC-01 headcount:2 |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | Journey SoT | **J-REC-WF-02** row still ⬜ DRAFT (governance lag — product retest PASS) |

**No re-run** of full browser suite — audit-only per PM entry. Local `pnpm run qc:dev-stack` ECONNREFUSED = **ENV local** (not Dev8088 slice).

---

## Evidence pack gate (Layer B)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/bm-qa-rec-wf-spawn-r2-20260722.md` | **FAIL** exit **1** (2/8) | **PROCESS** — missing `command_table` + `PORTAL_DEV_URL` token (`:8088` alone fails portal_url regex) |
| `pnpm run qc:dev-stack` | **FAIL** exit **1** | **ENV** — local :28001/:28002/:5173 down; QA evidence is Dev8088 — not product NO-GO |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/bm-qc-rec-wf-spawn-r2-gate-20260722.md` | **PASS** exit **0** (8/8) | This gate file |

**Portal URL:** `http://14.225.217.232:8088` · `PORTAL_DEV_URL=http://14.225.217.232:8088`

**QC adjudication:** PROCESS gaps on QA R2 pack are **format-only** (precedent `process-pack-not-product-nogo`). Browser substance — click path XBOS→HRM, Network PUT **200** + POST **201**, `spawnMissing:false`, non-null instance id, FE no SPAWN-MISSING, F5, cleanup restore — is complete. **Not** product NO-GO.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| Prior SPAWN-MISSING after VISUN apply | PRODUCT | **CLOSED** — R2 retest PASS |
| PUT `hrm_requisition_approval` applyingEntityId=VISUN → **200** `XBOS-WF-201` + F5 list | PRODUCT | **PASS** |
| POST submit-workflow → **201** `HRM-REC-WF-200`; `spawnMissing:false`; `workflow_instance_id` non-null | PRODUCT | **PASS** — J-REC-WF-02 / BM-AC-06-02 |
| FE «QT XBOS đang chạy» / toast; **no** SPAWN-MISSING banner; F5 persists | PRODUCT | **PASS** |
| Restore Đơn vị áp dụng → Toàn tập đoàn PUT **200** | PRODUCT / shared-env hygiene | **PASS** |
| G-RC-01 headcount:2 on same YCTD create | PRODUCT must_keep | **PASS** (smoke) |
| Seed / API-only PASS | PROCESS U65 | **PASS** — none |
| QA pack Layer B 2/8 | PROCESS | **OPEN P3** — non-blocking |
| Local L0 `qc:dev-stack` down | ENV | **N/A** for Dev8088 gate |
| Phase1 / PROD | OUT OF SLICE | **NOT claimed** |

---

## AC adjudication (BM-06 / J-REC-WF-02 spawn)

| AC | Pass criteria | Evidence | QC |
|----|---------------|----------|-----|
| **BM-06 XBOS** | Apply member (VISUN) → Lưu 2xx + F5 | R2 PUT 200; list VISUN | **PASS** |
| **J-REC-WF-02 / BM-AC-06-02** | Gửi duyệt → instance non-null · `spawnMissing` false | R2 POST 201; id `ad7089df-…`; `spawnMissing:false` | **PASS** |
| **BM-06 HRM FE** | No SPAWN-MISSING; FE shows QT running | R2 action «QT XBOS đang chạy»; banner absent; F5 | **PASS** |
| **Cleanup** | Restore Toàn tập đoàn | R2 PUT 200; list Toàn tập đoàn | **PASS** |
| Prior FAIL closed | SPAWN-MISSING gap from E2E-01 | R2 closes E2E-01 BM-06 FAIL | **PASS** |

---

## L2.5 — J-REC-WF-02 (narrow spawn)

| J-ID | Journey | Evidence | Verdict | Promotable |
|------|---------|----------|---------|------------|
| **J-REC-WF-02** | Submit requisition → spawn instance (member apply VISUN) | R2: apply VISUN → Gửi duyệt → 201 · spawnMissing false · F5 | **PASS** | Bounded BM-06 spawn only |
| **J-REC-WF-03** | Inbox approve → terminal | Out of R2 scope (QA residual) | **Deferred** | Not required for this gate |

**Mandatory J-* for this slice:** **J-REC-WF-02** — **PASS**.  
**Deferred:** J-REC-WF-03 (approve chain); journey map row still ⬜ DRAFT until PM promotes.

---

## Residual / Conditions

### Residual — P0 / P1 only

| ID | Severity | Owner | Status | Note |
|----|----------|-------|--------|------|
| — | — | — | **None** | No open P0/P1 product blocker for BM-06 / J-REC-WF-02 spawn on `:8088` |

### Conditions (GWC — not P0/P1 Residual)

| ID | Severity | Owner | Status | Note |
|----|----------|-------|--------|------|
| **C-REC-WF-SPAWN-PACK-01** | P3 PROCESS | qa (optional) | OPEN | Polish R2 pack: `command_table` (pnpm verify exit) + `PORTAL_DEV_URL=http://14.225.217.232:8088` → verify 8/8 |
| **C-REC-WF-MAP-01** | P2 governance | pm | OPEN | Update `PROGRAM_JOURNEY_MAP.md` **J-REC-WF-02** ⬜ DRAFT → cite R2 PASS (product closed; map lag) |
| **C-REC-WF-03** | soft / next wave | pm → qa | DEFER OK | Inbox approve → terminal out of R2; do not reopen spawn without regression |
| Optional FE polish | P1 soft | pm (optional) | DEFER | `BM-FE-REC-WF-SPAWN-MEMBER-01` banner/`company_id` — not blocking GWC |
| Phase1 / PROD | — | — | **FORBIDDEN** | Standing — **NOT** Phase 1 DONE · **NOT** PROD-READY |

---

## Exit criteria (PM dispatch) — QC map

| Exit | Result |
|------|--------|
| Audit QA R2 PASS vs prior FAIL | **DONE** — product PASS; prior SPAWN-MISSING **CLOSED** |
| Audit L2.5 **J-REC-WF-02** | **DONE** — **PASS** |
| GO or GWC; Residual P0/P1 only | **GWC** — Residual P0/P1 = **none** |
| Evidence this file | **DONE** |
| cấm seed · Phase1/PROD | **RESPECTED** |

---

## Executive summary

QC audited BM-06 / **J-REC-WF-02** R2 on Dev8088 after BE member-apply spawn fix: prior E2E SPAWN-MISSING **CLOSED**; VISUN apply → Gửi duyệt QT → **201** with `spawnMissing:false` and non-null `workflow_instance_id`; FE no SPAWN-MISSING; F5 OK; WF restored Toàn tập đoàn; U65 zero-seed. Layer B QA pack 2/8 = PROCESS P3 only. Local L0 down = ENV N/A for `:8088`.

**GO WITH CONDITIONS** for this bounded spawn slice only. Conditions = pack polish (P3) + journey-map promote (P2) + optional J-03 / FE defer + **explicit NOT Phase1/PROD**.

---

## Handoff

- **completion_report:** Closed QC gate `BM-QC-REC-WF-SPAWN-R2-GATE`. Product BM-06 / J-REC-WF-02 spawn after VISUN apply **PASS** on `:8088` U65. Prior FAIL SPAWN-MISSING **CLOSED**. Residual P0/P1 = **none**. Layer B QA pack 2/8 = PROCESS P3. **NOT** Phase1/PROD.
- **next_owner:** `pm`
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/bm-qc-rec-wf-spawn-r2-gate-20260722.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-BM-REC-WF-SPAWN-R2-CLOSE-01
from_role: pm
to_role: pm
lane: governance
priority: P2
entry_criteria: QC GWC docs/qa/evidence/bm-qc-rec-wf-spawn-r2-gate-20260722.md; Residual P0/P1 none; J-REC-WF-02 PASS
exit_criteria: Bus INTAKE BM-QC-REC-WF-SPAWN-R2-GATE GWC; update PROGRAM_JOURNEY_MAP.md J-REC-WF-02 cite R2 PASS (close C-REC-WF-MAP-01); TEAM_WORKING_NOW / evidence index cite bm-qc-rec-wf-spawn-r2-gate-20260722.md; do NOT claim Phase1/PROD; next wave = highest open P0 from pm:idle:check (BM residual / J-REC-WF-03 if in backlog) — do not reopen spawn product without regression note
cấm: seed · reopen SPAWN-MISSING product · Phase1/PROD claim from this gate
```

Optional (P3 process — do not block):

```text
work_item_id: C-REC-WF-SPAWN-PACK-01
to_role: qa
exit: Edit docs/qa/evidence/bm-qa-rec-wf-spawn-r2-20260722.md — add command_table (pnpm verify exit) + PORTAL_DEV_URL=http://14.225.217.232:8088; pnpm run verify:qc:evidence-pack exit 0
```
