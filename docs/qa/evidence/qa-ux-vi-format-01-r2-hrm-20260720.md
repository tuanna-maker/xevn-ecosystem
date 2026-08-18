# QA-UX-VI-FORMAT-01-R2 — HRM browser evidence (2026-07-20)

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-UX-VI-FORMAT-01-R2` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **ack_status** | **PASS_TO_PM** |
| **persona** | `ceo@xe.vn` / `Xevn@2026` (Group CEO, `companyId=main`) |
| **spec_ref** | `docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md` · AC-UX-NUM-01/02 · AC-UX-DATE-02 · UF-HRM-03 |
| **entry** | `docs/qa/evidence/d-ux-vi-comp-panel-lines-map-01-fe-20260720.md` (READY) |
| **parent_fail** | `QA-UX-VI-FORMAT-01` / P0 `D-UX-VI-COMP-PANEL-LINES-MAP-01` |
| **env** | L0 PASS — portal `:5173` · hrm-api `:28001` · xbos-api `:28002` |
| **U65** | zero-seed · browser FE (`http://127.0.0.1:5173/hr/...` same-origin portal session) · no probe-only PASS |

## Raw machine log

`docs/qa/evidence/qa-ux-vi-format-01-r2-hrm-raw-20260720.json`

---

## L0

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM / XBOS / portal HTTP **200** |

---

## Click path

Login session `ceo@xe.vn` → HRM employees → search **DVU-0005** → **Hoàng Văn An** → tab **Hợp đồng** → sub-tab **Đãi ngộ**.

---

## Sample matrix

### 1) Compensation / Đãi ngộ — UF-HRM-03 (core R2)

| Step | AC | Result |
|------|-----|--------|
| Open Đãi ngộ (active package may omit `lines`) | no crash | **PASS** — panel renders; empty-state copy *«Gói đang áp dụng chưa có chi tiết dòng lương/phụ cấp…»*; **no** blank `#root`; **no** `active.lines.map` / `reading 'map'` |
| Contracts dates (before) | AC-UX-DATE | **PASS** — `01/01/2022` · `31/12/2030` |
| Profile hired | AC-UX-DATE | **PASS** — `02/01/2022` |
| Effective date button | AC-UX-DATE-02 | **PASS** — calendar trigger **`20/07/2026`** |
| N1 type `20000000` on base ViMoney | AC-UX-NUM-01 | **PASS** — display **`20.000.000`** (slow type) |
| Allowances | AC-UX-NUM-01 | **PASS** — `500000`→`500.000`; `300000`→`300.000` |
| N2 Network POST body | AC-UX-NUM-02 | **PASS** — `lines[].amount` are **numbers** `20000000` / `500000` / `300000`; body **does not** contain `"20.000.000"` |
| N3 F5 / reload → reopen Đãi ngộ | no crash | **PASS** — panel + date `20/07/2026` + ViMoney placeholders; no map error |

**Network excerpt (create POST — format proof):**

```json
{
  "method": "POST",
  "url": "/api/hrm/contracts-insurance/compensation-packages",
  "status": 404,
  "body.lines": [
    { "line_type": "base", "amount": 20000000, "currency": "VND" },
    { "line_type": "allowance", "allowance_code": "PHU_CAP_AN", "amount": 500000 },
    { "line_type": "allowance", "allowance_code": "PHU_CAP_XANG", "amount": 300000 }
  ]
}
```

**Verdict core:** 🟢 **PASS** — P0 crash closed; typing + numeric payload + F5 panel OK.

### 2) Insurance — UF-HRM-04 (spot)

| Step | Result |
|------|--------|
| Landing dates | **PASS** — e.g. `30/03/2026`, `31/03/2026` (dd/MM/yyyy) |
| Dialog **Thêm bảo hiểm** → Mức lương đóng BH type `20000000` | **PASS** → **`20.000.000`**; preview BHXH/BHYT/BHTN shows grouped `₫` |
| Tỷ lệ % spinbuttons | EXEMPT — plain `8` / `1.5` / `1` (not thousand-grouped) |
| Verdict | 🟢 typing sample PASS (no Save — U65 format spot only) |

### 3) Payroll — UF-HRM-06 (spot)

| Step | Result |
|------|--------|
| List Thực lĩnh | **PASS** display grouping — e.g. `17.190.000 ₫`, `15.390.000 ₫` |
| Kỳ lương | `Kỳ lương 05/2026` (period — not forced to day) |
| Verdict | 🟢 display PASS |

### 4) Job salary_min/max — UF-HRM-12

| Step | Result |
|------|--------|
| Typing sample | ⬜ **not promoted** this wave (time) — core compensation + insurance/payroll covered |

---

## Residuals (not format blockers)

| ID | Sev | Notes | Owner |
|----|-----|-------|-------|
| `R-UX-VI-COMP-POST-404` | P2 | POST `/api/hrm/contracts-insurance/compensation-packages` returned **404** after FE built numeric body — save toast fail; **format AC still PASS** | PM → `dev-be` if create must work on this env |
| Job salary dialog typing | P3 | Not opened in R2 | optional QA follow-up |

---

## completion_report

### Closed

- R2 retest after `D-UX-VI-COMP-PANEL-LINES-MAP-01`: Đãi ngộ **no crash** when active package lacks `lines`.
- AC-UX-NUM-01/02 on compensation base + allowances (UI group + Network numbers).
- AC-UX-DATE-02 on compensation effective button `dd/MM/yyyy`.
- F5 reopen Đãi ngộ stable.
- Insurance money typing + payroll list display samples.

### Residual

- Create package HTTP **404** (persistence) — out of format scope; flag for BE if PM wants create path green.
- Recruitment salary_min/max typing not promoted.

## next_owner

**pm** (optional: `qc` residual close on format wave; or `dev-be` for POST 404)

## next_dispatch_prompt

```text
work_item_id: QC-UX-VI-FORMAT-01-R2 (or PM intake)
from_role: qa
to_role: pm
ack: PASS_TO_PM
evidence: docs/qa/evidence/qa-ux-vi-format-01-r2-hrm-20260720.md
summary: P0 lines.map crash closed; ViMoney 20000000→20.000.000; Network amounts numeric; F5 Đãi ngộ OK; insurance/payroll samples PASS.
residual: POST compensation-packages 404 on create — triage D-UX-VI-COMP-POST-404 if needed (not format fail).
cấm: seed · Phase1/PROD claim
```

## ack_status

**PASS_TO_PM**
