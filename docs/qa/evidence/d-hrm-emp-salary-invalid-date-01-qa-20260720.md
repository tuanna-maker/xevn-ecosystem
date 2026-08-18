# D-HRM-EMP-SALARY-INVALID-DATE-01 — QA evidence (2026-07-20)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-EMP-SALARY-INVALID-DATE-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **persona** | `ceo@xe.vn` (Group CEO, `companyId=main`) |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD claim |
| **date** | 2026-07-20 |
| **FE evidence** | `docs/qa/evidence/d-hrm-emp-salary-invalid-date-01-20260720.md` |

---

## Environment (L0)

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `:28001` 200 · XBOS `:28002` 200 · portal `:5173` 200 |
| Seed | **None** (U65) |
| Unit (FE) | `vitest run src/lib/formatDisplayDate.test.ts` → **8/8 PASS** |

---

## Click path (browser)

1. Login session already `ceo@xe.vn` → `http://127.0.0.1:5173/command-center/hrm/employees`
2. Open employee with payslips: **Hoàng Văn An** `DVU-0005`  
   URL: `/hr/employees/70275eaa-830c-462c-81fb-03d5823945bc` (embed portal)
3. Tab **Lương & Phụ cấp**
4. Optional: **Thêm phụ cấp** dialog
5. must_keep smoke: tab **Hợp đồng** (F5 compensation lives under Đãi ngộ) — loads, no `Invalid time`

Also smoke: CEO `PORTAL-GCEO` → Lương empty state «Chưa có dữ liệu lương» — **no crash**.

---

## Exit criteria

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | Tab Lương — no `RangeError: Invalid time` | **PASS** | iframe console: 0 matches `Invalid time` / `RangeError` after tab open + payroll table render |
| 2 | payDate shows `—` or period text | **PASS** | Column **Ngày trả** = `—` ×2; column **Tháng** shows period text `Kỳ lương 05/2026 — services` / `Kỳ lương 12/2025 — services` |
| 3 | Optional Thêm/Sửa phụ cấp — DialogTitle warn check | **PASS w/ residual P2** | Dialog DOM title **«Thêm phụ cấp mới»** present; Radix still logs Title + Description console (see Residual) |
| must_keep | F5 compensation / contracts adjacent | **PASS smoke** | Hợp đồng tab loads contract dates `01/01/2022`–`31/12/2030`; no Invalid time |

### Payroll table capture (CDP)

```
Headers: Tháng | … | Ngày trả
Row1: Kỳ lương 05/2026 — services | … | —
Row2: Kỳ lương 12/2025 — services | … | —
```

Net salary card: **17.190.000 ₫** (matches payslip `net_amount`).

API sample (read-only probe, not mutate): `GET /api/hrm/payroll/payslips?company_id=main` → 200 `HRM-PAY-200`, `period_label` shape `Kỳ lương MM/yyyy — {slug}`.

---

## Residual

| ID | Severity | Item | Owner |
|----|----------|------|-------|
| R1 | P2 | Opening **Thêm phụ cấp**: iframe console still emits `` `DialogContent` requires a `DialogTitle` `` **and** Missing `Description` / `aria-describedby` — despite visible `h2` «Thêm phụ cấp mới» (likely portal-to-parent Document + DialogDescription absent). Primary crash AC not blocked. | dev-fe (optional follow-up) |
| R2 | P3 | Live `period_label` is prose (`Kỳ lương 05/2026 — services`), not bare `MM/yyyy` → `formatPayrollPayDateCell` returns `—` for **Ngày trả**; period still visible in **Tháng**. Exit allows `—`. | defer / product polish |

**Not claimed:** Phase 1 / PROD DONE.

---

## completion_report

Closed: Browser retest UF-HRM-06 salary tab — no Invalid time crash; payslip rows render with period text + safe `—` payDate; empty CEO salary state OK; vitest 8 PASS; Hợp đồng must_keep smoke OK. Residual P2 DialogTitle/Description console on add-allowance dialog (title visible). **PASS_TO_PM**.

**next_owner:** pm

**next_dispatch_prompt:**

```text
work_item_id: D-HRM-EMP-SALARY-INVALID-DATE-01
from_role: pm
to_role: qc
lane: governance
entry_criteria: QA PASS_TO_PM; evidence docs/qa/evidence/d-hrm-emp-salary-invalid-date-01-qa-20260720.md
exit_criteria: QC GO or GWC; residual R1 DialogTitle portal warn optional waive; cấm Phase1/PROD claim
cấm: seed
```

**ack_status:** PASS_TO_PM
**evidence_path:** `docs/qa/evidence/d-hrm-emp-salary-invalid-date-01-qa-20260720.md`
