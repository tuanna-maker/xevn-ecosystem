# Evidence — PO-HRM-MVP-GD1-ATT-04-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-04-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-33 seat **#35** |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-ATT-04` · `FR-UC-BP-ATT-04` · `J-HRM-ATT-04-01..06` DRAFT |
| **depends_on** | API-01 CONFIRMED RETAIN · BA O1–O12 · must_keep ATT03DQC1-MSM1CR19 · ATT09QC1-MSLUTL9D · ATT peers |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **ADD/UPGRADE** narrow · preserve_default · CODE-MEMORY **APPEND** |
| **honesty** | `attendance_uat_ready=false` · **≠ ATT-04 DONE** · **≠ ATT module UAT** · L1/LVRULE/grant alone ≠ FR-04 DONE · FY HOLD · ENGINE HOLD · printable false · PAY OUT · Nest `/core` DENY · C-SLICE · U65 |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-04 Diễn biến #0a · #1 · #2 · BR-BP-LV-01 · BR-BP-LV-TYPE-01
- tech_spec / api: docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-API-01.md
  F-ATT-CAT-LVT-01/02 · F-ATT-CAT-EFF-01 · F-ATT-LVRULE-01..04 · GET panel · PUT tracked-entitlement RETAIN
- data: docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-DATA-01.md §6 HOLD cite att_leave_type · att_leave_accrual_policy · employee_leave_balances
- ba: docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01.md J-HRM-ATT-04-01..06 · R-ATT-04-POLICY-ADM
- sa: docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md Option A LOCKED · physical /attendance/*
- must_keep: ATT03DQC1-MSM1CR19 GPS · ATT09QC1-MSLUTL9D pending_days · DENY att_leave_hold · ATT11/10/09/08/02/PLT/CORE seals · Nest /core DENY · R-ATT-04-FY · R-ATT-04-ENGINE HOLD
- sponsor_confirm: API-01 CONFIRMED RETAIN · Dev-BE HOLD · prefer FE+QA
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Settings Loại phép → LIVE `leave-types*` + effective (RETAIN/UPGRADE CODE-MEMORY) | **PASS** |
| R-ATT-04-POLICY-ADM — admin `leave-accrual-policies*` CRUD UI | **PASS** |
| HR grant — `PUT leave-balance/tracked-entitlement` + panel invalidation | **PASS** |
| `attLeave04Ring` path/honesty · vitest source lock | **PASS** |
| Nest `/core` = 0 · DENY `att_leave_hold` invent | **PASS** |
| FY footer HOLD · ENGINE HOLD · ≠ ATT-04/UAT DONE | **PASS** |
| `pnpm --dir apps/web/hrm run build` | **PASS** |
| vitest 2 files | **8 PASS** |

### Files touched

- `apps/web/hrm/src/lib/attLeave04Ring.ts` (+ `attLeave04Ring.test.ts`)
- `apps/web/hrm/src/lib/poHrmMvpGd1Att04ClusterFe01.source.test.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts` — LVRULE list/create/patch/retire · `putTrackedLeaveEntitlement`
- `apps/web/hrm/src/components/settings/AttLeaveTypeSettingsPanel.tsx` — CODE-MEMORY APPEND ATT-04
- `apps/web/hrm/src/components/settings/AttLeaveAccrualPolicySettingsPanel.tsx` — **new**
- `apps/web/hrm/src/components/attendance/AttLeaveTrackedEntitlementGrantPanel.tsx` — **new**
- `apps/web/hrm/src/components/attendance/LeaveTab.tsx` — grant panel + panel refetch
- `apps/web/hrm/src/pages/Attendance.tsx` — mount LVRULE admin under leave-rules

### Network assert path (QA U65)

```text
1) Chấm công → Cài đặt → Quy tắc nghỉ phép
   → Loại phép: GET/PUT /api/hrm/attendance/leave-types* · effective consumer unchanged
   → Quy tắc quỹ: GET/POST /api/hrm/attendance/leave-accrual-policies · retire POST …/:id/retire
   → Footer att-04-honesty · FY/ENGINE HOLD · Nest /core = 0
2) Nghỉ phép → chọn NV → panel GET …/leave-balance/panel
   → HR: PUT …/leave-balance/tracked-entitlement **2xx** → panel entitled cập nhật · F5
   → held = pending_days (peer ATT-09) · no seed
3) Network: 0 Nest /core/* as leave LVT/LVRULE/grant SoT
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/attLeave04Ring.test.ts \
  src/lib/poHrmMvpGd1Att04ClusterFe01.source.test.ts
# → exit 0 · 2 files · 8 tests PASS

pnpm --dir apps/web/hrm run build
# → exit 0
```

---

## 4. U65 browser plan (QA-01)

**work_item:** `PO-HRM-MVP-GD1-ATT-04-CLUSTER-QA-01` · **J-HRM-ATT-04-01..06** narrow

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-ATT-04-01** | leave-rules → Loại phép → tạo mã N+1 → Lưu → F5 | AC-ATT-04-SOT-LVT · #0a · 2xx · Nest `/core` 0 |
| **J-HRM-ATT-04-02** | leave-rules → Quy tắc quỹ → tạo policy gắn EFF type → F5 | AC-ATT-04-SOT-LVRULE · #1 partial · ≠ ENGINE LIVE |
| **J-HRM-ATT-04-03** | Nghỉ phép → NV → Lưu entitled → F5 panel | AC-ATT-04-GRANT · PUT tracked-entitlement · ≠ seed |
| **J-HRM-ATT-04-04** | Panel 5 MVP labels · zeros OK | AC-ATT-04-PANEL · peer 05b |
| **J-HRM-ATT-04-05** | EFF picker on create · CTA admin when empty | AC-ATT-04-CNS/EFF |
| **J-HRM-ATT-04-06** | F5 + honesty footer seals | ≠ ATT-04 DONE · ≠ ATT UAT |

---

## 5. Residual (not promoted)

| ID | Note |
|----|------|
| **R-ATT-04-FY** | FY start-month CRUD — HOLD (footer only) |
| **R-ATT-04-ENGINE** | F-ATT-LEAVE-04 accrue job — HOLD |
| **ATT module UAT** | `attendance_uat_ready=false` |

---

## completion_report

Wired ATT-04 cluster FE: RETAIN live Loại phép (`leave-types*`), new Quy tắc quỹ admin (`leave-accrual-policies*`), HR `PUT tracked-entitlement` with panel refetch, `attLeave04Ring` + 8 vitest PASS, build PASS. Does not claim ATT-04 or ATT UAT DONE.

## next_owner

**qa**

## next_dispatch_prompt

```
work_item_id: PO-HRM-MVP-GD1-ATT-04-CLUSTER-QA-01
role: qa
entry_criteria: Dev FE-01 READY_FOR_QA @ docs/qa/evidence/po-hrm-mvp-gd1-att-04-cluster-fe-01.md · L0 stack · browser-only U65
exit_criteria: J-HRM-ATT-04-01..06 evidence blocks · Network /api/hrm/attendance/leave-types* + leave-accrual-policies* + PUT tracked-entitlement · Nest /core=0 · no seed · honesty ≠ ATT-04 DONE
read_first: docs/qa/evidence/po-hrm-mvp-gd1-att-04-cluster-fe-01.md · PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01.md J-* · USER_FLOW U65
persona: ceo@xe.vn / Xevn@2026
ack_status target: PASS_TO_PM or FAIL with defect paths
```
