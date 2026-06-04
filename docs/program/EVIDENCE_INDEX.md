# Chỉ mục bằng chứng — Phase 1 & HRM Fidelity

**Mục đích:** User/PM kiểm chứng “team đã làm” — mỗi dòng = artifact có path, verdict, ngày.  
**Cập nhật:** 2026-05-24 (PSR-2026-05-24-01)

| work_item_id | Evidence path | Verdict | Ngày |
|--------------|---------------|---------|------|
| P1-S0-DO-01 | docs/ops/evidence/scrum-s0-stack-20260523.md | PASS | 2026-05-23 |
| P1-S0-QC-01 | docs/qa/evidence/qc-scrum-s0-hrm-embed-20260523.md | GO WITH CONDITIONS | 2026-05-23 |
| S1-FE-DEBT | docs/qa/evidence/s1-fe-debt-qa-retest-20260523.md | PASS | 2026-05-23 |
| HRM-FIDELITY-BE | docs/qa/evidence/hrm-fidelity-be-20260523.md | READY_FOR_QA | 2026-05-23 |
| HRM-FIDELITY-BE-SCOPE | docs/qa/evidence/hrm-fidelity-be-scope-20260523.md | READY_FOR_QA | 2026-05-23 |
| HRM-FIDELITY-QA-RETEST-2 | docs/qa/evidence/hrm-fidelity-qa-scope-20260523.md | **PASS** G-FID-07 | 2026-05-24 |
| P1-S1-QC-FID-08 | docs/qa/evidence/qc-hrm-fidelity-gfid08-20260523.md | **GO WITH CONDITIONS** G-FID-08 | 2026-05-23 |
| HRM-FIDELITY-QA-RETEST | docs/qa/evidence/hrm-fidelity-qa-retest-20260523.md | FAIL persona (superseded) | 2026-05-23 |
| HRM-FIDELITY-QA | docs/qa/evidence/hrm-fidelity-qa-baseline-20260523.md | FAIL baseline | 2026-05-23 |
| HRM-FIDELITY-FE | docs/qa/evidence/hrm-fidelity-fe-20260523.md | PASS_TO_PM | 2026-05-23 |
| HRM-FIDELITY-DO | docs/qa/evidence/hrm-menu-density-verify-20260523.md | baseline 5/7 | 2026-05-23 |
| P1-S1-SA-01 | docs/decisions/ADR-XBOS-M01-OPENAPI-BOUNDARIES.md | PASS | 2026-05-23 |
| P1-S1-BA-P-01 | docs/xbos/S1_BA_PROCESS_XBOS_UC03-07.md | PASS | 2026-05-23 |
| P1-S1-BA-D-01 | docs/xbos/S1_BA_DATA_MD01-08.md | PASS | 2026-05-23 |
| HRM-FIDELITY-BA-P | docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md | PASS | 2026-05-23 |
| P1-S1-BE-01 | docs/qa/evidence/p1-s1-be-01-catalog-20260523.md | READY_FOR_QA | 2026-05-23 |
| Sprint pulse S1 | docs/qa/evidence/sprint-pulse-s1-20260522.md | 0 fails L0/L2 | 2026-05-22 |
| L2 pilot | docs/qa/evidence/pilot-business-flow-20260522.md | 11/11 | 2026-05-22 |
| Menu density | docs/qa/evidence/hrm-menu-density-verify-20260523.md | **7/7** | 2026-05-24 |
| S0 review | docs/program/sprints/S0_SPRINT_SUMMARY.md | Sprint done | 2026-05-23 |
| S0 retro | docs/program/sprints/S0_RETRO.md | Facts | 2026-05-23 |
| Phase 1 gate | docs/qa/PHASE1_GATE_REPORT.md | **111 planned** | 2026-05-24 |
| Bus (handoff) | docs/program/AGENT_MESSAGE_BUS.md | Living log | liên tục |
| P1-R1-TM-01 | docs/qa/evidence/p1-r1-tm-01-20260529.md | PASS GWC (8/10 + attendance FAIL) | 2026-05-29 |
| P1-R1-TM-01-R1 | docs/qa/evidence/p1-r1-tm-01-r1-20260529.md | **PASS** attendance P1 closed | 2026-05-29 |
| P1-R1-BE-ATT-01 | docs/qa/evidence/p1-r1-be-att-01-20260529.md | READY_FOR_QA · 238/238 | 2026-05-29 |
| P1-R1-QC-01 | docs/qa/evidence/p1-r1-qc-01-20260529.md | GO G7 · C-P1R1QC-01..04 closed via TM-R1 | 2026-05-29 |

**Thư mục đầy đủ:** `docs/qa/evidence/` (36+ file) — PM append khi QA/QC nộp.

**Tái lập nhanh:**

```bash
pnpm run verify:hrm:menu-density
pnpm run test:pilot:flows
node scripts/verify-hrm-persona-scope-probes.mjs
```
