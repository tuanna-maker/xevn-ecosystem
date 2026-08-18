# Evidence — QA-PO-HRM-MVP-GD1-ATT-12-CLUSTER-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-MVP-GD1-ATT-12-CLUSTER-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` · U89 Wave-36 seat **#41** |
| **lane** | execution · **qa** |
| **date** | 2026-08-10 |
| **stamp** | **`ATT12QA1-MSMAIARP`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (C-SLICE · **≠** ATT-12 / FR-12 DONE · **≠** ATT UAT · PAY OUT) |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · OU filter **holding** |
| **FE handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-att-12-cluster-fe-01.md` |
| **BE handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-att-12-cluster-be-01.md` |
| **Honesty** | `attendance_uat_ready=false` · **≠ ATT-12 / FR-12 DONE** · C-SLICE · U65 zero-seed · Nest `/core` DENY |
| **must_keep** | `ATT07QC1-MSM9GWC1` · `ATT06QC1-MSM84GWC1` · `ATT05BQC1-MSM5SDQC1` · `ATT09QC1-MSLUTL9D` · `CORE07QC1-KZJTSHNT` |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-att-12-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-12-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-12-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · C-SLICE · DENY ATT-12 / FR-12 / ATT UAT DONE |
| **L0** | `qc:dev-stack` hrm/xbos/portal **200** · `qc:fe-be-health` **exit 0 ALL PASS** |
| **L1 (BE unit)** | `po-hrm-mvp-gd1-att-12-cluster-be-01.spec.ts` **5 PASS** (cite) |
| **L1 (FE unit)** | `attLeave12Ring` + `poHrmMvpGd1Att12ClusterFe01` **9 PASS** (cite) |
| **Nest `/core` leave SoT** | probes **404** · runtime non-404 **0** |
| **L2.5 J-HRM-ATT-12-*** | J-01..05 · J-07 **PASS** · regression **J-HRM-ATT-06-04** · **J-HRM-ATT-07-03..05** **PASS** |
| **Seed** | **none** (U65) |

**Explicit:** ≠ ATT-12 module DONE · ≠ FR-12 DONE · **QC-01 eligible** (GWC C-SLICE).

---

## Verdict table (journeys)

| J-* | Click path | Network / FE | Verdict |
|-----|------------|--------------|---------|
| **J-HRM-ATT-12-01** | Hồ sơ NV **Hoạt động** (smoke) | status active · không `hdsd-emp-activate-submit` | **PASS** |
| **J-HRM-ATT-12-02** | strip honesty banner | emit ≠ FR-12 DONE · DENY merge · C-SLICE | **PASS** |
| **J-HRM-ATT-12-03** | strip 5 buckets | **GET** `leave-balance/panel` **200** · **F5** parity | **PASS** |
| **J-HRM-ATT-12-04** | ca mặc định | **GET** `shift-assignments/activate-default` **200** · summary hiển thị | **PASS** |
| **J-HRM-ATT-12-05** | **Quỹ phép & ca mặc định** strip | panel + activate-default **2xx** · 5 dòng tách bucket · **F5** · honesty footer | **PASS** |
| **J-HRM-ATT-12-07** | seals + Nest 0 | footer ≠ DONE · peer ATT-07/06/05 cite · banner DENY merge | **PASS** |
| **J-HRM-ATT-06-04** | Nghỉ phép → `ot_comp_leave` | `att-06-form-panel` · compensatory ≠ annual | **PASS** |
| **J-HRM-ATT-07-03** | sick + attach → **Gửi** | **POST** `leave-requests` **201** | **PASS** |
| **J-HRM-ATT-07-04** | sau 201 | toast/peer persist | **PASS** |
| **J-HRM-ATT-07-05** | Thứ tự quỹ nghỉ ốm | **GET/PUT** `sick-leave-fund-order` **200** | **PASS** |

**hdsd_align:** `hdsd-emp-att12-enroll-confirm-strip` · `hdsd-emp-att12-leave-row-{annual,seniority,compensatory,carry_over,advance}` · `hdsd-emp-att12-shift-summary` · `hdsd-emp-att12-honesty-footer` · `att-06-form-panel` · `hdsd-att-sick-leave-fund-order-save`.

**Note:** Ca mặc định copy «Chưa có ca…» = display-ready empty state (GET 200) — **không** fail bucket merge · **không** claim ATT-12 DONE.

---

## Residuals (not promoted)

| ID | Note |
|----|------|
| **R-ATT-12-SHIFT-DEFAULT** | Chưa có row `activate_default` trên NV probe — catalog/rule peer HOLD |
| **R-ATT-04-ENGINE** | F-ATT-LEAVE-04 periodic HOLD footer |
| **R-ATT-01-ASSIGN** | Full assign grid OPEN |
| **≠ ATT-12 / ATT UAT DONE** | honesty retained |
| **QC-01** | **ready** — GWC C-SLICE |

---

## completion_report

**Closed:** L0–L2.5 PASS; U65 **J-HRM-ATT-12-01..05** + **J-12-07**; strip quỹ 5 bucket + panel/activate-default Network **2xx** + **F5**; regression **J-HRM-ATT-06-04** + **J-HRM-ATT-07-03..05**; no bucket merge; stamp **ATT12QA1-MSMAIARP**.

**Open:** C-SLICE honesty — **≠** ATT-12 / FR-12 / ATT UAT DONE; default shift row empty on probe NV (expected copy).

**next_owner:** **qc** (`PO-HRM-MVP-GD1-ATT-12-CLUSTER-QC-01`)

**evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-att-12-cluster-qa-01.md`

**ack_status:** **PASS_TO_PM**

### next_dispatch_prompt (qc — copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-12-CLUSTER-QC-01
role: qc
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-att-12-cluster-qa-01.md
  - docs/qa/evidence/po-hrm-mvp-gd1-att-12-cluster-fe-01.md
  - docs/qa/evidence/po-hrm-mvp-gd1-att-12-cluster-be-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-API-01.md §4.3 · §4.8
entry_criteria: QA stamp ATT12QA1-MSMAIARP PASS_TO_PM · L0–L2.5 PASS · U65
exit_criteria: GWC C-SLICE · honesty ≠ ATT-12/FR-12/ATT UAT DONE · must_keep ATT07QC1+ATT06QC1+ATT05BQC1+ATT09+CORE07 · R-ATT-04-ENGINE/R-ATT-01-ASSIGN footers acknowledged · DENY reopen J-07-01..07 without bus
cấm: claim ATT-12 DONE · seed · merge buckets
```
