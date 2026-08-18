# QC Gate Decision — CD-FB-07-WF-CANVAS-QC (2026-07-19)

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-07-WF-CANVAS-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **residual_auto_fix** | `true` |
| **closes** | **C-CD-FB-07-02** / **AC-CD-F4-06** |
| **parent_gate** | `CD-FB-07-WF-DYNAMIC-QC-01` — `docs/qa/evidence/cd-fb-07-wf-dynamic-qc-20260719.md` (**GO WITH CONDITIONS**) |
| **fe_evidence** | `docs/qa/evidence/cd-fb-07-wf-canvas-01-20260719.md` (**READY_FOR_QA**) |
| **qa_evidence** | `docs/qa/evidence/cd-fb-07-wf-canvas-qa-20260719.md` (**PASS_TO_PM**) |
| **executed_at** | `2026-07-19` |
| **decision** | **GO** — residual canvas AC-CD-F4-06 close only; **parent F4 GWC retained** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **f_delivery_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD · no TEXT/`::uuid` P0 reopen · no leave-picker C-01 reopen |

---

## Executive summary

QC audited FE canvas READY + QA browser U65 **PASS** for residual **C-CD-FB-07-02** / **AC-CD-F4-06**. On existing product definition `DO-INBOX-1781934428730` (no seed; `hrm_leave_approval` absent under U65): edit step1 **Loại resolver động** → `position_template` + `position_code=TRUONG_PHONG` → **Lưu quy trình** PUT **200** `XBOS-WF-201` with `resolver_type` in payload → canvas badge + F5/deep-link rehydrate select + list GET persist.

**C-CD-FB-07-02 / AC-CD-F4-06 = CLOSED.**

Parent **CD-FB-07-WF-DYNAMIC** remains **GO WITH CONDITIONS** for **C-03** (live leave position/parallel), **C-04** (pack process standing), **C-05** (NOT Phase1/PROD). Closed picker **C-01**, create-UUID **C-06**, and closed TEXT/`::uuid` P0 **`D-CD-FB-07-RESOLVER-COMPANY-TEXT`** are **not reopened**.

**NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** F-DELIVERY.

---

## Chain audited

| Lane | Evidence | Verdict |
|------|----------|---------|
| parent qc (F4) | `cd-fb-07-wf-dynamic-qc-20260719.md` | GWC — C-02 was OPEN (canvas PARTIAL) |
| picker / create-UUID qc | `cd-fb-07-fe-leave-picker-qc-20260719.md` · `cd-fb-07-leave-create-company-uuid-qc-20260719.md` | C-01 / C-06 **CLOSED** — **not reopened** |
| dev-fe | `cd-fb-07-wf-canvas-01-20260719.md` | READY_FOR_QA — canvas/graph resolver fields |
| qa | `cd-fb-07-wf-canvas-qa-20260719.md` | **PASS_TO_PM** — AC-CD-F4-06 Lưu + F5 |
| qc (this) | `cd-fb-07-wf-canvas-qc-20260719.md` | **GO** — **C-02 CLOSED**; parent F4 GWC retained |

---

## Evidence pack gate (Layer B)

| File | verify exit | Score | QC adjudication |
|------|-------------|-------|-----------------|
| `cd-fb-07-wf-canvas-qa-20260719.md` | **0** | **8/8** | **PASS** — L0, UF block, command_table, J-XBOS-01, must-not-reopen, residual explicit |

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/cd-fb-07-wf-canvas-qa-20260719.md
# PASS: QC evidence pack ready (8/8)
```

**QC rule applied:** Pack integrity PASS — no PROCESS adjudication needed for this residual. Standing parent **C-CD-FB-07-04** (earlier F4 R2 pack 2/8) remains open as process polish on the *parent* evidence family; does not block C-02 close.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| QC spot `qc:dev-stack` 2026-07-19 | ENV | hrm `/api/hrm` · xbos `/api/xbos` · portal `:5173` **200** — **PASS**; Windows UV assert after print = **ENV flake** — **not** product NO-GO |
| PUT definitions/:id **200** `XBOS-WF-201` with `resolver_type=position_template` | PRODUCT | **PASS** — residual closed |
| FE after 2xx toast + canvas badge | PRODUCT | **PASS** |
| F5 / deep-link reload rehydrate select + GET | PRODUCT | **PASS** |
| Fixture on live catalog def (no seed leave def) | PROCESS U65 | **PASS** — AC-CD-F4-06 is canvas persist, not leave-code spawn |
| TEXT/`::uuid` resolver P0 | PRODUCT (closed) | **CLOSED** — **do not reopen** |
| Leave-picker C-01 | PRODUCT (closed) | **CLOSED** — **do not reopen** |
| Live leave position/parallel (`hrm_leave_approval`) | PRODUCT | Still **C-03** — out of this wave |
| Phase1 / PROD / F-DELIVERY | OUT OF SLICE | **NOT claimed** → **C-05** |

---

## L0 — Dev stack health (QC spot)

| Check | QC spot (2026-07-19) | Result |
|-------|----------------------|--------|
| hrm-api `:28001` `/api/hrm` | HTTP **200** | **PASS** |
| xbos-api `:28002` `/api/xbos` | HTTP **200** | **PASS** |
| web-portal `:5173` | HTTP **200** | **PASS** |
| process exit after healthy print | Windows UV assert | **ENV flake** — treat as PASS |

Concurs QA pack L0.

---

## Exit criteria adjudication

| # | Exit | QC |
|---|------|-----|
| 1 | Close **C-CD-FB-07-02** or NO-GO with reason | **CLOSED** — GO residual |
| 2 | Do not reopen TEXT/uuid workflow P0 | **PASS** — not touched |
| 3 | Do not reopen leave-picker **C-CD-FB-07-01** | **PASS** — out of scope; stays CLOSED |
| 4 | Evidence this file | **PASS** |
| 5 | NOT Phase1/PROD; PASS_TO_PM | **PASS** |

---

## Condition adjudication (vs parent F4 GWC)

| ID | Prior status | This wave | QC status now |
|----|--------------|-----------|---------------|
| **C-CD-FB-07-01** | CLOSED (picker QC) | Not touched | **CLOSED** (unchanged) |
| **C-CD-FB-07-02** | OPEN — canvas AC-CD-F4-06 | QA Lưu + F5 PASS pack 8/8 | **CLOSED** |
| **C-CD-FB-07-03** | OPEN — live position/parallel on leave | Out of scope (no leave def under U65) | **OPEN** (unchanged) |
| **C-CD-FB-07-04** | OPEN — pack format process (parent R2) | This QA 8/8; parent family still noted | **OPEN** (standing process) |
| **C-CD-FB-07-05** | OPEN — NOT Phase1/PROD | Standing | **OPEN** (unchanged) |
| **C-CD-FB-07-06** | CLOSED (create UUID QC) | Not touched | **CLOSED** (unchanged) |

### C-CD-FB-07-02 close criteria (met)

| # | Expect | QA evidence | QC |
|---|--------|-------------|-----|
| 1 | Edit `resolver_type` on canvas/graph UI | Legacy → `position_template` + `TRUONG_PHONG` | **PASS** |
| 2 | Lưu → PUT definitions 2xx | **200** `XBOS-WF-201` | **PASS** |
| 3 | Payload includes resolver fields | `resolver_type` + `resolver_config.position_code` | **PASS** |
| 4 | FE after 2xx (toast + badge) | «Đã lưu…» + badge `position_template` | **PASS** |
| 5 | F5 / reload persist | select + canvas + list GET | **PASS** |
| 6 | U65 zero-seed; no TEXT/uuid or picker reopen | Fixture existing DO-INBOX; must-not-reopen table | **PASS** |

---

## L2.5 journey coverage (U19)

| Journey | In this gate? | Status |
|---------|---------------|--------|
| **J-XBOS-01** pattern (settings → WF definition edit → save → reload) | Yes | **PASS** — click path + PUT 200 + F5 |
| Leave inbox / TEXT uuid / leave-picker | Explicitly out | **Not reopened** |
| Live leave AC-CD-F4-03/04 spawn | Parent C-03 | **Deferred** — `hrm_leave_approval` absent under U65 |
| Full Phase1 J-* matrix | Out of slice | **Not claimed** |

**NO-GO trigger not met:** in-scope C-02 has browser product evidence + pack 8/8; no mandatory J-* left ⏳ while claiming PASS.

---

## Residuals / conditions detail

| ID | Severity | Owner hint | QC |
|----|----------|------------|-----|
| **C-CD-FB-07-02** / AC-CD-F4-06 | was P2 | — | **CLOSED** |
| **C-CD-FB-07-01** | was P2 UX | — | **CLOSED** — **do not reopen** |
| **C-CD-FB-07-06** | was P2 | — | **CLOSED** — **do not reopen** |
| **C-CD-FB-07-03** | P3 | qa when leave WF def exists (no seed) | **OPEN** |
| **C-CD-FB-07-04** | Process | optional qa polish parent R2 pack | **OPEN** (non-blocking) |
| **C-CD-FB-07-05** | Standing | pm | **OPEN** — NOT Phase1/PROD |
| `D-CD-FB-07-RESOLVER-COMPANY-TEXT` | was P0 | — | **CLOSED** — **do not reopen** |
| DO-INBOX step1 left as `position_template`/`TRUONG_PHONG` | Note | optional revert | **Noted** — evidence fixture; not blocking |

---

## Forbidden claims

- Phase 1 DONE / PROD-READY / UAT full-program exit
- F-DELIVERY / full Bay.vn parity from this residual close
- Reopen closed TEXT/`::uuid` P0 without new FAIL evidence
- Reopen **C-CD-FB-07-01** leave-picker without new FAIL
- Seed leave WF / inbox to force C-03
- Upgrade parent F4 GWC to unconditional GO

---

## completion_report

### Closed
- **C-CD-FB-07-02** / **AC-CD-F4-06** canvas `resolver_type` edit → Lưu PUT 200 → F5 UI+API persist on live catalog def; pack **8/8**; L0 **200×3**; U65 zero-seed.
- Prior P0 TEXT/`::uuid`, picker **C-01**, create-UUID **C-06** — **not reopened**.

### Open (parent F4 GWC retained)
- **C-CD-FB-07-03** live leave position/parallel
- **C-CD-FB-07-04** process pack polish (parent R2 family)
- **C-CD-FB-07-05** standing NOT Phase1/PROD

### Decision
**GO** residual close only — parent F4 remains **GO WITH CONDITIONS**.

---

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: CD-FB-07-WF-CANVAS-QC
from_role: qc
to_role: pm
lane: governance
entry: docs/qa/evidence/cd-fb-07-wf-canvas-qc-20260719.md — GO residual close C-CD-FB-07-02 (AC-CD-F4-06)
actions:
  1) Bus INTAKE — C-CD-FB-07-02 CLOSED; parent F4 GWC retained (C-03/C-04/C-05)
  2) Update customer-demo F4 program note — canvas persist PASS; do NOT claim Phase1/PROD/F-DELIVERY
  3) Optional later: C-CD-FB-07-03 when leave WF def exists under U65 (no seed)
cấm: reopen TEXT/uuid P0 · reopen leave-picker C-01 · seed · Phase1/PROD claim · upgrade parent F4 to unconditional GO
```

**ack_status:** **PASS_TO_PM**

**evidence_path:** `docs/qa/evidence/cd-fb-07-wf-canvas-qc-20260719.md`

**pm_dispatch_hint:** Promote C-02 CLOSED on bus; keep F4 GWC; continue demo backlog without Phase1/PROD.
