import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const htmlPath = path.join(root, 'docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const m = html.match(/const mdRaw = "([\s\S]*?)";\s*\nconst DIAGRAMS/);
if (!m) {
  console.error('mdRaw not found');
  process.exit(1);
}
const raw = m[1]
  .replace(/\\n/g, '\n')
  .replace(/\\"/g, '"')
  .replace(/\\\\/g, '\\');

const banned = 'placeholder Phase 2';
const sections = [
  {
    id: 'CH10',
    src: '<!-- source: hrm/HDSD_XEVN_CH10_HRM_CO_QD_CV.md -->',
    expectImg: 6,
    mdPath: 'docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH10_HRM_CO_QD_CV.md',
  },
  {
    id: 'CH11',
    src: '<!-- source: hrm/HDSD_XEVN_CH11_HRM_SETTINGS_REPORTS.md -->',
    expectImg: 5,
    mdPath: 'docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH11_HRM_SETTINGS_REPORTS.md',
  },
  {
    id: 'CH12',
    src: '<!-- source: hrm/HDSD_XEVN_CH12_MOBILE_HRM.md -->',
    expectImg: 8,
    mdPath: 'docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH12_MOBILE_HRM.md',
  },
  {
    id: 'INDEX',
    src: '<!-- source: HDSD_ECOSYSTEM_INDEX.md -->',
    expectImg: 0,
    mdPath: 'docs/client-delivery/hdsd/HDSD_ECOSYSTEM_INDEX.md',
  },
];

const result = {
  generatedAt: new Date().toISOString(),
  work_item_id: 'QA-HDSD-P2-SCRUB-QA-01',
  htmlPath,
  bannedPhrase: {
    mdRawCount: (raw.match(new RegExp(banned, 'g')) || []).length,
    htmlFileCount: (html.match(new RegExp(banned, 'g')) || []).length,
  },
  sections: [],
};

for (const s of sections) {
  const idx = raw.indexOf(s.src);
  const nextPart = raw.indexOf('[[PART-BREAK:', idx + 1);
  const chunk = idx >= 0 ? raw.slice(idx, nextPart > idx ? nextPart : idx + 50000) : '';
  const lineStartHinh = (chunk.match(/^\[Hình/gm) || []).length;
  const bracketHinh = (chunk.match(/\[Hình[^\]]*\]/g) || []).length;
  const inlineImages = (chunk.match(/!\[[^\]]+\]\([^)]+\)/g) || []).length;
  const imgTokens = (chunk.match(/\[\[IMG:[^\]]+\]\]/g) || []).length;
  const figTokens = (chunk.match(/\[\[FIG:[^\]]+\]\]/g) || []).length;
  const duplicateHinhWithPlaceholder =
    (chunk.match(/\[Hình[^\]]*placeholder/gi) || []).length;

  const imgTokenList = chunk.match(/\[\[IMG:([^\]]+)\]\]/g) || [];
  const imgKeys = imgTokenList.map((t) => t.replace('[[IMG:', '').replace(']]', ''));

  const mdText = fs.readFileSync(path.join(root, s.mdPath), 'utf8');
  const mdAlts = [...mdText.matchAll(/!\[([^\]]+)\]\(([^)]+)\)/g)].map((m) => ({
    alt: m[1],
    src: m[2],
    viAlt: /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(m[1]),
  }));
  const mdLineHinh = (mdText.match(/^\[Hình[^\]]+\]\s*$/gm) || []).length;
  const mdPlaceholderHinh = (mdText.match(/placeholder Phase 2/gi) || []).length;

  const sectionResult = {
    id: s.id,
    found: idx >= 0,
    imgTokens: imgTokenList.length,
    imgKeys: imgKeys.filter((k) => k.includes('hrm-1')),
    expectImg: s.expectImg,
    mdInlineImages: mdAlts.length,
    mdViAltOk: mdAlts.every((a) => a.viAlt),
    mdSampleAlts: mdAlts.slice(0, 3).map((a) => a.alt),
    lineStartHinh,
    mdLineHinh,
    mdPlaceholderHinh,
    duplicateHinhWithPlaceholder,
    indexTemplateOk: s.id === 'INDEX' ? mdText.includes('[Hình XX.Y — mô tả ngắn minh họa màn hình]') : null,
    pass:
      idx >= 0 &&
      mdPlaceholderHinh === 0 &&
      duplicateHinhWithPlaceholder === 0 &&
      lineStartHinh === 0 &&
      mdLineHinh === 0 &&
      (s.expectImg === 0 || (imgTokenList.length >= s.expectImg && mdAlts.length >= s.expectImg)) &&
      (s.expectImg === 0 || mdAlts.every((a) => a.viAlt)),
  };
  result.sections.push(sectionResult);
}

// MD grep across client-delivery/hdsd
function walkMd(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkMd(p));
    else if (ent.name.endsWith('.md')) out.push(p);
  }
  return out;
}
const mdRoot = path.join(root, 'docs/client-delivery/hdsd');
const mdFiles = walkMd(mdRoot);
const mdBanned = mdFiles.filter((f) => fs.readFileSync(f, 'utf8').includes(banned));
// DIAGRAMS caption spot-check (rendered figcaption source)
const diagM = html.match(/const DIAGRAMS = (\{[\s\S]*?\});\s*\n/);
let diagramCaptions = {};
if (diagM) {
  try {
    diagramCaptions = JSON.parse(diagM[1].replace(/,\s*}/g, '}'));
  } catch {
    /* large base64 — parse keys only */
    const keys = [...html.matchAll(/"(hrm\/hrm-1[012]-\d+\.png)"/g)].map((x) => x[1]);
    diagramCaptions = Object.fromEntries(keys.map((k) => [k, k]));
  }
}
const hrmFigKeys = Object.keys(diagramCaptions).filter((k) => /hrm\/hrm-1[012]-/.test(k));
result.diagramCaptionSample = hrmFigKeys.slice(0, 6).map((k) => ({
  key: k,
  caption: typeof diagramCaptions[k] === 'object' ? diagramCaptions[k]?.caption : diagramCaptions[k],
}));
result.mdBannedFiles = mdBanned.map((f) => path.relative(root, f));
result.overallPass =
  result.bannedPhrase.mdRawCount === 0 &&
  result.bannedPhrase.htmlFileCount === 0 &&
  result.mdBannedFiles.length === 0 &&
  result.sections.every((s) => s.pass);

const outPath = path.join(root, 'docs/qa/evidence/_tmp-qa-hdsd-p2-scrub-verify.json');
fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
