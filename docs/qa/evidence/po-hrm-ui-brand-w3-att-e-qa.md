# PO-HRM-UI-BRAND-W3-ATT-E-QA — Charts · QR clock · weekly · reports brand

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-ATT-E-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed · browser-only · U76 hdsd_align |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Base** | `http://127.0.0.1:8080` (portal `:5173` ECONNREFUSED → **hrm_fe fallback**) · `/hr/attendance?companyId=main` |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` §8–§10 |
| **Inventory** | W3-ATT-E · S05–S08, S13–S14, S29–S34, S62–S63 |
| **FE handoff** | `docs/qa/evidence/po-hrm-ui-brand-w3-att-e.md` READY_FOR_QA |
| **Prior ATT-D QA** | `docs/qa/evidence/po-hrm-ui-brand-w3-att-d-qa.md` PASS |
| **Prior ATT-F QA** | `docs/qa/evidence/po-hrm-ui-brand-w3-att-f-qa.md` PASS — **not retested** (GPS/settings out of scope) |
| **RE-DISPATCH** | stall#3 evidence MISS (512edeab n=1) — **CLOSED** this run (fresh harness exit 0 + **this file rewritten BEFORE bus**) |
| **ack_status** | **PASS_TO_PM** |
| **attendance_closed** | **false** |
| **face_live** | **false** (honesty hold kept) |
| **prop_03e_qr_card** | **SKIP** (`att-prop-03e-qr-card-skip` visible · EmployeeQRCard LIVE=false) |
| **remaster_program_done** | **false** |
| **commit** | `dc930c5` |
| **Harness endedAt** | `2026-08-05T04:11:32.242Z` (UTC) |

---

## 1. Entry / L0

| Check | Result |
|-------|--------|
| `qc:dev-stack` (pre) | hrm/xbos/portal **200** (Windows UV assert noise on process exit — health lines OK) |
| Harness L0 probe | hrm **200** · xbos **200** · portal **ECONNREFUSED** · hrm_fe **200** → BASE `:8080` |
| Seed / API invent | **None** (U65) — mutates=**0** |
| Face LIVE invent | **None** |
| Attendance CLOSED invent | **None** |
| EmployeeQRCard invent LIVE | **None** (PROP-03e SKIP honesty) |
| Nest as UF | **None** |
| ATT-F GPS/settings fight | **None** |

---

## 2. Theme contrast (AC #1)

```text
pnpm run verify:xevn:theme-contrast -- --strict
→ exit 0
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563
[xevn-theme-contrast] STRICT PASS — 0 pale hits (scanned 598)
```

Raw: `docs/qa/evidence/_tmp-att-e-qa-theme-contrast.txt`

---

## 3. HDSD inventory (U76)

| # | Surface | Menu / path | Present |
|---|---------|-------------|---------|
| S05 | Leave-by-month chart | Tổng quan · `att-chart-leave-month` | 🟢 20/700/#111827 |
| S06 | Leave-by-dept chart | `att-chart-leave-dept` | 🟢 20/700 |
| S07 | Leave-type pie | `att-chart-leave-type` · piePurple=[] | 🟢 no purple |
| S08 | Late/early list | `att-chart-late-early-list` | 🟢 20/700 |
| S13 | QR clock | Clock-In → Mã QR · `att-qr-clock-precision` | 🟢 title 20/700 · start CTA `#1E40AF` |
| S14 | QR confirm Dialog | `att-qr-confirm-dialog` | 🟢 static `text-[20px] font-bold` · live N/A (no invent scan) |
| PROP-03e | QR card | `att-prop-03e-qr-card-skip` | 🟢 SKIP · EmployeeQRCard=0 |
| S29 | Records export | Dữ liệu chấm công · `att-export-dialog-precision` | 🟢 DialogTitle 20/700 |
| S30 | Date filter | `att-records-date-filter` | 🟢 |
| S31 | Weekly grid | Chấm công tuần · `att-weekly-precision` | 🟢 h2 20/700 · reload primary |
| S32 | Weekly cell Dialog | `att-weekly-cell-dialog` | 🟡 OBS empty cell · static ≥20 |
| S33 | Weekly stubs | `att-weekly-stub-pencil` | 🟢 honesty |
| S34 | Summary alias | Tổng hợp công → same records h2 | 🟢 |
| S62 | Reports | Báo cáo · `att-reports-precision` | 🟢 h2 20/700 · no purple/blue-orange AI chrome |
| S63 | Reports Xuất | same export dialog | 🟢 DialogTitle 20/700 |
| Face | Hold banner | Clock-In → Face | 🟢 honesty HOLD |

---

## 4. Browser click path (U65)

1. Login inject `ceo@xe.vn` → `/hr/attendance?companyId=main` (hrm_fe `:8080`)
2. **S05–S08** overview charts — 4× titles **20px / 700 / #111827**; pie purple hits **0**; purple AI bg **0**
3. Clock-In → **Mã QR** — CardTitle «Quét mã QR chấm công» **20/700**; start scan CTA `rgb(30,64,175)`; **`att-prop-03e-qr-card-skip` visible**; EmployeeQRCard LIVE=**false**
4. Face method → hold banner visible (not LIVE)
5. Menu → **Dữ liệu chấm công** — h2 ≥20; date filter; Xuất → DialogTitle **20/700** · `att-export-dialog-precision`; Hủy
6. Menu → **Tổng hợp công** — alias same records title ≥20
7. Menu → **Chấm công tuần** — h2 ≥20; reload primary; stub pencil; cell Dialog empty OBS + static floor
8. Tab **Báo cáo** — h2 ≥20; Xuất DialogTitle ≥20; purple AI **0**; mutates=**0**

**Script:** `scripts/qa/_tmp-po-hrm-ui-brand-w3-att-e-qa.mjs`  
**JSON:** `docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-att-e-qa-browser.PASS.json`  
**Harness exit:** **0** · `failReasons=[]` · checks 8/8 `pass:true` · screens **9**

---

## 5. Exit checks matrix

| # | AC | Result | Evidence |
|---|-----|--------|----------|
| 1 | theme-contrast --strict | **PASS** | exit 0 · 0 pale |
| 2 | Overview charts S05–S08 titles ≥20 · pie no purple · testids `att-chart-*` | **PASS** | 4× 20/700/#111827 · piePurple=[] · purpleAiBg=[] |
| 3 | QR clock S13–S14 Dialog ≥20 · PROP-03e SKIP · NO EmployeeQRCard LIVE | **PASS** | S13 CardTitle 20/700 · S14 static DialogTitle floor · `att-prop-03e-qr-card-skip` · employeeQrLive=false |
| 4 | Export/date/weekly/cell/summary S29–S34 chrome sharp | **PASS** | export Dialog 20/700 · date filter · weekly 20/700 + stubs · S34 alias |
| 5 | Reports S62–S63 title ≥20 · no blue/orange AI chrome | **PASS** | reports h2 20/700 · purpleAiBg=[] · export Dialog 20/700 |
| 6 | Face HOLD · Attendance not CLOSED · remaster not DONE | **PASS** | face hold banner · honesty flags all false claims |

---

## 6. Network (FE path only)

| Method | URL | Status | Note |
|--------|-----|--------|------|
| GET | `/api/hrm/attendance/overview?company_id=main&year=2026` | **200** | S05–S08 |
| GET | `/api/hrm/attendance/records?…` | **200** | S29/S34 |
| GET | `/api/hrm/face-data?company_id=main` | **200** | Face HOLD path (not LIVE claim) |
| — | mutates | **0** | U65 — export dialog Hủy only |

No seed. No Nest probe as UF. ATT-F work-sites/GPS not opened.

---

## 7. Screens (this harness run)

| # | Path |
|---|------|
| 01 | `docs/qa/evidence/screens/po-hrm-ui-brand-w3-att-e-qa/01-s05-s08-overview-charts.png` |
| 02 | `…/02-s13-qr-clock-prop03e-skip.png` |
| 03 | `…/03-face-hold.png` |
| 04 | `…/04-s29-export-dialog.png` · `…/04-s29-s30-records.png` |
| 05 | `…/05-s34-summary-alias.png` |
| 06 | `…/06-s31-weekly.png` |
| 07 | `…/07-s62-reports.png` · `…/07-s63-reports-export-dialog.png` |

---

## 8. Residuals (non-blocking)

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| `OBS-S14-CONFIRM-NEEDS-SCAN` | P2 | Live QR confirm Dialog not opened — U65 forbids invent scan; DialogTitle `text-[20px] font-bold` static PASS | defer device/camera lane |
| `OBS-S32-CELL-EMPTY` | P2 | Weekly cell Dialog not opened (no clickable cell); static `att-weekly-cell-dialog` title floor PASS | qa spot when cells allow |
| Portal `:5173` | OBS | Harness used hrm_fe `:8080` fallback when portal ECONNREFUSED | devops optional |

**Did not** invent PROP-03e card · Face LIVE · Attendance CLOSED · remaster DONE · fight ATT-F GPS.

---

## 9. Forbidden honesty

- No seed · no API-only PASS as UF
- **Face not LIVE** · **Attendance not CLOSED** · **remaster program not DONE**
- **PROP-03e** remains SKIP (not invent LIVE QR card)
- S14 live confirm deferred honestly (static floor) — not FAIL invent scan
- ATT-F settings/GPS **not** retested

---

## completion_report

**Closed:** W3-ATT-E brand QA stall#3 — U65 browser `ceo@xe.vn` / `main` on hrm_fe `:8080`. theme-contrast --strict exit 0. S05–S08 chart titles 20/700 + no purple pie; S13 QR chrome + PROP-03e SKIP (EmployeeQRCard=0); S14 DialogTitle static ≥20; S29/S63 export DialogTitle ≥20; S30 date; S31–S34 weekly/summary; S62 reports ops-dense no AI chrome; Face HOLD; mutates=0. Evidence file **rewritten** this seat (prior MISS closed). Attendance **not** CLOSED · Face **not** LIVE · remaster **not** DONE · PROP-03e **not** invent.

**Residual:** P2 S14 live confirm needs real QR scan; P2 S32 empty cell Dialog; portal `:5173` down OBS (hrm_fe fallback OK).

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W3-ATT-G1 (or next open W3 ATT seat)
from_role: pm
to_role: dev-fe / qa per backlog
priority: P1
entry_criteria: ATT-E-QA PASS docs/qa/evidence/po-hrm-ui-brand-w3-att-e-qa.md; ATT-D/F prior green
prior: ATT-E-QA PASS_TO_PM (stall#3 evidence MISS CLOSED)
read_first:
  - docs/qa/evidence/po-hrm-ui-brand-w3-att-e-qa.md
  - docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8–§10
checks:
  1) Do not reopen ATT-E chrome without regression harness
  2) Keep Face HOLD · PROP-03e SKIP · Attendance not CLOSED · remaster not DONE
  3) If ATT-G1 already DISPATCHED — wait READY_FOR_QA; NO RE-DISPATCH ATT-E-QA
exit_criteria: bus DISPATCHED next seat with evidence_path
cấm: seed · invent QR card · Face LIVE · Attendance CLOSED · remaster DONE
```

## ack_status

**PASS_TO_PM**

## evidence_path

`docs/qa/evidence/po-hrm-ui-brand-w3-att-e-qa.md`
