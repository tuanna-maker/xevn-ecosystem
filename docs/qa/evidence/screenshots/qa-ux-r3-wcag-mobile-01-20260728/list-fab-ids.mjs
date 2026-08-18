import fs from 'node:fs';
const x = fs.readFileSync(
  'C:/xevn-ecosystem/docs/qa/evidence/screenshots/qa-ux-r3-wcag-mobile-01-20260728/f02-fab-sheet.xml',
  'utf8',
);
const ids = [...x.matchAll(/resource-id="([^"]+)"/g)].map((m) => m[1]);
console.log([...new Set(ids)].join('\n'));
const descs = [...x.matchAll(/content-desc="([^"]+)"/g)].map((m) => m[1]).filter(Boolean);
console.log('DESCS', descs);
