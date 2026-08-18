# Evidence — PO-HRM-MVP-GD1-ATT-09-CLUSTER-QA-03-TYPEBLOCK

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-09-CLUSTER-QA-03-TYPEBLOCK` |
| **lane** | execution · **qa** |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-27 · UC-BP-ATT-09) |
| **Date** | 2026-08-09 |
| **stamp** | `ATT09QA3-MSLV65OX` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (narrow residual **R-ATT-09-TYPE-BLOCK-UI** CLOSED) |
| **scope** | **J-HRM-ATT-09-05 ONLY** · **≠** ATT-09 module UAT · **≠** reopen ATT-09 DONE |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **FE-02** | `docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-fe-02.md` READY_FOR_QA |
| **prior** | QA-02 `ATT09QA2-MSLUKI9U` · QC-01 GWC **`ATT09QC1-MSLUTL9D`** |
| **Honesty** | `attendance_uat_ready=false` · soft ≠ ATT-09 DONE · ≠ ATT-08=ATT-09 DONE · ≠ ATT UAT · CFG≠ATT-02 · printable false · PAY OUT · DENY invent `att_leave_hold` · Nest `/core` DENY · **C-SLICE** · U65 zero-seed |
| **must_keep** | **`ATT09QC1-MSLUTL9D`** · **`ATT08QC1-MSLSL36C`** · **`ATT02QC1-MSLQZUK7`** · **`PLT01QC1-MSLPUQIU`** · **`CORE10QC1-MSLP0EJB`** · **`CORE09QC1-MSLNBA89`** printable false · **`CORE07QC1-KZJTSHNT`** |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-att-09-cluster-qa-03-typeblock.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-09-cluster-qa-03-typeblock.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-09-cluster-qa-03-typeblock/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · residual **R-ATT-09-TYPE-BLOCK-UI CLOSED** |
| **Explicit** | residual close **≠** ATT-09 module UAT · **C-SLICE** prior seal **`ATT09QC1-MSLUTL9D`** stands · **≠** reopen ATT-09 DONE |
| **L0** | hrm **200** · xbos **200** · portal `:5173` **200** · Nest `/core/.../leave-requests` **404** |
| **L2.5** | **J-HRM-ATT-09-05 PASS** (narrow only) |
| **Nest `/core` leave SoT non-404** | **0** |
| **Seed** | **none** (U65) · product PUT tracked-entitlement only |
| **Silent 409 only** | **FAIL criterion not met** — TYPE-BLOCK UI visible |

---

## Browser U65 — J-HRM-ATT-09-05

**URL:** `http://127.0.0.1:5173/hr/attendance?portal=1&companyId=main` → **Nghỉ phép**  
**Employee:** `QA-M3-987275` · leave type UI `hr_custom_09` · RANGE **28–29/12/2026**  
**hdsd_align:** `att-leave-precision` · `att-leave-create-dialog-precision` · `att-09-type-block` · `att-09-type-block-hint` · `leave-detail-type-readonly` · `att-09-honesty`

| Step | Click path / assert | Network / FE | Verdict |
|------|---------------------|--------------|---------|
| Baseline create | Tạo → Gửi RANGE_TB | **POST** leave-requests **201** `HRM-LEAVE-201` · id `26f61fe5-…` · Nest **0** | PASS |
| List hint | tab **Danh sách yêu cầu** / Chờ duyệt → pending row | **`data-testid="att-09-type-block-hint"`** visible · AC-ATT-09-TYPE-BLOCK text | **PASS** |
| Create overlap (proactive + post-409) | Tạo trùng 28–29/12 → banner → Gửi | **`att-09-type-block`** before **and** after · POST **409** `HRM-LEAVE-VAL-OVERLAP` · CTA `att-09-type-block-open-detail` · Nest **0** | **PASS** |
| Detail type-lock | CTA **Xem đơn chờ duyệt** → detail | **`att-09-type-block`** + **`leave-detail-type-readonly`** (`QA hr_custom_09…`) | **PASS** |
| API cite | same RANGE overlap | **409** `HRM-LEAVE-VAL-OVERLAP` · conflicting_id = pending | PASS (cite) |

Screens: `01-leave-tab` · `02-create-baseline` · `03-list-hint` · `04-create-overlap-proactive` · `05-create-overlap-post409` · `06-detail-type-lock`.

---

## Residual close

| ID | Prior | Now |
|----|-------|-----|
| **R-ATT-09-TYPE-BLOCK-UI** | QA-02 PASS_WITH_RESIDUAL · QC GWC non-blocking carry · FE-02 READY | **CLOSED** (browser UI PASS) |

**Cấm claims (RETAIN):** ≠ ATT-09 module UAT · ≠ FR-09 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · printable false · PAY OUT · DENY invent `att_leave_hold` · Nest `/core` DENY · no seed · no wipe **`ATT09QC1-MSLUTL9D`** / ATT-08/02/PLT/CORE.

---

## Honesty footer

```text
attendance_uat_ready=false
contracts_printable_ready=false
soft create alone ≠ ATT-09 DONE · ≠ FR-09 DONE
≠ ATT-08 preview = ATT-09 DONE · ATT08QC1-MSLSL36C RETAIN
≠ ATT module UAT
CFG ≠ ATT-02 DONE · ATT02QC1-MSLQZUK7
PLT/CORE RETAIN (≠ DONE)
PAY OUT invent DONE
DENY invent att_leave_hold dual · held=pending_days
Nest /core leave-hold = 0
C-SLICE ≠ ATT module UAT
residual R-ATT-09-TYPE-BLOCK-UI CLOSED ≠ ATT-09 module UAT
must_keep ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT
U65 zero-seed
```

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Narrow U65 browser retest **J-HRM-ATT-09-05 ONLY** after FE-02 · stamp **`ATT09QA3-MSLV65OX`** · **PASS_TO_PM** · create overlap shows **`att-09-type-block`** (before+after 409) · pending list **`att-09-type-block-hint`** · detail **`att-09-type-block`** + **`leave-detail-type-readonly`** · overlap **409** `HRM-LEAVE-VAL-OVERLAP` · Nest `/core` **0** · seed **none** · residual **R-ATT-09-TYPE-BLOCK-UI CLOSED** · **≠** ATT-09 module UAT · **C-SLICE** **`ATT09QC1-MSLUTL9D`** stands · must_keep ATT-08/02/PLT/CORE · printable false · PAY OUT · DENY invent `att_leave_hold` |
| **next_owner** | **pm** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-qa-03-typeblock.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-09-CLUSTER-QA-03-TYPEBLOCK
role: pm
ack_status: PASS_TO_PM
entry_criteria: QA-03 TYPEBLOCK PASS ATT09QA3-MSLV65OX · residual R-ATT-09-TYPE-BLOCK-UI CLOSED
action:
  1) Seal residual CLOSED on bus — do NOT reopen ATT-09 module UAT · do NOT flip honesty
  2) must_keep ATT09QC1-MSLUTL9D GWC C-SLICE stands · ATT08QC1-MSLSL36C · ATT02/PLT/CORE
  3) Optional: micro-QC note only if PM wants stamp on residual close — NOT required to reopen QC seat
  4) Continue U88/U89 continuous — next vertical/wave (e.g. ATT-10 sa Option) — ≠ claim ATT UAT
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-qa-03-typeblock.md
cấm: claim ATT-09 DONE · ATT UAT · invent att_leave_hold · seed · wipe seals
```

---

*End QA-03-TYPEBLOCK · PASS_TO_PM · 2026-08-09 · stamp ATT09QA3-MSLV65OX · residual CLOSED ≠ module UAT*
