#!/usr/bin/env node
/**
 * HDSD Phase 2 — merge Markdown → self-contained A4 HTML + PDF (MobiFone v9 / TSCAir style).
 * work_item_id: HDSD-P2-HTML-PDF-01
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { spawnSync } from 'child_process';
import {
  DEFAULT_TSCAIR_REF,
  XEVN_COVER_BRAND_STYLES,
  buildTscairCover,
  buildTscairHtml,
  buildTocPage,
  extractTscairStyle,
  loadStyleSourceHtml,
} from '../lib/doc-tscair-shell.mjs';
import { sanitizeDocMarkdown } from '../lib/doc-markdown-prep.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HDSD_DIR = path.join(ROOT, 'docs/client-delivery/hdsd');
const ASSETS_DIR = path.join(HDSD_DIR, 'assets');
const ARTIFACTS_DIR = path.join(HDSD_DIR, 'artifacts');
const LOGO = path.join(ROOT, 'docs/client-delivery/assets/xevn-logo.png');
const OUT_HTML = path.join(ARTIFACTS_DIR, 'HDSD_XEVN_ECOSYSTEM_v1.html');
const OUT_PDF = path.join(ARTIFACTS_DIR, 'HDSD_XEVN_ECOSYSTEM_v1.pdf');
const PDF_CACHE = path.join(path.dirname(fileURLToPath(import.meta.url)), '.hdsd-pdf-cache');
const FALLBACK_STYLE = path.join(ROOT, 'docs/client-delivery/01_BRD_XeVN_OS.html');

const DOC_CODE = 'XEVN/HDSD-ECO-001';
const VERSION_LINE = 'Phiên bản 1.0 · 30/07/2026 · Hướng dẫn sử dụng hệ sinh thái';
const FOOTER_PAGE = 'XeVN OS — HDSD Ecosystem v1.0';

const PART_MANIFEST = [
  {
    id: 'ecosystem',
    title: 'Phần I — Giới thiệu hệ sinh thái',
    files: [
      'HDSD_ECOSYSTEM_INDEX.md',
      'ecosystem/HDSD_ECOSYSTEM_CH01_CONG_VA_CHUYEN_PHAN_HE.md',
    ],
  },
  {
    id: 'xbos',
    title: 'Phần II — XBOS (Business Operating System)',
    files: [
      'xbos/HDSD_XBOS_INDEX.md',
      'xbos/HDSD_XBOS_CH01_COMMAND_CENTER.md',
      'xbos/HDSD_XEVN_CH03_XBOS_TO_CHUC.md',
      'xbos/HDSD_XEVN_CH04_XBOS_WF_CAT_KPI.md',
      'xbos/HDSD_XBOS_CH04_DASHBOARD_VAN_HANH.md',
    ],
  },
  {
    id: 'hrm',
    title: 'Phần III — HRM (Human Resource Management)',
    files: [
      'hrm/HDSD_HRM_INDEX.md',
      'hrm/HDSD_HRM_CH00_VAO_UNG_DUNG.md',
      'hrm/HDSD_XEVN_CH05_HRM_NHAN_SU.md',
      'hrm/HDSD_XEVN_CH06_HRM_HD_BH.md',
      'hrm/HDSD_XEVN_CH07_HRM_TUYEN_DUNG.md',
      'hrm/HDSD_XEVN_CH08_HRM_CHAM_CONG.md',
      'hrm/HDSD_XEVN_CH09_HRM_LUONG.md',
      'hrm/HDSD_XEVN_CH10_HRM_CO_QD_CV.md',
      'hrm/HDSD_XEVN_CH11_HRM_SETTINGS_REPORTS.md',
      'hrm/HDSD_XEVN_CH12_MOBILE_HRM.md',
    ],
  },
];

/** HDSD print + figure styles (MobiFone v9 / TSCAir A4). */
export const HDSD_PRINT_STYLES = `
@media print {
  @page { size: A4; margin: 0; }
  body { background: #fff; }
  .doc-page { margin: 0; box-shadow: none; page-break-after: always; }
  .md-render table,
  .md-render .hdsd-figure,
  .architecture-figure {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .md-render tr { break-inside: avoid; page-break-inside: avoid; }
  .part-divider { break-before: page; page-break-before: always; }
}
.part-divider {
  margin: 28px 0 18px;
  padding: 14px 16px;
  border: 2px solid var(--xevn-primary, #1E40AF);
  border-radius: 8px;
  background: linear-gradient(90deg, #eef4ff, #fff);
}
.part-divider h1 {
  font-size: 18px !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  background: none !important;
}
.hdsd-figure {
  margin: 14px 0 18px;
  break-inside: avoid;
  page-break-inside: avoid;
}
.hdsd-figure img {
  width: 100%;
  max-height: 420px;
  object-fit: contain;
  display: block;
  border: 1px solid #d9e4f2;
  border-radius: 6px;
  background: #fff;
}
.hdsd-figure figcaption {
  margin-top: 8px;
  font-size: 11px;
  line-height: 1.5;
  color: #52637d;
  text-align: center;
}
.hdsd-figure--placeholder .placeholder-box {
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  background: repeating-linear-gradient(
    -45deg,
    #f8fafc,
    #f8fafc 10px,
    #f1f5f9 10px,
    #f1f5f9 20px
  );
  color: #64748b;
  font-size: 11px;
  text-align: center;
  padding: 24px;
}
`;

function readPartFile(rel) {
  const full = path.join(HDSD_DIR, rel);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing HDSD source: ${rel}`);
  }
  return fs.readFileSync(full, 'utf8');
}

function preprocessFigureLines(md) {
  return md.replace(/^\[Hình[^\]]+\]\s*$/gm, (line) => {
    const caption = line.slice(1, -1).trim();
    return `\n[[FIG:${caption}]]\n`;
  });
}

function preprocessMarkdownImages(md, imageBundle) {
  return md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    const canonical = normalizeAssetSrc(src);
    if (imageBundle[canonical]) {
      return `[[IMG:${canonical}]]`;
    }
    const caption = alt || canonical;
    return `\n[[FIG:${caption} (ảnh chưa có: ${canonical})]]\n`;
  });
}

function normalizeAssetSrc(src) {
  let s = src.replace(/^\.\//, '').replace(/\\/g, '/');
  while (s.startsWith('../')) s = s.slice(3);
  if (s.startsWith('assets/')) s = s.slice('assets/'.length);
  return s;
}

function registerImageKey(bundle, key, entry) {
  if (!key) return;
  bundle[key] = entry;
}

function loadHdsdImageBundle() {
  const bundle = {};
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
    return bundle;
  }

  /** @param {string} dir @param {string} relPrefix */
  function walk(dir, relPrefix = '') {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, rel);
        continue;
      }
      if (!/\.(png|jpe?g|webp|gif)$/i.test(entry.name)) continue;
      const ext = path.extname(entry.name).slice(1).toLowerCase();
      const mime = ext === 'jpg' ? 'jpeg' : ext;
      const entryData = {
        dataUrl: `data:image/${mime};base64,${fs.readFileSync(full).toString('base64')}`,
        caption: entry.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      };
      registerImageKey(bundle, rel, entryData);
    }
  }

  walk(ASSETS_DIR);
  return bundle;
}

function mergeManifestMarkdown() {
  const chunks = [];
  for (const part of PART_MANIFEST) {
    chunks.push(`\n\n[[PART-BREAK:${part.title}]]\n\n`);
    for (const rel of part.files) {
      let body = readPartFile(rel);
      body = body.replace(/^# [^\n]+\n/, '');
      chunks.push(`\n\n<!-- source: ${rel} -->\n\n${body.trim()}\n`);
    }
  }
  let md = chunks.join('\n');
  md = sanitizeDocMarkdown(md);
  md = preprocessFigureLines(md);
  const images = loadHdsdImageBundle();
  md = preprocessMarkdownImages(md, images);
  return { md, images };
}

function buildHdsdTailJs({ docCode, versionLine, footerPage }) {
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
let htmlContent = marked.parse(mdRaw);
renderRoot.innerHTML = htmlContent;

Object.entries(DIAGRAMS).forEach(([key, fig]) => {
  const token = '<p>[[IMG:' + key + ']]</p>';
  const altToken = '[[IMG:' + key + ']]';
  const block =
    '<figure class="hdsd-figure"><img src="' + fig.dataUrl + '" alt="' + fig.caption + '" />' +
    '<figcaption>' + fig.caption + '</figcaption></figure>';
  renderRoot.innerHTML = renderRoot.innerHTML.split(token).join(block);
  renderRoot.innerHTML = renderRoot.innerHTML.split(altToken).join(block);
});

renderRoot.innerHTML = renderRoot.innerHTML.replace(
  /<p>\\[\\[FIG:([^\\]]+)\\]\\]<\\/p>/g,
  (_, caption) =>
    '<figure class="hdsd-figure hdsd-figure--placeholder">' +
    '<div class="placeholder-box">Ảnh minh họa — Phase 2<br><small>' + caption + '</small></div>' +
    '<figcaption>' + caption + '</figcaption></figure>',
);

renderRoot.innerHTML = renderRoot.innerHTML.replace(
  /<p>\\[\\[PART-BREAK:([^\\]]+)\\]\\]<\\/p>/g,
  (_, title) => '<div class="part-divider"><h1>' + title + '</h1></div>',
);

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
  const batchSize = 8;
  for (let i = 0; i < nodes.length; i += batchSize) {
    const chunk = nodes.slice(i, i + batchSize);
    try {
      await mermaid.run({ nodes: chunk });
    } catch (err) {
      console.warn('Mermaid batch', i / batchSize + 1, err);
    }
  }
})();
`;
}

function resolveChromeExecutable() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function ensurePuppeteer() {
  const pkg = path.join(PDF_CACHE, 'node_modules/puppeteer/package.json');
  if (!fs.existsSync(pkg)) {
    console.log('Installing puppeteer for HDSD PDF (one-time)...');
    fs.mkdirSync(PDF_CACHE, { recursive: true });
    fs.writeFileSync(
      path.join(PDF_CACHE, 'package.json'),
      JSON.stringify({ name: 'hdsd-pdf-cache', private: true, type: 'module' }),
    );
    const r = spawnSync('npm', ['install', 'puppeteer@23', '--no-fund', '--no-audit'], {
      cwd: PDF_CACHE,
      stdio: 'inherit',
      shell: true,
    });
    if (r.status !== 0) throw new Error('npm install puppeteer failed');
  }
  const chrome = resolveChromeExecutable();
  if (!chrome) {
    console.log('System Chrome not found — installing Puppeteer bundled browser...');
    const r = spawnSync('npx', ['puppeteer', 'browsers', 'install', 'chrome'], {
      cwd: PDF_CACHE,
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, PUPPETEER_CACHE_DIR: path.join(PDF_CACHE, 'browser-cache') },
    });
    if (r.status !== 0) throw new Error('puppeteer browsers install chrome failed');
  }
  return resolveChromeExecutable();
}

async function exportPdf(htmlPath, pdfPath) {
  try {
    const { chromium } = await import('playwright');
    console.log('PDF engine: playwright');
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto(pathToFileURL(htmlPath).href, {
        waitUntil: 'domcontentloaded',
        timeout: 300_000,
      });
      await page.waitForFunction(
        () => {
          const blocks = document.querySelectorAll('.mermaid');
          if (blocks.length === 0) return true;
          return [...blocks].every((el) => el.querySelector('svg'));
        },
        { timeout: 180_000 },
      );
      await page.emulateMedia({ media: 'print' });
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '12mm', bottom: '14mm', left: '0', right: '0' },
        preferCSSPageSize: true,
      });
    } finally {
      await browser.close();
    }
    return;
  } catch (playwrightErr) {
    console.warn('Playwright PDF failed, fallback puppeteer:', playwrightErr.message);
  }

  const chromePath = ensurePuppeteer();
  const puppeteerPath = path.join(
    PDF_CACHE,
    'node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js',
  );
  const { default: puppeteer } = await import(pathToFileURL(puppeteerPath).href);
  const launchOpts = {
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  };
  if (chromePath) {
    launchOpts.executablePath = chromePath;
    console.log('PDF Chrome:', chromePath);
  }
  const browser = await puppeteer.launch(launchOpts);
  try {
    const page = await browser.newPage();
    const fileUrl = pathToFileURL(htmlPath).href;
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: 300_000 });
    await page.waitForFunction(
      () => {
        const blocks = document.querySelectorAll('.mermaid');
        if (blocks.length === 0) return true;
        return [...blocks].every((el) => el.querySelector('svg'));
      },
      { timeout: 180_000 },
    );
    await page.emulateMediaType('print');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', bottom: '14mm', left: '0', right: '0' },
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }
}

function buildHtml({ mdRaw, diagrams, style }) {
  const fullStyle = style + XEVN_COVER_BRAND_STYLES + HDSD_PRINT_STYLES;
  const logoB64 = fs.readFileSync(LOGO).toString('base64');
  return buildTscairHtml({
    title: 'HDSD — Hệ sinh thái XeVN OS | XeVN',
    style: fullStyle,
    coverHtml: buildTscairCover({
      logoB64,
      docCode: DOC_CODE,
      versionLine: VERSION_LINE,
      docLabel: 'Hướng dẫn sử dụng (HDSD)',
      titleEo: 'XeVN',
      titleBateco: 'ECOSYSTEM OS',
      subtitle: 'Cổng Web · XBOS · HRM · Mobile — Hướng dẫn vận hành',
      metaHtml: `<strong>Khách hàng:</strong> Tập đoàn XeVN Group<br>
      <strong>Phạm vi:</strong> Ba bộ tài liệu — Hệ sinh thái · XBOS · HRM`,
    }),
    tocPageHtml: buildTocPage({
      docCode: DOC_CODE,
      versionLine: VERSION_LINE,
      footerPage: FOOTER_PAGE,
    }),
    mdRaw,
    diagrams,
    tailJs: buildHdsdTailJs({
      docCode: DOC_CODE,
      versionLine: VERSION_LINE,
      footerPage: FOOTER_PAGE,
    }),
  });
}

function validateHtml(html, stats) {
  const imgTokenCount = (html.match(/\[\[IMG:[^\]]+\]\]/g) || []).length;
  const checks = {
    cover: html.includes('doc-page cover'),
    toc: html.includes('toc-page'),
    partBreak: html.includes('[[PART-BREAK:') || html.includes('part-divider'),
    marked: html.includes('marked.parse'),
    mermaid: html.includes('mermaid.run'),
    docCode: html.includes(DOC_CODE),
    sources: stats.fileCount >= 15,
    inlineImages: imgTokenCount >= 90 && stats.imageCount >= 90,
  };
  const ok = Object.values(checks).every(Boolean);
  return { ok, checks, imgTokenCount };
}

async function main() {
  const htmlOnly = process.argv.includes('--html-only');
  if (!fs.existsSync(LOGO)) {
    throw new Error(`Missing logo: ${LOGO}`);
  }
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  const { md, images } = mergeManifestMarkdown();
  const fileCount = PART_MANIFEST.reduce((n, p) => n + p.files.length, 0);

  const { html: tscRef } = loadStyleSourceHtml(DEFAULT_TSCAIR_REF, FALLBACK_STYLE);
  const style = extractTscairStyle(tscRef);
  const html = buildHtml({ mdRaw: md, diagrams: images, style });

  fs.writeFileSync(OUT_HTML, html, 'utf8');
  const htmlKb = (fs.statSync(OUT_HTML).size / 1024).toFixed(1);
  const { ok, checks, imgTokenCount } = validateHtml(html, { fileCount, imageCount: Object.keys(images).length });
  console.log(`Wrote ${OUT_HTML} (${htmlKb} KB) files=${fileCount} images=${Object.keys(images).length} imgTokens=${imgTokenCount} ok=${ok}`);
  console.log('checks:', JSON.stringify(checks));
  if (!ok) process.exit(1);

  if (htmlOnly) {
    console.log('Skipping PDF (--html-only)');
    return;
  }

  await exportPdf(OUT_HTML, OUT_PDF);
  const pdfKb = (fs.statSync(OUT_PDF).size / 1024).toFixed(0);
  console.log(`Wrote ${OUT_PDF} (${pdfKb} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
