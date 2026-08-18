# Evidence — QA-DOCS-HTML-BRAND-01 (spot-check HTML client-delivery brand)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-DOCS-HTML-BRAND-01` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-07-22 |
| **ack_status** | **PASS_TO_PM** |
| **entry** | `docs/qa/evidence/xevn-thm-docs-p0-20260722.md` PASS_TO_PM |
| **spec_ref** | `docs/program/XEVN_BRAND_UIUX_PROPOSAL.md` §6 P0 · AC-HTML-BRAND-01..06 (`ba-xevn-html-brand-gap-01-20260722.md`) |
| **env** | Local static serve `http://localhost:4177` → `docs/client-delivery/` (browser MCP; no `apps/**`; U65 N/A — docs-only) |

## Method

1. Grep `docs/client-delivery/**/*.html` for `logo-unicom` → **0**.
2. SHA256 `docs/client-delivery/assets/xevn-logo.png` vs `assets/brand/xevn-logo-master.png`.
3. Parse 5 covers (file src / base64 + `alt="XeVN"` + accent tokens).
4. Browser spot-check covers: `00`, `01_BRD`, `02_SRS` (+ CDP computed style) + smoke `01`/`02` HRM Mobile.
5. Generator anti-regression grep: `scripts/lib/doc-tscair-shell.mjs`, `build-brd-xevn-html.mjs`, `build-srs-xevn-html.mjs`.

## Screenshots

| Cover | File |
|-------|------|
| `00_Mo_ta_he_sinh_thai_XEVN.html` | `docs/qa/evidence/qa-docs-html-brand-00-cover-20260722.png` |
| `01_BRD_XeVN_OS.html` | `docs/qa/evidence/qa-docs-html-brand-01-brd-cover-20260722.png` |
| `02_SRS_XeVN_OS.html` | `docs/qa/evidence/qa-docs-html-brand-02-srs-cover-20260722.png` |

## Cover matrix (5/5)

| File | Hero logo | `alt` | Accent `#1E40AF`→`#06B6D4` | `logo-unicom` | Verdict |
|------|-----------|-------|----------------------------|---------------|---------|
| `00_Mo_ta_he_sinh_thai_XEVN.html` | `assets/xevn-logo.png` | XeVN | CDP `rgb(30,64,175)`→`rgb(6,182,212)` | 0 | **PASS** |
| `01_Tai_lieu_thiet_ke_he_thong_XEVN_HRM_MOBILE.html` | `assets/xevn-logo.png` | XeVN | same CDP | 0 | **PASS** |
| `02_Tai_lieu_nghiep_vu_XEVN_HRM_MOBILE.html` | `assets/xevn-logo.png` | XeVN | same CDP | 0 | **PASS** |
| `01_BRD_XeVN_OS.html` | base64 = master hash | XeVN | `--xevn-primary/#1E40AF` + `--xevn-secondary/#06B6D4`; CDP gradient | 0 | **PASS** |
| `02_SRS_XeVN_OS.html` | base64 = master hash | XeVN | same tokens + CDP; font Be Vietnam Pro | 0 | **PASS** |

### Asset hash (AC-03)

| Path | Bytes | SHA256 |
|------|------:|--------|
| `assets/brand/xevn-logo-master.png` | 137704 | `E1763A9D613B1BFF7421DC96504137240131C75C04D7D62BABD7E5E862836A3D` |
| `docs/client-delivery/assets/xevn-logo.png` | 137704 | **identical** |
| BRD/SRS cover embed (decoded PNG) | 137704 | **identical** |

### CDP excerpts (browser)

- **00:** `accentBg=linear-gradient(90deg, rgb(30, 64, 175), rgb(6, 182, 212))`; `imgAlt=XeVN`; `imgSrc=assets/xevn-logo.png`; `header=XeVN OS`; `hasUnicomImg=false`
- **01_BRD:** `primary=#1E40AF`; `secondary=#06B6D4`; `footer=XeVN Group`; `imgIsData=true`; `hasUnicomImg=false`
- **02_SRS:** same tokens; `fontFamily="Be Vietnam Pro", …`; `footer=XeVN Group`; `hasUnicomImg=false`

## AC-HTML-BRAND-01..06

| ID | Verdict | Evidence |
|----|---------|----------|
| **01** Logo bìa | **PASS** | 5/5 XeVN hero; grep **0** `logo-unicom` in `docs/client-delivery/*.html` |
| **02** Accent | **PASS** | Hand HTML literal `#1E40AF,#06B6D4`; generated inject CSS vars; CDP rgb match |
| **03** Copy path | **PASS** | `xevn-logo.png` hash = master |
| **04** Generator | **PASS*** | Shell + build scripts point to `xevn-logo.png` / `alt="XeVN"`; *full `pnpm docs:brd:html` / `docs:srs:html` not re-run (ref HTML local gap — residual from P0, not blocking cover spot-check) |
| **05** Font | **PASS** | Be Vietnam Pro on SRS cover (CDP) + hand HTML retained |
| **06** Regression nội dung | **PASS** | SRS HTML still **373** `#### FR-` |

## Residual (not blocking P0 HTML brand)

| Item | Owner hint |
|------|------------|
| Inner-page header/footer still may show text «UNICOM» (dual-mark P1) | ba-docs / P1 optional — **not** hero logo |
| Full rebuild when `TSCAIR_REF` / `SRS_REF` available | ba-docs / devops |
| `00` body `.highlight-box` `#3d7de8` (non-cover) | polish P3 |
| Logo master dark plate on white cover | SA/print variant if sponsor asks |

## completion_report

- Closed: independent QA spot-check **5/5** client-delivery covers vs AC-HTML-BRAND-01..06.
- Visual: XeVN wing mark hero on `00` + BRD + SRS; accent bar `#1E40AF`→`#06B6D4`; **0** `logo-unicom`.
- Did **not** touch `apps/**`; no seed.
- Residual: dual-mark inner UNICOM text + full generator rebuild — **non-blocking** for P0 HTML hero.

## next_owner

**pm** — intake; optional **qc** sample docs brand or continue theme remaster wave (web/mobile P1+).

## next_dispatch_prompt

```text
work_item_id: QC-DOCS-HTML-BRAND-SAMPLE-01
from_role: pm
to_role: qc
entry_criteria: QA-DOCS-HTML-BRAND-01 PASS_TO_PM; evidence docs/qa/evidence/qa-docs-html-brand-01-20260722.md
exit_criteria: Sample audit 00 + 01_BRD screenshots + AC-01..03; confirm 0 logo-unicom; GO/GWC for P0 HTML brand slice only (not Phase1/PROD)
cấm: seed; sửa apps/**
```

## ack_status

**PASS_TO_PM**
