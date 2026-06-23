# TEAM LIVE STATUS

**Last updated:** 2026-06-08 · **W7 hub API GWC** · **Phase 1: OPEN** · **PROD: BLOCKED**

## W7 mobile hub (active)

| Lane | Status |
|------|--------|
| J-MOB-06/08/09 API @ nip.io | **CLOSED** — QC GWC [`pcomp-w7-qc-hub-04b-r3-20260607.md`](../qa/evidence/pcomp-w7-qc-hub-04b-r3-20260607.md) |
| C-W7QC-DEVICE-01 | **OPEN** — APK native rebuild in flight (`PCOMP-W7-MOB-APK-04b-R3-R1`) |
| J-AVT-01 web display | **CLOSED** — QC GO scoped [`pcomp-w4-qc-avatar-display-r4-20260607.md`](../qa/evidence/pcomp-w4-qc-avatar-display-r4-20260607.md) |
| C-W7QC-DEVICE-01 | **OPEN** — hub04b boot OK; login blocked (Dev sign-in → launcher) → `PCOMP-W7-MOB-DEVICE-LOGIN-01` |
| L0 pilot | **PASS** — `qc:fe-be-health:pilot` 13/13 (2026-06-08 pulse) |

## S5 ceremony closed

| Artifact | Verdict |
|----------|---------|
| QC `P1-S5-QC-01` | **GO WITH CONDITIONS** |
| Evidence | `docs/qa/evidence/p1-s5-qc-01-20260605.md` |
| Retro | `docs/program/sprints/S5_RETRO.md` |

**Sponsor line:** Matrix 245/245 tracking ≠ Phase 1 DONE. UAT nip.io slice usable; PROD not ready.

## Post-S5 execution (PM dispatch)

| work_item_id | Role | Target |
|--------------|------|--------|
| P1-PHASE1-BE-SCOPE-P0-S5-01 | dev-be | **DONE** — TM-S5-P0 QA PASS |
| P1-S5-DO-G5-01 | devops | **DONE** — G5 MET |
| P1-S5-QC-G5-01 | qc | **DONE** — GWC |
| P1-PHASE1-BE-JXBOS-02-PULL-01 | dev-be | **DONE** — scope fix; jest 15/15 |
| P1-PHASE1-DO-JXBOS-02-DEPLOY-01 | devops | **DONE** — pull **201**, list **200** |
| P1-S5-QA-JXBOS-02-RETEST-01 | qa | **DONE** — J-XBOS-02 ✅ |
| P1-S5-QC-G5-JXBOS-02-01 | qc | **DONE** — J-XBOS-02-GWC **CLOSED** |
| P1-S5-QC-SCOPE-P0-02 | qc | **DONE** — GWC; git parity open |

## W6 wave (in flight)

| work_item_id | Role | Status |
|--------------|------|--------|
| P1-PHASE1-BE-CONTRACTS-RATIO-01 | dev-be | **DONE** — ratio 0.850 |
| P1-PHASE1-FE-MEMCC-01 | dev-fe | **DONE** — vitest 148/148 |
| P1-EX-QA-JWT-CLOSE-01 | qa | **DONE** — C-JCC03-01 satisfied |
| P1-PHASE1-QA-CONTRACTS-RATIO-01 | qa | **DISPATCHED** |
| P1-W6-QA-MEMCC-01 | qa | **DISPATCHED** |
| P1-EX-QC-JWT-CLOSE-01 | qc | **DISPATCHED** |

## Open gates

**G8** (QC W8 pending) · **portal.xe.vn** · C-RBACQC-03-LOCAL · C-S5SCOPEQC-01 git parity · W10 handoff docs

SoT: `SPRINT_STATUS_AT_A_GLANCE.md` · `USER_SERVICE_STATUS.md`
