# Evidence — `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-03`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-03` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | execution |
| **priority** | P1 |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-FE-01` READY_FOR_QA |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` (API query normalize → `holding`) |
| **u65** | zero-seed · browser-only · FE after 2xx + F5 |
| **hdsd_align** | Tiền lương → Tính lương → **Tạm ứng** → pending detail → **Thêm nhân viên** |
| **honesty** | `payroll_e2e_ready=false` · **no seed** · **DENIED** module UAT / AMIS DONE / J-HRM-07 claim |
| **ack_status** | **`PASS_TO_PM`** |
| **overall** | **PASS** |
| **stamp** | `PAYINPQA3-IT3RY3` |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-amis-parity-pay-input-pack-qa-03-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-amis-parity-pay-input-pack-qa-03/` |
| **script** | `scripts/qa/_tmp-po-hrm-amis-parity-pay-input-pack-qa-03.mjs` |

---

## 0. Spec / prior read ack

| Artifact | Use |
|----------|-----|
| `docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-fe-01.md` | FE wire POST employees; removed stub throw |
| Nest `POST …/advance-requests/:id/employees` | `HRM-ADV-201` · DTO `employee_code` / `employee_name` / `advance_amount` |
| U65 / honesty | FE click path only; no `pnpm seed:*`; no e2e_ready flip |

---

## 1. Environment (L0)

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `:28001` 200 · XBOS `:28002` 200 · portal `:5173` 200 |
| Seed | **Not run** (U65) |
| Portal recovery mid-wave | Port 5173 briefly 500 → killed stale node → `pnpm run dev:web-only` → `/hr/payroll` 200 |

---

## 2. Browser UF (U65)

**Portal:** `http://127.0.0.1:5173/hr/payroll?portal=1&companyId=main`  
**Click path:** Login (token inject) → tab `payroll-tab-calculate` → menuitem **Tạm ứng** → **Tạo bảng tạm ứng** (`QA-ADV-EMP-IT3RY3`) → open pending → **Thêm nhân viên** → check `UAT-0100` + amount `1.250.000` → **Thêm 1 nhân viên** → list refresh → F5 → row còn.

### Exit criteria map

| # | Criteria | Actual | Verdict |
|---|----------|--------|---------|
| 1 | POST `…/employees` **201** `HRM-ADV-201` | `POST /api/hrm/payroll/advance-requests/e331f739-…/employees?company_id=holding` → **201** `HRM-ADV-201` | 🟢 |
| 2 | Body has code/name/amount; no stub toast | `employee_code=UAT-0100` · `employee_name=UAT NV 0100` · `advance_amount=1250000`; no «API thêm NV chưa có» | 🟢 |
| 3 | FE list refresh + F5 | After 2xx: row `UAT-0100` / `1.250.000 ₫`; F5 row remains | 🟢 |
| 4 | Evidence this file + JSON | Paths above | 🟢 |
| 5 | `PASS_TO_PM` | This handoff | 🟢 |

### AC detail

| AC | Verdict | Notes |
|----|---------|-------|
| L0-STACK | 🟢 PASS | |
| HONESTY-E2E-READY | 🟢 PASS | `payroll_e2e_ready` stays false |
| NAV-ADVANCE-TAB | 🟢 PASS | testid `payroll-tab-calculate` → **Tạm ứng** (avoid `/Tính lương/` matching **Dữ liệu tính lương**) |
| FE-CREATE-PENDING | 🟢 PASS | POST advance-requests **201** `HRM-ADV-201` |
| DETAIL-PENDING-ADD-BTN | 🟢 PASS | **Thêm nhân viên** on pending |
| POST-EMPLOYEES-201 | 🟢 PASS | stamp path above |
| POST-BODY-FIELDS | 🟢 PASS | snake_case DTO |
| NO-STUB-TOAST | 🟢 PASS | stub message absent |
| FE-LIST-REFRESH | 🟢 PASS | empty → 1 row |
| F5-ROW-REMAINS | 🟢 PASS | `UAT-0100` persists |
| CONSOLE-GATE | 🟢 PASS | 0 fatal console |

---

## 3. Honesty locks

| Flag | Value |
|------|-------|
| **`payroll_e2e_ready`** | **`false`** (unchanged) |
| **Seed** | **DENIED** / not used |
| **Module UAT / AMIS DONE / J-HRM-07** | **DENIED** — slice FE wire only |
| **mark-paid period picker** | Out of scope (prior residual) |

---

## 4. Residual / not promoted

| Item | Severity | Owner |
|------|----------|-------|
| mark-paid UI `payrollPeriodId` picker | P2 optional | FE follow-up (not this WI) |
| removeEmployee / update/delete advance Nest stubs | P2 | out of slice |
| Module UAT / `payroll_e2e_ready` flip | — | **DENIED** |

No P0/P1 residual on Thêm NV wire.

---

## 5. Screens

| File | Step |
|------|------|
| `00-payroll.png` | Payroll shell |
| `01-create-dialog.png` | Tạo bảng tạm ứng |
| `02-after-create.png` | After create |
| `03-detail-pending.png` | Pending detail |
| `04-add-emp-dialog.png` | Thêm NV dialog |
| `05-emp-selected.png` | UAT-0100 + 1.250.000 · Thêm 1 nhân viên |
| `06-after-add.png` | After POST 201 |
| `07-after-f5.png` | F5 persistence |

---

## completion_report

### Closed

1. U65 browser: pending advance → Thêm NV → POST employees **201** `HRM-ADV-201`.
2. Request body includes `employee_code` / `employee_name` / `advance_amount`; stub toast gone.
3. FE employee list refreshes after 2xx; F5 row `UAT-0100` remains.
4. Honesty: no seed · `payroll_e2e_ready=false` · no module/AMIS claim.

### Residual

- mark-paid period picker / removeEmployee Nest wire — out of slice (prior FE residual).

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** (optional **qc** narrow GWC on FE wire slice) |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qa-03.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | Optional QC GWC slice FE Thêm NV only — **cấm** claim payroll module UAT / AMIS DONE / flip `payroll_e2e_ready` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QC-02
from_role: pm
to_role: qc
lane: governance
priority: P2
prior: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-03 PASS_TO_PM stamp PAYINPQA3-IT3RY3

entry_criteria:
- evidence: docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qa-03.md
- machine: docs/qa/evidence/_tmp-po-hrm-amis-parity-pay-input-pack-qa-03-browser.json
- FE-01: docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-fe-01.md
- U65 zero-seed; payroll_e2e_ready must stay false

exit_criteria:
1) Audit QA-03: POST …/employees 201 HRM-ADV-201 + body fields + FE refresh + F5
2) Confirm no stub toast «API thêm NV chưa có»
3) GO WITH CONDITIONS or GO for FE wire slice only — CONDITIONS: C-SLICE-≠-MODULE; mark-paid picker optional
4) evidence: docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qc-02.md
5) ack_status PASS_TO_PM

cấm: pnpm seed:* · payroll_e2e_ready flip · claim module UAT / AMIS DONE / J-HRM-07 process
```
