# PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-03 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-03` |
| **uc_ids** | `UC-BP-ATT-06` · `FR-UC-BP-ATT-06` · **BR-BP-LV-03** |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `attendance_uat_ready=false` · **C-SLICE** · **≠ ATT-06 / FR-06 DONE** |
| **qa_prior** | `docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-qa-01.md` stamp **ATT06QA1-MSM70OQ1** · **D-ATT-06-QA-OT-POST** · **D-ATT-06-QA-PANEL-FE** |

## Root cause (FE)

| Defect | Cause | Fix |
|--------|--------|-----|
| **D-ATT-06-QA-OT-POST** | Playwright often left `formData.overtimeDate` unset (Popover calendar); submit stayed **disabled** (`!overtimeDate` + `catalogEnsuring`). | Default **today** on dialog open; `otAddSubmitReady` gate without `catalogEnsuring`; `data-att-ot-submit-ready` + `att-ot-date-trigger` / `att-ot-employee-select`; QA runner uses `att-ot-add-submit`. |
| **D-ATT-06-QA-PANEL-FE** | `isOtCompLeaveTypeSelected` required effective row `category=ot_comp`; stale/partial catalog or key `ot_comp_leave` without row → panel false while MVP compensatory row still visible. | `isKnownOtCompLeaveTypeKey` + `nameVi` match «Nghỉ bù OT»; picker options `catalog-picker-option-{value}` scoped in QA script. |

## Files

- `apps/web/hrm/src/lib/attLeave06Ring.ts` (+ tests)
- `apps/web/hrm/src/components/attendance/OvertimeRequestTab.tsx`
- `apps/web/hrm/src/components/common/CatalogSearchPicker.tsx`
- `apps/web/hrm/src/lib/poHrmMvpGd1Att06ClusterFe03.source.test.ts`
- `scripts/qa/_tmp-po-hrm-mvp-gd1-att-06-cluster-qa-01.mjs` (harness align)

## Verification

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/attLeave06Ring.test.ts src/lib/poHrmMvpGd1Att06ClusterFe02.source.test.ts src/lib/poHrmMvpGd1Att06ClusterFe03.source.test.ts --no-cache
```

## QA retest (U65 · no seed)

Persona: `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · holding OU

| Journey | Expect |
|---------|--------|
| **J-HRM-ATT-06-02** | `att-ot-add-submit` `data-att-ot-submit-ready=true` after employee + reason → **POST** `overtime-requests` **2xx** |
| **J-HRM-ATT-06-05** | Chọn «Nghỉ bù OT» → **`att-06-form-panel` visible** (not only compensatory balance row) |
| **J-HRM-ATT-06-03..07** | Retest per QA-01 script after J-02/05 PASS |

## completion_report

**Closed:** P0 OT submit gate (default date, ready flag, Playwright testids); P0 panel gate (`ot_comp_leave` / nameVi); catalog picker option testids; QA harness scoped to `att-ot-add-submit` + picker options.

**Open:** Browser confirmation J-03..07; J-07 honesty read order (P2 qa); ≠ ATT-06 / FR-06 DONE.

**next_owner:** **qa**

**evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-fe-03.md`

**ack_status:** **READY_FOR_QA**

---

*End FE-03 · READY_FOR_QA · C-SLICE · ≠ ATT-06 DONE*
