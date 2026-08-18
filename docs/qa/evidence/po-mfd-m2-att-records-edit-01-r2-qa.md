# PO-MFD-M2-ATT-RECORDS-EDIT-01-R2-QA — browser U65 retest (HRM-AT-03 edit)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-RECORDS-EDIT-01-R2-QA` |
| **role** | qa |
| **date** | 2026-08-04 |
| **Persona** | `uat.nv0007@xe.vn` / `xevn-uat-2026` · `company_id=trsport` |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport` |
| **journey_l25** | **J-HRM-06** mutate (records edit) |
| **hdsd_align** | Chấm công → ▼ → **Dữ liệu chấm công** → row **Chỉnh sửa** → modal → đổi trạng thái → **Lưu** (matrix #13 edit · HRM-AT-03) |
| **U65** | zero-seed · browser FE only · no `pnpm seed:*` · **not** Delete→absent as AT-03 |
| **U76** | HDSD inventory below |
| **U87** | matrix #13 edit stamp honesty (not LIVE) |
| **L0 entry** | `pnpm run qc:fe-be-health` **PASS** |
| **L0 exit** | `pnpm run qc:fe-be-health` **PASS** |
| **FE entry** | `docs/qa/evidence/po-mfd-m2-att-records-edit-01-r2-fe.md` READY_FOR_QA |
| **Prior FAIL** | `docs/qa/evidence/po-mfd-m2-att-records-edit-01-qa.md` (`Invalid time value`) |
| **Probe** | `scripts/qa/_tmp-po-mfd-m2-att-records-edit-01-r2.mjs` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-mfd-m2-att-records-edit-01-r2-browser.json` |
| **Screens** | `docs/qa/evidence/screens/po-mfd-m2-att-records-edit-01-r2/` |
| **commit** | `dc930c5` |
| **ack_status** | **FAIL** |
| **uat_done** | `false` — **NOT** Attendance CLOSED · **NOT** Face LIVE |

---

## Verdict

**FAIL** (overall AT-03 mutate) — prior residual **`R-MFD-M2-ATT-RECORDS-EDIT-DATE-CRASH` CLOSED**: edit Dialog opens, `pageErrors=[]`, date shows **`04/08/2026`** (no white screen). Mutate still FAIL: **Lưu** → PATCH `/api/hrm/attendance/records/:id/status` **409** `HRM-ATT-409` with browser header **`x-company-id=main`** (message: *Resource company_id is outside token scope*). Status unchanged after FE + F5. **Do not invent AT-03 PASS / #13 edit LIVE.**

---

## HDSD inventory (U76)

| hdsd_ref | FE label / control | Result |
|----------|-------------------|--------|
| Matrix #13 «Bản ghi chấm công» | Menuitem **Dữ liệu chấm công** | 🟡 `label_drift` — click path OK |
| List title + table | `attendance-records-table` · GET LIVE | 🟢 |
| Row kebab → **Chỉnh sửa** | Menuitem present | 🟢 |
| Edit dialog | `attendance-record-edit-dialog` | 🟢 visible · no white screen |
| Date field | `attendance-record-edit-date` = `04/08/2026` | 🟢 dd/MM/yyyy (R2 FE harden) |
| Status select + Lưu | `attendance-record-edit-status` · `…-save` | 🟢 present · PATCH **409** |
| Xóa | Present | **not used** (forbidden as AT-03 PASS) |

---

## Click path (U65)

1. L0 `qc:fe-be-health` PASS
2. Mobile login `uat.nv0007@xe.vn` → inject portal auth (`companyId=trsport`)
3. Goto `/hr/attendance?…&companyId=trsport` → hard reload
4. Chevron Chấm công → **Dữ liệu chấm công**
5. List GET **200** `HRM-ATT-200` · 3 rows
6. Row kebab → **Chỉnh sửa** → dialog visible · date `04/08/2026` · `pageErrors=[]`
7. Change status **Có mặt → Chờ duyệt/pending** → **Lưu**
8. Expect PATCH 2xx → FE update → F5 persist

**Stopped at step 7→8:** PATCH **409** · toast «Resource company_id is outside token scope» · dialog stays open · status still «Có mặt» after F5.

---

## Exit AC results

| # | Criterion | Result |
|---|-----------|--------|
| 1 | L0 `qc:fe-be-health` PASS | **PASS** (entry + exit) |
| 2 | Login NV → attendance trsport | **PASS** |
| 3 | List GET 200 HRM-ATT-200 | **PASS** · `rowCount=3` |
| 4 | Row kebab → Chỉnh sửa | **PASS** |
| 5 | Dialog visible · pageErrors=[] · date dd/MM/yyyy or — | **PASS** · `dialogAfterEdit=true` · date=`04/08/2026` · `pageErrors=[]` |
| 6 | Change status → Lưu → PATCH 2xx | **FAIL** · PATCH **409** `HRM-ATT-409` · `x-company-id=main` |
| 7 | FE after 2xx + F5 status persists | **FAIL** — mutate not 2xx · status remains «Có mặt» |
| 8 | patchesFired≥1 · dialogAfterEdit · testids | **PARTIAL** · `patchesFired=1` · dialog/status/save **true** · but not 2xx |
| 9 | must_keep list GET LIVE; no Delete cheat | **PASS** |
| 10 | Matrix #13 edit LIVE / Attendance CLOSED / Face LIVE | **not stamped** |

---

## Network / console (SoT)

| Check | Detail |
|-------|--------|
| GET `/api/hrm/attendance/records?…` | **200** `HRM-ATT-200` · `rowCount=3` |
| Sample API `attendance_date` (L1 read) | still `"Tue Aug 04"` — FE hardened via `check_in_at` → `04/08/2026` |
| PATCH `/attendance/records/:id/status` | **409** `HRM-ATT-409` · body `status=pending` · **`x-company-id=main`** |
| PATCH message | `Resource company_id is outside token scope` |
| pageErrors | **[]** (prior `Invalid time value` gone) |
| HTTP ≥500 HRM | none |
| Seed | none |

### L1 diagnostic (not U65 AC)

Direct Nest PATCH with mobile JWT + `x-company-id=trsport` → **200** `HRM-ATT-202` for `pending|leave|absent|present`. Confirms BE mutate OK; browser FAIL is FE header scope (`main` vs `trsport`). Used only to confirm root cause — **not** claimed as browser PASS.

---

## Screenshots

| File | Note |
|------|------|
| `…/01-records-list.png` | List LIVE · 3 rows · «Có mặt» |
| `…/02-row-menu.png` | Kebab · Chỉnh sửa / Xóa |
| `…/03-edit-dialog.png` | Dialog LIVE · date **04/08/2026** · no white screen |
| `…/04-status-changed.png` | Status → Chờ duyệt |
| `…/05-after-patch.png` | Toast **Lỗi** · scope outside token · dialog still open |
| `…/06-after-f5.png` | Status still «Có mặt» |

---

## Surfaces

| Surface | runtime | Note |
|---------|---------|------|
| #13 list | **LIVE** | must_keep · GET 200 HRM-ATT-200 |
| #13 edit modal (date crash) | **LIVE** | R2 FE harden CLOSED DATE-CRASH |
| #13 PATCH AT-03 | **BROKEN** | 409 · `x-company-id=main` |

---

## Residuals

| Id | Sev | Owner | Note |
|----|-----|-------|------|
| `R-MFD-M2-ATT-RECORDS-EDIT-DATE-CRASH` | **CLOSED** | — | Dialog + safe date `04/08/2026` · `pageErrors=[]` |
| `R-MFD-M2-ATT-RECORDS-EDIT-PATCH-SCOPE` | **P1** | **dev-fe** | `updateAttendanceStatus` / `requestHrm` sends **`x-company-id=main`** on PATCH; need `resolveHrmMutateCompanyScope` / OU hint like leave approve (`trsport`); L1+trsport → 200 |
| `R-MFD-M2-ATT-RECORDS-DATE-FORMAT` | P1 OBS | **dev-be** | List DTO still `"Tue Aug 04"` — normalize `yyyy-MM-dd` (FE survives) |
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
| Stamp #13 edit LIVE / invent AT-03 PASS | No |
| Claim PASS from L1 API-only mutate | No |

---

## completion_report

### Closed this seat
- R2 browser U65 retest after FE date harden executed; L0 entry+exit PASS.
- **`R-MFD-M2-ATT-RECORDS-EDIT-DATE-CRASH` CLOSED** — dialog visible, date `04/08/2026`, no `Invalid time value`.
- List GET LIVE must_keep reconfirmed.
- Root-caused remaining FAIL: browser PATCH **409** because **`x-company-id=main`** (not `trsport`).

### Open
- AT-03 PATCH + F5 still FAIL → residual **`R-MFD-M2-ATT-RECORDS-EDIT-PATCH-SCOPE`** → **dev-fe**.
- BE date format OBS still open (non-blocking for FE display).

### Not claimed
- Attendance CLOSED · Face LIVE · `uat_done` · matrix #13 edit LIVE · CLOCK/SHEETS/LEAVE/OT reopen.

---

## next_owner

`pm` → dispatch **`dev-fe`** (`R-MFD-M2-ATT-RECORDS-EDIT-PATCH-SCOPE`)

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-RECORDS-EDIT-01-R3-FE
from_role: pm
to_role: dev-fe
lane: execution
priority: P1
u65_zero_seed: true
entry_criteria: QA FAIL @ docs/qa/evidence/po-mfd-m2-att-records-edit-01-r2-qa.md · residual R-MFD-M2-ATT-RECORDS-EDIT-PATCH-SCOPE
prior_closed: R-MFD-M2-ATT-RECORDS-EDIT-DATE-CRASH (dialog + date OK)
spec_ref: HRM-AT-03 · matrix #13 edit · J-HRM-06 mutate
problem: Edit Dialog LIVE; Lưu → PATCH /api/hrm/attendance/records/:id/status 409 HRM-ATT-409 "Resource company_id is outside token scope"; browser request header x-company-id=main (OU is trsport). L1 Nest + x-company-id=trsport → 200 HRM-ATT-202.
fix:
  - Wire updateAttendanceStatus / useAttendanceRecords.updateRecord through resolveHrmMutateCompanyScope (parity leave approve / attendance update-request approve) so x-company-id=trsport (JWT/OU), never default main on member NV
  - Keep DATE harden + testids attendance-record-edit-dialog|status|save|date
  - must_keep: list GET LIVE; no Delete→absent as AT-03; CLOCK/SHEETS/LEAVE/OT untouched
exit_criteria: READY_FOR_QA · evidence docs/qa/evidence/po-mfd-m2-att-records-edit-01-r3-fe.md · unit/vitest assert PATCH header company scope
cấm: seed · invent AT-03 PASS without browser · invent Attendance CLOSED
```

---

**ack_status:** `FAIL`  
**evidence_path:** `docs/qa/evidence/po-mfd-m2-att-records-edit-01-r2-qa.md`
