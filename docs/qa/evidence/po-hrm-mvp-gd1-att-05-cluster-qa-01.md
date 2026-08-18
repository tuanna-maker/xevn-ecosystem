# Evidence — PO-HRM-MVP-GD1-ATT-05-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-05-CLUSTER-QA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` · U89 Wave-33 seat **#37** |
| **lane** | execution · **qa** |
| **date** | 2026-08-10 |
| **stamp** | **`ATT05QA1-MSM52CT7`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (C-SLICE · **≠** ATT-05 / FR-05 DONE · **≠** ATT UAT · PAY OUT) |
| **uc_ids** | `UC-BP-ATT-05` · `FR-UC-BP-ATT-05` · `BR-BP-LV-02` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · OU filter **holding** |
| **FE handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-att-05-cluster-fe-01.md` |
| **Honesty** | `attendance_uat_ready=false` · **≠ ATT-05 / FR-05 DONE** · **≠ ATT-04/04b DONE** · **≠ ATT UAT** · C-SLICE · U65 zero-seed · printable false · PAY OUT · DENY merge carry→annual · DENY `att_leave_hold` · Nest `/core` DENY |
| **must_keep** | `ATT04QC1-MSM22G4W` · `ATT04BQC1-MSM3S8QC1` · `ATT09QC1-MSLUTL9D` · `ATT03DQC1-MSM1CR19` |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-att-05-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-05-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-05-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · C-SLICE · DENY ATT-05 / ATT UAT DONE |
| **L0** | `qc:dev-stack` hrm/xbos/portal **200** · `qc:fe-be-health` **ALL PASS** |
| **Nest `/core` leave SoT** | probes **404** · runtime non-404 **0** |
| **L2.5 J-HRM-ATT-05-*** | J-01..04 **PASS** · J-05/06 **PASS_WITH_HOLD** |
| **Seed** | **none** (U65) |

**Explicit:** ≠ ATT-05 module DONE · ≠ FR-05 DONE · ≠ ATT UAT · panel+policy alone ≠ FR-05 DONE.

---

## L0

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | hrm **200** · xbos **200** · portal **200** |
| `pnpm run qc:fe-be-health` | **exit 0** ALL PASS |

---

## Browser U65 — J-HRM-ATT-05-01..06

| J-* | Click path | Network / FE | Verdict |
|-----|------------|--------------|---------|
| **J-HRM-ATT-05-01** | Thiết lập → Quy định nghỉ → `carry_over` · category **Chuyển năm** · **Cho phép mang sang** → Lưu → **F5** | **PUT** `leave-types` **200** · API `allowsCarryOver=true` · `category=carry_over` · Nest **0** | **PASS** |
| **J-HRM-ATT-05-02** | Nghỉ phép → Tạo → chọn NV → panel dialog | Row `leave-balance-row-carry_over` label **«Phép chuyển kỳ»** · Nest **0** | **PASS** |
| **J-HRM-ATT-05-03** | Quy tắc quỹ → `carry_over` · **Quy tắc hết hạn mang sang** + **Trần ngày mang** · Lưu (RETAIN admin) | Carry cols visible · table carry metadata · `att-05-fy-hold` · **≠** expire job DONE | **PASS** |
| **J-HRM-ATT-05-04** | Tạo → grant **annual 8** + **carry_over 3** (dialog panel) | **PUT** `tracked-entitlement` **200**×2 · rows tách · `att-05-ledger-sep` · avail **8** / **3** · deduct order **HOLD** | **PASS** |
| **J-HRM-ATT-05-05** | Quy định nghỉ → `att-05-fy-hold` | **R-ATT-05-FY** · **R-ATT-05-ENGINE** HOLD footers | **PASS_WITH_HOLD** |
| **J-HRM-ATT-05-06** | Nghỉ phép → `att-05-honesty` · F5 | ROLLOVER/EXPIRE HOLD · **≠ ATT-05/ATT UAT** · `att-09-honesty` · must_keep stamps in evidence | **PASS_WITH_HOLD** |

**hdsd_align:** `hdsd-att-leave-type-allows-carry-over` · `leave-balance-row-carry_over` · `hdsd-att-lvrule-carry-*` · `att-05-fy-hold` · `hdsd-att-grant-leave-type-carry-over` · `att-05-ledger-sep` · `att-05-honesty`.

---

## Network summary

| Metric | Value |
|--------|--------|
| Attendance mutations (slice) | **4** (LVT PUT · grant PUT×2 · policy path observed) |
| Nest `/core` leave non-404 | **0** |
| Non-attendance HRM writes | **0** |
| Seed | **none** |

---

## Residuals (not promoted)

| ID | Note |
|----|------|
| **R-ATT-05-FY** | FY CRUD HOLD — J-05-05 footer PASS |
| **R-ATT-05-ENGINE** | Rollover/expire HOLD — J-05-06 footer |
| **R-ATT-05-DEDUCT** | Dual-bucket deduct order GAP on submit |
| **R-ATT-05-FY-CAL** | Calendar `balance_year` until FY lands |
| **R-MAIN-EFFECTIVE-EMPTY** | Non-blocking · OU holding |

---

## QC dispatch (next)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-05-CLUSTER-QC-01
role: qc
entry_criteria: QA PASS_TO_PM @ docs/qa/evidence/po-hrm-mvp-gd1-att-05-cluster-qa-01.md stamp ATT05QA1-MSM52CT7 · J-05-01..04 PASS · J-05-05/06 HOLD documented · L0 PASS · U65
exit_criteria: GWC C-SLICE · ≠ ATT-05/FR-05/ATT UAT DONE · must_keep ATT04QC1 · ATT04BQC1 · ATT09 · ATT03D · GO or GWC with residuals listed
```

---

## completion_report

**Closed:** U65 browser J-HRM-ATT-05-01..04 PASS; J-05-05/06 HOLD footers PASS; L0 PASS; Nest `/core` 0; attendance-only mutations; stamp **ATT05QA1-MSM52CT7**.

**Residual:** FY/ENGINE/deduct/FY-CAL program rows — not ATT-05 slice DONE.

**≠ promoted:** ATT-05 · FR-05 · ATT UAT · merge carry into annual.

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-ATT-05-CLUSTER-QC-01
role: qc
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-33 #37)
entry_criteria: QA evidence docs/qa/evidence/po-hrm-mvp-gd1-att-05-cluster-qa-01.md · stamp ATT05QA1-MSM52CT7 · ack PASS_TO_PM · J-* table · L0 logs
exit_criteria: Micro-GWC C-SLICE seal · honesty flags false · must_keep ATT04QC1-MSM22G4W · ATT04BQC1-MSM3S8QC1 · ATT09QC1-MSLUTL9D · ATT03DQC1-MSM1CR19 · PASS_TO_PM
read_first: po-hrm-mvp-gd1-att-05-cluster-qa-01.md · PO-HRM-MVP-GD1-ATT-05-CLUSTER-BA-01.md · FE-01 evidence
```
