# Evidence — QA-PO-HRM-MVP-GD1-ATT-07-CLUSTER-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-MVP-GD1-ATT-07-CLUSTER-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` · U89 Wave-35 seat **#40** |
| **lane** | execution · **qa** |
| **date** | 2026-08-10 |
| **stamp** | **`ATT07QA1-MSM9IFO1`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (C-SLICE · **≠** ATT-07 / FR-07 DONE · **≠** ATT UAT · PAY OUT) |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · OU filter **holding** |
| **FE handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-fe-01.md` |
| **BE handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-be-01.md` |
| **Honesty** | `attendance_uat_ready=false` · **≠ ATT-07 / FR-07 DONE** · C-SLICE · U65 zero-seed · Nest `/core` DENY |
| **must_keep** | `ATT06QC1-MSM84GWC1` · `ATT05BQC1-MSM5SDQC1` · `ATT09QC1-MSLUTL9D` |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-att-07-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-07-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-07-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · C-SLICE · DENY ATT-07 / FR-07 / ATT UAT DONE |
| **L0** | `qc:dev-stack` hrm/xbos/portal **200** · `qc:fe-be-health` **exit 0 ALL PASS** |
| **L1 (BE unit)** | `po-hrm-mvp-gd1-att-07-cluster-be-01.spec.ts` **7 PASS** (cite) |
| **L1 (FE unit)** | `attLeave07Ring` + `poHrmMvpGd1Att07ClusterFe01` **10 PASS** (cite) |
| **Nest `/core` leave SoT** | probes **404** · runtime non-404 **0** |
| **L2.5 J-HRM-ATT-07-*** | J-01..07 **PASS** · **J-HRM-ATT-06-04** **PASS** |
| **Seed** | **none** (U65) |

**Explicit:** ≠ ATT-07 module DONE · ≠ FR-07 DONE · **QC-01 eligible** (GWC C-SLICE).

---

## Browser U65 — journeys

| J-* | Click path | Network / FE | Verdict |
|-----|------------|--------------|---------|
| **J-HRM-ATT-07-01** | Nghỉ phép → Tạo đơn → `lvt_02` / sick EFF | **GET** `leave-types/effective` **200** · `att-07-sick-flags` · BH/CTY khớp EFF (false/false) | **PASS** |
| **J-HRM-ATT-07-02** | ốm ≥3d · không attach → **Gửi** | FE toast VAL · **không** POST 2xx | **PASS** |
| **J-HRM-ATT-07-03** | attach + **Gửi** | **POST** `leave-requests` **201** · `dayBranches[]` (2 ngày) | **PASS** |
| **J-HRM-ATT-07-04** | sau 201 | toast «Phân nhánh ngày ốm» · **F5** row `pending` | **PASS** |
| **J-HRM-ATT-07-05** | Thiết lập → **Thứ tự quỹ nghỉ ốm** | **GET/PUT** `sick-leave-fund-order` **200** · persisted badge | **PASS** |
| **J-HRM-ATT-07-06** | form panel | 5 buckets MVP · **no** `leave-balance-row-sick` | **PASS** |
| **J-HRM-ATT-06-04** | Tạo đơn → `ot_comp_leave` | `att-06-form-panel` · `leave-balance-row-compensatory` · annual tách | **PASS** |
| **J-HRM-ATT-07-07** | honesty + seals | `att-07-honesty` · must_keep stamps · Nest 0 | **PASS** |

**hdsd_align:** `att-07-flag-bh` · `att-07-flag-cty` · `att-07-sick-attach` · `hdsd-leave-attachment-input` · `hdsd-att-sick-leave-fund-order-save` · `att-06-form-panel` · `leave-balance-row-*`.

**Lesson:** Dùng khoảng ngày **11/2027** offset theo stamp để tránh `HRM-LEAVE-VAL-OVERLAP` khi retest U65 trên cùng NV.

---

## Residuals (not promoted)

| ID | Note |
|----|------|
| **R-ATT-07-SHEET-CODE** | HOLD footer (ATT-10 peer) |
| **R-ATT-07-AGG** | HOLD footer |
| **≠ ATT-07 / ATT UAT DONE** | honesty retained |
| **QC-01** | **ready** — GWC C-SLICE |

---

## completion_report

**Closed:** L0–L2.5 PASS; U65 full **J-HRM-ATT-07-01..07** + **J-HRM-ATT-06-04**; fund-order GET/PUT; sick VAL-ATT toast; `dayBranches` + F5; stamp **ATT07QA1-MSM9IFO1**.

**Open:** C-SLICE honesty — **≠** ATT-07 / FR-07 / ATT UAT DONE; sheet-code / AGG footers HOLD.

**next_owner:** **qc** (`PO-HRM-MVP-GD1-ATT-07-CLUSTER-QC-01`)

**evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-qa-01.md`

**ack_status:** **PASS_TO_PM**

### next_dispatch_prompt (qc — copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-07-CLUSTER-QC-01
role: qc
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-qa-01.md
  - docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-fe-01.md
  - docs/qa/evidence/po-hrm-mvp-gd1-att-07-cluster-be-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-API-01.md §4.7
entry_criteria: QA stamp ATT07QA1-MSM9IFO1 PASS_TO_PM · L0–L2.5 PASS · U65
exit_criteria: GWC C-SLICE · honesty ≠ ATT-07/ATT UAT DONE · must_keep ATT06QC1+ATT05BQC1+ATT09 · R-ATT-07-AGG/SHEET footers acknowledged
cấm: claim ATT-07 DONE · seed · reopen J-HRM-ATT-06-01..07 without bus regression
```
