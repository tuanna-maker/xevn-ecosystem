# QC Gate Decision — P1-PHASE1-QC-CRUD-JOURNEY-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QC-CRUD-JOURNEY-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-06-04` |
| **ack_status** | **PASS_TO_PM** |
| **qa_evidence** | `docs/qa/evidence/p1-phase1-qa-crud-matrix-20260604.md` |
| **be_evidence** | `docs/qa/evidence/p1-phase1-be-scope-crud-20260604.md` |
| **matrix SoT** | `docs/program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md` |

## Verdict (scoped)

| Decision | **GO WITH CONDITIONS** |
|----------|-------------------------|
| **Scope** | Group CEO `ceo@xe.vn` on **HTTPS pilot** `https://14-225-217-232.nip.io` — Phase 1 **P0 CRUD** cells **01–03 PASS**, **04 GWC (policy)**, **05–06 UNTESTED** (not P0-blockers for this slice) |
| **NOT claimed** | Phase 1 program DONE; PROD-READY; member CEO / HRBP CRUD columns; full `tmp-c-w2qc-01-crud-matrix-close.mjs` on nip.io; local L1 UAT |

---

## Evidence pack gate

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-crud-matrix-20260604.md
```

| Result | Detail |
|--------|--------|
| Exit | **1** (**7/8**) |
| Failure | `ack_status` — table uses `\| **ack_status** \|` not `ack_status:` literal |
| QC adjudication | **Process GWC** — substantive pack complete (commands, J-CC-02, P0 table, residual, date); same class as prior `2/8` member-legal format waivers; **does not** block product re-gate |

---

## Classification (ENV vs PRODUCT)

| Signal | Class | Gate impact |
|--------|-------|-------------|
| `pnpm run qc:dev-stack` exit **1** (local APIs down) | **ENV** | Does **not** NO-GO nip.io slice; dispatch **devops + qa** for local L0/L1 |
| `test:system:uat` **SKIP** (local down) | **ENV** | Same |
| Intermittent nip.io **502** on xbos login (QA note) | **ENV** | Monitor **devops**; QC session probes succeeded after retry |
| P0-CRUD-01 read detail + shareholders **200** | **PRODUCT — PASS** | Scope parity closed on pilot |
| P0-CRUD-02 contract POST/PATCH/DELETE chain | **PRODUCT — PASS** | Inline QA probes + L2 surfaces |
| P0-CRUD-03 insurance native list **200** | **PRODUCT — PASS** | |
| P0-CRUD-04 `company_id=holding` settings **200** | **PRODUCT — GWC** | **D16-FROZEN-ALLOW-200** — not FAIL unless PM tightens negative |
| P0-CRUD-05 RACI matrix save | **UNTESTED** | **C-CRUDQC-01** — reopen on user report / matrix 409 |
| P0-CRUD-06 workflow approve step | **UNTESTED** | **C-CRUDQC-02** — BR-INBOX-01; inbox list **200** on probe only |
| Member CEO CRUD columns | **UNTESTED** | **C-CRUDQC-03** — **qa** persona slice |
| `tmp-c-w2qc-01-crud-matrix-close.mjs` not run (localhost login) | **PROCESS defer** | **C-CRUDQC-04** — run when local stack up |

---

## P0 gap register — QC concurrence (nip.io)

| Gap ID | QA verdict | QC R1 | Notes |
|--------|------------|-------|-------|
| **P0-CRUD-01** | **PASS** | **PASS** | QC probe: GET legal-entity **200** `XBOS-ORG-200`, GET shareholders **200** `XBOS-SHR-200` — **C-RBACQC-02 CLOSED** on this deploy |
| **P0-CRUD-02** | **PASS** | **PASS** | QA inline C/R/U/D; concurred via L2 contract surfaces |
| **P0-CRUD-03** | **PASS** | **PASS** | Native list **200** `HRM-INS-200` |
| **P0-CRUD-04** | **GWC** | **GWC** | Holding settings **200** per frozen policy |
| **P0-CRUD-05** | **UNTESTED** | **UNTESTED** | No regression this wave |
| **P0-CRUD-06** | **UNTESTED** | **UNTESTED** | `J-XBOS-01-tasks` list only |

**Regression guard:** Member legal **Update** — `test:xbos:cc-member-save` **4/4** **200** `XBOS-ORG-201` (QC reproduced). **J-CC-02** browser save **PASS** @ portal-fe **`68ec457`** (cited `p1-cc-qa-member-legal-save-l25-20260604.md` / `qc-p1-cc-member-legal-save-l25-20260604.md`) — not re-clicked; API read preload unblocked.

---

## L2.5 journey coverage (U19)

| Journey | Layer | QC verdict | Evidence |
|---------|-------|------------|----------|
| **J-CC-02** | API list→detail→shareholders→mutate | **PASS** | Scope probe 5/5 + member-save 4/4 |
| **J-CC-02** | Browser save | **PASS (cited)** | Prior CC QC @ `68ec457` — out of CRUD work_item re-run |
| **J-CC-03** | API KPI rollup | **PASS** | HTTPS probe |
| **J-HRM-01..07** | API probe | **PASS** | HTTPS probe **7/7** |
| **J-XBOS-01** | Approve action | **UNTESTED** | P0-CRUD-06 |

**Rule:** L2 probe **PASS** + mandatory P0 CRUD cells **PASS/GWC** → slice promotable; **UNTESTED** RACI/workflow/member persona **do not** downgrade P0 closure already proven on nip.io.

---

## QC independent spot-check (2026-06-04)

| # | Command | Exit | Result |
|---|---------|------|--------|
| 1 | `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-phase1-be-scope-crud-probe.mjs` | **0** | **PROBE_OK** 5/5 — shareholders **200** |
| 2 | `PORTAL_DEV_URL=… pnpm run test:xbos:cc-member-save` | **0** | **4/4** member PUT **200** |
| 3 | `PORTAL_DEV_URL=… node scripts/tmp-p1-ex-qa-https-01-probe.mjs` | **0** | L2 **23/23**, L2.5 **7/7** |

---

## Open items (explicit — not blocking group CEO P0 nip.io)

| ID | Item | Owner | Trigger to reopen |
|----|------|-------|-------------------|
| **C-CRUDQC-01** | RACI matrix group CEO save | dev-be | User/matrix **409** on save |
| **C-CRUDQC-02** | Workflow approve + real pending seed (no mock-only) | dev-fe + devops | Phase 1 gate needs **P0-CRUD-06** |
| **C-CRUDQC-03** | Member CEO `du-lich.ceo@xe.vn` CRUD + negatives on nip.io | qa | Persona column in matrix |
| **C-CRUDQC-04** | Local `qc:dev-stack` + `test:system:uat` + `tmp-c-w2qc-01-crud-matrix-close.mjs` | devops + qa | Stack available |
| **C-CRUDQC-05** | Sync matrix doc P0→PASS cells 01–03 | ba-process / pm | After PM accepts QC |
| **C-RBACQC-02** | Shareholders **409** on old deploy | — | **CLOSED** — probe shareholders **200** this gate |
| Program | `phase1:gate` G4/G5, PROD columns | pm / qc | Unchanged |

---

## Relation to prior gates

| Prior | Relationship |
|-------|----------------|
| `p1-phase1-qc-full-rbac-r2-20260604.md` | API RBAC Slice A — complementary; shareholders **409** now **closed** on pilot for CRUD-01 |
| `qc-p1-cc-member-legal-save-l25-20260604.md` | Browser **J-CC-02** save — still authoritative for L2.5 UI click |
| `p1-phase1-be-scope-crud-20260604.md` | BE scope fix — **verified deployed** on nip.io |

---

## completion_report

- **Closed (group CEO P0 nip.io):** P0-CRUD-01/02/03; **J-CC-02** API read+mutate chain; HTTPS L2 **23/23** + L2.5 **7/7**; **C-RBACQC-02** shareholders parity on current pilot image.
- **GWC:** P0-CRUD-04 holding settings **200** (D16 policy).
- **Open / UNTESTED:** RACI save, workflow approve, member persona CRUD, local L0/L1, full W2 CRUD matrix script on localhost.
- **NOT:** Phase 1 DONE · PROD-READY · full program sign-off.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-PM-CRUD-MATRIX-02
from_role: pm
to_role: pm
lane: governance

QC PASS_TO_PM: P1-PHASE1-QC-CRUD-JOURNEY-01 → **GO WITH CONDITIONS** group CEO P0 CRUD on nip.io (evidence docs/qa/evidence/p1-phase1-qc-crud-journey-20260604.md).

1) Task ba-process — update PHASE1_CRUD_ACCEPTANCE_MATRIX.md: P0-CRUD-01..03 → PASS; P0-CRUD-04 note GWC D16; keep 05/06 UNTESTED.
2) Task devops — local qc:dev-stack + nip.io 502 flap monitor; attach xbos-be SHA when stable.
3) Task qa — C-CRUDQC-03 member CEO du-lich.ceo CRUD negatives on nip.io; C-CRUDQC-04 when stack up: test:system:uat + tmp-c-w2qc-01-crud-matrix-close.mjs @ PORTAL_DEV_URL=http://127.0.0.1:5175.
4) Task dev-fe + seed — C-CRUDQC-02 P0-CRUD-06 workflow approve BR-INBOX-01 if Phase 1 gate requires.
5) Optional qa — fix ack_status: PASS_TO_PM line in p1-phase1-qa-crud-matrix-20260604.md for verify:qc:evidence-pack 8/8.

Do NOT claim Phase 1 DONE or PROD. residual_auto_fix: true
```

## evidence_path

`docs/qa/evidence/p1-phase1-qc-crud-journey-20260604.md`

## ack_status

**PASS_TO_PM** — **GO WITH CONDITIONS** for **group CEO P0 CRUD** on **nip.io**. **NOT** Phase 1 DONE · **NOT** PROD.
