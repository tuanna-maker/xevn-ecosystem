/**
 * Build docs/client-delivery/01_BRD_XeVN_OS.html
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  DEFAULT_TSCAIR_REF,
  buildTscairCover,
  buildTscairHtml,
  buildContentTailJs,
  buildTocPage,
  extractTscairStyle,
  extractUcParts,
  injectSubsystemUcTables,
  loadReferenceHtml,
} from './lib/doc-tscair-shell.mjs';
import {
  embedImagePlaceholders,
  enrichBrdMarkdown,
  loadDiagramBundle,
  sanitizeDocMarkdown,
} from './lib/doc-markdown-prep.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs/client-delivery/01_BRD_XeVN_OS.html');
const LOGO = path.join(ROOT, 'docs/client-delivery/assets/logo-unicom.png');
const ASSETS = path.join(ROOT, 'docs/ecosystem/assets');
const UC_MD = path.join(ROOT, 'docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md');
const BRD_MD = path.join(ROOT, 'docs/ecosystem/BRD_TONG_HOP_HE_SINH_THAI_XEVN.md');

const DOC_CODE = 'UNICOM/BRD-XEVN-OS-001';
const VERSION_LINE =
  'Phiên bản 1.1 &nbsp;·&nbsp; Tháng 6/2026 &nbsp;·&nbsp; Giai đoạn 1 UAT';
const FOOTER_PAGE = 'XeVN ECOSYSTEM OS — BRD v1.1';

function stripAppendixFromBrd(md) {
  const idx = md.indexOf('\n## Phụ lục A.');
  return idx > 0 ? md.slice(0, idx).trim() : md;
}

function buildBodyMarkdown() {
  const ucParts = extractUcParts(fs.readFileSync(UC_MD, 'utf8'));
  let body = stripAppendixFromBrd(fs.readFileSync(BRD_MD, 'utf8'));

  body = body.replace(
    /\n## 5\. Lộ trình triển khai theo giai đoạn[\s\S]*?(?=\n## 6\.)/,
    `\n## 5. Phân chia phạm vi theo giai đoạn

[[IMG:phase-roadmap]]

| | Giai đoạn 1 | Giai đoạn 2 |
|---|-------------|-------------|
| **Mục tiêu** | XBOS + Nhân sự vận hành; khai đủ danh mục Logistic | Logistic Web + ứng dụng lái xe |
| **Trong phạm vi** | 245 chức năng · 183 danh mục | 128 chức năng nghiệp vụ Logistic |
| **Ngoài phạm vi GĐ1** | Đơn, chuyến, app lái xe | — |

### 5.1 Ma trận tổng hợp use case

| Phân hệ | Số use case | Ghi chú |
|---------|------------:|---------|
| **XBOS** | ${ucParts.groups.xbos.length} | Nền tảng, Command Center, RACI, phạm vi |
| **HRM** | ${ucParts.groups.hrm.length} | Web, API, Mobile |
| **Logistic** | ${ucParts.groups.logistic.length} | Web, Mobile lái xe |
| **Tổng** | **${ucParts.rows.length}** | Phụ lục A; mục 7.5, 8.5, 9.5 |

`,
  );

  body = body.replace(/^# BRD Tổng hợp[^\n]*\n/, '# BRD — XeVN Ecosystem OS\n');
  body = body.replace(
    /\*\*Tài liệu liên quan[\s\S]*?\*\*/,
    '**Tài liệu liên quan:** Mô tả hệ sinh thái XeVN · BRD Tổng hợp — Hệ sinh thái XeVN OS · BRD — Quy tắc định danh và phạm vi dữ liệu toàn hệ · Bảng tổng hợp use case hệ sinh thái XeVN · SRS — Định danh và phạm vi toàn hệ · SRS — Ứng dụng HRM Mobile.',
  );

  body = injectSubsystemUcTables(body, ucParts);
  body = sanitizeDocMarkdown(body);
  body = embedImagePlaceholders(body);
  body = enrichBrdMarkdown(body);

  return `${body}

---

## Phụ lục A — Danh sách tình huống sử dụng

${ucParts.fullTable}
`;
}

function main() {
  const tscRef = loadReferenceHtml(DEFAULT_TSCAIR_REF);
  const style = extractTscairStyle(tscRef);
  const diagrams = loadDiagramBundle(ASSETS);
  const logoB64 = fs.readFileSync(LOGO).toString('base64');
  const mdRaw = buildBodyMarkdown();

  const html = buildTscairHtml({
    title: 'BRD — XeVN Ecosystem OS | UNICOM',
    style,
    coverHtml: buildTscairCover({
      logoB64,
      docCode: DOC_CODE,
      versionLine: VERSION_LINE,
      docLabel: 'Business Requirements Document (BRD)',
      titleEo: 'XeVN',
      titleBateco: 'ECOSYSTEM OS',
      subtitle:
        'Nền tảng đa công ty — Cổng Web · XBOS · HRM · HRM Mobile · Logistic',
      metaHtml: `<strong>Khách hàng:</strong> Tập đoàn XeVN Group<br>
      <strong>Đơn vị phát triển:</strong> Unicom Technology Solutions Co., Ltd`,
    }),
    tocPageHtml: buildTocPage({ docCode: DOC_CODE, versionLine: VERSION_LINE, footerPage: FOOTER_PAGE }),
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
    html.includes('toc-page') &&
    html.includes('"four-layer"') &&
    html.includes('architecture-figure') &&
    html.includes('mermaid.run') &&
    !html.includes('hero-title');
  console.log(`Wrote ${OUT} (${kb} KB) diagrams=${Object.keys(diagrams).length} ok=${ok}`);
  if (!ok) process.exit(1);
}

main();
