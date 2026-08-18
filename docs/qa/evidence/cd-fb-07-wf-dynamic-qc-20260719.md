# QC Gate Decision — CD-FB-07-WF-DYNAMIC-QC-01 (2026-07-19)

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-07-WF-DYNAMIC-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **environment** | `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` |
| **accounts** | `ceo@xe.vn` (spawn) · assignee target `uat.nv0001@xe.vn` / HLD-0006 |
| **executed_at** | `2026-07-19` |
| **program** | Customer demo HRM delta **F4** (leave dynamic resolver) |
| **spec_ref** | ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620 §5/§9 · `CUSTOMER_DEMO_HRM_DELTA_20260620.md` §4 AC-CD-F4-01..07 · BE `cd-fb-07-wf-dynamic-be-fix-01-20260719.md` · QA R2 `cd-fb-07-wf-dynamic-qa-r2-20260719.md` |
| **decision** | **GO WITH CONDITIONS** — F4 leave dynamic resolver **pilot slice** (AC-CD-F4-01/02 live + reject path) |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

QC audited QA R2 **PASS_TO_PM** after BE fix of P0 `company_id` TEXT/`::uuid` + membership gate. Live product path proves:

- Resolver matrix omit / `holding` / holding UUID → **200** `manager_user_id=uat.nv0001@xe.vn`
- `POST …/instances/start` → assignee **`uat.nv0001@xe.vn`**, `hat_key=direct_manager`, `resolvedVia=direct_manager`, **`escalated=false`** (not `group_ceo` / ceo/admin)
- Reject → **201** `XBOS-WF-205` · instance/task `rejected`

**Closed P0** `D-CD-FB-07-RESOLVER-COMPANY-TEXT` — **not reopened** (no new FAIL).

Bounded **GWC** because: FE leave picker blocks full FE create for HLD-0006 (**P2**); canvas persist **PARTIAL**; live position/parallel **N/A** under U65; evidence-pack format **2/8** (process only).

**NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** F-DELIVERY / full Bay.vn parity.

---

## Chain audited

| Lane | Evidence | Verdict |
|------|----------|---------|
| qa (R1) | `docs/qa/evidence/cd-fb-07-wf-dynamic-qa-20260719.md` | **FAIL** — escalate `group_ceo` + TEXT=`uuid` 500 |
| dev-be | `docs/qa/evidence/cd-fb-07-wf-dynamic-be-fix-01-20260719.md` | **READY_FOR_QA** — TEXT ANY + membership not required for direct_manager |
| qa (R2) | `docs/qa/evidence/cd-fb-07-wf-dynamic-qa-r2-20260719.md` | **PASS_TO_PM** — AC-CD-F4-01/02 live PASS |
| qc (this) | `docs/qa/evidence/cd-fb-07-wf-dynamic-qc-20260719.md` | **GO WITH CONDITIONS** |

---

## Evidence pack gate (Layer B)

| File | verify exit | Score | QC adjudication |
|------|-------------|-------|-----------------|
| `cd-fb-07-wf-dynamic-qa-r2-20260719.md` | **1** | **2/8** | **PROCESS** — missing `command_table` + explicit `J-*` row; **not** product NO-GO (substance: L0 block, jest exit, live matrix, spawn/reject, FE notes present) |

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/cd-fb-07-wf-dynamic-qa-r2-20260719.md
# FAIL: QC evidence pack incomplete (2/8 checks)
#   - command_table
#   - journey_l25
```

**Adjudication (reuse prior gates):** process pack gap ≠ product reopen when AC product evidence is reproducible in the same MD. Condition **C-CD-FB-07-04** for optional QA format polish.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| L0 HTTP 200 hrm/xbos/portal (QA + QC spot 2026-07-19) | ENV | **PASS** — healthy lines; Windows libuv assert after print = **ENV flake** (exit −1073740791) — **not** product NO-GO |
| `verify:qc:evidence-pack` 2/8 | PROCESS | **GWC** → **C-CD-FB-07-04** |
| Prior P0 TEXT/`::uuid` + escalate `group_ceo` | PRODUCT | **CLOSED** (R2 live) — **do not reopen** |
| AC-CD-F4-01 assignee = manager | PRODUCT | **PASS** |
| AC-CD-F4-02 direct_manager / escalated=false | PRODUCT | **PASS** |
| AC-CD-F4-03/04 live position/parallel | PRODUCT | **N/A** (U65 — no seed canvas) → **C-CD-FB-07-03** |
| AC-CD-F4-05 reject | PRODUCT | **PASS** (API product path) |
| AC-CD-F4-06 canvas persist | PRODUCT | **PARTIAL** → **C-CD-FB-07-02** |
| AC-CD-F4-07 ≥3 resolver types | PRODUCT (unit) | **PASS** (jest) |
| FE leave create HLD-0006 | PRODUCT UX | **BLOCKED** picker pagination → **C-CD-FB-07-01** |
| Soft-nav leave drift | PRODUCT | **Not reproduced** R2 on direct attendance URL — non-blocking |
| Seed in evidence | PROCESS U65 | **PASS** — none (product `instances/start` + reject only) |
| Phase 1 DONE / PROD | OUT OF SLICE | **NOT claimed** → **C-CD-FB-07-05** |

---

## L0 — Dev stack health (QC spot)

| Check | QC spot (2026-07-19) | Result |
|-------|----------------------|--------|
| hrm-api `:28001` | HTTP **200** | **PASS** |
| xbos-api `:28002` | HTTP **200** | **PASS** |
| web-portal `:5173` | HTTP **200** | **PASS** |
| process exit after healthy print | Windows UV assert | **ENV flake** — treat as PASS |

Concurs QA R2 L0.

---

## AC matrix adjudication (F4)

| AC | Expect (delta §4.5) | QA R2 | QC |
|----|---------------------|-------|-----|
| **AC-CD-F4-01** | Leave → inbox manager đúng người | **PASS** live spawn `uat.nv0001@xe.vn` | **PASS** (pilot product path; full FE create deferred by picker) |
| **AC-CD-F4-02** | direct_manager only | **PASS** live matrix + spawn `escalated=false` | **PASS** |
| **AC-CD-F4-03** | position_template | PASS unit / N/A live | **PASS unit** · live → **C-CD-FB-07-03** |
| **AC-CD-F4-04** | parallel all | PASS unit / N/A live | **PASS unit** · live → **C-CD-FB-07-03** |
| **AC-CD-F4-05** | Reject path | **PASS** 201 XBOS-WF-205 | **PASS** |
| **AC-CD-F4-06** | Canvas resolver persist | **PARTIAL** | **PARTIAL** → **C-CD-FB-07-02** |
| **AC-CD-F4-07** | ≥3 resolver types | PASS jest | **PASS** (unit demo) |

**Pilot slice exit (PM dispatch):** AC-CD-F4-01/02 live PASS — **met**. Full F4 demo checklist (canvas + FE create + live parallel) remains conditioned.

---

## L2.5 journey coverage (U19)

| Journey | In this gate? | Status |
|---------|---------------|--------|
| **J-HRM-06** (attendance → leave request surface) | Supporting (FE leave dialog) | **PASS observation** — tab Nghỉ phép → Tạo yêu cầu dialog; soft-nav drift **not** reproduced on direct URL |
| **J-XBOS-01** pattern (inbox task lifecycle) | Supporting (reject) | **PASS API product** — reject 201; full browser approve click **not** required to close F4-01/02 |
| Full FE create→inbox for HLD-0006 | Desired | **Deferred** — picker **C-CD-FB-07-01** |
| J-REC-WF-* / recruitment WF | Out of slice | Not claimed |
| Full J-HRM-01..07 / Phase1 matrix | Out of slice | Not claimed |

**NO-GO trigger not met:** in-scope F4-01/02 have live product evidence; no mandatory J-* row left ⏳ while claiming blind PASS on closed TEXT P0. Pack missing explicit `J-*` label = process (**C-CD-FB-07-04**), not product FAIL.

---

## Conditions

| ID | Severity | Owner | Maps to | Status |
|----|----------|-------|---------|--------|
| **C-CD-FB-07-01** | P2 UX | `dev-fe` | `D-CD-FB-07-FE-LEAVE-PICKER` — searchable typeahead / code filter beyond first ~100 employees | **OPEN** (non-blocking F4-01/02) |
| **C-CD-FB-07-02** | P2 | `qa` (follow-up) | **AC-CD-F4-06** canvas edit `resolver_type` + F5 persist | **OPEN** |
| **C-CD-FB-07-03** | P3 | `qa` when canvas exists (no seed) | Live **AC-CD-F4-03/04** position/parallel | **OPEN** |
| **C-CD-FB-07-04** | Process | optional `qa` | Evidence-pack format `command_table` + `J-*` row → 8/8 | **OPEN** (non-blocking) |
| **C-CD-FB-07-05** | Standing | `pm` | Forever for this gate — **NOT** Phase1 DONE · **NOT** PROD · **NOT** F-DELIVERY exit | **OPEN** |

---

## Residual (concur QA — not reopen P0)

| ID | Severity | QC |
|----|----------|-----|
| `D-CD-FB-07-RESOLVER-COMPANY-TEXT` | was P0 | **CLOSED** — do not reopen without new FAIL |
| `D-CD-FB-07-FE-LEAVE-PICKER` | P2 | = **C-CD-FB-07-01** |
| AC-CD-F4-06 PARTIAL | P2 | = **C-CD-FB-07-02** |
| AC-CD-F4-03/04 live | P3 | = **C-CD-FB-07-03** |
| `D-CD-FB-07-FE-LEAVE-SOFTNAV` | P2 (prior) | **Not reproduced** R2 — not blocking; do not re-dispatch without new FAIL |

---

## Forbidden claims

- Phase 1 DONE / PROD-READY / UAT full-program exit
- F-DELIVERY / full Bay.vn parity from this slice alone
- Reopen closed TEXT/uuid P0 without new FAIL evidence
- Seed canvas / inbox to force AC-CD-F4-03/04/06
- Claim full FE create→inbox for HLD-0006 closed

---

## completion_report

QC **GO WITH CONDITIONS** for `CD-FB-07-WF-DYNAMIC-QC-01` — F4 leave dynamic resolver **pilot slice**. Closed: AC-CD-F4-01/02 live (assignee `uat.nv0001@xe.vn` / `direct_manager` / `escalated=false`); AC-CD-F4-05 reject product path; jest 12/12 supporting; prior P0 TEXT/`::uuid` **CLOSED**; L0 **200×3**; U65 zero-seed. Open conditions: leave picker P2 (**C-CD-FB-07-01**), canvas PARTIAL (**C-CD-FB-07-02**), live position/parallel N/A (**C-CD-FB-07-03**), pack format 2/8 (**C-CD-FB-07-04**), standing no Phase1/PROD (**C-CD-FB-07-05**). No Phase1/PROD claim.

## next_owner

pm

## next_dispatch_prompt

```text
work_item_id: CD-FB-07-WF-DYNAMIC
from_role: pm
to_role: pm
lane: governance
entry: docs/qa/evidence/cd-fb-07-wf-dynamic-qc-20260719.md — GO WITH CONDITIONS (F4 pilot AC-CD-F4-01/02)
actions:
  1) Bus INTAKE + promote F4 pilot slice status (resolver live PASS; P0 TEXT CLOSED)
  2) Update P1-CUSTOMER-DEMO-HRM-FEEDBACK-PROGRAM.md F4 checkbox → pilot PASS with conditions cited
  3) Continue customer-demo backlog — do NOT claim Phase1/PROD/F-DELIVERY
optional_parallel (non-blocking):
  work_item_id: CD-FB-07-FE-LEAVE-PICKER
  to_role: dev-fe
  entry: C-CD-FB-07-01 / D-CD-FB-07-FE-LEAVE-PICKER — typeahead/filter for leave create employee combobox
  exit: READY_FOR_QA — HLD-#### selectable beyond first page; U65; no soft-nav reopen without FAIL
  evidence: docs/qa/evidence/cd-fb-07-fe-leave-picker-YYYYMMDD.md
optional_followup:
  work_item_id: CD-FB-07-WF-CANVAS-QA
  to_role: qa
  entry: C-CD-FB-07-02 AC-CD-F4-06 — canvas resolver_type edit + F5 persist (no seed)
cấm: seed · reopen D-CD-FB-07-RESOLVER-COMPANY-TEXT without new FAIL · Phase1/PROD claim
```

**ack_status:** **PASS_TO_PM**

**evidence_path:** `docs/qa/evidence/cd-fb-07-wf-dynamic-qc-20260719.md`
