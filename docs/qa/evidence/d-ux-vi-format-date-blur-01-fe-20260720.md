# D-UX-VI-FORMAT-DATE-BLUR-01 — Dev-FE evidence (2026-07-20)

| Field | Value |
|-------|-------|
| **work_item_id** | `D-UX-VI-FORMAT-DATE-BLUR-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **spec_ref** | `docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md` AC-UX-DATE-02 |
| **evidence_qa** | `docs/qa/evidence/qa-ux-vi-format-portal-01-20260720.md` (sample 5 FAIL) |
| **ack_status** | **READY_FOR_QA** |

---

## Root cause

`ViDateInput` only called `onValueChange(iso)` on **blur**. Two failure modes:

1. **Blur → Save same gesture:** React schedules parent `setState` from blur; **Lưu** `onClick` can run before re-render, so `saveCompanySettings()` reads stale `companyForm.firstIssueDate`.
2. **Incomplete commit path:** Parent ISO state lagged behind visible draft (`20/07/2026`) until blur; any save path that skipped blur kept old ISO in PUT.

Unit helpers (`parseViDisplayToIsoDate`) were already correct — wiring/timing only.

---

## Fix (packages/ui)

| File | Change |
|------|--------|
| `packages/ui/src/lib/viDateFormat.ts` | `isCompleteViDateDraft()` — commit gate for full `dd/MM/yyyy` / `yyyy-MM-dd` or cleared |
| `packages/ui/src/components/ViDateInput.tsx` | Commit ISO on `onChange` when draft complete; `flushSync` parent update on `onBlur`; refs avoid stale `value` during commit |
| `packages/ui/src/index.ts` | Export `isCompleteViDateDraft` |

**Surfaces auto-fixed (same component):**

- CC `companyForm.firstIssueDate` (`CommandCenterPage.tsx`)
- CC infra `leaseLegalEndDate`
- Metadata legal doc `issuedDate` / `expiredDate` (`MetadataDateInput`)

**must_keep:** Charter / `contributedValue` `ViGroupedIntegerInput` unchanged; vendors/expense numeric payloads unchanged.

---

## spec_read_ack

- **srs:** `docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md` BR-UX-DATE-02, AC-UX-DATE-02
- **tech_spec:** `@xevn/ui` `ViDateInput` + `viDateFormat` helpers
- **change_mode:** ADD (commit-on-complete + sync blur)

---

## Verification

```bash
pnpm --filter web-portal test -- src/utils/viNumberFormat.test.ts
```

**Result:** 11/11 PASS (added `isCompleteViDateDraft` cases).

---

## QA retest matrix (browser — U65)

| Step | Expected |
|------|----------|
| Login `ceo@xe.vn` → CC Đơn vị thành viên → Chỉnh sửa Tập đoàn XeVN | Load OK |
| `firstIssueDate` shows `dd/MM/yyyy` (not ISO-Z) | AC-UX-DATE-01 |
| Type `20/07/2026` → blur MST or click **Lưu** | Network PUT `establishedAt` + `payload.companyForm.firstIssueDate` = **`2026-07-20`** |
| F5 / re-open | Display **`20/07/2026`** |
| Charter / shareholder money | Still grouped; ratio % EXEMPT; numeric PUT |

**Hygiene (optional):** If holding charter still **20.000.000** from prior QA sample, restore **55.500.000** via FE + Lưu (not seed).

---

## completion_report

**Closed:** ViDateInput commit timing for AC-UX-DATE-02; all portal `ViDateInput` usages inherit fix; vitest 11 PASS.

**Residual:** Browser confirm sample 5 + legal-doc / infra date rows; optional charter restore during QA.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-UX-VI-FORMAT-DATE-BLUR-01
from_role: pm
to_role: qa
lane: execution
entry_criteria: D-UX-VI-FORMAT-DATE-BLUR-01 READY_FOR_QA; L0; U65 browser-only
spec_ref: docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md AC-UX-DATE-02
evidence_dev: docs/qa/evidence/d-ux-vi-format-date-blur-01-fe-20260720.md

Retest QA-UX-VI-FORMAT-PORTAL-01 sample 5: CC firstIssueDate type 20/07/2026 → Lưu → Network ISO 2026-07-20 → F5 dd/MM/yyyy.
Regression samples 1–4 money MUST unchanged. Optional: restore holding charter 55.500.000 if still 20.000.000.
exit: PASS_TO_PM or FAIL_TO_PM · evidence docs/qa/evidence/qa-ux-vi-format-date-blur-01-20260720.md
cấm: seed · Phase1/PROD claim
```

## ack_status

**READY_FOR_QA**
