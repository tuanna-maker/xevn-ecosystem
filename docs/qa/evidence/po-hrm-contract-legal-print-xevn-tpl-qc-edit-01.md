# Evidence — `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QC-EDIT-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QC-EDIT-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | L3 gate **delta** — close CONDITION **`R-CTR-XEVN-TPL-FE-EDIT-RESTORE`** only |
| **priority** | P1 edit F5 picker restore CLOSED · AC-11 create sealed · printable UAT denied |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` |
| **Verdict** | **GO WITH CONDITIONS** — CONDITION **`R-CTR-XEVN-TPL-FE-EDIT-RESTORE` CLOSED**; AC-11 slice GWC residual board updated |
| **ack_status** | `PASS_TO_PM` |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-EDIT-01` `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-contract-legal-print-xevn-tpl-qa-edit-01.md`](po-hrm-contract-legal-print-xevn-tpl-qa-edit-01.md) |
| **fe_ref** | [`po-hrm-contract-legal-print-xevn-tpl-fe-edit-01.md`](po-hrm-contract-legal-print-xevn-tpl-fe-edit-01.md) |
| **prior_gwc** | [`po-hrm-contract-legal-print-xevn-tpl-qc-02.md`](po-hrm-contract-legal-print-xevn-tpl-qc-02.md) — CONDITION FE-EDIT-RESTORE was **OPEN** (`f5KeepsTpl=false`) |
| **machine** | [`_tmp-po-hrm-contract-legal-print-xevn-tpl-qa-edit-01.FINAL.json`](_tmp-po-hrm-contract-legal-print-xevn-tpl-qa-edit-01.FINAL.json) · stamp **`EDIT-IFUBE8`** · HĐ **`HD-FUZ5S`** |
| **screens** | `docs/qa/evidence/screens/po-hrm-contract-legal-print-xevn-tpl-qa-edit-01/` (**8/8** PNG) |
| **spec** | DYNAMIC LOCK · CORR-01 **AC-CTR-XEVN-11** edit F5 keep picker |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — residual close ≠ contracts printable module UAT / Phase 1 DONE |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **contracts_printable_ready** | **false** | **DENIED** invent `true` / printable UAT / clean module GO |
| **Module printable UAT** | **DENIED** | Slice delta only |
| **product_go / production GO** | **DENIED** | Out of scope |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Machine `seed_used=false` · `api_only_pass=false` |
| **AC-11 create #9+** | **Sealed** (QC-02) | **Not reopened** |
| **Q-CTR** | **CLOSED** retained | **Not reopened** |

---

## Verdict summary

**GO WITH CONDITIONS** — delta ACCEPT: close **`R-CTR-XEVN-TPL-FE-EDIT-RESTORE`** after U65 browser QA-EDIT PASS (`f5KeepsTpl=true`).

| Gate item | Evidence | QC |
|-----------|----------|-----|
| **R-CTR-XEVN-TPL-FE-EDIT-RESTORE** | Create bind #9 → F5 → Sửa · picker = `XEVN_CUSTOM_EDIT-IFUBE8` · not «— Chưa chọn —» · `f5KeepsTpl=true` · PNG 06 | 🟢 **CLOSED** |
| Preview without re-select | `prevOk=true` · `bodyHasTpl=true` · `bodyCode=XEVN_CUSTOM_EDIT-IFUBE8` · PREV **201** | 🟢 **ACCEPT** |
| AC-CTR-XEVN-11 create/picker core | Prior QC-02 seal + QA-EDIT create path PASS | 🟢 **RETAIN** (not demoted) |
| must_keep print-spine · UF-HRM-02 · open-catalog · Q-CTR | machine `must_keep` all PASS | 🟢 **RETAIN** |
| Process hygiene | dndStorm=0 · uncaught=0 · mojibake=false | 🟢 **ACCEPT** |
| Honesty false | UI banner + machine | 🟢 **RETAIN** |
| Module printable UAT | Explicit false | 🟢 **DENIED** |

**Cấm:** `contracts_printable_ready=true` · invent printable UAT · Phase 1 DONE · reopen sealed AC-11 create · reopen Q-CTR · seed.

**Scope note:** This seal closes **edit F5 restore CONDITION** only. **NOT** Phase 1 DONE. **NOT** contracts printable module UAT-ready. **C-SLICE-≠-MODULE**.

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC-02 GWC | `po-hrm-contract-legal-print-xevn-tpl-qc-02.md` | PASS_TO_PM | CONDITION FE-EDIT-RESTORE **OPEN** (baseline `f5KeepsTpl=false`) |
| FE-EDIT wire | `po-hrm-contract-legal-print-xevn-tpl-fe-edit-01.md` | READY_FOR_QA | **ACCEPT** chain parent |
| QA-EDIT browser | stamp `EDIT-IFUBE8` · `HD-FUZ5S` · overall **PASS** | PASS_TO_PM | **ACCEPT** U65 |
| QA pack verify | `verify:qc:evidence-pack` on QA-EDIT MD | **FAIL** `residual_section` (heading `## 4. Residual`) | **PROCESS OBS** — not product demote; this QC consolidates |

### Machine JSON spot (stamp `EDIT-IFUBE8`)

| Signal | Value | QC |
|--------|-------|-----|
| `env.STAMP` / `TPL_CODE` | `EDIT-IFUBE8` · `XEVN_CUSTOM_EDIT-IFUBE8` | 🟢 |
| `ids.contractCode` / id | `HD-FUZ5S` · `596d9280-…` | 🟢 |
| `l0` portal/hrm/xbos | 200 | 🟢 |
| `honesty.contracts_printable_ready` | **false** | 🟢 |
| `denied[]` | ready=true · seed · api_only · invent_printable_UAT · reopen_Q-CTR | 🟢 |
| Create tpl POST | **201** `HRM-CTR-TPL-201` | 🟢 |
| Create HĐ POST | **201** `HRM-CON-201` · `template_code=#9` | 🟢 |
| `f5KeepsTpl` | **true** | 🟢 **CONDITION close** |
| `ids.editTrigText` | contains `XEVN_CUSTOM_EDIT-IFUBE8` | 🟢 |
| `ids.isEmptyPick` | **false** | 🟢 |
| Preview no-reselect | PREV **201** `HRM-CTR-PREV-200` · `bodyHasTpl=true` · code `#9` | 🟢 |
| `residuals[0].status` | **CLOSED** | 🟢 |
| `overall` | **PASS** | 🟢 |
| U65 | `seed_used=false` · `api_only_pass=false` | 🟢 |

### Screenshot visual spot

| File | QC observation |
|------|----------------|
| `06-edit-after-f5-picker.png` | Dialog **Chỉnh sửa hợp đồng** · `HD-FUZ5S` · **Mẫu HĐ** = `Mẫu EDIT restore EDIT-IFUBE8 (XEVN_CUSTOM_ED…)` · **not** «— Chưa chọn —» · honesty banner `contracts_printable_ready=false` |
| Screens dir | **8/8** PNG on disk (00–07) |

Contrast baseline QC-02 PNG 08: picker was «— Chưa chọn —» (`f5KeepsTpl=false`) — **superseded** by this seat.

---

## Gate AC audit (AC-CTR-XEVN-11 edit path)

| # | AC / Check | Spec / dispatch | QA-EDIT | QC |
|---|------------|-----------------|---------|-----|
| 1 | Settings tạo mẫu #9 → 2xx → F5 | AC-CTR-XEVN-11 | 🟢 | 🟢 **RETAIN** path |
| 2 | Bind picker on create HĐ | same | 🟢 | 🟢 **RETAIN** |
| 3 | Save + F5 list | same | 🟢 | 🟢 **RETAIN** |
| 4 | Edit UI F5 keeps `template_code` | AC wording «F5 còn» on edit | 🟢 `f5KeepsTpl=true` | 🟢 **CLOSED** (was CONDITION) |
| 5 | Preview without re-select | residual close AC | 🟢 bodyHasTpl | 🟢 **ACCEPT** |
| 6 | must_keep spine · UF-02 · Q-CTR · open catalog | CORR must_keep | 🟢 | 🟢 **RETAIN** |
| 7 | Honesty false | mandatory | 🟢 | 🟢 **RETAIN** |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this seal | QC |
|---------|-------------------|-----|
| **Edit F5 restore** (AC-11 edit UI) | In-scope this delta | 🟢 **PASS** (`EDIT-IFUBE8`) |
| **J-HRM-CTR-07** create/picker/preview | Prior QA-02 / QC-02 sealed | 🟢 **RETAIN** · not reopened |
| Print-spine / J-HRM-03 host | must_keep | 🟢 **RETAIN** |
| Module contracts printable UAT | Out of scope | **DENIED** |

---

## Classification

| Item | Class | Disposition |
|------|-------|-------------|
| `R-CTR-XEVN-TPL-FE-EDIT-RESTORE` browser PASS | PRODUCT | Seal CONDITION **CLOSED** |
| AC-11 create/picker/preview seal (QC-02) | PRODUCT | **RETAIN** — not reopened |
| Preview no-reselect bind | PRODUCT | **ACCEPT** |
| QA pack `## 4. Residual` vs `## Residual` | **PROCESS OBS** | QC file consolidates 8/8 — not product demote |
| Honesty / printable UAT | GOVERNANCE | **DENIED** ready=true |
| Phase 1 DONE | GOVERNANCE | **NOT claimed** |

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qa-edit-01.md
→ FAIL 1/8 residual_section (PROCESS OBS)

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qc-edit-01.md
→ (this file — target 8/8)
```

---

## Conditions (GWC — updated residual board)

1. **~~`R-CTR-XEVN-TPL-FE-EDIT-RESTORE`~~** — **CLOSED** (QA-EDIT stamp `EDIT-IFUBE8` · `HD-FUZ5S` · `f5KeepsTpl=true` · PNG 06 bound picker · preview no-reselect `bodyHasTpl=true`).
2. **Honesty** — `contracts_printable_ready=false`; **NOT** Phase 1 DONE; **NOT** printable module UAT-ready; **C-SLICE-≠-MODULE**.
3. **must_keep** — Q-CTR-01/02 CLOSED · print-spine GWC · UF-HRM-02 · AC-11 create sealed — **not** reopened by this seat.

**No P0/P1 product CONDITION open on this AC-11 slice → GWC allowed with honesty bounds.**

---

## Residual

| ID | Sev | Owner | Status |
|----|-----|-------|--------|
| `R-CTR-XEVN-TPL-FE-EDIT-RESTORE` | P1 was | — | **CLOSED** (this seal) |
| AC-CTR-XEVN-11 create #9+ | — | — | **SEALED** (QC-02) retained |
| Printable module UAT | — | — | **DENIED** (`contracts_printable_ready=false`) |
| Phase 1 DONE | — | — | **NOT claimed** |
| QA pack residual heading | PROCESS OBS | qa (optional tidy) | Soft — does not reopen CONDITION |

---

## completion_report

QC L3 **GO WITH CONDITIONS** delta for AC-CTR-XEVN-11: CONDITION **`R-CTR-XEVN-TPL-FE-EDIT-RESTORE` CLOSED** on U65 browser evidence (stamp `EDIT-IFUBE8` · `HD-FUZ5S`). Audited QA-EDIT MD + FINAL JSON + PNG 06 + FE-EDIT parent + QC-02 OPEN baseline: create bind #9 → F5 → Sửa picker still `XEVN_CUSTOM_EDIT-IFUBE8` (`f5KeepsTpl=true` · `isEmptyPick=false`) · preview no-reselect `bodyHasTpl=true` · must_keep spine/UF-02/open-catalog/Q-CTR retained · process clean. Prior AC-11 create seal **not** demoted. QA pack residual heading = PROCESS OBS; this QC pack consolidates. No seed · **DENIED** `contracts_printable_ready=true` / invent printable UAT / Phase 1 DONE · **C-SLICE-≠-MODULE**.

## next_owner

**pm** — bus INTAKE this GWC delta + honesty lock; **do not** promote `contracts_printable_ready`. Optional: tidy QA MD `## Residual` heading. No further product P1 on this FE-EDIT residual. Next execution only if sponsor opens printable-module UAT or other CTR residual.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QC-EDIT-01-INTAKE
from_role: qc
to_role: pm
lane: governance
parent: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QC-EDIT-01 GO WITH CONDITIONS
residual_auto_fix: true

## Goal
PM INTAKE QC-EDIT GWC delta — CONDITION R-CTR-XEVN-TPL-FE-EDIT-RESTORE CLOSED; retain honesty.

## read_first
1. docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qc-edit-01.md
2. docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qc-02.md (prior OPEN baseline — now superseded on residual)
3. docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qa-edit-01.md

## entry
- QC verdict GO WITH CONDITIONS · CONDITION CLOSED · stamp EDIT-IFUBE8 · HD-FUZ5S
- f5KeepsTpl=true · contracts_printable_ready=false retained
- C-SLICE-≠-MODULE · NOT Phase 1 DONE · AC-11 create sealed not reopened

## exit
- Bus INTAKE + update residual board (FE-EDIT-RESTORE CLOSED)
- cấm: contracts_printable_ready=true · invent printable UAT · Phase 1 DONE
- Optional: dispatch qa tidy ## Residual heading (PROCESS OBS only)
- Scan pm:idle:check for next P0/P1 outside this closed residual

evidence_path: docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qc-edit-01.md
ack_status: PASS_TO_PM
```

## ack_status

**PASS_TO_PM**
