# PO-HRM-UI-BRAND-W4-PAY-B-FE — PAY P1 tabs beyond PAY-A

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-PAY-B-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **Date** | 2026-08-05 |
| **Program** | `PO-HRM-UI-BRAND-REMASTER-01` · FE-PAY W4-B (not remaster DONE) |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` **§16 LOCKED** |
| **Inventory** | `docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md` §5 · W3-PAY-B slice |
| **Prior wave** | `po-hrm-ui-brand-w4-pay-a.md` / PAY-A QA GWC CLOSED |
| **ack_status** | **READY_FOR_QA** |
| **stall** | **RE-DISPATCH CLOSE** — prior seat 0 bytes; this seat WRITE + code |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| ADR §16 / §7 | Primary `#1E40AF` · Montserrat titles ≥20 · Source Sans 3 body · pale ban |
| ADR §15.4 | Modal wide + brand bar via shared Dialog (FE-DIALOG-01) |
| Inventory W3-PAY-B | P05–P07, P09, P12, P14, P17, P19 (P19 overview charts = PAY-A baseline; P1 stub honesty only where no LIVE) |
| change_mode | UPGRADE chrome-only |
| code_memory_mode | APPEND |
| must_keep | Payroll API/scope/RBAC · vi-VN money · tax settlement HIDE invent · no Face LIVE · remaster_program_done=false |
| forbidden | U65 seed · Attendance CLOSED claim · product GO · overwrite PAY-A 🟢 without regression note |

---

## 1. Scope closed (surface_id)

| # | ID | Menu path | testid / anchor | Result |
|---|-----|-----------|-----------------|--------|
| 1 | **P05** | Chính sách → Phụ cấp | `pay-allowance-stub-precision` | **PASS** — stub honesty · title 20 Montserrat · brand surface |
| 2 | **P06** | Chính sách → Thưởng | `pay-bonus-policy-precision` | **PASS** — KPI xevn tokens · CTAs primary · dialogs ≥20 |
| 3 | **P07** | Chính sách → Doanh số | `pay-sales-data-precision` | **PASS** — shared SalesDataTab chrome (policy + data); sync/import dialogs precision |
| 4 | **P09** | Dữ liệu → KPI/SP/… stubs | `pay-data-stub-precision` | **PASS** — stub panels brand (no invent data) |
| 5 | **P12** | Tính lương → Mẫu bảng lương | `pay-salary-template-precision` | **PASS** — SalaryTemplatesTab title + dialog chrome |
| 6 | **P14** | Báo cáo (top tab) | `pay-reports-precision` / `pay-payslips-api-precision` | **PASS** — routes to Payslip API tab · detail dialog precision |
| 7 | **P17** | Advance approve/delete dialogs | `pay-advance-approval-dialog-precision` · delete precision | **PASS** — titles ≥20 Montserrat |
| 8 | **P12b** | Quyết toán thuế (honesty) | `pay-tax-settlement-honesty-precision` | **PASS** — no invent mutate UI (AC-E2-P3-02 kept) |
| 9 | theme-contrast | `--strict` | CLI | **PASS** (see §4) |

**OUT of slice:** P18 formula GĐ2 drag-drop · Face · full tax settlement LIVE.

---

## 2. Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/payroll/BonusPolicyTab.tsx` | P06 Precision Motion KPI + CTAs + dialogs |
| `apps/web/hrm/src/components/payroll/SalesDataTab.tsx` | P07/P09 data-sales KPI + badges + dialogs |
| `apps/web/hrm/src/components/payroll/SalaryTemplatesTab.tsx` | P12 template tab + dialogs |
| `apps/web/hrm/src/components/payroll/PayrollPayslipsApiTab.tsx` | P14 titles + detail dialog |
| `apps/web/hrm/src/components/payroll/AdvanceRequestsTab.tsx` | P17 approval/delete dialog chrome |
| `apps/web/hrm/src/pages/Payroll.tsx` | P05/P09 stubs · P14 reports route · P12 calc-template · tax honesty testid · CODE-MEMORY APPEND |
| `docs/qa/evidence/po-hrm-ui-brand-w4-pay-b-fe.md` | This evidence (WRITE BEFORE handoff) |

---

## 3. QA browser checklist (U65 · zero-seed)

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `companyId=main`  
**URL:** `/hr/payroll?tenantId=xevn&companyId=main`

1. **Chính sách → Phụ cấp** — stub title ≥20 · `pay-allowance-stub-precision` · no purple gradient
2. **Chính sách → Thưởng** — KPI cards xevn surface · **Thêm chính sách** opens dialog title ≥20 → Hủy
3. **Chính sách → Doanh số** — `pay-sales-data-precision` · KPI primary/success/warning DNA · no purple KPI
4. **Dữ liệu → Doanh số** — same SalesDataTab chrome
5. **Dữ liệu → KPI** (or other stub) — `pay-data-stub-precision` honesty copy
6. **Tính lương → Mẫu bảng lương** — `pay-salary-template-precision` · add template dialog chrome → Hủy
7. **Tính lương → Quyết toán thuế** — honesty card only · no fake add
8. **Báo cáo** (top tab) — payslip list API tab loads · search · detail dialog title ≥20 → close
9. **Tính lương → Tạm ứng** — open batch → approve dialog `pay-advance-approval-dialog-precision` (if row exists) or create flow Hủy only
10. F5 on **Báo cáo** — chrome persist
11. `pnpm run verify:xevn:theme-contrast -- --strict` exit **0**

**J-***: J-HRM-PAY list→detail where payslip rows exist (OBS empty = stub honesty OK).

---

## 4. Verify log

```text
pnpm run verify:xevn:theme-contrast -- --strict
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] STRICT PASS — 0 pale hits
exit 0
```

Evidence size: **5683** bytes (verified seat 2026-08-05 · theme-contrast `--strict` exit 0).

**Seat delta:** SalesDataTab sync/import dialog precision; Payroll tax-settlement honesty copy UTF-8 fix.

---

## 5. Regression note (PAY-A 🟢)

PAY-A surfaces (P01–P04, P08, P10–P11, P13, P15–P16, P18) **not** restyled in this wave except:
- `Payroll.tsx` routing/stubs only (no KPI rewrites on P0 tabs).

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **next_owner** | `qa` |
| **next work_item** | `PO-HRM-UI-BRAND-W4-PAY-B-QA-01` |
| **ack_status** | **READY_FOR_QA** |
