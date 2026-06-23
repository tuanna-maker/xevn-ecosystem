# QC Gate Decision — P1-PHASE1-QC-MEMCC-CLOSE-01 (2026-06-05)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QC-MEMCC-CLOSE-01` |
| **parent_condition** | **C-MEMCC-01** (from `p1-phase1-qc-program-gate-03-20260605.md`, `p1-s5-qc-01-20260605.md`) |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-06-05` |
| **decision** | **GO** — **C-MEMCC-01 CLOSED** on nip.io member CEO CC HRM embed; **NOT** Phase 1 DONE / **NOT** PROD-READY |
| **environment** | `https://14-225-217-232.nip.io` |
| **qa_evidence** | `docs/qa/evidence/p1-w6-qa-memcc-20260605.md` |
| **dev_evidence** | `docs/qa/evidence/p1-phase1-fe-memcc-20260605.md` |
| **matrix SoT** | `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` |
| **journey SoT** | `docs/program/PROGRAM_JOURNEY_MAP.md` |
| **ack_status** | **PASS_TO_PM** |

## Verdict (scoped)

| Item | QC verdict |
|------|------------|
| **C-MEMCC-01** | **CLOSED** — member CEO `du-lich.ceo@xe.vn` CC `/command-center/hrm/*` scope + API + shell/iframe **PASS** on nip.io |
| **C-MEMCC-AUTO-01** | **GWC (non-blocking)** — MCP form-login automation quirk; CDP + API path sufficient for product closure |
| **NOT claimed** | Phase 1 DONE · PROD-READY · HRBP persona · group CEO journeys · program G4/G5 sponsor closure |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-w6-qa-memcc-20260605.md
```

| Result | Detail |
|--------|--------|
| Exit | **1** (**6/8**) |
| Failures | `command_table` — probes use `node scripts/…` + `PORTAL_DEV_URL`, not `pnpm run` table; `residual_section` — uses `## Conditions / residuals` not `## Residual` heading |
| QC adjudication | **Process GWC** — substantive pack complete (work_item_id, L0/L2/L2.5 tables, J-HRM **7/7**, browser CDP notes, defect closure, handoff YAML); same waiver class as `p1-phase1-qc-rbac-c04-close-20260604.md`; **does not** block **C-MEMCC-01** closure |

---

## Classification (ENV vs PRODUCT)

| Signal | Class | Gate impact |
|--------|-------|-------------|
| MCP Playwright form-login revert | **ENV / automation** | **C-MEMCC-AUTO-01** — does **not** NO-GO product |
| CDP session + `location.assign` CC HRM shell | **PRODUCT — PASS** | Sidebar render, no Sync ERROR / **54321** |
| L2 P-CC-03..08 API **200**, no **409** | **PRODUCT — PASS** | Member CEO `xe-du-lich` + `companyId=main` |
| L2.5 J-HRM-01..07 list→GET parity **7/7** | **PRODUCT — PASS** | U19 mandatory cross-nav API satisfied for member CC slice |
| Program G4/G5 / PROD / sponsor closure | **OUT OF SCOPE** | **NOT** Phase 1 DONE |

---

## L2.5 journey coverage (U19) — QC concurrence

| Journey | Member CEO CC slice | QA | QC |
|---------|---------------------|-----|-----|
| **J-HRM-01** | contracts → employee detail | **PASS** | **PASS** (probe concurred) |
| **J-HRM-02** | employees → profile | **PASS** | **PASS** |
| **J-HRM-03** | contract detail | **PASS** | **PASS** |
| **J-HRM-04** | insurance → employee | **PASS** | **PASS** |
| **J-HRM-05** | recruitment | **PASS** | **PASS** |
| **J-HRM-06** | attendance → employee | **PASS** | **PASS** |
| **J-HRM-07** | payroll → employee | **PASS** | **PASS** |
| CC shell `/command-center/hrm/employees` | CDP shell + HRM sidebar | **PASS** | **PASS** (concurred) |

**Rule:** Prior **C-MEMCC-01** required CC iframe session proof — satisfied by L2 shell/iframe HTML **10/10**, API scope **6/6**, J-HRM API **7/7**, and CDP browser session without **409**/**54321**/Sync ERROR. Direct `/hr` embed closure (**C-RBACQC-04**) is complementary; this gate closes the **CC command-center path** specifically.

---

## QC reproduction (2026-06-05)

| # | Check | Command | Result |
|---|-------|---------|--------|
| 1 | Audit QA `p1-w6-qa-memcc-20260605.md` | — | L0 **3/3**, L2 API **6/6**, L2.5 **7/7**, browser CDP consistent |
| 2 | Audit dev-fe `p1-phase1-fe-memcc-20260605.md` | — | Scope fix chain (`identityScope`, `GlobalFilter`, `HrmWorkspaceRoute`, `authSession`) aligned |
| 3 | MEMCC probe | `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-w6-qa-memcc-probe.mjs` | Exit **0** — `MEMCC API summary: PASS (fails=0)` |
| 4 | Parent gate | `p1-phase1-qc-program-gate-03-20260605.md` | **C-MEMCC-01** was **OPEN (GWC)** — closed below |

---

## Conditions (bounded — program carry)

| ID | Status | Note |
|----|--------|------|
| ~~**C-MEMCC-01**~~ | **CLOSED** | Member CEO CC HRM embed nip.io |
| **C-MEMCC-AUTO-01** | **OPEN (low)** | Optional Playwright dep for browser script — **qa** |
| **C-RBACQC-03-LOCAL** | **OPEN (GWC)** | Local `qc:dev-stack` without nip.io override — **devops** |
| **C-RBACQC-05** | **OPEN** | Journey map / matrix SoT sync — **pm** / **ba-process** |
| Program G4/G5 / PROD | **OPEN** | Corporate production readiness — **pm** / **qc** |

---

## completion_report

- Audited QA W6 MEMCC evidence + dev-fe handoff; pack verify **6/8** → **process GWC** only.
- QC spot-check `tmp-p1-w6-qa-memcc-probe.mjs` exit **0** on nip.io — concurred QA L0/L2/L2.5 tables.
- **C-MEMCC-01 CLOSED** — member CEO CC HRM embed scope/API/browser shell validated; prior **409** / wrong-tenant placeholder **not reproduced**.
- **C-MEMCC-AUTO-01** remains optional automation GWC — **does not** block closure.
- Addendum recorded on `p1-phase1-qc-program-gate-03-20260605.md` and `p1-phase1-qc-full-rbac-20260604.md`.
- **NOT** Phase 1 DONE / **NOT** PROD-READY.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-PM-MEMCC-CLOSE-01
from_role: pm
to_role: pm
entry_criteria: QC P1-PHASE1-QC-MEMCC-CLOSE-01 PASS_TO_PM — evidence docs/qa/evidence/qc-p1-w6-memcc-close-20260605.md; C-MEMCC-01 CLOSED on nip.io du-lich.ceo@xe.vn.
exit_criteria: Bus INTAKE + update blocker tables (p1-s5-qc-01 § Mandatory blockers, PROGRAM_STATUS) marking C-MEMCC-01 CLOSED; sync PILOT_BUSINESS_FLOW_MATRIX member CEO CC row if needed; refresh TEAM_WORKING_NOW; do NOT claim Phase 1 DONE.
evidence_path: docs/program/AGENT_MESSAGE_BUS.md
ack_status: PASS_TO_USER
pm_dispatch_hint: Remaining program blockers per latest QC chain — C-RBACQC-03-LOCAL, C-W12QC-01/02, portal.xe.vn, HRBP persona; G5/J-XBOS-02 and TM-S5-P0 per separate closed waves.
```

---

**ack_status:** **PASS_TO_PM**
