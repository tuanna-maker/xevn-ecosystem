#!/usr/bin/env node
/**
 * Export BRD markdown → PDF (images + Mermaid + full 373-row appendix).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docDir = path.resolve(__dirname, '../docs/ecosystem');
const cacheDir = path.join(__dirname, '.brd-pdf-cache');
const mdPath = path.join(docDir, 'BRD_TONG_HOP_HE_SINH_THAI_XEVN.md');
const cssPath = path.join(docDir, 'brd-pdf.css');
const htmlPath = path.join(docDir, 'BRD_TONG_HOP_HE_SINH_THAI_XEVN.html');
const outPdf = path.join(docDir, 'BRD_TONG_HOP_HE_SINH_THAI_XEVN.pdf');

function ensurePuppeteer() {
  const pkg = path.join(cacheDir, 'node_modules/puppeteer/package.json');
  if (fs.existsSync(pkg)) return;
  console.log('Installing puppeteer (one-time)...');
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(
    path.join(cacheDir, 'package.json'),
    JSON.stringify({ name: 'brd-pdf-cache', private: true, type: 'module' }),
  );
  const r = spawnSync('npm', ['install', 'puppeteer@23', '--no-fund', '--no-audit'], {
    cwd: cacheDir,
    stdio: 'inherit',
  });
  if (r.status !== 0) throw new Error('npm install puppeteer failed');
}

function preprocessMermaid(md) {
  return md.replace(/```mermaid\r?\n([\s\S]*?)```/g, (_, code) => {
    return `\n<div class="mermaid">\n${code.trim()}\n</div>\n`;
  });
}

function fixAssetUrls(html) {
  const assetsBase = `file://${docDir}/assets/`;
  return html
    .replace(/src="assets\//g, `src="${assetsBase}`)
    .replace(/href="assets\//g, `href="${assetsBase}`);
}

function runMarked(md) {
  const tmpMd = path.join(docDir, '.brd-export-tmp.md');
  const tmpHtml = path.join(docDir, '.brd-export-tmp.html');
  fs.writeFileSync(tmpMd, md, 'utf8');
  const r = spawnSync(
    'npx',
    ['--yes', 'marked', '-i', tmpMd, '-o', tmpHtml],
    { encoding: 'utf8', cwd: docDir },
  );
  fs.unlinkSync(tmpMd);
  if (r.status !== 0) throw new Error(r.stderr || r.stdout || 'marked failed');
  const html = fs.readFileSync(tmpHtml, 'utf8');
  fs.unlinkSync(tmpHtml);
  return html;
}

function buildHtml(body) {
  const css = fs.readFileSync(cssPath, 'utf8');
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<title>BRD Tổng hợp — Hệ sinh thái XeVN OS</title>
<style>
${css}
table.uc-table { font-size: 8pt; }
table.uc-table td, table.uc-table th { padding: 3px 5px; }
table.uc-table tr { page-break-inside: auto; }
.mermaid { margin: 1em 0; text-align: center; page-break-inside: avoid; }
.mermaid svg { max-width: 100%; height: auto; }
</style>
<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
</head>
<body>
${body}
<script>
  mermaid.initialize({
    startOnLoad: true,
    theme: 'neutral',
    securityLevel: 'loose',
    flowchart: { useMaxWidth: true },
    sequence: { useMaxWidth: true },
  });
</script>
</body>
</html>`;
}

async function main() {
  ensurePuppeteer();
  const puppeteerPath = path.join(
    cacheDir,
    'node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js',
  );
  const { default: puppeteer } = await import(pathToFileURL(puppeteerPath).href);

  const md = fs.readFileSync(mdPath, 'utf8');
  let body = runMarked(preprocessMermaid(md));
  body = fixAssetUrls(body);
  body = body.replace(
    /<h2>Phụ lục A\. Danh sách đầy đủ 373 tình huống sử dụng<\/h2>\s*<table>/,
    '<h2 id="phu-luc-a">Phụ lục A. Danh sách đầy đủ 373 tình huống sử dụng</h2>\n<table class="uc-table">',
  );

  fs.writeFileSync(htmlPath, buildHtml(body), 'utf8');
  console.log('HTML:', htmlPath);

  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'networkidle0',
      timeout: 120_000,
    });
    await page.waitForFunction(
      () => {
        const blocks = document.querySelectorAll('.mermaid');
        if (blocks.length === 0) return true;
        return [...blocks].every((el) => el.querySelector('svg'));
      },
      { timeout: 90_000 },
    );
    await page.pdf({
      path: outPdf,
      format: 'A4',
      printBackground: true,
      margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' },
    });
  } finally {
    await browser.close();
  }

  const kb = (fs.statSync(outPdf).size / 1024).toFixed(0);
  console.log(`OK: ${outPdf} (${kb} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
