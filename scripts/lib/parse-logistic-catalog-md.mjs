/**
 * Parse 111 logistic catalog/workflow definitions from DANH_MUC markdown §2.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function parseLogisticCatalogDefs() {
  const mdPath = path.join(root, 'docs/logistics/DANH_MUC_XBOS_VA_USECASE_LOGISTIC.md');
  const md = fs.readFileSync(mdPath, 'utf8');
  const section2 = md.split('## 3.')[0].split('## 2.')[1] ?? md;
  const defs = [];
  const seen = new Set();
  for (const line of section2.split(/\n/)) {
    let sttRaw;
    let name;
    let level = '';
    const four = line.match(/^\|\s*(\d+[a-z]?)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\s*\|/);
    const three = line.match(/^\|\s*(\d+[a-z]?)\s*\|\s*([^|]+)\|\s*([^|]*)\s*\|/);
    const twoWf = line.match(/^\|\s*(\d+)\s*\|\s*([^|]+)\s*\|/);
    if (four) {
      [, sttRaw, name, level] = four.map((s) => s.trim());
    } else if (three) {
      [, sttRaw, name, level] = three.map((s) => s.trim());
    } else if (twoWf) {
      [, sttRaw, name] = twoWf.map((s) => s.trim());
      level = 'QT';
    } else {
      continue;
    }
    if (!name || name.includes('---') || name === 'Tên danh mục' || name === 'Tên quy trình (định nghĩa trên XBOS)') {
      continue;
    }
    const sttNum = parseInt(sttRaw.replace(/[a-z]+$/i, ''), 10);
    if (!Number.isFinite(sttNum)) continue;
    const slug = sttRaw.toLowerCase().replace(/[^0-9a-z]/g, '');
    const kind = sttNum >= 92 ? 'workflow' : 'catalog';
    const key = kind === 'workflow' ? `log_wf_${String(sttNum).padStart(3, '0')}` : `log_dm_${slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    defs.push({ stt: sttNum, sttLabel: sttRaw, key, name, level, kind });
  }
  return defs;
}
