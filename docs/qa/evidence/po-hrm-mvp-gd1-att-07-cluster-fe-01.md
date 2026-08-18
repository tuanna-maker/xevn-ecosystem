# Evidence — PO-HRM-MVP-GD1-ATT-07-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-07-CLUSTER-FE-01` |
| **role** | dev-fe |
| **date** | 2026-08-10 |
| **depends_on** | `docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-be-01.md` READY_FOR_QA |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `attendance_uat_ready=false` · **C-SLICE** · ≠ ATT-07 / FR-07 DONE · ≠ ATT UAT |

## spec_read_ack

- **srs:** `SRS_HRM_ENTERPRISE.md` FR-UC-BP-ATT-07 Diễn biến #1–#2 · BR-BP-LV-04 · DV-16
- **api:** `docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-API-01.md` §4.1–§4.4 · §4.7
- **be:** `docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-be-01.md`
- **must_keep:** ATT06QC1-MSM84GWC1 · ATT05BQC1-MSM5SDQC1 · ATT09QC1 · DENY merge compensatory/sick/carry→annual · U65 zero-seed

## Closed (FE)

| Item | J-* | Status |
|------|-----|--------|
| Sick picker cờ BH/CTY từ EFF | J-HRM-ATT-07-01 | PASS |
| Submit ốm + attach UX (`att-07-sick-attach`) | J-HRM-ATT-07-02 | PASS |
| Toast `dayBranches[]` sau POST 201 | J-HRM-ATT-07-03/04 | PASS |
| GET/PUT `sick-leave-fund-order` + `isProgramDefault` label | J-HRM-ATT-07-05 | PASS |
| Panel RETAIN 5 MVP — no sick bucket | J-HRM-ATT-07-06 | PASS |

## Files touched

- `apps/web/hrm/src/lib/attLeave07Ring.ts` (+ test)
- `apps/web/hrm/src/lib/poHrmMvpGd1Att07ClusterFe01.source.test.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts` — get/put sick-leave-fund-order · `dayBranches` on `HrmLeaveRequest`
- `apps/web/hrm/src/components/settings/AttSickLeaveFundOrderSettingsPanel.tsx`
- `apps/web/hrm/src/components/attendance/LeaveTab.tsx`
- `apps/web/hrm/src/hooks/useLeaveRequests.ts`
- `apps/web/hrm/src/pages/Attendance.tsx`

## Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/attLeave07Ring.test.ts \
  src/lib/poHrmMvpGd1Att07ClusterFe01.source.test.ts \
  src/lib/poHrmMvpGd1Att06ClusterFe01.source.test.ts \
  src/hooks/useLeaveRequests.test.ts
# → 28 PASS
```

## Network assert path (QA U65)

1. **J-07-01** Chấm công → Nghỉ phép → Tạo đơn → chọn loại ốm → `GET …/leave-types/effective` → badges `att-07-flag-bh` / `att-07-flag-cty` khớp EFF.
2. **J-07-02** ốm ≥3 ngày: `att-07-sick-attach` · upload → `POST …/files` · submit thiếu attach → block/toast VAL-ATT.
3. **J-07-03/04** Submit ốm 2xx → toast có «Phân nhánh ngày ốm» khi response `dayBranches[]`.
4. **J-07-05** Cài đặt ATT → «Thứ tự quỹ nghỉ ốm» → GET/PUT `…/sick-leave-fund-order` · badge program default khi chưa PUT.
5. **J-07-06** Form panel chỉ 5 bucket MVP (`leave-balance-row-*`) — không quỹ sick.
6. **J-HRM-ATT-06-04** regression: compensatory row tách annual — `poHrmMvpGd1Att06ClusterFe01` PASS.

## Residual (not FE-01)

- **R-ATT-07-SHEET-CODE** / **R-ATT-07-AGG** HOLD footers (BE/ATT-10)
- **qa** browser U65 full J-HRM-ATT-07-01..07

## next_owner

**qa** — `QA-PO-HRM-MVP-GD1-ATT-07-CLUSTER-01`
