# QC — QC-DOCS-HTML-BRAND-SAMPLE-01 (P0 HTML client-delivery brand sample)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-DOCS-HTML-BRAND-SAMPLE-01` |
| **from_role** | qc |
| **to_role** | pm |
| **date** | 2026-07-22 |
| **ack_status** | **PASS_TO_PM** |
| **gate_verdict** | **GO WITH CONDITIONS** |
| **scope** | P0 HTML brand slice ONLY (`docs/client-delivery/*.html` covers) — **NOT** Phase 1 DONE · **NOT** PROD · **NOT** apps theme remaster |
| **entry** | `QA-DOCS-HTML-BRAND-01` PASS_TO_PM · `docs/qa/evidence/qa-docs-html-brand-01-20260722.md` |
| **spec_ref** | `docs/program/XEVN_BRAND_UIUX_PROPOSAL.md` §6 P0 · AC-HTML-BRAND-01..03 (`ba-xevn-html-brand-gap-01-20260722.md`) |
| **cấm observed** | No seed · no `apps/**` edits by QC |

## Classification

| Signal | Class | Notes |
|--------|-------|-------|
| Hero logo UNICOM vs XeVN | **PRODUCT** (docs) | Sample PASS — XeVN wing mark on covers |
| `logo-unicom` string in `*.html` | **PRODUCT** (docs) | **0** hits — PASS |
| Inner/footer text «UNICOM» | **PRODUCT-P1** residual | Dual-mark / vendor footer — **condition OK** (not hero) |
| Body `#3d7de8` (non-cover) | **PRODUCT-P3** polish | e.g. `00` `.highlight-box` — non-blocking |
| Stack / portal 5175 / HRM API | **ENV N/A** | Docs-only static HTML; QA used `localhost:4177` |
| L2.5 product J-* (HRM/CC) | **N/A** | Out of scope this slice — docs brand, not app journey |

## Method (QC independent)

1. Open QA evidence + screenshots `00` / `01_BRD` / `02_SRS`.
2. Visual sample: cover hero = XeVN wing circle + EVIETNAM wordmark; header codes `XEVN/…`; no UNICOM mark on hero.
3. Grep `docs/client-delivery/*.html` for `logo-unicom` → count **0**.
4. SHA256 `assets/brand/xevn-logo-master.png` vs `docs/client-delivery/assets/xevn-logo.png`.
5. Token spot-check AC-02 on `00` cover CSS + BRD `--xevn-primary` / `--xevn-secondary` override.

## Screenshots audited

| Cover | Evidence PNG | Visual |
|-------|--------------|--------|
| `00_Mo_ta_he_sinh_thai_XEVN.html` | `docs/qa/evidence/qa-docs-html-brand-00-cover-20260722.png` | Header **XeVN OS**; accent blue→cyan; XeVN wing logo; no UNICOM hero |
| `01_BRD_XeVN_OS.html` | `docs/qa/evidence/qa-docs-html-brand-01-brd-cover-20260722.png` | `XEVN/BRD-XEVN-OS-001`; XeVN wing + EVIETNAM; no UNICOM hero |
| `02_SRS_XeVN_OS.html` (corroborate) | `docs/qa/evidence/qa-docs-html-brand-02-srs-cover-20260722.png` | `XEVN/SRS-XEVN-OS-001`; same hero brand |

## Command / probe table

| Command / probe | Result | Class |
|-----------------|--------|-------|
| `Select-String docs/client-delivery/*.html -Pattern logo-unicom` | **COUNT=0** · **PASS** · exit **0** | PRODUCT |
| SHA256 master vs `docs/client-delivery/assets/xevn-logo.png` | Both `E1763A9D…836A3D` · 137704 bytes · **PASS** | PRODUCT |
| Cover `00` CSS accent-bar | `linear-gradient(90deg,#1E40AF,#06B6D4)` · **PASS** | PRODUCT |
| BRD `:root` | `--xevn-primary:#1E40AF;--xevn-secondary:#06B6D4` + cover `!important` override · **PASS** | PRODUCT |
| Static serve (QA) `http://localhost:4177` → `docs/client-delivery/` | Accepted from QA CDP · portal product URL N/A | ENV N/A |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-docs-html-brand-sample-01-20260722.md` | **PASS 8/8** · exit **0** | PROCESS |
| `verify:qc:evidence-pack` on QA MD | **FAIL 4/8** (docs-only missing command_table / portal / J-* / CRUD) | **PROCESS-P3** — not product NO-GO; QC pack + independent probes close sample |

## AC sample vs exit_criteria (AC-HTML-BRAND-01..03)

| ID | AC | Sample (00 + 01_BRD) | Verdict |
|----|----|----------------------|---------|
| **AC-HTML-BRAND-01** | Logo bìa XeVN; **không** `logo-unicom` hero | Screenshots XeVN hero; HTML `xevn-logo` / base64; grep **0** `logo-unicom` | **PASS** |
| **AC-HTML-BRAND-02** | Accent `#1E40AF` (primary) | `00` cover literals; BRD CSS vars + override; QA CDP rgb match accepted | **PASS** |
| **AC-HTML-BRAND-03** | `xevn-logo.png` hash = master | Identical SHA256 + size | **PASS** |

### Supporting (QA full pack — not re-litigated)

QA already **PASS** AC-04..06 for 5/5 covers (generator scripts point to XeVN; Be Vietnam Pro; FR count). QC sample gate does **not** re-run `pnpm docs:brd:html` / full Phase1.

## L2.5 / journey note

- Product **J-*** (PROGRAM_JOURNEY_MAP) = **N/A** — this gate is **docs client-delivery HTML brand**, not portal/HRM cross-nav.
- Docs “journey” audited: open cover `00` + `01_BRD` (+ SRS corroborate) → brand visible · **PASS** (read-only docs matrix).

## Residual / Conditions (GWC)

| # | Residual | Severity | Owner | Blocks P0 HTML brand? |
|---|----------|----------|-------|------------------------|
| C1 | Inner/footer text still «UNICOM» (e.g. BRD `UNICOM TECHNOLOGY SOLUTIONS CO., LTD`; `00` body dual-mark strings) | **P1** dual-mark | ba-docs (optional P1) | **No** — exit_criteria allows if noted |
| C2 | Non-cover `#3d7de8` leftovers (highlight-box / base shell CSS under override) | P3 polish | ba-docs | No |
| C3 | Full generator rebuild when `TSCAIR_REF` / `SRS_REF` available | Process | ba-docs / devops | No for sample |
| C4 | `logo-unicom.png` file still present under `assets/` (unused by HTML) | P2 hygiene | ba-docs | No (HTML refs = 0) |
| C5 | QA evidence MD fails Layer-B pack verifier (docs-only format) | PROCESS-P3 | qa (template for docs gates) | No — QC pack 8/8 PASS |

**Explicit:** This GWC **closes P0 HTML cover brand sample only**. It does **not** close Phase 1 product completion, PROD remaster, or `apps/**` theme waves.

## Gate verdict

### **GO WITH CONDITIONS** — P0 HTML brand slice

- Sample audit **00 + 01_BRD** vs **AC-HTML-BRAND-01..03** = **PASS**.
- Independent confirm: **0** `logo-unicom` in `docs/client-delivery/*.html`.
- Condition **C1** (UNICOM dual-mark text) accepted per PM exit_criteria.
- **NOT Phase 1 DONE · NOT PROD-READY · NOT apps UI remaster GO.**

## completion_report

- Closed: QC sample gate on QA-DOCS-HTML-BRAND-01 evidence + screenshots; AC-01..03 PASS; 0 `logo-unicom` in HTML.
- Residual: P1 dual-mark UNICOM text (C1) + P3 accent polish + unused asset file — conditions only.
- Did not touch `apps/**`; no seed.

## next_owner

**pm** — intake GWC; continue theme remaster program (web/mobile P1+) **or** optional ba-docs dual-mark cleanup — **not** claim Phase1/PROD from this docs slice.

## next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QC-DOCS-HTML-BRAND-SAMPLE-01
from_role: qc
to_role: pm
entry_criteria: QC-DOCS-HTML-BRAND-SAMPLE-01 GWC; evidence docs/qa/evidence/qc-docs-html-brand-sample-01-20260722.md
exit_criteria: Bus INTAKE; mark P0 HTML brand cover slice CLOSED (GWC); do NOT claim Phase1/PROD; next wave = theme remaster apps (FE/MOB per XEVN_THEME_SCREEN_INVENTORY) OR optional ba-docs P1 dual-mark UNICOM text cleanup (C1) if sponsor wants clean footer
cấm: seed; claim Phase1 DONE from docs HTML brand; sửa apps/** trong wave docs
```

## ack_status

**PASS_TO_PM** · gate_verdict **GO WITH CONDITIONS**
