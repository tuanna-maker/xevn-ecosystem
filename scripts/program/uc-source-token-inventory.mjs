/**
 * Inventory: map source files → UC from @CODE-MEMORY · estimate token chi phí đọc context.
 * Output: docs/program/reports/UC_SOURCE_TOKEN_INVENTORY.md
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const OUT = path.join(ROOT, 'docs/program/reports/UC_SOURCE_TOKEN_INVENTORY.md');

const SCAN_ROOTS = [
  path.join(ROOT, 'apps/api'),
  path.join(ROOT, 'apps/web'),
  path.join(ROOT, 'apps/mobile'),
  path.join(ROOT, 'packages'),
];

const SKIP_DIR = new Set([
  'node_modules',
  'dist',
  'dist-uat-w6.bak-20260728102820',
  '.turbo',
  'coverage',
  'build',
]);

const EXT = new Set(['.ts', '.tsx', '.js', '.jsx']);

/** Ước lượng token ≈ bytes/3.5 (code + comment Việt) */
function estTokens(bytes) {
  return Math.round(bytes / 3.5);
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR.has(name.name)) continue;
    const p = path.join(dir, name.name);
    if (name.isDirectory()) walk(p, out);
    else if (EXT.has(path.extname(name.name))) out.push(p);
  }
  return out;
}

const UC_RE =
  /UC-(?:BP|HRM|XBOS|MOB|ATT|PAY|REC|CORE|PLT|CI|EMP|DEC|INS|FLEET|PERF|WF)[A-Za-z0-9-]+/g;

function extractUcsFromCodeMemory(head) {
  const ucs = new Set();
  if (!head.includes('@CODE-MEMORY')) return ucs;
  const ucLine = head.match(/^\s*\*\s*UC:\s*(.+)$/m);
  if (ucLine) {
    const m = ucLine[1].match(UC_RE);
    if (m) m.forEach((u) => ucs.add(u));
    // shorthand "09a" style in same line
    const fr = ucLine[1].match(/FR-UC-[A-Z0-9-]+/g);
    if (fr) fr.forEach((u) => ucs.add(u));
  }
  const br = head.match(/^\s*\*\s*BR:\s*(.+)$/m);
  if (br) {
    const m = br[1].match(UC_RE);
    if (m) m.forEach((u) => ucs.add(u));
  }
  return ucs;
}

function extractUcsFallback(content) {
  const m = content.slice(0, 4000).match(UC_RE);
  return m ? [...new Set(m)] : [];
}

function cleanName(raw) {
  return raw
    .trim()
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\|/g, '/');
}

/** Mã nhóm / alias trong CODE-MEMORY — không phải dòng UC_INVENTORY 50 UC */
const UC_ALIAS_NAMES = new Map([
  ['UC-HRM-PAY', 'Nhóm module embed Tiền lương (alias kỹ thuật → UC-BP-PAY-01..09, UC-HRM-24)'],
  ['UC-HRM-REC', 'Nhóm module embed Tuyển dụng (alias → UC-HRM-22, UC-BP-REC-*)'],
  ['UC-HRM-ATT-LEAVE-01', 'Luồng đơn nghỉ phép embed (alias → UC-BP-ATT-09, UC-HRM-10)'],
  ['UC-HRM-ATT-OT', 'Tăng ca / OT embed (alias → UC-BP-ATT-*)'],
  ['UC-HRM-ATT-TRIP', 'Công tác embed (alias → UC-BP-ATT-*)'],
  ['UC-HRM-ATT-LATE-EARLY', 'Đi muộn / về sớm embed (alias → UC-BP-ATT-*)'],
  ['UC-HRM-ATT-SHIFT-CHANGE', 'Đổi ca embed (alias → UC-BP-ATT-*)'],
  ['UC-HRM-ORG-COMPANY', 'Phạm vi công ty / org (alias scope — UC-BP-CORE-*)'],
  ['UC-HRM-SCOPE-03', 'Resolver scope list↔detail (alias NFR — ADR scope ladder)'],
  ['UC-HRM-EMP-01', 'Hồ sơ nhân viên — slice embed (alias → UC-BP-CORE-*)'],
  ['UC-HRM-REC-WF-01', 'Workflow tuyển dụng — bước 1 (alias lane REC)'],
  ['UC-HRM-REC-WF-02', 'Workflow tuyển dụng — bước 2 (alias lane REC)'],
  ['UC-HRM-RC-07', 'Requisition / RC slice (alias tuyển dụng)'],
  ['FR-UC-M01', 'Đăng nhập, phiên JWT và shell portal (FR ecosystem M01)'],
  ['FR-UC-H03', 'Đơn nghỉ phép — phê duyệt hai cấp (FR HRM leave ladder)'],
  ['FR-UC-H04', 'Phiếu lương / kỳ lương NV (FR HRM payroll read)'],
  ['UC-HRM-CI-08', 'Tạo gói cơ cấu lương NV (base / thử việc / phụ cấp)'],
  ['UC-HRM-CI-11', 'Lịch sử / phiên bản cơ cấu lương gắn HĐ'],
  ['UC-HRM-CI-01', 'Hợp đồng lao động — slice CI (alias → UC-BP-PLT-*)'],
]);

function isValidUcToken(uc) {
  if (!uc || uc.length < 7) return false;
  if (uc.endsWith('-')) return false;
  if (/UC-HRM-REC-$/.test(uc)) return false;
  return true;
}

function loadFromHrmTeamSrs(map) {
  const srsPath = path.join(ROOT, 'docs/hrm/SRS.md');
  if (!fs.existsSync(srsPath)) return;
  for (const line of fs.readFileSync(srsPath, 'utf8').split('\n')) {
    const m = line.match(/^\|\s*(UC-HRM-[A-Za-z0-9-]+)\s*\|\s*([^|]+)\s*\|/);
    if (m) map.set(m[1], cleanName(m[2]));
  }
}

function loadFromOpenApiSummaries(map) {
  const oas = path.join(ROOT, 'docs/api/openapi/hrm-api.yaml');
  if (!fs.existsSync(oas)) return;
  for (const line of fs.readFileSync(oas, 'utf8').split('\n')) {
    const m = line.match(/summary:\s*(UC-[A-Za-z0-9-]+)\s*[—–-]\s*(.+)$/);
    if (m) map.set(m[1], cleanName(m[2]));
  }
}

function loadFromCrosswalk(map) {
  const xw = path.join(
    ROOT,
    'docs/client-delivery/hrm-enterprise-blueprint/UC_ID_CROSSWALK.md',
  );
  if (!fs.existsSync(xw)) return;
  for (const line of fs.readFileSync(xw, 'utf8').split('\n')) {
    const m = line.match(/^\|\s*`?(UC-BP-[A-Za-z0-9-]+)`?\s*\|\s*([^|]+)\s*\|/);
    if (m) map.set(m[1], cleanName(m[2]));
  }
}

/** Danh mục tên UC — UC_INVENTORY (BP) + PHASE1 matrix + SRS team + alias */
function loadUcNameCatalog() {
  const map = new Map();

  const invPath = path.join(
    ROOT,
    'docs/client-delivery/hrm-enterprise-blueprint/UC_INVENTORY.md',
  );
  if (fs.existsSync(invPath)) {
    for (const line of fs.readFileSync(invPath, 'utf8').split('\n')) {
      const m = line.match(/^\|\s*(UC-BP-[A-Za-z0-9-]+)\s*\|\s*([^|]+)\s*\|/);
      if (m) map.set(m[1], cleanName(m[2]));
    }
  }

  loadFromCrosswalk(map);
  loadFromHrmTeamSrs(map);
  loadFromOpenApiSummaries(map);

  const matrixPath = path.join(ROOT, 'docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md');
  if (fs.existsSync(matrixPath)) {
    for (const line of fs.readFileSync(matrixPath, 'utf8').split('\n')) {
      const m = line.match(/^\|\s*[\d+a-z]+\s*\|\s*`(UC-[^`]+)`\s*\|\s*([^|]+)\s*\|/i);
      if (m) map.set(m[1], cleanName(m[2]));
    }
  }

  for (const [id, name] of UC_ALIAS_NAMES) {
    if (!map.has(id)) map.set(id, name);
  }

  // Alias FR-UC-* → cùng tên UC gốc khi đã có UC-BP/UC-HRM
  for (const [id, name] of [...map.entries()]) {
    if (id.startsWith('UC-')) map.set(`FR-${id}`, name);
  }

  return map;
}

function ucKhối(uc) {
  if (/UC-BP-REC|UC-HRM-REC|FR-UC-BP-REC/.test(uc)) return 'Tuyển dụng (REC)';
  if (/UC-BP-CORE|UC-BP-PLT|FR-UC-BP-CORE|FR-UC-BP-PLT/.test(uc)) return 'Nhân sự / HĐLĐ (CORE)';
  if (/UC-BP-ATT|FR-UC-BP-ATT/.test(uc)) return 'Chấm công & phép (ATT)';
  if (/UC-BP-PAY|FR-UC-BP-PAY|UC-HRM-PAY/.test(uc)) return 'Tiền lương (PAY)';
  if (/UC-XBOS|UC-HRM-0[1-9]|UC-HRM-1[01]/.test(uc)) return 'Nền tảng / tích hợp (XBOS·HRM admin)';
  if (/UC-HRM-2[0-9]|UC-HRM-3[0-2]/.test(uc)) return 'Embed portal HRM';
  if (/UC-HRM-MOB|UC-MOB|J-MOB/.test(uc)) return 'Mobile HRM';
  if (/UC-HRM-CO|UC-HRM-CO-01/.test(uc)) return 'Công ty / headcount (CO)';
  if (/UC-HRM-CI|HRM-CI/.test(uc)) return 'Hợp đồng & BH (CI)';
  if (/UC-HRM-EMP|EMP-/.test(uc)) return 'Hồ sơ nhân viên (EMP)';
  if (/UC-HRM-ATT|ATT-LEAVE|ATT-OT/.test(uc)) return 'Chấm công (legacy HRM mã)';
  if (/UC-HRM-DEC|DEC-/.test(uc)) return 'Quyết định (DEC)';
  if (/UC-HRM-INT/.test(uc)) return 'Tích hợp nội bộ';
  if (/FR-UC-M01/.test(uc)) return 'Metadata / workflow (M01)';
  return 'Khác / chưa phân loại';
}

function extractPurposeFromHead(head) {
  const m = head.match(/^\s*\*\s*Purpose:\s*(.+)$/m);
  if (!m) return null;
  return cleanName(m[1]).slice(0, 160);
}

function resolveUcName(catalog, purposeByUc, uc) {
  if (catalog.has(uc)) return catalog.get(uc);
  if (uc.startsWith('FR-') && catalog.has(uc.slice(3))) return catalog.get(uc.slice(3));
  const bp = uc.match(/UC-BP-[A-Z0-9-]+/);
  if (bp && catalog.has(bp[0])) return catalog.get(bp[0]);
  if (purposeByUc.has(uc)) {
    return `${purposeByUc.get(uc)} (từ @CODE-MEMORY Purpose)`;
  }
  return 'Mã legacy/alias — chưa có trong UC-BP inventory 50 UC; xem docs/hrm/SRS.md hoặc bổ sung UC_ALIAS trong script';
}

function resolveNameSource(catalog, purposeByUc, uc) {
  if (UC_ALIAS_NAMES.has(uc)) return 'alias dev';
  if (catalog.has(uc)) {
    if (/^UC-BP-/.test(uc)) return 'UC_INVENTORY';
    if (/^UC-HRM-/.test(uc)) return 'SRS team / matrix';
    return 'catalog';
  }
  if (purposeByUc.has(uc)) return 'CODE-MEMORY Purpose';
  return 'chưa map';
}

const ucNameCatalog = loadUcNameCatalog();
const purposeByUc = new Map();

function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, '/');
}

const byUc = new Map();
const unmapped = [];

for (const root of SCAN_ROOTS) {
  for (const file of walk(root)) {
    const stat = fs.statSync(file);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n').length;
    const bytes = Buffer.byteLength(content, 'utf8');
    const tokens = estTokens(bytes);
    const head = content.slice(0, 3500);
    let ucs = extractUcsFromCodeMemory(head);
    if (ucs.size === 0) ucs = new Set(extractUcsFallback(content));
    ucs = new Set([...ucs].filter(isValidUcToken));
    const purpose = extractPurposeFromHead(head);
    if (purpose) {
      for (const uc of ucs) {
        if (!purposeByUc.has(uc)) purposeByUc.set(uc, purpose);
      }
    }
    const entry = { path: rel(file), lines, bytes, tokens };

    if (ucs.size === 0) {
      unmapped.push(entry);
      continue;
    }
    for (const uc of ucs) {
      if (!byUc.has(uc)) byUc.set(uc, []);
      byUc.get(uc).push(entry);
    }
  }
}

// Dedupe paths per UC (same file multiple UC refs)
for (const [uc, files] of byUc) {
  const seen = new Map();
  for (const f of files) {
    const prev = seen.get(f.path);
    if (!prev || f.bytes > prev.bytes) seen.set(f.path, f);
  }
  byUc.set(uc, [...seen.values()].sort((a, b) => b.tokens - a.tokens));
}

const ucSorted = [...byUc.entries()].sort((a, b) => {
  const ta = a[1].reduce((s, f) => s + f.tokens, 0);
  const tb = b[1].reduce((s, f) => s + f.tokens, 0);
  return tb - ta;
});

function sumFiles(files) {
  return files.reduce(
    (a, f) => ({
      files: a.files + 1,
      lines: a.lines + f.lines,
      tokens: a.tokens + f.tokens,
    }),
    { files: 0, lines: 0, tokens: 0 },
  );
}

const totalMapped = sumFiles([...byUc.values()].flat());
const totalUnmapped = sumFiles(unmapped);
const grand = {
  files: totalMapped.files + totalUnmapped.files,
  lines: totalMapped.lines + totalUnmapped.lines,
  tokens: totalMapped.tokens + totalUnmapped.tokens,
};

const MVP50 = fs
  .readFileSync(path.join(ROOT, 'docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md'), 'utf8')
  .match(/`UC-BP-[A-Za-z0-9-]+`/g)
  ?.map((s) => s.replace(/`/g, '')) ?? [];

const uniqueMvp = [...new Set(MVP50)];

const lines = [];
lines.push('# Báo cáo thống kê mã nguồn theo Use Case (UC) — ước lượng token');
lines.push('');
lines.push('| Mục | Giá trị |');
lines.push('|-----|---------|');
lines.push(`| **Ngày sinh báo cáo** | ${new Date().toISOString().slice(0, 10)} |`);
lines.push(`| **Phạm vi quét** | \`apps/api\`, \`apps/web\`, \`apps/mobile\`, \`packages\` (loại trừ build/dist/node_modules) |`);
lines.push(`| **Cách gắn UC** | Ưu tiên khối \`@CODE-MEMORY\` (trường UC/BR); fallback: mã UC trong ~4KB đầu file |`);
lines.push(`| **Ước lượng token** | \`token ≈ kích_thước_file ÷ 3.5\` (byte UTF-8) — dùng **so sánh chi phí đọc context AI**, không phải hóa đơn API chính thức |`);
lines.push(`| **Tổng file** | ${grand.files.toLocaleString('vi-VN')} |`);
lines.push(`| **Tổng dòng** | ${grand.lines.toLocaleString('vi-VN')} |`);
lines.push(`| **Tổng token ước lượng** | **~${grand.tokens.toLocaleString('vi-VN')}** |`);
lines.push(`| **File đã gắn ≥1 UC** | ${totalMapped.files.toLocaleString('vi-VN')} (~${Math.round((100 * totalMapped.files) / grand.files)}%) |`);
lines.push(`| **File chưa gắn UC (xem cuối)** | ${totalUnmapped.files.toLocaleString('vi-VN')} |`);
lines.push('');
lines.push('## Cách đọc báo cáo (chi phí)');
lines.push('');
lines.push('- **Token / UC** ≈ chi phí nếu PM/Dev/QA bắt AI **đọc toàn bộ file** thuộc UC đó trong một phiên (ví dụ refactor, review, viết test).');
lines.push('- Một UC có nhiều file **chia sẻ** (hook, lib, controller) — cộng dồn token trong bảng UC.');
lines.push('- File **nền tảng** (auth, scope, shell) có thể lặp lại nhiều UC — token thực tế khi sửa 1 UC thường **nhỏ hơn** tổng cột (chỉ đọc file đụng).');
lines.push('- Khuyến nghị governance: file nghiệp vụ mới **bắt buộc** `@CODE-MEMORY` + `UC:` để báo cáo này chính xác dần.');
lines.push('');
lines.push('- **Tên UC:** thứ tự ưu tiên: `UC_INVENTORY.md` (50 UC-BP) → `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` → `docs/hrm/SRS.md` (UC-HRM team/API) → OpenAPI summary → bảng **alias dev** trong script → `@CODE-MEMORY` **Purpose**.');
lines.push('');
lines.push('## Vì sao từng có dòng «Chưa có trong UC_INVENTORY…»?');
lines.push('');
lines.push('Repo dùng **hai lớp mã UC song song**:');
lines.push('');
lines.push('| Lớp | Ví dụ | Có trong 50 UC MVP (`UC_INVENTORY`)? |');
lines.push('|-----|--------|--------------------------------------|');
lines.push('| **UC-BP-*** (GD1 khách) | `UC-BP-PAY-02` | Có — đây là danh mục Phase 1 board |');
lines.push('| **UC-HRM-*** (SRS team / embed / API) | `UC-HRM-28`, `UC-HRM-09` | Không đầy đủ — nhiều mã chỉ trong `docs/hrm/SRS.md` |');
lines.push('| **Alias nhóm module** | `UC-HRM-PAY`, `UC-HRM-REC` | Không — tag gom file theo menu embed, map sang UC-BP |');
lines.push('| **FR-UC-*** (FR ecosystem / HRM) | `FR-UC-M01`, `FR-UC-H03` | Không — functional req, không phải dòng inventory |');
lines.push('');
lines.push('Báo cáo cũ chỉ đọc **UC_INVENTORY + ma trận Phase 1** nên mọi mã chỉ xuất hiện trong code bị gán câu fallback dài. Phiên bản script mới bổ sung SRS team, alias và Purpose — cột **Nguồn tên** cho biết mã thuộc lớp nào.');
lines.push('');
lines.push('---');
lines.push('');
lines.push('## Tổng hợp theo UC (toàn repo đã quét)');
lines.push('');
lines.push('| UC | Tên use case (tiếng Việt) | Nguồn tên | Khối nghiệp vụ | Số file | Tổng dòng | Token ước lượng | Ghi chú |');
lines.push('|----|---------------------------|-----------|----------------|---------|-----------|-----------------|---------|');

for (const [uc, files] of ucSorted) {
  const s = sumFiles(files);
  const name = resolveUcName(ucNameCatalog, purposeByUc, uc);
  const src = resolveNameSource(ucNameCatalog, purposeByUc, uc);
  const khoi = ucKhối(uc);
  const inMvp = uniqueMvp.includes(uc.replace(/^FR-/, '')) || uniqueMvp.includes(uc) ? '**50 UC MVP GD1**' : '';
  lines.push(
    `| \`${uc}\` | ${name} | ${src} | ${khoi} | ${s.files} | ${s.lines.toLocaleString('vi-VN')} | ~${s.tokens.toLocaleString('vi-VN')} | ${inMvp} |`,
  );
}

lines.push('');
lines.push('---');
lines.push('');
lines.push('## 50 UC chương trình MVP GD1 — đối chiếu mã nguồn');
lines.push('');
lines.push('| # | UC | Tên use case (tiếng Việt) | File gắn UC | Token ước lượng |');
lines.push('|---|-----|------------------------|-------------|-----------------|');

const boardLines = fs
  .readFileSync(path.join(ROOT, 'docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md'), 'utf8')
  .split('\n');
let idx = 0;
for (const row of boardLines) {
  const m = row.match(/^\|\s*(\d+)\s*\|[^|]+\|[^|]+\|\s*`(UC-BP-[^`]+)`\s*\|([^|]+)\|/);
  if (!m) continue;
  const rowNum = m[1];
  const uc = m[2];
  const shortName = resolveUcName(ucNameCatalog, purposeByUc, uc);
  const files = byUc.get(uc) ?? [];
  const s = sumFiles(files);
  lines.push(
    `| ${rowNum} | \`${uc}\` | ${shortName} | ${s.files || '—'} | ${s.files ? '~' + s.tokens.toLocaleString('vi-VN') : '—'} |`,
  );
}

lines.push('');
lines.push('---');
lines.push('');
lines.push('## Chi tiết file theo từng UC (top theo token)');
lines.push('');

for (const [uc, files] of ucSorted) {
  const s = sumFiles(files);
  const name = resolveUcName(ucNameCatalog, purposeByUc, uc);
  const src = resolveNameSource(ucNameCatalog, purposeByUc, uc);
  lines.push(
    `### \`${uc}\` — ${name}`,
  );
  lines.push('');
  lines.push(`*Khối:* ${ucKhối(uc)} · *Nguồn tên:* ${src} · *${s.files} file · ~${s.tokens.toLocaleString('vi-VN')} token*`);
  lines.push('');
  lines.push('| File | Dòng | Token ~ |');
  lines.push('|------|------|---------|');
  for (const f of files.slice(0, 40)) {
    lines.push(`| \`${f.path}\` | ${f.lines} | ${f.tokens.toLocaleString('vi-VN')} |`);
  }
  if (files.length > 40) {
    lines.push(`| … | +${files.length - 40} file nữa | |`);
  }
  lines.push('');
}

lines.push('---');
lines.push('');
lines.push('## File chưa gắn UC rõ (top 60 theo token)');
lines.push('');
lines.push('> Cần bổ sung `@CODE-MEMORY` hoặc trace BA — thường là UI shell, test, util chung.');
lines.push('');
lines.push('| File | Dòng | Token ~ |');
lines.push('|------|------|---------|');
unmapped.sort((a, b) => b.tokens - a.tokens);
for (const f of unmapped.slice(0, 60)) {
  lines.push(`| \`${f.path}\` | ${f.lines} | ${f.tokens.toLocaleString('vi-VN')} |`);
}
if (unmapped.length > 60) {
  lines.push(`| … | +${unmapped.length - 60} file | |`);
}

lines.push('');
lines.push('---');
lines.push('');
lines.push('*Sinh bởi `node scripts/program/uc-source-token-inventory.mjs` — chạy lại sau wave lớn.*');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
console.log('Wrote', OUT);
console.log('UC count:', byUc.size, 'files:', grand.files, 'tokens~', grand.tokens);
