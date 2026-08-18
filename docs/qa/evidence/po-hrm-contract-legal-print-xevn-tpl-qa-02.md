# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-02` |
| **role** | qa |
| **lane** | execution · U65 zero-seed · browser-only |
| **date** | 2026-08-07 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-02` READY_FOR_QA |
| **prior** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-01` FAIL (HRM-VAL-001 + CFG 404) |
| **spec** | CORR-01 **AC-CTR-XEVN-11** · DYNAMIC LOCK |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-contract-legal-print-xevn-tpl-qa-02.FINAL.json` |
| **harness** | `scripts/qa/_tmp-po-hrm-contract-legal-print-xevn-tpl-qa-02.mjs` |
| **screens** | `docs/qa/evidence/screens/po-hrm-contract-legal-print-xevn-tpl-qa-02/` (00–08) |
| **stamp** | `XEVN9-IF9062` · tpl `XEVN_CUSTOM_XEVN9-IF9062` · HĐ `HD-F9V16` |
| **honesty** | `contracts_printable_ready=false` · **DENIED** printable UAT / seed / API-only PASS |
| **ack_status** | **PASS_TO_PM** |

---

## 0. L0 / health

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM / XBOS / portal **200** |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| Seed | **none** (U65) |
| BE-02 live | EXPAND create accepted; `company-settings` **not** 404 |

---

## 1. Verdict matrix

| ID | Verdict | Evidence |
|----|---------|----------|
| **AC-CTR-XEVN-11-CREATE** | 🟢 **PASS** | Settings → Tạo mẫu #9 `XEVN_CUSTOM_XEVN9-IF9062` → POST **201** `HRM-CTR-TPL-201` · EXPAND keys accepted (no `HRM-VAL-001`) · row before + **F5** còn · activate OK |
| **AC-CTR-XEVN-11-PICKER** | 🟢 **PASS** | Create HĐ spine → option #9 visible · trigger shows `XEVN_CUSTOM_XEVN9-IF9062` |
| **AC-CTR-XEVN-11-PREVIEW-BIND** | 🟢 **PASS** | Create POST `template_code=XEVN_CUSTOM_XEVN9-IF9062` · edit re-select #9 · preview POST **201** `HRM-CTR-PREV-200` body `template_code` = #9 · no `company_id` in body |
| **AC-CTR-XEVN-11** (rollup) | 🟢 **PASS** | Core create/picker/preview bind met |
| **PROCESS-HYGIENE** | 🟢 **PASS** | dndStorm=0 · Uncaught=0 · mojibake=false |
| **UF-HRM-02** (must_keep) | 🟢 **PASS** | Create HĐ POST 2xx · F5 list `HD-F9V16` |
| **print-spine** (must_keep) | 🟢 **PASS** | `ctr-print-spine` visible |
| **Q-CTR** (must_keep) | 🟢 **PASS** | Not reopened |
| **CFG-ORG-SUFFIX-F5** (optional) | 🟢 **PASS** | PUT/GET `company-settings` **200** · F5 suffix retained (closes QA-01 CFG 404) |
| **STARTER-8-LIST** (optional) | 🟢 **PASS** | 8/8 starters present · list `Mẫu đã lưu (23)` open catalog (not ceiling-8) |
| **Honesty** | 🟢 | `contracts_printable_ready=false` retained |

---

## 2. AC-CTR-XEVN-11 evidence blocks (browser U65)

### Create #9 → 2xx → F5
- Persona / URL: `ceo@xe.vn` → `/hr/settings?tab=contract-legal` → tab templates
- Action: fill code/name/title · pack **GENERAL** · status Hiệu lực · matrix **—** (null) → `ctr-tpl-save`
- Network: POST `/api/hrm/contracts-insurance/contract-templates` → **201** `HRM-CTR-TPL-201` `dataCode=XEVN_CUSTOM_XEVN9-IF9062`
- Body EXPAND keys present: `default_term_type`, `default_duration_*`, `title_print_vi`, `matrix_family` (null) — **no** whitelist reject
- FE sau 2xx: row `ctr-tpl-row-XEVN_CUSTOM_XEVN9-IF9062` · F5 còn
- Note: `GENERAL` + `matrix_family=XEVN_MATRIX` → `HRM-CTR-TPL-PACK-MISMATCH` (by design); open-catalog path uses null matrix
- Verdict: 🟢
- spec_ref: CORR-01 AC-CTR-XEVN-11 · DYNAMIC LOCK · BE-02

### HĐ picker #9 + preview bind
- Path: `/hr/contracts` → Thêm → spine pack GENERAL → select `ctr-print-tpl-option-XEVN_CUSTOM_XEVN9-IF9062`
- Create POST: `template_code=XEVN_CUSTOM_XEVN9-IF9062` · F5 list `HD-F9V16`
- Edit → re-select #9 → Preview: POST `…/preview?company_id=main` **201** · body `template_code=XEVN_CUSTOM_XEVN9-IF9062`
- Verdict: 🟢

### Process
- No dnd storm · no Uncaught · no mojibake on Settings/Contracts path

---

## 3. QA-01 residuals closed

| Prior residual | Status |
|----------------|--------|
| **R-CTR-XEVN-TPL-BE-BUILD** | **CLOSED** — live accepts EXPAND; nest dist from BE-02 |
| **R-CTR-XEVN-TPL-BE-RUNTIME** | **CLOSED** — no VAL-001 · CFG not 404 |
| **R-CTR-XEVN-TPL-QA-RETEST** | **CLOSED** this seat |

---

## 4. Residual (OBS — non-blocking for AC-11 core)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-CTR-XEVN-TPL-FE-EDIT-RESTORE** | **P1** | **dev-fe** | `Contracts.tsx` `handleOpenEdit` clears `printTemplateId`/`printTemplateCode` → after F5 reopen edit, picker shows «— Chưa chọn —» even when create bound #9. Preview bind asserted via explicit re-select before preview. AC «F5 còn template_code» on **edit UI** still OBS. |

**Out of scope / sealed:** Q-CTR CLOSED · print-spine · UF-HRM-02 · `contracts_printable_ready=false`

---

## 5. Honesty

```text
contracts_printable_ready = false
```

No printable UAT · no seed · no API-only UF 🟢 · no claim Phase1 DONE.

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | U65 browser AC-CTR-XEVN-11 **PASS** after BE-02 — create #9 EXPAND 201+F5 · picker · createBound+preview body #9; CFG F5 PASS; process/UF/spine OK; P1 OBS edit F5 restore; honesty false |
| **next_owner** | **qc** (slice certify) · optional **dev-fe** for OBS edit restore |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qa-02.md` |
| **pm_dispatch_hint** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QC-02` — QC certify AC-11 slice; residual FE-EDIT-RESTORE P1 |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QC-02
from_role: pm
to_role: qc
lane: execution
parent: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-02 PASS_TO_PM
residual_auto_fix: true

## Goal
QC certify AC-CTR-XEVN-11 U65 slice after QA-02 PASS (BE-02 residuals closed).

## entry
- evidence: docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qa-02.md
- machine: docs/qa/evidence/_tmp-po-hrm-contract-legal-print-xevn-tpl-qa-02.FINAL.json
- L0 was PASS; stamp XEVN_CUSTOM_XEVN9-IF9062 · HD-F9V16
- OBS P1: R-CTR-XEVN-TPL-FE-EDIT-RESTORE (handleOpenEdit clears template) — GWC condition OK, not block GO slice if core AC certified

## AC audit
1. Settings create #9 POST 201 EXPAND + F5
2. HĐ picker #9 + createBound + preview body template_code=#9
3. CFG company-settings not 404 + F5
4. must_keep print-spine · UF-HRM-02 · Q-CTR CLOSED
5. Honesty: contracts_printable_ready=false — DENIED invent printable UAT

## exit
GO / GWC with conditions · evidence docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qc-02.md
cấm: seed · claim printable ready · reopen Q-CTR
```
