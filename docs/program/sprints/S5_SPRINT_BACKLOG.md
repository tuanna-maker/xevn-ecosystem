# Sprint S5 — Backlog & gate ceremony (PMP)

**Sprint goal (G1 + G7):** Phase 1 program gate — `PHASE1_GATE_REPORT` cập nhật, `phase1:gate --strict` exit 0 (nip.io hoặc local), QC **P1-S5-QC-01** GO/GWC.  
**Carry-over S4 (G4 + G5):** DM-LOG 22 checklist · 183 danh mục publish/seed — **blocker** trước khi claim Phase 1 DONE.  
**Active from:** 2026-06-05 · **Unlock:** Excellence wave U28/U29 slices closed (CRUD P0, C-RBACQC-03, HTTPS-R3).  
**Retro target:** `S5_RETRO.md` sau `P1-S5-PM-02`.

---

## Burn-down (honest — 2026-06-05)

| Metric | Current | Target end S5 |
|--------|---------|---------------|
| UC `e2e_pass` + `waived` | ~15–30 baseline + GWC slices | **245** (hoặc waiver có expiry) |
| G4 DM-LOG 22 | 🔴 open | **22/22** checklist |
| G5 DM 183 | 🔴 open | publish + seed verified |
| G7 `phase1:gate --strict` | 🟢 nip.io PASS (C-RBACQC-03) | reproducible local + report |
| CRUD matrix UNTESTED | catalog/recruitment/att/member WF | **PASS** hoặc **N/A** documented |
| QC Phase 1 | NO-GO program 2026-05-24 | **GO / GWC** có residual list |

> **PM rule:** Slice PASS ≠ Phase 1 DONE. S5 đóng **gói sprint** (evidence + gate report + QC verdict), không marketing «xong dự án».

---

## Sprint backlog (ordered — max 3 parallel Task)

| Wave | ID | Role | Deliverable | DoD / evidence |
|------|-----|------|-------------|----------------|
| W0 | **P1-S5-PM-01** | PM | S5 backlog + bus kickoff | This file + `SPRINT_STATUS_AT_A_GLANCE` |
| W1 | **P1-S5-QA-02** | QA | `PHASE1_GATE_REPORT` refresh + G1–G9 table | `p1-s5-qa-02-20260605.md` |
| W1 | **P1-PHASE1-QA-CRUD-MATRIX-GAPS** | QA | UNTESTED cells batch nip.io | `p1-phase1-qa-crud-matrix-gaps-20260605.md` |
| W1 | **P1-S5-DO-G5-01** | DevOps | G5 seed verify (183 DM) | `p1-s5-do-g5-01-20260605.md` |
| W2 | **P1-S4-BA-D-01** | BA-Data | G4 DM-LOG 22 checklist | trigger after QA gaps |
| W2 | **P1-S5-TM-01** | TM | NFR / security pre-gate | `p1-s5-tm-01-20260605.md` |
| W3 | **P1-S5-QC-01** | QC | **GO Phase 1** ceremony | `p1-s5-qc-01-20260605.md` |
| W3 | **P1-S5-PM-02** | PM | Sprint review + `S5_RETRO.md` + runner unlock | `verify:sprint:transition` exit 0 |

**Deferred (sponsor / DNS):** `portal.xe.vn` PROD — W14 lane; không chặn S5 UAT gate.

---

## Parallel lanes (W1 — PM dispatch 2026-06-05)

```
W1:  QA-02 ‖ QA-CRUD-GAPS ‖ DevOps-G5-01
W2:  TM-01 ‖ BA-D-01 (G4) — sau W1 evidence
W3:  QC-01 → PM-02 (ceremony)
```

---

## Definition of Done (S5 sprint)

1. `PHASE1_GATE_REPORT.md` phản ánh số liệu thật (không copy baseline 2026-05-22).  
2. Mọi P0 CRUD / J-* bắt buộc có PASS hoặc GWC có owner.  
3. QC **P1-S5-QC-01** verdict ghi bus + `PROJECT_STATUS_REPORT.md`.  
4. `P1-S5-PM-02`: retro + ít nhất 1 cập nhật governance (KB/rule) nếu có lesson.
