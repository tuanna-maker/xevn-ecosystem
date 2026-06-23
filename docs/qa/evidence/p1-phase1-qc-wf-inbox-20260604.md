# QC Gate Decision — P1-PHASE1-QC-WF-INBOX-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QC-WF-INBOX-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-06-04` |
| **ack_status** | **PASS_TO_PM** |
| **qa_evidence** | `docs/qa/evidence/p1-phase1-qa-wf-inbox-20260604.md` |
| **fe_evidence** | `docs/qa/evidence/p1-phase1-fe-wf-inbox-20260604.md` |
| **matrix SoT** | `docs/program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md` |

## Verdict (scoped)

| Decision | **GO WITH CONDITIONS** |
|----------|-------------------------|
| **Scope** | **P0-CRUD-06** workflow inbox **Update** (approve) · **AC-CRUD-CC-WF-G-U-01** · **BR-INBOX-01** · **J-XBOS-01** API L2.5 (list → detail → **POST complete** → refresh) on local stack (`ceo@xe.vn`, `x-company-id: main`) |
| **NOT claimed** | Phase 1 program DONE; PROD-READY; full CRUD matrix closure; member CEO workflow; strict browser drawer click on nip.io this wave |

---

## Evidence pack gate

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-wf-inbox-20260604.md
```

| Result | Detail |
|--------|--------|
| Exit | **1** (**7/8**) |
| Failure | `ack_status` — script expects literal `ack_status:` line; QA uses table `**PASS_TO_PM**` in Handoff |
| QC adjudication | **Process GWC** — substantive pack complete (L0, seed, L2.5 table, P0 promotion, commands, residual, handoff); **does not** block product gate |

---

## Classification (ENV vs PRODUCT)

| Signal | Class | Gate impact |
|--------|-------|-------------|
| `web-portal` **5173** fetch failed | **ENV** | **Does not** block — QA + QC used API path; HRM+XBOS L0 **PASS** |
| No pending tasks after seed | **PRODUCT** | **FAIL** if probe abort — **not** observed |
| List **200** `XBOS-WF-203` only (prior wave) | **PRODUCT — closed** | Superseded by complete **201** `XBOS-WF-200` |
| **POST complete** + pending count drops | **PRODUCT — PASS** | **P0-CRUD-06** promotable |
| Browser drawer **Hoàn thành** not re-run | **GWC (optional)** | Per PM slice — FE vitest **143/143** + wired contract; not NO-GO |

---

## QA adjudication — concurrence

| Check | QA | QC |
|-------|----|----|
| `qc:dev-stack` | exit **0** | **Concurred** — QC spot-check exit **0** (HRM+XBOS **200**; portal optional down) |
| `pnpm seed:workflow:inbox` | exit **0** | **Concurred** (not re-run) |
| `tmp-p1-phase1-qa-wf-inbox-probe.mjs` | **PROBE_OK** | **Reproduced** exit **0** — LIST/DETAIL/COMPLETE/REFRESH **PASS**; **201** `XBOS-WF-200`; pending **8→7** |
| Reject spot `XBOS-WF-205` | **201** | **Concurred** on QA table |
| **409 / 54321** | none | **Concurred** |
| Strict browser L2.5 | not run | **GWC optional** — user/PM bounded slice |

**L2.5 U19:** Mandatory approve path exercised on API (same contract as `applyWorkflowInboxTaskDecision`). List-only **200** from prior probes is **not** sufficient — this wave closes that gap.

---

## Matrix & condition register

| Item | Before | After (QC) |
|------|--------|------------|
| **P0-CRUD-06** | **UNTESTED** (QC-CRUD-GATE-01) | **PASS** — concurs BA sync §3 + §8 in `PHASE1_CRUD_ACCEPTANCE_MATRIX.md` |
| **C-CRUDQC-02** | Open (mock-only / no approve) | **CLOSED** at API + seed layer |
| **J-XBOS-01** (`PROGRAM_JOURNEY_MAP`) | 🟡 partial | **Recommend PM** → **✅ L2.5 PASS (GWC browser)** after this QC — API approve **PASS** |

### P0 register (group CEO) — post this gate

| Gap | Status |
|-----|--------|
| P0-CRUD-01..03 | **PASS** |
| P0-CRUD-04 | **GWC** (policy) |
| P0-CRUD-05 | **PASS** |
| P0-CRUD-06 | **PASS** |

**All P0 CRUD gaps addressed** (04 policy GWC only). Remaining program work is **not** P0-06 blocked.

---

## J-* coverage (in-scope)

| J-ID | Step | QC |
|------|------|-----|
| **J-XBOS-01** | Pending list → instance detail → approve → refresh | **PASS** (API L2.5) |
| **J-XBOS-01** | Browser rail drawer click | **GWC optional** — deferred |

---

## Residual (bounded — do not reopen P0-06 without new FAIL)

| ID | Owner | Note |
|----|-------|------|
| **C-WFQC-01** | qa (optional) | nip.io browser network: drawer **Mở chi tiết** → **Hoàn thành** |
| **C-WFQC-02** | pm | `PROGRAM_JOURNEY_MAP.md` J-XBOS-01 status sync |
| **C-WFQC-03** | qa | `verify:capabilities --group A1` not run |
| Program | pm | **NOT Phase 1 DONE** — G4/G5, member personas, group CEO HRM C/U, PROD |

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | **P0-CRUD-06** **PASS**; **C-CRUDQC-02 CLOSED**; **J-XBOS-01** API L2.5 **PASS**; matrix promotion **concurred** (already synced BA-04); browser approve **GWC optional** only. |
| **next_owner** | `pm` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/p1-phase1-qc-wf-inbox-20260604.md` |

### next_dispatch_prompt

```
work_item_id: P1-PHASE1-PM-JOURNEY-XBOS-01
from_role: pm
to_role: pm
lane: governance

QC P1-PHASE1-QC-WF-INBOX-01: GO WITH CONDITIONS — P0-CRUD-06 PASS, C-CRUDQC-02 CLOSED, J-XBOS-01 API L2.5 PASS (docs/qa/evidence/p1-phase1-qc-wf-inbox-20260604.md). Promote PROGRAM_JOURNEY_MAP J-XBOS-01 to L2.5 PASS (GWC browser optional). NOT Phase 1 DONE. Optional: P1-PHASE1-QC-CRUD-GATE-01 consolidated re-gate if PM wants single CRUD QC artifact. Residual: optional QA browser wf-inbox on nip.io; C-CRUDQC-06/07 unchanged.
```

### pm_dispatch_hint

- **pm** — journey map **J-XBOS-01** + sponsor status refresh
- **qa** (optional) — `C-WFQC-01` browser L2.5 wf-inbox on nip.io
- **qc** — hold unless new regression on wf probe
