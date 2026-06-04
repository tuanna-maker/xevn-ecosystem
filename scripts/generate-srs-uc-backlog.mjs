/**
 * Generate docs/client-delivery/SRS_UC_OVERRIDE_BACKLOG.md
 * — full STT list of UCs needing override / sequence.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseUcRowsFromCatalog, buildUcSpecsMarkdown } from './lib/srs-uc-spec.mjs';
import { renderUcSpec } from './lib/srs-uc-spec.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UC_MD = path.join(ROOT, 'docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md');
const OUT = path.join(ROOT, 'docs/client-delivery/SRS_UC_OVERRIDE_BACKLOG.md');

function moduleLabel(uc) {
  const c = uc.code;
  if (/^UC-ECO|^UC-CC/.test(c)) return 'M00';
  if (/^UC-RACI/.test(c)) return 'M04';
  if (/^XBOS-DM-HRM|^UC-XBOS-CAT/.test(c)) return 'M02';
  if (/^XBOS-DM-LOG/.test(c)) return 'M03';
  if (/^UC-XBOS|^UC-HRM-CC/.test(c)) return 'M01';
  if (/^UC-HRM-MOB|^HRM-MOB/.test(c)) return 'M06';
  if (/^LG-MB-/.test(c)) return 'M08';
  if (/^LG-/.test(c)) return 'M07';
  if (/^UC-HRM|^HRM-/.test(c)) return 'M05';
  return 'M01';
}

function blockHas(md, stt, code, needle) {
  const i = md.indexOf(`#### STT ${stt} — ${code}:`);
  if (i < 0) return false;
  const j = md.indexOf('\n#### STT ', i + 5);
  return md.slice(i, j < 0 ? undefined : j).includes(needle);
}

function main() {
  const rows = parseUcRowsFromCatalog(fs.readFileSync(UC_MD, 'utf8'));
  const md = buildUcSpecsMarkdown(rows);

  const needOverride = [];
  const needSeqOnly = [];
  const complete = [];

  for (const r of rows) {
    const block = renderUcSpec(r);
    const has12 =
      /REQ-SRS/.test(block) &&
      /\*\*Dữ liệu đầu ra/.test(block) &&
      /\*\*Ngoại lệ/.test(block) &&
      /sequenceDiagram/.test(block) &&
      /\*\*Kiểm chứng/.test(block);
    const hasSeq = blockHas(md, r.stt, r.code, 'sequenceDiagram');
    const mod = moduleLabel(r);
    const row = { ...r, mod, has12, hasSeq };
    if (has12 && hasSeq) complete.push(row);
    else if (!hasSeq) needSeqOnly.push(row);
    else needOverride.push(row);
  }

  const lines = [];
  lines.push('# SRS — Danh sách UC cần override & sequence');
  lines.push('');
  lines.push(`> Sinh tự động: ${new Date().toISOString().slice(0, 10)} · Nguồn: \`BANG_TONG_HOP_USECASE_XEVN.md\``);
  lines.push('');
  lines.push('## Tóm tắt');
  lines.push('');
  lines.push('| Chỉ tiêu | Số lượng |');
  lines.push('|----------|----------:|');
  lines.push(`| Tổng UC | **${rows.length}** |`);
  lines.push(`| Đạt rubric 12 mục + sequence | **${complete.length}** |`);
  lines.push(`| Thiếu sequence trong HTML | **${needSeqOnly.length}** |`);
  lines.push(`| Chưa đạt rubric 12 mục | **${needOverride.length}** |`);
  lines.push('');
  lines.push('### Định nghĩa trạng thái');
  lines.push('');
  lines.push('- **Override:** luồng/API/BR/mã lỗi bám triển khai thật (không chỉ template suy luận từ tên UC).');
  lines.push('- **Sequence:** mục **Sơ đồ tuần tự** có `sequenceDiagram` Mermaid.');
  lines.push('');
  lines.push('### File override tay (docs/srs-overrides/)');
  lines.push('');
  lines.push('- `M02/XBOS-DM-HRM-10.md` (UC vàng catalog sync)');
  lines.push('');

  const section = (title, list, col3) => {
    lines.push(`## ${title} (${list.length} UC)`);
    lines.push('');
    lines.push(`| STT | Mã UC | Tên | Module | Phase | Kênh | ${col3} |`);
    lines.push('|-----|-------|-----|--------|-------|------|---------|');
    for (const r of list) {
      const phase = /^LG-/.test(r.code) && !r.code.startsWith('XBOS') ? 'Phase 2' : 'Phase 1';
      lines.push(
        `| ${r.stt} | ${r.code} | ${r.name} | ${r.mod} | ${phase} | ${r.channel} | ${col3 === 'Ghi chú' ? 'Cần override chi tiết (sequence đã có trong SRS HTML)' : 'Bổ sung sequence'} |`,
      );
    }
    lines.push('');
  };

  section('A. Đã override — thiếu sequence', needSeqOnly, 'Việc cần làm');
  section('B. Chưa override (template generic)', needOverride, 'Ghi chú');

  lines.push('## C. Ma trận đủ chuẩn (override + sequence)');
  lines.push('');
  if (!complete.length) lines.push('*(Chưa có — mục tiêu 373/373)*');
  else {
    lines.push('| STT | Mã UC | Tên |');
    lines.push('|-----|-------|-----|');
    for (const r of complete) lines.push(`| ${r.stt} | ${r.code} | ${r.name} |`);
  }
  lines.push('');

  fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
  console.log(`Wrote ${OUT}`);
  console.log(`needOverride=${needOverride.length} needSeqOnly=${needSeqOnly.length} complete=${complete.length}`);
}

main();
