# Evidence — QA-DOCS-HTML-BRAND-P0-01 (spot-check HTML XeVN brand P0)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-DOCS-HTML-BRAND-P0-01` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-07-22 |
| **ack_status** | **PASS_TO_PM** |
| **entry** | `docs/qa/evidence/ba-xevn-brand-html-p0-20260722.md` READY_FOR_QA · AC-HTML-BRAND-01..06 claimed PASS |
| **spec_ref** | `docs/program/XEVN_BRAND_UIUX_PROPOSAL.md` §6 P0 · Full remaster L0 (HTML khách) |
| **env** | Static serve `http://127.0.0.1:4177` → `docs/client-delivery/` (browser MCP + CDP); U65 N/A — docs-only; **no seed**; no `apps/**` |

## Method

1. File/grep spot-check 5 covers + full `docs/client-delivery/**/*.html` for `logo-unicom` / `#3d7de8` / UNICOM.
2. SHA256 `docs/client-delivery/assets/xevn-logo.png` vs `assets/brand/xevn-logo-master.png`; decode BRD/SRS base64 embed → same hash.
3. Browser open each of 5 HTML covers; CDP computed accent + `img[alt=XeVN]` + natural size.
4. Generator anti-regression: `scripts/build-brd-xevn-html.mjs`, `build-srs-xevn-html.mjs`, `lib/doc-tscair-shell.mjs` → `LOGO=xevn-logo.png`, gate `!logo-unicom` / `!#3d7de8`, `alt="XeVN"`.
5. SRS smoke: `#### FR-` count = **373**.

## Cover matrix (5/5)

| File | Hero logo | `alt` | Accent bar CDP | `logo-unicom` | Verdict |
|------|-----------|-------|----------------|---------------|---------|
| `00_Mo_ta_he_sinh_thai_XEVN.html` | `assets/xevn-logo.png` (600×420) | XeVN | `linear-gradient(90deg, rgb(30, 64, 175), rgb(6, 182, 212))` | 0 | **PASS** |
| `01_BRD_XeVN_OS.html` | data:PNG = master SHA | XeVN | same CDP; `--xevn-primary=#1E40AF` `--xevn-secondary=#06B6D4` | 0 | **PASS** |
| `02_SRS_XeVN_OS.html` | data:PNG = master SHA | XeVN | same CDP + tokens; Be Vietnam Pro | 0 | **PASS** |
| `01_Tai_lieu_thiet_ke_he_thong_XEVN_HRM_MOBILE.html` | `assets/xevn-logo.png` (600×420) | XeVN | same CDP | 0 | **PASS** |
| `02_Tai_lieu_nghiep_vu_XEVN_HRM_MOBILE.html` | `assets/xevn-logo.png` (600×420) | XeVN | same CDP | 0 | **PASS** |

### Asset hash (AC-03)

| Path | Bytes | SHA256 |
|------|------:|--------|
| `assets/brand/xevn-logo-master.png` | 137704 | `E1763A9D613B1BFF7421DC96504137240131C75C04D7D62BABD7E5E862836A3D` |
| `docs/client-delivery/assets/xevn-logo.png` | 137704 | **identical** |
| BRD cover embed (decoded) | 137704 | **identical** |
| SRS cover embed (decoded) | 137704 | **identical** |
| `docs/client-delivery/assets/logo-unicom.png` | — | **absent** |

### CDP / shell excerpts

- **00:** `imgAlt=XeVN`; `imgSrc=assets/xevn-logo.png`; `header=XeVN OS`; `hasUnicomImg=false`; `unicomText=0`
- **01_BRD:** `docCode=XEVN/BRD-XEVN-OS-001`; `footerText` contains `XeVN Group`; `imgIsData=true`; `hasUnicomImg=false`
- **02_SRS:** `docCode=XEVN/SRS-XEVN-OS-001`; `frMarkdown=373`; `primaryVar=#1E40AF`; `secondaryVar=#06B6D4`; `hasUnicomImg=false`
- **HRM Mobile tech + business:** `imgSrc=assets/xevn-logo.png`; accent gradient rgb(30,64,175)→rgb(6,182,212); `unicomText=0`

### Package grep (all 5 HTML)

| Pattern | Count |
|---------|------:|
| `logo-unicom` | **0** |
| `#3d7de8` | **0** |
| `UNICOM` (any case, body text) | **0** (browser `innerText` on spot covers) |

## AC-HTML-BRAND-01..06

| ID | AC | Verdict | Evidence |
|----|----|---------|----------|
| **AC-HTML-BRAND-01** | Logo bìa 5/5 = XeVN; no `logo-unicom` hero | **PASS** | File + browser; alt XeVN; 0 `logo-unicom` package-wide |
| **AC-HTML-BRAND-02** | Accent `#1E40AF` → `#06B6D4` (not `#3d7de8` primary) | **PASS** | CSS literals + CDP rgb(30,64,175)→rgb(6,182,212); `#3d7de8` = 0 |
| **AC-HTML-BRAND-03** | `docs/client-delivery/assets/xevn-logo.png` = master | **PASS** | SHA256 match |
| **AC-HTML-BRAND-04** | Generator không nhúng UNICOM hero | **PASS** | Build scripts LOGO=`xevn-logo.png` + gate `!logo-unicom` / `!#3d7de8` / `alt="XeVN"`; shell rewrite `#3d7de8`→`#1E40AF` |
| **AC-HTML-BRAND-05** | Font Be Vietnam Pro | **PASS** | 5/5 file + CDP `fontFamily` |
| **AC-HTML-BRAND-06** | Không đổi số FR / skeleton | **PASS** | SRS `#### FR-` = **373**; TOC still has Ch.1–3+ (Giới thiệu / Tổng quan / Yêu cầu chức năng); Mobile SRS still 6 chương headings |

## Residual (not blocking P0 HTML brand)

| Item | Note | Owner hint |
|------|------|------------|
| Hand HTML footer không ghi «XeVN Group» | `00` + 2 HRM Mobile dùng «Bản trình bày…»; header vẫn `XeVN OS` — OK P0 logo | optional polish ba-docs |
| Logo master dark plate trên nền trắng | Print/variant nếu sponsor yêu cầu | SA / ba-docs P1 |
| Full `pnpm docs:brd:html` / `docs:srs:html` không re-run trong session QA này | Gate generator đã verify source; ba-docs đã rebuild | re-run khi style ref vendored |
| Full remaster L1/L2 web/mobile | Ngoài scope P0 HTML | **pm** continue |

## Không claim

Phase 1 DONE / PROD-READY. Không seed. Không sửa `apps/**`.

## completion_report

- **Closed:** Independent QA spot-check **5/5** client-delivery covers vs AC-HTML-BRAND-01..06 after ba-docs `D-DOCS-SHELL-XEVN-BRAND-P0-01`.
- **PASS:** XeVN hero (file + base64), accent `#1E40AF`→`#06B6D4`, asset SHA = master, generators gated, SRS FR **373**.
- **Residual:** non-blocking footer polish / print logo / L1–L2 remaster — **not** P0 HTML blockers.
- **Overall:** **PASS_TO_PM**

## next_owner

**pm** — intake PASS; continue Full remaster **L1/L2** (web/mobile theme), optional QC sample docs brand only if gate wording needs GO/GWC for docs slice.

## next_dispatch_prompt

```text
work_item_id: XEVN-THM-FE-W1 (or next open L1 remaster from XEVN_BRAND_UIUX_PROPOSAL §6)
from_role: pm
to_role: dev-fe (or devops sync if pilot lag)
entry_criteria: QA-DOCS-HTML-BRAND-P0-01 PASS_TO_PM; evidence docs/qa/evidence/qa-xevn-brand-html-p0-20260722.md
scope: continue Full remaster L1/L2 — product UI (not HTML P0); U65 zero-seed for app tests
exit_criteria: READY_FOR_QA with theme AC + evidence; no Phase1/PROD claim
cấm: seed; regress HTML covers already PASS; overwrite docs client-delivery brand without QA
```

## ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/qa-xevn-brand-html-p0-20260722.md`
