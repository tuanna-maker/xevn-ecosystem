# Phase 1 — Master Todo List (S0 → S5)

**Program:** `PHASE1_AGILE_SCRUM` · **245 UC** · **Chế độ:** sprint **tuần tự** (S0 xong → S1 → … → S5)  
**WBS PMP:** [`PHASE1_PMP_PROJECT_PLAN.md`](./PHASE1_PMP_PROJECT_PLAN.md) · **Playbook:** [`PM_ORCHESTRATION_PLAYBOOK.md`](./PM_ORCHESTRATION_PLAYBOOK.md)  
**Runner state:** [`PHASE1_SPRINT_RUNNER.json`](./PHASE1_SPRINT_RUNNER.json)  
**Board:** [`PHASE1_SCRUM_BOARD.md`](./PHASE1_SCRUM_BOARD.md)  
**Overlay P0:** [`HRM_FULL_FIDELITY_PROGRAM.md`](./HRM_FULL_FIDELITY_PROGRAM.md)

**Chú thích:** `[x]` done · `[~]` in progress · `[ ]` pending · `[-]` blocked/wait

---

## Global gates (Phase 1 DONE)

| ID | Gate | Target | Status |
|----|------|--------|--------|
| G1 | 245 UC `e2e_pass` \| `waived` | 245/245 | [x] QC-02 2026-05-25 |
| G2 | XBOS 104 UC `e2e_pass` | 103/104 + 1 waived | [~] GWC `UC-ECO-MASTER-01` — không 104/104 e2e |
| G3 | HRM 119 UC QA sign-off | 119/119 | [x] matrix khối C + L2.5 7/7 (GWC member persona) |
| G4 | DM-LOG 22 UC checklist | 22/22 | [ ] |
| G5 | 183 DM published | 183/183 | [ ] |
| G6 | Mobile 15 MOB UC | 15/15 | [x] |
| G7 | `pnpm phase1:gate` exit 0 | non-strict PASS | [~] `--strict` + capabilities path TBD |
| G8 | P-CC-01..08 PASS | 8/8 | [x] 8/8 L2 |
| G9 | `test:uc:catalog` P1 ≥ partial | 244/245 | [x] |

---

## Sprint S0 — Pilot zero-defect

**Goal:** P-CC-01..08 PASS · vitest portal PASS · QC GO  
**Exit:** `S0.status = done` in runner JSON

| Seq | ID | Role | Task | Status |
|-----|-----|------|------|--------|
| 0.1 | P1-S0-PM-01 | PM | Sprint planning + bus kickoff | [x] |
| 0.2 | P1-S0-DO-01 | DevOps | L0 `qc:dev-stack` | [x] |
| 0.3 | P1-S0-BA-P-01 | BA-Process | Acceptance P-CC-05..08 | [x] |
| 0.4 | P1-S0-BA-D-01 | BA-Data | `PILOT_SCOPE_DATA_MATRIX.md` | [x] |
| 0.5 | P1-S0-SA-01 | SA | ADR HRM embed data mode | [x] |
| 0.6 | P1-S0-BE-01 | Dev-BE | `GET /employees/:id` | [~] defer S3 |
| 0.7 | P1-S0-FE-01 | Dev-FE | Embed P-CC-05..08 API mode | [x] S1-FE-DEBT |
| 0.8 | P1-S0-FE-02 | Dev-FE | Fix web-portal vitest | [ ] |
| 0.9 | P1-S0-MOB-01 | Dev-Mobile | `mobile-hrm-smoke.mjs` regression | [x] |
| 0.10 | P1-S0-QA-01 | QA | L0–L2 P-CC-01..08 retest | [x] |
| 0.11 | P1-S0-TM-01 | TM | Review S0 PRs | [x] |
| 0.12 | P1-S0-QC-01 | QC | GO 8 routes embed | [x] GO WITH CONDITIONS |
| 0.13 | P1-S0-PM-02 | PM | Sprint S0 review → unlock S1 | [x] |

---

## Sprint S1 — XBOS `planned` → `be`

**Goal:** `planned` khối A < 20 · ~90 UC `be`  
**Exit:** S1 QA PASS + TM sign-off

| Seq | ID | Role | Task | Status |
|-----|-----|------|------|--------|
| 1.1 | P1-S1-PM-01 | PM | Sprint planning S1 | [~] |
| 1.2 | P1-S1-SA-01 | SA | OpenAPI M01 package | [x] |
| 1.3 | P1-S1-BA-P-01 | BA-Process | UC-XBOS-03..07, SYNC, MET acceptance | [x] |
| 1.4 | P1-S1-BA-D-01 | BA-Data | UC-XBOS-MD-01..08 data contracts | [x] |
| 1.5 | P1-S1-BE-01 | Dev-BE | Catalog CRUD + publish | [x] |
| 1.6 | P1-S1-BE-02 | Dev-BE | KPI engine 01..04 + scope | [x] QA-BATCH PASS |
| 1.7 | P1-S1-BE-03 | Dev-BE | Org/RBAC APIs | [x] QA-BATCH PASS |
| 1.8 | P1-S1-BE-04 | Dev-BE | Audit + satellite alerts | [x] QA-BATCH PASS |
| 1.9 | P1-S1-BE-05 | Dev-BE | UC-ECO-MASTER-02 | [x] QA-BATCH PASS |
| 1.10 | P1-S1-FE-01 | Dev-FE | KPI rail / dashboard strict | [x] QA-BATCH PASS |
| 1.11 | P1-S1-FE-02 | Dev-FE | Workflow canvas API | [x] QA-BATCH PASS |
| 1.12 | P1-S1-FE-03 | Dev-FE | Dept system templates CRUD | [x] QA-FE-03 PASS |
| 1.13 | P1-S1-DO-01 | DevOps | Stack + sprint pulse S1 | [x] |
| 1.14 | P1-S1-QA-01 | QA | Extend `test:system:uat` | [x] 37/37 + view 10/10 + embed 8/8 |
| 1.15 | P1-S1-TM-01 | TM | Review khối A PRs | [x] GO WITH CONDITIONS — `p1-s1-tm-01-review-20260524.md` |
| 1.16 | P1-S1-PM-02 | PM | Sprint S1 review → unlock S2 | [x] `S1_RETRO.md`; runner S2 active |

---

## Sprint S2 — XBOS `e2e_pass` (104 UC)

**Goal:** G2 — 104/104 XBOS `e2e_pass`  
**Exit:** QC GO khối A

| Seq | ID | Role | Task | Status |
|-----|-----|------|------|--------|
| 2.1 | P1-S2-PM-01 | PM | Sprint planning S2 | [x] S2_SPRINT_BACKLOG + SPRINT_STATUS_AT_A_GLANCE |
| 2.2 | P1-S2-FE-01 | Dev-FE | ACTION_BUTTON_INVENTORY → API | [ ] |
| 2.3 | P1-S2-SA-01 | SA | Capability registry conformance | [ ] |
| 2.4 | P1-S2-BA-P-01 | BA-Process | UC-XBOS-CAT-01..07 | [ ] |
| 2.5 | P1-S2-QA-01 | QA | `verify-capability-e2e.mjs` | [ ] |
| 2.6 | P1-S2-TM-01 | TM | Security CC publish | [x] GWC — `p1-s2-tm-01-review-20260524.md` |
| 2.7 | P1-S2-QC-01 | QC | Gate khối A GO | [x] GWC — `p1-s2-qc-01-20260524.md` (C6/C10 open) |
| 2.8 | P1-S2-PM-02 | PM | Sprint S2 review → unlock S3 | [ ] |

---

## Sprint S3 — HRM 119 UC

**Goal:** G3 — HRM QA sign-off + embed full API mode  
**Exit:** QC HRM pilot GO

| Seq | ID | Role | Task | Status |
|-----|-----|------|------|--------|
| 3.1 | P1-S3-PM-01 | PM | Sprint planning S3 + UC-HRM-27 decision | [ ] |
| 3.2 | P1-S3-BA-P-01 | BA-Process | UC-HRM-21..27 full trace | [ ] |
| 3.3 | P1-S3-BA-D-01 | BA-Data | 72 DM HRM form verify | [ ] |
| 3.4 | P1-S3-SA-01 | SA | HRM API boundary review | [ ] |
| 3.5 | P1-S3-BE-01 | Dev-BE | HRM APIs completion (54 `be`) | [ ] |
| 3.6 | P1-S3-BE-02 | Dev-BE | Employees harden + contracts | [ ] |
| 3.7 | P1-S3-FE-01 | Dev-FE | Full HRM embed API mode audit | [ ] |
| 3.8 | P1-S3-FE-02 | Dev-FE | HRM standalone mock removal | [ ] |
| 3.9 | P1-S3-MOB-01 | Dev-Mobile | Regression MOB-* | [ ] |
| 3.10 | P1-S3-QA-01 | QA | `simulate-hrm-uat-business-flow.ps1` | [ ] |
| 3.11 | P1-S3-QA-02 | QA | Unit blocks → +30 UC `covered` | [ ] |
| 3.12 | P1-S3-TM-01 | TM | Payroll/attendance security | [ ] |
| 3.13 | P1-S3-QC-01 | QC | HRM pilot GO | [x] GWC `p1-s3-qc-01-20260524.md` |
| 3.14 | P1-S3-PM-02 | PM | Sprint S3 review → unlock S4 | [ ] |

---

## Sprint S4 — DM 183 + DM-LOG 22

**Goal:** G4 + G5  
**Exit:** QA catalog verify PASS

| Seq | ID | Role | Task | Status |
|-----|-----|------|------|--------|
| 4.1 | P1-S4-PM-01 | PM | Sprint planning S4 | [ ] |
| 4.2 | P1-S4-DO-01 | DevOps | Seed W2 pipeline | [ ] |
| 4.3 | P1-S4-BA-D-01 | BA-Data | 183 DM checklist | [ ] |
| 4.4 | P1-S4-BA-P-01 | BA-Process | XBOS-DM-LOG-19 UAT scripts | [ ] |
| 4.5 | P1-S4-BE-01 | Dev-BE | DM-LOG APIs `planned`→`data` | [ ] |
| 4.6 | P1-S4-QA-01 | QA | Missing catalog verify script | [ ] |
| 4.7 | P1-S4-PM-02 | PM | Sprint S4 review → unlock S5 | [ ] |

---

## Sprint S5 — Phase 1 gate

**Goal:** G1, G7, QC **GO**  
**Exit:** `program_status = PHASE1_DONE`

| Seq | ID | Role | Task | Status |
|-----|-----|------|------|--------|
| 5.1 | P1-S5-PM-01 | PM | Gate ceremony kickoff | [ ] |
| 5.2 | P1-S5-QA-01 | QA | Full regression L0–L4 | [x] |
| 5.3 | P1-S5-QA-02 | QA | `PHASE1_GATE_REPORT` + impl_status | [ ] |
| 5.4 | P1-S5-SA-01 | SA | NFR sign-off | [ ] |
| 5.5 | P1-S5-TM-01 | TM | Final security gate | [ ] |
| 5.6 | P1-S5-QC-01 | QC | **GO Phase 1** | [ ] |
| 5.7 | P1-S5-PM-02 | PM | Release note + Phase 2 charter | [ ] |

---

## Thống kê

| Sprint | Items | Done | % | Trạng thái |
|--------|------:|-----:|--:|------------|
| S0 | 13 | 12 | 92% | **Done** (vitest portal còn mở) |
| S1 | 16 | 5 | 31% | **Đang làm** ← active |
| S2 | 8 | 0 | 0% | **Chưa mở** |
| S3 | 14 | 0 | 0% | **Chưa mở** |
| S4 | 7 | 0 | 0% | **Chưa mở** |
| S5 | 7 | 0 | 0% | **Chưa mở** |
| **Tổng** | **65** | **17** | **~26%** | Program **chưa xong** |

*Cập nhật cột Status khi PM nhận `PASS_TO_PM` / QC GO — hoặc chạy `node scripts/phase1-sprint-runner.mjs status`.*

---

## Quy tắc chạy tuần tự

1. Chỉ **một sprint** `active` tại một thời điểm.  
2. Trong sprint: thực hiện theo **Seq** (0.2 → 0.3 → …); Dev-BE/FE có thể gộp một Task nếu cùng phase.  
3. **Không mở S(N+1)** cho đến khi `P1-SN-PM-02` = done.  
4. Hook `PM_ORCHESTRATION_MODE=RUN` → PM dispatch **bước kế** từ runner JSON.
