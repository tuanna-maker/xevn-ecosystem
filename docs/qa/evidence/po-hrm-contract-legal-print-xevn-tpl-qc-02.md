# Evidence — `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QC-02`

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | L3 governance — **AC-CTR-XEVN-11 open-catalog create #9+ slice** (`C-SLICE-≠-MODULE`) |
| **priority** | Certify AC-11 after BE-02 + QA-02 · retain P1 FE-EDIT CONDITION · deny printable UAT |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` |
| **Verdict** | **GO WITH CONDITIONS** — AC-CTR-XEVN-11 core **ACCEPT**; CONDITION `R-CTR-XEVN-TPL-FE-EDIT-RESTORE` **OPEN**; module printable UAT **DENIED** |
| **ack_status** | `PASS_TO_PM` |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-02` `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-contract-legal-print-xevn-tpl-qa-02.md`](po-hrm-contract-legal-print-xevn-tpl-qa-02.md) |
| **machine** | [`_tmp-po-hrm-contract-legal-print-xevn-tpl-qa-02.FINAL.json`](_tmp-po-hrm-contract-legal-print-xevn-tpl-qa-02.FINAL.json) · stamp **`XEVN9-IF9062`** |
| **be_ref** | [`po-hrm-contract-legal-print-xevn-tpl-be-02.md`](po-hrm-contract-legal-print-xevn-tpl-be-02.md) |
| **spec** | DYNAMIC LOCK · CORR-01 **AC-CTR-XEVN-11** |
| **screens** | `docs/qa/evidence/screens/po-hrm-contract-legal-print-xevn-tpl-qa-02/` (00–08 · **9/9**) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — AC-11 seat ≠ contracts printable module UAT |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **contracts_printable_ready** | **false** | **DENIED** invent `true` / printable UAT / clean module GO |
| **Module printable UAT** | **DENIED** | Slice certify only |
| **product_go / production GO** | **DENIED** | Out of scope |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Machine `denied[]` · `seed_used=false` · `api_only_pass=false` |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT U65 browser proof of **AC-CTR-XEVN-11** after BE-02 (fresh dist): Settings create template **#9** `XEVN_CUSTOM_XEVN9-IF9062` → POST **201** EXPAND (no `HRM-VAL-001`) → F5 row · HĐ picker #9 · create bind + preview body `template_code=#9` · CFG company-settings **not** 404 + F5. must_keep print-spine · UF-HRM-02 · Q-CTR CLOSED retained.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Create #9 EXPAND 201 + F5 | Machine `AC-CTR-XEVN-11-CREATE` PASS · POST `HRM-CTR-TPL-201` · PNG 03/04 | 🟢 **ACCEPT** |
| HĐ picker shows #9 | `AC-CTR-XEVN-11-PICKER` PASS · PNG 06 trigger `#9` | 🟢 **ACCEPT** |
| Preview bind `template_code=#9` | PREV **201** `HRM-CTR-PREV-200` · body has tpl · no `company_id` | 🟢 **ACCEPT** (via re-select before preview) |
| CFG org-suffix F5 | optional `CFG-ORG-SUFFIX-F5` PASS · closes QA-01 404 | 🟢 **ACCEPT** |
| Process hygiene | dndStorm=0 · uncaught=0 · mojibake=false | 🟢 **ACCEPT** |
| must_keep spine / UF-02 / Q-CTR | machine `must_keep` all PASS | 🟢 **ACCEPT** |
| Edit F5 restore picker | `f5KeepsTpl=false` · PNG 08 «— Chưa chọn —» | 🟡 **CONDITION** P1 |
| Honesty false | UI + machine | 🟢 **RETAIN** |

**Cấm:** `contracts_printable_ready=true` · invent printable UAT · Phase 1 DONE · reopen Q-CTR · seed.

**Scope note:** This seal certifies **AC-CTR-XEVN-11 open-catalog create #9+** only. **NOT** Phase 1 DONE. **NOT** contracts printable module UAT-ready. **C-SLICE-≠-MODULE**.

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| DYNAMIC LOCK + CORR-01 | open catalog · AC-CTR-XEVN-11 | BA LOCKED | **ACCEPT** SoT |
| BE-02 | nest build · POST #9 EXPAND 201 · CFG not 404 · jest 17/17 | READY_FOR_QA | **ACCEPT** |
| QA-01 FAIL | VAL-001 + CFG 404 | FAIL_TO_PM | **SUPERSEDED** by BE-02+QA-02 |
| QA-02 browser | stamp `XEVN9-IF9062` · `HD-F9V16` · overall PASS | PASS_TO_PM | **ACCEPT** U65 |

### Machine JSON spot (stamp `XEVN9-IF9062`)

| Signal | Value | QC |
|--------|-------|-----|
| `env.STAMP` / `TPL_CODE` | `XEVN9-IF9062` · `XEVN_CUSTOM_XEVN9-IF9062` | 🟢 |
| `ids.contractCode` | `HD-F9V16` · id `43f42772-…` | 🟢 |
| `l0` portal/hrm/xbos | 200 | 🟢 |
| `honesty.contracts_printable_ready` | **false** | 🟢 |
| `denied[]` | ready=true · seed · api_only · hardcode_8 · reopen_Q-CTR | 🟢 |
| Create POST | **201** `HRM-CTR-TPL-201` · EXPAND keys present | 🟢 |
| Preview | **201** `HRM-CTR-PREV-200` · `template_code=XEVN_CUSTOM_XEVN9-IF9062` | 🟢 |
| `f5KeepsTpl` | **false** · residual FE-EDIT-RESTORE | 🟡 CONDITION |
| Starter list | 8/8 present · listCount **23** (open catalog) | 🟢 |
| `overall` | **PASS** | 🟢 slice |

### Screenshot spot

| File | QC observation |
|------|----------------|
| `03-tpl-after-save.png` | Settings catalog **open** («Mẫu đã lưu (24)») · toast active · honesty path |
| `06-create-picker.png` | Create HĐ · picker **#9** `XEVN_CUSTOM_XEVN9-IF9062` · honesty **false** visible |
| `08-preview.png` | Edit `HD-F9V16` · picker **«— Chưa chọn —»** after F5 reopen — **confirms** P1 OBS |
| Screens dir | **9/9** PNG present |

---

## Gate AC audit (AC-CTR-XEVN-11)

| # | AC / Check | Spec / dispatch | QA-02 | QC |
|---|------------|-----------------|-------|-----|
| 1 | Settings tạo mẫu #9 → 2xx → list + F5 | CORR-01 AC-CTR-XEVN-11 | 🟢 | 🟢 **ACCEPT** |
| 2 | Dùng trên tạo HĐ (picker #9) | same | 🟢 | 🟢 **ACCEPT** |
| 3 | Preview bind đúng `template_code` | same | 🟢 | 🟢 **ACCEPT** (re-select path) |
| 4 | Edit UI F5 keeps template_code | AC wording «F5 còn» on edit | 🟡 OBS | 🟡 **CONDITION** P1 — not demote core create/picker/preview |
| 5 | CFG company-settings (QA-01 residual) | BE-02 | 🟢 | 🟢 **ACCEPT** closed |
| 6 | must_keep spine · UF-02 · Q-CTR | CORR must_keep | 🟢 | 🟢 **ACCEPT** |
| 7 | Honesty false | mandatory | 🟢 | 🟢 **RETAIN** |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this seal | QC |
|---------|-------------------|-----|
| **J-HRM-CTR-07** | Settings tạo mẫu 9+ → picker → preview (AC-CTR-XEVN-11) | 🟢 **PASS** browser this seat (stamp `XEVN9-IF9062`) — map row may still say DRAFT paper; PM may promote status · **≠** printable UAT |
| Print-spine / J-HRM-03 host | must_keep re-smoke | 🟢 retained · not reopened |
| Module contracts printable UAT | Out of scope | **DENIED** |

---

## Commands (gate / spot)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qa-02.md` | **FAIL** 2/8 (`journey_l25` · `residual_section` heading) | **PROCESS OBS** — not product demote; QC consolidates this file |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qc-02.md` | **PASS** exit **0** (target 8/8) | PRODUCT gate OK |
| QA cited `qc:dev-stack` + `qc:fe-be-health` | ALL PASS at capture | ENV OK at capture |
| QA harness stamp `XEVN9-IF9062` | overall **PASS** · `PASS_TO_PM` | PRODUCT OK |

---

## Classification

| Item | Class | Disposition |
|------|-------|-------------|
| AC-CTR-XEVN-11 create #9 EXPAND + F5 | PRODUCT | **ACCEPT** / sealed this slice |
| Picker #9 + preview bind | PRODUCT | **ACCEPT** |
| CFG company-settings 404 (QA-01) | PRODUCT | **CLOSED** (BE-02 + QA-02) |
| `R-CTR-XEVN-TPL-FE-EDIT-RESTORE` | PRODUCT P1 | **CONDITION OPEN** → **dev-fe** |
| QA pack missing J-* / `## Residual` | **PROCESS OBS** | QC file consolidates 8/8 |
| Honesty / printable UAT | GOVERNANCE | **DENIED** ready=true |
| Phase 1 DONE | GOVERNANCE | **NOT claimed** |

---

## Conditions (GWC — bounded)

1. **`R-CTR-XEVN-TPL-FE-EDIT-RESTORE` (P1)** — **OPEN**: `Contracts.tsx` `handleOpenEdit` clears `printTemplateId`/`printTemplateCode` → after F5 reopen edit, picker shows «— Chưa chọn —» even when create bound #9. Preview bind proven via explicit re-select. Does **not** demote create/picker/preview core AC.
2. **Honesty** — `contracts_printable_ready=false`; **NOT** Phase 1 DONE; **NOT** printable module UAT-ready; **C-SLICE-≠-MODULE**.
3. **must_keep** — Q-CTR-01/02 CLOSED · print-spine GWC · UF-HRM-02 — **not** reopened by this seat.

---

## Residual

| ID | Sev | Owner | Status |
|----|-----|-------|--------|
| `R-CTR-XEVN-TPL-FE-EDIT-RESTORE` | **P1** | **dev-fe** | **OPEN** CONDITION — restore `printTemplate*` on `handleOpenEdit` from contract detail |
| `R-CTR-XEVN-TPL-BE-BUILD` / `BE-RUNTIME` / `QA-RETEST` | — | — | **CLOSED** (BE-02 + QA-02) |
| Printable module UAT | — | — | **DENIED** (`contracts_printable_ready=false`) |
| Phase 1 DONE | — | — | **NOT claimed** |

---

## completion_report

QC L3 **GO WITH CONDITIONS** for **AC-CTR-XEVN-11** open-catalog create #9+ slice. Audited QA-02 MD + FINAL JSON stamp `XEVN9-IF9062` + PNG 03/06/08 + BE-02 READY. Proven: Settings POST **201** EXPAND `XEVN_CUSTOM_XEVN9-IF9062` + F5 · HĐ picker #9 · create bind + PREV **201** body `template_code=#9` · CFG F5 · process clean · must_keep spine/UF-02/Q-CTR. **CONDITION OPEN:** `R-CTR-XEVN-TPL-FE-EDIT-RESTORE` P1 (edit F5 picker blank — PNG 08). QA pack 2/8 = PROCESS OBS; this QC pack consolidates. No seed · **DENIED** `contracts_printable_ready=true` / invent printable UAT / Phase 1 DONE · **C-SLICE-≠-MODULE**.

## next_owner

**dev-fe** — close CONDITION `R-CTR-XEVN-TPL-FE-EDIT-RESTORE` (then QA retest → QC delta). PM bus INTAKE this GWC + honesty lock; **do not** promote printable ready.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-FE-EDIT-01
from_role: pm
to_role: dev-fe
lane: execution
parent: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QC-02 GO WITH CONDITIONS
residual_auto_fix: true
change_mode: FIX
preserve_default: true

## Goal
Close CONDITION R-CTR-XEVN-TPL-FE-EDIT-RESTORE — restore printTemplateId/printTemplateCode on edit open after F5.

## read_first
1. docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qc-02.md
2. docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qa-02.md §4 Residual
3. apps/.../Contracts.tsx handleOpenEdit (clear printTemplate*)
4. CORR-01 AC-CTR-XEVN-11 · DYNAMIC LOCK

## entry
- QC GWC AC-11 core ACCEPT (stamp XEVN9-IF9062 · HD-F9V16)
- OBS: after create bind #9 → F5 → reopen edit → picker «— Chưa chọn —» (f5KeepsTpl=false)
- must_keep: print-spine · UF-HRM-02 · Q-CTR CLOSED · open catalog
- honesty: contracts_printable_ready=false — DENIED invent printable UAT
- U65 zero-seed · no reopen closed enum

## exit
- handleOpenEdit (or equivalent) restores template from contract detail / API
- READY_FOR_QA with evidence + CODE-MEMORY-CHANGE
- cấm: claim printable ready · seed · break picker create path

evidence_path: docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-fe-edit-01.md
ack_status: READY_FOR_QA
```

## ack_status

**PASS_TO_PM**
