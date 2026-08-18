# Evidence — PO-HRM-MVP-GD1-ATT-12-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-12-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` · U89 Wave-36 |
| **date** | 2026-08-10 |
| **uc_ids** | `UC-BP-ATT-12` · `FR-UC-BP-ATT-12` · `J-HRM-ATT-12-05` |
| **depends_on** | BE-01 READY @ `docs/qa/evidence/po-hrm-mvp-gd1-att-12-cluster-be-01.md` · API-01 §4.3 · BA AC-ATT-12-FE-CONFIRM |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD · preserve_default · CODE-MEMORY APPEND |
| **honesty** | `attendance_uat_ready=false` · **≠ ATT-12 / FR-12 DONE** · **C-SLICE** · U65 zero-seed |

---

## 1. spec_read_ack

```markdown
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-12 Luồng #4 · BR-BP-LC-03
- api: PO-HRM-MVP-GD1-ATT-12-CLUSTER-API-01.md §4.3 GET leave-balance/panel · §4.8 shift activate_default read
- be: po-hrm-mvp-gd1-att-12-cluster-be-01.md consumer + enroll LIVE
- ba: PO-HRM-MVP-GD1-ATT-12-CLUSTER-BA-01.md J-HRM-ATT-12-05
- must_keep: ATT07QC1 · ATT06QC1 · ATT05QC1 · ATT09QC1 · CORE07QC1 · DENY merge buckets · DENY reopen J-07/J-06-04
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| HCNS profile read-only strip quỹ (5 MVP buckets via GET panel) | **PASS** |
| Ca mặc định `activate_default` via GET shift-assignments/activate-default | **PASS** |
| After activate → invalidate panel + shift (FE-after-2xx) | **PASS** |
| F5 parity hooks (react-query keys) | **PASS** |
| DENY merge compensatory/carry/sick→annual UI | **PASS** |
| Honesty footer ≠ ATT-12 DONE | **PASS** |
| Nest `/core` = 0 on attendance paths | **PASS** |
| vitest | **2 files · 9 PASS** |

### Files touched

- `apps/web/hrm/src/lib/attLeave12Ring.ts` (+ test)
- `apps/web/hrm/src/lib/poHrmMvpGd1Att12ClusterFe01.source.test.ts`
- `apps/web/hrm/src/components/employee/EmployeeActivateEnrollConfirmStrip.tsx`
- `apps/web/hrm/src/components/employee/EmployeeActivatePanel.tsx`
- `apps/web/hrm/src/hooks/useActivateDefaultShift.ts`
- `apps/web/hrm/src/hooks/useEmployeeActivate.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts`
- `apps/web/hrm/src/pages/EmployeeProfile.tsx` (CODE-MEMORY)
- `apps/api/hrm-api/src/attendance/att-activate-enroll.service.ts` (GET read peer for FE strip)
- `apps/api/hrm-api/src/attendance/attendance.controller.ts`
- `apps/api/hrm-api/src/attendance/dto/get-activate-default-shift.query.dto.ts`

### Network assert path (QA U65)

```text
1) Login ceo@xe.vn → Hồ sơ NV đang Hoạt động (hoặc activate từ Chờ hoàn thiện)
2) Sidebar: thẻ «Quỹ phép & ca mặc định»
   → GET /api/hrm/attendance/leave-balance/panel?employee_id=…&company_id=main
   → GET /api/hrm/attendance/shift-assignments/activate-default?…
3) Bảng 5 dòng: annual · seniority · compensatory · carry_over · advance (tách bucket)
4) Ca mặc định: tên/mã ca + hiệu lực dd/MM/yyyy
5) F5 → cùng số quỹ + ca · không Nest /core
6) Regression: J-HRM-ATT-06-04 compensatory row · J-HRM-ATT-07-03..05 sick panel không merge annual
7) Footer: ≠ ATT-12 DONE · C-SLICE
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/attLeave12Ring.test.ts \
  src/lib/poHrmMvpGd1Att12ClusterFe01.source.test.ts
# → 9 passed

pnpm --dir apps/api/hrm-api exec jest \
  src/attendance/po-hrm-mvp-gd1-att-12-cluster-be-01.spec.ts
# → 5 passed
```

---

## 4. Residual

- QC GWC C-SLICE · full R-ATT-01-ASSIGN grid OPEN
- F-ATT-LEAVE-04 periodic HOLD
- Half-month branch evidence on end-of-month activate (QA J-03)

---

## completion_report

ATT-12 FE strip LIVE: profile bind GET `leave-balance/panel` (5 buckets, no merge) + GET `shift-assignments/activate-default`; invalidate caches after activate; honesty ≠ FR-12 DONE. Minimal BE GET added for shift display-ready read.

## next_owner

**qa** — `QA-PO-HRM-MVP-GD1-ATT-12-CLUSTER-01`

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-MVP-GD1-ATT-12-CLUSTER-01
role: qa
entry_criteria: FE-01 READY_FOR_QA @ docs/qa/evidence/po-hrm-mvp-gd1-att-12-cluster-fe-01.md · BE-01 READY · L0 stack up · browser-only U65
exit_criteria:
  J-HRM-ATT-12-05: ceo@xe.vn → /employees/:id → Hoạt động → strip quỹ+ca · Network panel+activate-default 2xx · F5 parity
  J-HRM-ATT-12-01..04 smoke after activate path
  Regression J-HRM-ATT-06-04 · J-HRM-ATT-07-03..05 (no merge buckets · no reopen J-07-01..07)
  Evidence block per UF · matrix update · ack_status PASS_TO_PM
cấm: seed · claim ATT-12 DONE · probe-only PASS
```
