# Evidence — QA-XEVN-THM-DOCS-P1-PPTX-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-XEVN-THM-DOCS-P1-PPTX-01` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-07-22 |
| **ack_status** | **PASS_TO_PM** |
| **lane** | docs-only client-delivery (U65 N/A — no seed; no `apps/**`) |
| **entry** | `XEVN-THM-DOCS-P1-PPTX-01` PASS_TO_PM — `docs/qa/evidence/xevn-thm-docs-p1-pptx-01-20260722.md` |
| **spec_ref** | `docs/program/XEVN_BRAND_UIUX_PROPOSAL.md` §1.2 / §6 P0 — brand slots = XeVN only |
| **cấm observed** | No seed · no `apps/**` · no Phase1/PROD DONE claim |

## Exit criteria matrix

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Select-String / OOXML extract on `docs/client-delivery/03_Thuong_mai_XeVN_OS.pptx` → **0 UNICOM** + **0 logo-unicom** | **PASS** | Binary Select-String: 0 matches; full OOXML package file scan: `UNICOM_hits=0` · `logo-unicom_hits=0` |
| 2 | creator + lastModifiedBy + Liên hệ = **XeVN Group**; cover logo = **xevn-logo.png** (137704) | **PASS** | `docProps/core.xml`: both = `XeVN Group`; slide25 `a:t` = `Liên hệ: XeVN Group · XeVN Ecosystem OS`; cover `ppt/media/image-1-1.png` size **137704** SHA = master `assets/xevn-logo.png` |
| 3 | Evidence this file | **PASS** | path below |

**Overall:** **PASS** — commercial PPTX dual-mark residual closed. No Phase1/PROD claim.

## Artifact fingerprint (retested)

| Item | Value |
|------|--------|
| Path | `docs/client-delivery/03_Thuong_mai_XeVN_OS.pptx` |
| Size (bytes) | 5696042 |
| SHA256 | `694A93ACB0661B8A3E1E2112B86DA676C40928C646E213CF287EC545164A2FB8` |
| Matches ba-docs entry | **YES** (same size + SHA) |
| Master logo | `docs/client-delivery/assets/xevn-logo.png` · 137704 · SHA256 `E1763A9D613B1BFF7421DC96504137240131C75C04D7D62BABD7E5E862836A3D` |

## Probes executed (2026-07-22)

### 1) Binary Select-String

```powershell
Select-String -Path "docs\client-delivery\03_Thuong_mai_XeVN_OS.pptx" -Pattern "UNICOM|logo-unicom"
# Result: Select-String matches: 0
Select-String -Path same -Pattern "XeVN Group"
# Result: XeVN Group match count (lines): 3
```

### 2) OOXML extract + full-package scan

```powershell
# ZipFile.ExtractToDirectory → %TEMP%\qa-xevn-thm-pptx-01-*
# UTF-8 read of every package file; count UNICOM + logo-unicom (IgnoreCase)
# Result: OOXML_ALL_FILES UNICOM_hits=0 logo-unicom_hits=0
```

### 3) Metadata / contact / cover logo

| Check | Observed |
|-------|----------|
| `dc:creator` | `XeVN Group` |
| `cp:lastModifiedBy` | `XeVN Group` |
| slide25 Liên hệ | `Liên hệ: XeVN Group · XeVN Ecosystem OS` |
| slide1 image target | `../media/image-1-1.png` |
| `image-1-1.png` size | **137704** |
| embed SHA vs master `xevn-logo.png` | **identical** `E1763A9D…836A3D` |
| Residual `UNICOM` / `logo-unicom` strings | **none** |

## Closed vs prior residual (dualmark QA)

| Prior residual | Retest |
|----------------|--------|
| `<dc:creator>UNICOM / XeVN</dc:creator>` | **CLOSED** → `XeVN Group` |
| `<cp:lastModifiedBy>UNICOM / XeVN</cp:lastModifiedBy>` | **CLOSED** → `XeVN Group` |
| path / embed `logo-unicom` | **CLOSED** → cover = master `xevn-logo.png` (137704) |
| `Liên hệ: UNICOM – …` | **CLOSED** → `Liên hệ: XeVN Group · XeVN Ecosystem OS` |

## not_promoted

- Phase 1 / PROD readiness claims
- Full client-delivery HTML dual-mark re-run (already PASS under `QA-XEVN-THM-DOCS-P1-DUALMARK-01`)
- Optional QC GWC close for docs brand residual chain (PM decision)

## Verdict

| Scope | Status |
|-------|--------|
| Commercial PPTX brand purge (exit 1–3) | **PASS** |
| Folder PPTX residual from dualmark wave | **CLOSED** |

**ack_status: PASS_TO_PM**

## completion_report

- **Closed:** Independent QA retest of `03_Thuong_mai_XeVN_OS.pptx` — Select-String + full OOXML scan = **0 UNICOM / 0 logo-unicom**; creator/lastModifiedBy/Liên hệ = **XeVN Group**; cover embed = master `xevn-logo.png` (137704, SHA match); fingerprint matches ba-docs rebuild.
- **Open:** Optional QC sample if GWC docs-brand condition still open; no execution residual on this work_item.

## next_owner

`pm` → optional `qc` (docs brand GWC close) if residual chain still tracked

## next_dispatch_prompt

```text
work_item_id: QC-XEVN-THM-DOCS-P1-PPTX-01
from_role: pm
to_role: qc
entry_criteria: QA-XEVN-THM-DOCS-P1-PPTX-01 PASS_TO_PM — docs/qa/evidence/qa-xevn-thm-docs-p1-pptx-01-20260722.md (+ prior QA-XEVN-THM-DOCS-P1-DUALMARK-01 HTML PASS)
exit_criteria:
1) Audit QA evidence: PPTX Select-String/OOXML 0 UNICOM + 0 logo-unicom; core.xml + Liên hệ = XeVN Group; cover embed 137704 = xevn-logo.png
2) If GWC docs brand C1/C4/PPTX residual still open → close or GO WITH CONDITIONS with residual list empty for PPTX
3) Evidence docs/qa/evidence/qc-xevn-thm-docs-p1-pptx-01-20260722.md
ack_status: PASS_TO_PM
cấm: seed; apps/**; Phase1/PROD DONE claim
```
