# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-QA-02` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | execution · U65 zero-seed · browser-only |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-BE-02` READY_FOR_QA |
| **qc_condition** | **Q-CTR-02** PDF binary engine (from `po-hrm-contract-legal-print-qc-01.md` GWC) |
| **Verdict** | **PASS** — Q-CTR-02 binary path proven (API + FE toast/download) |
| **ack_status** | **PASS_TO_PM** |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal** | `http://127.0.0.1:5173` · HRM `:28001` (dist `node dist/main`) · XBOS `:28002` |
| **machine** | [`_tmp-po-hrm-contract-legal-print-qa-02.FINAL.json`](_tmp-po-hrm-contract-legal-print-qa-02.FINAL.json) · stamp **`CTR2-IAXGKL`** |
| **screens** | `docs/qa/evidence/screens/po-hrm-contract-legal-print-qa-02/` (00–03) |
| **harness** | `scripts/qa/_tmp-po-hrm-contract-legal-print-qa-02.mjs` |
| **U65** | zero-seed · no `pnpm seed:*` · no DB fake |
| **honesty** | **`contracts_printable_ready=false`** — **DENIED** printable module UAT |

---

## Honesty locks (mandatory)

| Flag | Value |
|------|-------|
| **contracts_printable_ready** | **false** — **DENIED** invent module printable UAT / GO |
| **Seed** | **DENIED** |
| **api_only_pass** | **DENIED** — FE toast + download required and observed |
| **Phase 1 DONE / product GO** | **NOT claimed** |

---

## Entry / env

| Check | Result |
|-------|--------|
| BE-02 evidence | `po-hrm-contract-legal-print-be-02.md` READY_FOR_QA (pdfkit · `%PDF`) |
| Parent QC CONDITION | **Q-CTR-02** binary engine OPEN → this wave |
| Restart hrm-api | Live on `:28001` via **`node dist/main`** (PDFKit emit present). Nest `--watch` had TS2345 OBS at start; concurrent `BE-WATCH-TS-01` later fixed compile — this retest used **dist** with engine headers. |
| L0 `qc:dev-stack` | hrm/xbos/portal **200** |
| `qc:fe-be-health` | **ALL PASS** |
| Print version | **Reused R3** `HD-QVQ6L` / `312255a9-b87e-46d9-97e1-c1b835db7043` · status **issued** · count=1 |

---

## AC results

| # | Check | Evidence | Verdict |
|---|-------|----------|---------|
| 1 | GET `…/print-versions/:id/pdf?company_id=main` → **Content-Type: application/pdf** · magic **`%PDF`** | API: status **200** · `application/pdf` · magic `%PDF` · len **13922** · `X-HRM-PDF-Stub: false` · `X-HRM-PDF-Engine: pdfkit` | 🟢 **PASS** |
| 2 | FE toast «Đã tải PDF» + download | Browser click `ctr-print-pdf-{vid}` → toast visible · download `hdld-312255a9-….pdf` · PNG `03-pdf-toast` | 🟢 **PASS** |
| 3 | `?format=html` debug | status **200** · `text/html; charset=utf-8` · engine `html-debug` · title HĐLĐ HD-QVQ6L | 🟢 **PASS** |
| 4 | must_keep print-spine + UF-HRM-02 spot | Settings CL/TPL chrome · list→edit HD-QVQ6L · versions UI=1 · honesty stamp on spine | 🟢 **PASS** |
| 5 | Process gate | dndStorm=0 · uncaught=0 · pageErr=0 · console=0 | 🟢 **PASS** |
| 6 | Honesty | settings + spine `contracts_printable_ready=false` | 🟢 **PASS** |

### Click path (FE)

1. Login inject `ceo@xe.vn` · portal `/hr/settings?tab=contract-legal` → Điều khoản HĐ (CL/TPL chrome)
2. `/hr/contracts` → search **HD-QVQ6L** → pencil/edit
3. Print spine: **Phiên bản đã lưu: v1 - GENERAL · issued** → click **PDF**
4. Observe toast **Đã tải PDF** + browser download event

### Network / API (Q-CTR-02)

```text
GET /api/hrm/contracts-insurance/print-versions/312255a9-b87e-46d9-97e1-c1b835db7043/pdf?company_id=main
→ 200 · Content-Type: application/pdf · X-HRM-PDF-Stub: false · X-HRM-PDF-Engine: pdfkit · body magic %PDF · 13922 bytes

GET …/pdf?company_id=main&format=html
→ 200 · text/html; charset=utf-8 · X-HRM-PDF-Engine: html-debug
```

**Note:** Playwright response listener did not always retain PDF body when download consumed stream (`feNet=false` in machine) — **API probe + toast PNG + download filename** are authoritative for this AC.

---

## L2.5 / must_keep

| Item | Verdict |
|------|---------|
| Host **J-HRM-03** path (list→edit dialog + spine) | 🟢 re-smoke on HD-QVQ6L |
| UF-HRM-02 create mutate | ⚪ spot only (reuse R3 row — no new create this wave) |
| Print-spine GWC path | 🟢 retained (version issued + PDF) |
| DnD storm | 🟢 0 |

---

## Commands

| Command | Result |
|---------|--------|
| `pnpm run qc:dev-stack` | hrm/xbos/portal **200** (node UV assert noise on exit — health OK) |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| `node scripts/qa/_tmp-po-hrm-contract-legal-print-qa-02.mjs` | exit **0** · `PASS_TO_PM` |

---

## Closed / residual

| ID | Status | Note |
|----|--------|------|
| **Q-CTR-02** PDF **binary** engine | **CLOSED (QA)** — needs QC narrow re-gate | application/pdf + `%PDF` + FE toast |
| Q-CTR-02 HTML stub path | CLOSED prior (QC-01) | still available via `?format=html` |
| Q-CTR-01 group template publish | OPEN | unchanged · not this wave |
| `contracts_printable_ready` | **false** | **DENIED** promote printable UAT |
| nest `--watch` TS2345 | OBS concurrent | `BE-WATCH-TS-01` READY; this wave ran **dist** |

**No P0 open on Q-CTR-02 binary.**

---

## Screenshots

| File | Observation |
|------|-------------|
| `00-settings-chrome.png` | Điều khoản HĐ / template chrome · honesty false |
| `01-contracts-list.png` | `/hr/contracts` list |
| `02-edit-spine.png` | Edit HD-QVQ6L · print spine |
| `03-pdf-toast.png` | v1 issued · PDF btn · toast **Đã tải PDF** · honesty false |

---

## completion_report

QA **PASS_TO_PM** for **Q-CTR-02 PDF binary** after BE-02. L0 + fe-be-health PASS. Reused R3 issued print-version `312255a9-…` on `HD-QVQ6L`. API GET pdf → **200** `application/pdf` · magic **`%PDF`** · stub=false · engine=pdfkit; `?format=html` **200** debug. FE click PDF → toast **Đã tải PDF** + download `hdld-….pdf` (PNG 03). must_keep Settings CL/TPL + list→edit spine + process dnd/uncaught clean. **`contracts_printable_ready=false`** retained — **DENIED** printable module UAT. Residual for QC: narrow re-gate close CONDITION Q-CTR-02 only.

## next_owner

**qc** — narrow re-gate CONDITION **Q-CTR-02** (do not invent printable UAT).

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-QC-02
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-CONTRACT-LEGAL-PRINT-QA-02 PASS_TO_PM
entry_criteria: docs/qa/evidence/po-hrm-contract-legal-print-qa-02.md · machine _tmp-po-hrm-contract-legal-print-qa-02.FINAL.json stamp CTR2-IAXGKL · screens 00-03 · parent QC-01 GWC CONDITION Q-CTR-02
task: Narrow re-gate ONLY to close CONDITION Q-CTR-02 (PDF binary). Audit: Content-Type application/pdf + magic %PDF + X-HRM-PDF-Engine pdfkit + FE toast Đã tải PDF on HD-QVQ6L / version 312255a9…. Retain contracts_printable_ready=false. Do NOT promote printable module UAT / invent GO. Q-CTR-01 remains OPEN if unchanged.
exit_criteria: PASS_TO_PM with Q-CTR-02 CLOSED or FAIL with residual; evidence docs/qa/evidence/po-hrm-contract-legal-print-qc-02.md
forbidden: seed · apps/** edit · claim contracts_printable_ready=true
```

## ack_status

**PASS_TO_PM**
