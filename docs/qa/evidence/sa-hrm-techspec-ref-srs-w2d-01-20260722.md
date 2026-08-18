# SA-HRM-TECHSPEC-REF-SRS-W2D-01 — Evidence

**work_item_id:** `SA-HRM-TECHSPEC-REF-SRS-W2D-01`  
**from_role:** sa · **to_role:** pm  
**lane:** governance  
**date:** 2026-07-22  
**ack_status:** `PASS_TO_PM`

## 1. Mandate

ADD-only `ref_srs` + endpoint/DTO map for **8 W2d FR** (OP/FL/27/01/BOOT). **Keep 44 Cao** W1–W2c. Cấm wipe AC-ATT-SHEET · Phase1/PROD · apps/** · seed · claim 120 UC.

**Entry:** `docs/qa/evidence/ba-hrm-srs-bateco-w2d-leftover-01-20260722.md` · `SRS_HRM_KHACH.md` **v3.0-W2d** (52 FR) · `docs/hrm/TECHSPEC.md`.

## 2. Micro-checklist

| # | Item | Result |
|---|------|--------|
| 1 | `ref_srs` + endpoint/DTO for OP/FL/27/01/BOOT batch | **PASS** — TechSpec **§16.5** |
| 2 | Do not overwrite prior 44 FR refs | **PASS** — §14 + §16.1–16.3 unchanged rows; only pointer/header + rollup |
| 3 | Dev gaps listed | **PASS** — G-OP-01/02/04 · G-FL-01 · G-DEC-01 · G-BOOT-01 (+ §16.9) |
| 4 | Evidence this file | **PASS** |
| 5 | PASS_TO_PM → QC skeleton gate-03 | **PASS** — copy-ready below |

## 3. Deliverables (docs only)

| Artifact | Change |
|----------|--------|
| `docs/hrm/TECHSPEC.md` §14 header | Khách SoT → **v3.0-W2d / 52 FR**; pointer §16.5 |
| §16.0 rollup | + W2d row · Total **52** |
| **§16.5** (ADD) | 8-row matrix FR→HTTP→envelope→DTO→table + FE must + gaps |
| §16.9 / §16.10 | Gap register + decision A2 SELECT; QC count **52** |
| §17.1 | ADD rows: `hrm_tasks` · `hr_decisions` · `hrm_fleet_vehicles` · health · bootstrap env |
| G-DB-05 | Partial close note (W2d attached 3 former orphans) |
| AC-ATT-SHEET / §16.4 | **Unchanged** |

## 4. W2d FR → API / DTO (summary)

| FR | HTTP | Code | DTO / contract | Table / store | SA |
|----|------|------|----------------|---------------|-----|
| FR-HRM-OP-01 | `POST …/operations/tasks` | `HRM-OPS-201` | `CreateTaskDto` | `hrm_tasks` | PARTIAL (G-OP-01) |
| FR-HRM-OP-02 | `GET …/operations/tasks` | `HRM-OPS-200` | `ListTasksQueryDto` | `hrm_tasks` | PARTIAL (G-OP-02) |
| FR-HRM-OP-03 | `PATCH …/tasks/:id/status` | `HRM-OPS-202` | `UpdateTaskStatusDto` | `hrm_tasks` | ALIGNED |
| FR-HRM-OP-04 | `GET …/operations/reports/summary` | `HRM-OPS-200` | query tenant+company | aggregate | ALIGNED API (G-OP-04 FE) |
| FR-HRM-FL-01 | `GET …/fleet/vehicles` | `HRM-FLEET-200` | query + list scope | `hrm_fleet_vehicles` | ALIGNED list |
| FR-HRM-27 | `GET/POST/PATCH/DELETE …/decisions` | `HRM-DEC-200/201` | Create/List/Update Decision DTOs | `hr_decisions` | ALIGNED API · PARTIAL density |
| FR-HRM-01 | `GET /api/hrm` | `HRM-HEALTH-200` | — | — | ALIGNED |
| FR-HRM-BOOT-01 | env bootstrap (§6.1) | `HRM-SYNC-CONF` on missing | `tenant-scope-env.ts` | config | ALIGNED SoT · VERIFY hardcode |

**Note:** UC `HRM-OP-*` ≠ envelope `HRM-OPS-*`.

## 5. Dev gaps (for PM backlog — not fixed this wave)

| ID | Sev | Owner hint | Exit |
|----|-----|------------|------|
| G-OP-01 | P2 | dev-be | optional assignee / task_type vs SRS |
| G-OP-02 | P2 | dev-be | list filters status/type/keyword |
| G-OP-04 | P2 | dev-fe | summary FE bind + empty honesty |
| G-FL-01 | Info | optional | get-by-id fleet — non-goal if list-only UX |
| G-DEC-01 | P1 | dev-fe+qa | AC-DEC-DENSITY + U65 create→list→F5 |
| G-BOOT-01 | P1 VERIFY | dev-be+tm | no hardcoded tenant/company in business mutate |

## 6. Integrity guards

| Check | Result |
|-------|--------|
| 44 Cao FR W1–W2c rows preserved | **PASS** |
| AC-ATT-SHEET-01..06 dual-ref §16.4 | **PASS** (unchanged) |
| Coverage §14+§16.1–16.3+§16.5 = 52 | **PASS** (docs assert) |
| apps/** touched | **No** |
| seed / Phase1 / PROD claim | **No** |

## 7. completion_report

| Đóng | Residual / mở |
|------|----------------|
| ADD §16.5 `ref_srs` 8 W2d FR + §17.1 persistence rows | G-OP-* P2 · G-DEC-01 density · G-BOOT-01 VERIFY |
| 44 Cao + AC-ATT-SHEET giữ | QC skeleton **gate-03** trên 52 FR |
| G-DB-05 partial (tasks/decisions/fleet attached) | Orphan leftover advance/OT/assets… |
| Docs-only SA | Không claim 120 / Phase1 / PROD / UF 🟢 |

## 8. Handoff

- **next_owner:** `qc`  
- **ack_status:** `PASS_TO_PM`  
- **evidence_path:** `docs/qa/evidence/sa-hrm-techspec-ref-srs-w2d-01-20260722.md`  
- **TechSpec home:** `docs/hrm/TECHSPEC.md` §16.5 · §16.0 · §16.9–16.10 · §17.1

### next_dispatch_prompt (copy-ready) — QC skeleton gate-03

```text
work_item_id: QC-HRM-SPEC-REMASTER-SKELETON-GATE-03
from_role: pm
to_role: qc
lane: governance
priority: P1
entry_criteria: SRS_HRM_KHACH.md v3.0-W2d Ch.1–6; 52 FR; inventory body_ready=30 planned_W2=0; BA evidence ba-hrm-srs-bateco-w2d-leftover-01-20260722.md; SA TechSpec §16.5 ref_srs W2d evidence sa-hrm-techspec-ref-srs-w2d-01-20260722.md; prior gate-02 nếu có
exit_criteria: Audit §3.4.8 PASS; spot-check ≥3 FR (AT-14 AC-ATT-SHEET + 1 OP + FR-27); đếm FR = Kết quả trả về = 52; xác nhận không wipe 44 Cao; TechSpec §16.5 có 8 hàng W2d; GO hoặc GWC chỉ leftover UC slice / G-DEC-01 density (không Yêu cầu-N); C-SKEL-04 đóng nếu trong scope
evidence_path: docs/qa/evidence/qc-hrm-spec-remaster-skeleton-gate-03-20260722.md
ack_status: PASS_TO_PM
cấm: wipe · Phase1/PROD · claim 120 UC · seed · apps/**
```
