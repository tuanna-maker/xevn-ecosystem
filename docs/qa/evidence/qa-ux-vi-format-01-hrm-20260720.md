# QA-UX-VI-FORMAT-01 — HRM browser evidence (2026-07-20)

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-UX-VI-FORMAT-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **ack_status** | **FAIL_TO_PM** |
| **persona** | `ceo@xe.vn` / `Xevn@2026` (Group CEO, `companyId=main`) |
| **spec_ref** | `docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md` §5 AC-UX-DATE/NUM · BA checklist `docs/qa/evidence/ba-ux-vi-format-ac-01-20260720.md` §3 |
| **evidence_dev** | `docs/qa/evidence/d-ux-vi-format-hrm-01-fe-20260720.md` |
| **env** | L0 PASS — portal `:5173` · hrm-api `:28001` · xbos-api `:28002` |
| **U65** | zero-seed · browser FE path (Cursor IDE browser + Playwright Chromium) · no probe-only PASS |

## Raw machine log

`docs/qa/evidence/qa-ux-vi-format-01-hrm-raw-20260720.json`

---

## L0

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM/XBOS/portal HTTP **200** |

---

## Sample matrix

### 1) Compensation / Đãi ngộ — UF-HRM-03 money + date

| Step | Result |
|------|--------|
| Click path | CC → Nhân sự → DVU-0005 Hoàng Văn An → Hợp đồng → Đãi ngộ |
| Contracts list dates (before Đãi ngộ) | **PASS** — `01/01/2022` · `31/12/2030` (dd/MM/yyyy) |
| Profile hired date | **PASS** — `02/01/2022` |
| Đãi ngộ form flash (Cursor a11y) | Date button **`20/07/2026`**; placeholders **`15.000.000`** / **`500.000`** (vi-VN chrome present) |
| After Đãi ngộ settle | **FAIL P0** — iframe `#root` length **0** (blank white screen) |
| Typing `20000000` → `20.000.000` | **BLOCKED** by crash |
| Network numeric POST | **BLOCKED** by crash |
| F5 | **BLOCKED** by crash |

**Page error (Playwright `pageerror`):**

```text
TypeError: Cannot read properties of undefined (reading 'map')
```

**Console (excerpt):**

```text
The above error occurred in the <EmployeeCompensationPanel> component:
  at EmployeeCompensationPanel (.../EmployeeCompensationPanel.tsx)
```

**Root cause (code):** `EmployeeCompensationPanel.tsx` ~L248 renders `active.lines.map(...)` when `active` is truthy but `active.lines` is **undefined**. `useEffect` already guards with `active?.lines?.length` (L123) — render path does not.

**Verdict:** 🔴 **FAIL** — blocks AC-UX-NUM-01/02 + AC-UX-DATE-02 on compensation wire.

### 2) Insurance — UF-HRM-04

| Step | Result |
|------|--------|
| `/command-center/hrm/insurance` iframe load | Loads (snippet present) |
| ViMoney `inputmode=numeric` type=text count on landing | **0** (need Add/Policy dialog — not completed after P0) |
| Verdict | ⬜ **not promoted** this wave (blocked by P0 focus + no dialog open) |

### 3) Job salary_min/max — UF-HRM-12

| Step | Result |
|------|--------|
| Recruitment iframe load | Loads |
| salary_min/max typing | ⬜ **not promoted** (dialog not opened after P0) |

### 4) Payroll tax / sales — UF-HRM-06

| Step | Result |
|------|--------|
| Payroll iframe load | Loads |
| ViMoney count on landing | **0** (tabs/dialogs not opened after P0) |
| dependents/year EXEMPT | ⬜ **not promoted** |

---

## Supporting (not U65 substitute)

```text
pnpm --filter vite_react_shadcn_ts exec vitest run \
  src/components/ui/__tests__/viMoneyInput.test.ts \
  src/lib/viNumberFormat.test.ts \
  src/lib/formatDisplayDate.test.ts \
  src/lib/compensationLines.test.ts
→ 18 PASS (4 files)
```

Unit PASS does **not** clear U65 — browser mutate path blocked.

---

## Checklist vs BA §3

| ID | Result |
|----|--------|
| D1 Contracts dates dd/MM/yyyy | 🟢 |
| D2 Recruitment deadline | ⬜ not promoted |
| D5 no ISO-Z on observed surfaces | 🟢 (spot) |
| N1 typing 20.000.000 | 🔴 blocked P0 |
| N2 Network numeric | 🔴 blocked P0 |
| N3 F5 | 🔴 blocked P0 |
| N5 Insurance/payroll sample | ⬜ not promoted |
| E1–E4 EXEMPT | ⬜ not promoted |

---

## Defects

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| **D-UX-VI-COMP-PANEL-LINES-MAP-01** | **P0** | `EmployeeCompensationPanel` crash: `active.lines.map` when `lines` undefined → blank iframe after Đãi ngộ | **dev-fe** |

**Fix hint:** `(active.lines ?? []).map(...)` or treat missing lines as empty package UI; add regression test with `active` without `lines`.

---

## completion_report

### Closed

- L0 stack verified.
- Browser evidence: contract/profile **dd/MM/yyyy** PASS.
- Isolated **P0** crash on Đãi ngộ with reproducible Playwright + console stack to `EmployeeCompensationPanel`.
- Confirmed FE unit suite for VI format helpers still **18/18** (non-blocking residual context).

### Residual / not promoted

- Live typing + Network + F5 for compensation / insurance / job / payroll money fields.
- EXEMPT (dependents/year/%) browser proof.

### Explicit non-claims

- No Phase1 / PROD · no seed · no UF 🟢 promote for UX-VI-FORMAT on HRM money mutate.

---

## next_owner

**dev-fe** (hot-fix P0) → then **qa** retest `QA-UX-VI-FORMAT-01-R2`

## next_dispatch_prompt

```text
work_item_id: D-UX-VI-COMP-PANEL-LINES-MAP-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P0
entry_criteria: QA-UX-VI-FORMAT-01 FAIL — docs/qa/evidence/qa-ux-vi-format-01-hrm-20260720.md
spec_ref: docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md · EmployeeCompensationPanel Đãi ngộ

## Fix
- File: apps/web/hrm/src/components/employee/EmployeeCompensationPanel.tsx ~L248
- Bug: active.lines.map when active.lines undefined → TypeError → blank iframe
- Guard: (active.lines ?? []).map OR empty-state when !Array.isArray(active.lines)
- Add vitest/render test: active package without lines must not throw
- must_keep: ViMoneyInput wiring + Calendar dd/MM/yyyy from D-UX-VI-FORMAT-HRM-01

## Exit
- evidence: docs/qa/evidence/d-ux-vi-comp-panel-lines-map-01-20260720.md
- READY_FOR_QA → retest QA-UX-VI-FORMAT-01-R2 (compensation typing 20000000→20.000.000 + Network numeric + F5; then insurance/job/payroll samples)
cấm: seed · Phase1/PROD
```

## ack_status

**FAIL_TO_PM**
