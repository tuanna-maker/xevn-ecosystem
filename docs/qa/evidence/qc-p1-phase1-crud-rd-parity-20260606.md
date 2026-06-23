# QC Gate Decision — P1-PHASE1-QC-CRUD-RD-PARITY-01 (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QC-CRUD-RD-PARITY-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **environment** | `http://127.0.0.1:5173` (portal) · `http://127.0.0.1:28001` (hrm-api direct) |
| **account** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` (group CEO holding rollup) |
| **executed_at** | `2026-06-06` |
| **qa_evidence** | `docs/qa/evidence/p1-phase1-qa-crud-rd-retest-20260606.md` |
| **probe JSON** | `docs/qa/evidence/p1-phase1-qa-crud-rd-retest-20260606-probe.json` |
| **dev_evidence** | `docs/qa/evidence/p1-phase1-be-crud-rd-parity-20260606.md` |
| **prior QA** | `docs/qa/evidence/p1-phase1-qa-crud-matrix-retest-20260606.md` — J-HRM-05 FAIL · J-HRM-06 GWC |
| **decision** | **GO WITH CONDITIONS** — CRUD **GET-by-id (RD)** scope parity **2/2 PASS** localhost U32 |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — RD parity slice only)

| In scope | Out of scope |
|----------|--------------|
| **J-HRM-05** list → GET requisition by id (`AC-CRUD-HRM-REC-G-RD-01`) | Full CRUD matrix §3 P0 program closure |
| **J-HRM-06** list → GET attendance record by id (`AC-CRUD-HRM-ATT-G-RD-01`) | Member CEO / mobile personas |
| Close **D-CRUDMAT-REC-RD-01** · **D-CRUDMAT-ATT-RD-01** | nip.io / VPS `:8088` promotion |
| Group CEO `company_id=main` localhost U32 | Browser iframe click-path L2.5 (P3 deferred) |
| scope_parity: same resolver as list on GET-by-id | **D-CRUDMAT-INS-RD-01** insurance deep link (P3) |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-crud-rd-retest-20260606.md
```

| Result | Detail |
|--------|--------|
| Exit | **1** (**2/8**) |
| Failures | `ack_status` — table `\| **ack_status** \|` vs script regex `ack_status:`; `crud_or_matrix` — journey AC-IDs present but no literal C/R/U/D keyword block |
| QC adjudication | **PROCESS GWC** — substantive pack complete (work_item_id, L0, L2.5 journey table, defect closure, residual §, probe JSON, handoff contract); **does not** block bounded RD product gate per `QC_ZERO_DEFECT_REFORM_PLAN.md` §3 and prior CRUD-matrix precedent |

**Authoritative anchors:** QA retest MD + probe JSON @ `2026-06-06`; Dev-BE `p1-phase1-be-crud-rd-parity-20260606.md` (347/347 unit PASS).

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| L0 `qc:dev-stack` exit **0** (QC spot 2026-06-06) | ENV | **PASS** |
| QA `qc:fe-be-health` exit **0** | ENV | **PASS** (concurred) |
| **J-HRM-05** list **200** → GET `e5228749-…` **200** `HRM-REC-200` portal + direct | PRODUCT / L2.5 | **PASS** — **D-CRUDMAT-REC-RD-01 CLOSED** |
| **J-HRM-06** list **200** → GET `8a90df5c-…` **200** `HRM-ATT-200` portal + direct | PRODUCT / L2.5 | **PASS** — **D-CRUDMAT-ATT-RD-01 CLOSED** |
| scope_parity list id matches GET-by-id scope | PRODUCT / ADR | **PASS** — no 404 mismatch |
| **D-CRUDMAT-REC-U-01** PATCH requisitions **404** | PRODUCT / U lane | **OPEN (P2 GWC)** — non-blocking RD slice; headcount-proposals PATCH works |
| **D-CRUDMAT-INS-RD-01** insurance GET-by-id **404** | PRODUCT / optional | **OPEN (P3 GWC)** — J-HRM-04 employee link still valid |
| Browser embed click P-CC-06/07 | Coverage | **GWC deferred** — API L2.5 sufficient for this wave |
| Phase 1 DONE / PROD | OUT OF SLICE | **NOT claimed** |

---

## L0 — Dev stack health (QC spot)

| Check | QC spot (2026-06-06) | Result |
|-------|----------------------|--------|
| `pnpm run qc:dev-stack` | exit **0** | **PASS** |
| hrm-api `:28001` | HTTP **200** | **PASS** |
| xbos-api `:28002` | HTTP **200** | **PASS** |
| web-portal `:5173` | HTTP **200** | **PASS** |

---

## L2.5 — J-HRM-05 / J-HRM-06 (GET-by-id scope parity)

| J-ID | P-CC | AC-ID | List → detail | Portal | Direct | Verdict | Promotable |
|------|------|-------|---------------|--------|--------|---------|------------|
| **J-HRM-05** | P-CC-06 | **AC-CRUD-HRM-REC-G-RD-01** | requisitions list → `GET …/requisitions/{id}` | **200** `HRM-REC-200` | **200** `HRM-REC-200` | **PASS** | **YES** localhost U32 |
| **J-HRM-06** | P-CC-07 | **AC-CRUD-HRM-ATT-G-RD-01** | records list → `GET …/records/{recordId}` | **200** `HRM-ATT-200` | **200** `HRM-ATT-200` | **PASS** | **YES** localhost U32 |

**Probe JSON concurrence:** `in_scope_pass: 2`, `in_scope_fail: 0`, `scope_parity: PASS` — matches QA table entity ids and HTTP codes.

**Prior state uplift:** Matrix retest `p1-phase1-qa-crud-matrix-retest-20260606.md` — J-HRM-05 **FAIL** (404) · J-HRM-06 **GWC** → both **PASS** after BE `P1-PHASE1-BE-CRUD-RD-PARITY-01`.

---

## Defect adjudication

| Defect ID | Prior | QC verdict |
|-----------|-------|------------|
| **D-CRUDMAT-REC-RD-01** | List 200 · GET **404** `HRM-DATA-404` | **CLOSED** |
| **D-CRUDMAT-ATT-RD-01** | List 200 · GET **404** | **CLOSED** |
| **D-CRUDMAT-REC-U-01** | PATCH requisitions **404** | **OPEN (P2 GWC)** — tracked `P1-PHASE1-BE-REC-PATCH-01`; does not block RD gate |
| **D-CRUDMAT-INS-RD-01** | Insurance GET-by-id **404** | **OPEN (P3 GWC)** — optional deep link |

---

## Conditions (bounded)

| ID | Status | Condition | Owner |
|----|--------|-----------|-------|
| **C-CRUDRDQC-01** | **OPEN (deferred)** | VPS/nip.io or `:8088` retest J-HRM-05/06 GET-by-id before promotion beyond localhost | devops → qa |
| **C-CRUDRDQC-02** | **OPEN (process GWC)** | QA pack format — add `ack_status:` line + CRUD keyword block for future `verify:qc:evidence-pack` **8/8** | qa |
| **D-CRUDMAT-REC-U-01** | **OPEN (P2)** | Requisition status PATCH route — separate dev-be wave | dev-be |
| **D-CRUDMAT-INS-RD-01** | **OPEN (P3)** | Insurance participant GET-by-id optional | dev-be (optional) |
| Browser P-CC-06/07 iframe click | **GWC deferred** | Full embed L2.5 not re-run this batch | qa (optional) |

**Reopen trigger:** List returns id but GET-by-id **404**/`409` on `company_id=main`; scope_parity regression in `p1-phase1-be-crud-rd-parity.spec.ts`; **500** on recruitment/attendance GET-by-id.

---

## Promotable slice (honest)

| Item | Status |
|------|--------|
| **AC-CRUD-HRM-REC-G-RD-01** / **J-HRM-05** GET-by-id | **Promotable** localhost U32 |
| **AC-CRUD-HRM-ATT-G-RD-01** / **J-HRM-06** GET-by-id | **Promotable** localhost U32 |
| **D-CRUDMAT-REC-RD-01** / **D-CRUDMAT-ATT-RD-01** | **CLOSED** |
| **D-CRUDMAT-REC-U-01** (Update) | **NOT promoted** — P2 open |
| nip.io / PROD / Phase 1 DONE | **NOT claimed** |

---

## pm_dispatch_hint

- Sponsor: CRUD **Read (GET-by-id)** scope parity **PASS** for recruitment + attendance on localhost; prior **404 list→detail mismatch CLOSED**.
- **D-CRUDMAT-REC-U-01** remains P2 — bus already has `P1-PHASE1-BE-REC-PATCH-01` DISPATCHED; do not block this RD gate on U lane.
- Sync `PHASE1_CRUD_ACCEPTANCE_MATRIX` RD rows + journey map QC ref for J-HRM-05/06 GET-by-id uplift.
- Do **not** claim Phase 1 DONE or PROD.

---

## Completion contract

**completion_report:** P1-PHASE1-QC-CRUD-RD-PARITY-01 **GO WITH CONDITIONS**. Audited QA retest + Dev-BE parity chain. L0 spot **PASS**. **J-HRM-05** + **J-HRM-06** list→GET-by-id **2/2 PASS** localhost U32. **D-CRUDMAT-REC-RD-01** + **D-CRUDMAT-ATT-RD-01 CLOSED**. **D-CRUDMAT-REC-U-01** P2 **OPEN** (non-blocking). **NOT** Phase 1 DONE / **NOT** PROD.

**next_owner:** **pm**

**next_dispatch_prompt:**

```text
@pm — P1-PHASE1 post CRUD-RD parity governance (J-HRM-05/06 GET-by-id CLOSED local U32)

work_item_id: P1-PHASE1-PM-CRUD-RD-01
entry_criteria: QC PASS_TO_PM docs/qa/evidence/qc-p1-phase1-crud-rd-parity-20260606.md — J-HRM-05/06 RD scope parity PASS; D-CRUDMAT-REC-RD-01 + D-CRUDMAT-ATT-RD-01 CLOSED
exit_criteria: (1) Bus CRUD-RD parity gate recorded; (2) PHASE1_CRUD_ACCEPTANCE_MATRIX promote AC-CRUD-HRM-REC-G-RD-01 + ATT-G-RD-01 localhost PASS; (3) PROGRAM_JOURNEY_MAP J-HRM-05/06 cite qc-p1-phase1-crud-rd-parity-20260606.md; (4) D-CRUDMAT-REC-U-01 stays P2 — track P1-PHASE1-BE-REC-PATCH-01 separately; (5) NOT Phase 1 DONE / NOT PROD
evidence_path: docs/qa/evidence/qc-p1-phase1-crud-rd-parity-20260606.md
ack_status target: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/qc-p1-phase1-crud-rd-parity-20260606.md`

**ack_status:** **PASS_TO_PM**
