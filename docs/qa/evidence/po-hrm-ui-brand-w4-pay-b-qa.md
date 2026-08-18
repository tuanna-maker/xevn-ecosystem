# PO-HRM-UI-BRAND-W4-PAY-B-QA — PAY P1 tabs beyond PAY-A

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-PAY-B-QA-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed · browser-only · U76 hdsd_align |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **FE base** | `http://127.0.0.1:5173` (portal embed **200** · hrm_fe `:8080` **200** · PORTAL_MODE) |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` **§16 LOCK** · §15.4 modal chrome |
| **FE handoff** | `docs/qa/evidence/po-hrm-ui-brand-w4-pay-b-fe.md` READY_FOR_QA |
| **Regression** | `docs/qa/evidence/po-hrm-ui-brand-w4-pay-a-qa.md` (PAY-A 🟢 — spot on Tổng quan) |
| **ack_status** | **PASS_TO_PM** |
| **Harness exit** | **0** |
| **stall** | **CLOSE** — browser RUN + evidence WRITE this seat |

---

## Honesty locks (must stay false)

| Flag | Value |
|------|--------|
| face_live | **false** |
| attendance_closed | **false** |
| remaster_program_done | **false** |
| salary_formula_invented | **false** |
| seed / API invent | **none** |
| mutates | **0** |

---

## 1. Entry / L0

| Check | Result |
|-------|--------|
| HRM API `:28001` | **200** `/api/hrm` |
| XBOS API `:28002` | **200** `/api/xbos` · login **201** |
| Portal `:5173` | **200** — **BASE used** (embed `/hr/payroll?portal=1`) |
| HRM FE `:8080` | **200** `/hr/` (alternate path available) |
| Seed / API invent | **None** (U65) — mutates=**0** |
| Face LIVE invent | **None** |
| Attendance CLOSED invent | **None** |
| Remaster DONE invent | **None** |
| Salary formula invent | **None** |

---

## 2. Theme contrast (AC)

```text
pnpm run verify:xevn:theme-contrast -- --strict
→ exit 0
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] STRICT PASS — 0 pale hits
```

---

## 3. HDSD inventory — P05–P07, P09, P12, P14, P17

| # | Surface | Menu / path | Present |
|---|---------|-------------|---------|
| P05 | Phụ cấp stub | Chính sách → Phụ cấp · `pay-allowance-stub-precision` | 🟢 title 20/700 Montserrat · purple=0 |
| P06 | Thưởng | Chính sách → Thưởng · `pay-bonus-policy-precision` | 🟢 KPI · **Thêm chính sách** dialog 4px `#1E40AF` → Hủy |
| P07 | Doanh số (policy) | Chính sách → Doanh số · `pay-sales-data-precision` | 🟢 |
| P09 | Data stubs | Dữ liệu → Doanh số + KPI · `pay-data-stub-precision` | 🟢 honesty copy · no invent |
| P12 | Mẫu bảng lương | Tính lương → Mẫu · `pay-salary-template-precision` | 🟢 add dialog chrome → Hủy |
| P12b | Quyết toán thuế | Tính lương → Quyết toán · `pay-tax-settlement-honesty-precision` | 🟢 **hasFakeAdd=false** |
| P14 | Báo cáo | Top tab Báo cáo · `pay-reports-precision` / `pay-payslips-api-precision` | 🟢 list + detail dialog 20/700 |
| P17 | Tạm ứng | Tính lương → Tạm ứng · `pay-advance-precision` | 🟢 create flow → Hủy only (OBS no approve row) |
| PAY-A spot | Tổng quan | `pay-overview-precision` | 🟢 regression · purple=0 |
| F5 | Reload | Báo cáo after full navigation reload | 🟢 chrome persist |
| theme-contrast | `--strict` | CLI | 🟢 exit 0 |

---

## 4. Browser click path (U65 · mutates=0)

1. Auth inject `ceo@xe.vn` → `http://127.0.0.1:5173/hr/payroll?portal=1&tenantId=xevn&companyId=main`
2. **Tổng quan** — PAY-A regression: `pay-overview-precision` · Montserrat 20/700 · purple=0
3. **Chính sách → Phụ cấp** — `pay-allowance-stub-precision` · «Chính sách phụ cấp» 20/700
4. **Chính sách → Thưởng** — KPI · **Thêm chính sách** → dialog bar `rgb(30,64,175)` 4px · **Hủy**
5. **Chính sách → Doanh số** — `pay-sales-data-precision`
6. **Dữ liệu → Doanh số** then **KPI** — sales + `pay-data-stub-precision`
7. **Tính lương → Mẫu bảng lương** — **Thêm mẫu mới** → dialog → **Hủy**
8. **Tính lương → Quyết toán thuế** — honesty card only · no «Thêm quyết toán»
9. **Báo cáo** — payslip list · row → detail «Xem phiếu lương — 05/2026» dialog → close
10. **Tính lương → Tạm ứng** — create dialog opened → **Hủy** only
11. Full reload payroll URL → **Báo cáo** — F5 persist

**Script:** `scripts/qa/_tmp-po-hrm-ui-brand-w4-pay-b-qa.mjs`  
**JSON:** `docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-pay-b-qa-browser.json`  
**Harness exit:** **0** · ended `2026-08-05T07:49:01Z`

**Network notes:** GET-only payroll/HRM bundle loads **200**; **0** POST/PUT/PATCH/DELETE; **storm5xx=0**; no HRM Sync ERROR banner; no console/page errors captured.

---

## 5. Exit checks matrix

| # | AC | Result | Evidence |
|---|-----|--------|----------|
| 1 | P05 allowance stub ≥20 · no purple | **PASS** | `pay-allowance-stub-precision` · «Chính sách phụ cấp» 20/700 Montserrat |
| 2 | P06 bonus KPI + add dialog chrome | **PASS** | bar 4px `rgb(30,64,175)` · «Thêm chính sách» 20/700 |
| 3 | P07 policy sales | **PASS** | `pay-sales-data-precision` · «Doanh số» 20/700 · purple=0 |
| 4 | P09 data sales + KPI stub honesty | **PASS** | both testids found · stub title KPI 20/700 |
| 5 | P12 template + add dialog | **PASS** | «Thêm mẫu bảng lương mới» 20/700 · 4px primary bar |
| 6 | P12b tax settlement honesty | **PASS** | `pay-tax-settlement-honesty-precision` · **hasFakeAdd=false** |
| 7 | P14 reports / payslip detail | **PASS** | `pay-reports-precision` + detail dialog opened · title 20/700 |
| 8 | P17 advance (Hủy-only OBS) | **PASS** | create flow + Hủy · no mutate |
| 9 | PAY-A regression spot | **PASS** | overview precision unchanged · purple=0 |
| 10 | theme-contrast `--strict` | **PASS** | exit **0** · pale=0 |
| 11 | F5 Báo cáo persist | **PASS** | reports/payslips testids after reload |
| 12 | U65 honesty locks | **PASS** | mutates=**0** · all flags false |

**Checks: 12/12 PASS**

---

## 6. Measured dialog chrome (Playwright computed)

| Dialog | barH | bar bg | title |
|--------|------|--------|-------|
| Bonus add | **4px** | **rgb(30, 64, 175)** | Thêm chính sách · 20/700 Montserrat |
| Salary template add | **4px** | **rgb(30, 64, 175)** | Thêm mẫu bảng lương mới · 20/700 |
| Payslip detail | **4px** | **rgb(30, 64, 175)** | Xem phiếu lương — 05/2026 · 20/700 |

---

## 7. Screens

| # | Path |
|---|------|
| 01 | `evidence/screens/po-hrm-ui-brand-w4-pay-b-qa/01-p05-allowance.png` |
| 02 | `evidence/screens/po-hrm-ui-brand-w4-pay-b-qa/02-p06-bonus-dialog.png` |
| 02b | `evidence/screens/po-hrm-ui-brand-w4-pay-b-qa/02b-p06-bonus.png` |
| 03 | `evidence/screens/po-hrm-ui-brand-w4-pay-b-qa/03-p07-policy-sales.png` |
| 04 | `evidence/screens/po-hrm-ui-brand-w4-pay-b-qa/04-p09-data-kpi-stub.png` |
| 05 | `evidence/screens/po-hrm-ui-brand-w4-pay-b-qa/05-p12-template.png` |
| 06 | `evidence/screens/po-hrm-ui-brand-w4-pay-b-qa/06-p12b-tax-honesty.png` |
| 07 | `evidence/screens/po-hrm-ui-brand-w4-pay-b-qa/07-p14-reports.png` |
| 08 | `evidence/screens/po-hrm-ui-brand-w4-pay-b-qa/08-p17-advance.png` |
| 09 | `evidence/screens/po-hrm-ui-brand-w4-pay-b-qa/09-f5-reports.png` |

---

## 8. Residual / PAY-A regression

| Item | Status |
|------|--------|
| P17 approve dialog | **OBS** — no «Duyệt» row visible under U65 · create+Hủy only · **not** FAIL |
| P14 detail | **LIVE row** opened (existing payslip data — read-only GET · no mutate) |
| PAY-A spine | **Spot PASS** — Tổng quan chrome unchanged vs PAY-A QA |
| Face LIVE / Attendance CLOSED / remaster DONE | **OUT** — flags false |
| P18 formula GĐ2 | **OUT of slice** |

---

## completion_report

Closed stall: browser U65 on portal `:5173` embed for PAY-B surfaces P05–P07, P09, P12, P12b tax honesty, P14, P17 + PAY-A regression spot + F5 Báo cáo. All Precision Motion AC (Montserrat ≥20/700, 4px `#1E40AF` dialogs, purple=0) PASS; theme-contrast `--strict` exit **0**; mutates=**0**; honesty flags false. Harness exit **0**.

Open: P17 approve dialog OBS only (no approval row). Not remaster DONE / Face LIVE / Attendance CLOSED.

## next_owner

`pm`

## next_dispatch_prompt

```text
Task pm INTAKE PO-HRM-UI-BRAND-W4-PAY-B-QA-01 PASS_TO_PM —
evidence docs/qa/evidence/po-hrm-ui-brand-w4-pay-b-qa.md · portal :5173 embed · checks 12/12 · theme-contrast --strict exit 0 · mutates=0 · PAY-A spot PASS;
residual OBS P17 approve dialog (create+Hủy only);
cấm claim remaster DONE / Face LIVE / Attendance CLOSED;
dispatch QC spot W4-PAY-B or next W4 brand wave per backlog — do not re-dispatch this QA seat.
```

## ack_status

**PASS_TO_PM**
