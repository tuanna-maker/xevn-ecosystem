# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-FE-SUMMARY-CARDS-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-FE-SUMMARY-CARDS-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-07 |
| **lane** | execution — K6.5 FE OBS summary-cards-zero |
| **priority** | P3 |
| **parent** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QC-PROCESS-POST-02` |
| **closes** | **R-PAY-W3-FE-SUMMARY-ZERO** (FE bind) |
| **resume_chunk** | K6.5 |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll` · persona `ceo@xe.vn` · `company_id=main` |
| **journey_l25** | **J-HRM-07** process-post detail header cards (slice) |
| **Verdict** | **READY_FOR_QA** |
| **ack_status** | **`READY_FOR_QA`** |
| **qc_ref** | [`po-hrm-payroll-formula-run-gap-w3-qc-process-post-02.md`](po-hrm-payroll-formula-run-gap-w3-qc-process-post-02.md) OBS summary-cards-zero |
| **qa_ref** | [`po-hrm-payroll-formula-run-gap-w3-qa-process-post-02.md`](po-hrm-payroll-formula-run-gap-w3-qa-process-post-02.md) stamp `PAYW3PROC2-MSIT867S` |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | LOCKED — not flipped |
| **Formula LIVE / customer UAT** | **DENIED** | FE does **not** invent Gross/Net formula |
| **Module payroll UAT / J-HRM-07 e2e** | **DENIED** | slice cards only |
| **Seed** | **DENIED** | U65 |
| **TDZ / SRC-02 / period bind / process-post GWC** | **must_keep** | untouched |

---

## Root cause

| Layer | Fact |
|-------|------|
| Process POST `HRM-PAY-202` | Returns `payslip_summary: { total_gross, total_net }` — **not** top-level `total_gross`/`total_net` |
| GET `/payroll/periods` list | `mapPeriod` has **no** `total_gross` / `total_net` / `payslip_summary` |
| FE cards (before) | Bound `selectedBatch.total_gross \|\| 0` after list refetch → always **0 ₫** |
| FE lines (OK) | `listPayrollPayslips` → row amounts non-zero (e.g. **12.345.000 ₫**) |

**Not** a formula engine bug — display bind gap.

---

## Fix (FE)

1. **`resolvePeriodDisplayTotals`** — prefer process `payslip_summary` when present; else period top-level totals.
2. **`resolvePayrollHeaderTotals`** — prefer batch period totals; else **sum BE display-ready payslip line** amounts (`gross_salary` / `net_salary` / deductions) — **no FE formula invent**.
3. **`PayrollBatchesTab`** detail cards use `resolvePayrollHeaderTotals(selectedBatch, batchRecords)` · testids `pay-batch-summary-*`.
4. **`handleLockBatch`** merges process-mapped totals into `selectedBatch` after Khóa.
5. **`lockBatch`** — process required; close best-effort (HRM-PAY-005 412 must not wipe process UI refresh).
6. Types: `HrmPayrollPeriod.payslip_summary` on `hrmApi.ts`.

### Files

- `apps/web/hrm/src/hooks/usePayrollBatches.ts`
- `apps/web/hrm/src/hooks/usePayrollBatches.test.ts`
- `apps/web/hrm/src/components/payroll/PayrollBatchesTab.tsx`
- `apps/web/hrm/src/integrations/hrmApi.ts` (type only)

### solid_convention_ack

- FE–BE: display-ready bind only; Gross/Net from Nest `payslip_summary` or payslip list amounts.
- **Cấm** FE invent payroll formula / net calc.

---

## Tests

| Command | Result |
|---------|--------|
| `pnpm test -- src/hooks/usePayrollBatches.test.ts` (cwd `apps/web/hrm`) | **PASS** · **7** tests |

Coverage: period rollup · `payslip_summary` map · line_aggregate when period 0 · prefer period when non-zero · payslip row map · parse · VN month.

---

## Residual / BE note (not blocking READY_FOR_QA)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-PAY-PERIOD-LIST-TOTALS** | P3 OBS | **dev-be** (optional later) | GET list/get period still omit `total_gross`/`total_net`/`payslip_summary` → list table columns stay 0 until detail lines load. FE detail cards PASS via line aggregate. |
| **`payroll_e2e_ready`** | honesty | pm | LOCKED false |
| **LIVE / module UAT** | — | — | DENIED |

**Not PASS_TO_BE** for this seat — process already returns display-ready `payslip_summary`; lines already return amounts. FE bind closes OBS without inventing totals.

---

## QA retest AC (U65 browser)

| AC | Pass when |
|----|-----------|
| AC-Cards-F5 | Open processed period (e.g. Aug `cf38deac` or equivalent) → header Gross/Net match line non-zero (e.g. **12.345.000 ₫**) · `data-totals-source` = `line_aggregate` or `period`/`payslip_summary` |
| AC-Cards-Process | Fresh draft → enroll → Khóa → cards non-zero without invent formula · Network process still `payroll_e2e_ready=false` |
| Honesty | DENY LIVE · no seed · TDZ not reopened |

Persona: `ceo@xe.vn` · `/hr/payroll` → Tính lương → detail.

---

## completion_report

### Closed

- R-PAY-W3-FE-SUMMARY-ZERO FE bind: process `payslip_summary` + payslip line aggregate for header Gross/Net cards.
- Vitest 7 PASS; honesty `payroll_e2e_ready=false`; no formula invent.
- Close-after-process soft-fail so process UI refresh is not blocked by HRM-PAY-005.

### Residual

- Optional BE: add period list/get display-ready totals (list column polish).
- Not claimed: LIVE · e2e_ready · module UAT · process-post reopen.

## next_owner

**qa**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-SUMMARY-CARDS-01
from_role: pm
to_role: qa
lane: execution
priority: P3
parent: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-FE-SUMMARY-CARDS-01

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-fe-summary-cards-01.md
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qc-process-post-02.md (OBS summary-cards-zero)

Mission (U65 browser-only · zero-seed):
1. Login ceo@xe.vn → /hr/payroll → open processed period with non-zero payslip line
2. Assert header cards pay-batch-summary-gross / pay-batch-summary-net match line amount (≠ 0 ₫ while line non-zero)
3. Optional: fresh draft enroll → Khóa → cards update; process body payroll_e2e_ready=false
4. Cấm seed · cấm claim LIVE / e2e_ready · cấm reopen TDZ
5. evidence_path: docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qa-summary-cards-01.md
ack_status: PASS_TO_PM | FAIL_TO_PM
```

## ack_status

**`READY_FOR_QA`**
