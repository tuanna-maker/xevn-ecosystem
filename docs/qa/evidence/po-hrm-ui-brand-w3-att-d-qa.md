# PO-HRM-UI-BRAND-W3-ATT-D-QA — OT / trip / update / shift-change brand

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-ATT-D-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed · browser-only · U76 hdsd_align |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Portal** | `http://127.0.0.1:5173` · embed `/hr/attendance?portal=1&companyId=main` |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` §8–§10 |
| **Inventory** | W3-ATT-D · S50–S57 |
| **FE handoff** | `docs/qa/evidence/po-hrm-ui-brand-w3-att-d.md` READY_FOR_QA (stall#2 CLOSED) |
| **Prior ATT-C QA** | `docs/qa/evidence/po-hrm-ui-brand-w3-att-c-qa.md` PASS — LeaveTab spot only |
| **RE-DISPATCH** | prior `b192a400` stall#2 n=2 · evidence MISS — **CLOSED** this run (fresh harness + this file) |
| **Dialog R1** | **CLOSED** — titles measured ≥20 bold; **did not reopen** `dialog.tsx` |
| **ack_status** | **PASS_TO_PM** |
| **attendance_closed** | **false** |
| **face_live** | **false** (honesty hold kept) |
| **remaster_program_done** | **false** |
| **commit** | `dc930c5` |
| **Harness endedAt** | `2026-08-05T03:55:49Z` (UTC) |

---

## 1. Entry / L0

| Check | Result |
|-------|--------|
| `qc:dev-stack` (entry) | hrm/xbos/portal **200** (Windows UV assert noise on process exit — health lines OK) |
| Harness L0 probe | hrm/xbos/portal/hrm_fe **200** |
| Seed / API invent | **None** (U65) — mutates=**0** |
| Face LIVE invent | **None** |
| Attendance CLOSED invent | **None** |
| QR invent as FAIL | **None** (W3-ATT-E SKIP) |
| LeaveTab ATT-C fight | **None** (spot only) |

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
| S50 | OT list | Quản lý đơn → Đăng ký làm thêm · `att-ot-precision` | 🟢 |
| S51 | OT Add/Detail/Delete | Add live ≥20 + bar; Detail live ≥20; Delete empty OBS | 🟢 / 🟡 Del |
| S52 | Trip list | → Đề nghị đi công tác · `att-trip-precision` | 🟢 |
| S53 | Trip Add/Detail/Delete | Add live ≥20 + bar; Detail/Delete empty OBS | 🟢 / 🟡 |
| S54 | Update list | → Đề nghị cập nhật công · `att-update-precision` | 🟢 |
| S55 | Update Add/Detail/Delete | Add ≥20 + HH:mm; Detail live; Delete OBS | 🟢 / 🟡 Del |
| S56 | Shift-change list | → Đề nghị đổi ca · `att-shift-change-precision` | 🟢 |
| S57 | Shift Add/Detail/Delete | Add live ≥20 + bar; Detail/Delete empty OBS | 🟢 / 🟡 |
| Leave | ATT-C spot | `att-leave-precision` + `leave-balance-panel` | 🟢 |
| Face | Hold banner | Clock-In Face | 🟢 honesty |
| QR | invent LIVE | none | 🟢 SKIP (W3-ATT-E) |

---

## 4. Browser click path (U65)

1. Login inject `ceo@xe.vn` → `/hr/attendance?portal=1&companyId=main`
2. **S50** Quản lý đơn → Đăng ký làm thêm — h2 «Quản lý tăng ca» **20px / 700 / #111827**; Add CTA `rgb(30,64,175)`; purple AI KPI bg **0**; pale **0**
3. **S51** Thêm đơn tăng ca → DialogTitle **20px/700**; brand bar **3px** `#1E40AF`; Submit primary; Hủy; Detail «Chi tiết đơn tăng ca» **20px/700** (row existed); Delete no trash → OBS inferred
4. **S52–S53** Công tác — list h2 **20/700**; Add primary; Add Dialog ≥20 + bar; Detail/Delete empty OBS
5. **S54–S55** Cập nhật công — list h2 **20/700**; Add Dialog ≥20 + bar; `hhMmOk=true`; Detail «Chi tiết đề nghị» live ≥20; Delete OBS
6. **S56–S57** Đổi ca — list h2 **20/700**; Add Dialog ≥20 + bar; Detail/Delete empty OBS
7. LeaveTab spot — h2 «Quản lý nghỉ phép» ≥20 + `leave-balance-panel` visible (ATT-C not regressed)
8. Clock-In → Face hold banner · no QR LIVE claim · mutates=**0**

**Script:** `scripts/qa/_tmp-po-hrm-ui-brand-w3-att-d-qa.mjs`  
**JSON:** `docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-att-d-qa-browser.json`  
**Harness exit:** **0** · `failReasons=[]` · checks 19/19 `pass:true`

---

## 5. Exit checks matrix

| # | AC | Result | Evidence |
|---|-----|--------|----------|
| 1 | theme-contrast --strict | **PASS** | exit 0 · 0 pale |
| 2 | OT/trip/update/shift titles ≥20 bold; CTA primary #1E40AF; no orange/purple chrome | **PASS** | 4× h2 20/700/#111827; Add `rgb(30,64,175)`; purpleAiBg=[]; addOrange=false |
| 3 | Dialog Add/Detail title ≥20 + brand bar; Alert delete ≥20 | **PASS** | Add titles 20px + bar 3px primary; Detail live OT+Update; Delete empty OBS inferred static `text-[20px]` |
| 4 | LeaveTab/panel not regressed; Face hold; empty-list OBS OK | **PASS** | leave spot 🟢 · Face hold · mutates=**0** · OBS P2 only |

---

## 6. Network (FE path only)

| Method | URL | Status | Note |
|--------|-----|--------|------|
| GET | `/api/hrm/attendance/overtime-requests?company_id=main` | **200** | S50 |
| GET | `/api/hrm/attendance/business-trip-requests?company_id=main` | **200** | S52 |
| GET | `/api/hrm/attendance/update-requests?company_id=main` | **200** | S54 |
| GET | `/api/hrm/attendance/shift-change-requests?company_id=main` | **200** | S56 |
| — | mutates | **0** | U65 — Hủy create; no invent |

No seed. No Nest probe as UF.

---

## 7. Screens (this harness run)

| # | Path |
|---|------|
| 01 | `docs/qa/evidence/screens/po-hrm-ui-brand-w3-att-d-qa/01-s50-ot-list.png` |
| 01b | `…/01-s50-ot-add-dialog.png` |
| 01c | `…/01-s50-ot-detail-dialog.png` |
| 02 | `…/02-s52-trip-list.png` · `…/02-s52-trip-add-dialog.png` |
| 03 | `…/03-s54-update-list.png` · `…/03-s54-update-add-dialog.png` · `…/03-s54-update-detail-dialog.png` |
| 04 | `…/04-s56-shift-list.png` · `…/04-s56-shift-add-dialog.png` |
| 05 | `…/05-leave-untouched-spot.png` |
| 06 | `…/06-face-hold-honesty.png` |

---

## 8. Residuals (non-blocking for ATT-D chrome PASS)

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| `OBS-*-DELETE-EMPTY` | P2 | OT/trip/update/shift Delete Alert not opened (no trash on empty/pending UX); FE `AlertDialogTitle text-[20px] font-bold` floor | **qa** spot when rows allow |
| `OBS-trip/shift-DETAIL-EMPTY` | P2 | Trip/shift Detail not live-opened; title floor from Add ≥20 | **qa** spot |
| `OBS-FACE-MODEL-JSON` | P2 | Console «Error loading face recognition models» HTML-as-JSON — honesty HOLD expected; not Face LIVE | defer GĐ2 |
| `W3-ATT-E` | P1 | QR/charts remaster — already DISPATCHED on bus | **dev-fe** → **qa** |
| `W3-ATT-F` | P1 | Work-sites GPS remaster | later seat |

**Did not reopen** Dialog R1 · LeaveTab ATT-C · ATT-B sheets.

---

## 9. Forbidden honesty

- No seed · no API-only PASS
- **Face not LIVE** · **Attendance not CLOSED** · **remaster program not DONE**
- Did not fail ATT-D solely for W3-ATT-E/F or empty-list OBS
- Did not invent QR LIVE / FAIL for QR out of scope

---

## completion_report

**Closed:** W3-ATT-D brand QA — U65 browser `ceo@xe.vn` / `main`. theme-contrast --strict exit 0. S50–S57 list shells sharp titles 20/700 + primary Add `#1E40AF`; Add Dialog ≥20 + 3px brand bar; OT+Update Detail live ≥20; update HH:mm kept; LeaveTab/panel spot not regressed; Face hold honesty; mutates=0. Empty-list Delete (and trip/shift Detail) P2 OBS. RE-DISPATCH `b192a400` stall#2 evidence MISS **closed** with this evidence file. Attendance **not** CLOSED · Face **not** LIVE · remaster **not** DONE.

**Residual:** P2 empty-list delete/detail OBS; Face model console noise (HOLD); W3-ATT-E already DISPATCHED; W3-ATT-F later.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W3-ATT-E-QA
from_role: pm
to_role: qa
priority: P1
entry_criteria: L0 stack up; U65 zero-seed browser-only; wait FE READY docs/qa/evidence/po-hrm-ui-brand-w3-att-e.md (ATT-E already DISPATCHED)
prior: ATT-D-QA PASS docs/qa/evidence/po-hrm-ui-brand-w3-att-d-qa.md (stall#2 CLOSED)
read_first:
  - docs/qa/evidence/po-hrm-ui-brand-w3-att-e.md
  - docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8–§10
  - docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md W3-ATT-E
checks:
  1) pnpm run verify:xevn:theme-contrast -- --strict → exit 0
  2) ceo@xe.vn → HRM→Chấm công → QR clock / charts in-scope — sharp titles ≥20; primary #1E40AF; no orange/purple AI chrome
  3) must_keep: Face honesty HOLD (not LIVE); ATT-D S50–S57 not regressed; no invent QR LIVE as product complete
  4) WRITE evidence docs/qa/evidence/po-hrm-ui-brand-w3-att-e-qa.md BEFORE finish
exit_criteria: PASS_TO_PM or FAIL with surface_id
cấm: seed · Nest probe as UF · claim Attendance CLOSED · remaster program DONE · Face LIVE invent · fail ATT-D for empty-list OBS
```

## ack_status

**PASS_TO_PM**

## evidence_path

`docs/qa/evidence/po-hrm-ui-brand-w3-att-d-qa.md`
