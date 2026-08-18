# Evidence — PO-HRM-MVP-GD1-ATT-05B-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-05B-CLUSTER-QA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` · U89 Wave-33 seat **#38** |
| **lane** | execution · **qa** |
| **date** | 2026-08-10 |
| **stamp** | **`ATT05BQA1-MSM5SD3P`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (C-SLICE · **≠** ATT-05b / FR-05b DONE · **≠** ATT-05 / ATT UAT · PAY OUT) |
| **uc_ids** | `UC-BP-ATT-05b` · `FR-UC-BP-ATT-05b` · `BR-BP-LV-PANEL-01` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · OU **holding** |
| **FE handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-att-05b-cluster-fe-01.md` |
| **BA** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-BA-01.md` |
| **Honesty** | `attendance_uat_ready=false` · **≠ ATT-05b / FR-05b DONE** · **≠ ATT-05 / ATT UAT** · C-SLICE · U65 zero-seed · printable false · PAY OUT · DENY merge carry→annual · DENY `att_leave_hold` · Nest `/core` DENY |
| **must_keep** | `ATT05QC1-MSM52GWC1` · `ATT04QC1-MSM22G4W` · `ATT04BQC1-MSM3S8QC1` · `ATT09QC1-MSLUTL9D` · `ATT03DQC1-MSM1CR19` |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-att-05b-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-05b-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-05b-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · C-SLICE · DENY ATT-05b / ATT UAT DONE |
| **L0** | `qc:dev-stack` hrm/xbos/portal **200** · `qc:fe-be-health` **ALL PASS** |
| **Nest `/core` leave SoT** | probes **404** · runtime non-404 **0** |
| **L2.5 J-HRM-ATT-05B-*** | J-01..04 **PASS** · J-05/06 **PASS_WITH_HOLD** |
| **Seed** | **none** (U65) · product **PUT** `tracked-entitlement` only |

**Explicit:** ≠ ATT-05b module DONE · ≠ FR-05b DONE · ≠ ATT-05 DONE · ≠ ATT UAT · panel API alone ≠ FR-05b DONE.

---

## L0

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | hrm **200** · xbos **200** · portal **200** |
| `pnpm run qc:fe-be-health` | **exit 0** ALL PASS |

---

## Browser U65 — J-HRM-ATT-05B-01..06 (đơn nghỉ)

| J-* | Click path | Network / FE | Verdict |
|-----|------------|--------------|---------|
| **J-HRM-ATT-05B-01** | Chấm công → **Nghỉ phép** → **Tạo đơn** → chọn NV → `att-05b-form-panel` on form → **F5** | `GET …/leave-balance/panel` **2xx** (×33 slice) · Nest **0** | **PASS** |
| **J-HRM-ATT-05B-02** | Form panel → row `carry_over` «Phép chuyển kỳ» tách `annual` | `leave-balance-row-carry_over` · **ATT05QC1** | **PASS** |
| **J-HRM-ATT-05B-03** | `catalog-search-picker` EFF → đổi loại refetch → nhập ngày | `POST …/preview-deduction` **201** · refetch panel **2xx** | **PASS** |
| **J-HRM-ATT-05B-04** | Gửi đơn tracked **annual** · khoảng 24–25/12/2026 | **POST** `leave-requests` **201** · API `pending` **3→5** · **F5** persisted · held UI **3** · ≠ `att_leave_hold` | **PASS** |
| **J-HRM-ATT-05B-05** | Mở form khi catalog có loại hiệu lực | Picker visible · **PASS_WITH_HOLD** (tenant có EFF — không empty #0b) | **PASS_WITH_HOLD** |
| **J-HRM-ATT-05B-06** | `att-05b-honesty` · overlap cùng ngày → **409** + `att-09-type-block` · FY/DEDUCT footer HOLD | overlap **409** · seals **ATT05QC1** + **ATT09QC1** on tab · must_keep in evidence | **PASS_WITH_HOLD** |

**hdsd_align:** `att-05b-form-panel` · `leave-balance-row-carry_over` · `catalog-search-picker` · `preview-deduction` · `att-05b-adv-hint` (not triggered this slice) · `att-09-type-block` · `att-05b-honesty`.

---

## Network summary

| Metric | Value |
|--------|--------|
| Attendance mutations (slice) | **PUT** tracked-entitlement + **POST** leave-requests + preview |
| Nest `/core` leave non-404 | **0** |
| Seed | **none** |

---

## Residuals (not promoted)

| ID | Note |
|----|------|
| **J-05B-05** | Catalog populated — empty #0b **conditional** HOLD |
| **R-ATT-05-FY / R-ATT-05-DEDUCT** | Footer HOLD on tab (peer ATT-05) |
| **R-ATT-05B-ADV-HINT** | Not triggered (available > requested) |
| **≠ ATT-05b / ATT-05 / ATT UAT DONE** | honesty retained |

---

## QC dispatch (next)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-05B-CLUSTER-QC-01
role: qc
entry_criteria: QA PASS_TO_PM @ docs/qa/evidence/po-hrm-mvp-gd1-att-05b-cluster-qa-01.md stamp ATT05BQA1-MSM5SD3P · J-05B-01..04 PASS · J-05B-05/06 HOLD · L0 PASS · U65
exit_criteria: GWC C-SLICE · ≠ ATT-05b/FR-05b/ATT-05/ATT UAT DONE · must_keep ATT05QC1 · ATT04QC1 · ATT04BQC1 · ATT09 · ATT03D · GO or GWC
```

---

## completion_report

**Closed:** U65 browser J-HRM-ATT-05B-01..04 PASS; J-05B-05/06 PASS_WITH_HOLD; L0 PASS; Nest `/core` 0; attendance-only mutations; stamp **ATT05BQA1-MSM5SD3P**.

**Residual:** FY/DEDUCT peer footers; conditional empty catalog; ≠ module UAT.

**next_owner:** **qc**

**next_dispatch_prompt:** See QC block above (`PO-HRM-MVP-GD1-ATT-05B-CLUSTER-QC-01`).

**evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-att-05b-cluster-qa-01.md`

**ack_status:** **PASS_TO_PM**
