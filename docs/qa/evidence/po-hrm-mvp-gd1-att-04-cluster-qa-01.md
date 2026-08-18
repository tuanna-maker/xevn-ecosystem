# Evidence — PO-HRM-MVP-GD1-ATT-04-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-04-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-33 seat **#35**) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `ATT04QA1-MSM21P8W` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (C-SLICE · **≠** ATT-04 DONE · **≠** ATT module UAT · PAY OUT) |
| **uc_ids** | `UC-BP-ATT-04` · `FR-UC-BP-ATT-04` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **FE handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-att-04-cluster-fe-01.md` READY_FOR_QA |
| **Honesty** | `attendance_uat_ready=false` · **≠ ATT-04 DONE** · **≠ ATT UAT** · L1/LVRULE/grant alone ≠ FR-04 DONE · FY HOLD · ENGINE HOLD · printable false · PAY OUT · DENY invent `att_leave_hold` · Nest `/core` DENY · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **must_keep** | `ATT03DQC1-MSM1CR19` · `ATT03BQC1-MSM0891H` · `ATT01QC1-MSLZ3KIM` · `ATT11QC1-MSLXTH9P` · `ATT10QC1-MSLWGUYH` · `ATT09QC1-MSLUTL9D` · `ATT08QC1-MSLSL36C` · `ATT02QC1-MSLQZUK7` · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` printable false · `CORE07QC1-KZJTSHNT` |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-att-04-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-04-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-04-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **DENY** ATT-04 / ATT UAT DONE · **DENY** seed · printable false RETAIN |
| **L0** | `qc:dev-stack` hrm/xbos/portal **200** · `qc:fe-be-health` **ALL PASS** |
| **Nest `/core` geofence** | work-sites · leave-types · leave-requests probes **404** · runtime non-404 SoT **0** |
| **L2.5 J-*** | **J-01..06 PASS** |
| **Seed** | **none** (U65) |

**Explicit:** ≠ ATT-04 module DONE · ≠ ATT UAT · ≠ reopen ATT-03d · C-SLICE only.

---

## L0

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | hrm **200** · xbos **200** · portal **200** (exit noise UV handle — probes OK) |
| `pnpm run qc:fe-be-health` | **exit 0** ALL PASS |

---

## Browser U65 — J-HRM-ATT-04-01..06

Persona: portal auth inject · `/hr/attendance?portal=1&companyId=main` · **zero-seed**.

| J-* | Click path | Network / FE | Verdict |
|-----|------------|--------------|---------|
| **J-HRM-ATT-04-01** | Thiết lập → Quy định nghỉ → Loại phép N+1 `hr_att04_msm21p8w` → Lưu → **F5** | **PUT/POST** `leave-types*` **200** · row visible · Nest **0** | **PASS** |
| **J-HRM-ATT-04-02** | Quy tắc quỹ → policy gắn EFF type → Lưu → **F5** | **POST** `leave-accrual-policies` **201** · rows≥1 · Nest **0** | **PASS** |
| **J-HRM-ATT-04-03** | Nghỉ phép → Tạo → chọn NV → `att-04-grant-panel` → entitled **15** → Lưu → **F5** | **PUT** `tracked-entitlement` **200** · panel visible · Nest **0** · **≠ seed** | **PASS** |
| **J-HRM-ATT-04-04** | `leave-balance-panel` MVP labels | GET panel path observed · labels present | **PASS** |
| **J-HRM-ATT-04-05** | Tạo đơn EFF picker · CNS API probe | EFF contains new type · picker OK · illegal manual params **400** `HRM-VAL-001` | **PASS** |
| **J-HRM-ATT-04-06** | F5 · `att-04-honesty` · FY/ENGINE HOLD footers | ≠ ATT-04 DONE · ≠ ATT UAT · must_keep cite · Nest **0** | **PASS** |

**hdsd_align:** `settings-att-leave-types` · `hdsd-att-lvrule-*` · `att-04-grant-panel` · `hdsd-att-grant-save` · `leave-balance-panel` · `att-04-honesty`.

---

## UF blocks (U65)

### UF-ATT-04-ADMIN — Loại phép N+1

- Persona / URL: `ceo@xe.vn` · `:5173` `/hr/attendance` → Thiết lập → Quy định nghỉ
- Trước mutate: list có sẵn catalog
- Action: nhập mã `hr_att04_msm21p8w` → Lưu
- Network: `leave-types*` → **200**
- FE sau 2xx: row `settings-att-leave-type-row-*` · **F5** còn mã
- Verdict: **🟢 PASS**

### UF-ATT-04-POLICY — Quy tắc quỹ

- Action: Quy tắc quỹ → chọn EFF → Lưu
- Network: **POST** `/api/hrm/attendance/leave-accrual-policies` → **201**
- FE sau 2xx + F5: `att-lvrule-row-*` present
- Verdict: **🟢 PASS** (≠ ENGINE LIVE)

### UF-ATT-04-GRANT — HR entitled

- Action: Nghỉ phép → Tạo → NV → grant panel → **15** ngày → Lưu
- Network: **PUT** `/api/hrm/attendance/leave-balance/tracked-entitlement` → **200**
- FE sau 2xx + F5: panel reload OK
- Verdict: **🟢 PASS** (product path · ≠ seed)

### UF-ATT-04-PANEL — Panel quỹ

- Action: Nghỉ phép tab · `leave-balance-panel`
- Verdict: **🟢 PASS** (MVP codes / labels)

### UF-ATT-04-CNS / EFF

- EFF GET includes new type · create-dialog picker · CNS reject manual params when policy active
- Verdict: **🟢 PASS**

### UF-ATT-04-SEALS

- `att-04-honesty` · `R-ATT-04-FY` · `R-ATT-04-ENGINE` HOLD visible · must_keep stamps in evidence
- Verdict: **🟢 PASS**

---

## Network summary

| Metric | Value |
|--------|-------|
| `leave-types*` mutate | **200** |
| `leave-accrual-policies` POST | **201** |
| PUT `tracked-entitlement` | **200** |
| GET `leave-balance` / panel | observed |
| Nest `/core` leave SoT non-404 | **0** |
| Seed | **none** |

---

## Residuals (not promoted)

| ID | Note |
|----|------|
| **R-ATT-04-FY** | FY start-month CRUD — **HOLD** (footer only) |
| **R-ATT-04-ENGINE** | F-ATT-LEAVE-04 accrue job — **HOLD GĐ1** |
| **ATT module UAT** | `attendance_uat_ready=false` |

---

## completion_report

Closed U65 browser QA for ATT-04 C-SLICE: J-HRM-ATT-04-01..06 **PASS**; LVT/LVRULE/grant/panel physical paths **2xx**; Nest `/core` geofence **0**; FY/ENGINE HOLD footers visible; must_keep seals cited; **≠** ATT-04 / ATT UAT DONE.

## next_owner

**qc**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-ATT-04-CLUSTER-QC-01
role: qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-33 seat #35)
lane: governance · TA · Go/No-Go C-SLICE
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-att-04-cluster-qa-01.md (stamp ATT04QA1-MSM21P8W · PASS_TO_PM)
  - docs/qa/evidence/po-hrm-mvp-gd1-att-04-cluster-fe-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01.md J-HRM-ATT-04-01..06
entry_criteria: QA-01 PASS_TO_PM · L0–L2.5 J-* PASS · Nest /core=0 · U65 zero-seed evidence
exit_criteria:
  - docs/qa/evidence/po-hrm-mvp-gd1-att-04-cluster-qc-01.md
  - GWC C-SLICE: ≠ ATT-04 DONE · ≠ ATT module UAT · printable false · PAY OUT
  - must_keep ATT03DQC1-MSM1CR19 · ATT09QC1-MSLUTL9D · full peer chain · DENY att_leave_hold invent
  - FY HOLD · ENGINE HOLD footers in QC stamp
  - ack_status PASS_TO_PM or NO-GO with defects
must_keep: ATT03DQC1-MSM1CR19 · ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · Nest /core DENY · C-SLICE
cấm: claim ATT-04 / ATT UAT DONE · reopen ATT-03d · seed evidence · honesty flip
```
