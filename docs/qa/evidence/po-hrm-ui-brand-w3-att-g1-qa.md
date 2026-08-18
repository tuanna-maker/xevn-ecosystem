# PO-HRM-UI-BRAND-W3-ATT-G1-QA — Stub / GĐ2 / ALIAS + Face honesty remaster

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-ATT-G1-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed · browser-only · U76 hdsd_align |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Base** | `http://127.0.0.1:8080` (portal `:5173` ECONNREFUSED → **hrm_fe fallback**) · `/hr/attendance?companyId=main` |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` §8–§10 |
| **Inventory** | W3-ATT-G1 · S04, S17–S19, S39–S41, S58–S60, S66, S69–S70 |
| **FE handoff** | `docs/qa/evidence/po-hrm-ui-brand-w3-att-g1.md` READY_FOR_QA |
| **Prior ATT-E QA** | `docs/qa/evidence/po-hrm-ui-brand-w3-att-e-qa.md` PASS |
| **Prior ATT-F QA** | `docs/qa/evidence/po-hrm-ui-brand-w3-att-f-qa.md` PASS — **not retested** |
| **RE-DISPATCH** | stall#2 evidence MISS (d6a7fd2d / 3ef7f4af) — **CLOSED** this seat (fresh harness exit 0 + **this file rewritten BEFORE bus**) |
| **ack_status** | **PASS_TO_PM** |
| **attendance_closed** | **false** |
| **face_live** | **false** (GĐ2-HOLD honesty kept) |
| **prop_03e** | **SKIP** (`att-prop-03e-qr-card-skip` visible · EmployeeQRCard LIVE=false) |
| **remaster_program_done** | **false** |
| **commit** | `dc930c5` |
| **Harness endedAt** | `2026-08-05T04:19:33.975Z` (UTC) |

---

## 1. Entry / L0

| Check | Result |
|-------|--------|
| Harness L0 probe | hrm **200** · xbos **200** · portal **ECONNREFUSED** · hrm_fe **200** → BASE `:8080` |
| Seed / API invent | **None** (U65) — mutates=**0** |
| Face LIVE invent | **None** |
| QR LIVE / PROP-03e invent | **None** |
| Attendance CLOSED invent | **None** |
| remaster DONE invent | **None** |
| Nest probe as UF | **None** |
| FE re-edit this seat | **None** (QA harness + evidence only) |

---

## 2. Theme contrast (AC #1)

```text
pnpm run verify:xevn:theme-contrast -- --strict
→ exit 0
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563
[xevn-theme-contrast] STRICT PASS — 0 pale hits (scanned 598)
```

Raw: `docs/qa/evidence/_tmp-att-g1-qa-theme-contrast.txt`

---

## 3. HDSD inventory (U76)

| # | Surface | Menu / path | Present |
|---|---------|-------------|---------|
| S04 | Overview customize HOLD | Tổng quan · `att-overview-customize-hold` disabled + GĐ2 | 🟢 disabled · badge · purpleHits=[] |
| S17 | Face hold banner | Chấm công → Face ID · `att-faceid-hold-banner` | 🟢 title **20/700/#111827** |
| S18–S19 | Face shell disabled | `att-faceid-shell-disabled` + `att-faceid-gd2-badge` | 🟢 `pointer-events:none` · face_live=0 |
| S39 | Shift copy stub | Ca làm việc → list · `att-shift-copy-stub` | 🟢 empty list → static `disabled` floor (U65) |
| S40 | Schedule GĐ2 | → Lịch phân ca · `shifts-schedule-hold` | 🟢 title 20/700 · GĐ2 badge |
| S41 | OT GĐ2 | → Ca làm thêm · `shifts-overtime-hold` | 🟢 title 20/700 · GĐ2 badge |
| S58 | Leave summary ALIAS | Quản lý đơn → leave-summary | 🟢 ALIAS honesty 20/700 |
| S59 | Compensatory ALIAS | → compensatory-summary | 🟢 ALIAS honesty 20/700 |
| S60 | Leave plan ALIAS+GĐ2 | → leave-plan | 🟢 ALIAS + GĐ2 · 20/700 |
| S66 | Filter/Download stubs | Thiết lập → Nhân viên | 🟢 both disabled · mutatesDelta=0 |
| S69–S70 | Rules customize | Quy định → Tùy chỉnh | 🟢 hold 20/700 · Reset/Preview/Add disabled |
| PROP-03e | QR card SKIP | Clock → QR · `att-prop-03e-qr-card-skip` | 🟢 SKIP · EmployeeQRCard=0 |

---

## 4. Browser click path (U65)

1. Login API `ceo@xe.vn` → inject token → `/hr/attendance?companyId=main` on hrm_fe `:8080`
2. **S04** Tổng quan — customize disabled + GĐ2; force-click no mutate
3. Clock-in → Face ID — hold banner **20px/700/#111827** + GĐ2; shell `pointer-events:none`; face_live=0
4. QR method spot — PROP-03e skip visible; EmployeeQRCard=0
5. **S40** Ca làm việc → Lịch phân ca — hold title 20/700; GĐ2; no purple
6. **S41** → Ca làm thêm — same chrome
7. **S39** → Danh sách ca — GET work-shifts **200** · rows=0 → static floor `disabled` + `att-shift-copy-stub` + `shiftCopyHold` (U65 no invent rows)
8. **S58–S60** Quản lý đơn → leave-summary / compensatory / leave-plan — ALIAS honesty 20/700; leave-plan +GĐ2
9. **S66** Thiết lập → Nhân viên — Filter/Download stubs disabled; force-click mutatesDelta=0
10. **S69–S70** Quy định → Tùy chỉnh — hold banner 20/700 GĐ2; Reset/Preview/Add disabled no-op

**Script:** `scripts/qa/_tmp-po-hrm-ui-brand-w3-att-g1-qa.mjs`  
**JSON:** `docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-att-g1-qa-browser.PASS.json`  
**Harness exit:** **0** · `failReasons=[]` · checks **12/12** `pass:true` · screens **11**

---

## 5. Exit checks matrix

| # | AC | Result | Evidence |
|---|-----|--------|----------|
| 1 | theme-contrast --strict | **PASS** | exit 0 · 0 pale · primary #1E40AF |
| 2 | titles ≥20 / text #111827 / primary #1E40AF | **PASS** | Face/schedule/OT/alias/rules titles 20/700 `rgb(17,24,39)`; purpleHits=[] |
| 3 | Face HOLD never LIVE; stubs disabled; ALIAS/GĐ2 badges | **PASS** | shell pe=none; S04/S39/S66/S69–S70 disabled; S58–S60 ALIAS |
| 4 | PROP-03e SKIP; Attendance not CLOSED; remaster not DONE | **PASS** | honesty gates all false claims · mutates=0 |
| 5 | WRITE this evidence BEFORE bus (stall#2 CLOSE) | **PASS** | this file rewritten `endedAt=04:19:33Z` |

---

## 6. Network (FE path only)

| Method | URL | Status | Note |
|--------|-----|--------|------|
| GET | `/api/hrm/attendance/overview?company_id=main&year=2026` | **200** | S04 overview |
| GET | `/api/hrm/attendance/work-shifts?company_id=main` | **200** | S39 list (0 rows) |
| GET | `/api/hrm/attendance/leave-requests?company_id=main` | **200** | LeaveTab under ALIAS |
| GET | `/api/hrm/attendance/rules?company_id=main` | **200** | S69 rules shell |
| GET | `/api/hrm/face-data?company_id=main` | **200** | Face HOLD path (not LIVE) |
| — | mutates POST/PUT/PATCH/DELETE | **0** | U65 |

No seed. No Nest probe as UF. ATT-A..F mutate wires not exercised.

---

## 7. Screens (this harness run)

| # | Path |
|---|------|
| 01 | `docs/qa/evidence/screens/po-hrm-ui-brand-w3-att-g1-qa/01-s04-customize-hold.png` |
| 02 | `…/02-s17-face-hold.png` |
| 03 | `…/03-s40-schedule-hold.png` |
| 04 | `…/04-s41-ot-hold.png` |
| 05 | `…/05-s39-copy-stub.png` |
| 06 | `…/06-s58_leave_summary.png` · `06-s59_compensatory.png` · `06-s60_leave_plan.png` |
| 07 | `…/07-s66-filter-download.png` |
| 08 | `…/08-s69-s70-rules-customize.png` |
| 09 | `…/09-final.png` |

---

## 8. Residuals (non-blocking)

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| `OBS-G1-S39-EMPTY-LIST` | P2 | work-shifts GET 200 · 0 rows — S39 asserted via static disabled stub floor (U65 no invent) | defer when catalog has rows |
| `OBS-G1-FACE-MODELS-404` | P3 | Console face model weights 404 under HOLD shell — expected until Face product/W4; not Face LIVE | W4-MOB |
| Portal `:5173` | OBS | Harness used hrm_fe `:8080` fallback | devops optional |

**Did not** invent Face LIVE · Attendance CLOSED · remaster DONE · PROP-03e card · seed · Nest UF · FE re-edit.

---

## 9. Forbidden honesty

- No seed · no API-only PASS as UF
- **Face not LIVE** · **Attendance not CLOSED** · **remaster program not DONE**
- **PROP-03e** remains SKIP
- S39 empty list deferred honestly (static floor) — not FAIL invent rows

---

## completion_report

**Closed:** W3-ATT-G1 brand QA stall#2 — U65 browser `ceo@xe.vn` / `main` on hrm_fe `:8080`. theme-contrast --strict exit 0. S04 customize HOLD; S17–S19 Face GĐ2-HOLD + shell pe=none + PROP-03e SKIP; S39 copy stub static floor (empty list); S40–S41 schedule/OT GĐ2; S58–S60 leave ALIAS; S66 Filter/Download disabled; S69–S70 rules customize stubs; mutates=0; checks **12/12**. Evidence file **rewritten** this seat (prior MISS closed). Attendance **not** CLOSED · Face **not** LIVE · remaster **not** DONE · PROP-03e **not** invent.

**Residual:** P2 S39 empty list (static floor); P3 face models 404 under HOLD; portal `:5173` down OBS.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W3-ATT-G2
from_role: pm
to_role: dev-fe
priority: P0
lane: execution
entry_criteria: ATT-G1-QA PASS_TO_PM · evidence docs/qa/evidence/po-hrm-ui-brand-w3-att-g1-qa.md present
prior: ATT-G1-QA PASS (stall#2 evidence MISS CLOSED) · ATT-E/F PASS
scope inventory W3-ATT-G2: S76–S85 — Rules tablet/proxy/auto + CFG redirect + users/roles/system honesty
AC: ADR §8–§10; theme-contrast --strict; titles ≥20 / text #111827 / primary #1E40AF; honesty stubs no-op; no Face LIVE; no PROP-03e invent; no Attendance CLOSED; no remaster DONE; no regress ATT-A..G1
cấm: seed · Nest invent · Face LIVE · Attendance CLOSED · remaster DONE · FE re-edit ATT-G1
persona: ceo@xe.vn → Chấm công → Thiết lập
ack_status target: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w3-att-g2.md
```

## ack_status

**PASS_TO_PM**

## evidence_path

`docs/qa/evidence/po-hrm-ui-brand-w3-att-g1-qa.md`
