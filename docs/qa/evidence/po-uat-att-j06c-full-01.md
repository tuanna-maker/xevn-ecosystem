# Evidence — `PO-UAT-ATT-J06C-FULL-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UAT-ATT-J06C-FULL-01` |
| **from_role** | qa |
| **to_role** | pm → **qc** (`READY_FOR_QC`) |
| **date** | 2026-08-07 |
| **lane** | execution · U65 browser-only · zero-seed |
| **parent** | `PO-UAT-ATT-QC-01` GWC — J-06c was smoke only; this seat = **full sign→Chốt** |
| **portal** | `http://127.0.0.1:5173` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **stamp** | `J06CF-IDKL2E` (+ AC-03 delta `J06AC3-*`) |
| **sheet_id** | `3934591a-50ec-452b-940f-7f29ede50272` |
| **ack_status** | **`PASS_TO_PM`** · **`READY_FOR_QC`** |
| **verdict** | **PASS** — J-HRM-06c full mutate + AC-01/02/03 regression |
| **honesty** | **`attendance_uat_ready=false`** · WAIVE_L2 / LV-02 **WAIVED_P1 RETAIN** · Option C **cấm** · no seed |

---

## Entry / L0

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `:28001` + XBOS `:28002` + portal `:5173` **200** (node win UV assert ENV OBS) |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| Seed / Option C / WAIVE reopen | **None** |

---

## HDSD inventory (U76)

| # | Control | Observed |
|---|---------|----------|
| 1 | Menu **Bảng chấm công** (`attendance-tab-menu`) | 🟢 |
| 2 | Open sheet row `att-sheet-row-3934591a…` | 🟢 |
| 3 | Panel **Ký chốt bảng công** (`att-sign-panel`) | 🟢 |
| 4 | **Xác nhận** NV / QL / HCNS (`att-sign-confirm-*`) | 🟢 ×3 |
| 5 | **Chốt bảng công** (`att-sign-close-sheet`) | 🟢 |
| 6 | Nghỉ phép → Tạo / Duyệt / Hủy (AC smoke) | 🟢 |
| 7 | LV-02 ladder | ⚪ **WAIVED_P1** — not exercised / not 🟢 |

---

## Primary — J-HRM-06c full mutate

| Step | Detail | Network / FE |
|------|--------|--------------|
| Open | List → click submitted sheet July 2026 | `data-active-sheet-id` = `3934591a…` match |
| Sign ×3 | NV → QL → HCNS | POST `…/signatures` **201** ×3 |
| Chốt | `att-sign-close-sheet` | POST `…/close` **201** |
| FE after | Badge **Đã chốt** · toast «Đã chốt bảng chấm công.» · 3× **Đã xác nhận** | 🟢 |
| F5 | Reload → sheets · GET sheet | **`status=closed`** |

### Click path

1. Login inject `ceo@xe.vn` → `/hr/attendance?portal=1&companyId=main`
2. Menu **Bảng chấm công** → list
3. Open `att-sheet-row-3934591a-50ec-452b-940f-7f29ede50272` (status **submitted**)
4. Sign: `att-sign-confirm-employee` → `direct_manager` → `hr_admin` (enabled sequence)
5. **Chốt bảng công** → toast success
6. F5 → status remains **closed**

### Machine spot (J-06c)

```json
{
  "sheetId": "3934591a-50ec-452b-940f-7f29ede50272",
  "statusBefore": "submitted",
  "statusAfter": "closed",
  "signaturesPost2xx": 3,
  "closePost2xx": 1,
  "signPanelVisible": true,
  "feClosedChip": true,
  "f5Status": "closed",
  "activeSheetIdMatch": true
}
```

| Journey | Prior map | This seat | QA |
|---------|-----------|-----------|-----|
| **J-HRM-06c** | ✅ prior pay-att-close slice | **Full mutate PASS** (not smoke) | 🟢 |

---

## Regression — AC-01 / 02 / 03 (no WAIVE reopen)

| AC | Verdict | Evidence |
|----|---------|----------|
| **AC-ATT-LV-SHEET-01** | 🟢 **PASS** | Create→Duyệt → mat=`["2027-04-06","2027-04-07"]` · leave rows **2** · F5 **2** |
| **AC-ATT-LV-SHEET-02** | 🟢 **PASS** | HDSD Hủy → POST cancel **201** `HRM-LEAVE-205` · markers **2→0** · F5 **0** |
| **AC-ATT-LV-SHEET-03** | 🟢 **PASS** | Leave `2026-07-20` Duyệt → **409** `HRM-ATT-SHEET-LOCKED` (delta after Sept OVERLAP leftovers) |
| **LV-02 / WAIVE_L2** | ⚪ **RETAIN WAIVED_P1** | Not claimed 🟢 · not reopened |

### AC-03 note (process)

First pass used Sept closed days → create **409** `HRM-LEAVE-VAL-OVERLAP` (prior UAT leftovers) — **not** product LOCKED fail. Delta browser used July closed sheet day `2026-07-20` → approve **409** `HRM-ATT-SHEET-LOCKED` **PASS**. No seed used to clear overlaps.

---

## Must-keep / honesty

| Item | Status |
|------|--------|
| Prior funnel GWC (qc-01/qc-02) | Retained |
| Prior ATT UAT pack QC GWC | Retained — this seat closes J-06c **full** gap |
| WAIVE_L2 / LV-02 | **WAIVED_P1 RETAIN** |
| Option C as SoT | **cấm** |
| `attendance_uat_ready` | **false** — **DENIED** promote until QC GO on module seal |
| Seed | **DENIED** |

---

## Artifacts

| Artifact | Path |
|----------|------|
| Machine JSON | `docs/qa/evidence/_tmp-po-uat-att-j06c-full-01.json` |
| AC-03 delta JSON | `docs/qa/evidence/_tmp-po-uat-att-j06c-full-01-ac03.json` |
| Harness | `scripts/qa/_tmp-po-uat-att-j06c-full-01.mjs` (+ `-ac03.mjs`) |
| Screens | `docs/qa/evidence/screens/po-uat-att-j06c-full-01/` (11 PNG) |
| Prior QC parent | `docs/qa/evidence/po-uat-att-qc-01.md` |
| Journey map | `PROGRAM_JOURNEY_MAP.md` **J-HRM-06c** |

### Screenshot spot

| File | Observation |
|------|-------------|
| `24-after-signs.png` | 3× Đã xác nhận · «Đủ điều kiện chốt» · **Chốt bảng công** enabled · toast ký |
| `25-after-close.png` | Badge **Đã chốt** · toast «Đã chốt bảng chấm công.» |
| `26-after-f5.png` | Persist closed after reload |
| `01` / `02` | AC-01/02 leave path |
| `03*` | AC-03 lock path |

---

## Residuals / OBS

| ID | Sev | Note |
|----|-----|------|
| Sept leave OVERLAP leftovers | OBS process | Blocked first AC-03 attempt; July day worked — no seed |
| Module UAT | — | stays **`attendance_uat_ready=false`** until QC GO |
| Soft `R-ATT-SHEET-NAV-CTA` | soft | Not re-opened; not blocking |

**P0/P1 product residuals:** none.

---

## completion_report

U65 browser **PO-UAT-ATT-J06C-FULL-01 PASS**. L0 + fe-be-health PASS. **J-HRM-06c full** mutate: open submitted sheet `3934591a…` → POST signatures **201×3** → POST close **201** → FE **Đã chốt** + toast → F5 `status=closed`. AC-01 materialize+F5 · AC-02 cancel clear · AC-03 **409 LOCKED** (July day after OVERLAP delta). WAIVE_L2 / LV-02 **WAIVED_P1 RETAIN**. **`attendance_uat_ready=false`**. No seed. No Option C. Ready for QC gate on this full-mutate seat (not module UAT invent).

## next_owner

**qc**

## next_dispatch_prompt

```text
work_item_id: PO-UAT-ATT-J06C-FULL-QC-01
from_role: pm
to_role: qc
lane: governance
parent: PO-UAT-ATT-J06C-FULL-01 PASS_TO_PM READY_FOR_QC
honesty: attendance_uat_ready=false — DENIED promote unless QC GO full module with zero P0/P1
U65: observe-only · zero-seed
WAIVE_L2 / LV-02: RETAIN WAIVED_P1 — do NOT reopen / invent 🟢

read_first:
1. docs/qa/evidence/po-uat-att-j06c-full-01.md
2. docs/qa/evidence/_tmp-po-uat-att-j06c-full-01.json (stamp J06CF-IDKL2E)
3. docs/qa/evidence/screens/po-uat-att-j06c-full-01/24-after-signs.png + 25-after-close.png
4. docs/qa/evidence/po-uat-att-qc-01.md (parent GWC — J-06c was smoke)

task:
1) Audit J-HRM-06c FULL: signatures 201×3 + close 201 + FE Đã chốt + F5 closed (not smoke)
2) Audit AC-01/02/03 regression PASS; WAIVE retained
3) GWC/GO for this full-mutate seat ONLY — NOT invent attendance_uat_ready=true unless sponsor full-module criteria met
4) Evidence docs/qa/evidence/po-uat-att-j06c-full-qc-01.md

exit: PASS_TO_PM with GO|GWC|NO-GO
forbidden: seed · Option C · reopen WAIVE_L2 · attendance_uat_ready=true without explicit module GO
```

## ack_status

**PASS_TO_PM** · **READY_FOR_QC**
