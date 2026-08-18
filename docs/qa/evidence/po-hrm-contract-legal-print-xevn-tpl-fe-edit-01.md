# Evidence — `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-FE-EDIT-01`

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-FE-EDIT-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-07 |
| **lane** | execution · FIX residual |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QC-02` GO WITH CONDITIONS |
| **residual** | `R-CTR-XEVN-TPL-FE-EDIT-RESTORE` |
| **change_mode** | FIX |
| **honesty** | `contracts_printable_ready=false` — **DENIED** invent printable UAT |
| **U65** | zero-seed · no API-only claim |
| **ack_status** | **READY_FOR_QA** |

---

## Goal closed

After create bind template #9 → F5 → open **Sửa**, print template picker must restore bound template (not «— Chưa chọn —»).

---

## Root cause (confirmed)

1. `Contracts.tsx` `handleOpenEdit` **hard-cleared** `printTemplateId` / `printTemplateCode` / pack → `GENERAL` + empty.
2. `mapApiContract` **dropped** `pack_code` / `template_id` / `template_code` from Nest list row → after F5, edit had nothing to restore even if API returned `template_id`.

BE list SELECT already includes `ec.template_id` (+ `pack_code`). Create persists both id + code. FE was the drop/clear.

---

## Fix (preserve)

| Path | Change |
|------|--------|
| `lib/contractPrintEditRestore.ts` | Pure `restorePrintSpineFromContract` |
| `pages/Contracts.tsx` | `handleOpenEdit` restores via helper (CODE-MEMORY APPEND VI) |
| `hooks/useContracts.ts` | `Contract` + `mapApiContract` passthrough pack/template |
| `integrations/hrmApi.ts` | `HrmContractRecord.template_code` typed |

**must_keep retained:** print-spine · UF-HRM-02 · Q-CTR CLOSED · open catalog · honesty false · no DnD rewrite · no seed.

---

## Tests

```text
pnpm exec vitest run src/lib/contractPrintEditRestore.test.ts src/hooks/useContracts.test.ts src/lib/contractPrintRequest.test.ts
→ 3 files · 19 tests PASS
```

| Suite | Assert |
|-------|--------|
| `contractPrintEditRestore.test.ts` | restore #9 id+code; unbound → empty; id-only when code null |
| `useContracts.test.ts` | mapApiContract passthrough pack/template |
| `contractPrintRequest.test.ts` | regression preview body (must_keep) |

---

## Honesty

```text
contracts_printable_ready = false
```

**DENIED:** invent printable ready · seed · reopen Q-CTR · rewrite unrelated DnD · Phase 1 DONE.

---

## Soft note (non-blocking for picker)

BE list/get-by-id SQL currently SELECTs `template_id` but **not** `template_code`. Picker Select binds by **id** — restore works after F5. Spine echoes `template_code` when catalog loads. Optional BE delta later: add `ec.template_code` to list/get SELECT for code on row without waiting catalog — **not** required to close this CONDITION for picker UI.

---

## QA retest (copy-ready)

1. L0: `qc:dev-stack` + `qc:fe-be-health`
2. Persona `ceo@xe.vn` · U65 zero-seed
3. Path: create HĐ bind open-catalog #9 (or reuse `HD-F9V16` if still present) → F5 list
4. Open **Sửa** → assert picker trigger ≠ «— Chưa chọn —» · shows bound `#9` / `XEVN_CUSTOM_*`
5. Preview without re-select → body `template_code` = bound code (optional strengthen)
6. must_keep: print-spine visible · UF-HRM-02 · honesty false
7. Update machine `f5KeepsTpl=true`

---

## completion_report

Closed `R-CTR-XEVN-TPL-FE-EDIT-RESTORE`: `handleOpenEdit` restores print spine from contract row; `mapApiContract` passthrough `template_id`/`template_code`/`pack_code`. Vitest 19 PASS. Honesty false. Soft note BE list omit `template_code` column (picker OK via id).

## next_owner

**qa**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-EDIT-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-FE-EDIT-01 READY_FOR_QA
residual_auto_fix: true

## Goal
Retest R-CTR-XEVN-TPL-FE-EDIT-RESTORE — create bind #9 → F5 → Sửa → picker still #9 (not «— Chưa chọn —»).

## read_first
1. docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-fe-edit-01.md
2. docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qc-02.md CONDITION
3. DYNAMIC-LOCK · UF-HRM-02 must_keep

## entry
- FE-EDIT-01 READY: handleOpenEdit + mapApiContract restore
- vitest 19 PASS cited
- honesty: contracts_printable_ready=false
- U65 zero-seed browser-only

## exit
- f5KeepsTpl=true · PNG edit picker #9
- evidence: docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qa-edit-01.md
- PASS_TO_PM (then QC delta GWC close CONDITION)
- cấm: seed · invent printable ready · demote sealed AC-11 create/picker
```

## ack_status

**READY_FOR_QA**

## evidence_path

`docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-fe-edit-01.md`
