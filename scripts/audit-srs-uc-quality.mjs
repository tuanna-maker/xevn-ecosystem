/**
 * Audit SRS FR blocks — 373/373 phải có đủ 7 mục (Bateco, đồng nhất).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseUcRowsFromCatalog } from './lib/srs-uc-spec.mjs';
import { renderFrBlock, auditFrBlock } from './lib/srs-fr-spec.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UC_MD = path.join(ROOT, 'docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md');
const BACKLOG = path.join(ROOT, 'docs/client-delivery/SRS_UC_OVERRIDE_BACKLOG.md');

const LEGACY = [
  { id: 'no_req_srs', test: (b) => !/REQ-SRS-/.test(b), label: 'No REQ-SRS' },
  {
    id: 'no_12sec',
    test: (b) => !/\*\*Kiểm chứng:\*\*/.test(b) && !/\*\*Metadata \(Thông tin chung\)/.test(b),
    label: 'No legacy 12-section',
  },
];

function main() {
  const rows = parseUcRowsFromCatalog(fs.readFileSync(UC_MD, 'utf8'));
  let pass = 0;
  const failList = [];

  for (const uc of rows) {
    const block = renderFrBlock(uc);
    const fails = [...auditFrBlock(block), ...LEGACY.filter((c) => !c.test(block)).map((c) => c.id)];
    if (!fails.length) pass++;
    else failList.push({ code: uc.code, stt: uc.stt, fails });
  }

  const total = rows.length;
  console.log(`Audit (uniform FR 7 sections): ${pass}/${total} pass (${((pass / total) * 100).toFixed(1)}%)`);

  if (failList.length <= 25) {
    for (const f of failList) console.log(`  FAIL ${f.code} (STT ${f.stt}): ${f.fails.join(', ')}`);
  } else if (failList.length) {
    console.log('  First 15:', failList.slice(0, 15));
  }

  fs.writeFileSync(
    BACKLOG,
    `# SRS FR uniform sections backlog

Generated: ${new Date().toISOString()}

| Metric | Value |
|--------|-------|
| Pass | ${pass}/${total} |
| Required sections per FR | 7 (meta, input, main, rules, special, sequence, dien_bien) |
| Fail | ${failList.length} |

`,
    'utf8',
  );

  if (failList.length) process.exit(1);
}

main();
