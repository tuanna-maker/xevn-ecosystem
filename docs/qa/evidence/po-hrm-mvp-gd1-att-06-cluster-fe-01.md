# PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-01 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-01` |
| **uc_ids** | `UC-BP-ATT-06` · `FR-UC-BP-ATT-06` · **BR-BP-LV-03** |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `attendance_uat_ready=false` · **C-SLICE** · **≠ ATT-06 / FR-06 DONE** |

## spec_read_ack

- **srs:** `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` · **FR-UC-BP-ATT-06** · Diễn biến **#1** (duyệt OT → cộng quỹ) · **#2** (đơn nghỉ bù / panel)
- **tech_spec / API:** `docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-API-01.md` §4.1 panel · §4.5 OT create · §4.7 EFF · §4.8 policy
- **ba:** `docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-BA-01.md` · **J-HRM-ATT-06-02** · **J-HRM-ATT-06-05**
- **be_evidence:** `docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-be-01.md`
- **change_mode:** ADD (policy panel · type-map panel · approve invalidate)
- **must_keep:** **ATT05BQC1** annual/comp panel · **ATT09** `pending_days` · **DENY** merge compensatory→annual · physical `/api/hrm/attendance/*`

## Closed (FE)

| Item | Implementation |
|------|----------------|
| OT create `compensation_type` | **RETAIN** `OvertimeRequestTab` + `useAttOtCompTypesEffective` → `GET ot-comp-types/effective` |
| Comp leave form panel | `LeaveTab` · `resolveLeaveBalanceBucketForLeaveType` · `att-06-form-panel` · row `leave-balance-row-compensatory` · «Phép bù OT» |
| Policy admin | `AttOtCompLeavePolicySettingsPanel` · `GET/PUT ot-comp-leave-policy` · sidebar `ot-comp-leave-policy` |
| Approve → panel refresh | `useOvertimeRequests.approveRequest` → `invalidateQueries(LEAVE_BALANCE_PANEL_QUERY_KEY)` + accrual toast |
| Path lock | `attLeave06Ring.ts` · no Nest `/core` |

## Files touched

- `apps/web/hrm/src/lib/attLeave06Ring.ts` (+ test)
- `apps/web/hrm/src/lib/poHrmMvpGd1Att06ClusterFe01.source.test.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts` (@CODE-MEMORY-CHANGE policy client + accrual type)
- `apps/web/hrm/src/hooks/useOvertimeRequests.ts` (@CODE-MEMORY-CHANGE APPEND)
- `apps/web/hrm/src/components/attendance/LeaveTab.tsx` (@CODE-MEMORY-CHANGE APPEND)
- `apps/web/hrm/src/components/settings/AttOtCompLeavePolicySettingsPanel.tsx`
- `apps/web/hrm/src/pages/Attendance.tsx`

## Verification

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/attLeave06Ring.test.ts src/lib/poHrmMvpGd1Att06ClusterFe01.source.test.ts --no-cache
pnpm exec vitest run src/hooks/useAttOtCompTypesEffective.test.ts --no-cache
```

## QA entry (U65 · no seed)

- Persona: `ceo@xe.vn` / `Xevn@2026`
- **J-HRM-ATT-06-01:** Chấm công → Cài đặt → Chế độ phép bù OT → bật + ratio → Lưu → GET reflects
- **J-HRM-ATT-06-02:** Đơn từ → Tăng ca → tạo OT · `compensation_type` từ EFF catalog
- **J-HRM-ATT-06-05:** Nghỉ phép → tạo đơn loại `ot_comp` → panel hiện «Phép bù OT» row · không gộp annual
- **J-HRM-ATT-06-03/04:** Duyệt OT `compensatory_leave` → toast credited_days → F5 leave panel `entitled` ↑ compensatory only once
- **J-HRM-ATT-06-07:** Policy OFF → approve OT → no accrual toast · no entitled Δ

## next_dispatch_prompt (QA-01)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-06-CLUSTER-QA-01
role: qa
entry_criteria: FE-01 READY_FOR_QA @ docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-fe-01.md · BE-01 READY · L0 · U65 zero-seed
mission: Browser J-HRM-ATT-06-01..07 — policy PUT/GET · OT EFF picker · comp leave att-06-form-panel · approve accrual F5 panel · Network /attendance/* only · seals ATT05BQC1/ATT09 RETAIN · ≠ FR-06 DONE
exit_criteria: evidence docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-qa-01.md · FE sau 2xx + F5 per J-* · PASS_TO_PM or FAIL
cấm: pnpm seed:* · Nest /core SoT · claim ATT-06 DONE
```

---

*End FE-01 · READY_FOR_QA · 2026-08-10 · ≠ ATT-06 DONE · C-SLICE*
