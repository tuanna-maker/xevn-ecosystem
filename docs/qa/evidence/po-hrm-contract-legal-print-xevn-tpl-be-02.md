# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-02` |
| **lane** | execution · dev-be |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-01` FAIL_TO_PM |
| **Date** | 2026-08-07 |
| **change_mode** | FIX (narrow — build + ship dist EXPAND/CFG) |
| **Honesty** | `contracts_printable_ready=false` |
| **U65** | no seed in evidence |
| **ack_status** | **READY_FOR_QA** |

## spec_read_ack

| Artifact | Cite |
|----------|------|
| DYNAMIC LOCK | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md` — open catalog 9+ |
| CORR-01 | `…-CORR-01.md` **AC-CTR-XEVN-11** — Settings create #9 → 2xx → F5 → picker |
| QA FAIL | `docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qa-01.md` — R-CTR-XEVN-TPL-BE-BUILD + BE-RUNTIME |
| Prior BE-01 | EXPAND DTO + `company-settings` already in **source**; live dist stale |

## Root cause (confirmed)

| Layer | Finding |
|-------|---------|
| Build | `contract-legal-print.service.ts` TS2367: `matrixFamily === ''` vs union `"XEVN_MATRIX" \| "LEGACY" \| null` blocked `nest build` |
| merge-tokens TS2554 | **Not present** on current tree (QA residual already cleared / superseded) |
| Runtime | Prior `:28001` served **pre-BE-01** dist → `HRM-VAL-001` whitelist reject EXPAND fields + Nest **404** on `company-settings` |

## Fix

1. **TS2367:** `normalizeMatrixFamilyInput` — empty/whitespace → `null`; used on create + update (no dead `=== ''` on typed union).
2. **Rebuild:** `pnpm --filter hrm-api run build` → **exit 0** (+ `verify-dist.mjs` postbuild).
3. **Restart:** killed PID on `:28001`; `pnpm --filter hrm-api run start:prod` — routes mapped:
   - `GET/PUT /api/hrm/contracts-insurance/company-settings`
4. **CODE-MEMORY-CHANGE** (VI) on:
   - `contract-legal-print.service.ts`
   - `dto/contract-legal-print.dto.ts`
   - `contracts-insurance.controller.ts`

## Smoke (API only — not browser UAT claim)

Persona: `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · login XBOS `:28002`.

| Check | Result |
|-------|--------|
| `GET /api/hrm` | **200** |
| `GET …/company-settings?company_id=main&key=contract_number_org_suffix` | **200** `HRM-CTR-CFG-200` (not 404) |
| `PUT …/company-settings` `{suffix:"XE"}` | **200** `HRM-CTR-CFG-200` · persisted `company_id=holding` |
| `POST …/contract-templates` #9 `XEVN_CUSTOM_BE02_*` + EXPAND fields (`default_term_type`, `default_duration_months`, `title_print_vi`, `matrix_family`) | **201** `HRM-CTR-TPL-201` — **no** `HRM-VAL-001` |
| FE-shape `matrix_family:""` | **201** — normalized to `null` |
| List `company_id=main` | Custom codes **present** among rows (open catalog >8) |
| Closed enum reject | **Not observed** |

### Sample create body (accepted)

```json
{
  "company_id": "main",
  "code": "XEVN_CUSTOM_BE02_104954",
  "name_vi": "Mau custom BE-02 …",
  "pack_code": "GENERAL",
  "status": "active",
  "default_term_type": "definite",
  "default_duration_days": null,
  "default_duration_months": 12,
  "title_print_vi": "HOP DONG LAO DONG CUSTOM",
  "matrix_family": null
}
```

## Unit

`pnpm exec jest --testPathPatterns=contract-legal-print.service.spec` → **17/17 PASS**

## must_keep

| Item | Status |
|------|--------|
| print-spine / Q-CTR CLOSED | untouched |
| UF-HRM-02 | untouched |
| open catalog (no harden 8-enum) | keep |
| `contracts_printable_ready=false` | **retained** |
| U65 no seed | **yes** |

## Residual / honesty

```text
contracts_printable_ready = false
```

- Browser AC-CTR-XEVN-11 (create→F5→picker→preview) = **QA-02** — this seat = API smoke only.
- Do **not** invent printable ready.

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Build unblocked (TS2367); fresh dist live on `:28001`; POST #9 EXPAND **201**; company-settings GET/PUT **200** (not 404); jest 17/17; honesty false |
| **next_owner** | **qa** |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-be-02.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-02
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-02 READY_FOR_QA
residual_auto_fix: true

## Goal
Retest AC-CTR-XEVN-11 U65 browser after BE-02 shipped fresh dist.

## entry
- L0 qc:dev-stack + qc:fe-be-health
- BE-02 evidence: nest build PASS; POST #9 EXPAND 201; company-settings not 404
- Spec: DYNAMIC LOCK · CORR-01 AC-CTR-XEVN-11
- U65 zero-seed · browser-only (probe ≠ 🟢)

## AC
1. Settings → Tạo mẫu #9 → POST 2xx → list row → F5 còn
2. HĐ create picker shows #9 → preview bind template_code → F5
3. Optional CFG org-suffix GET/PUT not 404 + F5 if exercised
4. must_keep: print-spine · UF-HRM-02 · Q-CTR CLOSED
5. Honesty: contracts_printable_ready=false

## exit
PASS_TO_PM or FAIL_TO_PM with evidence docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qa-02.md
cấm: seed · API-only PASS · claim printable UAT
```
