# PO-HRM-UI-BRAND-FE-DIALOG-01-QA — Dialog chrome + compact fields

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-FE-DIALOG-01-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed · browser-only · U76 hdsd_align |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **FE base** | `http://127.0.0.1:8080` (portal `:5173` ECONNREFUSED → **hrm_fe fallback**) |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` **§16** (Montserrat + Source Sans 3 · S3=A · B4 no AI) · §15.4 / §10 modal chrome |
| **FE handoff** | `docs/qa/evidence/po-hrm-ui-brand-fe-dialog-01.md` READY_FOR_QA |
| **RE-DISPATCH** | prior QA stall · evidence **MISS** — **CLOSED** this seat (file WRITE before finish) |
| **ack_status** | **PASS_TO_PM** |
| **attendance_closed** | **false** |
| **face_live** | **false** (HOLD / GD2 honesty · S3=A) |
| **remaster_program_done** | **false** |
| **commit** | `dc930c5` |
| **Harness exit** | **0** |

---

## 1. Entry / L0

| Check | Result |
|-------|--------|
| HRM API `:28001` | **200** `/api/hrm` |
| XBOS API `:28002` | **200** `/api/xbos` · login **201** |
| Portal `:5173` | **ECONNREFUSED** |
| HRM FE `:8080` | **200** `/hr/` — used as BASE |
| Seed / API invent | **None** (U65) — mutates=**0** |
| Face LIVE invent | **None** |
| Attendance CLOSED invent | **None** |
| Remaster DONE invent | **None** |

---

## 2. Theme contrast (AC #4)

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
| AC1 | Leave create Dialog | Chấm công → Nghỉ phép → Tạo yêu cầu nghỉ · `att-leave-create-dialog-precision` | 🟢 |
| AC2 | OT add Dialog | Quản lý đơn → Làm thêm/Tăng ca → Thêm · `att-ot-add-dialog-precision` | 🟢 |
| AC3 | Face HOLD / S3=A | Chấm công → Face ID · GD2 hold banner · no LIVE claim | 🟢 |
| AC4 | theme-contrast | `--strict` exit 0 | 🟢 |
| AC5 | Screens + click path | §4–§7 this file | 🟢 |
| Wordmark | `xevn-dialog-wordmark` | Leave + OT headers | 🟢 |

---

## 4. Browser click path (U65)

1. Auth inject `ceo@xe.vn` → `http://127.0.0.1:8080/hr/attendance?tenantId=xevn&companyId=main`
2. **Nghỉ phép** tab → list shell visible
3. **+ Tạo yêu cầu nghỉ** → Dialog `att-leave-create-dialog-precision`
4. Assert chrome (bar / logo / glass / title) → **Hủy** (no mutate)
5. **Quản lý đơn** → OT / tăng ca → **+ Thêm đơn tăng ca** → `att-ot-add-dialog-precision`
6. Assert same chrome + compact date/time → **Hủy**
7. **Chấm công** → **Face ID** → GD2 hold honesty (not LIVE)

**Script:** `scripts/qa/_tmp-po-hrm-ui-brand-fe-dialog-01-qa.mjs`  
**JSON:** `docs/qa/evidence/_tmp-po-hrm-ui-brand-fe-dialog-01-qa-browser.json`  
**Harness exit:** **0**

---

## 5. Exit checks matrix

| # | AC | Result | Evidence |
|---|-----|--------|----------|
| 1 | Leave create: 4px `#1E40AF` + logo left + glass + title ≥20 | **PASS** | barH=`4px` · bg=`rgb(30, 64, 175)` · wordmark · `.xevn-dialog-header-glass` · title **20px/700** Montserrat «Tạo yêu cầu nghỉ» · fields `xevn-field-date/name/select-md/reason` |
| 2 | OT add: same chrome + compact date/time | **PASS** | bar 4px primary · logo · glass · title **20px/700** «Thêm đơn tăng ca» · `xevn-field-date` + `xevn-field-time`×2 · select-sm/md · reason |
| 3 | Face HOLD / S3=A honesty | **PASS** | GD2 hold banner visible · no Face LIVE UI claim · S3=A kept |
| 4 | theme-contrast `--strict` | **PASS** | exit **0** · pale=0 |
| 5 | Screenshot + click path | **PASS** | §4 + §7 |

---

## 6. Measured dialog chrome (Playwright computed)

### Leave — `att-leave-create-dialog-precision`

| Metric | Value |
|--------|--------|
| `::before` height | **4px** |
| `::before` bg | **rgb(30, 64, 175)** = `#1E40AF` |
| Glass header | **true** (`.xevn-dialog-header-glass`) |
| Wordmark | **true** (`xevn-dialog-wordmark`) |
| Title | «Tạo yêu cầu nghỉ» · **20px** · **700** · Montserrat |
| Compact fields | date / name / select-md / reason / line |

### OT — `att-ot-add-dialog-precision`

| Metric | Value |
|--------|--------|
| `::before` height | **4px** |
| `::before` bg | **rgb(30, 64, 175)** |
| Glass + wordmark | **true** |
| Title | «Thêm đơn tăng ca» · **20px** · **700** · Montserrat |
| Compact | date **1** · time inputs **2** · select-sm/md · reason |

---

## 7. Screens

| # | Path |
|---|------|
| 00 | `docs/qa/evidence/screens/po-hrm-ui-brand-fe-dialog-01-qa/00-attendance-shell.png` |
| 01 | `docs/qa/evidence/screens/po-hrm-ui-brand-fe-dialog-01-qa/01-leave-list.png` |
| 02 | `docs/qa/evidence/screens/po-hrm-ui-brand-fe-dialog-01-qa/02-leave-create-dialog.png` |
| 03 | `docs/qa/evidence/screens/po-hrm-ui-brand-fe-dialog-01-qa/03-ot-list.png` |
| 04 | `docs/qa/evidence/screens/po-hrm-ui-brand-fe-dialog-01-qa/04-ot-add-dialog.png` |
| 05 | `docs/qa/evidence/screens/po-hrm-ui-brand-fe-dialog-01-qa/05-face-hold-honesty.png` |

**Visual review (QA):** Leave/OT dialogs show blue top brand bar, left wordmark, glass header, bold ≥20 title; OT shows compact date + start/end time; Face screen shows GD2 «đang phát triển» hold — not LIVE.

---

## 8. Network / mutates

| Item | Result |
|------|--------|
| Mutating methods (POST/PUT/PATCH/DELETE) | **0** |
| Seed | **None** |
| Nest / API invent for UF | **None** |

---

## 9. Residuals (non-blocking)

| Item | Severity | Note |
|------|----------|------|
| Portal `:5173` down | OBS | Validated on hrm_fe `:8080` fallback per dispatch |
| Face model toast «Không thể tải mô hình…» | OBS P2 | Consistent with HOLD/GD2 — **not** Face LIVE |
| Full ATT 90 remaster | OUT | Not claimed |
| Attendance CLOSED / remaster DONE | OUT | **false** |

---

## 10. Honesty locks (cấm honored)

| Claim | Status |
|-------|--------|
| Face LIVE | **false** |
| Attendance CLOSED | **false** |
| Remaster program DONE | **false** |
| Seed in evidence | **false** |
| S3=A | **held** (HOLD path) |

---

## Handoff

```yaml
work_item_id: PO-HRM-UI-BRAND-FE-DIALOG-01-QA
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-ui-brand-fe-dialog-01-qa.md
browser_json: docs/qa/evidence/_tmp-po-hrm-ui-brand-fe-dialog-01-qa-browser.json
harness: scripts/qa/_tmp-po-hrm-ui-brand-fe-dialog-01-qa.mjs
verdict: PASS
checks: 5/5
next_owner: pm
next_dispatch_prompt: |
  Task pm INTAKE PO-HRM-UI-BRAND-FE-DIALOG-01-QA PASS_TO_PM —
  evidence docs/qa/evidence/po-hrm-ui-brand-fe-dialog-01-qa.md WRITE confirmed;
  Leave+OT dialog chrome AC PASS (4px #1E40AF + logo + glass + title 20/700 Montserrat);
  Face HOLD/S3=A honesty; theme-contrast --strict exit 0; mutates=0; U65;
  cấm Face LIVE / Attendance CLOSED / remaster DONE;
  next: QC gate dialog foundation OR next FE remaster wave per PROGRAM backlog — do not invent ATT CLOSED.
```

---

## completion_report

**Closed:** `PO-HRM-UI-BRAND-FE-DIALOG-01-QA` — all 5 AC PASS; stall evidence MISS closed by WRITE of this file; browser U65 on hrm_fe `:8080`; Leave create + OT add precision dialogs measured; Face HOLD / S3=A; theme-contrast strict 0; screenshots captured.

**Residual:** portal `:5173` down (fallback OK); Face model load toast OBS under GD2 HOLD — not promoted as defect against dialog AC.
