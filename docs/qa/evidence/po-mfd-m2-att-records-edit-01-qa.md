# PO-MFD-M2-ATT-RECORDS-EDIT-01-QA — browser U65 (HRM-AT-03 edit)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-RECORDS-EDIT-01-QA` |
| **role** | qa |
| **date** | 2026-08-04 |
| **Persona** | `uat.nv0007@xe.vn` / mobile login · `company_id=trsport` |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport` |
| **journey_l25** | **J-HRM-06** mutate (records edit) |
| **hdsd_align** | Chấm công → ▼ → **Dữ liệu chấm công** → row **Chỉnh sửa** → modal → đổi trạng thái → **Lưu** (matrix #13 edit · HRM-AT-03) |
| **U65** | zero-seed · browser FE only · no `pnpm seed:*` · **not** Delete→absent as AT-03 |
| **U76** | HDSD inventory below |
| **U87** | matrix #13 edit stamp honesty (not LIVE) |
| **L0 entry** | `pnpm run qc:fe-be-health` **PASS** (after HRM :28001 up) |
| **L0 exit** | `pnpm run qc:fe-be-health` **PASS** (entry re-confirm) |
| **FE entry** | `docs/qa/evidence/po-mfd-m2-att-records-edit-01.md` READY_FOR_QA |
| **Prior QC** | `docs/qa/evidence/po-mfd-m2-att-records-01-qc.md` GWC list · CONDITION edit STUB |
| **Probe** | `scripts/qa/_tmp-po-mfd-m2-att-records-edit-01.mjs` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-mfd-m2-att-records-edit-01-browser.json` |
| **Screens** | `docs/qa/evidence/screens/po-mfd-m2-att-records-edit-01/` |
| **commit** | `dc930c5` |
| **ack_status** | **FAIL** |
| **uat_done** | `false` — **NOT** Attendance CLOSED · **NOT** Face LIVE |

---

## Verdict

**FAIL** — list **LIVE** must_keep holds; Edit menuitem **opens wire** but modal **BROKEN** (white screen) with `pageErrors: Invalid time value` ×4. Root cause: GET records returns `attendance_date: "Tue Aug 04"` (non-ISO); FE modal does `format(new Date(attendance_date + 'T00:00:00'), …)` → crash → `dialogAfterEdit=false` · `patchesFired=0` · no PATCH. **Do not invent AT-03 PASS.** Residual → **dev-fe** (defensive date) ± **dev-be** date contract.

---

## HDSD inventory (U76)

| hdsd_ref | FE label / control | Result |
|----------|-------------------|--------|
| Matrix #13 «Bản ghi chấm công» | Menuitem **Dữ liệu chấm công** | 🟡 `label_drift` — click path OK |
| List title + table | `attendance-records-table` · GET LIVE | 🟢 |
| Row kebab → **Chỉnh sửa** | Menuitem present · `onSelect` wired (FE READY) | 🟢 CTA present |
| Edit dialog | `attendance-record-edit-dialog` | 🔴 **BROKEN** — white screen after click; testid **absent** |
| Status select + Lưu | `attendance-record-edit-status` · `…-save` | 🔴 unreachable |
| Xóa | Present | **not used** (forbidden as AT-03 PASS) |

---

## Click path (U65)

1. L0 `qc:fe-be-health` PASS
2. Mobile login `uat.nv0007@xe.vn` → inject portal auth (`companyId=trsport`)
3. Goto `/hr/attendance?…&companyId=trsport` → **hard reload**
4. Chevron Chấm công → **Dữ liệu chấm công**
5. Confirm list GET **200** `HRM-ATT-200` · 3 rows
6. Row kebab → **Chỉnh sửa**
7. Expect dialog → change status → **Lưu** → PATCH 2xx → F5

**Stopped at step 6→7:** dialog crash (white) · no PATCH.

---

## Exit AC results

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Browser: login → records → Sửa → modal → status → Lưu | **FAIL** — modal crash before Lưu |
| 2 | Network PATCH `/api/hrm/attendance/records/:id/status` 2xx | **FAIL** — `patchesFired=0` |
| 3 | FE after 2xx + F5 status persists | **FAIL** — mutate not reached |
| 4 | `dialogAfterEdit=true` · `patchesFired≥1` · `pageErrors=[]` | **FAIL** — `dialogAfterEdit=false` · `patchesFired=0` · `pageErrors=["Invalid time value"×4]` |
| 5 | Testids dialog/status/save | **FAIL** — all false after Edit click |
| 6 | must_keep list GET LIVE; CLOCK/SHEETS/LEAVE/OT untouched | **PASS** (list LIVE; no reopen) |
| 7 | Evidence this path | **PASS** |
| 8 | Matrix #13 edit LIVE if PASS | **not stamped LIVE** — edit **BROKEN** honesty |
| 9 | ack FAIL · uat_done false · NOT Attendance CLOSED / Face LIVE | **PASS** (honesty) |

---

## Network / console (SoT)

| Check | Detail |
|-------|--------|
| GET `/api/hrm/attendance/records?…` | **200** `HRM-ATT-200` · `rowCount=3` |
| Sample row `attendance_date` (direct API) | **`"Tue Aug 04"`** — not `yyyy-MM-dd` |
| PATCH `/attendance/records/:id/status` | **0** calls |
| pageErrors | `Invalid time value` ×4 (after Edit click → blank UI) |
| HTTP ≥500 HRM | none |
| Seed | none |

### FE crash locus (code vs payload)

```text
AttendanceRecordsTable.tsx edit Dialog:
  format(new Date(editingRecord.attendance_date + 'T00:00:00'), 'dd/MM/yyyy')
  // attendance_date = "Tue Aug 04" → Invalid Date → RangeError Invalid time value
```

---

## Screenshots

| File | Note |
|------|------|
| `docs/qa/evidence/screens/po-mfd-m2-att-records-edit-01/01-records-list.png` | List LIVE · 3 rows · status «Có mặt» |
| `docs/qa/evidence/screens/po-mfd-m2-att-records-edit-01/02-row-menu.png` | Kebab · Chỉnh sửa / Xóa |
| `docs/qa/evidence/screens/po-mfd-m2-att-records-edit-01/03-edit-dialog.png` | **White screen** after Chỉnh sửa (crash) |

---

## Surfaces

| Surface | runtime | Note |
|---------|---------|------|
| #13 list | **LIVE** | must_keep · GET 200 HRM-ATT-200 |
| #13 edit modal | **BROKEN** | Wire fires → render crash on bad date |
| #13 PATCH AT-03 | **BROKEN** / unreachable | patchesFired=0 |

---

## Residuals

| Id | Sev | Owner | Note |
|----|-----|-------|------|
| `R-MFD-M2-ATT-RECORDS-EDIT-DATE-CRASH` | **P1** | **dev-fe** (+ BE date contract) | Modal `format(new Date(attendance_date+'T00:00:00'))` crashes when API returns `"Tue Aug 04"`; need safe parse (prefer ISO) + do not blank page; retest PATCH+F5 |
| `R-MFD-M2-ATT-RECORDS-EDIT-STUB` | **SUPERSEDED** | — | Prior no-onClick STUB closed by FE wire; replaced by DATE-CRASH BROKEN |
| `R-MFD-M2-ATT-RECORDS-DATE-FORMAT` | P1 OBS | **dev-be** | List payload `attendance_date` should be `yyyy-MM-dd` (contract), not locale weekday string |
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
| Stamp #13 edit LIVE | No |

---

## completion_report

### Closed this seat
- Browser U65 retest of FE edit wire READY_FOR_QA executed with L0 PASS.
- List GET LIVE reconfirmed (must_keep).
- Root-caused edit FAIL: non-ISO `attendance_date` → modal crash (`Invalid time value`) → no PATCH.

### Open
- AT-03 edit modal + PATCH + F5 still FAIL.
- Residual `R-MFD-M2-ATT-RECORDS-EDIT-DATE-CRASH` → dev-fe (safe date render) / BE ISO date.

### Not claimed
- Attendance CLOSED · Face LIVE · `uat_done` · matrix #13 edit LIVE · CLOCK/SHEETS/LEAVE/OT reopen.

---

## next_owner

`pm` → dispatch **`dev-fe`** (primary) · optional parallel **`dev-be`** for `attendance_date` ISO

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-RECORDS-EDIT-01-R2-FE
from_role: pm
to_role: dev-fe
lane: execution
priority: P1
u65_zero_seed: true
entry_criteria: QA FAIL @ docs/qa/evidence/po-mfd-m2-att-records-edit-01-qa.md · residual R-MFD-M2-ATT-RECORDS-EDIT-DATE-CRASH
spec_ref: HRM-AT-03 · matrix #13 edit · J-HRM-06 mutate
problem: Row Chỉnh sửa opens wire but Dialog crashes white screen — pageErrors "Invalid time value"; API attendance_date="Tue Aug 04" (not yyyy-MM-dd); FE format(new Date(attendance_date+'T00:00:00')) throws; patchesFired=0
fix:
  - Safe-parse attendance_date in AttendanceRecordsTable edit Dialog (never throw; show — or dd/MM/yyyy from check_in_at)
  - Keep PATCH updateRecord path; testids attendance-record-edit-dialog|status|save
  - must_keep: list GET LIVE; no Delete→absent as AT-03; CLOCK/SHEETS/LEAVE/OT untouched
  - Optional handoff BE: normalize attendance_date to yyyy-MM-dd in list DTO
exit_criteria: READY_FOR_QA · unit/vitest date parse · evidence path docs/qa/evidence/po-mfd-m2-att-records-edit-01-r2-fe.md
cấm: seed · invent AT-03 PASS without browser · invent Attendance CLOSED
```

---

**ack_status:** `FAIL`  
**evidence_path:** `docs/qa/evidence/po-mfd-m2-att-records-edit-01-qa.md`
