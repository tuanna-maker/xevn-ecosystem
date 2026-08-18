# PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT-QA — Remaining ATT dialogs brand chrome (stall#3 NEW)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed · browser-only · U76 hdsd_align |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **FE base** | `http://127.0.0.1:5173` (portal **200** · hrm_fe also **200**) |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` **§16 LOCK** · §15.4 modal chrome |
| **FE handoff** | `docs/qa/evidence/po-hrm-ui-brand-w4-att-dialog-ext.md` READY_FOR_QA (stall#2 WRITE · ~9148B · NEW surfaces) |
| **RE-DISPATCH** | stall#3 — prior QA evidence missed NEW AC surfaces → **REWRITE** this seat |
| **ack_status** | **PASS_TO_PM** |
| **attendance_closed** | **false** |
| **face_live** | **false** (HOLD) |
| **remaster_program_done** | **false** |
| **commit** | `dc930c5` |
| **Harness exit** | **0** |

---

## 1. Entry / L0

| Check | Result |
|-------|--------|
| HRM API `:28001` | **200** `/api/hrm` |
| XBOS API `:28002` | **200** `/api/xbos` · login OK |
| Portal `:5173` | **200** — used as BASE |
| HRM FE `:8080` | **200** `/hr/` (fallback ready, unused) |
| Seed / API invent | **None** (U65) — mutates=**0** |
| Face LIVE invent | **None** |
| Attendance CLOSED invent | **None** |
| Remaster DONE invent | **None** |

---

## 2. Theme contrast (AC #5)

```text
pnpm run verify:xevn:theme-contrast -- --strict
→ exit 0
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] STRICT PASS — 0 pale hits
```

---

## 3. HDSD inventory (U76)

| # | Surface | Menu / path | Present |
|---|---------|-------------|---------|
| AC1 | Late/early add | Quản lý đơn → Đăng ký đi muộn, về sớm → Thêm · `att-late-early-add-dialog-precision` | 🟢 |
| AC1 | Trip add | Quản lý đơn → Đề nghị đi công tác → Thêm · `att-trip-add-dialog-precision` | 🟢 |
| AC1 | Shift-change add | Quản lý đơn → Đề nghị đổi ca → Thêm · `att-shift-change-add-dialog-precision` | 🟢 |
| AC2 NEW | Shift form | Ca → Danh sách → Thêm · `att-shift-form-dialog` | 🟢 |
| AC2 NEW | Add sheet | Chấm công ▾ → Bảng chấm công → Thêm · `att-add-sheet-dialog` | 🟢 |
| AC2 NEW | Page leave / page edit | residual shells — openable else static floor | 🟢 OBS |
| AC3 NEW | Manual clock confirm | Chấm công → Thủ công → Check-in · `clock-in-manual-confirm-dialog` | 🟢 |
| AC3 NEW | GPS clock confirm | Chấm công → GPS → confirm · `clock-in-gps-confirm-dialog` | 🟢 |
| AC3 | Face HOLD | Chấm công → Face ID · hold · no LIVE | 🟢 |
| AC4 | Export | Dữ liệu chấm công → Xuất · `att-export-dialog-precision` | 🟢 |
| AC4 | Import | Thiết lập → Nhân viên → Nhập · `att-import-dialog-precision` | 🟢 |
| AC5 | theme-contrast | `--strict` exit 0 | 🟢 |

---

## 4. Browser click path (U65 · mutates=0)

1. Auth inject `ceo@xe.vn` → `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main`
2. **Quản lý đơn** → Late/early → **Thêm** → assert chrome → **Hủy**
3. **Quản lý đơn** → Công tác → **Thêm** → assert chrome → **Hủy**
4. **Quản lý đơn** → Đổi ca → **Thêm** → assert chrome → **Hủy**
5. **Ca** → Danh sách → **Thêm** → `att-shift-form-dialog` → **Hủy**
6. Attendance ▾ → **Bảng chấm công** → **Thêm** → `att-add-sheet-dialog` → **Hủy**
7. Page leave/edit shells — not opened under U65 → static `text-[20px] font-bold` floor
8. Clock-In → **Thủ công** → Check-in → `clock-in-manual-confirm-dialog` (title≥20 · compact · primary CTA) → **Hủy**
9. Clock-In → **GPS** (geo mock) → confirm → `clock-in-gps-confirm-dialog` (title≥20 · compact · primary CTA) → **Hủy**
10. Dữ liệu chấm công → **Xuất** → `att-export-dialog-precision` → **Đóng**
11. **Thiết lập** → import → `att-import-dialog-precision` → **Đóng**
12. Clock-In → Face ID → HOLD honesty · no LIVE claim

**Script:** `scripts/qa/_tmp-po-hrm-ui-brand-w4-att-dialog-ext-qa.mjs`  
**JSON:** `docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-att-dialog-ext-qa-browser.json`  
**Harness exit:** **0**

---

## 5. Exit checks matrix

| # | AC | Result | Evidence |
|---|-----|--------|----------|
| 1 | Late/early + trip + shift-change add: 4px `#1E40AF` + logo + glass + title ≥20 + compact | **PASS** | barH=`4px` · bg=`rgb(30, 64, 175)` · wordmark · glass · title **20px/700** Montserrat |
| 2 | NEW shift form `att-shift-form-dialog` | **PASS** | «Thêm ca làm việc» 20/700 · compact name/select/time/num · full chrome |
| 2 | NEW add-sheet `att-add-sheet-dialog` | **PASS** | «Thêm bảng chấm công chi tiết» 20/700 · compact select/line |
| 2 | NEW page-leave / page-edit if openable | **PASS** (OBS) | not opened → static floor `text-[20px] font-bold` on both testids |
| 3 | NEW manual + GPS clock confirms | **PASS** | title **20px/700** · compact · CTA `rgb(30, 64, 175)` · Face HOLD separate |
| 4 | Export + Import precision | **PASS** | export «Xuất báo cáo…» · import «Import nhân viên…» · 4px bar + logo + glass |
| 5 | theme-contrast `--strict` | **PASS** | exit **0** · pale=0 |
| 6 | Evidence WRITE this seat | **PASS** | this file |
| — | U65 honesty locks | **PASS** | mutates=**0** · face_live=false · attendance_closed=false · remaster_done=false |

**Checks:** **13/13** required PASS · harness exit **0**

---

## 6. Measured dialog chrome (Playwright computed)

| Dialog | barH | bar bg | glass | logo | title | fields / CTA |
|--------|------|--------|-------|------|-------|--------------|
| Late/early add | **4px** | **rgb(30, 64, 175)** | ✓ | ✓ | Thêm đơn · 20/700 | date · time · select · reason |
| Trip add | **4px** | **rgb(30, 64, 175)** | ✓ | ✓ | Thêm đề nghị · 20/700 | date · line · num · phone · reason |
| Shift-change add | **4px** | **rgb(30, 64, 175)** | ✓ | ✓ | Thêm đề nghị · 20/700 | date · selects · reason |
| Shift form NEW | **4px** | **rgb(30, 64, 175)** | ✓ | ✓ | Thêm ca làm việc · 20/700 | name · select-md · time · num |
| Add sheet NEW | **4px** | **rgb(30, 64, 175)** | ✓ | ✓ | Thêm bảng chấm công chi tiết · 20/700 | select-md/sm · line |
| Manual confirm NEW | **4px** | **rgb(30, 64, 175)** | ✓ | ✓ | Xác nhận Check-in · 20/700 | select-md · line · reason · CTA **#1E40AF** |
| GPS confirm NEW | **4px** | **rgb(30, 64, 175)** | ✓ | ✓ | Xác nhận chấm công · 20/700 | select-md · reason · CTA **#1E40AF** |
| Export | **4px** | **rgb(30, 64, 175)** | ✓ | ✓ | Xuất báo cáo chấm công · 20/700 | select-sm |
| Import | **4px** | **rgb(30, 64, 175)** | ✓ | ✓ | Import nhân viên từ Excel · 20/700 | file chrome |

---

## 7. Screens

| # | Path |
|---|------|
| 00 | `evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa/00-attendance-shell.png` |
| 01 | `evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa/01-late-early-add.png` |
| 02 | `evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa/02-trip-add.png` |
| 03 | `evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa/03-shift-change-add.png` |
| 04 | `evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa/04-shift-form.png` |
| 05 | `evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa/05-add-sheet.png` |
| 07 | `evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa/07-manual-confirm.png` |
| 08 | `evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa/08-gps-confirm.png` |
| 09 | `evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa/09-export-dialog.png` |
| 10 | `evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa/10-import-dialog.png` |
| 11 | `evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa/11-face-hold.png` |

---

## 8. Residual / not claimed

| Item | Status |
|------|--------|
| OBS-Q6-PAGE-LEAVE-SHELL | **P2** — page-leave create residual not opened (LIVE LeaveTab create is separate FE-DIALOG-01); static floor verified |
| OBS-Q6-PAGE-EDIT-EMPTY | **P2** — page attendance edit not opened (no row under U65); static floor verified |
| Full ATT remaster DONE | **OUT** — not claimed |
| Attendance CLOSED | **OUT** — not claimed |
| Face LIVE | **OUT** — HOLD kept |
| PROP-03e EmployeeQRCard LIVE | **OUT** — SKIP kept |

---

## completion_report

**Closed:** Stall#3 browser U65 QA for W4 ATT dialog extend — AC1 request adds (late/early + trip + shift-change) + **NEW** shift-form / add-sheet / page-leave·edit floor + **NEW** manual/GPS clock confirms (title≥20 · compact · primary CTA `#1E40AF`) + export/import + Face HOLD + `theme-contrast --strict` exit **0**. mutates=**0**. Evidence WRITE this seat before finish. Harness exit **0**. Checks **13/13**.

**Open / residual:** OBS-Q6 page-leave/edit shells not opened (P2 static floor). **Not** remaster DONE · **not** Attendance CLOSED · **not** Face LIVE.

## next_owner

`pm`

## next_dispatch_prompt

```text
Task pm INTAKE PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT-QA PASS_TO_PM —
evidence docs/qa/evidence/po-hrm-ui-brand-w4-att-dialog-ext-qa.md · harness exit 0 ·
checks 13/13 incl NEW shift-form + add-sheet + manual/GPS confirms · Face HOLD · theme-contrast --strict 0 ·
cấm invent Attendance CLOSED / Face LIVE / remaster DONE;
dispatch next brand wave (QC gate if wave-close, else next FE seat per brand backlog)
```

## ack_status

**PASS_TO_PM**

## pm_dispatch_hint

`PO-HRM-UI-BRAND` next wave after W4-ATT-DIALOG-EXT stall#3 CLOSED — do **not** mark Attendance CLOSED / remaster DONE; OBS-Q6 page shells P2 static floor only.
