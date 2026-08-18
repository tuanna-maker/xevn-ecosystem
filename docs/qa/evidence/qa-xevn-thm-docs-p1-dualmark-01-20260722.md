# Evidence — QA-XEVN-THM-DOCS-P1-DUALMARK-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-XEVN-THM-DOCS-P1-DUALMARK-01` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-07-22 |
| **ack_status** | **PASS_TO_PM** |
| **lane** | docs-only client-delivery (U65 N/A — no seed; no `apps/**`) |
| **entry** | `XEVN-THM-DOCS-P1-DUALMARK-01` PASS_TO_PM — `docs/qa/evidence/xevn-thm-docs-p1-dualmark-01-20260722.md`; prior QC GWC docs HTML brand (C1/C4) |
| **spec_ref** | `docs/program/XEVN_BRAND_UIUX_PROPOSAL.md` §1.2 / §6 P0 — brand slots = XeVN only |
| **cấm observed** | No seed · no `apps/**` · no Phase1/PROD DONE claim |

## Exit criteria matrix

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Spot covers `00` + `01_BRD` + `02_SRS` — header/footer brand = XeVN / XeVN Group only (no UNICOM dual-mark) | **PASS** | See § Spot-check |
| 2 | Grep `docs/client-delivery`: 0 UNICOM + 0 logo-unicom | **PASS (HTML/MD/assets)** · **FAIL (PPTX residual)** | See § Grep |
| 3 | `assets/` has no `logo-unicom.png` (only `xevn-logo.png`) | **PASS** | listing: only `xevn-logo.png` (137704 bytes) |
| 4 | Evidence this file | **PASS** | path below |

**Overall wave (HTML dual-mark C1/C4):** **PASS** — customer HTML chrome closed.  
**Strict folder-wide criterion 2:** residual in commercial PPTX — **not promoted**; PM must dispatch rebuild (see Residual).

## Spot-check (covers)

### `00_Mo_ta_he_sinh_thai_XEVN.html`

| Chrome | Observed |
|--------|----------|
| Cover header | `XeVN OS` · Phiên bản 1.1 |
| Logo | `assets/xevn-logo.png` · `alt="XeVN"` |
| Title | `XeVN OS` |
| Cover footer | date + «Bản trình bày / gửi khách hàng» (no UNICOM) |
| Inner header / footer | `XeVN` / `XeVN OS` only |

### `01_BRD_XeVN_OS.html`

| Chrome | Observed |
|--------|----------|
| Doc code | `XEVN/BRD-XEVN-OS-001` |
| Meta | Khách hàng: Tập đoàn **XeVN Group** · Đơn vị phát triển: **XeVN Group** |
| Cover footer-l | **XeVN Group** |
| Inner footer-l | **XeVN Group** (×2 shell instances) |
| Dual-mark UNICOM | **absent** |

### `02_SRS_XeVN_OS.html`

| Chrome | Observed |
|--------|----------|
| Doc code | `XEVN/SRS-XEVN-OS-001` |
| Meta | Đơn vị phát triển: **XeVN Group** |
| Cover footer-l | **XeVN Group** |
| Inner footer-l | **XeVN Group** |
| mdRaw author | `Tác giả \| XeVN Group` |
| Dual-mark UNICOM | **absent** |

## Grep

### HTML / MD / image assets (text tree)

| Probe | Count |
|-------|------:|
| `UNICOM` / `Unicom` / `unicom` under `docs/client-delivery/**/*.{html,md,css,png,svg,jpg}` | **0** |
| `logo-unicom` under same | **0** |
| ripgrep `docs/client-delivery` (skips binary pptx) | **0** |

### Assets folder

```
docs/client-delivery/assets/
  xevn-logo.png   137704
  (no logo-unicom.png)  → PASS criterion 3
```

### Residual — `03_Thuong_mai_XeVN_OS.pptx` (binary; Select-String)

| Location | Snippet |
|----------|---------|
| L72 | `<dc:creator>UNICOM / XeVN</dc:creator>` |
| L73 | `<cp:lastModifiedBy>UNICOM / XeVN</cp:lastModifiedBy>` |
| L97 | path ref `...\assets\logo-unicom.png` (stale; file deleted) |
| L366 | visible text `Liên hệ: UNICOM – XeVN Ecosystem OS` |

→ Criterion 2 **folder-absolute** not green until `pnpm docs:commercial:pptx` (or equivalent) rebuilds deck with XeVN Group + `xevn-logo.png`. Generators already patched per ba-docs evidence; **artifact not rebuilt**.

## Verdict

| Scope | Status |
|-------|--------|
| QC GWC C1 (HTML dual-mark text) | **CLOSED** — retest PASS |
| QC GWC C4 (`logo-unicom.png` asset) | **CLOSED** — retest PASS |
| Covers 00 / BRD / SRS brand chrome | **PASS** |
| Commercial PPTX dual-mark | **OPEN** — residual P1 `XEVN-THM-DOCS-P1-PPTX-01` |

**ack_status: PASS_TO_PM** — HTML dual-mark wave PASS; PPTX residual explicitly **not promoted** (no Phase1/PROD claim).

## not_promoted

- `03_Thuong_mai_XeVN_OS.pptx` — UNICOM creator/contact + stale `logo-unicom.png` relationship.

## completion_report

- **Closed:** Spot 00+BRD+SRS header/footer = XeVN / XeVN Group only; HTML/MD/assets grep 0 UNICOM / 0 logo-unicom; `assets/logo-unicom.png` absent; C1+C4 HTML residuals retested PASS.
- **Open / residual:** Rebuild commercial PPTX so folder-wide UNICOM/`logo-unicom` = 0; optional QC sample close GWC C1/C4.
- **Cấm:** seed / apps / Phase1-PROD DONE — observed.

## next_owner

**pm** → dispatch **ba-docs** or **devops** for PPTX rebuild; then optional **qc** sample close GWC docs brand conditions.

## next_dispatch_prompt

```text
work_item_id: XEVN-THM-DOCS-P1-PPTX-01
from_role: pm
to_role: ba-docs
entry_criteria: QA-XEVN-THM-DOCS-P1-DUALMARK-01 PASS_TO_PM — HTML C1/C4 closed; residual 03_Thuong_mai_XeVN_OS.pptx still has UNICOM creator/contact + logo-unicom path (docs/qa/evidence/qa-xevn-thm-docs-p1-dualmark-01-20260722.md)
exit_criteria:
1) Run pnpm docs:commercial:pptx (or equivalent) so docs/client-delivery/03_Thuong_mai_XeVN_OS.pptx has 0 UNICOM and 0 logo-unicom
2) Creator / lastModifiedBy / Liên hệ line = XeVN Group only; logo = xevn-logo.png
3) Evidence docs/qa/evidence/xevn-thm-docs-p1-pptx-01-20260722.md
ack_status: PASS_TO_PM (then QA spot or QC close GWC)
cấm: seed; apps/**; claim Phase1/PROD DONE
```

## Environment

- Repo: `xevn-ecosystem` · local workspace · docs-only probes (no browser required for text/asset AC)
- Prior ba-docs: `docs/qa/evidence/xevn-thm-docs-p1-dualmark-01-20260722.md`
