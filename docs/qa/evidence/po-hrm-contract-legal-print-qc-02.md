# Evidence — `PO-HRM-CONTRACT-LEGAL-PRINT-QC-02`

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | L3 narrow re-gate — **CONDITION Q-CTR-02 PDF binary only** (`C-SLICE-≠-MODULE`) |
| **priority** | Close Q-CTR-02 · retain honesty · deny printable module UAT |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` |
| **Verdict** | **GO WITH CONDITIONS** — Q-CTR-02 **CLOSED**; print-spine + PDF binary seal; module UAT **DENIED** |
| **ack_status** | `PASS_TO_PM` |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-QA-02` `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-contract-legal-print-qa-02.md`](po-hrm-contract-legal-print-qa-02.md) |
| **machine** | [`_tmp-po-hrm-contract-legal-print-qa-02.FINAL.json`](_tmp-po-hrm-contract-legal-print-qa-02.FINAL.json) · stamp **`CTR2-IAXGKL`** |
| **be_ref** | [`po-hrm-contract-legal-print-be-02.md`](po-hrm-contract-legal-print-be-02.md) |
| **parent_gwc** | [`po-hrm-contract-legal-print-qc-01.md`](po-hrm-contract-legal-print-qc-01.md) CONDITION Q-CTR-02 |
| **screens** | `docs/qa/evidence/screens/po-hrm-contract-legal-print-qa-02/` (00–03 + `downloaded.pdf`) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — closing PDF binary ≠ contracts printable module UAT |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **contracts_printable_ready** | **false** | **DENIED** — cấm claim printable module GO / UAT |
| **Module printable UAT** | **DENIED** | Invent GO full contracts **FORBIDDEN** |
| **product_go / production GO** | **DENIED** | Out of scope |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Machine `denied[]` includes `seed` · `api_only_pass` · `invent_printable_uat` |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT close of parent CONDITION **Q-CTR-02** (PDF binary engine): GET `application/pdf` + magic `%PDF` + `X-HRM-PDF-Engine: pdfkit` + FE toast **Đã tải PDF** on issued version `HD-QVQ6L` / `312255a9-…` under U65.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Content-Type `application/pdf` | Machine `apiPdf.contentType` · FE net `isApplicationPdf=true` · status **200** | 🟢 **ACCEPT** |
| Body magic `%PDF` | Machine `apiPdf.magic=%PDF` · len **13922** · on-disk `downloaded.pdf` magic `%PDF` | 🟢 **ACCEPT** |
| Engine header pdfkit | `X-HRM-PDF-Stub: false` · `X-HRM-PDF-Engine: pdfkit` | 🟢 **ACCEPT** |
| FE toast + download | PNG `03-pdf-toast` toast **Đã tải PDF** · `downloadFilename=hdld-312255a9-….pdf` · `toastOk/downloadOk=true` | 🟢 **ACCEPT** |
| HTML debug retained | `?format=html` → **200** `text/html` · engine `html-debug` | 🟢 **ACCEPT** (prior stub path kept) |
| Honesty false | Settings + spine PNGs + machine | 🟢 **RETAIN** |
| must_keep print-spine / J-HRM-03 host | list→edit HD-QVQ6L · versions=1 issued · Settings CL/TPL | 🟢 **ACCEPT** re-smoke |
| Process gate | dndStorm=0 · uncaught=0 · pageErr=0 · console=0 | 🟢 **ACCEPT** |

**Cấm:** `contracts_printable_ready=true` · printable module UAT · invent GO full contracts · Phase 1 DONE · seed.

**Scope note:** This seal **only** closes Q-CTR-02 binary. Parent QC-01 print-spine GWC remains binding. **NOT** Phase 1 DONE. **NOT** contracts printable module UAT-ready.

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC-01 GWC | `po-hrm-contract-legal-print-qc-01.md` | PASS_TO_PM · CONDITION Q-CTR-02 OPEN | **ACCEPT** baseline |
| BE-02 pdfkit | `po-hrm-contract-legal-print-be-02.md` | READY_FOR_QA | **ACCEPT** — F-CORE-CTR-PDF-01 · jest 22/22 |
| QA-02 browser | `po-hrm-contract-legal-print-qa-02.md` | PASS_TO_PM | **ACCEPT** U65 + stamp `CTR2-IAXGKL` |

### Machine JSON spot (stamp `CTR2-IAXGKL`)

| Signal | Value | QC |
|--------|-------|-----|
| `env.STAMP` / `KNOWN_CODE` / `KNOWN_VERSION` | `CTR2-IAXGKL` · `HD-QVQ6L` · `312255a9-b87e-46d9-97e1-c1b835db7043` | 🟢 |
| `l0` portal/hrm/xbos | 200 | 🟢 |
| `honesty.contracts_printable_ready` | **false** | 🟢 |
| `denied[]` | seed · api_only · invent_printable_uat · ready=true | 🟢 |
| `ids.apiPdf` | status **200** · `application/pdf` · magic **`%PDF`** · engine **pdfkit** · stub **false** · len **13922** · pass **true** | 🟢 |
| `ids.apiHtml` | **200** `text/html` · `html-debug` | 🟢 |
| `ac.AC-CTR-PDF-BINARY` | toastOk **true** · downloadOk **true** · verdict **PASS** | 🟢 |
| `feNetwork` body | len **0** / magic empty (`netPdfPass=false`) — stream consumed by download | 🟡 **OBS** — API probe + toast + `downloaded.pdf` authoritative (QA note accepted) |
| `closed_residuals` | Q-CTR-02 binary | 🟢 QA claim — QC confirms |
| `overall` | **PASS** | 🟢 slice |

### Screenshot / binary visual spot

| File | QC observation |
|------|----------------|
| `00-settings-chrome.png` | Điều khoản HĐ / Mẫu DnD · honesty **false** · CL/TPL chrome |
| `02-edit-spine.png` | Edit **HD-QVQ6L** · work_location CTR3 · honesty **false** · print spine |
| `03-pdf-toast.png` | **v1 - GENERAL · issued** · PDF btn · toast **Đã tải PDF** · honesty **false** |
| `downloaded.pdf` | On-disk **13922** bytes · ASCII magic **`%PDF`** (QC spot-check) |
| Screens dir | **4/4** primary PNGs + downloaded.pdf present |

---

## Gate AC audit (Q-CTR-02 binary)

| # | AC / Check | Spec / dispatch | QA-02 | QC |
|---|------------|-----------------|-------|-----|
| 1 | Content-Type application/pdf | Q-CTR-02 / BE-02 | 🟢 | 🟢 **ACCEPT** → **CLOSED** |
| 2 | Magic `%PDF` | same | 🟢 | 🟢 **ACCEPT** → **CLOSED** |
| 3 | Engine pdfkit · stub false | same | 🟢 | 🟢 **ACCEPT** → **CLOSED** |
| 4 | FE toast Đã tải PDF + download | U65 browser | 🟢 | 🟢 **ACCEPT** → **CLOSED** |
| 5 | Honesty false | mandatory | 🟢 | 🟢 **RETAIN** |
| 6 | must_keep spine + process | QC-01 host | 🟢 | 🟢 **ACCEPT** |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this seal | QC |
|---------|-------------------|-----|
| **J-HRM-03** | Host list→edit + PDF click on issued version | 🟢 **PASS** re-smoke (HD-QVQ6L · stamp CTR2) |
| Print-spine AC-CTR-PRINT-SPINE | Prior QC-01 GWC retained | 🟢 host retained · not re-opened |
| Module contracts printable UAT | Out of scope | **DENIED** |

---

## Commands (gate / spot)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-contract-legal-print-qa-02.md` | **FAIL** 1/8 (`residual_section` heading form — QA used `## Closed / residual`) | **PROCESS OBS** — not product demote; QC consolidates this file |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-contract-legal-print-qc-02.md` | **PASS** exit **0** (8/8) | PRODUCT gate OK |
| QA-02 cited `pnpm run qc:dev-stack` + `qc:fe-be-health` | ALL PASS at capture | ENV OK at capture |
| QA harness `node scripts/qa/_tmp-po-hrm-contract-legal-print-qa-02.mjs` | exit **0** · PASS_TO_PM | PRODUCT OK |
| QC spot PDF magic on `downloaded.pdf` | `%PDF` · len 13922 | PRODUCT OK |

---

## Classification

| Item | Class | Disposition |
|------|-------|-------------|
| Q-CTR-02 PDF binary (pdfkit) | PRODUCT | **CLOSED** this re-gate |
| FE net body len=0 / magic empty | PROCESS OBS | Accept — download stream; API + file + toast prove |
| QA pack verify residual heading | **PROCESS OBS** | QC file consolidates 8/8 |
| Q-CTR-01 group template publish | PRODUCT / backlog | **CONDITION** remains **OPEN** |
| Honesty / module UAT | GOVERNANCE | **DENIED** ready=true |

---

## Conditions (GWC — bounded)

1. **`Q-CTR-02` PDF binary engine** — **CLOSED** (this QC-02). Prior HTML stub path retained via `?format=html`.
2. **`Q-CTR-01` group-level template publish** — still **OPEN** (unchanged · BE-03 / SA-PM backlog). Does **not** reopen Q-CTR-02.
3. **Honesty** — `contracts_printable_ready=false`; **NOT** Phase 1 DONE; **NOT** printable module UAT-ready; **NOT** invent GO full contracts.

---

## Residual

| ID | Sev | Owner | Status |
|----|-----|-------|--------|
| `Q-CTR-02` PDF **binary** engine | P2/NFR was | — | **CLOSED** (QA-02 + this QC) |
| `Q-CTR-02` PDF HTML stub path | — | — | **CLOSED** (QC-01 retained; debug `?format=html` OK) |
| `Q-CTR-01` group template publish | P2 | sa/pm · BE-03 in flight | **OPEN** CONDITION |
| Printable module UAT | — | — | **DENIED** (`contracts_printable_ready=false`) |
| FE Playwright PDF body capture | OBS | qa (optional harness) | Non-blocking — file + API prove |

**No P0/P1 open on Q-CTR-02 → GWC allowed for this residual close.**

---

## completion_report

QC L3 narrow re-gate **GO WITH CONDITIONS**: CONDITION **Q-CTR-02 CLOSED**. Audited QA-02 MD + FINAL JSON stamp `CTR2-IAXGKL` + PNG 00/02/03 + on-disk `downloaded.pdf` (`%PDF`, 13922 B) + BE-02 READY. Proven: GET print-versions PDF → **200** `application/pdf` · magic **`%PDF`** · stub=false · engine=**pdfkit**; FE toast **Đã tải PDF** + download `hdld-312255a9-….pdf` on **HD-QVQ6L** / version `312255a9-…`. Host **J-HRM-03** re-smoke PASS; process clean; honesty **false** retained. **Q-CTR-01 remains OPEN**. QA pack 1/8 = PROCESS OBS; this QC pack 8/8. No seed · no apps/** · **DENIED** `contracts_printable_ready=true` / invent printable module UAT / Phase 1 DONE.

## next_owner

**pm** — bus INTAKE; keep honesty false; continue Q-CTR-01 / BE-03 if in flight — **do not** claim contracts printable UAT.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-QC-02-INTAKE
from_role: qc
to_role: pm
lane: governance
parent: PO-HRM-CONTRACT-LEGAL-PRINT-QC-02 GO WITH CONDITIONS
evidence_path: docs/qa/evidence/po-hrm-contract-legal-print-qc-02.md
honesty: contracts_printable_ready=false — DENIED printable module GO / UAT

task:
1) Bus INTAKE: Q-CTR-02 PDF binary CLOSED (stamp CTR2-IAXGKL · HD-QVQ6L · pdfkit · %PDF · toast Đã tải PDF)
2) Honesty lock: contracts_printable_ready=false · cấm invent module printable UAT · NOT Phase 1 DONE
3) Retain OPEN: Q-CTR-01 group template publish (BE-03 in flight if any — do not reopen Q-CTR-02)
4) Parent print-spine QC-01 GWC still binding; this seal is residual-close only
5) Continue pm:idle:check — do not idle claiming contracts printable ready

ack_status: PASS_TO_PM
```
