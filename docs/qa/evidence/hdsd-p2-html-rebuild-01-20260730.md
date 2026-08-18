# HDSD-P2-HTML-REBUILD-01 — HTML+PDF rebuild evidence

| Field | Value |
|-------|-------|
| **work_item_id** | HDSD-P2-HTML-REBUILD-01 |
| **program** | HDSD-P2-FULL-01 |
| **from_role** | ba-docs |
| **to_role** | qc |
| **date** | 2026-07-30 |
| **upstream** | QA-HDSD-P2-SCREEN-01 (`docs/qa/evidence/hdsd-p2-screenshots-20260730.md`) |

## Entry criteria (verified)

- QA capture + inject PASS: 95 placeholders injected, 0 missing assets after fix.
- 14 HDSD markdown files contain `![…](../assets/{domain}/*.png)` references.
- Builder source: `scripts/hdsd/build-hdsd-html.mjs`.

## Build command

```bash
pnpm run hdsd:build
```

**Exit code:** `0`

## Artifacts

| Artifact | Path | Size |
|----------|------|------|
| HTML (self-contained) | `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.html` | 23 376 KB |
| PDF (A4 print) | `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.pdf` | 8 449 KB |

## Inline image verification

| Metric | Count |
|--------|------:|
| PNG on disk (`assets/**`) | 110 |
| Bundle keys (unique files) | 110 |
| `[[IMG:…]]` tokens in merged `mdRaw` | **95** |
| `[[FIG:…]]` placeholders (mobile / chưa chụp) | 49 |
| Markdown `![…]` refs in 14 source files | 97 |

**Runtime render:** Tail JS replaces `[[IMG:domain/file.png]]` with `<figure class="hdsd-figure"><img src="data:image/…">` using `DIAGRAMS` map (110 base64 entries). Open HTML in browser → Mermaid batch render → figures visible.

### Builder fix (this wave)

1. **Recursive asset walk** — PNG nằm trong `assets/ecosystem|xbos|hrm/` (trước đó builder chỉ đọc thư mục gốc → `images=0`).
2. **Canonical path** — `normalizeAssetSrc()` chuẩn hóa `../assets/…` → `domain/file.png`; tránh nhân bản base64 (205 MB → 23 MB).
3. **PDF timeout** — `domcontentloaded` + timeout 300s cho HTML lớn.
4. **Gate** — `validateHtml` thêm `inlineImages: imgTokens ≥ 90`.

## Structural checks (`ok=true`)

```json
{
  "cover": true,
  "toc": true,
  "partBreak": true,
  "marked": true,
  "mermaid": true,
  "docCode": true,
  "sources": true,
  "inlineImages": true
}
```

- **Mã tài liệu:** `XEVN/HDSD-ECO-001`
- **Manifest parts:** 17 source files (Ecosystem + XBOS + HRM)
- **Style shell:** TSCAir fallback `docs/client-delivery/01_BRD_XeVN_OS.html`

## Residual (QC spot-check)

1. **49 FIG placeholders** — chủ yếu `[Hình …]` Mobile HRM (Ch.12) và figure chưa có PNG; không chặn gate HTML rebuild.
2. **95/95 inject aligned** — khớp QA inject count.
3. **Style ref missing** — `TSCAir_BRD_TASMOS_v2.1` path local; fallback BRD XeVN OK.

## QC dispatch hints

- Spot-check 5 routes: login (`eco-1`), Command Center, HRM embed employees, org settings, payroll tab.
- Ctrl+F HTML: không còn chuỗi `ảnh chưa có` trên các figure đã inject (95 IMG tokens).
- In PDF: cover A4 + ít nhất 3 figure có ảnh thật (không dashed placeholder).
- Cấm meta pipeline / work_item trong narrative khách (HDSD đã scrub).

## Handoff

| Field | Value |
|-------|-------|
| **ack_status** | **READY_FOR_QC** |
| **next_owner** | qc |
| **next_dispatch_prompt** | QC-HDSD-P2-GATE-01-R2 — audit HTML+PDF inline figures, banned phrases, 5-route spot-check; verdict GO/GWC/NO-GO → `docs/qa/evidence/hdsd-p2-qc-gate-r2-20260730.md` |
| **completion_report** | Rebuilt HDSD HTML+PDF with **95** inlined screenshots (110 PNG bundle); fixed recursive asset loader; exit 0. Residual: 49 mobile/un captured FIG placeholders. |
| **evidence_path** | `docs/qa/evidence/hdsd-p2-html-rebuild-01-20260730.md` |
