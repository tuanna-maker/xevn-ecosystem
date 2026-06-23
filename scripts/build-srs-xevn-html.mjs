/**
 * Build docs/client-delivery/02_SRS_XeVN_OS.html
 * Structure: Bateco E-Office SRS (6 chapters, FR-{Mã UC} × 373)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  DEFAULT_SRS_REF,
  buildTscairCover,
  buildTscairHtml,
  buildContentTailJs,
  buildTocPage,
  extractTscairStyle,
  loadReferenceHtml,
} from './lib/doc-tscair-shell.mjs';
import {
  loadDiagramBundle,
  sanitizeDocMarkdown,
} from './lib/doc-markdown-prep.mjs';
import { parseUcRowsFromCatalog } from './lib/srs-uc-spec.mjs';
import { buildBatecoSrsMarkdown } from './lib/srs-bateco-body.mjs';
import { SRS_DELIVERY_STYLES } from './lib/srs-delivery-styles.mjs';
import { applySrsVietnameseProse } from './lib/brd-vietnamese-prose.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs/client-delivery/02_SRS_XeVN_OS.html');
const LOGO = path.join(ROOT, 'docs/client-delivery/assets/logo-unicom.png');
const ASSETS = path.join(ROOT, 'docs/ecosystem/assets');
const UC_MD = path.join(ROOT, 'docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md');
const BRD_MD = path.join(ROOT, 'docs/ecosystem/BRD_TONG_HOP_HE_SINH_THAI_XEVN.md');

const DOC_CODE = 'UNICOM/SRS-XEVN-OS-001';
const VERSION_LINE = 'Phiên bản 2.2 &nbsp;·&nbsp; Tháng 6/2026 &nbsp;·&nbsp; Giai đoạn 1 UAT';
const FOOTER_PAGE = 'XeVN ECOSYSTEM OS — SRS';

function buildBodyMarkdown() {
  const ucRows = parseUcRowsFromCatalog(fs.readFileSync(UC_MD, 'utf8'));
  const brd = fs.readFileSync(BRD_MD, 'utf8');
  let md = buildBatecoSrsMarkdown({ brd, ucRows });
  md = sanitizeDocMarkdown(md);
  md = applySrsVietnameseProse(md);
  return md;
}

function main() {
  const ref = loadReferenceHtml(DEFAULT_SRS_REF);
  const style = extractTscairStyle(ref) + SRS_DELIVERY_STYLES;
  const diagrams = loadDiagramBundle(ASSETS);
  const logoB64 = fs.readFileSync(LOGO).toString('base64');
  const mdRaw = buildBodyMarkdown();
  const frCount = (mdRaw.match(/^#### FR-/gm) || []).length;

  const html = buildTscairHtml({
    title: 'SRS — XeVN Ecosystem OS | UNICOM',
    style,
    coverHtml: buildTscairCover({
      logoB64,
      docCode: DOC_CODE,
      versionLine: VERSION_LINE,
      docLabel: 'Software Requirements Specification (SRS)',
      titleEo: 'XeVN',
      titleBateco: 'ECOSYSTEM OS',
      subtitle: 'Yêu cầu phần mềm — Hệ sinh thái đa phân hệ',
      metaHtml: `<strong>Khách hàng:</strong> Tập đoàn XeVN Group<br>
      <strong>Đơn vị phát triển:</strong> Unicom Technology Solutions Co., Ltd`,
    }),
    tocPageHtml: buildTocPage({
      docCode: DOC_CODE,
      versionLine: VERSION_LINE,
      footerPage: FOOTER_PAGE,
    }),
    mdRaw,
    diagrams,
    tailJs: buildContentTailJs({
      docCode: DOC_CODE,
      versionLine: VERSION_LINE,
      footerPage: FOOTER_PAGE,
    }),
  });

  fs.writeFileSync(OUT, html, 'utf8');
  const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
  const ok =
    html.includes('doc-page cover') &&
    html.includes('## 1. Giới thiệu tài liệu') &&
    html.includes('## 2. Mô tả tổng quan hệ thống') &&
    html.includes('## 3. Yêu cầu chức năng') &&
    html.includes('## 4. Yêu cầu phi chức năng') &&
    html.includes('## 5. Yêu cầu giao diện ngoài') &&
    html.includes('## 6. Ràng buộc nghiệp vụ tổng quát') &&
    !html.includes('CHI TIẾT USE CASE') &&
    !html.includes('## 0. THÔNG TIN TÀI LIỆU') &&
    !html.includes('REQ-SRS-') &&
    html.includes('Phiên bản 2.2') &&
    html.includes('**Diễn biến nghiệp vụ (theo sơ đồ):**') &&
    frCount === 373;
  console.log(`Wrote ${OUT} (${kb} KB) fr_blocks=${frCount} ok=${ok}`);
  if (!ok) process.exit(1);
}

main();
