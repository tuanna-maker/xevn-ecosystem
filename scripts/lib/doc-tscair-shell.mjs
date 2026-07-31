/**
 * Shared TSCAir HTML document shell helpers (XeVN cover brand P0).
 */
import fs from 'fs';

export const DEFAULT_TSCAIR_REF =
  process.env.TSCAIR_REF ||
  'c:/Users/ADMIN/Downloads/Telegram Desktop/TSCAir_BRD_TASMOS_v2.1 (2).html';

export const DEFAULT_SRS_REF =
  process.env.SRS_REF ||
  'c:/Users/ADMIN/Downloads/Telegram Desktop/Unicom_SRS_TASMOS_Phase1_v3.0 (4) (2).html';

/** Cover accent: product PRIMARY → portal cyan (XEVN_BRAND_UIUX_PROPOSAL §6 P0). */
export const XEVN_COVER_BRAND_STYLES = `
:root {
  --xevn-primary: #1E40AF;
  --xevn-secondary: #06B6D4;
  --cyan: #06B6D4;
}
.doc-page.cover .accent-bar,
.doc-page.cover .sep {
  background: linear-gradient(90deg, var(--xevn-primary), var(--xevn-secondary)) !important;
}
.doc-page.cover .project-title .eo {
  background: linear-gradient(135deg, var(--xevn-primary), var(--xevn-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.doc-page.cover h1,
.doc-page.cover .project-title {
  border-color: var(--xevn-primary);
}
`;

/**
 * Purge legacy UNICOM accent hex from TSCAir reference CSS so rebuild
 * never re-introduces #3d7de8 / #0ab4d8 as the document color axis.
 */
export function rewriteLegacyUnicomAccentCss(css) {
  return css
    .replace(/#3d7de8/gi, '#1E40AF')
    .replace(/#0ab4d8/gi, '#06B6D4');
}

export function extractTscairStyle(html) {
  const m = html.match(/<style>([\s\S]*?)<\/style>/);
  if (!m) throw new Error('TSCAir: no <style> block');
  return rewriteLegacyUnicomAccentCss(m[1]);
}

export function extractTscairTailJs(html, replacements = []) {
  const start = html.indexOf('const mdRaw');
  const end = html.lastIndexOf('</script>');
  if (start < 0 || end < 0) throw new Error('TSCAir: mdRaw script not found');
  let js = html
    .slice(start, end)
    .replace(
      /const mdRaw = document\.getElementById\('md-source'\)\.textContent;\s*/,
      '',
    );
  for (const [from, to] of replacements) {
    js = js.replace(from, to);
  }
  return js;
}

export function extractUcParts(md) {
  const lines = md.split(/\r?\n/);
  const i0 = lines.findIndex((l) => l.includes('## 4. Bảng use case gom toàn hệ'));
  if (i0 < 0) throw new Error('UC table section not found in BANG_TONG_HOP_USECASE_XEVN.md');
  const tableLines = [];
  for (let i = i0 + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('## ') && tableLines.length > 2) break;
    if (line.startsWith('|')) tableLines.push(line);
  }
  const header = tableLines.slice(0, 2).join('\n');
  const rows = tableLines.filter((l) => /^\| \d+ \|/.test(l));
  if (rows.length !== 373) {
    throw new Error(`Expected 373 UC rows, got ${rows.length}`);
  }
  const groups = { xbos: [], hrm: [], logistic: [] };
  for (const row of rows) {
    const code = row.split('|')[2]?.trim() || '';
    if (
      /^UC-XBOS|^XBOS-DM|^UC-XBOS-CAT|^UC-ECO|^UC-CC|^UC-RACI/i.test(code)
    ) {
      groups.xbos.push(row);
    } else if (/^LG-/i.test(code)) groups.logistic.push(row);
    else if (/^UC-HRM|^HRM-/i.test(code)) groups.hrm.push(row);
  }
  return { header, rows, groups, fullTable: tableLines.join('\n') };
}

export function ucTableBlock(title, header, rows) {
  if (!rows.length) return '';
  return `\n\n### ${title}\n\n| Chỉ tiêu | Giá trị |\n|----------|--------|\n| Số use case | **${rows.length}** |\n\n${header}\n${rows.join('\n')}\n`;
}

export function buildTocPage({ docCode, versionLine, footerPage }) {
  return `<div class="doc-page toc-page">
  <div class="inner-brd-header">
    <div class="inner-brd-code">Mã tài liệu: <span>${docCode}</span></div>
    <div class="inner-brd-right">${versionLine}</div>
  </div>
  <div class="inner-brd-divider"></div>
  <div class="content-area">
    <h1 class="toc-title">Mục lục</h1>
    <p class="toc-subtitle">Nhấn vào từng mục để di chuyển nhanh đến phần nội dung tương ứng.</p>
    <div id="toc-list" class="toc-list"></div>
  </div>
  <div class="inner-brd-footer">
    <div class="inner-brd-footer-l">XeVN Group</div>
    <div class="inner-brd-footer-r"><span class="ft-page">${footerPage}</span></div>
  </div>
</div>`;
}

export function buildContentTailJs({
  docCode,
  versionLine,
  footerPage,
}) {
  return `
const wrapper = document.createElement('div');
wrapper.className = 'doc-page';
wrapper.innerHTML = \`
  <div class="inner-brd-header">
    <div class="inner-brd-code">Mã tài liệu: <span>${docCode}</span></div>
    <div class="inner-brd-right">${versionLine}</div>
  </div>
  <div class="inner-brd-divider"></div>
  <div class="content-area">
    <div class="md-render"></div>
  </div>
  <div class="inner-brd-footer">
    <div class="inner-brd-footer-l">XeVN Group</div>
    <div class="inner-brd-footer-r"><span class="ft-page">${footerPage}</span></div>
  </div>
\`;
document.getElementById('content-host').appendChild(wrapper);

const renderRoot = wrapper.querySelector('.md-render');
const htmlContent = marked.parse(mdRaw);
renderRoot.innerHTML = htmlContent;

Object.entries(DIAGRAMS).forEach(([entryKey, fig]) => {
  const imgToken = '<p>[[IMG:' + entryKey + ']]</p>';
  const block =
    '<figure class="architecture-figure"><img src="' + fig.dataUrl + '" alt="' + fig.caption + '" loading="eager" />' +
    '<figcaption>' + fig.caption + '</figcaption></figure>';
  renderRoot.innerHTML = renderRoot.innerHTML.split(imgToken).join(block);
});

renderRoot.querySelectorAll('pre code.language-mermaid').forEach((codeEl) => {
  const pre = codeEl.parentElement;
  const div = document.createElement('div');
  div.className = 'mermaid';
  div.textContent = codeEl.textContent;
  pre.replaceWith(div);
});

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const seenIds = new Map();
const headings = Array.from(renderRoot.querySelectorAll('h2, h3'));
headings.forEach((heading, index) => {
  const base = slugify(heading.textContent) || 'section-' + (index + 1);
  const count = seenIds.get(base) || 0;
  seenIds.set(base, count + 1);
  heading.id = count ? base + '-' + (count + 1) : base;
});

const tocList = document.getElementById('toc-list');
if (tocList) {
  headings.forEach((heading, index) => {
    const link = document.createElement('a');
    link.className = 'toc-item level-' + (heading.tagName === 'H2' ? '2' : '3');
    link.href = '#' + heading.id;
    link.innerHTML =
      '<span class="toc-index">' + (index + 1) + '.</span><span class="toc-text">' + heading.textContent + '</span>';
    tocList.appendChild(link);
  });
}

(async function renderMermaidInBatches() {
  const nodes = Array.from(renderRoot.querySelectorAll('.mermaid'));
  const batchSize = 10;
  for (let i = 0; i < nodes.length; i += batchSize) {
    const chunk = nodes.slice(i, i + batchSize);
    try {
      await mermaid.run({ nodes: chunk });
    } catch (err) {
      console.warn('Mermaid batch ' + (i / batchSize + 1), err);
    }
  }
})();
`;
}

export function injectSubsystemUcTables(body, parts) {
  const { header, groups } = parts;
  const inject = (text, ch, nextCh, title, rows) => {
    const block = ucTableBlock(title, header, rows);
    if (!block) return text;
    const re = new RegExp(`(## ${ch}\\. [\\s\\S]*?)(?=\\n## ${nextCh}\\.)`);
    return text.replace(re, `$1${block}`);
  };
  let out = body;
  out = inject(out, 7, 8, '7.5 Bảng use case XBOS', groups.xbos);
  out = inject(out, 8, 9, '8.5 Bảng use case Nhân sự (HRM)', groups.hrm);
  out = inject(out, 9, 10, '9.5 Bảng use case Logistic', groups.logistic);
  return out;
}

export function buildTscairCover({
  logoB64,
  docCode,
  versionLine,
  docLabel,
  titleEo,
  titleBateco,
  subtitle,
  metaHtml,
  footerRight = '© 2026 — All Rights Reserved',
}) {
  return `<div class="doc-page cover">
  <div class="accent-bar"></div>
  <div class="header">
    <div class="header-code">Mã tài liệu: <span>${docCode}</span></div>
    <div class="header-right">${versionLine}</div>
  </div>
  <div class="divider"></div>
  <div class="main">
    <div class="logo-wrap">
      <img src="data:image/png;base64,${logoB64}" alt="XeVN"/>
    </div>
    <div class="sep"></div>
    <div class="doc-label">${docLabel}</div>
    <div class="project-title">
      <span class="eo">${titleEo}</span><span class="sep-dot">/</span><span class="bateco">${titleBateco}</span>
    </div>
    <div class="subtitle">${subtitle}</div>
    <div class="meta-info">${metaHtml}</div>
  </div>
  <div class="footer">
    <div class="footer-l">XeVN Group</div>
    <div class="footer-r">${footerRight}</div>
  </div>
</div>`;
}

export function buildTscairHtml({
  title,
  style,
  coverHtml,
  tocPageHtml = '',
  mdRaw,
  tailJs,
  diagrams = {},
}) {
  const mdEscaped = JSON.stringify(mdRaw);
  const diagramsEscaped = JSON.stringify(diagrams);
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${title}</title>
<style>${style}</style>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
</head>
<body>
${coverHtml}
${tocPageHtml}
<div id="content-host"></div>
<script>
mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' });
const mdRaw = ${mdEscaped};
const DIAGRAMS = ${diagramsEscaped};
${tailJs}
</script>
</body>
</html>`;
}

export function loadReferenceHtml(path) {
  if (!fs.existsSync(path)) {
    throw new Error(`Missing reference HTML: ${path}`);
  }
  return fs.readFileSync(path, 'utf8');
}

/**
 * Prefer external golden shell; if missing (CI / new machine), reuse style from
 * an existing client-delivery HTML so brand rebuilds stay unblocked.
 */
export function loadStyleSourceHtml(primaryPath, fallbackPath) {
  if (fs.existsSync(primaryPath)) {
    return { html: fs.readFileSync(primaryPath, 'utf8'), source: primaryPath };
  }
  if (fallbackPath && fs.existsSync(fallbackPath)) {
    console.warn(
      `[doc-tscair-shell] Missing primary style ref:\n  ${primaryPath}\n  → fallback: ${fallbackPath}`,
    );
    return { html: fs.readFileSync(fallbackPath, 'utf8'), source: fallbackPath };
  }
  throw new Error(
    `Missing style reference HTML.\n  primary: ${primaryPath}\n  fallback: ${fallbackPath || '(none)'}`,
  );
}
