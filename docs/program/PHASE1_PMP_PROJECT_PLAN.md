# Phase 1 — Project Plan (PMP / WBS)

**Program:** `PHASE1_AGILE_SCRUM` · **245 UC** · **Owner:** PM (Executive)  
**Baseline:** 2026-05-24 · **Trạng thái:** IN_PROGRESS — Sprint **S1** active + overlay **HRM-FULL-FIDELITY-01**

**Playbook điều phối:** [`PM_ORCHESTRATION_PLAYBOOK.md`](./PM_ORCHESTRATION_PLAYBOOK.md)  
**Chi tiết sprint cũ:** [`PHASE1_COMPLETION_PLAN.md`](./PHASE1_COMPLETION_PLAN.md)

---

## 1. Project charter (tóm tắt)

| | |
|---|---|
| **Mục tiêu** | Đóng Phase 1: 245 UC `e2e_pass` hoặc `waived`; pilot Command Center; HRM 119 UC; XBOS 104 UC; 183 DM |
| **Phạm vi** | S0–S5 trong repo `xevn-ecosystem`; Phase 2 Logistic **ngoài** scope |
| **Ràng buộc** | User không chạy terminal; hook auto STOP; seed local Postgres |
| **Success** | `pnpm phase1:gate` exit 0; QC GO; user pilot không thấy lỗi giả (empty có giải thích) |

---

## 2. WBS (Work Breakdown Structure)

```
1.0 PHASE1_XEVN_OS
├── 1.1 Governance & PMO
│   ├── 1.1.1 WBS / plan / runner (this doc, MASTER_TODO, RUNNER.json)
│   ├── 1.1.2 Bus + LIVE_STATUS + USER_REQUIREMENTS
│   ├── 1.1.3 Sprint ceremonies (planning, review, retro, knowledge)
│   └── 1.1.4 Gate G1–G9 tracking (PHASE1_GATE_REPORT)
├── 1.2 Sprint S0 — Pilot zero-defect [DONE]
│   ├── 1.2.1 L0 stack (DevOps)
│   ├── 1.2.2 P-CC-01..08 BA trace + BE DTO scope
│   ├── 1.2.3 HRM embed API mode + QC GO WITH CONDITIONS
│   └── 1.2.4 S0 retro + lessons (S0_RETRO.md)
├── 1.3 Sprint S1 — XBOS planned→be [ACTIVE]
│   ├── 1.3.1 SA OpenAPI M01 [DONE]
│   ├── 1.3.2 BA UC-XBOS-03..07 + MD-01..08 [DONE]
│   ├── 1.3.3 BE catalog/KPI/org/audit/ECO-MASTER-02 [IN PROGRESS]
│   ├── 1.3.4 FE CC KPI/workflow/dept + S1-FE-DEBT [PARTIAL]
│   ├── 1.3.5 QA UAT extend + TM review
│   └── 1.3.6 S1 review → unlock S2
├── 1.4 Overlay HRM-FULL-FIDELITY-01 [ACTIVE — P0 user]
│   ├── 1.4.1 BA menu linkage + cardinality [DONE]
│   ├── 1.4.2 SA RBAC ladder ADR [DONE]
│   ├── 1.4.3 BE seed satellite + scope main [IN PROGRESS]
│   ├── 1.4.4 FE linked-empty UX [DONE]
│   ├── 1.4.5 QA density 7/7 + persona [FAIL → retest after BE scope]
│   └── 1.4.6 QC G-FID-08 (after persona PASS)
├── 1.5 Sprint S2 — XBOS e2e_pass 104 UC [LOCKED]
│   ├── 1.5.1 FE ACTION_BUTTON_INVENTORY→API
│   ├── 1.5.2 QA verify-capability-e2e
│   └── 1.5.3 QC GO khối A (G2)
├── 1.6 Sprint S3 — HRM 119 UC [LOCKED]
│   ├── 1.6.1 BE complete 54 UC `be`
│   ├── 1.6.2 FE full embed + standalone
│   ├── 1.6.3 Mobile regression MOB-*
│   └── 1.6.4 QA UAT 119 + QC HRM GO (G3)
├── 1.7 Sprint S4 — DM 183 + DM-LOG 22 [LOCKED]
│   ├── 1.7.1 DevOps seed W2 pipeline
│   ├── 1.7.2 BA checklist 183 DM
│   └── 1.7.3 QA G4 G5
├── 1.8 Sprint S5 — Phase 1 gate [LOCKED]
│   ├── 1.8.1 Full regression L0–L4
│   ├── 1.8.2 impl_status closure G1
│   └── 1.8.3 QC GO Phase 1 + PM release note
└── 1.9 Knowledge management (xuyên suốt)
    ├── 1.9.1 Per-sprint ROLE_SPRINT_IMPROVEMENT_LOG
    └── 1.9.2 `.cursor/team/knowledge/*.md` per role
```

---

## 3. Schedule & milestones

| Milestone | Sprint | Target | Gate |
|-----------|--------|--------|------|
| M0 Pilot 8 routes | S0 | ✓ | G8 |
| M1 XBOS BE slice | S1 | W+3 | impl_status A ↓planned |
| M1b HRM data fidelity | Overlay | W+1 | G-FID-07 |
| M2 XBOS 104 E2E | S2 | W+2 | G2 |
| M3 HRM 119 sign-off | S3 | W+4 | G3 |
| M4 183 DM published | S4 | W+2 | G4 G5 |
| M5 Phase 1 complete | S5 | W+1 | G1 G7 QC GO |

**Tổng ước lượng:** ~13 tuần (1 squad + agent lanes).

---

## 4. WBS dictionary — Sprint S1 (chi tiết đang chạy)

| WBS | work_item_id | Role | Deliverable | Status |
|-----|--------------|------|-------------|--------|
| 1.3.1 | P1-S1-SA-01 | SA | ADR + openapi M01 | DONE |
| 1.3.2 | P1-S1-BA-P-01 | BA-P | S1_BA_PROCESS_XBOS_UC03-07.md | DONE |
| 1.3.2 | P1-S1-BA-D-01 | BA-D | S1_BA_DATA_MD01-08.md | DONE |
| 1.3.3 | P1-S1-BE-01 | Dev-BE | Catalog scope + publish | READY_FOR_QA |
| 1.3.3 | P1-S1-BE-02..05 | Dev-BE | KPI, org, audit, ECO-MASTER-02 | QUEUED |
| 1.3.4 | S1-FE-DEBT | Dev-FE | Embed Supabase off | DONE |
| 1.3.4 | P1-S1-FE-01..03 | Dev-FE | CC mock→API | QUEUED |
| 1.3.5 | P1-S1-QA-01 | QA | UAT phases | QUEUED |
| 1.3.6 | P1-S1-PM-02 | PM | S1_RETRO + unlock S2 | WAIT |

### Overlay 1.4 (song song S1 — không thay sprint lock)

| WBS | work_item_id | Status |
|-----|--------------|--------|
| 1.4.1 | HRM-FIDELITY-BA-P/D | DONE |
| 1.4.2 | HRM-FIDELITY-SA | DONE |
| 1.4.3 | HRM-FIDELITY-BE + **HRM-FIDELITY-BE-SCOPE** | IN PROGRESS |
| 1.4.4 | HRM-FIDELITY-FE | DONE |
| 1.4.5 | HRM-FIDELITY-QA-RETEST-2 | PASS (group CEO) |
| 1.4.6 | G-FID-08 QC | **GO WITH CONDITIONS** |

---

## 5. Quality gates (rollup)

| ID | Mô tả | Owner verify |
|----|--------|--------------|
| G1–G9 | Phase 1 UC/DM/pilot | QA + QC |
| G-FID-01..06 | HRM fidelity BA/SA/BE/FE/DO | BA, SA, BE, FE, DevOps |
| G-FID-07 | Density + persona | QA |
| G-FID-08 | QC GO fidelity | QC |

---

## 6. RACI (program level)

Giữ bảng §5 `PHASE1_COMPLETION_PLAN.md` — PM **A** trên scope, gate, ceremony; Dev **R** implement; QA **R** verify; QC **A** Go/No-Go.

---

## 7. Risk register (top)

| ID | Risk | Mitigation | Owner |
|----|------|------------|-------|
| R1 | Smoke PASS, UI trống | density + persona gates | QA |
| R2 | Seed `holding` vs pilot `main` | HRM-FIDELITY-BE-SCOPE | Dev-BE |
| R3 | Hook auto treo máy | PM_ORCHESTRATION_MODE=STOP | PM |
| R4 | 111 UC vẫn `planned` | S1–S5 WBS không skip | PM |

---

## 8. Knowledge & sprint end (bắt buộc mỗi sprint)

Xem [`PM_ORCHESTRATION_PLAYBOOK.md`](./PM_ORCHESTRATION_PLAYBOOK.md) § Ceremony + [`knowledge/ROLE_SPRINT_IMPROVEMENT_LOG.md`](./knowledge/ROLE_SPRINT_IMPROVEMENT_LOG.md).

---

## 9. PM next dispatch queue (auto cập nhật)

**S1:** DONE — `S1_RETRO.md` · TM GWC · xem `p1-s1-tm-01-review-20260524.md`

**S2 ACTIVE (2026-05-24):**

1. **P0** `P1-S2-SA-01` — ADR C2 (governance, ~0.5d) → SA idle  
2. **W1** `P1-S2-FE-01` + `P1-S2-BE-WAVE-01` (execution chính) — BA **chỉ** nếu `spec_gap`  
3. **W2** `P1-S2-QA-01` + `P1-S2-TM-01`  
4. **W3** `P1-S2-QC-01` → `P1-S2-PM-02` unlock **S3**  

**Operating model:** [`TEAM_OPERATING_MODEL.md`](./TEAM_OPERATING_MODEL.md) — BA/SA không full-pack mỗi sprint sau khi SRS/TechSpec baseline.

**Plan một trang:** [`SPRINT_STATUS_AT_A_GLANCE.md`](./SPRINT_STATUS_AT_A_GLANCE.md) · **Backlog S2:** [`sprints/S2_SPRINT_BACKLOG.md`](./sprints/S2_SPRINT_BACKLOG.md) · **Roadmap:** [`SPRINT_ROADMAP_S0-S5.md`](./SPRINT_ROADMAP_S0-S5.md)
