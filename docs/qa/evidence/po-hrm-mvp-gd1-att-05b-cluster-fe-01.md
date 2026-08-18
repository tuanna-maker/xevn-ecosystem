# Evidence — PO-HRM-MVP-GD1-ATT-05B-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-05B-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` · **U89** Wave-33 seat **#38** |
| **date** | 2026-08-10 |
| **uc_ids** | `UC-BP-ATT-05b` · `FR-UC-BP-ATT-05b` · `BR-BP-LV-PANEL-01` · **J-HRM-ATT-05B-01..06** (DRAFT) |
| **depends_on** | BA-01 O1–O18 CONFIRM · SA Option A LOCKED · BE panel LIVE cite `po-hrm-att-03d-05b-be-01.md` |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **UPGRADE** · preserve_default · CODE-MEMORY **APPEND** |
| **honesty** | `attendance_uat_ready=false` · **≠ ATT-05b / FR-05b DONE** · **≠ ATT-05/04/04b DONE** · **≠ ATT UAT** · **R-ATT-05B-≠-API-DONE** · printable false · PAY OUT · DENY `att_leave_hold` · DENY merge carry→annual · Nest `/core` DENY · C-SLICE · U65 |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-05b · Diễn biến #0a–#2 · Luồng 1–4 · BR-BP-LV-PANEL-01
- ba: docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-BA-01.md §7.1 O1–O18
- sa: docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-SA-01.md Option A
- api (RETAIN cite): GET …/leave-balance/panel · GET …/leave-balance?leave_type= · GET …/leave-types/effective · POST …/preview-deduction · POST …/leave-requests
- must_keep: ATT05QC1-MSM52GWC1 · ATT04BQC1-MSM3S8QC1 · ATT04QC1-MSM22G4W · ATT09QC1-MSLUTL9D · ATT03DQC1-MSM1CR19
- sponsor_confirm: BA PASS_TO_PM · unlock R-ATT-05B-PANEL-FE
```

---

## 2. Closed scope (R-ATT-05B-*)

| Residual | Status |
|----------|--------|
| **R-ATT-05B-PANEL-FE** — panel on create form · open/type refetch | **PASS** |
| **R-ATT-05B-PICKER** — EFF catalog `CatalogSearchPicker` | **PASS** (RETAIN) |
| **R-ATT-05B-EMPTY** — honest empty + hint SRS #0b | **PASS** `att-05b-empty-catalog` |
| **R-ATT-05B-HOLD-UI** — post-submit invalidate panel + explicit refetch | **PASS** (peer ATT-09 hook + LeaveTab refetch) |
| **R-ATT-05B-PREVIEW** — `AttLeavePreviewDeductionPanel` on create | **PASS** (RETAIN ATT-08) |
| **R-ATT-05B-OVERLAP** — `att-09-type-block` banner | **PASS** (RETAIN FE-02) |
| **R-ATT-05B-ADV-HINT** — footer when requested > available | **PASS** `att-05b-adv-hint` |
| **carry_over** separate bucket (ATT05QC1) | **PASS** row + `att-05-ledger-sep` |
| **pending_days** hold display (ATT09QC1) | **PASS** held column = pending |
| Nest `/core` SoT on leave paths | **PASS** (source lock) |

### Files touched

- `apps/web/hrm/src/lib/attLeave05bRing.ts` (+ test) — path lock · honesty · empty · advance hint
- `apps/web/hrm/src/lib/poHrmMvpGd1Att05bClusterFe01.source.test.ts`
- `apps/web/hrm/src/components/attendance/LeaveTab.tsx` — create form wire · refetch · testids · CODE-MEMORY APPEND

### Network assert path (QA U65)

```text
1) Chấm công → Nghỉ phép → Tạo yêu cầu
   → Chọn NV → att-05b-form-panel visible
   → GET /api/hrm/attendance/leave-balance/panel 2xx (5 buckets incl. carry_over)
   → Đổi loại phép → refetch panel / by-type
   → Nhập ngày → POST …/preview-deduction (peer ATT-08)
2) Gửi đơn 2xx → panel pending↑ (invalidate + refetch) → F5 persisted
3) Catalog trống → att-05b-empty-catalog (không fake option)
4) Overlap → att-09-type-block banner
5) Vượt quỹ → att-05b-adv-hint footer (≠ ATT-04b DONE)
6) honesty att-05b-honesty · seals ATT05/04/04b/09 · Nest /core = 0
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/attLeave05bRing.test.ts \
  src/lib/poHrmMvpGd1Att05bClusterFe01.source.test.ts

pnpm --dir apps/web/hrm run build
```

| Command | Result |
|---------|--------|
| vitest (05b ring + source lock) | **7 PASS** |
| `pnpm run build` (hrm-fe) | **exit 0** |

---

## 4. Residual (not promoted)

| Item | Owner |
|------|--------|
| J-HRM-ATT-05B-01..06 browser matrix U65 | **qa** `PO-HRM-MVP-GD1-ATT-05B-CLUSTER-QA-01` |
| FY/DEDUCT footers HOLD (R-ATT-05-FY · R-ATT-05-DEDUCT) | peer ATT-05 · non-blocking |
| **≠ ATT-05b / ATT-05 / ATT UAT DONE** | honesty retained |

---

## 5. Handoff

| Field | Value |
|-------|--------|
| **next_owner** | **qa** |
| **pm_dispatch_hint** | `PO-HRM-MVP-GD1-ATT-05B-CLUSTER-QA-01` · J-HRM-ATT-05B-01..06 · U65 |
| **ack_status** | **READY_FOR_QA** |
