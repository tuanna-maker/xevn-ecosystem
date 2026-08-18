# QA-UX-D5-01 — Retest live Zod wire (D-UX-D5-ZOD-LIVE-WIRE-01)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-UX-D5-01` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-07-28 |
| **dev_handoff** | `docs/qa/evidence/d-ux-d5-zod-live-wire-01-20260728.md` (**READY_FOR_QA**) |
| **prior_fail** | `docs/qa/evidence/qa-ux-d5-01-20260728.md` (**FAIL_TO_PM** — Zod orphan) |
| **ack_status** | **PASS_TO_PM** |
| **locks** | U65 zero-seed · HOLD_DEPLOY · no seed · no deploy |
| **Account** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Host** | `http://127.0.0.1:5173` |
| **Runtime** | `docs/qa/evidence/_tmp-qa-ux-d5-01-runtime.json` |
| **Script** | `scripts/qa/qa-ux-d5-01-browser.mjs` (CTA selector fix: `Thêm mới`) |
| **Screens** | `docs/qa/evidence/screens/qa-ux-d5-01/` |

---

## Spec / DoD retest

| AC | Result |
|----|--------|
| Live **Thêm mới** = `SalaryComponentsTab` path | **PASS** |
| Empty submit → `formItemMessage≥1` (RHF FormMessage) | **PASS** (`formItemMessage=3`) |
| VI messages from `payroll.salaryComponents.*` (not manual-only) | **PASS** — `không được để trống` / `Vui lòng chọn…` (= `vi.json` `payroll.salaryComponents.*`, not old `là bắt buộc`) |
| must_keep: `#root` populated; no `t is not defined` | **PASS** |
| must_keep: Tính lương → Bảng quyết toán thuế | **PASS** |
| must_keep: Clock-In wizard C1 | **PASS** |
| taxSettlementFloatingUi not regressed (unit) | **PASS** 9/9 |

---

## L0 / unit (supporting)

| Check | Result |
|-------|--------|
| `pnpm run qc:fe-be-health` | **ALL PASS** exit 0 |
| vitest `salaryComponentFormSchema` + `taxSettlementFloatingUi` | **14/14 PASS** |
| Seed | **None** (U65) |

---

## Browser execution (U65)

### 1) `/hr/payroll` mount

| Check | Result |
|-------|--------|
| `#root` length | **3017290** (>80) |
| `ReferenceError: t is not defined` | **0** |
| pageErrors | **[]** |
| Verdict | **🟢 PASS** |

Screen: `01-payroll-mount.png`

### 2) Tính lương → Bảng quyết toán thuế (C1 must_keep)

| Check | Result |
|-------|--------|
| Nav | **PASS** — menuitem |
| Crash / `t` / Invalid hook | **0** |
| Tax UI visible | **PASS** |
| Verdict | **🟢 PASS** |

Screen: `02-tax-settlement.png`

### 3) Live dialog Thêm mới — Zod+RHF

| Check | Result |
|-------|--------|
| Tab Thành phần lương | **PASS** |
| CTA | **`+ Thêm mới`** (script updated; prior run missed CTA = false negative) |
| Dialog title | `Thêm mới thành phần lương` |
| Empty submit CTA | `Thêm mới` |
| fieldErrors VI | **PASS** — `Mã thành phần không được để trống` · `Tên thành phần không được để trống` · `Vui lòng chọn loại thành phần` |
| Stack | `formItemMessage=3` · `manualDestructiveP=3` (FormMessage also has `text-destructive` class — expected) |
| Zod+RHF live wiring | **🟢 PASS** — RHF FormMessage on live `SalaryComponentsTab` Add |
| Namespace proof | Live msgs match `payroll.salaryComponents.codeRequired/nameRequired/typeRequired` (**not** prior `salaryComponents.validation.*` / `là bắt buộc`) |
| Valid fill light | residual `Mã thành phần đã tồn tại` (Zod uniqueness; no seed) — dialog stayed open |

Screens: `03-components-tab.png` · `04-add-dialog.png` · `05-empty-submit-errors.png` · `06-valid-attempt.png`

### 4) UX-03 / C1 must_keep light

| Check | Result |
|-------|--------|
| Clock-In wizard | **🟢 PASS** |
| Contracts search smoke | **🟢 PASS** — baseline 10 → neg → 1 → clear restore 10 |
| Console `t` undefined | **0** |

Screens: `07-clock-in.png` · `08-contracts.png`

---

## Source spot-check (supporting)

| Check | Result |
|-------|--------|
| `SalaryComponentsTab.tsx` → `createSalaryComponentFormSchema` + `zodResolver` + `FormMessage` | **Present** |
| Live Add empty → FormMessage ids | **Browser PASS** |
| `Payroll.tsx` orphan Add Dialog (`showAddSalaryComponentDialog`) | **Still present** — never opened from CTA; **dead code residual P2** (Dev claim “removed” incomplete; does **not** block live-wire DoD) |

---

## Verdict summary

| Layer | Result |
|-------|--------|
| L0 / fe-be-health | **PASS** |
| Unit Zod + tax floating | **PASS** 14/14 |
| Payroll mount / no `t` crash | **PASS** |
| Tax settlement C1 | **PASS** |
| Live Add empty → VI FormMessage (Zod+RHF) | **PASS** |
| Prior defect (Zod orphan / manual-only live) | **CLOSED** |
| Clock-In + Contracts smoke | **PASS** |
| **Overall QA-UX-D5-01 retest** | **PASS_TO_PM** |

### Matrix / unlock note

- **D5 live Zod wiring:** 🟢 CLOSED — prior FAIL superseded by this retest.
- **UX-09:** PM may **unlock** `D-UX-UX09-SHIFTS-BULK-01` (gate condition from prior FAIL cleared).
- Script note: `qa-ux-d5-01-browser.mjs` CTA now includes `Thêm mới` (label of `salaryComponents.addNew`).

---

## Residual / not promoted

1. **P2 cleanup** — `Payroll.tsx` still hosts unused Add Salary Component Dialog + `showAddSalaryComponentDialog` state (no `setShow(true)` from user CTA). Recommend Dev-FE delete dead dialog in a small follow-up; **not** a retest blocker.
2. **Info** — Edit dialog on `SalaryComponentsTab` still uses manual `salaryComponents.validation.*` (out of D5 Add-live scope per Dev handoff).

---

## Handoff

- `completion_report`: Retest after `D-UX-D5-ZOD-LIVE-WIRE-01` — live Add dialog Zod+RHF **PASS** (`formItemMessage=3`, `payroll.salaryComponents.*` VI); must_keep Payroll mount / tax C1 / Clock-In / Contracts **PASS**; prior orphan-dialog FAIL **CLOSED**. UX-09 unlock eligible. Dead Payroll Dialog = P2 residual only.
- `next_owner`: `pm`
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/qa/evidence/qa-ux-d5-01-retest-live-wire-20260728.md`

### next_dispatch_prompt

```text
work_item_id: D-UX-UX09-SHIFTS-BULK-01
from_role: pm
to_role: (owner per peer plan — Cursor lane)
lane: execution
entry_criteria: QA-UX-D5-01 PASS_TO_PM @ docs/qa/evidence/qa-ux-d5-01-retest-live-wire-20260728.md · UX-09 UNLOCK
read_first:
  - docs/qa/evidence/qa-ux-d5-01-retest-live-wire-20260728.md
  - docs/program/UX-UI-ERP-REMAINING-SYNTHESIS.md (UX-09)
scope: Shifts bulk per UX-09 plan
must_keep: Payroll mount; taxSettlementFloatingUi; SalaryComponentsTab Add Zod+RHF (🟢)
optional_followup_P2: D-UX-D5-ORPHAN-DIALOG-CLEANUP — remove dead showAddSalaryComponentDialog block in Payroll.tsx
cấm: seed · deploy · HOLD_DEPLOY
```

---

## Reproduce

```bash
pnpm run qc:fe-be-health
pnpm --filter vite_react_shadcn_ts exec vitest run src/components/payroll/__tests__/salaryComponentFormSchema.test.ts src/components/payroll/__tests__/taxSettlementFloatingUi.test.ts
node scripts/qa/qa-ux-d5-01-browser.mjs
```
