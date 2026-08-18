# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-BE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-BE-02` |
| **role** | `dev-be` |
| **date** | 2026-08-07 |
| **ack_status** | `READY_FOR_QA` |
| **change_mode** | ADD · preserve_default · code_memory_required |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-QC-01` GWC · CONDITION **Q-CTR-02** |
| **honesty** | `contracts_printable_ready=false` · U65 zero-seed · **no claim printable ready** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md` §D **AC-CTR-PRINT-05** · FR-UC-BP-CORE-09c |
| **tech_spec** | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md` §9.3 F-CORE-CTR-PDF-01 |
| **db_design** | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md` §5.12 · VAL-CTR-09 |
| **api_design** | DATA-01 F-CORE-CTR-PDF-01 · errors `HRM-CTR-VERSION-NOT-ISSUED` · `HRM-CTR-RENDER-FAIL` |
| **qc_condition** | `docs/qa/evidence/po-hrm-contract-legal-print-qc-01.md` CONDITION Q-CTR-02 PDF binary engine |
| **prior** | `po-hrm-contract-legal-print-be-01.md` HTML stub |

---

## Implemented

### F-CORE-CTR-PDF-01 binary

| Item | Detail |
|------|--------|
| Engine | **pdfkit** (`apps/api/hrm-api` dependency) — Nest-friendly, no puppeteer |
| Default GET | `…/print-versions/:versionId/pdf?company_id=` → **`application/pdf`** · body Buffer · magic **`%PDF`** |
| Debug | `?format=html` → `text/html` from **same** frozen snapshot |
| Font | Bundled `NotoSans-Regular.ttf` (SIL OFL / Google Noto) under `src/contracts-insurance/assets/fonts/` · nest-cli assets copy `**/*.ttf` |
| Headers | `X-HRM-PDF-Stub: false` · `X-HRM-PDF-Engine: pdfkit` (html → `html-debug`) |
| Source data | `merged_fields_json` + `clauses_snapshot_json` only (no live library merge) |
| Gates | issued-only · soft-delete `archived_at IS NULL` · scope_parity via `getPrintVersionById` · `company_id` query |
| Errors | draft → `HRM-CTR-VERSION-NOT-ISSUED` · engine fail → `HRM-CTR-RENDER-FAIL` |

### Files

- `contract-print-pdf.renderer.ts` (ADD)
- `contract-legal-print.service.ts` — replace HTML stub · CODE-MEMORY APPEND
- `contracts-insurance.controller.ts` — format query · headers · CODE-MEMORY APPEND
- `nest-cli.json` — assets `**/*.ttf`
- `package.json` / lock — `pdfkit` + `@types/pdfkit`

### must_keep / forbidden

- Print-spine GWC path retained (preview → version → PDF)
- UF-HRM-02 registry · salary off body · soft-delete
- **No** seed UAT · **no** `apps/web/**` · **no** wipe FE
- **`contracts_printable_ready=false`** until QA browser proves binary PDF

---

## Tests

```bash
pnpm --filter hrm-api exec jest --testPathPatterns="contract-legal-print|contracts-insurance.controller" --no-cache
```

**Result:** **22/22 PASS** (was 18; + renderer magic · service PDF binary · html format · VERSION-NOT-ISSUED)

| Case | Assert |
|------|--------|
| Renderer unit | Buffer starts `%PDF` |
| Service default | `content_type=application/pdf` · `stub=false` · magic `%PDF` · length >100 |
| `format=html` | `text/html` · snapshot fields present |
| Draft status | `HRM-CTR-VERSION-NOT-ISSUED` |
| Controller mock | updated to pdf binary shape |

---

## Residual

| ID | Note | Owner |
|----|------|-------|
| Q-CTR-02 binary | **Implemented API-side** — needs QA retest Content-Type + magic + FE toast | **qa** |
| Q-CTR-01 | Group template publish (unchanged) | sa/pm |
| Honesty | `contracts_printable_ready=false` until QA+QC close CONDITION | QA/QC |
| Prod font | nest build must copy `.ttf` (nest-cli assets); verify on Linux deploy | devops (OBS) |

---

## Completion contract

| Field | Value |
|-------|--------|
| completion_report | Closed Q-CTR-02 API: PDFKit binary on GET print-versions PDF; HTML `?format=html` debug; NotoSans Unicode; scope/soft-delete/issued gates; jest content-type + %PDF; CODE-MEMORY APPEND; honesty false; U65 no seed. Residual: QA browser retest to close QC CONDITION. |
| next_owner | **qa** |
| next_dispatch_prompt | See below |
| ack_status | **READY_FOR_QA** |
| evidence_path | `docs/qa/evidence/po-hrm-contract-legal-print-be-02.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-QA-02
from_role: pm
to_role: qa
lane: execution
entry_criteria: BE-02 READY_FOR_QA po-hrm-contract-legal-print-be-02.md; L0 stack; U65 zero-seed; parent QC-01 GWC CONDITION Q-CTR-02
task: Retest GET …/print-versions/:id/pdf?company_id=main — Network Content-Type application/pdf; response body magic %PDF; FE toast Đã tải PDF still works; optional ?format=html debug; must_keep print-spine GWC + UF-HRM-02; honesty contracts_printable_ready=false — do NOT claim printable module UAT
exit_criteria: PASS_TO_PM or FAIL; evidence docs/qa/evidence/po-hrm-contract-legal-print-qa-02.md; next QC close CONDITION Q-CTR-02 if PASS
forbidden: seed · invent contracts_printable_ready=true · wipe FE
```
