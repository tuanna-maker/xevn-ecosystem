# PO — Open waves board (sponsor unlock 2026-08-07T16:31+07)

**Trigger:** Sponsor «mở hết tất cả các wave nào còn chưa xong»  
**Honesty (global):** `payroll_e2e_ready=false` · `contracts_printable_ready=false` · `C-SLICE-≠-MODULE` · không Phase1 DONE · không module UAT

---

## A. CLOSED today (do not re-dispatch)

| Program | Seat | Status |
|---------|------|--------|
| Formula L1 | Evaluator · FE gd1_eval · CB-BAG · ATT coerce+AC4 · Payslip GET | **GWC** |
| AMIS PAY TPL | DATA · API · BE · FE · QA · QC | **GWC** |
| Dynamic Platform CTR | MergeToken BE/FE/QA/QC | **GWC** slice |
| Contract XEVN-TPL | BE/FE/QA-02/QC-EDIT | **GWC** |

---

## B. OPEN — P0 execution (DISPATCHED 16:31)

| Wave ID | Owner | Mission |
|---------|-------|---------|
| `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-J-HRM-07-01` | **qa** | Browser U65 J-HRM-07: ATT chốt → tạo kỳ → enroll → process → xem phiếu/dòng trên UI |
| `PO-HRM-AMIS-PARITY-PAY-SRC-BE-01` | **dev-be** | SRC resolver BR-AMIS-PAY-SRC-01..05 on PROCESS; template override FK; no silent 0₫ |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BE-01` | **dev-be** | Open `salary_components` catalog + `default_formula_definition_id`; deprecate TEXT formula SoT |
| `PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-FE-01` | **dev-fe** | Tạo kỳ lương chọn `pay_sheet_template` · snapshot bind · không nhầm enroll pack |

---

## C. OPEN — P0 governance (DISPATCHED 16:31)

| Wave ID | Owner | Mission |
|---------|-------|---------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01` | **sa** | API F.1 salary_components platform vertical + DOC-DELTA |
| `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-DATA-01` | **ba-data** | Period input packs: thu nhập khác · tạm ứng · chuyển công pack schema |

---

## D. OPEN — P1 (DISPATCHED 16:31)

| Wave ID | Owner | Mission |
|---------|-------|---------|
| `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-DATA-01` | **ba-data** | C&B / lịch sử lương physical for BR-AMIS-PAY-SRC-02 |
| `PO-HRM-AMIS-PARITY-SETTINGS-DEFAULTS-BA-01` | **ba-process** | Thông số mặc định thuế/BH/PC theo vị trí — AC delta |
| `PO-HRM-E2E-LINK-PAY-CFG-EXEC-01` | **dev-fe** | Wire Settings catalog pickers per PAY-CFG spec (orphan free-text kill) |

---

## E. OPEN — P2 (queued after P0)

| Wave ID | Owner | Mission |
|---------|-------|---------|
| `PO-HRM-AMIS-PARITY-PAY-ESS-BE-01` | **dev-be** | ESS payslip confirm path |
| `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-BE-01` | **dev-be** | Payment batch wire AC |
| `PO-HRM-AMIS-PARITY-INS-TIMELINE-BE-01` | **dev-be** | SI tăng/giảm timeline (E2E-EMP D5) |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01` | **sa** | ATT codes catalog pattern roll-out |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01` | **sa** | REC stages catalog pattern |

---

## F. Chain (auto after P0 PASS)

```
SRC-BE + CATALOG-BE + PERIOD-BIND-FE → QA AC-PAY-RUN-06/07 → QC formula W3
INPUT-PACK-DATA → SA API delta → BE period packs
EMP-SALARY-HISTORY-DATA → BE SRC-02 integration → QA
```

---

## G. Explicit DENY (until QC clean GO)

- Flip `payroll_e2e_ready=true`
- Claim formula LIVE / AMIS parity DONE / Phase1 DONE
- GĐ2 formula DnD · AI AVA · seed mutate

---

## H. SUPERSEDED / PAUSE (2026-08-07T17:31+07)

Sponsor tắt máy. Board §B–E = snapshot lúc mở wave — **không** còn SoT điều phối.

**SoT resume:** `docs/program/PO_HRM_RESUME_PLAN_20260807.md` (khúc K1→K6 tuần tự).  
**Orch:** `PM_ORCHESTRATION_MODE=STOP`.
