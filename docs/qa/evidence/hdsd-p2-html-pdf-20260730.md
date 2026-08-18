# HDSD-P2-HTML-PDF-01 — Evidence

| Field | Value |
|-------|-------|
| **work_item_id** | HDSD-P2-HTML-PDF-01 |
| **program** | HDSD-P2-FULL-01 (`P-HDSD-P2-FULL-01`) |
| **date** | 30/07/2026 |
| **owner** | ba-docs |
| **from_role** | qc (C-P2-02 residual) |
| **ack_status** | PASS_TO_PM |

## Build

| Step | Command | Exit | Result |
|------|---------|------|--------|
| HTML + PDF | `pnpm run hdsd:build` | **0** | ok=true · files=17 · images=0 |
| Script | `scripts/hdsd/build-hdsd-html.mjs` | — | Playwright PDF engine (Chrome fallback available) |
| MD rebuild | Not required | — | No PNG injected since prior build (`hdsd/assets/` still 0 PNG) |

```json
{"cover":true,"toc":true,"partBreak":true,"marked":true,"mermaid":true,"docCode":true,"sources":true}
```

## Artifacts (delivered)

| File | Size | Status |
|------|------|--------|
| `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.html` | **380 KB** | Present · self-contained A4 TSCAir shell |
| `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.pdf` | **1869 KB** | **Present** · A4 · **~115 pages** |

**Closes QC condition C-P2-02 (PDF missing)** — file now exists. Image placeholders remain until C-P2-01 (PNG inline) completes.

## Print QA — A4 layout

| Check | CSS / engine | Verdict | Notes |
|-------|--------------|---------|-------|
| Page size | `@page { size: A4; margin: 0; }` + `format: 'A4'` | PASS | Playwright `preferCSSPageSize: true` |
| Page breaks between doc shells | `.doc-page { page-break-after: always; }` | PASS | Cover + TOC + content wrapper |
| Part dividers (3 phần) | `.part-divider { break-before: page; }` | PASS | Ecosystem · XBOS · HRM |
| Table split avoidance | `.md-render table, tr { break-inside: avoid; }` | PASS (CSS) | 18 markdown table blocks in source; no manual split audit on every table — spot: wide inventory tables render full-width |
| Figure block avoidance | `.hdsd-figure { break-inside: avoid; }` | PASS (CSS) | Placeholder boxes max-height 420px |
| Mermaid in PDF | Wait for SVG before print | PASS | Batch render in tail JS; PDF export waits `networkidle` + mermaid SVG |
| Print margins | top 12mm · bottom 14mm | PASS | Puppeteer/Playwright margin override |

### Page count

- **PDF pages (estimated):** ~115 (`/Type /Page` count in binary)
- **Structure:** 1 cover + 1 TOC + multi-page body (17 MD sources merged)

## Image embed vs `[Hình]` markers

| Metric | Count | Source |
|--------|-------|--------|
| `[Hình …]` in MD (all forms) | **107** | Scan `docs/client-delivery/hdsd/**/*.md` |
| Standalone `[Hình …]` line → `[[FIG:…]]` in HTML | **51** | `preprocessFigureLines` (line-only placeholders) |
| Inline `![…](assets/…)` in MD | **0** | C-P2-01 not wired |
| PNG in `hdsd/assets/` | **0** | Awaiting HDSD-P2-SCREEN-01 |
| `<img>` embedded in HTML bundle | **2** | Logo/cover only (not figure PNGs) |
| Rendered figure placeholders in PDF | **51** | Dashed `.hdsd-figure--placeholder` boxes + caption |

**Gap:** 107 Hình markers vs **0** real screenshot embeds. After SCREEN-01: run `pnpm run hdsd:inject-images` then `pnpm run hdsd:build` to refresh HTML/PDF with inline PNG.

## Source manifest (17 MD files)

| Phần | Files |
|------|-------|
| I — Ecosystem | `HDSD_ECOSYSTEM_INDEX.md`, `ecosystem/HDSD_ECOSYSTEM_CH01_*` |
| II — XBOS | `HDSD_XBOS_INDEX.md`, CH01, CH03, CH04 WF/CAT/KPI, CH04 Dashboard |
| III — HRM | `HDSD_HRM_INDEX.md`, CH00–CH12 |

## Residual (not blocking this WI exit)

| ID | Item | Owner | Trigger |
|----|------|-------|---------|
| R-P2-PNG | 0/107 inline PNG | dev-fe + ba-docs | HDSD-P2-SCREEN-01 → `hdsd:inject-images` → re-`hdsd:build` |
| R-P2-FIG-LINE | 56 `[Hình]` not on standalone lines (51 converted) | ba-docs | Normalize MD figure lines if captions must all render as blocks |
| R-P2-QC-PRINT | Full table-by-table split audit | qc | Optional spot on 3 widest tables post-PNG |

## Handoff

**completion_report:** C-P2-02 closed — `HDSD_XEVN_ECOSYSTEM_v1.pdf` generated A4 (~115 pp, 1869 KB) via `pnpm run hdsd:build`. HTML rebuilt same run (380 KB, ok=true). Print QA recorded: A4 page rules, part breaks, table/figure `break-inside: avoid`, 51 placeholder figures vs 0 PNG embeds. MD unchanged (no PNG injection yet).

**next_owner:** pm

**next_dispatch_prompt:**
```
After HDSD-P2-SCREEN-01 closes C-P2-01:
1) pnpm run hdsd:inject-images
2) pnpm run hdsd:build
3) QC-HDSD-P2-GATE-01-R2 — verify PDF image count ≥ inline MD refs + spot print QA
work_item_id: HDSD-P2-HTML-PDF-01-R2 (optional re-build only)
evidence_path: docs/qa/evidence/hdsd-p2-html-pdf-20260730.md
```

**evidence_path:** `docs/qa/evidence/hdsd-p2-html-pdf-20260730.md`

**ack_status:** PASS_TO_PM

---

## Rebuild — HDSD-P2-HTML-REBUILD-01 (Ch.4 Dashboard delta)

| Field | Value |
|-------|-------|
| **work_item_id** | HDSD-P2-HTML-REBUILD-01 |
| **program** | HDSD-P2-FULL-01 |
| **date** | 30/07/2026 |
| **owner** | ba-docs |
| **from_role** | qc (HDSD-QC-XBOS-DASH-02 GO) |
| **source_delta** | `docs/client-delivery/hdsd/xbos/HDSD_XBOS_CH04_DASHBOARD_VAN_HANH.md` §4.0 (16 routes) |
| **ack_status** | PASS_TO_PM |

### Build

| Step | Command | Exit | Result |
|------|---------|------|--------|
| HTML + PDF | `pnpm run hdsd:build` | **0** | ok=true · files=17 · images=0 |
| Script | `scripts/hdsd/build-hdsd-html.mjs` | — | Playwright PDF engine |

```json
{"cover":true,"toc":true,"partBreak":true,"marked":true,"mermaid":true,"docCode":true,"sources":true}
```

### Artifacts (refreshed)

| File | Size | Status |
|------|------|--------|
| `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.html` | **380 KB** (389434 B) | Rebuilt · includes Ch.4 §4.0 |
| `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.pdf` | **1921 KB** (1967163 B) | Regenerated A4 same run |

### Ch.4 §4.0 inventory verification

| Check | Result |
|-------|--------|
| Section heading «4.0 Danh mục màn Dashboard vận hành» in HTML | **PASS** |
| All 16 routes (`/cockpit` … `/dashboard/hr`) present | **PASS** (16/16) |
| STT rows 1–16 in inventory table | **PASS** |

### completion_report

- **Closed:** HTML/PDF rebuild after QC GO on Ch.4 Dashboard doc slice; §4.0 16-route inventory embedded in bundle.
- **Open (program):** PNG inline (C-P2-01 / HDSD-P2-SCREEN-01); full Phase 2 gate per `QC-HDSD-P2-GATE-01`.

### next_owner

pm

### next_dispatch_prompt

```
Program residuals unchanged: HDSD-P2-SCREEN-01 → hdsd:inject-images → hdsd:build R2.
Optional QC spot: open artifacts/HDSD_XEVN_ECOSYSTEM_v1.pdf Phần II — verify §4.0 table renders on A4.
work_item_id: HDSD-P2-HTML-PDF-01-R2 (after SCREEN-01)
evidence_path: docs/qa/evidence/hdsd-p2-html-pdf-20260730.md
```
