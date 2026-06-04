# Phase 1 — Agile Scrum Board

**Program:** XeVN OS Phase 1 (245 UC)  
**Ceremony owner:** PM  
**Plan:** [`PHASE1_COMPLETION_PLAN.md`](./PHASE1_COMPLETION_PLAN.md)  
**Auto-run:** `PM_ORCHESTRATION_MODE=RUN` · **sprint tuần tự** S0→S5 · master todo [`PHASE1_MASTER_TODO.md`](./PHASE1_MASTER_TODO.md) · runner [`PHASE1_SPRINT_RUNNER.json`](./PHASE1_SPRINT_RUNNER.json)  
**Account pilot:** `ceo@xe.vn` / `Xevn@2026` · portal `:5175`

---

## Team roster (10 roles — mọi sprint có owner)

| Role | Member lane | Sprint 0 | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 | Sprint 5 |
|------|-------------|:--------:|:--------:|:--------:|:--------:|:--------:|:--------:|
| **PM** | Delivery / dispatch | ● | ○ | ○ | ○ | ○ | ○ |
| **SA** | Architecture / OpenAPI | ● | ● | ○ | ● | ○ | ● |
| **BA-Process** | UC acceptance / BR | ● | ● | ● | ● | ● | ○ |
| **BA-Data** | DM / data contracts | ● | ● | ○ | ● | ● | ○ |
| **Dev-BE** | hrm-api + xbos-api | ● | ● | ○ | ● | ● | ○ |
| **Dev-FE** | web-portal + hrm embed | ● | ● | ● | ● | ○ | ○ |
| **Dev-Mobile** | hrm-mobile | ● | ○ | ○ | ● | ○ | ○ |
| **QA** | L0–L4 test | ● | ● | ● | ● | ● | ● |
| **QC** | Go/No-Go | ● | ○ | ● | ● | ● | ● |
| **Technical Manager** | Review / security | ● | ● | ● | ● | ○ | ● |
| **DevOps** | Stack / seed / env | ● | ○ | ○ | ○ | ● | ○ |

● = có work item trong sprint · ○ = hỗ trợ / gate only

---

## Sprint 0 — «Pilot zero-defect» (ACTIVE)

**Goal:** P-CC-01..08 PASS · vitest portal PASS · stack L0 green  
**Dates:** 2026-05-23 → 2026-05-27 (5 ngày làm việc)

### Backlog → In Progress

| ID | Role | Story | DoD / evidence | Status |
|----|------|-------|----------------|--------|
| P1-S0-PM-01 | PM | Kickoff + daily + bus | `TEAM_LIVE_STATUS.md` · bus DISPATCHED | **IN_PROGRESS** |
| P1-S0-DO-01 | DevOps | L0 `qc:dev-stack` + env pilot | `docs/ops/evidence/scrum-s0-stack-20260523.md` | **L0 PASS** |
| P1-S0-FE-01 | Dev-FE | HRM embed P-CC-05..08 API mode | vitest hrm · no 54321 | DISPATCHED |
| P1-S0-FE-02 | Dev-FE | Fix web-portal vitest config | `pnpm -C apps/web/web-portal test` PASS | DISPATCHED |
| P1-S0-BA-P-01 | BA-Process | Acceptance P-CC-05..08 branches | `PILOT_BUSINESS_FLOW_BA_TRACE.md` §05-08 | DISPATCHED |
| P1-S0-BA-D-01 | BA-Data | Scope matrix `main` vs JWT tenant | `docs/qa/PILOT_SCOPE_DATA_MATRIX.md` | DONE |
| P1-S0-BE-01 | Dev-BE | `GET /employees/:id` (harden D7) | controller spec + OpenAPI | DISPATCHED |
| P1-S0-SA-01 | SA | Embed data-mode ADR | `docs/decisions/` or TECHSPEC note | DISPATCHED |
| P1-S0-MOB-01 | Dev-Mobile | Regression `mobile-hrm-smoke.mjs` | `scrum-s0-mobile-smoke-20260523.md` | **READY_FOR_QA** |
| P1-S0-QA-01 | QA | Retest P-CC-01..08 + L1/L2 | `pilot-business-flow-*.md` | DISPATCHED |
| P1-S0-TM-01 | TM | Review checklist S0 PRs | `tm-scrum-s0-20260523.md` | DONE |
| P1-S0-QC-01 | QC | Gate 8 routes (sau QA) | `qc-hrm-embed-full-*.md` | **WAIT_QA** |

### Sprint 0 exit (Definition of Sprint)

- [ ] All P-CC-01..08 = PASS in matrix  
- [ ] `web-portal` vitest PASS  
- [ ] QC = GO (or GO WITH CONDITIONS closed)  
- [ ] PM ghi Sprint 1 DISPATCHED trên bus  

---

## Overlay P1-CLOSE-W1 — «G2 +40 UC» (**ACTIVE** — 2026-05-25)

**Plan:** [`PHASE1_CLOSEOUT_SPRINT_PLAN.md`](./PHASE1_CLOSEOUT_SPRINT_PLAN.md)  
**Baseline:** 122/245 closed · G2 **85/104** · U18 QC **NO-GO** program

| ID | Role | Status |
|----|------|--------|
| P1-CLOSE-BE-A2 | Dev-BE | **DISPATCHED** |
| P1-CLOSE-FE-A2 | Dev-FE | **DISPATCHED** |
| P1-CLOSE-QA-W1 | QA | **DISPATCHED** |
| P1-CLOSE-BA-P-01 | BA-Process | **DISPATCHED** |

---

## Sprint 1 — «XBOS planned → be» (DONE — superseded by P1-CLOSE for G1/G2)

| ID | Role | Focus | Status |
|----|------|-------|--------|
| P1-S1-PM-01 | PM | Pulse + parallel dispatch | **IN_PROGRESS** |
| P1-S1-SA-01 | SA | OpenAPI M01 | **DONE** |
| S1-FE-DEBT | Dev-FE | Embed Supabase → API mode | **READY_FOR_QA** |
| P1-S1-BA-P-01 | BA-Process | UC-XBOS-03..07 | **DISPATCHED** |
| P1-S1-BA-D-01 | BA-Data | UC-XBOS-MD-* | **DISPATCHED** |
| P1-S1-BE-01 | Dev-BE | Catalog CRUD + publish | **DISPATCHED** |
| P1-S1-BE-02..05 | Dev-BE | KPI, org, audit, ECO | QUEUED |
| P1-S1-FE-01..03 | Dev-FE | KPI rail, workflow, dept | QUEUED |
| S1-FE-DEBT / P1-S1-QA-01 | QA | Iframe L2 + UAT | **DISPATCHED** |
| P1-S1-TM-01 | TM | PR review khối A | WAIT |
| P1-S1-DO-01 | DevOps | CI smoke | QUEUED |

Pulse: `docs/qa/evidence/sprint-pulse-s1-20260522.md` (0 fails) · watch: `sprint-pulse-watch.log`

---

## Sprint 2 — «XBOS e2e_pass 104» (QUEUED)

| ID | Role | Focus |
|----|------|-------|
| P1-S2-FE-01 | Dev-FE | ACTION_BUTTON_INVENTORY → API |
| P1-S2-QA-01 | QA | verify-capability-e2e |
| P1-S2-QC-01 | QC | Gate khối A |
| P1-S2-BA-P-01 | BA-Process | UC-XBOS-CAT-01..07 |
| P1-S2-SA-01 | SA | Capability registry conformance |
| P1-S2-TM-01 | TM | Security on CC publish flows |
| P1-S2-PM-01 | PM | Sprint review → S3 |

---

## Sprint 3 — «HRM 119 UC» (QUEUED)

| ID | Role | Focus |
|----|------|-------|
| P1-S3-BA-P/D | BA | 72 DM + UC-HRM-21..27 |
| P1-S3-BE-01..02 | Dev-BE | API completion + employees/:id |
| P1-S3-FE-01..02 | Dev-FE | Full embed + standalone HRM |
| P1-S3-MOB-01 | Dev-Mobile | Regression only |
| P1-S3-QA-01..02 | QA | UAT script + unit blocks |
| P1-S3-QC-01 | QC | HRM pilot GO |
| P1-S3-SA-01 | SA | HRM API boundary review |
| P1-S3-TM-01 | TM | Payroll/attendance security |
| P1-S3-PM-01 | PM | UC-HRM-27 waiver decision |

---

## Sprint 4 — «DM 183 + DM-LOG 22» (QUEUED)

| ID | Role | Focus |
|----|------|-------|
| P1-S4-DO-01 | DevOps | Seed pipeline W2 |
| P1-S4-BA-D-01 | BA-Data | 183 checklist |
| P1-S4-BA-P-01 | BA-Process | XBOS-DM-LOG-19 UAT |
| P1-S4-BE-01 | Dev-BE | DM-LOG APIs |
| P1-S4-QA-01 | QA | Missing catalog verify |
| P1-S4-PM-01 | PM | Gate G5 sign-off |

---

## Sprint 5 — «Phase 1 gate» (QUEUED)

| ID | Role | Focus |
|----|------|-------|
| P1-S5-QA-01..02 | QA | Full regression + gate report |
| P1-S5-QC-01 | QC | **GO Phase 1** |
| P1-S5-PM-01 | PM | Release note + Phase 2 charter |
| P1-S5-SA-01 | SA | NFR sign-off |
| P1-S5-TM-01 | TM | Final security gate |

---

## Scrum ceremonies (agent)

| Ceremony | Khi nào | Owner | Output |
|----------|---------|-------|--------|
| Sprint Planning | Đầu mỗi sprint | PM | Bus block `PM -> ALL` + DISPATCHED ids |
| Daily | Sau mỗi subagentStop | PM | `TEAM_LIVE_STATUS.md` pulse |
| Dev complete | PR ready | Dev-* | `READY_FOR_QA` |
| QA complete | Tests PASS | QA | `PASS_TO_PM` or `FAIL` |
| QC complete | Gate | QC | `GO` / `NO-GO` |
| Sprint Review | Cuối sprint | PM + QC | Sprint N → DONE; kick S(N+1) |
| Retro | PM internal | PM | `PM_COACHING_FOR_ROLES.md` tweak |

---

## Automation loop (until Phase 1 DONE)

```
Sprint N DISPATCHED (all roles)
  → parallel Task subagents
  → Dev READY_FOR_QA → QA
  → QA PASS_TO_PM → QC (if gate sprint)
  → QC GO → PM Sprint Review
  → PM dispatches Sprint N+1
  → repeat until G1..G9 true
```

**Stop condition:** `planned` = 0 (or all waived) AND `phase1:gate` exit 0 AND QC GO.
