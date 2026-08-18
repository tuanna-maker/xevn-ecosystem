# PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-02 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-02` |
| **uc_ids** | `UC-BP-ATT-06` · `FR-UC-BP-ATT-06` · **BR-BP-LV-03** |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `attendance_uat_ready=false` · **C-SLICE** · **≠ ATT-06 / FR-06 DONE** |
| **qa_prior** | `docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-qa-01.md` stamp **ATT06QA1-MSM6Q04X** · defects **D-ATT-06-QA-OT-POST** · **D-ATT-06-QA-CATALOG** |

## spec_read_ack

- **srs:** `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` · **FR-UC-BP-ATT-06** · Diễn biến **#1–#2**
- **ba:** `docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-BA-01.md` · **J-HRM-ATT-06-02..05**
- **qa:** `docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-qa-01.md`
- **change_mode:** FIX (catalog prerequisites · scope parity · policy maps)
- **must_keep:** **ATT05BQC1** · **ATT09** · `attLeave06Ring` · DENY merge compensatory→annual

## Closed (FE-02)

| Defect | Fix |
|--------|-----|
| **D-ATT-06-QA-OT-POST** | `OvertimeRequestTab`: on add dialog open → Nest `upsertAttOtCompType` `compensatory_leave` when EFF lacks accrual-mappable code; prefer `pickPreferredOtCompTypeCode`; submit gate includes employee/date/reason; `data-testid="att-ot-add-submit"`; OU `listCompanyId` on effective hooks + `useOvertimeRequests` POST scope |
| **D-ATT-06-QA-CATALOG** | `AttOtCompLeavePolicySettingsPanel` save → `ensureAtt06CatalogPrereqs` + `maps_comp_codes` when EFF has no default accrual codes; `LeaveTab` create open → `ensureAtt06OtCompLeaveType` (`ot_comp_leave` / category `ot_comp`) |
| Scope | `useAttOtTypesEffective` · `useAttOtCompTypesEffective` align `listCompanyId` with leave effective hook |

## Files

- `apps/web/hrm/src/lib/att06CatalogEnsure.ts` (+ test)
- `apps/web/hrm/src/lib/attLeave06Ring.ts` (+ test)
- `apps/web/hrm/src/lib/poHrmMvpGd1Att06ClusterFe02.source.test.ts`
- `apps/web/hrm/src/components/attendance/OvertimeRequestTab.tsx`
- `apps/web/hrm/src/components/attendance/LeaveTab.tsx`
- `apps/web/hrm/src/components/settings/AttOtCompLeavePolicySettingsPanel.tsx`
- `apps/web/hrm/src/hooks/useAttOtCompTypesEffective.ts`
- `apps/web/hrm/src/hooks/useAttOtTypesEffective.ts`
- `apps/web/hrm/src/hooks/useOvertimeRequests.ts`

## Verification

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/attLeave06Ring.test.ts src/lib/att06CatalogEnsure.test.ts src/lib/poHrmMvpGd1Att06ClusterFe01.source.test.ts src/lib/poHrmMvpGd1Att06ClusterFe02.source.test.ts --no-cache
```

Result: **18 passed** (2026-08-10).

## QA retest (U65 · no seed)

Persona: `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · holding OU

| Journey | Expect |
|---------|--------|
| **J-HRM-ATT-06-01** | Policy Lưu still PUT/GET 200; now also ensures catalog + optional `maps_comp_codes` |
| **J-HRM-ATT-06-02** | Tăng ca → Thêm → POST `overtime-requests` **2xx** · `compensation_type=compensatory_leave` (or mapped EFF) |
| **J-HRM-ATT-06-03..04** | Approve OT → accrual toast · panel `entitled` ↑ |
| **J-HRM-ATT-06-05** | Nghỉ phép → Tạo → chọn «Nghỉ bù OT» → `att-06-form-panel` **visible** |
| **J-HRM-ATT-06-06..07** | Retest per QA-01 script |

## completion_report

**Closed:** P0 OT POST path (ensure `compensatory_leave` EFF + picker/submit); P0 catalog (`ot_comp` leave type + policy maps); OU scope parity on OT effective/create; vitest/source lock 18 tests PASS.

**Open:** J-07 seals read-after-navigate (P2 qa); full J-03..07 browser confirmation; ≠ ATT-06 / FR-06 DONE.

**next_owner:** **qa**

**next_dispatch_prompt:** See below.

**evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-fe-02.md`

---

*End FE-02 · READY_FOR_QA · C-SLICE · ≠ ATT-06 DONE*
