# PO-HRM-MVP-GD1-ATT-08-CLUSTER-BE-01 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-08-CLUSTER-BE-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · Wave-26 seat #28) |
| **lane** | execution · **dev-be** |
| **uc_ids** | `UC-BP-ATT-08` · `FR-UC-BP-ATT-08` |
| **Date** | 2026-08-09 |
| **depends_on** | API-01 **CONFIRMED** · DATA-01 HOLD + residual ADD · BA O1–O12 · SA Option A · `ATT02QC1-MSLQZUK7` CFG≠DONE · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` printable false · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE** · U65 · **DENY** claim client-days = ATT-08 DONE · **DENY** claim ATT-09/03b DONE · **DENY** claim ATT UAT · **DENY** CFG=ATT-02 DONE · PAY/printable OUT |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-08** Diễn biến **#1–#4** · FAIL calendar · **BR-BP-LV-05** · **Q-LEAVE-UNIT** |
| **ba** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-BA-01.md` O1–O12 · AC-ATT-08-* |
| **db_design** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01.md` — leave_requests HOLD RETAIN · residual engine cols · holiday year set · `att_leave_type.unit` |
| **api_design** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md` §4 F-ATT-LEAVE-01 · §5 peers RETAIN · §6 residual wire |
| **sponsor_confirm** | API-01 CONFIRMED 2026-08-09 · unlock BE residual REQUIRED |
| **change_mode** | **ADD** residual wire · **RETAIN** leave-requests*/balance/EFF/expand · **preserve_default** |

---

## 2. Implementation summary

| Item | Detail |
|------|--------|
| **F-ATT-LEAVE-01** | `POST /api/hrm/attendance/leave-requests/preview-deduction` → `HRM-LEAVE-PREVIEW-200` |
| **Engine BR-BP-LV-05** | `leave-deduction-engine.ts` — gold T6→T2 `working_days=2` · `calendar_days=4` · Sat/Sun + holiday exclude |
| **HOL-MISS** | Thin `att_holiday_calendar` + `att_holiday_day` · `GET/PUT /attendance/holiday-calendars/:year` · ABSENT year → **400** `HRM-LEAVE-HOL-MISSING` |
| **Q-LEAVE-UNIT** | Soft `att_leave_type.unit` `day`\|`hour` · display on EFF/list · half-day 0.5 · hour via `hours` |
| **ALIGN** | createLeaveRequest consumes engine · reject client inflate (`total_days`≠`deductible_units`) · persist `working_days`/`deductible_units`/`calendar_days`/`unit` |
| **Display-ready** | `deductible_units` · `calendar_days` · `working_days` · `unit` · `excluded_days[]` · `warnings[]` · labels VI |
| **U19** | Same `resolveHrmListScope` / persist TEXT family as leave-requests |
| **Nest `/core`** | **ABSENT** — physical `/attendance/*` only · paper alias only |
| **RETAIN** | F-ATT-LEAVE-02/03 · balance/panel · EFF · `expandLeaveDateRange` ≠ BR-BP-LV-05 SoT |
| **OUT / DENY** | Nest `/core` dual · invent PAY/printable/Word DONE · claim client-days=ATT-08 DONE · claim ATT-09/03b DONE · claim ATT UAT · CFG=ATT-02 DONE · seed · honesty flip |

---

## 3. Verification

```text
pnpm --filter hrm-api exec jest --testPathPatterns=po-hrm-mvp-gd1-att-08-cluster-be-01 --no-coverage
→ Test Suites: 1 passed · Tests: 12 passed

pnpm --filter hrm-api exec tsc -p tsconfig.build.json --noEmit
→ exit 0

Regression:
att-leave-type.service.spec + leave-requests.service.spec + attendance.controller.spec
→ 3 suites · 69 tests passed
```

**Jest coverage:** gold T6→T2=2 · FAIL calendar-4 contrast · Mon holiday · Sat–Sun zero+warn · half-day 0.5 · hour 1h · HOL-MISS · preview display-ready · ALIGN inflate reject · Nest `/core` lock constant.

---

## 4. must_keep / residual

| Class | Status |
|-------|--------|
| ATT-02 `ATT02QC1-MSLQZUK7` CFG≠DONE | **RETAIN** · ≠ reopen |
| PLT-01 `PLT01QC1-MSLPUQIU` | **RETAIN** |
| CORE-10/09/07 stamps · soft≠CORE-06 | **RETAIN** · printable **false** |
| Nest `/core` leave/holiday SoT | **ABSENT** (DENY invent) |
| ATT-09 hold / ATT-03b admin | **≠ DONE** this seat |
| expandLeaveDateRange / funnel | **RETAIN** · ≠ FR-08 DONE |
| Browser U65 J-HRM-ATT-08-01..06 | **QA next** (after FE-02 bind) |
| Honesty / C-SLICE | **false** — no flip |

---

## 5. Handoff

```yaml
work_item_id: PO-HRM-MVP-GD1-ATT-08-CLUSTER-BE-01
from_role: dev-be
to_role: pm
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-be-01.md
completion_report: |
  ADD residual F-ATT-LEAVE-01 POST /api/hrm/attendance/leave-requests/preview-deduction
  (BR-BP-LV-05 T6→T2 working_days=2 · HOL-MISS CHẶN · Q-LEAVE-UNIT · display-ready);
  thin holiday year set GET/PUT /attendance/holiday-calendars/:year;
  att_leave_type.unit day|hour; ALIGN create reject inflate + persist engine cols;
  RETAIN leave-requests*/balance/EFF/expand; Nest /core DENY; CFG≠ATT-02;
  ≠ client-days DONE · ≠ ATT-09/03b DONE · ≠ ATT UAT · PAY OUT; jest 12 PASS · tsc 0.
next_owner: pm → dev-fe (FE-02 bind) or qa when FE ready
next_dispatch_prompt: |
  work_item_id: PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-02
  role: dev-fe
  entry_criteria: BE-01 READY_FOR_QA @ docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-be-01.md · API-01 F.1 · U65 zero-seed · Nest /core DENY
  mission: Bind đơn nghỉ to POST /api/hrm/attendance/leave-requests/preview-deduction · show Ngày trừ quỹ vs calendar · HOL-MISS block submit CTA · unit day|hour · RETAIN EFF/balance chrome · DENY claim client-days=ATT-08 DONE · DENY claim ATT-09/03b DONE · DENY CFG=ATT-02 DONE
  exit_criteria: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-fe-02.md · then QA J-HRM-ATT-08-01..06
  cấm: Nest /core SoT · seed · invent PAY/printable · claim ATT UAT · reopen ATT-02/PLT/CORE seals
```

---

*End BE-01 · READY_FOR_QA · 2026-08-09*
