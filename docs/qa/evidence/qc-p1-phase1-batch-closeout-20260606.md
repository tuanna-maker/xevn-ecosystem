# QC Gate Decision — P1-PHASE1-QC-BATCH-CLOSEOUT (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QC-BATCH-CLOSEOUT` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **environment** | `http://127.0.0.1:5173` (portal) · `:28001` hrm-api · `:28002` xbos-api |
| **accounts** | `ceo@xe.vn` / `Xevn@2026` (`main`) · `du-lich.ceo@xe.vn` / `Xevn@2026` (`xe-du-lich`) |
| **executed_at** | `2026-06-07` |
| **batch** | QA batch **3/3** — REC PATCH · AC-FID-04 insurance · member WF seed |
| **decision** | **GO WITH CONDITIONS** — batch retest slice promotable **localhost U32 only** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## QA chain audited (batch 3/3)

| # | work_item_id | QA evidence | Verdict |
|---|--------------|-------------|---------|
| 1 | `P1-PHASE1-BE-REC-PATCH-01` | `docs/qa/evidence/p1-phase1-qa-rec-patch-retest-20260606.md` | **PASS** — **D-CRUDMAT-REC-U-01 CLOSED** |
| 2 | `P1-HRM-H14-AC-FID-04-INS` | `docs/qa/evidence/p1-hrm-h14-ac-fid-04-ins-qa-20260606.md` | **PASS** — **AC-FID-04 CLOSED** |
| 3 | `P1-PHASE1-DO-WF-MEMBER-SEED` | `docs/qa/evidence/p1-phase1-qa-wf-member-retest-20260606.md` | **PASS** — **C-CRUDMAT-02 CLOSED** |

**Prior gate context:** `docs/qa/evidence/qc-p1-phase1-crud-rd-parity-20260606.md` — J-HRM-05/06 RD **PASS**; **D-CRUDMAT-REC-U-01** was **OPEN (P2)** at RD closeout → **CLOSED** by batch item 1.

---

## Scope (bounded — batch retest slice)

| In scope | Out of scope |
|----------|--------------|
| **AC-CRUD-HRM-REC-G-U-01** requisition status PATCH localhost | Phase 1 program closure / G1–G9 full gate |
| **AC-FID-04** per-company insurance_ratio ≥ 0.95 (5 UAT slugs) | **AC-FID-05+** attendance/payslip fidelity (backlog) |
| **AC-CRUD-CC-WF-M-RD-01** + **M-U-01** member CEO workflow API | nip.io / VPS `:8088` promotion |
| Close **D-CRUDMAT-REC-U-01** · **C-CRUDMAT-02** · **AC-FID-04** | Full browser L2.5 (CC inbox iframe, J-HRM-04 click) |
| Localhost U32 group + member CEO | **D-CRUDMAT-INS-RD-01** insurance GET-by-id (P3 optional) |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-rec-patch-retest-20260606.md
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h14-ac-fid-04-ins-qa-20260606.md
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-wf-member-retest-20260606.md
```

| File | Exit | Score | Failures |
|------|------|-------|----------|
| REC PATCH retest | **1** | **3/8** | `work_item_id` / `ack_status` table vs `:` regex; missing `J-*` block |
| AC-FID-04 QA | **1** | **3/8** | same format; missing literal C/R/U/D keyword block |
| Member WF retest | **1** | **3/8** | same format; missing C/R/U/D keyword block |

**QC adjudication:** **PROCESS GWC** — all three packs contain substantive work_item_id, L0, AC tables, defect closure, residual §, handoff contract; format gap **does not** block bounded product gate per `QC_ZERO_DEFECT_REFORM_PLAN.md` §3 and CRUD-matrix / HRM regate precedent (**C-CRUDMAT-03**).

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| L0 `qc:dev-stack` exit **0** (QC spot 2026-06-07) | ENV | **PASS** |
| QA L0 exit **0** on all 3 packs | ENV | **PASS** (concurred) |
| **PATCH** requisitions `{ status: 'on_hold' }` → **200** `HRM-REC-200` portal + direct | PRODUCT | **PASS** — **D-CRUDMAT-REC-U-01 CLOSED** |
| **AC-FID-04** five slugs `insurance_ratio` **≥ 0.95**; probe exit **0** | PRODUCT | **PASS** — **AC-FID-04 CLOSED** |
| `verify:hrm:menu-density` **7/7** | PRODUCT / fidelity | **PASS** (concurred) |
| P-CC-05 insurance API **1043** rows @ `main` | PRODUCT / L2 | **PASS** |
| Member CEO pending **≥1**; detail **200** `XBOS-WF-204`; complete **201** `XBOS-WF-200` | PRODUCT / L2.5 API | **PASS** — **C-CRUDMAT-02 CLOSED** |
| **AC-FID-05** attendance per-company | PRODUCT / backlog | **OPEN** — not in batch; next PM queue |
| Browser CC inbox / J-HRM-04 iframe click | Coverage | **GWC deferred** — API sufficient this batch |
| VPS member WF seed parity | ENV / deploy | **GWC deferred** — local only verified |
| Phase 1 DONE / PROD | OUT OF SLICE | **NOT claimed** |

---

## L0 — Dev stack health (QC spot)

| Check | QC spot (2026-06-07) | Result |
|-------|----------------------|--------|
| `pnpm run qc:dev-stack` | exit **0** | **PASS** |
| hrm-api `:28001` | HTTP **200** | **PASS** |
| xbos-api `:28002` | HTTP **200** | **PASS** |
| web-portal `:5173` | HTTP **200** | **PASS** |

---

## Batch item 1 — REC Update (closes RD gate P2 carry)

| AC-ID | Action | Portal | Direct | Verdict |
|-------|--------|--------|--------|---------|
| **AC-CRUD-HRM-REC-G-U-01** | `PATCH …/recruitment/requisitions/{id}?company_id=main` `{ status: 'on_hold' }` | **200** `HRM-REC-200` | **200** `HRM-REC-200` | **PASS** |

**Uplift from prior QC:** `qc-p1-phase1-crud-rd-parity-20260606.md` left **D-CRUDMAT-REC-U-01 OPEN (P2)** — **CLOSED** this batch. **C-CRUDMAT-01** strict requisition PATCH condition **CLOSED** for localhost U32.

---

## Batch item 2 — AC-FID-04 insurance fidelity

| Slug | with_contract | with_insurance | ratio | Target | Verdict |
|------|---------------|----------------|-------|--------|---------|
| holding | 203 | 193 | **0.951** | ≥ 0.95 | **PASS** |
| trsport | 207 | 197 | **0.952** | ≥ 0.95 | **PASS** |
| logistics | 197 | 188 | **0.954** | ≥ 0.95 | **PASS** |
| finance | 207 | 197 | **0.952** | ≥ 0.95 | **PASS** |
| services | 197 | 188 | **0.954** | ≥ 0.95 | **PASS** |

**CARD-INS-01** seed gap **CLOSED** via `seed:hrm:insurance-density`. Global gate alone insufficient (lesson R-H10-01); per-company probe required — concurred.

---

## Batch item 3 — Member CEO workflow (C-CRUDMAT-02)

| AC-ID | Action | HTTP | Code | Verdict |
|-------|--------|------|------|---------|
| **AC-CRUD-CC-WF-M-RD-01** | `GET …/instances/{id}/detail` | **200** | `XBOS-WF-204` | **PASS** |
| **AC-CRUD-CC-WF-M-U-01** | `POST …/tasks/{id}/complete` approved | **201** | `XBOS-WF-200` | **PASS** |

Pre-exercise: pending **2** → post-approve **1** (task consumed; re-seed before next M-U cycle).

---

## Defect / condition adjudication

| ID | Prior | QC verdict |
|----|-------|------------|
| **D-CRUDMAT-REC-U-01** | PATCH requisitions **404** (P2 open @ RD gate) | **CLOSED** |
| **C-CRUDMAT-01** | Strict requisition PATCH deferred | **CLOSED** localhost U32 |
| **AC-FID-04** | Per-company ratio ~0.07–0.09 | **CLOSED** |
| **C-CRUDMAT-02** | Member inbox pending=0 | **CLOSED** |
| **AC-FID-05** | Attendance per-company fidelity | **OPEN** — next backlog wave |
| **D-CRUDMAT-INS-RD-01** | Insurance GET-by-id **404** | **OPEN (P3)** — optional; non-blocking batch |
| **C-CRUDMAT-03** | Pack format verify | **OPEN (process GWC)** — 3/8 all batch files |

---

## J-* / L2.5 coverage (U19 audit)

| J-ID | Batch coverage | QC verdict |
|------|----------------|------------|
| **J-HRM-05/06** | Closed @ prior RD gate; REC-U complements matrix Update row | **PASS** (RD+U chain) |
| **J-XBOS-01** (member) | API detail + approve **PASS**; browser iframe not re-run | **GWC** — API promotable |
| **J-HRM-04** | Not re-run; AC-FID-04 density PASS | **GWC deferred** browser |

**NO-GO avoided:** QA did not claim full J-* browser matrix — bounded API + fidelity probes only; concurred for batch scope.

---

## Residual

| ID | Owner | Note |
|----|-------|------|
| **AC-FID-05** | dev-be → qa | Attendance per-company fidelity — next PM queue (`HRM_MENU_DATA_LINKAGE_MATRIX.md`) |
| **C-BATCHQC-01** | qa | Evidence pack format **3/8** on batch QA files — process GWC |
| **C-BATCHQC-02** | devops → qa | VPS/nip.io retest before promotion beyond localhost |
| **C-BATCHQC-03** | qa | Browser L2.5 CC inbox + J-HRM-04 iframe (optional) |
| **D-CRUDMAT-INS-RD-01** | dev-be | Insurance GET-by-id P3 optional |

---

## Conditions (bounded)

| ID | Status | Condition | Owner |
|----|--------|-----------|-------|
| **C-BATCHQC-01** | **OPEN (process)** | QA pack format **3/8** — add `ack_status:` line + J-* / CRUD keyword blocks for **8/8** | qa |
| **C-BATCHQC-02** | **OPEN (deferred)** | VPS/nip.io retest REC-U + AC-FID-04 + member WF before promotion beyond localhost | devops → qa |
| **AC-FID-05** | **OPEN (backlog)** | Attendance per-company fidelity — `HRM_MENU_DATA_LINKAGE_MATRIX.md` § AC-FID-05 | dev-be → qa |
| **C-BATCHQC-03** | **OPEN (optional)** | Browser L2.5 CC inbox + J-HRM-04 iframe click-path | qa |
| **C-BATCHQC-04** | **OPEN (optional P3)** | **D-CRUDMAT-INS-RD-01** insurance GET-by-id | dev-be |
| Member WF re-seed | **RUNBOOK** | Re-run `seed:workflow:member-inbox` before next M-U approve cycle | devops |

**Reopen trigger:** PATCH requisitions **404** again; any AC-FID-04 slug **< 0.95**; member CEO pending=0 after seed; scope **409** on exercised paths.

---

## Promotable slice (honest)

| Item | Status |
|------|--------|
| **AC-CRUD-HRM-REC-G-U-01** / **D-CRUDMAT-REC-U-01** | **Promotable** localhost U32 |
| **AC-FID-04** + **CARD-INS-01** | **Promotable** localhost U32 |
| **AC-CRUD-CC-WF-M-RD-01** + **M-U-01** / **C-CRUDMAT-02** | **Promotable** localhost U32 (API) |
| **AC-FID-05** attendance fidelity | **NOT promoted** — backlog open |
| nip.io / PROD / Phase 1 DONE | **NOT claimed** |

---

## pm_dispatch_hint

- Sponsor: QA batch **3/3 PASS** — REC Update, insurance fidelity, member WF seed gaps **CLOSED** on localhost U32.
- Sync `PHASE1_CRUD_ACCEPTANCE_MATRIX` — promote REC **U** row PASS; member WF **M-RD/M-U** PASS; close **C-CRUDMAT-01/02** conditions.
- Sync `HRM_MENU_DATA_LINKAGE_MATRIX` — **AC-FID-04 CLOSED**; queue **AC-FID-05** unless PM defers.
- Prior **qc-p1-phase1-crud-rd-parity-20260606.md** REC-U P2 carry **superseded CLOSED**.
- Do **not** claim Phase 1 DONE or PROD.

---

## Completion contract

**completion_report:** P1-PHASE1-QC-BATCH-CLOSEOUT **GO WITH CONDITIONS**. Audited QA batch 3/3 + prior RD parity gate. L0 spot **PASS**. **D-CRUDMAT-REC-U-01** · **AC-FID-04** · **C-CRUDMAT-02** **CLOSED**. **AC-CRUD-HRM-REC-G-U-01** + member WF M-RD/M-U + insurance fidelity **promotable localhost U32**. **AC-FID-05** **OPEN** next backlog. Pack verify **3/8** process GWC. **NOT** Phase 1 DONE / **NOT** PROD.

**next_owner:** **pm**

**next_dispatch_prompt:**

```text
@pm — P1-PHASE1 batch 3/3 QC closeout intake (GO WITH CONDITIONS localhost U32)

work_item_id: P1-PHASE1-PM-BATCH-CLOSEOUT-01
entry_criteria: QC PASS_TO_PM docs/qa/evidence/qc-p1-phase1-batch-closeout-20260606.md — REC-U + AC-FID-04 + C-CRUDMAT-02 CLOSED local U32
exit_criteria: (1) Bus batch closeout recorded; (2) PHASE1_CRUD_ACCEPTANCE_MATRIX promote REC-G-U-01 + member WF M-RD/M-U localhost PASS; close C-CRUDMAT-01/02; (3) HRM_MENU_DATA_LINKAGE_MATRIX AC-FID-04 CLOSED; (4) Queue AC-FID-05 attendance per-company unless deferred; (5) NOT Phase 1 DONE / NOT PROD
evidence_path: docs/qa/evidence/qc-p1-phase1-batch-closeout-20260606.md
ack_status target: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/qc-p1-phase1-batch-closeout-20260606.md`

**ack_status:** **PASS_TO_PM**
