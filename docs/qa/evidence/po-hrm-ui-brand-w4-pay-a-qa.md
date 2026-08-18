# PO-HRM-UI-BRAND-W4-PAY-A-QA — PAY P0 spine + PayslipPrintDialog brand

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-PAY-A-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed · browser-only · U76 hdsd_align |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **FE base** | `http://127.0.0.1:8080` (hrm_fe **200** · portal `:5173` **ECONNREFUSED** → fallback) |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` **§16 LOCK** · §15.4 modal chrome |
| **FE handoff** | `docs/qa/evidence/po-hrm-ui-brand-w4-pay-a.md` READY_FOR_QA |
| **ack_status** | **PASS_TO_PM** |
| **attendance_closed** | **false** |
| **face_live** | **false** (HOLD) |
| **remaster_program_done** | **false** |
| **commit** | `dc930c5` |
| **Harness exit** | **0** |
| **stall** | **#4 CLOSE** — browser RUN + evidence WRITE this seat |

---

## 1. Entry / L0

| Check | Result |
|-------|--------|
| HRM API `:28001` | **200** `/api/hrm` |
| XBOS API `:28002` | **200** `/api/xbos` · login **201** |
| Portal `:5173` | **ECONNREFUSED** this seat → fallback |
| HRM FE `:8080` | **200** `/hr/` — **BASE used** |
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

## 3. HDSD inventory (U76)

| # | Surface | Menu / path | Present |
|---|---------|-------------|---------|
| Q1 | Overview | Tiền lương → Tổng quan · `pay-overview-precision` | 🟢 |
| Q2 | Components | Thành phần lương · add dialog · FormulaInput | 🟢 |
| Q3 | Tax / BH | Chính sách → Thuế / BH · add dialogs | 🟢 |
| Q4 | Attendance data | Dữ liệu → Chấm công · `pay-attendance-data-precision` | 🟢 |
| Q5 | Batches / Advance | Tính lương → Danh sách / Tạm ứng | 🟢 (OBS live payslips branch) |
| Q6 | Payment | Chi trả lương · `pay-payment-precision` | 🟢 |
| Q7 | PayslipPrintDialog | In phiếu · source floor `#1E40AF` | 🟢 (OBS not opened) |
| Q8 | theme-contrast | `--strict` exit 0 | 🟢 |
| Q9 | F5 persist | reload + Tổng quan | 🟢 |

---

## 4. Browser click path (U65 · mutates=0)

1. Auth inject `ceo@xe.vn` → `http://127.0.0.1:8080/hr/payroll?tenantId=xevn&companyId=main`
2. **Tổng quan** → assert `pay-overview-precision` · tab icon chips `#1E40AF` · step cards primary · purple=0
3. **Thành phần lương** → **Thêm mới** → `pay-salary-component-add-dialog-precision` chrome → **Hủy**
4. **Chính sách** → Thuế → title ≥20 → **Thêm** → `pay-tax-add-dialog-precision` → **Hủy**
5. **Chính sách** → Bảo hiểm → title ≥20 → **Thêm** → `pay-insurance-add-dialog-precision` → **Hủy**
6. **Dữ liệu** → Chấm công → `pay-attendance-data-precision` title 20/700 · CTA primary
7. **Tính lương** → Danh sách bảng lương → live payslips list (vi-VN money) · Tạm ứng → `pay-advance-precision`
8. **Chi trả lương** → `pay-payment-precision` · vi-VN KPI
9. Payslip print: no openable printable row under U65 → **source-floor** `PayslipPrintDialog.tsx` PASS
10. F5 reload → click **Tổng quan** → chrome persist

**Script:** `scripts/qa/_tmp-po-hrm-ui-brand-w4-pay-a-qa.mjs`  
**JSON:** `docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-pay-a-qa-stall3-browser.FINAL.json`  
**Harness exit:** **0**

---

## 5. Exit checks matrix

| # | AC | Result | Evidence |
|---|-----|--------|----------|
| 1 | Q1 overview primary tabs/steps · no purple | **PASS** | icon chips `rgb(30,64,175)` · stepPrimary count=3 · purple=0 |
| 2 | Q2 components add: 4px `#1E40AF` + logo + glass + title ≥20 Montserrat | **PASS** | barH=`4px` · bg=`rgb(30, 64, 175)` · wordmark · glass · «Thêm mới thành phần lương» **20px/700** Montserrat |
| 3 | Q3 tax/BH titles ≥20 + add dialog chrome | **PASS** | tax «Chính sách thuế» 20/700 · BH «Chính sách bảo hiểm» 20/700 · both add dialogs 4px primary + logo + glass |
| 4 | Q4 attendance data title ≥20 + primary CTA | **PASS** | «Chấm công» 20/700 · addPrimary=true |
| 5 | Q5 batches + advance · vi-VN money | **PASS** (OBS) | livePayslips>0 → `PayrollPayslipsApiTab` · «82.340.000 ₫» · advance «0 ₫» · `pay-advance-precision` |
| 6 | Q6 payment KPI · vi-VN | **PASS** | `pay-payment-precision` · «Tổng chi trả 0 ₫» |
| 7 | Q7 PayslipPrintDialog `#1E40AF` + vi-VN | **PASS** (OBS) | dialog not opened · source floor: testid + `#1E40AF` + title20 + vi-VN + no purple/emerald print |
| 8 | theme-contrast `--strict` | **PASS** | exit **0** · pale=0 |
| 9 | F5 chrome persist | **PASS** | overviewFound · «Xin chào,» 20/700 · chipPrimary · purpleClass=0 |
| 10 | U65 honesty locks | **PASS** | mutates=**0** · face_live=false · attendance_closed=false · remaster_done=false |

**Checks: 10/10 PASS**

---

## 6. Measured dialog chrome (Playwright computed)

| Dialog | barH | bar bg | glass | logo | title |
|--------|------|--------|-------|------|-------|
| Components add | **4px** | **rgb(30, 64, 175)** | ✓ | ✓ | Thêm mới thành phần lương · 20/700 Montserrat |
| Tax add | **4px** | **rgb(30, 64, 175)** | ✓ | ✓ | Thêm người tham gia chính sách thuế · 20/700 |
| Insurance add | **4px** | **rgb(30, 64, 175)** | ✓ | ✓ | Thêm người tham gia bảo hiểm · 20/700 |

---

## 7. Screens

| # | Path |
|---|------|
| 01 | `evidence/screens/po-hrm-ui-brand-w4-pay-a-qa-stall3/01-overview.png` |
| 02 | `evidence/screens/po-hrm-ui-brand-w4-pay-a-qa-stall3/02-components-add-dialog.png` |
| 03 | `evidence/screens/po-hrm-ui-brand-w4-pay-a-qa-stall3/03-tax-add-dialog.png` |
| 03b | `evidence/screens/po-hrm-ui-brand-w4-pay-a-qa-stall3/03-tax-policy.png` |
| 04 | `evidence/screens/po-hrm-ui-brand-w4-pay-a-qa-stall3/03b-insurance-add-dialog.png` |
| 04b | `evidence/screens/po-hrm-ui-brand-w4-pay-a-qa-stall3/03b-insurance-policy.png` |
| 05 | `evidence/screens/po-hrm-ui-brand-w4-pay-a-qa-stall3/04-attendance-data.png` |
| 06 | `evidence/screens/po-hrm-ui-brand-w4-pay-a-qa-stall3/05-batches.png` |
| 07 | `evidence/screens/po-hrm-ui-brand-w4-pay-a-qa-stall3/05b-advance.png` |
| 08 | `evidence/screens/po-hrm-ui-brand-w4-pay-a-qa-stall3/06-payment.png` |
| 09 | `evidence/screens/po-hrm-ui-brand-w4-pay-a-qa-stall3/08-f5-overview.png` |

---

## 8. Residual / honesty locks

| Item | Status |
|------|--------|
| Q5_OBS live payslips branch | **P2** — `calc-list` renders `PayrollPayslipsApiTab` when livePayslips>0 → `pay-batches-precision` not mounted · brand/vi-VN scanned on list · **not** invent batches KPI |
| Q7_OBS PayslipPrintDialog empty | **P2** — no printable row opened under U65 · source-floor `#1E40AF` + testid + vi-VN PASS · **not** invent print data |
| FE-PAY P1 (PAY-B) | **OUT** — P05–P07, P09, P12, P14, P17, P19 |
| Face LIVE | **OUT** — HOLD |
| Attendance CLOSED | **OUT** |
| Remaster program DONE | **OUT** |
| mutates | **0** |

---

## completion_report

Closed: Stall #4 — browser U65 on hrm_fe `:8080` (portal ECONNREFUSED fallback) for PAY P0 spine (overview / components / tax-BH / attendance data / batches-advance / payment) + PayslipPrintDialog source-floor Precision Motion. Asserted 4px `#1E40AF` bar + wordmark + glass + Montserrat 20/700 on components/tax/insurance add dialogs; vi-VN money on list/advance/payment; theme-contrast `--strict` exit **0**; F5 overview persist; mutates=0. Evidence WRITE this seat before finish. Harness exit **0**.

Open: P2 OBS Q5 live-payslips branch (batches testid N/A by design) · Q7 print dialog not opened (source floor PASS). Not remaster DONE / Attendance CLOSED / Face LIVE / salary invent.

## next_owner

`pm`

## next_dispatch_prompt

```text
Task pm INTAKE PO-HRM-UI-BRAND-W4-PAY-A-QA PASS_TO_PM —
evidence docs/qa/evidence/po-hrm-ui-brand-w4-pay-a-qa.md · hrm_fe :8080 (portal down fallback) · checks 10/10 · theme-contrast --strict exit 0 · PayslipPrintDialog source-floor #1E40AF · mutates=0;
residual P2 OBS Q5 live-payslips branch + Q7 print empty (source floor PASS);
cấm claim remaster DONE / Attendance CLOSED / Face LIVE / salary invent;
dispatch next W4 brand wave (W4-PAY-B / W4-REC per backlog) — do not re-dispatch this QA seat (stall#4 closed).
```

## ack_status

**PASS_TO_PM**
