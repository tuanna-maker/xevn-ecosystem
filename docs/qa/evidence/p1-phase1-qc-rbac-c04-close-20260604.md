# QC Gate Decision — P1-PHASE1-QC-RBAC-C04-CLOSE-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QC-RBAC-C04-CLOSE-01` |
| **parent_gate** | `P1-PHASE1-QC-FULL-RBAC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-06-04` |
| **decision** | **PASS_TO_PM** — **C-RBACQC-04 CLOSED** (member CEO J-HRM browser L2.5); parent U28 slice **GO WITH CONDITIONS** unchanged |
| **environment** | `https://14-225-217-232.nip.io` |
| **qa_evidence** | `docs/qa/evidence/p1-phase1-qa-member-persona-nipio-20260604.md` |
| **matrix SoT** | `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` |
| **journey SoT** | `docs/program/PROGRAM_JOURNEY_MAP.md` |
| **ack_status** | **PASS_TO_PM** |

## Verdict (scoped)

| Item | QC verdict |
|------|------------|
| **C-RBACQC-04** | **CLOSED** — member CEO `du-lich.ceo@xe.vn` browser L2.5 **J-HRM-01..07 PASS** (7/7) on direct HRM embed `/hr/*?portal=1&tenantId=xe-du-lich` |
| **C-MEMCC-01** | **GO WITH CONDITIONS** — CC `/command-center/hrm/*` iframe L2.5 not proven in MCP isolated tab; **does not** block **C-RBACQC-04** closure |
| **NOT claimed** | Phase 1 DONE · PROD-READY · HRBP persona · full P-CC browser matrix · group CEO journeys |

---

## Evidence pack gate

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-member-persona-nipio-20260604.md
```

| Result | Detail |
|--------|--------|
| Exit | **1** (**6/8**) |
| Failures | `command_table` — probes documented as `node scripts/…` not `pnpm run` table; `residual_section` — uses `## Defects / residuals` not `## Residual` heading |
| QC adjudication | **Process GWC** — substantive pack complete (work_item_id, J-HRM table 7/7, API exits, classification, completion_report, PASS_TO_PM); same waiver class as `p1-phase1-qc-crud-journey-03-20260604.md`; **does not** block **C-RBACQC-04** closure |

---

## Classification (ENV vs PRODUCT)

| Signal | Class | Gate impact |
|--------|-------|-------------|
| MCP portal form login (`browser_fill` + submit) | **ENV / automation** | Does **not** NO-GO product — API login + `localStorage` mirror **PASS** per QA |
| Member J-HRM-01..07 browser clicks + detail API **200** | **PRODUCT — PASS** | **C-RBACQC-04 CLOSED** |
| CC shell redirect `/login` after storage inject | **PRODUCT residual (low)** | **C-MEMCC-01** — optional **dev-fe** / manual **qa** |
| `xevn-uat-2026` vs `Xevn@2026` password | **PROCESS (doc)** | **C-MEMPWD-01** — QA + QC spot-check use portal SoT |
| HRBP persona | **OUT OF SLICE** | Unchanged open coverage |

---

## L2.5 journey coverage (U19) — QC concurrence

| Journey | Member CEO browser (direct `/hr`) | QC |
|---------|-----------------------------------|-----|
| **J-HRM-01** | Contract row → employee link → detail **200** | **PASS** |
| **J-HRM-02** | List row → employee profile **200** | **PASS** |
| **J-HRM-03** | Contract drawer/detail **200** | **PASS** |
| **J-HRM-04** | Insurance row + employee **200** | **PASS** |
| **J-HRM-05** | Recruitment mount (empty list OK) | **PASS** |
| **J-HRM-06** | Attendance overview + records API **200** | **PASS** (list parity; no table row in overview UI — concurred) |
| **J-HRM-07** | Payroll mount **200** | **PASS** (API parity; row click N/A — concurred) |
| CC iframe `/command-center/hrm/*` | Not mounted — **401** / `/login` | **C-MEMCC-01 GWC** — separate from **C-RBACQC-04** |

**Rule:** Mandatory member **J-HRM** L2.5 for this work_item = cross-navigation on pilot HRM embed — **7/7 PASS**. Prior CRUD-journey-03 **waived** browser is **superseded** for member CEO CEO persona on nip.io.

---

## QC reproduction (2026-06-04)

| # | Check | Result |
|---|-------|--------|
| 1 | Audit QA `p1-phase1-qa-member-persona-nipio-20260604.md` | J-HRM **7/7** table + session notes consistent |
| 2 | `tmp-p1-phase1-member-ceo-crud-probe.mjs` | Exit **0** — `MEMBER_CEO_PROBE_OK` (`Xevn@2026`) |
| 3 | `tmp-p1-phase1-member-hrm-cu-probe.mjs` | Exit **0** — `MEM_CRUD_JOURNEY_03_OK` |
| 4 | Prior chain | `p1-phase1-qc-crud-journey-03-20260604.md` MEM-CRUD API **GWC**; `p1-phase1-qc-full-rbac-20260604.md` group slice **C-RBACQC-01/02 CLOSED** |

---

## Conditions (bounded — parent gate)

| ID | Status | Note |
|----|--------|------|
| ~~**C-RBACQC-04**~~ | **CLOSED** | Member CEO J-HRM browser L2.5 nip.io |
| **C-MEMCC-01** | **OPEN (GWC)** | CC iframe member session — optional if sponsor requires CC clicks |
| **C-RBACQC-03** | **OPEN** | Strict `phase1:gate` + capability when stack up |
| **C-RBACQC-05** | **OPEN** | Journey map / matrix sync — **pm** |
| **C-MEMPWD-01** | **OPEN (low)** | Dispatch password doc vs portal SoT |

---

## completion_report

- Audited QA member persona nip.io evidence; pack verify **6/8** → **process GWC** only.
- Concurred **C-RBACQC-04 CLOSED** — member CEO **J-HRM 7/7** browser PASS on direct embed; API probes QC spot-check exit **0**.
- **C-MEMCC-01** remains **GWC** (CC iframe) — not required to close **C-RBACQC-04**.
- Updated `docs/qa/evidence/p1-phase1-qc-full-rbac-20260604.md` addendum.
- **NOT** Phase 1 DONE / **NOT** PROD.

## next_owner

**pm** — refresh bus / `USER_SERVICE_STATUS` for **C-RBACQC-04 CLOSED**; optional **dev-fe** **C-MEMCC-01** if sponsor needs CC iframe; dispatch **qa**+**devops** **C-RBACQC-03** or **ba-process** **C-RBACQC-05**.

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-PM-RBAC-C04-STATUS-01
from_role: pm
to_role: pm
entry_criteria: QC PASS_TO_PM P1-PHASE1-QC-RBAC-C04-CLOSE-01 — C-RBACQC-04 CLOSED; evidence docs/qa/evidence/p1-phase1-qc-rbac-c04-close-20260604.md; C-MEMCC-01 GWC only.
exit_criteria: Bus + TEAM_LIVE_STATUS note C-RBACQC-04 closed; UAT slice text for du-lich.ceo HRM L2.5; optional dispatch dev-fe C-MEMCC-01 only if sponsor requires CC iframe.
evidence_path: docs/program/AGENT_MESSAGE_BUS.md
ack_status: DISPATCHED
```

## ack_status

**PASS_TO_PM** — **C-RBACQC-04 CLOSED**; parent **GO WITH CONDITIONS** U28 RBAC on nip.io — **NOT** Phase 1 DONE / **NOT** PROD.
