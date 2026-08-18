# PO-MFD-M2-ATT-RECORDS-EDIT-01-R3-QA — browser U65 retest (HRM-AT-03 edit)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-RECORDS-EDIT-01-R3-QA` |
| **role** | qa |
| **date** | 2026-08-04 |
| **Persona** | `uat.nv0007@xe.vn` / `xevn-uat-2026` · `company_id=trsport` |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport` |
| **journey_l25** | **J-HRM-06** mutate (records edit) |
| **hdsd_align** | Chấm công → ▼ → **Dữ liệu chấm công** → row **Chỉnh sửa** → modal → đổi trạng thái → **Lưu** (matrix #13 edit · HRM-AT-03) |
| **U65** | zero-seed · browser FE only · no `pnpm seed:*` · **not** Delete→absent as AT-03 |
| **U76** | HDSD inventory below |
| **U87** | matrix #13 list+edit stamped **LIVE** (honesty) |
| **L0 entry** | `pnpm run qc:fe-be-health` **PASS** |
| **L0 exit** | `pnpm run qc:fe-be-health` **PASS** |
| **FE entry** | `docs/qa/evidence/po-mfd-m2-att-records-edit-01-r3-fe.md` READY_FOR_QA |
| **Prior FAIL** | `docs/qa/evidence/po-mfd-m2-att-records-edit-01-r2-qa.md` (PATCH 409 `x-company-id=main`) |
| **Probe** | `scripts/qa/_tmp-po-mfd-m2-att-records-edit-01-r3.mjs` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-mfd-m2-att-records-edit-01-r3-browser.json` |
| **Screens** | `docs/qa/evidence/screens/po-mfd-m2-att-records-edit-01-r3/` |
| **commit** | `dc930c5` |
| **ack_status** | **PASS_TO_PM** |
| **uat_done** | `false` — **NOT** Attendance CLOSED · **NOT** Face LIVE |

---

## Verdict

**PASS_TO_PM** — AT-03 mutate browser U65 **PASS**. Prior residual **`R-MFD-M2-ATT-RECORDS-EDIT-PATCH-SCOPE` CLOSED**: **Lưu** → PATCH `/api/hrm/attendance/records/:id/status` **200** `HRM-ATT-202` with request header **`x-company-id=trsport`** (NOT `main`). FE after 2xx shows «Chờ duyệt»; F5 status persists; dialog date `04/08/2026`; `pageErrors=[]`. DATE-CRASH remains CLOSED from R2. Matrix #13 edit stamped **LIVE** (list+edit). **Do not invent Attendance CLOSED / Face LIVE / `uat_done`.**

---

## HDSD inventory (U76)

| hdsd_ref | FE label / control | Result |
|----------|-------------------|--------|
| Matrix #13 «Bản ghi chấm công» | Menuitem **Dữ liệu chấm công** | 🟡 `label_drift` — click path OK |
| List title + table | `attendance-records-table` · GET LIVE | 🟢 |
| Row kebab → **Chỉnh sửa** | Menuitem present | 🟢 |
| Edit dialog | `attendance-record-edit-dialog` | 🟢 visible · no white screen |
| Date field | `attendance-record-edit-date` = `04/08/2026` | 🟢 dd/MM/yyyy |
| Status select + Lưu | `attendance-record-edit-status` · `…-save` | 🟢 PATCH **200** `HRM-ATT-202` |
| Xóa | Present | **not used** (forbidden as AT-03 PASS) |

---

## Click path (U65)

1. L0 `qc:fe-be-health` PASS
2. Mobile login `uat.nv0007@xe.vn` → inject portal auth (`companyId=trsport`)
3. Goto `/hr/attendance?…&companyId=trsport` → hard reload
4. Chevron Chấm công → **Dữ liệu chấm công**
5. List GET **200** `HRM-ATT-200` · 3 rows · statusBefore «Có mặt»
6. Row kebab → **Chỉnh sửa** → dialog visible · date `04/08/2026` · `pageErrors=[]`
7. Change status **Có mặt → Chờ duyệt/pending** → **Lưu**
8. PATCH **200** `HRM-ATT-202` · `x-company-id=trsport` → toast Thành công → row «Chờ duyệt»
9. F5 → reopen records → status still «Chờ duyệt»

---

## Exit AC results

| # | Criterion | Result |
|---|-----------|--------|
| 1 | L0 `qc:fe-be-health` PASS | **PASS** (entry + exit) |
| 2 | Login NV → attendance trsport | **PASS** |
| 3 | List GET 200 HRM-ATT-200 | **PASS** · `rowCount=3` |
| 4 | Row kebab → Chỉnh sửa | **PASS** |
| 5 | Dialog visible · pageErrors=[] · date dd/MM/yyyy or — | **PASS** · date=`04/08/2026` · `pageErrors=[]` |
| 6 | Change status → Lưu → PATCH 2xx · `x-company-id=trsport` (NOT main) | **PASS** · **200** `HRM-ATT-202` · `xCompanyId=trsport` |
| 7 | FE after 2xx + F5 status persists | **PASS** · FE «Chờ duyệt» · F5 «Chờ duyệt» |
| 8 | patchesFired≥1 · dialog/testids | **PASS** · `patchesFired=1` · dialogClosed=true |
| 9 | must_keep list GET LIVE; no Delete cheat | **PASS** |
| 10 | Matrix #13 edit LIVE honesty | **stamped LIVE** list+edit · Attendance CLOSED / Face LIVE **not** claimed |

---

## Network / console (SoT)

| Check | Detail |
|-------|--------|
| GET `/api/hrm/attendance/records?…` | **200** `HRM-ATT-200` · `rowCount=3` |
| PATCH `/attendance/records/04754f73-…/status` | **200** `HRM-ATT-202` · body `status=pending` · **`x-company-id=trsport`** |
| PATCH message | `Attendance status updated` |
| pageErrors | **[]** |
| HTTP ≥500 HRM | none |
| Seed | none |

---

## Screenshots

| File | Note |
|------|------|
| `…/01-records-list.png` | List LIVE · 3 rows · «Có mặt» |
| `…/02-row-menu.png` | Kebab · Chỉnh sửa / Xóa |
| `…/03-edit-dialog.png` | Dialog LIVE · date **04/08/2026** |
| `…/04-status-changed.png` | Status → Chờ duyệt |
| `…/05-after-patch.png` | Toast **Thành công** · row1 «Chờ duyệt» |
| `…/06-after-f5.png` | After F5 · status still «Chờ duyệt» |

---

## Surfaces

| Surface | runtime | Note |
|---------|---------|------|
| #13 list | **LIVE** | must_keep · GET 200 HRM-ATT-200 |
| #13 edit modal | **LIVE** | DATE-CRASH CLOSED (R2) |
| #13 PATCH AT-03 | **LIVE** | 200 · `x-company-id=trsport` · F5 persist |

Matrix stamp: `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_FIDELITY_MATRIX.md` row **#13** → **LIVE** list+edit (`PO-MFD-M2-ATT-RECORDS-EDIT-01-R3-QA`).

---

## Residuals

| Id | Sev | Owner | Note |
|----|-----|-------|------|
| `R-MFD-M2-ATT-RECORDS-EDIT-DATE-CRASH` | **CLOSED** | — | Dialog + safe date `04/08/2026` · `pageErrors=[]` |
| `R-MFD-M2-ATT-RECORDS-EDIT-PATCH-SCOPE` | **CLOSED** | — | PATCH 200 + `x-company-id=trsport` (not main) + F5 |
| `R-MFD-M2-ATT-RECORDS-DATE-FORMAT` | P1 OBS | **dev-be** | List DTO may still non-ISO — FE survives |
| `R-MFD-M2-ATT-RECORDS-LABEL-DRIFT` | P3 OBS | ba/dev-fe | Matrix «Bản ghi» vs FE «Dữ liệu chấm công» |
| Attendance CLOSED / Face LIVE / uat_done | — | — | **not claimed** |

---

## Forbidden checks (honesty)

| Forbidden | Done? |
|-----------|--------|
| seed | No |
| Delete→absent as AT-03 PASS | No |
| Invent Face LIVE | No |
| Invent Attendance CLOSED | No |
| Claim PASS from L1 API-only | No |
| Invent AT-03 without browser 2xx+F5 | No |

---

## completion_report

### Closed this seat
- R3 browser U65 retest after FE PATCH scope fix; L0 entry+exit PASS.
- **`R-MFD-M2-ATT-RECORDS-EDIT-PATCH-SCOPE` CLOSED** — PATCH **200** `HRM-ATT-202` · header **`x-company-id=trsport`** · F5 «Chờ duyệt».
- DATE-CRASH remains CLOSED; dialog/date OK; `pageErrors=[]`.
- Matrix #13 list+edit stamped **LIVE** (honesty).

### Open (non-blocking OBS)
- BE date format OBS · label drift P3.

### Not claimed
- Attendance CLOSED · Face LIVE · `uat_done` · CLOCK/SHEETS/LEAVE/OT reopen.

---

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-RECORDS-EDIT-01-R3-QC
from_role: pm
to_role: qc
lane: governance
priority: P1
u65_zero_seed: true
entry_criteria: QA PASS_TO_PM @ docs/qa/evidence/po-mfd-m2-att-records-edit-01-r3-qa.md
machine_json: docs/qa/evidence/_tmp-po-mfd-m2-att-records-edit-01-r3-browser.json
screens: docs/qa/evidence/screens/po-mfd-m2-att-records-edit-01-r3/
fe_fix: docs/qa/evidence/po-mfd-m2-att-records-edit-01-r3-fe.md
prior_fail_closed: docs/qa/evidence/po-mfd-m2-att-records-edit-01-r2-qa.md (409 x-company-id=main) → CLOSED
spec_ref: HRM-AT-03 · matrix #13 edit · J-HRM-06
audit:
  - L0 qc:fe-be-health PASS entry+exit cited
  - Browser path: uat.nv0007 trsport → Dữ liệu chấm công → Chỉnh sửa → status → Lưu
  - PATCH 200 HRM-ATT-202 · x-company-id=trsport (NOT main)
  - FE after 2xx + F5 «Chờ duyệt» · pageErrors=[] · date 04/08/2026
  - Matrix #13 LIVE list+edit stamp honesty (not invent Attendance CLOSED / Face LIVE / uat_done)
  - Residuals CLOSED: DATE-CRASH + PATCH-SCOPE; OBS only DATE-FORMAT + LABEL-DRIFT
exit_criteria: GO or GO WITH CONDITIONS · evidence docs/qa/evidence/po-mfd-m2-att-records-edit-01-r3-qc.md
cấm: seed · invent Attendance CLOSED · invent Face LIVE · invent uat_done · reopen CLOCK/SHEETS/LEAVE/OT without new defect
```

---

**ack_status:** `PASS_TO_PM`  
**evidence_path:** `docs/qa/evidence/po-mfd-m2-att-records-edit-01-r3-qa.md`
