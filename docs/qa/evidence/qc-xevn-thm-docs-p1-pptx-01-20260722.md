# QC — QC-XEVN-THM-DOCS-P1-PPTX-01 (commercial PPTX + docs dual-mark close)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-XEVN-THM-DOCS-P1-PPTX-01` |
| **from_role** | qc |
| **to_role** | pm |
| **date** | 2026-07-22 |
| **ack_status** | **PASS_TO_PM** |
| **gate_verdict** | **GO** |
| **scope** | Docs client-delivery brand dual-mark (HTML C1/C4) + commercial PPTX only — **NOT** Phase 1 DONE · **NOT** PROD · **NOT** `apps/**` theme remaster |
| **entry** | `QA-XEVN-THM-DOCS-P1-PPTX-01` PASS_TO_PM · `docs/qa/evidence/qa-xevn-thm-docs-p1-pptx-01-20260722.md` (+ prior `QA-XEVN-THM-DOCS-P1-DUALMARK-01` HTML PASS; `QC-DOCS-HTML-BRAND-SAMPLE-01` GWC C1/C4) |
| **spec_ref** | `docs/program/XEVN_BRAND_UIUX_PROPOSAL.md` §1.2 / §6 P0 — brand slots = XeVN only |
| **cấm observed** | No seed · no `apps/**` · no Phase1/PROD DONE claim |

## Classification

| Signal | Class | Notes |
|--------|-------|-------|
| PPTX Select-String / OOXML `UNICOM` / `logo-unicom` | **PRODUCT** (docs) | Independent QC: **0** / **0** — PASS |
| `docProps/core.xml` creator / lastModifiedBy | **PRODUCT** (docs) | Both `XeVN Group` — PASS |
| Slide Liên hệ contact | **PRODUCT** (docs) | `Liên hệ: XeVN Group · XeVN Ecosystem OS` (slide25) — PASS |
| Cover embed vs master logo | **PRODUCT** (docs) | `image-1-1.png` **137704** SHA = `assets/xevn-logo.png` — PASS |
| HTML dual-mark C1 (inner UNICOM text) | **PRODUCT** (docs) | Covers 00/BRD/SRS + html/md/css tree **0** UNICOM — **CLOSED** |
| C4 `logo-unicom.png` asset | **PRODUCT** (docs) | `assets/` = only `xevn-logo.png` (137704) — **CLOSED** |
| Stack / portal 5175 / HRM API | **ENV N/A** | Docs-only static + OOXML; **PORTAL_DEV_URL** N/A (not portal `5175`) |
| L2.5 product J-* (HRM/CC) | **N/A** | Out of scope — docs brand / PPTX, not app journey |

## Method (QC independent)

1. Open QA evidence `qa-xevn-thm-docs-p1-pptx-01-20260722.md` + ba-docs rebuild fingerprint.
2. Fingerprint PPTX size/SHA vs QA (must match).
3. Binary `Select-String` UNICOM|logo-unicom → 0; XeVN Group present.
4. Zip extract OOXML → full-package UTF-8 scan UNICOM/logo-unicom = 0; read `core.xml`; extract Liên hệ; hash cover embed vs master.
5. Spot HTML covers 00/BRD/SRS + assets listing to close prior GWC C1/C4.
6. `pnpm run verify:qc:evidence-pack` on this file.

## Artifact fingerprint (QC retest)

| Item | Value | Match QA? |
|------|--------|-----------|
| Path | `docs/client-delivery/03_Thuong_mai_XeVN_OS.pptx` | — |
| Size (bytes) | **5696042** | **YES** |
| SHA256 | `694A93ACB0661B8A3E1E2112B86DA676C40928C646E213CF287EC545164A2FB8` | **YES** |
| Master logo | `docs/client-delivery/assets/xevn-logo.png` · 137704 · `E1763A9D…836A3D` | **YES** |

## Command / probe table

| Command / probe | Result | Class |
|-----------------|--------|-------|
| `Select-String` PPTX `UNICOM\|logo-unicom` | **COUNT=0** · **PASS** · exit **0** | PRODUCT |
| `Select-String` PPTX `XeVN Group` | line matches **3** · **PASS** | PRODUCT |
| OOXML extract full-package scan (125 files) | `UNICOM_hits=0` · `logo-unicom_hits=0` · **PASS** | PRODUCT |
| Read `docProps/core.xml` | `dc:creator=XeVN Group` · `cp:lastModifiedBy=XeVN Group` · **PASS** | PRODUCT |
| slide25 Liên hệ | `Liên hệ: XeVN Group · XeVN Ecosystem OS` · **PASS** | PRODUCT |
| Cover `ppt/media/image-1-1.png` vs master | size **137704** · SHA identical · **PASS** | PRODUCT |
| Spot HTML 00/BRD/SRS `UNICOM\|logo-unicom` | **0** each · **PASS** | PRODUCT |
| `assets/` listing | only `xevn-logo.png` · **PASS** (C4 closed) | PRODUCT |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-xevn-thm-docs-p1-pptx-01-20260722.md` | **PASS 8/8** · exit **0** (recorded after write) | PROCESS |
| QA pack Layer-B on `qa-xevn-thm-docs-p1-pptx-01-*.md` | May fail portal/J-* (docs-only) | **PROCESS-P3** — not product NO-GO; QC pack + independent probes close |

## Exit criteria audit

| # | Criterion | QC verdict |
|---|-----------|------------|
| 1 | Select-String/OOXML 0 UNICOM + 0 logo-unicom; core.xml + Liên hệ = XeVN Group; cover embed 137704 = xevn-logo.png | **PASS** (independent retest) |
| 2 | Close docs brand C1/C4/PPTX residual **or** GWC with residual list empty for PPTX/HTML dual-mark | **PASS** — C1 **CLOSED** · C4 **CLOSED** · PPTX **CLOSED**; dual-mark residual list **empty** |
| 3 | Evidence this file | **PASS** |

## Docs dual-mark / residual close map

| Prior residual | Source | Status after this gate |
|----------------|--------|-------------------------|
| C1 Inner/footer «UNICOM» dual-mark text | `QC-DOCS-HTML-BRAND-SAMPLE-01` GWC | **CLOSED** — HTML/md/css **0** UNICOM (QA dualmark + QC spot) |
| C4 `logo-unicom.png` under `assets/` | same GWC | **CLOSED** — asset absent |
| PPTX creator/contact/`logo-unicom` path | `QA-XEVN-THM-DOCS-P1-DUALMARK-01` not_promoted | **CLOSED** — rebuild + QA + QC PASS |

### Out of dual-mark scope (not blocking this work_item)

| Id | Note | Severity |
|----|------|----------|
| Prior C2 | Non-cover `#3d7de8` accent polish | P3 optional — **not** dual-mark residual |
| Prior C3 | Full generator rebuild when TSCAIR/SRS refs available | Process optional |
| Prior C5 | Docs-only QA MD Layer-B template gaps | PROCESS-P3 |

## L2.5 / journey note

- Product **J-*** (`PROGRAM_JOURNEY_MAP`) = **N/A** — docs client-delivery HTML + commercial PPTX brand gate, not portal/HRM cross-nav.
- Docs journey audited (read-only matrix): open covers 00/BRD/SRS + commercial deck metadata/contact/logo → brand = XeVN only · **PASS**.

## Read-only module / AC matrix

| Module / AC | Probe | Verdict |
|-------------|-------|---------|
| Commercial PPTX brand purge | Select-String + OOXML + core.xml + Liên hệ + embed SHA | **PASS** |
| HTML dual-mark C1 | covers + tree grep 0 UNICOM | **PASS** |
| Asset hygiene C4 | no `logo-unicom.png` | **PASS** |
| CRUD mutate | N/A read-only docs | N/A |

## Residual

**No residual remaining** for PPTX / HTML dual-mark (C1/C4/PPTX) in this slice.

Explicit: **NOT Phase 1 DONE · NOT PROD-READY · NOT apps UI remaster GO.**

## Gate verdict

### **GO** — docs brand dual-mark + commercial PPTX slice

- Independent QC confirms QA exit 1–3.
- Prior GWC conditions **C1** and **C4** closed; PPTX residual closed.
- Dual-mark residual list for PPTX/HTML = **empty**.
- **NOT** Phase 1 / PROD / `apps/**` remaster.

## completion_report

- **Closed:** QC gate on commercial `03_Thuong_mai_XeVN_OS.pptx` (fingerprint match QA); Select-String + OOXML **0** UNICOM / **0** logo-unicom; creator/lastModifiedBy/Liên hệ = **XeVN Group**; cover embed = master `xevn-logo.png` (137704); HTML dual-mark C1 + asset C4 closed → docs brand dual-mark residual chain **empty** for this slice.
- **Open / not promoted:** Phase1/PROD; apps theme remaster; optional C2 accent polish P3 (out of dual-mark exit).
- **Cấm:** seed / apps / Phase1-PROD DONE — observed.

## next_owner

**pm** — bus INTAKE GO; continue theme remaster program (FE/MOB per `XEVN_THEME_SCREEN_INVENTORY`) — **do not** claim Phase1/PROD from docs brand close.

## next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QC-XEVN-THM-DOCS-P1-PPTX-01
from_role: qc
to_role: pm
entry_criteria: QC-XEVN-THM-DOCS-P1-PPTX-01 GO — docs/qa/evidence/qc-xevn-thm-docs-p1-pptx-01-20260722.md
exit_criteria:
1) Bus INTAKE: mark docs brand dual-mark C1/C4 + commercial PPTX residual CLOSED
2) Do NOT claim Phase1/PROD from this docs slice
3) Next execution wave = theme remaster apps (FE-W1 / FE-W1-HRM / MOB-W2 per XEVN_THEME_SCREEN_INVENTORY) or other open PM backlog — not reopen PPTX/HTML dual-mark unless new UNICOM regression
cấm: seed; claim Phase1 DONE from docs PPTX/HTML brand; sửa apps/** trong wave docs
```

## ack_status

**PASS_TO_PM** · gate_verdict **GO**
