#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const mdPath = path.join(root, 'docs/ecosystem/BRD_TONG_HOP_HE_SINH_THAI_XEVN.md');
const htmlPath = path.join(root, 'docs/client-delivery/01_BRD_XeVN_OS.html');

const md = fs.readFileSync(mdPath, 'utf8');
const html = fs.readFileSync(htmlPath, 'utf8');

const mdIssues = [];
const mdLines = md.split(/\r?\n/);
for (let i = 0; i < mdLines.length; i++) {
  const hm = mdLines[i].match(/^(#{2,4})\s+(.+)$/);
  if (!hm) continue;
  let j = i + 1;
  const content = [];
  while (j < mdLines.length && !/^#{1,4}\s/.test(mdLines[j])) {
    const l = mdLines[j].trim();
    if (l && l !== '---') content.push(l);
    j++;
  }
  const block = content.join('\n');
  const hasTable = /\|/.test(block) && content.some((l) => l.includes('|'));
  const hasCode = /```/.test(block);
  const hasImg = /!\[|\[\[IMG:/.test(block);
  const hasMermaid = /```mermaid/.test(block);
  const plain = block
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[\[IMG:[^\]]+\]\]/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[|`*#>\-\[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length < 25 && !hasTable && !hasCode && !hasImg && !hasMermaid) {
    mdIssues.push({
      level: hm[1].length,
      title: hm[2],
      chars: plain.length,
      preview: plain || '(trống)',
    });
  }
}

const imgPlace = md.match(/\[\[IMG:[^\]]+\]\]/g) || [];
const mdH2 = (md.match(/^## /gm) || []).length;
const mdH3 = (md.match(/^### /gm) || []).length;

// HTML: pages with md-render content
const pages = html.split(/<div class="doc-page/);
const htmlThin = [];
for (const page of pages) {
  const hMatch = page.match(/<h([2-4])>([^<]+)<\/h\1>/);
  if (!hMatch) continue;
  const title = hMatch[2].replace(/&amp;/g, '&').trim();
  const area = page.match(/class="md-render"[^>]*>([\s\S]*?)<\/div>/);
  if (!area) continue;
  const body = area[1]
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const hasTable = /<table/i.test(area[1]);
  const hasImg = /<img/i.test(area[1]);
  const hasPre = /<pre/i.test(area[1]);
  if (body.length < 35 && !hasTable && !hasImg && !hasPre) {
    htmlThin.push({ title, chars: body.length, preview: body.slice(0, 60) });
  }
}

// Check 9.3 missing (jump from 9.2 to LUONG 5 / 9.4)
const h3Titles = mdLines.filter((l) => /^### /.test(l)).map((l) => l.replace(/^### /, ''));

console.log('BRD markdown:', mdPath);
console.log('Sections: ##', mdH2, '###', mdH3);
console.log('Unresolved [[IMG:]]:', imgPlace.length, imgPlace);
console.log('\n--- MD sections very thin (<25 chars text) ---');
for (const x of mdIssues) {
  console.log(`H${x.level} | ${x.title} | ${x.chars} chars | ${x.preview}`);
}
console.log('Total thin MD:', mdIssues.length);

console.log('\n--- HTML pages thin ---');
for (const x of htmlThin.slice(0, 30)) {
  console.log(`${x.title} | ${x.chars} | ${x.preview}`);
}
console.log('Total thin HTML pages (sample):', htmlThin.length);

console.log('\n--- Numbering gaps (### under ch 9) ---');
const ch9 = h3Titles.filter((t) => t.startsWith('9.') || t.includes('LUỒNG 5') || t.includes('Logistic'));
console.log(ch9.join('\n'));

const requiredMissing = ['5.1', '7.5', '8.5', '9.5'].filter(
  (id) => !md.includes(id) && !h3Titles.some((t) => t.startsWith(id)),
);
console.log('\n--- Required by BRD_SRS_WRITING_STANDARDS but absent ---');
console.log(requiredMissing.join(', ') || '(none)');

const appendixStart = md.indexOf('## Phụ lục A');
const appendixBlock = appendixStart >= 0 ? md.slice(appendixStart) : '';
const ucRows = (appendixBlock.match(/^\| \d+ \|/gm) || []).length;
console.log('\nPhụ lục A UC rows:', ucRows, ucRows === 373 ? 'OK' : 'EXPECTED 373');

const shortSections = [];
for (let i = 0; i < mdLines.length; i++) {
  const hm = mdLines[i].match(/^### (.+)$/);
  if (!hm) continue;
  let j = i + 1;
  const content = [];
  while (j < mdLines.length && !/^#{2,4}\s/.test(mdLines[j])) {
    const l = mdLines[j].trim();
    if (l && l !== '---') content.push(l);
    j++;
  }
  const block = content.join('\n');
  const plain = block
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/[|`*#>\-\[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const hasTable = content.filter((l) => l.startsWith('|')).length > 2;
  const hasMermaid = block.includes('```mermaid');
  if (plain.length < 120 && !hasTable && !hasMermaid) {
    shortSections.push({ title: hm[1], chars: plain.length, preview: plain.slice(0, 100) });
  }
}
console.log('\n--- ### sections short (<120 chars, no table/mermaid) ---');
for (const s of shortSections) console.log(`- ${s.title} (${s.chars}): ${s.preview}`);
console.log('count:', shortSections.length);
