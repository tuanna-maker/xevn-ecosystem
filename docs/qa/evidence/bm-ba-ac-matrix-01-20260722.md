# BM-BA-AC-MATRIX-01 — Evidence (2026-07-22)

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-BA-AC-MATRIX-01` |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **role** | ba-process |
| **ack_status** | **PASS_TO_PM** |
| **U65** | Zero-seed; AC require FE post-mutation + Network 2xx + F5 |
| **Standing** | **NOT** Phase1 / PROD / ecosystem SRS complete |

---

## 1. Closed scope

Produced testable AC matrix **BM-02..BM-07** (BM-01 Connect defer excluded) with:

- AC-ID · Given/When/Then · spec_ref (BRD YC / SRS FR / TechSpec § / delta AC) · persona · FE click path · PASS when (FE + 2xx + F5)
- Column **spec_says / code_does** — `code_does` = **UNKNOWN** everywhere (no invented product truth)
- Map to **J-REC-WF-01..06**, **J-HRM-INT-05**, **J-HRM-03/05**, **UF-HRM-02/03/09/10/12/13** + MENU where relevant
- Reused normative AC from `CUSTOMER_DEMO_HRM_DELTA` F3–F6 + `XBOS_HRM_REC_WF_BRIDGE_BA_DELTA` AC-REC-WF-* (UPGRADE packaging for B-Minutes retest IDs **BM-AC-***)

**SoT matrix file:** [`docs/program/deltas/BMINUTES_AC_MATRIX.md`](../../program/deltas/BMINUTES_AC_MATRIX.md)

**BA_TRACE:** §18 pointer added in `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md`.

---

## 2. AC count by package

| Package | AC-IDs | Count |
|---------|--------|-------|
| BM-02 Role-switch | BM-AC-02-01..04 | 4 |
| BM-03 WF động | BM-AC-03-01..05 | 5 |
| BM-04 HĐLĐ compensation | BM-AC-04-01..05 | 5 |
| BM-05 JD + dashboard | BM-AC-05-01..04 | 4 |
| BM-06 XBOS→HRM WF bridge | BM-AC-06-01..08 | 8 |
| BM-07 Chức vụ Setting→NV | BM-AC-07-01..03 | 3 |
| **Total** | | **29** |

---

## 3. Spec anchors (read ack)

| Artifact | Used for |
|----------|----------|
| `docs/program/BMINUTES_CUSTOMER_RETEST_PROGRAM.md` | BM-02..07 package definitions |
| `docs/client-delivery/hrm/BRD_HRM_KHACH.md` | Yêu cầu-01,05,06,14,15,17,29 |
| `docs/client-delivery/hrm/SRS_HRM_KHACH.md` | FR-HRM-SCOPE-* · CI-01 · EM-01 · RC-01/03 · SC-01 · 06/08 |
| `docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md` | F3–F6 UC/BR/AC |
| `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` | J-REC-WF + AC-REC-WF |
| `docs/hrm/TECHSPEC.md` | §14.2/14.7/14.8 · §17.1 compensation · §17.6 dual catalog **≠** BM-07 |
| `docs/decisions/ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620.md` | resolver_type enum |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | J-REC-WF-01..06 · J-HRM-* |

---

## 4. Residual (governance — expected)

| ID | Residual | Owner |
|----|----------|-------|
| R1 | All `code_does` UNKNOWN | explore FE/BE then Dev by FAIL |
| R2 | BM-AC-02-04 multi-hat may stay N/A without persona (U65 no seed) | pm/qa — Condition pattern C-CD-FB-06-01 |
| R3 | Stage↔task_type final map | ba-data (prior XHRM-REC-WF-BD-01) |
| R4 | Member publish sequence detail | sa `BM-SA-XBOS-HRM-REC-TRACE-01` |
| R5 | Client SRS FR not yet merged for F3–F6 delta §16.* | ba-docs later — **not** this work_item |

---

## 5. Completion contract

### completion_report

Closed **BM-BA-AC-MATRIX-01**: 29 AC rows for BM-02..BM-07 with measurable PASS (FE + Network 2xx + F5), spec_ref, persona, click path, J-*/UF map, and explicit **UNKNOWN** code column. Matrix published at `docs/program/deltas/BMINUTES_AC_MATRIX.md`. Did **not** touch `apps/**`, seed, Phase1/PROD claims, or invent code truth. Residual = inventory + SA trace + QA E2E after gaps.

### next_owner

**pm** — split parallel Wave 0 explore/SA/QA per program §2; then Dev only where explore FAIL.

### next_dispatch_prompt

```text
work_item_id: BM-WAVE0-SPLIT-01 (parent)
program: P1-BMINUTES-CUST-RETEST-01
from_role: pm
lane: execution+governance
entry: docs/program/deltas/BMINUTES_AC_MATRIX.md · docs/qa/evidence/bm-ba-ac-matrix-01-20260722.md
U65: zero-seed · cấm apps invent without gap FAIL

PARALLEL Task (max 4) — same turn:

1) Task explore | BM-EXP-FE-JD-POS-WF-01
   Map FE paths for BM-AC-02/04/05/07 (role chip, compensation tabs, JobTemplatesTab, settings chức vụ, WF canvas entry).
   Exit: file path + EXISTS/MISSING per AC cluster; evidence docs/qa/evidence/bm-exp-fe-jd-pos-wf-01-YYYYMMDD.md; PASS_TO_PM.
   Fill code_does UNKNOWN → EXISTS/MISSING only (no PASS claim).

2) Task explore | BM-EXP-BE-WF-BRIDGE-01
   Inventory BE: RecruitmentWorkflowBridge, leave bridge, resolver_type registry, compensation-packages APIs, job-templates.
   Exit: endpoint + assigneeType/resolver matrix vs BM-AC-03/06; evidence docs/qa/evidence/bm-exp-be-wf-bridge-01-YYYYMMDD.md; PASS_TO_PM.

3) Task sa | BM-SA-XBOS-HRM-REC-TRACE-01
   Sequence XBOS publish/catalog/process → member apply → HRM spawn WF; gap IDs vs BM-AC-06-*.
   Exit: docs/program or decisions trace + gap list; PASS_TO_PM.

4) After explore+SA return: PM splits Dev by FAIL only:
   - FE gaps → Task dev-fe BM-DEV-FE-{02|04|05|07}-01 (one package per Task, U69)
   - BE gaps → Task dev-be BM-DEV-BE-{03|04|06}-01
   Then Task qa BM-QA-REC-E2E-8088-01:
     entry: AC BM-05 + BM-06 P0 (J-REC-WF-01..06 + UF-HRM-12 must_keep)
     exit: browser U65 evidence; matrix Dev8088 column; PASS_TO_PM
     cấm: seed inbox/WF; API-only PASS

Optional parallel: Task ba-data BM-BD-POS-07-01 — position catalog key ↔ employee job_title_key ↔ WF position_code (BM-AC-07 + BM-AC-03-03).

ack_status target: each sub-task PASS_TO_PM with completion_report + next_dispatch_prompt.
```

### evidence_path

`docs/qa/evidence/bm-ba-ac-matrix-01-20260722.md`  
`docs/program/deltas/BMINUTES_AC_MATRIX.md`

### ack_status

**PASS_TO_PM**
