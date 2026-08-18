# PO-HRM-UI-BRAND-W3-ATT-F-QA — Settings emp · rules · GPS sites · shell remaster

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-ATT-F-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed · browser-only · U76 hdsd_align |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Portal** | `http://127.0.0.1:5173` · embed `/hr/attendance?portal=1&companyId=main` |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` §8–§10 |
| **Inventory** | W3-ATT-F · S64–S65, S67–S68, S72–S75, S90 |
| **FE handoff** | `docs/qa/evidence/po-hrm-ui-brand-w3-att-f.md` READY_FOR_QA |
| **Prior ATT-D QA** | `docs/qa/evidence/po-hrm-ui-brand-w3-att-d-qa.md` PASS |
| **RE-DISPATCH** | prior stall evidence MISS — **CLOSED** this run (fresh harness + this file) |
| **ack_status** | **PASS_TO_PM** |
| **attendance_closed** | **false** |
| **face_live** | **false** (GĐ1 honesty banner kept) |
| **remaster_program_done** | **false** |
| **commit** | `dc930c5` |
| **Harness endedAt** | `2026-08-05T04:06:26Z` (UTC) |

---

## 1. Entry / L0

| Check | Result |
|-------|--------|
| `qc:dev-stack` (entry) | hrm/xbos/portal **200** (Windows UV assert noise on process exit — health lines OK) |
| `qc:fe-be-health` | **ALL PASS** |
| Harness L0 probe | hrm/xbos/portal/hrm_fe **200** |
| Seed / API invent | **None** (U65) — mutates=**0** |
| Face LIVE invent | **None** |
| Attendance CLOSED invent | **None** |
| remaster DONE invent | **None** |
| Nest probe as UF | **None** |

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
| S64 | Settings emp | Thiết lập → Nhân viên · `att-settings-emp-precision` | 🟢 |
| S65 | Import modal | Nhập khẩu → DialogTitle ≥20 | 🟢 |
| S67 | Rules Chung | Quy định → Chung · `att-rules-general-precision` | 🟢 |
| S68 | Rules Công chuẩn | → Công chuẩn · `att-rules-standard-precision` | 🟢 |
| S72 | Rules Thiết bị | → Thiết bị · `att-rules-device-precision` | 🟢 |
| S73 | Rules Ứng dụng | → Ứng dụng · Face GĐ1 banner | 🟢 |
| S74 | GPS panel | App → Địa điểm GPS · `att-gps-sites-card` | 🟢 |
| S75 | GPS add/edit Dialog | Thêm/Sửa · lat/lng/radius · title ≥20 | 🟢 |
| S90 | AttendanceEntry | Loader `text-xevn-primary` (static source) | 🟢 |
| Shell | Settings sidebar | `att-settings-shell-precision` active `#1E40AF` | 🟢 |

---

## 4. Browser click path (U65)

1. Login inject `ceo@xe.vn` → `/hr/attendance?portal=1&companyId=main`
2. Top tab **Thiết lập** → `att-settings-shell-precision` visible
3. **S64** Nhân viên — h2 «Nhân viên» **20px / 700 / #111827**; refresh CTA `rgb(30,64,175)`; orangeHits=[]
4. **S65** Nhập khẩu → DialogTitle «Import nhân viên từ Excel» **20px/700**; Hủy (no commit)
5. Sidebar **Quy định chấm công** — active sidebar primary; rules h2 **20/700**; orangeHits=[]
6. **S67** Chung — Lưu `rgb(30,64,175)`; work-day chips primary; orangeHits=[]
7. **S68** Công chuẩn — Lưu primary; radio `accent-xevn-primary`; orangeHits=[]
8. **S72** Thiết bị — step badges primary; orangeHits=[]
9. **S73** Ứng dụng — Face GĐ1 honesty banner + disabled toggle; orangeHits=[]; face_live_claimed=false
10. **S74/S75** GPS — Add CTA primary; Add Dialog «Thêm vị trí» **20/700** + lat/lng/radius; Edit «Sửa vị trí» **20/700** (1 row); Hủy; mutates=**0**
11. **S90** AttendanceEntry loader `text-xevn-primary` (static; cold flash deferred)

**Script:** `scripts/qa/_tmp-po-hrm-ui-brand-w3-att-f-qa.mjs`  
**JSON:** `docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-att-f-qa-browser.PASS.json`  
**Harness exit:** **0** · `failReasons=[]` · checks 14/14 `pass:true`

---

## 5. Exit checks matrix

| # | AC | Result | Evidence |
|---|-----|--------|----------|
| 1 | theme-contrast --strict | **PASS** | exit 0 · 0 pale |
| 2 | settings sidebar + rules tabs/CTAs primary #1E40AF — no orange settings chrome | **PASS** | sidebar active primary; Lưu/Add `rgb(30,64,175)`; orangeHits=[] on S64/S67–S73/S74 |
| 3 | S65 import DialogTitle ≥20; S75 GPS DialogTitle ≥20 | **PASS** | Import 20/700; GPS Add+Edit 20/700 |
| 4 | work-sites wires intact (chrome-only remaster) | **PASS** | GET work-sites **200**; Add/Edit dialogs + lat/lng/radius; remove testids present; mutates=**0** (RO cancel) |
| 5 | Face GĐ1 honesty; Attendance not CLOSED; remaster not DONE | **PASS** | face honesty banner; honesty_gates all false claims |

---

## 6. Network (FE path only)

| Method | URL | Status | Note |
|--------|-----|--------|------|
| GET | `/api/hrm/attendance/rules?company_id=main` | **200** | settings rules |
| GET | `/api/hrm/attendance/work-sites?company_id=main` | **200** | S74 list wire |
| GET | `/api/hrm/employees?company_id=main&…` | **200** | S64 emp list |
| — | mutates | **0** | U65 — Hủy import/GPS; no invent CRUD |

No seed. No Nest probe as UF.

---

## 7. Screens (this harness run)

| # | Path |
|---|------|
| 01 | `docs/qa/evidence/screens/po-hrm-ui-brand-w3-att-f-qa/01-settings-shell.png` |
| 02 | `…/02-s64-settings-emp.png` |
| 03 | `…/03-s65-import-dialog.png` |
| 04 | `…/04-rules-shell.png` |
| 05 | `…/05-s67-rules-general.png` |
| 06 | `…/06-s68-rules-standard.png` |
| 07 | `…/07-s72-rules-device.png` |
| 08 | `…/08-s73-rules-app-face.png` |
| 09 | `…/09-s74-gps-panel.png` |
| 10 | `…/10-s75-gps-add-dialog.png` |
| 11 | `…/11-s75-gps-edit-dialog.png` |

---

## 8. Residuals (non-blocking)

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| `OBS-TOP-NAV-ORANGE` | P2 | Attendance top-tab pill orange outside ATT-F settings shell (FE residual) | later shell / ATT-E |
| `W3-ATT-E-QA` | P1 | Charts/QR clock — FE READY; QA already on bus | **qa** (in-flight) |
| `W3-ATT-G1` | P1 | Customize stub chrome depth | **PM → G1** after ATT-E |

**Did not reopen** Dialog R1 · LeaveTab ATT-C · OT ATT-D · ATT-E charts.

---

## 9. Forbidden honesty

- No seed · no API-only PASS
- **Face not LIVE** · **Attendance not CLOSED** · **remaster program not DONE**
- Did not break work-sites CRUD surface (open Add/Edit + lat/lng/radius; cancel only)
- Top-nav orange pill OUT of ATT-F scope — not FAIL invent

---

## completion_report

**Closed:** W3-ATT-F brand QA — U65 browser `ceo@xe.vn` / `main`. theme-contrast --strict exit 0. Settings shell sidebar primary `#1E40AF`; S64 emp title 20/700 + refresh primary; S65 Import DialogTitle 20/700; S67–S68 Lưu primary + chips/accent; S72–S73 no orange settings chrome; Face GĐ1 honesty kept; S74–S75 GPS Add/Edit titles ≥20 + lat/lng/radius wires; work-sites GET 200; mutates=0; S90 entry loader primary (static). RE-DISPATCH stall evidence MISS **closed** with this evidence file. Attendance **not** CLOSED · Face **not** LIVE · remaster **not** DONE.

**Residual:** P2 top-nav orange outside settings; ATT-E-QA parallel; G1 customize next after ATT-E.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W3-ATT-E-QA
from_role: pm
to_role: qa
priority: P0
entry_criteria: L0 stack up; U65 zero-seed browser-only; FE READY docs/qa/evidence/po-hrm-ui-brand-w3-att-e.md (already READY_FOR_QA on bus)
prior: ATT-F-QA PASS docs/qa/evidence/po-hrm-ui-brand-w3-att-f-qa.md (stall CLOSED)
read_first:
  - docs/qa/evidence/po-hrm-ui-brand-w3-att-e.md
  - docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8–§10
  - docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md W3-ATT-E
checks:
  1) pnpm run verify:xevn:theme-contrast -- --strict → exit 0
  2) ceo@xe.vn → HRM→Chấm công → QR clock / charts / weekly / reports in-scope — sharp titles ≥20; primary #1E40AF; no orange/purple AI chrome
  3) must_keep: Face honesty HOLD; ATT-F settings/GPS not fought; PROP-03e EmployeeQRCard SKIP; no invent QR LIVE
  4) WRITE evidence docs/qa/evidence/po-hrm-ui-brand-w3-att-e-qa.md BEFORE finish
exit_criteria: PASS_TO_PM or FAIL with surface_id
cấm: seed · Nest probe as UF · claim Attendance CLOSED · remaster program DONE · Face LIVE invent · break ATT-F work-sites
alt_if_ATT-E_QA_already_PASS: Task dev-fe PO-HRM-UI-BRAND-W3-ATT-G1 (customize stub chrome) → qa G1
```

## ack_status

**PASS_TO_PM**

## evidence_path

`docs/qa/evidence/po-hrm-ui-brand-w3-att-f-qa.md`
