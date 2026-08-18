# D-UX-VI-FORMAT-MOBILE-01 — Mobile FE evidence (2026-07-20)

| Field | Value |
|-------|-------|
| **work_item_id** | `D-UX-VI-FORMAT-MOBILE-01` |
| **from_role** | pm |
| **to_role** | qa (smoke AC-MUX-02 + money display) |
| **lane** | execution |
| **role** | dev-mobile |
| **spec_ref** | `docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md` §4.1 Mobile ESS · BR-UX-DATE-01/02 · BR-UX-NUM-01/04 · AC-MUX-02 (`MOBILE_IOS_UX_INHERITANCE_PLAN.md`) |
| **inventory** | `docs/qa/evidence/d-ux-vi-format-inventory-01-20260720.md` (mobile: **0** money edit inputs) |
| **ack_status** | **READY_FOR_QA** |
| **cấm** | seed · Phase1/PROD claim |

---

## 1. Grep inventory — money entry

| Probe | Result |
|-------|--------|
| `TextInput` + `keyboardType` `numeric` / `decimal-pad` / `number-pad` under `apps/mobile/hrm-mobile/src` | **0 matches** |
| Feature fields: `salary` / `base_salary` / `charterCapital` / `contributedValue` / `budget_amount` / `penalty_amount` as editable inputs | **None** (payslip amounts are **read-only** display) |
| `FormField` / `DynamicProfileForm` keyboard map | `default` \| `phone-pad` \| `email-address` only — **no money pad** |
| Editable TextInputs found | Search, reject reason, profile ESS text, leave title/contact/reason, login — **EXEMPT / non-money** |

**Verdict AC-UX-NUM-01 (mobile entry):** **N/A** — no MUST money **entry** fields on ESS mobile. Inventory confirmed. No `ViGroupedIntegerInput` / typing mask required this wave.

---

## 2. Money display (MUST read-only — AC-UX-NUM-04)

| Surface | Formatter | Status |
|---------|-----------|--------|
| Payslip list / detail / hero | `formatHrmCurrency` / `formatPayslipHeroNet` → `Intl.NumberFormat('vi-VN')` | Already OK |
| Profile payslip cards | `formatHrmCurrency` | Already OK |
| Home feed payslip teaser | `formatPayslipHeroNet` | Already OK |
| Inbox `payslip.published` subtitle | Was raw `net_amount` string | **Fixed** → `formatHrmCurrency` via `parseAmount` (accepts number + vi-VN grouped string) |

**Code delta (display-only parity):**

- `apps/mobile/hrm-mobile/src/utils/formatHrm.ts` — `parseAmount` accepts vi-VN `15.000.000` / `1.500.000,5` and en `20,000,000` (BR-UX-NUM-03).
- `apps/mobile/hrm-mobile/src/utils/inboxNotificationCopy.ts` — `resolvePayslipNetDisplay` for inbox subtitle.

---

## 3. Dates — AC-MUX-02 / AC-UX-DATE-01/02

| Component / surface | Behavior | Proof |
|---------------------|----------|-------|
| `HrmDateField` | Trigger shows `formatHrmDate(value)` → `dd/MM/yyyy`; `onChange` stores ISO `YYYY-MM-DD` via `toIsoDateOnly` | `HrmDateField.tsx` L74–81, L63 |
| `HrmDateRangeField` | Display `formatHrmDate` range | component |
| Leave list / detail / create / manager cards | `formatHrmDate` / `formatHrmDateRange` / `formatHrmDateTime` | leave screens + `leaveUxParity.test.ts` |
| Payslip period range | `formatHrmDateRange` on payroll summary | `PayrollSummaryScreen` |
| Contracts / attendance / ops due dates | `formatHrmDate` / `formatHrmDateTime` | feature screens |
| `formatHrm.ts` SoT | `dd/MM/yyyy` · datetime `dd/MM/yyyy HH:mm` · invalid → `—` | `formatHrm.test.ts` |

**No ISO `yyyy-MM-dd` or `…T…Z` on user-facing leave/payslip date labels** — API still uses ISO on wire (BR-UX-DATE-02).

---

## 4. Tests run (agent)

```text
pnpm --filter hrm-mobile exec vitest run \
  src/utils/__tests__/formatHrm.test.ts \
  src/utils/__tests__/inboxNotificationCopy.test.ts \
  src/components/ui/__tests__/leaveUxParity.test.ts \
  src/integrations/__tests__/payrollPayslips.test.ts
```

| Result | Count |
|--------|-------|
| Exit | **0** |
| Files | 4 passed |
| Tests | **37/37** |

---

## 5. spec_read_ack

- srs/AC: `docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md` §3–5 · §4.1 Mobile ESS
- tech/UX: `docs/program/MOBILE_IOS_UX_INHERITANCE_PLAN.md` AC-MUX-02
- inventory: `docs/qa/evidence/d-ux-vi-format-inventory-01-20260720.md`
- change_mode: **ADD** (parse + inbox display) — no money entry widget
- must_keep: leave/payslip date via `formatHrm*`; no seed; API payloads unchanged

---

## 6. Residual

| Item | Priority | Notes |
|------|----------|-------|
| Device visual smoke J-MOB-03/04 date + payslip amount chips | QA | Browser/device not run this wave (dev vitest only) |
| Future catalog money custom field on DynamicProfileForm | P2 | No money unit/keyboard today — if BE adds salary custom field, wire grouped entry then |
| Import `@xevn/ui` `parseViGroupedInteger` into RN | Defer | Local `parseAmount` parity enough; avoid RN package edge this wave |

---

## 7. Handoff

```text
work_item_id: D-UX-VI-FORMAT-MOBILE-01
from_role: dev-mobile
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/d-ux-vi-format-mobile-01-fe-20260720.md
entry_criteria: evidence above; U65 zero-seed; no APK rebuild required for money-entry (N/A)
exit_criteria: Confirm (1) no money TextInput on ESS; (2) leave dates dd/MM/yyyy; (3) payslip amounts vi-VN; (4) inbox payslip subtitle currency if net present
J-*: J-MOB-03 leave · J-MOB-04 payslip (display)
cấm: seed · Phase1 DONE
```

### next_dispatch_prompt

```text
work_item_id: D-UX-VI-FORMAT-MOBILE-01
from_role: pm
to_role: qa
lane: execution
entry_criteria: D-UX-VI-FORMAT-MOBILE-01 READY_FOR_QA; evidence docs/qa/evidence/d-ux-vi-format-mobile-01-fe-20260720.md; U65 zero-seed
exit_criteria: AC-MUX-02 leave/payslip dates dd/MM/yyyy; payslip net/gross vi-VN grouping; confirm zero money entry fields; PASS_TO_PM or FAIL with not promoted
J-*: J-MOB-03, J-MOB-04
cấm: seed · Phase1/PROD
```
