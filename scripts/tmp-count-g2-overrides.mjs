import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const md = fs.readFileSync(path.join(root, 'docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md'), 'utf8');
const sectionA = md.split('## 2.A')[1]?.split('## 2.B')[0] ?? '';
const blockACodes = new Set();
for (const line of sectionA.split(/\n/)) {
  if (!/^\| \d+ \| `/.test(line)) continue;
  const code = line.split('|')[2]?.trim().replace(/`/g, '');
  if (code) blockACodes.add(code);
}
const raw = JSON.parse(fs.readFileSync(path.join(root, 'docs/ecosystem/phase1-impl-status.json'), 'utf8'));
let e2e = 0;
const gap = [];
for (const code of blockACodes) {
  const st = raw.overrides[code]?.impl_status;
  const matrixLine = [...sectionA.matchAll(new RegExp(`\\| \\d+ \\| \`${code}\`[^\\n]+`))][0]?.[0];
  const matrixSt = matrixLine?.split('|').map((c) => c.trim())[8];
  const effective = matrixSt ?? st ?? 'planned';
  if (effective === 'e2e_pass' || effective === 'waived') e2e++;
  else gap.push({ code, effective });
}
console.log('Block A codes:', blockACodes.size);
console.log('G2 override-style e2e_pass+waived:', e2e, '/ 104');
console.log('Gap sample:', gap.slice(0, 20).map((g) => `${g.code}(${g.effective})`).join(', '));
