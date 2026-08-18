# Evidence — XEVN-THM-DOCS-P1-PPTX-01

| Field | Value |
|-------|--------|
| **work_item_id** | `XEVN-THM-DOCS-P1-PPTX-01` |
| **from_role** | ba-docs |
| **to_role** | pm |
| **date** | 2026-07-22 |
| **ack_status** | **PASS_TO_PM** |
| **lane** | docs-only client-delivery (U65 N/A — no seed; no `apps/**`) |
| **entry** | `QA-XEVN-THM-DOCS-P1-DUALMARK-01` PASS — residual PPTX UNICOM / logo-unicom |
| **spec_ref** | `docs/program/XEVN_BRAND_UIUX_PROPOSAL.md` §1.2 / §6 P0 — brand slots = XeVN only |
| **cấm observed** | No seed · no `apps/**` · no Phase1/PROD DONE claim |

## Actions

1. Confirmed generator `scripts/build-commercial-pptx.mjs` already brand-locked:
   - `pres.author = 'XeVN Group'`
   - `LOGO → docs/client-delivery/assets/xevn-logo.png`
   - Contact copy: `Liên hệ: XeVN Group · XeVN Ecosystem OS`
2. Rebuilt artifact: `pnpm docs:commercial:pptx` → **exit 0** · **26 slides**
3. Verified extracted OOXML + Select-String on binary PPTX

## Exit criteria matrix

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | `pnpm docs:commercial:pptx` rebuilds `docs/client-delivery/03_Thuong_mai_XeVN_OS.pptx` with **0 UNICOM** and **0 logo-unicom** | **PASS** | Extracted package scan: `UNICOM_hits=0` · `logo-unicom_hits=0`; Select-String residual lines from QA dualmark gone |
| 2 | Creator / lastModifiedBy / Liên hệ = **XeVN Group** only; logo = **xevn-logo.png** | **PASS** | `docProps/core.xml`: `<dc:creator>XeVN Group</dc:creator>` · `<cp:lastModifiedBy>XeVN Group</cp:lastModifiedBy>`; slide25 `a:t` = `Liên hệ: XeVN Group · XeVN Ecosystem OS`; cover pic source path ends `assets\xevn-logo.png`; embedded `image-1-1.png` size **137704** (= `xevn-logo.png`) |
| 3 | Evidence this file | **PASS** | path below |

## Artifact fingerprint

| Item | Value |
|------|--------|
| Path | `docs/client-delivery/03_Thuong_mai_XeVN_OS.pptx` |
| Slides | 26 |
| Size (bytes) | 5696042 |
| SHA256 | `694A93ACB0661B8A3E1E2112B86DA676C40928C646E213CF287EC545164A2FB8` |
| Logo asset | `docs/client-delivery/assets/xevn-logo.png` (137704) |

## Probe commands (reproducible)

```bash
pnpm docs:commercial:pptx
```

```powershell
# Extract + count (representative)
$pptx = "docs\client-delivery\03_Thuong_mai_XeVN_OS.pptx"
# Expand OOXML → assert core.xml creator/lastModifiedBy = XeVN Group
# Recurse XML: UNICOM|logo-unicom count must be 0
Select-String -Path $pptx -Pattern "UNICOM|logo-unicom"
# Expect: no UNICOM / logo-unicom matches (XeVN Group lines OK)
```

## Closed residuals (from QA dualmark)

| Prior residual (QA) | After rebuild |
|---------------------|---------------|
| `<dc:creator>UNICOM / XeVN</dc:creator>` | `XeVN Group` |
| `<cp:lastModifiedBy>UNICOM / XeVN</cp:lastModifiedBy>` | `XeVN Group` |
| path `logo-unicom.png` | `xevn-logo.png` |
| `Liên hệ: UNICOM – XeVN Ecosystem OS` | `Liên hệ: XeVN Group · XeVN Ecosystem OS` |

## Verdict

| Scope | Status |
|-------|--------|
| Commercial PPTX dual-mark residual | **CLOSED** |
| Folder-absolute client-delivery UNICOM / logo-unicom (incl. PPTX) | Ready for QA re-grep |

**ack_status: PASS_TO_PM** — PPTX brand closed; no Phase1/PROD claim.

## not_promoted

- Phase 1 / PROD readiness claims
- HTML dual-mark wave (already PASS under `QA-XEVN-THM-DOCS-P1-DUALMARK-01`) — not re-run here

## completion_report

- **Closed:** Rebuilt `03_Thuong_mai_XeVN_OS.pptx` via `pnpm docs:commercial:pptx`; metadata + contact + logo path = XeVN Group / `xevn-logo.png` only; **0** UNICOM / **0** logo-unicom in OOXML.
- **Open:** QA spot-confirm folder-wide Select-String on PPTX; optional QC GWC close for docs brand residual chain.

## next_owner

`qa` (then `pm` → optional `qc` if GWC docs brand still open)

## next_dispatch_prompt

```text
work_item_id: QA-XEVN-THM-DOCS-P1-PPTX-01
from_role: pm
to_role: qa
entry_criteria: XEVN-THM-DOCS-P1-PPTX-01 PASS_TO_PM — docs/qa/evidence/xevn-thm-docs-p1-pptx-01-20260722.md
exit_criteria:
1) Select-String / OOXML extract on docs/client-delivery/03_Thuong_mai_XeVN_OS.pptx → 0 UNICOM + 0 logo-unicom
2) creator + lastModifiedBy + Liên hệ = XeVN Group; cover logo source/embed = xevn-logo.png (137704)
3) Evidence docs/qa/evidence/qa-xevn-thm-docs-p1-pptx-01-20260722.md
ack_status: PASS_TO_PM
cấm: seed; apps/**; Phase1/PROD DONE claim
```
