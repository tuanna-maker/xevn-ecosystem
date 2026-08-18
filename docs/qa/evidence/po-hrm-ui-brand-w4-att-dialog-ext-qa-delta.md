# PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT-QA-DELTA — ATT dialog chrome (FE 9148B)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT-QA-DELTA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed · browser-only · U76 hdsd_align · **DELTA ONLY** |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **FE base** | `http://127.0.0.1:5173` (portal LIVE) |
| **Parent** | `PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT-QA` **PASS** — late/early · trip · update · shift-change · export · import **NOT retested** |
| **FE handoff** | `docs/qa/evidence/po-hrm-ui-brand-w4-att-dialog-ext.md` stall#2 · FE 9148B |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` **§16 LOCK** · §15.4 modal chrome |
| **ack_status** | **PASS_TO_PM** |
| **attendance_closed** | **false** |
| **face_live** | **false** (HOLD — not claimed LIVE) |
| **remaster_program_done** | **false** |
| **commit** | `dc930c5` |
| **Harness exit** | **0** |

---

## 1. Entry / L0

| Check | Result |
|-------|--------|
| HRM API `:28001` | **200** `/api/hrm` |
| XBOS API `:28002` | **200** `/api/xbos` · login **201** |
| Portal `:5173` | **200** — used as BASE |
| HRM FE `:8080` | **200** `/hr/` (available, not needed) |
| Seed / API invent | **None** (U65) — mutates=**0** |
| Face LIVE invent | **None** |
| Attendance CLOSED invent | **None** |
| Remaster DONE invent | **None** |
| Parent late/early/trip/export/import | **SKIP** (already PASS) |

---

## 2. Theme contrast

```text
pnpm run verify:xevn:theme-contrast -- --strict
→ exit 0
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] STRICT PASS — 0 pale hits
```

Re-verified this seat (parent already exit 0; no token touch claimed).

---

## 3. HDSD inventory (U76) — delta only

| # | Surface | Menu / path | Present |
|---|---------|-------------|---------|
| D1 | Shift form | Ca → Danh sách → Thêm · `att-shift-form-dialog` | 🟢 opened |
| D2 | Add sheet | Menu → Bảng chấm công → Thêm · `att-add-sheet-dialog` | 🟢 opened |
| D3 | Page leave create/detail | Residual shells · `att-page-leave-*-dialog-precision` | 🟢 static floor (not openable — LIVE = LeaveTab) |
| D4 | Page attendance edit | Residual shell · `att-page-attendance-edit-dialog-precision` | 🟢 static floor (not openable — LIVE = RecordsTable) |
| D5 | Manual clock confirm | Chấm công → Manual → Check-in · `clock-in-manual-confirm-dialog` | 🟢 opened |
| D6 | GPS clock confirm | Chấm công → GPS · `clock-in-gps-confirm-dialog` | 🟢 gated → static floor |
| D7 | Face HOLD | Chấm công → Face · hold banner · no LIVE | 🟢 |
| — | late/early / trip / export / import | — | ⬜ SKIP parent PASS |

---

## 4. Browser click path (U65)

1. Auth inject `ceo@xe.vn` → `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main`
2. **Ca** → `shifts-menu-list` → **Thêm** → `att-shift-form-dialog` → assert chrome → **Hủy**
3. Attendance menu → **Bảng chấm công** → **Thêm** → `att-add-sheet-dialog` → assert chrome → **Hủy**
4. Page leave / page edit CTAs — not openable under residual shells → static `text-[20px] font-bold` floor
5. **Chấm công** → Manual → select employee → Check-in → `clock-in-manual-confirm-dialog` → assert chrome + primary CTA → **Hủy** (no submit)
6. **Chấm công** → GPS → confirm gated (geo/emp) → static floor OBS
7. **Chấm công** → Face → HOLD banner · no LIVE claim

**Script:** `scripts/qa/_tmp-po-hrm-ui-brand-w4-att-dialog-ext-qa-delta.mjs`  
**JSON:** `docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-att-dialog-ext-qa-delta-browser.json`  
**Screens:** `docs/qa/evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa-delta/`  
**Harness exit:** **0** · window `2026-08-05T07:14:22Z` → ~`07:15:20Z`

---

## 5. Exit checks matrix

| # | AC | Result | Evidence |
|---|-----|--------|----------|
| D1 | Shift form: 4px `#1E40AF` + logo + glass + title≥20 + compact | **PASS** | «Thêm ca làm việc» 20/700 · bar 4px primary · wordmark · glass · time/name/num/code fields |
| D2 | Add sheet: same chrome + compact | **PASS** | «Thêm bảng chấm công chi tiết» 20/700 · select/line compact |
| D3 | Page leave if openable else static floor | **PASS** | not openable · `text-[20px] font-bold` floor OK |
| D4 | Page edit if openable else static floor | **PASS** | not openable · static floor OK |
| D5 | Manual clock confirm chrome + primary CTA | **PASS** | «Xác nhận Check-in» 20/700 · CTA `rgb(30, 64, 175)` · compact select/line/reason |
| D6 | GPS clock confirm chrome or static floor | **PASS** | gated · static title≥20 floor |
| D7 | Face HOLD (not LIVE) | **PASS** | hold banner · no LIVE UI claim |
| H | mutates=0 · honesty locks | **PASS** | mutates=**0** |
| T | theme-contrast `--strict` | **PASS** | exit **0** · pale=0 |

**Score:** **8/8 required** (D1–D7 + honesty; theme re-verified).

---

## 6. Measured dialog chrome (Playwright computed)

### D1 — `att-shift-form-dialog`

| Metric | Value |
|--------|--------|
| `::before` height | **4px** |
| `::before` bg | **rgb(30, 64, 175)** = `#1E40AF` |
| Glass + wordmark | **true** |
| Title | «Thêm ca làm việc» · **20px** · **700** |
| Compact | `xevn-field-time` · `xevn-field-name` · `xevn-field-num` · `xevn-field-code` · `xevn-field-select-md` |

### D2 — `att-add-sheet-dialog`

| Metric | Value |
|--------|--------|
| Bar / glass / logo | **4px primary** · true · true |
| Title | «Thêm bảng chấm công chi tiết» · **20px** · **700** |
| Compact | `xevn-field-select-md` · `xevn-field-select-sm` · `xevn-field-line` |

### D5 — `clock-in-manual-confirm-dialog`

| Metric | Value |
|--------|--------|
| Bar / glass / logo | **4px primary** · true · true |
| Title | «Xác nhận Check-in» · **20px** · **700** |
| Compact | `xevn-field-select-md` · `xevn-field-line` · `xevn-field-reason` |
| Primary CTA bg | **rgb(30, 64, 175)** |

### D3 / D4 / D6 — static floors (not invent open)

| Surface | Floor |
|---------|-------|
| `att-page-leave-create-dialog-precision` | `DialogTitle className="text-[20px] font-bold …"` |
| `att-page-leave-detail-dialog-precision` | same pattern |
| `att-page-attendance-edit-dialog-precision` | same pattern |
| `clock-in-gps-confirm-dialog` | `text-[20px] font-bold` near testid |

---

## 7. Residuals (OBS P2 — not blockers)

| ID | Note | Owner |
|----|------|-------|
| `OBS-D3-PAGE-LEAVE-SHELL` | Residual page-leave shells not openable (LIVE create = LeaveTab) — static floor | qa / fe note |
| `OBS-D4-PAGE-EDIT-SHELL` | Residual page-edit shell not openable (LIVE edit = RecordsTable) — static floor | qa / fe note |
| `OBS-D6-GPS-CONFIRM-GATED` | GPS confirm gated (emp/geo) under U65 — static floor; no invent LIVE mutate | qa |

---

## 8. Honesty / cấm

| Lock | Status |
|------|--------|
| Face LIVE | **false** |
| Attendance CLOSED | **false** |
| Remaster program DONE | **false** |
| Seed | **false** |
| Mutates (POST/PUT/PATCH/DELETE) | **0** |
| Parent surfaces re-litigated | **false** |

---

## 9. Screens

- `docs/qa/evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa-delta/00-attendance-shell.png`
- `docs/qa/evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa-delta/01-shift-form.png`
- `docs/qa/evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa-delta/02-add-sheet.png`
- `docs/qa/evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa-delta/05-manual-confirm.png`
- `docs/qa/evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa-delta/06-gps-confirm-miss.png`
- `docs/qa/evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa-delta/07-face-hold.png`

---

## completion_report

Closed: DELTA browser U65 on portal `:5173` for FE 9148B ATT dialog chrome — **shift-form** + **add-sheet** opened with 4px `#1E40AF` + wordmark + glass + title ≥20 + compact; page-leave/page-edit residual shells static floor; manual clock confirm LIVE chrome + primary CTA; GPS confirm gated → static floor; Face HOLD. Parent late/early/trip/export/import **not** retested. `theme-contrast --strict` exit **0**. mutates=0. Evidence WRITE this seat. Harness exit **0**.

Residual: OBS D3/D4/D6 P2 static/gated only — not invent LIVE or Attendance CLOSED.

**ack_status:** `PASS_TO_PM`  
**next_owner:** `pm`  
**evidence_path:** `docs/qa/evidence/po-hrm-ui-brand-w4-att-dialog-ext-qa-delta.md`

### next_dispatch_prompt

```text
Task pm INTAKE PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT-QA-DELTA PASS_TO_PM —
evidence docs/qa/evidence/po-hrm-ui-brand-w4-att-dialog-ext-qa-delta.md · portal :5173 ·
D1 shift-form + D2 add-sheet + D5 manual confirm chrome PASS · D3/D4/D6 static/gated floor · Face HOLD ·
theme-contrast --strict exit 0 · mutates=0 · parent ATT-EXT-QA not re-litigated;
cấm Face LIVE / Attendance CLOSED / remaster DONE;
chain next W4 brand seat (e.g. PAY-A-QA / remaining dialog backlog) — do NOT re-dispatch this DELTA.
```
