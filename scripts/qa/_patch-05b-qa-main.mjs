import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const p = resolve(__dir, '_tmp-po-hrm-mvp-gd1-att-05b-cluster-qa-01.mjs');
const insert = readFileSync(resolve(__dir, '_05b-main-insert.txt'), 'utf8');
let s = readFileSync(p, 'utf8');
const start = s.indexOf('  // J-05-01 — allowsCarryOver');
const end = s.indexOf('  await browser.close();', start);
if (start < 0 || end < 0) {
  console.error('markers not found', start, end);
  process.exit(1);
}
s = s.slice(0, start) + insert + s.slice(end);
s = s.replace(
  "const mandatory = ['J-HRM-ATT-05-01', 'J-HRM-ATT-05-02', 'J-HRM-ATT-05-03', 'J-HRM-ATT-05-04'];",
  "const mandatory = ['J-HRM-ATT-05B-01', 'J-HRM-ATT-05B-02', 'J-HRM-ATT-05B-03', 'J-HRM-ATT-05B-04'];",
);
s = s.replace(
  "const holdOk = ['J-HRM-ATT-05-05', 'J-HRM-ATT-05-06'];",
  "const holdOk = ['J-HRM-ATT-05B-05', 'J-HRM-ATT-05B-06'];",
);
writeFileSync(p, s);
console.log('patched ok');
