# PO-HRM-UI-BRAND-W3-ATT-B-QA — Attendance sheets/records + shifts brand

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-ATT-B-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed · browser-only · U76 hdsd_align |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Portal** | `http://127.0.0.1:5173` · embed `/hr/attendance?portal=1&companyId=main` |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` §8–§10 |
| **Inventory** | W3-ATT-B · S23–S28, S35–S38 |
| **FE handoff** | `docs/qa/evidence/po-hrm-ui-brand-w3-att-b.md` READY_FOR_QA |
| **Dialog R1** | **CLOSED** — titles measured ≥20 bold; **did not reopen** FE-FOUND-01-R1 / `dialog.tsx` |
| **ack_status** | **PASS_TO_PM** |
| **attendance_closed** | **false** |
| **face_live** | **false** (honesty hold kept) |
| **remaster_program_done** | **false** |

---

## 1. Entry / L0

| Check | Result |
|-------|--------|
| `qc:dev-stack` (entry) | hrm/xbos/portal **200** (first pass mid-run portal briefly ECONNREFUSED → restarted Vite :5173; final run L0 PASS) |
| `qc:dev-stack` (exit) | hrm/xbos/portal **200** (Node UV assert noise on Windows exit — health lines OK) |
| Seed / API invent | **None** (U65) — sheet/shift create via FE only; cleanup DELETE via FE |
| Face LIVE invent | **None** |
| Attendance CLOSED invent | **None** |

---

## 2. Theme contrast (exit #11)

```text
pnpm run verify:xevn:theme-contrast -- --strict
→ exit 0
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563
[xevn-theme-contrast] STRICT PASS — 0 pale hits (scanned 598)
```

---

## 3. HDSD inventory (U76)

| # | Surface | Menu / path | Present |
|---|---------|-------------|---------|
| S23 | Bảng chấm công list | Chấm công ▾ → Bảng chấm công | 🟢 |
| S24 | Thêm bảng → Lưu | Dialog `att-add-sheet-dialog` | 🟢 |
| S25 | Xóa bảng AlertDialog | `att-delete-sheet-dialog` title ≥20 | 🟢 |
| S26 | Dữ liệu chấm công | Chấm công ▾ → Dữ liệu chấm công | 🟢 |
| S27 | Edit status → PATCH | empty rows today | 🟡 waived chrome-only |
| S28 | Delete record dialog | empty rows today | 🟡 waived (static title `text-[20px]` kept) |
| S35 | Ca → Danh sách ca | shifts list + primary Thêm | 🟢 |
| S36 | Add shift → save | POST work-shifts **201** | 🟢 |
| S37 | Bulk delete AlertDialog | title ≥20 | 🟢 |
| S38 | Single delete AlertDialog | title ≥20 + FE cleanup DELETE **200** | 🟢 |
| Face | Hold banner | not LIVE | 🟢 |
| GPS | Method coords UI | lat/lon visible | 🟢 |
| QR | invent LIVE | none | 🟢 SKIP (W3-ATT-E) |

---

## 4. Browser click path (U65)

1. Login inject `ceo@xe.vn` → `/hr/attendance?portal=1&companyId=main`
2. **S23** menu → Bảng chấm công — `att-sheets-precision` · Thêm `rgb(30,64,175)` · body `#111827` · secondary labels `#4B5563` · 0 pale
3. **S24** Thêm → name `QA-ATT-B …` → Lưu → POST `/attendance/attendance-sheets` **201** `HRM-AS-201` → row in list → **F5** → row still present
4. **S25** trash → AlertDialog «Xác nhận xóa» **20px / 700 / #111827** → confirm DELETE **200** (QA cleanup)
5. **S26** menu → Dữ liệu chấm công — summary cards ops-dense secondary labels · table border xevn
6. **S27/S28** — GET records 200 empty for `2026-08-05` · no row menu → **waived** (U65 no seed); see residual
7. **S35** Ca → Danh sách ca — `att-shifts-precision` · Thêm primary · `shifts-table`
8. **S36** Thêm ca `QA######` → POST `/attendance/work-shifts` **201** `HRM-WS-201` → in list · DialogTitle **20px/700**
9. **S37** select-all → bulk delete → «Xác nhận xóa nhiều ca» **20px/700** → Hủy
10. **S38** row trash → «Xác nhận xóa» **20px/700** → DELETE **200** cleanup
11. Clock-In → Face hold banner · GPS coords UI · no QR LIVE claim

**Script:** `scripts/qa/_tmp-po-hrm-ui-brand-w3-att-b-qa.mjs`  
**JSON:** `docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-att-b-qa-browser.json`

---

## 5. Exit checks matrix

| # | AC | Result | Evidence |
|---|-----|--------|----------|
| 1 | S23 sharp + primary Thêm | **PASS** | Add `rgb(30,64,175)`; h2 `#111827` weight 700; pale=0 |
| 2 | S24 Add → Lưu 2xx → FE + F5 | **PASS** | POST **201** · inList+afterF5 · DialogTitle 20px |
| 3 | S25 delete title ≥20 | **PASS** | 20px / 700 / `#111827` · DELETE 200 cleanup |
| 4 | S26 records summary+table sharp | **PASS** | 5 summary labels `#4B5563`; h2 sharp |
| 5 | S27 Edit → PATCH 2xx → FE+F5 | **PASS\*** | \*waived empty records — residual OBS |
| 6 | S28 delete record title ≥20 | **PASS\*** | \*waived no row; FE code `text-[20px] font-bold` |
| 7 | S35 shifts primary Add + table | **PASS** | Add primary · table visible |
| 8 | S36 Add/Edit save wire | **PASS** | POST **201** · title 20px (edit optional OBS) |
| 9 | S37/S38 delete titles ≥20 | **PASS** | bulk + single 20px/700 |
| 10 | must_keep Face/GPS/no QR | **PASS** | Face hold GĐ2 · GPS coords UI · no QR invent |
| 11 | theme-contrast --strict | **PASS** | exit 0 |

---

## 6. Network (FE mutates only)

| Method | URL | Status | Code |
|--------|-----|--------|------|
| POST | `/api/hrm/attendance/attendance-sheets` | **201** | `HRM-AS-201` |
| DELETE | `/api/hrm/attendance/attendance-sheets/{id}` | **200** | `HRM-AS-200` |
| POST | `/api/hrm/attendance/work-shifts` | **201** | `HRM-WS-201` |
| DELETE | `/api/hrm/attendance/work-shifts/{id}` | **200** | `HRM-WS-200` |
| GET | `/api/hrm/attendance/records?...` | **200** | empty today |

No seed. No Nest probe as UF.

---

## 7. Screens

| # | Path |
|---|------|
| 01 | `docs/qa/evidence/screens/po-hrm-ui-brand-w3-att-b-qa/01-s23-sheets-list.png` |
| 02 | `…/02-s24-sheets-after-create.png` |
| 03 | `…/03-s25-delete-sheet-dialog.png` |
| 04 | `…/04-s26-records-tab.png` |
| 07 | `…/07-s35-shifts-list.png` |
| 08 | `…/08-s36-shift-form.png` |
| 09 | `…/09-s37-bulk-delete-dialog.png` |
| 10 | `…/10-s38-single-delete-dialog.png` |
| 11 | `…/11-face-hold.png` |
| 12 | `…/12-gps-method.png` |

---

## 8. Residuals (non-blocking for ATT-B chrome PASS)

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| `OBS-S27-S28-EMPTY-RECORDS` | P2 | Default date `2026-08-05` records empty — PATCH + delete-dialog chrome not live-exercised; U65 forbids seed. Retest when FE clock-in creates a row or persona has data. Static: edit Save primary · delete title `text-[20px]`. | **qa** spot / **dev-fe** only if wire regress |
| `OBS-FACE-MODEL-JSON` | P2 | Console «Error loading face recognition models» HTML-as-JSON on Face hold panel — honesty HOLD expected; not Face LIVE | defer GĐ2 / ATT-A residual family |
| `W3-ATT-C` | P1 | Leave cluster remaster — FE already READY; QA DISPATCHED | **qa** `PO-HRM-UI-BRAND-W3-ATT-C-QA` |
| Nav tab orange chips | P2 | Outside ATT-B inventory | later ATT nav batch |

**Did not reopen** Dialog R1 / FE-FOUND-01-R1.

---

## 9. Forbidden honesty

- No seed · no API-only PASS
- **Face not LIVE** · **Attendance not CLOSED** · **remaster program not DONE**
- Did not fail ATT-B solely for W3-ATT-C/D/E residual

---

## completion_report

**Closed:** W3-ATT-B brand QA — U65 browser `ceo@xe.vn` / `main`. S23–S26 + S35–S38 PASS (sheets CRUD FE 201/200+F5; shifts CRUD FE 201/200; AlertDialog titles ≥20; primary CTAs `#1E40AF`; theme-contrast --strict exit 0). Face hold honesty + GPS coords UI kept; no QR invent. S27/S28 mutate chrome **waived** for empty records (P2 OBS). Attendance **not** CLOSED · Face **not** LIVE · remaster **not** DONE.

**Residual:** OBS-S27-S28-EMPTY-RECORDS (P2); ATT-C already in QA flight.

## next_owner

`pm` (ATT-C-QA already DISPATCHED — continue that seat or next open W3 batch)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W3-ATT-C-QA
from_role: pm
to_role: qa
priority: P1
entry_criteria: L0 stack up; U65 zero-seed browser-only; FE READY docs/qa/evidence/po-hrm-ui-brand-w3-att-c.md
note: may already be DISPATCHED — if evidence MISS/stall, RE-DISPATCH same id; do not invent PASS
checks:
  1) pnpm run verify:xevn:theme-contrast -- --strict → exit 0
  2) ceo@xe.vn → HRM→Chấm công leave cluster S42–S49/S61 — sharp chrome; leave-balance/panel GET kept
  3) create/detail/reject/delete leave dialogs titles ≥20; late/early no orange/purple CTA
  4) must_keep: ATT-B sheets/shifts wires; Face hold; no Attendance CLOSED / remaster DONE / seed
exit_criteria: docs/qa/evidence/po-hrm-ui-brand-w3-att-c-qa.md · PASS_TO_PM or FAIL_TO_PM
optional_follow: OBS-S27-S28-EMPTY-RECORDS — when records exist, spot PATCH + delete dialog title ≥20 (P2)
```

## ack_status

**PASS_TO_PM**

## evidence_path

`docs/qa/evidence/po-hrm-ui-brand-w3-att-b-qa.md`
