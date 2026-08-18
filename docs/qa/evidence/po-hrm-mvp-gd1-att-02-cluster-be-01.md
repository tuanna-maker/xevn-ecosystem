# PO-HRM-MVP-GD1-ATT-02-CLUSTER-BE-01 — evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-02-CLUSTER-BE-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-25) |
| **lane** | execution · dev-be |
| **Date** | 2026-08-09 |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `attendance_uat_ready=false` · CFG alone ≠ ATT-02 DONE · Nest `/core` DENY · PAY/printable OUT · C-SLICE · U65 |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` · **FR-UC-BP-ATT-02** · Diễn biến **#1** (XOR mode+bands) · **#3** (evaluate) · **#5** (off→0) · **BR-BP-SHF-02** |
| **api_design / F.1** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md` · **F-ATT-RULE-01** physical `GET/PATCH /api/hrm/attendance/rules*` (+ optional `…/late-penalty`) |
| **db_design / DATA** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md` · soft cols on `attendance_rules` + specificity ≡ `att_attendance_rule` |
| **ba** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md` · O1–O12 · AC-ATT-02-MODE/XOR/SCOPE/OFF/EVAL |
| **sa** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-SA-01.md` · Option A LOCKED |
| **paper api** | `API_DESIGN_HRM_ENTERPRISE.md` F-ATT-RULE-01 (paper `/att` alias only) |
| **change_mode** | **ADD residual** · preserve_default · CODE-MEMORY **APPEND** |
| **must_keep** | PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · PAY OUT · U65 |

---

## Closed scope

1. **Soft cols** on `public.attendance_rules`: `late_penalty_mode` · `late_penalty_bands` · `late_penalty_enabled` · `late_penalty_department_id` · `late_penalty_shift_id` (ensureRulesSchema ALTER IF NOT EXISTS).
2. **Specificity table** `public.att_attendance_rule` (dept+shift > dept > company > shift) — paper alias SoT · **DENY** Nest `/core`.
3. **API** RETAIN `GET/PATCH /attendance/rules` + optional **`PATCH /attendance/rules/late-penalty`** same controller family.
4. **XOR** `minute`\|`block`\|`tier`/`band` · mixed / overlap → **`HRM-VAL-400`**.
5. **Display-ready:** `mode` · `modeLabelVi` · `bands` · `scope` · `sourceFlags` · `latePenaltyEnabled` · `latePenaltyHours` (+ peer `notifyLate` ≠ off).
6. **Evaluate** pure helper + AGG writes `late_penalty_hours` (funnel · ≠ ATT-10/PAY DONE).
7. **RETAIN** peers work-sites / shifts / late_early / punch / funnel col — no wipe.
8. **CODE-MEMORY APPEND** on config service · controller · aggregate · util.

---

## Tests

```text
pnpm --filter hrm-api exec jest --testPathPatterns="attendance-config.service.spec|late-penalty.util.spec|att-timesheet-line-aggregate.spec" --no-coverage
→ Test Suites: 3 passed · Tests: 31 passed
```

Coverage includes: XOR reject · bands overlap · evaluate off=0 · tier/block/minute · specificity order · PATCH display-ready · AGG suite regression.

---

## Paths touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/attendance/late-penalty.util.ts` | ADD pure XOR/bands/evaluate/specificity |
| `apps/api/hrm-api/src/attendance/late-penalty.util.spec.ts` | ADD |
| `apps/api/hrm-api/src/attendance/attendance-config.service.ts` | ADD residual wire + CODE-MEMORY |
| `apps/api/hrm-api/src/attendance/attendance-config.service.spec.ts` | ADD ATT-02 cases |
| `apps/api/hrm-api/src/attendance/dto/update-attendance-rules.dto.ts` | ADD residual fields |
| `apps/api/hrm-api/src/attendance/attendance.controller.ts` | ADD `PATCH rules/late-penalty` · query scope |
| `apps/api/hrm-api/src/attendance/att-timesheet-line-aggregate.ts` | ADD write `late_penalty_hours` |

---

## Residual / honesty

| Item | Status |
|------|--------|
| CFG alone = ATT-02 DONE | **DENY claim** |
| ATT module UAT | **false** |
| FE mode bind (R-ATT-02-MODE-FE) | FE-01 stubbed · needs **FE-02** bind display-ready |
| Punch-vs-shift late minutes engine | Partial — AGG uses approved late_early minutes as late span input; mode SoT = rules |
| Nest `/core` | **0** invent |
| Seed | **0** |

---

## Handoff

```yaml
work_item_id: PO-HRM-MVP-GD1-ATT-02-CLUSTER-BE-01
from_role: dev-be
to_role: pm
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-be-01.md
next_owner: dev-fe
completion_report: |
  ADD residual F-ATT-RULE-01 on /api/hrm/attendance/rules* (+ /rules/late-penalty):
  XOR mode·bands·scope·latePenaltyEnabled · display-ready · HRM-VAL-400 mixed/overlap ·
  soft cols + att_attendance_rule specificity · AGG late_penalty_hours evaluate ·
  jest 31 PASS · CODE-MEMORY APPEND · Nest /core DENY · ≠ CFG=ATT-02 DONE · ≠ ATT UAT.
next_dispatch_prompt: |
  work_item_id: PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-02
  role: dev-fe
  entry_criteria: BE-01 READY_FOR_QA @ docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-be-01.md · FE-01 RETAIN peers done · API-01 F.1
  mission: Bind FE CFG «Phạt muộn/về sớm» to GET/PATCH /api/hrm/attendance/rules* display-ready
    (mode·modeLabelVi·bands·scope·sourceFlags·latePenaltyEnabled) · XOR UI one mode ·
    off ≠ notifyLate · Network path contains /attendance/ · Nest /core 0 · U65 zero-seed ·
    ≠ claim CFG=ATT-02 DONE
  exit_criteria: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-fe-02.md · then QA J-HRM-ATT-02-01..06
  cấm: Nest /core · seed · invent PAY/printable · honesty flip · claim ATT UAT
```
