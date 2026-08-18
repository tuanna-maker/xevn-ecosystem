# Evidence — XEVN-THM-DOCS-P1-DUALMARK-01

| Field | Value |
|-------|--------|
| **work_item_id** | `XEVN-THM-DOCS-P1-DUALMARK-01` |
| **from_role** | ba-docs |
| **to_role** | qa (spot) / pm |
| **date** | 2026-07-22 |
| **ack_status** | **PASS_TO_PM** |
| **lane** | governance + client-delivery docs only |
| **entry** | QC-DOCS-HTML-BRAND-SAMPLE-01 GWC — conditions **C1** (inner UNICOM dual-mark text) + **C4** (unused `logo-unicom.png`) |
| **spec_ref** | `docs/program/XEVN_BRAND_UIUX_PROPOSAL.md` §1.2 / §6 P0 — logo slots = XeVN master; UNICOM không hero |
| **cấm observed** | No `apps/**` · no seed · no Phase1/PROD claim · `no_prompt_echo: true` |

## Summary

Closed QC GWC residuals **C1** + **C4** for client-delivery brand chrome:

- User-facing brand / header / footer marks that said «UNICOM» → **XeVN** / **XeVN OS** / **XeVN Group**.
- Cover meta «Đơn vị phát triển» → **XeVN Group** (no dual-mark supplier line on customer HTML).
- Removed unused asset `docs/client-delivery/assets/logo-unicom.png`.
- Generators updated so rebuild does not reintroduce UNICOM footers / logo path.
- **0** `logo-unicom` references under `docs/client-delivery/**` and `scripts/**` (live build paths).

## Changes (paths)

### Client-delivery (user-facing)

| Path | Change |
|------|--------|
| `00_Mo_ta_he_sinh_thai_XEVN.html` | Inner header/footer brand → XeVN / XeVN OS |
| `01_BRD_XeVN_OS.html` | Footer + cover «Đơn vị phát triển» → XeVN Group |
| `02_SRS_XeVN_OS.html` | Footer + author/meta + closing line → XeVN Group |
| `01_Tai_lieu_thiet_ke_he_thong_XEVN_HRM_MOBILE.html` + `.md` | Header/footer brand; author; CNTT role; closing |
| `02_Tai_lieu_nghiep_vu_XEVN_HRM_MOBILE.html` + `.md` | Header/footer brand; author; closing |
| `03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md` | Author + cover wording + closing → XeVN Group |
| `BA-HDSD-REVIEW.md` | Recommendation text → XeVN Group |
| `README.md` | Dropped legacy `logo-unicom.png` row |
| `assets/logo-unicom.png` | **Deleted** (C4) |

### Generators (prevent regression on rebuild)

| Path | Change |
|------|--------|
| `scripts/lib/doc-tscair-shell.mjs` | Inner footer-l → `XeVN Group` |
| `scripts/lib/srs-bateco-body.mjs` | Doc code `XEVN/SRS-…`; author + maintain line → XeVN Group |
| `scripts/lib/srs-body-markdown.mjs` | Doc code `XEVN/SRS-…` |
| `scripts/build-brd-xevn-html.mjs` / `build-srs-xevn-html.mjs` | Cover «Đơn vị phát triển» → XeVN Group |
| `scripts/build-commercial-pptx.mjs` | Logo → `xevn-logo.png`; author/contact → XeVN Group |

### Governance pointers (docs pipeline)

| Path | Change |
|------|--------|
| `.cursor/rules/client-delivery-docs.mdc` | Logo path → `xevn-logo.png` |
| `docs/standards/BRD_SRS_WRITING_STANDARDS.md` | Logo path → `xevn-logo.png` |

## Verification (self)

| Probe | Result |
|-------|--------|
| Grep `docs/client-delivery/**` for `UNICOM` / `Unicom` / `unicom` / `logo-unicom` | **COUNT=0** |
| Grep `scripts/**` for `logo-unicom` | **COUNT=0** |
| `docs/client-delivery/assets/` listing | Only `xevn-logo.png` (137704 bytes); **no** `logo-unicom.png` |
| Hero / logo img slots | Unchanged from P0 — XeVN mark (`xevn-logo` / base64); no UNICOM hero |

## Supplier footnote policy (this wave)

Sponsor lock: brand slots = XeVN only. Dual-mark UNICOM text removed from customer HTML/MD chrome and meta tables. **No** separate UNICOM supplier footnote kept on covers (cleaner dual-mark close). Legal supplier line can be re-added later as tiny meta only if sponsor requires — never as logo/`alt`/hero.

## Out of scope (explicit)

- `apps/**` theme remaster
- Phase 1 / PROD DONE claims
- Full `pnpm docs:srs:html` rebuild (HTML patched in place; generators fixed for next rebuild)
- Historical evidence / bus text that *mentions* past UNICOM gaps (audit trail)

## completion_report

- **Closed:** C1 dual-mark user-facing UNICOM brand/footer/author text in `docs/client-delivery/**`; C4 unused `logo-unicom.png` deleted; live `logo-unicom` refs = 0; generators aligned to XeVN Group / `xevn-logo.png`.
- **Open:** QA spot optional on 00 + BRD/SRS covers for footer text; PPTX rebuild (`pnpm docs:commercial:pptx`) if deck must refresh logo now.
- **Residual:** None for C1/C4 in client-delivery.

## next_owner

**qa** (spot) or **pm** intake — docs-only self-verify greps already **0**.

## next_dispatch_prompt

```text
work_item_id: QA-XEVN-THM-DOCS-P1-DUALMARK-01
from_role: ba-docs
to_role: qa
entry_criteria: XEVN-THM-DOCS-P1-DUALMARK-01 PASS_TO_PM; evidence docs/qa/evidence/xevn-thm-docs-p1-dualmark-01-20260722.md
exit_criteria: Spot-check covers 00 + 01_BRD + 02_SRS — header/footer brand = XeVN/XeVN Group only; grep docs/client-delivery 0 UNICOM + 0 logo-unicom; assets/ has no logo-unicom.png; PASS_TO_PM
cấm: seed; apps/**; claim Phase1/PROD
```

## ack_status

**PASS_TO_PM** — docs-only self-verify greps **0**; C1 + C4 closed.
