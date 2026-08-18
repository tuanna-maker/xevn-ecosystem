# PO-HRM-UI-BRAND-W4-PAY-A — PAY P0 spine + PayslipPrintDialog brand chrome

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-PAY-A` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **Date** | 2026-08-05 |
| **Program** | `PO-HRM-UI-BRAND-REMASTER-01` · FE-PAY W4-A (not remaster DONE) |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` **§16 LOCKED** (Montserrat + Source Sans 3) |
| **Inventory** | `docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md` §5 FE-PAY · W3-PAY-A slice |
| **Dialog foundation** | FE-DIALOG-01 — `xevn-dialog-surface` 4px `#1E40AF` · glass header · wordmark |
| **ack_status** | **READY_FOR_QA** |
| **stall** | **#2 CLOSE** — prior Task timeout; this seat re-verify + evidence WRITE + bus READY |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| ADR §16 / §7 | Primary `#1E40AF` · text `#111827` · secondary `#4B5563` · fonts Montserrat display / Source Sans 3 body · B4 cấm purple/emerald AI chrome |
| ADR §10 / §15.4 | Modal title ≥20 bold · brand bar 4px · glass · logo left (shared Dialog) |
| Inventory | P01–P04, P08, P10–P11, P13, P15–P16, P18 (P0 spine) |
| change_mode | UPGRADE chrome-only |
| code_memory_mode | APPEND |
| must_keep | `formatCurrency` / `formatNumber` **vi-VN**; SalaryComponentsTab Zod+RHF; taxSettlementFloatingUi C1; display rollups only (no salary formula invent); Face HOLD; Attendance not CLOSED |
| forbidden | seed · Face LIVE · Attendance CLOSED · remaster DONE claim · Nest/API/SRS rewrite · Attendance remaster invent |

---

## 1. Scope closed

| # | Screen / ID | Exit | Result |
|---|-------------|------|--------|
| 1 | P01 overview (`Payroll.tsx`) | Top tabs / step cards / charts brand; kill rainbow AI | **PASS** — `pay-overview-precision` · `bg-xevn-primary` tabs/steps · pie `#1E40AF`/`#059669` DNA |
| 2 | P02 / P16 components | Title Montserrat ≥20; dialogs brand bar+logo+glass | **PASS** — `pay-components-precision` · add/edit/delete `*-dialog-precision` |
| 3 | P03 / P04 tax + insurance | Titles ≥20 font-display; dialogs wide + foundation chrome | **PASS** — `pay-tax-policy-precision` · `pay-insurance-policy-precision` · add dialogs |
| 4 | P08 data-attendance | Title ≥20; primary CTA | **PASS** — `pay-attendance-data-precision` · create dialog precision |
| 5 | P10 batches | KPI brand surface; locked badge primary | **PASS** — `pay-batches-precision` · vi-VN money |
| 6 | P11 advance | KPI brand surface | **PASS** — `pay-advance-precision` · vi-VN money |
| 7 | P13 payment | KPI brand surface | **PASS** — `pay-payment-precision` · vi-VN money |
| 8 | **P15 PayslipPrintDialog** | Brand bar+logo+glass via Dialog; preview/print `#1E40AF`; Montserrat titles | **PASS** — `pay-payslip-print-dialog-precision` · `xevn-dialog-wordmark` · print CSS Source Sans 3 / Montserrat |
| 9 | P18 FormulaInput | Kill purple/emerald suggestion chips | **PASS** — primary/success chips; validate-only (no formula invent) |
| 10 | Money format | vi-VN kept | **PASS** — `Intl.NumberFormat('vi-VN', { currency: 'VND' })` |
| 11 | `pnpm run verify:xevn:theme-contrast -- --strict` | exit 0 | **PASS** — pale hits=0 · token lockstep `#1E40AF` |
| 12 | Evidence WRITE | this file before bus READY | **PASS** — stall#2 CLOSE |

**Cấm honored:** no seed · Face not LIVE · Attendance not CLOSED · no remaster DONE · no Nest formula invent.

---

## 2. Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/payroll/PayslipPrintDialog.tsx` | Full Precision Motion remaster (preview + print CSS); vi-VN; testid |
| `apps/web/hrm/src/pages/Payroll.tsx` | Overview chrome · top tabs primary · CODE-MEMORY W4-PAY-A |
| `apps/web/hrm/src/components/payroll/SalaryComponentsTab.tsx` | P02/P16 title Montserrat + dialogs precision |
| `apps/web/hrm/src/components/payroll/TaxPolicyTab.tsx` | P03 title Montserrat + add dialog precision |
| `apps/web/hrm/src/components/payroll/InsurancePolicyTab.tsx` | P04 title Montserrat + add dialog precision |
| `apps/web/hrm/src/components/payroll/PayrollBatchesTab.tsx` | P10 KPI brand surface + locked badge |
| `apps/web/hrm/src/components/payroll/AdvanceRequestsTab.tsx` | P11 KPI brand surface |
| `apps/web/hrm/src/components/payroll/PaymentBatchesTab.tsx` | P13 KPI brand surface |
| `apps/web/hrm/src/components/payroll/PayrollAttendanceTab.tsx` | P08 title ≥20 + primary CTA |
| `apps/web/hrm/src/components/payroll/FormulaInput.tsx` | P18 suggestion chips brand DNA |
| `docs/qa/evidence/po-hrm-ui-brand-w4-pay-a.md` | This evidence (stall#2 WRITE) |

**OUT of this seat (PAY-B / P1):** BonusPolicyTab · SalesDataTab rainbow KPI (P06/P07/P09) — not in W4-PAY-A P0 slice.

---

## 3. Dialog chrome contract (P15 + all PAY dialogs)

Via shared `DialogContent` / `DialogHeader` (FE-DIALOG-01):

| Element | Expect |
|---------|--------|
| Brand bar | `xevn-dialog-surface` ::before **4px `#1E40AF`** |
| Logo | `data-testid=xevn-dialog-wordmark` left of title |
| Glass | `xevn-dialog-header-glass` |
| Title | ≥20 / 700 Montserrat (`font-display`) |
| Body | Source Sans 3 (`font-sans`) |
| Payslip preview | Header + net strip `#1E40AF` (print CSS mirrors) |

---

## 4. Verify log (reproducible)

```text
> pnpm run verify:xevn:theme-contrast -- --strict
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563 · muted-fg OK (portal+HRM+TW)
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] STRICT PASS — 0 pale hits
exit 0
```

---

## 5. QA browser checklist (U65 · zero-seed)

| Check | Persona / path | Expect |
|-------|----------------|--------|
| Q1 overview | `ceo@xe.vn` → CC→HRM→**Tiền lương** → Tổng quan | `pay-overview-precision` · top tabs primary · step cards brand · titles ≥20 · no purple/pink |
| Q2 components | Tab **Thành phần lương** | `pay-components-precision` · add dialog 4px bar + logo + glass · FormulaInput chips primary |
| Q3 policy | Chính sách → Thuế / BH | `pay-tax-policy-precision` / `pay-insurance-policy-precision` · titles ≥20 · add dialog chrome |
| Q4 data | Dữ liệu → Chấm công | `pay-attendance-data-precision` · primary CTA |
| Q5 calc | Tính lương → Danh sách / Tạm ứng | `pay-batches-precision` / `pay-advance-precision` · money vi-VN |
| Q6 payment | Tab **Chi trả** | `pay-payment-precision` · money vi-VN |
| Q7 print | Open **In phiếu** (when batch has employees) | `pay-payslip-print-dialog-precision` · wordmark + 4px bar + glass · header/net `#1E40AF` · amounts vi-VN |
| Fonts | DevTools | Title Montserrat · body Source Sans 3 |
| Honesty | Face / Attendance program | Face HOLD · Attendance **not** CLOSED · remaster **not** DONE |
| F5 | After open dialogs | Chrome persists |

**testids:** `pay-overview-precision` · `pay-components-precision` · `pay-tax-policy-precision` · `pay-insurance-policy-precision` · `pay-payslip-print-dialog-precision` · `pay-batches-precision` · `pay-advance-precision` · `pay-payment-precision` · `pay-attendance-data-precision` · `pay-*-dialog-precision` · `xevn-dialog-wordmark`

---

## 6. Residual / not claimed

| Item | Status |
|------|--------|
| FE-PAY P1 (P05–P07, P09, P12, P14, P17, P19 polish) | **OUT** → PAY-B |
| Face LIVE | **OUT** — HOLD |
| Attendance CLOSED | **OUT** |
| Remaster DONE | **OUT** |
| Browser screenshot this seat | **QA** — L2.5 U65 |
| Empty payslip list (no seed) | **OK** — open print only when FE has employees; else skip Q7 with note |

---

## 7. Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/po-hrm-ui-brand-w4-pay-a.md`
- **next_dispatch_prompt:** |

```text
Task qa work_item_id=PO-HRM-UI-BRAND-W4-PAY-A-QA
entry: L0 stack; U65 zero-seed; ceo@xe.vn; evidence docs/qa/evidence/po-hrm-ui-brand-w4-pay-a.md
exit: browser checklist Q1–Q7; PayslipPrintDialog brand bar+logo+glass+#1E40AF if printable data; Montserrat titles; vi-VN money; theme-contrast --strict exit 0; WRITE docs/qa/evidence/po-hrm-ui-brand-w4-pay-a-qa.md; PASS_TO_PM
cấm: seed · Face LIVE · Attendance CLOSED · remaster DONE · salary formula invent
```

---

## completion_report

Closed PAY P0 spine chrome + PayslipPrintDialog Precision Motion (brand bar + logo + glass + Montserrat/Source Sans 3 + `#1E40AF`), kept vi-VN money, no formula invent; theme-contrast `--strict` exit 0; evidence WRITE stall#2. Residual: PAY-B P1 tabs; browser QA U65.
