# Evidence — PO-HRM-MVP-GD1-ATT-06-CLUSTER-QA-01 (retest 5 · BE-03)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-06-CLUSTER-QA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` · U89 Wave-33 seat **#39** |
| **lane** | execution · **qa** |
| **date** | 2026-08-10 |
| **stamp** | **`ATT06QA1-MSM84RYS`** (retest 5 after BE-03) |
| **prior_stamp** | `ATT06QA1-MSM7NPIM` (BE-02) · `ATT06QA1-MSM7FZC3` · `ATT06QA1-MSM79FOI` · `ATT06QA1-MSM70OQ1` · `ATT06QA1-MSM6Q04X` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (C-SLICE · **≠** ATT-06 / FR-06 DONE · **≠** ATT UAT · PAY OUT) |
| **uc_ids** | `UC-BP-ATT-06` · `FR-UC-BP-ATT-06` · **BR-BP-LV-03** |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · OU filter **holding** |
| **FE handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-fe-04.md` |
| **BE handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-be-03.md` (**READY_FOR_QA**) |
| **Honesty** | `attendance_uat_ready=false` · **≠ ATT-06 / FR-06 DONE** · C-SLICE · U65 zero-seed · printable false · PAY OUT · DENY merge compensatory→annual · Nest `/core` DENY |
| **must_keep** | `ATT05BQC1-MSM5SDQC1` · `ATT05QC1-MSM52GWC1` · `ATT09QC1-MSLUTL9D` |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-att-06-cluster-qa-01.mjs` (updated: approve `employee_id` for J-04) |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-06-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-06-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · C-SLICE · DENY ATT-06 / FR-06 / ATT UAT DONE |
| **L0** | `qc:dev-stack` hrm/xbos/portal **200** · `qc:fe-be-health` **exit 0 ALL PASS** |
| **L1 (BE unit)** | BE-03 spec **1 passed** (cite only — not substitute J-04) |
| **Nest `/core` leave SoT** | probes **404** · runtime non-404 **0** |
| **L2.5 J-HRM-ATT-06-*** | J-01 **PASS** · J-02 **PASS** · J-03 **PASS** · J-04 **PASS** · J-05 **PASS** · J-06 **PASS_WITH_HOLD** · J-07 **PASS** |
| **Seed** | **none** (U65) |
| **BE-03 delta vs MSM7NPIM** | J-04 **PASS** — approve **201** `employee_id=2b4cbc90-…` · `credited_days=0.5` · GET compensatory **`source=employee_leave_balances`** · entitled **≥ credited** · F5 persist |

**Explicit:** ≠ ATT-06 module DONE · ≠ FR-06 DONE · **QC-01 eligible** (GWC C-SLICE).

---

## L0

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | hrm **200** · xbos **200** · portal **200** |
| `pnpm run qc:fe-be-health` | **exit 0** ALL PASS |

---

## Browser U65 — J-HRM-ATT-06-01..07

| J-* | Click path | Network / FE | Verdict |
|-----|------------|--------------|---------|
| **J-HRM-ATT-06-01** | Thiết lập → **Chế độ phép bù OT** → bật + **8h/ngày** → **Lưu** | **PUT** policy **200** · **GET** `modeEnabled=true` | **PASS** |
| **J-HRM-ATT-06-02** | Quản lý đơn → **Tăng ca** → Thêm đơn · compensatory | **POST** `overtime-requests` **201** · EFF GET **200** | **PASS** |
| **J-HRM-ATT-06-03** | Pending → `att-ot-row-view` → `att-ot-approve-submit` | **POST** approve **201** · `employee_id=2b4cbc90-fb74-4a2d-9fef-d188d4e48d61` · `credited_days=0.5` | **PASS** |
| **J-HRM-ATT-06-04** | GET `leave_type=compensatory` for approve NV · **F5** | entitled **≥ 0.5** · **`source=employee_leave_balances`** (before + F5) | **PASS** |
| **J-HRM-ATT-06-05** | Nghỉ phép → Tạo đơn → «Nghỉ bù OT» | **`att-06-form-panel` true** · `leave-balance-row-compensatory` · annual sep | **PASS** |
| **J-HRM-ATT-06-06** | Gửi đơn nghỉ bù | Không **POST** `leave-requests` **2xx** (overlap/balance HOLD) | **PASS_WITH_HOLD** |
| **J-HRM-ATT-06-07** | Tắt chế độ → tạo/duyệt OT | Policy OFF **PUT 200** · approve **201** · entitled **Δ=0** · seals **true** | **PASS** |

**Probe (post-run):** balance employee `2b4cbc90-fb74-4a2d-9fef-d188d4e48d61` (from approve **201**, not list probe UUID).

**hdsd_align:** `att-ot-row-view` · `att-ot-approve-submit` · `att-ot-add-submit` · `att-06-form-panel` · `leave-balance-row-compensatory` · `att-06-policy-honesty`.

---

## Network summary

| Metric | Value |
|--------|--------|
| Policy PUT/GET (J-01) | **PUT 200** + **GET 200** |
| OT POST create (slice) | **2** × **201** |
| OT POST approve (slice) | **2** × **201** (J-03 ON + J-07 OFF) |
| Accrual on approve (J-03) | `credited_days=0.5` · `employee_id=2b4cbc90-…` |
| Compensatory balance read | **`source=employee_leave_balances`** · F5 persist |
| Nest `/core` leave non-404 | **0** |
| Seed | **none** |

**Lesson:** Retest 4 FAIL used wrong `employee_id` for balance GET (`pickEmployee` list UUID ≠ OT row NV). Harness now binds J-04 to approve **201** `employee_id` (BE-03 live balance upsert validated).

---

## Defects

| ID | Sev | Status |
|----|-----|--------|
| **D-ATT-06-QA-ACCRUAL-BALANCE** | P0 | **CLOSED** (retest 5 MSM84RYS) |
| **R-ATT-06-STALE-RUNTIME** | P1 | **CLOSED** (BE-03 restart) |

---

## Residuals (not promoted)

| ID | Note |
|----|------|
| **R-ATT-06-AGG** | HOLD footer ATT-10 (peer) |
| **≠ ATT-06 / ATT UAT DONE** | honesty retained |
| **QC-01** | **ready** — GWC C-SLICE |

---

## completion_report

**Closed:** L0 PASS; Nest `/core` 0; full cluster **J-01..07** PASS (J-06 HOLD); **J-03** captures approve `employee_id`; **J-04** PASS `source=employee_leave_balances` + F5; stamp **ATT06QA1-MSM84RYS**; harness fix in `scripts/qa/_tmp-po-hrm-mvp-gd1-att-06-cluster-qa-01.mjs`.

**Open:** C-SLICE honesty — **≠** ATT-06 / FR-06 / ATT UAT DONE; R-ATT-06-AGG peer HOLD.

**next_owner:** **qc** (`PO-HRM-MVP-GD1-ATT-06-CLUSTER-QC-01`)

**evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-qa-01.md`

**ack_status:** **PASS_TO_PM**

### next_dispatch_prompt (qc — copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-06-CLUSTER-QC-01
role: qc
entry_criteria: QA PASS_TO_PM @ docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-qa-01.md stamp ATT06QA1-MSM84RYS · BE-03 handoff · U65 zero-seed · L0+L2.5 J-01..07 PASS (J-06 HOLD) · D-ATT-06-QA-ACCRUAL-BALANCE CLOSED
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-qa-01.md
  - docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-be-03.md
  - docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md
mission:
  - GWC C-SLICE gate: audit browser evidence · honesty flags (≠ ATT-06/FR-06/ATT UAT DONE) · must_keep ATT05BQC1 · ATT05QC1 · ATT09QC1
  - Confirm J-04 employee_id parity lesson documented · no seed in evidence
exit_criteria: GO WITH CONDITIONS or GO · evidence docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-qc-01.md · PASS_TO_PM
cấm: claim ATT-06 module DONE · pnpm seed:*
must_keep: ATT05BQC1 · ATT05QC1 · ATT09QC1
```

---

*End QA-01 retest 5 · PASS_TO_PM · C-SLICE · ≠ ATT-06 DONE*
