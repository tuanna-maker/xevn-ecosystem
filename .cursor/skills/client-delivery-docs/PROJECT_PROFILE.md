# XeVN Ecosystem — client delivery profile

> Global skill: `C:\Users\ADMIN\.cursor\skills\client-delivery-brd-srs\SKILL.md`  
> Subagent: **`@ba-docs`**

```yaml
project_id: xevn-ecosystem
golden_reference: E-Office-Bateco/document_HDSD/02_Tai_lieu_nghiep_vu.md

brd:
  source_md: docs/ecosystem/BRD_TONG_HOP_HE_SINH_THAI_XEVN.md
  output_html: docs/client-delivery/01_BRD_XeVN_OS.html
  build: pnpm docs:brd:html

srs:
  uc_catalog: docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md
  uc_count: 373
  output_html: docs/client-delivery/02_SRS_XeVN_OS.html
  standards: docs/standards/BRD_SRS_WRITING_STANDARDS.md
  overrides_dir: docs/srs-overrides/
  override_template: docs/srs-overrides/_TEMPLATE_FR.md
  build: pnpm docs:srs:html
  audit: pnpm docs:srs:audit
  model: bateco-6chapters-fr-7sections

generators:
  srs_body: scripts/lib/srs-bateco-body.mjs
  srs_fr: scripts/lib/srs-fr-spec.mjs
  html_build: scripts/build-srs-xevn-html.mjs
  audit_script: scripts/audit-srs-uc-quality.mjs

project_kb: .cursor/knowledge-base/client-delivery-docs.md
```
