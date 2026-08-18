# PO-HRM-UI-BRAND-W3-ATT-C-QA — Leave cluster + late/early brand

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-ATT-C-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed · browser-only · U76 hdsd_align |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Portal** | `http://127.0.0.1:5173` · embed `/hr/attendance?portal=1&companyId=main` |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` §8–§10 |
| **Inventory** | W3-ATT-C · S42–S49, S61 |
| **FE handoff** | `docs/qa/evidence/po-hrm-ui-brand-w3-att-c.md` READY_FOR_QA |
| **Prior ATT-B QA** | `docs/qa/evidence/po-hrm-ui-brand-w3-att-b-qa.md` PASS — not reopened |
| **RE-DISPATCH** | prior `1911339f` stall n=2 · evidence MISS — **CLOSED** this run |
| **Dialog R1** | **CLOSED** — titles measured ≥20 bold; **did not reopen** `dialog.tsx` |
| **ack_status** | **PASS_TO_PM** |
| **attendance_closed** | **false** |
| **face_live** | **false** (honesty hold kept) |
| **remaster_program_done** | **false** |
| **commit** | `dc930c5` |

---

## 1. Entry / L0

| Check | Result |
|-------|--------|
| `qc:dev-stack` (entry) | hrm/xbos/portal **200** (Windows UV assert noise on process exit — health lines OK) |
| Seed / API invent | **None** (U65) — 0 mutates |
| Face LIVE invent | **None** |
| Attendance CLOSED invent | **None** |
| QR invent | **None** (W3-ATT-E SKIP) |
| Sheets/shifts ATT-B fight | **None** |

---

## 2. Theme contrast (exit #1)

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
| S42 / S61 | Nghỉ phép list | Chấm công → Nghỉ phép · `att-leave-precision` | 🟢 |
| S43 | Quỹ phép panel | list honesty + create after employee · GET `/leave-balance/panel` | 🟢 |
| S44 | Tạo đơn Dialog | title ≥20 · bar 3px primary · Submit primary · panel wire | 🟢 |
| S45 | Chi tiết Dialog | empty leave list under U65 | 🟡 waived (inferred create title floor) |
| S46 | Từ chối Dialog | empty leave list | 🟡 waived (inferred) |
| S47 | Xóa AlertDialog | empty leave list | 🟡 waived (static `text-[20px] font-bold text-xevn-text`) |
| S48 | Đi muộn/Về sớm list | Quản lý đơn → … · `att-late-early-precision` | 🟢 |
| S49 | Add / Detail / Delete | Add+Detail live ≥20; Delete inferred when no trash | 🟢 / 🟡 Del inferred |
| Face | Hold banner | Clock-In Face | 🟢 honesty |
| QR | invent LIVE | none | 🟢 SKIP (W3-ATT-E) |

---

## 4. Browser click path (U65)

1. Login inject `ceo@xe.vn` → `/hr/attendance?portal=1&companyId=main`
2. **S42/S61** → Nghỉ phép — h2 «Quản lý nghỉ phép» **20px / 700 / #111827**; Tạo CTA `rgb(30,64,175)`; `leave-balance-panel` visible; pale body hits **0**
3. **S44** Tạo đơn → DialogTitle «Tạo yêu cầu nghỉ» **20px/700**; `xevn-dialog-surface` `::before` **3px** `#1E40AF`; Submit primary; select employee
4. **S43** after employee → GET `/api/hrm/attendance/leave-balance/panel?...` **200** · `panelGets=1` (no storm) · `leave-balance-by-type` in dialog · **Hủy** (no mutate)
5. **S45–S47** — no leave row (U65 no seed) → OBS waive; title floor proven on S44
6. **S48** Quản lý đơn → Đi muộn/Về sớm — h2 **20px/700**; Add primary (not orange); purple AI KPI bg **0**
7. **S49** Thêm đơn DialogTitle **20px/700** · Save primary · Hủy; open Chi tiết «Chi tiết đơn» **20px/700** · Hủy; Delete not opened (no trash) → inferred
8. Clock-In → Face hold banner visible · no QR LIVE claim

**Script:** `scripts/qa/_tmp-po-hrm-ui-brand-w3-att-c-qa.mjs`  
**JSON:** `docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-att-c-qa-browser.json`  
**Harness exit:** **0**

---

## 5. Exit checks matrix

| # | AC | Result | Evidence |
|---|-----|--------|----------|
| 1 | theme-contrast --strict | **PASS** | exit 0 · 0 pale |
| 2 | Nghỉ phép sharp; Tạo đơn primary; quỹ panel; no pale body | **PASS** | h2 20/700/#111827; CTA `#1E40AF`; pale=0; panel visible |
| 3 | Create Dialog titles ≥20 · panel wire | **PASS** | title 20px; bar 3px primary; panel GET **200** + by-type in dialog |
| 4 | Late/early — no orange/purple CTA; titles ≥20 | **PASS** | Add `#1E40AF` · purpleAiBg=[] · Add/Detail 20px |
| 5 | must_keep: panel no storm · Face honesty · no QR invent | **PASS** | panelGets=**1** · Face hold · QR SKIP · mutates=**0** |

---

## 6. Network (FE path only)

| Method | URL | Status | Note |
|--------|-----|--------|------|
| GET | `/api/hrm/attendance/leave-balance/panel?company_id=main&employee_id=…&year=2026` | **200** | single GET after employee select |
| — | mutates | **0** | U65 — Hủy create; no leave/LE invent |

No seed. No Nest probe as UF.

---

## 7. Screens

| # | Path |
|---|------|
| 01 | `docs/qa/evidence/screens/po-hrm-ui-brand-w3-att-c-qa/01-s42-leave-shell-panel.png` |
| 02 | `…/02-s44-create-leave-dialog.png` |
| 06 | `…/06-s48-late-early-list.png` |
| 07 | `…/07-s49-late-early-add-dialog.png` |
| 08 | `…/08-s49-late-early-detail-dialog.png` |
| 10 | `…/10-face-hold-honesty.png` |

---

## 8. Residuals (non-blocking for ATT-C chrome PASS)

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| `OBS-S45-NO-ROW` | P2 | No leave request row — detail/reject chrome not live-opened; U65 forbids seed; create DialogTitle ≥20 proven | **qa** spot when rows exist |
| `OBS-S47-NO-ROW` | P2 | Delete AlertDialog not opened; FE `AlertDialogTitle text-[20px] font-bold text-xevn-text` | **qa** spot |
| `OBS-S49-DEL-INFERRED` | P2 | Late/early delete confirm inferred from Add title floor (no trash control on empty/pending UX) | **qa** spot |
| `OBS-FACE-MODEL-JSON` | P2 | Console «Error loading face recognition models» HTML-as-JSON — honesty HOLD expected; not Face LIVE | defer GĐ2 |
| `W3-ATT-D` | P1 | OT/trip/update/shift-change S50–S57 — FE DISPATCHED | **dev-fe** → **qa** |
| `W3-ATT-E` | P1 | Charts · QR clock chrome | after ATT-D |

**Did not reopen** Dialog R1 / FE-FOUND-01-R1 · ATT-B sheets/shifts.

---

## 9. Forbidden honesty

- No seed · no API-only PASS
- **Face not LIVE** · **Attendance not CLOSED** · **remaster program not DONE**
- Did not fail ATT-C solely for W3-ATT-D/E/F residual

---

## completion_report

**Closed:** W3-ATT-C brand QA — U65 browser `ceo@xe.vn` / `main`. theme-contrast --strict exit 0. Leave shell S42/S61 sharp + primary Tạo đơn; create Dialog ≥20 + brand bar; leave-balance/panel GET **200** once (no storm); late/early S48–S49 primary CTA (no orange/purple) + Add/Detail titles ≥20; Face hold honesty. S45–S47 empty-list chrome waived P2 OBS. Prior stall `1911339f` evidence MISS **closed**. Attendance **not** CLOSED · Face **not** LIVE · remaster **not** DONE.

**Residual:** OBS-S45/S47 empty leave rows (P2); ATT-D already DISPATCHED on bus.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W3-ATT-D-QA
from_role: pm
to_role: qa
priority: P0
entry_criteria: L0 stack up; U65 zero-seed browser-only; FE READY docs/qa/evidence/po-hrm-ui-brand-w3-att-d.md (wait READY if ATT-D still in flight)
prior: ATT-C-QA PASS docs/qa/evidence/po-hrm-ui-brand-w3-att-c-qa.md
read_first:
  - docs/qa/evidence/po-hrm-ui-brand-w3-att-d.md
  - docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8–§10
  - docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md W3-ATT-D S50–S57
checks:
  1) pnpm run verify:xevn:theme-contrast -- --strict → exit 0
  2) ceo@xe.vn → OT / công tác / cập nhật công / đổi ca — sharp titles ≥20; primary CTAs #1E40AF; no orange/purple AI chrome; no pale body
  3) Dialog/AlertDialog titles ≥20 bold text-xevn-text; brand bar kept
  4) must_keep: leave-balance/panel wire (ATT-C); Face honesty; no QR invent (ATT-E); no Attendance CLOSED / remaster DONE / seed
exit_criteria: docs/qa/evidence/po-hrm-ui-brand-w3-att-d-qa.md · PASS_TO_PM or FAIL
cấm: seed · Nest probe as UF · claim Attendance CLOSED · remaster program DONE · fail for ATT-E/F residual
optional_parallel: if ATT-D still coding, do not invent ATT-D-QA PASS; when ATT-E FE READY → QA PO-HRM-UI-BRAND-W3-ATT-E-QA (QR clock chrome only — no LIVE invent)
```

## ack_status

**PASS_TO_PM**

## evidence_path

`docs/qa/evidence/po-hrm-ui-brand-w3-att-c-qa.md`
