# Evidence — XEVN-THM-DOCS-P0 (HTML client-delivery brand)

| Field | Value |
|-------|--------|
| **work_item_id** | `XEVN-THM-DOCS-P0` |
| **from_role** | ba-docs |
| **to_role** | pm |
| **date** | 2026-07-22 |
| **ack_status** | **PASS_TO_PM** |
| **spec_ref** | `docs/program/XEVN_BRAND_UIUX_PROPOSAL.md` §6 P0 · AC-HTML-BRAND-01..06 (`ba-xevn-html-brand-gap-01-20260722.md`) |

## completion_report

### Closed

1. **Logo SoT copy:** `assets/brand/xevn-logo-master.png` → `docs/client-delivery/assets/xevn-logo.png`  
   - Size **137704** bytes · SHA256 **E1763A9D613B1BFF7421DC96504137240131C75C04D7D62BABD7E5E862836A3D** (khớp master).
2. **Hand HTML covers (3):** `00_Mo_ta_he_sinh_thai_XEVN.html`, `01_Tai_lieu_thiet_ke_he_thong_XEVN_HRM_MOBILE.html`, `02_Tai_lieu_nghiep_vu_XEVN_HRM_MOBILE.html`  
   - Hero `src=assets/xevn-logo.png` · `alt="XeVN"` · header **XeVN OS** · accent `#1E40AF` → `#06B6D4`.
3. **Generated BRD/SRS covers (2):** `01_BRD_XeVN_OS.html`, `02_SRS_XeVN_OS.html`  
   - Cover embed base64 từ `xevn-logo.png` · `alt="XeVN"` · footer cover **XeVN Group** · mã `XEVN/BRD-…` / `XEVN/SRS-…` · inject `--xevn-primary` / `--xevn-secondary`.
4. **Generators (anti-regression):**  
   - `scripts/build-brd-xevn-html.mjs` / `build-srs-xevn-html.mjs` → `LOGO = …/xevn-logo.png`  
   - `scripts/lib/doc-tscair-shell.mjs` → `alt="XeVN"`, cover footer XeVN Group, `XEVN_COVER_BRAND_STYLES`.
5. **Grep hero:** `docs/client-delivery/**/*.html` — **0** `logo-unicom` (PASS exit criteria).

### AC-HTML-BRAND-01..06

| ID | Verdict | Note |
|----|---------|------|
| **01** Logo bìa | **PASS** | 5/5 cover XeVN; 0 `logo-unicom` hero |
| **02** Accent | **PASS** | Cover bar/sep/title `#1E40AF`→`#06B6D4` (proposal §6); generated inject CSS tokens |
| **03** Copy path | **PASS** | `docs/client-delivery/assets/xevn-logo.png` hash = master |
| **04** Generator | **PASS*** | Shell + build scripts trỏ XeVN; *full `pnpm docs:brd:html` / `docs:srs:html` blocked — thiếu TSCAir/Unicom reference HTML local; covers patched in-place từ asset mới |
| **05** Font | **PASS** | Be Vietnam Pro giữ nguyên trên hand + generated |
| **06** Regression nội dung | **PASS** | SRS vẫn **373** `#### FR-`; Bateco Ch.1–6 còn; không rewrite FR |

### Residual (không block P0 HTML hero)

| Item | Owner hint |
|------|------------|
| Full rebuild khi có `TSCAIR_REF` / `SRS_REF` trên máy | devops / ba-docs — set env rồi `pnpm docs:brd:html` + `docs:srs:html` |
| Inner-page footer vẫn «UNICOM TECHNOLOGY…» (dual-mark P1) | P1 optional |
| `00` body `.highlight-box` còn `#3d7de8` (không phải accent bìa) | polish P3 |
| `scripts/build-commercial-pptx.mjs` còn `logo-unicom` | ngoài scope HTML P0 |
| `docs/standards/BRD_SRS_WRITING_STANDARDS.md` còn mô tả logo UNICOM | governance docs delta |
| Logo master nền đen trên bìa trắng | SA/print variant nếu sponsor yêu cầu |

## next_owner

**pm** → Task **qa** spot-check 5 covers (`QA-DOCS-HTML-BRAND-01`) hoặc visual browser bìa.

## next_dispatch_prompt

```text
work_item_id: QA-DOCS-HTML-BRAND-01
from_role: pm
to_role: qa
entry_criteria: XEVN-THM-DOCS-P0 PASS_TO_PM; evidence docs/qa/evidence/xevn-thm-docs-p0-20260722.md
exit_criteria: Spot-check 5 HTML covers vs AC-HTML-BRAND-01..06; grep 0 logo-unicom hero; screenshot 00 + 01_BRD cover; PASS_TO_PM
cấm: seed; sửa apps/**
```

## Files touched

- `docs/client-delivery/assets/xevn-logo.png` (new, copy)
- `docs/client-delivery/00_*.html`, `01_*_HRM_MOBILE.html`, `02_*_HRM_MOBILE.html`, `01_BRD_XeVN_OS.html`, `02_SRS_XeVN_OS.html`, `README.md`
- `scripts/lib/doc-tscair-shell.mjs`, `scripts/build-brd-xevn-html.mjs`, `scripts/build-srs-xevn-html.mjs`
