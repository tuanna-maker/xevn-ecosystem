# QC Gate Decision — CD-FB-08-CONTRACT (2026-07-19)

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-08-CONTRACT-QC` |
| **slice** | `CD-FB-08-CONTRACT` · F5 contract / compensation |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **environment** | portal `:5173` · hrm `:28001` · xbos `:28002` (QA L0 during U65) |
| **accounts** | `ceo@xe.vn` · JWT `companyId=main` · `roleCode=group_ceo` |
| **executed_at** | `2026-07-19` |
| **program** | Customer demo HRM delta F5 (HĐ term-only + Đãi ngộ + Lịch sử) |
| **spec_ref** | `docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md` §5 AC-CD-F5-01..04,07 · UC-HRM-25 |
| **decision** | **GO WITH CONDITIONS** — AC-CD-F5-01/03/04/07 + F5-02 (N/A) + **P-CC-04** + **J-HRM-01** + **J-HRM-03** PASS |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

QC audited QA `cd-fb-08-contract-qa-20260719.md` (**PASS_TO_PM**, parked under sponsor STOP) plus FE/BE READY packs. Browser U65 (zero-seed): P-CC-04 contracts list (1104, no salary column), J-HRM-01 list→profile HLD-0006, Đãi ngộ create **POST 201** `HRM-COMP-201` (base + ≥2 allowances), revise **POST 201**, Lịch sử ≥2 versions, F5 persist, J-HRM-03 Eye→dialog — all **PASS**.

Product residual cold `/active` 500 (**C-CD-FB-08-01** / **R-CD-FB-08-ACTIVE-COLD-500**) — **CLOSED** 2026-07-19 (`docs/qa/evidence/c-cd-fb-08-01-qc-20260719.md`). Remaining conditions: pack process **C-02**, payroll **C-03**, standing no Phase1/PROD **C-04**.

Evidence-pack verify **1/8** (`command_table` only) classified **PROCESS** — not product NO-GO (precedent: soft-nav / JWT / residual-03).

**NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** F-DELIVERY / customer-demo program exit.

---

## Chain audited

| Lane | Evidence | Verdict |
|------|----------|---------|
| dev-be | `docs/qa/evidence/cd-fb-08-contract-be-20260719.md` | READY_FOR_QA — schema + compensation APIs; jest 37 PASS |
| dev-fe | `docs/qa/evidence/cd-fb-08-contract-fe-20260719.md` | READY_FOR_QA — tabs HĐ/Đãi ngộ/Lịch sử; vitest 15 PASS |
| qa | `docs/qa/evidence/cd-fb-08-contract-qa-20260719.md` | **PASS_TO_PM** — browser U65 AC + L2/L2.5 |
| qc (this) | `docs/qa/evidence/cd-fb-08-contract-qc-20260719.md` | **GO WITH CONDITIONS** |

---

## Evidence pack gate (Layer B)

| File | verify exit | Score | QC adjudication |
|------|-------------|-------|-----------------|
| `cd-fb-08-contract-qa-20260719.md` | **1** | **1/8** | **PROCESS GWC** — missing `command_table` regex only; browser click-path, AC matrix, Network mutate table, J-*, U65, residual section present in prose |

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/cd-fb-08-contract-qa-20260719.md
# FAIL: QC evidence pack incomplete (1/8 checks) — command_table
```

**QC rule applied:** Product slice adjudicated from readable QA MD (AC matrix, click path, Network 201/200, L2.5 J-*, residual). Pack format gap → **C-CD-FB-08-02** (process, non-blocking) — **does not** force product NO-GO.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| QA L0 portal/hrm/xbos **200** during U65 | ENV | **PASS** (recorded in QA pack) |
| QC spot `qc:dev-stack` 2026-07-19 ~18:28 | ENV | All three **down** — **ENV at gate time**; does **not** reopen product ACs already evidenced under live stack |
| `verify:qc:evidence-pack` 1/8 | PROCESS | **GWC format** — **C-CD-FB-08-02** |
| AC-CD-F5-01 HĐ no required salary | PRODUCT | **PASS** |
| AC-CD-F5-02 probation salary if thử việc | PRODUCT | **PASS** (N/A — subject NV no probation HĐ; UI hint correct) |
| AC-CD-F5-03 ≥2 allowance codes | PRODUCT | **PASS** — `PHU_CAP_AN` + `PHU_CAP_XANG` · POST **201** |
| AC-CD-F5-04 revise → ≥2 history versions | PRODUCT | **PASS** — v1+v2 + F5 |
| AC-CD-F5-07 F5 persist zero-seed | PRODUCT | **PASS** |
| AC-CD-F5-05 embed | OUT OF SLICE / covered | **PASS** via P-CC-04 + J-* (QA note) |
| AC-CD-F5-06 payroll consumer | OUT OF SLICE | **Deferred** → **C-CD-FB-08-03** (P3) |
| **P-CC-04** contracts list | PRODUCT L2 | **PASS** |
| **J-HRM-01** list→profile | PRODUCT L2.5 | **PASS** |
| **J-HRM-03** Eye→HĐ detail | PRODUCT L2.5 | **PASS** |
| Cold `/active` 500 before create | PRODUCT P2 | **CLOSED** → **C-CD-FB-08-01** (`c-cd-fb-08-01-qc-20260719.md`) |
| Seed in evidence | PROCESS U65 | **PASS** — none |
| Phase 1 DONE / PROD | OUT OF SLICE | **NOT claimed** |

---

## L0 — Dev stack health

| Check | Source | Result |
|-------|--------|--------|
| hrm-api `:28001` | QA pack | HTTP **200** — **PASS** (U65 session) |
| xbos-api `:28002` | QA pack | HTTP **200** — **PASS** (recovered mid-session) |
| web-portal `:5173` | QA pack | HTTP **200** — **PASS** |
| QC optional spot | `pnpm run qc:dev-stack` | hrm/xbos/portal **fetch failed** — **ENV** (not product NO-GO; QA product evidence stands) |

---

## AC matrix adjudication

| AC / ID | Expect | QA | QC |
|---------|--------|----|----|
| **AC-CD-F5-01** | HĐ form no required salary; Đãi ngộ separate | PASS | **PASS** |
| **AC-CD-F5-02** | Probation salary if thử việc | PASS (N/A) | **PASS** (conditional N/A accepted) |
| **AC-CD-F5-03** | ≥2 DM §33 allowance codes | PASS | **PASS** |
| **AC-CD-F5-04** | Revise → ≥2 versions in history | PASS | **PASS** |
| **AC-CD-F5-07** | F5 persist (no seed) | PASS | **PASS** |
| **AC-CD-F5-06** | Payroll reads active package | Deferred | **Deferred** — **C-CD-FB-08-03** |
| **P-CC-04** | Contracts list load | PASS | **PASS** |
| **J-HRM-01** | Contracts → employee profile | PASS | **PASS** |
| **J-HRM-03** | Contracts → HĐ detail dialog | PASS | **PASS** |

---

## L2.5 journey coverage (U19)

| Journey | In this gate? | Status |
|---------|---------------|--------|
| **J-HRM-01** | **Yes** (mandatory for F5) | **PASS** — P-CC-04 → click NV → profile HLD-0006; no 404 |
| **J-HRM-03** | **Yes** (mandatory for F5) | **PASS** — Eye «Chi tiết hợp đồng» → dialog HLD-0006-HD |
| **P-CC-04** | **Yes** (L2 embed) | **PASS** — list 1104; no salary col; no 409/54321 |
| Full J-HRM-01..07 / Phase1 matrix | Out of slice | Map already ✅; this gate re-affirms 01+03 only |

**NO-GO trigger not met:** in-scope mandatory **J-HRM-01** and **J-HRM-03** have browser click-path evidence PASS; not left ⏳ against a blind PASS claim.

---

## U65 zero-seed audit

| Check | Result |
|-------|--------|
| `pnpm seed:*` / inbox/workflow seed in QA steps | **None** |
| Mutate path | FE dialog → POST compensation-packages / revise |
| F5 after mutate | History v1+v2 still present |
| Verdict | **PASS** |

---

## Conditions

| ID | Severity | Owner | Expiry / trigger | Status |
|----|----------|-------|------------------|--------|
| **C-CD-FB-08-01** | P2 BE | `dev-be` | Cold `GET …/compensation-packages/active` before any package must return **200** (empty/null active) — not 500 `pg_type_typname_nsp_index`; harden `ensureCompensationSchema` idempotency | **CLOSED** 2026-07-19 — see `docs/qa/evidence/c-cd-fb-08-01-qc-20260719.md` |
| **C-CD-FB-08-02** | P3 process | optional `qa` | Add `command_table` with exit codes to QA pack so verify reaches 8/8 | **OPEN** (non-blocking) |
| **C-CD-FB-08-03** | P3 scope | BE/FE follow-up | AC-CD-F5-06 payroll consumer switch from legacy `contracts.salary` | **OPEN** — **out of this exit** |
| **C-CD-FB-08-04** | Standing | pm | Forever for this gate | **OPEN** — **NOT** Phase1 DONE · **NOT** PROD · **NOT** F-DELIVERY exit |

---

## Residual (concur QA)

| ID | Severity | Note | QC |
|----|----------|------|-----|
| `R-CD-FB-08-ACTIVE-COLD-500` | P2 | First open Đãi ngộ: `/active` 500 duplicate pg_type; after create `/active` 200 | = **C-CD-FB-08-01** — **CLOSED** (`c-cd-fb-08-01-qc-20260719.md`) |
| AC-CD-F5-06 payroll | P3 | Legacy salary consumer | = **C-CD-FB-08-03** |
| Pack `command_table` | P3 process | verify 1/8 | = **C-CD-FB-08-02** |

**not promoted:** Phase1 DONE · PROD-READY · AC-CD-F5-06 · full Phase1 J-* matrix from this pack alone

---

## Forbidden claims

- Phase 1 DONE / PROD-READY / UAT full-program exit
- F-DELIVERY / customer-demo program exit from this F5 slice alone
- Reopen **C-CD-FB-08-01** without new product defect (CLOSED 2026-07-19)
- Seed to fabricate compensation history
- Waive AC-CD-F5-01/03/04/07
- Promote unrelated UF/J-* rows from this pack alone

---

## completion_report

QC **GO WITH CONDITIONS** for `CD-FB-08-CONTRACT` (customer demo F5). Closed: **AC-CD-F5-01/03/04/07** + conditional **F5-02** + **P-CC-04** + **J-HRM-01** + **J-HRM-03**; U65 zero-seed. **Amendment 2026-07-19:** **C-CD-FB-08-01** / `R-CD-FB-08-ACTIVE-COLD-500` **CLOSED** (`c-cd-fb-08-01-qc-20260719.md`). Still open: pack format (**C-CD-FB-08-02**), payroll F5-06 deferred (**C-CD-FB-08-03**), standing no Phase1/PROD (**C-CD-FB-08-04**). Parent pack verify **1/8** process-only. No Phase1/PROD claim. Parent verdict remains **GWC** (not upgraded to full GO).

## next_owner

pm

## next_dispatch_prompt

```text
work_item_id: CD-FB-08-CONTRACT
from_role: pm
to_role: pm
lane: governance
entry: docs/qa/evidence/cd-fb-08-contract-qc-20260719.md GO WITH CONDITIONS
actions:
  1) Bus INTAKE + promote CD-FB-08 F5 slice (AC-CD-F5-01/03/04/07 + F5-02 N/A + P-CC-04 + J-HRM-01/03)
  2) Continue customer-demo backlog next CD-FB-* — do NOT claim Phase1/PROD/F-DELIVERY
  3) List residual R-CD-FB-08-ACTIVE-COLD-500 as OPEN condition C-CD-FB-08-01
optional_parallel (P2 BE — residual_auto_fix):
  work_item_id: D-CD-FB-08-ACTIVE-COLD-500
  to_role: dev-be
  entry: C-CD-FB-08-01 — cold GET compensation-packages/active returns 500 pg_type_typname_nsp_index before first create
  exit: idempotent ensureCompensationSchema; jest; READY_FOR_QA cold /active 200 empty
  evidence: docs/qa/evidence/d-cd-fb-08-active-cold-500-be-YYYYMMDD.md
cấm: seed · Phase1/PROD claim · waive F5 ACs · close C-01 without QA cold retest
```

**evidence_path:** `docs/qa/evidence/cd-fb-08-contract-qc-20260719.md`

**ack_status:** **PASS_TO_PM**
